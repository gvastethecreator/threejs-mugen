import { scanIkemenFeatures, type IkemenScanFinding } from "./IkemenFeatureScanner";
import { findMugenConfigPath } from "../loader/MugenConfigLoader";
import { PathResolver, basename, normalizeVirtualPath } from "../loader/PathResolver";
import type { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { parseDef } from "../parsers/DefParser";
import { parseMugenConfig } from "../parsers/MugenConfigParser";
import { parseStageDef } from "../parsers/StageDefParser";
import { parseKeyValue, parseTextLines, unquote } from "../parsers/text";

export const PACKAGE_ANALYSIS_SCHEMA = "mugen-web-sandbox/package-analysis/v0" as const;

export type PackageAnalysisFindingStatus = "recognized" | "unsupported" | "unknown";
export type PackageAnalysisFindingCategory = "package" | "character" | "stage" | "system" | "screenpack";
export type PackageAnalysisFileRole = "character" | "stage" | "system" | "screenpack" | "asset";

export type PackageAnalysisLocation = {
  path: string;
  line?: number;
};

export type PackageAnalysisFinding = {
  id: string;
  status: PackageAnalysisFindingStatus;
  category: PackageAnalysisFindingCategory;
  feature: string;
  location: PackageAnalysisLocation;
  dependency?: string;
  raw?: string;
  detail: string;
  fallback?: string;
};

export type PackageAnalysisFile = {
  path: string;
  bytes: number;
  roles: PackageAnalysisFileRole[];
};

export type PackageAnalysisSummary = {
  fileCount: number;
  recognizedFileCount: number;
  unknownFileCount: number;
  entrypointCount: number;
  findingCount: number;
  byStatus: Record<PackageAnalysisFindingStatus, number>;
  byCategory: Record<PackageAnalysisFindingCategory, number>;
};

export type PackageAnalysisProfiles = {
  mugen: {
    profile: "mugen-1.0" | "mugen-1.1" | "unknown";
    versions: string[];
  };
  ikemen: {
    profile: "ikemen-go-scan";
    detected: boolean;
    findingCount: number;
    claim: "scanner-only";
  };
};

export type PackageAnalysisResult = {
  schemaVersion: typeof PACKAGE_ANALYSIS_SCHEMA;
  sourceName: string;
  generatedAt: string;
  status: "recognized" | "partial" | "unknown";
  profiles: PackageAnalysisProfiles;
  files: PackageAnalysisFile[];
  findings: PackageAnalysisFinding[];
  summary: PackageAnalysisSummary;
  claims: {
    allowed: string[];
    blocked: string[];
  };
  diagnostics: string[];
  checksum: string;
};

export type PackageAnalysisParseResult = {
  report?: PackageAnalysisResult;
  errors: string[];
};

type DefinitionRecord = {
  path: string;
  text: string;
  roles: PackageAnalysisFileRole[];
  character: ReturnType<typeof parseDef>;
  stage?: ReturnType<typeof parseStageDef>;
};

type SourceAssignment = {
  key: string;
  value: string;
  line: number;
  raw: string;
};

export function createPackageAnalysis(input: {
  vfs: VirtualFileSystem;
  sourceName?: string;
  generatedAt: string;
}): PackageAnalysisResult {
  const paths = input.vfs.listFiles();
  const resolver = new PathResolver(paths);
  const definitions = paths
    .filter((path) => path.toLowerCase().endsWith(".def"))
    .map((path): DefinitionRecord => {
      const text = input.vfs.readText(path) ?? "";
      const character = parseDef(text, path);
      const roles = classifyDefinition(path, character.rawSections);
      return {
        path,
        text,
        roles,
        character,
        ...(roles.includes("stage") ? { stage: parseStageDef(text, path) } : {}),
      };
    });
  const definitionsByPath = new Map(definitions.map((definition) => [definition.path, definition]));
  const files = paths.map((path): PackageAnalysisFile => ({
    path,
    bytes: input.vfs.get(path)?.bytes.byteLength ?? 0,
    roles: definitionsByPath.get(path)?.roles ?? classifyNonDefinitionPath(path),
  }));
  const findings: Array<Omit<PackageAnalysisFinding, "id">> = [];

  for (const file of files) {
    if (file.roles.length > 0) {
      addFinding(findings, {
        status: "recognized",
        category: primaryCategory(file.roles, file.path),
        feature: "Package file",
        location: { path: file.path },
        detail: `Package file classified as ${file.roles.join("/")}.`,
      });
    } else if (file.path.toLowerCase().endsWith(".def")) {
      addFinding(findings, {
        status: "unknown",
        category: "package",
        feature: "Definition file role",
        location: { path: file.path },
        detail: "Definition file was found but its character, stage, system, or screenpack role is unknown.",
        fallback: "Keep the source visible for manual classification; no runtime claim is created.",
      });
    }
  }

  for (const definition of definitions) {
    const category = primaryCategory(definition.roles, definition.path);
    if (definition.roles.includes("character")) {
      analyzeCharacterDefinition(definition, resolver, findings);
    }
    if (definition.roles.includes("stage") && definition.stage) {
      analyzeStageDefinition(definition, resolver, findings);
    }
    if (definition.roles.includes("screenpack")) {
      analyzeScreenpackDefinition(definition, resolver, findings);
    }
    if (!isSelectDefinitionPath(definition.path)) {
      appendParserDiagnostics(findings, category, definition.path, definition.character.diagnostics);
    }
    if (definition.stage) {
      appendParserDiagnostics(findings, "stage", definition.path, definition.stage.diagnostics);
    }
    appendVersionFindings(findings, category, definition.path, definition.text, definition.character.info.mugenVersion, "mugenversion");
    appendVersionFindings(findings, category, definition.path, definition.text, definition.character.info.ikemenVersion, "ikemenversion");
  }

  const configPath = findMugenConfigPath(resolver);
  if (configPath) {
    const parsed = parseMugenConfig(input.vfs.readText(configPath) ?? "", configPath);
    addFinding(findings, {
      status: "recognized",
      category: "system",
      feature: "MUGEN game configuration",
      location: { path: configPath },
      detail: "Game configuration file was located in the package VFS.",
    });
    if (parsed.gameSpace) {
      addFinding(findings, {
        status: "recognized",
        category: "system",
        feature: "Game-space dimensions",
        location: { path: configPath },
        detail: `Game space is ${parsed.gameSpace.width}x${parsed.gameSpace.height}.`,
      });
    }
    appendParserDiagnostics(findings, "system", configPath, parsed.diagnostics);
  }

  const selectPath = findSelectPath(resolver);
  if (selectPath) {
    analyzeSelectDefinition(selectPath, input.vfs.readText(selectPath) ?? "", resolver, findings);
  }

  const ikemen = scanIkemenFeatures({
    paths,
    readText: (path) => input.vfs.readText(path),
  });
  for (const finding of ikemen.findings) {
    appendIkemenFinding(findings, finding);
  }

  const recognizedDefinitions = definitions.filter((definition) =>
    definition.roles.some((role) => role === "character" || role === "stage" || role === "screenpack"),
  ).length;
  const diagnostics: string[] = [];
  if (recognizedDefinitions === 0) {
    diagnostics.push("No recognized character, stage, or screenpack definition was found.");
    addFinding(findings, {
      status: "unknown",
      category: "package",
      feature: "MUGEN entrypoint coverage",
      location: { path: input.sourceName?.trim() || paths[0] || "[package]" },
      detail: "The package has no recognized runtime entrypoint definition.",
      fallback: "Import remains report-only until a character, stage, or screenpack entrypoint is identified.",
    });
  }

  const normalizedFindings = findings
    .map((finding) => ({ ...finding, id: findingId(finding) }))
    .sort(compareFindings);
  const summary = summarizePackage(paths, files, normalizedFindings, recognizedDefinitions);
  const profiles = createProfiles(definitions, ikemen);
  const payload = {
    schemaVersion: PACKAGE_ANALYSIS_SCHEMA,
    sourceName: input.sourceName?.trim() || "virtual-package",
    generatedAt: input.generatedAt.trim(),
    status: resolveOverallStatus(summary),
    profiles,
    files: files.map((file) => ({ ...file, roles: [...file.roles].sort() })),
    findings: normalizedFindings,
    summary,
    claims: {
      allowed: [
        "Package files and bounded references are classified with source-located evidence.",
        "IKEMEN-only ZSS, Lua, config, screenpack, and controller features are recognized as scanner findings.",
      ],
      blocked: [
        "Package analysis does not prove runtime execution, rendering parity, or license compatibility.",
        "IKEMEN scanner findings remain unsupported and are not executed by the browser runtime.",
      ],
    },
    diagnostics: uniqueSorted(diagnostics),
  } satisfies Omit<PackageAnalysisResult, "checksum">;
  return deepFreeze({ ...payload, checksum: hashStableJson(payload) });
}

export function parsePackageAnalysis(value: unknown): PackageAnalysisParseResult {
  if (!isRecord(value)) {
    return { errors: ["package analysis root must be an object"] };
  }
  if (value.schemaVersion !== PACKAGE_ANALYSIS_SCHEMA) {
    return { errors: ["unsupported package analysis schema"] };
  }
  if (typeof value.checksum !== "string" || !isPackageAnalysisPayload(value)) {
    return { errors: ["package analysis metadata is invalid"] };
  }

  const { checksum, ...payload } = value;
  const errors: string[] = [];
  if (hashStableJson(payload) !== checksum) {
    errors.push("package analysis checksum mismatch");
  }
  if (resolveOverallStatus(payload.summary) !== payload.status) {
    errors.push("package analysis status mismatch");
  }
  if (payload.summary.findingCount !== payload.findings.length) {
    errors.push("package analysis finding summary mismatch");
  }
  if (payload.findings.some((finding, index, findings) => index > 0 && compareFindings(findings[index - 1]!, finding) > 0)) {
    errors.push("package analysis findings are not sorted");
  }
  return errors.length > 0 ? { errors } : { report: deepFreeze(value), errors: [] };
}

function analyzeCharacterDefinition(
  definition: DefinitionRecord,
  resolver: PathResolver,
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
): void {
  for (const assignment of collectAssignments(definition.text, "Files")) {
    if (!isFileReference(assignment.key, assignment.value)) {
      continue;
    }
    reportReference(findings, "character", definition.path, resolver, assignment);
  }
}

function analyzeStageDefinition(
  definition: DefinitionRecord,
  resolver: PathResolver,
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
): void {
  for (const section of ["BGDef", "Music"]) {
    for (const assignment of collectAssignments(definition.text, section)) {
      if (!isFileReference(assignment.key, assignment.value)) {
        continue;
      }
      reportReference(findings, "stage", definition.path, resolver, assignment);
    }
  }
}

function analyzeScreenpackDefinition(
  definition: DefinitionRecord,
  resolver: PathResolver,
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
): void {
  for (const assignment of collectAssignments(definition.text, "Files")) {
    if (!isFileReference(assignment.key, assignment.value)) {
      continue;
    }
    reportReference(findings, "screenpack", definition.path, resolver, assignment);
  }
}

function analyzeSelectDefinition(
  path: string,
  text: string,
  resolver: PathResolver,
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
): void {
  let section: "characters" | "stages" | undefined;
  for (const line of parseTextLines(text)) {
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.content);
    if (sectionMatch) {
      const normalized = sectionMatch[1]?.trim().toLowerCase();
      section = normalized === "characters" || normalized === "stages" ? normalized : undefined;
      continue;
    }
    if (!section || !line.content || line.content.startsWith(";")) {
      continue;
    }
    const entry = line.content.split(",", 1)[0]?.trim();
    if (!entry || isSelectControlEntry(entry)) {
      continue;
    }
    const target = resolveSelectEntry(entry, section, resolver);
    const category = section === "characters" ? "character" : "stage";
    addFinding(findings, target
      ? {
          status: "recognized",
          category,
          feature: `select.def ${section} entry`,
          location: { path, line: line.number },
          dependency: target ?? entry,
          raw: line.raw,
          detail: `Entry resolves to ${target}.`,
        }
      : {
          status: "unknown",
          category,
          feature: `select.def ${section} entry`,
          location: { path, line: line.number },
          dependency: target ?? entry,
          raw: line.raw,
          detail: `Entry '${entry}' does not resolve to a package definition.`,
          fallback: "Keep the entry visible and do not create a runnable roster claim.",
        });
  }
}

function appendIkemenFinding(
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
  finding: IkemenScanFinding,
): void {
  const location = parseScannerLocation(finding.location);
  addFinding(findings, {
    status: "unsupported",
    category: ikemenCategory(finding.category, location.path),
    feature: finding.feature,
    location,
    ...(finding.raw ? { raw: finding.raw } : {}),
    detail: "IKEMEN-only feature was recognized by the scanner and is not executed.",
    fallback: finding.fallback,
  });
}

function appendParserDiagnostics(
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
  category: PackageAnalysisFindingCategory,
  path: string,
  diagnostics: readonly { severity: string; format?: string; file?: string; line?: number; raw?: string; message: string }[],
): void {
  for (const diagnostic of diagnostics) {
    addFinding(findings, {
      status: "unknown",
      category,
      feature: "Parser diagnostic",
      location: { path: diagnostic.file ?? path, ...(diagnostic.line !== undefined ? { line: diagnostic.line } : {}) },
      ...(diagnostic.raw ? { raw: diagnostic.raw } : {}),
      detail: `${diagnostic.format ?? "source"} ${diagnostic.severity}: ${diagnostic.message}`,
      fallback: "Keep the source visible; analysis cannot promote malformed input to a recognized runtime claim.",
    });
  }
}

function appendVersionFindings(
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
  category: PackageAnalysisFindingCategory,
  path: string,
  text: string,
  version: string | undefined,
  key: string,
): void {
  if (!version) {
    return;
  }
  const assignment = collectAssignments(text, "Info").find((candidate) => candidate.key.toLowerCase() === key);
  addFinding(findings, {
    status: key === "ikemenversion" ? "unsupported" : "recognized",
    category,
    feature: key === "ikemenversion" ? "IKEMEN version declaration" : "MUGEN target version",
    location: { path, ...(assignment ? { line: assignment.line } : {}) },
    ...(assignment?.raw ? { raw: assignment.raw } : {}),
    detail: `${key} = ${version.trim()}.`,
    ...(key === "ikemenversion"
      ? { fallback: "Version metadata is reported only; IKEMEN runtime behavior remains outside this slice." }
      : {}),
  });
}

function reportReference(
  findings: Array<Omit<PackageAnalysisFinding, "id">>,
  category: "character" | "stage" | "screenpack",
  basePath: string,
  resolver: PathResolver,
  assignment: SourceAssignment,
): void {
  const target = resolveReference(basePath, assignment.value, resolver);
  addFinding(findings, target
    ? {
        status: "recognized",
        category,
        feature: `Referenced ${assignment.key} file`,
        location: { path: basePath, line: assignment.line },
        dependency: target,
        raw: assignment.raw,
        detail: `Reference resolves to ${target}.`,
      }
    : {
        status: "unknown",
        category,
        feature: `Referenced ${assignment.key} file`,
        location: { path: basePath, line: assignment.line },
        dependency: unquote(assignment.value),
        raw: assignment.raw,
        detail: `Reference '${unquote(assignment.value)}' is not present in the package VFS.`,
        fallback: "Keep the reference unresolved and block a complete package claim.",
      });
}

function collectAssignments(text: string, expectedSection: string): SourceAssignment[] {
  const assignments: SourceAssignment[] = [];
  let section = "";
  for (const line of parseTextLines(text)) {
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.content);
    if (sectionMatch) {
      section = sectionMatch[1]?.trim() ?? "";
      continue;
    }
    if (section.toLowerCase() !== expectedSection.toLowerCase()) {
      continue;
    }
    const pair = parseKeyValue(line.content);
    if (pair) {
      assignments.push({ ...pair, line: line.number, raw: line.raw });
    }
  }
  return assignments;
}

function classifyDefinition(path: string, rawSections: Record<string, Record<string, string>>): PackageAnalysisFileRole[] {
  const lower = normalizeVirtualPath(path).toLowerCase();
  const sectionNames = Object.keys(rawSections).map((section) => section.toLowerCase());
  const files = sectionValues(rawSections, "Files");
  const fileKeys = new Set(Object.keys(files).map((key) => key.toLowerCase()));
  const stage = lower.includes("/stages/") || lower.startsWith("stages/") ||
    ["bgdef", "stageinfo", "playerinfo", "camera"].some((section) => sectionNames.includes(section));
  const character = lower.includes("/chars/") || lower.startsWith("chars/") ||
    ["cmd", "cns", "sprite", "anim", "sound"].some((key) => fileKeys.has(key)) ||
    [...fileKeys].some((key) => /^st\d*$/.test(key) || /^pal\d+$/.test(key));
  const screenpack = isScreenpackDefinitionPath(lower);
  if (stage && !character) {
    return ["stage"];
  }
  if (character) {
    return ["character"];
  }
  if (screenpack) {
    return ["screenpack", "system"];
  }
  return [];
}

function classifyNonDefinitionPath(path: string): PackageAnalysisFileRole[] {
  const lower = normalizeVirtualPath(path).toLowerCase();
  if (lower.includes("/chars/") || lower.startsWith("chars/")) {
    return ["character"];
  }
  if (lower.includes("/stages/") || lower.startsWith("stages/")) {
    return ["stage"];
  }
  if (lower.includes("/data/") || lower.startsWith("data/") || lower.startsWith("font/") || lower.startsWith("sound/")) {
    return ["system"];
  }
  return lower.includes("/") ? ["asset"] : [];
}

function isScreenpackDefinitionPath(lowerPath: string): boolean {
  const name = basename(lowerPath);
  return name === "select.def" || name === "system.def" || name === "fight.def" ||
    lowerPath.includes("/data/") || lowerPath.startsWith("data/");
}

function isSelectDefinitionPath(path: string): boolean {
  return basename(normalizeVirtualPath(path)).toLowerCase() === "select.def";
}

function sectionValues(rawSections: Record<string, Record<string, string>>, expected: string): Record<string, string> {
  return Object.entries(rawSections).find(([section]) => section.toLowerCase() === expected.toLowerCase())?.[1] ?? {};
}

function primaryCategory(roles: readonly PackageAnalysisFileRole[], path: string): PackageAnalysisFindingCategory {
  if (roles.includes("screenpack")) return "screenpack";
  if (roles.includes("character")) return "character";
  if (roles.includes("stage")) return "stage";
  if (roles.includes("system")) return "system";
  return path ? "package" : "package";
}

function isFileReference(key: string, value: string): boolean {
  const normalized = unquote(value).trim();
  if (!normalized || /^[-+]?\d+(?:\.\d+)?(?:\s*,\s*[-+]?\d+(?:\.\d+)?)?$/.test(normalized)) {
    return false;
  }
  if (/^(none|null|false)$/i.test(normalized)) {
    return false;
  }
  return FILE_REFERENCE_KEYS.has(key.toLowerCase()) || FILE_REFERENCE_EXTENSIONS.test(normalized) || /[\\/]/.test(normalized);
}

function resolveReference(basePath: string, value: string, resolver: PathResolver): string | undefined {
  const normalized = normalizeVirtualPath(unquote(value).trim());
  if (!normalized) {
    return undefined;
  }
  const candidates = [
    resolver.resolve(basePath, normalized),
    normalized,
    normalizeVirtualPath(`data/${normalized}`),
    normalizeVirtualPath(`chars/${normalized}`),
    normalizeVirtualPath(`stages/${normalized}`),
  ];
  return candidates.find((candidate) => candidate && resolver.exists(candidate));
}

function resolveSelectEntry(entry: string, section: "characters" | "stages", resolver: PathResolver): string | undefined {
  const normalized = normalizeVirtualPath(entry);
  const prefix = section === "characters" ? "chars" : "stages";
  const name = basename(normalized);
  const withDef = normalized.toLowerCase().endsWith(".def") ? normalized : `${normalized}.def`;
  const candidates = [
    normalized,
    withDef,
    normalizeVirtualPath(`${prefix}/${normalized}`),
    normalizeVirtualPath(`${prefix}/${withDef}`),
    normalizeVirtualPath(`${prefix}/${normalized}/${name}.def`),
  ];
  return candidates.find((candidate) => resolver.exists(candidate));
}

function findSelectPath(resolver: PathResolver): string | undefined {
  const candidates = resolver.findByBasename("select.def");
  return candidates.find((path) => {
    const lower = path.toLowerCase();
    return lower === "data/select.def" || lower.endsWith("/data/select.def");
  }) ?? candidates[0];
}

function isSelectControlEntry(entry: string): boolean {
  return /^(randomselect|random|none)$/i.test(entry);
}

function ikemenCategory(category: IkemenScanFinding["category"], path: string): PackageAnalysisFindingCategory {
  if (category === "stage") return "stage";
  if (category === "screenpack") return "screenpack";
  const lower = path.toLowerCase();
  if (lower.includes("/chars/") || lower.startsWith("chars/")) return "character";
  if (lower.includes("/stages/") || lower.startsWith("stages/")) return "stage";
  if (lower.includes("/data/") || lower.startsWith("data/")) return "system";
  return "package";
}

function parseScannerLocation(value: string): PackageAnalysisLocation {
  const match = /^(.*?)(?::(\d+))?$/.exec(value);
  const path = match?.[1] || value;
  const line = match?.[2] ? Number(match[2]) : undefined;
  return { path, ...(line !== undefined ? { line } : {}) };
}

function addFinding(findings: Array<Omit<PackageAnalysisFinding, "id">>, finding: Omit<PackageAnalysisFinding, "id">): void {
  findings.push(finding);
}

function findingId(finding: Omit<PackageAnalysisFinding, "id">): string {
  const suffix = hashStableJson({
    dependency: finding.dependency,
    raw: finding.raw,
    detail: finding.detail,
    fallback: finding.fallback,
  });
  return `${finding.status}:${finding.category}:${finding.location.path}:${finding.location.line ?? 0}:${finding.feature}:${suffix}`;
}

function compareFindings(left: PackageAnalysisFinding, right: PackageAnalysisFinding): number {
  return left.location.path.localeCompare(right.location.path) ||
    (left.location.line ?? 0) - (right.location.line ?? 0) ||
    left.category.localeCompare(right.category) ||
    left.status.localeCompare(right.status) ||
    left.feature.localeCompare(right.feature) ||
    left.id.localeCompare(right.id);
}

function summarizePackage(
  paths: readonly string[],
  files: readonly PackageAnalysisFile[],
  findings: readonly PackageAnalysisFinding[],
  entrypointCount: number,
): PackageAnalysisSummary {
  const byStatus: Record<PackageAnalysisFindingStatus, number> = { recognized: 0, unsupported: 0, unknown: 0 };
  const byCategory: Record<PackageAnalysisFindingCategory, number> = {
    package: 0,
    character: 0,
    stage: 0,
    system: 0,
    screenpack: 0,
  };
  for (const finding of findings) {
    byStatus[finding.status] += 1;
    byCategory[finding.category] += 1;
  }
  return {
    fileCount: paths.length,
    recognizedFileCount: files.filter((file) => file.roles.length > 0).length,
    unknownFileCount: files.filter((file) => file.roles.length === 0).length,
    entrypointCount,
    findingCount: findings.length,
    byStatus,
    byCategory,
  };
}

function resolveOverallStatus(summary: Pick<PackageAnalysisSummary, "byStatus" | "entrypointCount">): PackageAnalysisResult["status"] {
  if (summary.entrypointCount === 0) return "unknown";
  if (summary.byStatus.recognized === 0) return "unknown";
  return summary.byStatus.unsupported > 0 || summary.byStatus.unknown > 0 ? "partial" : "recognized";
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function hashStableJson(value: unknown): string {
  const text = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPackageAnalysisPayload(value: Record<string, unknown>): value is PackageAnalysisResult {
  return typeof value.sourceName === "string" &&
    typeof value.generatedAt === "string" &&
    (value.status === "recognized" || value.status === "partial" || value.status === "unknown") &&
    isRecord(value.profiles) && Array.isArray(value.files) && Array.isArray(value.findings) && isRecord(value.summary) &&
    isRecord(value.claims) && Array.isArray(value.diagnostics) &&
    typeof value.checksum === "string";
}

function createProfiles(definitions: readonly DefinitionRecord[], ikemen: { detected: boolean; findings: readonly IkemenScanFinding[] }): PackageAnalysisProfiles {
  const versions = uniqueSorted(
    definitions
      .map((definition) => definition.character.info.mugenVersion)
      .filter((version): version is string => Boolean(version))
      .map((version) => version.trim()),
  );
  const profile = versions.some((version) => /\b1\.1\b|1\.1b/i.test(version))
    ? "mugen-1.1"
    : versions.some((version) => /\b1\.0\b/i.test(version))
      ? "mugen-1.0"
      : "unknown";
  return {
    mugen: { profile, versions },
    ikemen: {
      profile: "ikemen-go-scan",
      detected: ikemen.detected,
      findingCount: ikemen.findings.length,
      claim: "scanner-only",
    },
  };
}

const FILE_REFERENCE_EXTENSIONS = /\.(?:act|air|cns|cmd|def|fnt|json|lua|mp3|ogg|sff|snd|st|ttf|wav|zss)$/i;
const FILE_REFERENCE_KEYS = new Set([
  "air",
  "anim",
  "bgmusic",
  "cmd",
  "cns",
  "font",
  "music",
  "select",
  "sff",
  "snd",
  "sound",
  "sprite",
  "spr",
  "system",
  "st",
  "stcommon",
]);

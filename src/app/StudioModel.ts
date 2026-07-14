import type { StageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import type { MugenCharacter } from "../mugen/model/MugenCharacter";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import type { DemoFighterDefinition } from "../mugen/runtime/demoFighters";
import {
  getEngineModuleContract,
  type EngineModuleRole,
  type EngineModuleStatus,
  type SharedEngineContractId,
} from "../engine/ModuleContracts";
import {
  SOURCE_FINGERPRINT_ALGORITHM,
  classifySourceIdentity,
  type SourceFileFingerprint,
  type SourceFingerprintAlgorithm,
  type SourceIdentityStatus,
} from "./StudioSourceIdentity";

export type StudioStatus = "ok" | "warn" | "fail" | "pending" | "partial" | "planned" | "active" | "blocked" | "unsupported" | "unknown";
export type StudioSeverity = "info" | "notice" | "warning" | "error";
export type StudioAffectedSystem = "runtime" | "parser" | "renderer" | "audio" | "stage" | "studio" | "build" | "module";
export type StudioActionKind =
  | "open-evidence"
  | "open-character-preview"
  | "open-stage-preview"
  | "open-build"
  | "relink-source"
  | "replace-asset"
  | "regenerate-source"
  | "run-trace"
  | "run-smoke"
  | "not-supported-yet";

export type StudioNextAction = {
  kind: StudioActionKind;
  label: string;
  targetId?: string;
};

export type StudioActionableFields = {
  severity: StudioSeverity;
  affectedAssetId?: string;
  affectedSystem?: StudioAffectedSystem;
  impact: string;
  evidenceIds: string[];
  blockedBy: string[];
  staleBecause?: string;
  canExport: boolean;
  nextAction: StudioNextAction;
};

export type StudioAssetRecord = {
  id: string;
  label: string;
  kind: "character" | "stage" | "sprite-atlas" | "sound" | "report";
  source: "mugen-import" | "generated" | "authored" | "runtime-demo" | "converted";
  status: StudioStatus;
  detail: string;
  tags: string[];
} & StudioActionableFields;

export type StudioModuleRecord = {
  id: string;
  label: string;
  status: StudioStatus;
  contractStatus?: EngineModuleStatus;
  role?: EngineModuleRole;
  detail: string;
  next: string;
  consumes: SharedEngineContractId[];
  provides: SharedEngineContractId[];
  forbiddenSharedCoreConcepts: string[];
  claimAllowed: string;
  claimBlocked: string;
};

type StudioModuleRecordBase = Omit<
  StudioModuleRecord,
  "contractStatus" | "role" | "consumes" | "provides" | "forbiddenSharedCoreConcepts" | "claimAllowed" | "claimBlocked"
>;

export type StudioGateRecord = {
  id: string;
  label: string;
  status: StudioStatus;
  detail: string;
} & StudioActionableFields;

export type StudioProjectSummary = {
  name: string;
  projectType: "mugen-port";
  entry: {
    mode: "match";
    p1: string;
    p2: string;
    stage: string;
  };
  stats: {
    characters: number;
    stages: number;
    importedCharacters: number;
    importedStages: number;
    generatedAtlases: number;
  };
  modules: StudioModuleRecord[];
  assets: StudioAssetRecord[];
  gates: StudioGateRecord[];
};

export type GameProjectManifest = {
  schemaVersion: "mugen-web-sandbox/project/v0";
  id: string;
  name: string;
  engineVersion: string;
  generatedAt: string;
  projectType: StudioProjectSummary["projectType"];
  modules: string[];
  sourcePackages: GameProjectSourcePackage[];
  assets: {
    characters: string[];
    stages: string[];
    audio: string[];
    ui: string[];
    effects: string[];
  };
  assetRecords: StudioAssetRecord[];
  entry: StudioProjectSummary["entry"];
  compatibility: {
    gates: StudioGateRecord[];
    stats: StudioProjectSummary["stats"];
  };
};

export type GameProjectSourcePackage = {
  id: string;
  name: string;
  kind: "zip" | "folder";
  fileCount: number;
  status: "linked" | "missing";
  characterId?: string;
  characterName?: string;
  defPath?: string;
  stageIds: string[];
  stageDefPaths: string[];
  requiredPaths: string[];
  fingerprint?: string;
  fingerprintAlgorithm?: SourceFingerprintAlgorithm;
  byteLength?: number;
  observedFingerprint?: string;
  observedByteLength?: number;
  fileDigests?: SourceFileFingerprint[];
  identityStatus?: SourceIdentityStatus;
};

export type GameProjectManifestParseResult = {
  manifest?: GameProjectManifest;
  warnings: string[];
  errors: string[];
};

export type GameProjectSourceRelinkSource = {
  name: string;
  kind: GameProjectSourcePackage["kind"];
  fileCount: number;
  paths: string[];
  fingerprint?: string;
  byteLength?: number;
  fileDigests?: SourceFileFingerprint[];
};

export type GameProjectSourceRelinkResult = {
  sourcePackages: GameProjectSourcePackage[];
  linkedIds: string[];
  missing: Array<{ id: string; missingPaths: string[] }>;
  warnings: string[];
};

export type StudioMotionQa = {
  status: "loading" | "pass" | "warn" | "fail" | "missing";
  checkedStates: string[];
  warnings: string[];
  errors: string[];
};

export const MAX_PROJECT_NAME_LENGTH = 80;

export function normalizeProjectName(value: string): string | undefined {
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, MAX_PROJECT_NAME_LENGTH).trim();
  return normalized || undefined;
}

export function buildStudioProjectSummary(input: {
  fighters: DemoFighterDefinition[];
  selectedP1: string;
  selectedP2: string;
  stage: MugenStageDefinition;
  stages: MugenStageDefinition[];
  character?: MugenCharacter;
  stageReports: StageCompatibilityReport[];
  atlasStatusByFighter: Record<string, "loading" | "loaded" | "fallback">;
  atlasMotionQaByFighter: Record<string, StudioMotionQa>;
}): StudioProjectSummary {
  const selectedFighters = new Set([input.selectedP1, input.selectedP2]);
  const generatedAtlases = input.fighters.filter((fighter) => fighter.source !== "imported").length;
  const importedCharacters = input.fighters.filter((fighter) => fighter.source === "imported").length;
  const assets = [
    ...input.fighters.map((fighter) =>
      fighter.source === "imported"
        ? importedFighterAsset(fighter, selectedFighters, input.character)
        : generatedFighterAsset(fighter, selectedFighters, input.atlasStatusByFighter[fighter.id], input.atlasMotionQaByFighter[fighter.id]),
    ),
    ...stageAssets(input.stage, input.stages, input.stageReports),
    ...characterSupportAssets(input.character),
  ];

  return {
    name: input.character?.definition.info.displayName ?? input.character?.definition.info.name ?? "Local Fighting Project",
    projectType: "mugen-port",
    entry: {
      mode: "match",
      p1: input.selectedP1,
      p2: input.selectedP2,
      stage: input.stage.id,
    },
    stats: {
      characters: input.fighters.length,
      stages: input.stages.length,
      importedCharacters,
      importedStages: input.stageReports.length,
      generatedAtlases,
    },
    modules: buildModules(input.character),
    assets,
    gates: buildGates(input.character, input.stageReports, input.atlasMotionQaByFighter),
  };
}

export function buildGameProjectManifest(
  summary: StudioProjectSummary,
  options: { engineVersion?: string; generatedAt?: string; sourcePackages?: GameProjectSourcePackage[] } = {},
): GameProjectManifest {
  return {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: slugId(summary.name),
    name: summary.name,
    engineVersion: options.engineVersion ?? "mugen-web-sandbox@0.0.0",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    projectType: summary.projectType,
    modules: summary.modules.map((module) => module.id),
    sourcePackages: options.sourcePackages ?? [],
    assets: {
      characters: summary.assets
        .filter((asset) => asset.kind === "character" || asset.kind === "sprite-atlas")
        .map((asset) => asset.id),
      stages: summary.assets.filter((asset) => asset.kind === "stage").map((asset) => asset.id),
      audio: summary.assets.filter((asset) => asset.kind === "sound").map((asset) => asset.id),
      ui: [],
      effects: [],
    },
    assetRecords: summary.assets,
    entry: summary.entry,
    compatibility: {
      gates: summary.gates,
      stats: summary.stats,
    },
  };
}

export function parseGameProjectManifestJson(text: string): GameProjectManifestParseResult {
  try {
    return parseGameProjectManifest(JSON.parse(text));
  } catch (error) {
    return {
      warnings: [],
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

export function parseGameProjectManifest(value: unknown): GameProjectManifestParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { warnings, errors: ["Manifest root must be an object"] };
  }

  const schemaVersion = value.schemaVersion;
  if (schemaVersion !== "mugen-web-sandbox/project/v0") {
    errors.push(`Unsupported project schema ${typeof schemaVersion === "string" ? schemaVersion : "(missing)"}`);
  }

  const projectType = value.projectType;
  if (projectType !== "mugen-port") {
    errors.push(`Unsupported project type ${typeof projectType === "string" ? projectType : "(missing)"}`);
  }

  const entry = parseEntry(value.entry, errors);
  const modules = stringArray(value.modules, "modules", warnings);
  const sourcePackages = parseSourcePackages(value.sourcePackages, warnings);
  const assets = parseManifestAssets(value.assets, warnings);
  const assetRecords = parseAssetRecords(value.assetRecords, warnings);
  const gates = parseGates(isRecord(value.compatibility) ? value.compatibility.gates : undefined, warnings);
  const stats = parseStats(isRecord(value.compatibility) ? value.compatibility.stats : undefined, warnings);
  const name = stringValue(value.name, "name", warnings) ?? "Imported Project";
  const id = stringValue(value.id, "id", warnings) ?? slugId(name);
  const engineVersion = stringValue(value.engineVersion, "engineVersion", warnings) ?? "unknown";
  const generatedAt = stringValue(value.generatedAt, "generatedAt", warnings) ?? new Date(0).toISOString();

  if (errors.length > 0 || !entry) {
    return { warnings, errors };
  }

  return {
    warnings,
    errors,
    manifest: {
      schemaVersion: "mugen-web-sandbox/project/v0",
      id,
      name,
      engineVersion,
      generatedAt,
      projectType: "mugen-port",
      modules,
      sourcePackages,
      assets,
      assetRecords,
      entry,
      compatibility: { gates, stats },
    },
  };
}

export function relinkGameProjectSourcePackages(
  sourcePackages: GameProjectSourcePackage[],
  source: GameProjectSourceRelinkSource,
  targetId?: string,
  options: { allowChangedFingerprint?: boolean } = {},
): GameProjectSourceRelinkResult {
  const sourcePaths = source.paths.map(normalizeSourcePackagePath).filter(Boolean);
  const sourcePathSet = new Set(sourcePaths);
  const linkedIds: string[] = [];
  const missing: Array<{ id: string; missingPaths: string[] }> = [];
  const warnings: string[] = [];
  const normalizedSourceName = normalizeSourcePackageName(source.name);

  const relinked = sourcePackages.map((sourcePackage) => {
    if (targetId && sourcePackage.id !== targetId) {
      return sourcePackage;
    }
    const requiredPaths = sourcePackage.requiredPaths.map(normalizeSourcePackagePath).filter(Boolean);
    const missingPaths = sourcePackage.requiredPaths.filter((_requiredPath, index) => {
      const normalized = requiredPaths[index];
      return Boolean(normalized) && !sourcePathMatches(sourcePathSet, sourcePaths, normalized);
    });
    const pathsMatch = requiredPaths.length > 0 && missingPaths.length === 0;
    const nameMatches = normalizeSourcePackageName(sourcePackage.name) === normalizedSourceName;
    const kindMatches = sourcePackage.kind === source.kind;
    const identityStatus = classifySourceIdentity(sourcePackage.fingerprint, source.fingerprint, true);
    const fingerprintMatches = identityStatus !== "changed" || options.allowChangedFingerprint === true;
    const canRelink = (pathsMatch || (nameMatches && kindMatches)) && fingerprintMatches;

    if (!canRelink) {
      missing.push({
        id: sourcePackage.id,
        missingPaths,
      });
      const detail = identityStatus === "changed"
        ? "source fingerprint changed; explicit reimport is required"
        : missingPaths.length
        ? `${missingPaths.length} required path(s) missing: ${missingPaths.slice(0, 3).join(", ")}${missingPaths.length > 3 ? "..." : ""}`
        : `source '${source.name}' did not match package '${sourcePackage.name}'`;
      warnings.push(`Source package '${sourcePackage.name}' could not be relinked from ${source.name}; ${detail}.`);
      return {
        ...sourcePackage,
        status: "missing" as const,
        observedFingerprint: source.fingerprint,
        observedByteLength: source.byteLength,
        identityStatus,
      };
    }

    linkedIds.push(sourcePackage.id);
    const resolvedIdentityStatus = source.fingerprint ? "matched" : identityStatus;
    return {
      ...sourcePackage,
      name: source.name,
      kind: source.kind,
      fileCount: source.fileCount,
      status: "linked" as const,
      fingerprint: options.allowChangedFingerprint ? source.fingerprint : sourcePackage.fingerprint ?? source.fingerprint,
      fingerprintAlgorithm: sourcePackage.fingerprintAlgorithm ?? (source.fingerprint ? SOURCE_FINGERPRINT_ALGORITHM : undefined),
      byteLength: options.allowChangedFingerprint ? source.byteLength : sourcePackage.byteLength ?? source.byteLength,
      ...(sourcePackage.fileDigests ?? source.fileDigests ? { fileDigests: options.allowChangedFingerprint ? source.fileDigests : sourcePackage.fileDigests ?? source.fileDigests } : {}),
      observedFingerprint: source.fingerprint,
      observedByteLength: source.byteLength,
      identityStatus: resolvedIdentityStatus,
    };
  });

  return { sourcePackages: relinked, linkedIds, missing, warnings };
}

function importedFighterAsset(
  fighter: DemoFighterDefinition,
  selectedFighters: Set<string>,
  character: MugenCharacter | undefined,
): StudioAssetRecord {
  const decodedSprites = character?.spriteArchive?.sprites.length ?? 0;
  const status: StudioStatus = decodedSprites > 0 ? "ok" : "warn";
  return withActionableFields({
    id: fighter.id,
    label: fighter.displayName,
    kind: "character",
    source: "mugen-import",
    status,
    detail: `${fighter.animations.size} actions / ${fighter.states?.length ?? 0} states / ${decodedSprites} decoded sprites`,
    tags: ["runtime-route", selectedFighters.has(fighter.id) ? "selected" : "available"].filter(Boolean),
  }, {
    affectedAssetId: fighter.id,
    affectedSystem: "runtime",
    impact: decodedSprites > 0
      ? "Imported fighter can be selected for playtest with decoded sprite evidence."
      : "Imported fighter can be inspected, but sprite rendering may fall back until SFF decoding succeeds.",
    evidenceIds: character ? [`asset:${fighter.id}`, "compat:sprites", "compat:states"] : [`asset:${fighter.id}`],
    blockedBy: decodedSprites > 0 ? [] : ["sprite-decode"],
    canExport: true,
    nextAction: decodedSprites > 0
      ? { kind: "open-character-preview", label: "Open Character Preview", targetId: fighter.id }
      : { kind: "open-evidence", label: "Review sprite decode evidence", targetId: "compat:sprites" },
  });
}

function generatedFighterAsset(
  fighter: DemoFighterDefinition,
  selectedFighters: Set<string>,
  atlasStatus: "loading" | "loaded" | "fallback" | undefined,
  motionQa: StudioMotionQa | undefined,
): StudioAssetRecord {
  const qaStatus = motionQa?.status ?? "loading";
  const status: StudioStatus = atlasStatus === "loaded" && qaStatus === "pass" ? "ok" : qaStatus === "fail" ? "fail" : "warn";
  return withActionableFields({
    id: fighter.id,
    label: fighter.displayName,
    kind: "sprite-atlas",
    source: "generated",
    status,
    detail: `atlas ${atlasStatus ?? "loading"} / walk QA ${qaStatus}`,
    tags: ["sprite-atlas-builder", selectedFighters.has(fighter.id) ? "selected" : "roster"].filter(Boolean),
  }, {
    affectedAssetId: fighter.id,
    affectedSystem: "renderer",
    impact: status === "ok"
      ? "Generated fighter atlas is usable as native playtest content."
      : qaStatus === "fail"
        ? "Generated fighter should not be treated as clean until source sprites are regenerated and atlas QA passes."
        : "Generated fighter is playable with warnings; Studio must keep the atlas QA issue visible.",
    evidenceIds: [`asset:${fighter.id}`, `${fighter.id}:qa:evidence`],
    blockedBy: status === "fail" ? ["atlas-qa"] : [],
    canExport: status !== "fail",
    nextAction: status === "ok"
      ? { kind: "run-trace", label: "Run playtest trace", targetId: fighter.id }
      : { kind: "regenerate-source", label: "Review or regenerate source sprites", targetId: fighter.id },
  });
}

function stageAssets(
  selectedStage: MugenStageDefinition,
  stages: MugenStageDefinition[],
  stageReports: StageCompatibilityReport[],
): StudioAssetRecord[] {
  const reportByName = new Map(stageReports.map((report) => [report.stage, report]));
  return stages.map((stage) => {
    const report = reportByName.get(stage.displayName);
    const imported = Boolean(report);
    const status: StudioStatus = report?.errors.length ? "fail" : report?.warnings.length ? "warn" : "ok";
    const reportedLayers = report?.backgrounds.layers ?? [];
    const supportedLayers = reportedLayers.filter((layer) => layer.status === "rendered" || layer.status === "animated").length;
    const attentionLayers = reportedLayers.filter((layer) => layer.status === "missing" || layer.status === "unsupported" || layer.status === "fallback").length;
    return withActionableFields({
      id: stage.id,
      label: stage.displayName,
      kind: "stage",
      source: imported ? "mugen-import" : stage.layers.some((layer) => layer.assetUrl) ? "authored" : "runtime-demo",
      status,
      detail: imported
        ? `${supportedLayers}/${reportedLayers.length} BG layer(s) rendered/animated, ${attentionLayers} need attention`
        : `${stage.layers.length} authored runtime layers`,
      tags: [stage.id === selectedStage.id ? "selected" : "available", imported ? "stage-def" : "playtest"].filter(Boolean),
    }, {
      affectedAssetId: stage.id,
      affectedSystem: "stage",
      impact: imported
        ? status === "ok"
          ? "Imported stage has rendered sprite references available for playtest."
          : "Imported stage remains usable with explicit rendered/fallback/unsupported reporting."
        : "Stage is available as authored/native playtest content.",
      evidenceIds: imported ? [`asset:${stage.id}`, "stage-import"] : [`asset:${stage.id}`],
      blockedBy: status === "fail" ? ["stage-import"] : [],
      canExport: status !== "fail",
      nextAction: { kind: "open-stage-preview", label: imported ? "Open Stage Preview" : "Review stage asset", targetId: stage.id },
    });
  });
}

function characterSupportAssets(character: MugenCharacter | undefined): StudioAssetRecord[] {
  if (!character) {
    return [];
  }
  const decodedSounds = character.soundArchive?.metadata.decodedTotal ?? 0;
  const totalSounds = character.soundArchive?.metadata.soundTotal ?? 0;
  return [
    withActionableFields({
      id: `${character.sourceName}:compatibility`,
      label: "Compatibility Report",
      kind: "report",
      source: "converted",
      status: character.compatibility.errors.length > 0 ? "fail" : character.compatibility.warnings.length > 0 ? "warn" : "ok",
      detail: `${character.compatibility.states.runtimeRoutable} routable states / ${character.compatibility.triggers.unsupported} unsupported triggers`,
      tags: ["mugen-import", "debug"],
    }, {
      affectedAssetId: `${character.sourceName}:compatibility`,
      affectedSystem: "parser",
      impact: "Compatibility report explains parsed, compiled, routed, executed, unsupported, and unknown MUGEN features.",
      evidenceIds: ["compat:states", "compat:character-files"],
      blockedBy: character.compatibility.errors.length > 0 ? ["mugen-import"] : [],
      canExport: character.compatibility.errors.length === 0,
      nextAction: { kind: "open-evidence", label: "Open compatibility evidence", targetId: "compat:states" },
    }),
    withActionableFields({
      id: `${character.sourceName}:sound`,
      label: "SND Archive",
      kind: "sound",
      source: "mugen-import",
      status: totalSounds === 0 ? "pending" : decodedSounds === totalSounds ? "ok" : "warn",
      detail: totalSounds === 0 ? "no SND loaded" : `${decodedSounds}/${totalSounds} WAV sounds decoded`,
      tags: ["audio", "web-audio"],
    }, {
      affectedAssetId: `${character.sourceName}:sound`,
      affectedSystem: "audio",
      impact: totalSounds === 0
        ? "No imported SND data is available for runtime audio evidence."
        : "Imported SND data can emit inspectable audio events where WAV payloads decode.",
      evidenceIds: [`asset:${character.sourceName}:sound`],
      blockedBy: totalSounds === 0 ? ["sound-file"] : [],
      canExport: true,
      nextAction: totalSounds === 0
        ? { kind: "relink-source", label: "Relink source package for audio", targetId: `${character.sourceName}:sound` }
        : { kind: "open-evidence", label: "Review audio evidence", targetId: `${character.sourceName}:sound` },
    }),
  ];
}

function slugId(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "local-fighting-project";
}

function parseEntry(value: unknown, errors: string[]): GameProjectManifest["entry"] | undefined {
  if (!isRecord(value)) {
    errors.push("Manifest entry must be an object");
    return undefined;
  }
  const mode = value.mode;
  const p1 = value.p1;
  const p2 = value.p2;
  const stage = value.stage;
  if (mode !== "match") {
    errors.push(`Unsupported entry mode ${typeof mode === "string" ? mode : "(missing)"}`);
  }
  if (typeof p1 !== "string" || !p1.trim()) {
    errors.push("Manifest entry.p1 must be a non-empty string");
  }
  if (typeof p2 !== "string" || !p2.trim()) {
    errors.push("Manifest entry.p2 must be a non-empty string");
  }
  if (typeof stage !== "string" || !stage.trim()) {
    errors.push("Manifest entry.stage must be a non-empty string");
  }
  if (errors.length > 0) {
    return undefined;
  }
  return { mode: "match", p1: p1 as string, p2: p2 as string, stage: stage as string };
}

function parseManifestAssets(value: unknown, warnings: string[]): GameProjectManifest["assets"] {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    warnings.push("Manifest assets missing; using empty asset lists");
  }
  return {
    characters: stringArray(record.characters, "assets.characters", warnings),
    stages: stringArray(record.stages, "assets.stages", warnings),
    audio: stringArray(record.audio, "assets.audio", warnings),
    ui: stringArray(record.ui, "assets.ui", warnings),
    effects: stringArray(record.effects, "assets.effects", warnings),
  };
}

function parseSourcePackages(value: unknown, warnings: string[]): GameProjectSourcePackage[] {
  if (value === undefined) {
    warnings.push("Manifest sourcePackages missing; using []");
    return [];
  }
  if (!Array.isArray(value)) {
    warnings.push("Manifest sourcePackages must be an array; using []");
    return [];
  }
  return value.filter(isGameProjectSourcePackage);
}

function parseAssetRecords(value: unknown, warnings: string[]): StudioAssetRecord[] {
  if (!Array.isArray(value)) {
    warnings.push("Manifest assetRecords missing; using an empty provenance list");
    return [];
  }
  return value.flatMap((item) => {
    const record = normalizeStudioAssetRecord(item);
    return record ? [record] : [];
  });
}

function parseGates(value: unknown, warnings: string[]): StudioGateRecord[] {
  if (!Array.isArray(value)) {
    warnings.push("Manifest compatibility.gates missing; using an empty gate list");
    return [];
  }
  return value.flatMap((item) => {
    const record = normalizeStudioGateRecord(item);
    return record ? [record] : [];
  });
}

function parseStats(value: unknown, warnings: string[]): StudioProjectSummary["stats"] {
  if (!isRecord(value)) {
    warnings.push("Manifest compatibility.stats missing; using zeroed stats");
    return { characters: 0, stages: 0, importedCharacters: 0, importedStages: 0, generatedAtlases: 0 };
  }
  return {
    characters: numberValue(value.characters),
    stages: numberValue(value.stages),
    importedCharacters: numberValue(value.importedCharacters),
    importedStages: numberValue(value.importedStages),
    generatedAtlases: numberValue(value.generatedAtlases),
  };
}

function stringArray(value: unknown, label: string, warnings: string[]): string[] {
  if (!Array.isArray(value)) {
    warnings.push(`Manifest ${label} missing; using []`);
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function stringValue(value: unknown, label: string, warnings: string[]): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  warnings.push(`Manifest ${label} missing; using fallback`);
  return undefined;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStudioStatus(value: unknown): value is StudioStatus {
  return (
    value === "ok" ||
    value === "warn" ||
    value === "fail" ||
    value === "pending" ||
    value === "partial" ||
    value === "planned" ||
    value === "active" ||
    value === "blocked" ||
    value === "unsupported" ||
    value === "unknown"
  );
}

function isStudioSeverity(value: unknown): value is StudioSeverity {
  return value === "info" || value === "notice" || value === "warning" || value === "error";
}

function isStudioAffectedSystem(value: unknown): value is StudioAffectedSystem {
  return value === "runtime" || value === "parser" || value === "renderer" || value === "audio" || value === "stage" || value === "studio" || value === "build" || value === "module";
}

function isStudioActionKind(value: unknown): value is StudioActionKind {
  return (
    value === "open-evidence" ||
    value === "open-character-preview" ||
    value === "open-stage-preview" ||
    value === "open-build" ||
    value === "relink-source" ||
    value === "replace-asset" ||
    value === "regenerate-source" ||
    value === "run-trace" ||
    value === "run-smoke" ||
    value === "not-supported-yet"
  );
}

function isStudioAssetRecord(value: unknown): value is StudioAssetRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.kind === "string" &&
    typeof value.source === "string" &&
    isStudioStatus(value.status) &&
    typeof value.detail === "string" &&
    Array.isArray(value.tags)
  );
}

function normalizeStudioAssetRecord(value: unknown): StudioAssetRecord | undefined {
  if (!isStudioAssetRecord(value)) {
    return undefined;
  }
  return {
    id: value.id,
    label: value.label,
    kind: value.kind,
    source: value.source,
    status: value.status,
    detail: value.detail,
    tags: stringArrayNoWarning(value.tags),
    ...normalizeActionableFields(value, value.status, value.id),
  };
}

function isGameProjectSourcePackage(value: unknown): value is GameProjectSourcePackage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.kind === "zip" || value.kind === "folder") &&
    typeof value.fileCount === "number" &&
    Number.isFinite(value.fileCount) &&
    (value.status === "linked" || value.status === "missing") &&
    Array.isArray(value.stageIds) &&
    value.stageIds.every((item) => typeof item === "string") &&
    Array.isArray(value.stageDefPaths) &&
    value.stageDefPaths.every((item) => typeof item === "string") &&
    Array.isArray(value.requiredPaths) &&
    value.requiredPaths.every((item) => typeof item === "string") &&
    (value.characterId === undefined || typeof value.characterId === "string") &&
    (value.characterName === undefined || typeof value.characterName === "string") &&
    (value.defPath === undefined || typeof value.defPath === "string") &&
    (value.fingerprint === undefined || (typeof value.fingerprint === "string" && /^[0-9a-f]{64}$/i.test(value.fingerprint))) &&
    (value.fingerprintAlgorithm === undefined || value.fingerprintAlgorithm === SOURCE_FINGERPRINT_ALGORITHM) &&
    (value.byteLength === undefined || (typeof value.byteLength === "number" && Number.isSafeInteger(value.byteLength) && value.byteLength >= 0)) &&
    (value.observedFingerprint === undefined || (typeof value.observedFingerprint === "string" && /^[0-9a-f]{64}$/i.test(value.observedFingerprint))) &&
    (value.observedByteLength === undefined || (typeof value.observedByteLength === "number" && Number.isSafeInteger(value.observedByteLength) && value.observedByteLength >= 0)) &&
    (value.fileDigests === undefined || isSourceFileFingerprintArray(value.fileDigests)) &&
    (value.identityStatus === undefined || value.identityStatus === "matched" || value.identityStatus === "changed" || value.identityStatus === "missing" || value.identityStatus === "unknown")
  );
}

function isSourceFileFingerprintArray(value: unknown): value is SourceFileFingerprint[] {
  return Array.isArray(value) && value.every((item) => (
    isRecord(item) &&
    typeof item.path === "string" &&
    /^[0-9a-f]{64}$/i.test(typeof item.digest === "string" ? item.digest : "") &&
    typeof item.byteLength === "number" &&
    Number.isSafeInteger(item.byteLength) &&
    item.byteLength >= 0
  ));
}

function isStudioGateRecord(value: unknown): value is StudioGateRecord {
  return isRecord(value) && typeof value.id === "string" && typeof value.label === "string" && isStudioStatus(value.status) && typeof value.detail === "string";
}

function normalizeStudioGateRecord(value: unknown): StudioGateRecord | undefined {
  if (!isStudioGateRecord(value)) {
    return undefined;
  }
  return {
    id: value.id,
    label: value.label,
    status: value.status,
    detail: value.detail,
    ...normalizeActionableFields(value, value.status, value.id),
  };
}

function actionableDefaults(status: StudioStatus): StudioActionableFields {
  return {
    severity: severityForStatus(status),
    impact: "Review this record before treating the project as export-ready.",
    evidenceIds: [],
    blockedBy: isBlockingStatus(status) ? ["unresolved-status"] : [],
    canExport: !isBlockingStatus(status),
    nextAction: { kind: isBlockingStatus(status) ? "open-evidence" : "open-build", label: isBlockingStatus(status) ? "Review evidence" : "Review Build Center" },
  };
}

function withActionableFields<T extends { status: StudioStatus; id: string }>(record: T, fields: Partial<StudioActionableFields> = {}): T & StudioActionableFields {
  const defaults = actionableDefaults(record.status);
  return {
    ...record,
    ...defaults,
    ...fields,
    severity: fields.severity ?? defaults.severity,
    impact: fields.impact ?? defaults.impact,
    evidenceIds: fields.evidenceIds ?? defaults.evidenceIds,
    blockedBy: fields.blockedBy ?? defaults.blockedBy,
    canExport: fields.canExport ?? defaults.canExport,
    nextAction: fields.nextAction ?? defaults.nextAction,
  };
}

function normalizeActionableFields(value: Record<string, unknown>, status: StudioStatus, fallbackTargetId: string): StudioActionableFields {
  const defaults = actionableDefaults(status);
  const nextAction = parseNextAction(value.nextAction, fallbackTargetId) ?? defaults.nextAction;
  return {
    severity: isStudioSeverity(value.severity) ? value.severity : defaults.severity,
    affectedAssetId: typeof value.affectedAssetId === "string" ? value.affectedAssetId : undefined,
    affectedSystem: isStudioAffectedSystem(value.affectedSystem) ? value.affectedSystem : undefined,
    impact: typeof value.impact === "string" && value.impact.trim() ? value.impact : defaults.impact,
    evidenceIds: stringArrayNoWarning(value.evidenceIds),
    blockedBy: stringArrayNoWarning(value.blockedBy),
    staleBecause: typeof value.staleBecause === "string" && value.staleBecause.trim() ? value.staleBecause : undefined,
    canExport: typeof value.canExport === "boolean" ? value.canExport : defaults.canExport,
    nextAction,
  };
}

function parseNextAction(value: unknown, fallbackTargetId: string): StudioNextAction | undefined {
  if (!isRecord(value) || !isStudioActionKind(value.kind) || typeof value.label !== "string" || !value.label.trim()) {
    return undefined;
  }
  return {
    kind: value.kind,
    label: value.label,
    targetId: typeof value.targetId === "string" && value.targetId.trim() ? value.targetId : fallbackTargetId,
  };
}

function severityForStatus(status: StudioStatus): StudioSeverity {
  if (status === "fail" || status === "blocked" || status === "unsupported") {
    return "error";
  }
  if (status === "warn" || status === "partial" || status === "pending" || status === "unknown") {
    return "warning";
  }
  if (status === "planned") {
    return "notice";
  }
  return "info";
}

function isBlockingStatus(status: StudioStatus): boolean {
  return status === "fail" || status === "blocked" || status === "unsupported" || status === "unknown";
}

function stringArrayNoWarning(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeSourcePackagePath(value: string): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .toLowerCase();
}

function normalizeSourcePackageName(value: string): string {
  return value.trim().replace(/\\/g, "/").split("/").filter(Boolean).at(-1)?.toLowerCase() ?? value.trim().toLowerCase();
}

function sourcePathMatches(sourcePathSet: Set<string>, sourcePaths: string[], requiredPath: string): boolean {
  if (sourcePathSet.has(requiredPath)) {
    return true;
  }
  return sourcePaths.some((sourcePath) => sourcePath.endsWith(`/${requiredPath}`) || requiredPath.endsWith(`/${sourcePath}`));
}

function buildModules(character: MugenCharacter | undefined): StudioModuleRecord[] {
  const modules: StudioModuleRecordBase[] = [
    {
      id: "mugen-compat",
      label: "MUGEN/Ikemen Compatibility",
      status: character ? "active" : "partial",
      detail: character
        ? `${character.animations.size} AIR actions, ${character.states.length} CNS states, ${character.commands.length} CMD commands`
        : "loader/runtime ready; waiting for imported character data",
      next: "Increase CNS trigger/controller parity against KFM and Ikemen-GO reference behavior",
    },
    {
      id: "three-render",
      label: "Three.js Render Adapter",
      status: "active",
      detail: "orthographic 2.5D stage, sprite planes, collision overlays, HUD bridge",
      next: "Split render adapter contracts from fighting-specific debug surfaces",
    },
    {
      id: "asset-pipeline",
      label: "Generated Asset Pipeline",
      status: "partial",
      detail: "sprite-atlas-builder manifests, atlas QA badges, generated roster route",
      next: "Add project-scoped generated asset manifests and collision authoring",
    },
    {
      id: "studio-workspace",
      label: "Creator Studio Workspace",
      status: "partial",
      detail: "project summary, module gates, asset provenance, playtest entry",
      next: "Persist project.json and build/runtime manifests",
    },
    {
      id: "platformer-module",
      label: "Future Platformer Module",
      status: "planned",
      detail: "not implemented; kept as a module target beyond fighting games",
      next: "Define tile collision, camera, hazards, checkpoints, and shared asset contract",
    },
  ];
  return modules.map(withModuleContract);
}

function withModuleContract(module: StudioModuleRecordBase): StudioModuleRecord {
  const contract = getEngineModuleContract(module.id);
  return {
    ...module,
    contractStatus: contract?.status,
    role: contract?.role,
    consumes: contract ? [...contract.consumes] : [],
    provides: contract ? [...contract.provides] : [],
    forbiddenSharedCoreConcepts: contract ? [...contract.forbiddenSharedCoreConcepts] : [],
    claimAllowed: contract?.claimAllowed ?? "No shared engine contract is registered for this module.",
    claimBlocked: contract?.claimBlocked ?? "This module cannot be compiled or exported as a known runtime boundary yet.",
  };
}

function buildGates(
  character: MugenCharacter | undefined,
  stageReports: StageCompatibilityReport[],
  motionQa: Record<string, StudioMotionQa>,
): StudioGateRecord[] {
  const qaValues = Object.values(motionQa);
  const anyQaFail = qaValues.some((qa) => qa.status === "fail");
  const anyQaWarn = qaValues.some((qa) => qa.status === "warn" || qa.status === "missing" || qa.status === "loading");
  const stageErrors = stageReports.flatMap((report) => report.errors);
  const stageWarnings = stageReports.flatMap((report) => report.warnings);
  const decodedSprites = character?.spriteArchive?.sprites.length ?? 0;
  return [
    withActionableFields({
      id: "playtest",
      label: "Playable Match",
      status: "ok",
      detail: "two-fighter Three.js playtest is available from Runtime mode",
    }, {
      affectedSystem: "runtime",
      impact: "The project has a runnable local match baseline for verifying runtime, renderer, and Studio changes.",
      evidenceIds: ["runtime-smoke", "trace:smoke"],
      blockedBy: [],
      canExport: true,
      nextAction: { kind: "run-smoke", label: "Run visual smoke QA", targetId: "playtest" },
    }),
    withActionableFields({
      id: "mugen-import",
      label: "Real MUGEN Import",
      status: character ? "ok" : "pending",
      detail: character ? `${character.defPath} loaded` : "load a ZIP/folder to validate a real character",
    }, {
      affectedSystem: "parser",
      impact: character
        ? "A real imported character is available for parser/runtime compatibility evidence."
        : "Only native/generated content is loaded, so imported MUGEN compatibility claims remain unproven in this session.",
      evidenceIds: character ? ["compat:character-files", "compat:states"] : [],
      blockedBy: character ? [] : ["missing-imported-character"],
      canExport: true,
      nextAction: character
        ? { kind: "open-evidence", label: "Open import evidence", targetId: "compat:character-files" }
        : { kind: "relink-source", label: "Load MUGEN ZIP or folder", targetId: "mugen-import" },
    }),
    withActionableFields({
      id: "sprite-decode",
      label: "Sprite Decode",
      status: character ? (decodedSprites > 0 ? "ok" : "warn") : "pending",
      detail: character ? `${decodedSprites} decoded imported sprites` : "waiting for imported SFF",
    }, {
      affectedSystem: "renderer",
      impact: decodedSprites > 0
        ? "Imported SFF sprites can render through the browser sprite provider."
        : "Imported animation preview may use fallback rendering until sprites decode.",
      evidenceIds: character ? ["compat:sprites"] : [],
      blockedBy: character && decodedSprites <= 0 ? ["sff-decode"] : [],
      canExport: true,
      nextAction: decodedSprites > 0
        ? { kind: "open-character-preview", label: "Preview decoded sprites", targetId: "sprite-decode" }
        : { kind: "open-evidence", label: "Review SFF decode status", targetId: "compat:sprites" },
    }),
    withActionableFields({
      id: "atlas-qa",
      label: "Generated Atlas QA",
      status: anyQaFail ? "fail" : anyQaWarn ? "warn" : "ok",
      detail: `${qaValues.length} generated roster QA reports tracked`,
    }, {
      affectedSystem: "renderer",
      impact: anyQaFail
        ? "At least one generated fighter has failing atlas QA and should be regenerated before export."
        : anyQaWarn
          ? "Generated roster remains playable, but warnings must stay visible in project evidence."
          : "Generated atlas roster has current QA evidence.",
      evidenceIds: ["asset:atlas-qa"],
      blockedBy: anyQaFail ? ["generated-asset-qa"] : [],
      canExport: !anyQaFail,
      nextAction: anyQaFail || anyQaWarn
        ? { kind: "regenerate-source", label: "Review generated asset QA", targetId: "atlas-qa" }
        : { kind: "run-trace", label: "Run roster playtest trace", targetId: "atlas-qa" },
    }),
    withActionableFields({
      id: "stage-import",
      label: "Stage Pipeline",
      status: stageErrors.length ? "fail" : stageWarnings.length ? "warn" : stageReports.length ? "ok" : "partial",
      detail: stageReports.length ? `${stageReports.length} imported stage report(s)` : "authored demo stage active; no imported stage loaded",
    }, {
      affectedSystem: "stage",
      impact: stageReports.length
        ? "Imported stage evidence is available with rendered/fallback/unsupported layer status."
        : "The match has a native/authored stage, but imported stage compatibility is not proven in this session.",
      evidenceIds: stageReports.length ? ["stage-import", "asset:stage-import"] : [],
      blockedBy: stageErrors.length ? ["stage-errors"] : [],
      canExport: stageErrors.length === 0,
      nextAction: stageReports.length
        ? { kind: "open-stage-preview", label: "Open stage evidence", targetId: "stage-import" }
        : { kind: "open-stage-preview", label: "Review native stage", targetId: "stage-import" },
    }),
    withActionableFields({
      id: "architecture-boundaries",
      label: "Architecture Boundaries",
      status: "ok",
      detail: "shared engine, MUGEN compatibility, renderer, Studio, and future modules are guarded by import-boundary tests",
    }, {
      affectedSystem: "module",
      impact: "The project has a visible contract that keeps renderer-independent engine code separate from MUGEN parsers/runtime and Studio UI.",
      evidenceIds: ["test:architecture-boundaries", "module-contracts"],
      blockedBy: [],
      canExport: true,
      nextAction: { kind: "open-build", label: "Review module boundaries", targetId: "architecture-boundaries" },
    }),
    withActionableFields({
      id: "visual-qa",
      label: "Visual QA",
      status: "partial",
      detail: "desktop/mobile Playwright screenshots and canvas pixel checks are required before UI handoff",
    }, {
      affectedSystem: "studio",
      impact: "Visible UI, renderer, stage, sprite, and debug changes need screenshots before handoff.",
      evidenceIds: ["qa-smoke"],
      blockedBy: [],
      canExport: true,
      nextAction: { kind: "run-smoke", label: "Run pnpm qa:smoke", targetId: "visual-qa" },
    }),
  ];
}

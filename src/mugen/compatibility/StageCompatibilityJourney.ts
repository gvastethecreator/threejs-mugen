import type {
  CompatibilityJourneyArtifactReference,
  CompatibilityJourneyBrowserEvidence,
  CompatibilityJourneyCheckStatus,
  CompatibilityJourneyPackageEvidence,
  CompatibilityJourneyRegressionEvidence,
} from "./CompatibilityJourney";
import type { StageCompatibilityReport } from "./StageCompatibilityReport";

export const STAGE_COMPATIBILITY_JOURNEY_SCHEMA = "mugen-web-sandbox/stage-compatibility-journey/v1" as const;

export type StageCompatibilityJourneyCheck = {
  id: string;
  status: CompatibilityJourneyCheckStatus;
  detail: string;
};

export type StageCompatibilityJourneyInput = {
  id: string;
  generatedAt: string;
  package: CompatibilityJourneyPackageEvidence;
  loader: {
    status: CompatibilityJourneyCheckStatus;
    sourceName: string;
    loaded: boolean;
    presentFiles: string[];
    report: StageCompatibilityReport;
  };
  runtime: {
    status: CompatibilityJourneyCheckStatus;
    checks: StageCompatibilityJourneyCheck[];
    artifacts: CompatibilityJourneyArtifactReference[];
  };
  browser: CompatibilityJourneyBrowserEvidence;
  nativeRegression: CompatibilityJourneyRegressionEvidence;
  claims: {
    allowed: string[];
    blocked: string[];
  };
};

export type StageCompatibilityJourneyResult = Omit<StageCompatibilityJourneyInput, "id"> & {
  schemaVersion: typeof STAGE_COMPATIBILITY_JOURNEY_SCHEMA;
  id: string;
  status: Exclude<CompatibilityJourneyCheckStatus, "not-run">;
  checksum: string;
  diagnostics: string[];
};

export type StageCompatibilityJourneyParseResult = {
  journey?: StageCompatibilityJourneyResult;
  errors: string[];
};

export function createStageCompatibilityJourney(input: StageCompatibilityJourneyInput): StageCompatibilityJourneyResult {
  const diagnostics = validateStageJourneyInput(input);
  const normalized = normalizeStageJourneyInput(input);
  const status = resolveStageJourneyStatus(normalized, diagnostics);
  const payload = {
    schemaVersion: STAGE_COMPATIBILITY_JOURNEY_SCHEMA,
    ...normalized,
    status,
    diagnostics,
  } satisfies Omit<StageCompatibilityJourneyResult, "checksum">;
  return deepFreeze({ ...payload, checksum: hashStableJson(payload) });
}

export function parseStageCompatibilityJourney(value: unknown): StageCompatibilityJourneyParseResult {
  if (!isRecord(value)) return { errors: ["stage compatibility journey root must be an object"] };
  if (value.schemaVersion !== STAGE_COMPATIBILITY_JOURNEY_SCHEMA) {
    return { errors: ["unsupported stage compatibility journey schema"] };
  }
  if (typeof value.checksum !== "string" || typeof value.status !== "string" || !Array.isArray(value.diagnostics)) {
    return { errors: ["stage compatibility journey result metadata is invalid"] };
  }

  try {
    const { schemaVersion: _schemaVersion, checksum, status, diagnostics, ...input } = value;
    const normalized = createStageCompatibilityJourney(input as unknown as StageCompatibilityJourneyInput);
    const errors: string[] = [];
    if (normalized.checksum !== checksum) errors.push("stage compatibility journey checksum mismatch");
    if (normalized.status !== status) errors.push("stage compatibility journey status mismatch");
    if (JSON.stringify(normalized.diagnostics) !== JSON.stringify(diagnostics)) {
      errors.push("stage compatibility journey diagnostics mismatch");
    }
    return errors.length > 0 ? { errors } : { journey: normalized, errors: [] };
  } catch (error) {
    return { errors: [`invalid stage compatibility journey payload: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

function normalizeStageJourneyInput(input: StageCompatibilityJourneyInput): StageCompatibilityJourneyInput {
  return {
    id: input.id.trim(),
    generatedAt: input.generatedAt.trim(),
    package: {
      ...input.package,
      id: input.package.id.trim(),
      name: input.package.name.trim(),
      license: input.package.license.trim(),
      licenseFile: input.package.licenseFile.trim(),
      provenance: input.package.provenance.trim(),
      entry: input.package.entry.trim(),
      packageDigest: input.package.packageDigest.trim(),
      files: uniqueSorted(input.package.files),
      expectedRoutes: uniqueSorted(input.package.expectedRoutes),
    },
    loader: {
      ...input.loader,
      sourceName: input.loader.sourceName.trim(),
      presentFiles: uniqueSorted(input.loader.presentFiles),
      report: normalizeStageReport(input.loader.report),
    },
    runtime: {
      ...input.runtime,
      checks: input.runtime.checks
        .map((check) => ({ ...check, id: check.id.trim(), detail: check.detail.trim() }))
        .sort((left, right) => left.id.localeCompare(right.id)),
      artifacts: input.runtime.artifacts
        .map((artifact) => ({ ...artifact, id: artifact.id.trim(), path: artifact.path.trim(), detail: artifact.detail.trim() }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    },
    browser: {
      ...input.browser,
      diagnosticsPath: input.browser.diagnosticsPath.trim(),
      viewports: input.browser.viewports
        .map((viewport) => ({ ...viewport, artifacts: uniqueSorted(viewport.artifacts), detail: viewport.detail.trim() }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    },
    nativeRegression: {
      ...input.nativeRegression,
      ...(input.nativeRegression.reportPath ? { reportPath: input.nativeRegression.reportPath.trim() } : {}),
      tests: { ...input.nativeRegression.tests },
      build: {
        ...input.nativeRegression.build,
        warnings: uniqueSorted(input.nativeRegression.build.warnings),
        ...(input.nativeRegression.build.artifact ? { artifact: input.nativeRegression.build.artifact.trim() } : {}),
      },
    },
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
  };
}

function normalizeStageReport(report: StageCompatibilityReport): StageCompatibilityReport {
  const normalized = structuredClone(report);
  normalized.unsupported = [...normalized.unsupported].sort((left, right) => `${left.format}:${left.feature}`.localeCompare(`${right.format}:${right.feature}`));
  normalized.warnings = uniqueSorted(normalized.warnings);
  normalized.errors = uniqueSorted(normalized.errors);
  normalized.backgrounds.layers = [...normalized.backgrounds.layers].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  normalized.backgrounds.controllers.items = [...normalized.backgrounds.controllers.items].sort((left, right) => `${left.group ?? ""}:${left.name ?? ""}`.localeCompare(`${right.group ?? ""}:${right.name ?? ""}`));
  normalized.backgrounds.controllers.unsupportedTypes = sortNumberRecord(normalized.backgrounds.controllers.unsupportedTypes);
  normalized.sff.formats = sortNumberRecord(normalized.sff.formats);
  normalized.sff.unsupportedFormats = sortNumberRecord(normalized.sff.unsupportedFormats);
  return normalized;
}

function validateStageJourneyInput(input: StageCompatibilityJourneyInput): string[] {
  const diagnostics: string[] = [];
  if (!input.id.trim()) diagnostics.push("journey id is empty");
  if (!input.generatedAt.trim()) diagnostics.push("generatedAt is empty");
  if (!input.package.id.trim()) diagnostics.push("package id is empty");
  if (!input.package.name.trim()) diagnostics.push("package name is empty");
  if (!input.package.license.trim()) diagnostics.push("package license is empty");
  if (!input.package.licenseFile.trim()) diagnostics.push("package license file is empty");
  if (!input.package.packageDigest.trim()) diagnostics.push("package digest is empty");
  if (!input.package.licenseVerified) diagnostics.push("package license was not verified");
  if (input.loader.status !== "passed" || !input.loader.loaded || !input.loader.report.loaded || !input.loader.report.files.def || !input.loader.report.files.sff) {
    diagnostics.push("stage loader evidence is not passed");
  }
  if (input.loader.report.errors.length > 0) diagnostics.push("stage compatibility report contains errors");
  if (input.runtime.status !== "passed") diagnostics.push("stage runtime evidence is not passed");
  if (input.runtime.checks.length === 0) diagnostics.push("stage runtime has no checks");
  if (input.runtime.checks.some((check) => check.status !== "passed")) diagnostics.push("stage runtime has a non-passed check");
  if (input.runtime.artifacts.length === 0) diagnostics.push("stage runtime has no artifact references");
  if (input.runtime.artifacts.some((artifact) => artifact.status !== "passed")) diagnostics.push("stage runtime has a non-passed artifact reference");
  if (input.browser.status !== "passed") diagnostics.push("browser evidence is not passed");
  if (input.browser.viewports.some((viewport) => viewport.status !== "passed")) diagnostics.push("browser has a non-passed viewport");
  if (input.nativeRegression.status !== "passed") diagnostics.push("native regression is not passed");
  if (input.nativeRegression.tests.status !== "passed") diagnostics.push("native tests are not passed");
  if (input.nativeRegression.typecheck !== "passed") diagnostics.push("typecheck is not passed");
  if (input.nativeRegression.boundaries !== "passed") diagnostics.push("boundary checks are not passed");
  if (input.nativeRegression.build.status !== "passed") diagnostics.push("build is not passed");
  if (input.claims.allowed.length === 0) diagnostics.push("allowed claim set is empty");
  if (input.claims.blocked.length === 0) diagnostics.push("blocked claim set is empty");
  return uniqueSorted(diagnostics);
}

function resolveStageJourneyStatus(input: StageCompatibilityJourneyInput, diagnostics: string[]): StageCompatibilityJourneyResult["status"] {
  const statuses = [
    input.loader.status,
    input.runtime.status,
    ...input.runtime.checks.map((check) => check.status),
    input.browser.status,
    ...input.browser.viewports.map((viewport) => viewport.status),
    input.nativeRegression.status,
    input.nativeRegression.tests.status,
    input.nativeRegression.typecheck,
    input.nativeRegression.boundaries,
    input.nativeRegression.build.status,
  ];
  if (diagnostics.length === 0 && statuses.every((status) => status === "passed")) return "passed";
  const hardFailure = statuses.includes("failed") || !input.package.licenseVerified || diagnostics.some((diagnostic) => diagnostic.includes("empty")) ||
    input.loader.report.errors.length > 0 || !input.loader.report.loaded || !input.loader.report.files.def || !input.loader.report.files.sff ||
    input.runtime.checks.length === 0 || input.runtime.checks.some((check) => check.status === "failed") ||
    input.runtime.artifacts.length === 0 || input.runtime.artifacts.some((artifact) => artifact.status === "failed");
  if (hardFailure) return "failed";
  if (statuses.some((status) => status !== "passed")) return "partial";
  return "failed";
}

function sortNumberRecord(values: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(values).sort(([left], [right]) => left.localeCompare(right)));
}

function uniqueSorted(values: string[]): string[] {
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

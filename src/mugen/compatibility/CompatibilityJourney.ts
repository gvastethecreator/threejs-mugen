import type { UnsupportedFeature } from "./UnsupportedFeatureTracker";

export const COMPATIBILITY_JOURNEY_SCHEMA = "mugen-web-sandbox/compatibility-journey/v1" as const;

export type CompatibilityJourneyCheckStatus = "passed" | "failed" | "partial" | "not-run";

export type CompatibilityJourneyArtifactReference = {
  id: string;
  status: CompatibilityJourneyCheckStatus;
  path: string;
  checksum?: string;
  finalChecksum?: string;
  frameCount?: number;
  detail: string;
};

export type CompatibilityJourneyPackageEvidence = {
  id: string;
  name: string;
  license: string;
  licenseFile: string;
  provenance: string;
  entry: string;
  packageDigest: string;
  files: string[];
  expectedRoutes: string[];
  licenseVerified: boolean;
};

export type CompatibilityJourneyLoaderEvidence = {
  status: CompatibilityJourneyCheckStatus;
  sourceName: string;
  loaded: boolean;
  presentFiles: string[];
  compatibility: {
    loaded: boolean;
    parsedStates: number;
    runtimeRoutableStates: number;
    unsupported: UnsupportedFeature[];
    warnings: string[];
    errors: string[];
  };
};

export type CompatibilityJourneyRuntimeEvidence = {
  status: CompatibilityJourneyCheckStatus;
  traceQa: {
    status: CompatibilityJourneyCheckStatus;
    totalArtifacts: number;
    requiredArtifacts: number;
    passedArtifacts: number;
    failedArtifacts: number;
    diagnosticsPath: string;
  };
  artifacts: CompatibilityJourneyArtifactReference[];
};

export type CompatibilityJourneyBrowserEvidence = {
  status: CompatibilityJourneyCheckStatus;
  diagnosticsPath: string;
  viewports: Array<{
    id: "desktop" | "mobile";
    status: CompatibilityJourneyCheckStatus;
    artifacts: string[];
    detail: string;
  }>;
};

export type CompatibilityJourneyRegressionEvidence = {
  status: CompatibilityJourneyCheckStatus;
  tests: {
    status: CompatibilityJourneyCheckStatus;
    files: number;
    assertions: number;
  };
  typecheck: CompatibilityJourneyCheckStatus;
  boundaries: CompatibilityJourneyCheckStatus;
  build: {
    status: CompatibilityJourneyCheckStatus;
    artifact?: string;
    warnings: string[];
  };
};

export type CompatibilityJourneyInput = {
  id: string;
  generatedAt: string;
  package: CompatibilityJourneyPackageEvidence;
  loader: CompatibilityJourneyLoaderEvidence;
  runtime: CompatibilityJourneyRuntimeEvidence;
  browser: CompatibilityJourneyBrowserEvidence;
  nativeRegression: CompatibilityJourneyRegressionEvidence;
  claims: {
    allowed: string[];
    blocked: string[];
  };
};

export type CompatibilityJourneyResult = Omit<CompatibilityJourneyInput, "id"> & {
  schemaVersion: typeof COMPATIBILITY_JOURNEY_SCHEMA;
  id: string;
  status: Exclude<CompatibilityJourneyCheckStatus, "not-run">;
  checksum: string;
  diagnostics: string[];
};

export type CompatibilityJourneyParseResult = {
  journey?: CompatibilityJourneyResult;
  errors: string[];
};

export function createCompatibilityJourney(input: CompatibilityJourneyInput): CompatibilityJourneyResult {
  const diagnostics = validateJourneyInput(input);
  const normalized = normalizeJourneyInput(input);
  const status = resolveJourneyStatus(normalized, diagnostics);
  const payload = {
    schemaVersion: COMPATIBILITY_JOURNEY_SCHEMA,
    ...normalized,
    status,
    diagnostics,
  } satisfies Omit<CompatibilityJourneyResult, "checksum">;
  const result: CompatibilityJourneyResult = {
    ...payload,
    checksum: hashStableJson(payload),
  };
  return deepFreeze(result);
}

export function parseCompatibilityJourney(value: unknown): CompatibilityJourneyParseResult {
  if (!isRecord(value)) return { errors: ["compatibility journey root must be an object"] };
  if (value.schemaVersion !== COMPATIBILITY_JOURNEY_SCHEMA) {
    return { errors: ["unsupported compatibility journey schema"] };
  }
  if (typeof value.checksum !== "string" || typeof value.status !== "string" || !Array.isArray(value.diagnostics)) {
    return { errors: ["compatibility journey result metadata is invalid"] };
  }

  try {
    const { schemaVersion: _schemaVersion, checksum, status, diagnostics, ...input } = value;
    const normalized = createCompatibilityJourney(input as unknown as CompatibilityJourneyInput);
    const errors: string[] = [];
    if (normalized.checksum !== checksum) errors.push("compatibility journey checksum mismatch");
    if (normalized.status !== status) errors.push("compatibility journey status mismatch");
    if (JSON.stringify(normalized.diagnostics) !== JSON.stringify(diagnostics)) errors.push("compatibility journey diagnostics mismatch");
    return errors.length > 0 ? { errors } : { journey: normalized, errors: [] };
  } catch (error) {
    return { errors: [`invalid compatibility journey payload: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

function normalizeJourneyInput(input: CompatibilityJourneyInput): CompatibilityJourneyInput {
  return {
    id: input.id.trim(),
    generatedAt: input.generatedAt,
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
      compatibility: {
        ...input.loader.compatibility,
        unsupported: [...input.loader.compatibility.unsupported]
          .map((item) => ({ ...item }))
          .sort((left, right) => `${left.format}:${left.feature}`.localeCompare(`${right.format}:${right.feature}`)),
        warnings: uniqueSorted(input.loader.compatibility.warnings),
        errors: uniqueSorted(input.loader.compatibility.errors),
      },
    },
    runtime: {
      ...input.runtime,
      traceQa: { ...input.runtime.traceQa },
      artifacts: [...input.runtime.artifacts]
        .map((artifact) => ({ ...artifact }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    },
    browser: {
      ...input.browser,
      diagnosticsPath: input.browser.diagnosticsPath.trim(),
      viewports: [...input.browser.viewports]
        .map((viewport) => ({ ...viewport, artifacts: uniqueSorted(viewport.artifacts) }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    },
    nativeRegression: {
      ...input.nativeRegression,
      tests: { ...input.nativeRegression.tests },
      build: {
        ...input.nativeRegression.build,
        warnings: uniqueSorted(input.nativeRegression.build.warnings),
      },
    },
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
  };
}

function validateJourneyInput(input: CompatibilityJourneyInput): string[] {
  const diagnostics: string[] = [];
  if (!input.id.trim()) diagnostics.push("journey id is empty");
  if (!input.generatedAt.trim()) diagnostics.push("generatedAt is empty");
  if (!input.package.id.trim()) diagnostics.push("package id is empty");
  if (!input.package.name.trim()) diagnostics.push("package name is empty");
  if (!input.package.license.trim()) diagnostics.push("package license is empty");
  if (!input.package.licenseFile.trim()) diagnostics.push("package license file is empty");
  if (!input.package.packageDigest.trim()) diagnostics.push("package digest is empty");
  if (!input.package.licenseVerified) diagnostics.push("package license was not verified");
  if (input.loader.status !== "passed" || !input.loader.loaded || !input.loader.compatibility.loaded) {
    diagnostics.push("loader evidence is not passed");
  }
  if (input.loader.compatibility.errors.length > 0) diagnostics.push("loader compatibility contains errors");
  if (input.runtime.status !== "passed" || input.runtime.traceQa.status !== "passed" || input.runtime.traceQa.failedArtifacts > 0) {
    diagnostics.push("runtime trace evidence contains failures");
  }
  if (input.runtime.artifacts.length === 0) diagnostics.push("runtime has no artifact references");
  if (input.runtime.artifacts.some((artifact) => artifact.status !== "passed")) diagnostics.push("runtime has a non-passed artifact reference");
  if (input.runtime.traceQa.passedArtifacts !== input.runtime.traceQa.totalArtifacts) diagnostics.push("runtime trace counts are not fully passed");
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

function resolveJourneyStatus(input: CompatibilityJourneyInput, diagnostics: string[]): CompatibilityJourneyResult["status"] {
  const statuses = [
    input.loader.status,
    input.runtime.status,
    input.runtime.traceQa.status,
    input.browser.status,
    ...input.browser.viewports.map((viewport) => viewport.status),
    input.nativeRegression.status,
    input.nativeRegression.tests.status,
    input.nativeRegression.typecheck,
    input.nativeRegression.boundaries,
    input.nativeRegression.build.status,
  ];
  if (diagnostics.length === 0 && statuses.every((status) => status === "passed")) return "passed";
  const hardFailure =
    statuses.includes("failed") ||
    !input.package.licenseVerified ||
    diagnostics.some((diagnostic) => diagnostic.includes("empty")) ||
    input.loader.compatibility.errors.length > 0 ||
    !input.loader.loaded ||
    !input.loader.compatibility.loaded ||
    input.runtime.traceQa.failedArtifacts > 0 ||
    input.runtime.artifacts.length === 0 ||
    input.runtime.artifacts.some((artifact) => artifact.status === "failed") ||
    input.runtime.traceQa.passedArtifacts !== input.runtime.traceQa.totalArtifacts;
  if (hardFailure) return "failed";
  if (statuses.some((status) => status !== "passed")) return "partial";
  return "failed";
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

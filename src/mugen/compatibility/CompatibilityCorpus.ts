import type { CompatibilityJourneyResult } from "./CompatibilityJourney";

export const COMPATIBILITY_CORPUS_SCHEMA = "mugen-web-sandbox/compatibility-corpus/v0" as const;

export type CompatibilityCorpusAvailability = "required-legal" | "portable-legal" | "optional-private";
export type CompatibilityCorpusEntryStatus = "passed" | "partial" | "failed" | "unavailable";
export type CompatibilityCorpusStatus = "passed" | "partial" | "failed";

export type CompatibilityCorpusEntryInput = {
  id: string;
  availability: CompatibilityCorpusAvailability;
  journey?: CompatibilityJourneyResult;
  evidenceIds?: readonly string[];
  unavailableReason?: string;
};

export type CompatibilityCorpusInput = {
  generatedAt: string;
  entries: readonly CompatibilityCorpusEntryInput[];
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type CompatibilityCorpusEntry = {
  id: string;
  availability: CompatibilityCorpusAvailability;
  status: CompatibilityCorpusEntryStatus;
  journeyId?: string;
  package?: {
    id: string;
    name: string;
    licenseSpdx: string;
    licenseFile: string;
    licenseVerified: boolean;
    packageDigest: string;
  };
  expectedRoutes: string[];
  evidenceIds: string[];
  unsupportedFeatures: string[];
  unavailableReason?: string;
};

export type CompatibilityCorpusSummary = {
  entryCount: number;
  requiredCount: number;
  portableCount: number;
  optionalCount: number;
  passedCount: number;
  partialCount: number;
  failedCount: number;
  unavailableOptionalCount: number;
  packageIds: string[];
  routeIds: string[];
  unsupportedFeatureIds: string[];
};

export type CompatibilityCorpusResult = Omit<CompatibilityCorpusInput, "entries" | "claims"> & {
  schemaVersion: typeof COMPATIBILITY_CORPUS_SCHEMA;
  status: CompatibilityCorpusStatus;
  entries: CompatibilityCorpusEntry[];
  summary: CompatibilityCorpusSummary;
  claims: {
    allowed: string[];
    blocked: string[];
  };
  diagnostics: string[];
  checksum: string;
};

export type CompatibilityCorpusParseResult = {
  corpus?: CompatibilityCorpusResult;
  errors: string[];
};

export function createCompatibilityCorpus(input: CompatibilityCorpusInput): CompatibilityCorpusResult {
  const diagnostics = validateCorpusInput(input);
  const entries = input.entries.map(normalizeEntry).sort((left, right) => left.id.localeCompare(right.id));
  const summary = summarizeEntries(entries);
  const status = resolveCorpusStatus(entries, diagnostics);
  const payload = {
    schemaVersion: COMPATIBILITY_CORPUS_SCHEMA,
    generatedAt: input.generatedAt.trim(),
    status,
    entries,
    summary,
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    diagnostics,
  } satisfies Omit<CompatibilityCorpusResult, "checksum">;
  return deepFreeze({ ...payload, checksum: hashStableJson(payload) });
}

export function parseCompatibilityCorpus(value: unknown): CompatibilityCorpusParseResult {
  if (!isRecord(value)) return { errors: ["compatibility corpus root must be an object"] };
  if (value.schemaVersion !== COMPATIBILITY_CORPUS_SCHEMA) {
    return { errors: ["unsupported compatibility corpus schema"] };
  }
  if (typeof value.checksum !== "string" || !isCorpusResultPayload(value)) {
    return { errors: ["compatibility corpus result metadata is invalid"] };
  }

  try {
    const { checksum, ...payload } = value;
    const errors: string[] = [];
    if (hashStableJson(payload) !== checksum) errors.push("compatibility corpus checksum mismatch");
    if (resolveCorpusStatus(payload.entries, payload.diagnostics) !== payload.status) {
      errors.push("compatibility corpus status mismatch");
    }
    if (stableStringify(summarizeEntries(payload.entries)) !== stableStringify(payload.summary)) {
      errors.push("compatibility corpus summary mismatch");
    }
    const normalizedClaims = {
      allowed: uniqueSorted(payload.claims.allowed),
      blocked: uniqueSorted(payload.claims.blocked),
    };
    if (stableStringify(normalizedClaims) !== stableStringify(payload.claims)) {
      errors.push("compatibility corpus claims are not normalized");
    }
    if (!payload.entries.every((entry, index, entries) => index === 0 || entries[index - 1].id.localeCompare(entry.id) <= 0)) {
      errors.push("compatibility corpus entries are not sorted");
    }
    if (payload.diagnostics.some((diagnostic, index, diagnostics) => index > 0 && diagnostics[index - 1].localeCompare(diagnostic) > 0)) {
      errors.push("compatibility corpus diagnostics mismatch");
    }
    return errors.length > 0 ? { errors } : { corpus: deepFreeze(value), errors: [] };
  } catch (error) {
    return { errors: [`invalid compatibility corpus payload: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

function normalizeEntry(input: CompatibilityCorpusEntryInput): CompatibilityCorpusEntry {
  const journey = input.journey;
  const evidenceIds = uniqueSorted([
    ...(input.evidenceIds ?? []),
    ...(journey?.runtime.artifacts.map((artifact) => artifact.id) ?? []),
    ...(journey ? [`browser:${journey.id}`, `native:${journey.id}`] : []),
  ]);
  return {
    id: input.id.trim(),
    availability: input.availability,
    status: journey?.status ?? "unavailable",
    ...(journey ? { journeyId: journey.id } : {}),
    ...(journey
      ? {
          package: {
            id: journey.package.id,
            name: journey.package.name,
            licenseSpdx: journey.package.license,
            licenseFile: journey.package.licenseFile,
            licenseVerified: journey.package.licenseVerified,
            packageDigest: journey.package.packageDigest,
          },
        }
      : {}),
    expectedRoutes: uniqueSorted(journey?.package.expectedRoutes ?? []),
    evidenceIds,
    unsupportedFeatures: uniqueSorted(
      journey?.loader.compatibility.unsupported.map((item) => `${item.format}:${item.feature}`) ?? [],
    ),
    ...(input.unavailableReason?.trim() ? { unavailableReason: input.unavailableReason.trim() } : {}),
  };
}

function validateCorpusInput(input: CompatibilityCorpusInput): string[] {
  const diagnostics: string[] = [];
  if (!input.generatedAt.trim()) diagnostics.push("generatedAt is empty");
  if (input.entries.length === 0) diagnostics.push("corpus has no entries");
  if (!input.entries.some((entry) => entry.availability !== "optional-private")) {
    diagnostics.push("corpus has no required or portable entry");
  }
  const entryIds = new Set<string>();
  const packageIds = new Set<string>();
  for (const entry of input.entries) {
    const id = entry.id.trim();
    if (!id) diagnostics.push("corpus entry id is empty");
    if (entryIds.has(id)) diagnostics.push(`duplicate corpus entry:${id}`);
    entryIds.add(id);
    if (entry.journey) {
      const packageId = entry.journey.package.id.trim();
      if (packageIds.has(packageId)) diagnostics.push(`duplicate corpus package:${packageId}`);
      packageIds.add(packageId);
      if (!entry.journey.package.licenseVerified) diagnostics.push(`unverified corpus license:${id}`);
    } else if (entry.availability === "optional-private") {
      if (!entry.unavailableReason?.trim()) diagnostics.push(`optional corpus entry has no reason:${id}`);
    } else {
      diagnostics.push(`required corpus entry has no journey:${id}`);
    }
  }
  if (input.claims.allowed.length === 0) diagnostics.push("allowed corpus claim set is empty");
  if (input.claims.blocked.length === 0) diagnostics.push("blocked corpus claim set is empty");
  return uniqueSorted(diagnostics);
}

function resolveCorpusStatus(entries: readonly CompatibilityCorpusEntry[], diagnostics: readonly string[]): CompatibilityCorpusStatus {
  if (diagnostics.length > 0) return "failed";
  const required = entries.filter((entry) => entry.availability !== "optional-private");
  if (required.some((entry) => entry.status !== "passed")) return "failed";
  if (entries.some((entry) => entry.status === "failed" || entry.status === "partial")) return "partial";
  return "passed";
}

function summarizeEntries(entries: readonly CompatibilityCorpusEntry[]): CompatibilityCorpusSummary {
  return {
    entryCount: entries.length,
    requiredCount: entries.filter((entry) => entry.availability === "required-legal").length,
    portableCount: entries.filter((entry) => entry.availability === "portable-legal").length,
    optionalCount: entries.filter((entry) => entry.availability === "optional-private").length,
    passedCount: entries.filter((entry) => entry.status === "passed").length,
    partialCount: entries.filter((entry) => entry.status === "partial").length,
    failedCount: entries.filter((entry) => entry.status === "failed").length,
    unavailableOptionalCount: entries.filter(
      (entry) => entry.availability === "optional-private" && entry.status === "unavailable",
    ).length,
    packageIds: uniqueSorted(entries.flatMap((entry) => entry.package?.id ?? [])),
    routeIds: uniqueSorted(entries.flatMap((entry) => entry.expectedRoutes)),
    unsupportedFeatureIds: uniqueSorted(entries.flatMap((entry) => entry.unsupportedFeatures)),
  };
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

function isCorpusResultPayload(value: Record<string, unknown>): value is CompatibilityCorpusResult {
  if (
    typeof value.generatedAt !== "string" ||
    !isCorpusStatus(value.status) ||
    !Array.isArray(value.entries) ||
    !value.entries.every(isCorpusEntry) ||
    !isRecord(value.summary) ||
    !isRecord(value.claims) ||
    !Array.isArray(value.diagnostics) ||
    !value.diagnostics.every((diagnostic) => typeof diagnostic === "string")
  ) {
    return false;
  }
  return (
    isCorpusSummary(value.summary) &&
    Array.isArray(value.claims.allowed) &&
    value.claims.allowed.every((claim) => typeof claim === "string") &&
    Array.isArray(value.claims.blocked) &&
    value.claims.blocked.every((claim) => typeof claim === "string")
  );
}

function isCorpusEntry(value: unknown): value is CompatibilityCorpusEntry {
  if (!isRecord(value) || typeof value.id !== "string" || !isCorpusAvailability(value.availability) || !isCorpusEntryStatus(value.status)) {
    return false;
  }
  if (!Array.isArray(value.expectedRoutes) || !value.expectedRoutes.every((route) => typeof route === "string")) return false;
  if (!Array.isArray(value.evidenceIds) || !value.evidenceIds.every((evidenceId) => typeof evidenceId === "string")) return false;
  if (!Array.isArray(value.unsupportedFeatures) || !value.unsupportedFeatures.every((feature) => typeof feature === "string")) return false;
  if (value.journeyId !== undefined && typeof value.journeyId !== "string") return false;
  if (value.unavailableReason !== undefined && typeof value.unavailableReason !== "string") return false;
  return value.package === undefined || isCorpusPackage(value.package);
}

function isCorpusPackage(value: unknown): value is NonNullable<CompatibilityCorpusEntry["package"]> {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.licenseSpdx === "string" &&
    typeof value.licenseFile === "string" &&
    typeof value.licenseVerified === "boolean" &&
    typeof value.packageDigest === "string"
  );
}

function isCorpusSummary(value: Record<string, unknown>): value is CompatibilityCorpusSummary {
  return (
    Number.isInteger(value.entryCount) &&
    Number.isInteger(value.requiredCount) &&
    Number.isInteger(value.portableCount) &&
    Number.isInteger(value.optionalCount) &&
    Number.isInteger(value.passedCount) &&
    Number.isInteger(value.partialCount) &&
    Number.isInteger(value.failedCount) &&
    Number.isInteger(value.unavailableOptionalCount) &&
    [value.packageIds, value.routeIds, value.unsupportedFeatureIds].every(
      (items) => Array.isArray(items) && items.every((item) => typeof item === "string"),
    )
  );
}

function isCorpusAvailability(value: unknown): value is CompatibilityCorpusAvailability {
  return value === "required-legal" || value === "portable-legal" || value === "optional-private";
}

function isCorpusEntryStatus(value: unknown): value is CompatibilityCorpusEntryStatus {
  return value === "passed" || value === "partial" || value === "failed" || value === "unavailable";
}

function isCorpusStatus(value: unknown): value is CompatibilityCorpusStatus {
  return value === "passed" || value === "partial" || value === "failed";
}

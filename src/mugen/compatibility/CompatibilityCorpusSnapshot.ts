import {
  COMPATIBILITY_CORPUS_SCHEMA,
  type CompatibilityCorpusAvailability,
  type CompatibilityCorpusJourney,
  type CompatibilityCorpusResult,
} from "./CompatibilityCorpus";
import { STAGE_COMPATIBILITY_JOURNEY_SCHEMA } from "./StageCompatibilityJourney";

export const COMPATIBILITY_CORPUS_SNAPSHOT_SCHEMA = "mugen-web-sandbox/compatibility-corpus-snapshot/v1.1" as const;

export type CompatibilityCorpusSnapshotAvailability = CompatibilityCorpusAvailability;
export type CompatibilityCorpusSnapshotEntryStatus = "passed" | "partial" | "failed" | "unavailable";
export type CompatibilityCorpusSnapshotStatus = "passed" | "partial" | "failed";
export type CompatibilityCorpusSnapshotArtifactStatus = CompatibilityCorpusSnapshotEntryStatus;

export type CompatibilityCorpusSnapshotSource = {
  corpusSchema: typeof COMPATIBILITY_CORPUS_SCHEMA;
  sourceRevision: string;
  tool: {
    id: string;
    version: string;
  };
  ruleset: {
    id: string;
    version: string;
  };
  upstream?: {
    project: string;
    revision: string;
  };
};

export type CompatibilityCorpusSnapshotFreshness = {
  policy: "rebuild-and-verify";
  maxAgeHours: number;
  expectedSourceRevision: string;
  requiredArtifactIds: string[];
};

export type CompatibilityCorpusSnapshotArtifact = {
  id: string;
  status: CompatibilityCorpusSnapshotArtifactStatus;
  path?: string;
  checksum?: string;
  finalChecksum?: string;
  contentDigest?: string;
  detail?: string;
};

export type CompatibilityCorpusSnapshotPackage = {
  id: string;
  name: string;
  provenance: string;
  entry: string;
  licenseSpdx: string;
  licenseFile: string;
  licenseVerified: boolean;
  packageDigest: string;
};

export type CompatibilityCorpusSnapshotEntryProjection = {
  status: CompatibilityCorpusSnapshotEntryStatus;
  journey: {
    id: string;
    schemaVersion: CompatibilityCorpusJourney["schemaVersion"];
  };
  package?: CompatibilityCorpusSnapshotPackage;
  routeIds: readonly string[];
  unsupportedFeatureIds: readonly string[];
  artifactRefs: readonly CompatibilityCorpusSnapshotArtifact[];
  evidenceIds: readonly string[];
};

export type CompatibilityCorpusSnapshotEntryInput = {
  id: string;
  availability: CompatibilityCorpusSnapshotAvailability;
  journey?: CompatibilityCorpusJourney;
  projection?: CompatibilityCorpusSnapshotEntryProjection;
  evidenceIds?: readonly string[];
  artifactRefs?: readonly CompatibilityCorpusSnapshotArtifact[];
  unavailableReason?: string;
};

export type CompatibilityCorpusSnapshotInput = {
  snapshotId: string;
  observedAt: string;
  referenceAt: string;
  source: CompatibilityCorpusSnapshotSource;
  freshness: CompatibilityCorpusSnapshotFreshness;
  entries: readonly CompatibilityCorpusSnapshotEntryInput[];
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type CompatibilityCorpusSnapshotEntry = {
  id: string;
  availability: CompatibilityCorpusSnapshotAvailability;
  status: CompatibilityCorpusSnapshotEntryStatus;
  journey?: {
    id: string;
    schemaVersion: CompatibilityCorpusJourney["schemaVersion"];
  };
  package?: CompatibilityCorpusSnapshotPackage;
  routeIds: string[];
  unsupportedFeatureIds: string[];
  artifactRefs: CompatibilityCorpusSnapshotArtifact[];
  evidenceIds: string[];
  unavailableReason?: string;
};

export type CompatibilityCorpusSnapshotSummary = {
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
  artifactIds: string[];
  artifactCount: number;
};

export type CompatibilityCorpusSnapshotResult = {
  schemaVersion: typeof COMPATIBILITY_CORPUS_SNAPSHOT_SCHEMA;
  snapshotId: string;
  observedAt: string;
  referenceAt: string;
  source: CompatibilityCorpusSnapshotSource;
  freshness: CompatibilityCorpusSnapshotFreshness;
  status: CompatibilityCorpusSnapshotStatus;
  entries: CompatibilityCorpusSnapshotEntry[];
  summary: CompatibilityCorpusSnapshotSummary;
  claims: {
    allowed: string[];
    blocked: string[];
  };
  diagnostics: string[];
  semanticDigest: string;
  checksum: string;
};

export type CompatibilityCorpusSnapshotParseResult = {
  snapshot?: CompatibilityCorpusSnapshotResult;
  errors: string[];
};

export type CompatibilityCorpusSnapshotMaterializerInput = {
  corpus: CompatibilityCorpusResult;
  observedAt: string;
  referenceAt: string;
  source: CompatibilityCorpusSnapshotSource;
  freshness: CompatibilityCorpusSnapshotFreshness;
  packageCatalog: Readonly<Record<string, { provenance: string; entry: string }>>;
  artifactCatalog: Readonly<Record<string, CompatibilityCorpusSnapshotArtifact>>;
  artifactProbe: CompatibilityCorpusSnapshotArtifactProbe;
};

export type CompatibilityCorpusSnapshotArtifactProbeResult = {
  exists: boolean;
  contentDigest?: string;
};

export type CompatibilityCorpusSnapshotArtifactProbe = (
  path: string,
) => CompatibilityCorpusSnapshotArtifactProbeResult;

export function createCompatibilityCorpusSnapshot(input: CompatibilityCorpusSnapshotInput): CompatibilityCorpusSnapshotResult {
  const entries = input.entries.map(normalizeEntry).sort((left, right) => left.id.localeCompare(right.id));
  const diagnostics = validateSnapshotInput(input, entries);
  const summary = summarizeEntries(entries);
  const status = resolveSnapshotStatus(entries, diagnostics);
  const semanticPayload = {
    schemaVersion: COMPATIBILITY_CORPUS_SNAPSHOT_SCHEMA,
    snapshotId: input.snapshotId.trim(),
    source: normalizeSource(input.source),
    freshness: normalizeFreshness(input.freshness),
    status,
    entries,
    summary,
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    diagnostics,
  } satisfies Omit<CompatibilityCorpusSnapshotResult, "observedAt" | "referenceAt" | "semanticDigest" | "checksum">;
  const semanticDigest = hashStableJson(semanticPayload);
  const payload = {
    ...semanticPayload,
    observedAt: input.observedAt.trim(),
    referenceAt: input.referenceAt.trim(),
    semanticDigest,
  } satisfies Omit<CompatibilityCorpusSnapshotResult, "checksum">;
  return deepFreeze({ ...payload, checksum: hashStableJson(payload) });
}

export function parseCompatibilityCorpusSnapshot(value: unknown): CompatibilityCorpusSnapshotParseResult {
  if (!isRecord(value)) return { errors: ["compatibility corpus snapshot root must be an object"] };
  if (value.schemaVersion !== COMPATIBILITY_CORPUS_SNAPSHOT_SCHEMA) {
    return { errors: ["unsupported compatibility corpus snapshot schema"] };
  }
  if (typeof value.checksum !== "string" || typeof value.semanticDigest !== "string" || !isSnapshotPayload(value)) {
    return { errors: ["compatibility corpus snapshot metadata is invalid"] };
  }

  const { checksum, semanticDigest, observedAt, referenceAt, ...semanticPayload } = value;
  const errors: string[] = [];
  if (hashStableJson(semanticPayload) !== semanticDigest) errors.push("compatibility corpus snapshot semantic digest mismatch");
  if (hashStableJson({ ...semanticPayload, observedAt, referenceAt, semanticDigest }) !== checksum) {
    errors.push("compatibility corpus snapshot checksum mismatch");
  }
  if (!isValidTimestamp(observedAt)) errors.push("compatibility corpus snapshot observedAt is invalid");
  if (!isValidTimestamp(referenceAt)) errors.push("compatibility corpus snapshot referenceAt is invalid");
  errors.push(...validateSnapshotPayload(value));
  return errors.length > 0 ? { errors: uniqueSorted(errors) } : { snapshot: deepFreeze(value), errors: [] };
}

export function materializeCompatibilityCorpusSnapshot(
  input: CompatibilityCorpusSnapshotMaterializerInput,
): CompatibilityCorpusSnapshotResult {
  return createCompatibilityCorpusSnapshot({
    snapshotId: "compatibility-corpus-v1.1",
    observedAt: input.observedAt,
    referenceAt: input.referenceAt,
    source: input.source,
    freshness: input.freshness,
    entries: input.corpus.entries.map((entry) => {
      const packageCatalog = entry.package ? input.packageCatalog[entry.package.id] : undefined;
      const artifactRefs = entry.evidenceIds.map((artifactId) => materializeArtifact(
        artifactId,
        input.artifactCatalog[artifactId],
        input.artifactProbe,
      ));
      const projection = entry.journeyId && entry.journeySchema
        ? {
            status: entry.status,
            journey: { id: entry.journeyId, schemaVersion: entry.journeySchema },
            ...(entry.package
              ? {
                  package: {
                    id: entry.package.id,
                    name: entry.package.name,
                    provenance: packageCatalog?.provenance ?? "",
                    entry: packageCatalog?.entry ?? "",
                    licenseSpdx: entry.package.licenseSpdx,
                    licenseFile: entry.package.licenseFile,
                    licenseVerified: entry.package.licenseVerified,
                    packageDigest: entry.package.packageDigest,
                  },
                }
              : {}),
            routeIds: entry.expectedRoutes,
            unsupportedFeatureIds: entry.unsupportedFeatures,
            artifactRefs,
            evidenceIds: entry.evidenceIds,
          }
        : undefined;
      return {
        id: entry.id,
        availability: entry.availability,
        evidenceIds: entry.evidenceIds,
        ...(projection ? { projection } : {}),
        ...(entry.unavailableReason ? { unavailableReason: entry.unavailableReason } : {}),
      };
    }),
    claims: input.corpus.claims,
  });
}

function normalizeSource(source: CompatibilityCorpusSnapshotSource): CompatibilityCorpusSnapshotSource {
  return {
    corpusSchema: source.corpusSchema,
    sourceRevision: source.sourceRevision.trim(),
    tool: { id: source.tool.id.trim(), version: source.tool.version.trim() },
    ruleset: { id: source.ruleset.id.trim(), version: source.ruleset.version.trim() },
    ...(source.upstream
      ? { upstream: { project: source.upstream.project.trim(), revision: source.upstream.revision.trim() } }
      : {}),
  };
}

function normalizeFreshness(freshness: CompatibilityCorpusSnapshotFreshness): CompatibilityCorpusSnapshotFreshness {
  return {
    policy: freshness.policy,
    maxAgeHours: freshness.maxAgeHours,
    expectedSourceRevision: freshness.expectedSourceRevision.trim(),
    requiredArtifactIds: uniqueSorted(freshness.requiredArtifactIds),
  };
}

function materializeArtifact(
  artifactId: string,
  catalogArtifact: CompatibilityCorpusSnapshotArtifact | undefined,
  artifactProbe: CompatibilityCorpusSnapshotArtifactProbe,
): CompatibilityCorpusSnapshotArtifact {
  if (!catalogArtifact) return { id: artifactId, status: "unavailable", detail: "artifact catalog missing" };
  const artifact = normalizeArtifact(catalogArtifact);
  if (artifact.status !== "passed") return artifact;
  if (!artifact.path) return { ...artifact, status: "failed", detail: "artifact path missing" };

  let probe: CompatibilityCorpusSnapshotArtifactProbeResult;
  try {
    probe = artifactProbe(artifact.path);
  } catch {
    return { ...artifact, status: "failed", detail: "artifact probe failed" };
  }
  if (!probe.exists) return { ...artifact, status: "unavailable", detail: "artifact file missing" };
  if (!isContentDigest(probe.contentDigest)) {
    return { ...artifact, status: "failed", detail: "artifact content digest missing" };
  }
  if (artifact.contentDigest && artifact.contentDigest !== probe.contentDigest) {
    return { ...artifact, status: "failed", detail: "artifact content digest mismatch" };
  }
  return { ...artifact, contentDigest: probe.contentDigest };
}

function normalizeEntry(input: CompatibilityCorpusSnapshotEntryInput): CompatibilityCorpusSnapshotEntry {
  const journey = input.journey;
  const projection = input.projection;
  const artifacts = [
    ...(journey?.runtime.artifacts.map((artifact) => normalizeArtifact({
      id: artifact.id,
      status: normalizeArtifactStatus(artifact.status),
      path: artifact.path,
      checksum: artifact.checksum,
      finalChecksum: artifact.finalChecksum,
      detail: artifact.detail,
    })) ?? []),
    ...(journey
      ? [
          normalizeArtifact({
            id: `${journey.id}:browser:diagnostics`,
            status: normalizeArtifactStatus(journey.browser.status),
            path: journey.browser.diagnosticsPath,
            detail: "browser diagnostics",
          }),
          ...journey.browser.viewports.flatMap((viewport) =>
            viewport.artifacts.map((path) => normalizeArtifact({
              id: `${journey.id}:browser:${viewport.id}:${path}`,
              status: normalizeArtifactStatus(viewport.status),
              path,
              detail: `${viewport.id} browser capture`,
            })),
          ),
          ...(journey.nativeRegression.build.artifact
            ? [
                normalizeArtifact({
                  id: `${journey.id}:native:build`,
                  status: normalizeArtifactStatus(journey.nativeRegression.build.status),
                  path: journey.nativeRegression.build.artifact,
                  detail: "native build artifact",
                }),
              ]
            : []),
          ...(journey.nativeRegression.reportPath
            ? [
                normalizeArtifact({
                  id: `${journey.id}:native:report`,
                  status: normalizeArtifactStatus(journey.nativeRegression.status),
                  path: journey.nativeRegression.reportPath,
                  detail: "native regression report",
                }),
              ]
            : []),
        ]
      : []),
    ...(input.artifactRefs?.map(normalizeArtifact) ?? []),
    ...(projection?.artifactRefs.map(normalizeArtifact) ?? []),
  ];
  const unsupportedFeatureIds = journey
    ? journey.schemaVersion === STAGE_COMPATIBILITY_JOURNEY_SCHEMA
      ? uniqueSorted(journey.loader.report.unsupported.map((item) => `${item.format}:${item.feature}`))
      : uniqueSorted(journey.loader.compatibility.unsupported.map((item) => `${item.format}:${item.feature}`))
    : uniqueSorted(projection?.unsupportedFeatureIds ?? []);
  return {
    id: input.id.trim(),
    availability: input.availability,
    status: journey?.status ?? projection?.status ?? "unavailable",
    ...(journey
      ? { journey: { id: journey.id.trim(), schemaVersion: journey.schemaVersion } }
      : projection
        ? { journey: { id: projection.journey.id.trim(), schemaVersion: projection.journey.schemaVersion } }
        : {}),
    ...(journey
      ? {
          package: {
            id: journey.package.id.trim(),
            name: journey.package.name.trim(),
            provenance: journey.package.provenance.trim(),
            entry: journey.package.entry.trim(),
            licenseSpdx: journey.package.license.trim(),
            licenseFile: journey.package.licenseFile.trim(),
            licenseVerified: journey.package.licenseVerified,
            packageDigest: journey.package.packageDigest.trim(),
          },
        }
      : projection?.package ? { package: normalizePackage(projection.package) } : {}),
    routeIds: uniqueSorted(journey?.package.expectedRoutes ?? projection?.routeIds ?? []),
    unsupportedFeatureIds,
    artifactRefs: artifacts.sort((left, right) => left.id.localeCompare(right.id)),
    evidenceIds: uniqueSorted([
      ...(input.evidenceIds ?? []),
      ...(projection?.evidenceIds ?? []),
      ...artifacts.map((artifact) => artifact.id),
    ]),
    ...(input.unavailableReason?.trim() ? { unavailableReason: input.unavailableReason.trim() } : {}),
  };
}

function normalizePackage(value: CompatibilityCorpusSnapshotPackage): CompatibilityCorpusSnapshotPackage {
  return {
    id: value.id.trim(),
    name: value.name.trim(),
    provenance: value.provenance.trim(),
    entry: value.entry.trim(),
    licenseSpdx: value.licenseSpdx.trim(),
    licenseFile: value.licenseFile.trim(),
    licenseVerified: value.licenseVerified,
    packageDigest: value.packageDigest.trim(),
  };
}

function normalizeArtifact(artifact: CompatibilityCorpusSnapshotArtifact): CompatibilityCorpusSnapshotArtifact {
  return {
    id: artifact.id.trim(),
    status: artifact.status,
    ...(artifact.path?.trim() ? { path: artifact.path.trim() } : {}),
    ...(artifact.checksum?.trim() ? { checksum: artifact.checksum.trim() } : {}),
    ...(artifact.finalChecksum?.trim() ? { finalChecksum: artifact.finalChecksum.trim() } : {}),
    ...(artifact.contentDigest?.trim() ? { contentDigest: artifact.contentDigest.trim() } : {}),
    ...(artifact.detail?.trim() ? { detail: artifact.detail.trim() } : {}),
  };
}

export function verifyCompatibilityCorpusSnapshotArtifacts(
  snapshot: CompatibilityCorpusSnapshotResult,
  artifactProbe: CompatibilityCorpusSnapshotArtifactProbe,
): string[] {
  const errors: string[] = [];
  for (const artifact of snapshot.entries.flatMap((entry) => entry.artifactRefs)) {
    if (artifact.status !== "passed") continue;
    if (!artifact.path) {
      errors.push(`snapshot artifact path is missing:${artifact.id}`);
      continue;
    }
    let probe: CompatibilityCorpusSnapshotArtifactProbeResult;
    try {
      probe = artifactProbe(artifact.path);
    } catch {
      errors.push(`snapshot artifact probe failed:${artifact.id}`);
      continue;
    }
    if (!probe.exists) {
      errors.push(`snapshot artifact file is missing:${artifact.id}`);
      continue;
    }
    if (!isContentDigest(artifact.contentDigest) || !isContentDigest(probe.contentDigest)) {
      errors.push(`snapshot artifact content digest is missing:${artifact.id}`);
      continue;
    }
    if (artifact.contentDigest !== probe.contentDigest) {
      errors.push(`snapshot artifact content digest mismatch:${artifact.id}`);
    }
  }
  return uniqueSorted(errors);
}

function normalizeArtifactStatus(status: string): CompatibilityCorpusSnapshotArtifactStatus {
  return status === "not-run" ? "unavailable" : status as CompatibilityCorpusSnapshotArtifactStatus;
}

function validateSnapshotInput(
  input: CompatibilityCorpusSnapshotInput,
  entries: readonly CompatibilityCorpusSnapshotEntry[],
): string[] {
  const diagnostics = validateSnapshotPayloadFields({
    snapshotId: input.snapshotId.trim(),
    observedAt: input.observedAt.trim(),
    referenceAt: input.referenceAt.trim(),
    source: normalizeSource(input.source),
    freshness: normalizeFreshness(input.freshness),
    entries,
    claims: { allowed: uniqueSorted(input.claims.allowed), blocked: uniqueSorted(input.claims.blocked) },
  });
  const packageIds = new Set<string>();
  const entryIds = new Set<string>();
  const freshnessIds = new Set(normalizeFreshness(input.freshness).requiredArtifactIds);
  const artifactById = new Map<string, CompatibilityCorpusSnapshotArtifact>();
  for (const entry of entries) {
    if (entryIds.has(entry.id)) diagnostics.push(`duplicate snapshot entry:${entry.id}`);
    entryIds.add(entry.id);
    if (entry.package) {
      if (packageIds.has(entry.package.id)) diagnostics.push(`duplicate snapshot package:${entry.package.id}`);
      packageIds.add(entry.package.id);
    }
    if (entry.availability !== "optional-private" && !entry.journey) {
      diagnostics.push(`required snapshot entry has no journey:${entry.id}`);
    }
    if (entry.availability !== "optional-private" && entry.artifactRefs.length === 0) {
      diagnostics.push(`required snapshot entry has no artifact identity:${entry.id}`);
    }
    if (entry.availability !== "optional-private" && entry.artifactRefs.some((artifact) => artifact.status !== "passed")) {
      diagnostics.push(`required snapshot artifact is not passed:${entry.id}`);
    }
    if (entry.package && (!entry.package.id || !entry.package.name || !entry.package.provenance || !entry.package.entry || !entry.package.licenseSpdx || !entry.package.licenseFile || !entry.package.packageDigest)) {
      diagnostics.push(`snapshot package identity is incomplete:${entry.id}`);
    }
    const seenArtifactIds = new Set<string>();
    for (const artifact of entry.artifactRefs) {
      if (!artifact.id) diagnostics.push(`snapshot artifact id is empty:${entry.id}`);
      if (seenArtifactIds.has(artifact.id)) diagnostics.push(`duplicate snapshot artifact:${entry.id}:${artifact.id}`);
      seenArtifactIds.add(artifact.id);
      if (artifactById.has(artifact.id)) diagnostics.push(`duplicate snapshot artifact globally:${artifact.id}`);
      artifactById.set(artifact.id, artifact);
      if (!isSnapshotArtifactStatus(artifact.status)) diagnostics.push(`invalid snapshot artifact status:${entry.id}:${artifact.id}`);
    }
  }
  for (const artifactId of freshnessIds) {
    const artifact = artifactById.get(artifactId);
    if (!artifact) diagnostics.push(`freshness artifact is not indexed:${artifactId}`);
    else if (artifact.status !== "passed") diagnostics.push(`freshness artifact is not passed:${artifactId}`);
  }
  return uniqueSorted(diagnostics);
}

function validateSnapshotPayloadFields(value: {
  snapshotId: string;
  observedAt: string;
  referenceAt: string;
  source: CompatibilityCorpusSnapshotSource;
  freshness: CompatibilityCorpusSnapshotFreshness;
  entries: readonly CompatibilityCorpusSnapshotEntry[];
  claims: { allowed: readonly string[]; blocked: readonly string[] };
}): string[] {
  const diagnostics: string[] = [];
  if (!value.snapshotId) diagnostics.push("snapshot id is empty");
  if (!isValidTimestamp(value.observedAt)) diagnostics.push("compatibility corpus snapshot observedAt is invalid");
  if (!isValidTimestamp(value.referenceAt)) diagnostics.push("compatibility corpus snapshot referenceAt is invalid");
  if (isValidTimestamp(value.observedAt) && isValidTimestamp(value.referenceAt)) {
    const observedAt = Date.parse(value.observedAt);
    const referenceAt = Date.parse(value.referenceAt);
    if (observedAt > referenceAt) diagnostics.push("compatibility corpus snapshot observedAt is after referenceAt");
    if (Number.isInteger(value.freshness.maxAgeHours) && referenceAt - observedAt > value.freshness.maxAgeHours * 60 * 60 * 1000) {
      diagnostics.push("compatibility corpus snapshot exceeds freshness max age");
    }
  }
  if (value.source.corpusSchema !== COMPATIBILITY_CORPUS_SCHEMA) diagnostics.push("snapshot source corpus schema is unsupported");
  if (!value.source.sourceRevision) diagnostics.push("snapshot source revision is empty");
  if (!value.freshness.expectedSourceRevision) diagnostics.push("snapshot expected source revision is empty");
  if (value.source.sourceRevision !== value.freshness.expectedSourceRevision) {
    diagnostics.push("snapshot source revision does not match expected revision");
  }
  if (!value.source.tool.id || !value.source.tool.version) diagnostics.push("snapshot tool identity is incomplete");
  if (!value.source.ruleset.id || !value.source.ruleset.version) diagnostics.push("snapshot ruleset identity is incomplete");
  if (value.source.upstream && (!value.source.upstream.project || !value.source.upstream.revision)) {
    diagnostics.push("snapshot upstream identity is incomplete");
  }
  if (value.freshness.policy !== "rebuild-and-verify") diagnostics.push("snapshot freshness policy is unsupported");
  if (!Number.isInteger(value.freshness.maxAgeHours) || value.freshness.maxAgeHours <= 0) {
    diagnostics.push("snapshot freshness maxAgeHours is invalid");
  }
  if (value.freshness.requiredArtifactIds.length === 0) diagnostics.push("snapshot freshness has no required artifacts");
  if (value.entries.length === 0) diagnostics.push("snapshot has no entries");
  if (!value.entries.some((entry) => entry.availability !== "optional-private")) {
    diagnostics.push("snapshot has no required or portable entry");
  }
  if (value.claims.allowed.length === 0) diagnostics.push("snapshot allowed claim set is empty");
  if (value.claims.blocked.length === 0) diagnostics.push("snapshot blocked claim set is empty");
  for (const entry of value.entries) {
    if (entry.package && !entry.package.licenseVerified) diagnostics.push(`unverified snapshot license:${entry.id}`);
    if (entry.availability === "optional-private" && !entry.journey && !entry.unavailableReason) {
      diagnostics.push(`optional snapshot entry has no reason:${entry.id}`);
    }
  }
  return diagnostics;
}

function validateSnapshotPayload(value: CompatibilityCorpusSnapshotResult): string[] {
  const errors = validateSnapshotPayloadFields(value);
  const packageIds = new Set<string>();
  const artifactIds = new Set<string>();
  if (stableStringify(summarizeEntries(value.entries)) !== stableStringify(value.summary)) {
    errors.push("compatibility corpus snapshot summary mismatch");
  }
  if (resolveSnapshotStatus(value.entries, value.diagnostics) !== value.status) {
    errors.push("compatibility corpus snapshot status mismatch");
  }
  if (!isSortedUnique(value.entries.map((entry) => entry.id))) errors.push("compatibility corpus snapshot entries are not sorted");
  if (!isSortedUnique(value.freshness.requiredArtifactIds)) errors.push("compatibility corpus snapshot freshness ids are not normalized");
  if (!isSortedUnique(value.claims.allowed) || !isSortedUnique(value.claims.blocked)) {
    errors.push("compatibility corpus snapshot claims are not normalized");
  }
  if (!isSortedUnique(value.diagnostics)) errors.push("compatibility corpus snapshot diagnostics are not sorted");
  for (const entry of value.entries) {
    if (entry.availability !== "optional-private" && !entry.journey) {
      errors.push(`required snapshot entry has no journey:${entry.id}`);
    }
    if (entry.availability !== "optional-private" && entry.artifactRefs.length === 0) {
      errors.push(`required snapshot entry has no artifact identity:${entry.id}`);
    }
    if (entry.availability !== "optional-private" && entry.artifactRefs.some((artifact) => artifact.status !== "passed")) {
      errors.push(`required snapshot artifact is not passed:${entry.id}`);
    }
    if (entry.package) {
      if (packageIds.has(entry.package.id)) errors.push(`duplicate snapshot package:${entry.package.id}`);
      packageIds.add(entry.package.id);
      if (!entry.package.id || !entry.package.name || !entry.package.provenance || !entry.package.entry || !entry.package.licenseSpdx || !entry.package.licenseFile || !entry.package.packageDigest) {
        errors.push(`snapshot package identity is incomplete:${entry.id}`);
      }
    }
    if (entry.availability === "optional-private" && !entry.journey && !entry.unavailableReason) {
      errors.push(`optional snapshot entry has no reason:${entry.id}`);
    }
    if (!isSortedUnique(entry.routeIds) || !isSortedUnique(entry.unsupportedFeatureIds) || !isSortedUnique(entry.evidenceIds)) {
      errors.push(`compatibility corpus snapshot entry is not normalized:${entry.id}`);
    }
    if (!isSortedUnique(entry.artifactRefs.map((artifact) => artifact.id))) {
      errors.push(`compatibility corpus snapshot artifacts are not sorted:${entry.id}`);
    }
    for (const artifact of entry.artifactRefs) {
      if (!artifact.id || (!artifact.path && !artifact.id)) errors.push(`compatibility corpus snapshot artifact identity is empty:${entry.id}`);
      if (artifactIds.has(artifact.id)) errors.push(`duplicate snapshot artifact:${entry.id}:${artifact.id}`);
      artifactIds.add(artifact.id);
    }
  }
  for (const artifactId of value.freshness.requiredArtifactIds) {
    const artifact = value.entries.flatMap((entry) => entry.artifactRefs).find((candidate) => candidate.id === artifactId);
    if (!artifact) errors.push(`freshness artifact is not indexed:${artifactId}`);
    else if (artifact.status !== "passed") errors.push(`freshness artifact is not passed:${artifactId}`);
  }
  return errors;
}

function summarizeEntries(entries: readonly CompatibilityCorpusSnapshotEntry[]): CompatibilityCorpusSnapshotSummary {
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
    routeIds: uniqueSorted(entries.flatMap((entry) => entry.routeIds)),
    unsupportedFeatureIds: uniqueSorted(entries.flatMap((entry) => entry.unsupportedFeatureIds)),
    artifactIds: uniqueSorted(entries.flatMap((entry) => entry.artifactRefs.map((artifact) => artifact.id))),
    artifactCount: entries.reduce((total, entry) => total + entry.artifactRefs.length, 0),
  };
}

function resolveSnapshotStatus(
  entries: readonly CompatibilityCorpusSnapshotEntry[],
  diagnostics: readonly string[],
): CompatibilityCorpusSnapshotStatus {
  if (diagnostics.length > 0) return "failed";
  const required = entries.filter((entry) => entry.availability !== "optional-private");
  if (required.some((entry) => entry.status !== "passed")) return "failed";
  if (entries.some((entry) => entry.status === "failed" || entry.status === "partial")) return "partial";
  return "passed";
}

function isSnapshotPayload(value: Record<string, unknown>): value is CompatibilityCorpusSnapshotResult {
  return (
    typeof value.snapshotId === "string" &&
    typeof value.observedAt === "string" &&
    typeof value.referenceAt === "string" &&
    isSnapshotSource(value.source) &&
    isSnapshotFreshness(value.freshness) &&
    isSnapshotStatus(value.status) &&
    Array.isArray(value.entries) &&
    value.entries.every(isSnapshotEntry) &&
    isRecord(value.summary) &&
    isSnapshotSummary(value.summary) &&
    isRecord(value.claims) &&
    Array.isArray(value.claims.allowed) &&
    value.claims.allowed.every((claim) => typeof claim === "string") &&
    Array.isArray(value.claims.blocked) &&
    value.claims.blocked.every((claim) => typeof claim === "string") &&
    Array.isArray(value.diagnostics) &&
    value.diagnostics.every((diagnostic) => typeof diagnostic === "string")
  );
}

function isSnapshotSource(value: unknown): value is CompatibilityCorpusSnapshotSource {
  if (!isRecord(value) || value.corpusSchema !== COMPATIBILITY_CORPUS_SCHEMA || typeof value.sourceRevision !== "string") return false;
  if (!isRecord(value.tool) || typeof value.tool.id !== "string" || typeof value.tool.version !== "string") return false;
  if (!isRecord(value.ruleset) || typeof value.ruleset.id !== "string" || typeof value.ruleset.version !== "string") return false;
  return value.upstream === undefined || (
    isRecord(value.upstream) && typeof value.upstream.project === "string" && typeof value.upstream.revision === "string"
  );
}

function isSnapshotFreshness(value: unknown): value is CompatibilityCorpusSnapshotFreshness {
  return (
    isRecord(value) &&
    value.policy === "rebuild-and-verify" &&
    typeof value.maxAgeHours === "number" &&
    typeof value.expectedSourceRevision === "string" &&
    Array.isArray(value.requiredArtifactIds) &&
    value.requiredArtifactIds.every((id) => typeof id === "string")
  );
}

function isSnapshotEntry(value: unknown): value is CompatibilityCorpusSnapshotEntry {
  if (!isRecord(value) || typeof value.id !== "string" || !isSnapshotAvailability(value.availability) || !isSnapshotEntryStatus(value.status)) return false;
  if (value.journey !== undefined && (!isRecord(value.journey) || typeof value.journey.id !== "string" || typeof value.journey.schemaVersion !== "string")) return false;
  if (value.package !== undefined && !isSnapshotPackage(value.package)) return false;
  return (
    Array.isArray(value.routeIds) && value.routeIds.every((route) => typeof route === "string") &&
    Array.isArray(value.unsupportedFeatureIds) && value.unsupportedFeatureIds.every((feature) => typeof feature === "string") &&
    Array.isArray(value.artifactRefs) && value.artifactRefs.every(isSnapshotArtifact) &&
    Array.isArray(value.evidenceIds) && value.evidenceIds.every((id) => typeof id === "string") &&
    (value.unavailableReason === undefined || typeof value.unavailableReason === "string")
  );
}

function isSnapshotPackage(value: unknown): value is NonNullable<CompatibilityCorpusSnapshotEntry["package"]> {
  return isRecord(value) &&
    typeof value.id === "string" && typeof value.name === "string" && typeof value.provenance === "string" &&
    typeof value.entry === "string" && typeof value.licenseSpdx === "string" && typeof value.licenseFile === "string" &&
    typeof value.licenseVerified === "boolean" && typeof value.packageDigest === "string";
}

function isSnapshotArtifact(value: unknown): value is CompatibilityCorpusSnapshotArtifact {
  return isRecord(value) && typeof value.id === "string" && isSnapshotArtifactStatus(value.status) &&
    (value.path === undefined || typeof value.path === "string") &&
    (value.checksum === undefined || typeof value.checksum === "string") &&
    (value.finalChecksum === undefined || typeof value.finalChecksum === "string") &&
    (value.contentDigest === undefined || typeof value.contentDigest === "string") &&
    (value.detail === undefined || typeof value.detail === "string");
}

function isSnapshotSummary(value: Record<string, unknown>): value is CompatibilityCorpusSnapshotSummary {
  return [
    "entryCount", "requiredCount", "portableCount", "optionalCount", "passedCount", "partialCount", "failedCount",
    "unavailableOptionalCount", "artifactCount",
  ].every((key) => Number.isInteger(value[key])) &&
    ["packageIds", "routeIds", "unsupportedFeatureIds", "artifactIds"].every(
      (key) => Array.isArray(value[key]) && (value[key] as unknown[]).every((item) => typeof item === "string"),
    );
}

function isSnapshotAvailability(value: unknown): value is CompatibilityCorpusSnapshotAvailability {
  return value === "required-legal" || value === "portable-legal" || value === "optional-private";
}

function isSnapshotEntryStatus(value: unknown): value is CompatibilityCorpusSnapshotEntryStatus {
  return value === "passed" || value === "partial" || value === "failed" || value === "unavailable";
}

function isSnapshotArtifactStatus(value: unknown): value is CompatibilityCorpusSnapshotArtifactStatus {
  return isSnapshotEntryStatus(value);
}

function isSnapshotStatus(value: unknown): value is CompatibilityCorpusSnapshotStatus {
  return value === "passed" || value === "partial" || value === "failed";
}

function isValidTimestamp(value: string): boolean {
  return value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

function isContentDigest(value: string | undefined): value is string {
  return /^sha256:[0-9a-f]{64}$/.test(value ?? "");
}

function isSortedUnique(values: readonly string[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1]!.localeCompare(value) < 0);
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

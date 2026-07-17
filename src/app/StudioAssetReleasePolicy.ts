import type { AssetProvenanceRecord } from "./StudioAssetProvenance";

export const ASSET_RELEASE_POLICY_SCHEMA = "mugen-web-sandbox/asset-release-policy/v0" as const;

export const ASSET_RELEASE_POLICY_REQUIRED_KINDS = [
  "permission",
  "license",
  "digest",
  "transform",
  "qa",
  "collision",
  "playtest",
] as const;

export type AssetReleasePolicyEvidenceKind = (typeof ASSET_RELEASE_POLICY_REQUIRED_KINDS)[number];
export type AssetReleasePolicyEvidenceStatus = "pass" | "warn" | "fail" | "unknown" | "stale";
export type AssetReleasePolicyFreshness = "fresh" | "stale" | "unknown";

export type AssetReleasePolicyEvidence = {
  id: string;
  kind: AssetReleasePolicyEvidenceKind;
  status: AssetReleasePolicyEvidenceStatus;
  freshness: AssetReleasePolicyFreshness;
  reference: string;
  digest?: string;
  observedAt?: string;
  detail?: string;
};

export type AssetReleasePolicyRequiredEvidence = {
  kind: AssetReleasePolicyEvidenceKind;
  evidenceIds: string[];
};

export type AssetReleasePolicyRecord = {
  schemaVersion: typeof ASSET_RELEASE_POLICY_SCHEMA;
  id: string;
  assetId: string;
  assetLabel: string;
  provenanceId: string;
  status: "ready" | "blocked";
  canRelease: boolean;
  requiredEvidence: AssetReleasePolicyRequiredEvidence[];
  evidence: AssetReleasePolicyEvidence[];
  blockedBy: string[];
  warnings: string[];
  evaluatedAt: string;
  claimAllowed: string;
  claimBlocked: string;
};

export type AssetReleasePolicyInput = {
  provenance: AssetProvenanceRecord;
  evidence: AssetReleasePolicyEvidence[];
  evaluatedAt?: string;
};

export function createAssetReleasePolicyRecord(input: AssetReleasePolicyInput): AssetReleasePolicyRecord {
  const evidence = normalizeEvidence(input.evidence);
  const requiredEvidence = ASSET_RELEASE_POLICY_REQUIRED_KINDS.map((kind) => ({
    kind,
    evidenceIds: evidence.filter((item) => item.kind === kind).map((item) => item.id),
  }));
  const blockedBy = new Set<string>();
  const warnings = new Set<string>();

  if (input.provenance.status !== "complete" || !input.provenance.canExport) {
    blockedBy.add("provenance:incomplete");
  }
  if (input.provenance.license.status !== "declared" || input.provenance.license.verified !== true) {
    blockedBy.add("license:unknown");
  }
  if (input.provenance.permission === "denied" || input.provenance.permission === "unsupported") {
    blockedBy.add("permission:unavailable");
  }
  if (!hasCompleteFileDigestCoverage(input.provenance.inputFiles, input.provenance.inputDigest)) {
    blockedBy.add("digest:input-incomplete");
  }
  if (!hasCompleteFileDigestCoverage(input.provenance.outputFiles, input.provenance.outputDigest)) {
    blockedBy.add("digest:output-incomplete");
  }
  if (!hasOrderedTransformEvidence(input.provenance)) {
    blockedBy.add("transform:incomplete");
  }
  if (provenanceHasUnsafePaths(input.provenance)) {
    blockedBy.add("paths:unsafe");
  }

  for (const kind of ASSET_RELEASE_POLICY_REQUIRED_KINDS) {
    const matches = evidence.filter((item) => item.kind === kind);
    if (!matches.length) {
      blockedBy.add(`${kind}:missing`);
      continue;
    }
    for (const item of matches) {
      if (item.status === "fail" || item.status === "unknown" || item.status === "stale") {
        blockedBy.add(`${kind}:${item.status}:${item.id}`);
      }
      if (item.freshness !== "fresh") {
        blockedBy.add(`${kind}:freshness:${item.id}`);
      }
      if (item.status === "warn") {
        warnings.add(`${kind}:warning:${item.id}`);
      }
      if (item.reference === "[unsafe-reference-redacted]") {
        blockedBy.add(`${kind}:reference:${item.id}`);
      }
    }
    if (!matches.some((item) => item.status === "pass")) {
      blockedBy.add(`${kind}:pass-missing`);
    }
  }

  const normalizedBlockedBy = [...blockedBy].sort((left, right) => left.localeCompare(right));
  const normalizedWarnings = [...warnings].sort((left, right) => left.localeCompare(right));
  const canRelease = normalizedBlockedBy.length === 0;
  return {
    schemaVersion: ASSET_RELEASE_POLICY_SCHEMA,
    id: `asset-release-policy:${input.provenance.assetId}`,
    assetId: input.provenance.assetId,
    assetLabel: input.provenance.assetLabel,
    provenanceId: input.provenance.id,
    status: canRelease ? "ready" : "blocked",
    canRelease,
    requiredEvidence,
    evidence,
    blockedBy: normalizedBlockedBy,
    warnings: normalizedWarnings,
    evaluatedAt: input.evaluatedAt ?? new Date().toISOString(),
    claimAllowed: canRelease
      ? "This named asset has a repository-local release decision backed by the listed permission, license, digest, transform, QA, collision, and playtest evidence."
      : "No release claim is allowed for this asset until every required evidence kind is fresh, complete, and pass or an explicitly non-blocking warning.",
    claimBlocked: "This policy is not legal approval, imported-MUGEN credit, compatibility parity, or authorization for assets outside this named record.",
  };
}

export function canonicalizeAssetReleasePolicyRecord(record: AssetReleasePolicyRecord): string {
  return stableStringify(record);
}

function normalizeEvidence(values: AssetReleasePolicyEvidence[]): AssetReleasePolicyEvidence[] {
  const unique = new Map<string, AssetReleasePolicyEvidence>();
  for (const value of values) {
    const id = value.id.trim();
    if (!id) {
      continue;
    }
    const reference = safeReference(value.reference);
    const digest = value.digest && /^[0-9a-f]{64}$/i.test(value.digest) ? value.digest.toLowerCase() : undefined;
    unique.set(id.toLowerCase(), {
      id,
      kind: value.kind,
      status: value.status,
      freshness: value.freshness,
      reference,
      ...(digest ? { digest } : {}),
      ...(value.observedAt ? { observedAt: value.observedAt } : {}),
      ...(value.detail?.trim() ? { detail: value.detail.trim() } : {}),
    });
  }
  return [...unique.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function hasCompleteFileDigestCoverage(
  files: AssetProvenanceRecord["inputFiles"],
  aggregate: AssetProvenanceRecord["inputDigest"],
): boolean {
  return files.length > 0 ? files.every((file) => Boolean(file.digest?.digest)) : Boolean(aggregate?.digest);
}

function hasOrderedTransformEvidence(provenance: AssetProvenanceRecord): boolean {
  return provenance.transforms.length > 0 && provenance.transforms.every((transform, index) =>
    transform.order === index + 1 &&
    transform.tool !== "unknown" &&
    transform.version !== "unknown" &&
    Boolean(transform.configDigest?.digest) &&
    transform.inputPaths.length > 0 &&
    transform.outputPaths.length > 0,
  );
}

function provenanceHasUnsafePaths(provenance: AssetProvenanceRecord): boolean {
  const paths = [
    provenance.sourceRef,
    ...provenance.inputFiles.map((file) => file.path),
    ...provenance.outputFiles.map((file) => file.path),
    ...provenance.transforms.flatMap((transform) => [...transform.inputPaths, ...transform.outputPaths]),
    ...provenance.qaLinks.map((link) => link.reference),
  ];
  return paths.some((path) => path === "[local-path-redacted]" || isUnsafePath(path));
}

function safeReference(value: string): string {
  const normalized = value.trim().replace(/\\/g, "/");
  return normalized && !isUnsafePath(normalized) ? normalized : "[unsafe-reference-redacted]";
}

function isUnsafePath(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return (
    value.split("/").includes("..") ||
    /^(?:[a-z]:|\\\\|file:)/i.test(value) ||
    (/^\//.test(value) && !/^\/(?:characters|stages|audio|assets)\//i.test(value))
  );
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

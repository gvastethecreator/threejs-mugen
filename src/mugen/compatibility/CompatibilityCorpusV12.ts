/**
 * CompatibilityCorpus/v1.2 (DA26-19 bounded).
 * HEAD/ruleset pin, zero hash drift, age vs clock, missing artifact fails closed.
 * Does not replace CompatibilityCorpusSnapshot v1.1 product path.
 */

export const COMPATIBILITY_CORPUS_V12_SCHEMA = "CompatibilityCorpus/v1.2" as const;

export type CompatibilityCorpusV12Artifact = {
  id: string;
  path: string;
  checksum: string;
  required: boolean;
};

export type CompatibilityCorpusV12Input = {
  snapshotId: string;
  headSha: string;
  rulesetId: string;
  rulesetVersion: string;
  generatedAt: string;
  now: string;
  maxAgeHours: number;
  expectedHeadSha: string;
  expectedRulesetVersion: string;
  artifacts: readonly CompatibilityCorpusV12Artifact[];
  /** Probe whether path exists and optional content digest. */
  probe: (path: string) => { exists: boolean; contentDigest?: string };
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type CompatibilityCorpusV12Status = "passed" | "failed";

export type CompatibilityCorpusV12Result = {
  schema: typeof COMPATIBILITY_CORPUS_V12_SCHEMA;
  snapshotId: string;
  status: CompatibilityCorpusV12Status;
  headSha: string;
  ruleset: { id: string; version: string };
  ageHours: number;
  diagnostics: string[];
  artifactStatuses: Array<{
    id: string;
    status: "present" | "missing" | "hash-mismatch";
    path: string;
  }>;
  checksum: string;
  claims: {
    allowed: string[];
    blocked: string[];
  };
};

export function materializeCompatibilityCorpusV12(
  input: CompatibilityCorpusV12Input,
): CompatibilityCorpusV12Result {
  const diagnostics: string[] = [];
  const artifactStatuses: CompatibilityCorpusV12Result["artifactStatuses"] = [];

  if (!input.headSha.trim()) diagnostics.push("empty-head");
  if (input.headSha !== input.expectedHeadSha) {
    diagnostics.push(`head-mismatch:${input.headSha}->${input.expectedHeadSha}`);
  }
  if (input.rulesetVersion !== input.expectedRulesetVersion) {
    diagnostics.push(`ruleset-mismatch:${input.rulesetVersion}->${input.expectedRulesetVersion}`);
  }

  const generatedMs = Date.parse(input.generatedAt);
  const nowMs = Date.parse(input.now);
  if (!Number.isFinite(generatedMs) || !Number.isFinite(nowMs)) {
    diagnostics.push("invalid-timestamps");
  }
  const ageHours =
    Number.isFinite(generatedMs) && Number.isFinite(nowMs)
      ? Math.max(0, (nowMs - generatedMs) / (1000 * 60 * 60))
      : Number.POSITIVE_INFINITY;
  if (ageHours > input.maxAgeHours) {
    diagnostics.push(`stale-age:${ageHours.toFixed(2)}h>${input.maxAgeHours}h`);
  }

  for (const artifact of [...input.artifacts].sort((a, b) => a.id.localeCompare(b.id))) {
    const probe = input.probe(artifact.path);
    if (!probe.exists) {
      artifactStatuses.push({ id: artifact.id, status: "missing", path: artifact.path });
      if (artifact.required) diagnostics.push(`artifact-missing:${artifact.id}`);
      continue;
    }
    if (probe.contentDigest && probe.contentDigest !== artifact.checksum) {
      artifactStatuses.push({ id: artifact.id, status: "hash-mismatch", path: artifact.path });
      diagnostics.push(`artifact-hash-mismatch:${artifact.id}`);
      continue;
    }
    artifactStatuses.push({ id: artifact.id, status: "present", path: artifact.path });
  }

  const status: CompatibilityCorpusV12Status = diagnostics.length === 0 ? "passed" : "failed";
  const payload = {
    schema: COMPATIBILITY_CORPUS_V12_SCHEMA,
    snapshotId: input.snapshotId.trim(),
    status,
    headSha: input.headSha.trim(),
    ruleset: { id: input.rulesetId.trim(), version: input.rulesetVersion.trim() },
    ageHours: Number.isFinite(ageHours) ? Number(ageHours.toFixed(4)) : -1,
    diagnostics: [...diagnostics].sort(),
    artifactStatuses,
    claims: {
      allowed: [...input.claims.allowed].sort(),
      blocked: [...input.claims.blocked].sort(),
    },
  };

  return {
    ...payload,
    checksum: stableHash(stableStringify(payload)),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

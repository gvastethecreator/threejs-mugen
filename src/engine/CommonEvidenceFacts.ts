/**
 * CommonEvidenceFacts/v1 (DA26-30 bounded).
 * Core fact contract with zero app/MUGEN imports.
 * Two consumers (Studio + Runtime adapters) produce equal canonical bytes.
 */

export const COMMON_EVIDENCE_FACTS_SCHEMA = "CommonEvidenceFacts/v1" as const;
export const COMMON_EVIDENCE_CANONICALIZATION = "stable-json/v0" as const;

export type CommonEvidenceFactStatus = "passed" | "failed" | "missing" | "unsupported" | "unknown";
export type CommonEvidenceFactFreshness = "current" | "stale" | "missing" | "unknown";

export type CommonEvidenceSubject = {
  kind: "repository" | "project" | "runtime" | "tool" | "package" | "asset" | "gate";
  id: string;
  revision?: string;
};

export type CommonEvidenceFacts = {
  schema: typeof COMMON_EVIDENCE_FACTS_SCHEMA;
  subject: CommonEvidenceSubject;
  status: CommonEvidenceFactStatus;
  freshness: CommonEvidenceFactFreshness;
  observedAt: string;
  claimAllowed: string[];
  claimBlocked: string[];
  evidenceIds: string[];
  payload: Record<string, string | number | boolean | null>;
  canonicalization: typeof COMMON_EVIDENCE_CANONICALIZATION;
  digest: string;
};

export type CommonEvidenceFactsInput = Omit<
  CommonEvidenceFacts,
  "schema" | "canonicalization" | "digest"
>;

/** Pure core builder — no Studio/App or MUGEN types. */
export function createCommonEvidenceFacts(input: CommonEvidenceFactsInput): CommonEvidenceFacts {
  const payload: Omit<CommonEvidenceFacts, "digest"> = {
    schema: COMMON_EVIDENCE_FACTS_SCHEMA,
    subject: {
      kind: input.subject.kind,
      id: input.subject.id.trim(),
      ...(input.subject.revision ? { revision: input.subject.revision.trim() } : {}),
    },
    status: input.status,
    freshness: input.freshness,
    observedAt: input.observedAt,
    claimAllowed: [...input.claimAllowed].sort(),
    claimBlocked: [...input.claimBlocked].sort(),
    evidenceIds: [...input.evidenceIds].sort(),
    payload: sortRecord(input.payload),
    canonicalization: COMMON_EVIDENCE_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: digestOf(payload),
  };
}

export function canonicalizeCommonEvidenceFacts(
  value: Omit<CommonEvidenceFacts, "digest"> | CommonEvidenceFacts,
): string {
  const { digest: _digest, ...payload } = value as CommonEvidenceFacts;
  return stableStringify(payload);
}

export function commonEvidenceFactsEqual(left: CommonEvidenceFacts, right: CommonEvidenceFacts): boolean {
  return left.digest === right.digest && canonicalizeCommonEvidenceFacts(left) === canonicalizeCommonEvidenceFacts(right);
}

/** Studio-side adapter: maps generic Studio observation into core facts. */
export function studioConsumerToCommonEvidenceFacts(input: {
  projectId: string;
  projectRevision?: string;
  status: CommonEvidenceFactStatus;
  freshness: CommonEvidenceFactFreshness;
  observedAt: string;
  evidenceIds: readonly string[];
  analysisChecksum?: string;
}): CommonEvidenceFacts {
  return createCommonEvidenceFacts({
    subject: {
      kind: "project",
      id: input.projectId,
      revision: input.projectRevision,
    },
    status: input.status,
    freshness: input.freshness,
    observedAt: input.observedAt,
    claimAllowed: ["studio consumer produces common facts"],
    claimBlocked: ["studio UI is not a core dependency"],
    evidenceIds: [...input.evidenceIds],
    payload: {
      consumer: "studio",
      analysisChecksum: input.analysisChecksum ?? null,
    },
  });
}

/** Runtime-side adapter: maps generic runtime observation into core facts. */
export function runtimeConsumerToCommonEvidenceFacts(input: {
  runtimeId: string;
  runtimeRevision?: string;
  status: CommonEvidenceFactStatus;
  freshness: CommonEvidenceFactFreshness;
  observedAt: string;
  evidenceIds: readonly string[];
  traceChecksum?: string;
}): CommonEvidenceFacts {
  return createCommonEvidenceFacts({
    subject: {
      kind: "runtime",
      id: input.runtimeId,
      revision: input.runtimeRevision,
    },
    status: input.status,
    freshness: input.freshness,
    observedAt: input.observedAt,
    claimAllowed: ["runtime consumer produces common facts"],
    claimBlocked: ["runtime combat systems are not a core dependency"],
    evidenceIds: [...input.evidenceIds],
    payload: {
      consumer: "runtime",
      traceChecksum: input.traceChecksum ?? null,
    },
  });
}

/**
 * Same logical project observation through two adapters with shared core fields
 * must yield identical digests when subjects and payloads match.
 */
export function twoConsumerCanonicalParity(input: {
  subject: CommonEvidenceSubject;
  status: CommonEvidenceFactStatus;
  freshness: CommonEvidenceFactFreshness;
  observedAt: string;
  evidenceIds: readonly string[];
  payload: Record<string, string | number | boolean | null>;
  claimAllowed: readonly string[];
  claimBlocked: readonly string[];
}): { studio: CommonEvidenceFacts; runtime: CommonEvidenceFacts; equal: boolean } {
  const base = {
    subject: input.subject,
    status: input.status,
    freshness: input.freshness,
    observedAt: input.observedAt,
    evidenceIds: [...input.evidenceIds],
    payload: { ...input.payload },
    claimAllowed: [...input.claimAllowed],
    claimBlocked: [...input.claimBlocked],
  };
  const studio = createCommonEvidenceFacts(base);
  const runtime = createCommonEvidenceFacts({
    ...base,
    // Insertion order noise must not matter.
    evidenceIds: [...input.evidenceIds].reverse(),
    claimAllowed: [...input.claimAllowed].reverse(),
    claimBlocked: [...input.claimBlocked].reverse(),
  });
  return {
    studio,
    runtime,
    equal: commonEvidenceFactsEqual(studio, runtime),
  };
}

function sortRecord(
  record: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of Object.keys(record).sort()) {
    out[key] = record[key] ?? null;
  }
  return out;
}

function digestOf(payload: Omit<CommonEvidenceFacts, "digest">): string {
  return stableHash(stableStringify(payload));
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

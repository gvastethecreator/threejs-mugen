import type { GateEvidenceResult } from "./GateEvidence";
import type { PackageAnalysisV1Result } from "../mugen/compatibility/PackageAnalysis";

export const EVIDENCE_ENVELOPE_SCHEMA = "mugen-web-sandbox/evidence-envelope/v0" as const;
export const EVIDENCE_ENVELOPE_CANONICALIZATION = "stable-json/v0" as const;
export const EVIDENCE_ENVELOPE_DIGEST_ALGORITHM = "sha-256" as const;

export type EvidenceEnvelopeStatus = "passed" | "failed" | "missing" | "unsupported" | "unknown";
export type EvidenceEnvelopeFreshnessState = "current" | "stale" | "missing" | "unknown";
export type EvidenceEnvelopeTargetKind = "contract" | "artifact" | "gate" | "runtime" | "package" | "asset" | "snapshot";

export type EvidenceEnvelope = {
  schemaVersion: typeof EVIDENCE_ENVELOPE_SCHEMA;
  id: string;
  subject: {
    kind: EvidenceEnvelopeTargetKind;
    id: string;
  };
  provenance: {
    entityId: string;
    activityId: string;
    agentId: string;
  };
  revisions: {
    source: string;
    producer: {
      id: string;
      version: string;
      revision: string;
    };
    project?: {
      id: string;
      revision: string;
    };
  };
  derivation: {
    relation: "observed-from" | "derived-from";
    sourceIds: string[];
  };
  observation: {
    status: EvidenceEnvelopeStatus;
    observedAt: string;
    freshness: {
      state: EvidenceEnvelopeFreshnessState;
      maxAgeMs?: number;
    };
    semanticDigest: string;
    artifactDigest: string;
  };
  diagnostics: string[];
  canonicalization: typeof EVIDENCE_ENVELOPE_CANONICALIZATION;
  digest: {
    algorithm: typeof EVIDENCE_ENVELOPE_DIGEST_ALGORITHM;
    value: string;
  };
};

export type EvidenceEnvelopeInput = Omit<EvidenceEnvelope, "schemaVersion" | "canonicalization" | "digest">;
export type EvidenceEnvelopeParseResult = {
  envelope?: EvidenceEnvelope;
  diagnostics: string[];
};

export function createEvidenceEnvelope(input: EvidenceEnvelopeInput): EvidenceEnvelope {
  const payload: Omit<EvidenceEnvelope, "digest"> = {
    schemaVersion: EVIDENCE_ENVELOPE_SCHEMA,
    id: input.id.trim(),
    subject: { ...input.subject, id: input.subject.id.trim() },
    provenance: {
      entityId: input.provenance.entityId.trim(),
      activityId: input.provenance.activityId.trim(),
      agentId: input.provenance.agentId.trim(),
    },
    revisions: {
      source: input.revisions.source.trim(),
      producer: {
        id: input.revisions.producer.id.trim(),
        version: input.revisions.producer.version.trim(),
        revision: input.revisions.producer.revision.trim(),
      },
      ...(input.revisions.project
        ? {
            project: {
              id: input.revisions.project.id.trim(),
              revision: input.revisions.project.revision.trim(),
            },
          }
        : {}),
    },
    derivation: {
      relation: input.derivation.relation,
      sourceIds: uniqueSorted(input.derivation.sourceIds),
    },
    observation: {
      status: input.observation.status,
      observedAt: input.observation.observedAt,
      freshness: {
        state: input.observation.freshness.state,
        ...(input.observation.freshness.maxAgeMs !== undefined ? { maxAgeMs: input.observation.freshness.maxAgeMs } : {}),
      },
      semanticDigest: input.observation.semanticDigest.trim(),
      artifactDigest: input.observation.artifactDigest.toLowerCase(),
    },
    diagnostics: uniqueSorted(input.diagnostics),
    canonicalization: EVIDENCE_ENVELOPE_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: EVIDENCE_ENVELOPE_DIGEST_ALGORITHM,
      value: sha256Hex(canonicalizeEvidenceEnvelope(payload)),
    },
  };
}

export function canonicalizeEvidenceEnvelope(value: Omit<EvidenceEnvelope, "digest"> | EvidenceEnvelope): string {
  const { digest: _digest, ...payload } = value as EvidenceEnvelope;
  return stableStringify(payload);
}

export function parseEvidenceEnvelope(value: unknown): EvidenceEnvelopeParseResult {
  const diagnostics: string[] = [];
  if (!isRecord(value)) {
    return { diagnostics: ["Evidence envelope must be an object"] };
  }
  if (value.schemaVersion !== EVIDENCE_ENVELOPE_SCHEMA) diagnostics.push("Evidence envelope schema is unsupported");
  if (!nonEmptyString(value.id)) diagnostics.push("Evidence envelope id is missing");
  const subject = parseSubject(value.subject, diagnostics);
  const provenance = parseProvenance(value.provenance, diagnostics);
  const revisions = parseRevisions(value.revisions, diagnostics);
  const derivation = parseDerivation(value.derivation, diagnostics);
  const observation = parseObservation(value.observation, diagnostics);
  if (value.canonicalization !== EVIDENCE_ENVELOPE_CANONICALIZATION) diagnostics.push("Evidence envelope canonicalization is unsupported");
  const digest = parseDigest(value.digest, diagnostics);
  if (diagnostics.length || !subject || !provenance || !revisions || !derivation || !observation || !digest) {
    return { diagnostics };
  }
  const candidate = {
    schemaVersion: EVIDENCE_ENVELOPE_SCHEMA,
    id: String(value.id),
    subject,
    provenance,
    revisions,
    derivation,
    observation,
    diagnostics: Array.isArray(value.diagnostics) && value.diagnostics.every((item) => typeof item === "string")
      ? [...value.diagnostics]
      : [],
    canonicalization: EVIDENCE_ENVELOPE_CANONICALIZATION,
  } satisfies Omit<EvidenceEnvelope, "digest">;
  if (!Array.isArray(value.diagnostics) || !value.diagnostics.every((item) => typeof item === "string")) {
    diagnostics.push("Evidence envelope diagnostics must be string[]");
  }
  const expectedDigest = sha256Hex(canonicalizeEvidenceEnvelope(candidate));
  if (digest.value !== expectedDigest) diagnostics.push("Evidence envelope digest mismatch");
  return diagnostics.length
    ? { diagnostics }
    : { diagnostics: [], envelope: { ...candidate, digest } };
}

export function createGateEvidenceEnvelope(input: {
  result: GateEvidenceResult;
  producerRevision: string;
  artifactDigest: string;
  freshnessState: EvidenceEnvelopeFreshnessState;
  project?: { id: string; revision: string };
  sourceEnvelopeIds?: string[];
}): EvidenceEnvelope {
  return createEvidenceEnvelope({
    id: `evidence-envelope:gate:${input.result.gateId}`,
    subject: { kind: "gate", id: input.result.gateId },
    provenance: {
      entityId: `gate:${input.result.gateId}`,
      activityId: `gate-run:${input.result.id}`,
      agentId: `tool:${input.result.tool.name}`,
    },
    revisions: {
      source: input.result.sourceRevision,
      producer: {
        id: input.result.tool.name,
        version: input.result.tool.version,
        revision: input.producerRevision,
      },
      ...(input.project ? { project: input.project } : {}),
    },
    derivation: {
      relation: "observed-from",
      sourceIds: input.sourceEnvelopeIds ?? [],
    },
    observation: {
      status: input.result.status,
      observedAt: input.result.observedAt,
      freshness: { state: input.freshnessState, maxAgeMs: input.result.freshness.maxAgeMs },
      semanticDigest: input.result.digest,
      artifactDigest: input.artifactDigest,
    },
    diagnostics: input.result.diagnostics,
  });
}

export function createPackageAnalysisEvidenceEnvelope(input: {
  report: PackageAnalysisV1Result;
  sourceRevision: string;
  producerRevision: string;
  freshnessState: EvidenceEnvelopeFreshnessState;
  artifactDigest?: string;
  project?: { id: string; revision: string };
  sourceEnvelopeIds?: string[];
}): EvidenceEnvelope {
  const analysisStatus: EvidenceEnvelopeStatus = input.report.analysis.status === "recognized"
    ? "passed"
    : input.report.analysis.status === "partial"
      ? "failed"
      : "unknown";
  return createEvidenceEnvelope({
    id: `evidence-envelope:package-analysis:${input.report.source.name}`,
    subject: { kind: "package", id: input.report.source.name },
    provenance: {
      entityId: `package:${input.report.source.name}`,
      activityId: `package-analysis:${input.report.checksum}`,
      agentId: `analyzer:${input.report.analyzer.id}`,
    },
    revisions: {
      source: input.sourceRevision,
      producer: {
        id: input.report.analyzer.id,
        version: input.report.analyzer.version,
        revision: input.producerRevision,
      },
      ...(input.project ? { project: input.project } : {}),
    },
    derivation: {
      relation: "derived-from",
      sourceIds: input.sourceEnvelopeIds ?? [input.report.source.package.digest],
    },
    observation: {
      status: analysisStatus,
      observedAt: input.report.observedAt,
      freshness: { state: input.freshnessState },
      semanticDigest: input.report.semanticDigest,
      artifactDigest: input.artifactDigest ?? input.report.source.package.digest,
    },
    diagnostics: input.report.analysis.diagnostics,
  });
}

function parseSubject(value: unknown, diagnostics: string[]): EvidenceEnvelope["subject"] | undefined {
  if (!isRecord(value) || !isTargetKind(value.kind) || !nonEmptyString(value.id)) {
    diagnostics.push("Evidence envelope subject is invalid");
    return undefined;
  }
  return { kind: value.kind, id: String(value.id) };
}

function parseProvenance(value: unknown, diagnostics: string[]): EvidenceEnvelope["provenance"] | undefined {
  if (!isRecord(value) || !nonEmptyString(value.entityId) || !nonEmptyString(value.activityId) || !nonEmptyString(value.agentId)) {
    diagnostics.push("Evidence envelope provenance is invalid");
    return undefined;
  }
  return { entityId: String(value.entityId), activityId: String(value.activityId), agentId: String(value.agentId) };
}

function parseRevisions(value: unknown, diagnostics: string[]): EvidenceEnvelope["revisions"] | undefined {
  if (!isRecord(value) || !nonEmptyString(value.source) || !isRecord(value.producer) || !nonEmptyString(value.producer.id) || !nonEmptyString(value.producer.version) || !nonEmptyString(value.producer.revision)) {
    diagnostics.push("Evidence envelope revisions are invalid");
    return undefined;
  }
  const project = value.project;
  if (project !== undefined && (!isRecord(project) || !nonEmptyString(project.id) || !nonEmptyString(project.revision))) {
    diagnostics.push("Evidence envelope project revision is invalid");
  }
  return {
    source: String(value.source),
    producer: { id: String(value.producer.id), version: String(value.producer.version), revision: String(value.producer.revision) },
    ...(isRecord(project) ? { project: { id: String(project.id), revision: String(project.revision) } } : {}),
  };
}

function parseDerivation(value: unknown, diagnostics: string[]): EvidenceEnvelope["derivation"] | undefined {
  if (!isRecord(value) || (value.relation !== "observed-from" && value.relation !== "derived-from") || !Array.isArray(value.sourceIds) || !value.sourceIds.every((item) => nonEmptyString(item))) {
    diagnostics.push("Evidence envelope derivation is invalid");
    return undefined;
  }
  const sourceIds = value.sourceIds.map(String);
  if (new Set(sourceIds).size !== sourceIds.length) diagnostics.push("Evidence envelope derivation has duplicate source IDs");
  return { relation: value.relation, sourceIds };
}

function parseObservation(value: unknown, diagnostics: string[]): EvidenceEnvelope["observation"] | undefined {
  if (!isRecord(value) || !isEvidenceStatus(value.status) || !isIsoDate(value.observedAt) || !isRecord(value.freshness) || !isFreshnessState(value.freshness.state) || !nonEmptyString(value.semanticDigest) || !isSha256(value.artifactDigest)) {
    diagnostics.push("Evidence envelope observation is invalid");
    return undefined;
  }
  const maxAgeMs = value.freshness.maxAgeMs;
  if (maxAgeMs !== undefined && (typeof maxAgeMs !== "number" || !Number.isSafeInteger(maxAgeMs) || maxAgeMs <= 0)) {
    diagnostics.push("Evidence envelope freshness maxAgeMs is invalid");
  }
  return {
    status: value.status,
    observedAt: String(value.observedAt),
    freshness: {
      state: value.freshness.state,
      ...(typeof maxAgeMs === "number" ? { maxAgeMs } : {}),
    },
    semanticDigest: String(value.semanticDigest),
    artifactDigest: String(value.artifactDigest).toLowerCase(),
  };
}

function parseDigest(value: unknown, diagnostics: string[]): EvidenceEnvelope["digest"] | undefined {
  if (!isRecord(value) || value.algorithm !== EVIDENCE_ENVELOPE_DIGEST_ALGORITHM || !isSha256(value.value)) {
    diagnostics.push("Evidence envelope digest is invalid");
    return undefined;
  }
  return { algorithm: EVIDENCE_ENVELOPE_DIGEST_ALGORITHM, value: String(value.value).toLowerCase() };
}

function isEvidenceStatus(value: unknown): value is EvidenceEnvelopeStatus {
  return value === "passed" || value === "failed" || value === "missing" || value === "unsupported" || value === "unknown";
}

function isFreshnessState(value: unknown): value is EvidenceEnvelopeFreshnessState {
  return value === "current" || value === "stale" || value === "missing" || value === "unknown";
}

function isTargetKind(value: unknown): value is EvidenceEnvelopeTargetKind {
  return value === "contract" || value === "artifact" || value === "gate" || value === "runtime" || value === "package" || value === "asset" || value === "snapshot";
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().filter((key) => record[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

export function sha256Hex(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const bitLength = bytes.length * 8;
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);

  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let [a, b, c, d, e, f, g, h] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(64);
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const first = words[index - 15];
      const second = words[index - 2];
      const sigma0 = rotateRight(first, 7) ^ rotateRight(first, 18) ^ (first >>> 3);
      const sigma1 = rotateRight(second, 17) ^ rotateRight(second, 19) ^ (second >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }
    let [aa, bb, cc, dd, ee, ff, gg, hh] = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < 64; index += 1) {
      const sigma1 = rotateRight(ee, 6) ^ rotateRight(ee, 11) ^ rotateRight(ee, 25);
      const choose = (ee & ff) ^ (~ee & gg);
      const temp1 = (hh + sigma1 + choose + constants[index] + words[index]) >>> 0;
      const sigma0 = rotateRight(aa, 2) ^ rotateRight(aa, 13) ^ rotateRight(aa, 22);
      const majority = (aa & bb) ^ (aa & cc) ^ (bb & cc);
      const temp2 = (sigma0 + majority) >>> 0;
      [hh, gg, ff, ee, dd, cc, bb, aa] = [gg, ff, ee, (dd + temp1) >>> 0, cc, bb, aa, (temp1 + temp2) >>> 0];
    }
    a = (a + aa) >>> 0;
    b = (b + bb) >>> 0;
    c = (c + cc) >>> 0;
    d = (d + dd) >>> 0;
    e = (e + ee) >>> 0;
    f = (f + ff) >>> 0;
    g = (g + gg) >>> 0;
    h = (h + hh) >>> 0;
  }
  return [a, b, c, d, e, f, g, h].map((value) => value.toString(16).padStart(8, "0")).join("");
}

export function sha256StableJson(value: unknown): string {
  return sha256Hex(stableStringify(value));
}

function rotateRight(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

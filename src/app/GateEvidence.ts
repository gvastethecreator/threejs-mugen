export const GATE_EVIDENCE_SCHEMA = "mugen-web-sandbox/gate-evidence/v0" as const;

export type GateEvidenceStatus = "passed" | "failed" | "missing" | "unsupported";
export type GateEvidenceIntent = "diagnostic" | "release";
export type GateEvidenceFreshnessState = "current" | "stale" | "missing";
export type GateEvidenceTargetKind = "contract" | "artifact" | "gate" | "runtime";

export type GateEvidenceResult = {
  schemaVersion: typeof GATE_EVIDENCE_SCHEMA;
  id: string;
  gateId: string;
  label: string;
  status: GateEvidenceStatus;
  intent: GateEvidenceIntent;
  command: string;
  tool: {
    name: string;
    version: string;
  };
  observedAt: string;
  sourceRevision: string;
  digest: string;
  target: {
    kind: GateEvidenceTargetKind;
    id: string;
  };
  freshness: {
    maxAgeMs: number;
  };
  diagnostics: string[];
};

export type GateEvidenceDocument = {
  schemaVersion: typeof GATE_EVIDENCE_SCHEMA;
  generatedAt: string;
  sourceRevision: string;
  results: GateEvidenceResult[];
};

export type GateEvidenceParseResult = {
  document?: GateEvidenceDocument;
  diagnostics: string[];
};

export type GateEvidenceFreshnessAssessment = {
  state: GateEvidenceFreshnessState;
  ageMs?: number;
  detail: string;
};

export function createGateEvidenceResult(input: Omit<GateEvidenceResult, "schemaVersion" | "digest">): GateEvidenceResult {
  const payload: Omit<GateEvidenceResult, "digest"> = {
    schemaVersion: GATE_EVIDENCE_SCHEMA,
    ...input,
    tool: { ...input.tool },
    target: { ...input.target },
    freshness: { ...input.freshness },
    diagnostics: [...input.diagnostics],
  };
  return { ...payload, digest: hashStableJson(payload) };
}

export function createGateEvidenceDocument(input: {
  generatedAt: string;
  sourceRevision: string;
  results: GateEvidenceResult[];
}): GateEvidenceDocument {
  return {
    schemaVersion: GATE_EVIDENCE_SCHEMA,
    generatedAt: input.generatedAt,
    sourceRevision: input.sourceRevision,
    results: input.results.map((result) => ({
      ...result,
      tool: { ...result.tool },
      target: { ...result.target },
      freshness: { ...result.freshness },
      diagnostics: [...result.diagnostics],
    })),
  };
}

export function parseGateEvidenceDocument(value: unknown): GateEvidenceParseResult {
  const diagnostics: string[] = [];
  if (!isRecord(value)) {
    return { diagnostics: ["Gate evidence root must be an object"] };
  }
  if (value.schemaVersion !== GATE_EVIDENCE_SCHEMA) {
    diagnostics.push(`Unsupported gate evidence schema ${typeof value.schemaVersion === "string" ? value.schemaVersion : "(missing)"}`);
  }
  if (!isIsoDate(value.generatedAt)) diagnostics.push("Gate evidence generatedAt must be an ISO date");
  if (!nonEmptyString(value.sourceRevision)) diagnostics.push("Gate evidence sourceRevision is missing");
  if (!Array.isArray(value.results)) {
    diagnostics.push("Gate evidence results must be an array");
  }
  const results = Array.isArray(value.results)
    ? value.results.flatMap((item, index) => {
        const parsed = parseGateEvidenceResult(item, index);
        diagnostics.push(...parsed.diagnostics);
        return parsed.result ? [parsed.result] : [];
      })
    : [];
  const ids = new Set<string>();
  for (const result of results) {
    if (ids.has(result.gateId)) diagnostics.push(`Duplicate gate evidence gateId ${result.gateId}`);
    ids.add(result.gateId);
  }
  if (diagnostics.length) return { diagnostics };
  return {
    diagnostics,
    document: {
      schemaVersion: GATE_EVIDENCE_SCHEMA,
      generatedAt: String(value.generatedAt),
      sourceRevision: String(value.sourceRevision),
      results,
    },
  };
}

export function assessGateEvidenceFreshness(result: GateEvidenceResult, now = Date.now()): GateEvidenceFreshnessAssessment {
  if (result.status === "missing") {
    return { state: "missing", detail: "gate evidence is explicitly missing" };
  }
  const observedAt = Date.parse(result.observedAt);
  if (!Number.isFinite(observedAt)) {
    return { state: "missing", detail: "gate evidence observedAt is invalid" };
  }
  const ageMs = Math.max(0, now - observedAt);
  if (ageMs > result.freshness.maxAgeMs) {
    return {
      state: "stale",
      ageMs,
      detail: `gate evidence is stale by ${formatAge(ageMs - result.freshness.maxAgeMs)}`,
    };
  }
  return { state: "current", ageMs, detail: `gate evidence is current (${formatAge(ageMs)} old)` };
}

export function isGateEvidenceExportable(result: GateEvidenceResult, freshness: GateEvidenceFreshnessAssessment): boolean {
  return result.status === "passed" && freshness.state === "current" && result.intent === "release";
}

function parseGateEvidenceResult(value: unknown, index: number): { result?: GateEvidenceResult; diagnostics: string[] } {
  const diagnostics: string[] = [];
  if (!isRecord(value)) return { diagnostics: [`Gate evidence result ${index} must be an object`] };
  if (value.schemaVersion !== GATE_EVIDENCE_SCHEMA) diagnostics.push(`Gate evidence result ${index} has an invalid schema`);
  const requiredStrings = ["id", "gateId", "label", "command", "observedAt", "sourceRevision", "digest"] as const;
  for (const key of requiredStrings) {
    if (!nonEmptyString(value[key])) diagnostics.push(`Gate evidence result ${index} is missing ${key}`);
  }
  if (!isGateEvidenceStatus(value.status)) diagnostics.push(`Gate evidence result ${index} has an invalid status`);
  if (!isGateEvidenceIntent(value.intent)) diagnostics.push(`Gate evidence result ${index} has an invalid intent`);
  if (!isIsoDate(value.observedAt)) diagnostics.push(`Gate evidence result ${index} has an invalid observedAt`);
  const tool = parseTool(value.tool, index, diagnostics);
  const target = parseTarget(value.target, index, diagnostics);
  const freshness = parseFreshness(value.freshness, index, diagnostics);
  const resultDiagnostics = Array.isArray(value.diagnostics) && value.diagnostics.every((item) => typeof item === "string")
    ? [...value.diagnostics]
    : (diagnostics.push(`Gate evidence result ${index} diagnostics must be string[]`), []);
  if (diagnostics.length || !tool || !target || !freshness) return { diagnostics };
  const candidate = {
    schemaVersion: GATE_EVIDENCE_SCHEMA,
    id: String(value.id),
    gateId: String(value.gateId),
    label: String(value.label),
    status: value.status as GateEvidenceStatus,
    intent: value.intent as GateEvidenceIntent,
    command: String(value.command),
    tool,
    observedAt: String(value.observedAt),
    sourceRevision: String(value.sourceRevision),
    target,
    freshness,
    diagnostics: resultDiagnostics,
  } satisfies Omit<GateEvidenceResult, "digest">;
  const expectedDigest = hashStableJson(candidate);
  if (String(value.digest) !== expectedDigest) diagnostics.push(`Gate evidence result ${index} digest mismatch`);
  return diagnostics.length
    ? { diagnostics }
    : { diagnostics, result: { ...candidate, digest: String(value.digest) } };
}

function parseTool(value: unknown, index: number, diagnostics: string[]): GateEvidenceResult["tool"] | undefined {
  if (!isRecord(value) || !nonEmptyString(value.name) || !nonEmptyString(value.version)) {
    diagnostics.push(`Gate evidence result ${index} tool is invalid`);
    return undefined;
  }
  return { name: String(value.name), version: String(value.version) };
}

function parseTarget(value: unknown, index: number, diagnostics: string[]): GateEvidenceResult["target"] | undefined {
  if (!isRecord(value) || !isGateEvidenceTargetKind(value.kind) || !nonEmptyString(value.id)) {
    diagnostics.push(`Gate evidence result ${index} target is invalid`);
    return undefined;
  }
  return { kind: value.kind, id: String(value.id) };
}

function parseFreshness(value: unknown, index: number, diagnostics: string[]): GateEvidenceResult["freshness"] | undefined {
  if (!isRecord(value) || typeof value.maxAgeMs !== "number" || !Number.isSafeInteger(value.maxAgeMs) || value.maxAgeMs <= 0) {
    diagnostics.push(`Gate evidence result ${index} freshness is invalid`);
    return undefined;
  }
  return { maxAgeMs: value.maxAgeMs };
}

function isGateEvidenceStatus(value: unknown): value is GateEvidenceStatus {
  return value === "passed" || value === "failed" || value === "missing" || value === "unsupported";
}

function isGateEvidenceIntent(value: unknown): value is GateEvidenceIntent {
  return value === "diagnostic" || value === "release";
}

function isGateEvidenceTargetKind(value: unknown): value is GateEvidenceTargetKind {
  return value === "contract" || value === "artifact" || value === "gate" || value === "runtime";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function formatAge(ageMs: number): string {
  if (ageMs < 1_000) return `${ageMs}ms`;
  if (ageMs < 60_000) return `${Math.round(ageMs / 1_000)}s`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m`;
  return `${Math.round(ageMs / 3_600_000)}h`;
}

function hashStableJson(value: unknown): string {
  let hash = 0x811c9dc5;
  for (const character of stableStringify(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

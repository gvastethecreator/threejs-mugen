import {
  assessGateEvidenceFreshness,
  type GateEvidenceResult,
} from "./GateEvidence";
import {
  createGateEvidenceEnvelope,
  createPackageAnalysisEvidenceEnvelope,
  parseEvidenceEnvelope,
  sha256StableJson,
  type EvidenceEnvelope,
  type EvidenceEnvelopeFreshnessState,
} from "./EvidenceEnvelope";
import type { PackageAnalysisV1Result } from "../mugen/compatibility/PackageAnalysis";

export const STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA = "mugen-web-sandbox/studio-evidence-envelope-document/v0" as const;
export const STUDIO_EVIDENCE_ENVELOPE_PRODUCER = {
  id: "mugen-web-sandbox/studio-evidence",
  version: "1.0.0",
  revision: "evidence-envelope-adapter/v0",
} as const;

export type StudioEvidenceEnvelopeDocument = {
  schemaVersion: typeof STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA;
  generatedAt: string;
  project: {
    id: string;
    revision?: string;
    scope: "saved" | "session";
  };
  producer: typeof STUDIO_EVIDENCE_ENVELOPE_PRODUCER;
  summary: {
    total: number;
    current: number;
    stale: number;
    missing: number;
    unknown: number;
  };
  envelopes: EvidenceEnvelope[];
  diagnostics: string[];
};

export type StudioEvidenceEnvelopeAssessment = {
  status: "ok" | "warn" | "fail";
  state: "exportable" | "partial" | "blocked";
  canExport: boolean;
  detail: string;
  blockedBy: string[];
};

export type StudioEvidenceEnvelopeParseResult = {
  document?: StudioEvidenceEnvelopeDocument;
  diagnostics: string[];
};

export function createStudioEvidenceEnvelopeDocument(input: {
  generatedAt: string;
  projectId: string;
  projectRevision?: number;
  gates: readonly GateEvidenceResult[];
  packageAnalysis?: PackageAnalysisV1Result;
  currentPackageRevision?: string;
  currentPackageAvailable?: boolean;
  now?: number;
}): StudioEvidenceEnvelopeDocument {
  const projectId = input.projectId.trim();
  const projectRevision = input.projectRevision !== undefined && Number.isSafeInteger(input.projectRevision) && input.projectRevision > 0
    ? String(input.projectRevision)
    : undefined;
  const envelopes = input.gates.map((result) => createGateEvidenceEnvelope({
    result,
    producerRevision: STUDIO_EVIDENCE_ENVELOPE_PRODUCER.revision,
    artifactDigest: sha256StableJson(result),
    freshnessState: toEnvelopeFreshness(assessGateEvidenceFreshness(result, input.now).state),
    project: projectRevision ? { id: projectId, revision: projectRevision } : undefined,
  }));
  const packageFreshness = input.packageAnalysis
    ? assessPackageFreshness(input)
    : undefined;
  if (input.packageAnalysis) {
    envelopes.push(createPackageAnalysisEvidenceEnvelope({
      report: input.packageAnalysis,
      sourceRevision: input.packageAnalysis.source.package.digest,
      producerRevision: `${input.packageAnalysis.ruleset.id}@${input.packageAnalysis.ruleset.version};upstream:${input.packageAnalysis.upstream.revision}`,
      freshnessState: packageFreshness?.state ?? "unknown",
      artifactDigest: sha256StableJson(input.packageAnalysis),
      project: projectRevision ? { id: projectId, revision: projectRevision } : undefined,
    }));
  }
  const diagnostics = [
    ...(projectRevision ? [] : ["Project storage revision is unavailable; this envelope set is session-scoped."]),
    ...(packageFreshness?.diagnostics ?? []),
  ];
  const sorted = envelopes.sort((left, right) => left.id.localeCompare(right.id));
  return {
    schemaVersion: STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA,
    generatedAt: input.generatedAt,
    project: {
      id: projectId,
      ...(projectRevision ? { revision: projectRevision } : {}),
      scope: projectRevision ? "saved" : "session",
    },
    producer: STUDIO_EVIDENCE_ENVELOPE_PRODUCER,
    summary: summarizeEnvelopes(sorted),
    envelopes: sorted,
    diagnostics: [...new Set(diagnostics)].sort((left, right) => left.localeCompare(right)),
  };
}

export function parseStudioEvidenceEnvelopeDocument(value: unknown): StudioEvidenceEnvelopeParseResult {
  const diagnostics: string[] = [];
  if (!isRecord(value)) {
    return { diagnostics: ["Studio evidence envelope document must be an object"] };
  }
  if (value.schemaVersion !== STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA) {
    diagnostics.push("Studio evidence envelope document schema is unsupported");
  }
  if (!isIsoDate(value.generatedAt)) diagnostics.push("Studio evidence envelope document generatedAt is invalid");
  const project = parseProject(value.project, diagnostics);
  const producer = parseProducer(value.producer, diagnostics);
  if (!Array.isArray(value.envelopes)) {
    diagnostics.push("Studio evidence envelope document envelopes must be an array");
  }
  const envelopes: EvidenceEnvelope[] = [];
  for (const item of Array.isArray(value.envelopes) ? value.envelopes : []) {
    const parsed = parseEvidenceEnvelope(item);
    diagnostics.push(...parsed.diagnostics);
    if (parsed.envelope) envelopes.push(parsed.envelope);
  }
  const summary = summarizeEnvelopes(envelopes);
  if (isRecord(value.summary) && !summariesEqual(value.summary, summary)) {
    diagnostics.push("Studio evidence envelope document summary does not match envelope freshness");
  }
  const documentDiagnostics = Array.isArray(value.diagnostics) && value.diagnostics.every((item) => typeof item === "string")
    ? [...value.diagnostics]
    : (diagnostics.push("Studio evidence envelope document diagnostics must be string[]"), []);
  if (diagnostics.length || !project || !producer) return { diagnostics };
  return {
    diagnostics: [],
    document: {
      schemaVersion: STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA,
      generatedAt: String(value.generatedAt),
      project,
      producer,
      summary,
      envelopes,
      diagnostics: documentDiagnostics,
    },
  };
}

export function packageEnvelopeSourceRevision(document: StudioEvidenceEnvelopeDocument): string | undefined {
  return document.envelopes.find((envelope) => envelope.subject.kind === "package")?.revisions.source;
}

export function assessStudioEvidenceEnvelopeDocument(document: StudioEvidenceEnvelopeDocument): StudioEvidenceEnvelopeAssessment {
  if (!document.envelopes.length) {
    return {
      status: "fail",
      state: "blocked",
      canExport: false,
      detail: "No revision-bound evidence envelopes were materialized.",
      blockedBy: ["evidence-envelopes:missing"],
    };
  }
  const stale = document.summary.stale + document.summary.missing + document.summary.unknown;
  if (stale || document.project.scope === "session") {
    const reasons = [
      ...(stale ? [`${stale} envelope(s) need freshness review`] : []),
      ...(document.project.scope === "session" ? ["project storage revision is unavailable"] : []),
    ];
    return {
      status: "warn",
      state: "partial",
      canExport: true,
      detail: `${document.summary.current}/${document.summary.total} envelope(s) current; ${reasons.join("; ")}.`,
      blockedBy: reasons,
    };
  }
  return {
    status: "ok",
    state: "exportable",
    canExport: true,
    detail: `${document.summary.current}/${document.summary.total} revision-bound envelope(s) current.`,
    blockedBy: [],
  };
}

function assessPackageFreshness(input: {
  packageAnalysis?: PackageAnalysisV1Result;
  currentPackageRevision?: string;
  currentPackageAvailable?: boolean;
}): { state: EvidenceEnvelopeFreshnessState; diagnostics: string[] } {
  const report = input.packageAnalysis;
  if (!report) {
    return { state: "unknown", diagnostics: [] };
  }
  if (input.currentPackageAvailable !== true) {
    return { state: "missing", diagnostics: ["Package analysis source package is not linked in the current Studio session."] };
  }
  if (!input.currentPackageRevision) {
    return { state: "unknown", diagnostics: ["Package analysis source revision is unavailable; freshness is unknown."] };
  }
  if (input.currentPackageRevision.toLowerCase() !== report.source.package.digest.toLowerCase()) {
    return {
      state: "stale",
      diagnostics: ["Package analysis source revision does not match the linked source package."],
    };
  }
  return { state: "current", diagnostics: [] };
}

function toEnvelopeFreshness(state: "current" | "stale" | "missing"): EvidenceEnvelopeFreshnessState {
  return state;
}

function summarizeEnvelopes(envelopes: readonly EvidenceEnvelope[]): StudioEvidenceEnvelopeDocument["summary"] {
  return envelopes.reduce(
    (counts, envelope) => {
      counts.total += 1;
      counts[envelope.observation.freshness.state] += 1;
      return counts;
    },
    { total: 0, current: 0, stale: 0, missing: 0, unknown: 0 },
  );
}

function summariesEqual(
  value: Record<string, unknown>,
  expected: StudioEvidenceEnvelopeDocument["summary"],
): boolean {
  return expected.total === Number(value.total)
    && expected.current === Number(value.current)
    && expected.stale === Number(value.stale)
    && expected.missing === Number(value.missing)
    && expected.unknown === Number(value.unknown);
}

function parseProject(value: unknown, diagnostics: string[]): StudioEvidenceEnvelopeDocument["project"] | undefined {
  if (!isRecord(value) || !nonEmptyString(value.id) || (value.scope !== "saved" && value.scope !== "session")) {
    diagnostics.push("Studio evidence envelope project is invalid");
    return undefined;
  }
  if (value.revision !== undefined && !nonEmptyString(value.revision)) {
    diagnostics.push("Studio evidence envelope project revision is invalid");
    return undefined;
  }
  return {
    id: String(value.id),
    ...(typeof value.revision === "string" && value.revision ? { revision: value.revision } : {}),
    scope: value.scope,
  };
}

function parseProducer(value: unknown, diagnostics: string[]): typeof STUDIO_EVIDENCE_ENVELOPE_PRODUCER | undefined {
  if (
    !isRecord(value)
    || value.id !== STUDIO_EVIDENCE_ENVELOPE_PRODUCER.id
    || value.version !== STUDIO_EVIDENCE_ENVELOPE_PRODUCER.version
    || value.revision !== STUDIO_EVIDENCE_ENVELOPE_PRODUCER.revision
  ) {
    diagnostics.push("Studio evidence envelope producer is unsupported");
    return undefined;
  }
  return STUDIO_EVIDENCE_ENVELOPE_PRODUCER;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

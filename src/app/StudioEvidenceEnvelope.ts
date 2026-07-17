import {
  assessGateEvidenceFreshness,
  type GateEvidenceResult,
} from "./GateEvidence";
import {
  createGateEvidenceEnvelope,
  createPackageAnalysisEvidenceEnvelope,
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
  const summary = envelopes.reduce(
    (counts, envelope) => {
      counts.total += 1;
      counts[envelope.observation.freshness.state] += 1;
      return counts;
    },
    { total: 0, current: 0, stale: 0, missing: 0, unknown: 0 },
  );
  return {
    schemaVersion: STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA,
    generatedAt: input.generatedAt,
    project: {
      id: projectId,
      ...(projectRevision ? { revision: projectRevision } : {}),
      scope: projectRevision ? "saved" : "session",
    },
    producer: STUDIO_EVIDENCE_ENVELOPE_PRODUCER,
    summary,
    envelopes: envelopes.sort((left, right) => left.id.localeCompare(right.id)),
    diagnostics: [...new Set(diagnostics)].sort((left, right) => left.localeCompare(right)),
  };
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

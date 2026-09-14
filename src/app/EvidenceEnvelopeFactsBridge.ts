/**
 * EvidenceEnvelopeFactsBridge/v1 (DA27-03).
 * Studio EvidenceEnvelope → core CommonEvidenceFacts without runtime imports in reverse.
 */

import type { EvidenceEnvelope } from "./EvidenceEnvelope";
import {
  createCommonEvidenceFacts,
  type CommonEvidenceFactFreshness,
  type CommonEvidenceFactStatus,
  type CommonEvidenceFacts,
  type CommonEvidenceSubject,
} from "../engine/CommonEvidenceFacts";

export const EVIDENCE_ENVELOPE_FACTS_BRIDGE_SCHEMA = "EvidenceEnvelopeFactsBridge/v1" as const;

export type EvidenceEnvelopeFactsBridgeResult = {
  schema: typeof EVIDENCE_ENVELOPE_FACTS_BRIDGE_SCHEMA;
  facts: CommonEvidenceFacts;
  envelopeDigest: string;
  diagnostics: string[];
};

export function commonFactsFromEvidenceEnvelope(
  envelope: EvidenceEnvelope,
): EvidenceEnvelopeFactsBridgeResult {
  const diagnostics: string[] = [];
  const subject = mapSubject(envelope);
  if (!subject.id) diagnostics.push("empty-subject-id");

  const facts = createCommonEvidenceFacts({
    subject,
    status: mapStatus(envelope.observation.status),
    freshness: mapFreshness(envelope.observation.freshness.state),
    observedAt: envelope.observation.observedAt,
    claimAllowed: ["studio envelope maps to common facts"],
    claimBlocked: ["envelope product UI is not a core dependency"],
    evidenceIds: [envelope.id, ...envelope.derivation.sourceIds],
    payload: {
      consumer: "studio-envelope",
      semanticDigest: envelope.observation.semanticDigest,
      artifactDigest: envelope.observation.artifactDigest,
      producerId: envelope.revisions.producer.id,
      producerRevision: envelope.revisions.producer.revision,
      projectId: envelope.revisions.project?.id ?? null,
      projectRevision: envelope.revisions.project?.revision ?? null,
    },
  });

  return {
    schema: EVIDENCE_ENVELOPE_FACTS_BRIDGE_SCHEMA,
    facts,
    envelopeDigest: envelope.digest.value,
    diagnostics,
  };
}

/** Runtime-side facts using the same envelope observation fields for parity checks. */
export function runtimeFactsFromEnvelopeObservation(input: {
  runtimeId: string;
  status: EvidenceEnvelope["observation"]["status"];
  freshness: EvidenceEnvelope["observation"]["freshness"]["state"];
  observedAt: string;
  semanticDigest: string;
  artifactDigest: string;
  evidenceIds: readonly string[];
}): CommonEvidenceFacts {
  return createCommonEvidenceFacts({
    subject: { kind: "runtime", id: input.runtimeId },
    status: mapStatus(input.status),
    freshness: mapFreshness(input.freshness),
    observedAt: input.observedAt,
    claimAllowed: ["runtime observation maps to common facts"],
    claimBlocked: ["runtime combat systems are not a core dependency"],
    evidenceIds: [...input.evidenceIds],
    payload: {
      consumer: "runtime-envelope",
      semanticDigest: input.semanticDigest,
      artifactDigest: input.artifactDigest,
    },
  });
}

function mapSubject(envelope: EvidenceEnvelope): CommonEvidenceSubject {
  const kind = envelope.subject.kind;
  let mapped: CommonEvidenceSubject["kind"] = "project";
  if (kind === "package" || kind === "asset" || kind === "runtime") {
    mapped = kind;
  } else if (kind === "gate" || kind === "contract" || kind === "snapshot" || kind === "artifact") {
    mapped = "tool";
  }
  const revision = kind === "package" || kind === "asset"
    ? envelope.revisions.source
    : envelope.revisions.project?.revision ?? envelope.revisions.source;
  return {
    kind: mapped,
    id: envelope.subject.id,
    revision,
  };
}

function mapStatus(status: EvidenceEnvelope["observation"]["status"]): CommonEvidenceFactStatus {
  return status;
}

function mapFreshness(
  state: EvidenceEnvelope["observation"]["freshness"]["state"],
): CommonEvidenceFactFreshness {
  return state;
}

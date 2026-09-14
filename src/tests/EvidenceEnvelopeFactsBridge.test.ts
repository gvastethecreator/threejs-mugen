import { describe, expect, it } from "vitest";
import { createEvidenceEnvelope } from "../app/EvidenceEnvelope";
import {
  commonFactsFromEvidenceEnvelope,
  runtimeFactsFromEnvelopeObservation,
} from "../app/EvidenceEnvelopeFactsBridge";

describe("EvidenceEnvelopeFactsBridge", () => {
  it("maps a studio envelope into common facts with stable digests", () => {
    const envelope = createEvidenceEnvelope({
      id: "env-1",
      subject: { kind: "package", id: "pkg-a" },
      provenance: {
        entityId: "entity",
        activityId: "activity",
        agentId: "agent",
      },
      revisions: {
        source: "src-1",
        producer: { id: "analyzer", version: "1.0.0", revision: "r1" },
        project: { id: "proj", revision: "3" },
      },
      derivation: { relation: "observed-from", sourceIds: ["s2", "s1"] },
      observation: {
        status: "passed",
        observedAt: "2026-07-26T22:00:00.000Z",
        freshness: { state: "current" },
        semanticDigest: "sem",
        artifactDigest: "art",
      },
      diagnostics: [],
    });
    const bridge = commonFactsFromEvidenceEnvelope(envelope);
    expect(bridge.facts.subject.kind).toBe("package");
    expect(bridge.facts.status).toBe("passed");
    expect(bridge.facts.payload.consumer).toBe("studio-envelope");
    expect(bridge.facts.subject.revision).toBe("src-1");
    expect(bridge.facts.payload.projectRevision).toBe("3");
    expect(bridge.envelopeDigest).toBe(envelope.digest.value);
    expect(bridge.facts.digest).toMatch(/^[0-9a-f]{8}$/);
  });

  it("binds package facts to the package source revision instead of project storage", () => {
    const envelope = createEvidenceEnvelope({
      id: "env-package",
      subject: { kind: "package", id: "fixture.zip" },
      provenance: {
        entityId: "entity",
        activityId: "activity",
        agentId: "agent",
      },
      revisions: {
        source: "b".repeat(64),
        producer: { id: "analyzer", version: "1.0.0", revision: "r1" },
        project: { id: "proj", revision: "3" },
      },
      derivation: { relation: "observed-from", sourceIds: ["s1"] },
      observation: {
        status: "passed",
        observedAt: "2026-07-26T22:00:00.000Z",
        freshness: { state: "current" },
        semanticDigest: "sem",
        artifactDigest: "art",
      },
      diagnostics: [],
    });
    const bridge = commonFactsFromEvidenceEnvelope(envelope);
    expect(bridge.facts.subject.kind).toBe("package");
    expect(bridge.facts.subject.revision).toBe("b".repeat(64));
    expect(bridge.facts.payload.projectRevision).toBe("3");
  });

  it("builds runtime observation facts from the same observation fields", () => {
    const facts = runtimeFactsFromEnvelopeObservation({
      runtimeId: "rt-1",
      status: "passed",
      freshness: "current",
      observedAt: "2026-07-26T22:00:00.000Z",
      semanticDigest: "sem",
      artifactDigest: "art",
      evidenceIds: ["e1"],
    });
    expect(facts.subject.kind).toBe("runtime");
    expect(facts.payload.consumer).toBe("runtime-envelope");
  });
});

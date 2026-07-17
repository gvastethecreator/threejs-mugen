import { describe, expect, it } from "vitest";
import {
  EVIDENCE_ENVELOPE_CANONICALIZATION,
  EVIDENCE_ENVELOPE_SCHEMA,
  canonicalizeEvidenceEnvelope,
  createEvidenceEnvelope,
  createGateEvidenceEnvelope,
  createPackageAnalysisEvidenceEnvelope,
  parseEvidenceEnvelope,
  sha256Hex,
} from "../app/EvidenceEnvelope";
import { createGateEvidenceResult } from "../app/GateEvidence";
import type { PackageAnalysisV1Result } from "../mugen/compatibility/PackageAnalysis";

describe("EvidenceEnvelope", () => {
  it("uses a real SHA-256 digest for canonical bytes", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("adapts GateEvidence and PackageAnalysis into the same facts envelope", () => {
    const gate = createGateEvidenceEnvelope({
      result: createGateEvidenceResult({
        id: "gate:test",
        gateId: "test",
        label: "Test gate",
        status: "passed",
        intent: "release",
        command: "pnpm run check:test",
        tool: { name: "vitest", version: "4.1.9" },
        observedAt: "2026-07-16T12:00:00.000Z",
        sourceRevision: "source:abc",
        target: { kind: "gate", id: "test" },
        freshness: { maxAgeMs: 60_000 },
        diagnostics: [],
      }),
      producerRevision: "producer:def",
      artifactDigest: "a".repeat(64),
      freshnessState: "current",
      project: { id: "project:test", revision: "7" },
    });
    const packageEnvelope = createPackageAnalysisEvidenceEnvelope({
      report: {
        schemaVersion: "mugen-web-sandbox/package-analysis/v1",
        observedAt: "2026-07-16T12:00:00.000Z",
        analyzer: { id: "analyzer:test", version: "1.0.0" },
        ruleset: { id: "rules:test", version: "1.0.0" },
        upstream: { project: "ikemen-engine/Ikemen-GO", revision: "upstream:abc" },
        source: {
          name: "fixture.zip",
          package: { algorithm: "sha-256", digest: "b".repeat(64) },
          fileCount: 1,
          byteLength: 12,
          files: [{ path: "chars/test.def", digest: "c".repeat(64), byteLength: 12 }],
        },
        analysis: { status: "recognized", diagnostics: [] },
        semanticDigest: "semantic:test",
        checksum: "checksum:test",
      } as unknown as PackageAnalysisV1Result,
      sourceRevision: "package-source:abc",
      producerRevision: "producer:def",
      freshnessState: "current",
    });

    expect(gate.schemaVersion).toBe(EVIDENCE_ENVELOPE_SCHEMA);
    expect(gate.canonicalization).toBe(EVIDENCE_ENVELOPE_CANONICALIZATION);
    expect(gate.revisions.producer.revision).toBe("producer:def");
    expect(gate.observation.artifactDigest).toBe("a".repeat(64));
    expect(packageEnvelope.subject.kind).toBe("package");
    expect(packageEnvelope.observation.status).toBe("passed");
    expect(parseEvidenceEnvelope(gate).diagnostics).toEqual([]);
    expect(parseEvidenceEnvelope(packageEnvelope).diagnostics).toEqual([]);
  });

  it("canonicalizes order and rejects tamper or deleted facts", () => {
    const base = createEvidenceEnvelope({
      id: "evidence-envelope:test",
      subject: { kind: "artifact", id: "artifact:test" },
      provenance: { entityId: "entity:test", activityId: "activity:test", agentId: "agent:test" },
      revisions: {
        source: "source:test",
        producer: { id: "producer:test", version: "1.0.0", revision: "revision:test" },
      },
      derivation: { relation: "derived-from", sourceIds: ["source:b", "source:a"] },
      observation: {
        status: "passed",
        observedAt: "2026-07-16T12:00:00.000Z",
        freshness: { state: "current" },
        semanticDigest: "semantic:test",
        artifactDigest: "d".repeat(64),
      },
      diagnostics: ["warning:b", "warning:a"],
    });
    const reordered = createEvidenceEnvelope({
      ...base,
      derivation: { ...base.derivation, sourceIds: ["source:a", "source:b"] },
      diagnostics: ["warning:a", "warning:b"],
    });
    expect(canonicalizeEvidenceEnvelope(base)).toBe(canonicalizeEvidenceEnvelope(reordered));
    expect(base.digest.value).toBe(reordered.digest.value);

    const tampered = structuredClone(base);
    tampered.observation.semanticDigest = "semantic:tampered";
    expect(parseEvidenceEnvelope(tampered).diagnostics).toContain("Evidence envelope digest mismatch");

    const deleted = structuredClone(base) as Record<string, unknown>;
    delete (deleted.provenance as Record<string, unknown>).agentId;
    expect(parseEvidenceEnvelope(deleted).diagnostics).toContain("Evidence envelope provenance is invalid");
  });
});

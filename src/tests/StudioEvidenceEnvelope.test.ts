import { describe, expect, it } from "vitest";
import { createGateEvidenceResult } from "../app/GateEvidence";
import { parseEvidenceEnvelope } from "../app/EvidenceEnvelope";
import {
  assessStudioEvidenceEnvelopeDocument,
  createStudioEvidenceEnvelopeDocument,
  STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA,
} from "../app/StudioEvidenceEnvelope";
import type { PackageAnalysisV1Result } from "../mugen/compatibility/PackageAnalysis";

function createGate() {
  return createGateEvidenceResult({
    id: "gate:test",
    gateId: "test",
    label: "Test gate",
    status: "passed",
    intent: "release",
    command: "pnpm run check:test",
    tool: { name: "vitest", version: "4.1.9" },
    observedAt: "2026-07-16T12:00:00.000Z",
    sourceRevision: "source:test",
    target: { kind: "gate", id: "test" },
    freshness: { maxAgeMs: 60_000 },
    diagnostics: [],
  });
}

function createPackageAnalysis(): PackageAnalysisV1Result {
  return {
    schemaVersion: "mugen-web-sandbox/package-analysis/v1",
    observedAt: "2026-07-16T12:00:00.000Z",
    analyzer: { id: "analyzer:test", version: "1.0.0" },
    ruleset: { id: "rules:test", version: "1.0.0" },
    upstream: { project: "ikemen-engine/Ikemen-GO", revision: "upstream:test" },
    source: {
      name: "fixture.zip",
      package: { algorithm: "sha-256", digest: "b".repeat(64) },
      fileCount: 1,
      byteLength: 12,
      files: [{ path: "chars/test.def", digest: "c".repeat(64), byteLength: 12 }],
    },
    analysis: {
      schemaVersion: "mugen-web-sandbox/package-analysis/v0",
      sourceName: "fixture.zip",
      generatedAt: "2026-07-16T12:00:00.000Z",
      status: "recognized",
      profiles: {
        mugen: { profile: "mugen-1.0", versions: ["1.0"] },
        ikemen: { profile: "ikemen-go-scan", detected: false, findingCount: 0, claim: "scanner-only" },
      },
      files: [{ path: "chars/test.def", bytes: 12, roles: ["character"] }],
      findings: [],
      summary: {
        fileCount: 1,
        recognizedFileCount: 1,
        unknownFileCount: 0,
        entrypointCount: 1,
        findingCount: 0,
        byStatus: { recognized: 0, unsupported: 0, unknown: 0 },
        byCategory: { package: 0, character: 0, stage: 0, system: 0, screenpack: 0 },
      },
      claims: { allowed: [], blocked: [] },
      diagnostics: [],
      checksum: "checksum:test",
    },
    semanticDigest: "semantic:test",
    checksum: "checksum:v1:test",
  };
}

describe("StudioEvidenceEnvelope", () => {
  it("materializes current saved-project facts and preserves envelope parsing", () => {
    const document = createStudioEvidenceEnvelopeDocument({
      generatedAt: "2026-07-16T12:00:00.000Z",
      projectId: "project:test",
      projectRevision: 3,
      gates: [createGate()],
      packageAnalysis: createPackageAnalysis(),
      currentPackageRevision: "b".repeat(64),
      currentPackageAvailable: true,
      now: Date.parse("2026-07-16T12:00:00.000Z"),
    });

    expect(document.schemaVersion).toBe(STUDIO_EVIDENCE_ENVELOPE_DOCUMENT_SCHEMA);
    expect(document.project).toEqual({ id: "project:test", revision: "3", scope: "saved" });
    expect(document.summary).toEqual({ total: 2, current: 2, stale: 0, missing: 0, unknown: 0 });
    expect(document.envelopes.every((envelope) => parseEvidenceEnvelope(envelope).envelope)).toBe(true);
    expect(assessStudioEvidenceEnvelopeDocument(document)).toMatchObject({ status: "ok", state: "exportable", canExport: true });
  });

  it("keeps session scope and source freshness visible instead of promoting stale facts", () => {
    const document = createStudioEvidenceEnvelopeDocument({
      generatedAt: "2026-07-16T12:00:00.000Z",
      projectId: "project:test",
      gates: [createGate()],
      packageAnalysis: createPackageAnalysis(),
      currentPackageRevision: "d".repeat(64),
      currentPackageAvailable: true,
      now: Date.parse("2026-07-16T12:00:00.000Z"),
    });

    expect(document.project.scope).toBe("session");
    expect(document.summary).toEqual({ total: 2, current: 1, stale: 1, missing: 0, unknown: 0 });
    expect(document.diagnostics).toContain("Package analysis source revision does not match the linked source package.");
    expect(assessStudioEvidenceEnvelopeDocument(document)).toMatchObject({ status: "warn", state: "partial", canExport: true });
  });
});

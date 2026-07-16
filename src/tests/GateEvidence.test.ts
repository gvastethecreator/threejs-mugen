import { describe, expect, it } from "vitest";
import {
  assessGateEvidenceFreshness,
  createGateEvidenceDocument,
  createGateEvidenceResult,
  isGateEvidenceExportable,
  parseGateEvidenceDocument,
  type GateEvidenceResult,
} from "../app/GateEvidence";

describe("GateEvidence", () => {
  it("creates a deterministic result digest from the executable evidence payload", () => {
    const first = result();
    const second = result();

    expect(first.digest).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
    expect(second.digest).toBe(first.digest);
  });

  it("parses a valid document and preserves the release intent", () => {
    const parsed = parseGateEvidenceDocument(document());

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.document?.results[0]).toMatchObject({
      gateId: "architecture-boundaries",
      status: "passed",
      intent: "release",
    });
  });

  it("rejects tampered result payloads before Studio can consume them", () => {
    const tampered = document();
    tampered.results[0] = { ...tampered.results[0]!, command: "pnpm run changed" };

    expect(parseGateEvidenceDocument(tampered).diagnostics).toContain("Gate evidence result 0 digest mismatch");
  });

  it("classifies current and stale observations against the declared max age", () => {
    const current = result({ observedAt: "2026-07-16T00:00:00.000Z" });
    const now = Date.parse("2026-07-16T12:00:00.000Z");

    expect(assessGateEvidenceFreshness(current, now).state).toBe("current");
    expect(assessGateEvidenceFreshness({ ...current, freshness: { maxAgeMs: 1_000 } }, now).state).toBe("stale");
  });

  it("does not export diagnostic evidence as release evidence", () => {
    const diagnostic = result({ intent: "diagnostic" });
    const freshness = assessGateEvidenceFreshness(diagnostic, Date.parse(diagnostic.observedAt));

    expect(isGateEvidenceExportable(diagnostic, freshness)).toBe(false);
  });

  it("fails closed for missing observations and duplicate gate identities", () => {
    const missing = result({ status: "missing" });
    const duplicate = {
      ...document(),
      results: [result(), result({ id: "gate-evidence:architecture-boundaries-2" })],
    };

    expect(assessGateEvidenceFreshness(missing, Date.now()).state).toBe("missing");
    expect(parseGateEvidenceDocument(duplicate).diagnostics).toContain("Duplicate gate evidence gateId architecture-boundaries");
  });
});

function result(overrides: Partial<GateEvidenceResult> = {}): GateEvidenceResult {
  return createGateEvidenceResult({
    id: "gate-evidence:architecture-boundaries",
    gateId: "architecture-boundaries",
    label: "Architecture Boundaries",
    status: "passed",
    intent: "release",
    command: "pnpm run check:boundaries",
    tool: { name: "check_boundaries.cjs", version: "repository-script/v1" },
    observedAt: "2026-07-16T00:00:00.000Z",
    sourceRevision: "d69d12a4058c5654b99787a23499a60925b9d85c",
    target: { kind: "contract", id: "test:architecture-boundaries" },
    freshness: { maxAgeMs: 604_800_000 },
    diagnostics: [],
    ...overrides,
  });
}

function document() {
  return createGateEvidenceDocument({
    generatedAt: "2026-07-16T00:00:00.000Z",
    sourceRevision: "d69d12a4058c5654b99787a23499a60925b9d85c",
    results: [result()],
  });
}

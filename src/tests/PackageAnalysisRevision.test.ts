import { describe, expect, it } from "vitest";
import {
  createPackageAnalysisRevision,
  diffPackageAnalysisRevisions,
} from "../mugen/compatibility/PackageAnalysisRevision";

describe("PackageAnalysisRevision", () => {
  it("creates deterministic revision digests regardless of finding insertion order", () => {
    const left = createPackageAnalysisRevision({
      id: "rev-a",
      sourceName: "kfm",
      analysisChecksum: "chk-1",
      analyzerVersion: "1.0.0",
      rulesetVersion: "1.0.0",
      upstreamRevision: "05b7d98a",
      status: "recognized",
      findings: [
        { id: "f2", status: "unsupported", feature: "select.def", category: "system" },
        { id: "f1", status: "recognized", feature: "statedef", category: "character" },
      ],
      generatedAt: "2026-07-26T20:00:00.000Z",
    });
    const right = createPackageAnalysisRevision({
      id: "rev-a",
      sourceName: "kfm",
      analysisChecksum: "chk-1",
      analyzerVersion: "1.0.0",
      rulesetVersion: "1.0.0",
      upstreamRevision: "05b7d98a",
      status: "recognized",
      findings: [
        { id: "f1", status: "recognized", feature: "statedef", category: "character" },
        { id: "f2", status: "unsupported", feature: "select.def", category: "system" },
      ],
      generatedAt: "2026-07-26T20:00:00.000Z",
    });
    expect(left.revisionDigest).toBe(right.revisionDigest);
    expect(left.findings.map((f) => f.id)).toEqual(["f1", "f2"]);
  });

  it("diffs add/remove/change/downgrade between two fixed analyses", () => {
    const base = createPackageAnalysisRevision({
      id: "rev-1",
      sourceName: "pkg",
      analysisChecksum: "a",
      analyzerVersion: "1.0.0",
      rulesetVersion: "1.0.0",
      upstreamRevision: "05b",
      status: "recognized",
      findings: [
        { id: "keep", status: "recognized", feature: "air", category: "character" },
        { id: "gone", status: "recognized", feature: "old", category: "character" },
        { id: "down", status: "recognized", feature: "tag", category: "system" },
      ],
      generatedAt: "2026-07-26T20:00:00.000Z",
    });
    const next = createPackageAnalysisRevision({
      id: "rev-2",
      sourceName: "pkg",
      analysisChecksum: "b",
      analyzerVersion: "1.0.0",
      rulesetVersion: "1.1.0",
      upstreamRevision: "05b",
      status: "partial",
      findings: [
        { id: "keep", status: "recognized", feature: "air", category: "character" },
        { id: "new", status: "unsupported", feature: "newfx", category: "system" },
        { id: "down", status: "unknown", feature: "tag", category: "system" },
        { id: "chg", status: "recognized", feature: "helper", category: "character" },
      ],
      generatedAt: "2026-07-26T21:00:00.000Z",
    });
    const diff = diffPackageAnalysisRevisions(base, next);
    expect(diff.meta.rulesetChanged).toBe(true);
    expect(diff.meta.statusTransition).toBe("recognized->partial");
    expect(diff.summary.add).toBeGreaterThanOrEqual(2);
    expect(diff.summary.remove).toBe(1);
    expect(diff.summary.downgrade).toBe(1);
    expect(diff.summary.unchanged).toBe(1);
    expect(diff.checksum).toMatch(/^[0-9a-f]{8}$/);
  });
});

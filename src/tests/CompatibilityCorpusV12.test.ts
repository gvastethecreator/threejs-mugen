import { describe, expect, it } from "vitest";
import { materializeCompatibilityCorpusV12 } from "../mugen/compatibility/CompatibilityCorpusV12";

describe("CompatibilityCorpusV12", () => {
  it("passes when HEAD, ruleset, age, and required artifacts match", () => {
    const result = materializeCompatibilityCorpusV12({
      snapshotId: "corpus-v1.2",
      headSha: "abc123",
      rulesetId: "rules",
      rulesetVersion: "1.2.0",
      generatedAt: "2026-07-26T18:00:00.000Z",
      now: "2026-07-26T20:00:00.000Z",
      maxAgeHours: 24,
      expectedHeadSha: "abc123",
      expectedRulesetVersion: "1.2.0",
      artifacts: [
        { id: "trace", path: "docs/evidence/t.json", checksum: "h1", required: true },
        { id: "opt", path: "docs/evidence/opt.json", checksum: "h2", required: false },
      ],
      probe: (path) => {
        if (path.endsWith("/t.json") || path === "docs/evidence/t.json") {
          return { exists: true, contentDigest: "h1" };
        }
        if (path.endsWith("opt.json")) return { exists: false };
        return { exists: false };
      },
      claims: {
        allowed: ["v1.2 freshness gate"],
        blocked: ["score movement"],
      },
    });
    expect(result.status).toBe("passed");
    expect(result.diagnostics).toEqual([]);
    expect(result.artifactStatuses.find((a) => a.id === "trace")?.status).toBe("present");
    expect(result.checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it("fails closed on head drift, stale age, missing required artifact, and hash mismatch", () => {
    const result = materializeCompatibilityCorpusV12({
      snapshotId: "corpus-v1.2-bad",
      headSha: "old",
      rulesetId: "rules",
      rulesetVersion: "1.0.0",
      generatedAt: "2026-07-01T00:00:00.000Z",
      now: "2026-07-26T00:00:00.000Z",
      maxAgeHours: 48,
      expectedHeadSha: "new",
      expectedRulesetVersion: "1.2.0",
      artifacts: [
        { id: "trace", path: "a.json", checksum: "want", required: true },
        { id: "bad", path: "b.json", checksum: "want", required: true },
      ],
      probe: (path) => {
        if (path === "b.json") return { exists: true, contentDigest: "other" };
        return { exists: false };
      },
      claims: { allowed: [], blocked: [] },
    });
    expect(result.status).toBe("failed");
    expect(result.diagnostics.some((d) => d.startsWith("head-mismatch"))).toBe(true);
    expect(result.diagnostics.some((d) => d.startsWith("ruleset-mismatch"))).toBe(true);
    expect(result.diagnostics.some((d) => d.startsWith("stale-age"))).toBe(true);
    expect(result.diagnostics).toContain("artifact-missing:trace");
    expect(result.diagnostics).toContain("artifact-hash-mismatch:bad");
  });
});

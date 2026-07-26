import { describe, expect, it } from "vitest";
import {
  adjudicateScores,
  buildCurrentScoreAdjudication,
  FROZEN_SCORECARD,
} from "../mugen/compatibility/ScoreAdjudication";

describe("ScoreAdjudication", () => {
  it("holds the frozen scorecard with independent evidence and no movement", () => {
    const report = buildCurrentScoreAdjudication({
      adjudicatedAt: "2026-07-26T21:00:00.000Z",
      formalSha: "7d9b15f828934a7a25f445b44d72e01cd471027e",
      globalSha: "7d9b15f828934a7a25f445b44d72e01cd471027e",
      evidenceByLane: {
        sandbox: {
          sha: "7d9b15f8",
          refs: ["docs/research/2026-07-26-global-checkpoint-after-t406.md"],
        },
        studio: {
          sha: "8fa01514",
          refs: ["docs/evidence/da26-13-browser/browser-gate-report-v1.json"],
        },
      },
    });
    expect(report.movement).toBe("none");
    expect(report.scorecard).toEqual(FROZEN_SCORECARD);
    expect(report.rows.find((row) => row.lane === "sandbox")?.docsOnly).toBe(false);
    expect(report.rows.find((row) => row.lane === "mugenLite")?.docsOnly).toBe(true);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it("blocks docs-only raises and score inflation", () => {
    const report = adjudicateScores({
      adjudicatedAt: "2026-07-26T21:00:00.000Z",
      formalSha: "7d9b15f8",
      globalSha: "7d9b15f8",
      previousScorecard: FROZEN_SCORECARD,
      rows: [
        {
          lane: "sandbox",
          score: "99",
          denominator: "fake",
          evidenceSha: "x",
          evidenceRefs: ["docs/only.md"],
          docsOnly: true,
          decision: "raise",
          rationale: "docs alone",
        },
        {
          lane: "mugenLite",
          score: "50",
          denominator: "d",
          evidenceSha: "y",
          evidenceRefs: ["trace"],
          docsOnly: false,
          decision: "raise",
          rationale: "inflate",
        },
        {
          lane: "mugenMvp",
          score: "20",
          denominator: "d",
          evidenceSha: "z",
          evidenceRefs: ["e"],
          docsOnly: false,
          decision: "hold",
          rationale: "hold",
        },
        {
          lane: "mugenFull",
          score: "10-12",
          denominator: "d",
          evidenceSha: "z",
          evidenceRefs: ["e"],
          docsOnly: false,
          decision: "hold",
          rationale: "hold",
        },
        {
          lane: "ikemen",
          score: "6-8",
          denominator: "d",
          evidenceSha: "z",
          evidenceRefs: ["e"],
          docsOnly: false,
          decision: "hold",
          rationale: "hold",
        },
        {
          lane: "studio",
          score: "25",
          denominator: "d",
          evidenceSha: "z",
          evidenceRefs: ["e"],
          docsOnly: false,
          decision: "hold",
          rationale: "hold",
        },
      ],
    });
    expect(report.diagnostics).toContain("docs-only-raise-blocked:sandbox");
    expect(report.diagnostics.some((d) => d.startsWith("movement-blocked:mugenLite"))).toBe(true);
    expect(report.scorecard.mugenLite).toBe("36");
    expect(report.movement).toBe("none");
  });
});

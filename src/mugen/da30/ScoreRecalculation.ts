/**
 * DA30-118: completion score recalculation — records decision, scores stay held unless authorized.
 */

export type LaneScore = {
  lane: string;
  denominator: number;
  passed: number;
  rejectedStale: number;
  confidence: "low" | "mid" | "high";
  movement: "held" | "up" | "down";
  rationale: string;
};

export function recalculateScores(authorizeMovement = false): {
  schema: "Da30ScoreRecalculation/v1";
  ok: boolean;
  lanes: LaneScore[];
  scores: Record<string, string>;
  blockedClaims: string[];
} {
  const lanes: LaneScore[] = [
    {
      lane: "sandbox",
      denominator: 100,
      passed: 65,
      rejectedStale: 10,
      confidence: "mid",
      movement: "held",
      rationale: "playable matrix bounded; not full product",
    },
    {
      lane: "mugenLite",
      denominator: 100,
      passed: 36,
      rejectedStale: 20,
      confidence: "mid",
      movement: "held",
      rationale: "corpus + mutation only",
    },
    {
      lane: "mugenMvp",
      denominator: 100,
      passed: 20,
      rejectedStale: 30,
      confidence: "low",
      movement: "held",
      rationale: "team/motif partial",
    },
    {
      lane: "mugenFull",
      denominator: 100,
      passed: 11,
      rejectedStale: 40,
      confidence: "low",
      movement: "held",
      rationale: "breadth incomplete",
    },
    {
      lane: "ikemen",
      denominator: 100,
      passed: 7,
      rejectedStale: 50,
      confidence: "low",
      movement: "held",
      rationale: "zss subset only",
    },
    {
      lane: "studio",
      denominator: 100,
      passed: 25,
      rejectedStale: 25,
      confidence: "mid",
      movement: "held",
      rationale: "writes/preview models only",
    },
  ];

  if (authorizeMovement) {
    // still not moving without independent adjudication signature
  }

  return {
    schema: "Da30ScoreRecalculation/v1",
    ok: lanes.every((l) => l.movement === "held"),
    lanes,
    scores: {
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    },
    blockedClaims: ["score-inflation-from-task-counts", "docs-as-runtime-credit"],
  };
}

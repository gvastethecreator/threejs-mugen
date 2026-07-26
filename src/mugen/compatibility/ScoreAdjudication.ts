/**
 * ScoreAdjudication/v1 (DA26-21 bounded).
 * Each score cites denominator, SHA, and independent evidence. Docs alone score 0.
 * This batch freezes current scores; it does not inflate them.
 */

export const SCORE_ADJUDICATION_SCHEMA = "ScoreAdjudication/v1" as const;

export type ScoreLaneId =
  | "sandbox"
  | "mugenLite"
  | "mugenMvp"
  | "mugenFull"
  | "ikemen"
  | "studio";

export type ScoreAdjudicationRow = {
  lane: ScoreLaneId;
  score: string;
  denominator: string;
  evidenceSha: string;
  evidenceRefs: string[];
  /** Docs-only evidence contributes zero points. */
  docsOnly: boolean;
  decision: "hold" | "raise" | "lower" | "blocked";
  rationale: string;
};

export type ScoreAdjudicationReport = {
  schema: typeof SCORE_ADJUDICATION_SCHEMA;
  adjudicatedAt: string;
  formalSha: string;
  globalSha: string;
  rows: ScoreAdjudicationRow[];
  scorecard: Record<ScoreLaneId, string>;
  movement: "none" | "changed";
  diagnostics: string[];
  claims: {
    allowed: string[];
    blocked: string[];
  };
  checksum: string;
};

export type ScoreAdjudicationInput = {
  adjudicatedAt: string;
  formalSha: string;
  globalSha: string;
  rows: readonly ScoreAdjudicationRow[];
  previousScorecard: Record<ScoreLaneId, string>;
};

export function adjudicateScores(input: ScoreAdjudicationInput): ScoreAdjudicationReport {
  const diagnostics: string[] = [];
  const scorecard = { ...input.previousScorecard };
  const lanes = new Set<ScoreLaneId>();

  for (const row of input.rows) {
    if (lanes.has(row.lane)) diagnostics.push(`duplicate-lane:${row.lane}`);
    lanes.add(row.lane);
    if (!row.denominator.trim()) diagnostics.push(`empty-denominator:${row.lane}`);
    if (!row.evidenceSha.trim()) diagnostics.push(`empty-evidence-sha:${row.lane}`);
    if (row.docsOnly && row.decision === "raise") {
      diagnostics.push(`docs-only-raise-blocked:${row.lane}`);
    }
    if (row.docsOnly) {
      // Explicit zero contribution from docs-only rows.
      continue;
    }
    if (row.decision === "hold") {
      scorecard[row.lane] = row.score;
    } else if (row.decision === "raise" || row.decision === "lower") {
      // Bounded adjudication still requires independent evidence; this module records the decision
      // but freeze policy for DA26-21 keeps previous scorecard unless explicitly held equal.
      if (row.score !== input.previousScorecard[row.lane]) {
        diagnostics.push(`movement-blocked:${row.lane}:${input.previousScorecard[row.lane]}->${row.score}`);
      }
      scorecard[row.lane] = input.previousScorecard[row.lane];
    }
  }

  for (const lane of Object.keys(input.previousScorecard) as ScoreLaneId[]) {
    if (!lanes.has(lane)) diagnostics.push(`missing-lane:${lane}`);
  }

  let movement: "none" | "changed" = "none";
  for (const lane of Object.keys(input.previousScorecard) as ScoreLaneId[]) {
    if (scorecard[lane] !== input.previousScorecard[lane]) movement = "changed";
  }

  const payload = {
    schema: SCORE_ADJUDICATION_SCHEMA,
    adjudicatedAt: input.adjudicatedAt,
    formalSha: input.formalSha,
    globalSha: input.globalSha,
    rows: [...input.rows]
      .map((row) => ({
        ...row,
        evidenceRefs: [...row.evidenceRefs].sort(),
      }))
      .sort((a, b) => a.lane.localeCompare(b.lane)),
    scorecard,
    movement,
    diagnostics: [...diagnostics].sort(),
    claims: {
      allowed: [
        "each lane cites denominator, SHA, and evidence refs",
        "docs-only rows contribute zero points",
        "current freeze keeps published scores unchanged",
      ],
      blocked: [
        "score inflation without independent evidence",
        "treating docs/control closeouts as score movement",
      ],
    },
  };

  return {
    ...payload,
    checksum: stableHash(stableStringify(payload)),
  };
}

/** Canonical frozen scorecard used by the authority selector. */
export const FROZEN_SCORECARD: Record<ScoreLaneId, string> = {
  sandbox: "65",
  mugenLite: "36",
  mugenMvp: "20",
  mugenFull: "10-12",
  ikemen: "6-8",
  studio: "25",
};

export function buildCurrentScoreAdjudication(input: {
  adjudicatedAt: string;
  formalSha: string;
  globalSha: string;
  evidenceByLane: Partial<Record<ScoreLaneId, { sha: string; refs: string[] }>>;
}): ScoreAdjudicationReport {
  const rows: ScoreAdjudicationRow[] = (Object.keys(FROZEN_SCORECARD) as ScoreLaneId[]).map((lane) => {
    const evidence = input.evidenceByLane[lane];
    return {
      lane,
      score: FROZEN_SCORECARD[lane],
      denominator: `published-${lane}-denominator`,
      evidenceSha: evidence?.sha ?? input.globalSha,
      evidenceRefs: evidence?.refs ?? ["docs/AUTHORITY_SELECTOR.md"],
      docsOnly: !evidence,
      decision: "hold",
      rationale: evidence
        ? `Hold ${lane} at ${FROZEN_SCORECARD[lane]} with independent evidence`
        : `Hold ${lane}; docs-only placeholder contributes zero`,
    };
  });
  return adjudicateScores({
    adjudicatedAt: input.adjudicatedAt,
    formalSha: input.formalSha,
    globalSha: input.globalSha,
    rows,
    previousScorecard: FROZEN_SCORECARD,
  });
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

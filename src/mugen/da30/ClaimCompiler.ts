/**
 * DA30-019: compile allowed claims from passed clauses ∩ claim ceiling.
 */

export type ClauseResult = {
  id: string;
  status: "pass" | "fail" | "unknown" | "stale";
  claim: string;
};

export function compileClaims(input: {
  claimCeiling: string;
  clauseResults: ClauseResult[];
  scoreAdjudicationPassed?: boolean;
  releaseAdjudicationPassed?: boolean;
}): { allowed: string[]; blocked: string[] } {
  const allowed: string[] = [];
  const blocked: string[] = [];
  const ceiling = input.claimCeiling.toLowerCase();

  for (const c of input.clauseResults) {
    if (c.status === "pass") {
      // score/release need own adjudication
      if (/score/.test(c.claim.toLowerCase()) && !input.scoreAdjudicationPassed) {
        blocked.push(`${c.id}: score claim without score adjudication`);
        continue;
      }
      if (/release/.test(c.claim.toLowerCase()) && !input.releaseAdjudicationPassed) {
        blocked.push(`${c.id}: release claim without release adjudication`);
        continue;
      }
      // widening check
      if (/score movement|raise scores/.test(c.claim.toLowerCase()) && /held|inventory|design only/.test(ceiling)) {
        blocked.push(`${c.id}: claim widening`);
        continue;
      }
      allowed.push(c.claim);
    } else if (c.status === "stale") {
      blocked.push(`${c.id}: stale clause blocks claim`);
    } else if (c.status === "fail" || c.status === "unknown") {
      blocked.push(`${c.id}: ${c.status} clause blocks claim`);
    }
  }
  return { allowed, blocked };
}

/**
 * DA31-004: clause evaluation status (no fixed accepted map).
 */

export type ClauseResult = {
  clauseId: string;
  subjectSha: string;
  evidenceDigest: string;
  lineageOk: boolean;
  failurePathExercised: boolean;
  liveConsumer: boolean;
  reviewerVerdict: "pass" | "fail" | "unknown";
};

export type TaskVerdict = {
  taskId: string;
  status: "accepted" | "partial" | "open" | "rejected";
  reasons: string[];
  clauses: ClauseResult[];
};

export type EvaluateInput = {
  taskId: string;
  requiredClauseIds: string[];
  results: ClauseResult[];
  /** Forbidden promotion patterns */
  flags?: {
    fixedTrue?: boolean;
    nonEmptyOutputOnly?: boolean;
    selfAttestation?: boolean;
    clauseDeleted?: boolean;
    staleSha?: boolean;
    modelOnlyConsumer?: boolean;
  };
};

export function evaluateTaskVerdict(input: EvaluateInput): TaskVerdict {
  const reasons: string[] = [];
  const f = input.flags ?? {};

  if (f.fixedTrue) reasons.push("fixed-true-map");
  if (f.nonEmptyOutputOnly) reasons.push("non-empty-output-only");
  if (f.selfAttestation) reasons.push("self-attestation");
  if (f.clauseDeleted) reasons.push("clause-deleted");
  if (f.staleSha) reasons.push("stale-sha");
  if (f.modelOnlyConsumer) reasons.push("model-only-consumer");

  if (reasons.length) {
    return {
      taskId: input.taskId,
      status: "rejected",
      reasons,
      clauses: input.results,
    };
  }

  const byId = new Map(input.results.map((r) => [r.clauseId, r]));
  let pass = 0;
  let fail = 0;
  let unknown = 0;
  for (const id of input.requiredClauseIds) {
    const r = byId.get(id);
    if (!r) {
      unknown += 1;
      reasons.push(`missing-clause:${id}`);
      continue;
    }
    if (!r.lineageOk) {
      fail += 1;
      reasons.push(`lineage:${id}`);
      continue;
    }
    if (!r.failurePathExercised) {
      fail += 1;
      reasons.push(`no-failure-path:${id}`);
      continue;
    }
    if (!r.liveConsumer) {
      fail += 1;
      reasons.push(`no-live-consumer:${id}`);
      continue;
    }
    if (r.reviewerVerdict === "pass") pass += 1;
    else if (r.reviewerVerdict === "fail") {
      fail += 1;
      reasons.push(`reviewer-fail:${id}`);
    } else {
      unknown += 1;
      reasons.push(`unknown:${id}`);
    }
  }

  let status: TaskVerdict["status"] = "open";
  if (fail > 0 && pass === 0 && unknown === 0) status = "rejected";
  else if (pass === input.requiredClauseIds.length && fail === 0 && unknown === 0) status = "accepted";
  else if (pass > 0) status = "partial";
  else status = "open";

  return { taskId: input.taskId, status, reasons, clauses: input.results };
}

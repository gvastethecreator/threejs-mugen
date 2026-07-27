/**
 * DA30-073: transactional save/write — prepare/validate/commit/journal/rollback.
 */

export type WriteJournal = {
  schema: "Da30TransactionalWrite/v1";
  baseRevision: number;
  pending: { id: string; payload: string } | null;
  committedRevision: number;
  log: string[];
};

export function createWriteJournal(rev = 1): WriteJournal {
  return {
    schema: "Da30TransactionalWrite/v1",
    baseRevision: rev,
    pending: null,
    committedRevision: rev,
    log: [],
  };
}

export function prepareWrite(j: WriteJournal, id: string, payload: string): WriteJournal {
  if (j.pending) return { ...j, log: [...j.log, "prepare-blocked-pending"] };
  return { ...j, pending: { id, payload }, log: [...j.log, `prepare-${id}`] };
}

export function validateWrite(j: WriteJournal): { ok: boolean; journal: WriteJournal; error?: string } {
  if (!j.pending) return { ok: false, journal: j, error: "nothing-pending" };
  if (j.pending.payload.includes("CORRUPT")) {
    return { ok: false, journal: { ...j, log: [...j.log, "validate-fail"] }, error: "corrupt-payload" };
  }
  if (j.pending.payload.length > 1_000_000) {
    return { ok: false, journal: { ...j, log: [...j.log, "quota"] }, error: "quota" };
  }
  return { ok: true, journal: { ...j, log: [...j.log, "validate-ok"] } };
}

export function commitWrite(j: WriteJournal): WriteJournal {
  if (!j.pending) return { ...j, log: [...j.log, "commit-noop"] };
  return {
    ...j,
    pending: null,
    committedRevision: j.baseRevision + 1,
    baseRevision: j.baseRevision + 1,
    log: [...j.log, "commit"],
  };
}

export function rollbackWrite(j: WriteJournal): WriteJournal {
  return {
    ...j,
    pending: null,
    log: [...j.log, "rollback"],
  };
}

export function cancelWrite(j: WriteJournal): WriteJournal {
  return { ...j, pending: null, log: [...j.log, "cancel"] };
}

export function crashReopen(j: WriteJournal): WriteJournal {
  // pending not durable without journal flush → old coherent revision
  return {
    schema: j.schema,
    baseRevision: j.committedRevision,
    pending: null,
    committedRevision: j.committedRevision,
    log: [...j.log, "crash-reopen-old"],
  };
}

export function runTransactionalWriteRoutes(): {
  ok: boolean;
  cases: Array<{ id: string; passed: boolean }>;
} {
  let j = createWriteJournal(1);
  j = prepareWrite(j, "edit-1", "ok-payload");
  const v = validateWrite(j);
  j = v.journal;
  j = commitWrite(j);
  const committed = j.committedRevision === 2 && !j.pending;

  j = prepareWrite(j, "bad", "CORRUPT");
  const bad = validateWrite(j);
  j = rollbackWrite(bad.journal);
  const rolled = j.committedRevision === 2 && !j.pending;

  j = prepareWrite(j, "x", "y");
  j = cancelWrite(j);
  const cancelled = !j.pending;

  j = prepareWrite(j, "z", "data");
  j = crashReopen(j);
  const crash = j.committedRevision === 2 && !j.pending;

  const cases = [
    { id: "commit", passed: committed },
    { id: "rollback-corrupt", passed: rolled && !bad.ok },
    { id: "cancel", passed: cancelled },
    { id: "crash-reopen", passed: crash },
  ];
  return { ok: cases.every((c) => c.passed), cases };
}

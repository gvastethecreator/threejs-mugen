/**
 * DA30-075: source writes → reanalysis bridge (revision receipt).
 */

export type RevisionReceipt = {
  revision: number;
  sourceDigest: string;
  invalidated: string[];
  reanalysisScheduled: boolean;
  previewBlocked: boolean;
  exportBlocked: boolean;
};

export type ReanalysisBridge = {
  schema: "Da30SourceWriteReanalysis/v1";
  currentRevision: number;
  facts: Record<string, string>;
  pendingReceipt: RevisionReceipt | null;
  log: string[];
};

export function createBridge(rev = 1): ReanalysisBridge {
  return {
    schema: "Da30SourceWriteReanalysis/v1",
    currentRevision: rev,
    facts: { life: "d1", anim: "d2" },
    pendingReceipt: null,
    log: [],
  };
}

export function commitSource(
  b: ReanalysisBridge,
  sourceDigest: string,
  affected: string[],
  writeOk: boolean,
): ReanalysisBridge {
  if (!writeOk) {
    return { ...b, log: [...b.log, "write-failed-no-authority-change"] };
  }
  const receipt: RevisionReceipt = {
    revision: b.currentRevision + 1,
    sourceDigest,
    invalidated: affected,
    reanalysisScheduled: true,
    previewBlocked: true,
    exportBlocked: true,
  };
  const facts = { ...b.facts };
  for (const k of affected) delete facts[k];
  return {
    ...b,
    currentRevision: receipt.revision,
    facts,
    pendingReceipt: receipt,
    log: [...b.log, `commit-r${receipt.revision}`],
  };
}

export function completeReanalysis(b: ReanalysisBridge, newFacts: Record<string, string>): ReanalysisBridge {
  if (!b.pendingReceipt) return { ...b, log: [...b.log, "no-pending"] };
  return {
    ...b,
    facts: { ...b.facts, ...newFacts },
    pendingReceipt: null,
    log: [...b.log, "reanalysis-complete"],
  };
}

export function runReanalysisBridge(): { ok: boolean; failedWritePreserves: boolean; blocksUntilCurrent: boolean } {
  let b = createBridge(1);
  const before = { ...b.facts };
  b = commitSource(b, "bad", ["life"], false);
  const failedWritePreserves = JSON.stringify(b.facts) === JSON.stringify(before) && b.currentRevision === 1;

  b = commitSource(b, "good", ["life", "anim"], true);
  const blocksUntilCurrent = Boolean(b.pendingReceipt?.previewBlocked && b.pendingReceipt?.exportBlocked);
  b = completeReanalysis(b, { life: "d3", anim: "d4" });
  return {
    ok: failedWritePreserves && blocksUntilCurrent && !b.pendingReceipt && b.facts.life === "d3",
    failedWritePreserves,
    blocksUntilCurrent,
  };
}

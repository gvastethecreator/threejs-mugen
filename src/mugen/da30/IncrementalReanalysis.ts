/**
 * DA30-088: incremental reanalysis revision-bound.
 */

export type FactNode = { id: string; digest: string; deps: string[] };

export type ReanalysisState = {
  schema: "Da30IncrementalReanalysis/v1";
  nodes: Record<string, FactNode>;
  revision: number;
  cancelled: boolean;
};

export function createGraph(nodes: FactNode[]): ReanalysisState {
  const map: Record<string, FactNode> = {};
  for (const n of nodes) map[n.id] = n;
  return { schema: "Da30IncrementalReanalysis/v1", nodes: map, revision: 1, cancelled: false };
}

export function invalidate(s: ReanalysisState, changedId: string): { state: ReanalysisState; invalidated: string[] } {
  const invalidated = new Set<string>();
  const visit = (id: string) => {
    if (invalidated.has(id)) return;
    invalidated.add(id);
    for (const n of Object.values(s.nodes)) {
      if (n.deps.includes(id)) visit(n.id);
    }
  };
  visit(changedId);
  const nodes = { ...s.nodes };
  for (const id of invalidated) {
    if (nodes[id]) nodes[id] = { ...nodes[id]!, digest: "" };
  }
  return {
    state: { ...s, nodes, revision: s.revision + 1 },
    invalidated: [...invalidated],
  };
}

export function publishWorker(
  s: ReanalysisState,
  workerRevision: number,
  updates: Record<string, string>,
): { ok: boolean; state: ReanalysisState; reason?: string } {
  if (s.cancelled) return { ok: false, state: s, reason: "cancelled" };
  if (workerRevision !== s.revision) return { ok: false, state: s, reason: "stale-worker" };
  const nodes = { ...s.nodes };
  for (const [id, dig] of Object.entries(updates)) {
    if (nodes[id]) nodes[id] = { ...nodes[id]!, digest: dig };
  }
  return { ok: true, state: { ...s, nodes } };
}

export function runIncrementalReanalysis(): {
  ok: boolean;
  unchangedRetained: boolean;
  staleRejected: boolean;
  fullMatchesIncremental: boolean;
} {
  let s = createGraph([
    { id: "src", digest: "s1", deps: [] },
    { id: "parse", digest: "p1", deps: ["src"] },
    { id: "compile", digest: "c1", deps: ["parse"] },
    { id: "other", digest: "o1", deps: [] },
  ]);
  const otherBefore = s.nodes.other!.digest;
  const inv = invalidate(s, "src");
  s = inv.state;
  const unchangedRetained = s.nodes.other!.digest === otherBefore && s.nodes.parse!.digest === "";
  const stale = publishWorker(s, s.revision - 1, { parse: "p2" });
  const good = publishWorker(s, s.revision, { parse: "p2", compile: "c2", src: "s2" });
  s = good.state!;
  // full rebuild digests
  const full = createGraph([
    { id: "src", digest: "s2", deps: [] },
    { id: "parse", digest: "p2", deps: ["src"] },
    { id: "compile", digest: "c2", deps: ["parse"] },
    { id: "other", digest: "o1", deps: [] },
  ]);
  const fullMatchesIncremental =
    s.nodes.parse!.digest === full.nodes.parse!.digest &&
    s.nodes.compile!.digest === full.nodes.compile!.digest &&
    s.nodes.other!.digest === full.nodes.other!.digest;
  return {
    ok: unchangedRetained && !stale.ok && good.ok && fullMatchesIncremental,
    unchangedRetained,
    staleRejected: !stale.ok,
    fullMatchesIncremental,
  };
}

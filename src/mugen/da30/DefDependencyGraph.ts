/**
 * DA30-065: DEF/system/config dependency graph resolver.
 */

export type GraphEdge = {
  from: string;
  to: string;
  kind: "character" | "stage" | "motif" | "common" | "sound" | "font" | "palette";
  path: string;
  digest: string;
};

export type ResolveResult = {
  ok: boolean;
  edges: GraphEdge[];
  error?: string;
};

const SAFE = /^[a-zA-Z0-9_./-]+$/;

export function resolveDefGraph(nodes: Array<{ id: string; deps: Array<Omit<GraphEdge, "from">> }>): ResolveResult {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const visiting = new Set<string>();

  function visit(id: string, stack: string[]): string | null {
    if (visiting.has(id)) return `cycle:${[...stack, id].join(">")}`;
    if (seen.has(id)) return null;
    visiting.add(id);
    const node = nodes.find((n) => n.id === id);
    if (!node) {
      visiting.delete(id);
      return `missing:${id}`;
    }
    for (const d of node.deps) {
      if (d.path.includes("..") || d.path.startsWith("/") || d.path.includes(":\\")) {
        visiting.delete(id);
        return `traversal:${d.path}`;
      }
      if (!SAFE.test(d.path)) {
        visiting.delete(id);
        return `path-chars:${d.path}`;
      }
      edges.push({ from: id, ...d });
      const err = visit(d.to, [...stack, id]);
      if (err) {
        visiting.delete(id);
        return err;
      }
    }
    visiting.delete(id);
    seen.add(id);
    return null;
  }

  for (const n of nodes) {
    const err = visit(n.id, []);
    if (err) return { ok: false, edges, error: err };
  }
  return { ok: true, edges };
}

export function runDefDependencyCases(): {
  ok: boolean;
  cases: Array<{ id: string; passed: boolean; error?: string }>;
} {
  const good = resolveDefGraph([
    {
      id: "system",
      deps: [
        {
          to: "common",
          kind: "common",
          path: "data/common1.cns",
          digest: "d1",
        },
        {
          to: "motif",
          kind: "motif",
          path: "data/system.def",
          digest: "d2",
        },
      ],
    },
    {
      id: "common",
      deps: [{ to: "font", kind: "font", path: "font/f1.fnt", digest: "d3" }],
    },
    { id: "motif", deps: [{ to: "sound", kind: "sound", path: "sound/sys.snd", digest: "d4" }] },
    { id: "font", deps: [] },
    { id: "sound", deps: [] },
  ]);

  const cycle = resolveDefGraph([
    { id: "a", deps: [{ to: "b", kind: "common", path: "a.def", digest: "x" }] },
    { id: "b", deps: [{ to: "a", kind: "common", path: "b.def", digest: "y" }] },
  ]);

  const traversal = resolveDefGraph([
    {
      id: "evil",
      deps: [{ to: "x", kind: "character", path: "../secret.def", digest: "z" }],
    },
    { id: "x", deps: [] },
  ]);

  const missing = resolveDefGraph([
    {
      id: "root",
      deps: [{ to: "nope", kind: "stage", path: "stages/nope.def", digest: "n" }],
    },
  ]);

  const cases = [
    { id: "happy-graph", passed: good.ok && good.edges.length >= 4 },
    { id: "cycle", passed: !cycle.ok && (cycle.error || "").startsWith("cycle"), error: cycle.error },
    {
      id: "traversal",
      passed: !traversal.ok && (traversal.error || "").startsWith("traversal"),
      error: traversal.error,
    },
    { id: "missing", passed: !missing.ok && (missing.error || "").startsWith("missing"), error: missing.error },
  ];
  return { ok: cases.every((c) => c.passed), cases };
}

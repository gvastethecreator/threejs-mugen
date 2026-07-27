/**
 * DA30-110: non-vacuous boundary enforcement checks (model).
 */

export type BoundaryViolation = {
  id: string;
  kind:
    | "app-to-core-leak"
    | "mugen-in-second-consumer"
    | "browser-global-in-headless"
    | "private-package-import"
    | "cycle"
    | "unused-port";
  detail: string;
};

export function checkBoundaries(graph: {
  edges: Array<{ from: string; to: string }>;
  secondConsumerImports: string[];
  headlessGlobals: string[];
  privateImports: string[];
  portsUsed: string[];
  portsDeclared: string[];
}): { ok: boolean; violations: BoundaryViolation[] } {
  const violations: BoundaryViolation[] = [];
  for (const e of graph.edges) {
    if (e.from.startsWith("app/") && e.to.includes("/internal/")) {
      violations.push({ id: "leak", kind: "app-to-core-leak", detail: `${e.from}->${e.to}` });
    }
    if (e.from === e.to) {
      violations.push({ id: "self", kind: "cycle", detail: e.from });
    }
  }
  // simple cycle detect
  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const seen = new Set<string>();
  const stack = new Set<string>();
  const dfs = (n: string): boolean => {
    if (stack.has(n)) return true;
    if (seen.has(n)) return false;
    seen.add(n);
    stack.add(n);
    for (const t of adj.get(n) ?? []) if (dfs(t)) return true;
    stack.delete(n);
    return false;
  };
  for (const n of adj.keys()) {
    if (dfs(n)) violations.push({ id: "cycle", kind: "cycle", detail: n });
  }

  for (const imp of graph.secondConsumerImports) {
    if (imp.includes("mugen/combat") || imp.includes("HitDef")) {
      violations.push({ id: "mugen", kind: "mugen-in-second-consumer", detail: imp });
    }
  }
  for (const g of graph.headlessGlobals) {
    if (["window", "document", "localStorage"].includes(g)) {
      violations.push({ id: "global", kind: "browser-global-in-headless", detail: g });
    }
  }
  for (const p of graph.privateImports) {
    violations.push({ id: "priv", kind: "private-package-import", detail: p });
  }
  for (const p of graph.portsDeclared) {
    if (!graph.portsUsed.includes(p)) {
      violations.push({ id: "unused", kind: "unused-port", detail: p });
    }
  }
  return { ok: violations.length === 0, violations };
}

export function runBoundaryEnforcement(): {
  ok: boolean;
  green: boolean;
  detectsLeak: boolean;
} {
  const green = checkBoundaries({
    edges: [
      { from: "app/App", to: "mugen/clock" },
      { from: "platformer/Main", to: "mugen/clock" },
    ],
    secondConsumerImports: ["mugen/clock", "mugen/input"],
    headlessGlobals: [],
    privateImports: [],
    portsUsed: ["clock", "input"],
    portsDeclared: ["clock", "input"],
  });
  const leak = checkBoundaries({
    edges: [{ from: "app/App", to: "mugen/internal/combat" }],
    secondConsumerImports: ["mugen/combat/HitDef"],
    headlessGlobals: ["window"],
    privateImports: ["@mugen/internal/dispatch"],
    portsUsed: ["clock"],
    portsDeclared: ["clock", "renderer"],
  });
  return {
    ok: green.ok && !leak.ok && leak.violations.length >= 3,
    green: green.ok,
    detectsLeak: !leak.ok,
  };
}

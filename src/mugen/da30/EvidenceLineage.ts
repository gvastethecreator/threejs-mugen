/**
 * DA30-013/014: observation → gate → adjudication → claim lineage.
 */

export type LineageNode = {
  id: string;
  kind: "observation" | "gate" | "adjudication" | "claim";
  digest: string;
  producerVersion: string;
  subjectRevision: string;
  environment: string;
  targetClause: string;
  fresh: boolean;
  cites?: string[];
};

export type LineageValidation = { ok: boolean; errors: string[] };

export function validateEvidenceLineage(nodes: LineageNode[]): LineageValidation {
  const errors: string[] = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  if (nodes.length === 0) return { ok: false, errors: ["empty lineage"] };

  for (const n of nodes) {
    if (!n.digest) errors.push(`${n.id}: missing digest`);
    if (!n.producerVersion) errors.push(`${n.id}: missing producerVersion`);
    if (!n.subjectRevision) errors.push(`${n.id}: missing subjectRevision`);
    if (!n.environment) errors.push(`${n.id}: missing environment`);
    if (!n.targetClause) errors.push(`${n.id}: missing targetClause`);
    if (!n.fresh) errors.push(`${n.id}: stale`);
    if (n.kind === "observation" && n.cites && n.cites.length) {
      errors.push(`${n.id}: observation must not declare acceptance via cites`);
    }
    if (n.kind === "gate") {
      const cites = n.cites || [];
      if (!cites.length) errors.push(`${n.id}: gate must cite observations`);
      for (const c of cites) {
        const t = byId.get(c);
        if (!t) errors.push(`${n.id}: missing cite ${c}`);
        else if (t.kind !== "observation") errors.push(`${n.id}: gate must cite observation, got ${t.kind}`);
      }
    }
    if (n.kind === "adjudication") {
      for (const c of n.cites || []) {
        const t = byId.get(c);
        if (!t) errors.push(`${n.id}: missing cite ${c}`);
        else if (t.kind !== "gate") errors.push(`${n.id}: adjudication must cite gate`);
      }
    }
    if (n.kind === "claim") {
      for (const c of n.cites || []) {
        const t = byId.get(c);
        if (!t) errors.push(`${n.id}: missing cite ${c}`);
        else if (t.kind !== "adjudication") errors.push(`${n.id}: claim must cite adjudication`);
      }
    }
  }

  // Cycle detection on cites graph
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const n = byId.get(id);
    for (const c of n?.cites || []) {
      if (dfs(c)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  for (const n of nodes) {
    if (dfs(n.id)) {
      errors.push(`cycle involving ${n.id}`);
      break;
    }
  }

  return { ok: errors.length === 0, errors };
}

export function validLineageFixture(): LineageNode[] {
  return [
    {
      id: "obs-1",
      kind: "observation",
      digest: "d1",
      producerVersion: "v1",
      subjectRevision: "abc",
      environment: "node",
      targetClause: "c1",
      fresh: true,
    },
    {
      id: "gate-1",
      kind: "gate",
      digest: "d2",
      producerVersion: "v1",
      subjectRevision: "abc",
      environment: "node",
      targetClause: "c1",
      fresh: true,
      cites: ["obs-1"],
    },
    {
      id: "adj-1",
      kind: "adjudication",
      digest: "d3",
      producerVersion: "v1",
      subjectRevision: "abc",
      environment: "review",
      targetClause: "c1",
      fresh: true,
      cites: ["gate-1"],
    },
    {
      id: "claim-1",
      kind: "claim",
      digest: "d4",
      producerVersion: "v1",
      subjectRevision: "abc",
      environment: "review",
      targetClause: "c1",
      fresh: true,
      cites: ["adj-1"],
    },
  ];
}

/**
 * DA30-101: module boundary inventory helpers (static graph facts).
 */

export type BoundaryEdge = {
  from: string;
  to: string;
  allowed: boolean;
  reason: string;
};

export type BoundaryInventory = {
  schema: "Da30BoundaryInventory/v1";
  id: "DA30-101";
  owners: string[];
  forbiddenPatterns: string[];
  edges: BoundaryEdge[];
  claimCeiling: string;
};

export function defaultBoundaryInventory(): BoundaryInventory {
  return {
    schema: "Da30BoundaryInventory/v1",
    id: "DA30-101",
    owners: ["app", "game", "mugen/runtime", "mugen/parsers", "mugen/da30", "engine"],
    forbiddenPatterns: [
      "app imports mugen/runtime internals for UI layout",
      "second-consumer imports mugen combat model",
      "headless core uses window/document",
      "private package deep imports",
    ],
    edges: [
      {
        from: "app",
        to: "game",
        allowed: true,
        reason: "product shell owns game lifecycle",
      },
      {
        from: "game",
        to: "mugen/runtime",
        allowed: true,
        reason: "playable match host",
      },
      {
        from: "engine",
        to: "mugen/runtime",
        allowed: false,
        reason: "shared engine must not import combat semantics",
      },
      {
        from: "mugen/da30",
        to: "mugen/runtime",
        allowed: true,
        reason: "evidence reuses shipped runtime pure APIs",
      },
    ],
    claimCeiling: "boundary inventory only",
  };
}

export function validateBoundaryInventory(doc: BoundaryInventory): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (doc.schema !== "Da30BoundaryInventory/v1") errors.push("bad schema");
  if (doc.owners.length < 4) errors.push("need owners");
  if (doc.forbiddenPatterns.length < 3) errors.push("need forbidden patterns");
  if (!doc.edges.some((e) => !e.allowed)) errors.push("need at least one forbidden edge example");
  return { ok: errors.length === 0, errors };
}

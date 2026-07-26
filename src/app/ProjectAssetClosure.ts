/**
 * ProjectAssetClosure/v1 (DA26-23).
 * Transitive closure from project entry; unused catalog assets do not block.
 */

export const PROJECT_ASSET_CLOSURE_SCHEMA = "ProjectAssetClosure/v1" as const;

export type ProjectAssetNode = {
  id: string;
  path: string;
  references?: readonly string[];
};

export type ProjectAssetClosure = {
  schema: typeof PROJECT_ASSET_CLOSURE_SCHEMA;
  entryId: string;
  used: string[];
  missing: string[];
  cycles: string[][];
  unusedCatalog: string[];
};

export type ProjectAssetClosureEvaluation = {
  closure: ProjectAssetClosure;
  blocksRelease: boolean;
  diagnostics: string[];
};

export function evaluateProjectAssetClosure(input: {
  entryId: string;
  nodes: readonly ProjectAssetNode[];
  catalogIds?: readonly string[];
}): ProjectAssetClosureEvaluation {
  const byId = new Map(input.nodes.map((node) => [node.id, node]));
  const used = new Set<string>();
  const missing = new Set<string>();
  const cycles: string[][] = [];
  const stack: string[] = [];
  const visiting = new Set<string>();

  const visit = (id: string): void => {
    if (used.has(id)) return;
    if (visiting.has(id)) {
      const cycleStart = stack.indexOf(id);
      cycles.push(stack.slice(cycleStart >= 0 ? cycleStart : 0).concat(id));
      return;
    }
    const node = byId.get(id);
    if (!node) {
      missing.add(id);
      return;
    }
    visiting.add(id);
    stack.push(id);
    for (const ref of node.references ?? []) {
      visit(ref);
    }
    stack.pop();
    visiting.delete(id);
    used.add(id);
  };

  visit(input.entryId);

  const catalog = new Set(input.catalogIds ?? input.nodes.map((node) => node.id));
  const unusedCatalog = [...catalog].filter((id) => !used.has(id) && byId.has(id)).sort();
  const diagnostics: string[] = [];
  if (missing.size > 0) diagnostics.push(...[...missing].sort().map((id) => `missing:${id}`));
  if (cycles.length > 0) diagnostics.push(`cycles:${cycles.length}`);

  const closure: ProjectAssetClosure = {
    schema: PROJECT_ASSET_CLOSURE_SCHEMA,
    entryId: input.entryId,
    used: [...used].sort(),
    missing: [...missing].sort(),
    cycles,
    unusedCatalog,
  };

  return {
    closure,
    // Unused catalog assets must NOT block release.
    blocksRelease: missing.size > 0,
    diagnostics,
  };
}

/**
 * DA30-090: asset-to-export closure graph.
 */

export type AssetEdge = {
  id: string;
  scanned: boolean;
  permitted: boolean;
  transformed: boolean;
  budgeted: boolean;
  revisionCurrent: boolean;
  included: boolean;
  loaded: boolean;
  blocked?: boolean;
  orphan?: boolean;
  stale?: boolean;
  tampered?: boolean;
};

export function closeExport(edges: AssetEdge[]): {
  ok: boolean;
  included: string[];
  stopReason?: string;
} {
  for (const e of edges) {
    if (e.blocked) return { ok: false, included: [], stopReason: `blocked:${e.id}` };
    if (e.orphan) return { ok: false, included: [], stopReason: `orphan:${e.id}` };
    if (e.stale) return { ok: false, included: [], stopReason: `stale:${e.id}` };
    if (e.tampered) return { ok: false, included: [], stopReason: `tampered:${e.id}` };
  }
  const ready = edges.filter(
    (e) => e.scanned && e.permitted && e.transformed && e.budgeted && e.revisionCurrent && e.included && e.loaded,
  );
  if (ready.length !== edges.filter((e) => e.included).length) {
    return { ok: false, included: [], stopReason: "incomplete-chain" };
  }
  // unique
  const ids = ready.map((e) => e.id);
  if (new Set(ids).size !== ids.length) return { ok: false, included: [], stopReason: "duplicate" };
  return { ok: true, included: ids };
}

export function runAssetExportClosure(): { ok: boolean; green: boolean; blockedStops: boolean } {
  const green = closeExport([
    {
      id: "a",
      scanned: true,
      permitted: true,
      transformed: true,
      budgeted: true,
      revisionCurrent: true,
      included: true,
      loaded: true,
    },
    {
      id: "b",
      scanned: true,
      permitted: true,
      transformed: true,
      budgeted: true,
      revisionCurrent: true,
      included: true,
      loaded: true,
    },
  ]);
  const blocked = closeExport([
    {
      id: "evil",
      scanned: true,
      permitted: false,
      transformed: true,
      budgeted: true,
      revisionCurrent: true,
      included: true,
      loaded: true,
      blocked: true,
    },
  ]);
  return {
    ok: green.ok && !blocked.ok && Boolean(blocked.stopReason?.startsWith("blocked")),
    green: green.ok,
    blockedStops: !blocked.ok,
  };
}

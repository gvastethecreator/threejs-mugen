/**
 * DA30-029: renderer lifecycle failure checklist (unit-validated shape).
 * Live browser deltas stay a separate gate run.
 */

export type LifecycleCaseId =
  | "route-swap"
  | "resize"
  | "dpr-change"
  | "hidden-tab"
  | "context-loss-restore"
  | "project-reopen"
  | "failed-asset-load";

export type LifecycleCase = {
  id: LifecycleCaseId;
  expectsDispose: boolean;
  expectsVisibleRecovery: boolean;
  resourceBounded: boolean;
  note: string;
};

export type RendererLifecycleChecklist = {
  schema: "Da30RendererLifecycleChecklist/v1";
  id: "DA30-029";
  cases: LifecycleCase[];
  claimCeiling: string;
};

export function defaultRendererLifecycleChecklist(): RendererLifecycleChecklist {
  return {
    schema: "Da30RendererLifecycleChecklist/v1",
    id: "DA30-029",
    cases: [
      {
        id: "route-swap",
        expectsDispose: true,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "leave match → studio → match",
      },
      {
        id: "resize",
        expectsDispose: false,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "window resize keeps canvas",
      },
      {
        id: "dpr-change",
        expectsDispose: false,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "devicePixelRatio change",
      },
      {
        id: "hidden-tab",
        expectsDispose: false,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "visibilitychange pause/resume",
      },
      {
        id: "context-loss-restore",
        expectsDispose: true,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "webglcontextlost/restored",
      },
      {
        id: "project-reopen",
        expectsDispose: true,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "Studio project close/open",
      },
      {
        id: "failed-asset-load",
        expectsDispose: false,
        expectsVisibleRecovery: true,
        resourceBounded: true,
        note: "missing sprite/sound fails visibly",
      },
    ],
    claimCeiling: "checklist + unit shape only; live browser lifecycle still open",
  };
}

export function validateRendererLifecycleChecklist(doc: RendererLifecycleChecklist): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (doc.schema !== "Da30RendererLifecycleChecklist/v1") errors.push("bad schema");
  if (doc.cases.length < 7) errors.push("need all 7 lifecycle cases");
  const ids = new Set(doc.cases.map((c) => c.id));
  for (const need of [
    "route-swap",
    "resize",
    "dpr-change",
    "hidden-tab",
    "context-loss-restore",
    "project-reopen",
    "failed-asset-load",
  ] as LifecycleCaseId[]) {
    if (!ids.has(need)) errors.push(`missing ${need}`);
  }
  for (const c of doc.cases) {
    if (!c.note.trim()) errors.push(`${c.id}: empty note`);
  }
  return { ok: errors.length === 0, errors };
}

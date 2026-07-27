/**
 * DA32-029: accessibility baseline inventory — focus, reflow, roles, contrast, reduced motion,
 * status, canvas alternative, screen-reader paths.
 */

export type A11yItemStatus = "measured" | "partial" | "open" | "blocked";

export type A11yBaselineItem = {
  id: string;
  status: A11yItemStatus;
  evidence: string[];
  note: string;
};

export type A11yBaselineReport = {
  schema: "Da32A11yBaseline/v1";
  id: "DA32-029";
  items: A11yBaselineItem[];
  openCount: number;
  claimCeiling: string;
};

export function buildA11yBaseline(): A11yBaselineReport {
  const items: A11yBaselineItem[] = [
    {
      id: "focus-visible-samples",
      status: "measured",
      evidence: ["docs/evidence/da31/da31-011-mobile-reflow-gate.json"],
      note: "Tab focus rectangles sampled at Studio viewports",
    },
    {
      id: "reflow-320-390-zoom",
      status: "measured",
      evidence: ["docs/evidence/da31/da31-011-mobile-reflow-gate.json"],
      note: "geometry + overflow flags; overflow may still exist",
    },
    {
      id: "reduced-motion",
      status: "measured",
      evidence: ["docs/evidence/da31/browser/reflow-w390-reduced-motion.png"],
      note: "prefers-reduced-motion context exercised",
    },
    {
      id: "roles-landmarks",
      status: "partial",
      evidence: [],
      note: "main/app-shell present; full landmark audit open",
    },
    {
      id: "contrast",
      status: "open",
      evidence: [],
      note: "no automated contrast ledger yet",
    },
    {
      id: "status-live-regions",
      status: "partial",
      evidence: [],
      note: "HUD aria-labels for red-life exist; full status region audit open",
    },
    {
      id: "canvas-alternative",
      status: "open",
      evidence: [],
      note: "match canvas lacks non-visual play state summary for SR",
    },
    {
      id: "screen-reader-paths",
      status: "open",
      evidence: [],
      note: "no SR journey proof",
    },
  ];
  return {
    schema: "Da32A11yBaseline/v1",
    id: "DA32-029",
    items,
    openCount: items.filter((i) => i.status === "open" || i.status === "partial").length,
    claimCeiling: "inventory and measured samples only; not WCAG certification or public a11y claim",
  };
}

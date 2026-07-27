/**
 * DA31-010…016: product/visual/input/perf/renderer adoption contracts.
 * Live browser facts bind via gate reports; pure helpers validate claim ceilings.
 */

export type EvidenceClass = "browser-gate" | "unit-model" | "device-lab" | "human-review" | "open";

export type AdoptionRow = {
  id: string;
  title: string;
  evidenceClass: EvidenceClass;
  claimCeiling: string;
  blocked: string[];
  requiredArtifacts: string[];
  liveConsumer: string;
};

export const PRODUCT_ADOPTION_ROWS: AdoptionRow[] = [
  {
    id: "DA31-010",
    title: "Studio/Inspect process",
    evidenceClass: "browser-gate",
    claimCeiling: "one named Studio/Inspect process desktop+mobile only",
    blocked: ["full authoring suite", "score movement"],
    requiredArtifacts: [
      "docs/evidence/da31/da31-010-studio-inspect-gate.json",
      "scripts/qa_browser_gate_da31_010_studio_inspect.cjs",
    ],
    liveConsumer: "scripts/qa_browser_gate_da31_010_studio_inspect.cjs + App qaProbe",
  },
  {
    id: "DA31-011",
    title: "Mobile Studio reflow and focus",
    evidenceClass: "browser-gate",
    claimCeiling: "measured viewport/accessibility geometry only",
    blocked: ["pixel-perfect mobile redesign", "score movement"],
    requiredArtifacts: [
      "docs/evidence/da31/da31-011-mobile-reflow-gate.json",
      "scripts/qa_browser_gate_da31_011_mobile_reflow.cjs",
    ],
    liveConsumer: "scripts/qa_browser_gate_da31_011_mobile_reflow.cjs",
  },
  {
    id: "DA31-012",
    title: "Physical gamepad lifecycle",
    evidenceClass: "unit-model",
    claimCeiling: "simulated + pure seat map only; physical device-lab not claimed without hardware",
    blocked: ["every physical gamepad model", "score movement"],
    requiredArtifacts: [
      "src/mugen/da30/GamepadLifecycle.ts",
      "docs/evidence/da31/da31-012-gamepad-lifecycle.json",
    ],
    liveConsumer: "GamepadLifecycle model + gate matrix simulated path",
  },
  {
    id: "DA31-013",
    title: "Touch and concurrent input",
    evidenceClass: "browser-gate",
    claimCeiling: "tested mobile/concurrent paths on named Play route only",
    blocked: ["all gesture policies", "score movement"],
    requiredArtifacts: [
      "docs/evidence/da31/da31-013-touch-input-gate.json",
      "scripts/qa_browser_gate_da31_013_touch_input.cjs",
    ],
    liveConsumer: "scripts/qa_browser_gate_da31_013_touch_input.cjs",
  },
  {
    id: "DA31-014",
    title: "Route frame budget",
    evidenceClass: "browser-gate",
    claimCeiling: "measured environment facts on owned Play route only",
    blocked: ["cross-machine SLA", "score movement"],
    requiredArtifacts: [
      "docs/evidence/da31/da31-014-frame-budget-gate.json",
      "scripts/qa_browser_gate_da31_014_frame_budget.cjs",
    ],
    liveConsumer: "scripts/qa_browser_gate_da31_014_frame_budget.cjs + FrameGapHarness",
  },
  {
    id: "DA31-015",
    title: "WebGL lifecycle and disposal",
    evidenceClass: "browser-gate",
    claimCeiling: "owned lifecycle facts on listed routes only",
    blocked: ["Three.js internal cache totals", "score movement"],
    requiredArtifacts: [
      "docs/evidence/da31/da31-015-renderer-lifecycle-gate.json",
      "scripts/qa_browser_gate_da31_015_renderer_lifecycle.cjs",
    ],
    liveConsumer: "scripts/qa_browser_gate_da31_015_renderer_lifecycle.cjs",
  },
  {
    id: "DA31-016",
    title: "Broad visual acceptance",
    evidenceClass: "open",
    claimCeiling: "named visual matrix only; smoke may remain open",
    blocked: ["whole-repo visual health without raw logs", "score movement"],
    requiredArtifacts: [
      "docs/evidence/da31/da31-016-visual-matrix.json",
      "scripts/qa_smoke.cjs",
    ],
    liveConsumer: "qa:smoke + phase1 gate screenshots",
  },
];

export function findProductRow(id: string): AdoptionRow | undefined {
  return PRODUCT_ADOPTION_ROWS.find((r) => r.id === id);
}

export type GamepadLifecycleProof = {
  schema: "Da31GamepadLifecycleProof/v1";
  id: "DA31-012";
  seats: Array<{ seat: 1 | 2; status: string; gamepadIndex: number | null }>;
  events: string[];
  keyboardFallback: boolean;
  physicalDevice: false;
  claimCeiling: string;
};

/** Unit evidence path for DA31-012 when no device-lab is available. */
export function buildSimulatedGamepadProof(): GamepadLifecycleProof {
  return {
    schema: "Da31GamepadLifecycleProof/v1",
    id: "DA31-012",
    seats: [
      { seat: 1, status: "active", gamepadIndex: 0 },
      { seat: 2, status: "fallback-keyboard", gamepadIndex: null },
    ],
    events: [
      "connect#0 standard",
      "button held",
      "disconnect mid-hold stale-release",
      "reconnect index-change",
      "non-standard mapping-failed",
      "focus-loss clear",
      "keyboard fallback",
    ],
    keyboardFallback: true,
    physicalDevice: false,
    claimCeiling: "simulated seat map + unit lifecycle only",
  };
}

export type VisualMatrixStatus = {
  schema: "Da31VisualMatrix/v1";
  id: "DA31-016";
  smokeStatus: "passed" | "failed" | "open" | "not-run";
  phase1Gates: Record<string, boolean | "unknown">;
  humanReviewRequired: string[];
  claimCeiling: string;
};

export function buildVisualMatrixStatus(input: {
  smokeStatus: VisualMatrixStatus["smokeStatus"];
  phase1Gates: Record<string, boolean | "unknown">;
}): VisualMatrixStatus {
  return {
    schema: "Da31VisualMatrix/v1",
    id: "DA31-016",
    smokeStatus: input.smokeStatus,
    phase1Gates: input.phase1Gates,
    humanReviewRequired: [
      "final state desktop/mobile",
      "hit spark/crop failures",
      "Studio surfaces",
      "focus",
      "reduced motion",
      "renderer recovery",
    ],
    claimCeiling:
      input.smokeStatus === "passed"
        ? "named visual matrix at clean SHA only"
        : "partial matrix; smoke open or not fully green",
  };
}

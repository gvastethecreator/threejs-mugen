/**
 * DA32-013/014: consecutive clause adjudication samples past DA30-020.
 * Only consecutive passes may advance adjudicatedThrough.
 */

export type ClauseSampleVerdict = "pass" | "partial" | "fail" | "unknown";

export type ClauseSampleRow = {
  taskId: string;
  verdict: ClauseSampleVerdict;
  evidenceRefs: string[];
  preservedFact: string;
  missingProof: string;
  liveConsumer: string;
  claimCeiling: string;
};

export type AdjudicationSampleReport = {
  schema: "Da32ClauseAdjudicationSample/v1";
  id: "DA32-013";
  fromExclusive: string;
  rows: ClauseSampleRow[];
  consecutivePassThrough: string | null;
  proposedAdjudicatedThrough: string;
  priorAdjudicatedThrough: string;
  advanced: boolean;
  claimCeiling: string;
};

const SAMPLE_ROWS: ClauseSampleRow[] = [
  {
    taskId: "DA30-021",
    verdict: "pass",
    evidenceRefs: [
      "docs/evidence/da31/da31-008-formal-gate.json",
      "docs/evidence/da30/manifests/da30-021.manifest.json",
    ],
    preservedFact: "formal required matrix + authority at named pin",
    missingProof: "optional smoke still open at formal pin",
    liveConsumer: "scripts/run_da31_008_formal_gate.cjs",
    claimCeiling: "formal/global facts at pin only",
  },
  {
    taskId: "DA30-022",
    verdict: "partial",
    evidenceRefs: ["src/mugen/da30/PlayableSandboxMatrix.ts"],
    preservedFact: "sandbox matrix model exists",
    missingProof: "independent written-clause revalidation at clean HEAD",
    liveConsumer: "unit model",
    claimCeiling: "model presence only",
  },
  {
    taskId: "DA30-023",
    verdict: "partial",
    evidenceRefs: ["src/mugen/da30/BrowserRouteFactWriter.ts"],
    preservedFact: "route fact writer model",
    missingProof: "fresh browser fact binding at one SHA",
    liveConsumer: "unit model",
    claimCeiling: "model only",
  },
  {
    taskId: "DA30-024",
    verdict: "pass",
    evidenceRefs: [
      "docs/evidence/da31/da31-009-play-browser-gate.json",
      "scripts/qa_browser_gate_da31_009_play.cjs",
    ],
    preservedFact: "Play movement/reset/miss/missing-package on named packages",
    missingProof: "provisional when dirty tree",
    liveConsumer: "qa_browser_gate_da31_009_play",
    claimCeiling: "two named Play routes only",
  },
  {
    taskId: "DA30-025",
    verdict: "pass",
    evidenceRefs: [
      "docs/evidence/da31/da31-010-studio-inspect-gate.json",
      "scripts/qa_browser_gate_da31_010_studio_inspect.cjs",
    ],
    preservedFact: "Studio/Inspect process desktop+mobile",
    missingProof: "full authoring suite",
    liveConsumer: "qa_browser_gate_da31_010_studio_inspect",
    claimCeiling: "one Studio/Inspect process only",
  },
  {
    taskId: "DA30-026",
    verdict: "partial",
    evidenceRefs: [
      "docs/evidence/da31/da31-012-gamepad-lifecycle.json",
      "docs/evidence/da31/da31-013-touch-input-gate.json",
    ],
    preservedFact: "simulated gamepad + touch concurrent paths",
    missingProof: "physical device-lab",
    liveConsumer: "da31-012/013 gates",
    claimCeiling: "simulated + touch only",
  },
  {
    taskId: "DA30-027",
    verdict: "partial",
    evidenceRefs: ["docs/evidence/da31/da31-014-frame-budget-gate.json"],
    preservedFact: "~3s frame sample with p50/p95/max",
    missingProof: "full 60s wall route budget",
    liveConsumer: "da31-014 gate",
    claimCeiling: "measured sample only",
  },
  {
    taskId: "DA30-028",
    verdict: "partial",
    evidenceRefs: ["docs/evidence/da31/da31-015-renderer-lifecycle-gate.json"],
    preservedFact: "multi-route mount/resize/hide/reopen",
    missingProof: "forced context-loss on all GPUs",
    liveConsumer: "da31-015 gate",
    claimCeiling: "owned lifecycle only",
  },
  {
    taskId: "DA30-029",
    verdict: "partial",
    evidenceRefs: ["src/mugen/da30/RendererLifecycleChecklist.ts"],
    preservedFact: "lifecycle checklist model",
    missingProof: "merged with 028 live totals",
    liveConsumer: "unit model",
    claimCeiling: "checklist only",
  },
  {
    taskId: "DA30-030",
    verdict: "unknown",
    evidenceRefs: ["src/mugen/da30/PerformanceBudgets.ts"],
    preservedFact: "budget model shape",
    missingProof: "fresh environment breach ownership",
    liveConsumer: "unit model",
    claimCeiling: "unknown until remeasured",
  },
];

export function buildClauseAdjudicationSample(
  priorAdjudicatedThrough = "DA30-020",
): AdjudicationSampleReport {
  let consecutivePassThrough: string | null = null;
  for (const row of SAMPLE_ROWS) {
    if (row.verdict === "pass") {
      consecutivePassThrough = row.taskId;
    } else {
      break;
    }
  }
  // Consecutive rule: can only advance through unbroken pass prefix.
  // DA30-021 is pass, DA30-022 is partial → watermark stays DA30-021 max consecutive.
  const proposed = consecutivePassThrough ?? priorAdjudicatedThrough;
  const advanced = proposed !== priorAdjudicatedThrough && proposed > priorAdjudicatedThrough;
  // String compare works for DA30-0xx zero-padded
  const advancedNumeric =
    consecutivePassThrough != null &&
    Number(consecutivePassThrough.replace("DA30-", "")) > Number(priorAdjudicatedThrough.replace("DA30-", ""));

  return {
    schema: "Da32ClauseAdjudicationSample/v1",
    id: "DA32-013",
    fromExclusive: priorAdjudicatedThrough,
    rows: SAMPLE_ROWS,
    consecutivePassThrough,
    proposedAdjudicatedThrough: advancedNumeric ? consecutivePassThrough! : priorAdjudicatedThrough,
    priorAdjudicatedThrough,
    advanced: advancedNumeric,
    claimCeiling:
      "sample rows only; consecutive pass prefix may advance adjudicatedThrough by one unbroken pass chain",
  };
}

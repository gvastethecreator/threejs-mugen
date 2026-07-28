/**
 * Materialize DA32 program status + seed smoke ownership from last formal stderr if live run missing.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const outDir = path.join(root, "docs/evidence/da32");
fs.mkdirSync(outDir, { recursive: true });

function sha(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function classify(message) {
  const m = String(message);
  if (/^runtime-(desktop|mobile):/.test(m)) return "runtime-native";
  if (/^mugen-lite visual/.test(m)) return "mugen-lite-visual";
  if (/^studio-workbench/.test(m)) return "studio-workbench";
  if (/^studio-build/.test(m)) return "studio-build";
  if (/^studio-modules/.test(m)) return "studio-modules";
  if (/^studio-source-relink/.test(m)) return "studio-source-relink";
  if (/^studio-assets/.test(m)) return "studio-assets";
  if (/^studio-evidence/.test(m)) return "studio-evidence";
  if (/^studio-debug/.test(m)) return "studio-debug";
  if (/^ikemen-scan/.test(m)) return "ikemen-scan";
  if (/^studio-stage/.test(m)) return "studio-stage";
  return "other";
}

// Seed ownership from formal smoke stderr if no live ownership yet
const liveOwnership = path.join(outDir, "da32-smoke-ownership-v1.json");
if (!fs.existsSync(liveOwnership)) {
  const stderrPath = path.join(root, "docs/evidence/da31/formal-logs/da31-008-qa-smoke.stderr.txt");
  if (fs.existsSync(stderrPath)) {
    const text = fs.readFileSync(stderrPath, "utf8");
    const body = text.includes("QA smoke failed:") ? text.split("QA smoke failed:")[1] : text;
    const failures = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("at ") && !l.startsWith("Error:") && !l.startsWith("$"));
    const byLane = {};
    for (const f of failures) {
      const lane = classify(f);
      if (!byLane[lane]) byLane[lane] = [];
      byLane[lane].push(f);
    }
    const lanes = Object.entries(byLane).map(([id, msgs]) => ({
      id,
      status: "open",
      failureCount: msgs.length,
      failures: msgs,
      owner: `DA32-${id}`,
      claimCeiling: "seeded from da31-008 formal smoke stderr; re-run qa:smoke for live sample",
    }));
    const report = {
      schema: "Da32SmokeOwnership/v1",
      id: "DA32-001",
      generatedAt: new Date().toISOString(),
      source: "seed:da31-008-qa-smoke.stderr.txt",
      ok: false,
      failureCount: failures.length,
      lanes,
      laneSummary: Object.fromEntries(lanes.map((l) => [l.id, l.failureCount])),
      claimCeiling: "seeded ownership inventory only; not a live HEAD smoke pin",
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(liveOwnership, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(outDir, "da32-smoke-failures.txt"), `${failures.join("\n")}\n`, "utf8");
  }
}

// Clause sample report (mirrors TS logic for artifact)
const clauseRows = [
  { taskId: "DA30-021", verdict: "pass" },
  { taskId: "DA30-022", verdict: "partial" },
  { taskId: "DA30-023", verdict: "partial" },
  { taskId: "DA30-024", verdict: "pass" },
  { taskId: "DA30-025", verdict: "pass" },
  { taskId: "DA30-026", verdict: "partial" },
  { taskId: "DA30-027", verdict: "partial" },
  { taskId: "DA30-028", verdict: "partial" },
  { taskId: "DA30-029", verdict: "partial" },
  { taskId: "DA30-030", verdict: "unknown" },
];
let consecutive = null;
for (const r of clauseRows) {
  if (r.verdict === "pass") consecutive = r.taskId;
  else break;
}
const clause = {
  schema: "Da32ClauseAdjudicationSample/v1",
  id: "DA32-013",
  priorAdjudicatedThrough: "DA30-020",
  consecutivePassThrough: consecutive,
  proposedAdjudicatedThrough: consecutive || "DA30-020",
  advanced: consecutive === "DA30-021",
  rows: clauseRows,
  claimCeiling: "sample only; consecutive pass advances to DA30-021; later passes do not skip partials",
};
clause.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...clause, digest: undefined })) };
fs.writeFileSync(path.join(outDir, "da32-clause-sample-v1.json"), `${JSON.stringify(clause, null, 2)}\n`, "utf8");

const gamepad = {
  schema: "Da32GamepadDeviceLab/v1",
  id: "DA32-009",
  physicalDeviceRequiredForFullClaim: true,
  simulatedBaseline: true,
  hardwareOk: null,
  claimCeiling: "protocol + simulated baseline only",
};
gamepad.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...gamepad, digest: undefined })) };
fs.writeFileSync(path.join(outDir, "da32-gamepad-device-lab-v1.json"), `${JSON.stringify(gamepad, null, 2)}\n`, "utf8");

const a11y = {
  schema: "Da32A11yBaseline/v1",
  id: "DA32-029",
  measured: ["focus-visible-samples", "reflow-320-390-zoom", "reduced-motion"],
  open: ["canvas-alternative", "screen-reader-paths", "contrast"],
  claimCeiling: "inventory only; not WCAG certification",
};
a11y.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...a11y, digest: undefined })) };
fs.writeFileSync(path.join(outDir, "da32-a11y-baseline-v1.json"), `${JSON.stringify(a11y, null, 2)}\n`, "utf8");

const ownership = fs.existsSync(liveOwnership)
  ? JSON.parse(fs.readFileSync(liveOwnership, "utf8"))
  : { failureCount: null, ok: false };
const hitSparkGatePath = path.join(outDir, "da32-002-hit-spark-browser-gate.json");
let hitSparkGateOk = false;
if (fs.existsSync(hitSparkGatePath)) {
  try {
    hitSparkGateOk = JSON.parse(fs.readFileSync(hitSparkGatePath, "utf8")).ok === true;
  } catch {
    hitSparkGateOk = false;
  }
}
const mugenLiteVisualGatePath = path.join(outDir, "da32-005-mugen-lite-visual-browser-gate.json");
let mugenLiteVisualGateOk = false;
if (fs.existsSync(mugenLiteVisualGatePath)) {
  try {
    mugenLiteVisualGateOk = JSON.parse(fs.readFileSync(mugenLiteVisualGatePath, "utf8")).ok === true;
  } catch {
    mugenLiteVisualGateOk = false;
  }
}

const status = {
  schema: "Da32ProgramStatus/v1",
  generatedAt: new Date().toISOString(),
  tasks: {
    "DA32-001": {
      status: ownership.ok ? "accepted" : "accepted-ownership",
      note: ownership.ok ? "smoke green" : `smoke open failures=${ownership.failureCount}`,
      artifacts: ["docs/evidence/da32/da32-smoke-ownership-v1.json"],
    },
    "DA32-002": {
      status: hitSparkGateOk ? "accepted-focal-gate" : "accepted-hardening",
      note: hitSparkGateOk
        ? `desktop/mobile browser gate passed; full smoke remains open failures=${ownership.failureCount}`
        : "driveRuntimeHitSpark requires playing + multi-key retry",
      artifacts: hitSparkGateOk
        ? [
            "scripts/qa_smoke.cjs",
            "scripts/qa_browser_gate_da32_002_hit_spark.cjs",
            "docs/evidence/da32/da32-002-hit-spark-browser-gate.json",
          ]
        : ["scripts/qa_smoke.cjs"],
    },
    "DA32-003": {
      status: "accepted-classification",
      note: "studio lanes classified in ownership ledger",
      artifacts: ["docs/evidence/da32/da32-smoke-ownership-v1.json"],
    },
    "DA32-004": {
      status: "accepted-classification",
      note: "mugen-lite visual lane classified",
      artifacts: ["docs/evidence/da32/da32-smoke-ownership-v1.json"],
    },
    "DA32-005": {
      status: mugenLiteVisualGateOk ? "accepted-focal-gate" : "open-implementation",
      note: mugenLiteVisualGateOk
        ? `desktop/mobile imported MUGEN Lite visual gate passed; full smoke remains open failures=${ownership.failureCount}`
        : "restore imported MUGEN Lite playfield visibility on mobile",
      artifacts: mugenLiteVisualGateOk
        ? [
            "src/styles/redesign.css",
            "scripts/qa_browser_gate_da32_005_mugen_lite_visual.cjs",
            "docs/evidence/da32/da32-005-mugen-lite-visual-browser-gate.json",
          ]
        : ["src/styles/redesign.css"],
    },
    "DA32-009": {
      status: "accepted-protocol",
      note: "device-lab protocol; hardware null",
      artifacts: ["docs/evidence/da32/da32-gamepad-device-lab-v1.json", "src/mugen/da32/GamepadDeviceLab.ts"],
    },
    "DA32-010": {
      status: "accepted-virtual",
      note: "virtual gamepad sequence unit proof",
      artifacts: ["src/mugen/da32/GamepadDeviceLab.ts"],
    },
    "DA32-013": {
      status: "accepted-sample",
      note: "consecutive pass proposes adjudicatedThrough=DA30-021",
      artifacts: ["docs/evidence/da32/da32-clause-sample-v1.json"],
    },
    "DA32-014": {
      status: "accepted-watermark-rule",
      note: "human docs may set adjudicatedThrough=DA30-021 after sample review",
      artifacts: ["docs/DA32_NEXT_PROGRAM_ROADMAP.md"],
    },
    "DA32-029": {
      status: "accepted-baseline",
      note: "a11y inventory; canvas alt and SR open",
      artifacts: ["docs/evidence/da32/da32-a11y-baseline-v1.json"],
    },
  },
  watermarks: {
    recordedThrough: "DA30-120",
    adjudicatedThrough: "DA30-020",
    proposedAdjudicatedThrough: "DA30-021",
    formal: "f5f2315e",
  },
  scoresHeld: true,
  next: [
    "live qa:smoke re-run with ownership write",
    "reconcile global smoke runtime-native sample with focal gate",
    mugenLiteVisualGateOk ? "expand mugen-lite visual matrix" : "close mugen-lite visual lane",
    "studio surface repairs",
    "hardware gamepad lab",
  ],
  claimCeiling:
    "DA32 program bootstrap; smoke not claimed green; adjudicatedThrough remains DA30-020 until human accepts proposed DA30-021",
};
status.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...status, digest: undefined })) };
fs.writeFileSync(path.join(outDir, "da32-program-status-v1.json"), `${JSON.stringify(status, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({ wrote: "docs/evidence/da32/*", smokeFailures: ownership.failureCount, proposedAdjudicated: "DA30-021" }, null, 2)}\n`,
);

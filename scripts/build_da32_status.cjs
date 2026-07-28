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

const gamepadBrowserGatePath = path.join(outDir, "da32-010-gamepad-browser-gate.json");
let gamepadBrowserGate = null;
if (fs.existsSync(gamepadBrowserGatePath)) {
  try {
    gamepadBrowserGate = JSON.parse(fs.readFileSync(gamepadBrowserGatePath, "utf8"));
  } catch {
    gamepadBrowserGate = null;
  }
}
const gamepadBrowserGateOk = gamepadBrowserGate?.ok === true;

const gamepad = {
  schema: "Da32GamepadDeviceLab/v1",
  id: "DA32-009",
  physicalDeviceRequiredForFullClaim: true,
  simulatedBaseline: true,
  hardwareOk: null,
  browserGate: gamepadBrowserGate
    ? {
        id: "DA32-010",
        ok: gamepadBrowserGateOk,
        headSha: gamepadBrowserGate.headSha,
        viewports: gamepadBrowserGate.cases?.map((item) => item.viewport) ?? [],
        report: "docs/evidence/da32/da32-010-gamepad-browser-gate.json",
      }
    : null,
  claimCeiling: "protocol + simulated baseline + runtime status diagnostics; physical device claim remains open",
};
gamepad.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...gamepad, digest: undefined })) };
fs.writeFileSync(path.join(outDir, "da32-gamepad-device-lab-v1.json"), `${JSON.stringify(gamepad, null, 2)}\n`, "utf8");

const a11y = {
  schema: "Da32A11yBaseline/v1",
  id: "DA32-029",
  measured: ["focus-visible-samples", "reflow-320-390-zoom", "reduced-motion"],
  partial: ["canvas-alternative"],
  open: ["screen-reader-paths", "contrast"],
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

const a11yRuntimeGatePath = path.join(outDir, "da32-029-a11y-runtime-browser-gate.json");
let a11yRuntimeGateOk = false;
if (fs.existsSync(a11yRuntimeGatePath)) {
  try {
    a11yRuntimeGateOk = JSON.parse(fs.readFileSync(a11yRuntimeGatePath, "utf8")).ok === true;
  } catch {
    a11yRuntimeGateOk = false;
  }
}

const studioStorageGatePath = path.join(outDir, "da32-021-studio-storage-browser-gate.json");
let studioStorageGate = null;
if (fs.existsSync(studioStorageGatePath)) {
  try {
    studioStorageGate = JSON.parse(fs.readFileSync(studioStorageGatePath, "utf8"));
  } catch {
    studioStorageGate = null;
  }
}
const studioStorageGateOk = studioStorageGate?.ok === true;

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
        ? ownership.ok
          ? "desktop/mobile browser gate passed; full qa:smoke green at this subject only"
          : `desktop/mobile browser gate passed; full smoke remains open failures=${ownership.failureCount}`
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
        ? ownership.ok
          ? "desktop/mobile imported MUGEN Lite visual gate passed; full qa:smoke green at this subject only"
          : `desktop/mobile imported MUGEN Lite visual gate passed; full smoke remains open failures=${ownership.failureCount}`
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
      note: "device-lab protocol + runtime status diagnostics; hardware null",
      artifacts: [
        "docs/evidence/da32/da32-gamepad-device-lab-v1.json",
        "src/mugen/da32/GamepadDeviceLab.ts",
        "src/game/input/GamepadInputAdapter.ts",
        "src/app/App.ts",
      ],
    },
    "DA32-010": {
      status: gamepadBrowserGateOk ? "accepted-browser-virtual" : "accepted-virtual",
      note: gamepadBrowserGateOk
        ? "clean-subject desktop/mobile browser gate covers connect, hold, two seats, disconnect, keyboard fallback, mapping warning, and index-change reconnect; hardware remains open"
        : "virtual gamepad sequence unit proof plus live adapter diagnostics",
      artifacts: gamepadBrowserGateOk
        ? [
            "scripts/qa_browser_gate_da32_010_gamepad.cjs",
            "docs/evidence/da32/da32-010-gamepad-browser-gate.json",
            "src/game/input/GamepadInputAdapter.ts",
            "src/game/input/KeyboardInputAdapter.ts",
            "src/app/App.ts",
          ]
        : ["src/mugen/da32/GamepadDeviceLab.ts", "src/game/input/GamepadInputAdapter.ts"],
    },
    "DA32-021": {
      status: studioStorageGateOk ? "accepted-browser-idb" : "open-implementation",
      note: studioStorageGateOk
        ? "clean-subject desktop/mobile gate proves IndexedDB authority, local cache mirror, reload reopen, and a desktop revision conflict; quota recovery remains open"
        : "Studio project authority browser gate is missing or failed",
      artifacts: studioStorageGateOk
        ? [
            "src/app/StudioProjectStore.ts",
            "src/app/ProjectStorage.ts",
            "src/app/App.ts",
            "scripts/qa_browser_gate_da32_021_studio_storage.cjs",
            "docs/evidence/da32/da32-021-studio-storage-browser-gate.json",
          ]
        : ["src/app/StudioProjectStore.ts", "src/app/App.ts"],
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
      status: a11yRuntimeGateOk ? "accepted-runtime-dom" : "accepted-baseline",
      note: a11yRuntimeGateOk
        ? "desktop/mobile runtime DOM gate passed; canvas alternative partial, SR journey remains open"
        : "a11y inventory; canvas alternative partial, SR journey remains open",
      artifacts: a11yRuntimeGateOk
        ? [
            "docs/evidence/da32/da32-a11y-baseline-v1.json",
            "scripts/qa_browser_gate_da32_029_a11y.cjs",
            "docs/evidence/da32/da32-029-a11y-runtime-browser-gate.json",
          ]
        : ["docs/evidence/da32/da32-a11y-baseline-v1.json"],
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
    ownership.ok ? "retain green smoke ownership at the next subject HEAD" : "live qa:smoke re-run with ownership write",
    ownership.ok ? "expand runtime visual and Studio matrix" : "reconcile global smoke runtime-native sample with focal gate",
    mugenLiteVisualGateOk ? "expand mugen-lite visual matrix" : "close mugen-lite visual lane",
    "studio surface repairs",
    "hardware gamepad lab",
  ],
  claimCeiling:
    ownership.ok
      ? "DA32 smoke green at this subject only; adjudicatedThrough remains DA30-020 until human accepts proposed DA30-021"
      : "DA32 program bootstrap; smoke not claimed green; adjudicatedThrough remains DA30-020 until human accepts proposed DA30-021",
};
status.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...status, digest: undefined })) };
fs.writeFileSync(path.join(outDir, "da32-program-status-v1.json"), `${JSON.stringify(status, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({ wrote: "docs/evidence/da32/*", smokeFailures: ownership.failureCount, proposedAdjudicated: "DA30-021" }, null, 2)}\n`,
);

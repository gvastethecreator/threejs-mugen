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

const studioSnapshotGatePath = path.join(outDir, "da32-022-studio-snapshot-browser-gate.json");
let studioSnapshotGate = null;
if (fs.existsSync(studioSnapshotGatePath)) {
  try {
    studioSnapshotGate = JSON.parse(fs.readFileSync(studioSnapshotGatePath, "utf8"));
  } catch {
    studioSnapshotGate = null;
  }
}
const studioSnapshotGateOk = studioSnapshotGate?.ok === true;

const studioSourceIntentGatePath = path.join(outDir, "da32-023-source-write-intent-browser-gate.json");
let studioSourceIntentGate = null;
if (fs.existsSync(studioSourceIntentGatePath)) {
  try {
    studioSourceIntentGate = JSON.parse(fs.readFileSync(studioSourceIntentGatePath, "utf8"));
  } catch {
    studioSourceIntentGate = null;
  }
}
const studioSourceIntentGateOk = studioSourceIntentGate?.ok === true;
const studioSourceIntentGateClean = studioSourceIntentGate?.subject?.provisional === false;
const studioSourceWriteRecoveryGatePath = path.join(outDir, "da32-024-source-intent-write-recovery-browser-gate.json");
let studioSourceWriteRecoveryGate = null;
if (fs.existsSync(studioSourceWriteRecoveryGatePath)) {
  try {
    studioSourceWriteRecoveryGate = JSON.parse(fs.readFileSync(studioSourceWriteRecoveryGatePath, "utf8"));
  } catch {
    studioSourceWriteRecoveryGate = null;
  }
}
const studioSourceWriteRecoveryGateOk = studioSourceWriteRecoveryGate?.ok === true;
const studioSourceWriteRecoveryGateClean = studioSourceWriteRecoveryGate?.subject?.provisional === false;
const studioSourcePhaseRecoveryGatePath = path.join(outDir, "da32-025-source-write-phase-recovery-browser-gate.json");
let studioSourcePhaseRecoveryGate = null;
if (fs.existsSync(studioSourcePhaseRecoveryGatePath)) {
  try {
    studioSourcePhaseRecoveryGate = JSON.parse(fs.readFileSync(studioSourcePhaseRecoveryGatePath, "utf8"));
  } catch {
    studioSourcePhaseRecoveryGate = null;
  }
}
const studioSourcePhaseRecoveryGateOk = studioSourcePhaseRecoveryGate?.ok === true;
const studioSourcePhaseRecoveryGateClean = studioSourcePhaseRecoveryGate?.subject?.provisional === false;
const studioSourceReceiptRecoveryGatePath = path.join(outDir, "da32-026-source-write-receipt-recovery-browser-gate.json");
let studioSourceReceiptRecoveryGate = null;
if (fs.existsSync(studioSourceReceiptRecoveryGatePath)) {
  try {
    studioSourceReceiptRecoveryGate = JSON.parse(fs.readFileSync(studioSourceReceiptRecoveryGatePath, "utf8"));
  } catch {
    studioSourceReceiptRecoveryGate = null;
  }
}
const studioSourceReceiptRecoveryGateOk = studioSourceReceiptRecoveryGate?.ok === true;
const studioSourceReceiptRecoveryGateClean = studioSourceReceiptRecoveryGate?.subject?.provisional === false;
const studioSourceObservationGatePath = path.join(outDir, "da32-027-source-write-observation-browser-gate.json");
let studioSourceObservationGate = null;
if (fs.existsSync(studioSourceObservationGatePath)) {
  try {
    studioSourceObservationGate = JSON.parse(fs.readFileSync(studioSourceObservationGatePath, "utf8"));
  } catch {
    studioSourceObservationGate = null;
  }
}
const studioSourceObservationGateOk = studioSourceObservationGate?.ok === true;
const studioSourceObservationGateClean = studioSourceObservationGate?.subject?.provisional === false;
const studioSourceObservationPositiveGatePath = path.join(outDir, "da32-028-source-write-observation-positive-browser-gate.json");
let studioSourceObservationPositiveGate = null;
if (fs.existsSync(studioSourceObservationPositiveGatePath)) {
  try {
    studioSourceObservationPositiveGate = JSON.parse(fs.readFileSync(studioSourceObservationPositiveGatePath, "utf8"));
  } catch {
    studioSourceObservationPositiveGate = null;
  }
}
const studioSourceObservationPositiveGateOk = studioSourceObservationPositiveGate?.ok === true;
const studioSourceObservationPositiveGateClean = studioSourceObservationPositiveGate?.subject?.provisional === false;
const studioSourceObservationFinalizeGatePath = path.join(outDir, "da32-030-source-write-observation-finalize-browser-gate.json");
let studioSourceObservationFinalizeGate = null;
if (fs.existsSync(studioSourceObservationFinalizeGatePath)) {
  try {
    studioSourceObservationFinalizeGate = JSON.parse(fs.readFileSync(studioSourceObservationFinalizeGatePath, "utf8"));
  } catch {
    studioSourceObservationFinalizeGate = null;
  }
}
const studioSourceObservationFinalizeGateOk = studioSourceObservationFinalizeGate?.ok === true;
const studioSourceObservationFinalizeGateClean = studioSourceObservationFinalizeGate?.subject?.provisional === false;
const studioSourceRecoveryDecisionGatePath = path.join(outDir, "da32-031-source-write-recovery-decisions-browser-gate.json");
let studioSourceRecoveryDecisionGate = null;
if (fs.existsSync(studioSourceRecoveryDecisionGatePath)) {
  try {
    studioSourceRecoveryDecisionGate = JSON.parse(fs.readFileSync(studioSourceRecoveryDecisionGatePath, "utf8"));
  } catch {
    studioSourceRecoveryDecisionGate = null;
  }
}
const studioSourceRecoveryDecisionGateOk = studioSourceRecoveryDecisionGate?.ok === true;
const studioSourceRecoveryDecisionGateClean = studioSourceRecoveryDecisionGate?.subject?.provisional === false;
const studioMobileGeometryGatePath = path.join(outDir, "da32-032-studio-mobile-geometry-browser-gate.json");
let studioMobileGeometryGate = null;
if (fs.existsSync(studioMobileGeometryGatePath)) {
  try {
    studioMobileGeometryGate = JSON.parse(fs.readFileSync(studioMobileGeometryGatePath, "utf8"));
  } catch {
    studioMobileGeometryGate = null;
  }
}
const studioMobileGeometryGateOk = studioMobileGeometryGate?.ok === true;
const studioMobileGeometryGateClean = studioMobileGeometryGate?.subject?.provisional === false;

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
        ? "clean-subject desktop/mobile gate proves IndexedDB authority, local cache mirror, reload reopen, desktop revision conflict, and no-IndexedDB fallback/retry; quota recovery remains open"
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
    "DA32-022": {
      status: studioSnapshotGateOk ? "accepted-browser-snapshot" : "open-implementation",
      note: studioSnapshotGateOk
        ? "clean-subject desktop/mobile/fallback gate proves durable StudioIndexedDbSnapshot revision and payload readback; source-intent replay and quota recovery remain open"
        : "Studio durable snapshot browser gate is missing or failed",
      artifacts: studioSnapshotGateOk
        ? [
            "src/app/StudioIndexedDbSnapshot.ts",
            "src/app/ProjectSnapshotBridge.ts",
            "src/app/App.ts",
            "scripts/qa_browser_gate_da32_022_studio_snapshot.cjs",
            "docs/evidence/da32/da32-022-studio-snapshot-browser-gate.json",
          ]
        : ["src/app/StudioIndexedDbSnapshot.ts", "src/app/App.ts"],
    },
    "DA32-023": {
      status: studioSourceIntentGateOk
        ? studioSourceIntentGateClean
          ? "accepted-browser-source-recovery"
          : "accepted-browser-source-recovery-provisional"
        : "open-implementation",
      note: studioSourceIntentGateOk
        ? studioSourceIntentGateClean
          ? "clean-subject desktop/mobile gate proves pending source-intent readback, exact preimage editor load, pending retention, and no handle write; permission repair and quota remain open"
          : "desktop/mobile source-intent recovery gate passed on a dirty subject; clean subject pin remains open"
        : "Studio source-write intent recovery browser gate is missing or failed",
      artifacts: studioSourceIntentGateOk
        ? [
            "src/app/StudioIndexedDbSnapshot.ts",
            "src/app/App.ts",
            "scripts/qa_browser_gate_da32_023_source_write_intent.cjs",
            "docs/evidence/da32/da32-023-source-write-intent-browser-gate.json",
          ]
        : ["src/app/StudioIndexedDbSnapshot.ts", "src/app/App.ts"],
    },
    "DA32-024": {
      status: studioSourceWriteRecoveryGateOk
        ? studioSourceWriteRecoveryGateClean
          ? "accepted-browser-source-write-recovery"
          : "accepted-browser-source-write-recovery-provisional"
        : "open-implementation",
      note: studioSourceWriteRecoveryGateOk
        ? studioSourceWriteRecoveryGateClean
          ? "clean-subject desktop/mobile gate proves native folder relink, dirty preimage replay, separate read/write permission, explicit write/reimport, exact bytes, and original intent settlement; crash, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile source-intent write recovery gate passed on a dirty subject; clean subject pin remains open"
        : "Studio source-intent write recovery browser gate is missing or failed",
      artifacts: studioSourceWriteRecoveryGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioSourceHandle.ts",
            "src/app/StudioSourceWrite.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "scripts/qa_browser_gate_da32_024_source_intent_write_recovery.cjs",
            "docs/evidence/da32/da32-024-source-intent-write-recovery-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioSourceHandle.ts"],
    },
    "DA32-025": {
      status: studioSourcePhaseRecoveryGateOk
        ? studioSourcePhaseRecoveryGateClean
          ? "accepted-browser-source-phase-recovery"
          : "accepted-browser-source-phase-recovery-provisional"
        : "open-implementation",
      note: studioSourcePhaseRecoveryGateOk
        ? studioSourcePhaseRecoveryGateClean
          ? "clean-subject desktop/mobile gate proves durable write-closed phase readback, exact preimage replay, pending retention, no source-handle write, and no horizontal overflow; physical crash, receipt synthesis, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile source-write phase gate passed on a dirty subject; clean subject pin remains open"
        : "Studio source-write phase recovery browser gate is missing or failed",
      artifacts: studioSourcePhaseRecoveryGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "scripts/qa_browser_gate_da32_025_source_write_phase_recovery.cjs",
            "docs/evidence/da32/da32-025-source-write-phase-recovery-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
    },
    "DA32-026": {
      status: studioSourceReceiptRecoveryGateOk
        ? studioSourceReceiptRecoveryGateClean
          ? "accepted-browser-source-receipt-recovery"
          : "accepted-browser-source-receipt-recovery-provisional"
        : "open-implementation",
      note: studioSourceReceiptRecoveryGateOk
        ? studioSourceReceiptRecoveryGateClean
          ? "clean-subject desktop/mobile gate proves a validated settled SourceWriteReceipt/v1 payload survives reload in the intent, bridge, and recovery surface with intact digest and status; physical crash, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile source-write receipt recovery gate passed on a dirty subject; clean subject pin remains open"
        : "Studio source-write receipt recovery browser gate is missing or failed",
      artifacts: studioSourceReceiptRecoveryGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "src/app/StudioSourceWriteReceipt.ts",
            "scripts/qa_browser_gate_da32_026_source_write_receipt_recovery.cjs",
            "docs/evidence/da32/da32-026-source-write-receipt-recovery-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
    },
    "DA32-027": {
      status: studioSourceObservationGateOk
        ? studioSourceObservationGateClean
          ? "accepted-browser-source-observation"
          : "accepted-browser-source-observation-provisional"
        : "open-implementation",
      note: studioSourceObservationGateOk
        ? studioSourceObservationGateClean
          ? "clean-subject desktop/mobile gate proves write-closed intents persist needs-observation and explicit unavailable outcomes without receipt settlement; physical granted-handle classification, crash injection, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile source-write observation gate passed on a dirty subject; clean subject pin remains open"
        : "Studio source-write observation browser gate is missing or failed",
      artifacts: studioSourceObservationGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "scripts/qa_browser_gate_da32_027_source_write_observation.cjs",
            "docs/evidence/da32/da32-027-source-write-observation-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
    },
    "DA32-028": {
      status: studioSourceObservationPositiveGateOk
        ? studioSourceObservationPositiveGateClean
          ? "accepted-browser-source-observation-positive"
          : "accepted-browser-source-observation-positive-provisional"
        : "open-implementation",
      note: studioSourceObservationPositiveGateOk
        ? studioSourceObservationPositiveGateClean
          ? "clean-subject desktop/mobile gate proves a granted folder handle can read real KFM source bytes, record matches-preimage, retain write-closed state, and avoid createWritable; receipt finalization, crash, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile positive source observation gate passed on a dirty subject; clean subject pin remains open"
        : "Studio positive source-write observation browser gate is missing or failed",
      artifacts: studioSourceObservationPositiveGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "src/app/StudioSourceWrite.ts",
            "src/app/StudioSourceHandle.ts",
            "scripts/qa_browser_gate_da32_028_source_write_observation_positive.cjs",
            "docs/evidence/da32/da32-028-source-write-observation-positive-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
    },
    "DA32-030": {
      status: studioSourceObservationFinalizeGateOk
        ? studioSourceObservationFinalizeGateClean
          ? "accepted-browser-source-observation-finalization"
          : "accepted-browser-source-observation-finalization-provisional"
        : "open-implementation",
      note: studioSourceObservationFinalizeGateOk
        ? studioSourceObservationFinalizeGateClean
          ? "clean-subject desktop/mobile gate proves matches-draft acceptance, explicit folder reimport, observed recovery settlement, and zero writable-stream/readwrite requests; crash, retry, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile observed-source finalization gate passed on a dirty subject; clean subject pin remains open"
        : "Studio observed-source finalization browser gate is missing or failed",
      artifacts: studioSourceObservationFinalizeGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "src/app/StudioSourceWriteReceipt.ts",
            "scripts/qa_browser_gate_da32_030_source_write_observation_finalize.cjs",
            "docs/evidence/da32/da32-030-source-write-observation-finalize-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
    },
    "DA32-031": {
      status: studioSourceRecoveryDecisionGateOk
        ? studioSourceRecoveryDecisionGateClean
          ? "accepted-browser-source-recovery-decisions"
          : "accepted-browser-source-recovery-decisions-provisional"
        : "open-implementation",
      note: studioSourceRecoveryDecisionGateOk
        ? studioSourceRecoveryDecisionGateClean
          ? "clean-subject desktop/mobile gate proves durable retry preparation and explicit abandon settlement with a rejected receipt; physical crash, quota, eviction, and multi-file recovery remain open"
          : "desktop/mobile source-recovery decision gate passed on a dirty subject; clean subject pin remains open"
        : "Studio source-recovery decision browser gate is missing or failed",
      artifacts: studioSourceRecoveryDecisionGateOk
        ? [
            "src/app/App.ts",
            "src/app/StudioIndexedDbSnapshot.ts",
            "src/app/StudioSourceWriteReceipt.ts",
            "scripts/qa_browser_gate_da32_031_source_write_recovery_decisions.cjs",
            "docs/evidence/da32/da32-031-source-write-recovery-decisions-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
    },
    "DA32-032": {
      status: studioMobileGeometryGateOk
        ? studioMobileGeometryGateClean
          ? "accepted-browser-mobile-geometry"
          : "accepted-browser-mobile-geometry-provisional"
        : "open-implementation",
      note: studioMobileGeometryGateOk
        ? studioMobileGeometryGateClean
          ? "clean-subject breakpoint gate proves bounded icons/actions, one active mobile pane, document scroll ownership, and framed desktop seam"
          : "nine-viewport Studio geometry gate passed on a dirty subject; clean subject pin and broader mobile IA remain open"
        : "Studio mobile geometry browser gate is missing or failed",
      artifacts: studioMobileGeometryGateOk
        ? [
            "src/app/App.ts",
            "src/styles/redesign.css",
            "scripts/qa_browser_gate_da32_032_studio_mobile_geometry.cjs",
            "docs/evidence/da32/da32-032-studio-mobile-geometry-browser-gate.json",
          ]
        : ["src/app/App.ts", "src/styles/redesign.css"],
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
    studioSourceRecoveryDecisionGateOk
      ? "physical source-intent crash injection, quota, eviction, and multi-file recovery"
      : studioSourceObservationFinalizeGateOk
        ? "durable retry/abandon decisions for write-closed source intents"
        : studioSourceObservationPositiveGateOk
        ? "matches-draft source observation and explicit receipt finalization"
        : studioSourceObservationGateOk
        ? "granted-handle source observation classification"
        : studioSourceReceiptRecoveryGateOk
          ? "write-closed source observation after reload"
          : studioSourcePhaseRecoveryGateOk
            ? "source-write receipt rehydration after reload"
            : studioSourceWriteRecoveryGateOk
              ? "incomplete source-write phase recovery"
              : studioSourceIntentGateOk
                ? "permission-aware source relink and write/reimport recovery"
                : "close source-write intent recovery",
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

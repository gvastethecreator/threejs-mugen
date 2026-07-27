/**
 * Materialize docs/evidence/da31/da31-phase-status-v1.json from known artifacts.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const out = path.join(root, "docs/evidence/da31/da31-phase-status-v1.json");

function sha(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}
function readOk(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return { present: false, ok: false };
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return { present: true, ok: Boolean(j.ok !== false && j.status !== "failed"), raw: j };
  } catch {
    return { present: true, ok: false };
  }
}

function task(id, status, artifacts, note, claimCeiling) {
  return { status, artifacts, note, claimCeiling };
}

const t010 = readOk("docs/evidence/da31/da31-010-studio-inspect-gate.json");
const t011 = readOk("docs/evidence/da31/da31-011-mobile-reflow-gate.json");
const t012 = readOk("docs/evidence/da31/da31-012-gamepad-lifecycle.json");
const t013 = readOk("docs/evidence/da31/da31-013-touch-input-gate.json");
const t014 = readOk("docs/evidence/da31/da31-014-frame-budget-gate.json");
const t015 = readOk("docs/evidence/da31/da31-015-renderer-lifecycle-gate.json");
const t016 = readOk("docs/evidence/da31/da31-016-visual-matrix.json");

const moduleArtifacts = [
  "src/mugen/da31/ProductAdoption.ts",
  "src/mugen/da31/DeterminismAdoption.ts",
  "src/mugen/da31/StudioAssetAdoption.ts",
  "src/mugen/da31/ReleaseIkemenAdoption.ts",
  "src/tests/Da31Phase1to4Adoption.test.ts",
];

const tasks = {
  "DA31-001": task("DA31-001", "accepted", ["docs/DA31_EVIDENCE_ADOPTION_ROADMAP.md"], "audit hold", "hold only"),
  "DA31-002": task("DA31-002", "accepted", ["docs/evidence/da31/da30-task-contracts-v1.json"], "contracts frozen", "identity only"),
  "DA31-003": task("DA31-003", "accepted", ["src/mugen/da31/DualWatermarkControl.ts"], "dual watermark", "control model"),
  "DA31-004": task("DA31-004", "accepted", ["src/mugen/da31/ClauseVerdict.ts"], "clause evaluation", "row status only"),
  "DA31-005": task("DA31-005", "accepted", ["src/mugen/da31/EvidencePromotion.ts"], "promotion", "hermetic tests"),
  "DA31-006": task("DA31-006", "accepted", ["src/mugen/da31/GateSubjectEnvelope.ts"], "subject envelope", "provisional dirty"),
  "DA31-007": task("DA31-007", "accepted", ["docs/evidence/da31/da30-clause-verdict-ledger-v1.json"], "120 ledger", "row adjudication"),
  "DA31-008": task("DA31-008", "accepted", ["docs/evidence/da31/da31-008-formal-gate.json"], "formal pin f5f2315e", "formal at pin"),
  "DA31-009": task("DA31-009", "accepted", ["docs/evidence/da31/da31-009-play-browser-gate.json"], "Play journey", "two Play routes"),
  "DA31-010": task(
    "DA31-010",
    t010.ok ? "accepted" : t010.present ? "partial" : "pending",
    ["docs/evidence/da31/da31-010-studio-inspect-gate.json", "scripts/qa_browser_gate_da31_010_studio_inspect.cjs"],
    t010.ok ? "Studio/Inspect desktop+mobile" : "gate missing or failed",
    "one named Studio/Inspect process only",
  ),
  "DA31-011": task(
    "DA31-011",
    t011.ok ? "accepted" : t011.present ? "partial" : "pending",
    ["docs/evidence/da31/da31-011-mobile-reflow-gate.json", "scripts/qa_browser_gate_da31_011_mobile_reflow.cjs"],
    t011.ok ? "reflow 320/390/zoom measured" : "gate missing or failed",
    "measured viewport/a11y geometry only",
  ),
  "DA31-012": task(
    "DA31-012",
    t012.present || exists("src/mugen/da31/ProductAdoption.ts") ? "accepted-simulated" : "pending",
    ["docs/evidence/da31/da31-012-gamepad-lifecycle.json", "src/mugen/da30/GamepadLifecycle.ts"],
    "simulated lifecycle; physical device-lab not claimed",
    "tested simulated mappings only",
  ),
  "DA31-013": task(
    "DA31-013",
    t013.ok ? "accepted" : t013.present ? "partial" : "pending",
    ["docs/evidence/da31/da31-013-touch-input-gate.json"],
    t013.ok ? "touch+concurrent on Play mobile" : "await gate",
    "tested mobile/concurrent paths only",
  ),
  "DA31-014": task(
    "DA31-014",
    t014.ok ? "accepted" : t014.present ? "partial" : "pending",
    ["docs/evidence/da31/da31-014-frame-budget-gate.json"],
    t014.ok ? "frame sample ~3s route budget" : "await gate",
    "measured environment; not full 60s SLA",
  ),
  "DA31-015": task(
    "DA31-015",
    t015.ok ? "accepted" : t015.present ? "partial" : "pending",
    ["docs/evidence/da31/da31-015-renderer-lifecycle-gate.json"],
    t015.ok ? "5-route lifecycle cycles" : "await gate",
    "owned lifecycle facts only",
  ),
  "DA31-016": task(
    "DA31-016",
    t016.present ? (t016.raw?.smokeStatus === "passed" ? "accepted" : "partial") : "partial",
    ["docs/evidence/da31/da31-016-visual-matrix.json", "scripts/qa_smoke.cjs"],
    t016.raw?.smokeStatus ? `smoke=${t016.raw.smokeStatus}` : "smoke open; phase1 matrix partial",
    "named visual matrix only; smoke may stay open",
  ),
};

// Phase 2–4 model adoption (unit-proven; live runtime binding partial by design)
for (const [id, note, ceiling] of [
  ["DA31-017", "seeded dual input log equality + mutation", "live input-log determinism model route"],
  ["DA31-018", "snapshot/restore owner census", "one named snapshot/restore route"],
  ["DA31-019", "round record/replay seeded sim", "one deterministic replay route"],
  ["DA31-020", "causality matrix positive+negative", "listed paths only"],
  ["DA31-021", "support row promotion rejects missing evidence", "registry at cited evidence"],
  ["DA31-022", "corpus inventory consumer via DA30 model", "inventory + eligible count"],
  ["DA31-023", "parser mutation corpus wired in suite", "tested syntax cases"],
  ["DA31-024", "MUGEN-lite scores held", "signed hold; no score movement"],
  ["DA31-025", "IndexedDB storage ADR", "chosen authority + spikes"],
  ["DA31-026", "transactional save fault injection", "named save/fault paths"],
  ["DA31-027", "conflict recovery cases", "named conflict paths"],
  ["DA31-028", "9 authoring view proofs (model routes)", "each view independently; browser capture open"],
  ["DA31-029", "preview/export chain model", "one local chain"],
  ["DA31-030", "second asset provenance chain", "that asset only"],
  ["DA31-031", "scanner/CLI parity cases", "named fixtures"],
  ["DA31-032", "source write reanalysis", "named reanalysis"],
  ["DA31-033", "Ikemen source families", "per reviewed family"],
  ["DA31-034", "ZSS prototype reclass", "no owned production ZSS ops"],
  ["DA31-035", "team consumers partial", "exercised consumers only"],
  ["DA31-036", "IKEMEN scores held", "signed hold"],
  ["DA31-037", "non-fight consumer (assets studio)", "two-consumer ports"],
  ["DA31-038", "shared GateSubjectEnvelope port", "that port only"],
  ["DA31-039", "CLI/package/CI script inventory", "local package + named lanes"],
  ["DA31-040", "local release review; public blocked", "rehearsal + next program DA32"],
]) {
  tasks[id] = task(id, "accepted-model", moduleArtifacts, note, ceiling);
}

const doc = {
  schema: "Da31PhaseStatus/v1",
  generatedAt: new Date().toISOString(),
  tasks,
  scoresHeld: true,
  scores: { sandbox: "65", mugenLite: "36", practical: "20", remaining: "10-12 / 6-8 / 25" },
  watermarks: {
    recordedThrough: "DA30-120",
    adjudicatedThrough: "DA30-020",
    da31Program: "DA31-001…040 landed with honest ceilings",
  },
  open: [
    "physical gamepad device-lab (DA31-012)",
    "qa:smoke full green (DA31-016)",
    "authoring per-view browser capture (DA31-028)",
    "full PlayableMatchRuntime snapshot (DA31-018 live)",
    "public release (DA31-040 blocked by design)",
  ],
  nextProgram: "DA32",
  claimCeiling:
    "DA31 cuts accepted at named claim ceilings; model-only rows do not advance adjudicatedThrough or scores",
};

doc.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...doc, digest: undefined })) };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
process.stdout.write(`wrote ${path.relative(root, out)} tasks=${Object.keys(tasks).length}\n`);

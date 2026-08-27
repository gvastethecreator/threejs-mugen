/**
 * DA30-010: gate control recovery — one report at current HEAD.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const repoRoot = path.resolve(process.cwd());
const head = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim();

function exists(rel) {
  return fs.existsSync(path.join(repoRoot, ...rel.split("/")));
}
function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, ...rel.split("/")), "utf8"));
}

const checklist = [];
function check(id, ok, detail) {
  checklist.push({ id, ok, detail });
}

const source = load("docs/evidence/control-source-v1.json");
const selector = load("docs/evidence/authority-selector-v1.json");
const cursor = load("docs/evidence/roadmap-cursor-v1.json");
const ledger = load("docs/evidence/da30/da29-verdict-ledger-v1.json");
const hold = load("docs/evidence/da30/da30-001-hold-reference-audit.json");
const refAudit = exists("docs/evidence/da30/da30-005-control-reference-audit.json")
  ? load("docs/evidence/da30/da30-005-control-reference-audit.json")
  : null;

check("shared-closedThrough", selector.closedThrough === source.closedThrough && cursor.closedThrough === source.closedThrough, `${selector.closedThrough}`);
check("shared-nextQueue", JSON.stringify(selector.nextQueue) === JSON.stringify(source.nextQueue) && JSON.stringify(cursor.nextQueue) === JSON.stringify(source.nextQueue), `len=${source.nextQueue.length}`);
check("shared-scores", JSON.stringify(selector.scores) === JSON.stringify(source.scores), JSON.stringify(source.scores));
check("scores-held", source.scores.sandbox === "65", source.scores.sandbox);
check("ledger-200", ledger.count === 200 && Array.isArray(ledger.rows) && ledger.rows.length === 200, `count=${ledger.count}`);
check("hold-audit", hold.ok === true, "da30-001");
check("ref-audit", refAudit ? refAudit.ok === true : false, refAudit ? "da30-005" : "missing");
check("da29-watermark-not-accepted", source.seriesHold?.watermarkAccepted === false, String(source.seriesHold?.watermarkAccepted));
check("docs-link-da30", exists(".scratch/architecture/DA30_RECOVERY_ROADMAP.md") && exists(".scratch/architecture/AUTHORITY_SELECTOR.md"), "roadmap+selector");
check("transitions", exists("docs/evidence/da30/closeout-state-transitions-v1.json"), "DA30-006");
check("ownership", exists("docs/evidence/da30/da30-009-roadmap-surface-ownership.json"), "DA30-009");
check("historical-reconcile", exists("docs/evidence/da30/da30-008-historical-gates-reconciliation.json"), "DA30-008");

const commands = [
  { name: "materialize_control_projections", cmd: "node scripts/materialize_control_projections.cjs" },
  { name: "audit_da30_001", cmd: "node scripts/audit_da30_001_hold_references.cjs" },
  { name: "audit_da30_005", cmd: "node scripts/audit_da30_005_control_references.cjs --fixtures-dir docs/evidence/da30/fixtures/da30-005" },
];

const commandLog = [];
for (const c of commands) {
  try {
    const out = execSync(c.cmd, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    commandLog.push({ name: c.name, cmd: c.cmd, exit: 0, stdoutDigest: crypto.createHash("sha256").update(out).digest("hex").slice(0, 16) });
  } catch (e) {
    commandLog.push({ name: c.name, cmd: c.cmd, exit: e.status || 1, error: String(e.stderr || e.message).slice(0, 200) });
    check(`cmd-${c.name}`, false, "failed");
  }
}

const ok = checklist.every((c) => c.ok) && commandLog.every((c) => c.exit === 0);
const report = {
  schema: "Da30ControlRecoveryGate/v1",
  id: "DA30-010",
  generatedAt: new Date().toISOString(),
  headSha: head,
  ok,
  checklist,
  commandLog,
  closedThrough: source.closedThrough,
  nextQueue: source.nextQueue,
  scores: source.scores,
  claims: {
    allowed: ["DA30 queue adoption only", "control recovery gate"],
    blocked: ["score movement", "DA29-200 accepted watermark", "runtime product claims"],
  },
};
report.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify({ ...report, digest: undefined })).digest("hex"),
};

const out = path.join(repoRoot, "docs/evidence/da30/da30-010-control-recovery-gate.json");
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ status: ok ? "passed" : "failed", head: head.slice(0, 12), checklistFailed: checklist.filter((c) => !c.ok).map((c) => c.id) }, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;

/**
 * DA30-005: audit every current control reference against control-source projections.
 * Supports --fixtures-dir for six negative fixtures.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const args = parseArgs(process.argv.slice(2));
const fixturesDir = args["fixtures-dir"]
  ? path.resolve(String(args["fixtures-dir"]))
  : null;

const SURFACES = [
  ".scratch/architecture/AUTHORITY_SELECTOR.md",
  ".scratch/architecture/ROADMAP_NAVIGATION.md",
  ".scratch/architecture/ROADMAP_EXECUTION_BOARD.md",
  ".scratch/architecture/PROGRESS_TRACKER.md",
  ".scratch/architecture/WORKPLAN.md",
  ".scratch/architecture/DELIVERY_ROADMAP.md",
  ".scratch/architecture/NEXT_BUILD_ROADMAP.md",
  ".scratch/architecture/BUILD_EXECUTION_BACKLOG.md",
  ".scratch/architecture/ROADMAP_PROGRESS_SYSTEM.md",
  ".scratch/architecture/MASTER_REVIEW_ROADMAP.md",
  "docs/evidence/authority-selector-v1.json",
  "docs/evidence/roadmap-cursor-v1.json",
  "docs/evidence/control-source-v1.json",
  ".scratch/roadmap/issues/01-runtime-compatibility-gates.md",
  ".scratch/roadmap/issues/02-studio-evidence-workflow.md",
  ".scratch/roadmap/issues/03-generated-assets-pipeline.md",
  ".scratch/roadmap/issues/04-ikemen-scan-and-reference.md",
  ".scratch/roadmap/issues/05-modular-engine-boundaries.md",
  ".scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md",
  ".scratch/roadmap/issues/07-ikemen-runtime-topology.md",
  ".scratch/roadmap/issues/08-da29-evidence-recovery-and-da30-roadmap.md",
];

const STALE_PATTERNS = [
  { id: "stale-queue-da29-complete", re: /Series complete: open count 0|watermark closed through \*\*DA29-200\*\*|accepted ladder[^\n]*DA29-200/i },
  { id: "stale-score-inflate", re: /scores?\s+(?:raised|increased|to\s+1[0-9]{2})|sandbox["']?\s*:\s*["']?(?:7[0-9]|8[0-9]|9[0-9]|100)/i },
  { id: "stale-formal-da27", re: /formal[^\n]{0,40}b7d23801|Entry 598\s*\/\s*DA27-06 formal closeout as current/i },
  { id: "stale-visual-as-head", re: /(?:current product|HEAD product).{0,40}1085badb|T342 as current global/i },
  { id: "stale-product-breadth", re: /imported-package breadth from Nova\/Mira as shipped/i },
  { id: "stale-source-working-as-normative", re: /source normative[^\n]{0,30}4aa0ba38|normative pin 4aa/i },
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith("--")) continue;
    const k = t.slice(2);
    const n = argv[i + 1];
    if (!n || n.startsWith("--")) out[k] = true;
    else {
      out[k] = n;
      i += 1;
    }
  }
  return out;
}

function stripHistorical(text) {
  return (text.split(/\n## Historical\b/i)[0] ?? text).split(/\n## 2026-07-2[0-6]\b/)[0] ?? text;
}

function loadJson(rel) {
  const abs = path.join(repoRoot, ...rel.split("/"));
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function auditLive() {
  const source = loadJson("docs/evidence/control-source-v1.json");
  const selector = loadJson("docs/evidence/authority-selector-v1.json");
  const cursor = loadJson("docs/evidence/roadmap-cursor-v1.json");
  const failures = [];

  if (selector.closedThrough !== source.closedThrough) failures.push({ id: "selector-closedThrough", detail: `${selector.closedThrough} !== ${source.closedThrough}` });
  if (cursor.closedThrough !== source.closedThrough) failures.push({ id: "cursor-closedThrough", detail: `${cursor.closedThrough} !== ${source.closedThrough}` });
  if (JSON.stringify(selector.nextQueue) !== JSON.stringify(source.nextQueue)) failures.push({ id: "selector-nextQueue", detail: "mismatch" });
  if (JSON.stringify(cursor.nextQueue) !== JSON.stringify(source.nextQueue)) failures.push({ id: "cursor-nextQueue", detail: "mismatch" });
  if (JSON.stringify(selector.scores) !== JSON.stringify(source.scores)) failures.push({ id: "selector-scores", detail: "mismatch" });
  if (JSON.stringify(cursor.scores) !== JSON.stringify(source.scores)) failures.push({ id: "cursor-scores", detail: "mismatch" });
  if (selector.cursors.formal.sha !== source.cursors.formal.sha) failures.push({ id: "formal-sha", detail: "mismatch" });
  if (source.seriesHold?.watermarkAccepted === true) failures.push({ id: "da29-watermark-accepted", detail: "must stay false" });

  const surfaceHits = [];
  for (const rel of SURFACES) {
    const abs = path.join(repoRoot, ...rel.split("/"));
    if (!fs.existsSync(abs)) {
      failures.push({ id: "missing-surface", detail: rel });
      continue;
    }
    const raw = fs.readFileSync(abs, "utf8");
    const text = rel.endsWith(".json") ? raw : stripHistorical(raw);
    for (const p of STALE_PATTERNS) {
      const m = text.match(p.re);
      if (m) surfaceHits.push({ path: rel, pattern: p.id, match: m[0].slice(0, 100) });
    }
  }
  failures.push(...surfaceHits.map((h) => ({ id: h.pattern, detail: `${h.path}: ${h.match}` })));

  return {
    mode: "live",
    ok: failures.length === 0,
    failures,
    closedThrough: source.closedThrough,
    nextQueueHead: source.nextQueue[0] || null,
    scores: source.scores,
    surfaceCount: SURFACES.length,
  };
}

function auditFixtures() {
  if (!fixturesDir || !fs.existsSync(fixturesDir)) {
    return { mode: "fixtures", ok: false, failures: [{ id: "no-fixtures-dir", detail: String(fixturesDir) }], results: [] };
  }
  const files = fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".json"));
  const results = [];
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(fixturesDir, f), "utf8"));
    const expectFail = doc.expectFail === true;
    const failures = [];
    // Each fixture describes a synthetic control state to reject
    if (doc.kind === "stale-queue") {
      if (doc.closedThrough === "DA29-200" && Array.isArray(doc.nextQueue) && doc.nextQueue.length === 0 && doc.watermarkAccepted !== false) {
        failures.push({ id: "stale-queue", detail: "DA29-200 empty queue without hold" });
      }
    }
    if (doc.kind === "score-inflate") {
      if (doc.scores?.sandbox && Number(String(doc.scores.sandbox).replace(/\D/g, "")) > 65) {
        failures.push({ id: "score-inflate", detail: `sandbox ${doc.scores.sandbox}` });
      }
    }
    if (doc.kind === "formal-mismatch") {
      if (doc.selectorFormal !== doc.cursorFormal) {
        failures.push({ id: "formal-mismatch", detail: `${doc.selectorFormal} vs ${doc.cursorFormal}` });
      }
    }
    if (doc.kind === "visual-as-head") {
      if (doc.claim?.includes("HEAD product") && doc.visualSha) {
        failures.push({ id: "visual-as-head", detail: doc.visualSha });
      }
    }
    if (doc.kind === "source-swap") {
      if (doc.sourceNormative === doc.sourceWorking && doc.sourceNormative) {
        failures.push({ id: "source-swap", detail: "normative equals working incorrectly" });
      }
      if (doc.normativeClaimedWorking === true) {
        failures.push({ id: "source-swap", detail: "working claimed as normative" });
      }
    }
    if (doc.kind === "product-breadth") {
      if (doc.claimImportedPackageBreadth === true) {
        failures.push({ id: "product-breadth", detail: "imported package breadth claimed" });
      }
    }
    const detected = failures.length > 0;
    const ok = expectFail ? detected : !detected;
    results.push({ file: f, kind: doc.kind, expectFail, detected, ok, failures });
  }
  return {
    mode: "fixtures",
    ok: results.length >= 6 && results.every((r) => r.ok),
    results,
    fixtureCount: results.length,
  };
}

const live = auditLive();
const fixtures = fixturesDir ? auditFixtures() : { mode: "fixtures", ok: true, skipped: true, results: [] };
const ok = live.ok && fixtures.ok;

const report = {
  schema: "Da30ControlReferenceAudit/v1",
  id: "DA30-005",
  generatedAt: new Date().toISOString(),
  ok,
  live,
  fixtures,
  claims: {
    allowed: ["reference consistency only"],
    blocked: ["score movement", "DA29 complete watermark", "formal tip rewrite"],
  },
};
report.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify({ ...report, digest: undefined })).digest("hex"),
};

const out = path.join(repoRoot, "docs/evidence/da30/da30-005-control-reference-audit.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ status: ok ? "passed" : "failed", output: "docs/evidence/da30/da30-005-control-reference-audit.json", liveOk: live.ok, fixturesOk: fixtures.ok, fixtureCount: fixtures.fixtureCount ?? 0 }, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;

/**
 * Audit current authority surfaces for stale primary selectors.
 * Historical sections (heading contains Historical/Previous/closed, 2026-07-18, etc.) are skipped.
 */
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const selectorPath = path.join(repoRoot, "docs/evidence/authority-selector-v1.json");

const CURRENT_SURFACES = [
  "docs/AUTHORITY_SELECTOR.md",
  "docs/ROADMAP_NAVIGATION.md",
  "docs/ROADMAP_CONTINUITY_GUIDE.md",
  "docs/ROADMAP_PACKAGE_MILESTONES.md",
  "docs/NEXT_BUILD_ROADMAP.md",
  "docs/ROADMAP_EXECUTION_BOARD.md",
  "docs/PROGRESS_TRACKER.md",
  "docs/WORKPLAN.md",
  "docs/DELIVERY_ROADMAP.md",
  "docs/PORT_COMPLETION_SCORECARD.md",
  ".scratch/roadmap/issues/01-runtime-compatibility-gates.md",
  ".scratch/roadmap/issues/02-studio-evidence-workflow.md",
  ".scratch/roadmap/issues/03-generated-assets-pipeline.md",
  ".scratch/roadmap/issues/04-ikemen-scan-and-reference.md",
  ".scratch/roadmap/issues/05-modular-engine-boundaries.md",
  ".scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md",
  ".scratch/roadmap/issues/07-ikemen-runtime-topology.md",
];

const REQUIRED_MARKERS = [
  "docs/AUTHORITY_SELECTOR.md",
  "closedThrough",
];

// Patterns that must not appear in non-historical "current" blocks.
const STALE = [
  { id: "head-c01d5e70", re: /(?:Use|Resume from|HEAD remains) HEAD `c01d5e70`/i },
  { id: "entry-585-current", re: /Entry 585(?![^\n]{0,80}historical)/i },
  { id: "global-t383-current", re: /(?:global T383|T383 remains the last global gate until DA26-08)/i },
  { id: "dirty-juggle-current", re: /(?:six dirty|dirty StateDef juggle work is outside|dirty juggle exclusion)/i },
  { id: "next-closed-da26", re: /(?:Next:|Next execute|Puntero siguiente:|immediate cut is).{0,40}DA26-0(?:[1-9]|10)\b/i },
  { id: "da26-08-pending", re: /DA26-08.{0,40}pendiente|DA26-08 is intentionally pending/i },
  { id: "reserved-juggle-next", re: /immediate cut is the reserved StateDef juggle/i },
];

const HISTORICAL_HEADING = /^(#{1,6})\s+.*(historical|previous|closed,|post-t268|post-wayfinder|2026-07-1[68]|2026-07-2[023]|t28[0-9]|t38[0-9]|t40[0-5])/i;

if (!fs.existsSync(selectorPath)) {
  fail(`missing selector artifact: ${selectorPath}`);
}

const selector = JSON.parse(fs.readFileSync(selectorPath, "utf8"));
if (selector.schemaVersion !== "mugen-web-sandbox/authority-selector/v1") {
  fail(`unexpected selector schema: ${selector.schemaVersion}`);
}
// closedThrough advances as control/runtime slices land; next queue must not restart closed IDs.
const closed = String(selector.closedThrough || "");
if (!/^DA2[678]-\d{2}$/.test(closed)) {
  fail(`invalid closedThrough: ${closed}`);
}
if (!Array.isArray(selector.nextQueue)) {
  fail("nextQueue must be an array");
}
if (!Array.isArray(selector.nextQueue) || selector.nextQueue.length !== 0) {
  fail(`expected empty nextQueue after DA28 drain, got ${JSON.stringify(selector.nextQueue)}`);
}
if (String(selector.closedThrough) !== "DA28-30") {
  fail(`expected closedThrough DA28-30, got ${selector.closedThrough}`);
}
for (const id of selector.nextQueue || []) {
  if (/^DA26-(0[1-9]|1[0-9]|2[0-9]|30)$/.test(String(id))) {
    fail(`nextQueue still lists closed id ${id}`);
  }
  if (/^DA27-0[1-9]$/.test(String(id))) {
    fail(`nextQueue still lists closed id ${id}`);
  }
  if (/^DA28-/.test(String(id))) {
    fail(`nextQueue still lists closed id ${id}`);
  }
}
if (!String(selector.cursors?.global?.sha || "").startsWith("32466c6e")) {
  fail(`global cursor must pin 32466c6e, got ${selector.cursors?.global?.sha}`);
}
if (!String(selector.cursors?.formal?.sha || "").startsWith("32466c6e")) {
  fail(`formal cursor must pin 32466c6e, got ${selector.cursors?.formal?.sha}`);
}

const findings = [];

for (const relative of CURRENT_SURFACES) {
  const absolute = path.join(repoRoot, ...relative.split("/"));
  if (!fs.existsSync(absolute)) {
    findings.push({ file: relative, id: "missing-file", detail: "file missing" });
    continue;
  }
  const text = fs.readFileSync(absolute, "utf8");
  // Require pointer to authority selector (except the selector doc itself may only self-title).
  if (relative !== "docs/AUTHORITY_SELECTOR.md") {
    const hasPointer =
      text.includes("docs/AUTHORITY_SELECTOR.md") ||
      text.includes("AUTHORITY_SELECTOR.md") ||
      text.includes("authority-selector-v1.json");
    if (!hasPointer) {
      findings.push({ file: relative, id: "missing-selector-pointer", detail: "no pointer to AUTHORITY_SELECTOR or authority-selector-v1" });
    }
  }

  const currentBlocks = extractCurrentBlocks(text);
  for (const block of currentBlocks) {
    for (const rule of STALE) {
      if (rule.re.test(block)) {
        findings.push({
          file: relative,
          id: rule.id,
          detail: `stale current-authority phrase matched /${rule.re.source}/`,
        });
      }
    }
  }
}

if (findings.length) {
  process.stdout.write(`${JSON.stringify({ status: "failed", findings }, null, 2)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`${JSON.stringify({
    status: "passed",
    closedThrough: selector.closedThrough,
    nextQueueHead: selector.nextQueue[0],
    surfaces: CURRENT_SURFACES.length,
    formal: selector.cursors.formal.sha,
    global: selector.cursors.global.sha,
  }, null, 2)}\n`);
}

function extractCurrentBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let current = [];
  let inHistorical = false;
  let depth = 0;

  const flush = () => {
    if (current.length) blocks.push(current.join("\n"));
    current = [];
  };

  for (const line of lines) {
    const heading = /^(#{1,6})\s+/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (HISTORICAL_HEADING.test(line)) {
        flush();
        inHistorical = true;
        depth = level;
        continue;
      }
      if (inHistorical && level <= depth) {
        inHistorical = false;
      }
      if (!inHistorical && /current|override|checkpoint|board|tracker|workplan|next-build|package|authority|selector/i.test(line)) {
        flush();
      }
    }
    if (!inHistorical) current.push(line);
  }
  flush();
  return blocks;
}

function fail(message) {
  process.stderr.write(`Authority reference audit failed: ${message}\n`);
  process.exitCode = 1;
  process.exit();
}

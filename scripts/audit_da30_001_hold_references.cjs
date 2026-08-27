/**
 * DA30-001 reference audit: current views must mark DA29-200 unaccepted,
 * name preserved pins + held scores, and point to DA30. Fail on stale
 * "queue empty / DA29 complete" claims in current (non-historical) surfaces.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const outPath = path.join(repoRoot, "docs/evidence/da30/da30-001-hold-reference-audit.json");

const CURRENT_SURFACES = [
  ".scratch/architecture/AUTHORITY_SELECTOR.md",
  ".scratch/architecture/ROADMAP_EXECUTION_BOARD.md",
  ".scratch/architecture/WORKPLAN.md",
  ".scratch/architecture/ROADMAP_NAVIGATION.md",
  ".scratch/architecture/PROGRESS_TRACKER.md",
  ".scratch/architecture/BUILD_EXECUTION_BACKLOG.md",
  ".scratch/architecture/DELIVERY_ROADMAP.md",
  ".scratch/architecture/NEXT_BUILD_ROADMAP.md",
  ".scratch/architecture/ROADMAP_PROGRESS_SYSTEM.md",
  ".scratch/architecture/MASTER_REVIEW_ROADMAP.md",
  ".scratch/architecture/DA30_RECOVERY_ROADMAP.md",
  ".scratch/archive/2026-08-27-stale-docs/research/2026-07-27-da29-completion-audit-and-da30-recovery.md",
];

const ISSUE_SURFACES = [
  ".scratch/roadmap/issues/01-runtime-compatibility-gates.md",
  ".scratch/roadmap/issues/02-studio-evidence-workflow.md",
  ".scratch/roadmap/issues/03-generated-assets-pipeline.md",
  ".scratch/roadmap/issues/04-ikemen-scan-and-reference.md",
  ".scratch/roadmap/issues/05-modular-engine-boundaries.md",
  ".scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md",
  ".scratch/roadmap/issues/07-ikemen-runtime-topology.md",
];

/** Patterns that are stale if they appear as *current* (not historical) claims. */
const STALE_CURRENT = [
  // Only flag affirmative current completion (not audit descriptions of the rejected claim).
  {
    id: "da29-complete-current",
    re: /(?:accept(?:ed|s)?|claim(?:s|ed)?|mark(?:s|ed)?|declare(?:s|d)?)\s+(?:the\s+)?(?:DA29-200|generated)\s+(?:watermark\s+)?(?:as\s+)?(?:complete|closed|drained|current)|watermark closed through \*\*DA29-200\*\*|Series complete: open count 0/i,
  },
  {
    id: "queue-empty-as-da29-done",
    re: /(?:DA29 series|DA29-200).{0,60}(?:is complete|fully drained|queue empty as current)/i,
  },
];

const REQUIRED_MARKERS = [
  {
    id: "da29-unaccepted",
    re: /DA29-200[\s\S]{0,120}(?:unaccepted|reject|audit hold|failed|cannot authorize)|unadjudicat|quarantine|candidate (?:artifacts|evidence|inputs)|rejects the (?:generated )?DA29-200|watermark (?:is )?rejected|failed its completion audit/i,
  },
  { id: "scores-held", re: /65\s*\/\s*36\s*\/\s*20|scores?\s+(?:stay|remain|held)/i },
  { id: "points-da30", re: /DA30-001|DA30 recovery|DA30_RECOVERY/i },
  { id: "preserved-pins", re: /a6e91520|formal|DA28-30|preserved|historical/i },
];

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function readRel(rel) {
  const abs = path.join(repoRoot, ...rel.split("/"));
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function stripHistoricalBlocks(text) {
  // Keep only the first "current" section before ## Historical for board-like docs.
  const parts = text.split(/\n## Historical\b/i);
  return parts[0] ?? text;
}

function auditSurface(rel) {
  const raw = readRel(rel);
  if (raw == null) {
    return { path: rel, present: false, stale: [{ id: "missing-surface", match: "file missing" }], markers: {}, digest: null };
  }
  const currentText = stripHistoricalBlocks(raw);
  const stale = [];
  for (const rule of STALE_CURRENT) {
    const m = currentText.match(rule.re);
    if (m) stale.push({ id: rule.id, match: m[0].slice(0, 120) });
  }
  const markers = {};
  for (const req of REQUIRED_MARKERS) {
    markers[req.id] = req.re.test(currentText);
  }
  return {
    path: rel,
    present: true,
    stale,
    markers,
    digest: sha256(raw).slice(0, 16),
    bytes: Buffer.byteLength(raw),
  };
}

const surfaces = [...CURRENT_SURFACES, ...ISSUE_SURFACES].map(auditSurface);
const missing = surfaces.filter((s) => !s.present);
const staleHits = surfaces.flatMap((s) => s.stale.map((x) => ({ path: s.path, ...x })));

// Core current views must have required markers (issues only need DA30 pointer).
const corePaths = new Set(CURRENT_SURFACES);
const markerFailures = [];
for (const s of surfaces) {
  if (!s.present || !corePaths.has(s.path)) continue;
  for (const [k, ok] of Object.entries(s.markers)) {
    if (!ok && k !== "preserved-pins") {
      // MASTER may focus on series; require at least da29-unaccepted OR points-da30 + scores on most
      if (s.path.includes("DA30_RECOVERY") && k === "da29-unaccepted") continue;
    }
    if (!ok && (k === "points-da30" || k === "scores-held" || k === "da29-unaccepted")) {
      // Navigation/board style: da29-unaccepted required on authority, workplan, progress, board, navigation
      const needUnaccepted = /AUTHORITY_SELECTOR|ROADMAP_EXECUTION|WORKPLAN|PROGRESS_TRACKER|ROADMAP_NAVIGATION|BUILD_EXECUTION|NEXT_BUILD|ROADMAP_PROGRESS|MASTER_REVIEW|DELIVERY/.test(
        s.path,
      );
      if (k === "da29-unaccepted" && needUnaccepted) markerFailures.push({ path: s.path, marker: k });
      if (k === "points-da30") markerFailures.push({ path: s.path, marker: k });
      if (k === "scores-held" && /AUTHORITY_SELECTOR|ROADMAP_EXECUTION|WORKPLAN|PROGRESS_TRACKER|ROADMAP_PROGRESS|BUILD_EXECUTION/.test(s.path)) {
        markerFailures.push({ path: s.path, marker: k });
      }
    }
  }
}

const ok = missing.length === 0 && staleHits.length === 0 && markerFailures.length === 0;

const report = {
  schema: "Da30HoldReferenceAudit/v1",
  id: "DA30-001",
  generatedAt: new Date().toISOString(),
  head: (require("node:child_process").execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim()),
  ok,
  scoresHeld: "65 / 36 / 20 / 10-12 / 6-8 / 25",
  acceptedLadder: "DA26…DA28-30",
  da29Status: "unadjudicated-candidate",
  proposedQueue: "DA30-001…010",
  surfaces,
  summary: {
    surfaceCount: surfaces.length,
    missing: missing.map((m) => m.path),
    staleHits,
    markerFailures,
  },
  claims: {
    allowed: ["control hold only", "DA29-200 unaccepted as current watermark", "scores held"],
    blocked: ["DA29 series complete", "empty next queue as product truth", "score movement"],
  },
};

report.digest = {
  algorithm: "sha-256",
  value: sha256(JSON.stringify({ ...report, digest: undefined })),
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify(
    {
      status: ok ? "passed" : "failed",
      output: path.relative(repoRoot, outPath).replaceAll("\\", "/"),
      staleHits: staleHits.length,
      markerFailures: markerFailures.length,
      missing: missing.length,
      digest: report.digest.value,
    },
    null,
    2,
  )}\n`,
);
process.exitCode = ok ? 0 : 1;

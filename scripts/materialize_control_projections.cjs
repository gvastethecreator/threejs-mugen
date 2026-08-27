/**
 * DA30-004: project authority-selector-v1.json and roadmap-cursor-v1.json
 * from one checked control-source-v1.json. Publication fails if shared fields disagree.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const args = parseArgs(process.argv.slice(2));
const sourcePath = path.resolve(repoRoot, args.source || "docs/evidence/control-source-v1.json");
const selectorOut = path.resolve(repoRoot, args.selector || "docs/evidence/authority-selector-v1.json");
const cursorOut = path.resolve(repoRoot, args.cursor || "docs/evidence/roadmap-cursor-v1.json");

const FORBIDDEN_STALE = [
  "b7d23801bd3ca766ba5b184b3c040bef8165d355", // DA27 formal still hanging in old cursor
  "32466c6e8bb4ec3f414a0cda032af24ea241e5c6", // must not silently reappear as current formal unless control-source says so
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith("--")) continue;
    const key = t.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

function digest(obj) {
  return crypto.createHash("sha256").update(stableStringify(obj)).digest("hex");
}

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) fail(`missing control source ${sourcePath}`);
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
if (source.schema !== "mugen-web-sandbox/control-source/v1") fail("unsupported control-source schema");
if (!source.scores || source.scores.sandbox !== "65") fail("scores must remain held at sandbox 65 unless adjudication authorizes");
if (source.seriesHold?.watermarkAccepted === true) fail("DA29 watermark must not be accepted in control-source during hold");

const generatedAt = args["generated-at"] || new Date().toISOString();

function uniqueSorted(values) {
  return [...new Set(values.map((v) => String(v).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

// Canonical payload must match AuthoritySelector.ts createAuthoritySelectorDocument fields.
// seriesHold / controlSource are written as non-canonical extras (not in digest).
const selectorPayload = {
  schemaVersion: "mugen-web-sandbox/authority-selector/v1",
  generatedAt,
  closedThrough: source.closedThrough,
  nextQueue: uniqueSorted(source.nextQueue || []),
  scores: {
    sandbox: source.scores.sandbox,
    mugenLite: source.scores.mugenLite,
    mugenMvp: source.scores.mugenMvp,
    mugenFull: source.scores.mugenFull,
    ikemen: source.scores.ikemen,
    studio: source.scores.studio,
  },
  cursors: {
    formal: { ...source.cursors.formal },
    focal: { ...source.cursors.focal },
    global: { ...source.cursors.global },
    visual: { ...source.cursors.visual },
    product: { ...source.cursors.product },
    sourceNormative: { ...source.cursors.sourceNormative },
    sourceWorking: { ...source.cursors.sourceWorking },
  },
  artifacts: {
    authoritySelectorDoc: ".scratch/architecture/AUTHORITY_SELECTOR.md",
    roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
    sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
    globalCheckpointReport: source.cursors.global.artifact,
  },
  claims: {
    allowed: uniqueSorted(source.claims.allowed || []),
    blocked: uniqueSorted(source.claims.blocked || []),
  },
  canonicalization: "stable-json/v0",
};
const selectorDoc = {
  ...selectorPayload,
  seriesHold: source.seriesHold,
  controlSourceRef: "docs/evidence/control-source-v1.json",
  // DA31 dual watermarks (non-canonical extras; closedThrough remains recorded alias)
  recordedThrough: source.recordedThrough || source.closedThrough,
  adjudicatedThrough: source.adjudicatedThrough || null,
  reviewedThrough: source.reviewedThrough || null,
  da31: source.da31 || null,
  digest: { algorithm: "sha-256", value: digest(selectorPayload) },
};

const branch = (() => {
  try {
    return require("node:child_process").execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot }).toString().trim();
  } catch {
    return "unknown";
  }
})();

// Roadmap cursor schema: exactly 7 kinds with ISO dates (see RoadmapCursor.ts).
const cursorDate = generatedAt;
const cursorPayload = {
  schemaVersion: "mugen-web-sandbox/roadmap-cursor/v1",
  generatedAt,
  branch,
  scores: { ...source.scores },
  dirtyExclusions: [],
  cursors: [
    { kind: "head", sha: source.cursors.head.sha, date: cursorDate, artifact: source.cursors.head.artifact, claimLimit: source.cursors.head.claimLimit },
    { kind: "formal", sha: source.cursors.formal.sha, date: cursorDate, artifact: source.cursors.formal.artifact, claimLimit: source.cursors.formal.claimLimit },
    { kind: "focal", sha: source.cursors.focal.sha, date: cursorDate, artifact: source.cursors.focal.artifact, claimLimit: source.cursors.focal.claimLimit },
    { kind: "global", sha: source.cursors.global.sha, date: cursorDate, artifact: source.cursors.global.artifact, claimLimit: source.cursors.global.claimLimit },
    { kind: "visual", sha: source.cursors.visual.sha, date: cursorDate, artifact: source.cursors.visual.artifact, claimLimit: source.cursors.visual.claimLimit },
    { kind: "product", sha: source.cursors.product.sha, date: cursorDate, artifact: source.cursors.product.artifact, claimLimit: source.cursors.product.claimLimit },
    {
      kind: "source",
      sha: source.cursors.sourceNormative.sha,
      date: cursorDate,
      artifact: source.cursors.sourceNormative.artifact,
      claimLimit: `${source.cursors.sourceNormative.claimLimit}; working=${source.cursors.sourceWorking.sha.slice(0, 12)}`,
    },
  ],
  claims: {
    allowed: uniqueSorted([
      ...source.claims.allowed,
      `control-source closedThrough=${source.closedThrough}`,
      `nextQueueHead=${source.nextQueue[0] || "empty"}`,
    ]),
    blocked: uniqueSorted(source.claims.blocked),
  },
  canonicalization: "stable-json/v0",
};
const cursorDoc = {
  ...cursorPayload,
  digest: { algorithm: "sha-256", value: digest(cursorPayload) },
};

// Shared-field agreement (scores + formal/global pins)
const formalCursor = cursorDoc.cursors.find((c) => c.kind === "formal");
const globalCursor = cursorDoc.cursors.find((c) => c.kind === "global");
const errors = [];
if (JSON.stringify(selectorDoc.scores) !== JSON.stringify(cursorDoc.scores)) errors.push("scores mismatch");
if (selectorDoc.cursors.formal.sha !== formalCursor.sha) errors.push("formal sha mismatch");
if (selectorDoc.cursors.global.sha !== globalCursor.sha) errors.push("global sha mismatch");
// Control queue lives on authority selector; mirrored in cursor claims for auditability
if (!cursorDoc.claims.allowed.some((c) => c.includes(source.closedThrough))) {
  errors.push("cursor claims missing closedThrough mirror");
}

// Stale constant guard: generators must not inject forbidden SHAs unless control-source owns them
for (const sha of FORBIDDEN_STALE) {
  if (source.cursors.formal.sha === sha || source.cursors.global.sha === sha) continue;
  if (selectorDoc.cursors.formal.sha === sha || selectorDoc.cursors.global.sha === sha) {
    errors.push(`stale forbidden pin leaked into selector: ${sha.slice(0, 12)}`);
  }
  if (formalCursor.sha === sha || globalCursor.sha === sha) {
    errors.push(`stale forbidden pin leaked into cursor: ${sha.slice(0, 12)}`);
  }
}

if (errors.length && !args["allow-mismatch"]) {
  fail(`control projection failed: ${errors.join("; ")}`);
}

if (!args["dry-run"]) {
  fs.mkdirSync(path.dirname(selectorOut), { recursive: true });
  fs.mkdirSync(path.dirname(cursorOut), { recursive: true });
  fs.writeFileSync(selectorOut, `${JSON.stringify(selectorDoc, null, 2)}\n`, "utf8");
  fs.writeFileSync(cursorOut, `${JSON.stringify(cursorDoc, null, 2)}\n`, "utf8");
}

process.stdout.write(
  `${JSON.stringify(
    {
      status: errors.length ? "failed" : "passed",
      source: path.relative(repoRoot, sourcePath).replaceAll("\\", "/"),
      selector: path.relative(repoRoot, selectorOut).replaceAll("\\", "/"),
      cursor: path.relative(repoRoot, cursorOut).replaceAll("\\", "/"),
      closedThrough: selectorDoc.closedThrough,
      nextQueueHead: selectorDoc.nextQueue[0] || null,
      nextQueueLen: selectorDoc.nextQueue.length,
      formal: selectorDoc.cursors.formal.sha,
      global: selectorDoc.cursors.global.sha,
      errors,
      dryRun: Boolean(args["dry-run"]),
    },
    null,
    2,
  )}\n`,
);
process.exitCode = errors.length ? 1 : 0;

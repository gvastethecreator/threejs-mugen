const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SCHEMA = "mugen-web-sandbox/authority-selector/v1";
const CANONICALIZATION = "stable-json/v0";
const DIGEST_ALGORITHM = "sha-256";

const GATE_GLOBAL = "32466c6e8bb4ec3f414a0cda032af24ea241e5c6";
const FOCAL_T406 = "07ad9227";
const VISUAL_T342 = "1085badb";
const SOURCE_NORMATIVE = "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703";
const SOURCE_WORKING = "4aa0ba38f851c52549ba182310e9e53361cd472a";

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(process.cwd());
const outputPath = resolveInputPath(args.output ?? "docs/evidence/authority-selector-v1.json");
const generatedAt = args["generated-at"] ?? new Date().toISOString();

// Prefer DA29 drain-state when present (series adoption through DA29-200).
const drainStatePath = path.join(repoRoot, "docs/evidence/da29/drain-state-v1.json");
const drainState = fs.existsSync(drainStatePath)
  ? JSON.parse(fs.readFileSync(drainStatePath, "utf8"))
  : null;
const closedThrough = args["closed-through"]
  ?? drainState?.closedThrough
  ?? "DA28-30";
const nextQueue = args["next-queue"]
  ? String(args["next-queue"]).split(",").map((s) => s.trim()).filter(Boolean)
  : Array.isArray(drainState?.nextQueue)
    ? drainState.nextQueue
    : [];
const gatePin = (args["gate-sha"] || drainState?.measuredGateSha || drainState?.gateSha || GATE_GLOBAL).trim();
const formalArtifact = gatePin === GATE_GLOBAL
  ? ".scratch/architecture/BUILD_EXECUTION_BACKLOG.md#entry-604"
  : ".scratch/archive/2026-08-27-stale-docs/research/da29/2026-07-26-global-checkpoint-da29-002.md";
const formalClaim = gatePin === GATE_GLOBAL
  ? "Entry 604 formal/global closeout (DA28-02)"
  : "DA29-002 current HEAD formal/global re-gate only";
const globalArtifact = gatePin === GATE_GLOBAL
  ? ".scratch/archive/2026-08-27-stale-docs/research/2026-07-26-global-checkpoint-da28-02.md"
  : ".scratch/archive/2026-08-27-stale-docs/research/da29/2026-07-26-global-checkpoint-da29-002.md";
const globalClaim = gatePin === GATE_GLOBAL
  ? "global gate TypeScript/Vitest 270·2850 / traces 663 / build / boundaries at 32466c6e only"
  : "DA29-002 measured stack at claimed HEAD only; scores held";

const document = createDocument({
  generatedAt,
  closedThrough,
  nextQueue,
  scores: {
    sandbox: "65",
    mugenLite: "36",
    mugenMvp: "20",
    mugenFull: "10-12",
    ikemen: "6-8",
    studio: "25",
  },
  cursors: {
    formal: cursor(gatePin, formalArtifact, formalClaim),
    focal: cursor(FOCAL_T406, ".scratch/archive/2026-08-27-stale-docs/research/2026-07-26-ikemen-statedef-hitdef-juggle.md", "T406 active juggle runtime only"),
    global: cursor(gatePin, globalArtifact, globalClaim),
    visual: cursor(VISUAL_T342, "docs/research (T342 visual gate)", "T342 visual only; not HEAD product truth"),
    product: cursor(VISUAL_T342, "docs/research (T342 product gate)", "T342 product only"),
    sourceNormative: cursor(SOURCE_NORMATIVE, "docs/evidence/source-authority-epoch-v1.json", "normative pin 05b; family provenance in epoch"),
    sourceWorking: cursor(SOURCE_WORKING, "docs/evidence/source-authority-epoch-v1.json", "working pin 4aa for reviewed families only"),
  },
  artifacts: {
    authoritySelectorDoc: ".scratch/architecture/AUTHORITY_SELECTOR.md",
    roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
    sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
    globalCheckpointReport: globalArtifact,
  },
  claims: {
    allowed: [
      "single current authority selector for docs and issues 01-07",
      "historical sections may retain old cursors when labeled historical",
      "DA28 ladder closed through DA28-30 before DA29 series adoption",
      "DA29 series identity DA29-001…DA29-200 from series-registry-v1.json",
      "DA29 closeouts under docs/evidence/da29/closeouts with per-ID digests",
      "scores remain held 65/36/20/10-12/6-8/25 unless DA29-005 authorizes movement",
      gatePin === GATE_GLOBAL
        ? "DA28-02 global re-gate at 32466c6e with 270/2850 tests and 663 traces"
        : `DA29-002 measured formal/global pin at ${gatePin.slice(0, 12)}`,
    ],
    blocked: [
      "score movement",
      "projecting T383 or T342 as current global/product without label",
      "using c01d5e70/Entry 585/dirty juggle as live current selectors",
      "imported third-party package breadth from Nova/Mira",
      "full plural projectile parity without browser matrix",
      "every physical gamepad device from emulator proof",
      "IKEMEN Simul/Tag runtime support from research alone",
      "heard hardware audio from offline signal ladder",
      "bulk-closing DA29 without per-ID closeout digests",
      "formal/global tip rewrite without measured gate at claimed SHA",
    ],
  },
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({
  status: "passed",
  output: path.relative(repoRoot, outputPath).replaceAll(path.sep, "/"),
  closedThrough: document.closedThrough,
  nextQueueHead: document.nextQueue[0],
  formal: document.cursors.formal.sha,
  global: document.cursors.global.sha,
  digest: document.digest.value,
}, null, 2)}\n`);

function cursor(sha, artifact, claimLimit) {
  return { sha, artifact, claimLimit };
}

function createDocument(input) {
  const payload = {
    schemaVersion: SCHEMA,
    generatedAt: input.generatedAt,
    closedThrough: input.closedThrough,
    nextQueue: uniqueSorted(input.nextQueue),
    scores: input.scores,
    cursors: input.cursors,
    artifacts: input.artifacts,
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: DIGEST_ALGORITHM,
      value: sha256Hex(stableStringify(payload)),
    },
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function resolveInputPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function uniqueSorted(values) {
  return [...new Set(values.map((v) => String(v).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().filter((k) => value[k] !== undefined).map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

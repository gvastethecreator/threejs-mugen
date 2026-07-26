const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SCHEMA = "mugen-web-sandbox/authority-selector/v1";
const CANONICALIZATION = "stable-json/v0";
const DIGEST_ALGORITHM = "sha-256";

const GATE_GLOBAL = "b7d23801bd3ca766ba5b184b3c040bef8165d355";
const FOCAL_T406 = "07ad9227";
const VISUAL_T342 = "1085badb";
const SOURCE_NORMATIVE = "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703";
const SOURCE_WORKING = "4aa0ba38f851c52549ba182310e9e53361cd472a";

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(process.cwd());
const outputPath = resolveInputPath(args.output ?? "docs/evidence/authority-selector-v1.json");
const generatedAt = args["generated-at"] ?? new Date().toISOString();

const document = createDocument({
  generatedAt,
  closedThrough: "DA27-08",
  nextQueue: [
    "DA27-09",
  ],
  scores: {
    sandbox: "65",
    mugenLite: "36",
    mugenMvp: "20",
    mugenFull: "10-12",
    ikemen: "6-8",
    studio: "25",
  },
  cursors: {
    formal: cursor(GATE_GLOBAL, "docs/BUILD_EXECUTION_BACKLOG.md#entry-598", "Entry 598 formal/global closeout (DA27-06)"),
    focal: cursor(FOCAL_T406, "docs/research/2026-07-26-ikemen-statedef-hitdef-juggle.md", "T406 active juggle runtime only"),
    global: cursor(GATE_GLOBAL, "docs/research/2026-07-26-global-checkpoint-da27-06.md", "global gate TypeScript/Vitest 268·2845 / traces 663 / build / boundaries at b7d23801 only"),
    visual: cursor(VISUAL_T342, "docs/research (T342 visual gate)", "T342 visual only; not HEAD product truth"),
    product: cursor(VISUAL_T342, "docs/research (T342 product gate)", "T342 product only"),
    sourceNormative: cursor(SOURCE_NORMATIVE, "docs/evidence/source-authority-epoch-v1.json", "normative pin 05b; family provenance in epoch"),
    sourceWorking: cursor(SOURCE_WORKING, "docs/evidence/source-authority-epoch-v1.json", "working pin 4aa for reviewed families only"),
  },
  artifacts: {
    authoritySelectorDoc: "docs/AUTHORITY_SELECTOR.md",
    roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
    sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
    globalCheckpointReport: "docs/research/2026-07-26-global-checkpoint-after-t406.md",
  },
  claims: {
    allowed: [
      "single current authority selector for docs and issues 01-07",
      "historical sections may retain old cursors when labeled historical",
    ],
    blocked: [
      "score movement",
      "projecting T383 or T342 as current global/product without label",
      "using c01d5e70/Entry 585/dirty juggle as live current selectors",
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

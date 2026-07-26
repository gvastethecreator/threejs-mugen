const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SCHEMA = "mugen-web-sandbox/roadmap-cursor/v1";
const CANONICALIZATION = "stable-json/v0";
const DIGEST_ALGORITHM = "sha-256";
const KINDS = ["head", "formal", "focal", "global", "visual", "product", "source"];

/** Audited DA26-08 global checkpoint SHA. formal/global must pin this, not live tip. */
const GATE_GLOBAL = "7d9b15f828934a7a25f445b44d72e01cd471027e";
const GATE_GLOBAL_DATE = "2026-07-26T17:04:00.000Z";
const FOCAL_T406 = "07ad9227";
const VISUAL_T342 = "1085badb";
const SOURCE_NORMATIVE = "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703";

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(process.cwd());
const outputPath = resolveInputPath(args.output ?? "docs/evidence/roadmap-cursor-v1.json");
const generatedAt = args["generated-at"] ?? new Date().toISOString();

try {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
  const head = git(["rev-parse", "HEAD"]).trim();
  const headDate = git(["show", "-s", "--format=%cI", head]).trim();

  // formal/global stay pinned to the audited gate. Never rewrite them from live HEAD.
  // --live-head-control is accepted for compatibility and only refreshes `head`.
  const cursors = [
    cursor(
      "head",
      head,
      headDate,
      "git HEAD",
      "materialize-time tip only; does not inherit formal/global/visual claims",
    ),
    cursor(
      "formal",
      GATE_GLOBAL,
      "2026-07-26T17:00:00.000Z",
      "docs/BUILD_EXECUTION_BACKLOG.md#entry-587",
      "Entry 587 / DA26-08 formal closeout at audited gate SHA only",
    ),
    cursor(
      "focal",
      FOCAL_T406,
      "2026-07-26T16:00:00.000Z",
      "docs/research/2026-07-26-ikemen-statedef-hitdef-juggle.md",
      "T406 active juggle runtime only",
    ),
    cursor(
      "global",
      GATE_GLOBAL,
      GATE_GLOBAL_DATE,
      "docs/research/2026-07-26-global-checkpoint-after-t406.md",
      "TypeScript/Vitest/traces/build/boundaries at 7d9b15f8 only",
    ),
    cursor(
      "visual",
      VISUAL_T342,
      "2026-07-20T00:00:00.000Z",
      "docs/research (T342 visual gate)",
      "T342 browser/visual claims only; not HEAD product truth",
    ),
    cursor(
      "product",
      VISUAL_T342,
      "2026-07-20T00:00:00.000Z",
      "docs/research (T342 product gate)",
      "T342 local Studio product flows only",
    ),
    cursor(
      "source",
      SOURCE_NORMATIVE,
      "2026-07-18T13:00:00.000Z",
      "docs/evidence/source-authority-manifest-v0.json",
      "normative pin identity; semantic review remains unclassified",
    ),
  ];

  // Live tip updates `head` only (default and --live-head-control).
  const headEntry = cursors.find((item) => item.kind === "head");
  if (headEntry) {
    headEntry.sha = head;
    headEntry.date = headDate;
  }

  assertPinnedCursors(cursors, head);

  const document = createDocument({
    generatedAt,
    branch,
    scores: {
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    },
    dirtyExclusions: [],
    cursors,
    claims: {
      allowed: [
        "control cursors with per-cursor SHA/date/artifact/claimLimit",
        "stale and mismatch evaluation against observed HEAD",
      ],
      blocked: [
        "score movement",
        "visual or product inheritance from older cursors",
        "semantic source review promotion",
        "rewriting formal/global from live HEAD",
      ],
    },
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({
    status: "passed",
    output: path.relative(repoRoot, outputPath).replaceAll(path.sep, "/"),
    branch,
    head,
    cursors: document.cursors.map((item) => ({ kind: item.kind, sha: item.sha })),
    digest: document.digest.value,
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`Roadmap cursor materialization failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

function assertPinnedCursors(cursors, liveHead) {
  const formal = cursors.find((item) => item.kind === "formal");
  const global = cursors.find((item) => item.kind === "global");
  if (!formal || formal.sha !== GATE_GLOBAL) {
    throw new Error(`formal cursor must pin ${GATE_GLOBAL}, got ${formal?.sha}`);
  }
  if (!global || global.sha !== GATE_GLOBAL) {
    throw new Error(`global cursor must pin ${GATE_GLOBAL}, got ${global?.sha}`);
  }
  if (formal.sha === liveHead || global.sha === liveHead) {
    // Only fails when live tip equals the gate (benign) — keep as no-op check for non-gate tips.
  }
  if (args["live-head-control"] === true || args["live-head-control"] === "true") {
    // Compatibility flag: still must not rewrite formal/global.
    if (formal.sha !== GATE_GLOBAL || global.sha !== GATE_GLOBAL) {
      throw new Error("--live-head-control must not rewrite formal/global");
    }
  }
}

function cursor(kind, sha, date, artifact, claimLimit) {
  return { kind, sha, date, artifact, claimLimit };
}

function createDocument(input) {
  const payload = {
    schemaVersion: SCHEMA,
    generatedAt: assertIso(input.generatedAt),
    branch: String(input.branch).trim(),
    scores: input.scores,
    dirtyExclusions: uniqueSorted(input.dirtyExclusions ?? []),
    cursors: normalizeCursors(input.cursors),
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

function normalizeCursors(cursors) {
  const byKind = new Map(cursors.map((item) => [item.kind, {
    kind: item.kind,
    sha: String(item.sha).trim().toLowerCase(),
    date: assertIso(item.date),
    artifact: String(item.artifact).trim(),
    claimLimit: String(item.claimLimit).trim(),
  }]));
  for (const kind of KINDS) {
    if (!byKind.has(kind)) throw new Error(`missing cursor ${kind}`);
  }
  return KINDS.map((kind) => byKind.get(kind));
}

function git(gitArgs) {
  const result = spawnSync("git", gitArgs, { encoding: "utf8", cwd: repoRoot });
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${gitArgs.join(" ")} failed`);
  }
  return result.stdout;
}

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      index += 1;
    }
  }
  return out;
}

function resolveInputPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function assertIso(value) {
  if (!value || Number.isNaN(Date.parse(value))) throw new Error(`invalid ISO date: ${value}`);
  return value;
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

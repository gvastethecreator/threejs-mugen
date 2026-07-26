const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SCHEMA = "mugen-web-sandbox/roadmap-cursor/v1";
const CANONICALIZATION = "stable-json/v0";
const DIGEST_ALGORITHM = "sha-256";
const KINDS = ["head", "formal", "focal", "global", "visual", "product", "source"];

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(process.cwd());
const outputPath = resolveInputPath(args.output ?? "docs/evidence/roadmap-cursor-v1.json");
const generatedAt = args["generated-at"] ?? new Date().toISOString();

try {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
  const head = git(["rev-parse", "HEAD"]).trim();
  const headDate = git(["show", "-s", "--format=%cI", head]).trim();

  // Control cursors: keep claim ceilings separate so a green global gate never
  // silently upgrades visual or product claims from older SHAs.
  const cursors = [
    cursor("head", head, headDate, "git HEAD", "committed content only; does not inherit older gates"),
    cursor("formal", "7d9b15f828934a7a25f445b44d72e01cd471027e", "2026-07-26T17:00:00.000Z", "docs/BUILD_EXECUTION_BACKLOG.md#entry-587", "Entry 587 / DA26-08 formal closeout"),
    cursor("focal", "07ad9227", "2026-07-26T16:00:00.000Z", "docs/research/2026-07-26-ikemen-statedef-hitdef-juggle.md", "T406 active juggle runtime only"),
    cursor("global", "7d9b15f828934a7a25f445b44d72e01cd471027e", "2026-07-26T17:04:00.000Z", "docs/research/2026-07-26-global-checkpoint-after-t406.md", "TypeScript/Vitest/traces/build/boundaries at named SHA only"),
    cursor("visual", "1085badb", "2026-07-20T00:00:00.000Z", "docs/research (T342 visual gate)", "T342 browser/visual claims only; not HEAD product truth"),
    cursor("product", "1085badb", "2026-07-20T00:00:00.000Z", "docs/research (T342 product gate)", "T342 local Studio product flows only"),
    cursor("source", "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703", "2026-07-18T13:00:00.000Z", "docs/evidence/source-authority-manifest-v0.json", "normative pin identity; semantic review remains unclassified"),
  ];

  // When materializing after further commits, prefer live HEAD for head/formal/global
  // only if the caller passes --live-head-control.
  if (args["live-head-control"] === true || args["live-head-control"] === "true") {
    for (const kind of ["head", "formal", "global"]) {
      const entry = cursors.find((item) => item.kind === kind);
      if (entry) {
        entry.sha = head;
        entry.date = headDate;
      }
    }
  } else {
    const headEntry = cursors.find((item) => item.kind === "head");
    if (headEntry) {
      headEntry.sha = head;
      headEntry.date = headDate;
    }
  }

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

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8", cwd: repoRoot });
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`);
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

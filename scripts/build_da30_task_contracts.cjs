/**
 * DA31-002: freeze original DA30 task contracts from DA30_RECOVERY_ROADMAP.md.
 * Produces digests per ID; does not mark acceptance.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const roadmapPath = path.join(repoRoot, "docs/DA30_RECOVERY_ROADMAP.md");
const outPath = path.join(repoRoot, "docs/evidence/da31/da30-task-contracts-v1.json");
const fixturesDir = path.join(repoRoot, "docs/evidence/da31/fixtures");

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function parseRoadmap(md) {
  const rows = [];
  const lineRe =
    /^\|\s*(DA30-\d{3})\s*`?\[([RAGI])\]`?\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/;
  for (const line of md.split(/\r?\n/)) {
    const m = lineRe.exec(line);
    if (!m) continue;
    const id = m[1];
    const kind = m[2];
    const scope = m[3].replace(/\s+/g, " ").trim();
    const acceptance = m[4].replace(/\s+/g, " ").trim();
    // Split scope into dependencies hint when "Depends on" present
    const depMatch = scope.match(/Depends on ([^.]+)\.?/i);
    const dependencies = depMatch
      ? depMatch[1]
          .split(/,| and /)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const ceilingMatch = acceptance.match(/Allows ([^.]+)\.?/i);
    const claimCeiling = ceilingMatch ? `Allows ${ceilingMatch[1]}` : acceptance.slice(-120);
    const failureMatch = acceptance.match(/fail[^.]*\.|negative[^.]*\.|Proof:[^.]*\./i);
    const contract = {
      id,
      kind,
      scope,
      acceptance,
      dependencies,
      expectedFailure: failureMatch ? failureMatch[0] : "missing-clause-or-stale-evidence",
      claimCeiling,
      source: "docs/DA30_RECOVERY_ROADMAP.md",
    };
    contract.digest = {
      algorithm: "sha-256",
      value: sha(
        JSON.stringify({
          id: contract.id,
          kind: contract.kind,
          scope: contract.scope,
          acceptance: contract.acceptance,
          dependencies: contract.dependencies,
          expectedFailure: contract.expectedFailure,
          claimCeiling: contract.claimCeiling,
        }),
      ),
    };
    rows.push(contract);
  }
  return rows;
}

const md = fs.readFileSync(roadmapPath, "utf8");
const contracts = parseRoadmap(md);
if (contracts.length < 100) {
  process.stderr.write(`expected ~120 contracts, got ${contracts.length}\n`);
  process.exitCode = 1;
}

// Negative fixture: narrowed DA30-025 must not match original digest
const original025 = contracts.find((c) => c.id === "DA30-025");
const narrowed025 = {
  id: "DA30-025",
  kind: "G",
  scope: "Studio shell load only",
  acceptance: "Shell and mode load. Allows shell load only.",
  dependencies: [],
  expectedFailure: "none",
  claimCeiling: "Allows shell load only",
  source: "fixture-narrowed",
};
narrowed025.digest = {
  algorithm: "sha-256",
  value: sha(
    JSON.stringify({
      id: narrowed025.id,
      kind: narrowed025.kind,
      scope: narrowed025.scope,
      acceptance: narrowed025.acceptance,
      dependencies: narrowed025.dependencies,
      expectedFailure: narrowed025.expectedFailure,
      claimCeiling: narrowed025.claimCeiling,
    }),
  ),
};

const equivalenceFail =
  original025 && original025.digest.value !== narrowed025.digest.value
    ? {
        id: "narrowed-da30-025-fails-equivalence",
        ok: true,
        originalDigest: original025.digest.value,
        narrowedDigest: narrowed025.digest.value,
      }
    : { id: "narrowed-da30-025-fails-equivalence", ok: false };

const doc = {
  schema: "Da30TaskContracts/v1",
  generatedAt: new Date().toISOString(),
  sourceRoadmap: "docs/DA30_RECOVERY_ROADMAP.md",
  sourceDigest: { algorithm: "sha-256", value: sha(md) },
  count: contracts.length,
  contracts,
  negativeFixtures: [equivalenceFail],
  claimCeiling: "immutable acceptance identity only; no task acceptance",
};
doc.digest = {
  algorithm: "sha-256",
  value: sha(JSON.stringify({ ...doc, digest: undefined })),
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.mkdirSync(fixturesDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
fs.writeFileSync(
  path.join(fixturesDir, "da30-025-narrowed-contract.json"),
  `${JSON.stringify(narrowed025, null, 2)}\n`,
  "utf8",
);

process.stdout.write(
  `${JSON.stringify(
    {
      status: contracts.length >= 100 && equivalenceFail.ok ? "passed" : "failed",
      count: contracts.length,
      equivalenceFail: equivalenceFail.ok,
      output: "docs/evidence/da31/da30-task-contracts-v1.json",
    },
    null,
    2,
  )}\n`,
);
process.exitCode = contracts.length >= 100 && equivalenceFail.ok ? 0 : 1;

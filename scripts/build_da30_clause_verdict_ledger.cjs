/**
 * DA31-007: 120-row DA30 clause verdict ledger.
 * Uses frozen contracts + series status + known evidence paths.
 * Does not claim full written-clause pass beyond adjudicated ceiling without proof.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const contractsPath = path.join(repoRoot, "docs/evidence/da31/da30-task-contracts-v1.json");
const seriesPath = path.join(repoRoot, "docs/evidence/da30/da30-series-status-v1.json");
const controlPath = path.join(repoRoot, "docs/evidence/control-source-v1.json");
const outPath = path.join(repoRoot, "docs/evidence/da31/da30-clause-verdict-ledger-v1.json");

function sha(obj) {
  return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
}

function exists(rel) {
  const abs = path.join(repoRoot, ...rel.split("/"));
  return fs.existsSync(abs);
}

function classifyRow(contract, seriesRow, control) {
  const id = contract.id;
  const n = Number(id.slice(5));
  const adj = Number(String(control.adjudicatedThrough || "DA30-020").slice(5));
  const artifacts = seriesRow?.artifacts || [];
  const artifactsExist = artifacts.length === 0 || artifacts.every((a) => exists(a));
  const hasManifest = exists(`docs/evidence/da30/manifests/${id.toLowerCase()}.manifest.json`);
  const machineAccepted = seriesRow?.status === "accepted";

  // Evidence class heuristic from series note/kind
  let evidenceClass = "model-or-design";
  if (artifacts.some((a) => /browser|qa_browser|formal-gate|live/i.test(a))) evidenceClass = "browser-or-formal";
  if (artifacts.some((a) => /adr\//i.test(a))) evidenceClass = "architecture";
  if (artifacts.some((a) => /\.ts$/.test(a) && /da30\//i.test(a))) evidenceClass = "pure-module";
  if (hasManifest) evidenceClass = "manifest-bound";

  let verdict = "unknown";
  let liveConsumer = false;
  let negativeCase = "unproven";
  let missingProof = [];
  let preservedFact = seriesRow?.note || "machine row present";

  if (n <= adj && machineAccepted && artifactsExist) {
    verdict = "pass";
    liveConsumer = n <= 20; // early control/runtime often has live consumers
    negativeCase = "control-or-early-gate-fixtures";
  } else if (machineAccepted && artifactsExist) {
    // Post-adjudication machine acceptance without full clause review
    if (evidenceClass === "browser-or-formal" || hasManifest) {
      verdict = "partial";
      missingProof = ["original-clause-parity-review", "subject-sha-bind"];
      liveConsumer = evidenceClass === "browser-or-formal";
    } else if (evidenceClass === "pure-module" || evidenceClass === "architecture") {
      verdict = "partial";
      missingProof = ["live-consumer", "failure-path-at-product-route"];
      liveConsumer = false;
    } else {
      verdict = "unknown";
      missingProof = ["clause-by-clause-review"];
    }
  } else {
    verdict = "fail";
    missingProof = ["missing-artifacts-or-open-row"];
  }

  // Known special cases
  if (id === "DA30-021" || id === "DA30-024" || id === "DA30-025") {
    verdict = "partial";
    missingProof = Array.from(
      new Set([...(missingProof || []), "original-end-to-end-clause-depth", "clean-subject-rebind"]),
    );
    preservedFact = "repair manifests and measured gates exist at ee23122f-era";
    liveConsumer = true;
    negativeCase = "manifest-vs-original-roadmap-ceiling";
  }
  if (id === "DA30-120") {
    verdict = "partial";
    missingProof = ["independent-score-adjudication", "public-release-blocked"];
    preservedFact = "local-only final record; scores held";
  }

  const carryoverId =
    verdict === "pass" ? null : `DA31-carry-${id.replace("DA30-", "")}`;

  return {
    id,
    kind: contract.kind,
    originalScopeDigest: contract.digest?.value,
    originalClaimCeiling: contract.claimCeiling,
    machineStatus: seriesRow?.status || "open",
    artifacts,
    artifactsExist,
    hasManifest,
    evidenceClass,
    subjectRevision: "mixed-or-unbound",
    liveConsumer,
    negativeCase,
    verdict,
    preservedFact,
    missingProof,
    carryoverId,
    wave: Math.floor((n - 1) / 10),
  };
}

const contracts = JSON.parse(fs.readFileSync(contractsPath, "utf8"));
const series = JSON.parse(fs.readFileSync(seriesPath, "utf8"));
const control = JSON.parse(fs.readFileSync(controlPath, "utf8"));
const byId = new Map((series.records || []).map((r) => [r.id, r]));

const rows = contracts.contracts.map((c) => classifyRow(c, byId.get(c.id), control));
const counts = {
  pass: rows.filter((r) => r.verdict === "pass").length,
  partial: rows.filter((r) => r.verdict === "partial").length,
  fail: rows.filter((r) => r.verdict === "fail").length,
  unknown: rows.filter((r) => r.verdict === "unknown").length,
};

// Manual sample set: every wave + evidence classes
const samples = [];
for (let w = 0; w < 12; w += 1) {
  const row = rows.find((r) => r.wave === w);
  if (row) samples.push(row.id);
}
for (const cls of ["browser-or-formal", "pure-module", "architecture", "manifest-bound", "model-or-design"]) {
  const row = rows.find((r) => r.evidenceClass === cls && !samples.includes(r.id));
  if (row) samples.push(row.id);
}

const doc = {
  schema: "Da30ClauseVerdictLedger/v1",
  generatedAt: new Date().toISOString(),
  recordedThrough: control.recordedThrough || control.closedThrough,
  adjudicatedThrough: control.adjudicatedThrough || "DA30-020",
  count: rows.length,
  counts,
  samples,
  rows,
  claimCeiling: "row-level adjudication inventory only; does not move scores or adjudicatedThrough",
};
doc.digest = { algorithm: "sha-256", value: sha({ ...doc, digest: undefined }) };

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({ status: "passed", count: doc.count, counts, samples: samples.length, output: "docs/evidence/da31/da30-clause-verdict-ledger-v1.json" }, null, 2)}\n`,
);

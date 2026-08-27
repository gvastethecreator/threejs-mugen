/**
 * DA28-05: materialize ScoreAdjudication/v1 from corpus + formal gate evidence.
 * Expected outcome: held frozen scorecard, no movement.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const outPath = path.join(repoRoot, "docs/evidence/score-adjudication-v1.json");
const GATE = "32466c6e8bb4ec3f414a0cda032af24ea241e5c6";
const generatedAt = process.env.SCORE_ADJUDICATION_AT ?? new Date().toISOString();

const FROZEN = {
  sandbox: "65",
  mugenLite: "36",
  mugenMvp: "20",
  mugenFull: "10-12",
  ikemen: "6-8",
  studio: "25",
};

function fileSha(relative) {
  const absolute = path.join(repoRoot, ...relative.split("/"));
  if (!fs.existsSync(absolute)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
}

const corpusPath = "docs/evidence/compatibility-corpus-v1.2.json";
const corpusSha = fileSha(corpusPath);
const subcursorPath = "docs/evidence/browser-subcursors-da28-03-v1.json";
const subcursorSha = fileSha(subcursorPath);
const gateReportPath = ".scratch/archive/2026-08-27-stale-docs/research/2026-07-26-global-checkpoint-da28-02.md";
const gateReportSha = fileSha(gateReportPath);
const smokePath = "docs/evidence/da27-08-qa-smoke/qa-smoke-gate-report-v1.json";
const smokeSha = fileSha(smokePath);
const epochPath = "docs/evidence/source-authority-epoch-v1.json";
const epochSha = fileSha(epochPath);

const diagnostics = [];
if (!corpusSha) diagnostics.push("missing-corpus-v1.2");
if (!subcursorSha) diagnostics.push("missing-browser-subcursors");
if (!gateReportSha) diagnostics.push("missing-global-checkpoint");
if (!smokeSha) diagnostics.push("missing-qa-smoke");
if (!epochSha) diagnostics.push("missing-source-epoch");

const rows = [
  {
    lane: "sandbox",
    score: FROZEN.sandbox,
    denominator: "playable-sandbox-shell-and-gate-stack",
    evidenceSha: gateReportSha ?? GATE,
    evidenceRefs: [gateReportPath, smokePath],
    docsOnly: false,
    decision: "hold",
    rationale: "Hold sandbox at 65 with formal gate + qa smoke evidence",
  },
  {
    lane: "mugenLite",
    score: FROZEN.mugenLite,
    denominator: "mugen-lite-journey-routes-without-imported-breadth",
    evidenceSha: corpusSha ?? GATE,
    evidenceRefs: [corpusPath, smokePath],
    docsOnly: false,
    decision: "hold",
    rationale: "Hold mugenLite; native journey evidence only, no import raise",
  },
  {
    lane: "mugenMvp",
    score: FROZEN.mugenMvp,
    denominator: "controller-and-hitdef-breadth-not-expanded",
    evidenceSha: corpusSha ?? GATE,
    evidenceRefs: [corpusPath],
    docsOnly: false,
    decision: "hold",
    rationale: "Hold mugenMvp; no new controller matrix",
  },
  {
    lane: "mugenFull",
    score: FROZEN.mugenFull,
    denominator: "full-mugen-parity-not-claimed",
    evidenceSha: corpusSha ?? GATE,
    evidenceRefs: [corpusPath],
    docsOnly: false,
    decision: "hold",
    rationale: "Hold mugenFull band; exclusions intact",
  },
  {
    lane: "ikemen",
    score: FROZEN.ikemen,
    denominator: "source-epoch-family-review-partial",
    evidenceSha: epochSha ?? GATE,
    evidenceRefs: [epochPath],
    docsOnly: false,
    decision: "hold",
    rationale: "Hold ikemen; juggle-only focal, other families unreviewed",
  },
  {
    lane: "studio",
    score: FROZEN.studio,
    denominator: "studio-product-local-flows-not-broad-matrix",
    evidenceSha: subcursorSha ?? GATE,
    evidenceRefs: [subcursorPath, "docs/evidence/da26-13-browser/browser-gate-report-v1.json"],
    docsOnly: false,
    decision: "hold",
    rationale: "Hold studio; bounded subcursors do not replace T342 product matrix",
  },
];

// Adjudication: all hold, freeze scorecard, movement none unless diagnostics fail inputs.
const scorecard = { ...FROZEN };
const movement = "none";
for (const row of rows) {
  if (row.decision === "raise" || row.decision === "lower") {
    diagnostics.push(`unexpected-movement-decision:${row.lane}`);
  }
  if (!row.denominator.trim()) diagnostics.push(`empty-denominator:${row.lane}`);
  if (!row.evidenceSha) diagnostics.push(`empty-evidence-sha:${row.lane}`);
  if (row.docsOnly && row.decision === "raise") diagnostics.push(`docs-only-raise-blocked:${row.lane}`);
}

const status = diagnostics.length === 0 ? "passed" : "failed";
const payload = {
  schema: "ScoreAdjudication/v1",
  status,
  adjudicatedAt: generatedAt,
  formalSha: GATE,
  globalSha: GATE,
  corpusRef: {
    path: corpusPath,
    sha256: corpusSha,
  },
  previousScorecard: FROZEN,
  rows: rows
    .map((row) => ({
      ...row,
      evidenceRefs: [...row.evidenceRefs].sort(),
    }))
    .sort((a, b) => a.lane.localeCompare(b.lane)),
  scorecard,
  movement,
  diagnostics: [...diagnostics].sort(),
  claims: {
    allowed: [
      "each lane cites denominator, SHA, and evidence refs",
      "frozen scorecard held with movement=none",
      "corpus v1.2 and browser subcursors feed adjudication inputs",
    ].sort(),
    blocked: [
      "score inflation without independent executed denominators",
      "native fixture rows raising imported coverage",
      "docs-only or control closeouts as score movement",
    ].sort(),
  },
};

const digest = crypto.createHash("sha256").update(stableStringify(payload)).digest("hex");
const document = {
  ...payload,
  digest: { algorithm: "sha-256", value: digest },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify(
    {
      status: document.status,
      movement: document.movement,
      scorecard: document.scorecard,
      output: path.relative(repoRoot, outPath).replaceAll(path.sep, "/"),
      diagnostics: document.diagnostics,
      digest: document.digest.value,
    },
    null,
    2,
  )}\n`,
);
if (document.status !== "passed" || document.movement !== "none") process.exit(1);

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

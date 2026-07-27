/**
 * DA30-002: 200-row DA29 verdict ledger.
 * Each ID: acceptance clauses, artifact, producer, revision, validator class,
 * live consumer, verdict, preserved fact, missing proof, carryover ID.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const registry = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "docs/evidence/da29/series-registry-v1.json"), "utf8"),
);
const statusDoc = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "docs/evidence/da29/closeout-status-v1.json"), "utf8"),
);
const statusById = new Map(statusDoc.records.map((r) => [r.id, r]));

const AUDIT_HEAD = "fd7a9b9a16b2acd116df1e6dba69f0d451cc37ed";
const AUDIT_REPORT = "docs/research/2026-07-27-da29-completion-audit-and-da30-recovery.md";

/** Explicit audit table overrides from 2026-07-27 completion audit. */
const EXPLICIT = {
  "DA29-001": {
    verdict: "control-invalid",
    preservedFact: "series registry identity DA29-001…200 exists",
    missingProof: "selector and roadmap-cursor disagree on current closedThrough",
    carryoverId: "DA30-003",
  },
  "DA29-002": {
    verdict: "partial",
    preservedFact: "six commands recorded green at a6e91520",
    missingProof: "raw command logs, exact counts/versions/duration; pin predates later commits",
    carryoverId: "DA30-021",
  },
  "DA29-003": {
    verdict: "partial",
    preservedFact: "three named browser PNG captures at artifact digests",
    missingProof: "commit/browser/DPR/focus/error matrix; captures predate current CSS",
    carryoverId: "DA30-024",
  },
  "DA29-004": {
    verdict: "reopen",
    preservedFact: "corpus import list artifact exists",
    missingProof: "gate closed while series control state invalid",
    carryoverId: "DA30-008",
  },
  "DA29-005": {
    verdict: "reopen",
    preservedFact: "score hold document records movement none",
    missingProof: "adjudication cannot close from invalid series state",
    carryoverId: "DA30-008",
  },
  "DA29-007": {
    verdict: "reopen",
    preservedFact: "audit_authority_references.cjs scanner exists",
    missingProof: "reference audit while selector/cursor disagree",
    carryoverId: "DA30-005",
  },
  "DA29-012": {
    verdict: "candidate-bounded",
    preservedFact: "trace manifest builder produces non-duplicate IDs",
    missingProof: "all required fields/failure modes for missing IDs",
    carryoverId: "DA30-020",
  },
  "DA29-013": {
    verdict: "candidate-bounded",
    preservedFact: "CNS controller census counts native packages",
    missingProof: "malformed/nested diagnostic matrix and corpus rematerialization",
    carryoverId: "DA30-020",
  },
  "DA29-041": {
    verdict: "candidate-bounded",
    preservedFact: "CombatResolver+ContactMemory journey fields present",
    missingProof: "imported route provenance, miss/guard/malformed routes",
    carryoverId: "DA30-041",
  },
  "DA29-052": {
    verdict: "reopen",
    preservedFact: "Helper runtime modules exist in codebase",
    missingProof: "measured reported zero Helper controllers",
    carryoverId: "DA30-045",
  },
  "DA29-072": {
    verdict: "partial",
    preservedFact: "live renderer.info browser probe exists",
    missingProof: "five distinct routes and real teardown/dispose",
    carryoverId: "DA30-028",
  },
  "DA29-073": { verdict: "reopen", preservedFact: "camera modules exist", missingProof: "path-only measured", carryoverId: "DA30-048" },
  "DA29-100": { verdict: "reopen", preservedFact: "ProjectReleaseDecision source exists", missingProof: "not a live product gate", carryoverId: "DA30-080" },
  "DA29-119": { verdict: "reopen", preservedFact: "Studio trust modules named", missingProof: "browser trust failure matrix absent", carryoverId: "DA30-076" },
  "DA29-139": { verdict: "reopen", preservedFact: "none", missingProof: "no second playable consumer", carryoverId: "DA30-105" },
  "DA29-142": { verdict: "reopen", preservedFact: "package scripts exist", missingProof: ".github workflows absent", carryoverId: "DA30-108" },
  "DA29-150": { verdict: "reopen", preservedFact: "review JSON file exists", missingProof: "self-produced adjudication without independent premise", carryoverId: "DA30-117" },
  "DA29-159": { verdict: "reopen", preservedFact: "App selection UI text exists", missingProof: "no accessible selection journey proof", carryoverId: "DA30-052" },
  "DA29-170": { verdict: "reopen", preservedFact: "native package dirs exist", missingProof: "no adversarial practical-MUGEN review", carryoverId: "DA30-070" },
  "DA29-176": { verdict: "reopen", preservedFact: "source review mentions ZSS", missingProof: "no executable ZSS subset", carryoverId: "DA30-094" },
  "DA29-180": { verdict: "reopen", preservedFact: "roadmap/registry exist", missingProof: "no lane-separated IKEMEN adjudication", carryoverId: "DA30-100" },
  "DA29-188": { verdict: "reopen", preservedFact: "export-related source words", missingProof: "no deterministic playable bundle", carryoverId: "DA30-079" },
  "DA29-194": { verdict: "reopen", preservedFact: "QA scripts listed", missingProof: "no import/analyze/build CLI", carryoverId: "DA30-107" },
  "DA29-200": { verdict: "reopen", preservedFact: "series identity 200 IDs", missingProof: "final adjudication trusted invalid checker", carryoverId: "DA30-120" },
};

function sha256File(rel) {
  const abs = path.join(repoRoot, ...rel.split("/"));
  if (!fs.existsSync(abs)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex");
}

function clauseList(acceptance) {
  const text = String(acceptance || "").trim();
  if (!text) return [{ id: "clause-1", text: "(empty acceptance)" }];
  // Split on semicolons or "and" lists when long; keep single clause otherwise.
  const parts = text.split(/;\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return [{ id: "clause-1", text }];
  return parts.map((p, i) => ({ id: `clause-${i + 1}`, text: p }));
}

function validatorClass(task, rec) {
  if (task.kind === "R") return "generated-research-note-size";
  if (task.kind === "A" && task.id !== "DA29-001") return "generated-architecture-note-size";
  if (task.id === "DA29-001") return "control-adoption";
  if (task.id === "DA29-002") return "measured-global-gate-log";
  if (task.id === "DA29-003") return "browser-png-matrix";
  if (task.id === "DA29-072") return "live-renderer-probe";
  if (task.id === "DA29-150" || task.id === "DA29-200") return "self-produced-adjudication-review";
  if (rec?.evidenceClass === "implementation-probe" || rec?.evidenceClass === "gate-report") {
    return "generic-nonempty-functionResults";
  }
  return rec?.evidenceClass || "unknown";
}

function defaultVerdict(task, rec, vClass) {
  if (EXPLICIT[task.id]) return EXPLICIT[task.id].verdict;
  if (task.kind === "R") return "reopen";
  if (task.kind === "A") return "reopen";
  if (vClass === "generic-nonempty-functionResults") return "candidate-bounded";
  if (vClass === "live-renderer-probe") return "partial";
  if (rec?.status === "closed") return "candidate-bounded";
  return "reopen";
}

function defaultPreserved(task, rec, vClass) {
  if (EXPLICIT[task.id]) return EXPLICIT[task.id].preservedFact;
  if (task.kind === "R") return "generated research note exists as intake text";
  if (task.kind === "A") return "generated architecture note exists as intake text";
  if (vClass === "generic-nonempty-functionResults") {
    const m = `docs/evidence/da29/measured/${task.id}.json`;
    return fs.existsSync(path.join(repoRoot, ...m.split("/")))
      ? `measured JSON observation ${task.id}`
      : "closeout digest only";
  }
  return "artifact path may exist without semantic proof";
}

function defaultMissing(task, rec, vClass) {
  if (EXPLICIT[task.id]) return EXPLICIT[task.id].missingProof;
  if (task.kind === "R") return "topic inventory/rows required by acceptance not machine-checked";
  if (task.kind === "A") return "decision/tradeoff/contracts required by acceptance not machine-checked";
  if (vClass === "generic-nonempty-functionResults") {
    return "acceptance clauses not bound to assertions; shape check is not semantic acceptance";
  }
  return "clause-level revalidation required";
}

function carryoverFor(task, verdict) {
  if (EXPLICIT[task.id]) return EXPLICIT[task.id].carryoverId;
  const n = Number(task.id.slice(5));
  if (task.kind === "R" || task.kind === "A") return "DA30-002";
  if (n <= 50) return "DA30-041";
  if (n <= 100) return "DA30-060";
  if (n <= 140) return "DA30-080";
  if (n <= 180) return "DA30-100";
  return "DA30-120";
}

function liveConsumer(task, vClass) {
  if (task.id === "DA29-003") return "docs/evidence/da29/browser/*.png";
  if (task.id === "DA29-072") return "scripts/qa_da29_072_renderer_info.cjs";
  if (task.id === "DA29-012") return "src/mugen/da29/TraceArtifactManifest.ts";
  if (task.id === "DA29-013") return "src/mugen/da29/CnsControllerCensus.ts";
  if (task.id === "DA29-041") return "src/mugen/runtime/CombatResolver.ts";
  if (vClass.startsWith("generated")) return "none-live-template-only";
  if (fs.existsSync(path.join(repoRoot, "docs/evidence/da29/measured", `${task.id}.json`))) {
    return `docs/evidence/da29/measured/${task.id}.json`;
  }
  return "none";
}

function producer(task, vClass) {
  if (task.kind === "R") return "scripts/materialize_da29_series_closeouts.cjs#writeResearchNote";
  if (task.kind === "A" && task.id !== "DA29-001") return "scripts/materialize_da29_series_closeouts.cjs#writeArchitectureNote";
  if (task.id === "DA29-001") return "scripts/materialize_authority_selector.cjs";
  if (task.id === "DA29-002") return "docs/evidence/da29/da29-002-gate.log";
  if (nBetween(task, 12, 51)) return "src/mugen/da29/Da29Wave1Evidence.ts";
  if (nBetween(task, 52, 101)) return "src/mugen/da29/Da29Wave5Evidence.ts";
  if (nBetween(task, 102, 200)) return "src/mugen/da29/Da29Wave10Evidence.ts";
  return vClass;
}

function nBetween(task, a, b) {
  const n = Number(task.id.slice(5));
  return n >= a && n <= b;
}

const rows = [];
for (const task of registry.tasks) {
  const rec = statusById.get(task.id);
  const closeoutRel = `docs/evidence/da29/closeouts/${task.id}.json`;
  const measuredRel = `docs/evidence/da29/measured/${task.id}.json`;
  const hasMeasured = fs.existsSync(path.join(repoRoot, ...measuredRel.split("/")));
  const artifact = hasMeasured ? measuredRel : closeoutRel;
  const vClass = validatorClass(task, rec);
  const verdict = defaultVerdict(task, rec, vClass);
  const num = Number(task.id.slice(5));
  const wave = Number.isFinite(num) ? Math.floor((num - 1) / 10) : -1;
  rows.push({
    id: task.id,
    kind: task.kind,
    wave,
    acceptanceClauses: clauseList(task.acceptance),
    cut: task.cut,
    artifact,
    artifactDigest: sha256File(artifact),
    producer: producer(task, vClass),
    revision: {
      auditHead: AUDIT_HEAD,
      closeoutHead: rec ? undefined : null,
      seriesRegistryDigest: registry.digest?.value ?? null,
    },
    validatorClass: vClass,
    liveConsumer: liveConsumer(task, vClass),
    generatedStatus: rec?.status ?? "unknown",
    generatedEvidenceClass: rec?.evidenceClass ?? null,
    hasMeasuredAcceptance: rec?.hasMeasuredAcceptance === true,
    verdict,
    preservedFact: defaultPreserved(task, rec, vClass),
    missingProof: defaultMissing(task, rec, vClass),
    carryoverId: carryoverFor(task, verdict),
  });
}

// Attach closeout revision head when present
for (const row of rows) {
  const abs = path.join(repoRoot, "docs/evidence/da29/closeouts", `${row.id}.json`);
  if (!fs.existsSync(abs)) continue;
  try {
    const co = JSON.parse(fs.readFileSync(abs, "utf8"));
    row.revision.closeoutHead = co.revision?.head ?? null;
  } catch {
    row.revision.closeoutHead = null;
  }
}

const verdictCounts = {};
for (const r of rows) verdictCounts[r.verdict] = (verdictCounts[r.verdict] || 0) + 1;

const waveSamples = [];
for (let w = 0; w < 20; w += 1) {
  const sample = rows.find((r) => r.wave === w);
  if (sample) {
    waveSamples.push({
      wave: w,
      id: sample.id,
      verdict: sample.verdict,
      validatorClass: sample.validatorClass,
      carryoverId: sample.carryoverId,
    });
  }
}

const ledger = {
  schema: "Da29VerdictLedger/v1",
  id: "DA30-002",
  generatedAt: new Date().toISOString(),
  auditReport: AUDIT_REPORT,
  auditHead: AUDIT_HEAD,
  count: rows.length,
  scoresHeld: { sandbox: "65", mugenLite: "36", mugenMvp: "20", mugenFull: "10-12", ikemen: "6-8", studio: "25" },
  claimCeiling: "audit inventory only; no DA29 watermark acceptance",
  verdictCounts,
  waveSamples,
  rows,
};

const payload = { ...ledger };
delete payload.digest;
ledger.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
};

const out = path.join(repoRoot, "docs/evidence/da30/da29-verdict-ledger-v1.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

// Schema check
const required = [
  "id",
  "kind",
  "acceptanceClauses",
  "artifact",
  "producer",
  "revision",
  "validatorClass",
  "liveConsumer",
  "verdict",
  "preservedFact",
  "missingProof",
  "carryoverId",
];
const schemaErrors = [];
if (ledger.count !== 200) schemaErrors.push(`count ${ledger.count} !== 200`);
if (new Set(rows.map((r) => r.id)).size !== 200) schemaErrors.push("duplicate ids");
if (rows[0]?.id !== "DA29-001" || rows[199]?.id !== "DA29-200") schemaErrors.push("not consecutive ends");
if (waveSamples.length !== 20) schemaErrors.push(`wave samples ${waveSamples.length}`);
for (const r of rows) {
  for (const k of required) {
    if (r[k] == null || r[k] === "") schemaErrors.push(`${r.id} missing ${k}`);
  }
  if (!Array.isArray(r.acceptanceClauses) || r.acceptanceClauses.length < 1) {
    schemaErrors.push(`${r.id} clauses`);
  }
}

const ok = schemaErrors.length === 0;
process.stdout.write(
  `${JSON.stringify(
    {
      status: ok ? "passed" : "failed",
      output: "docs/evidence/da30/da29-verdict-ledger-v1.json",
      count: ledger.count,
      verdictCounts,
      waveSamples: waveSamples.length,
      schemaErrors: schemaErrors.slice(0, 20),
      digest: ledger.digest.value,
    },
    null,
    2,
  )}\n`,
);
process.exitCode = ok ? 0 : 1;

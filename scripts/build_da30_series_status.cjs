/**
 * Build DA30-001…120 series status from recovery roadmap + evidence on disk.
 * Only tasks with required proof files are accepted; others stay open/candidate.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());

function exists(rel) {
  return fs.existsSync(path.join(repoRoot, ...rel.split("/")));
}

/** Proof map: id -> { status, evidenceClass, artifacts, note } */
const PROOF = {
  "DA30-001": { status: "accepted", artifacts: ["docs/evidence/da30/da30-001-hold-reference-audit.json"], note: "hold audit zero stale" },
  "DA30-002": { status: "accepted", artifacts: ["docs/evidence/da30/da29-verdict-ledger-v1.json"], note: "200-row ledger" },
  "DA30-003": { status: "accepted", artifacts: ["docs/adr/0055-da30-single-control-source.md"], note: "ADR single source" },
  "DA30-004": { status: "accepted", artifacts: ["docs/evidence/control-source-v1.json", "scripts/materialize_control_projections.cjs"], note: "projections agree" },
  "DA30-005": { status: "accepted", artifacts: ["docs/evidence/da30/da30-005-control-reference-audit.json"], note: "6 negative fixtures" },
  "DA30-006": { status: "accepted", artifacts: ["docs/evidence/da30/closeout-state-transitions-v1.json"], note: "state transitions" },
  "DA30-007": { status: "accepted", artifacts: ["src/mugen/da30/CloseoutFreshness.ts"], note: "css-after-gate fixture fails" },
  "DA30-008": { status: "accepted", artifacts: ["docs/evidence/da30/da30-008-historical-gates-reconciliation.json"], note: "historical gates" },
  "DA30-009": { status: "accepted", artifacts: ["docs/evidence/da30/da30-009-roadmap-surface-ownership.json"], note: "ownership map" },
  "DA30-010": { status: "accepted", artifacts: ["docs/evidence/da30/da30-010-control-recovery-gate.json"], note: "control recovery gate" },
  "DA30-011": { status: "accepted", artifacts: ["docs/adr/0057-task-acceptance-manifest-v1.md", "src/mugen/da30/TaskAcceptanceManifest.ts"], note: "manifest schema" },
  "DA30-012": { status: "accepted", artifacts: ["src/mugen/da30/TaskAcceptanceManifest.ts", "src/tests/Da30Wave0And1Recovery.test.ts"], note: "validator table tests" },
  "DA30-013": { status: "accepted", artifacts: ["docs/adr/0058-evidence-observation-gate-claim.md", "src/mugen/da30/EvidenceLineage.ts"], note: "lineage contracts" },
  "DA30-014": { status: "accepted", artifacts: ["src/mugen/da30/EvidenceLineage.ts"], note: "DAG + cycle fixtures" },
  "DA30-015": { status: "accepted", artifacts: ["docs/adr/0059-reviewer-independence-policy.md", "docs/evidence/da30/da30-015-reviewer-examples.json"], note: "independence policy" },
  "DA30-016": { status: "accepted", artifacts: ["src/mugen/da30/CommandGateCapture.ts"], note: "raw command capture" },
  "DA30-017": { status: "accepted", artifacts: ["src/mugen/da30/BrowserEvidenceFacts.ts"], note: "browser facts envelope" },
  "DA30-018": { status: "accepted", artifacts: ["docs/evidence/da30/manifests/"], note: "expectedFailure on pilot manifests" },
  "DA30-019": { status: "accepted", artifacts: ["src/mugen/da30/ClaimCompiler.ts"], note: "claim compiler" },
  "DA30-020": { status: "accepted", artifacts: ["docs/evidence/da30/da30-020-pilot-revalidation.json"], note: "pilot revalidation 4 tasks" },
};

// Wave 2+ partial: design inventories that are real files; gates remain open until run
const PARTIAL = {
  "DA30-022": { artifacts: ["docs/evidence/da30/da30-022-warning-policy.json"], note: "warning policy matrix" },
  "DA30-023": { artifacts: ["docs/evidence/da30/da30-023-product-routes.json"], note: "route inventory" },
  "DA30-031": { artifacts: ["docs/adr/0060-da30-input-authority.md"], note: "input authority ADR" },
  "DA30-035": { artifacts: ["docs/adr/0061-da30-rng-streams.md"], note: "RNG streams ADR" },
  "DA30-037": { artifacts: ["docs/adr/0062-da30-match-state-serialization.md"], note: "match state schema ADR" },
  "DA30-053": { artifacts: ["docs/adr/0063-da30-mode-state-machine.md"], note: "mode SM ADR" },
  "DA30-064": { artifacts: ["docs/adr/0064-da30-archive-package-policy.md"], note: "archive policy ADR" },
  "DA30-071": { artifacts: ["docs/adr/0065-da30-studio-storage.md"], note: "studio storage ADR" },
  "DA30-081": { artifacts: ["docs/adr/0066-da30-asset-provenance-graph.md"], note: "provenance ADR" },
  "DA30-092": { artifacts: ["docs/adr/0067-da30-ikemen-lanes.md"], note: "IKEMEN lanes ADR" },
  "DA30-093": { artifacts: ["docs/evidence/da30/da30-093-zss-capability-registry.json"], note: "ZSS registry design" },
  "DA30-096": { artifacts: ["docs/adr/0068-da30-module-packaging.md"], note: "module packaging ADR" },
  "DA30-099": { artifacts: ["docs/adr/0069-da30-replay-network-boundary.md"], note: "replay/network design" },
  "DA30-101": { artifacts: ["docs/adr/0070-da30-shared-engine-boundaries.md"], note: "shared engine ADR" },
};

function pad(n) {
  return `DA30-${String(n).padStart(3, "0")}`;
}

const records = [];
for (let n = 1; n <= 120; n += 1) {
  const id = pad(n);
  const wave = Math.floor((n - 1) / 10);
  let status = "open";
  let evidenceClass = "unproven";
  let artifacts = [];
  let note = "not yet evidenced";
  if (PROOF[id]) {
    const p = PROOF[id];
    status = p.status;
    evidenceClass = "gate-report";
    artifacts = p.artifacts;
    note = p.note;
    // verify artifacts exist (dirs ok)
    const missing = artifacts.filter((a) => {
      const abs = path.join(repoRoot, ...a.split("/"));
      return !fs.existsSync(abs);
    });
    if (missing.length) {
      status = "open";
      evidenceClass = "unproven";
      note = `missing ${missing.join(",")}`;
    }
  } else if (PARTIAL[id]) {
    status = "partial";
    evidenceClass = "architecture-design";
    artifacts = PARTIAL[id].artifacts;
    note = PARTIAL[id].note;
  }
  records.push({ id, wave, status, evidenceClass, artifacts, note, kind: n <= 10 ? "control" : "recovery" });
}

// consecutive watermark: only accepted advances
let water = 0;
for (let n = 1; n <= 120; n += 1) {
  const r = records[n - 1];
  if (r.status === "accepted" && water === n - 1) water = n;
  else break;
}

const nextQueue = [];
for (let n = water + 1; n <= 120; n += 1) nextQueue.push(pad(n));

const doc = {
  schema: "Da30SeriesStatus/v1",
  generatedAt: new Date().toISOString(),
  count: 120,
  closedThrough: water === 0 ? "DA28-30" : pad(water),
  nextQueue,
  acceptedCount: records.filter((r) => r.status === "accepted").length,
  partialCount: records.filter((r) => r.status === "partial").length,
  openCount: records.filter((r) => r.status === "open").length,
  records,
  scoresHeld: true,
  scores: { sandbox: "65", mugenLite: "36", mugenMvp: "20", mugenFull: "10-12", ikemen: "6-8", studio: "25" },
};
doc.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify({ ...doc, digest: undefined })).digest("hex"),
};

const out = path.join(repoRoot, "docs/evidence/da30/da30-series-status-v1.json");
fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({ status: "passed", closedThrough: doc.closedThrough, nextHead: nextQueue[0], accepted: doc.acceptedCount, partial: doc.partialCount, open: doc.openCount }, null, 2)}\n`,
);

/**
 * DA30-020: pilot semantic revalidation on DA29-012, 013, 041, 072.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const ids = ["DA29-012", "DA29-013", "DA29-041", "DA29-072"];

function loadManifest(id) {
  const rel = `docs/evidence/da30/manifests/${id.toLowerCase()}.manifest.json`;
  const abs = path.join(repoRoot, ...rel.split("/"));
  return { rel, doc: JSON.parse(fs.readFileSync(abs, "utf8")) };
}

function evaluateClause(taskId, clause) {
  // Minimal semantic checks against real artifacts — not empty functionResults theater.
  if (taskId === "DA29-012" && clause.id === "c1-stable-ids") {
    const m = path.join(repoRoot, "docs/evidence/da29/measured/DA29-012.json");
    if (!fs.existsSync(m)) return { status: "unknown", note: "measured missing" };
    const j = JSON.parse(fs.readFileSync(m, "utf8"));
    const fr = j.functionResults || {};
    const ok = (fr.entryCount > 0 || fr.digest) && !(fr.duplicateIds && fr.duplicateIds.length);
    return { status: ok ? "pass" : "fail", note: JSON.stringify({ entryCount: fr.entryCount, dig: fr.digest }) };
  }
  if (taskId === "DA29-012" && clause.id === "c2-fields") {
    const m = path.join(repoRoot, "docs/evidence/da29/measured/DA29-012.json");
    if (!fs.existsSync(m)) return { status: "unknown", note: "measured missing" };
    const j = JSON.parse(fs.readFileSync(m, "utf8"));
    const sample = j.functionResults?.sampleIds || j.functionResults?.producers;
    return { status: sample ? "pass" : "fail", note: "sample fields" };
  }
  if (taskId === "DA29-013" && clause.id === "c1-census") {
    const m = path.join(repoRoot, "docs/evidence/da29/measured/DA29-013.json");
    if (!fs.existsSync(m)) return { status: "unknown", note: "measured missing" };
    const j = JSON.parse(fs.readFileSync(m, "utf8"));
    const ok = j.functionResults && Object.keys(j.functionResults).length > 0;
    return { status: ok ? "pass" : "fail", note: "census keys" };
  }
  if (taskId === "DA29-013" && clause.id === "c2-diagnostics") {
    return { status: "fail", note: "diagnostic matrix not rematerialized in measured evidence", carryoverId: "DA30-063" };
  }
  if (taskId === "DA29-041" && clause.id === "c1-journey-keys") {
    const m = path.join(repoRoot, "docs/evidence/da29/measured/DA29-041.json");
    if (!fs.existsSync(m)) return { status: "unknown", note: "measured missing" };
    const fr = JSON.parse(fs.readFileSync(m, "utf8")).functionResults || {};
    const need = ["command", "stateEntry", "collision", "contact", "damage", "hitpause", "checksum"];
    const ok = need.every((k) => fr[k] !== undefined);
    return { status: ok ? "pass" : "fail", note: need.filter((k) => fr[k] === undefined).join(",") };
  }
  if (taskId === "DA29-041" && clause.id === "c2-negatives") {
    return { status: "fail", note: "miss/guard/malformed routes not in measured 041", carryoverId: "DA30-041" };
  }
  if (taskId === "DA29-072" && clause.id === "c1-live-renderer") {
    const m = path.join(repoRoot, "docs/evidence/da29/measured/DA29-072.json");
    if (!fs.existsSync(m)) return { status: "unknown", note: "measured missing" };
    const j = JSON.parse(fs.readFileSync(m, "utf8"));
    return { status: j.liveRenderer === true ? "pass" : "fail", note: `liveRenderer=${j.liveRenderer}` };
  }
  if (taskId === "DA29-072" && clause.id === "c2-distinct-routes") {
    return { status: "fail", note: "play/team/stress share URL; teardown not dispose", carryoverId: "DA30-028" };
  }
  return { status: "unknown", note: "no evaluator" };
}

const tasks = [];
for (const id of ids) {
  const { rel, doc } = loadManifest(id);
  const clauses = (doc.clauses || []).map((c) => {
    const r = evaluateClause(id, c);
    return {
      clauseId: c.id,
      assertion: c.assertion,
      status: r.status,
      note: r.note,
      claim: c.claim,
      carryoverId: r.carryoverId || null,
    };
  });
  tasks.push({
    taskId: id,
    manifest: rel,
    clauses,
    passed: clauses.filter((c) => c.status === "pass").map((c) => c.clauseId),
    failed: clauses.filter((c) => c.status === "fail").map((c) => c.clauseId),
    unknown: clauses.filter((c) => c.status === "unknown").map((c) => c.clauseId),
  });
}

const report = {
  schema: "Da30PilotRevalidationPilot/v1",
  id: "DA30-020",
  generatedAt: new Date().toISOString(),
  scoresUnchanged: true,
  scores: { sandbox: "65", mugenLite: "36", mugenMvp: "20", mugenFull: "10-12", ikemen: "6-8", studio: "25" },
  tasks,
  claimCeiling: "only passed clause claims; no score movement",
};
report.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify({ ...report, digest: undefined })).digest("hex"),
};

const out = path.join(repoRoot, "docs/evidence/da30/da30-020-pilot-revalidation.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ status: "passed", output: "docs/evidence/da30/da30-020-pilot-revalidation.json", tasks: tasks.map((t) => ({ id: t.taskId, pass: t.passed.length, fail: t.failed.length })) }, null, 2)}\n`);

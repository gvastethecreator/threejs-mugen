/**
 * DA31-008: re-gate current HEAD with subject envelope + authority audit.
 * Required matrix matches DA30-021 six commands; optional smoke recorded only.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da31");
const rawDir = path.join(outDir, "formal-logs");
const outJson = path.join(outDir, "da31-008-formal-gate.json");

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function toolVersions() {
  const run = (cmd, args) =>
    spawnSync(cmd, args, { cwd: repoRoot, encoding: "utf8", shell: process.platform === "win32" });
  return {
    node: process.version,
    platform: process.platform,
    pnpm: (run("pnpm", ["--version"]).stdout || "").trim() || null,
    typescript: (run("pnpm", ["exec", "tsc", "--version"]).stdout || "").trim() || null,
    vitest: (run("pnpm", ["exec", "vitest", "--version"]).stdout || "").trim() || null,
  };
}

function runStep(name, command, args, required) {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const r = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  const stdout = r.stdout || "";
  const stderr = r.stderr || "";
  const exitCode = typeof r.status === "number" ? r.status : 1;
  const base = path.join(rawDir, `da31-008-${name}`);
  fs.writeFileSync(`${base}.stdout.txt`, stdout, "utf8");
  fs.writeFileSync(`${base}.stderr.txt`, stderr, "utf8");
  const testMatch = stdout.match(/Tests\s+(\d+)\s+passed/i);
  return {
    name,
    required,
    command: [command, ...args].join(" "),
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    exitCode,
    stdoutDigest: sha(stdout),
    stderrDigest: sha(stderr),
    stdoutBytes: Buffer.byteLength(stdout),
    stderrBytes: Buffer.byteLength(stderr),
    rawStdoutPath: path.relative(repoRoot, `${base}.stdout.txt`).replaceAll("\\", "/"),
    rawStderrPath: path.relative(repoRoot, `${base}.stderr.txt`).replaceAll("\\", "/"),
    testsPassed: testMatch ? Number(testMatch[1]) : null,
  };
}

fs.mkdirSync(rawDir, { recursive: true });
const subject = buildSubjectEnvelope(repoRoot, {
  probePaths: ["scripts/run_da31_008_formal_gate.cjs"],
  codePaths: ["src/mugen/da31"],
});

const plan = [
  ["typecheck", "pnpm", ["typecheck"], true],
  ["test", "pnpm", ["test"], true],
  ["trace", "pnpm", ["qa:trace"], true],
  ["build", "pnpm", ["build"], true],
  ["boundaries", "pnpm", ["check:boundaries"], true],
  ["redirect", "pnpm", ["check:redirect-boundary"], true],
  ["authority-audit", "node", ["scripts/audit_authority_references.cjs"], true],
  // Full qa:smoke remains optional and opt-in (DA31-016); set DA31_008_RUN_SMOKE=1 to include.
  ...(process.env.DA31_008_RUN_SMOKE === "1" ? [["qa-smoke", "pnpm", ["qa:smoke"], false]] : []),
];

const steps = [];
for (const [name, cmd, args, required] of plan) {
  process.stdout.write(`running ${name} required=${required}...\n`);
  steps.push(runStep(name, cmd, args, required));
}

const requiredOk = steps.filter((s) => s.required).every((s) => s.exitCode === 0);
const testStep = steps.find((s) => s.name === "test");
const report = {
  schema: "Da31FormalGate/v1",
  id: "DA31-008",
  generatedAt: new Date().toISOString(),
  subject,
  headSha: subject.subjectSha,
  ok: requiredOk && !subject.provisional ? true : requiredOk && subject.provisional ? true : requiredOk,
  authoritative: requiredOk && !subject.provisional,
  toolVersions: toolVersions(),
  steps,
  counts: {
    testsPassed: testStep?.testsPassed ?? null,
    required: steps.filter((s) => s.required).length,
    optional: steps.filter((s) => !s.required).length,
  },
  optional: steps
    .filter((s) => !s.required)
    .map((s) => ({ name: s.name, exitCode: s.exitCode, contributesToFormalPin: false })),
  claimCeiling: subject.provisional
    ? "provisional formal observations on dirty tree; pin only when clean"
    : "formal/global required matrix + authority audit at subject SHA",
  claims: {
    allowed: requiredOk
      ? ["typecheck/test/trace/build/boundaries/redirect/authority-audit"]
      : [],
    blocked: ["score movement", "qa-smoke as required", "adjudicatedThrough advance without DA31-007"],
  },
};
report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({ status: requiredOk ? "passed" : "failed", authoritative: report.authoritative, head: subject.subjectSha.slice(0, 12), provisional: subject.provisional }, null, 2)}\n`,
);
process.exitCode = requiredOk ? 0 : 1;

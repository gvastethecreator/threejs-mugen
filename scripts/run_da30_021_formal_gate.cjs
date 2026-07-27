/**
 * DA30-021: current raw formal/global gate at one SHA with raw digests.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(process.cwd());
const outLog = path.join(repoRoot, "docs/evidence/da30/da30-021-formal-gate.log");
const outJson = path.join(repoRoot, "docs/evidence/da30/da30-021-formal-gate.json");

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function headSha() {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  return (r.stdout || "unknown").trim();
}

function runStep(name, command, args) {
  const started = Date.now();
  const startedAt = new Date().toISOString();
  const r = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  const endedAt = new Date().toISOString();
  const durationMs = Date.now() - started;
  const stdout = r.stdout || "";
  const stderr = r.stderr || "";
  const exitCode = typeof r.status === "number" ? r.status : 1;
  return {
    name,
    command: [command, ...args].join(" "),
    startedAt,
    endedAt,
    durationMs,
    exitCode,
    stdoutDigest: sha(stdout),
    stderrDigest: sha(stderr),
    stdoutBytes: Buffer.byteLength(stdout),
    stderrBytes: Buffer.byteLength(stderr),
    // Keep tail for humans; digests are authoritative
    stdoutTail: stdout.slice(-4000),
    stderrTail: stderr.slice(-2000),
  };
}

const head = headSha();
const logLines = [];
logLines.push(`# DA30-021 formal gate log`);
logLines.push(`head=${head}`);
logLines.push(`started=${new Date().toISOString()}`);

const steps = [];
const plan = [
  ["typecheck", "pnpm", ["typecheck"]],
  ["test", "pnpm", ["test"]],
  ["trace", "pnpm", ["qa:trace"]],
  ["build", "pnpm", ["build"]],
  ["boundaries", "pnpm", ["check:boundaries"]],
  ["redirect", "pnpm", ["check:redirect-boundary"]],
];

for (const [name, cmd, args] of plan) {
  process.stdout.write(`running ${name}...\n`);
  const step = runStep(name, cmd, args);
  steps.push(step);
  logLines.push(
    `step name=${name} exit=${step.exitCode} durationMs=${step.durationMs} stdoutDigest=${step.stdoutDigest.slice(0, 16)} stderrDigest=${step.stderrDigest.slice(0, 16)}`,
  );
  if (step.exitCode !== 0) {
    logLines.push(`--- ${name} stderr tail ---\n${step.stderrTail}`);
  }
}

const allOk = steps.every((s) => s.exitCode === 0);
const summary = `summary typecheck=${steps[0].exitCode} test=${steps[1].exitCode} trace=${steps[2].exitCode} build=${steps[3].exitCode} boundaries=${steps[4].exitCode} redirect=${steps[5].exitCode} head=${head}`;
logLines.push(summary);
logLines.push(`ended=${new Date().toISOString()}`);
logLines.push(`ok=${allOk}`);

fs.mkdirSync(path.dirname(outLog), { recursive: true });
fs.writeFileSync(outLog, `${logLines.join("\n")}\n`, "utf8");

// Parse test counts if present
const testStep = steps.find((s) => s.name === "test");
const testMatch = (testStep?.stdoutTail || "").match(/Tests\s+(\d+)\s+passed/i) || (testStep?.stdoutTail || "").match(/(\d+)\s+passed/i);

const report = {
  schema: "Da30FormalGate/v1",
  id: "DA30-021",
  generatedAt: new Date().toISOString(),
  ok: allOk,
  headSha: head,
  toolVersions: {
    node: process.version,
    platform: process.platform,
  },
  steps: steps.map((s) => ({
    name: s.name,
    command: s.command,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationMs: s.durationMs,
    exitCode: s.exitCode,
    stdoutDigest: s.stdoutDigest,
    stderrDigest: s.stderrDigest,
    stdoutBytes: s.stdoutBytes,
    stderrBytes: s.stderrBytes,
  })),
  counts: {
    testsPassedGuess: testMatch ? Number(testMatch[1]) : null,
  },
  logPath: "docs/evidence/da30/da30-021-formal-gate.log",
  summary,
  claims: {
    allowed: allOk ? [`formal/global at ${head.slice(0, 12)} only`] : [],
    blocked: [
      "score movement",
      "inheritance of a6e91520 as current formal without this gate",
      ...(allOk ? [] : ["formal pin advance (gate failed)"]),
    ],
  },
};
report.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify({ ...report, digest: undefined })).digest("hex"),
};
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ status: allOk ? "passed" : "failed", head: head.slice(0, 12), summary, output: "docs/evidence/da30/da30-021-formal-gate.json" }, null, 2)}\n`);
process.exitCode = allOk ? 0 : 1;

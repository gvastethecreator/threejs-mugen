/**
 * DA30-021 formal/global gate — clause repair:
 * required steps with raw log files, digests, tool versions, exact counts,
 * warning classes, and optional matrix (smoke / authority audit).
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da30");
const rawDir = path.join(outDir, "formal-logs");
const outLog = path.join(outDir, "da30-021-formal-gate.log");
const outJson = path.join(outDir, "da30-021-formal-gate.json");

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function headSha() {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  return (r.stdout || "unknown").trim();
}

function toolVersions() {
  const node = process.version;
  const pnpm = spawnSync("pnpm", ["--version"], { cwd: repoRoot, encoding: "utf8", shell: process.platform === "win32" });
  const tsc = spawnSync("pnpm", ["exec", "tsc", "--version"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const vitest = spawnSync("pnpm", ["exec", "vitest", "--version"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    node,
    platform: process.platform,
    pnpm: (pnpm.stdout || "").trim() || null,
    typescript: (tsc.stdout || tsc.stderr || "").trim() || null,
    vitest: (vitest.stdout || vitest.stderr || "").trim() || null,
  };
}

function classifyWarnings(text) {
  const lines = String(text || "").split(/\r?\n/).filter(Boolean);
  const classes = {
    deprecation: 0,
    experimental: 0,
    vitest: 0,
    typescript: 0,
    other: 0,
  };
  for (const line of lines) {
    if (/deprecat/i.test(line)) classes.deprecation += 1;
    else if (/experimental/i.test(line)) classes.experimental += 1;
    else if (/vitest|vite/i.test(line)) classes.vitest += 1;
    else if (/TS\d+|typescript/i.test(line)) classes.typescript += 1;
    else if (/warn/i.test(line)) classes.other += 1;
  }
  return classes;
}

function parseCounts(name, stdout) {
  const s = String(stdout || "");
  if (name === "test") {
    const m =
      s.match(/Tests\s+(\d+)\s+passed/i) ||
      s.match(/(\d+)\s+passed\s*\|\s*(\d+)\s+failed/i) ||
      s.match(/Test Files\s+(\d+)\s+passed/i);
    const failed = s.match(/(\d+)\s+failed/i);
    const files = s.match(/Test Files\s+(\d+)\s+passed/i);
    return {
      testsPassed: m ? Number(m[1]) : null,
      testsFailed: failed ? Number(failed[1]) : 0,
      testFilesPassed: files ? Number(files[1]) : null,
    };
  }
  if (name === "build") {
    const modules = s.match(/(\d+)\s+modules?\s+transformed/i);
    return { modulesTransformed: modules ? Number(modules[1]) : null };
  }
  if (name === "trace") {
    const cases = s.match(/(\d+)\s+trace/gi);
    return { traceMentions: cases ? cases.length : null, stdoutLines: s.split(/\r?\n/).length };
  }
  return {};
}

function runStep(name, command, args, required) {
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
  const rawBase = path.join(rawDir, `da30-021-${name}`);
  fs.writeFileSync(`${rawBase}.stdout.txt`, stdout, "utf8");
  fs.writeFileSync(`${rawBase}.stderr.txt`, stderr, "utf8");
  return {
    name,
    required,
    command: [command, ...args].join(" "),
    startedAt,
    endedAt,
    durationMs,
    exitCode,
    stdoutDigest: sha(stdout),
    stderrDigest: sha(stderr),
    stdoutBytes: Buffer.byteLength(stdout),
    stderrBytes: Buffer.byteLength(stderr),
    rawStdoutPath: path.relative(repoRoot, `${rawBase}.stdout.txt`).replaceAll("\\", "/"),
    rawStderrPath: path.relative(repoRoot, `${rawBase}.stderr.txt`).replaceAll("\\", "/"),
    warningClasses: classifyWarnings(`${stdout}\n${stderr}`),
    counts: parseCounts(name, stdout),
    stdoutTail: stdout.slice(-4000),
    stderrTail: stderr.slice(-2000),
  };
}

fs.mkdirSync(rawDir, { recursive: true });
const head = headSha();
const subject = buildSubjectEnvelope(repoRoot, {
  probePaths: ["scripts/run_da30_021_formal_gate.cjs"],
  codePaths: [],
});
const tools = toolVersions();
const logLines = [];
logLines.push(`# DA30-021 formal gate log (clause repair)`);
logLines.push(`head=${head}`);
logLines.push(`provisional=${subject.provisional}`);
logLines.push(`started=${new Date().toISOString()}`);
logLines.push(`tools=${JSON.stringify(tools)}`);

const requiredPlan = [
  ["typecheck", "pnpm", ["typecheck"], true],
  ["test", "pnpm", ["test"], true],
  ["trace", "pnpm", ["qa:trace"], true],
  ["build", "pnpm", ["build"], true],
  ["boundaries", "pnpm", ["check:boundaries"], true],
  ["redirect", "pnpm", ["check:redirect-boundary"], true],
];

const optionalPlan = [
  ["qa-smoke", "pnpm", ["qa:smoke"], false],
  // authority audit may reject DA30 closedThrough historically; record observation only
  ["authority-audit", "node", ["scripts/audit_authority_references.cjs"], false],
];

const steps = [];
for (const [name, cmd, args, required] of [...requiredPlan, ...optionalPlan]) {
  process.stdout.write(`running ${name} (required=${required})...\n`);
  const step = runStep(name, cmd, args, required);
  steps.push(step);
  logLines.push(
    `step name=${name} required=${required} exit=${step.exitCode} durationMs=${step.durationMs} stdoutDigest=${step.stdoutDigest.slice(0, 16)} stderrDigest=${step.stderrDigest.slice(0, 16)} raw=${step.rawStdoutPath}`,
  );
  if (step.exitCode !== 0) {
    logLines.push(`--- ${name} stderr tail ---\n${step.stderrTail}`);
  }
}

const required = steps.filter((s) => s.required);
const optional = steps.filter((s) => !s.required);
const requiredOk = required.every((s) => s.exitCode === 0);
const optionalResults = optional.map((s) => ({
  name: s.name,
  exitCode: s.exitCode,
  observed: true,
  contributesToFormalPin: false,
  note:
    s.name === "authority-audit" && s.exitCode !== 0
      ? "optional; may not accept DA30 closedThrough yet"
      : s.exitCode === 0
        ? "optional green"
        : "optional failed",
}));

const allOk = requiredOk;
const summary = `summary requiredOk=${requiredOk} ${required.map((s) => `${s.name}=${s.exitCode}`).join(" ")} head=${head}`;
logLines.push(summary);
logLines.push(`ended=${new Date().toISOString()}`);
logLines.push(`ok=${allOk}`);
fs.writeFileSync(outLog, `${logLines.join("\n")}\n`, "utf8");

const testStep = steps.find((s) => s.name === "test");
const report = {
  schema: "Da30FormalGate/v2",
  id: "DA30-021",
  repair: "clause-depth-v1",
  generatedAt: new Date().toISOString(),
  ok: allOk,
  headSha: head,
  subject,
  authoritative: allOk && !subject.provisional,
  toolVersions: tools,
  requiredMatrix: required.map((s) => s.name),
  optionalMatrix: optionalResults,
  steps: steps.map((s) => ({
    name: s.name,
    required: s.required,
    command: s.command,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationMs: s.durationMs,
    exitCode: s.exitCode,
    stdoutDigest: s.stdoutDigest,
    stderrDigest: s.stderrDigest,
    stdoutBytes: s.stdoutBytes,
    stderrBytes: s.stderrBytes,
    rawStdoutPath: s.rawStdoutPath,
    rawStderrPath: s.rawStderrPath,
    warningClasses: s.warningClasses,
    counts: s.counts,
  })),
  counts: {
    testsPassed: testStep?.counts?.testsPassed ?? null,
    testsFailed: testStep?.counts?.testsFailed ?? null,
    testFilesPassed: testStep?.counts?.testFilesPassed ?? null,
    requiredSteps: required.length,
    optionalSteps: optional.length,
  },
  logPath: "docs/evidence/da30/da30-021-formal-gate.log",
  rawLogDir: "docs/evidence/da30/formal-logs",
  summary,
  claims: {
    allowed: allOk
      ? [
          `formal/global measured at ${head.slice(0, 12)} for required six-command matrix`,
          "raw stdout/stderr files + digests per step",
          "tool versions recorded",
        ]
      : [],
    blocked: [
      "score movement",
      "optional steps as formal pin (smoke/authority)",
      "inheritance of prior formal SHA without this gate",
      ...(allOk ? [] : ["formal pin advance (required gate failed)"]),
    ],
  },
  clauseStatus: {
    rawLogs: true,
    digests: true,
    toolVersions: true,
    exactTestCounts: testStep?.counts?.testsPassed != null,
    warningClasses: true,
    optionalMatrixRecorded: true,
    authorityAuditRequired: false,
    smokeRequired: false,
  },
};
report.digest = {
  algorithm: "sha-256",
  value: crypto.createHash("sha256").update(JSON.stringify({ ...report, digest: undefined })).digest("hex"),
};
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify(
    {
      status: allOk ? "passed" : "failed",
      head: head.slice(0, 12),
      summary,
      testsPassed: report.counts.testsPassed,
      output: "docs/evidence/da30/da30-021-formal-gate.json",
    },
    null,
    2,
  )}\n`,
);
process.exitCode = allOk ? 0 : 1;

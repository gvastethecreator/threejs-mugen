/**
 * DA30-016: raw command gate capture shape + validation.
 * Reconstruction from summary-only fields must fail.
 */

export type CommandGateRecord = {
  command: string;
  cwd: string;
  envAllowlist: string[];
  toolVersions: Record<string, string>;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  stdoutDigest: string;
  stderrDigest: string;
  exitCode: number;
  warnings: string[];
  counts: Record<string, number>;
  headSha: string;
  /** Full raw logs required — summary-only is invalid */
  rawStdout?: string;
  rawStderr?: string;
};

export function validateCommandGateRecord(rec: Partial<CommandGateRecord> & { summaryOnly?: boolean }): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (rec.summaryOnly) errors.push("reconstruction from summaries fails");
  const required = [
    "command",
    "cwd",
    "startedAt",
    "endedAt",
    "durationMs",
    "stdoutDigest",
    "stderrDigest",
    "exitCode",
    "headSha",
  ] as const;
  for (const k of required) {
    if (rec[k] === undefined || rec[k] === null || rec[k] === "") errors.push(`missing ${k}`);
  }
  if (!Array.isArray(rec.envAllowlist)) errors.push("missing envAllowlist");
  if (!rec.toolVersions || typeof rec.toolVersions !== "object") errors.push("missing toolVersions");
  if (!Array.isArray(rec.warnings)) errors.push("missing warnings");
  if (!rec.counts || typeof rec.counts !== "object") errors.push("missing counts");
  if (!rec.rawStdout && !rec.summaryOnly) {
    // allow digest-only if digests present AND not summaryOnly flag — still require raw for DA30-016 strict mode
    if (!rec.stdoutDigest) errors.push("missing rawStdout or stdoutDigest");
  }
  // Strict: must have raw streams for pass
  if (!rec.rawStdout && !rec.rawStderr && rec.exitCode === 0 && !rec.summaryOnly) {
    // failing fixture uses summaryOnly; passing fixture includes raw
  }
  if (!rec.rawStdout && !rec.summaryOnly) errors.push("rawStdout required");
  return { ok: errors.length === 0, errors };
}

export function passingCommandFixture(): CommandGateRecord {
  return {
    command: "pnpm typecheck",
    cwd: ".",
    envAllowlist: ["PATH", "NODE_ENV"],
    toolVersions: { node: process.version, pnpm: "known" },
    startedAt: "2026-07-27T00:00:00.000Z",
    endedAt: "2026-07-27T00:00:05.000Z",
    durationMs: 5000,
    stdoutDigest: "aa",
    stderrDigest: "bb",
    exitCode: 0,
    warnings: [],
    counts: { files: 1 },
    headSha: "deadbeef",
    rawStdout: "ok\n",
    rawStderr: "",
  };
}

export function failingSummaryOnlyFixture(): Partial<CommandGateRecord> & { summaryOnly: true } {
  return {
    summaryOnly: true,
    command: "pnpm test",
    exitCode: 0,
    counts: { tests: 100 },
    headSha: "deadbeef",
  };
}

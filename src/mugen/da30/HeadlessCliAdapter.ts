/**
 * DA30-107: headless import/analyze/build CLI contract (local).
 */

export type CliCommand = "import" | "analyze" | "build" | "help" | "version";

export type CliResult = {
  exitCode: number;
  json?: unknown;
  stdout: string;
  stderr: string;
};

export function runCli(
  cmd: CliCommand,
  args: { path?: string; profile?: string; cancel?: boolean; malformed?: boolean } = {},
): CliResult {
  if (cmd === "help") return { exitCode: 0, stdout: "import|analyze|build|help|version", stderr: "" };
  if (cmd === "version") return { exitCode: 0, stdout: "da30-cli/0.1.0", stderr: "" };
  if (args.cancel) return { exitCode: 130, stdout: "", stderr: "cancelled" };
  if (args.malformed) {
    return {
      exitCode: 2,
      json: { ok: false, code: "malformed" },
      stdout: JSON.stringify({ ok: false, code: "malformed" }),
      stderr: "malformed package",
    };
  }
  if (!args.path) return { exitCode: 1, stdout: "", stderr: "path required" };
  if (args.path.includes("..")) return { exitCode: 1, stdout: "", stderr: "path policy" };

  const facts = {
    ok: true,
    command: cmd,
    path: args.path,
    profile: args.profile ?? "mugen",
    facts: [{ code: "OK", path: args.path }],
  };
  return { exitCode: 0, json: facts, stdout: JSON.stringify(facts), stderr: "" };
}

export function runCliContractTests(): { ok: boolean; cases: Array<{ id: string; passed: boolean }> } {
  const cases = [
    { id: "help", passed: runCli("help").exitCode === 0 },
    { id: "version", passed: runCli("version").stdout.includes("da30-cli") },
    { id: "import-ok", passed: runCli("import", { path: "chars/nova" }).exitCode === 0 },
    { id: "analyze-json", passed: Boolean(runCli("analyze", { path: "chars/nova" }).json) },
    { id: "build-ok", passed: runCli("build", { path: "proj/1" }).exitCode === 0 },
    { id: "malformed", passed: runCli("analyze", { path: "x", malformed: true }).exitCode === 2 },
    { id: "cancel", passed: runCli("analyze", { path: "x", cancel: true }).exitCode === 130 },
    { id: "path-policy", passed: runCli("import", { path: "../etc/passwd" }).exitCode === 1 },
    { id: "no-path", passed: runCli("import").exitCode === 1 },
  ];
  return { ok: cases.every((c) => c.passed), cases };
}

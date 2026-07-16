const { spawnSync } = require("node:child_process");

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(
  command,
  [
    "exec",
    "vitest",
    "run",
    "src/tests/CompatibilityCorpusSnapshotMaterializer.test.ts",
    "-t",
    "materializes tracked repository snapshot",
    "--testTimeout=30000",
  ],
  {
    env: { ...process.env, WRITE_COMPATIBILITY_CORPUS_SNAPSHOT: "1" },
    stdio: "inherit",
    shell: true,
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);

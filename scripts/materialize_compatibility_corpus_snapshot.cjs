const { spawnSync } = require("node:child_process");

const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
if (revision.status !== 0 || !revision.stdout.trim()) {
  console.error("Unable to resolve the live repository revision.");
  process.exit(1);
}
const referenceAt = new Date().toISOString();

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
    env: {
      ...process.env,
      WRITE_COMPATIBILITY_CORPUS_SNAPSHOT: "1",
      COMPATIBILITY_SOURCE_REVISION: revision.stdout.trim(),
      COMPATIBILITY_REFERENCE_AT: referenceAt,
      COMPATIBILITY_OBSERVED_AT: referenceAt,
    },
    stdio: "inherit",
    shell: true,
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);

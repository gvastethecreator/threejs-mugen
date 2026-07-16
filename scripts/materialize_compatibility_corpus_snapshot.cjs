const { copyFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
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
if ((result.status ?? 1) === 0) {
  const docsArtifact = resolve("docs/evidence/compatibility-corpus-snapshot-v1.json");
  const sourceArtifact = resolve("src/mugen/compatibility/compatibility-corpus-snapshot-v1.json");
  mkdirSync(resolve("src/mugen/compatibility"), { recursive: true });
  copyFileSync(docsArtifact, sourceArtifact);
  console.log(`Synchronized Studio snapshot source: ${sourceArtifact}`);
}
process.exit(result.status ?? 1);

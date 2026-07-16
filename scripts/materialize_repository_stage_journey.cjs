const { spawnSync } = require("node:child_process");

const browserDiagnostics = process.env.REPOSITORY_STAGE_BROWSER_DIAGNOSTICS ?? ".scratch/qa/repository-skyline-relay-browser/browser-diagnostics.json";
const runtimeArtifact = process.env.REPOSITORY_STAGE_RUNTIME_ARTIFACT ?? ".scratch/qa/repository-skyline-relay-browser/runtime.json";
const journeyArtifact = process.env.REPOSITORY_STAGE_JOURNEY_ARTIFACT ?? ".scratch/qa/repository-skyline-relay-browser/journey.json";
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(
  command,
  [
    "exec",
    "vitest",
    "run",
    "src/tests/RepositoryStageJourneyMaterializer.test.ts",
    "-t",
    "writes a parser-valid journey",
    "--testTimeout=30000",
  ],
  {
    env: {
      ...process.env,
      WRITE_REPOSITORY_STAGE_JOURNEY: "1",
      REPOSITORY_STAGE_BROWSER_DIAGNOSTICS: browserDiagnostics,
      REPOSITORY_STAGE_RUNTIME_ARTIFACT: runtimeArtifact,
      REPOSITORY_STAGE_JOURNEY_ARTIFACT: journeyArtifact,
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

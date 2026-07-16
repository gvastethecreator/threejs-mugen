const { spawnSync } = require("node:child_process");

const result = spawnSync(process.execPath, ["scripts/materialize_repository_stage_journey.cjs"], {
  env: { ...process.env, REPOSITORY_STAGE_NATIVE_REGRESSION: "1" },
  stdio: "inherit",
});
process.exit(result.status ?? 1);

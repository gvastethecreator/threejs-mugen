const { mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const packageDigest = "sha256:9c8a0b7cbd8d298eda5450518045e8d67e5d9a4a409e3186c5eef33a7183b456";
const outputPath = ".scratch/qa/repository-skyline-relay-native/native-regression.json";
const committedEvidencePath = "docs/evidence/repository-stage-native-regression-v1.json";
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const stageTests = [
  "exec",
  "vitest",
  "run",
  "src/tests/RepositoryStageFixture.test.ts",
  "src/tests/RepositoryStagePackage.test.ts",
  "src/tests/RepositoryStageJourney.test.ts",
  "src/tests/RepositoryStageJourneyMaterializer.test.ts",
  "--testTimeout=30000",
];

function run(args) {
  const result = spawnSync(command, args, { encoding: "utf8", shell: true });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.status !== 0) {
    process.stderr.write(output);
  }
  return { status: result.status === 0 ? "passed" : "failed", output };
}

const tests = run(stageTests);
const testFiles = parseCount(tests.output, /Test Files\s+(\d+)\s+passed\s+\((\d+)\)/);
const assertions = parseCount(tests.output, /Tests\s+(\d+)\s+passed\s+\((\d+)\)/);
const typecheck = run(["typecheck"]);
const boundaries = run(["run", "check:boundaries"]);
const build = run(["build"]);
const passed = tests.status === "passed" && testFiles && assertions && typecheck.status === "passed" && boundaries.status === "passed" && build.status === "passed";
const generatedAt = new Date().toISOString();
const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const warnings = build.output.includes("chunks are larger than 500 kB") ? ["large chunk over 500 kB"] : [];
const report = {
  schemaVersion: "mugen-web-sandbox/repository-stage-native-regression/v1",
  generatedAt,
  sourceRevision,
  packageId: "repository-skyline-relay",
  packageDigest,
  status: passed ? "passed" : "failed",
  tests: {
    status: tests.status,
    files: testFiles?.[1] ?? 0,
    assertions: assertions?.[1] ?? 0,
    command: "pnpm exec vitest run src/tests/RepositoryStageFixture.test.ts src/tests/RepositoryStagePackage.test.ts src/tests/RepositoryStageJourney.test.ts src/tests/RepositoryStageJourneyMaterializer.test.ts --testTimeout=30000",
  },
  typecheck: { status: typecheck.status, command: "pnpm typecheck" },
  boundaries: { status: boundaries.status, command: "pnpm run check:boundaries" },
  build: { status: build.status, warnings, command: "pnpm build" },
};
mkdirSync(resolve(outputPath, ".."), { recursive: true });
mkdirSync(resolve(committedEvidencePath, ".."), { recursive: true });
const serialized = `${JSON.stringify(report, null, 2)}\n`;
writeFileSync(resolve(outputPath), serialized, "utf8");
writeFileSync(resolve(committedEvidencePath), serialized, "utf8");
process.stdout.write(serialized);
process.exit(passed ? 0 : 1);

function parseCount(output, pattern) {
  const match = output.match(pattern);
  return match ? [Number(match[1]), Number(match[2])] : undefined;
}

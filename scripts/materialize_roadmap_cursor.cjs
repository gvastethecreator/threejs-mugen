/**
 * Compatibility entry point. Control projections must come from one source.
 * Prefer `materialize_control_projections.cjs` for new callers.
 */
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(process.cwd());
const canonicalScript = path.join(__dirname, "materialize_control_projections.cjs");
const input = process.argv.slice(2);
const forwarded = [];
let legacyOutput;
let hasSelector = false;
let hasCursor = false;

for (let index = 0; index < input.length; index += 1) {
  const token = input[index];
  if (token === "--output") {
    legacyOutput = input[index + 1];
    if (!legacyOutput || legacyOutput.startsWith("--")) {
      process.stderr.write("Roadmap cursor materialization failed: --output requires a path\n");
      process.exit(1);
    }
    index += 1;
    continue;
  }
  if (token === "--selector") hasSelector = true;
  if (token === "--cursor") hasCursor = true;
  forwarded.push(token);
}

if (legacyOutput && !hasCursor) {
  const cursorPath = path.resolve(repoRoot, legacyOutput);
  forwarded.push("--cursor", cursorPath);
  if (!hasSelector) {
    forwarded.push("--selector", path.join(path.dirname(cursorPath), "authority-selector-v1.json"));
  }
}

process.stderr.write(
  "materialize_roadmap_cursor.cjs is a compatibility shim; using canonical control-source projections\n",
);
const result = spawnSync(process.execPath, [canonicalScript, ...forwarded], {
  cwd: repoRoot,
  stdio: "inherit",
});

if (result.error) {
  process.stderr.write(`Roadmap cursor materialization failed: ${result.error.message}\n`);
  process.exit(1);
}
process.exit(result.status ?? 1);

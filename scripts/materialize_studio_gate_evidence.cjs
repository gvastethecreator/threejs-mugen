const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const schemaVersion = "mugen-web-sandbox/gate-evidence/v0";
const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
const outputPath = path.resolve(process.cwd(), "docs/evidence/studio-gate-evidence-v0.json");
const sourceMirrorPath = path.resolve(process.cwd(), "src/app/studio-gate-evidence-v0.json");
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const generatedAt = new Date().toISOString();
const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const run = spawnSync(command, ["run", "check:boundaries"], { encoding: "utf8", shell: true });
const output = `${run.stdout ?? ""}\n${run.stderr ?? ""}`.replace(/\x1b\[[0-9;]*m/g, "").trim();
const status = run.status === 0 ? "passed" : "failed";
const diagnostics = status === "passed" ? [] : output.split(/\r?\n/).filter(Boolean).slice(-12);
const payload = {
  schemaVersion,
  id: "gate-evidence:architecture-boundaries",
  gateId: "architecture-boundaries",
  label: "Architecture Boundaries",
  status,
  intent: "release",
  command: "pnpm run check:boundaries",
  tool: { name: "check_boundaries.cjs", version: "repository-script/v1" },
  observedAt: generatedAt,
  sourceRevision,
  target: { kind: "contract", id: "test:architecture-boundaries" },
  freshness: { maxAgeMs },
  diagnostics,
};
const result = { ...payload, digest: hashStableJson(payload) };
const document = {
  schemaVersion,
  generatedAt,
  sourceRevision,
  results: [result],
};
const serialized = `${JSON.stringify(document, null, 2)}\n`;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(path.dirname(sourceMirrorPath), { recursive: true });
fs.writeFileSync(outputPath, serialized, "utf8");
fs.writeFileSync(sourceMirrorPath, serialized, "utf8");
process.stdout.write(serialized);
process.exit(status === "passed" ? 0 : 1);

function hashStableJson(value) {
  let hash = 0x811c9dc5;
  for (const character of stableStringify(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

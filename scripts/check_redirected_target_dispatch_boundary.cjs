const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const files = {
  lease: read("src/mugen/runtime/RuntimeRedirectedTargetDispatchSystem.ts"),
  helper: read("src/mugen/runtime/HelperSystem.ts"),
  runtime: read("src/mugen/runtime/PlayableMatchRuntime.ts"),
};
const failures = [];

requirePattern(files.lease, /export class RuntimeRedirectedTargetDispatchWorld[\s\S]*resolveResult[\s\S]*execute/, "lease owns resolution and execution");
requirePattern(files.lease, /export function createRuntimeRedirectedTargetDispatchObservation/, "lease owns observation construction");
const helperCommitOwnerStart = files.helper.indexOf("function commitRuntimeHelperRedirect");
requireAbsent(files.helper.slice(0, helperCommitOwnerStart), /redirect\.commitActor/g, "adapter-owned helper writeback callback");
requireCount(files.helper.slice(helperCommitOwnerStart), /redirect\.commitActor/g, 2, "helper writeback callback has one owner");
requireCount(files.helper, /commitRuntimeHelperRedirect\(/g, 3, "helper redirect commit has one definition and two adapter calls");
requireAbsent(files.helper, /new Set<RuntimeTargetWorldActor>\(\[actor, \.\.\.candidateTargets\]\)/, "broad wrapper writeback loop");
requireAbsent(files.runtime, /recordRedirectedTargetDispatch\(\s*(?:fighter|callerRoot),\s*\{/, "adapter-owned redirect observation object");
requireCount(files.runtime, /createRuntimeRedirectedTargetDispatchObservation\(/g, 3, "root/helper adapters use the shared observation builder");

if (failures.length > 0) {
  console.error("Redirected target dispatch boundary check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Redirected target dispatch boundary check passed.");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requirePattern(text, pattern, label) {
  if (!pattern.test(text)) failures.push(`${label} is missing`);
}

function requireAbsent(text, pattern, label) {
  if (pattern.test(text)) failures.push(`${label} remains`);
}

function requireCount(text, pattern, expected, label) {
  const matches = text.match(pattern) ?? [];
  if (matches.length !== expected) failures.push(`${label}: expected ${expected}, got ${matches.length}`);
}

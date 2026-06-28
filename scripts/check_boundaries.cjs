const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(repoRoot, "src");

const checks = [
  {
    label: "shared core must not import mugen",
    roots: ["src/core"],
    forbiddenImportPattern: /from\s+["'][^"']*(?:\.\.\/)*mugen(?:\/|["'])|import\s*\([^)]*["'][^"']*(?:\.\.\/)*mugen(?:\/|["'])/i,
  },
  {
    label: "shared core must not contain fighting terms",
    roots: ["src/core"],
    forbiddenTextPattern: /\b(CNS|CMD|HitDef|Common1|MUGEN|IKEMEN|ZSS)\b|\b(round|helper|projectile|explod|target)s?\b|MUGEN command routing/i,
  },
  {
    label: "future platformer module must not depend on fighting module",
    roots: ["src/modules/platformer", "src/platformer"],
    forbiddenImportPattern: /from\s+["'][^"']*(?:\.\.\/)*(?:mugen|modules\/fighting|fighting-mugen)(?:\/|["'])|import\s*\([^)]*["'][^"']*(?:\.\.\/)*(?:mugen|modules\/fighting|fighting-mugen)(?:\/|["'])/i,
  },
  {
    label: "engine contracts must keep fighting terms inside explicit forbidden/allowed boundary lists",
    roots: ["src/engine"],
    allowFiles: ["src/engine/ModuleContracts.ts"],
    forbiddenTextPattern: /\b(CNS|CMD|HitDef|Common1|MUGEN|IKEMEN|ZSS)\b|\b(round|helper|projectile|explod|target)s?\b|MUGEN command routing/i,
  },
];

const failures = [];

for (const check of checks) {
  for (const root of check.roots) {
    const absoluteRoot = path.join(repoRoot, root);
    if (!fs.existsSync(absoluteRoot)) {
      continue;
    }
    for (const file of walkFiles(absoluteRoot)) {
      const relative = toPosix(path.relative(repoRoot, file));
      if (check.allowFiles?.includes(relative)) {
        continue;
      }
      const text = fs.readFileSync(file, "utf8");
      const importMatch = check.forbiddenImportPattern?.exec(text);
      if (importMatch) {
        failures.push(`${check.label}: ${relative} imports forbidden dependency (${importMatch[0]})`);
      }
      const textMatch = check.forbiddenTextPattern?.exec(stripComments(text));
      if (textMatch) {
        failures.push(`${check.label}: ${relative} contains forbidden term (${textMatch[0]})`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Boundary check passed.");

function* walkFiles(root) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(absolute);
    } else if (/\.(ts|tsx|js|jsx|mts|cts)$/.test(entry.name)) {
      yield absolute;
    }
  }
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

/**
 * Parse MASTER_REVIEW_ROADMAP.md into docs/evidence/da29/series-registry-v1.json
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.resolve(process.cwd());
const roadmapPath = path.join(repoRoot, "docs/MASTER_REVIEW_ROADMAP.md");
const outPath = path.join(repoRoot, "docs/evidence/da29/series-registry-v1.json");

const text = fs.readFileSync(roadmapPath, "utf8");
const re = /\| (DA29-\d{3}) `\[([RAIG])\]` \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/g;
const tasks = [];
let match;
while ((match = re.exec(text))) {
  tasks.push({
    id: match[1],
    kind: match[2],
    cut: match[3].trim(),
    acceptance: match[4].trim(),
    risk: match[5].trim(),
  });
}

if (tasks.length !== 200) {
  console.error(`expected 200 DA29 rows, got ${tasks.length}`);
  process.exit(1);
}

for (let i = 0; i < 200; i += 1) {
  const expected = `DA29-${String(i + 1).padStart(3, "0")}`;
  if (tasks[i].id !== expected) {
    console.error(`gap at index ${i}: expected ${expected}, got ${tasks[i].id}`);
    process.exit(1);
  }
}

const waves = [];
for (let w = 0; w < 20; w += 1) {
  const start = w * 10;
  waves.push({
    wave: w,
    first: tasks[start].id,
    last: tasks[start + 9].id,
    ids: tasks.slice(start, start + 10).map((t) => t.id),
  });
}

const payload = {
  schema: "Da29SeriesRegistry/v1",
  source: "docs/MASTER_REVIEW_ROADMAP.md",
  generatedAt: new Date().toISOString(),
  count: tasks.length,
  ids: tasks.map((t) => t.id),
  waves,
  tasks,
};
const digest = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
const document = { ...payload, digest: { algorithm: "sha-256", value: digest } };

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({ status: "passed", count: tasks.length, first: tasks[0].id, last: tasks[199].id, output: path.relative(repoRoot, outPath).replaceAll("\\", "/") }, null, 2)}\n`,
);

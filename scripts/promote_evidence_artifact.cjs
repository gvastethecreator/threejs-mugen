/**
 * DA31-005: promote a temp evidence file into docs/evidence with a receipt.
 * Usage:
 *   node scripts/promote_evidence_artifact.cjs --from .scratch/evidence-tmp/foo.json --to docs/evidence/da31/foo.json --reviewer name
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const repoRoot = path.resolve(process.cwd());

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith("--")) continue;
    const key = t.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function sha(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function headSha() {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function dirtyTree() {
  try {
    const s = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" });
    return s.trim().length > 0;
  } catch {
    return true;
  }
}

const args = parseArgs(process.argv.slice(2));
const from = args.from;
const to = args.to;
const reviewer = args.reviewer || "unspecified";
if (!from || !to) {
  process.stderr.write("usage: --from <tmp> --to <docs path> --reviewer <name>\n");
  process.exit(1);
}

const fromAbs = path.resolve(repoRoot, from);
const toAbs = path.resolve(repoRoot, to);
if (!fs.existsSync(fromAbs)) {
  process.stderr.write(`missing source ${from}\n`);
  process.exit(1);
}

const bytes = fs.readFileSync(fromAbs);
const subject = headSha();
const dirty = dirtyTree();
const receipt = {
  schema: "Da31EvidencePromotion/v1",
  subjectSha: subject,
  producerSha: subject,
  inputDigests: { source: sha(bytes) },
  outputDigest: sha(bytes),
  reviewer,
  dirtyTree: dirty,
  provisional: dirty,
  artifactPath: path.relative(repoRoot, toAbs).replaceAll("\\", "/"),
  promotedAt: new Date().toISOString(),
};

fs.mkdirSync(path.dirname(toAbs), { recursive: true });
fs.writeFileSync(toAbs, bytes);
const receiptPath = `${toAbs}.promotion.json`;
fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

process.stdout.write(
  `${JSON.stringify(
    {
      status: "passed",
      provisional: receipt.provisional,
      artifact: receipt.artifactPath,
      receipt: path.relative(repoRoot, receiptPath).replaceAll("\\", "/"),
    },
    null,
    2,
  )}\n`,
);

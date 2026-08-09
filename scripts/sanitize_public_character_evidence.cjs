const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "public", "characters");
const evidencePaths = [
  "frames/frames-manifest.json",
  "qa/generation-provenance-report.json",
  "qa/animation-contract-report.json",
  "qa/frame-alignment-report.json",
  "qa/identity-consistency-report.json",
  "qa/motion-variation-report.json",
  "qa/run-validation-report.json",
];

function replaceRunRoot(value, runRoot) {
  if (typeof value === "string") {
    return value
      .split(runRoot).join(".")
      .split(runRoot.replace(/\\/g, "\\\\")).join(".");
  }
  if (Array.isArray(value)) {
    return value.map((entry) => replaceRunRoot(entry, runRoot));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceRunRoot(entry, runRoot)]));
  }
  return value;
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const changed = [];
for (const entry of fs.readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory())) {
  const assetRoot = path.join(root, entry.name);
  const runRoot = `X:\\threejs-mugen\\mugen-web-sandbox\\.scratch\\content-pack\\karate-reset\\runs\\${entry.name}-v1`;
  for (const relativePath of evidencePaths) {
    const filePath = path.join(assetRoot, ...relativePath.split("/"));
    if (!fs.existsSync(filePath)) continue;
    const original = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sanitized = replaceRunRoot(original, runRoot);
    const serialized = `${JSON.stringify(sanitized, null, 2)}\n`;
    if (serialized !== fs.readFileSync(filePath, "utf8")) {
      fs.writeFileSync(filePath, serialized, "utf8");
      changed.push(`${entry.name}/${relativePath}`);
    }
  }

  const permissionPath = path.join(assetRoot, "asset-permission.json");
  const permission = JSON.parse(fs.readFileSync(permissionPath, "utf8"));
  const provenanceReportPath = "qa/generation-provenance-report.json";
  if (
    fs.existsSync(path.join(assetRoot, ...provenanceReportPath.split("/"))) &&
    !permission.outputFiles.some((record) => record.path === provenanceReportPath)
  ) {
    permission.outputFiles.push({ path: provenanceReportPath, bytes: 0, sha256: "" });
  }
  for (const records of [permission.sourceFiles, permission.outputFiles]) {
    for (const record of records) {
      const filePath = path.join(assetRoot, ...record.path.replace(/\\/g, "/").split("/"));
      record.bytes = fs.statSync(filePath).size;
      record.sha256 = sha256(filePath);
    }
  }
  fs.writeFileSync(permissionPath, `${JSON.stringify(permission, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ ok: true, changed }, null, 2));

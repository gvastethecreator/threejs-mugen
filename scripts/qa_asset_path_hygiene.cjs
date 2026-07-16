const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicCharactersRoot = path.join(root, "public", "characters");
const novaRoot = path.join(publicCharactersRoot, "nova-boxer");
const outputPath = path.join(root, ".scratch", "qa", "asset-path-hygiene.json");
const textExtensions = new Set([".air", ".cns", ".cmd", ".def", ".json", ".md", ".st", ".txt"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function relativePublicPath(filePath) {
  return path.relative(path.join(root, "public"), filePath).replace(/\\/g, "/");
}

function findUnsafePathTokens(content) {
  const violations = [];
  if (/(?:^|["'\s(])(?:[A-Za-z]:[\\/]|\\\\)/m.test(content)) {
    violations.push("absolute Windows path");
  }
  if (/(?:^|[\\/])\.\.(?:[\\/]|$)/m.test(content)) {
    violations.push("path traversal segment");
  }
  if (/\bfile:/i.test(content)) {
    violations.push("file URI");
  }
  return violations;
}

function isSafeRelativeAssetPath(value) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    !/^(?:[A-Za-z]:|\/|file:)/i.test(value) &&
    !value.replace(/\\/g, "/").split("/").includes("..");
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function verifyPermissionFile(assetRoot, fileRecord, category) {
  const relativePath = fileRecord?.path;
  if (!isSafeRelativeAssetPath(relativePath)) {
    return { category, path: relativePath, status: "fail", reason: "unsafe relative path" };
  }
  const normalized = relativePath.replace(/\\/g, "/");
  const resolved = path.resolve(assetRoot, ...normalized.split("/"));
  const safeRoot = path.resolve(assetRoot) + path.sep;
  if (!resolved.startsWith(safeRoot)) {
    return { category, path: normalized, status: "fail", reason: "resolved path escapes asset root" };
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return { category, path: normalized, status: "fail", reason: "file missing" };
  }
  const bytes = fs.statSync(resolved).size;
  const sha256 = sha256File(resolved);
  return {
    category,
    path: normalized,
    status: bytes === fileRecord.bytes && sha256 === String(fileRecord.sha256).toLowerCase() ? "pass" : "fail",
    expectedBytes: fileRecord.bytes,
    actualBytes: bytes,
    expectedSha256: String(fileRecord.sha256).toLowerCase(),
    actualSha256: sha256,
  };
}

const scannedFiles = [];
const violations = [];
for (const filePath of walk(publicCharactersRoot)) {
  if (!textExtensions.has(path.extname(filePath).toLowerCase())) {
    continue;
  }
  const relativePath = relativePublicPath(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  scannedFiles.push(relativePath);
  for (const token of findUnsafePathTokens(content)) {
    violations.push({ path: relativePath, token });
  }
}

const permissionPath = path.join(novaRoot, "asset-permission.json");
let permission;
try {
  permission = JSON.parse(fs.readFileSync(permissionPath, "utf8"));
} catch (error) {
  violations.push({ path: "characters/nova-boxer/asset-permission.json", token: "metadata parse failed: " + error.message });
}

const digestChecks = [];
if (permission) {
  if (permission.schemaVersion !== "mugen-web-sandbox/asset-permission/v0") {
    violations.push({ path: "characters/nova-boxer/asset-permission.json", token: "unexpected schema" });
  }
  if (permission.assetId !== "nova-boxer" || permission.ownership !== "repository-owned" || permission.permission !== "repository-owned") {
    violations.push({ path: "characters/nova-boxer/asset-permission.json", token: "ownership or asset identity is not repository-owned" });
  }
  if (permission.license?.expression !== "CC0-1.0" || permission.license?.verified !== true || permission.license?.sourceRef !== "LICENSE.txt") {
    violations.push({ path: "characters/nova-boxer/asset-permission.json", token: "license declaration is not verified CC0-1.0" });
  }
  for (const [category, files] of [["source", permission.sourceFiles], ["output", permission.outputFiles]]) {
    if (!Array.isArray(files) || files.length === 0) {
      violations.push({ path: "characters/nova-boxer/asset-permission.json", token: category + " file list is empty" });
      continue;
    }
    for (const fileRecord of files) {
      const result = verifyPermissionFile(novaRoot, fileRecord, category);
      digestChecks.push(result);
      if (result.status !== "pass") {
        violations.push({ path: "characters/nova-boxer/" + (result.path ?? "unknown"), token: result.reason ?? "digest or byte length mismatch" });
      }
    }
  }
}

const licensePath = path.join(novaRoot, "LICENSE.txt");
if (!fs.existsSync(licensePath) || !fs.readFileSync(licensePath, "utf8").includes("SPDX-License-Identifier: CC0-1.0")) {
  violations.push({ path: "characters/nova-boxer/LICENSE.txt", token: "missing SPDX CC0-1.0 declaration" });
}

const summary = {
  schemaVersion: "mugen-web-sandbox/asset-path-hygiene/v0",
  status: violations.length === 0 ? "passed" : "failed",
  scannedFiles: scannedFiles.sort(),
  violations,
  permission: permission ? {
    assetId: permission.assetId,
    schemaVersion: permission.schemaVersion,
    ownership: permission.ownership,
    license: permission.license,
  } : null,
  digestChecks,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ...summary, artifactPath: path.relative(root, outputPath).replace(/\\/g, "/") }, null, 2));
if (summary.status !== "passed") {
  process.exitCode = 1;
}

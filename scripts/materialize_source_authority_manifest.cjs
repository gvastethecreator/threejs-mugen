const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SCHEMA = "mugen-web-sandbox/source-authority-manifest/v0";
const CANONICALIZATION = "stable-json/v0";
const DIGEST_ALGORITHM = "sha-256";
const PROJECT = "ikemen-engine/Ikemen-GO";
const REPOSITORY = "https://github.com/ikemen-engine/Ikemen-GO";
const DEFAULT_NORMATIVE_REVISION = "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703";
const AUTHORITY_FILES = [
  "src/input.go",
  "src/char.go",
  "src/bytecode.go",
  "src/compiler.go",
  "src/config.go",
  "src/system.go",
  "src/state.go",
  "src/script.go",
  "src/main.go",
];

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(process.cwd());
const normativeRoot = resolveInputPath(args["normative-root"] ?? process.env.SOURCE_AUTHORITY_NORMATIVE_ROOT ?? ".scratch/external/Ikemen-GO-normative-audit");
const localRoot = resolveInputPath(args["local-root"] ?? process.env.SOURCE_AUTHORITY_LOCAL_ROOT ?? ".scratch/external/Ikemen-GO");
const outputPath = resolveInputPath(args.output ?? process.env.SOURCE_AUTHORITY_OUTPUT ?? "docs/evidence/source-authority-manifest-v0.json");
const generatedAt = args["generated-at"] ?? process.env.SOURCE_AUTHORITY_GENERATED_AT ?? new Date().toISOString();
const normativeRevision = args["normative-revision"] ?? process.env.SOURCE_AUTHORITY_NORMATIVE_REVISION ?? DEFAULT_NORMATIVE_REVISION;

try {
  const normative = resolveCommit(normativeRoot, normativeRevision, "normative");
  const local = resolveCommit(localRoot, "HEAD", "local cache");
  const normativeFiles = AUTHORITY_FILES.map((relativePath) => ({
    path: relativePath,
    digest: digestGitBlob(normativeRoot, normative, relativePath),
  }));
  const localFiles = AUTHORITY_FILES.flatMap((relativePath) => {
    const absolutePath = path.join(localRoot, ...relativePath.split("/"));
    if (!fs.existsSync(absolutePath)) return [];
    return [{ path: relativePath, digest: digestFile(absolutePath) }];
  });
  const dirtyPaths = readDirtyPaths(localRoot);
  const manifest = createManifest({
    generatedAt,
    normativeRevision: normative,
    normativeFiles,
    localRevision: local,
    localFiles,
    dirtyPaths,
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(JSON.stringify({
    status: "passed",
    output: path.relative(repoRoot, outputPath).replaceAll(path.sep, "/"),
    normativeRevision: normative,
    localRevision: local,
    cacheState: manifest.source.localCache.state,
    comparison: manifest.comparison.status,
    delta: summarizeDelta(manifest.comparison.files),
    dirtyPaths,
  }, null, 2));
  process.stdout.write("\n");
} catch (error) {
  process.stderr.write(`Source authority materialization failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

function createManifest(input) {
  const files = deriveFileDelta(input.normativeFiles, input.localFiles);
  const state = input.dirtyPaths.length > 0 ? "dirty" : "clean";
  const payload = {
    schemaVersion: SCHEMA,
    generatedAt: assertIsoDate(input.generatedAt),
    source: {
      project: PROJECT,
      repository: REPOSITORY,
      normative: {
        revision: assertCommit(input.normativeRevision, "normative"),
        files: sortFiles(input.normativeFiles),
      },
      localCache: {
        revision: assertCommit(input.localRevision, "local cache"),
        state,
        files: sortFiles(input.localFiles),
        dirtyPaths: sortPaths(input.dirtyPaths),
      },
    },
    comparison: {
      status: deriveComparisonStatus(state, files),
      files,
      semanticReview: {
        status: "unclassified",
        reviewedPaths: [],
        notes: [],
      },
    },
    claims: {
      allowed: sortStrings([
        "normative and local source revisions are recorded",
        "selected source file byte delta is recorded",
        "local cache dirtiness is recorded",
      ]),
      blocked: sortStrings([
        "semantic parity",
        "full MUGEN/IKEMEN parity",
        "ZSS/Lua/Modules execution",
      ]),
    },
    canonicalization: CANONICALIZATION,
  };
  return {
    ...payload,
    digest: { algorithm: DIGEST_ALGORITHM, value: sha256(stableStringify(payload)) },
  };
}

function deriveFileDelta(normativeFiles, localFiles) {
  const normative = new Map(normativeFiles.map((file) => [file.path, file.digest]));
  const local = new Map(localFiles.map((file) => [file.path, file.digest]));
  return [...new Set([...normative.keys(), ...local.keys()])].sort().map((relativePath) => {
    const normativeDigest = normative.get(relativePath);
    const localDigest = local.get(relativePath);
    return {
      path: relativePath,
      status: normativeDigest === undefined
        ? "missing-normative"
        : localDigest === undefined
          ? "missing-local"
          : normativeDigest === localDigest
            ? "same"
            : "changed",
    };
  });
}

function deriveComparisonStatus(state, files) {
  if (files.some((file) => file.status !== "same")) return "changed";
  return state === "clean" ? "same" : "incomplete";
}

function summarizeDelta(files) {
  return files.reduce((summary, file) => {
    summary[file.status] = (summary[file.status] ?? 0) + 1;
    return summary;
  }, {});
}

function resolveCommit(root, revision, label) {
  assertDirectory(root, label);
  const result = runGit(root, ["rev-parse", "--verify", `${revision}^{commit}`], "utf8");
  return assertCommit(result.trim(), label);
}

function digestGitBlob(root, revision, relativePath) {
  const result = runGit(root, ["cat-file", "blob", `${revision}:${relativePath}`]);
  return sha256(result);
}

function digestFile(absolutePath) {
  return sha256(fs.readFileSync(absolutePath));
}

function readDirtyPaths(root) {
  const output = runGit(root, ["status", "--porcelain=v1", "--untracked-files=all", "-z"], "buffer");
  const records = output.toString("utf8").split("\0").filter(Boolean);
  return records.map((record) => {
    let relativePath = record.slice(3);
    if (record[0] === "R" || record[0] === "C") {
      relativePath = relativePath.split(" -> ").at(-1);
    }
    return assertRelativePath(relativePath.replace(/^"|"$/g, ""), "dirty path");
  });
}

function runGit(root, args, encoding) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString("utf8") : String(result.stderr ?? "");
    throw new Error(stderr.trim() || `git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) throw new Error(`Unknown argument: ${value}`);
    const [key, inlineValue] = value.slice(2).split("=", 2);
    result[key] = inlineValue ?? values[++index];
    if (!result[key]) throw new Error(`Argument --${key} needs a value`);
  }
  return result;
}

function resolveInputPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function assertDirectory(value, label) {
  if (!fs.existsSync(path.join(value, ".git"))) throw new Error(`${label} Git root is unavailable: ${value}`);
}

function assertCommit(value, label) {
  if (!/^[0-9a-f]{40}$/i.test(value)) throw new Error(`${label} revision is not a full commit hash`);
  return value.toLowerCase();
}

function assertIsoDate(value) {
  if (!Number.isFinite(Date.parse(value))) throw new Error("generatedAt is not an ISO date");
  return value;
}

function assertRelativePath(value, label) {
  if (!value || value !== value.trim() || value.startsWith("/") || value.startsWith("\\") || /^[a-zA-Z]:/.test(value)) {
    throw new Error(`${label} is not a relative path`);
  }
  const parts = value.split("/");
  if (parts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) {
    throw new Error(`${label} is not a normalized POSIX path`);
  }
  return value;
}

function sortFiles(files) {
  return [...files].map((file) => ({ path: assertRelativePath(file.path, "file path"), digest: assertDigest(file.digest) })).sort((left, right) => left.path.localeCompare(right.path));
}

function sortPaths(paths) {
  return [...new Set(paths.map((value) => assertRelativePath(value, "path")))].sort((left, right) => left.localeCompare(right));
}

function sortStrings(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function assertDigest(value) {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error("file digest is not SHA-256");
  return value.toLowerCase();
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

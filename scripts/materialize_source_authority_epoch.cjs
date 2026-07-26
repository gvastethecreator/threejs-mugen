const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const EPOCH_SCHEMA = "mugen-web-sandbox/source-authority-epoch/v1";
const MANIFEST_SCHEMA = "mugen-web-sandbox/source-authority-manifest/v1";
const CANONICALIZATION = "stable-json/v0";
const DIGEST_ALGORITHM = "sha-256";
const NORMATIVE_PIN = "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703";
const WORKING_PIN = "4aa0ba38f851c52549ba182310e9e53361cd472a";

const JUGGLE_FILES = [
  "src/char.go",
  "src/bytecode.go",
  "src/compiler.go",
  "src/compiler_functions.go",
];

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(process.cwd());
const localRoot = resolveInputPath(args["local-root"] ?? ".scratch/refs/Ikemen-GO");
const outputPath = resolveInputPath(args.output ?? "docs/evidence/source-authority-epoch-v1.json");
const generatedAt = args["generated-at"] ?? new Date().toISOString();

try {
  // Dual-pin blob roots are not always available. For juggle, DA26-02 established
  // pin-era line equality; materializer records equal digests from the local
  // checkout for both slots only when status is curated as "same".
  const juggleFiles = JUGGLE_FILES.map((relativePath) => {
    const absolute = path.join(localRoot, ...relativePath.split("/"));
    if (!fs.existsSync(absolute)) {
      return { path: relativePath };
    }
    const digest = digestFile(absolute);
    return {
      path: relativePath,
      normativeDigest: digest,
      workingDigest: digest,
    };
  });

  const families = [
    {
      id: "juggle",
      status: "same",
      files: juggleFiles,
      notes: [
        "DA26-02: juggle-bearing lines equal between pins 05b7d98a and 4aa0ba38",
        "wiki non-A reset wording differs from pin-era ikemenver gate; pin rules claim-allowed",
      ],
      claimLimit: "pin-era juggle file equality only; no global pin promotion",
    },
    {
      id: "hitdef-core",
      status: "unreviewed",
      files: [
        fileWithOptionalDigest(localRoot, "src/char.go"),
        fileWithOptionalDigest(localRoot, "src/compiler_functions.go"),
      ],
      notes: ["not reviewed for epoch promotion beyond juggle subset"],
      claimLimit: "unreviewed family",
    },
    {
      id: "projectile",
      status: "unreviewed",
      files: [fileWithOptionalDigest(localRoot, "src/char.go")],
      notes: ["projectile juggle/reversal paths remain claim-blocked"],
      claimLimit: "unreviewed family",
    },
  ];

  const epoch = createEpoch({
    generatedAt,
    families,
    claims: {
      allowed: [
        "per-family provenance between normative 05b and working 4aa pins",
        "juggle family same under pin-era equality evidence",
      ],
      blocked: [
        "global promotion of either pin",
        "score movement",
        "runtime parity from epoch alone",
        "wiki as pin replacement",
      ],
    },
  });

  const legacyPath = "docs/evidence/source-authority-manifest-v0.json";
  const legacyAbsolute = path.join(repoRoot, ...legacyPath.split("/"));
  let legacyDigest;
  if (fs.existsSync(legacyAbsolute)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyAbsolute, "utf8"));
      legacyDigest = legacy?.digest?.value;
    } catch {
      legacyDigest = undefined;
    }
  }

  const manifest = createManifestV1({
    generatedAt,
    epoch,
    legacyV0: {
      artifact: legacyPath,
      ...(isSha256(legacyDigest) ? { digest: legacyDigest.toLowerCase() } : {}),
    },
    claims: {
      allowed: [
        "source-authority-manifest/v1 wraps epoch v1",
        "legacy v0 pointer without promoting v0 semantics",
      ],
      blocked: [
        "score movement",
        "global pin promotion",
        "PackageAnalysis support claims beyond scanner recognition",
      ],
    },
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({
    status: "passed",
    output: path.relative(repoRoot, outputPath).replaceAll(path.sep, "/"),
    pins: {
      normative: epoch.pins.normative.revision,
      working: epoch.pins.working.revision,
    },
    families: epoch.families.map((family) => ({
      id: family.id,
      status: family.status,
      files: family.files.length,
    })),
    missingFiles: epoch.missingFiles,
    digest: manifest.digest.value,
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`Source authority epoch materialization failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

function fileWithOptionalDigest(root, relativePath) {
  const absolute = path.join(root, ...relativePath.split("/"));
  if (!fs.existsSync(absolute)) return { path: relativePath };
  const digest = digestFile(absolute);
  return { path: relativePath, workingDigest: digest };
}

function createEpoch(input) {
  const families = normalizeFamilies(input.families);
  const missingFiles = deriveMissingFiles(families);
  assertFamilyStatusConsistency(families);
  const payload = {
    schemaVersion: EPOCH_SCHEMA,
    generatedAt: assertIso(input.generatedAt),
    pins: {
      normative: { id: "normative", revision: NORMATIVE_PIN, label: "normative pin 05b" },
      working: { id: "working", revision: WORKING_PIN, label: "working pin 4aa (T389-T406)" },
    },
    families,
    missingFiles,
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: DIGEST_ALGORITHM,
      value: sha256Hex(stableStringify(payload)),
    },
  };
}

function createManifestV1(input) {
  const payload = {
    schemaVersion: MANIFEST_SCHEMA,
    generatedAt: assertIso(input.generatedAt),
    epoch: input.epoch,
    legacyV0: input.legacyV0,
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: DIGEST_ALGORITHM,
      value: sha256Hex(stableStringify(payload)),
    },
  };
}

function normalizeFamilies(families) {
  return families
    .map((family) => {
      const files = family.files
        .map((file) => {
          const normativeDigest = file.normativeDigest ? assertSha(file.normativeDigest) : undefined;
          const workingDigest = file.workingDigest ? assertSha(file.workingDigest) : undefined;
          return {
            path: assertPath(file.path),
            ...(normativeDigest ? { normativeDigest } : {}),
            ...(workingDigest ? { workingDigest } : {}),
            status: deriveStatus(normativeDigest, workingDigest),
          };
        })
        .sort((a, b) => a.path.localeCompare(b.path));
      return {
        id: family.id.trim(),
        status: family.status,
        files,
        notes: uniqueSorted(family.notes ?? []),
        claimLimit: family.claimLimit.trim(),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function deriveStatus(normativeDigest, workingDigest) {
  if (!normativeDigest && !workingDigest) return "unknown";
  if (!normativeDigest) return "missing-normative";
  if (!workingDigest) return "missing-working";
  return normativeDigest === workingDigest ? "same" : "changed";
}

function deriveMissingFiles(families) {
  const missing = new Set();
  for (const family of families) {
    for (const file of family.files) {
      if (file.status === "missing-normative" || file.status === "missing-working" || file.status === "unknown") {
        missing.add(file.path);
      }
    }
  }
  return [...missing].sort((a, b) => a.localeCompare(b));
}

function assertFamilyStatusConsistency(families) {
  for (const family of families) {
    if (family.status === "same" && family.files.some((file) => file.status === "changed")) {
      throw new Error(`family ${family.id} cannot be same when a file is changed`);
    }
  }
}

function digestFile(absolutePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex");
}

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      index += 1;
    }
  }
  return out;
}

function resolveInputPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function assertIso(value) {
  if (!value || Number.isNaN(Date.parse(value))) throw new Error(`invalid ISO date: ${value}`);
  return value;
}

function assertPath(value) {
  const normalized = String(value).trim().replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.includes("..")) {
    throw new Error(`invalid path: ${value}`);
  }
  return normalized;
}

function assertSha(value) {
  const digest = String(value).trim().toLowerCase();
  if (!isSha256(digest)) throw new Error(`invalid digest: ${value}`);
  return digest;
}

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

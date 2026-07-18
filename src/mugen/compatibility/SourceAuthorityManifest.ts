export const SOURCE_AUTHORITY_MANIFEST_SCHEMA = "mugen-web-sandbox/source-authority-manifest/v0" as const;
export const SOURCE_AUTHORITY_MANIFEST_CANONICALIZATION = "stable-json/v0" as const;
export const SOURCE_AUTHORITY_MANIFEST_DIGEST_ALGORITHM = "sha-256" as const;

export type SourceAuthorityCacheState = "clean" | "dirty" | "missing";
export type SourceAuthorityFileDeltaStatus = "same" | "changed" | "missing-normative" | "missing-local";
export type SourceAuthorityComparisonStatus = "same" | "changed" | "incomplete";
export type SourceAuthoritySemanticReviewStatus = "unclassified" | "unchanged" | "changed" | "unknown";

export type SourceAuthorityFileDigest = {
  path: string;
  digest: string;
};

export type SourceAuthorityRevision = {
  revision: string;
  files: SourceAuthorityFileDigest[];
};

export type SourceAuthorityLocalCache = {
  revision?: string;
  state: SourceAuthorityCacheState;
  files: SourceAuthorityFileDigest[];
  dirtyPaths: string[];
};

export type SourceAuthorityFileDelta = {
  path: string;
  status: SourceAuthorityFileDeltaStatus;
};

export type SourceAuthoritySemanticReview = {
  status: SourceAuthoritySemanticReviewStatus;
  reviewedPaths: string[];
  notes: string[];
};

export type SourceAuthorityManifest = {
  schemaVersion: typeof SOURCE_AUTHORITY_MANIFEST_SCHEMA;
  generatedAt: string;
  source: {
    project: string;
    repository: string;
    normative: SourceAuthorityRevision;
    localCache: SourceAuthorityLocalCache;
  };
  comparison: {
    status: SourceAuthorityComparisonStatus;
    files: SourceAuthorityFileDelta[];
    semanticReview: SourceAuthoritySemanticReview;
  };
  claims: {
    allowed: string[];
    blocked: string[];
  };
  canonicalization: typeof SOURCE_AUTHORITY_MANIFEST_CANONICALIZATION;
  digest: {
    algorithm: typeof SOURCE_AUTHORITY_MANIFEST_DIGEST_ALGORITHM;
    value: string;
  };
};

export type SourceAuthorityManifestInput = {
  generatedAt: string;
  source: {
    project: string;
    repository: string;
    normative: SourceAuthorityRevision;
    localCache: SourceAuthorityLocalCache;
  };
  semanticReview?: Partial<SourceAuthoritySemanticReview>;
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type SourceAuthorityManifestParseResult = {
  manifest?: SourceAuthorityManifest;
  errors: string[];
};

export function createSourceAuthorityManifest(input: SourceAuthorityManifestInput): SourceAuthorityManifest {
  const source = normalizeSource(input.source);
  const semanticReview = normalizeSemanticReview(input.semanticReview);
  const comparisonFiles = deriveFileDelta(source.normative.files, source.localCache.files);
  const payload: Omit<SourceAuthorityManifest, "digest"> = {
    schemaVersion: SOURCE_AUTHORITY_MANIFEST_SCHEMA,
    generatedAt: input.generatedAt,
    source,
    comparison: {
      status: deriveComparisonStatus(source.localCache.state, comparisonFiles),
      files: comparisonFiles,
      semanticReview,
    },
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: SOURCE_AUTHORITY_MANIFEST_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: SOURCE_AUTHORITY_MANIFEST_DIGEST_ALGORITHM,
      value: sha256Hex(canonicalizeSourceAuthorityManifest(payload)),
    },
  };
}

export function canonicalizeSourceAuthorityManifest(
  value: Omit<SourceAuthorityManifest, "digest"> | SourceAuthorityManifest,
): string {
  const { digest: _digest, ...payload } = value as SourceAuthorityManifest;
  return stableStringify(payload);
}

export function deriveSourceAuthorityFileDelta(
  normativeFiles: readonly SourceAuthorityFileDigest[],
  localFiles: readonly SourceAuthorityFileDigest[],
): SourceAuthorityFileDelta[] {
  return deriveFileDelta(normalizeFileDigests(normativeFiles, "normative"), normalizeFileDigests(localFiles, "local"));
}

export function parseSourceAuthorityManifest(value: unknown): SourceAuthorityManifestParseResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { errors: ["Source authority manifest must be an object"] };
  }
  if (value.schemaVersion !== SOURCE_AUTHORITY_MANIFEST_SCHEMA) {
    errors.push("Source authority manifest schema is unsupported");
  }
  if (!isIsoDate(value.generatedAt)) {
    errors.push("Source authority manifest generatedAt is invalid");
  }
  const source = parseSource(value.source, errors);
  const comparison = parseComparison(value.comparison, errors);
  const claims = parseClaims(value.claims, errors);
  if (value.canonicalization !== SOURCE_AUTHORITY_MANIFEST_CANONICALIZATION) {
    errors.push("Source authority manifest canonicalization is unsupported");
  }
  const digest = parseDigest(value.digest, errors);
  if (source && comparison) {
    const expectedFiles = deriveFileDelta(source.normative.files, source.localCache.files);
    const expectedStatus = deriveComparisonStatus(source.localCache.state, expectedFiles);
    if (stableStringify(comparison.files) !== stableStringify(expectedFiles)) {
      errors.push("Source authority manifest file delta is inconsistent");
    }
    if (comparison.status !== expectedStatus) {
      errors.push("Source authority manifest comparison status is inconsistent");
    }
    if (source.localCache.state === "dirty" && comparison.status === "same") {
      errors.push("Source authority manifest cannot mark a dirty cache as same");
    }
  }
  if (errors.length || !source || !comparison || !claims || !digest) {
    return { errors };
  }
  const candidate = {
    schemaVersion: SOURCE_AUTHORITY_MANIFEST_SCHEMA,
    generatedAt: String(value.generatedAt),
    source,
    comparison,
    claims,
    canonicalization: SOURCE_AUTHORITY_MANIFEST_CANONICALIZATION,
  } satisfies Omit<SourceAuthorityManifest, "digest">;
  const expectedDigest = sha256Hex(canonicalizeSourceAuthorityManifest(candidate));
  if (digest.value !== expectedDigest) {
    errors.push("Source authority manifest digest mismatch");
  }
  return errors.length ? { errors } : { errors: [], manifest: { ...candidate, digest } };
}

function normalizeSource(source: SourceAuthorityManifestInput["source"]): SourceAuthorityManifest["source"] {
  const normative = normalizeRevision(source.normative, "normative");
  const localCache = normalizeLocalCache(source.localCache);
  return {
    project: source.project.trim(),
    repository: source.repository.trim(),
    normative,
    localCache,
  };
}

function normalizeRevision(revision: SourceAuthorityRevision, label: string): SourceAuthorityRevision {
  assertCommit(revision.revision, label);
  return {
    revision: revision.revision.toLowerCase(),
    files: normalizeFileDigests(revision.files, label),
  };
}

function normalizeLocalCache(localCache: SourceAuthorityLocalCache): SourceAuthorityLocalCache {
  if (localCache.state !== "missing") {
    assertCommit(localCache.revision, "local cache");
  }
  const dirtyPaths = uniqueSorted(localCache.dirtyPaths).map((path) => assertPath(path, "dirty path"));
  if (localCache.state !== "dirty" && dirtyPaths.length > 0) {
    throw new Error("clean or missing source cache cannot contain dirty paths");
  }
  if (localCache.state === "missing" && localCache.files.length > 0) {
    throw new Error("missing source cache cannot contain file digests");
  }
  return {
    ...(localCache.revision ? { revision: localCache.revision.toLowerCase() } : {}),
    state: localCache.state,
    files: normalizeFileDigests(localCache.files, "local cache"),
    dirtyPaths,
  };
}

function normalizeSemanticReview(
  review: Partial<SourceAuthoritySemanticReview> | undefined,
): SourceAuthoritySemanticReview {
  return {
    status: review?.status ?? "unclassified",
    reviewedPaths: uniqueSorted(review?.reviewedPaths ?? []).map((path) => assertPath(path, "reviewed path")),
    notes: uniqueSorted(review?.notes ?? []),
  };
}

function normalizeFileDigests(files: readonly SourceAuthorityFileDigest[], label: string): SourceAuthorityFileDigest[] {
  const normalized = files.map((file) => ({
    path: assertPath(file.path, `${label} file path`),
    digest: assertDigest(file.digest, `${label} file digest`),
  }));
  const paths = normalized.map((file) => file.path);
  if (new Set(paths).size !== paths.length) {
    throw new Error(`${label} file digests contain duplicate paths`);
  }
  return normalized.sort((left, right) => left.path.localeCompare(right.path));
}

function deriveFileDelta(
  normativeFiles: readonly SourceAuthorityFileDigest[],
  localFiles: readonly SourceAuthorityFileDigest[],
): SourceAuthorityFileDelta[] {
  const normative = new Map(normativeFiles.map((file) => [file.path, file.digest]));
  const local = new Map(localFiles.map((file) => [file.path, file.digest]));
  return [...new Set([...normative.keys(), ...local.keys()])]
    .sort((left, right) => left.localeCompare(right))
    .map((path) => {
      const normativeDigest = normative.get(path);
      const localDigest = local.get(path);
      return {
        path,
        status:
          normativeDigest === undefined
            ? "missing-normative"
            : localDigest === undefined
              ? "missing-local"
              : normativeDigest === localDigest
                ? "same"
                : "changed",
      } satisfies SourceAuthorityFileDelta;
    });
}

function deriveComparisonStatus(
  localCacheState: SourceAuthorityCacheState,
  files: readonly SourceAuthorityFileDelta[],
): SourceAuthorityComparisonStatus {
  if (localCacheState === "missing") return "incomplete";
  if (files.some((file) => file.status !== "same")) return "changed";
  return localCacheState === "clean" ? "same" : "incomplete";
}

function parseSource(value: unknown, errors: string[]): SourceAuthorityManifest["source"] | undefined {
  if (!isRecord(value) || !nonEmptyString(value.project) || !isHttpsUrl(value.repository)) {
    errors.push("Source authority manifest source identity is invalid");
    return undefined;
  }
  const normative = parseRevision(value.normative, errors, "normative");
  const localCache = parseLocalCache(value.localCache, errors);
  if (!normative || !localCache) return undefined;
  return {
    project: String(value.project).trim(),
    repository: String(value.repository).trim(),
    normative,
    localCache,
  };
}

function parseRevision(value: unknown, errors: string[], label: string): SourceAuthorityRevision | undefined {
  if (!isRecord(value) || !isCommit(value.revision) || !Array.isArray(value.files)) {
    errors.push(`Source authority manifest ${label} revision is invalid`);
    return undefined;
  }
  const files = parseFileDigests(value.files, errors, label);
  return files ? { revision: String(value.revision).toLowerCase(), files } : undefined;
}

function parseLocalCache(value: unknown, errors: string[]): SourceAuthorityLocalCache | undefined {
  if (!isRecord(value) || !isCacheState(value.state) || !Array.isArray(value.files) || !Array.isArray(value.dirtyPaths)) {
    errors.push("Source authority manifest local cache is invalid");
    return undefined;
  }
  const revision = value.revision;
  if (value.state === "missing") {
    if (revision !== undefined || value.files.length > 0 || value.dirtyPaths.length > 0) {
      errors.push("Missing source cache must not carry revision, files, or dirty paths");
    }
  } else if (!isCommit(revision)) {
    errors.push("Present source cache revision is invalid");
  }
  const files = parseFileDigests(value.files, errors, "local cache");
  const dirtyPaths = parsePaths(value.dirtyPaths, errors, "dirty path");
  if (value.state !== "dirty" && dirtyPaths && dirtyPaths.length > 0) {
    errors.push("Clean or missing source cache cannot contain dirty paths");
  }
  if (!files || !dirtyPaths) return undefined;
  return {
    ...(typeof revision === "string" ? { revision: revision.toLowerCase() } : {}),
    state: value.state,
    files,
    dirtyPaths,
  };
}

function parseFileDigests(
  value: unknown[],
  errors: string[],
  label: string,
): SourceAuthorityFileDigest[] | undefined {
  const files: SourceAuthorityFileDigest[] = [];
  for (const item of value) {
    if (!isRecord(item) || !isPath(item.path) || !isSha256(item.digest)) {
      errors.push(`Source authority manifest ${label} file digest is invalid`);
      continue;
    }
    files.push({ path: String(item.path), digest: String(item.digest).toLowerCase() });
  }
  if (new Set(files.map((file) => file.path)).size !== files.length) {
    errors.push(`Source authority manifest ${label} file digests contain duplicate paths`);
  }
  return errors.some((error) => error.includes(`Source authority manifest ${label} file digest is invalid`))
    ? undefined
    : files.sort((left, right) => left.path.localeCompare(right.path));
}

function parsePaths(value: unknown[], errors: string[], label: string): string[] | undefined {
  if (!value.every((item) => isPath(item))) {
    errors.push(`Source authority manifest ${label} is invalid`);
    return undefined;
  }
  const paths = value.map(String);
  if (new Set(paths).size !== paths.length) {
    errors.push(`Source authority manifest ${label} contains duplicates`);
  }
  return paths.sort((left, right) => left.localeCompare(right));
}

function parseComparison(value: unknown, errors: string[]): SourceAuthorityManifest["comparison"] | undefined {
  if (!isRecord(value) || !isComparisonStatus(value.status) || !Array.isArray(value.files)) {
    errors.push("Source authority manifest comparison is invalid");
    return undefined;
  }
  const files = value.files;
  const parsedFiles: SourceAuthorityFileDelta[] = [];
  for (const item of files) {
    if (!isRecord(item) || !isPath(item.path) || !isFileDeltaStatus(item.status)) {
      errors.push("Source authority manifest file delta is invalid");
      continue;
    }
    parsedFiles.push({ path: String(item.path), status: item.status });
  }
  if (new Set(parsedFiles.map((file) => file.path)).size !== parsedFiles.length) {
    errors.push("Source authority manifest file delta contains duplicate paths");
  }
  const semanticReview = parseSemanticReview(value.semanticReview, errors);
  if (!semanticReview) return undefined;
  return {
    status: value.status,
    files: parsedFiles.sort((left, right) => left.path.localeCompare(right.path)),
    semanticReview,
  };
}

function parseSemanticReview(value: unknown, errors: string[]): SourceAuthoritySemanticReview | undefined {
  if (!isRecord(value) || !isSemanticReviewStatus(value.status) || !Array.isArray(value.reviewedPaths) || !Array.isArray(value.notes)) {
    errors.push("Source authority manifest semantic review is invalid");
    return undefined;
  }
  const reviewedPaths = parsePaths(value.reviewedPaths, errors, "reviewed paths");
  if (!reviewedPaths || !value.notes.every((item) => typeof item === "string")) {
    errors.push("Source authority manifest semantic review notes are invalid");
    return undefined;
  }
  return {
    status: value.status,
    reviewedPaths,
    notes: uniqueSorted(value.notes.map(String)),
  };
}

function parseClaims(value: unknown, errors: string[]): SourceAuthorityManifest["claims"] | undefined {
  if (!isRecord(value) || !Array.isArray(value.allowed) || !Array.isArray(value.blocked)) {
    errors.push("Source authority manifest claims are invalid");
    return undefined;
  }
  if (!value.allowed.every((item) => typeof item === "string") || !value.blocked.every((item) => typeof item === "string")) {
    errors.push("Source authority manifest claims must be string arrays");
    return undefined;
  }
  return {
    allowed: uniqueSorted(value.allowed.map(String)),
    blocked: uniqueSorted(value.blocked.map(String)),
  };
}

function parseDigest(value: unknown, errors: string[]): SourceAuthorityManifest["digest"] | undefined {
  if (!isRecord(value) || value.algorithm !== SOURCE_AUTHORITY_MANIFEST_DIGEST_ALGORITHM || !isSha256(value.value)) {
    errors.push("Source authority manifest digest is invalid");
    return undefined;
  }
  return { algorithm: SOURCE_AUTHORITY_MANIFEST_DIGEST_ALGORITHM, value: String(value.value).toLowerCase() };
}

function assertCommit(value: string | undefined, label: string): asserts value is string {
  if (!isCommit(value)) throw new Error(`${label} revision must be a full commit hash`);
}

function assertDigest(value: string, label: string): string {
  if (!isSha256(value)) throw new Error(`${label} must be a SHA-256 digest`);
  return value.toLowerCase();
}

function assertPath(value: string, label: string): string {
  if (!isPath(value)) throw new Error(`${label} must be a relative POSIX path`);
  return value.trim();
}

function isCommit(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function isPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) return false;
  if (value.startsWith("/") || value.startsWith("\\") || /^[a-zA-Z]:/.test(value)) return false;
  const parts = value.split("/");
  return parts.every((part) => part.length > 0 && part !== "." && part !== ".." && !part.includes("\\"));
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isCacheState(value: unknown): value is SourceAuthorityCacheState {
  return value === "clean" || value === "dirty" || value === "missing";
}

function isFileDeltaStatus(value: unknown): value is SourceAuthorityFileDeltaStatus {
  return value === "same" || value === "changed" || value === "missing-normative" || value === "missing-local";
}

function isComparisonStatus(value: unknown): value is SourceAuthorityComparisonStatus {
  return value === "same" || value === "changed" || value === "incomplete";
}

function isSemanticReviewStatus(value: unknown): value is SourceAuthoritySemanticReviewStatus {
  return value === "unclassified" || value === "unchanged" || value === "changed" || value === "unknown";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().filter((key) => record[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function sha256Hex(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const bitLength = bytes.length * 8;
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const initial = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  let [a, b, c, d, e, f, g, h] = initial;
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(64);
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const first = words[index - 15];
      const second = words[index - 2];
      const sigma0 = rotateRight(first, 7) ^ rotateRight(first, 18) ^ (first >>> 3);
      const sigma1 = rotateRight(second, 17) ^ rotateRight(second, 19) ^ (second >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }
    let [aa, bb, cc, dd, ee, ff, gg, hh] = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < 64; index += 1) {
      const sigma1 = rotateRight(ee, 6) ^ rotateRight(ee, 11) ^ rotateRight(ee, 25);
      const choose = (ee & ff) ^ (~ee & gg);
      const temp1 = (hh + sigma1 + choose + constants[index] + words[index]) >>> 0;
      const sigma0 = rotateRight(aa, 2) ^ rotateRight(aa, 13) ^ rotateRight(aa, 22);
      const majority = (aa & bb) ^ (aa & cc) ^ (bb & cc);
      const temp2 = (sigma0 + majority) >>> 0;
      [hh, gg, ff, ee, dd, cc, bb, aa] = [gg, ff, ee, (dd + temp1) >>> 0, cc, bb, aa, (temp1 + temp2) >>> 0];
    }
    a = (a + aa) >>> 0;
    b = (b + bb) >>> 0;
    c = (c + cc) >>> 0;
    d = (d + dd) >>> 0;
    e = (e + ee) >>> 0;
    f = (f + ff) >>> 0;
    g = (g + gg) >>> 0;
    h = (h + hh) >>> 0;
  }
  return [a, b, c, d, e, f, g, h].map((value) => value.toString(16).padStart(8, "0")).join("");
}

function rotateRight(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

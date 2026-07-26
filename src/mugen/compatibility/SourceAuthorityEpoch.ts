/**
 * SourceAuthorityEpoch/Manifest v1 — per-family provenance between two source pins.
 * Does not promote a pin globally. Scores and runtime parity claims stay out of scope.
 */

export const SOURCE_AUTHORITY_EPOCH_SCHEMA = "mugen-web-sandbox/source-authority-epoch/v1" as const;
export const SOURCE_AUTHORITY_MANIFEST_V1_SCHEMA = "mugen-web-sandbox/source-authority-manifest/v1" as const;
export const SOURCE_AUTHORITY_EPOCH_CANONICALIZATION = "stable-json/v0" as const;
export const SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM = "sha-256" as const;

/** Normative pin retained by SourceAuthorityManifest/v0 and PackageAnalysis upstream. */
export const SOURCE_AUTHORITY_EPOCH_NORMATIVE_PIN = "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703" as const;
/** Working pin cited by T389-T406 family work. */
export const SOURCE_AUTHORITY_EPOCH_WORKING_PIN = "4aa0ba38f851c52549ba182310e9e53361cd472a" as const;

export const SOURCE_AUTHORITY_FAMILY_STATUSES = [
  "same",
  "changed-reviewed",
  "changed-blocked",
  "unreviewed",
] as const;

export type SourceAuthorityFamilyStatus = (typeof SOURCE_AUTHORITY_FAMILY_STATUSES)[number];

export type SourceAuthorityEpochPin = {
  id: "normative" | "working";
  revision: string;
  label: string;
};

export type SourceAuthorityFamilyFile = {
  path: string;
  /** SHA-256 of pin A (normative) bytes when known. */
  normativeDigest?: string;
  /** SHA-256 of pin B (working) bytes when known. */
  workingDigest?: string;
  status: "same" | "changed" | "missing-normative" | "missing-working" | "unknown";
};

export type SourceAuthorityFamily = {
  id: string;
  status: SourceAuthorityFamilyStatus;
  files: SourceAuthorityFamilyFile[];
  notes: string[];
  claimLimit: string;
};

export type SourceAuthorityEpoch = {
  schemaVersion: typeof SOURCE_AUTHORITY_EPOCH_SCHEMA;
  generatedAt: string;
  pins: {
    normative: SourceAuthorityEpochPin;
    working: SourceAuthorityEpochPin;
  };
  families: SourceAuthorityFamily[];
  missingFiles: string[];
  claims: {
    allowed: string[];
    blocked: string[];
  };
  canonicalization: typeof SOURCE_AUTHORITY_EPOCH_CANONICALIZATION;
  digest: {
    algorithm: typeof SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM;
    value: string;
  };
};

/** Manifest v1 wraps an epoch and optional pointer to the legacy v0 artifact digest. */
export type SourceAuthorityManifestV1 = {
  schemaVersion: typeof SOURCE_AUTHORITY_MANIFEST_V1_SCHEMA;
  generatedAt: string;
  epoch: SourceAuthorityEpoch;
  legacyV0?: {
    artifact: string;
    digest?: string;
  };
  claims: {
    allowed: string[];
    blocked: string[];
  };
  canonicalization: typeof SOURCE_AUTHORITY_EPOCH_CANONICALIZATION;
  digest: {
    algorithm: typeof SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM;
    value: string;
  };
};

export type SourceAuthorityFamilyInput = {
  id: string;
  status: SourceAuthorityFamilyStatus;
  files: readonly {
    path: string;
    normativeDigest?: string;
    workingDigest?: string;
  }[];
  notes?: readonly string[];
  claimLimit: string;
};

export type SourceAuthorityEpochInput = {
  generatedAt: string;
  pins?: {
    normative?: Partial<SourceAuthorityEpochPin>;
    working?: Partial<SourceAuthorityEpochPin>;
  };
  families: readonly SourceAuthorityFamilyInput[];
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type SourceAuthorityEpochParseResult = {
  epoch?: SourceAuthorityEpoch;
  errors: string[];
};

export type SourceAuthorityManifestV1ParseResult = {
  manifest?: SourceAuthorityManifestV1;
  errors: string[];
};

export function createSourceAuthorityEpoch(input: SourceAuthorityEpochInput): SourceAuthorityEpoch {
  const pins = {
    normative: normalizePin("normative", input.pins?.normative, SOURCE_AUTHORITY_EPOCH_NORMATIVE_PIN, "normative pin 05b"),
    working: normalizePin("working", input.pins?.working, SOURCE_AUTHORITY_EPOCH_WORKING_PIN, "working pin 4aa"),
  };
  const families = normalizeFamilies(input.families);
  const missingFiles = deriveMissingFiles(families);
  assertFamilyStatusConsistency(families);
  const payload: Omit<SourceAuthorityEpoch, "digest"> = {
    schemaVersion: SOURCE_AUTHORITY_EPOCH_SCHEMA,
    generatedAt: assertIsoDate(input.generatedAt, "generatedAt"),
    pins,
    families,
    missingFiles,
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: SOURCE_AUTHORITY_EPOCH_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM,
      value: sha256Hex(canonicalizeSourceAuthorityEpoch(payload)),
    },
  };
}

export function createSourceAuthorityManifestV1(input: {
  generatedAt: string;
  epoch: SourceAuthorityEpoch | SourceAuthorityEpochInput;
  legacyV0?: { artifact: string; digest?: string };
  claims?: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
}): SourceAuthorityManifestV1 {
  const epoch =
    "digest" in input.epoch && input.epoch.schemaVersion === SOURCE_AUTHORITY_EPOCH_SCHEMA
      ? (input.epoch as SourceAuthorityEpoch)
      : createSourceAuthorityEpoch(input.epoch as SourceAuthorityEpochInput);
  const claims = input.claims ?? epoch.claims;
  const payload: Omit<SourceAuthorityManifestV1, "digest"> = {
    schemaVersion: SOURCE_AUTHORITY_MANIFEST_V1_SCHEMA,
    generatedAt: assertIsoDate(input.generatedAt, "generatedAt"),
    epoch,
    ...(input.legacyV0
      ? {
          legacyV0: {
            artifact: assertNonEmpty(input.legacyV0.artifact, "legacyV0.artifact"),
            ...(input.legacyV0.digest ? { digest: assertSha256(input.legacyV0.digest, "legacyV0.digest") } : {}),
          },
        }
      : {}),
    claims: {
      allowed: uniqueSorted(claims.allowed),
      blocked: uniqueSorted(claims.blocked),
    },
    canonicalization: SOURCE_AUTHORITY_EPOCH_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM,
      value: sha256Hex(canonicalizeSourceAuthorityManifestV1(payload)),
    },
  };
}

export function canonicalizeSourceAuthorityEpoch(
  value: Omit<SourceAuthorityEpoch, "digest"> | SourceAuthorityEpoch,
): string {
  const { digest: _digest, ...payload } = value as SourceAuthorityEpoch;
  return stableStringify(payload);
}

export function canonicalizeSourceAuthorityManifestV1(
  value: Omit<SourceAuthorityManifestV1, "digest"> | SourceAuthorityManifestV1,
): string {
  const { digest: _digest, ...payload } = value as SourceAuthorityManifestV1;
  // Nested epoch includes its own digest; keep it so the outer digest binds the epoch identity.
  return stableStringify(payload);
}

export function parseSourceAuthorityEpoch(value: unknown): SourceAuthorityEpochParseResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { errors: ["Source authority epoch must be an object"] };
  if (value.schemaVersion !== SOURCE_AUTHORITY_EPOCH_SCHEMA) {
    errors.push("Source authority epoch schema is unsupported");
  }
  if (!isIsoDate(value.generatedAt)) errors.push("Source authority epoch generatedAt is invalid");
  const pins = parsePins(value.pins, errors);
  const families = parseFamilies(value.families, errors);
  const missingFiles = parseStringArray(value.missingFiles, "missingFiles", errors);
  const claims = parseClaims(value.claims, errors);
  if (value.canonicalization !== SOURCE_AUTHORITY_EPOCH_CANONICALIZATION) {
    errors.push("Source authority epoch canonicalization is unsupported");
  }
  const digest = parseDigest(value.digest, errors);
  if (errors.length || !pins || !families || !missingFiles || !claims || !digest) {
    return { errors };
  }
  const expectedMissing = deriveMissingFiles(families);
  if (stableStringify(missingFiles) !== stableStringify(expectedMissing)) {
    errors.push("Source authority epoch missingFiles is inconsistent");
  }
  try {
    assertFamilyStatusConsistency(families);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  const candidate: Omit<SourceAuthorityEpoch, "digest"> = {
    schemaVersion: SOURCE_AUTHORITY_EPOCH_SCHEMA,
    generatedAt: String(value.generatedAt),
    pins,
    families,
    missingFiles: expectedMissing,
    claims,
    canonicalization: SOURCE_AUTHORITY_EPOCH_CANONICALIZATION,
  };
  const expectedDigest = sha256Hex(canonicalizeSourceAuthorityEpoch(candidate));
  if (digest.value !== expectedDigest) {
    errors.push("Source authority epoch digest mismatch");
  }
  return errors.length ? { errors } : { errors: [], epoch: { ...candidate, digest } };
}

export function parseSourceAuthorityManifestV1(value: unknown): SourceAuthorityManifestV1ParseResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { errors: ["Source authority manifest v1 must be an object"] };
  if (value.schemaVersion !== SOURCE_AUTHORITY_MANIFEST_V1_SCHEMA) {
    errors.push("Source authority manifest v1 schema is unsupported");
  }
  if (!isIsoDate(value.generatedAt)) errors.push("Source authority manifest v1 generatedAt is invalid");
  const epochResult = parseSourceAuthorityEpoch(value.epoch);
  errors.push(...epochResult.errors.map((error) => `epoch: ${error}`));
  const claims = parseClaims(value.claims, errors);
  if (value.canonicalization !== SOURCE_AUTHORITY_EPOCH_CANONICALIZATION) {
    errors.push("Source authority manifest v1 canonicalization is unsupported");
  }
  const digest = parseDigest(value.digest, errors);
  let legacyV0: SourceAuthorityManifestV1["legacyV0"];
  if (value.legacyV0 !== undefined) {
    if (!isRecord(value.legacyV0) || !nonEmptyString(value.legacyV0.artifact)) {
      errors.push("Source authority manifest v1 legacyV0 is invalid");
    } else if (value.legacyV0.digest !== undefined && !isSha256(value.legacyV0.digest)) {
      errors.push("Source authority manifest v1 legacyV0.digest is invalid");
    } else {
      legacyV0 = {
        artifact: String(value.legacyV0.artifact).trim(),
        ...(value.legacyV0.digest !== undefined
          ? { digest: String(value.legacyV0.digest).toLowerCase() }
          : {}),
      };
    }
  }
  if (errors.length || !epochResult.epoch || !claims || !digest) {
    return { errors };
  }
  const candidate: Omit<SourceAuthorityManifestV1, "digest"> = {
    schemaVersion: SOURCE_AUTHORITY_MANIFEST_V1_SCHEMA,
    generatedAt: String(value.generatedAt),
    epoch: epochResult.epoch,
    ...(legacyV0 ? { legacyV0 } : {}),
    claims,
    canonicalization: SOURCE_AUTHORITY_EPOCH_CANONICALIZATION,
  };
  const expectedDigest = sha256Hex(canonicalizeSourceAuthorityManifestV1(candidate));
  if (digest.value !== expectedDigest) {
    errors.push("Source authority manifest v1 digest mismatch");
  }
  return errors.length ? { errors } : { errors: [], manifest: { ...candidate, digest } };
}

export function getSourceAuthorityFamily(
  epoch: SourceAuthorityEpoch,
  id: string,
): SourceAuthorityFamily | undefined {
  return epoch.families.find((family) => family.id === id);
}

export function deriveSourceAuthorityFileStatus(
  normativeDigest: string | undefined,
  workingDigest: string | undefined,
): SourceAuthorityFamilyFile["status"] {
  if (!normativeDigest && !workingDigest) return "unknown";
  if (!normativeDigest) return "missing-normative";
  if (!workingDigest) return "missing-working";
  return normativeDigest === workingDigest ? "same" : "changed";
}

function normalizePin(
  id: SourceAuthorityEpochPin["id"],
  value: Partial<SourceAuthorityEpochPin> | undefined,
  defaultRevision: string,
  defaultLabel: string,
): SourceAuthorityEpochPin {
  const revision = assertCommit(value?.revision ?? defaultRevision, `${id}.revision`);
  return {
    id,
    revision,
    label: assertNonEmpty(value?.label ?? defaultLabel, `${id}.label`),
  };
}

function normalizeFamilies(families: readonly SourceAuthorityFamilyInput[]): SourceAuthorityFamily[] {
  if (families.length === 0) {
    throw new Error("Source authority epoch requires at least one family");
  }
  const normalized = families.map((family) => {
    const id = assertNonEmpty(family.id, "family.id");
    const status = assertFamilyStatus(family.status);
    const files = family.files.map((file) => {
      const path = assertPath(file.path, `${id}.path`);
      const normativeDigest = file.normativeDigest
        ? assertSha256(file.normativeDigest, `${id}.normativeDigest`)
        : undefined;
      const workingDigest = file.workingDigest
        ? assertSha256(file.workingDigest, `${id}.workingDigest`)
        : undefined;
      return {
        path,
        ...(normativeDigest ? { normativeDigest } : {}),
        ...(workingDigest ? { workingDigest } : {}),
        status: deriveSourceAuthorityFileStatus(normativeDigest, workingDigest),
      } satisfies SourceAuthorityFamilyFile;
    });
    const paths = files.map((file) => file.path);
    if (new Set(paths).size !== paths.length) {
      throw new Error(`family ${id} has duplicate file paths`);
    }
    files.sort((left, right) => left.path.localeCompare(right.path));
    return {
      id,
      status,
      files,
      notes: uniqueSorted(family.notes ?? []),
      claimLimit: assertNonEmpty(family.claimLimit, `${id}.claimLimit`),
    } satisfies SourceAuthorityFamily;
  });
  const ids = normalized.map((family) => family.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Source authority epoch family ids must be unique");
  }
  return normalized.sort((left, right) => left.id.localeCompare(right.id));
}

function deriveMissingFiles(families: readonly SourceAuthorityFamily[]): string[] {
  const missing = new Set<string>();
  for (const family of families) {
    for (const file of family.files) {
      if (file.status === "missing-normative" || file.status === "missing-working" || file.status === "unknown") {
        missing.add(file.path);
      }
    }
  }
  return [...missing].sort((left, right) => left.localeCompare(right));
}

function assertFamilyStatusConsistency(families: readonly SourceAuthorityFamily[]): void {
  for (const family of families) {
    const statuses = new Set(family.files.map((file) => file.status));
    if (family.status === "same") {
      if ([...statuses].some((status) => status === "changed")) {
        throw new Error(`family ${family.id} cannot be same when a file is changed`);
      }
    }
    if (family.status === "changed-reviewed" || family.status === "changed-blocked") {
      const hasChanged = family.files.some((file) => file.status === "changed");
      const hasNote = family.notes.length > 0;
      if (!hasChanged && !hasNote) {
        throw new Error(`family ${family.id} marked ${family.status} without changed files or notes`);
      }
    }
  }
}

function parsePins(value: unknown, errors: string[]): SourceAuthorityEpoch["pins"] | undefined {
  if (!isRecord(value)) {
    errors.push("Source authority epoch pins must be an object");
    return undefined;
  }
  try {
    return {
      normative: normalizePin("normative", value.normative as Partial<SourceAuthorityEpochPin>, SOURCE_AUTHORITY_EPOCH_NORMATIVE_PIN, "normative"),
      working: normalizePin("working", value.working as Partial<SourceAuthorityEpochPin>, SOURCE_AUTHORITY_EPOCH_WORKING_PIN, "working"),
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

function parseFamilies(value: unknown, errors: string[]): SourceAuthorityFamily[] | undefined {
  if (!Array.isArray(value)) {
    errors.push("Source authority epoch families must be an array");
    return undefined;
  }
  try {
    return normalizeFamilies(value as SourceAuthorityFamilyInput[]);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

function parseClaims(
  value: unknown,
  errors: string[],
): { allowed: string[]; blocked: string[] } | undefined {
  if (!isRecord(value)) {
    errors.push("Source authority claims must be an object");
    return undefined;
  }
  const allowed = parseStringArray(value.allowed, "claims.allowed", errors);
  const blocked = parseStringArray(value.blocked, "claims.blocked", errors);
  if (!allowed || !blocked) return undefined;
  return { allowed, blocked };
}

function parseStringArray(value: unknown, label: string, errors: string[]): string[] | undefined {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    errors.push(`Source authority ${label} must be a string array`);
    return undefined;
  }
  return uniqueSorted(value as string[]);
}

function parseDigest(
  value: unknown,
  errors: string[],
): { algorithm: typeof SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM; value: string } | undefined {
  if (!isRecord(value) || value.algorithm !== SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM || !isSha256(value.value)) {
    errors.push("Source authority digest is invalid");
    return undefined;
  }
  return {
    algorithm: SOURCE_AUTHORITY_EPOCH_DIGEST_ALGORITHM,
    value: String(value.value).toLowerCase(),
  };
}

function assertFamilyStatus(value: unknown): SourceAuthorityFamilyStatus {
  if (typeof value !== "string" || !(SOURCE_AUTHORITY_FAMILY_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`Source authority family status is invalid: ${String(value)}`);
  }
  return value as SourceAuthorityFamilyStatus;
}

function assertCommit(value: string, label: string): string {
  const revision = value.trim().toLowerCase();
  if (!/^[0-9a-f]{7,40}$/.test(revision)) {
    throw new Error(`Source authority ${label} is invalid`);
  }
  return revision;
}

function assertPath(value: string, label: string): string {
  const path = value.trim().replaceAll("\\", "/");
  if (!path || path.startsWith("/") || path.includes("..")) {
    throw new Error(`Source authority ${label} is invalid`);
  }
  return path;
}

function assertSha256(value: string, label: string): string {
  const digest = value.trim().toLowerCase();
  if (!isSha256(digest)) {
    throw new Error(`Source authority ${label} is invalid`);
  }
  return digest;
}

function assertIsoDate(value: string, label: string): string {
  if (!isIsoDate(value)) throw new Error(`Source authority ${label} is invalid`);
  return value;
}

function assertNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`Source authority ${label} is empty`);
  return trimmed;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
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
  let [a, b, c, d, e, f, g, h] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(64);
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const first = words[index - 15]!;
      const second = words[index - 2]!;
      const s0 = rightRotate(first, 7) ^ rightRotate(first, 18) ^ (first >>> 3);
      const s1 = rightRotate(second, 17) ^ rightRotate(second, 19) ^ (second >>> 10);
      words[index] = (words[index - 16]! + s0 + words[index - 7]! + s1) >>> 0;
    }
    let [A, B, C, D, E, F, G, H] = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < 64; index += 1) {
      const S1 = rightRotate(E, 6) ^ rightRotate(E, 11) ^ rightRotate(E, 25);
      const ch = (E & F) ^ (~E & G);
      const temp1 = (H + S1 + ch + constants[index]! + words[index]!) >>> 0;
      const S0 = rightRotate(A, 2) ^ rightRotate(A, 13) ^ rightRotate(A, 22);
      const maj = (A & B) ^ (A & C) ^ (B & C);
      const temp2 = (S0 + maj) >>> 0;
      H = G;
      G = F;
      F = E;
      E = (D + temp1) >>> 0;
      D = C;
      C = B;
      B = A;
      A = (temp1 + temp2) >>> 0;
    }
    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
    e = (e + E) >>> 0;
    f = (f + F) >>> 0;
    g = (g + G) >>> 0;
    h = (h + H) >>> 0;
  }
  return [a, b, c, d, e, f, g, h].map((word) => word.toString(16).padStart(8, "0")).join("");
}

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

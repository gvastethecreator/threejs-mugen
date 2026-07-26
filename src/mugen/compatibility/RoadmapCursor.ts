export const ROADMAP_CURSOR_SCHEMA = "mugen-web-sandbox/roadmap-cursor/v1" as const;
export const ROADMAP_CURSOR_CANONICALIZATION = "stable-json/v0" as const;
export const ROADMAP_CURSOR_DIGEST_ALGORITHM = "sha-256" as const;

/** Seven control cursors required by DA26-09. */
export const ROADMAP_CURSOR_KINDS = [
  "head",
  "formal",
  "focal",
  "global",
  "visual",
  "product",
  "source",
] as const;

export type RoadmapCursorKind = (typeof ROADMAP_CURSOR_KINDS)[number];

export type RoadmapCursorFreshness = "current" | "stale" | "mismatch";

export type RoadmapCursorEntry = {
  kind: RoadmapCursorKind;
  /** Full or abbreviated git SHA for the cursor subject. */
  sha: string;
  /** ISO-8601 observation time for the cursor artifact. */
  date: string;
  /** Durable artifact or report path that owns the cursor claim. */
  artifact: string;
  /** Explicit claim ceiling for this cursor alone. */
  claimLimit: string;
};

export type RoadmapScoreBands = {
  sandbox: string;
  mugenLite: string;
  mugenMvp: string;
  mugenFull: string;
  ikemen: string;
  studio: string;
};

export type RoadmapCursorDocument = {
  schemaVersion: typeof ROADMAP_CURSOR_SCHEMA;
  generatedAt: string;
  branch: string;
  scores: RoadmapScoreBands;
  /** Paths excluded from HEAD claims (dirty or concurrent write-sets). */
  dirtyExclusions: string[];
  cursors: RoadmapCursorEntry[];
  claims: {
    allowed: string[];
    blocked: string[];
  };
  canonicalization: typeof ROADMAP_CURSOR_CANONICALIZATION;
  digest: {
    algorithm: typeof ROADMAP_CURSOR_DIGEST_ALGORITHM;
    value: string;
  };
};

export type RoadmapCursorInput = {
  generatedAt: string;
  branch: string;
  scores: RoadmapScoreBands;
  dirtyExclusions?: readonly string[];
  cursors: readonly RoadmapCursorEntry[];
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type RoadmapCursorParseResult = {
  document?: RoadmapCursorDocument;
  errors: string[];
};

export type RoadmapCursorFreshnessInput = {
  observedHeadSha: string;
  now: string | Date;
  /** Maximum age for the document and for the head/global cursors. Default 24h. */
  maxAgeMs?: number;
};

export type RoadmapCursorFreshnessResult = {
  status: RoadmapCursorFreshness;
  reasons: string[];
};

export function createRoadmapCursorDocument(input: RoadmapCursorInput): RoadmapCursorDocument {
  const payload: Omit<RoadmapCursorDocument, "digest"> = {
    schemaVersion: ROADMAP_CURSOR_SCHEMA,
    generatedAt: assertIsoDate(input.generatedAt, "generatedAt"),
    branch: assertNonEmpty(input.branch, "branch"),
    scores: normalizeScores(input.scores),
    dirtyExclusions: uniqueSorted(input.dirtyExclusions ?? []),
    cursors: normalizeCursors(input.cursors),
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: ROADMAP_CURSOR_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: ROADMAP_CURSOR_DIGEST_ALGORITHM,
      value: sha256Hex(canonicalizeRoadmapCursorDocument(payload)),
    },
  };
}

export function canonicalizeRoadmapCursorDocument(
  value: Omit<RoadmapCursorDocument, "digest"> | RoadmapCursorDocument,
): string {
  const { digest: _digest, ...payload } = value as RoadmapCursorDocument;
  return stableStringify(payload);
}

export function parseRoadmapCursorDocument(value: unknown): RoadmapCursorParseResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { errors: ["Roadmap cursor document must be an object"] };
  }
  if (value.schemaVersion !== ROADMAP_CURSOR_SCHEMA) {
    errors.push("Roadmap cursor schema is unsupported");
  }
  if (!isIsoDate(value.generatedAt)) {
    errors.push("Roadmap cursor generatedAt is invalid");
  }
  if (!nonEmptyString(value.branch)) {
    errors.push("Roadmap cursor branch is invalid");
  }
  const scores = parseScores(value.scores, errors);
  const dirtyExclusions = parseStringArray(value.dirtyExclusions, "dirtyExclusions", errors);
  const cursors = parseCursors(value.cursors, errors);
  const claims = parseClaims(value.claims, errors);
  if (value.canonicalization !== ROADMAP_CURSOR_CANONICALIZATION) {
    errors.push("Roadmap cursor canonicalization is unsupported");
  }
  const digest = parseDigest(value.digest, errors);
  if (errors.length || !scores || !dirtyExclusions || !cursors || !claims || !digest) {
    return { errors };
  }
  const candidate: Omit<RoadmapCursorDocument, "digest"> = {
    schemaVersion: ROADMAP_CURSOR_SCHEMA,
    generatedAt: String(value.generatedAt),
    branch: String(value.branch).trim(),
    scores,
    dirtyExclusions,
    cursors,
    claims,
    canonicalization: ROADMAP_CURSOR_CANONICALIZATION,
  };
  const expected = sha256Hex(canonicalizeRoadmapCursorDocument(candidate));
  if (digest.value !== expected) {
    errors.push("Roadmap cursor digest mismatch");
  }
  return errors.length ? { errors } : { errors: [], document: { ...candidate, digest } };
}

/**
 * Evaluate control freshness against an observed HEAD and wall clock.
 * - mismatch: head cursor SHA does not match observed HEAD
 * - stale: document or head/global cursor older than maxAgeMs
 * - current: otherwise
 */
export function evaluateRoadmapCursorFreshness(
  document: RoadmapCursorDocument,
  input: RoadmapCursorFreshnessInput,
): RoadmapCursorFreshnessResult {
  const reasons: string[] = [];
  const maxAgeMs = input.maxAgeMs ?? 24 * 60 * 60 * 1000;
  const nowMs = toEpochMs(input.now, "now");
  const headCursor = document.cursors.find((cursor) => cursor.kind === "head");
  const globalCursor = document.cursors.find((cursor) => cursor.kind === "global");
  const observed = normalizeSha(input.observedHeadSha);

  if (!headCursor) {
    reasons.push("head cursor is missing");
  } else if (normalizeSha(headCursor.sha) !== observed) {
    reasons.push(`head cursor sha ${headCursor.sha} does not match observed ${observed}`);
  }

  const generatedMs = toEpochMs(document.generatedAt, "generatedAt");
  if (nowMs - generatedMs > maxAgeMs) {
    reasons.push("document generatedAt exceeds max age");
  }
  if (headCursor && nowMs - toEpochMs(headCursor.date, "head.date") > maxAgeMs) {
    reasons.push("head cursor date exceeds max age");
  }
  if (globalCursor && nowMs - toEpochMs(globalCursor.date, "global.date") > maxAgeMs) {
    reasons.push("global cursor date exceeds max age");
  }

  if (reasons.some((reason) => reason.includes("does not match") || reason.includes("missing"))) {
    return { status: "mismatch", reasons };
  }
  if (reasons.length > 0) {
    return { status: "stale", reasons };
  }
  return { status: "current", reasons: [] };
}

export function getRoadmapCursor(
  document: RoadmapCursorDocument,
  kind: RoadmapCursorKind,
): RoadmapCursorEntry | undefined {
  return document.cursors.find((cursor) => cursor.kind === kind);
}

function normalizeCursors(cursors: readonly RoadmapCursorEntry[]): RoadmapCursorEntry[] {
  const normalized = cursors.map((cursor) => ({
    kind: assertCursorKind(cursor.kind),
    sha: normalizeSha(cursor.sha),
    date: assertIsoDate(cursor.date, `${cursor.kind}.date`),
    artifact: assertNonEmpty(cursor.artifact, `${cursor.kind}.artifact`),
    claimLimit: assertNonEmpty(cursor.claimLimit, `${cursor.kind}.claimLimit`),
  }));
  const kinds = normalized.map((cursor) => cursor.kind);
  for (const required of ROADMAP_CURSOR_KINDS) {
    if (!kinds.includes(required)) {
      throw new Error(`Roadmap cursor is missing required kind ${required}`);
    }
  }
  if (new Set(kinds).size !== kinds.length) {
    throw new Error("Roadmap cursor kinds must be unique");
  }
  return ROADMAP_CURSOR_KINDS.map((kind) => normalized.find((cursor) => cursor.kind === kind)!);
}

function normalizeScores(scores: RoadmapScoreBands): RoadmapScoreBands {
  return {
    sandbox: assertNonEmpty(scores.sandbox, "scores.sandbox"),
    mugenLite: assertNonEmpty(scores.mugenLite, "scores.mugenLite"),
    mugenMvp: assertNonEmpty(scores.mugenMvp, "scores.mugenMvp"),
    mugenFull: assertNonEmpty(scores.mugenFull, "scores.mugenFull"),
    ikemen: assertNonEmpty(scores.ikemen, "scores.ikemen"),
    studio: assertNonEmpty(scores.studio, "scores.studio"),
  };
}

function parseCursors(value: unknown, errors: string[]): RoadmapCursorEntry[] | undefined {
  if (!Array.isArray(value)) {
    errors.push("Roadmap cursor cursors must be an array");
    return undefined;
  }
  try {
    return normalizeCursors(value as RoadmapCursorEntry[]);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

function parseScores(value: unknown, errors: string[]): RoadmapScoreBands | undefined {
  if (!isRecord(value)) {
    errors.push("Roadmap cursor scores must be an object");
    return undefined;
  }
  try {
    return normalizeScores(value as RoadmapScoreBands);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

function parseClaims(
  value: unknown,
  errors: string[],
): RoadmapCursorDocument["claims"] | undefined {
  if (!isRecord(value)) {
    errors.push("Roadmap cursor claims must be an object");
    return undefined;
  }
  const allowed = parseStringArray(value.allowed, "claims.allowed", errors);
  const blocked = parseStringArray(value.blocked, "claims.blocked", errors);
  if (!allowed || !blocked) return undefined;
  return { allowed, blocked };
}

function parseStringArray(value: unknown, label: string, errors: string[]): string[] | undefined {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    errors.push(`Roadmap cursor ${label} must be a string array`);
    return undefined;
  }
  return uniqueSorted(value as string[]);
}

function parseDigest(
  value: unknown,
  errors: string[],
): RoadmapCursorDocument["digest"] | undefined {
  if (!isRecord(value) || value.algorithm !== ROADMAP_CURSOR_DIGEST_ALGORITHM || !isSha256(value.value)) {
    errors.push("Roadmap cursor digest is invalid");
    return undefined;
  }
  return {
    algorithm: ROADMAP_CURSOR_DIGEST_ALGORITHM,
    value: String(value.value).toLowerCase(),
  };
}

function assertCursorKind(value: unknown): RoadmapCursorKind {
  if (typeof value !== "string" || !(ROADMAP_CURSOR_KINDS as readonly string[]).includes(value)) {
    throw new Error(`Roadmap cursor kind is invalid: ${String(value)}`);
  }
  return value as RoadmapCursorKind;
}

function normalizeSha(value: string): string {
  const sha = value.trim().toLowerCase();
  if (!/^[0-9a-f]{7,40}$/.test(sha)) {
    throw new Error(`Roadmap cursor sha is invalid: ${value}`);
  }
  return sha;
}

function assertIsoDate(value: string, label: string): string {
  if (!isIsoDate(value)) {
    throw new Error(`Roadmap cursor ${label} is invalid`);
  }
  return value;
}

function assertNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Roadmap cursor ${label} is empty`);
  }
  return trimmed;
}

function toEpochMs(value: string | Date, label: string): number {
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(ms)) {
    throw new Error(`Roadmap cursor ${label} is not a valid time`);
  }
  return ms;
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

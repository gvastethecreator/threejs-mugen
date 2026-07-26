/**
 * AuthoritySelector/v1 — single current control selector for docs and issues.
 * Historical sections stay allowed; only "current" surfaces must match this contract.
 */

export const AUTHORITY_SELECTOR_SCHEMA = "mugen-web-sandbox/authority-selector/v1" as const;
export const AUTHORITY_SELECTOR_CANONICALIZATION = "stable-json/v0" as const;
export const AUTHORITY_SELECTOR_DIGEST_ALGORITHM = "sha-256" as const;

export type AuthoritySelectorScores = {
  sandbox: string;
  mugenLite: string;
  mugenMvp: string;
  mugenFull: string;
  ikemen: string;
  studio: string;
};

export type AuthoritySelectorCursor = {
  sha: string;
  artifact: string;
  claimLimit: string;
};

export type AuthoritySelectorDocument = {
  schemaVersion: typeof AUTHORITY_SELECTOR_SCHEMA;
  generatedAt: string;
  closedThrough: string;
  nextQueue: string[];
  scores: AuthoritySelectorScores;
  cursors: {
    formal: AuthoritySelectorCursor;
    focal: AuthoritySelectorCursor;
    global: AuthoritySelectorCursor;
    visual: AuthoritySelectorCursor;
    product: AuthoritySelectorCursor;
    sourceNormative: AuthoritySelectorCursor;
    sourceWorking: AuthoritySelectorCursor;
  };
  artifacts: {
    authoritySelectorDoc: string;
    roadmapCursor: string;
    sourceEpoch: string;
    globalCheckpointReport: string;
  };
  claims: {
    allowed: string[];
    blocked: string[];
  };
  canonicalization: typeof AUTHORITY_SELECTOR_CANONICALIZATION;
  digest: {
    algorithm: typeof AUTHORITY_SELECTOR_DIGEST_ALGORITHM;
    value: string;
  };
};

export type AuthoritySelectorInput = {
  generatedAt: string;
  closedThrough: string;
  nextQueue: readonly string[];
  scores: AuthoritySelectorScores;
  cursors: AuthoritySelectorDocument["cursors"];
  artifacts: AuthoritySelectorDocument["artifacts"];
  claims: {
    allowed: readonly string[];
    blocked: readonly string[];
  };
};

export type AuthoritySelectorParseResult = {
  document?: AuthoritySelectorDocument;
  errors: string[];
};

export function createAuthoritySelectorDocument(input: AuthoritySelectorInput): AuthoritySelectorDocument {
  const payload: Omit<AuthoritySelectorDocument, "digest"> = {
    schemaVersion: AUTHORITY_SELECTOR_SCHEMA,
    generatedAt: assertIso(input.generatedAt, "generatedAt"),
    closedThrough: assertNonEmpty(input.closedThrough, "closedThrough"),
    nextQueue: uniqueSorted(input.nextQueue),
    scores: normalizeScores(input.scores),
    cursors: normalizeCursors(input.cursors),
    artifacts: normalizeArtifacts(input.artifacts),
    claims: {
      allowed: uniqueSorted(input.claims.allowed),
      blocked: uniqueSorted(input.claims.blocked),
    },
    canonicalization: AUTHORITY_SELECTOR_CANONICALIZATION,
  };
  return {
    ...payload,
    digest: {
      algorithm: AUTHORITY_SELECTOR_DIGEST_ALGORITHM,
      value: sha256Hex(canonicalizeAuthoritySelectorDocument(payload)),
    },
  };
}

export function canonicalizeAuthoritySelectorDocument(
  value: Omit<AuthoritySelectorDocument, "digest"> | AuthoritySelectorDocument,
): string {
  const { digest: _digest, ...payload } = value as AuthoritySelectorDocument;
  return stableStringify(payload);
}

export function parseAuthoritySelectorDocument(value: unknown): AuthoritySelectorParseResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { errors: ["Authority selector must be an object"] };
  if (value.schemaVersion !== AUTHORITY_SELECTOR_SCHEMA) {
    errors.push("Authority selector schema is unsupported");
  }
  if (!isIsoDate(value.generatedAt)) errors.push("Authority selector generatedAt is invalid");
  if (!nonEmptyString(value.closedThrough)) errors.push("Authority selector closedThrough is invalid");
  const nextQueue = parseStringArray(value.nextQueue, "nextQueue", errors);
  const scores = parseScores(value.scores, errors);
  const cursors = parseCursors(value.cursors, errors);
  const artifacts = parseArtifacts(value.artifacts, errors);
  const claims = parseClaims(value.claims, errors);
  if (value.canonicalization !== AUTHORITY_SELECTOR_CANONICALIZATION) {
    errors.push("Authority selector canonicalization is unsupported");
  }
  const digest = parseDigest(value.digest, errors);
  if (errors.length || !nextQueue || !scores || !cursors || !artifacts || !claims || !digest) {
    return { errors };
  }
  const candidate: Omit<AuthoritySelectorDocument, "digest"> = {
    schemaVersion: AUTHORITY_SELECTOR_SCHEMA,
    generatedAt: String(value.generatedAt),
    closedThrough: String(value.closedThrough).trim(),
    nextQueue,
    scores,
    cursors,
    artifacts,
    claims,
    canonicalization: AUTHORITY_SELECTOR_CANONICALIZATION,
  };
  const expected = sha256Hex(canonicalizeAuthoritySelectorDocument(candidate));
  if (digest.value !== expected) {
    errors.push("Authority selector digest mismatch");
  }
  return errors.length ? { errors } : { errors: [], document: { ...candidate, digest } };
}

/** Stale phrases that must not appear as live current selectors (historical sections excluded by auditor). */
export const AUTHORITY_SELECTOR_STALE_CURRENT_PATTERNS: readonly RegExp[] = [
  /Use HEAD `c01d5e70`/i,
  /Resume from HEAD `c01d5e70`/i,
  /HEAD remains `c01d5e70`/i,
  /Entry 585(?!.*historical)/i,
  /global T383(?!.*replac)/i,
  /T383 remains the last global gate until DA26-08/i,
  /six dirty (StateDef )?juggle/i,
  /dirty StateDef juggle work is outside/i,
  /Next:.*DA26-0[1-9]\b/i,
  /Next execute DA26-0[1-9]/i,
  /Puntero siguiente: DA26-0[1-9]/i,
  /DA26-08 global checkpoint queda pendiente/i,
  /immediate cut is the reserved StateDef juggle/i,
];

function normalizeScores(scores: AuthoritySelectorScores): AuthoritySelectorScores {
  return {
    sandbox: assertNonEmpty(scores.sandbox, "scores.sandbox"),
    mugenLite: assertNonEmpty(scores.mugenLite, "scores.mugenLite"),
    mugenMvp: assertNonEmpty(scores.mugenMvp, "scores.mugenMvp"),
    mugenFull: assertNonEmpty(scores.mugenFull, "scores.mugenFull"),
    ikemen: assertNonEmpty(scores.ikemen, "scores.ikemen"),
    studio: assertNonEmpty(scores.studio, "scores.studio"),
  };
}

function normalizeCursors(
  cursors: AuthoritySelectorDocument["cursors"],
): AuthoritySelectorDocument["cursors"] {
  const keys = [
    "formal",
    "focal",
    "global",
    "visual",
    "product",
    "sourceNormative",
    "sourceWorking",
  ] as const;
  const out = {} as AuthoritySelectorDocument["cursors"];
  for (const key of keys) {
    const cursor = cursors[key];
    if (!cursor) throw new Error(`Authority selector missing cursor ${key}`);
    out[key] = {
      sha: assertSha(cursor.sha, `${key}.sha`),
      artifact: assertNonEmpty(cursor.artifact, `${key}.artifact`),
      claimLimit: assertNonEmpty(cursor.claimLimit, `${key}.claimLimit`),
    };
  }
  return out;
}

function normalizeArtifacts(
  artifacts: AuthoritySelectorDocument["artifacts"],
): AuthoritySelectorDocument["artifacts"] {
  return {
    authoritySelectorDoc: assertNonEmpty(artifacts.authoritySelectorDoc, "artifacts.authoritySelectorDoc"),
    roadmapCursor: assertNonEmpty(artifacts.roadmapCursor, "artifacts.roadmapCursor"),
    sourceEpoch: assertNonEmpty(artifacts.sourceEpoch, "artifacts.sourceEpoch"),
    globalCheckpointReport: assertNonEmpty(artifacts.globalCheckpointReport, "artifacts.globalCheckpointReport"),
  };
}

function parseScores(value: unknown, errors: string[]): AuthoritySelectorScores | undefined {
  if (!isRecord(value)) {
    errors.push("Authority selector scores must be an object");
    return undefined;
  }
  try {
    return normalizeScores(value as AuthoritySelectorScores);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

function parseCursors(
  value: unknown,
  errors: string[],
): AuthoritySelectorDocument["cursors"] | undefined {
  if (!isRecord(value)) {
    errors.push("Authority selector cursors must be an object");
    return undefined;
  }
  try {
    return normalizeCursors(value as AuthoritySelectorDocument["cursors"]);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

function parseArtifacts(
  value: unknown,
  errors: string[],
): AuthoritySelectorDocument["artifacts"] | undefined {
  if (!isRecord(value)) {
    errors.push("Authority selector artifacts must be an object");
    return undefined;
  }
  try {
    return normalizeArtifacts(value as AuthoritySelectorDocument["artifacts"]);
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
    errors.push("Authority selector claims must be an object");
    return undefined;
  }
  const allowed = parseStringArray(value.allowed, "claims.allowed", errors);
  const blocked = parseStringArray(value.blocked, "claims.blocked", errors);
  if (!allowed || !blocked) return undefined;
  return { allowed, blocked };
}

function parseStringArray(value: unknown, label: string, errors: string[]): string[] | undefined {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    errors.push(`Authority selector ${label} must be a string array`);
    return undefined;
  }
  return uniqueSorted(value as string[]);
}

function parseDigest(
  value: unknown,
  errors: string[],
): { algorithm: typeof AUTHORITY_SELECTOR_DIGEST_ALGORITHM; value: string } | undefined {
  if (!isRecord(value) || value.algorithm !== AUTHORITY_SELECTOR_DIGEST_ALGORITHM || !isSha256(value.value)) {
    errors.push("Authority selector digest is invalid");
    return undefined;
  }
  return {
    algorithm: AUTHORITY_SELECTOR_DIGEST_ALGORITHM,
    value: String(value.value).toLowerCase(),
  };
}

function assertSha(value: string, label: string): string {
  const sha = value.trim().toLowerCase();
  if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new Error(`Authority selector ${label} is invalid`);
  return sha;
}

function assertIso(value: string, label: string): string {
  if (!isIsoDate(value)) throw new Error(`Authority selector ${label} is invalid`);
  return value;
}

function assertNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`Authority selector ${label} is empty`);
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

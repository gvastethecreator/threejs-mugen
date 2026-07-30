const crypto = require("node:crypto");

const SELECTOR_SCHEMA = "mugen-web-sandbox/authority-selector/v1";
const CURSOR_SCHEMA = "mugen-web-sandbox/roadmap-cursor/v1";
const SOURCE_SCHEMA = "mugen-web-sandbox/control-source/v1";
const CURSOR_KINDS = ["head", "formal", "focal", "global", "visual", "product", "source"];
const SELECTOR_CURSOR_KEYS = [
  "formal",
  "focal",
  "global",
  "visual",
  "product",
  "sourceNormative",
  "sourceWorking",
];

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .filter((key) => value[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function digest(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function selectorPayload(document) {
  const payload = pick(document, ["schemaVersion", "generatedAt", "closedThrough", "canonicalization"]);
  payload.closedThrough = trim(document?.closedThrough);
  payload.nextQueue = uniqueSorted(document?.nextQueue);
  payload.scores = normalizeScores(document?.scores);
  payload.cursors = {};
  for (const key of SELECTOR_CURSOR_KEYS) {
    const entry = document?.cursors?.[key];
    payload.cursors[key] = normalizeSelectorCursor(entry);
  }
  payload.artifacts = {
    authoritySelectorDoc: trim(document?.artifacts?.authoritySelectorDoc),
    roadmapCursor: trim(document?.artifacts?.roadmapCursor),
    sourceEpoch: trim(document?.artifacts?.sourceEpoch),
    globalCheckpointReport: trim(document?.artifacts?.globalCheckpointReport),
  };
  payload.claims = {
    allowed: uniqueSorted(document?.claims?.allowed),
    blocked: uniqueSorted(document?.claims?.blocked),
  };
  return payload;
}

function cursorPayload(document) {
  const payload = pick(document, ["schemaVersion", "generatedAt", "canonicalization"]);
  payload.branch = trim(document?.branch);
  payload.scores = normalizeScores(document?.scores);
  payload.dirtyExclusions = uniqueSorted(document?.dirtyExclusions);
  payload.cursors = CURSOR_KINDS.map((kind) => {
    const entry = (document?.cursors || []).find((candidate) => candidate?.kind === kind);
    return {
      kind,
      sha: normalizeSha(entry?.sha),
      date: entry?.date,
      artifact: trim(entry?.artifact),
      claimLimit: trim(entry?.claimLimit),
    };
  });
  payload.claims = {
    allowed: uniqueSorted(document?.claims?.allowed),
    blocked: uniqueSorted(document?.claims?.blocked),
  };
  return payload;
}

function pick(value, keys) {
  const result = {};
  for (const key of keys) result[key] = value?.[key];
  return result;
}

function trim(value) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeSha(value) {
  const normalized = trim(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
}

function uniqueSorted(values) {
  if (!Array.isArray(values)) return values;
  return [...new Set(values.map((value) => trim(value)).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function normalizeScores(scores) {
  return {
    sandbox: trim(scores?.sandbox),
    mugenLite: trim(scores?.mugenLite),
    mugenMvp: trim(scores?.mugenMvp),
    mugenFull: trim(scores?.mugenFull),
    ikemen: trim(scores?.ikemen),
    studio: trim(scores?.studio),
  };
}

function normalizeSelectorCursor(entry) {
  return {
    sha: normalizeSha(entry?.sha),
    artifact: trim(entry?.artifact),
    claimLimit: trim(entry?.claimLimit),
  };
}

function validateDigest(label, document, payload, errors) {
  if (document?.digest?.algorithm !== "sha-256") {
    errors.push(`${label} digest algorithm must be sha-256`);
    return;
  }
  if (!/^[0-9a-f]{64}$/i.test(String(document.digest.value || ""))) {
    errors.push(`${label} digest value is invalid`);
    return;
  }
  const expected = digest(payload);
  if (document.digest.value.toLowerCase() !== expected) {
    errors.push(`${label} digest mismatch`);
  }
}

function cursorMap(document, errors) {
  if (!Array.isArray(document?.cursors)) {
    errors.push("roadmap cursor entries must be an array");
    return new Map();
  }
  const entries = new Map();
  for (const entry of document.cursors) {
    if (!entry || typeof entry.kind !== "string") {
      errors.push("roadmap cursor entry kind is invalid");
      continue;
    }
    if (entries.has(entry.kind)) errors.push(`roadmap cursor kind ${entry.kind} is duplicated`);
    entries.set(entry.kind, entry);
  }
  for (const kind of CURSOR_KINDS) {
    if (!entries.has(kind)) errors.push(`roadmap cursor kind ${kind} is missing`);
  }
  return entries;
}

function sameJson(left, right) {
  return stableStringify(left) === stableStringify(right);
}

function evaluateFreshness(cursor, observedHeadSha, now, maxAgeMs) {
  const reasons = [];
  const entries = new Map((cursor.cursors || []).map((entry) => [entry.kind, entry]));
  const head = entries.get("head");
  const global = entries.get("global");
  const observed = String(observedHeadSha || "").trim().toLowerCase();
  const limit = maxAgeMs ?? 24 * 60 * 60 * 1000;
  const nowMs = new Date(now).getTime();

  if (!head) reasons.push("head cursor is missing");
  else if (String(head.sha).trim().toLowerCase() !== observed) {
    reasons.push(`head cursor sha ${head.sha} does not match observed ${observed}`);
  }

  addAgeReason(reasons, "document generatedAt", cursor.generatedAt, nowMs, limit);
  if (head) addAgeReason(reasons, "head cursor date", head.date, nowMs, limit);
  if (global) addAgeReason(reasons, "global cursor date", global.date, nowMs, limit);

  if (reasons.some((reason) => reason.includes("does not match") || reason.includes("missing"))) {
    return { status: "mismatch", reasons };
  }
  return reasons.length ? { status: "stale", reasons } : { status: "current", reasons: [] };
}

function addAgeReason(reasons, label, value, nowMs, maxAgeMs) {
  const valueMs = Date.parse(value);
  if (!Number.isFinite(valueMs)) {
    reasons.push(`${label} is invalid`);
  } else if (!Number.isFinite(nowMs)) {
    reasons.push("audit time is invalid");
  } else if (nowMs - valueMs > maxAgeMs) {
    reasons.push(`${label} exceeds max age`);
  }
}

function auditControlDocuments({ selector, cursor, source, observedHeadSha, now, maxAgeMs }) {
  const integrityErrors = [];
  const agreementErrors = [];

  if (selector?.schemaVersion !== SELECTOR_SCHEMA) integrityErrors.push("authority selector schema is unsupported");
  if (cursor?.schemaVersion !== CURSOR_SCHEMA) integrityErrors.push("roadmap cursor schema is unsupported");
  if (source?.schema !== SOURCE_SCHEMA) integrityErrors.push("control source schema is unsupported");
  if (!Array.isArray(selector?.nextQueue)) integrityErrors.push("authority selector nextQueue must be an array");
  for (const key of SELECTOR_CURSOR_KEYS) {
    if (!selector?.cursors?.[key]) integrityErrors.push(`authority selector cursor ${key} is missing`);
  }
  const entries = cursorMap(cursor, integrityErrors);
  validateDigest("authority selector", selector, selectorPayload(selector), integrityErrors);
  validateDigest("roadmap cursor", cursor, cursorPayload(cursor), integrityErrors);

  if (!sameJson(selector?.scores, cursor?.scores) || !sameJson(selector?.scores, source?.scores)) {
    agreementErrors.push("scores disagree between selector, cursor, and control source");
  }
  if (selector?.closedThrough !== source?.closedThrough) {
    agreementErrors.push("closedThrough disagrees with control source");
  }
  if (!sameJson(selector?.nextQueue, source?.nextQueue)) {
    agreementErrors.push("nextQueue disagrees with control source");
  }
  for (const key of SELECTOR_CURSOR_KEYS) {
    if (selector?.cursors?.[key]?.sha !== source?.cursors?.[key]?.sha) {
      agreementErrors.push(`selector cursor ${key} disagrees with control source`);
    }
  }
  const sourceCursorKeys = {
    head: "head",
    formal: "formal",
    focal: "focal",
    global: "global",
    visual: "visual",
    product: "product",
    source: "sourceNormative",
  };
  for (const [kind, sourceKey] of Object.entries(sourceCursorKeys)) {
    if (entries.get(kind)?.sha !== source?.cursors?.[sourceKey]?.sha) {
      agreementErrors.push(`roadmap cursor ${kind} disagrees with control source`);
    }
  }
  for (const kind of ["formal", "focal", "global", "visual", "product"]) {
    if (entries.get(kind)?.sha !== selector?.cursors?.[kind]?.sha) {
      agreementErrors.push(`selector and roadmap cursor disagree at ${kind}`);
    }
  }
  if (!cursor?.claims?.allowed?.includes(`control-source closedThrough=${source?.closedThrough}`)) {
    agreementErrors.push("roadmap cursor does not mirror control-source closedThrough");
  }
  const queueHead = source?.nextQueue?.[0] || "empty";
  if (!cursor?.claims?.allowed?.includes(`nextQueueHead=${queueHead}`)) {
    agreementErrors.push("roadmap cursor does not mirror control-source nextQueue head");
  }

  const freshness = evaluateFreshness(cursor || {}, observedHeadSha, now, maxAgeMs);
  const integrityPassed = integrityErrors.length === 0 && agreementErrors.length === 0;
  return {
    integrityPassed,
    integrityErrors,
    agreementErrors,
    freshness,
    promotionReady: integrityPassed && freshness.status === "current",
  };
}

module.exports = {
  auditControlDocuments,
  cursorPayload,
  digest,
  evaluateFreshness,
  selectorPayload,
  stableStringify,
};

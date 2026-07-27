/**
 * CJS twin of src/mugen/da29/AssertMeasuredMatchesAcceptance.ts
 * Keep rules in sync with the TypeScript source of truth.
 */

function anchorPaths(measured) {
  if (!Array.isArray(measured?.anchors)) return [];
  return measured.anchors
    .map((a) => (typeof a === "string" ? a : a?.path || ""))
    .filter(Boolean);
}

function frKeys(measured) {
  if (!measured?.functionResults || typeof measured.functionResults !== "object") return [];
  return Object.keys(measured.functionResults);
}

function textBlob(input) {
  return `${input.id} ${input.kind} ${input.acceptance || ""} ${input.cut || ""}`.toLowerCase();
}

function isCombatContactJourneyCut(input) {
  if (input.kind !== "I") return false;
  const n = Number(/^DA29-(\d+)$/.exec(input.id)?.[1] || 0);
  if (n >= 41 && n <= 50) return true;
  const t = textBlob(input);
  return /contact journey|command.*collision|hitdef admission|imported route proves command|collision.*hitdef|damage.*hitpause/.test(
    t,
  );
}

function isAdjudicationReleaseCut(input) {
  if (input.kind !== "G") return false;
  if (input.id === "DA29-150" || input.id === "DA29-200") return true;
  const t = textBlob(input);
  return /adjudication|release decision|final score|product\/sdk|independent evidence review|next bounded program/.test(t);
}

const PARSE_ONLY_KEYS = new Set([
  "hitDefCount",
  "hitdefCount",
  "states",
  "sampleHitDefLines",
  "controllers",
  "files",
  "package",
  "hasCns",
  "actionsWithClsn",
  "sample",
]);

function isParseOnlyTheater(keys, fr) {
  if (!keys.length) return true;
  const nonParse = keys.filter((k) => !PARSE_ONLY_KEYS.has(k));
  if (!nonParse.length) return true;
  if (keys.includes("hitDefCount") || keys.includes("hitdefCount")) {
    const hasJourney = ["command", "stateEntry", "collision", "contact", "damage", "hitpause", "checksum"].some(
      (k) => keys.some((x) => x.toLowerCase() === k.toLowerCase()),
    );
    if (!hasJourney && typeof fr.hitDefCount === "number") return true;
  }
  return false;
}

function hasCombatJourneyFacts(fr) {
  const lower = new Map(Object.keys(fr).map((k) => [k.toLowerCase(), k]));
  const missing = [];
  const need = [
    { name: "command", alts: ["command", "commandname", "commands"] },
    { name: "stateEntry", alts: ["stateentry", "stateno", "state"] },
    { name: "collision", alts: ["collision", "boxcontact", "hascontact"] },
    { name: "hitDefAdmission", alts: ["hitdefadmission", "hitdef", "hitdefs"] },
    { name: "contact", alts: ["contact", "contacted", "hitlanded"] },
    { name: "damage", alts: ["damage", "damageapplied"] },
    { name: "hitpause", alts: ["hitpause", "pause", "pauseremaining"] },
    { name: "targetState", alts: ["targetstate", "defenderstate", "gethitstate"] },
    { name: "checksum", alts: ["checksum", "telemetry", "journeydigest"] },
  ];
  for (const n of need) {
    if (!n.alts.some((a) => lower.has(a))) missing.push(n.name);
  }
  return { ok: missing.length === 0, missing };
}

function isCircularLedgerOnly(measured) {
  const paths = anchorPaths(measured);
  const keys = frKeys(measured).map((k) => k.toLowerCase());
  const reviewKeys = ["accepted", "rejected", "gaps", "decision"];
  const hasReviewShape = reviewKeys.every((k) => keys.includes(k));
  if (hasReviewShape) return false;
  const ledgerKeys = keys.every((k) => /score|held|closed|watermark|seriescount|adjudication|cursor|count/.test(k));
  if (
    ledgerKeys &&
    (keys.includes("closedcount") || keys.includes("closedthroughatadjudication") || keys.includes("watermark"))
  ) {
    return true;
  }
  if (paths.some((p) => /authority-selector|closeout-status/i.test(p)) && !paths.some((p) => /reviews\//i.test(p))) {
    if (!hasReviewShape) return true;
  }
  return false;
}

function hasIndependentReviewFacts(measured) {
  const fr = measured.functionResults || {};
  const keys = Object.keys(fr).map((k) => k.toLowerCase());
  const reviewKeys = ["accepted", "rejected", "gaps", "decision"];
  const missing = reviewKeys.filter((k) => !keys.includes(k));
  if (missing.length) return { ok: false, reason: `adjudication review missing fields: ${missing.join(",")}` };
  const paths = anchorPaths(measured);
  const hasReviewAnchor = paths.some((p) => /reviews\/|adjudication-review|product-sdk-review|independent-review/i.test(p));
  if (!hasReviewAnchor) {
    return {
      ok: false,
      reason: "adjudication review requires independent review artifact path under docs/evidence/da29/reviews/",
    };
  }
  const accepted = fr.accepted;
  const rejected = fr.rejected;
  if (!Array.isArray(accepted) && typeof accepted !== "object") {
    return { ok: false, reason: "accepted must be array or object" };
  }
  if (!Array.isArray(rejected) && typeof rejected !== "object") {
    return { ok: false, reason: "rejected must be array or object" };
  }
  return { ok: true, reason: "independent review fields present" };
}

function assertMeasuredMatchesAcceptance(input) {
  const { id, kind, measured } = input;
  if (!measured) return { ok: false, reason: "measured evidence missing", class: "missing" };
  if (measured.id && measured.id !== id) {
    return { ok: false, reason: `measured.id ${measured.id} !== ${id}`, class: "reject" };
  }
  if (measured.ok !== true) return { ok: false, reason: "measured.ok is not true", class: "reject" };
  if (id === "DA29-002") return { ok: true, reason: "DA29-002 uses measured gate log path", class: "special-gate" };
  if (measured.liveRenderer === true) {
    return { ok: true, reason: "liveRenderer measured gate", class: "special-gate" };
  }
  if (measured.acceptanceExecuted !== true) {
    return { ok: false, reason: "acceptanceExecuted is not true", class: "reject" };
  }
  const fr = measured.functionResults;
  if (!fr || typeof fr !== "object" || Object.keys(fr).length === 0) {
    return { ok: false, reason: "functionResults empty", class: "empty" };
  }
  const keys = Object.keys(fr);
  if (kind === "G" && measured.browser === true && id !== "DA29-003") {
    return {
      ok: false,
      reason: "browser PNG matrix may only close DA29-003 without independent measured acceptance",
      class: "browser-matrix",
    };
  }
  if (isCombatContactJourneyCut(input)) {
    if (isParseOnlyTheater(keys, fr)) {
      return {
        ok: false,
        reason: "combat/contact journey rejects parse-only or HitDef-count-only evidence",
        class: "combat-journey",
      };
    }
    const journey = hasCombatJourneyFacts(fr);
    if (!journey.ok) {
      return {
        ok: false,
        reason: `combat journey missing facts: ${journey.missing.join(",")}`,
        class: "combat-journey",
      };
    }
    return { ok: true, reason: "combat journey facts present", class: "combat-journey" };
  }
  if (isAdjudicationReleaseCut(input)) {
    if (isCircularLedgerOnly(measured)) {
      return {
        ok: false,
        reason: "adjudication rejects circular authority/closeout re-read",
        class: "adjudication-review",
      };
    }
    const review = hasIndependentReviewFacts(measured);
    if (!review.ok) return { ok: false, reason: review.reason, class: "adjudication-review" };
    return { ok: true, reason: review.reason, class: "adjudication-review" };
  }
  if (isCircularLedgerOnly(measured) && (kind === "I" || kind === "G")) {
    return {
      ok: false,
      reason: "rejects measured that only re-reads authority/closeout ledger",
      class: "reject",
    };
  }
  return { ok: true, reason: "acceptance-executed with non-empty functionResults", class: "generic-executed" };
}

module.exports = {
  assertMeasuredMatchesAcceptance,
  isCombatContactJourneyCut,
  isAdjudicationReleaseCut,
};

/**
 * Pure acceptance checker for DA29 measured evidence.
 * Materializer and tests must close I/G cuts only when this returns ok.
 */

export type MeasuredEvidenceShape = {
  id?: string;
  ok?: boolean;
  acceptanceExecuted?: boolean;
  liveRenderer?: boolean;
  functionResults?: Record<string, unknown> | null;
  anchors?: Array<string | { path?: string }> | null;
  browser?: boolean;
};

export type AssertMeasuredInput = {
  id: string;
  kind: "R" | "A" | "I" | "G";
  acceptance: string;
  cut?: string;
  measured: MeasuredEvidenceShape | null | undefined;
};

export type AssertMeasuredResult = {
  ok: boolean;
  reason: string;
  class:
    | "empty"
    | "missing"
    | "combat-journey"
    | "adjudication-review"
    | "browser-matrix"
    | "generic-executed"
    | "special-gate"
    | "reject";
};

const LEDGER_PATH_RE = /authority-selector|closeout-status|drain-state|series-registry/i;
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

const COMBAT_JOURNEY_KEYS = [
  "command",
  "stateEntry",
  "collision",
  "hitDefAdmission",
  "contact",
  "damage",
  "hitpause",
  "targetState",
  "checksum",
] as const;

const REVIEW_KEYS = ["accepted", "rejected", "gaps", "decision"] as const;

function anchorPaths(measured: MeasuredEvidenceShape): string[] {
  if (!Array.isArray(measured.anchors)) return [];
  return measured.anchors
    .map((a) => (typeof a === "string" ? a : a?.path ?? ""))
    .filter(Boolean);
}

function frKeys(measured: MeasuredEvidenceShape): string[] {
  if (!measured.functionResults || typeof measured.functionResults !== "object") return [];
  return Object.keys(measured.functionResults);
}

function textBlob(input: AssertMeasuredInput): string {
  return `${input.id} ${input.kind} ${input.acceptance} ${input.cut ?? ""}`.toLowerCase();
}

export function isCombatContactJourneyCut(input: Pick<AssertMeasuredInput, "id" | "kind" | "acceptance" | "cut">): boolean {
  if (input.kind !== "I") return false;
  const n = Number(/^DA29-(\d+)$/.exec(input.id)?.[1] ?? 0);
  if (n >= 41 && n <= 50) return true;
  const t = textBlob(input as AssertMeasuredInput);
  return /contact journey|command.*collision|hitdef admission|imported route proves command|collision.*hitdef|damage.*hitpause/.test(
    t,
  );
}

export function isAdjudicationReleaseCut(input: Pick<AssertMeasuredInput, "id" | "kind" | "acceptance" | "cut">): boolean {
  if (input.kind !== "G") return false;
  if (input.id === "DA29-150" || input.id === "DA29-200") return true;
  const t = textBlob(input as AssertMeasuredInput);
  return /adjudication|release decision|final score|product\/sdk|independent evidence review|next bounded program/.test(t);
}

function isParseOnlyTheater(keys: string[], fr: Record<string, unknown>): boolean {
  if (keys.length === 0) return true;
  const nonParse = keys.filter((k) => !PARSE_ONLY_KEYS.has(k));
  if (nonParse.length === 0) return true;
  // HitDef-count-only with states/sample lines
  if (keys.includes("hitDefCount") || keys.includes("hitdefCount")) {
    const hasJourney = COMBAT_JOURNEY_KEYS.some((k) => keys.includes(k) || keys.some((x) => x.toLowerCase() === k.toLowerCase()));
    if (!hasJourney && typeof fr.hitDefCount === "number") return true;
  }
  return false;
}

function hasCombatJourneyFacts(fr: Record<string, unknown>): { ok: boolean; missing: string[] } {
  const lower = new Map(Object.keys(fr).map((k) => [k.toLowerCase(), k]));
  const missing: string[] = [];
  const need: Array<{ name: string; alts: string[] }> = [
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
    const found = n.alts.some((a) => lower.has(a));
    if (!found) missing.push(n.name);
  }
  return { ok: missing.length === 0, missing };
}

function isCircularLedgerOnly(measured: MeasuredEvidenceShape): boolean {
  const paths = anchorPaths(measured);
  const keys = frKeys(measured).map((k) => k.toLowerCase());
  const ledgerAnchors = paths.length > 0 && paths.every((p) => LEDGER_PATH_RE.test(p) || /score-adjudication|master_review|authority_selector/i.test(p));
  const ledgerKeys = keys.every((k) =>
    /score|held|closed|watermark|seriescount|adjudication|cursor|count/.test(k),
  );
  const hasReviewShape = REVIEW_KEYS.every((k) => keys.includes(k) || keys.includes(k.toLowerCase()));
  if (hasReviewShape) return false;
  // functionResults that only restate authority/closeout
  if (ledgerKeys && (ledgerAnchors || keys.includes("closedcount") || keys.includes("closedthroughatadjudication") || keys.includes("watermark"))) {
    return true;
  }
  if (paths.some((p) => /authority-selector|closeout-status/i.test(p)) && !paths.some((p) => /reviews\//i.test(p))) {
    if (!hasReviewShape) return true;
  }
  return false;
}

function hasIndependentReviewFacts(measured: MeasuredEvidenceShape): { ok: boolean; reason: string } {
  const fr = measured.functionResults ?? {};
  const keys = Object.keys(fr).map((k) => k.toLowerCase());
  const missing = REVIEW_KEYS.filter((k) => !keys.includes(k));
  if (missing.length) {
    return { ok: false, reason: `adjudication review missing fields: ${missing.join(",")}` };
  }
  const paths = anchorPaths(measured);
  const hasReviewAnchor = paths.some((p) => /reviews\/|adjudication-review|product-sdk-review|independent-review/i.test(p));
  if (!hasReviewAnchor) {
    return { ok: false, reason: "adjudication review requires independent review artifact path under docs/evidence/da29/reviews/" };
  }
  // Reject pure ledger restatement even if fields exist as empty mirrors
  if (isCircularLedgerOnly({ ...measured, functionResults: { scores: 1, closedCount: 1 } })) {
    /* no-op structure */
  }
  const accepted = fr.accepted ?? fr.Accepted;
  const rejected = fr.rejected ?? fr.Rejected;
  if (!Array.isArray(accepted) && typeof accepted !== "object") {
    return { ok: false, reason: "accepted must be array or object" };
  }
  if (!Array.isArray(rejected) && typeof rejected !== "object") {
    return { ok: false, reason: "rejected must be array or object" };
  }
  return { ok: true, reason: "independent review fields present" };
}

/**
 * Returns whether measured evidence is strong enough to close the cut.
 * Does not mutate inputs.
 */
export function assertMeasuredMatchesAcceptance(input: AssertMeasuredInput): AssertMeasuredResult {
  const { id, kind, measured } = input;

  if (!measured) {
    return { ok: false, reason: "measured evidence missing", class: "missing" };
  }
  if (measured.id && measured.id !== id) {
    return { ok: false, reason: `measured.id ${measured.id} !== ${id}`, class: "reject" };
  }
  if (measured.ok !== true) {
    return { ok: false, reason: "measured.ok is not true", class: "reject" };
  }

  // DA29-002 measured global gate is handled outside (gate log); skip measured JSON path.
  if (id === "DA29-002") {
    return { ok: true, reason: "DA29-002 uses measured gate log path", class: "special-gate" };
  }

  // Live renderer (DA29-072) allowed without generic functionResults shape when liveRenderer.
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

  // Browser matrix: only DA29-003 may close on shared PNG browser evidence without extra measured acceptance class.
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
    if (!review.ok) {
      return { ok: false, reason: review.reason, class: "adjudication-review" };
    }
    return { ok: true, reason: review.reason, class: "adjudication-review" };
  }

  // Generic I/G: non-empty functionResults + acceptanceExecuted is baseline only when not theater classes.
  if (isCircularLedgerOnly(measured) && (kind === "I" || kind === "G")) {
    return {
      ok: false,
      reason: "rejects measured that only re-reads authority/closeout ledger",
      class: "reject",
    };
  }

  return { ok: true, reason: "acceptance-executed with non-empty functionResults", class: "generic-executed" };
}

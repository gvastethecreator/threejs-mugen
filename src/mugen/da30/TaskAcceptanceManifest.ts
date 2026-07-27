/**
 * DA30-011/012: TaskAcceptanceManifest/v1 schema + validation.
 */

export const TASK_ACCEPTANCE_MANIFEST_SCHEMA = "TaskAcceptanceManifest/v1" as const;

export type EvidenceKind =
  | "command-gate"
  | "browser-route"
  | "unit-observation"
  | "schema-check"
  | "review-adjudication"
  | "static-inventory";

export type AcceptanceClause = {
  id: string;
  evidenceKind: EvidenceKind;
  producer: string;
  assertion: string;
  expectedFailure: string;
  revisionPolicy: "exact-sha" | "same-series" | "any-fresh";
  environment: string;
  claim: string;
};

export type TaskAcceptanceManifest = {
  schema: typeof TASK_ACCEPTANCE_MANIFEST_SCHEMA;
  taskId: string;
  claimCeiling: string;
  clauses: AcceptanceClause[];
};

const KNOWN_KINDS = new Set<EvidenceKind>([
  "command-gate",
  "browser-route",
  "unit-observation",
  "schema-check",
  "review-adjudication",
  "static-inventory",
]);

export type ManifestValidationResult = { ok: boolean; errors: string[] };

export function validateTaskAcceptanceManifest(doc: unknown): ManifestValidationResult {
  const errors: string[] = [];
  if (!doc || typeof doc !== "object") return { ok: false, errors: ["root must be object"] };
  const m = doc as Record<string, unknown>;
  if (m.schema !== TASK_ACCEPTANCE_MANIFEST_SCHEMA) errors.push("unsupported schema");
  if (typeof m.taskId !== "string" || !m.taskId.trim()) errors.push("missing taskId");
  if (typeof m.claimCeiling !== "string" || !m.claimCeiling.trim()) errors.push("missing claimCeiling");
  if (!Array.isArray(m.clauses) || m.clauses.length === 0) errors.push("missing clauses");
  const ids = new Set<string>();
  for (const raw of (m.clauses as unknown[]) || []) {
    if (!raw || typeof raw !== "object") {
      errors.push("clause not object");
      continue;
    }
    const c = raw as Record<string, unknown>;
    if (typeof c.id !== "string" || !c.id.trim()) errors.push("clause missing id");
    else if (ids.has(c.id)) errors.push(`duplicate clause id ${c.id}`);
    else ids.add(c.id);
    if (!KNOWN_KINDS.has(c.evidenceKind as EvidenceKind)) errors.push(`unknown evidenceKind ${String(c.evidenceKind)}`);
    if (typeof c.producer !== "string" || !c.producer.trim()) errors.push(`${c.id}: empty producer`);
    if (typeof c.assertion !== "string" || !c.assertion.trim()) errors.push(`${c.id}: empty assertion`);
    if (typeof c.expectedFailure !== "string" || !c.expectedFailure.trim()) {
      errors.push(`${c.id}: absent negative/expectedFailure`);
    }
    if (!["exact-sha", "same-series", "any-fresh"].includes(String(c.revisionPolicy))) {
      errors.push(`${c.id}: bad revisionPolicy`);
    }
    if (typeof c.environment !== "string" || !c.environment.trim()) errors.push(`${c.id}: empty environment`);
    if (typeof c.claim !== "string" || !c.claim.trim()) errors.push(`${c.id}: empty claim`);
    // Claim widening: claim must not exceed ceiling keywords carelessly — if claim includes "score" but ceiling blocks it
    const ceiling = String(m.claimCeiling || "").toLowerCase();
    const claim = String(c.claim || "").toLowerCase();
    if (/score\s+movement|raise scores/.test(claim) && /held|no score|inventory only|design only/.test(ceiling)) {
      errors.push(`${c.id}: claim widening beyond ceiling`);
    }
  }
  return { ok: errors.length === 0, errors };
}

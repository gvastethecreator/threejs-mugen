import {
  PROJECT_RELEASE_DECISION_SCHEMA,
  type ProjectReleaseBlockReason,
  type ProjectReleaseDecision,
  type ProjectReleaseDecisionDocument,
  type ProjectReleaseEvidence,
  type ProjectReleaseEvidenceKind,
  type ProjectReleaseEvidenceStatus,
  type ProjectReleaseFreshness,
  type ProjectReleaseNextAction,
  type ProjectReleaseNextActionKind,
  type ProjectReleaseRevisionState,
} from "./ProjectReleaseDecision";

export const STUDIO_SEMANTIC_EXPORT_SCHEMA = "mugen-web-sandbox/studio-semantic-export/v0" as const;
export const STUDIO_SEMANTIC_EXPORT_PRODUCER = {
  id: "mugen-web-sandbox/studio-semantic-export",
  version: "0.1.0",
  revision: "studio-semantic-export/v0",
} as const;

export type StudioSemanticExportEvidence = {
  id: string;
  label: string;
  kind: ProjectReleaseEvidenceKind;
  status: ProjectReleaseEvidenceStatus;
  freshness: ProjectReleaseFreshness;
  revisionState: ProjectReleaseRevisionState;
  requiredForRelease: boolean;
  evidenceIds: string[];
};

export type StudioSemanticExportBlocker = {
  id: string;
  reason: ProjectReleaseBlockReason;
  evidenceId?: string;
  detail: string;
  nextAction: ProjectReleaseNextAction;
};

export type StudioSemanticExportDecision = {
  intent: ProjectReleaseDecision["intent"];
  status: ProjectReleaseDecision["status"];
  canExport: boolean;
  canRelease: boolean;
  blockerIds: string[];
  blockers: StudioSemanticExportBlocker[];
  warnings: string[];
  nextAction: ProjectReleaseNextAction;
};

export type StudioSemanticExportDocument = {
  schemaVersion: typeof STUDIO_SEMANTIC_EXPORT_SCHEMA;
  id: string;
  generatedAt: string;
  project: ProjectReleaseDecisionDocument["project"];
  producer: typeof STUDIO_SEMANTIC_EXPORT_PRODUCER;
  sourceDecision: {
    schemaVersion: typeof PROJECT_RELEASE_DECISION_SCHEMA;
    id: string;
    semanticDigest: string;
  };
  evidence: StudioSemanticExportEvidence[];
  decisions: {
    diagnostic: StudioSemanticExportDecision;
    release: StudioSemanticExportDecision;
  };
  summary: {
    evidenceCount: number;
    blockerCount: number;
    warningCount: number;
    diagnosticExportable: boolean;
    releaseable: boolean;
  };
  semanticDigest: string;
  digest: string;
};

export type StudioSemanticExportParseResult = {
  document?: StudioSemanticExportDocument;
  diagnostics: string[];
};

export function createStudioSemanticExportDocument(input: {
  generatedAt: string;
  decision: ProjectReleaseDecisionDocument;
}): StudioSemanticExportDocument {
  const evidence = input.decision.decisions.release.evidence.map(toSemanticEvidence);
  const decisions = {
    diagnostic: toSemanticDecision(input.decision.decisions.diagnostic),
    release: toSemanticDecision(input.decision.decisions.release),
  };
  const summary = {
    evidenceCount: evidence.length,
    blockerCount: input.decision.summary.blockerCount,
    warningCount: input.decision.summary.warningCount,
    diagnosticExportable: input.decision.decisions.diagnostic.canExport,
    releaseable: input.decision.decisions.release.canRelease,
  };
  const id = `studio-semantic-export:${input.decision.id}`;
  const semanticPayload = {
    schemaVersion: STUDIO_SEMANTIC_EXPORT_SCHEMA,
    id,
    project: cloneProject(input.decision.project),
    producer: STUDIO_SEMANTIC_EXPORT_PRODUCER,
    sourceDecision: {
      schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
      id: input.decision.id,
      semanticDigest: input.decision.semanticDigest,
    },
    evidence,
    decisions,
    summary,
  } satisfies StudioSemanticExportSemanticPayload;
  const semanticDigest = hashStableJson(semanticPayload);
  const payload = {
    ...semanticPayload,
    generatedAt: input.generatedAt,
    semanticDigest,
  };
  return { ...payload, digest: hashStableJson(payload) };
}

export function parseStudioSemanticExportDocument(value: unknown): StudioSemanticExportParseResult {
  const diagnostics: string[] = [];
  if (!isRecord(value)) return { diagnostics: ["Studio semantic export root must be an object"] };
  if (value.schemaVersion !== STUDIO_SEMANTIC_EXPORT_SCHEMA) diagnostics.push("Studio semantic export has an unsupported schema");
  if (!nonEmptyString(value.id)) diagnostics.push("Studio semantic export id is missing");
  if (!isIsoDate(value.generatedAt)) diagnostics.push("Studio semantic export generatedAt is invalid");
  const project = parseProject(value.project, diagnostics);
  const producer = parseProducer(value.producer, diagnostics);
  const sourceDecision = parseSourceDecision(value.sourceDecision, diagnostics);
  const evidence = parseEvidence(value.evidence, diagnostics);
  const decisions = parseDecisions(value.decisions, diagnostics);
  const summary = parseSummary(value.summary, diagnostics);
  if (!nonEmptyString(value.semanticDigest)) diagnostics.push("Studio semantic export semanticDigest is missing");
  if (!nonEmptyString(value.digest)) diagnostics.push("Studio semantic export digest is missing");
  if (diagnostics.length || !project || !producer || !sourceDecision || !evidence || !decisions || !summary) return { diagnostics };

  const candidate = {
    schemaVersion: STUDIO_SEMANTIC_EXPORT_SCHEMA,
    id: String(value.id),
    project,
    producer,
    sourceDecision,
    evidence,
    decisions,
    summary,
  } satisfies StudioSemanticExportSemanticPayload;
  if (String(value.semanticDigest) !== hashStableJson(candidate)) diagnostics.push("Studio semantic export semanticDigest mismatch");
  const payload = { ...candidate, generatedAt: String(value.generatedAt), semanticDigest: String(value.semanticDigest) };
  if (String(value.digest) !== hashStableJson(payload)) diagnostics.push("Studio semantic export digest mismatch");
  if (diagnostics.length) return { diagnostics };
  return {
    diagnostics: [],
    document: {
      ...payload,
      digest: String(value.digest),
    },
  };
}

export function canonicalizeStudioSemanticExportDocument(value: StudioSemanticExportDocument): string {
  return stableStringify(toSemanticPayload(value));
}

type StudioSemanticExportSemanticPayload = {
  schemaVersion: typeof STUDIO_SEMANTIC_EXPORT_SCHEMA;
  id: string;
  project: ProjectReleaseDecisionDocument["project"];
  producer: typeof STUDIO_SEMANTIC_EXPORT_PRODUCER;
  sourceDecision: StudioSemanticExportDocument["sourceDecision"];
  evidence: StudioSemanticExportEvidence[];
  decisions: StudioSemanticExportDocument["decisions"];
  summary: StudioSemanticExportDocument["summary"];
};

function toSemanticPayload(value: StudioSemanticExportDocument): StudioSemanticExportSemanticPayload {
  return {
    schemaVersion: value.schemaVersion,
    id: value.id,
    project: value.project,
    producer: value.producer,
    sourceDecision: value.sourceDecision,
    evidence: value.evidence,
    decisions: value.decisions,
    summary: value.summary,
  };
}

function toSemanticEvidence(value: ProjectReleaseEvidence): StudioSemanticExportEvidence {
  return {
    id: value.id,
    label: value.label,
    kind: value.kind,
    status: value.status,
    freshness: value.freshness,
    revisionState: value.revisionState,
    requiredForRelease: value.requiredForRelease,
    evidenceIds: [...value.evidenceIds],
  };
}

function toSemanticDecision(value: ProjectReleaseDecision): StudioSemanticExportDecision {
  return {
    intent: value.intent,
    status: value.status,
    canExport: value.canExport,
    canRelease: value.canRelease,
    blockerIds: value.blockers.map((blocker) => blocker.id),
    blockers: value.blockers.map((blocker) => ({
      id: blocker.id,
      reason: blocker.reason,
      ...(blocker.evidenceId ? { evidenceId: blocker.evidenceId } : {}),
      detail: blocker.detail,
      nextAction: cloneNextAction(blocker.nextAction),
    })),
    warnings: [...value.warnings],
    nextAction: cloneNextAction(value.nextAction),
  };
}

function parseProject(value: unknown, diagnostics: string[]): ProjectReleaseDecisionDocument["project"] | undefined {
  if (!isRecord(value) || !nonEmptyString(value.id) || !isProjectScope(value.scope) || typeof value.dirty !== "boolean" || typeof value.conflict !== "boolean") {
    diagnostics.push("Studio semantic export project is invalid");
    return undefined;
  }
  if (value.revision !== undefined && !isPositiveSafeInteger(value.revision)) {
    diagnostics.push("Studio semantic export project revision is invalid");
    return undefined;
  }
  return {
    id: String(value.id),
    ...(value.revision !== undefined ? { revision: Number(value.revision) } : {}),
    scope: value.scope,
    dirty: value.dirty,
    conflict: value.conflict,
  };
}

function parseProducer(value: unknown, diagnostics: string[]): typeof STUDIO_SEMANTIC_EXPORT_PRODUCER | undefined {
  if (!isRecord(value) || value.id !== STUDIO_SEMANTIC_EXPORT_PRODUCER.id || value.version !== STUDIO_SEMANTIC_EXPORT_PRODUCER.version || value.revision !== STUDIO_SEMANTIC_EXPORT_PRODUCER.revision) {
    diagnostics.push("Studio semantic export producer is invalid");
    return undefined;
  }
  return STUDIO_SEMANTIC_EXPORT_PRODUCER;
}

function parseSourceDecision(value: unknown, diagnostics: string[]): StudioSemanticExportDocument["sourceDecision"] | undefined {
  if (!isRecord(value) || value.schemaVersion !== PROJECT_RELEASE_DECISION_SCHEMA || !nonEmptyString(value.id) || !nonEmptyString(value.semanticDigest)) {
    diagnostics.push("Studio semantic export source decision is invalid");
    return undefined;
  }
  return {
    schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
    id: String(value.id),
    semanticDigest: String(value.semanticDigest),
  };
}

function parseEvidence(value: unknown, diagnostics: string[]): StudioSemanticExportEvidence[] | undefined {
  if (!Array.isArray(value)) {
    diagnostics.push("Studio semantic export evidence must be an array");
    return undefined;
  }
  const ids = new Set<string>();
  const result = value.flatMap((item, index) => {
    const parsed = parseEvidenceItem(item, index, diagnostics);
    if (!parsed) return [];
    if (ids.has(parsed.id)) diagnostics.push(`Studio semantic export duplicate evidence id ${parsed.id}`);
    ids.add(parsed.id);
    return [parsed];
  });
  return result;
}

function parseEvidenceItem(value: unknown, index: number, diagnostics: string[]): StudioSemanticExportEvidence | undefined {
  if (!isRecord(value) || !nonEmptyString(value.id) || !nonEmptyString(value.label) || !isEvidenceKind(value.kind) || !isEvidenceStatus(value.status) || !isFreshness(value.freshness) || !isRevisionState(value.revisionState) || typeof value.requiredForRelease !== "boolean" || !isStringArray(value.evidenceIds)) {
    diagnostics.push(`Studio semantic export evidence ${index} is invalid`);
    return undefined;
  }
  return {
    id: String(value.id),
    label: String(value.label),
    kind: value.kind,
    status: value.status,
    freshness: value.freshness,
    revisionState: value.revisionState,
    requiredForRelease: value.requiredForRelease,
    evidenceIds: [...value.evidenceIds],
  };
}

function parseDecisions(value: unknown, diagnostics: string[]): StudioSemanticExportDocument["decisions"] | undefined {
  if (!isRecord(value)) {
    diagnostics.push("Studio semantic export decisions are missing");
    return undefined;
  }
  const diagnostic = parseDecision(value.diagnostic, "diagnostic", diagnostics);
  const release = parseDecision(value.release, "release", diagnostics);
  if (!diagnostic || !release) return undefined;
  return { diagnostic, release };
}

function parseDecision(value: unknown, intent: ProjectReleaseDecision["intent"], diagnostics: string[]): StudioSemanticExportDecision | undefined {
  if (!isRecord(value) || value.intent !== intent || !isDecisionStatus(value.status) || typeof value.canExport !== "boolean" || typeof value.canRelease !== "boolean" || !isStringArray(value.blockerIds) || !isStringArray(value.warnings)) {
    diagnostics.push(`Studio semantic export ${intent} decision is invalid`);
    return undefined;
  }
  const blockers = parseBlockers(value.blockers, intent, diagnostics);
  const nextAction = parseNextAction(value.nextAction, diagnostics);
  if (!blockers || !nextAction) return undefined;
  if (value.blockerIds.length !== blockers.length || value.blockerIds.some((id, index) => id !== blockers[index]?.id)) {
    diagnostics.push(`Studio semantic export ${intent} blockerIds do not match blockers`);
  }
  return {
    intent,
    status: value.status,
    canExport: value.canExport,
    canRelease: value.canRelease,
    blockerIds: [...value.blockerIds],
    blockers,
    warnings: [...value.warnings],
    nextAction,
  };
}

function parseBlockers(value: unknown, intent: string, diagnostics: string[]): StudioSemanticExportBlocker[] | undefined {
  if (!Array.isArray(value)) {
    diagnostics.push(`Studio semantic export ${intent} blockers must be an array`);
    return undefined;
  }
  return value.flatMap((item, index) => {
    if (!isRecord(item) || !nonEmptyString(item.id) || !isBlockReason(item.reason) || (item.evidenceId !== undefined && !nonEmptyString(item.evidenceId)) || !nonEmptyString(item.detail)) {
      diagnostics.push(`Studio semantic export ${intent} blocker ${index} is invalid`);
      return [];
    }
    const nextAction = parseNextAction(item.nextAction, diagnostics);
    if (!nextAction) return [];
    return [{
      id: String(item.id),
      reason: item.reason,
      ...(item.evidenceId !== undefined ? { evidenceId: String(item.evidenceId) } : {}),
      detail: String(item.detail),
      nextAction,
    }];
  });
}

function parseNextAction(value: unknown, diagnostics: string[]): ProjectReleaseNextAction | undefined {
  if (!isRecord(value) || !isNextActionKind(value.kind) || !nonEmptyString(value.label) || !nonEmptyString(value.targetId)) {
    diagnostics.push("Studio semantic export next action is invalid");
    return undefined;
  }
  return { kind: value.kind, label: String(value.label), targetId: String(value.targetId) };
}

function parseSummary(value: unknown, diagnostics: string[]): StudioSemanticExportDocument["summary"] | undefined {
  if (!isRecord(value) || !isNonNegativeSafeInteger(value.evidenceCount) || !isNonNegativeSafeInteger(value.blockerCount) || !isNonNegativeSafeInteger(value.warningCount) || typeof value.diagnosticExportable !== "boolean" || typeof value.releaseable !== "boolean") {
    diagnostics.push("Studio semantic export summary is invalid");
    return undefined;
  }
  return {
    evidenceCount: Number(value.evidenceCount),
    blockerCount: Number(value.blockerCount),
    warningCount: Number(value.warningCount),
    diagnosticExportable: value.diagnosticExportable,
    releaseable: value.releaseable,
  };
}

function cloneProject(value: ProjectReleaseDecisionDocument["project"]): ProjectReleaseDecisionDocument["project"] {
  return { ...value };
}

function cloneNextAction(value: ProjectReleaseNextAction): ProjectReleaseNextAction {
  return { ...value };
}

function isProjectScope(value: unknown): value is ProjectReleaseDecisionDocument["project"]["scope"] {
  return value === "saved" || value === "session";
}

function isEvidenceKind(value: unknown): value is ProjectReleaseEvidenceKind {
  return value === "project" || value === "runtime" || value === "gate" || value === "envelope" || value === "asset-policy" || value === "source-write" || value === "analysis";
}

function isEvidenceStatus(value: unknown): value is ProjectReleaseEvidenceStatus {
  return value === "passed" || value === "warn" || value === "failed" || value === "missing" || value === "stale" || value === "unknown" || value === "blocked";
}

function isFreshness(value: unknown): value is ProjectReleaseFreshness {
  return value === "current" || value === "stale" || value === "missing" || value === "unknown";
}

function isRevisionState(value: unknown): value is ProjectReleaseRevisionState {
  return value === "matched" || value === "mismatched" || value === "unknown" || value === "not-applicable";
}

function isDecisionStatus(value: unknown): value is ProjectReleaseDecision["status"] {
  return value === "ready" || value === "blocked";
}

function isBlockReason(value: unknown): value is ProjectReleaseBlockReason {
  return value === "project-revision-missing" || value === "project-dirty" || value === "project-conflict" || value === "evidence-missing" || value === "evidence-stale" || value === "evidence-failed" || value === "evidence-unknown" || value === "wrong-revision" || value === "revision-unknown" || value === "policy-blocked";
}

function isNextActionKind(value: unknown): value is ProjectReleaseNextActionKind {
  return value === "save-project" || value === "resolve-project-conflict" || value === "refresh-evidence" || value === "review-evidence" || value === "review-policy";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hashStableJson(value: unknown): string {
  let hash = 0x811c9dc5;
  for (const character of stableStringify(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().filter((key) => record[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

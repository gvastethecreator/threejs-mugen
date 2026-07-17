export const PROJECT_RELEASE_DECISION_SCHEMA = "mugen-web-sandbox/project-release-decision/v0" as const;

export const PROJECT_RELEASE_DECISION_PRODUCER = {
  id: "mugen-web-sandbox/studio-release-decision",
  version: "0.1.0",
  revision: "project-release-decision/v0",
} as const;

export type ProjectReleaseDecisionIntent = "diagnostic" | "release";
export type ProjectReleaseDecisionStatus = "ready" | "blocked";
export type ProjectReleaseEvidenceKind = "project" | "runtime" | "gate" | "envelope" | "asset-policy" | "source-write" | "analysis";
export type ProjectReleaseEvidenceStatus = "passed" | "warn" | "failed" | "missing" | "stale" | "unknown" | "blocked";
export type ProjectReleaseFreshness = "current" | "stale" | "missing" | "unknown";
export type ProjectReleaseRevisionState = "matched" | "mismatched" | "unknown" | "not-applicable";
export type ProjectReleaseBlockReason =
  | "project-revision-missing"
  | "project-dirty"
  | "project-conflict"
  | "evidence-missing"
  | "evidence-stale"
  | "evidence-failed"
  | "evidence-unknown"
  | "wrong-revision"
  | "revision-unknown"
  | "policy-blocked";
export type ProjectReleaseNextActionKind = "save-project" | "resolve-project-conflict" | "refresh-evidence" | "review-evidence" | "review-policy";

export type ProjectReleaseProject = {
  id: string;
  revision?: number;
  scope: "saved" | "session";
  dirty: boolean;
  conflict: boolean;
};

export type ProjectReleaseEvidence = {
  id: string;
  label: string;
  kind: ProjectReleaseEvidenceKind;
  status: ProjectReleaseEvidenceStatus;
  freshness: ProjectReleaseFreshness;
  revisionState: ProjectReleaseRevisionState;
  requiredForRelease: boolean;
  detail: string;
  evidenceIds: string[];
};

export type ProjectReleaseEvidenceInput = Omit<ProjectReleaseEvidence, "evidenceIds"> & { evidenceIds?: string[] };

export type ProjectReleaseNextAction = {
  kind: ProjectReleaseNextActionKind;
  label: string;
  targetId: string;
};

export type ProjectReleaseBlocker = {
  id: string;
  reason: ProjectReleaseBlockReason;
  evidenceId?: string;
  detail: string;
  nextAction: ProjectReleaseNextAction;
};

export type ProjectReleaseDecision = {
  schemaVersion: typeof PROJECT_RELEASE_DECISION_SCHEMA;
  id: string;
  intent: ProjectReleaseDecisionIntent;
  project: ProjectReleaseProject;
  status: ProjectReleaseDecisionStatus;
  canExport: boolean;
  canRelease: boolean;
  generatedAt: string;
  evidence: ProjectReleaseEvidence[];
  blockers: ProjectReleaseBlocker[];
  warnings: string[];
  nextAction: ProjectReleaseNextAction;
  semanticDigest: string;
};

export type ProjectReleaseDecisionDocument = {
  schemaVersion: typeof PROJECT_RELEASE_DECISION_SCHEMA;
  id: string;
  generatedAt: string;
  project: ProjectReleaseProject;
  producer: typeof PROJECT_RELEASE_DECISION_PRODUCER;
  decisions: {
    diagnostic: ProjectReleaseDecision;
    release: ProjectReleaseDecision;
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

export type ProjectReleaseDecisionParseResult = {
  document?: ProjectReleaseDecisionDocument;
  diagnostics: string[];
};

export function createProjectReleaseDecisionDocument(input: {
  generatedAt: string;
  project: ProjectReleaseProject;
  evidence: readonly ProjectReleaseEvidenceInput[];
}): ProjectReleaseDecisionDocument {
  const project = normalizeProject(input.project);
  const evidence = normalizeEvidence(input.evidence);
  const blockers = collectBlockers(project, evidence);
  const warnings = collectWarnings(evidence);
  const generatedAt = input.generatedAt;
  const id = `project-release-decision:${project.id}`;
  const diagnostic = createDecision({ id: `${id}:diagnostic`, intent: "diagnostic", project, evidence, blockers, warnings, generatedAt });
  const release = createDecision({ id: `${id}:release`, intent: "release", project, evidence, blockers, warnings, generatedAt });
  const summary = {
    evidenceCount: evidence.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    diagnosticExportable: diagnostic.canExport,
    releaseable: release.canRelease,
  };
  const semanticPayload = {
    schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
    id,
    project,
    producer: PROJECT_RELEASE_DECISION_PRODUCER,
    decisions: {
      diagnostic: decisionSemanticPayload(diagnostic),
      release: decisionSemanticPayload(release),
    },
    summary,
  };
  const semanticDigest = hashStableJson(semanticPayload);
  const payload = {
    schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
    id,
    generatedAt,
    project,
    producer: PROJECT_RELEASE_DECISION_PRODUCER,
    decisions: { diagnostic, release },
    summary,
    semanticDigest,
  };
  return { ...payload, digest: hashStableJson(payload) };
}

export function parseProjectReleaseDecisionDocument(value: unknown): ProjectReleaseDecisionParseResult {
  const diagnostics: string[] = [];
  if (!isRecord(value)) return { diagnostics: ["Project release decision root must be an object"] };
  if (value.schemaVersion !== PROJECT_RELEASE_DECISION_SCHEMA) diagnostics.push("Project release decision has an unsupported schema");
  if (!nonEmptyString(value.id)) diagnostics.push("Project release decision id is missing");
  if (!isIsoDate(value.generatedAt)) diagnostics.push("Project release decision generatedAt is invalid");
  const project = parseProject(value.project, diagnostics);
  const producer = parseProducer(value.producer, diagnostics);
  const decisions = parseDecisions(value.decisions, diagnostics);
  const summary = parseSummary(value.summary, diagnostics);
  if (!nonEmptyString(value.semanticDigest)) diagnostics.push("Project release decision semanticDigest is missing");
  if (!nonEmptyString(value.digest)) diagnostics.push("Project release decision digest is missing");
  if (diagnostics.length || !project || !producer || !decisions || !summary) return { diagnostics };

  const candidate = {
    schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
    id: String(value.id),
    project,
    producer,
    decisions,
    summary,
  };
  if (String(value.semanticDigest) !== hashStableJson(documentSemanticPayload(candidate))) {
    diagnostics.push("Project release decision semanticDigest mismatch");
  }
  const payload = { ...candidate, generatedAt: String(value.generatedAt), semanticDigest: String(value.semanticDigest) };
  if (String(value.digest) !== hashStableJson(payload)) diagnostics.push("Project release decision digest mismatch");
  if (diagnostics.length) return { diagnostics };
  return {
    diagnostics,
    document: {
      ...payload,
      digest: String(value.digest),
    },
  };
}

export function canonicalizeProjectReleaseDecisionDocument(value: ProjectReleaseDecisionDocument): string {
  return stableStringify(documentSemanticPayload(value));
}

function documentSemanticPayload(value: {
  schemaVersion: typeof PROJECT_RELEASE_DECISION_SCHEMA;
  id: string;
  project: ProjectReleaseProject;
  producer: typeof PROJECT_RELEASE_DECISION_PRODUCER;
  decisions: ProjectReleaseDecisionDocument["decisions"];
  summary: ProjectReleaseDecisionDocument["summary"];
}): {
  schemaVersion: typeof PROJECT_RELEASE_DECISION_SCHEMA;
  id: string;
  project: ProjectReleaseProject;
  producer: typeof PROJECT_RELEASE_DECISION_PRODUCER;
  decisions: {
    diagnostic: Omit<ProjectReleaseDecision, "generatedAt" | "semanticDigest">;
    release: Omit<ProjectReleaseDecision, "generatedAt" | "semanticDigest">;
  };
  summary: ProjectReleaseDecisionDocument["summary"];
} {
  return {
    schemaVersion: value.schemaVersion,
    id: value.id,
    project: value.project,
    producer: value.producer,
    decisions: {
      diagnostic: decisionSemanticPayload(value.decisions.diagnostic),
      release: decisionSemanticPayload(value.decisions.release),
    },
    summary: value.summary,
  };
}

function createDecision(input: {
  id: string;
  intent: ProjectReleaseDecisionIntent;
  project: ProjectReleaseProject;
  evidence: ProjectReleaseEvidence[];
  blockers: ProjectReleaseBlocker[];
  warnings: string[];
  generatedAt: string;
}): ProjectReleaseDecision {
  const canRelease = input.intent === "release" && input.blockers.length === 0;
  const decision: ProjectReleaseDecision = {
    schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
    id: input.id,
    intent: input.intent,
    project: cloneProject(input.project),
    status: input.blockers.length ? "blocked" : "ready",
    canExport: input.intent === "diagnostic" || canRelease,
    canRelease,
    generatedAt: input.generatedAt,
    evidence: input.evidence.map(cloneEvidence),
    blockers: input.blockers.map(cloneBlocker),
    warnings: [...input.warnings],
    nextAction: chooseNextAction(input.intent, input.blockers),
    semanticDigest: "",
  };
  decision.semanticDigest = hashStableJson(decisionSemanticPayload(decision));
  return decision;
}

function collectBlockers(project: ProjectReleaseProject, evidence: ProjectReleaseEvidence[]): ProjectReleaseBlocker[] {
  const blockers: ProjectReleaseBlocker[] = [];
  if (project.scope !== "saved" || project.revision === undefined) {
    blockers.push({
      id: "project:revision-missing",
      reason: "project-revision-missing",
      detail: "A saved project revision is required for a release decision; diagnostic export remains available.",
      nextAction: { kind: "save-project", label: "Save project locally", targetId: project.id },
    });
  }
  if (project.dirty) {
    blockers.push({
      id: "project:dirty",
      reason: "project-dirty",
      detail: "The project has unsaved changes, so release evidence may describe an older revision.",
      nextAction: { kind: "save-project", label: "Save project locally", targetId: project.id },
    });
  }
  if (project.conflict) {
    blockers.push({
      id: "project:conflict",
      reason: "project-conflict",
      detail: "Another browser context changed the project revision; resolve the conflict before release.",
      nextAction: { kind: "resolve-project-conflict", label: "Resolve project conflict", targetId: project.id },
    });
  }
  for (const item of evidence.filter((candidate) => candidate.requiredForRelease)) {
    if (item.revisionState === "mismatched") {
      blockers.push(blockerFor(item, "wrong-revision", "Evidence revision does not match the current project revision.", "refresh-evidence", "Refresh evidence"));
      continue;
    }
    if (item.revisionState === "unknown") {
      blockers.push(blockerFor(item, "revision-unknown", "Evidence is present but its project revision cannot be proven.", "refresh-evidence", "Refresh evidence"));
      continue;
    }
    if (item.status === "missing" || item.freshness === "missing") {
      blockers.push(blockerFor(item, "evidence-missing", "Required release evidence is missing.", "review-evidence", "Review missing evidence"));
      continue;
    }
    if (item.status === "stale" || item.freshness === "stale") {
      blockers.push(blockerFor(item, "evidence-stale", "Required release evidence is stale.", "refresh-evidence", "Refresh stale evidence"));
      continue;
    }
    if (item.status === "unknown" || item.freshness === "unknown") {
      blockers.push(blockerFor(item, "evidence-unknown", "Required release evidence has an unknown state.", "review-evidence", "Review evidence state"));
      continue;
    }
    if (item.status === "blocked" || item.kind === "asset-policy" && item.status !== "passed") {
      blockers.push(blockerFor(item, item.kind === "asset-policy" ? "policy-blocked" : "evidence-failed", item.detail, item.kind === "asset-policy" ? "review-policy" : "review-evidence", item.kind === "asset-policy" ? "Review release policy" : "Review failed evidence"));
      continue;
    }
    if (item.status === "failed") {
      blockers.push(blockerFor(item, "evidence-failed", "Required release evidence failed.", "review-evidence", "Review failed evidence"));
    }
  }
  return blockers.sort((left, right) => left.id.localeCompare(right.id));
}

function collectWarnings(evidence: ProjectReleaseEvidence[]): string[] {
  return evidence
    .filter((item) => item.status === "warn")
    .map((item) => `${item.id}: ${item.detail}`)
    .sort((left, right) => left.localeCompare(right));
}

function blockerFor(
  evidence: ProjectReleaseEvidence,
  reason: ProjectReleaseBlockReason,
  detail: string,
  kind: ProjectReleaseNextActionKind,
  label: string,
): ProjectReleaseBlocker {
  return {
    id: `${reason}:${evidence.id}`,
    reason,
    evidenceId: evidence.id,
    detail: `${evidence.label}: ${detail}`,
    nextAction: { kind, label, targetId: evidence.id },
  };
}

function chooseNextAction(intent: ProjectReleaseDecisionIntent, blockers: ProjectReleaseBlocker[]): ProjectReleaseNextAction {
  if (!blockers.length) {
    return intent === "diagnostic"
      ? { kind: "review-evidence", label: "Review diagnostic package", targetId: "project-release-decision" }
      : { kind: "review-evidence", label: "Export release package", targetId: "project-release-decision" };
  }
  return blockers[0]!.nextAction;
}

function normalizeProject(project: ProjectReleaseProject): ProjectReleaseProject {
  return {
    id: project.id.trim(),
    ...(project.revision !== undefined && Number.isSafeInteger(project.revision) && project.revision > 0 ? { revision: project.revision } : {}),
    scope: project.scope,
    dirty: project.dirty === true,
    conflict: project.conflict === true,
  };
}

function normalizeEvidence(values: readonly ProjectReleaseEvidenceInput[]): ProjectReleaseEvidence[] {
  const unique = new Map<string, ProjectReleaseEvidence>();
  for (const value of values) {
    const id = value.id.trim();
    if (!id) continue;
    unique.set(id, {
      id,
      label: value.label.trim(),
      kind: value.kind,
      status: value.status,
      freshness: value.freshness,
      revisionState: value.revisionState,
      requiredForRelease: value.requiredForRelease === true,
      detail: value.detail.trim(),
      evidenceIds: [...new Set(value.evidenceIds ?? [])].sort((left, right) => left.localeCompare(right)),
    });
  }
  return [...unique.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function parseProject(value: unknown, diagnostics: string[]): ProjectReleaseProject | undefined {
  if (!isRecord(value) || !nonEmptyString(value.id) || !isProjectScope(value.scope) || typeof value.dirty !== "boolean" || typeof value.conflict !== "boolean") {
    diagnostics.push("Project release decision project is invalid");
    return undefined;
  }
  if (value.revision !== undefined && !isPositiveSafeInteger(value.revision)) {
    diagnostics.push("Project release decision project revision is invalid");
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

function parseProducer(value: unknown, diagnostics: string[]): typeof PROJECT_RELEASE_DECISION_PRODUCER | undefined {
  if (!isRecord(value) || value.id !== PROJECT_RELEASE_DECISION_PRODUCER.id || value.version !== PROJECT_RELEASE_DECISION_PRODUCER.version || value.revision !== PROJECT_RELEASE_DECISION_PRODUCER.revision) {
    diagnostics.push("Project release decision producer is invalid");
    return undefined;
  }
  return PROJECT_RELEASE_DECISION_PRODUCER;
}

function parseDecisions(value: unknown, diagnostics: string[]): ProjectReleaseDecisionDocument["decisions"] | undefined {
  if (!isRecord(value)) {
    diagnostics.push("Project release decision intents are missing");
    return undefined;
  }
  const diagnostic = parseDecision(value.diagnostic, diagnostics);
  const release = parseDecision(value.release, diagnostics);
  if (!diagnostic || !release || diagnostic.intent !== "diagnostic" || release.intent !== "release") {
    diagnostics.push("Project release decision intents are invalid");
    return undefined;
  }
  return { diagnostic, release };
}

function parseDecision(value: unknown, diagnostics: string[]): ProjectReleaseDecision | undefined {
  if (!isRecord(value)) {
    diagnostics.push("Project release decision intent must be an object");
    return undefined;
  }
  if (value.schemaVersion !== PROJECT_RELEASE_DECISION_SCHEMA || !nonEmptyString(value.id) || !isDecisionIntent(value.intent) || !isDecisionStatus(value.status)) {
    diagnostics.push("Project release decision intent has invalid identity or status");
    return undefined;
  }
  if (typeof value.canExport !== "boolean" || typeof value.canRelease !== "boolean" || !isIsoDate(value.generatedAt)) {
    diagnostics.push("Project release decision intent has invalid allowance or timestamp");
    return undefined;
  }
  const project = parseProject(value.project, diagnostics);
  const evidence = parseEvidence(value.evidence, diagnostics);
  const blockers = parseBlockers(value.blockers, diagnostics);
  const warnings = parseStringArray(value.warnings, "decision warnings", diagnostics);
  const nextAction = parseNextAction(value.nextAction, diagnostics);
  if (!project || !evidence || !blockers || !warnings || !nextAction || !nonEmptyString(value.semanticDigest)) return undefined;
  const candidate = {
    schemaVersion: PROJECT_RELEASE_DECISION_SCHEMA,
    id: String(value.id),
    intent: value.intent as ProjectReleaseDecisionIntent,
    project,
    status: value.status as ProjectReleaseDecisionStatus,
    canExport: value.canExport,
    canRelease: value.canRelease,
    generatedAt: String(value.generatedAt),
    evidence,
    blockers,
    warnings,
    nextAction,
    semanticDigest: String(value.semanticDigest),
  } satisfies ProjectReleaseDecision;
  if (candidate.semanticDigest !== hashStableJson(decisionSemanticPayload(candidate))) {
    diagnostics.push(`Project release decision ${candidate.id} semanticDigest mismatch`);
  }
  return diagnostics.length ? undefined : candidate;
}

function parseEvidence(value: unknown, diagnostics: string[]): ProjectReleaseEvidence[] | undefined {
  if (!Array.isArray(value)) {
    diagnostics.push("Project release decision evidence must be an array");
    return undefined;
  }
  const parsed = value.flatMap((item) => {
    if (!isRecord(item) || !nonEmptyString(item.id) || !nonEmptyString(item.label) || !isEvidenceKind(item.kind) || !isEvidenceStatus(item.status) || !isFreshness(item.freshness) || !isRevisionState(item.revisionState) || typeof item.requiredForRelease !== "boolean" || !nonEmptyString(item.detail)) {
      diagnostics.push("Project release decision evidence item is invalid");
      return [];
    }
    const evidenceIds = parseStringArray(item.evidenceIds, "evidence item ids", diagnostics);
    return evidenceIds ? [{
      id: String(item.id),
      label: String(item.label),
      kind: item.kind,
      status: item.status,
      freshness: item.freshness,
      revisionState: item.revisionState,
      requiredForRelease: item.requiredForRelease,
      detail: String(item.detail),
      evidenceIds,
    }] : [];
  });
  const ids = new Set<string>();
  for (const item of parsed) {
    if (ids.has(item.id)) diagnostics.push(`Duplicate project release evidence ${item.id}`);
    ids.add(item.id);
  }
  return parsed;
}

function parseBlockers(value: unknown, diagnostics: string[]): ProjectReleaseBlocker[] | undefined {
  if (!Array.isArray(value)) {
    diagnostics.push("Project release decision blockers must be an array");
    return undefined;
  }
  return value.flatMap((item) => {
    if (!isRecord(item) || !nonEmptyString(item.id) || !isBlockReason(item.reason) || (item.evidenceId !== undefined && !nonEmptyString(item.evidenceId)) || !nonEmptyString(item.detail)) {
      diagnostics.push("Project release decision blocker is invalid");
      return [];
    }
    const nextAction = parseNextAction(item.nextAction, diagnostics);
    return nextAction ? [{ id: String(item.id), reason: item.reason, ...(item.evidenceId !== undefined ? { evidenceId: String(item.evidenceId) } : {}), detail: String(item.detail), nextAction }] : [];
  });
}

function parseNextAction(value: unknown, diagnostics: string[]): ProjectReleaseNextAction | undefined {
  if (!isRecord(value) || !isNextActionKind(value.kind) || !nonEmptyString(value.label) || !nonEmptyString(value.targetId)) {
    diagnostics.push("Project release decision next action is invalid");
    return undefined;
  }
  return { kind: value.kind, label: String(value.label), targetId: String(value.targetId) };
}

function parseSummary(value: unknown, diagnostics: string[]): ProjectReleaseDecisionDocument["summary"] | undefined {
  if (!isRecord(value) || !isNonNegativeSafeInteger(value.evidenceCount) || !isNonNegativeSafeInteger(value.blockerCount) || !isNonNegativeSafeInteger(value.warningCount) || typeof value.diagnosticExportable !== "boolean" || typeof value.releaseable !== "boolean") {
    diagnostics.push("Project release decision summary is invalid");
    return undefined;
  }
  return {
    evidenceCount: value.evidenceCount,
    blockerCount: value.blockerCount,
    warningCount: value.warningCount,
    diagnosticExportable: value.diagnosticExportable,
    releaseable: value.releaseable,
  };
}

function parseStringArray(value: unknown, label: string, diagnostics: string[]): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    diagnostics.push(`Project release decision ${label} must be string[]`);
    return undefined;
  }
  return [...value] as string[];
}

function decisionSemanticPayload(decision: ProjectReleaseDecision): Omit<ProjectReleaseDecision, "generatedAt" | "semanticDigest"> {
  const { generatedAt: _generatedAt, semanticDigest: _semanticDigest, ...payload } = decision;
  return payload;
}

function normalizeProjectClone(project: ProjectReleaseProject): ProjectReleaseProject {
  return { ...project };
}

function cloneProject(project: ProjectReleaseProject): ProjectReleaseProject {
  return normalizeProjectClone(project);
}

function cloneEvidence(evidence: ProjectReleaseEvidence): ProjectReleaseEvidence {
  return { ...evidence, evidenceIds: [...evidence.evidenceIds] };
}

function cloneBlocker(blocker: ProjectReleaseBlocker): ProjectReleaseBlocker {
  return { ...blocker, nextAction: { ...blocker.nextAction } };
}

function isDecisionIntent(value: unknown): value is ProjectReleaseDecisionIntent {
  return value === "diagnostic" || value === "release";
}

function isDecisionStatus(value: unknown): value is ProjectReleaseDecisionStatus {
  return value === "ready" || value === "blocked";
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

function isBlockReason(value: unknown): value is ProjectReleaseBlockReason {
  return value === "project-revision-missing" || value === "project-dirty" || value === "project-conflict" || value === "evidence-missing" || value === "evidence-stale" || value === "evidence-failed" || value === "evidence-unknown" || value === "wrong-revision" || value === "revision-unknown" || value === "policy-blocked";
}

function isNextActionKind(value: unknown): value is ProjectReleaseNextActionKind {
  return value === "save-project" || value === "resolve-project-conflict" || value === "refresh-evidence" || value === "review-evidence" || value === "review-policy";
}

function isProjectScope(value: unknown): value is ProjectReleaseProject["scope"] {
  return value === "saved" || value === "session";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
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

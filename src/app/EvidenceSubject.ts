/**
 * EvidenceSubject + RealPlaytestReadiness v1 (DA26-22 bounded).
 */

export const EVIDENCE_SUBJECT_SCHEMA = "EvidenceSubject/v1" as const;
export const REAL_PLAYTEST_READINESS_SCHEMA = "RealPlaytestReadiness/v1" as const;

export type EvidenceSubjectKind = "repository" | "project" | "runtime" | "target" | "tool";

export type EvidenceSubject = {
  schema: typeof EVIDENCE_SUBJECT_SCHEMA;
  kind: EvidenceSubjectKind;
  id: string;
  revision?: string;
};

export type RealPlaytestReadinessState = "missing" | "current" | "stale" | "failed" | "runnable";

export type RealPlaytestReadiness = {
  schema: typeof REAL_PLAYTEST_READINESS_SCHEMA;
  subject: EvidenceSubject;
  state: RealPlaytestReadinessState;
  canExport: boolean;
  observedAt?: string;
  sourceRevision?: string;
  expectedRevision?: string;
  diagnostics: string[];
};

export type RealPlaytestReadinessInput = {
  subject: EvidenceSubject;
  /** True when a real playtest observation exists for this subject. */
  hasObservation: boolean;
  observedAt?: string;
  sourceRevision?: string;
  expectedRevision?: string;
  maxAgeMs?: number;
  now?: string | Date;
  failed?: boolean;
  /** Fixed green row without real subject binding is not runnable. */
  fixedGreenWithoutSubject?: boolean;
};

export function createEvidenceSubject(
  kind: EvidenceSubjectKind,
  id: string,
  revision?: string,
): EvidenceSubject {
  return {
    schema: EVIDENCE_SUBJECT_SCHEMA,
    kind,
    id: id.trim(),
    ...(revision ? { revision: revision.trim() } : {}),
  };
}

export function assessRealPlaytestReadiness(input: RealPlaytestReadinessInput): RealPlaytestReadiness {
  const diagnostics: string[] = [];
  if (!input.subject.id) diagnostics.push("empty-subject-id");
  if (input.fixedGreenWithoutSubject) {
    return {
      schema: REAL_PLAYTEST_READINESS_SCHEMA,
      subject: input.subject,
      state: "failed",
      canExport: false,
      diagnostics: ["fixed-green-without-subject"],
    };
  }
  if (!input.hasObservation) {
    return {
      schema: REAL_PLAYTEST_READINESS_SCHEMA,
      subject: input.subject,
      state: "missing",
      canExport: false,
      diagnostics: ["missing-observation", ...diagnostics],
    };
  }
  if (input.failed) {
    return {
      schema: REAL_PLAYTEST_READINESS_SCHEMA,
      subject: input.subject,
      state: "failed",
      canExport: false,
      observedAt: input.observedAt,
      sourceRevision: input.sourceRevision,
      expectedRevision: input.expectedRevision,
      diagnostics: ["observation-failed", ...diagnostics],
    };
  }
  if (
    input.expectedRevision &&
    input.sourceRevision &&
    input.expectedRevision !== input.sourceRevision
  ) {
    return {
      schema: REAL_PLAYTEST_READINESS_SCHEMA,
      subject: input.subject,
      state: "stale",
      canExport: false,
      observedAt: input.observedAt,
      sourceRevision: input.sourceRevision,
      expectedRevision: input.expectedRevision,
      diagnostics: ["revision-mismatch", ...diagnostics],
    };
  }
  if (input.observedAt && input.maxAgeMs !== undefined) {
    const age = toMs(input.now ?? new Date()) - toMs(input.observedAt);
    if (age > input.maxAgeMs) {
      return {
        schema: REAL_PLAYTEST_READINESS_SCHEMA,
        subject: input.subject,
        state: "stale",
        canExport: false,
        observedAt: input.observedAt,
        sourceRevision: input.sourceRevision,
        expectedRevision: input.expectedRevision,
        diagnostics: ["observation-stale", ...diagnostics],
      };
    }
  }
  return {
    schema: REAL_PLAYTEST_READINESS_SCHEMA,
    subject: input.subject,
    state: "runnable",
    canExport: true,
    observedAt: input.observedAt,
    sourceRevision: input.sourceRevision,
    expectedRevision: input.expectedRevision,
    diagnostics,
  };
}

function toMs(value: string | Date): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

/**
 * DA31-006: gate subject revision envelope.
 * Dirty trees are provisional; clean trees may bind authoritative subjectSha.
 */

export type GateSubjectEnvelope = {
  schema: "Da31GateSubjectEnvelope/v1";
  subjectSha: string;
  dirtyTree: boolean;
  provisional: boolean;
  probePaths: string[];
  codePaths: string[];
  claimLimit: string;
};

export function buildGateSubjectEnvelope(input: {
  subjectSha: string;
  dirtyTree: boolean;
  probePaths?: string[];
  codePaths?: string[];
}): GateSubjectEnvelope {
  const provisional = input.dirtyTree;
  return {
    schema: "Da31GateSubjectEnvelope/v1",
    subjectSha: input.subjectSha,
    dirtyTree: input.dirtyTree,
    provisional,
    probePaths: [...(input.probePaths ?? [])],
    codePaths: [...(input.codePaths ?? [])],
    claimLimit: provisional
      ? "provisional dirty-tree observation only; not authoritative formal/product pin"
      : "subject-bound observation at listed probe/code paths",
  };
}

export function rejectAuthoritativeIfDirty(env: GateSubjectEnvelope): boolean {
  return env.provisional || env.dirtyTree;
}

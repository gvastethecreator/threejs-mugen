import {
  relinkGameProjectSourcePackages,
  type GameProjectManifest,
  type GameProjectSourcePackage,
  type GameProjectSourceRelinkSource,
} from "./StudioModel";

export type SourceImportTransactionStatus = "accepted" | "rejected";

export type SourceImportTransactionReason =
  | "new-source"
  | "matched-relink"
  | "legacy-baseline"
  | "changed-source"
  | "missing-source"
  | "source-mismatch";

export type SourceImportTransaction = {
  status: SourceImportTransactionStatus;
  reason: SourceImportTransactionReason;
  targetId?: string;
  sourceName: string;
  sourceKind: GameProjectSourcePackage["kind"];
  fingerprint?: string;
  byteLength?: number;
  sourcePackages: GameProjectSourcePackage[];
  linkedIds: string[];
  warnings: string[];
};

export type SourceImportCommitStatus = "committed" | "rejected";

export const SOURCE_TRANSACTION_SCHEMA = "mugen-web-sandbox/source-transaction/v0" as const;

export type SourceTransactionPermission = "not-requested" | "prompt" | "granted" | "denied" | "revoked" | "unsupported";
export type SourceTransactionState = "linked" | "changed" | "missing" | "conflict";
export type SourceTransactionRevisionStatus = "matched" | "changed" | "unknown";
export type SourceTransactionNextAction =
  | "none"
  | "relink-source"
  | "reimport-source"
  | "resolve-conflict"
  | "request-permission"
  | "manual-relink";

export const SOURCE_TRANSACTION_INVALIDATED_OUTPUTS = [
  "runtime-manifest",
  "trace-artifact",
  "project-bundle",
] as const;

export type SourceTransactionRecord = {
  schemaVersion: typeof SOURCE_TRANSACTION_SCHEMA;
  id: string;
  sourcePackageId: string;
  sourceName: string;
  sourceKind: GameProjectSourcePackage["kind"];
  state: SourceTransactionState;
  permission: SourceTransactionPermission;
  revisionStatus: SourceTransactionRevisionStatus;
  expectedFingerprint?: string;
  observedFingerprint?: string;
  fingerprintAlgorithm?: GameProjectSourcePackage["fingerprintAlgorithm"];
  expectedRevision?: number;
  observedRevision?: number;
  canRead: boolean;
  canWrite: boolean;
  nextAction: SourceTransactionNextAction;
  invalidatedOutputs: string[];
  warnings: string[];
};

export type SourceTransactionReadInput = {
  sourcePackage: GameProjectSourcePackage;
  permission: SourceTransactionPermission;
  expectedRevision?: number;
  observedRevision?: number;
  conflict?: boolean;
};

export function createSourceTransactionRecord(input: SourceTransactionReadInput): SourceTransactionRecord {
  const { sourcePackage } = input;
  const revisionStatus = resolveRevisionStatus(input.expectedRevision, input.observedRevision);
  const state = resolveSourceTransactionState(sourcePackage, revisionStatus, input.conflict === true);
  const nextAction = resolveSourceTransactionNextAction(state, input.permission);
  const warnings = [
    ...(state === "conflict" ? ["Project revision changed; resolve the project conflict before writing source files."] : []),
    ...(state === "changed" ? ["Source fingerprint changed; explicit reimport is required before writing source files."] : []),
    ...(state === "missing" ? ["Source bytes are not linked; relink the package before writing source files."] : []),
    ...(input.permission === "not-requested" || input.permission === "prompt"
      ? ["Durable source write permission has not been granted."]
      : input.permission === "denied"
        ? ["Durable source write permission was denied."]
        : input.permission === "revoked"
          ? ["Durable source write permission was revoked."]
          : input.permission === "unsupported"
            ? ["This browser does not expose the required durable source permission API."]
            : []),
  ];
  const invalidatedOutputs = state === "linked" ? [] : uniqueStrings([...SOURCE_TRANSACTION_INVALIDATED_OUTPUTS]);
  return {
    schemaVersion: SOURCE_TRANSACTION_SCHEMA,
    id: `source-transaction:${sourcePackage.id}`,
    sourcePackageId: sourcePackage.id,
    sourceName: sourcePackage.name,
    sourceKind: sourcePackage.kind,
    state,
    permission: input.permission,
    revisionStatus,
    ...(sourcePackage.fingerprint ? { expectedFingerprint: sourcePackage.fingerprint } : {}),
    ...(sourcePackage.observedFingerprint ? { observedFingerprint: sourcePackage.observedFingerprint } : {}),
    ...(sourcePackage.fingerprintAlgorithm ? { fingerprintAlgorithm: sourcePackage.fingerprintAlgorithm } : {}),
    ...(input.expectedRevision !== undefined ? { expectedRevision: input.expectedRevision } : {}),
    ...(input.observedRevision !== undefined ? { observedRevision: input.observedRevision } : {}),
    canRead: sourcePackage.status === "linked",
    canWrite: state === "linked" && input.permission === "granted" && revisionStatus !== "changed",
    nextAction,
    invalidatedOutputs,
    warnings: uniqueStrings(warnings),
  };
}

function resolveRevisionStatus(expectedRevision: number | undefined, observedRevision: number | undefined): SourceTransactionRevisionStatus {
  if (expectedRevision === undefined || observedRevision === undefined) {
    return "unknown";
  }
  return expectedRevision === observedRevision ? "matched" : "changed";
}

function resolveSourceTransactionState(
  sourcePackage: GameProjectSourcePackage,
  revisionStatus: SourceTransactionRevisionStatus,
  conflict: boolean,
): SourceTransactionState {
  if (conflict || revisionStatus === "changed") {
    return "conflict";
  }
  if (sourcePackage.identityStatus === "changed") {
    return "changed";
  }
  return sourcePackage.status === "linked" && sourcePackage.identityStatus !== "missing" ? "linked" : "missing";
}

function resolveSourceTransactionNextAction(
  state: SourceTransactionState,
  permission: SourceTransactionPermission,
): SourceTransactionNextAction {
  if (state === "conflict") return "resolve-conflict";
  if (state === "changed") return "reimport-source";
  if (state === "missing") return "relink-source";
  if (permission === "unsupported") return "manual-relink";
  if (permission !== "granted") return "request-permission";
  return "none";
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function prepareSourceImportTransaction(
  manifest: GameProjectManifest | undefined,
  source: GameProjectSourceRelinkSource,
  targetId?: string,
): SourceImportTransaction {
  const base = {
    targetId,
    sourceName: source.name,
    sourceKind: source.kind,
    fingerprint: source.fingerprint,
    byteLength: source.byteLength,
  };
  if (!manifest?.sourcePackages.length) {
    return {
      ...base,
      status: "accepted",
      reason: "new-source",
      sourcePackages: [],
      linkedIds: [],
      warnings: [],
    };
  }

  const targetExists = !targetId || manifest.sourcePackages.some((sourcePackage) => sourcePackage.id === targetId);
  if (!targetExists) {
    return {
      ...base,
      status: "rejected",
      reason: "source-mismatch",
      sourcePackages: manifest.sourcePackages,
      linkedIds: [],
      warnings: [`Source package target '${targetId}' does not exist in the current project manifest.`],
    };
  }

  const result = relinkGameProjectSourcePackages(manifest.sourcePackages, source, targetId);
  const relevantPackages = targetId
    ? result.sourcePackages.filter((sourcePackage) => sourcePackage.id === targetId)
    : result.sourcePackages;
  const changed = relevantPackages.some((sourcePackage) => sourcePackage.identityStatus === "changed");
  const missing = targetId
    ? !result.linkedIds.includes(targetId)
    : result.missing.length > 0;
  if (changed || missing) {
    const reason: SourceImportTransactionReason = changed
      ? "changed-source"
      : result.missing.some((entry) => entry.missingPaths.length === 0)
        ? "source-mismatch"
        : "missing-source";
    return {
      ...base,
      status: "rejected",
      reason,
      sourcePackages: result.sourcePackages,
      linkedIds: result.linkedIds,
      warnings: result.warnings.length > 0 ? result.warnings : [`Source '${source.name}' did not satisfy the current project source contract.`],
    };
  }

  const originalLinkedPackage = (targetId
    ? manifest.sourcePackages.filter((sourcePackage) => sourcePackage.id === targetId)
    : manifest.sourcePackages
  ).find((sourcePackage) => result.linkedIds.includes(sourcePackage.id));
  const expectedFingerprint = originalLinkedPackage?.fingerprint;
  return {
    ...base,
    status: "accepted",
    reason: expectedFingerprint ? "matched-relink" : "legacy-baseline",
    sourcePackages: result.sourcePackages,
    linkedIds: result.linkedIds,
    warnings: result.warnings,
  };
}

export function runSourceImportTransaction<TSnapshot>(
  transaction: SourceImportTransaction,
  snapshot: TSnapshot,
  apply: (transaction: SourceImportTransaction) => void,
  rollback: (snapshot: TSnapshot) => void,
): SourceImportCommitStatus {
  if (transaction.status === "rejected") {
    return "rejected";
  }
  try {
    apply(transaction);
    return "committed";
  } catch (error) {
    rollback(snapshot);
    throw error;
  }
}

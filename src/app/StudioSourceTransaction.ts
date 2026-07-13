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

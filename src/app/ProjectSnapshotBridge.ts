/**
 * ProjectSnapshotBridge/v1 (DA27-01).
 * On project save, persist a StudioProjectSnapshot so reopen can verify identity.
 */

import type { GameProjectManifest } from "./StudioModel";
import type { StoredProjectEntry, StorageLike } from "./ProjectStorage";
import {
  createStudioProjectSnapshot,
  reopenStudioProjectIdentity,
  saveStudioProjectSnapshot,
  type StudioProjectSnapshot,
  type StudioProjectSnapshotAnalysis,
  type StudioProjectSnapshotAuthority,
  type StudioProjectSnapshotSource,
} from "./StudioProjectSnapshot";

export const PROJECT_SNAPSHOT_BRIDGE_SCHEMA = "ProjectSnapshotBridge/v1" as const;

export type ProjectSnapshotBridgeInput = {
  storage: StorageLike;
  entry: StoredProjectEntry;
  source?: Partial<StudioProjectSnapshotSource>;
  authority?: Partial<StudioProjectSnapshotAuthority>;
  analysis?: Partial<StudioProjectSnapshotAnalysis>;
  versions?: {
    app?: string;
    analyzer?: string;
    ruleset?: string;
  };
  assetClosureChecksum?: string;
};

export type ProjectSnapshotBridgeResult = {
  schema: typeof PROJECT_SNAPSHOT_BRIDGE_SCHEMA;
  snapshot: StudioProjectSnapshot;
  identityPreserved: boolean;
  diagnostics: string[];
};

export function snapshotAfterProjectSave(input: ProjectSnapshotBridgeInput): ProjectSnapshotBridgeResult {
  const snapshot = createStudioProjectSnapshot({
    id: `snap:${input.entry.id}:r${input.entry.revision}`,
    projectId: input.entry.id,
    projectName: input.entry.name,
    projectRevision: input.entry.revision,
    savedAt: input.entry.savedAt,
    source: {
      packageId: input.source?.packageId ?? input.entry.manifest.id,
      kind: input.source?.kind ?? "folder",
      fingerprint: input.source?.fingerprint ?? `manifest:${input.entry.id}:r${input.entry.revision}`,
      identityStatus: input.source?.identityStatus ?? "matched",
    },
    authority: {
      formalSha: input.authority?.formalSha ?? "7d9b15f8",
      globalSha: input.authority?.globalSha ?? "7d9b15f8",
      ...(input.authority?.sourceNormativeSha
        ? { sourceNormativeSha: input.authority.sourceNormativeSha }
        : {}),
    },
    analysis: {
      schemaVersion: input.analysis?.schemaVersion ?? "mugen-web-sandbox/package-analysis/v1",
      checksum: input.analysis?.checksum ?? `analysis:${input.entry.id}:r${input.entry.revision}`,
      status: input.analysis?.status ?? "partial",
      findingCount: input.analysis?.findingCount ?? 0,
    },
    versions: {
      app: input.versions?.app ?? "0.0.0-sandbox",
      analyzer: input.versions?.analyzer ?? "1.0.0",
      ruleset: input.versions?.ruleset ?? "1.0.0",
    },
    ...(input.assetClosureChecksum ? { assetClosureChecksum: input.assetClosureChecksum } : {}),
  });

  let reopen: ReturnType<typeof reopenStudioProjectIdentity>;
  try {
    saveStudioProjectSnapshot(input.storage, snapshot);
    reopen = reopenStudioProjectIdentity(input.storage, input.entry.id);
  } catch (error) {
    reopen = {
      identityPreserved: false,
      diagnostics: [
        "local-snapshot-write-failed",
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
  return {
    schema: PROJECT_SNAPSHOT_BRIDGE_SCHEMA,
    snapshot,
    identityPreserved: reopen.identityPreserved,
    diagnostics: reopen.diagnostics,
  };
}

export function findLatestProjectSnapshot(
  storage: StorageLike,
  projectId: string,
): ReturnType<typeof reopenStudioProjectIdentity> {
  return reopenStudioProjectIdentity(storage, projectId);
}

export function projectSnapshotLabel(manifest: GameProjectManifest, revision: number): string {
  return `${manifest.name} @ r${revision}`;
}

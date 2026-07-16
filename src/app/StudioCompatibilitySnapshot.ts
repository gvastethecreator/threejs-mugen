import snapshotJson from "../mugen/compatibility/compatibility-corpus-snapshot-v1.json";
import {
  parseCompatibilityCorpusSnapshot,
  type CompatibilityCorpusSnapshotResult,
} from "../mugen/compatibility/CompatibilityCorpusSnapshot";

export const STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH = "docs/evidence/compatibility-corpus-snapshot-v1.json" as const;

export type StudioCompatibilitySnapshotState = {
  source: "tracked";
  artifactPath: typeof STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH;
  status: "passed" | "partial" | "failed" | "unavailable";
  snapshot?: CompatibilityCorpusSnapshotResult;
  diagnostics: string[];
};

const parsedSnapshot = parseCompatibilityCorpusSnapshot(snapshotJson as unknown);

export const STUDIO_COMPATIBILITY_SNAPSHOT: StudioCompatibilitySnapshotState = parsedSnapshot.snapshot
  ? {
      source: "tracked",
      artifactPath: STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
      status: parsedSnapshot.snapshot.status,
      snapshot: parsedSnapshot.snapshot,
      diagnostics: [],
    }
  : {
      source: "tracked",
      artifactPath: STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
      status: "failed",
      diagnostics: parsedSnapshot.errors,
    };

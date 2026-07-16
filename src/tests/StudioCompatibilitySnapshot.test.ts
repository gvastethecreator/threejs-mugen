import { describe, expect, it } from "vitest";
import { parseCompatibilityCorpusSnapshot } from "../mugen/compatibility/CompatibilityCorpusSnapshot";
import {
  STUDIO_COMPATIBILITY_SNAPSHOT,
  STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
} from "../app/StudioCompatibilitySnapshot";

describe("StudioCompatibilitySnapshot", () => {
  it("exposes the tracked promoted snapshot as validated Studio evidence", () => {
    expect(STUDIO_COMPATIBILITY_SNAPSHOT).toMatchObject({
      source: "tracked",
      artifactPath: STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
      status: "passed",
      diagnostics: [],
    });
    expect(STUDIO_COMPATIBILITY_SNAPSHOT.snapshot).toMatchObject({
      schemaVersion: "mugen-web-sandbox/compatibility-corpus-snapshot/v1.1",
      status: "passed",
      summary: { entryCount: 3, requiredCount: 2, passedCount: 2, artifactCount: 8 },
      claims: { blocked: expect.arrayContaining(["full MUGEN/IKEMEN parity"]) },
    });
  });

  it("keeps the bundled source artifact checksum-valid", () => {
    const snapshot = STUDIO_COMPATIBILITY_SNAPSHOT.snapshot;
    expect(snapshot).toBeDefined();
    expect(parseCompatibilityCorpusSnapshot(snapshot)).toEqual({ snapshot, errors: [] });
  });
});

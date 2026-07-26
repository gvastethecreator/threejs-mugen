import { describe, expect, it } from "vitest";
import {
  createStudioProjectSnapshot,
  listStudioProjectSnapshots,
  loadStudioProjectSnapshot,
  reopenStudioProjectIdentity,
  recoverStudioProjectSnapshots,
  saveStudioProjectSnapshot,
  STUDIO_PROJECT_SNAPSHOT_LEGACY_KEY,
  STUDIO_PROJECT_SNAPSHOT_STORE_KEY,
  verifyStudioProjectSnapshot,
} from "../app/StudioProjectSnapshot";

function memoryStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

function snap(id = "snap-1") {
  return createStudioProjectSnapshot({
    id,
    projectId: "proj-a",
    projectName: "Sandbox",
    projectRevision: 3,
    savedAt: "2026-07-26T20:00:00.000Z",
    source: {
      packageId: "pkg-1",
      kind: "folder",
      fingerprint: "fp-abc",
      identityStatus: "matched",
    },
    authority: {
      formalSha: "7d9b15f8",
      globalSha: "7d9b15f8",
      sourceNormativeSha: "05b7d98a",
    },
    analysis: {
      schemaVersion: "mugen-web-sandbox/package-analysis/v1",
      checksum: "an-1",
      status: "recognized",
      findingCount: 2,
    },
    versions: {
      app: "0.0.0-sandbox",
      analyzer: "1.0.0",
      ruleset: "1.0.0",
    },
    assetClosureChecksum: "close-1",
  });
}

describe("StudioProjectSnapshot", () => {
  it("creates a verifiable snapshot and preserves identity on reopen", () => {
    const storage = memoryStorage();
    const snapshot = snap();
    expect(verifyStudioProjectSnapshot(snapshot)).toEqual([]);
    saveStudioProjectSnapshot(storage, snapshot);
    const loaded = loadStudioProjectSnapshot(storage, snapshot.id);
    expect(loaded?.projectId).toBe("proj-a");
    expect(loaded?.integrity).toBe(snapshot.integrity);
    const reopen = reopenStudioProjectIdentity(storage, "proj-a");
    expect(reopen.identityPreserved).toBe(true);
    expect(reopen.diagnostics).toEqual([]);
  });

  it("fails closed on damaged storage and migrates legacy key", () => {
    const damaged = memoryStorage({
      [STUDIO_PROJECT_SNAPSHOT_STORE_KEY]: "{not-json",
    });
    expect(recoverStudioProjectSnapshots(damaged).entries).toEqual([]);

    const legacySnap = snap("legacy-1");
    const legacy = memoryStorage({
      [STUDIO_PROJECT_SNAPSHOT_LEGACY_KEY]: JSON.stringify({
        schema: "legacy",
        entries: [legacySnap],
      }),
    });
    const migrated = listStudioProjectSnapshots(legacy);
    expect(migrated.entries.some((entry) => entry.id === "legacy-1")).toBe(true);
    expect(legacy.getItem(STUDIO_PROJECT_SNAPSHOT_STORE_KEY)).toBeTruthy();
  });

  it("rejects integrity tampering", () => {
    const snapshot = snap();
    const tampered = { ...snapshot, projectName: "Hijacked" };
    expect(verifyStudioProjectSnapshot(tampered)).toContain("integrity-mismatch");
  });
});

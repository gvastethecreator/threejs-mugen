import { describe, expect, it } from "vitest";
import { saveStoredProjectManifest, type StorageLike } from "../app/ProjectStorage";
import { findLatestProjectSnapshot, snapshotAfterProjectSave } from "../app/ProjectSnapshotBridge";
import { listStudioProjectSnapshots } from "../app/StudioProjectSnapshot";
import { buildGameProjectManifest, buildStudioProjectSummary } from "../app/StudioModel";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";

function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

function manifest(name: string, fighterId: string) {
  const summary = buildStudioProjectSummary({
    fighters: demoFighters,
    selectedP1: fighterId,
    selectedP2: "mira-volt",
    stage: rooftopDojoStage,
    stages: [rooftopDojoStage, trainingStage],
    stageReports: [],
    atlasStatusByFighter: {
      "nova-boxer": "loaded",
      "mira-volt": "loaded",
      "rook-apprentice": "loaded",
    },
    atlasMotionQaByFighter: {
      "nova-boxer": { status: "pass", checkedStates: ["walk"], warnings: [], errors: [] },
      "mira-volt": { status: "pass", checkedStates: ["walk"], warnings: [], errors: [] },
      "rook-apprentice": { status: "pass", checkedStates: ["walk"], warnings: [], errors: [] },
    },
  });
  return buildGameProjectManifest({ ...summary, name }, { generatedAt: "2026-07-26T22:00:00.000Z" });
}

describe("ProjectSnapshotBridge", () => {
  it("writes a reopenable snapshot when a project is saved", () => {
    const storage = memoryStorage();
    const entries = saveStoredProjectManifest(storage, manifest("Snap Project", "nova-boxer"), {
      savedAt: "2026-07-26T22:00:00.000Z",
    });
    const entry = entries[0]!;
    const bridge = snapshotAfterProjectSave({ storage, entry });
    expect(bridge.identityPreserved).toBe(true);
    expect(bridge.snapshot.projectRevision).toBe(entry.revision);
    const reopen = findLatestProjectSnapshot(storage, entry.id);
    expect(reopen.identityPreserved).toBe(true);
    expect(listStudioProjectSnapshots(storage).entries.length).toBeGreaterThan(0);
  });

  it("can skip automatic snapshot when requested", () => {
    const storage = memoryStorage();
    saveStoredProjectManifest(storage, manifest("No Snap", "mira-volt"), {
      savedAt: "2026-07-26T22:00:00.000Z",
      snapshot: false,
    });
    expect(listStudioProjectSnapshots(storage).entries).toEqual([]);
  });
});

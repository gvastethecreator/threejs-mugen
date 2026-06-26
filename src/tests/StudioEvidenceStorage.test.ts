import { describe, expect, it } from "vitest";
import { listStoredTraceEvidence, saveStoredTraceEvidence, STUDIO_EVIDENCE_STORAGE_KEY } from "../app/StudioEvidenceStorage";
import type { StorageLike } from "../app/ProjectStorage";
import { buildGameProjectManifest, buildStudioProjectSummary } from "../app/StudioModel";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";
import { createMatchSmokeTraceArtifact } from "../mugen/runtime/RuntimeTracePresets";

describe("StudioEvidenceStorage", () => {
  it("saves trace evidence newest-first with project entry and source package metadata", () => {
    const storage = memoryStorage();
    const first = manifest("Local Fighting Project", "nova-boxer");
    const second = manifest("Second Project", "mira-volt");
    const firstArtifact = createMatchSmokeTraceArtifact({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: rooftopDojoStage });
    const secondArtifact = createMatchSmokeTraceArtifact({ p1: demoFighters[1]!, p2: demoFighters[0]!, stage: rooftopDojoStage });

    saveStoredTraceEvidence(storage, first, firstArtifact, { savedAt: "2026-06-25T00:00:00.000Z" });
    saveStoredTraceEvidence(storage, second, secondArtifact, { savedAt: "2026-06-25T01:00:00.000Z" });

    const entries = listStoredTraceEvidence(storage);
    expect(entries.map((entry) => entry.projectId)).toEqual(["second-project", "local-fighting-project"]);
    expect(entries[0]?.entry.p1).toBe("mira-volt");
    expect(entries[0]?.artifact.trace.checksum).toBe(secondArtifact.trace.checksum);
    expect(entries[0]?.sourcePackages[0]?.status).toBe("linked");
  });

  it("replaces the same project/checksum entry and keeps a bounded maximum", () => {
    const storage = memoryStorage();
    const artifact = createMatchSmokeTraceArtifact({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: rooftopDojoStage });

    saveStoredTraceEvidence(storage, manifest("One", "nova-boxer"), artifact, { savedAt: "1", maxEntries: 2 });
    saveStoredTraceEvidence(storage, manifest("One", "nova-boxer"), artifact, { savedAt: "2", maxEntries: 2 });
    saveStoredTraceEvidence(storage, manifest("Two", "mira-volt"), artifact, { savedAt: "3", maxEntries: 2 });
    saveStoredTraceEvidence(storage, manifest("Three", "rook-apprentice"), artifact, { savedAt: "4", maxEntries: 2 });

    const entries = listStoredTraceEvidence(storage);
    expect(entries.map((entry) => entry.projectId)).toEqual(["three", "two"]);
    expect(entries).toHaveLength(2);
  });

  it("drops corrupted entries instead of throwing", () => {
    const storage = memoryStorage();
    const goodManifest = manifest("OK", "nova-boxer");
    const artifact = createMatchSmokeTraceArtifact({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: rooftopDojoStage });
    const [good] = saveStoredTraceEvidence(storage, goodManifest, artifact, { savedAt: "now" });
    storage.setItem(
      STUDIO_EVIDENCE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: "mugen-web-sandbox/studio-evidence-index/v0",
        entries: [
          { id: "bad", savedAt: "now", projectId: "bad", projectName: "Bad", artifact: { schemaVersion: "wrong" } },
          good,
        ],
      }),
    );

    expect(listStoredTraceEvidence(storage).map((entry) => entry.projectId)).toEqual(["ok"]);
  });
});

function manifest(name: string, p1: string) {
  const summary = buildStudioProjectSummary({
    fighters: demoFighters,
    selectedP1: p1,
    selectedP2: "mira-volt",
    stage: p1 === "rook-apprentice" ? trainingStage : rooftopDojoStage,
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
  return buildGameProjectManifest({ ...summary, name }, {
    generatedAt: "2026-06-25T00:00:00.000Z",
    sourcePackages: [
      {
        id: `${p1}-source`,
        name: `${p1}.zip`,
        kind: "zip",
        fileCount: 2,
        status: "linked",
        stageIds: [],
        stageDefPaths: [],
        requiredPaths: [`chars/${p1}/${p1}.def`],
      },
    ],
  });
}

function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

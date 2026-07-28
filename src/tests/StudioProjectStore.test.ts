import { describe, expect, it } from "vitest";
import { StudioProjectStore } from "../app/StudioProjectStore";
import { buildGameProjectManifest, buildStudioProjectSummary } from "../app/StudioModel";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";

describe("StudioProjectStore", () => {
  it("keeps revision checks when IndexedDB is unavailable", async () => {
    const store = new StudioProjectStore({ indexedDB: undefined });
    const first = manifest("Memory project", "nova-boxer");
    const saved = await store.save(first, { expectedRevision: 0, savedAt: "2026-07-28T00:00:00.000Z" });

    expect(store.getDiagnostics()).toMatchObject({ backend: "memory", authoritative: false });
    expect(saved).toMatchObject([{ id: first.id, revision: 1 }]);

    await expect(
      store.save({ ...first, name: "Stale" }, { expectedRevision: 0 }),
    ).rejects.toMatchObject({
      code: "project-storage-conflict",
      conflict: { projectId: first.id, expectedRevision: 0, actualRevision: 1 },
    });
  });

  it("imports cache entries and keeps the newest bounded list", async () => {
    const store = new StudioProjectStore({ indexedDB: undefined, maxEntries: 2 });
    const entries = [
      entry(manifest("Old", "nova-boxer"), "2026-07-28T00:00:00.000Z"),
      entry(manifest("New", "mira-volt"), "2026-07-28T02:00:00.000Z"),
      entry(manifest("Newest", "rook-apprentice"), "2026-07-28T03:00:00.000Z"),
    ];

    await store.replace(entries);

    expect((await store.list()).map((project) => project.name)).toEqual(["Newest", "New"]);
    expect((await store.load(entries[2]!.id))?.name).toBe("Newest");
  });
});

function entry(project: ReturnType<typeof manifest>, savedAt: string) {
  return { id: project.id, name: project.name, savedAt, revision: 1, manifest: project };
}

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
  return buildGameProjectManifest({ ...summary, name }, { generatedAt: "2026-07-28T00:00:00.000Z" });
}

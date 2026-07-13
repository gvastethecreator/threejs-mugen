import { describe, expect, it } from "vitest";
import {
  loadStoredProjectManifest,
  listStoredProjects,
  PROJECT_STORAGE_KEY,
  PROJECT_STORAGE_SCHEMA_VERSION,
  saveStoredProjectManifest,
  type StorageLike,
} from "../app/ProjectStorage";
import { buildGameProjectManifest, buildStudioProjectSummary } from "../app/StudioModel";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";

describe("ProjectStorage", () => {
  it("saves, replaces, and loads project manifests by id", () => {
    const storage = memoryStorage();
    const first = manifest("Local Fighting Project", "nova-boxer");
    const replacement = { ...first, name: "Renamed Project" };

    saveStoredProjectManifest(storage, first, { savedAt: "2026-06-25T00:00:00.000Z" });
    saveStoredProjectManifest(storage, replacement, { savedAt: "2026-06-25T01:00:00.000Z" });

    const entries = listStoredProjects(storage);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe("Renamed Project");
    expect(entries[0]?.revision).toBe(2);
    expect(loadStoredProjectManifest(storage, first.id)?.name).toBe("Renamed Project");
  });

  it("keeps recent projects newest-first with a bounded maximum", () => {
    const storage = memoryStorage();

    saveStoredProjectManifest(storage, manifest("One", "nova-boxer"), { savedAt: "1", maxEntries: 2 });
    saveStoredProjectManifest(storage, manifest("Two", "mira-volt"), { savedAt: "2", maxEntries: 2 });
    saveStoredProjectManifest(storage, manifest("Three", "rook-apprentice"), { savedAt: "3", maxEntries: 2 });

    expect(listStoredProjects(storage).map((entry) => entry.id)).toEqual(["three", "two"]);
  });

  it("drops corrupted and incompatible entries instead of throwing", () => {
    const storage = memoryStorage();
    storage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: "mugen-web-sandbox/project-index/v0",
        entries: [
          { id: "bad", name: "Bad", savedAt: "now", manifest: { schemaVersion: "wrong" } },
          { id: "also-bad", name: "Also Bad" },
          { id: "ok", name: "OK", savedAt: "now", manifest: manifest("OK", "nova-boxer") },
        ],
      }),
    );

    expect(listStoredProjects(storage).map((entry) => entry.id)).toEqual(["ok"]);
  });

  it("migrates legacy indexes to v1 without losing valid entries", () => {
    const storage = memoryStorage();
    const saved = manifest("Legacy", "nova-boxer");
    storage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: "mugen-web-sandbox/project-index/v0",
        entries: [{ id: saved.id, name: saved.name, savedAt: "2026-06-25T00:00:00.000Z", manifest: saved }],
      }),
    );

    expect(listStoredProjects(storage)).toMatchObject([{ id: saved.id, revision: 1 }]);
    expect(JSON.parse(storage.getItem(PROJECT_STORAGE_KEY) ?? "{}")).toMatchObject({
      schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION,
      entries: [{ id: saved.id, revision: 1 }],
    });
  });

  it("normalizes missing or invalid v1 revisions to the initial revision", () => {
    const storage = memoryStorage();
    const saved = manifest("Invalid Revision", "mira-volt");
    storage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION,
        entries: [
          { id: saved.id, name: saved.name, savedAt: "2026-06-25T00:00:00.000Z", revision: 0, manifest: saved },
        ],
      }),
    );

    expect(listStoredProjects(storage)).toMatchObject([{ id: saved.id, revision: 1 }]);
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
  return buildGameProjectManifest({ ...summary, name }, { generatedAt: "2026-06-25T00:00:00.000Z" });
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

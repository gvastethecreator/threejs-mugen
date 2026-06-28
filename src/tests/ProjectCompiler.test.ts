import { describe, expect, it } from "vitest";
import { compileGameProjectManifest } from "../app/ProjectCompiler";
import { buildGameProjectManifest, buildStudioProjectSummary } from "../app/StudioModel";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";

describe("ProjectCompiler", () => {
  it("compiles a studio project manifest into the runtime manifest contract", () => {
    const runtimeManifest = compileGameProjectManifest(projectManifest(), {
      generatedAt: "2026-06-25T03:00:00.000Z",
    });

    expect(runtimeManifest.schemaVersion).toBe("mugen-web-sandbox/runtime-manifest/v0");
    expect(runtimeManifest.projectId).toBe("local-fighting-project");
    expect(runtimeManifest.entry).toEqual({ mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: rooftopDojoStage.id });
    expect(runtimeManifest.runtime).toEqual({
      primaryModule: "mugen-compat",
      renderer: "three-render",
      tickRate: 60,
      snapshotContract: "mugen-snapshot/v0",
    });
    expect(runtimeManifest.modules.active.map((module) => module.id)).toEqual(["mugen-compat", "three-render", "studio-workspace"]);
    expect(runtimeManifest.modules.planned.map((module) => module.id)).toEqual(["asset-pipeline", "platformer-module"]);
    expect(runtimeManifest.modules.missing).toEqual([]);
    expect(runtimeManifest.contracts.schemaVersion).toBe("mugen-web-sandbox/shared-engine-contracts/v0");
    expect(runtimeManifest.contracts.sharedContracts).toEqual(["input/v0", "asset/v0", "snapshot/v0", "render/v0", "audio/v0", "debug/v0", "build/v0", "qa/v0"]);
    expect(runtimeManifest.contracts.boundaries.sharedCoreForbidden).toEqual(
      expect.arrayContaining(["CNS", "CMD", "HitDef", "round", "helper", "MUGEN command routing"]),
    );
    expect(runtimeManifest.contracts.verificationCommands.boundary).toBe("pnpm check:boundaries");
    expect(runtimeManifest.modules.planned.find((module) => module.id === "platformer-module")?.forbiddenSharedCoreConcepts).toEqual(
      expect.arrayContaining(["CNS", "HitDef", "round", "helper", "MUGEN command routing"]),
    );
    expect(runtimeManifest.assets.characters).toEqual(["nova-boxer", "mira-volt", "rook-apprentice"]);
  });

  it("warns when requested modules are not executable by the compiler yet", () => {
    const manifest = {
      ...projectManifest(),
      modules: ["mugen-compat", "platformer-module", "mystery-module"],
    };

    const runtimeManifest = compileGameProjectManifest(manifest);

    expect(runtimeManifest.modules.planned.map((module) => module.id)).toEqual(["platformer-module"]);
    expect(runtimeManifest.modules.missing.map((module) => module.id)).toEqual(["mystery-module"]);
    expect(runtimeManifest.diagnostics.warnings).toContain("Module 'platformer-module' is tracked but not runtime-executable yet");
    expect(runtimeManifest.diagnostics.warnings).toContain("Module 'mystery-module' is not registered in the runtime compiler");
    expect(runtimeManifest.diagnostics.warnings).toContain("Project does not request the three-render adapter");
  });

  it("surfaces missing playtest entry assets without rejecting the manifest", () => {
    const manifest = {
      ...projectManifest(),
      assets: {
        characters: ["nova-boxer"],
        stages: [],
        audio: [],
        ui: [],
        effects: [],
      },
    };

    const runtimeManifest = compileGameProjectManifest(manifest);

    expect(runtimeManifest.diagnostics.errors).toEqual([]);
    expect(runtimeManifest.diagnostics.warnings).toContain("Entry P2 'mira-volt' is not listed in assets.characters");
    expect(runtimeManifest.diagnostics.warnings).toContain(`Entry stage '${rooftopDojoStage.id}' is not listed in assets.stages`);
  });
});

function projectManifest() {
  const summary = buildStudioProjectSummary({
    fighters: demoFighters,
    selectedP1: "nova-boxer",
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
  return buildGameProjectManifest(summary, { generatedAt: "2026-06-25T00:00:00.000Z" });
}

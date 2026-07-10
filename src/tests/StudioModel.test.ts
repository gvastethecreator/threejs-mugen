import { describe, expect, it } from "vitest";
import type { MugenCharacter } from "../mugen/model/MugenCharacter";
import { demoFighters, type DemoFighterDefinition } from "../mugen/runtime/demoFighters";
import { rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";
import {
  buildGameProjectManifest,
  buildStudioProjectSummary,
  MAX_PROJECT_NAME_LENGTH,
  normalizeProjectName,
  parseGameProjectManifestJson,
  relinkGameProjectSourcePackages,
  type GameProjectSourcePackage,
  type StudioMotionQa,
} from "../app/StudioModel";

describe("StudioModel", () => {
  it("normalizes project names for persistent authoring", () => {
    expect(normalizeProjectName("  My   MUGEN\nProject  ")).toBe("My MUGEN Project");
    expect(normalizeProjectName("   ")).toBeUndefined();
    expect(normalizeProjectName("x".repeat(MAX_PROJECT_NAME_LENGTH + 12))).toHaveLength(MAX_PROJECT_NAME_LENGTH);
  });

  it("summarizes the current playable project as a modular studio workspace", () => {
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
        "nova-boxer": passQa(),
        "mira-volt": passQa(),
        "rook-apprentice": passQa(),
      },
    });

    expect(summary.projectType).toBe("mugen-port");
    expect(summary.entry).toEqual({ mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: rooftopDojoStage.id });
    expect(summary.stats.generatedAtlases).toBe(3);
    expect(summary.assets.some((asset) => asset.tags.includes("sprite-atlas-builder"))).toBe(true);
    expect(summary.assets.every((asset) => asset.impact.length > 0 && asset.nextAction.label.length > 0)).toBe(true);
    expect(summary.modules.map((module) => module.id)).toContain("studio-workspace");
    expect(summary.modules.every((module) => module.consumes.length > 0 || module.provides.length > 0)).toBe(true);
    expect(summary.modules.find((module) => module.id === "three-render")?.forbiddenSharedCoreConcepts).toEqual(
      expect.arrayContaining(["CNS", "CMD", "HitDef", "MUGEN command routing"]),
    );
    expect(summary.modules.find((module) => module.id === "platformer-module")?.claimBlocked).toContain("HitDef");
    expect(summary.modules.find((module) => module.id === "platformer-module")?.consumes).toEqual(["input/v0", "asset/v0", "build/v0", "qa/v0"]);
    expect(summary.gates.find((gate) => gate.id === "playtest")?.status).toBe("ok");
    expect(summary.gates.find((gate) => gate.id === "mugen-import")?.status).toBe("pending");
    expect(summary.gates.find((gate) => gate.id === "mugen-import")?.blockedBy).toContain("missing-imported-character");
    const architectureGate = summary.gates.find((gate) => gate.id === "architecture-boundaries");
    expect(architectureGate?.status).toBe("ok");
    expect(architectureGate?.affectedSystem).toBe("module");
    expect(architectureGate?.evidenceIds).toEqual(expect.arrayContaining(["test:architecture-boundaries", "module-contracts"]));
    expect(summary.gates.every((gate) => gate.impact.length > 0 && gate.nextAction.label.length > 0)).toBe(true);
  });

  it("promotes imported MUGEN character and stage data into studio assets and gates", () => {
    const imported = importedFighter();
    const character = importedCharacter(imported);
    const summary = buildStudioProjectSummary({
      fighters: [imported, ...demoFighters],
      selectedP1: imported.id,
      selectedP2: "mira-volt",
      stage: rooftopDojoStage,
      stages: [rooftopDojoStage, trainingStage],
      character,
      stageReports: [
        {
          stage: rooftopDojoStage.displayName,
          loaded: true,
          files: { def: true, sff: true, music: false },
          backgrounds: {
            total: 2,
            withSpriteRefs: 2,
            renderedSprites: 1,
            tiled: 1,
            clipped: 0,
            animated: 0,
            renderedAnimated: 0,
            placeholderFallback: 1,
            layers: [
              {
                id: "BG Wall",
                order: 0,
                status: "rendered",
                type: "normal",
                layerNo: 0,
                start: { x: 0, y: 0 },
                delta: { x: 1, y: 1 },
                tiled: true,
                unsupported: [],
                section: "BG Wall",
                sprite: { group: 1, index: 0, decoded: true },
              },
              {
                id: "BG Missing",
                order: 1,
                status: "missing",
                type: "normal",
                layerNo: 0,
                start: { x: 0, y: 0 },
                delta: { x: 1, y: 1 },
                tiled: false,
                unsupported: [],
                section: "BG Missing",
                sprite: { group: 9, index: 9, decoded: false },
                fallback: "Stage sprite 9:9 was not decoded",
              },
            ],
            controllers: {
              groups: 0,
              total: 0,
              parsed: 0,
              bounded: 0,
              unsupported: 0,
              targetedLayers: 0,
              unsupportedTypes: {},
              items: [],
            },
          },
          sff: { decodedSprites: 12, totalSprites: 12, formats: {}, unsupportedFormats: {} },
          unsupported: [],
          warnings: ["one BG placeholder"],
          errors: [],
        },
      ],
      atlasStatusByFighter: {
        "nova-boxer": "loaded",
        "mira-volt": "loaded",
        "rook-apprentice": "loaded",
      },
      atlasMotionQaByFighter: {
        "nova-boxer": passQa(),
        "mira-volt": passQa(),
        "rook-apprentice": passQa(),
      },
    });

    expect(summary.name).toBe("Kung Fu Man");
    expect(summary.stats.importedCharacters).toBe(1);
    expect(summary.stats.importedStages).toBe(1);
    expect(summary.assets.find((asset) => asset.id === "imported-kfm")?.source).toBe("mugen-import");
    expect(summary.assets.find((asset) => asset.id === "imported-kfm")?.nextAction.kind).toBe("open-character-preview");
    expect(summary.assets.find((asset) => asset.id === "kfm:compatibility")?.kind).toBe("report");
    expect(summary.gates.find((gate) => gate.id === "mugen-import")?.status).toBe("ok");
    expect(summary.gates.find((gate) => gate.id === "stage-import")?.status).toBe("warn");
    expect(summary.gates.find((gate) => gate.id === "stage-import")?.nextAction.kind).toBe("open-stage-preview");
  });

  it("builds a project.json-style manifest from the studio summary", () => {
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
        "nova-boxer": passQa(),
        "mira-volt": passQa(),
        "rook-apprentice": passQa(),
      },
    });

    const manifest = buildGameProjectManifest(summary, {
      engineVersion: "test-engine",
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(manifest.schemaVersion).toBe("mugen-web-sandbox/project/v0");
    expect(manifest.id).toBe("local-fighting-project");
    expect(manifest.engineVersion).toBe("test-engine");
    expect(manifest.entry).toEqual(summary.entry);
    expect(manifest.modules).toContain("mugen-compat");
    expect(manifest.sourcePackages).toEqual([]);
    expect(manifest.assets.characters).toEqual(["nova-boxer", "mira-volt", "rook-apprentice"]);
    expect(manifest.assets.stages).toEqual([rooftopDojoStage.id, trainingStage.id]);
    expect(manifest.assetRecords).toHaveLength(summary.assets.length);
    expect(manifest.compatibility.gates).toHaveLength(summary.gates.length);
    expect(manifest.assetRecords[0]?.impact).toContain("Generated fighter");
    expect(manifest.compatibility.gates.find((gate) => gate.id === "visual-qa")?.nextAction.kind).toBe("run-smoke");
  });

  it("preserves source package requirements in project manifests", () => {
    const summary = buildStudioProjectSummary({
      fighters: [importedFighter(), ...demoFighters],
      selectedP1: "imported-kfm",
      selectedP2: "mira-volt",
      stage: rooftopDojoStage,
      stages: [rooftopDojoStage, trainingStage],
      character: importedCharacter(importedFighter()),
      stageReports: [],
      atlasStatusByFighter: {
        "nova-boxer": "loaded",
        "mira-volt": "loaded",
        "rook-apprentice": "loaded",
      },
      atlasMotionQaByFighter: {
        "nova-boxer": passQa(),
        "mira-volt": passQa(),
        "rook-apprentice": passQa(),
      },
    });

    const manifest = buildGameProjectManifest(summary, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      sourcePackages: [
        {
          id: "kfm-official",
          name: "kfm-official.zip",
          kind: "zip",
          fileCount: 9,
          status: "linked",
          characterId: "imported-kfm",
          characterName: "Kung Fu Man",
          defPath: "chars/kfm/kfm.def",
          stageIds: [],
          stageDefPaths: [],
          requiredPaths: ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air"],
        },
      ],
    });

    const parsed = parseGameProjectManifestJson(JSON.stringify(manifest));

    expect(parsed.errors).toEqual([]);
    expect(parsed.manifest?.sourcePackages).toHaveLength(1);
    expect(parsed.manifest?.sourcePackages[0]).toMatchObject({
      name: "kfm-official.zip",
      kind: "zip",
      status: "linked",
      characterName: "Kung Fu Man",
    });
    expect(parsed.manifest?.sourcePackages[0]?.requiredPaths).toContain("chars/kfm/kfm.sff");
  });

  it("relinks source packages when a loaded ZIP provides every required path", () => {
    const sourcePackages = [kfmSourcePackage("missing")];

    const result = relinkGameProjectSourcePackages(sourcePackages, {
      name: "kfm-copy.zip",
      kind: "zip",
      fileCount: 6,
      paths: ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air", "chars/kfm/kfm.cmd", "chars/kfm/kfm.cns"],
    });

    expect(result.warnings).toEqual([]);
    expect(result.linkedIds).toEqual(["kfm-official"]);
    expect(result.sourcePackages[0]).toMatchObject({
      id: "kfm-official",
      name: "kfm-copy.zip",
      status: "linked",
      fileCount: 6,
    });
  });

  it("supports relinking nested archive roots by required path suffix", () => {
    const result = relinkGameProjectSourcePackages([kfmSourcePackage("missing")], {
      name: "archive-with-root.zip",
      kind: "zip",
      fileCount: 5,
      paths: ["release/chars/kfm/kfm.def", "release/chars/kfm/kfm.sff", "release/chars/kfm/kfm.air", "release/chars/kfm/kfm.cmd", "release/chars/kfm/kfm.cns"],
    });

    expect(result.sourcePackages[0]?.status).toBe("linked");
    expect(result.missing).toEqual([]);
  });

  it("keeps source packages missing when relink paths are incomplete", () => {
    const result = relinkGameProjectSourcePackages([kfmSourcePackage("missing")], {
      name: "broken-kfm.zip",
      kind: "zip",
      fileCount: 2,
      paths: ["chars/kfm/kfm.def", "chars/kfm/kfm.air"],
    });

    expect(result.sourcePackages[0]?.status).toBe("missing");
    expect(result.linkedIds).toEqual([]);
    expect(result.missing[0]?.missingPaths).toEqual(["chars/kfm/kfm.sff", "chars/kfm/kfm.cmd", "chars/kfm/kfm.cns"]);
    expect(result.warnings[0]).toContain("could not be relinked");
  });

  it("parses exported project manifests back into the project contract", () => {
    const summary = buildStudioProjectSummary({
      fighters: demoFighters,
      selectedP1: "rook-apprentice",
      selectedP2: "mira-volt",
      stage: trainingStage,
      stages: [rooftopDojoStage, trainingStage],
      stageReports: [],
      atlasStatusByFighter: {
        "nova-boxer": "loaded",
        "mira-volt": "loaded",
        "rook-apprentice": "loaded",
      },
      atlasMotionQaByFighter: {
        "nova-boxer": passQa(),
        "mira-volt": passQa(),
        "rook-apprentice": passQa(),
      },
    });
    const manifest = buildGameProjectManifest(summary, { generatedAt: "2026-06-25T00:00:00.000Z" });

    const parsed = parseGameProjectManifestJson(JSON.stringify(manifest));

    expect(parsed.errors).toEqual([]);
    expect(parsed.manifest?.entry).toEqual({ mode: "match", p1: "rook-apprentice", p2: "mira-volt", stage: trainingStage.id });
    expect(parsed.manifest?.assets.characters).toContain("rook-apprentice");
  });

  it("rejects incompatible project schemas before applying entry data", () => {
    const parsed = parseGameProjectManifestJson(
      JSON.stringify({
        schemaVersion: "other/schema",
        projectType: "mugen-port",
        entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: rooftopDojoStage.id },
      }),
    );

    expect(parsed.manifest).toBeUndefined();
    expect(parsed.errors).toContain("Unsupported project schema other/schema");
  });

  it("accepts old partial manifests with warnings when the entry contract is valid", () => {
    const parsed = parseGameProjectManifestJson(
      JSON.stringify({
        schemaVersion: "mugen-web-sandbox/project/v0",
        projectType: "mugen-port",
        id: "legacy",
        name: "Legacy",
        engineVersion: "old",
        generatedAt: "2026-06-25T00:00:00.000Z",
        modules: ["mugen-compat"],
        entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: rooftopDojoStage.id },
      }),
    );

    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings.length).toBeGreaterThan(0);
    expect(parsed.manifest?.assets.characters).toEqual([]);
    expect(parsed.manifest?.entry.p1).toBe("nova-boxer");
  });

  it("normalizes legacy asset and gate records into actionable Studio records", () => {
    const parsed = parseGameProjectManifestJson(
      JSON.stringify({
        schemaVersion: "mugen-web-sandbox/project/v0",
        projectType: "mugen-port",
        id: "legacy-actionable",
        name: "Legacy Actionable",
        engineVersion: "old",
        generatedAt: "2026-06-25T00:00:00.000Z",
        modules: ["mugen-compat"],
        entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: rooftopDojoStage.id },
        assets: { characters: ["nova-boxer", "mira-volt"], stages: [rooftopDojoStage.id], audio: [], ui: [], effects: [] },
        assetRecords: [
          {
            id: "nova-boxer",
            label: "Nova Boxer",
            kind: "sprite-atlas",
            source: "generated",
            status: "warn",
            detail: "legacy warning",
            tags: ["legacy"],
          },
        ],
        compatibility: {
          gates: [
            {
              id: "visual-qa",
              label: "Visual QA",
              status: "partial",
              detail: "legacy partial",
            },
          ],
          stats: { characters: 2, stages: 1, importedCharacters: 0, importedStages: 0, generatedAtlases: 1 },
        },
      }),
    );

    expect(parsed.errors).toEqual([]);
    expect(parsed.manifest?.assetRecords[0]?.impact).toBeTruthy();
    expect(parsed.manifest?.assetRecords[0]?.nextAction.label).toBeTruthy();
    expect(parsed.manifest?.compatibility.gates[0]?.severity).toBe("warning");
    expect(parsed.manifest?.compatibility.gates[0]?.canExport).toBe(true);
  });
});

function passQa(): StudioMotionQa {
  return { status: "pass", checkedStates: ["walk"], warnings: [], errors: [] };
}

function kfmSourcePackage(status: GameProjectSourcePackage["status"]): GameProjectSourcePackage {
  return {
    id: "kfm-official",
    name: "kfm-official.zip",
    kind: "zip",
    fileCount: 5,
    status,
    characterId: "imported-kfm",
    characterName: "Kung Fu Man",
    defPath: "chars/kfm/kfm.def",
    stageIds: [],
    stageDefPaths: [],
    requiredPaths: ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air", "chars/kfm/kfm.cmd", "chars/kfm/kfm.cns"],
  };
}

function importedFighter(): DemoFighterDefinition {
  return {
    ...demoFighters[0]!,
    id: "imported-kfm",
    source: "imported",
    displayName: "Kung Fu Man",
    animations: new Map(demoFighters[0]!.animations),
    states: [],
    commands: [],
  };
}

function importedCharacter(fighter: DemoFighterDefinition): MugenCharacter {
  return {
    sourceName: "kfm",
    defPath: "chars/kfm/kfm.def",
    definition: {
      info: { displayName: "Kung Fu Man" },
      files: {},
      rawSections: {},
      rawLines: [],
      diagnostics: [],
    },
    files: { states: [], commonStates: [], palettes: [], missing: [] },
    animations: fighter.animations,
    commands: [],
    states: [],
    stateEntryControllers: [],
    spriteArchive: {
      version: "v1",
      sprites: [{ group: 0, index: 0, width: 16, height: 16, axisX: 0, axisY: 0 }],
      metadata: { versionLabel: "SFF v1", spriteTotal: 1 },
    },
    diagnostics: [],
    compatibility: {
      character: "Kung Fu Man",
      loaded: true,
      files: { def: true, sff: true, air: true, cmd: true, cns: true, snd: false },
      animations: { total: 1, loaded: 1, withCollisionBoxes: 1 },
      states: {
        total: 2,
        parsed: 2,
        stateEntries: 1,
        recognizedControllerStates: 1,
        compiled: 1,
        triggerSupported: 1,
        runtimeRoutable: 1,
        executed: 0,
        executable: 1,
      },
      triggers: { total: 2, supported: 1, unsupported: 1, unsupportedFeatures: { enemynear: 1 } },
      controllers: {},
      unsupported: [],
      warnings: [],
      errors: [],
    },
  } as unknown as MugenCharacter;
}

import { describe, expect, it } from "vitest";
import {
  createMugenSelectionManifest,
} from "../mugen/loader/MugenSelectionManifest";
import { loadMugenSelectionImport } from "../mugen/loader/MugenSelectionImport";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import { MatchWorld } from "../mugen/runtime/MatchWorld";
import {
  MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST,
  createMugenSelectDefPlayableFixtureVfs,
  createMugenSelectDefPlayableReimportFixtureVfs,
} from "../mugen/runtime/MugenSelectDefPlayableFixture";

describe("MugenSelectDefPlayableFixture", () => {
  it("loads the manifest-selected two-fighter roster and stage into a real MatchWorld launch", async () => {
    const vfs = createMugenSelectDefPlayableFixtureVfs();
    const manifest = createMugenSelectionManifest({ vfs });
    expect(manifest?.playable.ready).toBe(true);
    if (!manifest) {
      throw new Error("select.def manifest was not created");
    }

    const imported = await loadMugenSelectionImport({
      sourceName: "select-def-fixture",
      vfs,
    });
    const { characters, stages } = imported;
    const fighters = characters.map((character, index) => {
      const fighter = createImportedFighterDefinition(character);
      if (!fighter) {
        throw new Error("fixture character did not create a runtime fighter");
      }
      return { ...fighter, id: "imported-select-" + String(index + 1) };
    });
    const stage = stages[0]?.stage;
    if (!stage || !fighters[0] || !fighters[1]) {
      throw new Error("select.def fixture did not load its launch entries");
    }

    const world = new MatchWorld({ p1: fighters[0], p2: fighters[1], stage });

    expect(characters.map((character) => character.defPath)).toEqual([
      "chars/select-alpha/journey.def",
      "chars/select-beta/journey.def",
    ]);
    expect(stages.map((item) => item.files.def)).toEqual(["stages/skyline-relay/skyline.def"]);
    expect(imported.usesSelectionManifest).toBe(true);
    expect(imported.characterEntries.map((entry) => entry.id)).toEqual(["character-1", "character-2"]);
    expect(world.getSnapshot().actors).toHaveLength(2);
    expect(MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST.license).toBe("CC0-1.0");
  });

  it("retains the existing manual/demo import fallback when select.def is not launch-ready", async () => {
    const vfs = createMugenSelectDefPlayableFixtureVfs();
    vfs.addFile(
      "data/select.def",
      new TextEncoder().encode([
        "[Characters]",
        "select-alpha/journey",
        "../outside",
        "",
        "[Stages]",
        "skyline-relay/skyline",
        "",
      ].join("\n")),
    );

    const imported = await loadMugenSelectionImport({
      sourceName: "select-def-fallback-fixture",
      vfs,
    });

    expect(imported.usesSelectionManifest).toBe(false);
    expect(imported.characters).toHaveLength(1);
    expect(imported.stages).toHaveLength(1);
    expect(imported.manifest?.playable.ready).toBe(false);
    expect(imported.manifest?.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["unsafe-reference"]);
    expect(imported.diagnostics).toEqual([
      "select.def manifest is not launch-ready; retained the existing single-character/manual fallback.",
    ]);
  });

  it("reimport fixture deterministically changes selected roster order and stage identity", async () => {
    const imported = await loadMugenSelectionImport({
      sourceName: "select-def-reimport-fixture",
      vfs: createMugenSelectDefPlayableReimportFixtureVfs(),
    });

    expect(imported.usesSelectionManifest).toBe(true);
    expect(imported.characters.map((character) => character.definition.info.displayName)).toEqual([
      "Select Beta",
      "Select Alpha",
    ]);
    expect(imported.stages.map((stage) => stage.stage.id)).toEqual(["stage-skyline-relay-reimport"]);
  });
});

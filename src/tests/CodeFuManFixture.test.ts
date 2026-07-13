import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { CODE_FUMAN_FIXTURE_MANIFEST } from "../mugen/compatibility/ExternalFixtureManifest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { ZipCharacterSource } from "../mugen/loader/ZipCharacterSource";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import {
  createCodeFuManIndependentQcfXTraceArtifact,
  createCodeFuManIndependentXTraceArtifact,
} from "../mugen/runtime/RuntimeTraceGatePresets";

const fixturePath = resolve(process.cwd(), CODE_FUMAN_FIXTURE_MANIFEST.archive.relativePath);
const itWithCodeFuManFixture = existsSync(fixturePath) ? it : it.skip;

describe("Code Fu Man external fixture", () => {
  itWithCodeFuManFixture("keeps the local archive provenance reproducible", async () => {
    const bytes = readFileSync(fixturePath);
    const zip = await JSZip.loadAsync(bytes);
    const entries = Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map((entry) => entry.name)
      .sort();
    const license = await zip.file(CODE_FUMAN_FIXTURE_MANIFEST.source.licensePath)?.async("string");

    expect(bytes.byteLength).toBe(CODE_FUMAN_FIXTURE_MANIFEST.archive.sizeBytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(CODE_FUMAN_FIXTURE_MANIFEST.archive.sha256);
    expect(entries).toEqual([...CODE_FUMAN_FIXTURE_MANIFEST.archive.requiredEntries]);
    expect(license).toContain("MIT License");
    expect(license).toContain("Copyright (c) 2019 Jesuszilla");
  });

  itWithCodeFuManFixture("loads the independent character through the production loader", async () => {
    const loaded = await loadCodeFuMan();

    expect(loaded.character.definition.info).toMatchObject({
      displayName: CODE_FUMAN_FIXTURE_MANIFEST.expected.displayName,
      author: CODE_FUMAN_FIXTURE_MANIFEST.expected.author,
    });
    expect(loaded.character.defPath).toBe(CODE_FUMAN_FIXTURE_MANIFEST.archive.definitionPath);
    expect(loaded.character.files).toMatchObject({
      cmd: "chars/cfm/kfm.cmd",
      cns: "chars/cfm/kfm.cns",
      commonStates: ["data/common1.cns"],
      sprite: "chars/cfm/kfm.sff",
      anim: "chars/cfm/kfm.air",
      sound: "chars/cfm/kfm.snd",
      palettes: [
        "chars/cfm/kfm6.act",
        "chars/cfm/kfm4.act",
        "chars/cfm/kfm2.act",
        "chars/cfm/kfm5.act",
        "chars/cfm/kfm3.act",
        "chars/cfm/kfm.act",
      ],
    });
    expect(loaded.character.palettes).toHaveLength(CODE_FUMAN_FIXTURE_MANIFEST.expected.paletteCount);
    expect(loaded.character.spriteArchive?.sprites.length).toBeGreaterThan(0);
    expect(loaded.character.soundArchive?.sounds.length).toBeGreaterThan(0);
    expect(loaded.character.compatibility.loaded).toBe(true);
    expect(loaded.character.compatibility.errors).toEqual([]);
    expect([...loaded.character.animations.keys()]).toEqual(
      expect.arrayContaining([...CODE_FUMAN_FIXTURE_MANIFEST.expected.requiredAnimations]),
    );
    expect(loaded.character.commands.map((command) => command.name)).toEqual(
      expect.arrayContaining([...CODE_FUMAN_FIXTURE_MANIFEST.expected.requiredCommands]),
    );
    expect(loaded.character.states.map((state) => state.id)).toEqual(
      expect.arrayContaining([...CODE_FUMAN_FIXTURE_MANIFEST.expected.requiredStates]),
    );
    expect(loaded.imported).toMatchObject({
      source: "imported",
      displayName: "Code Fu Man",
      idleAction: 0,
    });
    expect(loaded.imported.moves.punch.actionId).toBe(200);
  });

  itWithCodeFuManFixture("proves the authored x route in the deterministic runtime trace", async () => {
    const { imported } = await loadCodeFuMan();
    const artifact = createCodeFuManIndependentXTraceArtifact(imported);

    expect(artifact.status).toBe("passed");
    expect(artifact.gates.flatMap((gate) => gate.failures)).toEqual([]);
    expect(artifact.target).toMatchObject({
      id: "codefuman-independent-x-golden",
      source: "mixed",
    });
    expect(artifact.trace.finalActors[0]).toMatchObject({
      source: "imported",
      stateNo: 200,
    });
  });

  itWithCodeFuManFixture("proves the authored QCF_x special route in the deterministic runtime trace", async () => {
    const { imported } = await loadCodeFuMan();
    const artifact = createCodeFuManIndependentQcfXTraceArtifact(imported);

    expect(artifact.status).toBe("passed");
    expect(artifact.gates.flatMap((gate) => gate.failures)).toEqual([]);
    expect(artifact.target).toMatchObject({
      id: "codefuman-independent-qcf-x-golden",
      source: "mixed",
    });
    expect(artifact.trace.finalActors[0]).toMatchObject({
      source: "imported",
    });
    expect(artifact.gates[0]?.evidence.activeCommands).toEqual(expect.arrayContaining(["QCF_x", "x"]));
    expect(artifact.gates[0]?.evidence.routedStates).toContain(1000);
  });
});

async function loadCodeFuMan() {
  const bytes = readFileSync(fixturePath);
  const file = new File([bytes], "codefuman.zip");
  const source = new ZipCharacterSource(file);
  const vfs = await source.load();
  const character = await new MugenCharacterLoader().load(file.name, vfs);
  const imported = createImportedFighterDefinition(character);
  if (!imported) {
    throw new Error("Code Fu Man fixture did not produce an imported fighter");
  }
  return { character, imported };
}

import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { ZipCharacterSource } from "../mugen/loader/ZipCharacterSource";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import {
  createMugenLiteJourneyVfs,
  createMugenLiteJourneyZipBytes,
  MUGEN_LITE_JOURNEY_MANIFEST,
  MUGEN_LITE_JOURNEY_PALETTE_COLORS,
} from "../mugen/runtime/MugenLiteJourneyFixture";
import {
  createMugenLiteJourneyNoKoSlowTraceArtifact,
  createMugenLiteJourneyPaletteTraceArtifact,
  createMugenLiteJourneyTraceArtifact,
} from "../mugen/runtime/RuntimeTraceGatePresets";

describe("MUGEN-lite journey fixture", () => {
  it("loads one repository-owned MUGEN-format package with visible unsupported gaps", async () => {
    const vfs = createMugenLiteJourneyVfs();
    const character = await new MugenCharacterLoader().load(MUGEN_LITE_JOURNEY_MANIFEST.entry, vfs);
    const fighter = createImportedFighterDefinition(character);

    expect(vfs.listFiles()).toEqual([
      "chars/mugen-lite-journey/journey-palette.act",
      "chars/mugen-lite-journey/journey-source.act",
      "chars/mugen-lite-journey/journey.air",
      "chars/mugen-lite-journey/journey.cmd",
      "chars/mugen-lite-journey/journey.cns",
      "chars/mugen-lite-journey/journey.def",
      "chars/mugen-lite-journey/journey.sff",
      "chars/mugen-lite-journey/LICENSE.txt",
    ]);
    expect(MUGEN_LITE_JOURNEY_MANIFEST).toMatchObject({
      schema: "MugenLiteJourneyFixture/v1",
      license: "CC0-1.0",
      licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
      entry: "chars/mugen-lite-journey/journey.def",
    });
    expect(MUGEN_LITE_JOURNEY_MANIFEST.expectedRoutes).toContain("palette");
    expect(vfs.readText(MUGEN_LITE_JOURNEY_MANIFEST.licenseFile)).toContain("SPDX-License-Identifier: CC0-1.0");
    expect(character.compatibility).toMatchObject({
      loaded: true,
      files: { def: true, sff: true, air: true, cmd: true, cns: true },
      palettes: { total: 2, parsed: 2, colors: 512, withTransparency: 0 },
    });
    expect(character.files.palettes).toEqual([
      "chars/mugen-lite-journey/journey-source.act",
      "chars/mugen-lite-journey/journey-palette.act",
    ]);
    expect(character.palettes).toHaveLength(2);
    expect(character.palettes?.map((palette) => ({ group: palette.group, index: palette.index }))).toEqual([
      { group: 1, index: 1 },
      { group: 1, index: 2 },
    ]);
    expect(character.palettes?.[1]?.colors?.slice(1, 4)).toEqual(
      MUGEN_LITE_JOURNEY_PALETTE_COLORS.map(([red, green, blue]) => `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`),
    );
    expect(character.compatibility.unsupported.some((gap) => gap.feature.toLowerCase().includes("journeyunknowncontroller"))).toBe(true);
    expect(fighter).toBeDefined();
    expect(fighter?.source).toBe("imported");
    expect(fighter?.runtimeProgram?.states.some((state) => state.id === 200)).toBe(true);
    expect(fighter?.runtimeProgram?.states.some((state) => state.id === 210)).toBe(true);
    expect(fighter?.animations.has(5200)).toBe(true);
    expect(fighter?.animations.has(210)).toBe(true);
    expect(character.spriteArchive?.sprites).toHaveLength(14);
    expect(character.spriteArchive?.sprites).toEqual(expect.arrayContaining([
      expect.objectContaining({ group: 0, index: 0, width: 32, height: 64, axisX: 16, axisY: 62 }),
      expect.objectContaining({ group: 200, index: 0, width: 32, height: 64, axisX: 16, axisY: 62 }),
      expect.objectContaining({ group: 200, index: 1, width: 32, height: 64, axisX: 16, axisY: 62 }),
      expect.objectContaining({ group: 210, index: 0, width: 32, height: 64, axisX: 16, axisY: 62 }),
      expect.objectContaining({ group: 5100, index: 0, width: 32, height: 64, axisX: 16, axisY: 62 }),
    ]));
    const posePixels = character.spriteArchive!.sprites.map((sprite) => sprite.indexed!.pixels);
    expect(new Set(posePixels.map((pixels) => Array.from(pixels).join(","))).size).toBe(14);
    expect(fighter?.animations.get(200)?.frames.map((frame) => [frame.spriteGroup, frame.spriteIndex, frame.duration]))
      .toEqual([[200, 0, 4], [200, 1, 4]]);
    for (const sprite of character.spriteArchive!.sprites) {
      const pixels = sprite.indexed!.pixels;
      const restsOnAxis = pixels.some((color, offset) => color !== 0 && Math.floor(offset / sprite.width) === sprite.axisY);
      expect(restsOnAxis, `group ${sprite.group} axis contact`).toBe(![40, 5050].includes(sprite.group));
      expect(pixels.some((color, offset) => color !== 0 && Math.floor(offset / sprite.width) > sprite.axisY), `group ${sprite.group} stays above its axis`).toBe(false);
    }
  });

  it("round-trips the legal package through ZIP transport", async () => {
    const bytes = await createMugenLiteJourneyZipBytes();
    const source = new ZipCharacterSource(new File([bytes], "mugen-lite-journey.zip"));
    const vfs = await source.load();
    const character = await new MugenCharacterLoader().load(source.name, vfs);
    const canonical = createMugenLiteJourneyVfs();

    expect(Array.from(new Uint8Array(bytes, 0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(new Uint8Array(await createMugenLiteJourneyZipBytes())).toEqual(new Uint8Array(bytes));
    expect(vfs.listFiles()).toEqual(canonical.listFiles());
    for (const path of canonical.listFiles()) {
      expect(vfs.readBytes(path), path).toEqual(canonical.readBytes(path));
    }
    expect(character.compatibility.loaded).toBe(true);
    expect(source.name).toBe("mugen-lite-journey.zip");
  });

  it("runs the loaded package through one movement, combat, and recovery journey", async () => {
    const artifact = await createMugenLiteJourneyTraceArtifact({ generatedAt: "2026-07-12T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: { id: "mugen-lite-journey-golden", source: "imported" },
      gates: [{ label: "mugen-lite-journey-golden", passed: true, failures: [] }],
    });
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toHaveLength(2);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", stateNo: 200, animNo: 200, observedFrameIndex: 0, moveType: "A", minFrames: 1 },
      { actorId: "p1", source: "imported", stateNo: 200, animNo: 200, observedFrameIndex: 1, moveType: "A", minFrames: 1 },
    ]);
    const attackFrameEvidence = artifact.gates[0]?.evidence.actorFrames.find((frame) =>
      frame.actorId === "p1" && frame.stateNo === 200 && frame.animNo === 200 && frame.frameIndices.length === 2,
    );
    expect(attackFrameEvidence).toMatchObject({ frameIndices: [0, 1], frameIndexCounts: expect.any(Object) });
    expect(attackFrameEvidence?.frameIndexCounts[0]).toBeGreaterThan(0);
    expect(attackFrameEvidence?.frameIndexCounts[1]).toBeGreaterThan(0);
    expect(artifact.gates[0]?.evidence.executedStates).toEqual(expect.arrayContaining([150, 200, 5000, 5050, 5100, 5200]));
    expect(artifact.gates[0]?.evidence.eventCategories).toEqual(expect.arrayContaining(["guard", "hit"]));
    expect(artifact.gates[0]?.evidence.eventLines).toEqual(expect.arrayContaining([
      expect.stringContaining("guarded MUGEN Lite Journey for 10"),
      expect.stringContaining("hit MUGEN Lite Journey for 70"),
    ]));
    expect(artifact.gates[0]?.evidence.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(artifact.trace.finalActors).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "p1", source: "imported", stateNo: 0, life: 1000, ctrl: true }),
      expect.objectContaining({ id: "p2", source: "imported", stateNo: 0, life: 920, ctrl: true }),
    ]));
  });

  it("runs the loaded package through a lethal NoKOSlow post-KO journey", async () => {
    const artifact = await createMugenLiteJourneyNoKoSlowTraceArtifact({ generatedAt: "2026-07-12T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: { id: "mugen-lite-journey-nokoslow-golden", source: "imported" },
      gates: [{ label: "mugen-lite-journey-nokoslow-golden", passed: true, failures: [] }],
    });
    expect(artifact.gates[0]?.requirements.requiredActiveCommands).toEqual(["finisher"]);
    expect(artifact.gates[0]?.evidence.executedControllers.AssertSpecial).toBeGreaterThan(0);
    expect(artifact.gates[0]?.evidence.executedOperations.assertspecial).toBeGreaterThan(0);
    expect(artifact.gates[0]?.evidence.roundFrames).toEqual(expect.arrayContaining([
      expect.objectContaining({ state: "ko", noKoSlow: true, minPlaybackRate: 1, maxPlaybackRate: 1 }),
    ]));
    expect(artifact.trace.finalActors).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "p2", source: "imported", life: 0 }),
    ]));
  });

  it("runs the loaded package through an ACT-backed RemapPal source/destination journey", async () => {
    const artifact = await createMugenLiteJourneyPaletteTraceArtifact({ generatedAt: "2026-07-12T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: { id: "mugen-lite-journey-palette-golden", source: "imported" },
      gates: [{ label: "mugen-lite-journey-palette-golden", passed: true, failures: [] }],
    });
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([{
      actorId: "p1",
      source: "imported",
      actorKind: "player",
      stateNo: 220,
      animNo: 200,
      paletteRemapSourceGroup: 1,
      paletteRemapSourceIndex: 1,
      paletteRemapDestGroup: 1,
      paletteRemapDestIndex: 2,
      minFrames: 1,
    }]);
    expect(artifact.gates[0]?.evidence.actorFrames).toEqual(expect.arrayContaining([
      expect.objectContaining({
        actorId: "p1",
        stateNo: 220,
        animNo: 200,
        paletteRemapSourceGroup: 1,
        paletteRemapSourceIndex: 1,
        paletteRemapDestGroup: 1,
        paletteRemapDestIndex: 2,
      }),
    ]));
    expect(artifact.gates[0]?.evidence.executedOperations["sprite-effect:remappal"]).toBeGreaterThan(0);
  });
});

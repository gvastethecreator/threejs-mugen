import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import {
  createMugenLiteJourneyVfs,
  MUGEN_LITE_JOURNEY_MANIFEST,
} from "../mugen/runtime/MugenLiteJourneyFixture";
import { createMugenLiteJourneyTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("MUGEN-lite journey fixture", () => {
  it("loads one repository-owned MUGEN-format package with visible unsupported gaps", async () => {
    const vfs = createMugenLiteJourneyVfs();
    const character = await new MugenCharacterLoader().load(MUGEN_LITE_JOURNEY_MANIFEST.entry, vfs);
    const fighter = createImportedFighterDefinition(character);

    expect(vfs.listFiles()).toEqual([
      "chars/mugen-lite-journey/journey.air",
      "chars/mugen-lite-journey/journey.cmd",
      "chars/mugen-lite-journey/journey.cns",
      "chars/mugen-lite-journey/journey.def",
      "chars/mugen-lite-journey/journey.sff",
      "chars/mugen-lite-journey/LICENSE.txt",
    ]);
    expect(MUGEN_LITE_JOURNEY_MANIFEST).toMatchObject({
      license: "CC0-1.0",
      licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
      entry: "chars/mugen-lite-journey/journey.def",
    });
    expect(vfs.readText(MUGEN_LITE_JOURNEY_MANIFEST.licenseFile)).toContain("SPDX-License-Identifier: CC0-1.0");
    expect(character.compatibility).toMatchObject({
      loaded: true,
      files: { def: true, sff: true, air: true, cmd: true, cns: true },
    });
    expect(character.compatibility.unsupported.some((gap) => gap.feature.toLowerCase().includes("journeyunknowncontroller"))).toBe(true);
    expect(fighter).toBeDefined();
    expect(fighter?.source).toBe("imported");
    expect(fighter?.runtimeProgram?.states.some((state) => state.id === 200)).toBe(true);
    expect(fighter?.animations.has(5200)).toBe(true);
  });

  it("runs the loaded package through one movement, combat, and recovery journey", async () => {
    const artifact = await createMugenLiteJourneyTraceArtifact({ generatedAt: "2026-07-12T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: { id: "mugen-lite-journey-golden", source: "imported" },
      gates: [{ label: "mugen-lite-journey-golden", passed: true, failures: [] }],
    });
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toHaveLength(2);
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
});

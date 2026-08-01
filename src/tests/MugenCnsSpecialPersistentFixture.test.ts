import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsSpecialPersistentFixtureVfs,
  MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsSpecialPersistentFixture";
import { createMugenCnsSpecialPersistentTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS special-state persistent fixture", () => {
  it("keeps the -2 controller and current states source-located", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST.entry,
      createMugenCnsSpecialPersistentFixtureVfs(),
    );

    expect(character.files.states).toEqual([MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST.statePath]);
    expect(character.states.map((state) => state.id)).toEqual(
      MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST.expectedStates,
    );
    expect(character.states.find((state) => state.id === -2)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "PosAdd",
          params: expect.objectContaining({ persistent: "2" }),
          triggers: expect.arrayContaining([
            expect.objectContaining({ index: 1, expression: "StageTime = 1" }),
            expect.objectContaining({ index: 2, expression: "StageTime = 3" }),
            expect.objectContaining({ index: 3, expression: "StageTime = 4" }),
          ]),
          source: expect.objectContaining({ path: MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST.statePath }),
        }),
      ]),
    );
  });

  it("counts persistent activations in special state -2 across current-state changes", async () => {
    const artifact = await createMugenCnsSpecialPersistentTraceArtifact({
      generatedAt: "2026-07-30T00:00:00.000Z",
    });
    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const specialPosAddEvents = p1Events.filter(
      (event) => event.controller === "PosAdd" &&
        event.stateSource?.path === MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST.statePath,
    );
    expect(specialPosAddEvents.map((event) => event.tick)).toEqual([1, 4]);
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 3, controller: "PosAdd" }),
      ]),
    );
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 1, stateNo: 0, controller: "ChangeState" }),
        expect.objectContaining({ tick: 1, stateNo: 200, controller: "VelSet" }),
      ]),
    );
  });
});

import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsStateMinusOnePersistentFixtureVfs,
  MUGEN_CNS_STATE_MINUS_ONE_PERSISTENT_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsStateMinusOnePersistentFixture";
import { createMugenCnsStateMinusOnePersistentTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS State -1 persistent fixture", () => {
  it("keeps the -1 command controller and current states source-located", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_STATE_MINUS_ONE_PERSISTENT_FIXTURE_MANIFEST.entry,
      createMugenCnsStateMinusOnePersistentFixtureVfs(),
    );

    expect(character.files.cmd).toBe(MUGEN_CNS_STATE_MINUS_ONE_PERSISTENT_FIXTURE_MANIFEST.commandPath);
    expect(character.files.states).toEqual([
      MUGEN_CNS_STATE_MINUS_ONE_PERSISTENT_FIXTURE_MANIFEST.statePath,
    ]);
    expect(character.states.map((state) => state.id)).toEqual(
      MUGEN_CNS_STATE_MINUS_ONE_PERSISTENT_FIXTURE_MANIFEST.expectedStates,
    );
    expect(character.stateEntryControllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "VarSet",
          params: expect.objectContaining({ persistent: "2" }),
          triggers: expect.arrayContaining([
            expect.objectContaining({ index: 1, expression: "StageTime = 1" }),
            expect.objectContaining({ index: 2, expression: "StageTime = 3" }),
            expect.objectContaining({ index: 3, expression: "StageTime = 4" }),
          ]),
        }),
      ]),
    );
  });

  it("counts persistent activations in State -1 across current-state changes", async () => {
    const artifact = await createMugenCnsStateMinusOnePersistentTraceArtifact({
      generatedAt: "2026-07-30T00:00:00.000Z",
    });
    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const stateMinusOneVarSetEvents = p1Events.filter(
      (event) => event.controller === "VarSet",
    );
    expect(stateMinusOneVarSetEvents.map((event) => event.tick)).toEqual([1, 4]);
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 3, controller: "VarSet" }),
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

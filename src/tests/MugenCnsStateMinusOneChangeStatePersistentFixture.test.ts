import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsStateMinusOneChangeStatePersistentFixtureVfs,
  MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsStateMinusOneChangeStatePersistentFixture";
import { createMugenCnsStateMinusOneChangeStatePersistentTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS State -1 ChangeState persistent fixture", () => {
  it("keeps the positive cadence source-located in imported CMD State -1", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_FIXTURE_MANIFEST.entry,
      createMugenCnsStateMinusOneChangeStatePersistentFixtureVfs(),
    );

    expect(character.files.cmd).toBe(
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_FIXTURE_MANIFEST.commandPath,
    );
    expect(character.files.states).toEqual([
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_FIXTURE_MANIFEST.statePath,
    ]);
    expect(character.states.map((state) => state.id)).toEqual(
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_FIXTURE_MANIFEST.expectedStates,
    );
    expect(character.stateEntryControllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "ChangeState",
          params: expect.objectContaining({ persistent: "2", value: "200" }),
          triggers: expect.arrayContaining([
            expect.objectContaining({ index: 1, expression: "StageTime = 1" }),
            expect.objectContaining({ index: 2, expression: "StageTime = 3" }),
            expect.objectContaining({ index: 3, expression: "StageTime = 4" }),
          ]),
        }),
      ]),
    );
  });

  it("counts eligible ChangeState trigger passes across current-state changes", async () => {
    const artifact = await createMugenCnsStateMinusOneChangeStatePersistentTraceArtifact({
      generatedAt: "2026-08-01T00:00:00.000Z",
    });
    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const routed = p1Events.filter(
      (event) =>
        event.controller === "ChangeState" &&
        event.stateNo === 0 &&
        event.name === "cadence route",
    );
    expect(routed.map((event) => event.tick)).toEqual([1, 4]);
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 1, stateNo: 200, controller: "ChangeState" }),
        expect.objectContaining({ tick: 1, stateNo: 201, controller: "VelSet" }),
        expect.objectContaining({ tick: 4, stateNo: 200, controller: "ChangeState" }),
        expect.objectContaining({ tick: 4, stateNo: 201, controller: "VelSet" }),
      ]),
    );
  });
});

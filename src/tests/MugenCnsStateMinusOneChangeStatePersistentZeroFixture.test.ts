import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsStateMinusOneChangeStatePersistentZeroFixtureVfs,
  MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsStateMinusOneChangeStatePersistentZeroFixture";
import { createMugenCnsStateMinusOneChangeStatePersistentZeroTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS State -1 ChangeState persistent zero fixture", () => {
  it("keeps the one-shot ChangeState source-located in imported CMD State -1", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST.entry,
      createMugenCnsStateMinusOneChangeStatePersistentZeroFixtureVfs(),
    );

    expect(character.files.cmd).toBe(
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST.commandPath,
    );
    expect(character.files.states).toEqual([
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath,
    ]);
    expect(character.states.map((state) => state.id)).toEqual(
      MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST.expectedStates,
    );
    expect(character.stateEntryControllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "ChangeState",
          params: expect.objectContaining({ persistent: "0", value: "200" }),
          triggers: expect.arrayContaining([
            expect.objectContaining({ index: 1, expression: "StageTime = 1" }),
            expect.objectContaining({ index: 2, expression: "StageTime = 3" }),
            expect.objectContaining({ index: 3, expression: "StageTime = 4" }),
          ]),
        }),
      ]),
    );
  });

  it("routes the State -1 ChangeState only once across later current-state changes", async () => {
    const artifact = await createMugenCnsStateMinusOneChangeStatePersistentZeroTraceArtifact({
      generatedAt: "2026-08-01T00:00:00.000Z",
    });
    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const routed = p1Events.filter(
      (event) =>
        event.controller === "ChangeState" &&
        event.stateNo === 0 &&
        event.name === "one shot route",
    );
    expect(routed.map((event) => event.tick)).toEqual([1]);
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tick: 1,
          stateNo: 200,
          controller: "ChangeState",
          stateSource: expect.objectContaining({
            path: MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath,
          }),
        }),
        expect.objectContaining({
          tick: 1,
          stateNo: 201,
          controller: "VelSet",
          stateSource: expect.objectContaining({
            path: MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath,
          }),
        }),
      ]),
    );
  });
});

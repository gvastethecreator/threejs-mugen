import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsPersistentFixtureVfs,
  MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsPersistentFixture";
import { createMugenCnsPersistentTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS persistent fixture", () => {
  it("keeps raw positive and unparameterized controllers source-located", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.entry,
      createMugenCnsPersistentFixtureVfs(),
    );

    expect(character.files.states).toEqual([MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.statePath]);
    expect(character.states.map((state) => state.id)).toEqual(MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.expectedStates);
    expect(character.states.find((state) => state.id === 200)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "VelSet",
          params: expect.objectContaining({ persistent: "2" }),
          source: expect.objectContaining({ path: MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.statePath }),
        }),
        expect.objectContaining({
          type: "PosAdd",
          params: expect.not.objectContaining({ persistent: expect.any(String) }),
          source: expect.objectContaining({ path: MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.statePath }),
        }),
      ]),
    );
  });

  it("runs positive cadence on its interval, leaves unparameterized controllers stable, and resets after state entry", async () => {
    const artifact = await createMugenCnsPersistentTraceArtifact({
      generatedAt: "2026-07-30T00:00:00.000Z",
    });
    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const persistentVelSetEvents = p1Events.filter(
      (event) => event.controller === "VelSet" &&
        event.stateSource?.path === MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.statePath,
    );
    expect(persistentVelSetEvents.map((event) => event.tick)).toEqual([1, 3, 4]);

    const regularPosAddEvents = p1Events.filter(
      (event) => event.controller === "PosAdd" &&
        event.stateNo === 200 &&
        event.stateSource?.path === MUGEN_CNS_PERSISTENT_FIXTURE_MANIFEST.statePath,
    );
    expect(regularPosAddEvents.map((event) => event.tick)).toEqual([1, 2, 3, 4]);
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 4, stateNo: 200, controller: "ChangeState" }),
        expect.objectContaining({ tick: 4, stateNo: 201, controller: "VelSet" }),
      ]),
    );
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 2, stateNo: 200, controller: "VelSet" }),
      ]),
    );
  });
});

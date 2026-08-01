import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsPersistentZeroFixtureVfs,
  MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsPersistentZeroFixture";
import { createMugenCnsPersistentZeroTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS persistent zero fixture", () => {
  it("keeps the raw zero parameter source-located", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.entry,
      createMugenCnsPersistentZeroFixtureVfs(),
    );

    expect(character.files.states).toEqual([MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath]);
    expect(character.states.map((state) => state.id)).toEqual(MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.expectedStates);
    expect(character.states.find((state) => state.id === 200)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "PosAdd",
          params: expect.objectContaining({ persistent: "0" }),
          source: expect.objectContaining({ path: MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath }),
        }),
        expect.objectContaining({
          type: "VelSet",
          params: expect.not.objectContaining({ persistent: expect.any(String) }),
          source: expect.objectContaining({ path: MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath }),
        }),
      ]),
    );
  });

  it("runs once, skips repeated scans, resets after state re-entry, and keeps unparameterized controllers live", async () => {
    const artifact = await createMugenCnsPersistentZeroTraceArtifact({
      generatedAt: "2026-07-30T00:00:00.000Z",
    });

    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const zeroPosAddEvents = p1Events.filter(
      (event) => event.controller === "PosAdd" &&
        event.stateSource?.path === MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath,
    );
    expect(zeroPosAddEvents.map((event) => event.tick)).toEqual([1, 4]);

    const regularVelSetEvents = p1Events.filter(
      (event) => event.controller === "VelSet" &&
        event.stateSource?.path === MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath,
    );
    expect(regularVelSetEvents.map((event) => event.tick)).toEqual([1, 2, 3, 4, 4, 5]);
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 4, stateNo: 200, controller: "ChangeState" }),
        expect.objectContaining({ tick: 4, stateNo: 201, controller: "ChangeState" }),
      ]),
    );
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 2, stateNo: 200, controller: "PosAdd" }),
        expect.objectContaining({ tick: 3, stateNo: 200, controller: "PosAdd" }),
        expect.objectContaining({ tick: 5, stateNo: 200, controller: "PosAdd" }),
      ]),
    );
  });
});

import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  createMugenCnsHitPausePersistentZeroFixtureVfs,
  MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST,
} from "../mugen/runtime/MugenCnsHitPausePersistentZeroFixture";
import { createMugenCnsHitPausePersistentZeroTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("M.U.G.E.N CNS HitPause persistent zero fixture", () => {
  it("keeps the paired and unwrapped raw CNS controllers source-located", async () => {
    const character = await new MugenCharacterLoader().load(
      MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.entry,
      createMugenCnsHitPausePersistentZeroFixtureVfs(),
    );

    expect(character.files.states).toEqual([MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath]);
    expect(character.states.map((state) => state.id)).toEqual(
      MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.expectedStates,
    );
    expect(character.states.find((state) => state.id === 200)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "PosAdd",
          params: expect.objectContaining({ ignorehitpause: "1", persistent: "0" }),
          source: expect.objectContaining({ path: MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath }),
        }),
        expect.objectContaining({
          type: "VelSet",
          params: expect.not.objectContaining({ ignorehitpause: expect.any(String) }),
          source: expect.objectContaining({ path: MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath }),
        }),
      ]),
    );
  });

  it("runs the paired controller once per paused state entry and keeps the unwrapped control frozen", async () => {
    const artifact = await createMugenCnsHitPausePersistentZeroTraceArtifact({
      generatedAt: "2026-07-30T00:00:00.000Z",
    });

    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const pairedPosAddEvents = p1Events.filter(
      (event) => event.controller === "PosAdd" &&
        event.stateSource?.path === MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath,
    );
    expect(pairedPosAddEvents.map((event) => event.tick)).toEqual([2, 6]);

    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 1, stateNo: 200, controller: "HitDef" }),
        expect.objectContaining({ tick: 5, stateNo: 200, controller: "ChangeState" }),
        expect.objectContaining({ tick: 6, stateNo: 201, controller: "ChangeState" }),
      ]),
    );
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tick: 3, stateNo: 200, controller: "PosAdd" }),
        expect.objectContaining({ tick: 4, stateNo: 200, controller: "PosAdd" }),
        expect.objectContaining({ tick: 5, stateNo: 200, controller: "PosAdd" }),
        expect.objectContaining({ controller: "VelSet", stateSource: expect.objectContaining({ path: MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST.statePath }) }),
      ]),
    );
    for (const event of pairedPosAddEvents) {
      expect(artifact.trace.frames.find((frame) => frame.tick === event.tick)?.tickSchedule?.branch).toBe("hitpause");
    }
  });
});

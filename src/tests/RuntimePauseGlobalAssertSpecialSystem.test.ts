import { describe, expect, it } from "vitest";
import { RuntimePauseGlobalAssertSpecialWorld } from "../mugen/runtime/RuntimePauseGlobalAssertSpecialSystem";

const world = new RuntimePauseGlobalAssertSpecialWorld();

describe("RuntimePauseGlobalAssertSpecialWorld", () => {
  it("samples root, reserve, and Helper flags at pause entry", () => {
    const snapshot = world.snapshot({
      tick: 17,
      pauseType: "SuperPause",
      phase: "pause-entry",
      actors: [
        actor("p1", ["timerfreeze"]),
        actor("p3", ["roundnotover"]),
        actor("helper-7", ["nokosnd"]),
      ],
    });

    expect(snapshot).toMatchObject({
      schema: "mugen-web-sandbox/runtime-pause-global-assert-special/v0",
      tick: 17,
      pauseType: "SuperPause",
      phase: "pause-entry",
      activeFlags: ["nokosnd", "roundnotover", "timerfreeze"],
      noKoSound: true,
      roundNotOver: true,
      timerFreeze: true,
    });
    expect(snapshot.actorsByFlag.nokosnd).toEqual(["helper-7"]);
  });

  it("does not carry a stale flag into the next pause tick", () => {
    const first = world.snapshot({
      tick: 4,
      pauseType: "Pause",
      phase: "pause-entry",
      actors: [actor("p1", ["timerfreeze"])],
    });
    const next = world.snapshot({
      tick: 5,
      pauseType: "Pause",
      phase: "pause-tick",
      actors: [actor("p1", [])],
    });

    expect(first.timerFreeze).toBe(true);
    expect(next.timerFreeze).toBe(false);
    expect(next.activeFlags).toEqual([]);
    expect(next.unknownFlags).toEqual([]);
  });

  it("reports unsupported global flags without activating them", () => {
    const snapshot = world.snapshot({
      pauseType: "Pause",
      phase: "pause-tick",
      actors: [actor("p1", ["futureflag"])],
    });

    expect(snapshot.activeFlags).toEqual([]);
    expect(snapshot.unknownFlags).toEqual(["futureflag"]);
  });

  it("keeps Pause/SuperPause countdown independent from TimerFreeze", () => {
    const snapshot = world.snapshot({
      pauseType: "SuperPause",
      phase: "pause-tick",
      actors: [actor("p1", ["timerfreeze", "nokosnd", "skipfightdisplay"])],
    });

    expect(world.policy(snapshot)).toEqual({
      freezeFightTimer: true,
      freezePauseTimer: false,
      suppressKoSound: true,
      skipRoundDisplay: false,
      skipFightDisplay: true,
    });
  });
});

function actor(id: string, globalFlags: string[]) {
  return {
    id,
    label: id,
    runtime: {
      assertSpecial: { flags: [], globalFlags },
    },
  };
}

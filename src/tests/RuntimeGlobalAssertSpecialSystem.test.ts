import { describe, expect, it } from "vitest";
import { RuntimeGlobalAssertSpecialWorld } from "../mugen/runtime/RuntimeGlobalAssertSpecialSystem";

describe("RuntimeGlobalAssertSpecialWorld", () => {
  it("aggregates canonical global flags and records deterministic actor sources", () => {
    const world = new RuntimeGlobalAssertSpecialWorld();

    const snapshot = world.snapshot({
      tick: 12,
      actors: [
        actor("p2", { globalFlags: ["NoKOSnd", "roundnotover"] }),
        actor("p1", { globalFlags: ["timerfreeze", "NoKOSlow"] }),
      ],
    });

    expect(snapshot).toEqual({
      schema: "mugen-web-sandbox/runtime-global-assert-special/v0",
      tick: 12,
      activeFlags: ["nokoslow", "nokosnd", "roundnotover", "timerfreeze"],
      actorsByFlag: {
        nokoslow: ["p1"],
        nokosnd: ["p2"],
        roundnotover: ["p2"],
        timerfreeze: ["p1"],
      },
      unknownFlags: [],
      noKoSlow: true,
      noKoSound: true,
      timerFreeze: true,
      roundNotOver: true,
      skipRoundDisplay: false,
      skipFightDisplay: false,
    });
  });

  it("keeps typed compatibility aliases while ignoring unknown global flags", () => {
    const snapshot = new RuntimeGlobalAssertSpecialWorld().snapshot({
      actors: [
        actor("p1", {
          flags: ["RoundNotOver", "TimerFreeze"],
          noKoSlow: true,
          globalFlags: ["futureFlag", "futureFlag"],
          timerFreeze: true,
        }),
      ],
    });

    expect(snapshot.activeFlags).toEqual(["nokoslow", "roundnotover", "timerfreeze"]);
    expect(snapshot.actorsByFlag).toEqual({
      nokoslow: ["p1"],
      roundnotover: ["p1"],
      timerfreeze: ["p1"],
    });
    expect(snapshot.unknownFlags).toEqual(["futureflag"]);
  });

  it("publishes the FightScreen display-skip flags with typed aliases", () => {
    const snapshot = new RuntimeGlobalAssertSpecialWorld().snapshot({
      actors: [
        actor("p1", { globalFlags: ["skiprounddisplay"] }),
        actor("p2", { skipFightDisplay: true }),
      ],
    });

    expect(snapshot.activeFlags).toEqual(["skipfightdisplay", "skiprounddisplay"]);
    expect(snapshot.skipRoundDisplay).toBe(true);
    expect(snapshot.skipFightDisplay).toBe(true);
    expect(snapshot.actorsByFlag).toEqual({
      skipfightdisplay: ["p2"],
      skiprounddisplay: ["p1"],
    });
  });

  it("recomputes per snapshot instead of carrying flags across ticks", () => {
    const world = new RuntimeGlobalAssertSpecialWorld();

    expect(world.snapshot({ tick: 1, actors: [actor("p1", { globalFlags: ["nokosnd"] })] }).noKoSound).toBe(true);
    expect(world.snapshot({ tick: 2, actors: [actor("p1")] })).toMatchObject({
      tick: 2,
      activeFlags: [],
      actorsByFlag: {},
      noKoSound: false,
    });
  });
});

function actor(
  id: string,
  assertSpecial: {
    flags?: string[];
    globalFlags?: string[];
    noKoSlow?: boolean;
    timerFreeze?: boolean;
    skipFightDisplay?: boolean;
  } = {},
) {
  return {
    id,
    label: id.toUpperCase(),
    runtime: {
      assertSpecial: {
        flags: assertSpecial.flags ?? [],
        globalFlags: assertSpecial.globalFlags ?? [],
        noKoSlow: assertSpecial.noKoSlow,
        timerFreeze: assertSpecial.timerFreeze,
        skipFightDisplay: assertSpecial.skipFightDisplay,
      },
    },
  };
}

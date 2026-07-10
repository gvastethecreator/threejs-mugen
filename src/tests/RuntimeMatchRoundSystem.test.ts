import { describe, expect, it } from "vitest";
import { RuntimeMatchRoundWorld } from "../mugen/runtime/RuntimeMatchRoundSystem";
import { RuntimeRoundSystem } from "../mugen/runtime/RuntimeRoundSystem";

describe("RuntimeMatchRoundWorld", () => {
  it("owns the normal match timer tick delegation", () => {
    const round = new RuntimeRoundSystem(61);
    const world = new RuntimeMatchRoundWorld();

    const result = world.tickTimer(round);

    expect(result).toEqual({ frozen: false });
    expect(round.snapshot()).toMatchObject({ state: "fight", timer: 1, message: "Fight" });
    expect(round.isOver).toBe(false);
  });

  it("freezes the round timer while an actor asserts TimerFreeze", () => {
    const round = new RuntimeRoundSystem(61);
    const world = new RuntimeMatchRoundWorld();

    const result = world.tickTimer(round, [
      actor("P1", 700, { globalFlags: ["timerfreeze"], timerFreeze: true }),
      actor("P2", 700),
    ]);

    expect(result).toEqual({ frozen: true });
    expect(round.snapshot()).toMatchObject({ state: "fight", timer: 2, message: "Fight" });
    expect(round.isOver).toBe(false);
  });

  it("owns round-finish side effects for match playing state and logs", () => {
    const round = new RuntimeRoundSystem();
    const logs: string[] = [];
    let playing = true;
    const koSounds: string[] = [];

    const finish = new RuntimeMatchRoundWorld().finishIfNeeded({
      round,
      p1: actor("P1", 700),
      p2: actor("P2", 0),
      stopPlaying: () => {
        playing = false;
      },
      log: (message) => logs.unshift(message),
      emitKoSound: (target) => koSounds.push(target.label),
    });

    expect(finish).toEqual({
      state: "ko",
      winner: "P1",
      message: "P1 wins - press Reset to fight again",
    });
    expect(playing).toBe(false);
    expect(logs).toEqual(["P1 wins - press Reset to fight again"]);
    expect(koSounds).toEqual(["P2"]);
    expect(round.isOver).toBe(true);
  });

  it("emits KO sound for both defeated actors on a double KO", () => {
    const koSounds: string[] = [];

    new RuntimeMatchRoundWorld().finishIfNeeded({
      round: new RuntimeRoundSystem(),
      p1: actor("P1", 0),
      p2: actor("P2", 0),
      stopPlaying: () => undefined,
      log: () => undefined,
      emitKoSound: (target) => koSounds.push(target.label),
    });

    expect(koSounds).toEqual(["P1", "P2"]);
  });

  it("suppresses all KO sounds while NoKOSnd is asserted", () => {
    const koSounds: string[] = [];

    new RuntimeMatchRoundWorld().finishIfNeeded({
      round: new RuntimeRoundSystem(),
      p1: actor("P1", 700, { globalFlags: ["nokosnd"] }),
      p2: actor("P2", 0),
      stopPlaying: () => undefined,
      log: () => undefined,
      emitKoSound: (target) => koSounds.push(target.label),
    });

    expect(koSounds).toEqual([]);
  });

  it("does not emit KO sound when the round ends by time over", () => {
    const koSounds: string[] = [];

    new RuntimeMatchRoundWorld().finishIfNeeded({
      round: new RuntimeRoundSystem(0),
      p1: actor("P1", 700),
      p2: actor("P2", 650),
      stopPlaying: () => undefined,
      log: () => undefined,
      emitKoSound: (target) => koSounds.push(target.label),
    });

    expect(koSounds).toEqual([]);
  });

  it("keeps the round fighting while an actor asserts RoundNotOver", () => {
    const round = new RuntimeRoundSystem(0);
    const logs: string[] = [];
    let playing = true;

    const finish = new RuntimeMatchRoundWorld().finishIfNeeded({
      round,
      p1: actor("P1", 700, { globalFlags: ["roundnotover"], roundNotOver: true }),
      p2: actor("P2", 650),
      stopPlaying: () => {
        playing = false;
      },
      log: (message) => logs.unshift(message),
    });

    expect(finish).toBeUndefined();
    expect(playing).toBe(true);
    expect(logs).toEqual([]);
    expect(round.snapshot()).toMatchObject({ state: "fight", timer: 0, message: "Fight" });
    expect(round.isOver).toBe(false);
  });

  it("does not mutate match state when the round keeps fighting", () => {
    const round = new RuntimeRoundSystem();
    const logs: string[] = [];
    let playing = true;

    const finish = new RuntimeMatchRoundWorld().finishIfNeeded({
      round,
      p1: actor("P1", 700),
      p2: actor("P2", 650),
      stopPlaying: () => {
        playing = false;
      },
      log: (message) => logs.unshift(message),
    });

    expect(finish).toBeUndefined();
    expect(playing).toBe(true);
    expect(logs).toEqual([]);
    expect(round.isOver).toBe(false);
  });
});

type TestMatchRoundActor = {
  label: string;
  runtime: {
    life: number;
    assertSpecial?: { flags: string[]; globalFlags: string[]; timerFreeze?: boolean; roundNotOver?: boolean };
  };
};

function actor(
  label: string,
  life: number,
  assertSpecial?: { flags?: string[]; globalFlags?: string[]; timerFreeze?: boolean; roundNotOver?: boolean },
): TestMatchRoundActor {
  return {
    label,
    runtime: assertSpecial
      ? {
          life,
          assertSpecial: {
            flags: assertSpecial.flags ?? [],
            globalFlags: assertSpecial.globalFlags ?? [],
            timerFreeze: assertSpecial.timerFreeze,
            roundNotOver: assertSpecial.roundNotOver,
          },
        }
      : { life },
  };
}

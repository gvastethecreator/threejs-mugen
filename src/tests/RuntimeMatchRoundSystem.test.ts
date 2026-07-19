import { describe, expect, it } from "vitest";
import { RuntimeMatchRoundWorld } from "../mugen/runtime/RuntimeMatchRoundSystem";
import { resolveRuntimeRoundAnnouncementTiming } from "../mugen/runtime/RuntimeRoundAnnouncementSystem";
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

  it("publishes the intro actor-reset edge after the round timer advances", () => {
    const round = new RuntimeRoundSystem(121, "ikemen-go", {
      startWaitTimeFrames: 4,
      controlTimeFrames: 2,
      shutterTimeFrames: 3,
    });
    const world = new RuntimeMatchRoundWorld();
    round.requestIntroSkip();

    for (let frame = 0; frame < 3; frame += 1) {
      expect(world.tickTimer(round)).toEqual({ frozen: false });
    }

    expect(world.tickTimer(round)).toEqual({ frozen: false, introSkipResetReady: true });
    expect(world.tickTimer(round)).toEqual({ frozen: false });
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

  it("forwards global FightScreen display-skip flags to the announcement clock", () => {
    const round = new RuntimeRoundSystem(61, "ikemen-go", {
      announcement: resolveRuntimeRoundAnnouncementTiming({ roundTimeFrames: 4 }),
    });
    const world = new RuntimeMatchRoundWorld();

    world.tickTimer(round, [
      actor("P1", 700, { globalFlags: ["skiprounddisplay", "skipfightdisplay"] }),
      actor("P2", 700),
    ]);

    expect(round.snapshot().announcement).toMatchObject({
      visibility: "visible",
      phase: "hidden",
      roundDisplaySkipped: true,
      fightDisplaySkipped: true,
      round: { skipped: true },
      fight: { skipped: true },
    });
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
    expect(playing).toBe(true);
    expect(logs).toEqual(["P1 wins - press Reset to fight again"]);
    expect(koSounds).toEqual(["P2"]);
    expect(round.isOver).toBe(false);
  });

  it("stops playing only after the post-KO timeline completes", () => {
    const round = new RuntimeRoundSystem();
    const world = new RuntimeMatchRoundWorld();
    let playing = true;
    world.finishIfNeeded({
      round,
      p1: actor("P1", 700),
      p2: actor("P2", 0),
      stopPlaying: () => { playing = false; },
      log: () => undefined,
    });

    for (let frame = 0; frame < 254; frame += 1) world.advanceTimer(round);
    expect(playing).toBe(true);
    world.advanceTimer(round, [], () => { playing = false; });
    expect(playing).toBe(false);
  });

  it("advances post-KO while TimerFreeze remains asserted", () => {
    const round = new RuntimeRoundSystem();
    const world = new RuntimeMatchRoundWorld();
    const frozenActor = actor("P1", 700, { globalFlags: ["timerfreeze"] });
    round.finishIfNeeded({ label: "P1", life: 700 }, { label: "P2", life: 0 });

    for (let frame = 0; frame < 255; frame += 1) world.advanceTimer(round, [frozenActor]);

    expect(round.isOver).toBe(true);
    expect(round.snapshot().postRound).toMatchObject({ frame: 255, remaining: 0 });
  });

  it("holds the phase-4 post-KO clock while RoundNotOver stays asserted", () => {
    const round = new RuntimeRoundSystem();
    const world = new RuntimeMatchRoundWorld();
    let playing = true;
    round.finishIfNeeded({ label: "P1", life: 700 }, { label: "P2", life: 0 });

    for (let frame = 0; frame < 45; frame += 1) world.advanceTimer(round);

    expect(round.currentPhase).toBe(4);
    const beforeHold = round.snapshot().postRound;
    const result = world.advanceTimer(
      round,
      [actor("P1", 700, { globalFlags: ["roundnotover"] })],
      () => { playing = false; },
    );

    expect(result).toEqual({ frozen: false, held: true });
    expect(round.snapshot().postRound).toMatchObject({
      frame: beforeHold?.frame,
      remaining: beforeHold?.remaining,
    });
    expect(round.isOver).toBe(false);
    expect(playing).toBe(true);

    expect(world.advanceTimer(round)).toEqual({ frozen: false });
    expect(round.snapshot().postRound?.frame).toBe((beforeHold?.frame ?? 0) + 1);
  });

  it("passes imported phase-4 readiness through the timer boundary", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 6,
      postKoFrames: 8,
    });
    const world = new RuntimeMatchRoundWorld();
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 700 }, { label: "P2", life: 0 });

    world.advanceTimer(round, [], undefined, 0, { phase4Ready: false });
    world.advanceTimer(round, [], undefined, 0, { phase4Ready: false });
    expect(round.currentPhase).toBe(3);

    world.advanceTimer(round, [], undefined, 0, { phase4Ready: true });
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });
  });

  it("holds the phase-4 time-over clock while RoundNotOver stays asserted", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", { postKoPhase4StartFrames: 1, postKoFrames: 3 });
    const world = new RuntimeMatchRoundWorld();
    let playing = true;
    round.tickTimer();

    expect(world.finishIfNeeded({
      round,
      p1: actor("P1", 700),
      p2: actor("P2", 700),
      stopPlaying: () => { playing = false; },
      log: () => undefined,
    })).toMatchObject({ state: "timeover", winner: "Draw" });

    expect(world.advanceTimer(round)).toEqual({ frozen: false });
    expect(round.currentPhase).toBe(4);
    const beforeHold = round.snapshot().postRound;
    expect(world.advanceTimer(
      round,
      [actor("P1", 700, { globalFlags: ["roundnotover"], roundNotOver: true })],
      () => { playing = false; },
    )).toEqual({ frozen: false, held: true });

    expect(round.snapshot().postRound).toMatchObject({
      frame: beforeHold?.frame,
      remaining: beforeHold?.remaining,
    });
    expect(round.isOver).toBe(false);
    expect(playing).toBe(true);
  });

  it("captures actor NoKOSlow policy on the first KO frame", () => {
    const round = new RuntimeRoundSystem();
    new RuntimeMatchRoundWorld().finishIfNeeded({
      round,
      p1: actor("P1", 700, { globalFlags: ["nokoslow"] }),
      p2: actor("P2", 0),
      stopPlaying: () => undefined,
      log: () => undefined,
    });

    expect(round.snapshot().postRound).toMatchObject({ playbackRate: 1, noKoSlow: true });
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

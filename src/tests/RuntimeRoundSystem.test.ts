import { describe, expect, it } from "vitest";
import {
  DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES,
  DEFAULT_RUNTIME_POST_KO_FRAMES,
  resolveRuntimeRoundTiming,
  RuntimeRoundSystem,
} from "../mugen/runtime/RuntimeRoundSystem";

describe("RuntimeRoundSystem", () => {
  it("owns the fight timer snapshot without ending a live round", () => {
    const round = new RuntimeRoundSystem(61);

    expect(round.snapshot()).toEqual({
      state: "fight",
      timer: 2,
      winner: undefined,
      message: "Fight",
    });

    round.tickTimer();

    expect(round.snapshot()).toMatchObject({ state: "fight", timer: 1, message: "Fight" });
    expect(round.isOver).toBe(false);
  });

  it("finishes a KO round and emits the previous runtime message", () => {
    const round = new RuntimeRoundSystem();

    const result = round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    expect(result).toEqual({
      state: "ko",
      winner: "P1",
      message: "P1 wins - press Reset to fight again",
    });
    expect(round.snapshot()).toEqual({
      state: "ko",
      timer: 99,
      roundPhase: 3,
      winner: "P1",
      message: "P1 wins",
      postRound: {
        schema: "RuntimePostRound/v0",
        frame: 0,
        remaining: 255,
        duration: 255,
        slowRemaining: 60,
        slowDuration: 60,
        playbackRate: 0.25,
        noKoSlow: false,
      },
    });
    expect(round.isOver).toBe(false);
    expect(round.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 600 })).toBeUndefined();
  });

  it("advances the bounded KO slowdown and fades back to normal speed", () => {
    const round = new RuntimeRoundSystem();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    expect(round.snapshot().postRound).toMatchObject({ frame: 0, remaining: 255, slowRemaining: 60, playbackRate: 0.25, noKoSlow: false });
    for (let frame = 0; frame < 16; frame += 1) round.tickTimer();
    expect(round.snapshot().postRound).toMatchObject({ frame: 16, remaining: 239, slowRemaining: 44 });
    expect(round.playbackRate).toBeGreaterThan(0.25);
    for (let frame = 16; frame < 60; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(false);
    expect(round.playbackRate).toBe(1);
    expect(round.snapshot().postRound).toMatchObject({ remaining: 195, slowRemaining: 0 });
    for (let frame = 60; frame < 255; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(true);
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot()).toMatchObject({ roundPhase: 4 });
  });

  it("opens phase 4 before the post-KO terminal window completes", () => {
    const round = new RuntimeRoundSystem();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    for (let frame = 0; frame < DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES - 1; frame += 1) {
      round.tickTimer();
    }

    expect(round.currentPhase).toBe(3);
    expect(round.isOver).toBe(false);

    round.tickTimer();

    expect(round.currentPhase).toBe(4);
    expect(round.isOver).toBe(false);
    expect(round.snapshot().postRound).toMatchObject({
      frame: DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES,
      remaining: DEFAULT_RUNTIME_POST_KO_FRAMES - DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES,
    });
  });

  it("derives phase-4 timing from normalized source-backed overrides", () => {
    const timing = resolveRuntimeRoundTiming({
      overHitTimeFrames: 1,
      postKoPhase4StartFrames: 2,
      winPoseFrames: 3,
      postKoFrames: 7,
      koSlowFrames: 4,
      koSlowFadeFrames: 99,
      koSlowRate: 2,
    });
    expect(timing).toEqual({
      overHitTimeFrames: 1,
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 0,
      winPoseFrames: 3,
      postKoFrames: 7,
      koSlowFrames: 4,
      koSlowFadeFrames: 4,
      koSlowRate: 1,
    });
    expect(resolveRuntimeRoundTiming({ overHitTimeFrames: 12, postKoPhase4StartFrames: 2 }).overHitTimeFrames).toBe(12);

    const round = new RuntimeRoundSystem(undefined, "ikemen-go", timing);
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });
    round.tickTimer();
    expect(round.currentPhase).toBe(3);
    round.tickTimer();

    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 5, duration: 7, slowDuration: 4 });
    expect(round.winPoseFrames).toBe(3);
  });

  it("holds phase 4 at the wait boundary until imported actors are ready or force time expires", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      overHitTimeFrames: 1,
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 3,
      postKoFrames: 8,
    });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 0 });

    round.tickTimer({ phase4Ready: false });
    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(3);
    expect(round.roundNoDamage).toBe(true);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });

    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(3);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });

    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });
  });

  it("releases a held phase-4 boundary as soon as actors become ready", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 10,
      postKoFrames: 8,
    });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 0 });

    round.tickTimer({ phase4Ready: false });
    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(3);

    round.tickTimer({ phase4Ready: true });
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });
  });

  it("opens the official no-damage interval through the wait boundary", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      overHitTimeFrames: 2,
      postKoPhase4StartFrames: 4,
      postKoFrames: 6,
    });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 500 });

    expect(round.roundNoDamage).toBe(false);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(false);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(true);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(true);
    round.tickTimer();
    expect(round.currentPhase).toBe(4);
    expect(round.roundNoDamage).toBe(true);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(false);
  });

  it("captures NoKOSlow on the KO frame without shortening the post-round window", () => {
    const round = new RuntimeRoundSystem();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 }, { noKoSlow: true });

    expect(round.snapshot().postRound).toMatchObject({ remaining: 255, slowRemaining: 60, playbackRate: 1, noKoSlow: true });
    for (let frame = 0; frame < 254; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(false);
    expect(round.tickTimer()).toEqual({ finishedNow: true });
  });

  it("keeps double-KO and time-over draw wording distinct", () => {
    const ko = new RuntimeRoundSystem();
    expect(ko.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 0 })?.message).toBe(
      "Double KO - press Reset to fight again",
    );

    const time = new RuntimeRoundSystem(1);
    time.tickTimer();

    expect(time.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 500 })).toEqual({
      state: "timeover",
      winner: "Draw",
      message: "Time over - draw - press Reset to fight again",
    });
    expect(time.snapshot()).toMatchObject({ roundPhase: 3 });
  });

  it("keeps time-over in the post-round window until the terminal draw frame", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 2,
      postKoFrames: 4,
    });
    round.tickTimer();

    expect(round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 500 })).toMatchObject({
      state: "timeover",
      winner: "Draw",
    });
    expect(round.isOver).toBe(false);
    expect(round.snapshot()).toMatchObject({
      state: "timeover",
      roundPhase: 3,
      postRound: { frame: 0, remaining: 4, duration: 4, playbackRate: 1 },
    });

    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ roundPhase: 3, postRound: { frame: 1, remaining: 3 } });
    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ roundPhase: 4, postRound: { frame: 2, remaining: 2 } });
    round.tickTimer();
    expect(round.isOver).toBe(false);
    expect(round.snapshot()).toMatchObject({ postRound: { frame: 3, remaining: 1 } });
    expect(round.tickTimer()).toEqual({ finishedNow: true });
    expect(round.isOver).toBe(true);
    expect(round.snapshot()).toMatchObject({ roundPhase: 4, postRound: { frame: 4, remaining: 0 } });
  });

  it("resets mutable round state for MatchWorld reset", () => {
    const round = new RuntimeRoundSystem(1);
    round.tickTimer();
    expect(round.finishIfNeeded({ label: "P1", life: 100 }, { label: "P2", life: 100 })?.state).toBe("timeover");

    round.reset();

    expect(round.isOver).toBe(false);
    expect(round.snapshot()).toEqual({
      state: "fight",
      timer: 99,
      winner: undefined,
      message: "Fight",
    });
  });

  it("tracks the next round without changing the initial-round snapshot contract", () => {
    const round = new RuntimeRoundSystem(1, "unknown", { postKoPhase4StartFrames: 1, postKoFrames: 1 });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 100 }, { label: "P2", life: 100 });
    expect(round.isOver).toBe(false);
    expect(round.tickTimer()).toEqual({ finishedNow: true });

    round.startNextRound(120);

    expect(round.isOver).toBe(false);
    expect(round.currentRoundNo).toBe(2);
    expect(round.roundsExisted).toBe(1);
    expect(round.snapshot()).toMatchObject({
      state: "fight",
      timer: 2,
      roundNo: 2,
      roundsExisted: 1,
    });
  });
});

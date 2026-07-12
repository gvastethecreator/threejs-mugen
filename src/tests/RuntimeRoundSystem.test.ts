import { describe, expect, it } from "vitest";
import { RuntimeRoundSystem } from "../mugen/runtime/RuntimeRoundSystem";

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
});

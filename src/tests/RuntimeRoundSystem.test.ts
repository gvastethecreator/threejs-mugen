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
    });
    expect(round.isOver).toBe(true);
    expect(round.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 600 })).toBeUndefined();
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

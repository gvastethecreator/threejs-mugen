import { describe, expect, it } from "vitest";
import { RuntimeMatchRoundWorld } from "../mugen/runtime/RuntimeMatchRoundSystem";
import { RuntimeRoundSystem } from "../mugen/runtime/RuntimeRoundSystem";

describe("RuntimeMatchRoundWorld", () => {
  it("owns the normal match timer tick delegation", () => {
    const round = new RuntimeRoundSystem(61);
    const world = new RuntimeMatchRoundWorld();

    world.tickTimer(round);

    expect(round.snapshot()).toMatchObject({ state: "fight", timer: 1, message: "Fight" });
    expect(round.isOver).toBe(false);
  });

  it("owns round-finish side effects for match playing state and logs", () => {
    const round = new RuntimeRoundSystem();
    const logs: string[] = [];
    let playing = true;

    const finish = new RuntimeMatchRoundWorld().finishIfNeeded({
      round,
      p1: actor("P1", 700),
      p2: actor("P2", 0),
      stopPlaying: () => {
        playing = false;
      },
      log: (message) => logs.unshift(message),
    });

    expect(finish).toEqual({
      state: "ko",
      winner: "P1",
      message: "P1 wins - press Reset to fight again",
    });
    expect(playing).toBe(false);
    expect(logs).toEqual(["P1 wins - press Reset to fight again"]);
    expect(round.isOver).toBe(true);
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

function actor(label: string, life: number): { label: string; runtime: { life: number } } {
  return { label, runtime: { life } };
}

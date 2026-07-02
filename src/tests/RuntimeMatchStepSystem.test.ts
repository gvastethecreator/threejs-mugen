import { describe, expect, it } from "vitest";
import { RuntimeMatchStepWorld, runtimeMatchStepIterations } from "../mugen/runtime/RuntimeMatchStepSystem";

describe("RuntimeMatchStepWorld", () => {
  it("returns a snapshot without ticking frame clock when playback is stopped", () => {
    const calls: string[] = [];

    const result = new RuntimeMatchStepWorld().step({
      playing: false,
      frameClock: 4,
      speed: 1,
      isRoundOver: () => {
        calls.push("round");
        return false;
      },
      advanceOneTick: () => calls.push("advance"),
      snapshot: () => {
        calls.push("snapshot");
        return { tick: 10 };
      },
    });

    expect(result).toEqual({
      frameClock: 4,
      iterations: 0,
      advancedTicks: 0,
      snapshot: { tick: 10 },
    });
    expect(calls).toEqual(["snapshot"]);
  });

  it("forces one tick even when playback is stopped", () => {
    const calls: string[] = [];

    const result = new RuntimeMatchStepWorld().step({
      playing: false,
      force: true,
      frameClock: 4,
      speed: 4,
      isRoundOver: () => {
        calls.push("round");
        return false;
      },
      advanceOneTick: () => calls.push("advance"),
      snapshot: () => {
        calls.push("snapshot");
        return "forced";
      },
    });

    expect(result).toEqual({
      frameClock: 5,
      iterations: 1,
      advancedTicks: 1,
      snapshot: "forced",
    });
    expect(calls).toEqual(["round", "advance", "snapshot"]);
  });

  it("owns speed sampling and stops iteration when the round is over", () => {
    const calls: string[] = [];
    let roundChecks = 0;

    const result = new RuntimeMatchStepWorld().step({
      playing: true,
      frameClock: 11,
      speed: 3,
      isRoundOver: () => {
        calls.push("round");
        roundChecks += 1;
        return roundChecks > 2;
      },
      advanceOneTick: () => calls.push("advance"),
      snapshot: () => {
        calls.push("snapshot");
        return { calls: calls.length };
      },
    });

    expect(result).toEqual({
      frameClock: 12,
      iterations: 3,
      advancedTicks: 2,
      snapshot: { calls: 6 },
    });
    expect(calls).toEqual(["round", "advance", "round", "advance", "round", "snapshot"]);
  });

  it("keeps sub-1x speed on frame-clock divisors", () => {
    expect(runtimeMatchStepIterations(0.5, 1)).toBe(0);
    expect(runtimeMatchStepIterations(0.5, 2)).toBe(1);
    expect(runtimeMatchStepIterations(0.25, 3)).toBe(0);
    expect(runtimeMatchStepIterations(0.25, 4)).toBe(1);
  });
});

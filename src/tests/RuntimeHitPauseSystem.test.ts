import { describe, expect, it } from "vitest";
import { RuntimeHitPauseWorld, type RuntimeHitPauseActor } from "../mugen/runtime/RuntimeHitPauseSystem";

describe("RuntimeHitPauseWorld", () => {
  it("owns global hitpause command buffering, ignored-controller, presentation, and countdown order", () => {
    const world = new RuntimeHitPauseWorld();
    const p1 = actor("p1", 2);
    const p2 = actor("p2", 1);
    const calls: string[] = [];

    const result = world.advance({
      p1,
      p2,
      p1Input: new Set(["x"]),
      p2Input: new Set(["B"]),
      pushCommandBuffer: (fighter, input) => calls.push(`buffer:${fighter.id}:${[...input].join("+")}`),
      runIgnoredControllers: (fighter, opponent) => calls.push(`ignored:${fighter.id}:${opponent.id}`),
      advancePausedPresentation: (fighter) => calls.push(`presentation:${fighter.id}`),
    });

    expect(calls).toEqual([
      "buffer:p1:x",
      "buffer:p2:B",
      "ignored:p1:p2",
      "ignored:p2:p1",
      "presentation:p1",
      "presentation:p2",
    ]);
    expect(result).toEqual({ paused: true, globalPause: 2, p1Remaining: 1, p2Remaining: 0 });
    expect(p1.hitPause).toBe(1);
    expect(p2.hitPause).toBe(0);
  });

  it("does not run callbacks when both actors are outside hitpause", () => {
    const world = new RuntimeHitPauseWorld();
    const p1 = actor("p1", 0);
    const p2 = actor("p2", 0);
    const calls: string[] = [];

    const result = world.advance({
      p1,
      p2,
      p1Input: new Set(["x"]),
      p2Input: new Set(["B"]),
      pushCommandBuffer: () => calls.push("buffer"),
      runIgnoredControllers: () => calls.push("ignored"),
      advancePausedPresentation: () => calls.push("presentation"),
    });

    expect(calls).toEqual([]);
    expect(result).toEqual({ paused: false, globalPause: 0, p1Remaining: 0, p2Remaining: 0 });
  });
});

function actor(id: string, hitPause: number): RuntimeHitPauseActor & { id: string } {
  return { id, hitPause };
}

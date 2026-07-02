import { describe, expect, it } from "vitest";
import { RuntimeMatchHitPauseWorld } from "../mugen/runtime/RuntimeMatchHitPauseSystem";
import type { RuntimeHitPauseRuntimeActor } from "../mugen/runtime/RuntimeHitPauseSystem";

describe("RuntimeMatchHitPauseWorld", () => {
  it("owns active-match hitpause handoff and returns the delegate pause result", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p1Input = new Set(["x"]);
    const p2Input = new Set(["B"]);
    const calls: string[] = [];

    const result = new RuntimeMatchHitPauseWorld().advanceRuntime({
      hitPauseWorld: {
        advanceRuntime: (input) => {
          calls.push(
            [
              input.p1.id,
              input.p2.id,
              [...input.p1Input].join("+"),
              [...input.p2Input].join("+"),
              input.tick,
              input.stageTime,
              input.runtimeTick,
              input.stage.bounds.left,
              input.stage.bounds.right,
            ].join(":"),
          );
          input.runIgnoredControllers(input.p1, input.p2);
          return { paused: true, globalPause: 4, p1Remaining: 3, p2Remaining: 0 };
        },
      },
      p1,
      p2,
      p1Input,
      p2Input,
      tick: 18,
      stage: { bounds: { left: -160, right: 160 } },
      stageTime: 19,
      runtimeTick: 20,
      effectLifecycleWorld: {
        advancePausedPresentation: () => undefined,
      },
      runIgnoredControllers: (actor, opponent) => calls.push(`ignored:${actor.id}:${opponent.id}`),
    });

    expect(calls).toEqual(["p1:p2:x:B:18:19:20:-160:160", "ignored:p1:p2"]);
    expect(result).toEqual({ paused: true, globalPause: 4, p1Remaining: 3, p2Remaining: 0 });
  });

  it("preserves the delegate not-paused result", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");

    const result = new RuntimeMatchHitPauseWorld().advanceRuntime({
      hitPauseWorld: {
        advanceRuntime: () => ({ paused: false, globalPause: 0, p1Remaining: 0, p2Remaining: 0 }),
      },
      p1,
      p2,
      p1Input: new Set(),
      p2Input: new Set(),
      tick: 3,
      stage: { bounds: { left: -100, right: 100 } },
      effectLifecycleWorld: {
        advancePausedPresentation: () => undefined,
      },
      runIgnoredControllers: () => undefined,
    });

    expect(result).toEqual({ paused: false, globalPause: 0, p1Remaining: 0, p2Remaining: 0 });
  });
});

function actor(id: string): RuntimeHitPauseRuntimeActor & { id: string } {
  return {
    id,
    hitPause: 0,
    commandBuffer: {
      push: () => undefined,
    },
    runtime: {
      pos: { x: 0, y: 0 },
      facing: 1,
      stateNo: 0,
      moveType: "I",
    },
    effectActorWorld: {
      advanceActiveEffects: () => undefined,
      advancePresentationEffects: () => undefined,
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
    },
  } as RuntimeHitPauseRuntimeActor & { id: string };
}

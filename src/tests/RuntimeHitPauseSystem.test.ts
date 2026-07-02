import { describe, expect, it } from "vitest";
import {
  RuntimeHitPauseWorld,
  type RuntimeHitPauseActor,
  type RuntimeHitPauseRuntimeActor,
} from "../mugen/runtime/RuntimeHitPauseSystem";

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

  it("wires runtime command buffering and paused presentation", () => {
    const world = new RuntimeHitPauseWorld();
    const calls: string[] = [];
    const pausedLifecycleOptions: Array<{
      actorId: string;
      pauseKind: string;
      opponentId?: string;
      opponents: string[];
      stageTime?: number;
      runtimeTick?: number;
    }> = [];
    const p1 = runtimeActor("p1", 2, calls);
    const p2 = runtimeActor("p2", 1, calls);

    const result = world.advanceRuntime({
      p1,
      p2,
      p1Input: new Set(["x"]),
      p2Input: new Set(["B"]),
      tick: 22,
      stage: { bounds: { left: -160, right: 160 } },
      stageTime: 71,
      runtimeTick: 72,
      effectLifecycleWorld: {
        advancePausedPresentation: (actor, pauseKind, _stage, opponent, options) => {
          calls.push(`presentation:${actor.id}:${pauseKind}`);
          pausedLifecycleOptions.push({
            actorId: actor.id,
            pauseKind,
            opponentId: opponent?.id,
            opponents: options?.opponents?.map((entry) => entry.id ?? "none") ?? [],
            stageTime: options?.stageTime,
            runtimeTick: options?.runtimeTick,
          });
        },
      },
      runIgnoredControllers: (fighter, opponent) => calls.push(`ignored:${fighter.id}:${opponent.id}`),
    });

    expect(calls).toEqual([
      "buffer:p1:22:x:true",
      "buffer:p2:22:B:true",
      "ignored:p1:p2",
      "ignored:p2:p1",
      "presentation:p1:hitpause",
      "presentation:p2:hitpause",
    ]);
    expect(pausedLifecycleOptions).toEqual([
      { actorId: "p1", pauseKind: "hitpause", opponentId: "p2", opponents: ["p2"], stageTime: 71, runtimeTick: 72 },
      { actorId: "p2", pauseKind: "hitpause", opponentId: "p1", opponents: ["p1"], stageTime: 71, runtimeTick: 72 },
    ]);
    expect(result).toEqual({ paused: true, globalPause: 2, p1Remaining: 1, p2Remaining: 0 });
  });
});

function actor(id: string, hitPause: number): RuntimeHitPauseActor & { id: string } {
  return { id, hitPause };
}

function runtimeActor(id: string, hitPause: number, commandCalls: string[]): RuntimeHitPauseRuntimeActor & {
  id: string;
  commandCalls: string[];
} {
  return {
    id,
    hitPause,
    commandCalls,
    commandBuffer: {
      push: (frame, values, options) =>
        commandCalls.push(`buffer:${id}:${frame}:${[...values].join("+")}:${Boolean(options?.hitPause)}`),
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
  } as RuntimeHitPauseRuntimeActor & { id: string; commandCalls: string[] };
}

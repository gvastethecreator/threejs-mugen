import { describe, expect, it } from "vitest";
import type { RuntimeMatchPause, RuntimePausedMatchRuntimeWorldInput } from "../mugen/runtime/PauseSystem";
import {
  RuntimeMatchPausedBridgeWorld,
  type RuntimeMatchPausedBridgeActor,
} from "../mugen/runtime/RuntimeMatchPausedBridgeSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeMatchPausedBridgeWorld", () => {
  it("builds paused-match runtime input with pause, tick, stage, and hitpause command-buffer hooks", () => {
    const calls: string[] = [];
    const p1 = actor("p1", calls);
    const p2 = actor("p2", calls);
    const stage = { bounds: { left: -160, right: 160 } };
    const actorConstraintWorld = { clampToStage: () => undefined };
    const effectLifecycleWorld = {
      advanceActive: () => undefined,
      advancePresentation: () => undefined,
      advancePausedPresentation: () => undefined,
    };
    const pause = runtimePause("p1");
    let captured: RuntimePausedMatchRuntimeWorldInput<TestActor> | undefined;

    const result = new RuntimeMatchPausedBridgeWorld().advanceRuntime({
      pausedMatchWorld: {
        advanceRuntime(input) {
          captured = input as unknown as RuntimePausedMatchRuntimeWorldInput<TestActor>;
          return { paused: true, sourceActorId: "p1", actorMoved: true, interrupted: false, ticked: true };
        },
      },
      pauseWorld: {
        current: () => pause,
        canActorMove: (actorId) => actorId === "p1",
        tick: () => {
          calls.push("tick-pause");
          return undefined;
        },
      },
      p1,
      p2,
      p1Input: new Set(["F"]),
      p2Input: new Set(["B"]),
      p2Controlled: true,
      stage,
      tick: 42,
      actorConstraintWorld,
      effectLifecycleWorld,
      handlePlayerInput: (actor, input, opponent) => calls.push(`player:${actor.id}:${[...input].join("+")}:${opponent.id}`),
      handleAi: (actor, opponent) => calls.push(`ai:${actor.id}:${opponent.id}`),
      advanceFighter: (actor, opponent) => calls.push(`fighter:${actor.id}:${opponent.id}`),
    });

    expect(result).toEqual({ paused: true, sourceActorId: "p1", actorMoved: true, interrupted: false, ticked: true });
    expect(captured).toMatchObject({
      p1,
      p2,
      p1Input: new Set(["F"]),
      p2Input: new Set(["B"]),
      p2Controlled: true,
      stage,
      stageTime: 42,
      runtimeTick: 42,
      actorConstraintWorld,
      effectLifecycleWorld,
    });

    expect(captured?.currentPause()).toBe(pause);
    expect(captured?.canActorMove("p1")).toBe(true);
    expect(captured?.canActorMove("p2")).toBe(false);
    captured?.pushCommandBuffer(p1, new Set(["F", "x"]));
    captured?.handlePlayerInput(p1, new Set(["x"]), p2);
    captured?.handleAi(p2, p1);
    captured?.advanceFighter(p1, p2);
    captured?.tickPause();

    expect(calls).toEqual([
      "buffer:p1:42:F+x:true",
      "player:p1:x:p2",
      "ai:p2:p1",
      "fighter:p1:p2",
      "tick-pause",
    ]);
  });
});

type TestActor = RuntimeMatchPausedBridgeActor;

function actor(id: string, calls: string[]): TestActor {
  return {
    id,
    runtime: runtime(),
    targets: [],
    targetBindings: [],
    commandBuffer: {
      push: (tick, input, options) => {
        calls.push(`buffer:${id}:${tick}:${[...input].join("+")}:${options?.hitPause === true}`);
      },
    },
    targetWorld: {
      advance: () => undefined,
      applyTargetBindings: () => ({ appliedBindings: 0 }),
      applyBindToTarget: () => ({ appliedBindings: 0 }),
    },
    effectActorWorld: {
      advanceActiveEffects: () => undefined,
      advancePresentationEffects: () => undefined,
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
    },
  };
}

function runtime(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
  };
}

function runtimePause(actorId: string): RuntimeMatchPause {
  return {
    type: "Pause",
    remaining: 3,
    moveTime: 1,
    actorId,
    darken: false,
    sourceStateNo: 200,
    startedAt: 40,
  };
}

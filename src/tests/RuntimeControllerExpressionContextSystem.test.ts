import { describe, expect, it } from "vitest";
import {
  createRuntimeControllerExpressionContext,
  evaluateRuntimeControllerNumber,
} from "../mugen/runtime/RuntimeControllerExpressionContextSystem";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeControllerExpressionContextSystem", () => {
  it("evaluates raw controller numbers through the shared redirect-aware context", () => {
    const self = runtimeState({ hitVelocity: { x: 4, y: -3 }, life: 1000 });
    const target = runtimeState({ life: 963, vel: { x: -8, y: -5 } });
    const parent = runtimeState({ vel: { x: 4, y: 0 } });
    const root = runtimeState({ vel: { x: 0, y: -7 } });

    const context = {
      getConst: (name: string) => (name === "data.attack" ? 90 : undefined),
      hitPauseTime: () => 7,
      parent,
      root,
      gameSpace: { width: 640, height: 480, zoom: 2 },
      stageTime: 42,
      target: (targetId?: number) =>
        targetId === 77 || targetId === undefined ? { self: target, opponent: self } : undefined,
    };

    expect(evaluateRuntimeControllerNumber("Target(77), Life - 960", self, context)).toBe(3);
    expect(evaluateRuntimeControllerNumber("Target, Vel Y", self, context)).toBe(-5);
    expect(evaluateRuntimeControllerNumber("Parent, Vel X", self, context)).toBe(4);
    expect(evaluateRuntimeControllerNumber("Root, Vel Y", self, context)).toBe(-7);
    expect(evaluateRuntimeControllerNumber("Const(data.attack) + HitPauseTime + StageTime", self, context)).toBe(139);
    expect(evaluateRuntimeControllerNumber("GameWidth + GameHeight", self, context)).toBe(560);
    expect(evaluateRuntimeControllerNumber("ScreenWidth + ScreenHeight", self, context)).toBe(1120);
    expect(evaluateRuntimeControllerNumber("GetHitVar(xvel)", self, context)).toBe(4);
  });

  it("builds expression contexts with helper identity and team ownership metadata", () => {
    const self = runtimeState();
    const parent = runtimeState();
    const root = runtimeState();
    const context = createRuntimeControllerExpressionContext(self, {
      helperId: 222,
      isHelper: true,
      parent,
      parentTeamSide: 1,
      root,
      rootTeamSide: 1,
      teamSide: 1,
    });

    expect(evaluateExpression("IsHelper && IsHelper(222)", context)).toBe(1);
    expect(evaluateExpression("Parent, TeamSide = 1", context)).toBe(1);
    expect(evaluateExpression("Root, TeamSide = 1", context)).toBe(1);
  });
});

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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
    ...overrides,
  };
}

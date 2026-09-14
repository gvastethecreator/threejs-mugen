import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
import { MugenRuntime } from "../mugen/runtime/MugenRuntime";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("MugenRuntime frame selection", () => {
  it("seeks and clamps an authored action frame for inspection", () => {
    const runtime = new MugenRuntime(new Map<number, MugenAnimationAction>([[200, action(200, [3, 5, 7])]]));

    expect(runtime.dispatch({ type: "select-frame", frameIndex: 2 }).actors[0]?.runtime).toMatchObject({
      animNo: 200,
      frameIndex: 2,
      animTime: 8,
    });
    expect(runtime.dispatch({ type: "select-frame", frameIndex: 99 }).actors[0]?.runtime.frameIndex).toBe(2);
    expect(runtime.dispatch({ type: "select-frame", frameIndex: -4 }).actors[0]?.runtime.frameIndex).toBe(0);
  });

  it("consumes compact subtraction and refuses unconsumed expression tokens", () => {
    const self = expressionSelf();
    const malformed: string[] = [];
    const report = (feature: string) => malformed.push(feature);

    expect(evaluateExpression("5-2", { self })).toBe(3);
    expect(evaluateExpression("5 - 2", { self })).toBe(3);
    expect(evaluateExpression("-(2+3)", { self })).toBe(-5);
    expect(evaluateExpression("1 @ 2", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("1 2", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("(1", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("1 +", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toEqual([
      "malformed expression",
      "malformed expression",
      "malformed expression",
      "malformed expression",
    ]);
    expect(evaluateExpression("Parent,Var(0)", { self, parent: expressionSelf({ vars: [11] }) })).toBe(11);
    expect(evaluateExpression("Cond(1, 8, 9)", { self })).toBe(8);
    expect(evaluateExpression("GetHitVar(fall.recover)", { self, getHitVar: (name) => (name === "fall.recover" ? 1 : 0) })).toBe(1);
    expect(evaluateExpression("animelem = 1", { self })).toBe(1);
    expect(evaluateExpression('command = "x"', { self, commandActive: (name) => name === "x" })).toBe(1);
    expect(evaluateExpression("2 = [2,4]", { self })).toBe(1);
    expect(evaluateExpression("2 = (2,4]", { self })).toBe(0);
    expect(evaluateExpression("4 = [2,4)", { self })).toBe(0);
    const rangeSelf = expressionSelf({ vars: [2, 4] });
    expect(evaluateExpression("2 = [var(0),var(1))", { self: rangeSelf })).toBe(1);
    expect(evaluateExpression("2 != [var(0),var(1))", { self: rangeSelf })).toBe(0);
    expect(evaluateExpression("4 != [var(0),var(1))", { self: rangeSelf })).toBe(1);
    const randomDraws: number[] = [];
    expect(
      evaluateExpression("Random = [0,999]", {
        self,
        random: () => {
          randomDraws.push(0.25);
          return 0.25;
        },
      }),
    ).toBe(1);
    expect(randomDraws).toEqual([0.25]);
  });
});

function expressionSelf(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 200,
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

function action(id: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    loopStart: 0,
    rawLines: [],
    frames: durations.map((duration, spriteIndex) => ({
      spriteGroup: 15000,
      spriteIndex,
      offsetX: 0,
      offsetY: 0,
      duration,
      clsn1: [],
      clsn2: [],
      raw: "",
      line: spriteIndex + 1,
    })),
  };
}

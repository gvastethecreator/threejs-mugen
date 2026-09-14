import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
import { MugenRuntime } from "../mugen/runtime/MugenRuntime";
import { executeStateController } from "../mugen/runtime/StateControllerExecutor";
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
    expect(evaluateExpression("7 % 3", { self })).toBe(1);
    expect(evaluateExpression("-7 % 3", { self })).toBe(-1);
    expect(evaluateExpression("7.9 % 3.2", { self })).toBe(1);
    expect(evaluateExpression("8 % 4 = 0", { self })).toBe(1);
    expect(evaluateExpression("7 % 0", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("7 % 0 = 0", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("mod(0)");
    expect(evaluateExpression("6 & 3", { self })).toBe(2);
    expect(evaluateExpression("6 | 3", { self })).toBe(7);
    expect(evaluateExpression("6 ^ 3", { self })).toBe(5);
    expect(evaluateExpression("~0", { self })).toBe(-1);
    expect(evaluateExpression("6 && 3", { self })).toBe(1);
    expect(evaluateExpression("1 & Parent,Var(0)", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("1 & Parent,Var(0) = 0", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("0 ^^ 1", { self })).toBe(1);
    expect(evaluateExpression("1 ^^ 1", { self })).toBe(0);
    expect(evaluateExpression("0.5 ^^ 0", { self })).toBe(1);
    expect(evaluateExpression("6 ^^ 3", { self })).toBe(0);
    const xorRandom: number[] = [];
    evaluateExpression("Random ^^ Random", {
      self,
      random: () => {
        xorRandom.push(xorRandom.length === 0 ? 0.1 : 0.2);
        return xorRandom[xorRandom.length - 1] ?? 0;
      },
    });
    expect(xorRandom).toHaveLength(2);
    expect(evaluateExpression("Sin(0)", { self })).toBe(0);
    expect(evaluateExpression("Cos(0)", { self })).toBe(1);
    expect(evaluateExpression("Tan(0)", { self })).toBe(0);
    expect(evaluateExpression("Sin(Pi/2)", { self })).toBeCloseTo(1, 6);
    const moved = executeStateController(controller("PosAdd", { x: "Sin(0.5)" }), expressionSelf(), () => undefined);
    expect(moved.pos.x).toBeCloseTo(Math.sin(0.5), 6);
    expect(Number.isInteger(moved.pos.x)).toBe(false);
    expect(evaluateExpression("Acos(1)", { self })).toBe(0);
    expect(evaluateExpression("Asin(0)", { self })).toBe(0);
    expect(evaluateExpression("Atan(0)", { self })).toBe(0);
    expect(evaluateExpression("Asin(1)", { self })).toBeCloseTo(Math.PI / 2, 6);
    expect(evaluateExpression("Acos(2)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("math(domain)");
    expect(evaluateExpression("Exp(0)", { self })).toBe(1);
    expect(evaluateExpression("Ln(1)", { self })).toBe(0);
    expect(evaluateExpression("Log(2,8)", { self })).toBeCloseTo(3, 10);
    expect(evaluateExpression("Ln(0)", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("Log(8)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("log(arity)");
    expect(evaluateExpression("Floor(1.8)", { self })).toBe(1);
    expect(evaluateExpression("Ceil(1.2)", { self })).toBe(2);
    expect(evaluateExpression("Floor(-1.2)", { self })).toBe(-2);
    expect(evaluateExpression("Ceil(-1.8)", { self })).toBe(-1);
    const floored = executeStateController(
      controller("PosAdd", { x: "Floor(var(0))" }),
      expressionSelf({ vars: [1.8] }),
      () => undefined,
    );
    expect(floored.pos.x).toBe(1);
  });
});

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    name: type,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

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

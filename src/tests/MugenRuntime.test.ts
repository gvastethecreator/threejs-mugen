import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { tokenizeMugenExpression } from "../mugen/compiler/ExpressionLexer";
import { evaluateExpression, evaluateExpressionNumeric } from "../mugen/runtime/ExpressionEvaluator";
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

    expect(tokenizeMugenExpression("var(0) := 7").tokens.some((token) => token.type === "operator" && token.value === ":=")).toBe(true);
    expect(tokenizeMugenExpression("2**3").tokens[1]).toMatchObject({ type: "operator", value: "**" });
    expect(tokenizeMugenExpression("7").tokens[0]).toMatchObject({ type: "number", value: "7", kind: "int" });
    expect(tokenizeMugenExpression("7.0").tokens[0]).toMatchObject({ type: "number", value: "7.0", kind: "float" });
    expect(evaluateExpressionNumeric("7", { self })).toEqual({ kind: "int", value: 7 });
    expect(evaluateExpressionNumeric("7.0", { self })).toEqual({ kind: "float", value: 7 });
    expect(evaluateExpressionNumeric("7 + 1", { self })).toEqual({ kind: "int", value: 8 });
    expect(evaluateExpressionNumeric("7.0 + 1", { self })).toEqual({ kind: "float", value: 8 });
    expect(evaluateExpressionNumeric("var(0)", { self: expressionSelf({ vars: [7] }) })).toEqual({ kind: "int", value: 7 });
    expect(evaluateExpressionNumeric("fvar(0)", { self: expressionSelf({ fvars: [7] }) })).toEqual({ kind: "float", value: 7 });
    expect(evaluateExpressionNumeric("Parent,Var(0)", { self, parent: expressionSelf({ vars: [11] }) })).toEqual({ kind: "int", value: 11 });
    expect(evaluateExpressionNumeric("Parent,FVar(0)", { self, parent: expressionSelf({ fvars: [3.5] }) })).toEqual({ kind: "float", value: 3.5 });
    expect(evaluateExpression("5-2", { self })).toBe(3);
    expect(evaluateExpression("5 - 2", { self })).toBe(3);
    expect(evaluateExpression("-(2+3)", { self })).toBe(-5);
    expect(evaluateExpression("1 @ 2", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("1 2", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("(1", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("1 +", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("1 + * 2", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toEqual([
      "malformed expression",
      "malformed expression",
      "malformed expression",
      "malformed expression",
      "malformed expression",
    ]);
    expect(evaluateExpression("2 = (1,3]", { self })).toBe(1);
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
    expect(evaluateExpressionNumeric("-7 % 3", { self })).toEqual({ kind: "int", value: -1 });
    expect(evaluateExpression("7.9 % 3.2", { self })).toBe(1);
    expect(evaluateExpression("8 % 4 = 0", { self })).toBe(1);
    expect(evaluateExpressionNumeric("7 / 2", { self })).toEqual({ kind: "int", value: 3 });
    expect(evaluateExpressionNumeric("7.0 / 2", { self })).toEqual({ kind: "float", value: 3.5 });
    expect(evaluateExpressionNumeric("-7 / 2", { self })).toEqual({ kind: "int", value: -3 });
    expect(evaluateExpression("7 / 2", { self })).toBe(3);
    expect(evaluateExpression("7.0 / 2", { self })).toBe(3.5);
    expect(evaluateExpression("7 / 0", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("7 / 0 = 0", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpressionNumeric("7 / 0", { self, reportUnsupported: report }).kind).toBe("invalid");
    expect(malformed).toContain("div(0)");
    expect(evaluateExpression("7 % 0", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpression("7 % 0 = 0", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("mod(0)");
    const integerQuotient = executeStateController(controller("PosAdd", { x: "7 / 2" }), expressionSelf(), () => undefined);
    expect(integerQuotient.pos.x).toBe(3);
    const floatQuotient = executeStateController(controller("PosAdd", { x: "7.0 / 2" }), expressionSelf(), () => undefined);
    expect(floatQuotient.pos.x).toBe(3.5);
    expect(evaluateExpression("6 & 3", { self })).toBe(2);
    expect(evaluateExpression("6 | 3", { self })).toBe(7);
    expect(evaluateExpression("6 ^ 3", { self })).toBe(5);
    expect(evaluateExpression("2^3", { self })).toBe(1);
    expect(evaluateExpressionNumeric("2**3", { self })).toEqual({ kind: "int", value: 8 });
    expect(evaluateExpressionNumeric("2.0**3", { self })).toEqual({ kind: "float", value: 8 });
    expect(evaluateExpression("-2**2", { self })).toBe(4);
    expect(evaluateExpression("2**3**2", { self })).toBe(64);
    expect(evaluateExpression("(-1)**0.5", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpressionNumeric("(-1)**0.5", { self, reportUnsupported: report }).kind).toBe("invalid");
    expect(malformed).toContain("pow(domain)");
    const powered = executeStateController(controller("PosAdd", { x: "2**3" }), expressionSelf(), () => undefined);
    expect(powered.pos.x).toBe(8);
    const assigned = expressionSelf({ vars: [], fvars: [] });
    expect(evaluateExpressionNumeric("var(0) := 7", { self: assigned })).toEqual({ kind: "int", value: 7 });
    expect(assigned.vars[0]).toBe(7);
    expect(evaluateExpressionNumeric("fvar(1) := 1.5", { self: assigned })).toEqual({ kind: "float", value: 1.5 });
    expect(assigned.fvars[1]).toBe(1.5);
    const skipped = expressionSelf({ vars: [0] });
    expect(evaluateExpression("0 && var(0) := 9", { self: skipped })).toBe(0);
    expect(skipped.vars[0]).toBe(0);
    const parentBank = expressionSelf({ vars: [3] });
    const childBank = expressionSelf({ vars: [] });
    expect(evaluateExpression("Parent, var(0) := 9", { self: childBank, parent: parentBank, reportUnsupported: report })).toBe(0);
    expect(parentBank.vars[0]).toBe(3);
    expect(childBank.vars[0]).toBeUndefined();
    expect(malformed).toContain("var(:=redirect)");
    expect(evaluateExpression("var(60) := 1", { self: assigned, reportUnsupported: report })).toBe(0);
    expect(assigned.vars[60]).toBeUndefined();
    expect(malformed).toContain("var(index)");
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
    expect(evaluateExpression("Sin()", { self, reportUnsupported: report })).toBe(0);
    expect(evaluateExpressionNumeric("Sin()", { self, reportUnsupported: report }).kind).toBe("invalid");
    expect(malformed).toContain("sin(arity)");
    expect(evaluateExpression("Cos(0,1)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("cos(arity)");
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
    expect(evaluateExpression("Log(10,100)", { self })).toBeCloseTo(2, 10);
    expect(evaluateExpression("Ln(0)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("math(domain)");
    expect(evaluateExpression("Log(1,10)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("log(domain)");
    expect(evaluateExpression("Log(8)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("log(arity)");
    expect(evaluateExpression("Floor(1.8)", { self })).toBe(1);
    expect(evaluateExpression("Ceil(1.2)", { self })).toBe(2);
    expect(evaluateExpression("Floor(-1.2)", { self })).toBe(-2);
    expect(evaluateExpression("Ceil(-1.2)", { self })).toBe(-1);
    expect(evaluateExpression("Ceil(-1.8)", { self })).toBe(-1);
    expect(evaluateExpression("Floor(1,2)", { self, reportUnsupported: report })).toBe(0);
    expect(malformed).toContain("floor(arity)");
    const floored = executeStateController(
      controller("PosAdd", { x: "Floor(var(0))" }),
      expressionSelf({ vars: [1.8] }),
      () => undefined,
    );
    expect(floored.pos.x).toBe(1);
    expect(evaluateExpression("TimeMod = 4, 0", { self: expressionSelf(), stateTime: 0 })).toBe(1);
    expect(evaluateExpression("TimeMod = 4, 0", { self: expressionSelf(), stateTime: 4 })).toBe(1);
    expect(evaluateExpression("TimeMod = 4, 0", { self: expressionSelf(), stateTime: 8 })).toBe(1);
    expect(evaluateExpression("TimeMod = 4, 0", { self: expressionSelf(), stateTime: 1 })).toBe(0);
    expect(evaluateExpression("TimeMod = 4, <= 1", { self: expressionSelf(), stateTime: 1 })).toBe(1);
    expect(evaluateExpression("Win", { self: expressionSelf({ matchOver: false }), roundDecision: { settled: false, win: true } })).toBe(0);
    expect(
      evaluateExpression("Win && WinKO && !DrawGame", {
        self: expressionSelf({ matchOver: true }),
        roundDecision: { settled: true, win: true, winKO: true, draw: false },
      }),
    ).toBe(1);
    expect(
      evaluateExpression("Lose && LoseKO && !Win", {
        self: expressionSelf({ matchOver: true }),
        roundDecision: { settled: true, lose: true, loseKO: true, win: false },
      }),
    ).toBe(1);
    expect(evaluateExpression("DrawGame", { self: expressionSelf({ matchOver: true }), roundDecision: { settled: true, draw: true, win: false, lose: false } })).toBe(1);
    const caller = expressionSelf({ life: 1000 });
    const near = expressionSelf({ life: 0 });
    expect(
      evaluateExpression("EnemyNear, Win", {
        self: caller,
        roundDecision: { settled: true, win: true, lose: false },
        enemyNear: () => ({
          self: near,
          roundDecision: { settled: true, win: false, lose: true },
          animExists: (id) => id === 2222,
        }),
        animExists: (id) => id === 1111,
      }),
    ).toBe(0);
    expect(
      evaluateExpression("EnemyNear, Lose", {
        self: caller,
        roundDecision: { settled: true, win: true, lose: false },
        enemyNear: () => ({
          self: near,
          roundDecision: { settled: true, win: false, lose: true },
        }),
      }),
    ).toBe(1);
    expect(
      evaluateExpression("EnemyNear, SelfAnimExist(2222)", {
        self: caller,
        animExists: (id) => id === 1111,
        enemyNear: () => ({
          self: near,
          animExists: (id) => id === 2222,
        }),
      }),
    ).toBe(1);
    expect(
      evaluateExpression("EnemyNear(3), Win", {
        self: caller,
        roundDecision: { settled: true, win: true },
        enemyNear: () => undefined,
      }),
    ).toBe(0);
    expect(evaluateExpression("TeamMode = Single", { self: expressionSelf(), teamMode: "single" })).toBe(1);
    expect(evaluateExpression("TeamMode = Single", { self: expressionSelf(), teamMode: "turns" })).toBe(0);
    expect(evaluateExpression("TeamMode != Turns", { self: expressionSelf(), teamMode: "single" })).toBe(1);
    expect(
      evaluateExpression("AnimExist(7777)", {
        self: expressionSelf(),
        animExists: (id) => id === 6666,
        activeAnimExists: (id) => id === 7777,
      }),
    ).toBe(1);
    expect(
      evaluateExpression("SelfAnimExist(7777)", {
        self: expressionSelf(),
        animExists: (id) => id === 6666,
        activeAnimExists: (id) => id === 7777,
      }),
    ).toBe(0);
    expect(
      evaluateExpression("Enemy, AnimExist(7777)", {
        self: expressionSelf(),
        animExists: () => true,
        activeAnimExists: () => true,
      }),
    ).toBe(0);
    expect(evaluateExpression("AnimElemNo(0)", { self: expressionSelf(), animElemNo: (offset) => (offset === 0 ? 1 : 2) })).toBe(1);
    expect(evaluateExpression("AnimElemNo(2)", { self: expressionSelf(), animElemNo: (offset) => (offset === 0 ? 1 : 2) })).toBe(2);
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

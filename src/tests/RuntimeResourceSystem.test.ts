import { describe, expect, it } from "vitest";
import {
  applyRuntimeControl,
  applyRuntimeLifeAdd,
  applyRuntimePowerDelta,
  applyRuntimeResourceController,
  applyRuntimeStateDefControl,
  applyRuntimeVariableAssignment,
  applyRuntimeVariableRangeAssignment,
  resolveRuntimeCtrlSetControllerOperation,
  resolveRuntimeResourceControllerOperation,
  RuntimeResourceWorld,
  runtimeLifeMaxFromConstants,
  runtimePowerMaxForState,
  runtimePowerMaxFromConstants,
  type RuntimeResourceControllerSource,
} from "../mugen/runtime/RuntimeResourceSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeResourceSystem", () => {
  it("exposes a named resource world boundary for life, power, ctrl, and variables", () => {
    const world = new RuntimeResourceWorld();
    const state = runtimeState({ life: 100, lifeMax: 250, power: 30, powerMax: 120, ctrl: true });

    world.applyControl(state, false);
    world.applyLifeAdd(state, -200, false);
    world.applyResourceController(state, { kind: "resource", controllerType: "poweradd", value: 300 });
    world.applyVariableAssignment(state, { variableType: "var", index: 2, value: 9 }, false);

    expect(state.ctrl).toBe(false);
    expect(state.life).toBe(1);
    expect(state.power).toBe(120);
    expect(state.vars[2]).toBe(9);
  });

  it("applies bounded life and ctrl resource mutations", () => {
    const state = runtimeState({ life: 25, ctrl: true });

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "ctrlset", value: false });
    applyRuntimeLifeAdd(state, -40, false);

    expect(state.ctrl).toBe(false);
    expect(state.life).toBe(1);

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "lifeset", value: -5 });
    expect(state.life).toBe(0);
  });

  it("applies power mutations with existing lower-bound semantics", () => {
    const state = runtimeState({ power: 30 });

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "poweradd", value: -50 });
    expect(state.power).toBe(0);

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "powerset", value: 4500 });
    expect(state.power).toBe(4500);
  });

  it("clamps life and power to runtime max values when available", () => {
    const state = runtimeState({ life: 740, lifeMax: 750, power: 1190, powerMax: 1200 });

    applyRuntimeLifeAdd(state, 50, true);
    expect(state.life).toBe(750);

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "lifeset", value: 999 });
    expect(state.life).toBe(750);

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "poweradd", value: 80 });
    expect(state.power).toBe(1200);

    applyRuntimeResourceController(state, { kind: "resource", controllerType: "powerset", value: 9999 });
    expect(state.power).toBe(1200);
  });

  it("resolves authored max resources from constants", () => {
    expect(runtimeLifeMaxFromConstants({ "data.life": 750 })).toBe(750);
    expect(runtimePowerMaxFromConstants({ "data.power": 1250 })).toBe(1250);
    expect(runtimeLifeMaxFromConstants({ "data.life": Number.NaN })).toBe(1000);
    expect(runtimePowerMaxFromConstants({ "data.power": 0 })).toBe(1);
  });

  it("applies runtime power deltas through runtime max, constants, then fallback", () => {
    const runtimeMaxState = runtimeState({ power: 1190, powerMax: 1200 });
    applyRuntimePowerDelta(runtimeMaxState, 50, { "data.power": 2000 });
    expect(runtimeMaxState.power).toBe(1200);
    expect(runtimePowerMaxForState(runtimeMaxState, { "data.power": 2000 })).toBe(1200);

    const constantMaxState = runtimeState({ power: 2950 });
    applyRuntimePowerDelta(constantMaxState, 500, { "data.power": 3100 });
    expect(constantMaxState.power).toBe(3100);

    const fallbackState = runtimeState({ power: 2990 });
    applyRuntimePowerDelta(fallbackState, 50);
    expect(fallbackState.power).toBe(3000);
  });

  it("applies control writes from direct values and StateDef ctrl params", () => {
    const state = runtimeState({ ctrl: true });

    applyRuntimeControl(state, false);
    expect(state.ctrl).toBe(false);

    applyRuntimeStateDefControl(state, undefined);
    expect(state.ctrl).toBe(false);

    applyRuntimeStateDefControl(state, 1);
    expect(state.ctrl).toBe(true);

    applyRuntimeStateDefControl(state, 0);
    expect(state.ctrl).toBe(false);
  });

  it("resolves dynamic CtrlSet values from bounded expression fallback", () => {
    const state = runtimeState({ ctrl: false, vars: [1] });
    const operation = resolveRuntimeCtrlSetControllerOperation(controller({ value: "IfElse(var(0), 1, 0)" }), state);

    expect(operation).toEqual({ kind: "resource", controllerType: "ctrlset", value: true });

    applyRuntimeResourceController(state, operation!);
    expect(state.ctrl).toBe(true);
  });

  it("resolves dynamic LifeAdd values and kill flags from bounded expression fallback", () => {
    const state = runtimeState({ life: 12, vars: [1, 0] });
    const operation = resolveRuntimeResourceControllerOperation(
      controller({ value: "IfElse(var(0), -20, 0)", kill: "var(1)" }, "LifeAdd"),
      state,
    );

    expect(operation).toEqual({ kind: "resource", controllerType: "lifeadd", value: -20, kill: false });

    applyRuntimeResourceController(state, operation!);
    expect(state.life).toBe(1);
  });

  it("resolves dynamic LifeSet, PowerAdd, and PowerSet values from bounded expression fallback", () => {
    const state = runtimeState({ life: 100, power: 25, vars: [1, 1, 1] });
    const lifeSet = resolveRuntimeResourceControllerOperation(controller({ value: "IfElse(var(0), 750, 0)" }, "LifeSet"), state);
    const powerAdd = resolveRuntimeResourceControllerOperation(controller({ value: "IfElse(var(1), 350, 0)" }, "PowerAdd"), state);
    const powerSet = resolveRuntimeResourceControllerOperation(controller({ value: "IfElse(var(2), 900, 0)" }, "PowerSet"), state);

    expect(lifeSet).toEqual({ kind: "resource", controllerType: "lifeset", value: 750 });
    expect(powerAdd).toEqual({ kind: "resource", controllerType: "poweradd", value: 350 });
    expect(powerSet).toEqual({ kind: "resource", controllerType: "powerset", value: 900 });

    applyRuntimeResourceController(state, lifeSet!);
    applyRuntimeResourceController(state, powerAdd!);
    applyRuntimeResourceController(state, powerSet!);
    expect(state.life).toBe(750);
    expect(state.power).toBe(900);
  });

  it("applies var, fvar, and sysvar assignments", () => {
    const state = runtimeState({ vars: [2], fvars: [0.5] });

    applyRuntimeVariableAssignment(state, { variableType: "var", index: 0, value: 3 }, true);
    applyRuntimeVariableAssignment(state, { variableType: "fvar", index: 1, value: 1.25 }, false);
    applyRuntimeVariableAssignment(state, { variableType: "sysvar", index: 0, value: 7 }, false);

    expect(state.vars[0]).toBe(5);
    expect(state.fvars[1]).toBe(1.25);
    expect(state.sysvars?.[0]).toBe(7);
  });

  it("applies clamped variable ranges in either direction", () => {
    const state = runtimeState();

    applyRuntimeVariableRangeAssignment(state, { variableType: "var", first: 4, last: 2, value: 9 });
    applyRuntimeVariableRangeAssignment(state, { variableType: "fvar", first: 38, last: 50, value: 0.75 });

    expect(state.vars.slice(2, 5)).toEqual([9, 9, 9]);
    expect(state.fvars[38]).toBe(0.75);
    expect(state.fvars[39]).toBe(0.75);
    expect(state.fvars[40]).toBeUndefined();
  });
});

function controller(params: Record<string, string> = {}, type = "CtrlSet"): RuntimeResourceControllerSource {
  return {
    type,
    normalizedType: type.toLowerCase(),
    params,
  };
}

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
    sysvars: [],
    ...overrides,
  };
}

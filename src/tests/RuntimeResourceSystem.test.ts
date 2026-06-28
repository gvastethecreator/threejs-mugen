import { describe, expect, it } from "vitest";
import {
  applyRuntimeLifeAdd,
  applyRuntimeResourceController,
  applyRuntimeVariableAssignment,
  applyRuntimeVariableRangeAssignment,
} from "../mugen/runtime/RuntimeResourceSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeResourceSystem", () => {
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

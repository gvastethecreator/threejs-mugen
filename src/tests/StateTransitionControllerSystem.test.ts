import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeStateTransitionControllerWorld } from "../mugen/runtime/StateTransitionControllerSystem";
import { executeControllerIr } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeStateTransitionControllerWorld", () => {
  it("applies ChangeState with expression params, reset timing, and previous metadata", () => {
    const world = new RuntimeStateTransitionControllerWorld();
    const state = runtimeState({
      stateNo: 100,
      animNo: 105,
      animTime: 12,
      frameIndex: 3,
      ctrl: true,
      stateType: "A",
      moveType: "A",
    });

    const result = world.applyController(state, source("ChangeState", { value: "HitPauseTime + Const(state.base)", ctrl: "0" }), {
      getConst: (name) => (name === "state.base" ? 200 : undefined),
      hitPauseTime: () => 6,
    });

    expect(result).toMatchObject({ applied: true, controllerType: "changestate", stateNo: 206 });
    expect(state).toMatchObject({
      stateNo: 206,
      prevStateNo: 100,
      prevAnimNo: 105,
      prevStateType: "A",
      prevMoveType: "A",
      animTime: 0,
      frameIndex: 0,
      ctrl: false,
    });
  });

  it("applies SelfState through stateno alias and ctrl expression", () => {
    const world = new RuntimeStateTransitionControllerWorld();
    const state = runtimeState({ stateNo: 888, animNo: 889, ctrl: false });

    const result = world.applyController(state, source("SelfState", { stateno: "0", ctrl: "1" }));

    expect(result).toMatchObject({ applied: true, controllerType: "selfstate", stateNo: 0 });
    expect(state.stateNo).toBe(0);
    expect(state.prevStateNo).toBe(888);
    expect(state.prevAnimNo).toBe(889);
    expect(state.ctrl).toBe(true);
  });

  it("keeps missing value controllers as no-op with a reportable result", () => {
    const world = new RuntimeStateTransitionControllerWorld();
    const state = runtimeState({ stateNo: 200, animTime: 8, frameIndex: 2 });

    const result = world.applyController(state, source("ChangeState", { ctrl: "0" }));

    expect(result).toMatchObject({ applied: false, controllerType: "changestate", missingValue: true });
    expect(state.stateNo).toBe(200);
    expect(state.animTime).toBe(8);
    expect(state.frameIndex).toBe(2);
    expect(state.ctrl).toBe(true);
  });

  it("preserves previous metadata on unchanged state while resetting animation timing", () => {
    const world = new RuntimeStateTransitionControllerWorld();
    const state = runtimeState({
      stateNo: 200,
      animTime: 9,
      frameIndex: 4,
      prevStateNo: 100,
      prevAnimNo: 101,
      prevStateType: "C",
      prevMoveType: "H",
    });

    world.applyController(state, source("ChangeState", { value: "200" }));

    expect(state).toMatchObject({
      stateNo: 200,
      animTime: 0,
      frameIndex: 0,
      prevStateNo: 100,
      prevAnimNo: 101,
      prevStateType: "C",
      prevMoveType: "H",
    });
  });

  it("keeps StateControllerExecutor as router for state transitions and unsupported reports", () => {
    const unsupported: string[] = [];
    const state = runtimeState({ stateNo: 10, animNo: 11, animTime: 4, frameIndex: 1 });
    const next = executeControllerIr(
      compileControllerIr(controller("ChangeState", { value: "HitPauseTime + 200", ctrl: "0" })),
      state,
      (name) => unsupported.push(name),
      { hitPauseTime: () => 6 },
    );

    expect(state.stateNo).toBe(10);
    expect(next).toMatchObject({ stateNo: 206, prevStateNo: 10, prevAnimNo: 11, animTime: 0, frameIndex: 0, ctrl: false });

    const missing = executeControllerIr(compileControllerIr(controller("SelfState", { ctrl: "1" })), next, (name) =>
      unsupported.push(name),
    );
    expect(missing.stateNo).toBe(206);
    expect(unsupported).toEqual(["SelfState:missing-value"]);
  });
});

function source(type: string, params: Record<string, string>): Pick<ControllerIr, "params" | "type" | "normalizedType"> {
  return {
    type,
    normalizedType: type.toLowerCase(),
    params,
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
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
    ...overrides,
  };
}

import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeKinematicControllerWorld } from "../mugen/runtime/KinematicControllerSystem";
import { executeControllerIr } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeKinematicControllerWorld", () => {
  it("applies VelSet typed operations and raw expression fallback for missing axes", () => {
    const world = new RuntimeKinematicControllerWorld();
    const state = runtimeState({ vel: { x: 3, y: 4 } });

    const typedResult = world.applyController(
      state,
      source("VelSet", { y: "Const(movement.y)" }),
      { kind: "kinematic", controllerType: "velset", x: -2 },
      { getConst: (name) => (name === "movement.y" ? 7 : undefined) },
    );
    expect(state.vel).toEqual({ x: -2, y: 7 });
    expect(typedResult.operation).toEqual({ kind: "kinematic", controllerType: "velset", x: -2, y: 7 });

    const dynamicResult = world.applyController(state, source("VelSet", { value: "1 + 1, 9 - 4" }));
    expect(state.vel).toEqual({ x: 2, y: 5 });
    expect(dynamicResult.operation).toEqual({ kind: "kinematic", controllerType: "velset", x: 2, y: 5 });
  });

  it("applies VelAdd and VelMul defaults without requiring both axes", () => {
    const world = new RuntimeKinematicControllerWorld();
    const state = runtimeState({ vel: { x: 4, y: -6 } });

    world.applyController(state, source("VelAdd", { x: "2" }));
    expect(state.vel).toEqual({ x: 6, y: -6 });

    world.applyController(state, source("VelMul", { y: "-0.5" }));
    expect(state.vel).toEqual({ x: 6, y: 3 });

    world.applyController(state, source("VelMul", { value: "0.25, 2" }));
    expect(state.vel).toEqual({ x: 1.5, y: 6 });
  });

  it("evaluates dynamic movement params through bounded redirect context", () => {
    const world = new RuntimeKinematicControllerWorld();
    const state = runtimeState({ vel: { x: 1, y: 2 } });
    const target = runtimeState({ life: 963, vel: { x: -8, y: -5 } });
    const parent = runtimeState({ vel: { x: 4, y: 0 } });
    const root = runtimeState({ vel: { x: 0, y: -7 } });

    world.applyController(state, source("VelSet", { x: "Target(77), Life - 960", y: "Target, Vel Y" }), undefined, {
      target: (targetId) => (targetId === 77 || targetId === undefined ? { self: target, opponent: state } : undefined),
    });
    expect(state.vel).toEqual({ x: 3, y: -5 });

    const velAddResult = world.applyController(state, source("VelAdd", { x: "Parent,Vel X", y: "Root,Vel Y" }), undefined, { parent, root });
    expect(state.vel).toEqual({ x: 7, y: -12 });
    expect(velAddResult.operation).toEqual({ kind: "kinematic", controllerType: "veladd", x: 4, y: -7 });
  });

  it("applies HitVelSet flags only when hit velocity exists", () => {
    const world = new RuntimeKinematicControllerWorld();
    const state = runtimeState({ hitVelocity: { x: -4, y: -8 }, vel: { x: 1, y: 2 } });

    world.applyController(state, source("HitVelSet", { x: "1", y: "0" }));
    expect(state.vel).toEqual({ x: -4, y: 2 });

    world.applyController(state, source("HitVelSet", { y: "1" }));
    expect(state.vel).toEqual({ x: -4, y: -8 });

    const untouched = runtimeState({ vel: { x: 3, y: 4 } });
    world.applyController(untouched, source("HitVelSet", { x: "1", y: "1" }));
    expect(untouched.vel).toEqual({ x: 3, y: 4 });
  });

  it("applies PosSet, PosAdd, and Gravity through the controller world", () => {
    const world = new RuntimeKinematicControllerWorld();
    const state = runtimeState({ pos: { x: 10, y: -20 }, vel: { x: 0, y: -3 } });

    world.applyController(state, source("PosSet", { x: "Const(size.ground.front)" }), undefined, {
      getConst: (name) => (name === "size.ground.front" ? 14 : undefined),
    });
    expect(state.pos).toEqual({ x: 14, y: -20 });

    world.applyController(state, source("PosAdd", { value: "-4, 2" }));
    expect(state.pos).toEqual({ x: 10, y: -18 });

    world.applyController(state, source("Gravity", {}), { kind: "kinematic", controllerType: "gravity", y: 0.25 });
    expect(state.vel.y).toBeCloseTo(-2.75);

    world.applyController(state, source("Gravity", {}));
    expect(state.vel.y).toBeCloseTo(-2.2);
  });

  it("keeps StateControllerExecutor as router for kinematic controllers", () => {
    const state = runtimeState({ vel: { x: 1, y: 2 } });
    const next = executeControllerIr(compileControllerIr(controller("VelAdd", { x: "2", y: "-3" })), state, () => undefined);

    expect(state.vel).toEqual({ x: 1, y: 2 });
    expect(next.vel).toEqual({ x: 3, y: -1 });
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

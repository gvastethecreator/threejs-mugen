import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeControllerDispatchWorld,
  type RuntimeControllerDispatchActor,
} from "../mugen/runtime/RuntimeControllerDispatchSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeControllerDispatchSystem", () => {
  it("applies a runtime controller through a named dispatch boundary and records telemetry hooks", () => {
    const world = new RuntimeControllerDispatchWorld();
    const actor = runtimeActor({ ctrl: true });
    const controller = compileControllerIr(controllerSource("CtrlSet", { value: "0" }));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.apply(actor, controller, {
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) =>
        recordedOperations.push(`${operation.kind}:${"controllerType" in operation ? operation.controllerType : "none"}`),
    });

    expect(actor.runtime.ctrl).toBe(false);
    expect(recordedControllers).toEqual(["CtrlSet"]);
    expect(recordedOperations).toEqual(["resource:ctrlset"]);
    expect(result).toEqual({ unsupported: [], recordedController: true, recordedOperation: true });
  });

  it("passes evaluation context to expression-backed runtime controllers", () => {
    const world = new RuntimeControllerDispatchWorld();
    const actor = runtimeActor({ ctrl: false });
    const controller = compileControllerIr(controllerSource("CtrlSet", { value: "HitPauseTime" }));

    const result = world.apply(actor, controller, {
      context: {
        hitPauseTime: () => 3,
      },
    });

    expect(actor.runtime.ctrl).toBe(true);
    expect(result.recordedOperation).toBe(false);
  });

  it("records bounded dynamic VelSet as typed kinematic telemetry after resolving params", () => {
    const world = new RuntimeControllerDispatchWorld();
    const actor = runtimeActor({ vel: { x: 2, y: -1 } });
    const controller = compileControllerIr(controllerSource("VelSet", { x: "Const240p(3)", y: "0 - Const720p(12)" }));
    const recordedOperations: string[] = [];

    const result = world.apply(actor, controller, {
      context: {
        localCoord: [640, 480],
      },
      recordOperation: (_actor, operation) =>
        recordedOperations.push(`${operation.kind}:${"controllerType" in operation ? operation.controllerType : "none"}`),
    });

    expect(actor.runtime.vel).toEqual({ x: 6, y: -6 });
    expect(recordedOperations).toEqual(["kinematic:velset"]);
    expect(result.recordedOperation).toBe(true);
  });

  it("records bounded dynamic VelAdd as typed kinematic telemetry after resolving params", () => {
    const world = new RuntimeControllerDispatchWorld();
    const actor = runtimeActor({ vel: { x: 2, y: 4 }, vars: [3, -5] });
    const controller = compileControllerIr(controllerSource("VelAdd", { x: "var(0) + 1", y: "var(1) - 1" }));
    const recordedOperations: string[] = [];

    const result = world.apply(actor, controller, {
      recordOperation: (_actor, operation) =>
        recordedOperations.push(`${operation.kind}:${"controllerType" in operation ? operation.controllerType : "none"}`),
    });

    expect(actor.runtime.vel).toEqual({ x: 6, y: -2 });
    expect(recordedOperations).toEqual(["kinematic:veladd"]);
    expect(result.recordedOperation).toBe(true);
  });

  it("records bounded dynamic VelMul as typed kinematic telemetry after resolving params", () => {
    const world = new RuntimeControllerDispatchWorld();
    const actor = runtimeActor({ vel: { x: 8, y: -6 }, vars: [2, 3] });
    const controller = compileControllerIr(controllerSource("VelMul", { x: "var(0) * 0.5", y: "0 - var(1)" }));
    const recordedOperations: string[] = [];

    const result = world.apply(actor, controller, {
      recordOperation: (_actor, operation) =>
        recordedOperations.push(`${operation.kind}:${"controllerType" in operation ? operation.controllerType : "none"}`),
    });

    expect(actor.runtime.vel).toEqual({ x: 8, y: 18 });
    expect(recordedOperations).toEqual(["kinematic:velmul"]);
    expect(result.recordedOperation).toBe(true);
  });

  it("reports unsupported controllers without mutating runtime state", () => {
    const world = new RuntimeControllerDispatchWorld();
    const actor = runtimeActor({ life: 777 });
    const controller = compileControllerIr(controllerSource("MysteryController", {}));
    const reported: string[] = [];

    const result = world.apply(actor, controller, {
      reportUnsupported: (name) => reported.push(name),
    });

    expect(actor.runtime.life).toBe(777);
    expect(result.unsupported).toEqual(["MysteryController"]);
    expect(reported).toEqual(["MysteryController"]);
  });
});

function controllerSource(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function runtimeActor(overrides: Partial<CharacterRuntimeState> = {}): RuntimeControllerDispatchActor {
  return {
    runtime: {
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
    },
  };
}

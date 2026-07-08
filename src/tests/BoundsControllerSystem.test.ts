import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeBoundsControllerWorld } from "../mugen/runtime/BoundsControllerSystem";
import { executeControllerIr } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("BoundsControllerSystem", () => {
  it("applies PlayerPush typed operations and raw fallback defaults", () => {
    const world = new RuntimeBoundsControllerWorld();
    const state = runtimeState({ playerPush: true });

    world.applyPlayerPushController(state, source("PlayerPush", { value: "1" }), {
      kind: "collision",
      controllerType: "playerpush",
      enabled: false,
    });
    expect(state.playerPush).toBe(false);

    world.applyPlayerPushController(state, source("PlayerPush", {}));
    expect(state.playerPush).toBe(true);

    world.applyPlayerPushController(state, source("PlayerPush", { value: "0" }));
    expect(state.playerPush).toBe(false);
  });

  it("applies PlayerPush raw expression fallback", () => {
    const world = new RuntimeBoundsControllerWorld();
    const state = runtimeState({ playerPush: true, vars: [0] });

    const result = world.applyPlayerPushController(state, source("PlayerPush", { value: "var(0)" }));

    expect(state.playerPush).toBe(false);
    expect(result.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: false });
  });

  it("applies PosFreeze typed operations and raw axis fallback", () => {
    const world = new RuntimeBoundsControllerWorld();
    const state = runtimeState();

    const typedResult = world.applyPosFreezeController(state, source("PosFreeze", { value: "0" }), {
      kind: "bounds",
      controllerType: "posfreeze",
      x: true,
      y: false,
    });
    expect(state.posFreeze).toEqual({ x: true, y: false });
    expect(typedResult.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: false });

    const rawResult = world.applyPosFreezeController(state, source("PosFreeze", { x: "0", y: "1" }));
    expect(state.posFreeze).toEqual({ x: false, y: true });
    expect(rawResult.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: false, y: true });

    world.applyPosFreezeController(state, source("PosFreeze", {}));
    expect(state.posFreeze).toEqual({ x: true, y: true });
  });

  it("applies PosFreeze raw expression fallback", () => {
    const world = new RuntimeBoundsControllerWorld();
    const state = runtimeState({ vars: [1, 0] });

    const result = world.applyPosFreezeController(state, source("PosFreeze", { x: "var(0)", y: "var(1)" }));

    expect(state.posFreeze).toEqual({ x: true, y: false });
    expect(result.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: false });
  });

  it("applies ScreenBound typed operations and raw expression fallback", () => {
    const world = new RuntimeBoundsControllerWorld();
    const state = runtimeState();

    const typedResult = world.applyScreenBoundController(state, source("ScreenBound", { value: "1" }), {
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: true,
      moveCameraY: false,
    });
    expect(state.screenBound).toEqual({ bound: false, moveCameraX: true, moveCameraY: false });
    expect(typedResult.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: true,
      moveCameraY: false,
    });

    const rawResult = world.applyScreenBoundController(state, source("ScreenBound", { value: "1 - 1", movecamera: "0, 1 + 0" }));
    expect(state.screenBound).toEqual({ bound: false, moveCameraX: false, moveCameraY: true });
    expect(rawResult.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: false,
      moveCameraY: true,
    });
  });

  it("applies ScreenBound raw expression fallback from vars", () => {
    const world = new RuntimeBoundsControllerWorld();
    const state = runtimeState({ vars: [0, 0, 1] });

    const result = world.applyScreenBoundController(state, source("ScreenBound", { value: "var(0)", movecamera: "var(1), var(2)" }));

    expect(state.screenBound).toEqual({ bound: false, moveCameraX: false, moveCameraY: true });
    expect(result.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: false,
      moveCameraY: true,
    });
  });

  it("keeps StateControllerExecutor as router for bounds controllers", () => {
    const state = runtimeState({ playerPush: true });
    const next = executeControllerIr(compileControllerIr(controller("PlayerPush", { value: "0" })), state, () => undefined);

    expect(state.playerPush).toBe(true);
    expect(next.playerPush).toBe(false);
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

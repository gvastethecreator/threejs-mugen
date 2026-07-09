import { describe, expect, it } from "vitest";
import type { DamageScaleControllerOp } from "../mugen/compiler/ControllerOps";
import {
  RuntimeDamageScaleWorld,
  resolveRuntimeDamageScaleControllerOperation,
  type RuntimeDamageScaleControllerSource,
} from "../mugen/runtime/DamageScaleSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeDamageScaleWorld", () => {
  it("applies typed AttackMulSet and DefenceMulSet multipliers", () => {
    const world = new RuntimeDamageScaleWorld();
    const state = runtime();
    const attack: DamageScaleControllerOp = {
      kind: "damage-scale",
      controllerType: "attackmulset",
      multiplier: 1.5,
    };
    const defence: DamageScaleControllerOp = {
      kind: "damage-scale",
      controllerType: "defencemulset",
      multiplier: 0.5,
    };

    expect(world.applyController(state, controller(), "attackmulset", attack)).toEqual({ applied: true, multiplier: 1.5 });
    expect(world.applyController(state, controller(), "defencemulset", defence)).toEqual({ applied: true, multiplier: 0.5 });

    expect(state.attackMultiplier).toBe(1.5);
    expect(state.defenseMultiplier).toBe(0.5);
  });

  it("keeps raw expression fallback and clamps multiplier range", () => {
    const world = new RuntimeDamageScaleWorld();
    const state = runtime();

    expect(
      world.applyController(state, controller({ value: "Const(data.attack)" }), "attackmulset", undefined, {
        getConst: (name) => (name === "data.attack" ? 12 : undefined),
      }),
    ).toEqual({ applied: true, multiplier: 10 });
    expect(world.applyController(state, controller({ value: "-2" }), "defencemulset")).toEqual({ applied: true, multiplier: 0 });

    expect(state.attackMultiplier).toBe(10);
    expect(state.defenseMultiplier).toBe(0);
  });

  it("does not mutate when no raw value is present", () => {
    const world = new RuntimeDamageScaleWorld();
    const state = runtime({ attackMultiplier: 1.25, defenseMultiplier: 0.75 });

    expect(world.applyController(state, controller(), "attackmulset")).toEqual({ applied: false });
    expect(world.applyController(state, controller(), "defencemulset")).toEqual({ applied: false });

    expect(state.attackMultiplier).toBe(1.25);
    expect(state.defenseMultiplier).toBe(0.75);
  });

  it("resolves dynamic controller values into typed telemetry operations", () => {
    const state = runtime({ vars: [2], fvars: [0.75] });

    expect(
      resolveRuntimeDamageScaleControllerOperation(
        controller({ value: "var(0) * fvar(0)" }),
        state,
        "attackmulset",
      ),
    ).toEqual({
      kind: "damage-scale",
      controllerType: "attackmulset",
      multiplier: 1.5,
    });

    expect(resolveRuntimeDamageScaleControllerOperation(controller({ value: "-2" }), state, "defencemulset")).toEqual({
      kind: "damage-scale",
      controllerType: "defencemulset",
      multiplier: 0,
    });
    expect(resolveRuntimeDamageScaleControllerOperation(controller(), state, "attackmulset")).toBeUndefined();
  });
});

function controller(params: Record<string, string> = {}): RuntimeDamageScaleControllerSource {
  return {
    type: "DamageScale",
    normalizedType: "damagescale",
    params,
  };
}

function runtime(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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

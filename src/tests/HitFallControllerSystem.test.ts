import { describe, expect, it } from "vitest";
import type { HitFallControllerOp } from "../mugen/compiler/ControllerOps";
import {
  RuntimeHitFallControllerWorld,
  type RuntimeHitFallControllerSource,
} from "../mugen/runtime/HitFallControllerSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHitFallControllerWorld", () => {
  it("applies typed HitFallSet while preserving stored fall metadata", () => {
    const world = new RuntimeHitFallControllerWorld();
    const state = runtime({
      hitFall: {
        falling: false,
        damage: 24,
        defenceUp: 150,
        kill: false,
        velocity: { x: 1, y: -2 },
      },
    });
    const operation: HitFallControllerOp = {
      kind: "hitfall",
      controllerType: "hitfallset",
      falling: true,
      xVelocity: -3,
      yVelocity: -8,
    };

    expect(world.applyController(state, controller("HitFallSet"), operation)).toEqual({
      applied: true,
      controllerType: "hitfallset",
    });

    expect(state.hitFall).toEqual({
      falling: true,
      damage: 24,
      defenceUp: 150,
      kill: false,
      velocity: { x: -3, y: -8 },
    });
  });

  it("keeps raw HitFallSet expression fallback", () => {
    const world = new RuntimeHitFallControllerWorld();
    const state = runtime({
      hitFall: {
        falling: true,
        damage: 12,
        velocity: { x: 2, y: -4 },
      },
    });

    expect(
      world.applyController(
        state,
        controller("HitFallSet", {
          value: "GetHitVar(fall)",
          xvel: "GetHitVar(fall.xvel) + 3",
          yvel: "Const(movement.air.gethit.groundlevel) - 10",
        }),
        undefined,
        {
          getConst: (name) => (name === "movement.air.gethit.groundlevel" ? 2 : undefined),
        },
      ),
    ).toEqual({ applied: true, controllerType: "hitfallset" });

    expect(state.hitFall).toMatchObject({
      falling: true,
      damage: 12,
      velocity: { x: 5, y: -8 },
    });
  });

  it("applies HitFallVel only while in a hit state with stored fall velocity", () => {
    const world = new RuntimeHitFallControllerWorld();
    const hitState = runtime({
      moveType: "H",
      vel: { x: 9, y: 9 },
      hitFall: {
        falling: true,
        damage: 0,
        velocity: { x: -4, y: -6 },
      },
    });
    const idleState = runtime({
      moveType: "I",
      vel: { x: 9, y: 9 },
      hitFall: {
        falling: true,
        damage: 0,
        velocity: { x: -4, y: -6 },
      },
    });

    expect(world.applyController(hitState, controller("HitFallVel"))).toEqual({
      applied: true,
      controllerType: "hitfallvel",
    });
    expect(hitState.vel).toEqual({ x: -4, y: -6 });

    expect(world.applyController(idleState, controller("HitFallVel"))).toEqual({
      applied: false,
      controllerType: "hitfallvel",
    });
    expect(idleState.vel).toEqual({ x: 9, y: 9 });
  });

  it("applies scaled HitFallDamage and respects nonlethal fall damage", () => {
    const world = new RuntimeHitFallControllerWorld();
    const state = runtime({
      life: 10,
      moveType: "H",
      hitFall: {
        falling: true,
        damage: 30,
        defenceUp: 150,
        kill: false,
        velocity: { y: -4 },
      },
    });

    expect(world.applyController(state, controller("HitFallDamage"))).toEqual({
      applied: true,
      controllerType: "hitfalldamage",
      damageApplied: 45,
    });

    expect(state.life).toBe(1);
    expect(state.hitFall?.damage).toBe(0);
  });

  it("counts Common1 ground impact once even when fall damage is already spent", () => {
    const world = new RuntimeHitFallControllerWorld();
    const state = runtime({
      stateNo: 5100,
      moveType: "H",
      hitFall: {
        falling: true,
        damage: 0,
        velocity: { y: -4 },
      },
    });

    expect(world.applyController(state, controller("HitFallDamage"))).toEqual({
      applied: true,
      controllerType: "hitfalldamage",
    });
    expect(world.applyController(state, controller("HitFallDamage"))).toEqual({
      applied: false,
      controllerType: "hitfalldamage",
    });
    expect(state.life).toBe(1000);
    expect(state.hitFall).toMatchObject({
      fallCount: 1,
      fallCountedGroundImpact: true,
    });
  });
});

function controller(type: string, params: Record<string, string> = {}): RuntimeHitFallControllerSource {
  return {
    type,
    normalizedType: type.toLowerCase(),
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

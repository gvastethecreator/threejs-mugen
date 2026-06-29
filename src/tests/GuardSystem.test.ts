import { describe, expect, it } from "vitest";
import { RuntimeGuardWorld } from "../mugen/runtime/GuardSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeGuardSystem", () => {
  it("selects default guard-hit states with Common1 fallbacks", () => {
    const world = new RuntimeGuardWorld();

    expect(world.defaultGuardHitStateNo(runtime({ stateType: "S" }), hasStates(150))).toBe(150);
    expect(world.defaultGuardHitStateNo(runtime({ stateType: "C" }), hasStates(150))).toBe(150);
    expect(world.defaultGuardHitStateNo(runtime({ stateType: "A" }), hasStates(154, 150))).toBe(154);
  });

  it("selects guard-start states while preserving state 120 priority", () => {
    const world = new RuntimeGuardWorld();

    expect(world.defaultGuardStartStateNo(runtime({ stateType: "S" }), hasStates(120, 130))).toBe(120);
    expect(world.defaultGuardStartStateNo(runtime({ stateType: "C" }), hasStates(131))).toBe(131);
    expect(world.defaultGuardStartStateNo(runtime({ stateType: "A" }), hasStates(132))).toBe(132);
  });

  it("gates auto guard-start eligibility", () => {
    const world = new RuntimeGuardWorld();

    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime(), idleOptions())).toBe(true);
    expect(world.canAttemptAutoGuardStart(new Set(["F"]), runtime(), idleOptions())).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime({ ctrl: false }), idleOptions())).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime({ moveType: "H" }), idleOptions())).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime({ stateNo: 130 }), idleOptions())).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime(), { ...idleOptions(), currentMoveActive: true })).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime({ guardStun: 1 }), idleOptions())).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime(), { ...idleOptions(), hitPause: 1 })).toBe(false);
    expect(world.canAttemptAutoGuardStart(new Set(["B"]), runtime(), { ...idleOptions(), hitStun: 1 })).toBe(false);
  });

  it("mutates runtime state when auto guard starts", () => {
    const world = new RuntimeGuardWorld();
    const state = runtime({ ctrl: true, vel: { x: 6, y: -2 } });

    world.applyAutoGuardStart(state);

    expect(state.ctrl).toBe(false);
    expect(state.vel).toEqual({ x: 0, y: -2 });
  });
});

function hasStates(...ids: number[]): (stateNo: number) => boolean {
  return (stateNo) => ids.includes(stateNo);
}

function idleOptions(): { currentMoveActive: boolean; hitPause: number; hitStun: number } {
  return { currentMoveActive: false, hitPause: 0, hitStun: 0 };
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

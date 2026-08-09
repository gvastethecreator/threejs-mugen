import { describe, expect, it } from "vitest";
import {
  resetRuntimeAssertSpecial,
  RuntimeHitEligibilityWorld,
  tickRuntimeHitBySlots,
} from "../mugen/runtime/RuntimeHitEligibilitySystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHitEligibilitySystem", () => {
  it("ticks finite HitBy slots and removes expired slots", () => {
    const state = runtime({
      hitBy: {
        slot1: { mode: "allow", attr: "S,NA", remaining: 2 },
        slot2: { mode: "deny", attr: "A,SA", remaining: 1 },
      },
    });

    const result = tickRuntimeHitBySlots(state);

    expect(result).toEqual({ slot1Active: true, slot2Active: false });
    expect(state.hitBy).toEqual({
      slot1: { mode: "allow", attr: "S,NA", remaining: 1 },
    });
  });

  it("preserves infinite HitBy slots and clears the container when all slots expire", () => {
    const state = runtime({
      hitBy: {
        slot1: { mode: "deny", attr: "SCA", remaining: Number.POSITIVE_INFINITY },
        slot2: { mode: "allow", attr: "S,NA", remaining: 1 },
      },
    });

    expect(tickRuntimeHitBySlots(state)).toEqual({ slot1Active: true, slot2Active: false });
    expect(state.hitBy).toEqual({
      slot1: { mode: "deny", attr: "SCA", remaining: Number.POSITIVE_INFINITY },
    });

    state.hitBy = { slot1: { mode: "allow", attr: "S,NA", remaining: 1 } };
    expect(tickRuntimeHitBySlots(state)).toEqual({ slot1Active: false, slot2Active: false });
    expect(state.hitBy).toBeUndefined();
  });

  it("resets per-frame AssertSpecial and render opacity state through the world boundary", () => {
    const state = runtime({
      assertSpecial: { flags: ["invisible"], globalFlags: [], invisible: true },
      renderOpacity: 0,
    });
    const world = new RuntimeHitEligibilityWorld();

    world.resetFrameFlags(state);

    expect(state.assertSpecial).toBeUndefined();
    expect(state.renderOpacity).toBeUndefined();

    state.hitVars = { frame: true, sourcePlayerId: 7 };
    world.resetFrameFlags(state);
    expect(state.hitVars).toEqual({ frame: false, sourcePlayerId: 7 });

    state.hitVars = { frame: true, sourcePlayerId: 7 };
    world.resetFrameFlags(state, true);
    expect(state.hitVars?.frame).toBe(true);

    state.assertSpecial = { flags: ["noko"], globalFlags: [], noKo: true };
    state.renderOpacity = 0.25;
    resetRuntimeAssertSpecial(state);
    expect(state.assertSpecial).toBeUndefined();
    expect(state.renderOpacity).toBeUndefined();
  });

  it("clears guardcount after returning to idle but preserves it during get-hit", () => {
    const state = runtime({ moveType: "I", hitVars: { guardCount: 3, sourcePlayerId: 7 } });
    const world = new RuntimeHitEligibilityWorld();

    world.resetFrameFlags(state);
    expect(state.hitVars).toEqual({ sourcePlayerId: 7 });

    state.moveType = "H";
    state.hitVars = { guardCount: 4, sourcePlayerId: 7 };
    world.resetFrameFlags(state);
    expect(state.hitVars).toEqual({ guardCount: 4, sourcePlayerId: 7 });
  });

  it("ticks the per-actor HitDef unhittabletime countdown to zero", () => {
    const state = runtime({ unhittableTime: 2 });
    const world = new RuntimeHitEligibilityWorld();

    expect(world.tickUnhittableTime(state)).toBe(1);
    expect(world.tickUnhittableTime(state)).toBe(0);
    expect(world.tickUnhittableTime(state)).toBe(0);
  });
});

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

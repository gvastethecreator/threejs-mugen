import { describe, expect, it } from "vitest";
import type { HitEligibilityControllerOp, HitOverrideControllerOp } from "../mugen/compiler/ControllerOps";
import {
  RuntimeHitDefenseWorld,
  type RuntimeHitDefenseControllerSource,
} from "../mugen/runtime/HitDefenseSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHitDefenseWorld", () => {
  it("installs typed HitBy and NotHitBy slots", () => {
    const world = new RuntimeHitDefenseWorld();
    const state = runtime({
      hitBy: {
        slot1: { mode: "deny", attr: "SCA", remaining: 2 },
      },
    });
    const operation: HitEligibilityControllerOp = {
      kind: "eligibility",
      controllerType: "hitby",
      mode: "allow",
      slots: [
        { slot: 1, attr: "S,NA", remaining: 7 },
        { slot: 2, attr: "A,SA", remaining: Number.POSITIVE_INFINITY },
      ],
    };

    const result = world.applyHitByController(state, controller(), "deny", operation);

    expect(result).toEqual({ slot1Active: true, slot2Active: true });
    expect(state.hitBy).toEqual({
      slot1: { mode: "allow", attr: "S,NA", remaining: 7 },
      slot2: { mode: "allow", attr: "A,SA", remaining: Number.POSITIVE_INFINITY },
    });
  });

  it("keeps raw HitBy fallback duration and secondary slot semantics", () => {
    const world = new RuntimeHitDefenseWorld();
    const state = runtime();

    const result = world.applyHitByController(
      state,
      controller({ value: "SCA", value2: "A,SA", time: "-1" }),
      "deny",
    );

    expect(result).toEqual({ slot1Active: true, slot2Active: true });
    expect(state.hitBy).toEqual({
      slot1: { mode: "deny", attr: "SCA", remaining: Number.POSITIVE_INFINITY },
      slot2: { mode: "deny", attr: "A,SA", remaining: Number.POSITIVE_INFINITY },
    });
  });

  it("installs typed HitOverride slots in sorted order", () => {
    const world = new RuntimeHitDefenseWorld();
    const state = runtime({
      hitOverrides: [{ slot: 5, attr: "A,SA", remaining: 9, stateNo: 900 }],
    });
    const operation: HitOverrideControllerOp = {
      kind: "hitoverride",
      slot: 2,
      attr: "S,NA",
      remaining: 18,
      stateNo: 777,
      guardFlag: "MA",
      guardFlagNot: "A",
      forceAir: true,
      forceGuard: false,
      keepState: true,
    };

    const result = world.applyHitOverrideController(state, controller(), operation);

    expect(result).toEqual({ active: true, slot: 2 });
    expect(state.hitOverrides).toEqual([
      {
        slot: 2,
        attr: "S,NA",
        remaining: 18,
        stateNo: 777,
        guardFlag: "MA",
        guardFlagNot: "A",
        forceAir: true,
        forceGuard: false,
        keepState: true,
      },
      { slot: 5, attr: "A,SA", remaining: 9, stateNo: 900 },
    ]);
  });

  it("keeps raw HitOverride guardflag fallback params", () => {
    const world = new RuntimeHitDefenseWorld();
    const state = runtime();

    const result = world.applyHitOverrideController(
      state,
      controller({ slot: "4", attr: "S,NA", stateno: "778", time: "8", guardflag: '"MA"', "guardflag.not": "A" }),
    );

    expect(result).toEqual({ active: true, slot: 4 });
    expect(state.hitOverrides).toEqual([
      { slot: 4, attr: "S,NA", remaining: 8, stateNo: 778, guardFlag: "MA", guardFlagNot: "A", forceAir: false, forceGuard: false, keepState: false },
    ]);
  });

  it("keeps raw HitOverride fallback removal semantics for empty attrs", () => {
    const world = new RuntimeHitDefenseWorld();
    const state = runtime({
      hitOverrides: [
        { slot: 3, attr: "S,NA", remaining: 8, stateNo: 777 },
        { slot: 4, attr: "A,SA", remaining: 8, stateNo: 778 },
      ],
    });

    const result = world.applyHitOverrideController(state, controller({ slot: "3", attr: "", time: "5" }));

    expect(result).toEqual({ active: false, slot: 3 });
    expect(state.hitOverrides).toEqual([{ slot: 4, attr: "A,SA", remaining: 8, stateNo: 778 }]);
  });
});

function controller(params: Record<string, string> = {}): RuntimeHitDefenseControllerSource {
  return {
    type: "HitDefense",
    normalizedType: "hitdefense",
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

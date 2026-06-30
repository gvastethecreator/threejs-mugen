import { describe, expect, it } from "vitest";
import {
  RuntimeGuardDistanceWorld,
  type RuntimeGuardDistanceMove,
} from "../mugen/runtime/RuntimeGuardDistanceSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeGuardDistanceSystem", () => {
  it("accepts the bounded pre-active guard-distance window without contact", () => {
    const world = new RuntimeGuardDistanceWorld();
    const move = guardMove();
    const attacker = runtime({ pos: { x: 0, y: 0 }, facing: 1 });
    const defender = runtime({ pos: { x: 120, y: 0 }, facing: -1 });

    expect(world.isMoveInGuardDistanceWindow(move, 2)).toBe(true);
    expect(
      world.isInGuardDistance(
        { runtime: defender, hurtBoxes: [hurtBox()] },
        { runtime: attacker, currentMove: move, moveTick: 2, hasHit: false },
      ),
    ).toBe(true);
  });

  it("rejects missing, spent, and out-of-window attacks", () => {
    const world = new RuntimeGuardDistanceWorld();
    const move = guardMove();
    const attacker = runtime({ pos: { x: 0, y: 0 }, facing: 1 });
    const defender = runtime({ pos: { x: 120, y: 0 }, facing: -1 });
    const target = { runtime: defender, hurtBoxes: [hurtBox()] };

    expect(world.isInGuardDistance(target, { runtime: attacker, moveTick: 2, hasHit: false })).toBe(false);
    expect(world.isInGuardDistance(target, { runtime: attacker, currentMove: move, moveTick: 2, hasHit: true })).toBe(false);
    expect(world.isInGuardDistance(target, { runtime: attacker, currentMove: move, moveTick: 1, hasHit: false })).toBe(false);
    expect(world.isInGuardDistance(target, { runtime: attacker, currentMove: move, moveTick: 7, hasHit: false })).toBe(false);
  });

  it("applies guard flags and AssertSpecial restrictions before distance checks", () => {
    const world = new RuntimeGuardDistanceWorld();
    const attacker = runtime({ pos: { x: 0, y: 0 }, facing: 1 });
    const defender = runtime({ pos: { x: 120, y: 0 }, facing: -1 });
    const target = { runtime: defender, hurtBoxes: [hurtBox()] };

    expect(
      world.isInGuardDistance(target, {
        runtime: attacker,
        currentMove: guardMove({ guardFlag: "L" }),
        moveTick: 3,
        hasHit: false,
      }),
    ).toBe(false);

    expect(
      world.isInGuardDistance(
        { runtime: runtime({ ...defender, assertSpecial: { flags: ["nostandguard"], globalFlags: [], noStandGuard: true } }), hurtBoxes: [hurtBox()] },
        { runtime: attacker, currentMove: guardMove(), moveTick: 3, hasHit: false },
      ),
    ).toBe(false);

    expect(
      world.isInGuardDistance(target, {
        runtime: runtime({ ...attacker, assertSpecial: { flags: ["unguardable"], globalFlags: [], unguardable: true } }),
        currentMove: guardMove(),
        moveTick: 3,
        hasHit: false,
      }),
    ).toBe(false);
  });

  it("uses authored guard distance when present", () => {
    const world = new RuntimeGuardDistanceWorld();
    const attacker = runtime({ pos: { x: 0, y: 0 }, facing: 1 });
    const defender = runtime({ pos: { x: 120, y: 0 }, facing: -1 });
    const target = { runtime: defender, hurtBoxes: [hurtBox()] };

    expect(
      world.isInGuardDistance(target, {
        runtime: attacker,
        currentMove: guardMove({ guardDistance: 96 }),
        moveTick: 3,
        hasHit: false,
      }),
    ).toBe(true);

    expect(
      world.isInGuardDistance(target, {
        runtime: attacker,
        currentMove: guardMove({ guardDistance: 40 }),
        moveTick: 3,
        hasHit: false,
      }),
    ).toBe(false);
  });
});

function guardMove(overrides: Partial<RuntimeGuardDistanceMove> = {}): RuntimeGuardDistanceMove {
  return {
    activeStart: 3,
    activeEnd: 6,
    guardFlag: "MA",
    guardDistance: 96,
    hitbox: { x1: 20, y1: -60, x2: 40, y2: -20 },
    ...overrides,
  };
}

function hurtBox() {
  return { x1: -10, y1: -50, x2: 10, y2: 0 };
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

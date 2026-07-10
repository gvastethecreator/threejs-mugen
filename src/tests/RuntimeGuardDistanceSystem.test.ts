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

  it("creates and clears a direct-attack latch with source and tick provenance", () => {
    const world = new RuntimeGuardDistanceWorld();
    const defender = { runtime: runtime({ pos: { x: 120, y: 0 }, facing: -1 }), hurtBoxes: [hurtBox()] };
    const attacker = {
      id: "p1",
      runtime: runtime({ pos: { x: 0, y: 0 }, facing: 1 }),
      currentMove: guardMove(),
      moveTick: 2,
      hasHit: false,
    };

    expect(world.refreshLatch({ defender, attacker, projectiles: [], tick: 7 })).toEqual({
      attackerId: "p1",
      source: "direct",
      observedTick: 7,
    });
    expect(world.refreshLatch({ defender, attacker: { ...attacker, moveTick: 8 }, projectiles: [], tick: 8 })).toBeUndefined();
  });

  it("latches projectile guard distance and rejects spent projectiles", () => {
    const world = new RuntimeGuardDistanceWorld();
    const defender = { runtime: runtime({ pos: { x: 120, y: 0 }, facing: -1 }), hurtBoxes: [hurtBox()] };
    const attacker = {
      id: "p1",
      runtime: runtime({ pos: { x: 0, y: 0 }, facing: 1 }),
      moveTick: 0,
      hasHit: false,
    };
    const activeProjectile = projectile();

    expect(world.refreshLatch({ defender, attacker, projectiles: [activeProjectile], tick: 4 })).toEqual({
      attackerId: "p1",
      source: "projectile",
      observedTick: 4,
    });
    expect(world.refreshLatch({ defender, attacker, projectiles: [{ ...activeProjectile, hasHit: true }], tick: 5 })).toBeUndefined();
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

function projectile() {
  return {
    pos: { x: 40, y: 0 },
    facing: 1 as const,
    guardDistance: 72,
    guardFlag: "MA",
    hasHit: false,
    hitsRemaining: 1,
    missTimeRemaining: 0,
    action: { frames: [{ clsn1: [{ x1: 0, y1: -60, x2: 20, y2: -20 }] }] },
    frameIndex: 0,
    hitbox: { x1: 0, y1: -60, x2: 20, y2: -20 },
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

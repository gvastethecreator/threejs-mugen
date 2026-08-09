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

  it("uses the resolved currentMove guard distance for the direct precontact latch", () => {
    const world = new RuntimeGuardDistanceWorld();
    const attacker = runtime({ pos: { x: 0, y: 0 }, facing: 1 });
    const defender = runtime({ pos: { x: 120, y: 0 }, facing: -1 });
    const target = { runtime: defender, hurtBoxes: [hurtBox()] };
    const direct = {
      id: "p1",
      runtime: attacker,
      moveTick: 3,
      hasHit: false,
    };

    expect(
      world.refreshLatch({
        defender: target,
        attacker: {
          ...direct,
          currentMove: guardMove({ guardDistance: 96 }),
        },
        projectiles: [],
        tick: 7,
      }),
    ).toEqual({ attackerId: "p1", source: "direct", observedTick: 7 });

    expect(
      world.refreshLatch({
        defender: target,
        attacker: {
          ...direct,
          currentMove: guardMove({ guardDistance: 40 }),
        },
        projectiles: [],
        tick: 8,
      }),
    ).toBeUndefined();
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

  it("checks Projectile width, height, and depth from its origin", () => {
    const world = new RuntimeGuardDistanceWorld();
    const attacker = {
      id: "p1",
      runtime: runtime({ pos: { x: 0, y: 0 }, facing: 1 }),
      moveTick: 0,
      hasHit: false,
    };
    const candidate = {
      ...projectile(),
      pos: { x: 40, y: 20, z: 4 },
      guardDistanceBounds: {
        width: [90, 12] as [number, number],
        height: [25, 15] as [number, number],
        depth: [8, 6] as [number, number],
      },
    };
    const defender = (x: number, y: number, z: number) => ({
      runtime: runtime({
        pos: { x, y },
        facing: -1,
        combatDepth: { position: z, velocity: 0, size: [0, 0], attack: [0, 0] },
      }),
      hurtBoxes: [hurtBox()],
    });

    expect(world.refreshLatch({ defender: defender(120, 30, 9), attacker, projectiles: [candidate], tick: 1 })?.source).toBe("projectile");
    expect(world.refreshLatch({ defender: defender(130, 30, 9), attacker, projectiles: [candidate], tick: 1 })).toBeUndefined();
    expect(world.refreshLatch({ defender: defender(120, 35, 9), attacker, projectiles: [candidate], tick: 1 })).toBeUndefined();
    expect(world.refreshLatch({ defender: defender(120, 30, 10), attacker, projectiles: [candidate], tick: 1 })).toBeUndefined();
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
    guardDistanceBounds: {
      width: [90, 0] as [number, number],
      height: [1000, 1000] as [number, number],
      depth: [10, 10] as [number, number],
    },
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

import { describe, expect, it } from "vitest";
import {
  hasRuntimeStun,
  RuntimeStunWorld,
  tickRuntimeGuardStun,
  tickRuntimeStun,
  type RuntimeStunActor,
} from "../mugen/runtime/RuntimeStunSystem";

describe("RuntimeStunSystem", () => {
  it("reports active hitstun or guardstun as runtime stun", () => {
    expect(hasRuntimeStun(actor({ hitStun: 0, guardStun: 0 }))).toBe(false);
    expect(hasRuntimeStun(actor({ hitStun: 2, guardStun: 0 }))).toBe(true);
    expect(hasRuntimeStun(actor({ hitStun: 0, guardStun: 3 }))).toBe(true);
  });

  it("ticks guard stun, keeps guarding while frames remain, and applies guard friction", () => {
    const fighter = actor({ hitStun: 0, guardStun: 2, velX: 10, moveType: "I" });

    const first = tickRuntimeStun(fighter);
    expect(first).toEqual({ guardActive: true, hitActive: false });
    expect(fighter.runtime.guardStun).toBe(1);
    expect(fighter.runtime.guarding).toBe(true);
    expect(fighter.runtime.moveType).toBe("H");
    expect(fighter.runtime.vel.x).toBeCloseTo(8.2);

    tickRuntimeStun(fighter);
    expect(fighter.runtime.guardStun).toBe(0);
    expect(fighter.runtime.guarding).toBe(false);
  });

  it("can tick only guard stun without changing hit stun", () => {
    const fighter = actor({ hitStun: 3, guardStun: 1, velX: 10, moveType: "I" });

    expect(tickRuntimeGuardStun(fighter)).toBe(true);
    expect(fighter.runtime.guardStun).toBe(0);
    expect(fighter.runtime.guarding).toBe(false);
    expect(fighter.hitStun).toBe(3);
    expect(fighter.runtime.vel.x).toBeCloseTo(8.2);
  });

  it("ticks hit stun and applies hit friction", () => {
    const fighter = actor({ hitStun: 2, guardStun: 0, velX: -10 });

    const result = tickRuntimeStun(fighter);

    expect(result).toEqual({ guardActive: false, hitActive: true });
    expect(fighter.hitStun).toBe(1);
    expect(fighter.runtime.vel.x).toBeCloseTo(-8.8);
  });

  it("applies both guard and hit friction when both timers are active", () => {
    const fighter = actor({ hitStun: 1, guardStun: 1, velX: 10 });

    const result = tickRuntimeStun(fighter);

    expect(result).toEqual({ guardActive: true, hitActive: true });
    expect(fighter.hitStun).toBe(0);
    expect(fighter.runtime.guardStun).toBe(0);
    expect(fighter.runtime.vel.x).toBeCloseTo(10 * 0.82 * 0.88);
  });

  it("owns hitstun action requests and moveType recovery after timers expire", () => {
    const world = new RuntimeStunWorld();
    const fighter = actor({ hitStun: 1, guardStun: 1, velX: 10, moveType: "H" });
    const actions: RuntimeStunActor[] = [];

    const result = world.advance(fighter, {
      showHitStunAction: (target) => actions.push(target),
    });

    expect(result).toEqual({
      guardActive: true,
      hitActive: true,
      hitStunActionRequests: 2,
      restoredIdleMoveType: true,
    });
    expect(actions).toEqual([fighter, fighter]);
    expect(fighter.runtime.moveType).toBe("I");
    expect(world.hasStun(fighter)).toBe(false);
  });

  it("preserves imported hit-state moveType and suppresses presentation callbacks", () => {
    const world = new RuntimeStunWorld();
    const fighter = actor({ hitStun: 1, guardStun: 1, velX: 6, moveType: "H" });
    const actions: RuntimeStunActor[] = [];

    const result = world.advance(fighter, {
      preserveImportedStateMoveType: true,
      showHitStunAction: (target) => actions.push(target),
    });

    expect(result).toMatchObject({
      guardActive: true,
      hitActive: true,
      hitStunActionRequests: 0,
      restoredIdleMoveType: false,
    });
    expect(actions).toEqual([]);
    expect(fighter.runtime.moveType).toBe("H");
  });

  it("keeps current attacks from being restored to idle moveType", () => {
    const world = new RuntimeStunWorld();
    const fighter = actor({ hitStun: 1, guardStun: 0, velX: -4, moveType: "A" });

    const result = world.advance(fighter, { hasCurrentMove: true });

    expect(result.restoredIdleMoveType).toBe(false);
    expect(fighter.runtime.moveType).toBe("A");
    expect(fighter.hitStun).toBe(0);
  });

  it("can suppress hitstun presentation while still restoring non-imported moveType", () => {
    const world = new RuntimeStunWorld();
    const fighter = actor({ hitStun: 1, guardStun: 0, moveType: "H" });
    const actions: RuntimeStunActor[] = [];

    const result = world.advance(fighter, {
      suppressHitStunAction: true,
      showHitStunAction: (target) => actions.push(target),
    });

    expect(result.hitStunActionRequests).toBe(0);
    expect(result.restoredIdleMoveType).toBe(true);
    expect(actions).toEqual([]);
    expect(fighter.runtime.moveType).toBe("I");
  });
});

function actor(options: { hitStun: number; guardStun: number; velX?: number; moveType?: "I" | "A" | "H" }): RuntimeStunActor {
  return {
    hitStun: options.hitStun,
    runtime: {
      guardStun: options.guardStun,
      guarding: false,
      moveType: options.moveType ?? "I",
      vel: { x: options.velX ?? 0, y: 0 },
    },
  };
}

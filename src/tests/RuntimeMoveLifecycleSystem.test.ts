import { describe, expect, it } from "vitest";
import {
  RuntimeMoveLifecycleWorld,
  type RuntimeMoveLifecycleActor,
} from "../mugen/runtime/RuntimeMoveLifecycleSystem";

describe("RuntimeMoveLifecycleWorld", () => {
  it("no-ops when actor has no current move", () => {
    const world = new RuntimeMoveLifecycleWorld();
    const fighter = actor();

    const result = world.advance(fighter);

    expect(result).toEqual({ active: false, completed: false, clearedReversal: false, restoredIdle: false });
    expect(fighter.moveTick).toBe(0);
  });

  it("owns active non-reversal move tick, attack movetype, and horizontal hold", () => {
    const world = new RuntimeMoveLifecycleWorld();
    const fighter = actor({ currentMove: { startup: 2, recovery: 2 }, moveTick: 1, velX: 5 });

    const result = world.advance(fighter);

    expect(result).toEqual({ active: true, completed: false, clearedReversal: false, restoredIdle: false });
    expect(fighter.moveTick).toBe(2);
    expect(fighter.runtime.moveType).toBe("A");
    expect(fighter.runtime.vel.x).toBe(0);
  });

  it("clears completed non-reversal moves and asks hooks to restore idle", () => {
    const world = new RuntimeMoveLifecycleWorld();
    const fighter = actor({
      currentMove: { startup: 1, recovery: 1 },
      currentMoveLabel: "punch",
      hasHit: true,
      moveTick: 2,
      reversal: true,
    });
    const calls: string[] = [];

    const result = world.advance(fighter, {
      restoreControl: () => calls.push("control"),
      enterIdleState: () => calls.push("state"),
      changeIdleAction: () => calls.push("anim"),
    });

    expect(result).toEqual({ active: false, completed: true, clearedReversal: false, restoredIdle: true });
    expect(fighter.currentMove).toBeUndefined();
    expect(fighter.currentMoveLabel).toBeUndefined();
    expect(fighter.moveTick).toBe(0);
    expect(fighter.hasHit).toBe(false);
    expect(fighter.runtime.reversal).toBeUndefined();
    expect(fighter.runtime.moveType).toBe("I");
    expect(calls).toEqual(["control", "state", "anim"]);
  });

  it("clears completed reversal moves without forcing idle hooks", () => {
    const world = new RuntimeMoveLifecycleWorld();
    const fighter = actor({
      currentMove: { startup: 0, recovery: 0, isReversal: true },
      currentMoveLabel: "counter",
      moveTick: 0,
      hasHit: true,
      moveType: "A",
      velX: 7,
      reversal: true,
    });
    const calls: string[] = [];

    const result = world.advance(fighter, {
      restoreControl: () => calls.push("control"),
      enterIdleState: () => calls.push("state"),
      changeIdleAction: () => calls.push("anim"),
    });

    expect(result).toEqual({ active: false, completed: true, clearedReversal: true, restoredIdle: false });
    expect(fighter.currentMove).toBeUndefined();
    expect(fighter.currentMoveLabel).toBeUndefined();
    expect(fighter.hasHit).toBe(false);
    expect(fighter.runtime.reversal).toBeUndefined();
    expect(fighter.runtime.moveType).toBe("A");
    expect(fighter.runtime.vel.x).toBe(7);
    expect(calls).toEqual([]);
  });
});

function actor(overrides: Partial<RuntimeMoveLifecycleActor> & { velX?: number; moveType?: "I" | "A" | "H"; reversal?: boolean } = {}): RuntimeMoveLifecycleActor {
  return {
    currentMove: overrides.currentMove,
    currentMoveLabel: overrides.currentMoveLabel,
    moveTick: overrides.moveTick ?? 0,
    hasHit: overrides.hasHit ?? false,
    runtime: {
      moveType: overrides.moveType ?? "I",
      vel: { x: overrides.velX ?? 0, y: 0 },
      ...(overrides.reversal ? { reversal: { attr: "S,NA", hitPause: 6 } } : {}),
    },
  };
}

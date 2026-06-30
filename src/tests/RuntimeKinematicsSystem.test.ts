import { describe, expect, it } from "vitest";
import {
  RuntimeKinematicsWorld,
  type RuntimeKinematicsActor,
} from "../mugen/runtime/RuntimeKinematicsSystem";

describe("RuntimeKinematicsWorld", () => {
  it("moves grounded actors by velocity without gravity", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ posX: 4, posY: -2, velX: 3, velY: 1, stateType: "S", physics: "S" });

    const result = world.advance(fighter);

    expect(result).toEqual({ moved: true, appliedGravity: false, landed: false, changedIdleAction: false });
    expect(fighter.runtime.pos).toEqual({ x: 7, y: -1 });
    expect(fighter.runtime.vel).toEqual({ x: 3, y: 1 });
  });

  it("applies current sandbox gravity to airborne actors after velocity integration", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ posY: -12, velY: -4, stateType: "A", physics: "A" });

    const result = world.advance(fighter);

    expect(result).toEqual({ moved: true, appliedGravity: true, landed: false, changedIdleAction: false });
    expect(fighter.runtime.pos.y).toBe(-16);
    expect(fighter.runtime.vel.y).toBeCloseTo(-3.45);
  });

  it("snaps non-import-preserved landing to ground and requests idle action when no move is active", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ posY: -1, velY: 3, stateType: "A", physics: "A" });
    const calls: string[] = [];

    const result = world.advance(fighter, { changeIdleAction: () => calls.push("idle") });

    expect(result).toEqual({ moved: true, appliedGravity: true, landed: true, changedIdleAction: true });
    expect(fighter.runtime.pos.y).toBe(0);
    expect(fighter.runtime.vel.y).toBe(0);
    expect(fighter.runtime.stateType).toBe("S");
    expect(fighter.runtime.physics).toBe("S");
    expect(calls).toEqual(["idle"]);
  });

  it("does not request idle action when an active move lands", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ currentMove: {}, posY: -1, velY: 3, stateType: "A", physics: "A" });
    const calls: string[] = [];

    const result = world.advance(fighter, { changeIdleAction: () => calls.push("idle") });

    expect(result).toMatchObject({ landed: true, changedIdleAction: false });
    expect(fighter.runtime.stateType).toBe("S");
    expect(calls).toEqual([]);
  });

  it("preserves imported hit-state vertical position instead of snapping to ground", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ posY: -1, velY: 3, stateType: "A", physics: "A" });

    const result = world.advance(fighter, { preserveImportedStateMoveType: true });

    expect(result).toEqual({ moved: true, appliedGravity: true, landed: false, changedIdleAction: false });
    expect(fighter.runtime.pos.y).toBe(2);
    expect(fighter.runtime.vel.y).toBeCloseTo(3.55);
    expect(fighter.runtime.stateType).toBe("A");
    expect(fighter.runtime.physics).toBe("A");
  });
});

function actor(
  overrides: Partial<RuntimeKinematicsActor> & {
    currentMove?: unknown;
    physics?: "S" | "C" | "A" | "N";
    posX?: number;
    posY?: number;
    stateType?: "S" | "C" | "A" | "L";
    velX?: number;
    velY?: number;
  } = {},
): RuntimeKinematicsActor {
  const stateType = overrides.stateType ?? "S";
  const physics = overrides.physics ?? (stateType === "L" ? "N" : stateType);
  return {
    currentMove: overrides.currentMove,
    runtime: {
      pos: { x: overrides.posX ?? 0, y: overrides.posY ?? 0 },
      vel: { x: overrides.velX ?? 0, y: overrides.velY ?? 0 },
      stateType,
      physics,
    },
  };
}

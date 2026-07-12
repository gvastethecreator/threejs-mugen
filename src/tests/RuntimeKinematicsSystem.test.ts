import { describe, expect, it } from "vitest";
import {
  RuntimeKinematicsWorld,
  runtimeGroundFrictionOptions,
  type RuntimeKinematicsActor,
} from "../mugen/runtime/RuntimeKinematicsSystem";

describe("RuntimeKinematicsWorld", () => {
  it("moves grounded actors by velocity without gravity", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ posX: 4, posY: -2, posZ: 5, velX: 3, velY: 1, velZ: -2, stateType: "S", physics: "S" });

    const result = world.advance(fighter);

    expect(result).toEqual({ moved: true, appliedGravity: false, landed: false, changedIdleAction: false });
    expect(fighter.runtime.pos).toEqual({ x: 7, y: -1 });
    expect(fighter.runtime.vel).toEqual({ x: 3, y: 1 });
    expect(fighter.runtime.combatDepth).toMatchObject({ position: 3, velocity: -2 });
  });

  it("applies imported standing friction to x and z after position integration", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ velX: 4, velZ: -2, physics: "S" });

    world.advance(fighter, { groundFriction: runtimeGroundFrictionOptions() });

    expect(fighter.runtime.pos.x).toBe(4);
    expect(fighter.runtime.combatDepth?.position).toBe(-2);
    expect(fighter.runtime.vel.x).toBeCloseTo(3.4);
    expect(fighter.runtime.combatDepth?.velocity).toBeCloseTo(-1.7);
  });

  it("uses authored standing friction and localcoord-scaled stop threshold for x and z", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ velX: 1.5, velZ: -1.5, physics: "S" });

    world.advance(fighter, {
      groundFriction: runtimeGroundFrictionOptions({ "movement.stand.friction": 0.5 }, [640, 480]),
    });

    expect(fighter.runtime.pos.x).toBe(1.5);
    expect(fighter.runtime.combatDepth?.position).toBe(-1.5);
    expect(fighter.runtime.vel.x).toBe(0);
    expect(fighter.runtime.combatDepth?.velocity).toBe(0);
  });

  it("applies authored crouching friction to x and z without the standing threshold", () => {
    const world = new RuntimeKinematicsWorld();
    const fighter = actor({ velX: 0.5, velZ: -0.5, stateType: "C", physics: "C" });

    world.advance(fighter, {
      groundFriction: runtimeGroundFrictionOptions({ "movement.crouch.friction": 0.4 }, [640, 480]),
    });

    expect(fighter.runtime.vel.x).toBeCloseTo(0.2);
    expect(fighter.runtime.combatDepth?.velocity).toBeCloseTo(-0.2);
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
    posZ?: number;
    stateType?: "S" | "C" | "A" | "L";
    velX?: number;
    velY?: number;
    velZ?: number;
  } = {},
): RuntimeKinematicsActor {
  const stateType = overrides.stateType ?? "S";
  const physics = overrides.physics ?? (stateType === "L" ? "N" : stateType);
  return {
    currentMove: overrides.currentMove,
    runtime: {
      pos: { x: overrides.posX ?? 0, y: overrides.posY ?? 0 },
      vel: { x: overrides.velX ?? 0, y: overrides.velY ?? 0 },
      combatDepth: {
        position: overrides.posZ ?? 0,
        velocity: overrides.velZ ?? 0,
        size: [3, 3],
        attack: [4, 4],
      },
      stateType,
      physics,
    },
  };
}

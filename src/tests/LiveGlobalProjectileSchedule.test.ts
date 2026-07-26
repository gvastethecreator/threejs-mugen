import { describe, expect, it } from "vitest";
import {
  liveGlobalProjectileScheduleIsStable,
  orderProjectilesForCombat,
  runLiveGlobalProjectileSchedule,
} from "../mugen/runtime/LiveGlobalProjectileSchedule";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";

function projectile(partial: Partial<RuntimeProjectile> & Pick<RuntimeProjectile, "serialId" | "ownerId">): RuntimeProjectile {
  const { serialId, ownerId, rootId, parentId, age, priority, ...rest } = partial;
  return {
    serialId,
    actorKind: "projectile",
    ownerId,
    rootId: rootId ?? ownerId,
    parentId: parentId ?? ownerId,
    spriteOwnerId: ownerId,
    spriteOwnerDefinitionId: "def",
    spriteOwnerLabel: ownerId,
    action: { id: 0, number: 0, frames: [], loopStart: 0, rawLines: [] } as RuntimeProjectile["action"],
    animNo: 0,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    accel: { x: 0, y: 0 },
    velMul: { x: 1, y: 1 },
    scale: { x: 1, y: 1 },
    facing: 1,
    terminalActions: {},
    frameIndex: 0,
    frameElapsed: 0,
    age: age ?? 0,
    removeTime: -1,
    stageBound: 40,
    spritePriority: 0,
    priority: priority ?? 0,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    opacity: 1,
    damage: 10,
    kill: true,
    guardKill: true,
    hitPause: 0,
    ...rest,
  } as RuntimeProjectile;
}

describe("LiveGlobalProjectileSchedule", () => {
  it("orders live projectiles by priority, age-derived spawn, side, then id", () => {
    const report = runLiveGlobalProjectileSchedule({
      tick: 100,
      projectiles: [
        projectile({ serialId: "p2-late", ownerId: "p2", age: 1, priority: 1 }),
        projectile({ serialId: "p1-old", ownerId: "p1", age: 10, priority: 1 }),
        projectile({ serialId: "p1-new", ownerId: "p1", age: 1, priority: 1 }),
        projectile({ serialId: "p2-hi", ownerId: "p2", age: 5, priority: 0 }),
      ],
    });
    // priority 0 first, then priority 1 by spawnTick (older first)
    expect(report.order[0]).toBe("p2-hi");
    expect(report.order).toContain("p1-old");
    expect(report.ordered.map((p) => p.serialId)).toEqual(report.order);
    expect(report.committed).toBe(true);
    expect(report.schemaLive).toBe("LiveGlobalProjectileSchedule/v1");
  });

  it("stays stable under reversed insertion including helper-owned projectiles", () => {
    const items = [
      projectile({ serialId: "root-a", ownerId: "p1", rootId: "p1", parentId: "p1", age: 3, priority: 2 }),
      projectile({ serialId: "help-b", ownerId: "p1", rootId: "p1", parentId: "helper-1", age: 3, priority: 2 }),
      projectile({ serialId: "root-c", ownerId: "p2", rootId: "p2", parentId: "p2", age: 2, priority: 2 }),
    ];
    expect(liveGlobalProjectileScheduleIsStable(items, { tick: 50 })).toBe(true);
    const forward = orderProjectilesForCombat(items, { tick: 50 }).map((p) => p.serialId);
    const reverse = orderProjectilesForCombat([...items].reverse(), { tick: 50 }).map((p) => p.serialId);
    expect(forward).toEqual(reverse);
  });

  it("wires schedule into EffectActorWorld for combat-ready order", () => {
    const world = new RuntimeEffectActorWorld();
    // Seed store projectiles via direct mutation of getStores for unit scope.
    const stores = world.getStores();
    stores.p1.projectiles.push(
      projectile({ serialId: "b", ownerId: "p1", age: 1, priority: 2 }),
      projectile({ serialId: "a", ownerId: "p1", age: 5, priority: 1 }),
    );
    const schedule = world.scheduleProjectilesForOwner("p1", 20);
    expect(schedule.order[0]).toBe("a");
    expect(schedule.order).toEqual(["a", "b"]);
    expect(schedule.checksum).toMatch(/^[0-9a-f]{8}$/);
    expect(world.getLastLiveProjectileSchedule()?.order).toEqual(["a", "b"]);
  });
});

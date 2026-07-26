import { describe, expect, it } from "vitest";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import { runLivePluralCombatOracle } from "../mugen/runtime/LivePluralCombatOracle";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";

function projectile(
  partial: Partial<RuntimeProjectile> & Pick<RuntimeProjectile, "serialId" | "ownerId">,
): RuntimeProjectile {
  return {
    serialId: partial.serialId,
    actorKind: "projectile",
    ownerId: partial.ownerId,
    rootId: partial.rootId ?? partial.ownerId,
    parentId: partial.parentId ?? partial.ownerId,
    spriteOwnerId: partial.ownerId,
    spriteOwnerDefinitionId: "def",
    spriteOwnerLabel: partial.ownerId,
    action: { number: 0, frames: [], loopStart: 0 } as RuntimeProjectile["action"],
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
    age: partial.age ?? 0,
    removeTime: -1,
    stageBound: 40,
    spritePriority: 0,
    priority: partial.priority ?? 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    opacity: 1,
    damage: 10,
    kill: true,
    guardKill: true,
    hitPause: 0,
    ...partial,
  } as RuntimeProjectile;
}

describe("LivePluralCombatOracle", () => {
  it("consumes live multi-owner and helper projectiles with integrity", () => {
    const world = new RuntimeEffectActorWorld();
    const stores = world.getStores();
    stores.p1.projectiles.push(
      projectile({ serialId: "p1-root", ownerId: "p1", age: 4, priority: 1 }),
      projectile({
        serialId: "p1-help",
        ownerId: "p1",
        rootId: "p1",
        parentId: "helper-9",
        age: 3,
        priority: 1,
      }),
    );
    stores.p2.projectiles.push(
      projectile({ serialId: "p2-root", ownerId: "p2", age: 2, priority: 0 }),
    );

    const report = runLivePluralCombatOracle({
      effectWorld: world,
      tick: 40,
      hitpauseTicks: 6,
      juggleCost: 2,
      juggleRemaining: 8,
      reversalAttr: "A",
      incomingAttr: "SA,NA",
    });

    expect(report.schema).toBe("LivePluralCombatOracle/v1");
    expect(report.liveSchedule.order).toContain("p2-root");
    expect(report.oracle.cellCount).toBeGreaterThanOrEqual(4);
    expect(report.integrity.reorderFails).toBe(true);
    expect(report.integrity.missingSubjectFails).toBe(true);
    expect(report.integrity.passed).toBe(true);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it("fails integrity when fewer than two live projectiles exist", () => {
    const report = runLivePluralCombatOracle({
      projectiles: [projectile({ serialId: "solo", ownerId: "p1", age: 1 })],
      tick: 10,
    });
    expect(report.integrity.passed).toBe(false);
  });
});

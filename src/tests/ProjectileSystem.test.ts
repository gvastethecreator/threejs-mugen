import { describe, expect, it } from "vitest";
import type { ProjectileControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import {
  advanceRuntimeProjectiles,
  createRuntimeProjectile,
  getRuntimeProjectileHitboxes,
  runtimeProjectileWorldBox,
  runtimeProjectilesToSnapshots,
  type RuntimeProjectile,
} from "../mugen/runtime/ProjectileSystem";

const stage: Pick<MugenStageDefinition, "bounds"> = {
  bounds: {
    left: -120,
    right: 120,
  },
};

const action: MugenAnimationAction = {
  id: 1005,
  loopStart: 0,
  rawLines: [],
  frames: [
    {
      spriteGroup: 1005,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 2,
      clsn1: [{ x1: 8, y1: -40, x2: 42, y2: -16 }],
      clsn2: [{ x1: -8, y1: -44, x2: 44, y2: -12 }],
      raw: "1005,0,0,0,2",
      line: 1,
    },
    {
      spriteGroup: 1005,
      spriteIndex: 1,
      offsetX: 1,
      offsetY: -1,
      duration: 1,
      clsn1: [],
      clsn2: [],
      raw: "1005,1,1,-1,1",
      line: 2,
    },
  ],
};

describe("ProjectileSystem", () => {
  it("creates a bounded projectile actor from controller params", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller({
        projid: "77",
        velocity: "5,-1",
        facing: "-1",
        projremovetime: "9999",
        projpriority: "12",
        sprpriority: "25",
        trans: "add",
        damage: "40",
        guardflag: "MA",
        "guard.pausetime": "3,3",
        "guard.hittime": "8",
        "guard.velocity": "-4,-1",
        attr: '"S,SP"',
        pausetime: "9",
        "ground.hittime": "21",
        "ground.velocity": "-7,-3",
        projremove: "0",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 12, y: -20 },
      fallbackFacing: 1,
      damageScale: 1.5,
    });

    expect(projectile).toMatchObject({
      serialId: "p1-projectile-0",
      projectileId: 77,
      actorKind: "projectile",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      animNo: 1005,
      pos: { x: 12, y: -20 },
      vel: { x: -5, y: -1 },
      facing: -1,
      removeTime: 1200,
      priority: 10,
      spritePriority: 10,
      opacity: 0.78,
      damage: 60,
      attr: "S,SP",
      targetId: 77,
      hitPause: 9,
      hitStun: 21,
      push: 7,
      hitVelocityY: -3,
      guardDamage: 0,
      guardFlag: "MA",
      guardPause: 3,
      guardStun: 8,
      guardPush: 4,
      guardVelocityY: -1,
      removeOnHit: false,
      hasHit: false,
    });
  });

  it("prefers typed projectile operations over raw controller params", () => {
    const operation: ProjectileControllerOp = {
      kind: "projectile",
      projectileId: 91,
      velocity: [7, -2],
      facing: 1,
      removeTime: 25,
      priority: 3,
      spritePriority: 6,
      trans: "none",
      damage: 22,
      attr: "S,SP",
      hitPause: 3,
      hitStun: 11,
      groundVelocity: [-9, -4],
      guardDamage: 5,
      guardDistance: 88,
      guardFlag: "MA",
      guardPauseTime: 2,
      guardHitTime: 7,
      guardVelocity: [-3, -1],
      removeOnHit: false,
    };
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-typed",
      controller: controller({
        projid: "77",
        velocity: "-99,0",
        facing: "-1",
        projremovetime: "9999",
        sprpriority: "-5",
        trans: "add",
        damage: "999",
        pausetime: "99",
        "ground.hittime": "99",
        "ground.velocity": "-1",
        projremove: "1",
      }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: -1,
    });

    expect(projectile).toMatchObject({
      projectileId: 91,
      vel: { x: 7, y: -2 },
      facing: 1,
      removeTime: 25,
      priority: 3,
      spritePriority: 6,
      opacity: 0.9,
      damage: 22,
      hitPause: 3,
      hitStun: 11,
      push: 9,
      hitVelocityY: -4,
      guardDamage: 5,
      guardDistance: 88,
      guardFlag: "MA",
      guardPause: 2,
      guardStun: 7,
      guardPush: 3,
      guardVelocityY: -1,
      removeOnHit: false,
    });
  });

  it("advances projectile movement, loops frames, and removes stale actors", () => {
    const active = projectile({ serialId: "active", removeTime: 8, vel: { x: 4, y: -2 } });
    const expired = projectile({ serialId: "expired", age: 4, removeTime: 5 });
    const hit = projectile({ serialId: "hit", hasHit: true, removeOnHit: true });
    const outside = projectile({ serialId: "outside", pos: { x: 999, y: 0 } });

    const remaining = advanceRuntimeProjectiles([active, expired, hit, outside], stage);
    expect(remaining.map((entry) => entry.serialId)).toEqual(["active"]);
    expect(active).toMatchObject({
      age: 1,
      frameIndex: 0,
      frameElapsed: 1,
      pos: { x: 4, y: -2 },
    });

    advanceRuntimeProjectiles([active], stage);
    expect(active.frameIndex).toBe(1);

    advanceRuntimeProjectiles([active], stage);
    expect(active.frameIndex).toBe(0);
  });

  it("projects hitboxes and snapshots without sharing collision arrays", () => {
    const shot = projectile({ frameIndex: 0, facing: -1, pos: { x: 100, y: 20 } });
    const [snapshot] = runtimeProjectilesToSnapshots([shot], 1000);

    expect(getRuntimeProjectileHitboxes(shot)).toEqual([{ x1: 8, y1: -40, x2: 42, y2: -16 }]);
    expect(runtimeProjectileWorldBox(shot, { x1: 8, y1: -40, x2: 42, y2: -16 })).toEqual({
      x1: 58,
      x2: 92,
      y1: -20,
      y2: 4,
    });
    expect(snapshot).toMatchObject({
      id: "p1-projectile-0",
      label: "Projectile 77",
      actorKind: "projectile",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      source: "effect",
      runtime: {
        pos: { x: 100, y: 20 },
        vel: { x: 2, y: 0 },
        facing: -1,
        stateNo: 1000,
        animNo: 1005,
        moveType: "A",
        renderOpacity: 1,
      },
      clsn1: [{ x1: 8, y1: -40, x2: 42, y2: -16 }],
      clsn2: [{ x1: -8, y1: -44, x2: 44, y2: -12 }],
    });
    expect(snapshot?.clsn1[0]).not.toBe(action.frames[0]?.clsn1[0]);
    expect(snapshot?.clsn2[0]).not.toBe(action.frames[0]?.clsn2[0]);
  });

  it("uses the fallback hitbox when the current AIR frame lacks Clsn1", () => {
    const shot = projectile({ frameIndex: 1, hitbox: { x1: 1, y1: 2, x2: 3, y2: 4 } });

    expect(getRuntimeProjectileHitboxes(shot)).toEqual([{ x1: 1, y1: 2, x2: 3, y2: 4 }]);
  });
});

function projectile(overrides: Partial<RuntimeProjectile> = {}): RuntimeProjectile {
  return {
    serialId: "p1-projectile-0",
    projectileId: 77,
    actorKind: "projectile",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action,
    animNo: 1005,
    pos: { x: 0, y: 0 },
    vel: { x: 2, y: 0 },
    facing: 1,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: 10,
    priority: 1,
    spritePriority: 4,
    opacity: 1,
    damage: 30,
    attr: "S,SP",
    targetId: 77,
    hitPause: 6,
    hitStun: 18,
    push: 18,
    guardDamage: 0,
    guardDistance: 0,
    guardFlag: "MA",
    guardPause: 5,
    guardStun: 10,
    guardPush: 10,
    hitbox: { x1: 8, y1: -40, x2: 42, y2: -16 },
    removeOnHit: true,
    hasHit: false,
    ...overrides,
  };
}

function controller(params: Record<string, string>): MugenStateController {
  return {
    stateId: 1000,
    type: "Projectile",
    params,
    triggers: [],
    line: 1,
    rawHeader: "[State 1000, Projectile]",
  };
}

import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import { RuntimeMatchHelperProjectileTargetWorld } from "../mugen/runtime/RuntimeMatchHelperProjectileTargetSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";

describe("RuntimeMatchHelperProjectileTargetWorld", () => {
  it("forwards match actors, projectile, and target memory world through the helper target seam", () => {
    const owner = ownerActor();
    const defender = { id: "p2" };
    const projectile = projectileActor("p1-helper-0", 77);
    const targetWorld = new RuntimeTargetWorld();
    const calls: unknown[] = [];
    const world = new RuntimeMatchHelperProjectileTargetWorld({
      remember: (input) => {
        calls.push(input);
        return { remembered: false, reason: "missing-helper" };
      },
    });

    const result = world.remember({ owner, defender, projectile, targetWorld });

    expect(result).toEqual({ remembered: false, reason: "missing-helper" });
    expect(calls).toEqual([{ owner, defender, projectile, targetWorld }]);
  });

  it("keeps lower helper-projectile target fail-closed behavior at the match boundary", () => {
    const owner = ownerActor();
    const helper = owner.effectActorWorld.spawnHelper("p1", helperInput({ id: "42" }));
    const ownerProjectile = owner.effectActorWorld.spawnProjectile(
      "p1",
      projectileInput({ projid: "77", projanim: "910" }),
    );

    const result = new RuntimeMatchHelperProjectileTargetWorld().remember({
      owner,
      defender: { id: "p2" },
      projectile: ownerProjectile,
      targetWorld: new RuntimeTargetWorld(),
    });

    expect(result).toEqual({ remembered: false, reason: "owner-projectile" });
    expect(helper.targets).toEqual([]);
  });
});

function ownerActor(): { id: string; effectActorWorld: RuntimeEffectActorWorld } {
  return {
    id: "p1",
    effectActorWorld: new RuntimeEffectActorWorld(),
  };
}

function projectileActor(parentId: string, targetId?: number): RuntimeProjectile {
  return {
    serialId: "projectile-0",
    projectileId: targetId,
    actorKind: "projectile",
    ownerId: "p1",
    rootId: "p1",
    parentId,
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "test",
    spriteOwnerLabel: "Test",
    action: action(910),
    animNo: 910,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    accel: { x: 0, y: 0 },
    velMul: { x: 1, y: 1 },
    scale: { x: 1, y: 1 },
    facing: 1,
    terminalActions: {},
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: 60,
    spritePriority: 0,
    priority: 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    opacity: 1,
    damage: 30,
    targetId,
    hitPause: 0,
    hitStun: 1,
    push: 0,
    guardDamage: 0,
    guardDistance: 0,
    guardPause: 0,
    guardStun: 1,
    guardPush: 0,
    hitbox: { x1: -10, y1: -20, x2: 10, y2: 0 },
    removeOnHit: true,
    hasHit: false,
  };
}

function helperInput(params: Record<string, string>) {
  return {
    controller: controller("Helper", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "test",
    spriteOwnerLabel: "Test",
    action: action(900),
    stateNo: 6000,
    animNo: 900,
    pos: { x: 0, y: 0 },
    fallbackFacing: 1 as const,
  };
}

function projectileInput(params: Record<string, string>) {
  return {
    controller: controller("Projectile", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "test",
    spriteOwnerLabel: "Test",
    action: action(Number(params.projanim ?? 910)),
    animNo: Number(params.projanim ?? 910),
    terminalActions: {},
    pos: { x: 0, y: 0 },
    fallbackFacing: 1 as const,
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function action(id: number): MugenAnimationAction {
  return {
    id,
    loopStart: 0,
    rawLines: [],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 4,
        clsn1: [{ x1: -10, y1: -20, x2: 10, y2: 0 }],
        clsn2: [],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

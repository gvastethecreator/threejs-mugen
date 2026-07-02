import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import { RuntimeHelperProjectileTargetWorld } from "../mugen/runtime/RuntimeHelperProjectileTargetSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";

describe("RuntimeHelperProjectileTargetWorld", () => {
  it("mirrors helper-parented projectile contact into helper target memory", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const targetWorld = new RuntimeTargetWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Shooter"' }));
    const projectile = effectActorWorld.spawnProjectile(
      "p1",
      projectileInput({ projid: "77", projanim: "910" }, { parentId: helper.serialId }),
    );

    const result = new RuntimeHelperProjectileTargetWorld().remember({
      owner: { id: "p1", effectActorWorld },
      defender: { id: "p2" },
      projectile,
      targetWorld,
    });

    expect(result).toMatchObject({ remembered: true, targetId: 77 });
    expect(helper.targets).toEqual([{ actorId: "p2", targetId: 77, age: 0 }]);
  });

  it("ignores owner-parented projectiles", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42" }));
    const projectile = effectActorWorld.spawnProjectile("p1", projectileInput({ projid: "77", projanim: "910" }));

    const result = new RuntimeHelperProjectileTargetWorld().remember({
      owner: { id: "p1", effectActorWorld },
      defender: { id: "p2" },
      projectile,
      targetWorld: new RuntimeTargetWorld(),
    });

    expect(result).toEqual({ remembered: false, reason: "owner-projectile" });
    expect(helper.targets).toEqual([]);
  });

  it("fails closed when the projectile parent helper no longer exists", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const projectile = effectActorWorld.spawnProjectile(
      "p1",
      projectileInput({ projid: "77", projanim: "910" }, { parentId: "p1-helper-missing" }),
    );

    const result = new RuntimeHelperProjectileTargetWorld().remember({
      owner: { id: "p1", effectActorWorld },
      defender: { id: "p2" },
      projectile,
      targetWorld: new RuntimeTargetWorld(),
    });

    expect(result).toEqual({ remembered: false, reason: "missing-helper" });
  });
});

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

function projectileInput(params: Record<string, string>, identity: { parentId?: string } = {}) {
  return {
    controller: controller("Projectile", params),
    ...(identity.parentId ? { parentId: identity.parentId } : {}),
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

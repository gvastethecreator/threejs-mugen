import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import { RuntimeEffectLifecycleWorld, type RuntimeEffectLifecycleActor } from "../mugen/runtime/EffectLifecycleSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("EffectLifecycleSystem", () => {
  it("owns active tick, presentation tick, snapshots, and get-hit cleanup over effect actors", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const actor = lifecycleActor(effectActorWorld);
    const lifecycle = new RuntimeEffectLifecycleWorld();

    effectActorWorld.spawnExplod("p1", explodInput({ id: "10", removeongethit: "1", removetime: "-1" }));
    effectActorWorld.spawnExplod("p1", explodInput({ id: "11", removetime: "-1" }));
    effectActorWorld.spawnHelper("p1", helperInput({ removetime: "1" }));
    effectActorWorld.spawnProjectile("p1", projectileInput({ velocity: "3,0" }));

    expect(lifecycle.snapshotGroups(actor)).toMatchObject({
      explods: [{ actorKind: "explod" }, { actorKind: "explod" }],
      helpers: [{ actorKind: "helper" }],
      projectiles: [{ actorKind: "projectile" }],
    });
    expect(lifecycle.snapshots(actor).map((snapshot) => snapshot.actorKind)).toEqual([
      "explod",
      "explod",
      "helper",
      "projectile",
    ]);

    lifecycle.advanceActive(actor, { bounds: { left: -160, right: 160 } });

    expect(effectActorWorld.getStore("p1").helpers).toEqual([]);
    expect(effectActorWorld.projectiles("p1")[0]?.pos.x).toBe(3);
    expect(effectActorWorld.getStore("p1").explods.map((explod) => explod.explodId)).toEqual([11, 10]);

    lifecycle.advancePresentation(actor);
    expect(effectActorWorld.getStore("p1").explods.map((explod) => explod.age)).toEqual([1, 1]);

    lifecycle.markGetHit(actor);

    expect(actor.runtime.moveType).toBe("H");
    expect(effectActorWorld.getStore("p1").explods.map((explod) => explod.explodId)).toEqual([11]);
  });
});

function lifecycleActor(effectActorWorld: RuntimeEffectActorWorld): RuntimeEffectLifecycleActor {
  return {
    id: "p1",
    runtime: runtimeState(),
    effectActorWorld,
  };
}

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
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
  };
}

function explodInput(params: Record<string, string>) {
  return {
    controller: controller("Explod", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action: action(),
    animNo: Number(params.anim ?? 900),
    pos: { x: 0, y: 0 },
    fallbackFacing: 1 as const,
    defaultRemoveTime: 4,
  };
}

function helperInput(params: Record<string, string>) {
  return {
    controller: controller("Helper", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action: action(),
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
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action: action(),
    animNo: 900,
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

function action(id = 900): MugenAnimationAction {
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
        duration: 2,
        clsn1: [{ x1: 1, y1: -8, x2: 16, y2: -1 }],
        clsn2: [{ x1: -8, y1: -16, x2: 8, y2: 0 }],
        raw: `${id},0,0,0,2`,
        line: 1,
      },
    ],
  };
}

import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeAudioWorld } from "../mugen/runtime/AudioEventSystem";
import { RuntimeHitEffectWorld } from "../mugen/runtime/HitEffectSystem";
import { createRuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import {
  RuntimeContactPresentationWorld,
  type RuntimeContactPresentationActor,
} from "../mugen/runtime/RuntimeContactPresentationSystem";

describe("RuntimeContactPresentationSystem", () => {
  it("owns direct HitDef contact package metadata across sound and spark telemetry", () => {
    const world = new RuntimeContactPresentationWorld();
    const attacker = actor("p1", 200, 6);

    const result = world.emitHitDefContact({
      attacker,
      defender: { id: "p2" },
      kind: "hit",
      runtimeTick: 140,
      move: {
        hitSound: "S5,0",
        hitSpark: "S7001",
        guardSound: "S6,0",
        guardSpark: "S7000",
        sparkXy: [42, -58],
      },
    });

    expect(result.contact).toEqual({
      contactId: "direct:p1:p2:140:200:6:hit",
      contactTick: 140,
      contactKind: "hit",
    });
    expect(attacker.soundEvents[0]).toMatchObject({
      group: 5,
      index: 0,
      contactId: "direct:p1:p2:140:200:6:hit",
      contactTick: 140,
      contactKind: "hit",
    });
    expect(attacker.hitEffectEvents[0]).toMatchObject({
      sparkNo: 7001,
      offset: { x: 42, y: -58 },
      contactId: "direct:p1:p2:140:200:6:hit",
      contactTick: 140,
      contactKind: "hit",
      assetFrame: {
        source: "player",
        actionId: 7001,
        frameIndex: 0,
        spriteGroup: 7001,
        spriteIndex: 0,
      },
    });
    expect(result.sound).toBe(attacker.soundEvents[0]);
    expect(result.effect).toBe(attacker.hitEffectEvents[0]);
  });

  it("owns projectile contact package metadata across guard sound and spark telemetry", () => {
    const world = new RuntimeContactPresentationWorld();
    const attacker = actor("p1", 1000, 3);
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller("Projectile", {
        hitsound: "S5,0",
        guardsound: "S6,0",
        sparkno: "S7001",
        "guard.sparkno": "S7000",
        sparkxy: "18,-44",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "test-fighter",
      spriteOwnerLabel: "Test Fighter",
      action: action(900, 1),
      animNo: 900,
      pos: { x: 20, y: 0 },
      fallbackFacing: 1,
    });

    const result = world.emitProjectileContact({
      actor: attacker,
      projectile,
      kind: "guard",
      runtimeTick: 155,
    });

    expect(result.contact).toEqual({
      contactId: "projectile:p1:p1-projectile-0:155:guard",
      contactTick: 155,
      contactKind: "guard",
    });
    expect(attacker.soundEvents[0]).toMatchObject({
      group: 6,
      index: 0,
      contactId: "projectile:p1:p1-projectile-0:155:guard",
      contactTick: 155,
      contactKind: "guard",
    });
    expect(attacker.hitEffectEvents[0]).toMatchObject({
      sparkNo: 7000,
      offset: { x: 18, y: -44 },
      contactId: "projectile:p1:p1-projectile-0:155:guard",
      contactTick: 155,
      contactKind: "guard",
    });
  });
});

function actor(id: string, stateNo: number, stateElapsed: number): RuntimeContactPresentationActor {
  return {
    id,
    runtime: { stateNo },
    stateElapsed,
    soundEvents: [],
    hitEffectEvents: [],
    audioWorld: new RuntimeAudioWorld(),
    hitEffectWorld: new RuntimeHitEffectWorld(),
    definition: {
      animations: new Map([
        [7000, action(7000, 0)],
        [7001, action(7001, 0)],
      ]),
    },
  };
}

function action(id: number, spriteIndex: number): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: [
      {
        spriteGroup: id,
        spriteIndex,
        offsetX: 0,
        offsetY: 0,
        duration: 3,
        clsn1: [{ x1: 0, y1: -30, x2: 24, y2: -8 }],
        clsn2: [],
        raw: `${id},${spriteIndex},0,0,3`,
        line: 1,
      },
    ],
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 1000,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 1000, ${type}]`,
  };
}

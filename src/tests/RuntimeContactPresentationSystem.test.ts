import { describe, expect, it } from "vitest";
import type { AudioControllerOp } from "../mugen/compiler/ControllerOps";
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

  it("records typed audio telemetry for resolved direct HitDef contact sounds", () => {
    const world = new RuntimeContactPresentationWorld();
    const attacker = actor("p1", 200, 6, { fightFxPrefix: "kfm" });
    const recordedOperations: AudioControllerOp[] = [];

    world.emitHitDefContact({
      attacker,
      defender: { id: "p2" },
      kind: "hit",
      runtimeTick: 140,
      move: {
        hitSound: "Fvar(0),var(1)",
        hitSoundValue: { rawPrefix: "F", group: 5, index: 4 },
      },
      recordAudioOperation: (_actor, operation) => recordedOperations.push(operation),
    });

    expect(recordedOperations).toEqual([{ kind: "audio", controllerType: "playsnd", value: "F5,4" }]);
    expect(attacker.soundEvents[0]).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 4,
      raw: "Fvar(0),var(1)",
      soundPrefix: "kfm",
      contactKind: "hit",
    });
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

  it("records typed audio telemetry for resolved projectile contact sounds", () => {
    const world = new RuntimeContactPresentationWorld();
    const attacker = actor("p1", 1000, 3, { fightFxPrefix: "kfm" });
    const recordedOperations: AudioControllerOp[] = [];
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller("Projectile", {
        hitsound: "Fvar(0),var(1)",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "test-fighter",
      spriteOwnerLabel: "Test Fighter",
      action: action(900, 1),
      animNo: 900,
      pos: { x: 20, y: 0 },
      fallbackFacing: 1,
      resolveSoundValue: (key) => (key === "hitsound" ? { rawPrefix: "F", group: 5, index: 4 } : undefined),
    });

    world.emitProjectileContact({
      actor: attacker,
      projectile,
      kind: "hit",
      runtimeTick: 155,
      recordAudioOperation: (_actor, operation) => recordedOperations.push(operation),
    });

    expect(recordedOperations).toEqual([{ kind: "audio", controllerType: "playsnd", value: "F5,4" }]);
    expect(attacker.soundEvents[0]).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 4,
      raw: "Fvar(0),var(1)",
      soundPrefix: "kfm",
      contactKind: "hit",
    });
  });

  it("preserves FightFX prefix metadata on F-prefixed contact spark events", () => {
    const world = new RuntimeContactPresentationWorld();
    const attacker = actor("p1", 200, 6, {
      fightFxPrefix: "kfm",
      hitSparkLibraries: {
        fightfx: {
          animations: new Map([[7002, action(7002, 2)]]),
        },
      },
    });

    world.emitHitDefContact({
      attacker,
      defender: { id: "p2" },
      kind: "hit",
      runtimeTick: 140,
      move: {
        hitSpark: "F7002",
        sparkXy: [18, -68],
      },
    });

    expect(attacker.hitEffectEvents[0]).toMatchObject({
      sparkNo: 7002,
      rawPrefix: "F",
      fightFxPrefix: "kfm",
      assetFrame: {
        source: "fightfx",
        fightFxPrefix: "kfm",
        actionId: 7002,
        spriteIndex: 2,
      },
    });
  });
});

function actor(
  id: string,
  stateNo: number,
  stateElapsed: number,
  options: Partial<Pick<RuntimeContactPresentationActor["definition"], "fightFxPrefix" | "hitSparkLibraries">> = {},
): RuntimeContactPresentationActor {
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
      fightFxPrefix: options.fightFxPrefix,
      hitSparkLibraries: options.hitSparkLibraries,
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

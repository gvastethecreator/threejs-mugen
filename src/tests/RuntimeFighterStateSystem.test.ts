import { describe, expect, it } from "vitest";
import { RuntimeAudioWorld } from "../mugen/runtime/AudioEventSystem";
import { RuntimeContactMemoryWorld } from "../mugen/runtime/ContactMemorySystem";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import { RuntimeEnvShakeWorld } from "../mugen/runtime/EnvShakeSystem";
import { RuntimeHitEffectWorld } from "../mugen/runtime/HitEffectSystem";
import { RuntimeFighterStateWorld } from "../mugen/runtime/RuntimeFighterStateSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";

describe("RuntimeFighterStateWorld", () => {
  it("creates a fighter runtime state with injected worlds and bounded constants", () => {
    const definition = {
      ...demoFighters[0]!,
      id: "scaled-test",
      constants: {
        "data.life": 750,
        "data.power": 1200,
        "data.attack": 150,
        "data.defence": 200,
        "size.depth.top": 2,
        "size.depth.bottom": 5,
        "size.attack.depth.top": 7,
        "size.attack.depth.bottom": 9,
      },
    };
    const effectActorWorld = new RuntimeEffectActorWorld();
    const targetWorld = new RuntimeTargetWorld();
    const audioWorld = new RuntimeAudioWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const hitEffectWorld = new RuntimeHitEffectWorld();
    const contactWorld = new RuntimeContactMemoryWorld();

    const fighter = new RuntimeFighterStateWorld().create({
      id: "p1",
      definition,
      x: -40,
      y: 3,
      z: -6,
      facing: -1,
      effectActorWorld,
      targetWorld,
      audioWorld,
      envShakeWorld,
      hitEffectWorld,
      contactWorld,
    });

    expect(fighter).toMatchObject({
      id: "p1",
      label: definition.displayName,
      runtime: {
        pos: { x: -40, y: 3 },
        facing: -1,
        stateNo: 0,
        animNo: definition.idleAction,
        lifeMax: 750,
        life: 750,
        dizzyPointsMax: 750,
        dizzyPoints: 750,
        powerMax: 1200,
        power: 0,
        attackMultiplier: 1.5,
        defenseMultiplier: 0.5,
        combatDepth: { position: -6, velocity: 0, size: [2, 5], attack: [7, 9] },
        spritePriority: 2,
      },
      frameElapsed: 0,
      stateElapsed: -1,
      aiCooldown: 80,
      compatibilityTick: 0,
    });
    expect(fighter.currentAction).toBe(definition.animations.get(definition.idleAction));
    expect(fighter.effectActorWorld).toBe(effectActorWorld);
    expect(fighter.targetWorld).toBe(targetWorld);
    expect(fighter.audioWorld).toBe(audioWorld);
    expect(fighter.envShakeWorld).toBe(envShakeWorld);
    expect(fighter.hitEffectWorld).toBe(hitEffectWorld);
    expect(fighter.contactWorld).toBe(contactWorld);
    expect(fighter.contact).toEqual(contactWorld.create());
    expect(fighter.commandBuffer.isCommandActive("x", [])).toBe(false);
    expect(fighter.rngSeed).toBeGreaterThan(0);
  });

  it("uses p2 sprite priority and leaves runtime programs absent for native demo-only definitions", () => {
    const fighter = new RuntimeFighterStateWorld().create({
      id: "p2",
      definition: demoFighters[1]!,
      x: 90,
      y: 0,
      facing: 1,
    });

    expect(fighter.runtime.spritePriority).toBe(1);
    expect(fighter.runtimeProgram).toBeUndefined();
    expect(fighter.targets).toEqual([]);
    expect(fighter.targetBindings).toEqual([]);
    expect(fighter.executedStateIds.size).toBe(0);
  });
});

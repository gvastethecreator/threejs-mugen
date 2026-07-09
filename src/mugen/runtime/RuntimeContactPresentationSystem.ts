import type { AudioControllerOp } from "../compiler/ControllerOps";
import type { DemoMove } from "./demoFighters";
import { resolveRuntimeHitSparkAssetFrames, type RuntimeHitSparkAssetActor } from "./HitSparkAssetSystem";
import type { RuntimeAudioWorld, RuntimeAudioWorldActor } from "./AudioEventSystem";
import type { RuntimeHitEffectWorld, RuntimeHitEffectActor } from "./HitEffectSystem";
import type { RuntimeProjectile } from "./ProjectileSystem";
import type {
  RuntimeHitDefContactKind,
  RuntimeHitDefContactMetadata,
  RuntimeHitEffectEvent,
  RuntimeResolvedSoundRef,
  RuntimeSoundEvent,
} from "./types";

export type RuntimeContactPresentationActor = RuntimeAudioWorldActor &
  RuntimeHitEffectActor &
  RuntimeHitSparkAssetActor & {
    id: string;
    audioWorld: RuntimeAudioWorld;
    hitEffectWorld: RuntimeHitEffectWorld;
  };

export type RuntimeContactPresentationResult = {
  contact: RuntimeHitDefContactMetadata;
  sound?: RuntimeSoundEvent;
  effect?: RuntimeHitEffectEvent;
};

export class RuntimeContactPresentationWorld {
  emitHitDefContact<TActor extends RuntimeContactPresentationActor>(input: {
    attacker: TActor;
    defender: { id: string };
    move: Pick<DemoMove, "guardSound" | "hitSound" | "guardSoundValue" | "hitSoundValue" | "guardSpark" | "hitSpark" | "sparkXy">;
    kind: RuntimeHitDefContactKind;
    runtimeTick: number;
    recordAudioOperation?: (actor: TActor, operation: AudioControllerOp) => void;
  }): RuntimeContactPresentationResult {
    const contact = this.createHitDefContactMetadata(input.attacker, input.defender, input.kind, input.runtimeTick);
    const sound = input.kind === "guard" ? input.move.guardSound : input.move.hitSound;
    const soundValue = input.kind === "guard" ? input.move.guardSoundValue : input.move.hitSoundValue;
    const spark = input.kind === "guard" ? input.move.guardSpark : input.move.hitSpark;
    const assetFrames = resolveRuntimeHitSparkAssetFrames(input.attacker, spark);
    const soundOperation = hitDefSoundAudioOperation(soundValue);
    if (soundOperation) {
      input.recordAudioOperation?.(input.attacker, soundOperation);
    }
    return {
      contact,
      sound: input.attacker.audioWorld.emitHitDefSound(input.attacker, sound, input.runtimeTick, contact, soundValue),
      effect: input.attacker.hitEffectWorld.emitHitDefEffect(
        input.attacker,
        input.kind,
        spark,
        input.move.sparkXy,
        input.runtimeTick,
        assetFrames[0],
        assetFrames,
        contact,
      ),
    };
  }

  emitProjectileContact<TActor extends RuntimeContactPresentationActor>(input: {
    actor: TActor;
    projectile: RuntimeProjectile;
    kind: RuntimeHitDefContactKind;
    runtimeTick: number;
    recordAudioOperation?: (actor: TActor, operation: AudioControllerOp) => void;
  }): RuntimeContactPresentationResult {
    const contact = this.createProjectileContactMetadata(input.actor, input.projectile, input.kind, input.runtimeTick);
    const sound = input.kind === "guard" ? input.projectile.guardSound : input.projectile.hitSound;
    const soundValue = input.kind === "guard" ? input.projectile.guardSoundValue : input.projectile.hitSoundValue;
    const spark = input.kind === "guard" ? input.projectile.guardSpark : input.projectile.hitSpark;
    const assetFrames = resolveRuntimeHitSparkAssetFrames(input.actor, spark);
    const soundOperation = hitDefSoundAudioOperation(soundValue);
    if (soundOperation) {
      input.recordAudioOperation?.(input.actor, soundOperation);
    }
    return {
      contact,
      sound: input.actor.audioWorld.emitHitDefSound(input.actor, sound, input.runtimeTick, contact, soundValue),
      effect: input.actor.hitEffectWorld.emitHitDefEffect(
        input.actor,
        input.kind,
        spark,
        input.projectile.sparkXy,
        input.runtimeTick,
        assetFrames[0],
        assetFrames,
        contact,
      ),
    };
  }

  createHitDefContactMetadata(
    attacker: Pick<RuntimeContactPresentationActor, "id" | "runtime" | "stateElapsed">,
    defender: { id: string },
    kind: RuntimeHitDefContactKind,
    runtimeTick: number,
  ): RuntimeHitDefContactMetadata {
    return {
      contactId: `direct:${attacker.id}:${defender.id}:${runtimeTick}:${attacker.runtime.stateNo}:${attacker.stateElapsed}:${kind}`,
      contactTick: runtimeTick,
      contactKind: kind,
    };
  }

  createProjectileContactMetadata(
    actor: Pick<RuntimeContactPresentationActor, "id">,
    projectile: Pick<RuntimeProjectile, "serialId">,
    kind: RuntimeHitDefContactKind,
    runtimeTick: number,
  ): RuntimeHitDefContactMetadata {
    return {
      contactId: `projectile:${actor.id}:${projectile.serialId}:${runtimeTick}:${kind}`,
      contactTick: runtimeTick,
      contactKind: kind,
    };
  }
}

function hitDefSoundAudioOperation(resolvedSound: RuntimeResolvedSoundRef | undefined): AudioControllerOp | undefined {
  if (!resolvedSound) {
    return undefined;
  }
  return {
    kind: "audio",
    controllerType: "playsnd",
    value: `${resolvedSound.rawPrefix ?? ""}${resolvedSound.group},${resolvedSound.index}`,
  };
}

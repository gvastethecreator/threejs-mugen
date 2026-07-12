import type { RuntimeActiveControllerDispatchHooks } from "./RuntimeActiveControllerDispatchSystem";
import type {
  RuntimeActiveStateDispatchActor,
  RuntimeActiveStateDispatchHooks,
} from "./RuntimeActiveStateDispatchSystem";
import type { RuntimeActiveSideEffectDispatchHooks } from "./RuntimeActiveSideEffectDispatchSystem";

export type RuntimeActiveControllerHookSet<TActor extends RuntimeActiveStateDispatchActor> = {
  stateHooks: RuntimeActiveStateDispatchHooks<TActor>;
  sideEffectHooks: RuntimeActiveSideEffectDispatchHooks<TActor>;
  hooks: RuntimeActiveControllerDispatchHooks<TActor>;
};

export type RuntimeActiveControllerHookSetInput<TActor extends RuntimeActiveStateDispatchActor> = {
  resolveNumber: RuntimeActiveStateDispatchHooks<TActor>["resolveNumber"];
  resolveBoolean: RuntimeActiveStateDispatchHooks<TActor>["resolveBoolean"];
  recordController: RuntimeActiveStateDispatchHooks<TActor>["recordController"];
  enterState: RuntimeActiveStateDispatchHooks<TActor>["enterState"];
  applyControl: RuntimeActiveStateDispatchHooks<TActor>["applyControl"];
  changeAction: RuntimeActiveStateDispatchHooks<TActor>["changeAction"];
  hitDef: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["hitDef"]>;
  reversalDef: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["reversalDef"]>;
  width: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["width"]>;
  height: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["height"]>;
  overrideClsn: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["overrideClsn"]>;
  depth: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["depth"]>;
  fallEnvShake: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["fallEnvShake"]>;
  spriteEffect: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["spriteEffect"]>;
  effectSpawn: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["effectSpawn"]>;
  target: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["target"]>;
  pause: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["pause"]>;
  sound: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["sound"]>;
  envColor: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["envColor"]>;
  envShake: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["envShake"]>;
  contact: NonNullable<RuntimeActiveSideEffectDispatchHooks<TActor>["contact"]>;
  runtimeController: NonNullable<RuntimeActiveControllerDispatchHooks<TActor>["runtimeController"]>;
  unsupported?: RuntimeActiveControllerDispatchHooks<TActor>["unsupported"];
};

export class RuntimeActiveControllerHookSetWorld {
  create<TActor extends RuntimeActiveStateDispatchActor>(
    input: RuntimeActiveControllerHookSetInput<TActor>,
  ): RuntimeActiveControllerHookSet<TActor> {
    const hooks: RuntimeActiveControllerDispatchHooks<TActor> = {
      runtimeController: input.runtimeController,
    };
    if (input.unsupported) {
      hooks.unsupported = input.unsupported;
    }

    return {
      stateHooks: {
        resolveNumber: input.resolveNumber,
        resolveBoolean: input.resolveBoolean,
        recordController: input.recordController,
        enterState: input.enterState,
        applyControl: input.applyControl,
        changeAction: input.changeAction,
      },
      sideEffectHooks: {
        hitDef: input.hitDef,
        reversalDef: input.reversalDef,
        width: input.width,
        height: input.height,
        overrideClsn: input.overrideClsn,
        depth: input.depth,
        fallEnvShake: input.fallEnvShake,
        spriteEffect: input.spriteEffect,
        effectSpawn: input.effectSpawn,
        target: input.target,
        pause: input.pause,
        sound: input.sound,
        envColor: input.envColor,
        envShake: input.envShake,
        contact: input.contact,
      },
      hooks,
    };
  }
}

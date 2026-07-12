import type { ControllerIr } from "../compiler/RuntimeIr";
import type { StateProgramDispatch, StateProgramSideEffect } from "./StateProgramExecutor";
import type { RuntimeEffectSpawnControllerDispatchEffect } from "./EffectSpawnSystem";
import type { RuntimeSpriteEffectControllerEffect } from "./SpriteEffectSystem";
import type { RuntimeTargetControllerDispatchEffect } from "./TargetSystem";

type RuntimeActiveSideEffectDispatch = Extract<StateProgramDispatch, { kind: "side-effect" }>;

export type RuntimeActiveSideEffectRoute =
  | "hitdef"
  | "reversaldef"
  | "width"
  | "height"
  | "depth"
  | "fallenvshake"
  | "sprite-effect"
  | "effect-spawn"
  | "target"
  | "pause"
  | "sound"
  | "envcolor"
  | "envshake"
  | "contact";

export type RuntimeActiveSideEffectDispatchHandlerInput<TActor, TEffect extends StateProgramSideEffect> = {
  dispatch: RuntimeActiveSideEffectDispatch & { effect: TEffect };
  controller: ControllerIr;
  effect: TEffect;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
};

export type RuntimeActiveSideEffectDispatchHooks<TActor> = {
  hitDef?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "hitdef">) => void;
  reversalDef?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "reversaldef">) => void;
  width?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "width">) => void;
  height?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "height">) => void;
  depth?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "depth">) => void;
  fallEnvShake?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "fallenvshake">) => void;
  spriteEffect?: (
    input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, RuntimeSpriteEffectControllerEffect>,
  ) => void;
  effectSpawn?: (
    input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, RuntimeEffectSpawnControllerDispatchEffect>,
  ) => void;
  target?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, RuntimeTargetControllerDispatchEffect>) => void;
  pause?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "pause">) => void;
  sound?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "sound">) => void;
  envColor?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "envcolor">) => void;
  envShake?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "envshake">) => void;
  contact?: (input: RuntimeActiveSideEffectDispatchHandlerInput<TActor, "contact">) => void;
};

export type RuntimeActiveSideEffectDispatchInput<TActor> = {
  dispatch: StateProgramDispatch;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
  hooks: RuntimeActiveSideEffectDispatchHooks<TActor>;
};

export type RuntimeActiveSideEffectDispatchResult =
  | { handled: false; stop: false }
  | {
      handled: true;
      effect: StateProgramSideEffect;
      route: RuntimeActiveSideEffectRoute;
      applied: boolean;
      stop: false;
    };

export class RuntimeActiveSideEffectDispatchWorld {
  apply<TActor>(input: RuntimeActiveSideEffectDispatchInput<TActor>): RuntimeActiveSideEffectDispatchResult {
    if (input.dispatch.kind !== "side-effect") {
      return { handled: false, stop: false };
    }

    const route = runtimeActiveSideEffectRoute(input.dispatch.effect);
    const handlerInput = {
      dispatch: input.dispatch,
      controller: input.dispatch.controller,
      effect: input.dispatch.effect,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    };

    if (input.dispatch.effect === "hitdef") {
      input.hooks.hitDef?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "hitdef">);
    } else if (input.dispatch.effect === "reversaldef") {
      input.hooks.reversalDef?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "reversaldef">);
    } else if (input.dispatch.effect === "width") {
      input.hooks.width?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "width">);
    } else if (input.dispatch.effect === "height") {
      input.hooks.height?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "height">);
    } else if (input.dispatch.effect === "depth") {
      input.hooks.depth?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "depth">);
    } else if (input.dispatch.effect === "fallenvshake") {
      input.hooks.fallEnvShake?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "fallenvshake">);
    } else if (isActiveSpriteEffect(input.dispatch.effect)) {
      input.hooks.spriteEffect?.(
        handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, RuntimeSpriteEffectControllerEffect>,
      );
    } else if (isActiveEffectSpawn(input.dispatch.effect)) {
      input.hooks.effectSpawn?.(
        handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, RuntimeEffectSpawnControllerDispatchEffect>,
      );
    } else if (isActiveTargetEffect(input.dispatch.effect)) {
      input.hooks.target?.(
        handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, RuntimeTargetControllerDispatchEffect>,
      );
    } else if (input.dispatch.effect === "pause") {
      input.hooks.pause?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "pause">);
    } else if (input.dispatch.effect === "sound") {
      input.hooks.sound?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "sound">);
    } else if (input.dispatch.effect === "envcolor") {
      input.hooks.envColor?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "envcolor">);
    } else if (input.dispatch.effect === "envshake") {
      input.hooks.envShake?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "envshake">);
    } else {
      input.hooks.contact?.(handlerInput as RuntimeActiveSideEffectDispatchHandlerInput<TActor, "contact">);
    }

    return {
      handled: true,
      effect: input.dispatch.effect,
      route,
      applied: activeSideEffectHookExists(route, input.hooks),
      stop: false,
    };
  }
}

export function runtimeActiveSideEffectRoute(effect: StateProgramSideEffect): RuntimeActiveSideEffectRoute {
  if (effect === "hitdef") return "hitdef";
  if (effect === "reversaldef") return "reversaldef";
  if (effect === "width") return "width";
  if (effect === "height") return "height";
  if (effect === "depth") return "depth";
  if (effect === "fallenvshake") return "fallenvshake";
  if (isActiveSpriteEffect(effect)) return "sprite-effect";
  if (isActiveEffectSpawn(effect)) return "effect-spawn";
  if (isActiveTargetEffect(effect)) return "target";
  if (effect === "pause") return "pause";
  if (effect === "sound") return "sound";
  if (effect === "envcolor") return "envcolor";
  if (effect === "envshake") return "envshake";
  return "contact";
}

function activeSideEffectHookExists<TActor>(
  route: RuntimeActiveSideEffectRoute,
  hooks: RuntimeActiveSideEffectDispatchHooks<TActor>,
): boolean {
  if (route === "hitdef") return Boolean(hooks.hitDef);
  if (route === "reversaldef") return Boolean(hooks.reversalDef);
  if (route === "width") return Boolean(hooks.width);
  if (route === "height") return Boolean(hooks.height);
  if (route === "depth") return Boolean(hooks.depth);
  if (route === "fallenvshake") return Boolean(hooks.fallEnvShake);
  if (route === "sprite-effect") return Boolean(hooks.spriteEffect);
  if (route === "effect-spawn") return Boolean(hooks.effectSpawn);
  if (route === "target") return Boolean(hooks.target);
  if (route === "pause") return Boolean(hooks.pause);
  if (route === "sound") return Boolean(hooks.sound);
  if (route === "envcolor") return Boolean(hooks.envColor);
  if (route === "envshake") return Boolean(hooks.envShake);
  return Boolean(hooks.contact);
}

function isActiveSpriteEffect(effect: StateProgramSideEffect): effect is RuntimeSpriteEffectControllerEffect {
  return (
    effect === "sprpriority" ||
    effect === "palfx" ||
    effect === "remappal" ||
    effect === "afterimage" ||
    effect === "afterimagetime" ||
    effect === "trans" ||
    effect === "angle"
  );
}

function isActiveEffectSpawn(effect: StateProgramSideEffect): effect is RuntimeEffectSpawnControllerDispatchEffect {
  return (
    effect === "explod" ||
    effect === "removeexplod" ||
    effect === "modifyexplod" ||
    effect === "helper" ||
    effect === "projectile" ||
    effect === "modifyprojectile"
  );
}

function isActiveTargetEffect(effect: StateProgramSideEffect): effect is RuntimeTargetControllerDispatchEffect {
  return effect === "target" || effect === "bindtotarget";
}

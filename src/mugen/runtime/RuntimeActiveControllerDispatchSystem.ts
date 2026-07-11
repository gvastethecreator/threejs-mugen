import {
  RuntimeActiveStateDispatchWorld,
  type RuntimeActiveStateDispatchActor,
  type RuntimeActiveStateDispatchHooks,
  type RuntimeActiveStateDispatchResult,
} from "./RuntimeActiveStateDispatchSystem";
import {
  RuntimeActiveSideEffectDispatchWorld,
  runtimeActiveSideEffectRoute,
  type RuntimeActiveSideEffectRoute,
  type RuntimeActiveSideEffectDispatchHooks,
  type RuntimeActiveSideEffectDispatchResult,
} from "./RuntimeActiveSideEffectDispatchSystem";
import type { StateProgramDispatch } from "./StateProgramExecutor";

type RuntimeActiveRuntimeControllerDispatch = Extract<StateProgramDispatch, { kind: "runtime-controller" }>;
type RuntimeActiveUnsupportedDispatch = Extract<StateProgramDispatch, { kind: "unsupported" }>;
type RuntimeActiveHandledStateDispatchResult = Extract<RuntimeActiveStateDispatchResult, { handled: true }>;
type RuntimeActiveHandledSideEffectDispatchResult = Extract<RuntimeActiveSideEffectDispatchResult, { handled: true }>;

export type RuntimeActiveRuntimeControllerDispatchInput<TActor> = {
  dispatch: RuntimeActiveRuntimeControllerDispatch;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
};

export type RuntimeActiveUnsupportedDispatchInput<TActor> = {
  dispatch: RuntimeActiveUnsupportedDispatch;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
};

export type RuntimeActiveControllerDispatchHooks<TActor> = {
  runtimeController?: (input: RuntimeActiveRuntimeControllerDispatchInput<TActor>) => void;
  unsupported?: (input: RuntimeActiveUnsupportedDispatchInput<TActor>) => void;
};

export type RuntimeActiveControllerDispatchInput<TActor extends RuntimeActiveStateDispatchActor> = {
  dispatch: StateProgramDispatch;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
  stateHooks: RuntimeActiveStateDispatchHooks<TActor>;
  sideEffectHooks: RuntimeActiveSideEffectDispatchHooks<TActor>;
  hooks?: RuntimeActiveControllerDispatchHooks<TActor>;
  capabilities?: RuntimeActiveControllerCapabilities;
};

export type RuntimeActiveControllerCapabilities = {
  state: boolean;
  runtimeControllers: "all" | readonly string[];
  sideEffects: "all" | readonly RuntimeActiveSideEffectRoute[];
  unsupported: boolean;
};

export type RuntimeActiveControllerDispatchResult =
  | {
      handled: true;
      route: "state";
      stateDispatch: RuntimeActiveHandledStateDispatchResult;
      stop: boolean;
    }
  | {
      handled: true;
      route: "runtime-controller";
      applied: boolean;
      stop: false;
    }
  | {
      handled: true;
      route: "side-effect";
      sideEffectDispatch: RuntimeActiveHandledSideEffectDispatchResult;
      stop: false;
    }
  | {
      handled: true;
      route: "unsupported";
      applied: boolean;
      stop: false;
    }
  | {
      handled: false;
      route: "unhandled";
      stop: false;
    }
  | {
      handled: true;
      route: "blocked";
      blockedRoute: "state" | "runtime-controller" | RuntimeActiveSideEffectRoute | "unsupported";
      stop: false;
    };

export class RuntimeActiveControllerDispatchWorld {
  constructor(
    private readonly stateDispatchWorld = new RuntimeActiveStateDispatchWorld(),
    private readonly sideEffectDispatchWorld = new RuntimeActiveSideEffectDispatchWorld(),
  ) {}

  apply<TActor extends RuntimeActiveStateDispatchActor>(
    input: RuntimeActiveControllerDispatchInput<TActor>,
  ): RuntimeActiveControllerDispatchResult {
    const capabilities = input.capabilities;
    if ((input.dispatch.kind === "change-state" || input.dispatch.kind === "change-anim") && capabilities?.state === false) {
      return { handled: true, route: "blocked", blockedRoute: "state", stop: false };
    }
    const stateDispatch = this.stateDispatchWorld.apply({
      dispatch: input.dispatch,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
      hooks: input.stateHooks,
    });
    if (stateDispatch.handled) {
      return {
        handled: true,
        route: "state",
        stateDispatch,
        stop: stateDispatch.stop,
      };
    }

    if (input.dispatch.kind === "runtime-controller") {
      if (
        capabilities?.runtimeControllers !== undefined &&
        capabilities.runtimeControllers !== "all" &&
        !capabilities.runtimeControllers.includes(input.dispatch.controller.normalizedType)
      ) {
        return { handled: true, route: "blocked", blockedRoute: "runtime-controller", stop: false };
      }
      input.hooks?.runtimeController?.({
        dispatch: input.dispatch,
        actor: input.actor,
        opponent: input.opponent,
        owner: input.owner,
        tick: input.tick,
      });
      return {
        handled: true,
        route: "runtime-controller",
        applied: Boolean(input.hooks?.runtimeController),
        stop: false,
      };
    }

    if (input.dispatch.kind === "side-effect" && capabilities?.sideEffects !== undefined && capabilities.sideEffects !== "all") {
      const route = runtimeActiveSideEffectRoute(input.dispatch.effect);
      if (!capabilities.sideEffects.includes(route)) {
        return { handled: true, route: "blocked", blockedRoute: route, stop: false };
      }
    }
    const sideEffectDispatch = this.sideEffectDispatchWorld.apply({
      dispatch: input.dispatch,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
      hooks: input.sideEffectHooks,
    });
    if (sideEffectDispatch.handled) {
      return {
        handled: true,
        route: "side-effect",
        sideEffectDispatch,
        stop: false,
      };
    }

    if (input.dispatch.kind === "unsupported") {
      if (capabilities?.unsupported === false) {
        return { handled: true, route: "blocked", blockedRoute: "unsupported", stop: false };
      }
      input.hooks?.unsupported?.({
        dispatch: input.dispatch,
        actor: input.actor,
        opponent: input.opponent,
        owner: input.owner,
        tick: input.tick,
      });
      return {
        handled: true,
        route: "unsupported",
        applied: Boolean(input.hooks?.unsupported),
        stop: false,
      };
    }

    return { handled: false, route: "unhandled", stop: false };
  }
}

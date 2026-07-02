import {
  RuntimeActiveStateDispatchWorld,
  type RuntimeActiveStateDispatchActor,
  type RuntimeActiveStateDispatchHooks,
  type RuntimeActiveStateDispatchResult,
} from "./RuntimeActiveStateDispatchSystem";
import {
  RuntimeActiveSideEffectDispatchWorld,
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
    };

export class RuntimeActiveControllerDispatchWorld {
  constructor(
    private readonly stateDispatchWorld = new RuntimeActiveStateDispatchWorld(),
    private readonly sideEffectDispatchWorld = new RuntimeActiveSideEffectDispatchWorld(),
  ) {}

  apply<TActor extends RuntimeActiveStateDispatchActor>(
    input: RuntimeActiveControllerDispatchInput<TActor>,
  ): RuntimeActiveControllerDispatchResult {
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

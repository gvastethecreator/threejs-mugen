import type { StateProgramDispatch } from "./StateProgramExecutor";
import type { MugenStateController } from "../model/MugenState";
import type { CharacterRuntimeState } from "./types";

type RuntimeActiveChangeStateDispatch = Extract<StateProgramDispatch, { kind: "change-state" }>;
type RuntimeActiveChangeAnimDispatch = Extract<StateProgramDispatch, { kind: "change-anim" }>;

export type RuntimeActiveStateDispatchActor<TDefinition = unknown> = {
  runtime: CharacterRuntimeState;
  definition: TDefinition;
};

export type RuntimeActiveStateDispatchResolveInput<TActor extends RuntimeActiveStateDispatchActor> = {
  value?: number;
  expression?: string;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
};

export type RuntimeActiveStateDispatchHooks<TActor extends RuntimeActiveStateDispatchActor> = {
  resolveNumber: (input: RuntimeActiveStateDispatchResolveInput<TActor>) => number | undefined;
  resolveBoolean: (
    input: Omit<RuntimeActiveStateDispatchResolveInput<TActor>, "value"> & { value?: boolean },
  ) => boolean | undefined;
  recordController: (actor: TActor, controller: MugenStateController) => void;
  enterState: (
    actor: TActor,
    stateId: number,
    options: {
      clearStateOwner: boolean;
      animOverride?: number;
      preserveAnimationWhenMissing: boolean;
    },
  ) => void;
  applyControl: (actor: TActor, ctrl: boolean) => void;
  changeAction: (
    actor: TActor,
    actionId: number,
    source: NonNullable<CharacterRuntimeState["animationSource"]>,
    actionOwner: TActor,
    elementOptions: { elem?: number; elemTime?: number },
  ) => boolean;
};

export type RuntimeActiveStateDispatchInput<TActor extends RuntimeActiveStateDispatchActor> = {
  dispatch: StateProgramDispatch;
  actor: TActor;
  opponent: TActor;
  owner: TActor;
  tick: number;
  hooks: RuntimeActiveStateDispatchHooks<TActor>;
};

export type RuntimeActiveStateDispatchResult =
  | { handled: false; stop: false }
  | { handled: true; kind: "change-state"; applied: false; reason: "unresolved-state"; stop: false }
  | {
      handled: true;
      kind: "change-state";
      applied: true;
      stateId: number;
      animOverride?: number;
      ctrl?: boolean;
      stop: true;
    }
  | { handled: true; kind: "change-anim"; applied: false; reason: "unresolved-action"; stop: false }
  | {
      handled: true;
      kind: "change-anim";
      applied: true;
      actionId: number;
      elem?: number;
      elemTime?: number;
      actionFound: boolean;
      stop: false;
    };

export class RuntimeActiveStateDispatchWorld {
  apply<TActor extends RuntimeActiveStateDispatchActor>(
    input: RuntimeActiveStateDispatchInput<TActor>,
  ): RuntimeActiveStateDispatchResult {
    if (input.dispatch.kind === "change-state") {
      return this.applyChangeState(input.dispatch, input);
    }
    if (input.dispatch.kind === "change-anim") {
      return this.applyChangeAnim(input.dispatch, input);
    }
    return { handled: false, stop: false };
  }

  private applyChangeState<TActor extends RuntimeActiveStateDispatchActor>(
    dispatch: RuntimeActiveChangeStateDispatch,
    input: RuntimeActiveStateDispatchInput<TActor>,
  ): RuntimeActiveStateDispatchResult {
    const stateId = input.hooks.resolveNumber({
      value: dispatch.stateId,
      expression: dispatch.stateExpression,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    });
    if (stateId === undefined) {
      return { handled: true, kind: "change-state", applied: false, reason: "unresolved-state", stop: false };
    }

    const animOverride = input.hooks.resolveNumber({
      value: dispatch.animOverride,
      expression: dispatch.animExpression,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    });
    const ctrl = input.hooks.resolveBoolean({
      value: dispatch.ctrl,
      expression: dispatch.ctrlExpression,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    });

    input.hooks.recordController(input.actor, dispatch.controller.source);
    input.hooks.enterState(input.actor, stateId, {
      clearStateOwner: dispatch.clearStateOwner,
      animOverride,
      preserveAnimationWhenMissing: true,
    });
    if (ctrl !== undefined) {
      input.hooks.applyControl(input.actor, ctrl);
    }

    return { handled: true, kind: "change-state", applied: true, stateId, animOverride, ctrl, stop: true };
  }

  private applyChangeAnim<TActor extends RuntimeActiveStateDispatchActor>(
    dispatch: RuntimeActiveChangeAnimDispatch,
    input: RuntimeActiveStateDispatchInput<TActor>,
  ): RuntimeActiveStateDispatchResult {
    const actionId = input.hooks.resolveNumber({
      value: dispatch.actionId,
      expression: dispatch.actionExpression,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    });
    if (actionId === undefined) {
      return { handled: true, kind: "change-anim", applied: false, reason: "unresolved-action", stop: false };
    }

    const elem = input.hooks.resolveNumber({
      value: dispatch.elem,
      expression: dispatch.elemExpression,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    });
    const elemTime = input.hooks.resolveNumber({
      value: dispatch.elemTime,
      expression: dispatch.elemTimeExpression,
      actor: input.actor,
      opponent: input.opponent,
      owner: input.owner,
      tick: input.tick,
    });
    const actionOwner = dispatch.animationSource === "state-owner" ? input.owner : input.actor;

    input.hooks.recordController(input.actor, dispatch.controller.source);
    const actionFound = input.hooks.changeAction(input.actor, actionId, dispatch.animationSource, actionOwner, {
      elem,
      elemTime,
    });

    return {
      handled: true,
      kind: "change-anim",
      applied: true,
      actionId,
      elem,
      elemTime,
      actionFound,
      stop: false,
    };
  }
}

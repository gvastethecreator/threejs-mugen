import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStateDef } from "../model/MugenState";
import { applyRuntimeStateDefControl } from "./RuntimeResourceSystem";
import { RuntimeStateClockWorld, type RuntimeStateClockResetOptions } from "./RuntimeStateClockSystem";
import { RuntimeStateMetadataWorld } from "./RuntimeStateMetadataSystem";
import { RuntimeStateAvailabilityWorld, type RuntimeStateAvailabilityProgramState } from "./StateAvailabilitySystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeStateEntryMove = {
  actionId: number;
};

export type RuntimeStateEntryDefinition = {
  states?: MugenStateDef[];
  animations: Map<number, MugenAnimationAction>;
};

export type RuntimeStateEntryActor = {
  id: string;
  definition: RuntimeStateEntryDefinition;
  runtimeProgram?: {
    states: RuntimeStateAvailabilityProgramState[];
  };
  runtime: CharacterRuntimeState;
  stateOwner?: RuntimeStateEntryActor;
  stateElapsed: number;
  currentMove?: RuntimeStateEntryMove;
  currentMoveLabel?: string;
  moveTick: number;
  hasHit: boolean;
  firedHitDefs: Set<string>;
};

export type RuntimeStateEntryAnimationElementOptions = {
  elem?: number;
  elemTime?: number;
};

export type RuntimeStateEntryOptions<TActor extends RuntimeStateEntryActor> = {
  stateOwner?: TActor;
  clearStateOwner?: boolean;
  animOverride?: number;
  preserveAnimationWhenMissing?: boolean;
  animationElement?: RuntimeStateEntryAnimationElementOptions;
};

export type RuntimeStateEntryHooks<TActor extends RuntimeStateEntryActor> = {
  recordStateExecution?: (actor: TActor, stateId: number, owner: TActor) => void;
  resetContactState?: (actor: TActor, state?: MugenStateDef) => void;
  changeAction?: (
    actor: TActor,
    actionId: number,
    source: NonNullable<CharacterRuntimeState["animationSource"]>,
    actionOwner: TActor,
    elementOptions?: RuntimeStateEntryAnimationElementOptions,
  ) => boolean;
};

export type RuntimeStateEntryResult<TActor extends RuntimeStateEntryActor> = {
  owner: TActor;
  state?: MugenStateDef;
  actionId?: number;
  animationChanged: boolean;
};

export type RuntimeStateEntryWorldOptions = {
  availabilityWorld?: RuntimeStateAvailabilityWorld;
  stateClockWorld?: RuntimeStateClockWorld;
  stateMetadataWorld?: RuntimeStateMetadataWorld;
};

export class RuntimeStateEntryWorld {
  private readonly availabilityWorld: RuntimeStateAvailabilityWorld;
  private readonly stateClockWorld: RuntimeStateClockWorld;
  private readonly stateMetadataWorld: RuntimeStateMetadataWorld;

  constructor(options: RuntimeStateEntryWorldOptions = {}) {
    this.availabilityWorld = options.availabilityWorld ?? new RuntimeStateAvailabilityWorld();
    this.stateClockWorld = options.stateClockWorld ?? new RuntimeStateClockWorld();
    this.stateMetadataWorld = options.stateMetadataWorld ?? new RuntimeStateMetadataWorld();
  }

  canEnterState<TActor extends RuntimeStateEntryActor>(
    target: TActor,
    stateId: number,
    owner: TActor = target,
  ): boolean {
    return this.availabilityWorld.canEnterState(target, stateId, owner);
  }

  findState<TActor extends RuntimeStateEntryActor>(owner: TActor, stateId: number): MugenStateDef | undefined {
    return this.availabilityWorld.findState(owner, stateId);
  }

  setStateNo<TActor extends RuntimeStateEntryActor>(
    actor: TActor,
    stateNo: number,
    options: RuntimeStateClockResetOptions = {},
  ): void {
    const result = this.stateMetadataWorld.setStateNo(actor.runtime, stateNo, {
      stateType: this.currentStateType(actor),
      moveType: this.currentStateMoveType(actor),
    });
    this.stateClockWorld.resetForTransition(actor, result, options);
  }

  enterState<TActor extends RuntimeStateEntryActor>(
    actor: TActor,
    stateId: number,
    move?: RuntimeStateEntryMove,
    options: RuntimeStateEntryOptions<TActor> = {},
    hooks: RuntimeStateEntryHooks<TActor> = {},
  ): RuntimeStateEntryResult<TActor> {
    const owner = this.resolveOwner(actor, options);
    const state = this.findState(owner, stateId);
    const actionId =
      options.animOverride ?? state?.anim ?? move?.actionId ?? (options.preserveAnimationWhenMissing ? undefined : stateId);

    hooks.recordStateExecution?.(actor, stateId, owner);
    this.cancelStaleMove(actor, move, stateId);
    this.applyStateOwner(actor, owner, stateId);
    this.setStateNo(actor, stateId, { resetElapsed: true });
    actor.firedHitDefs.clear();
    hooks.resetContactState?.(actor, state);
    this.applyStateDefMetadata(actor.runtime, state);

    const animationChanged =
      actionId !== undefined
        ? (hooks.changeAction?.(
            actor,
            actionId,
            owner === actor ? "self" : "state-owner",
            owner,
            options.animationElement,
          ) ?? false)
        : false;
    return { owner, state, actionId, animationChanged };
  }

  currentStateType(actor: RuntimeStateEntryActor): CharacterRuntimeState["stateType"] {
    const state = this.currentState(actor);
    return state?.type ? normalizeRuntimeStateType(state.type, actor.runtime.stateType) : actor.runtime.stateType;
  }

  currentStateMoveType(actor: RuntimeStateEntryActor): CharacterRuntimeState["moveType"] {
    const state = this.currentState(actor);
    return state?.moveType ? normalizeRuntimeMoveType(state.moveType, actor.runtime.moveType) : actor.runtime.moveType;
  }

  private currentState(actor: RuntimeStateEntryActor): MugenStateDef | undefined {
    const owner = actor.stateOwner ?? actor;
    return this.findState(owner, actor.runtime.stateNo);
  }

  private resolveOwner<TActor extends RuntimeStateEntryActor>(
    actor: TActor,
    options: RuntimeStateEntryOptions<TActor>,
  ): TActor {
    return (options.clearStateOwner ? actor : options.stateOwner ?? actor.stateOwner ?? actor) as TActor;
  }

  private cancelStaleMove(actor: RuntimeStateEntryActor, move: RuntimeStateEntryMove | undefined, stateId: number): void {
    if (move || !actor.currentMove || actor.currentMove.actionId === stateId) {
      return;
    }
    actor.currentMove = undefined;
    actor.currentMoveLabel = undefined;
    actor.moveTick = 0;
    actor.hasHit = false;
    actor.runtime.reversal = undefined;
  }

  private applyStateOwner<TActor extends RuntimeStateEntryActor>(actor: TActor, owner: TActor, stateId: number): void {
    if (owner !== actor) {
      actor.stateOwner = owner;
      actor.runtime.customState = {
        ownerId: owner.id,
        stateNo: stateId,
        getP1State: true,
      };
      return;
    }
    actor.stateOwner = undefined;
    actor.runtime.customState = undefined;
  }

  private applyStateDefMetadata(runtime: CharacterRuntimeState, state: MugenStateDef | undefined): void {
    if (state?.type) {
      runtime.stateType = normalizeRuntimeStateType(state.type, runtime.stateType);
    }
    if (state?.moveType) {
      runtime.moveType = normalizeRuntimeMoveType(state.moveType, runtime.moveType);
    }
    if (state?.physics) {
      runtime.physics = normalizeRuntimePhysics(state.physics, runtime.physics);
    }
    applyRuntimeStateDefControl(runtime, state?.ctrl);
    if (state?.velSet) {
      runtime.vel = { x: state.velSet[0], y: state.velSet[1] };
    }
  }
}

export function normalizeRuntimeStateType(value: string, fallback: CharacterRuntimeState["stateType"]): CharacterRuntimeState["stateType"] {
  const upper = value.trim().toUpperCase();
  return upper === "S" || upper === "C" || upper === "A" || upper === "L" ? upper : fallback;
}

export function normalizeRuntimeMoveType(value: string, fallback: CharacterRuntimeState["moveType"]): CharacterRuntimeState["moveType"] {
  const upper = value.trim().toUpperCase();
  return upper === "I" || upper === "A" || upper === "H" ? upper : fallback;
}

export function normalizeRuntimePhysics(value: string, fallback: CharacterRuntimeState["physics"]): CharacterRuntimeState["physics"] {
  const upper = value.trim().toUpperCase();
  return upper === "S" || upper === "C" || upper === "A" || upper === "N" ? upper : fallback;
}

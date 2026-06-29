import type { CharacterRuntimeState } from "./types";

export type RuntimeHitStateTransitionActor = {
  id: string;
  runtime: CharacterRuntimeState;
};

export type RuntimeHitStateTransitionMove = {
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
};

export type RuntimeHitStateEntryOptions<TActor extends RuntimeHitStateTransitionActor> = {
  stateOwner?: TActor;
  clearStateOwner?: boolean;
};

export type RuntimeHitStateTransitionHooks<TActor extends RuntimeHitStateTransitionActor> = {
  canEnterState: (target: TActor, stateNo: number, stateOwner?: TActor) => boolean;
  enterState: (target: TActor, stateNo: number, options?: RuntimeHitStateEntryOptions<TActor>) => void;
};

export type RuntimeHitStateTransitionOutcome = {
  attackerEntered: boolean;
  defenderEntered: boolean;
};

export class RuntimeHitStateTransitionWorld {
  applyHitStateTransitions<TActor extends RuntimeHitStateTransitionActor>(
    attacker: TActor,
    defender: TActor,
    move: RuntimeHitStateTransitionMove,
    hooks: RuntimeHitStateTransitionHooks<TActor>,
  ): RuntimeHitStateTransitionOutcome {
    const defenderEntered =
      move.p2StateNo !== undefined
        ? this.enterTargetHitState(defender, attacker, move.p2StateNo, move.p2GetP1State ?? true, hooks)
        : false;
    const attackerEntered =
      move.p1StateNo !== undefined ? this.enterSelfHitState(attacker, move.p1StateNo, hooks) : false;
    return { attackerEntered, defenderEntered };
  }

  enterTargetHitState<TActor extends RuntimeHitStateTransitionActor>(
    target: TActor,
    owner: TActor,
    stateNo: number,
    getP1State: boolean,
    hooks: RuntimeHitStateTransitionHooks<TActor>,
  ): boolean {
    const stateOwner = getP1State ? owner : target;
    if (!hooks.canEnterState(target, stateNo, stateOwner)) {
      return false;
    }
    hooks.enterState(target, stateNo, {
      stateOwner: getP1State ? owner : undefined,
      clearStateOwner: !getP1State,
    });
    if (getP1State && target.runtime.customState) {
      target.runtime.customState.getP1State = true;
    }
    return true;
  }

  enterSelfHitState<TActor extends RuntimeHitStateTransitionActor>(
    target: TActor,
    stateNo: number,
    hooks: RuntimeHitStateTransitionHooks<TActor>,
  ): boolean {
    if (!hooks.canEnterState(target, stateNo)) {
      return false;
    }
    hooks.enterState(target, stateNo);
    return true;
  }
}

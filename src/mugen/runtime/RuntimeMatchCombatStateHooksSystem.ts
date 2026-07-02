import type { RuntimeHitStateEntryOptions, RuntimeHitStateTransitionActor } from "./HitStateTransitionSystem";
import type {
  RuntimeCombatResolutionActor,
  RuntimeCombatResolutionStateHooks,
} from "./RuntimeCombatResolutionSystem";
import type {
  RuntimeHelperCombatDefender,
  RuntimeHelperCombatStateHooks,
} from "./RuntimeHelperCombatSystem";

export type RuntimeMatchCombatStateEntry<TActor extends RuntimeHitStateTransitionActor> = (
  target: TActor,
  stateNo: number,
  options?: RuntimeHitStateEntryOptions<TActor>,
) => void;

export type RuntimeMatchCombatStateAvailability<TActor extends RuntimeHitStateTransitionActor> = (
  target: TActor,
  stateNo: number,
  stateOwner?: TActor,
) => boolean;

export type RuntimeMatchCombatStateHooksInput<TActor extends RuntimeHitStateTransitionActor> = {
  canEnterState: RuntimeMatchCombatStateAvailability<TActor>;
  enterState: RuntimeMatchCombatStateEntry<TActor>;
};

export type RuntimeMatchCombatStateHooks<TActor extends RuntimeCombatResolutionActor & RuntimeHelperCombatDefender> = {
  combatStateHooks: RuntimeCombatResolutionStateHooks<TActor>;
  helperStateHooks: RuntimeHelperCombatStateHooks<TActor>;
};

export class RuntimeMatchCombatStateHooksWorld {
  create<TActor extends RuntimeCombatResolutionActor & RuntimeHelperCombatDefender>(
    input: RuntimeMatchCombatStateHooksInput<TActor>,
  ): RuntimeMatchCombatStateHooks<TActor> {
    return {
      combatStateHooks: {
        canEnterState: (target, stateNo, stateOwner) => input.canEnterState(target, stateNo, stateOwner),
        enterState: (target, stateNo, options) => input.enterState(target, stateNo, options),
      },
      helperStateHooks: {
        canEnterState: (target, stateNo) => input.canEnterState(target, stateNo),
        enterState: (target, stateNo, options) => input.enterState(target, stateNo, options),
      },
    };
  }
}

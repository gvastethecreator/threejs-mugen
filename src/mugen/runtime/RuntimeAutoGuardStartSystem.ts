import type { RuntimeGuardWorld } from "./GuardSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeAutoGuardStartActor = {
  definition: { source?: string };
  currentInput: Iterable<string>;
  runtime: CharacterRuntimeState;
  currentMove?: unknown;
  hitPause: number;
  hitStun: number;
};

export type RuntimeAutoGuardStartHooks<TActor extends RuntimeAutoGuardStartActor, TOpponent> = {
  isInGuardDistance: (defender: TActor, attacker: TOpponent) => boolean;
  canEnterState: (defender: TActor, stateNo: number) => boolean;
  enterState: (defender: TActor, stateNo: number, options: { clearStateOwner: true }) => void;
};

export type RuntimeAutoGuardStartInput<TActor extends RuntimeAutoGuardStartActor, TOpponent> = {
  defender: TActor;
  attacker: TOpponent;
  guardWorld: RuntimeGuardWorld;
  hooks: RuntimeAutoGuardStartHooks<TActor, TOpponent>;
};

export type RuntimeAutoGuardStartResult =
  | { started: true; stateNo: number }
  | {
      started: false;
      reason: "non-imported" | "ineligible" | "out-of-guard-distance" | "unavailable-state";
      stateNo?: number;
    };

export class RuntimeAutoGuardStartWorld {
  apply<TActor extends RuntimeAutoGuardStartActor, TOpponent>(
    input: RuntimeAutoGuardStartInput<TActor, TOpponent>,
  ): RuntimeAutoGuardStartResult {
    const { defender, attacker, guardWorld, hooks } = input;
    if (defender.definition.source !== "imported") {
      return { started: false, reason: "non-imported" };
    }

    if (
      !guardWorld.canAttemptAutoGuardStart(defender.currentInput, defender.runtime, {
        currentMoveActive: Boolean(defender.currentMove),
        hitPause: defender.hitPause,
        hitStun: defender.hitStun,
      })
    ) {
      return { started: false, reason: "ineligible" };
    }

    if (!hooks.isInGuardDistance(defender, attacker)) {
      return { started: false, reason: "out-of-guard-distance" };
    }

    const stateNo = guardWorld.defaultGuardStartStateNo(defender.runtime, (candidate) =>
      hooks.canEnterState(defender, candidate),
    );
    if (stateNo === undefined || !hooks.canEnterState(defender, stateNo)) {
      return { started: false, reason: "unavailable-state", stateNo };
    }

    hooks.enterState(defender, stateNo, { clearStateOwner: true });
    guardWorld.applyAutoGuardStart(defender.runtime);
    return { started: true, stateNo };
  }
}

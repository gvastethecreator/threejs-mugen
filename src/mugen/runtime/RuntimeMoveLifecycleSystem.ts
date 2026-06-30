import type { CharacterRuntimeState } from "./types";

export type RuntimeMoveLifecycleMove = {
  startup: number;
  recovery: number;
  isReversal?: boolean;
};

export type RuntimeMoveLifecycleActor = {
  currentMove?: RuntimeMoveLifecycleMove;
  currentMoveLabel?: string;
  moveTick: number;
  hasHit: boolean;
  runtime: Pick<CharacterRuntimeState, "moveType" | "vel" | "reversal">;
};

export type RuntimeMoveLifecycleHooks = {
  restoreControl?: () => void;
  enterIdleState?: () => void;
  changeIdleAction?: () => void;
};

export type RuntimeMoveLifecycleAdvanceResult = {
  active: boolean;
  completed: boolean;
  clearedReversal: boolean;
  restoredIdle: boolean;
};

export class RuntimeMoveLifecycleWorld {
  advance(actor: RuntimeMoveLifecycleActor, hooks: RuntimeMoveLifecycleHooks = {}): RuntimeMoveLifecycleAdvanceResult {
    if (!actor.currentMove) {
      return { active: false, completed: false, clearedReversal: false, restoredIdle: false };
    }

    actor.moveTick += 1;
    const move = actor.currentMove;
    if (!move.isReversal) {
      actor.runtime.moveType = "A";
      actor.runtime.vel.x = 0;
    }

    if (actor.moveTick <= move.startup + move.recovery) {
      return { active: true, completed: false, clearedReversal: false, restoredIdle: false };
    }

    const wasReversal = Boolean(move.isReversal);
    actor.currentMove = undefined;
    actor.currentMoveLabel = undefined;
    actor.moveTick = 0;
    actor.hasHit = false;
    actor.runtime.reversal = undefined;

    if (wasReversal) {
      return { active: false, completed: true, clearedReversal: true, restoredIdle: false };
    }

    actor.runtime.moveType = "I";
    hooks.restoreControl?.();
    hooks.enterIdleState?.();
    hooks.changeIdleAction?.();
    return { active: false, completed: true, clearedReversal: false, restoredIdle: true };
  }
}

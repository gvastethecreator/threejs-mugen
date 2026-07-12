import type { CharacterRuntimeState } from "./types";
import { resetRuntimeHitDefContactMemory, type RuntimeHitDefContactMemoryActor } from "./RuntimeHitDefContactMemorySystem";

export type RuntimeMoveStartMove = {
  actionId: number;
};

export type RuntimeMoveStartActor<TMove extends RuntimeMoveStartMove = RuntimeMoveStartMove> = {
  currentMove?: TMove;
  currentMoveLabel?: string;
  moveTick: number;
  hasHit: boolean;
  hitDefTargets?: RuntimeHitDefContactMemoryActor["hitDefTargets"];
  pendingHitDefTargets?: RuntimeHitDefContactMemoryActor["pendingHitDefTargets"];
  runtime: Pick<CharacterRuntimeState, "moveType" | "reversal">;
};

export type RuntimeMoveStartHooks<
  TActor extends RuntimeMoveStartActor<TMove>,
  TMove extends RuntimeMoveStartMove,
> = {
  applyControl?: (actor: TActor, ctrl: boolean) => void;
  enterState?: (actor: TActor, stateId: number, move: TMove) => void;
};

export type RuntimeMoveStartResult = {
  actionId: number;
  label: string;
  started: boolean;
};

export class RuntimeMoveStartWorld {
  start<TActor extends RuntimeMoveStartActor<TMove>, TMove extends RuntimeMoveStartMove>(
    actor: TActor,
    move: TMove,
    label: string,
    hooks: RuntimeMoveStartHooks<TActor, TMove> = {},
  ): RuntimeMoveStartResult {
    actor.currentMove = move;
    actor.currentMoveLabel = label;
    actor.moveTick = 0;
    actor.hasHit = false;
    resetRuntimeHitDefContactMemory(actor);
    actor.runtime.reversal = undefined;
    actor.runtime.moveType = "A";

    hooks.applyControl?.(actor, false);
    hooks.enterState?.(actor, move.actionId, move);

    return { actionId: move.actionId, label, started: true };
  }
}

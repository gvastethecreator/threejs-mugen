import type { CollisionBox } from "../model/CollisionBox";
import {
  DEFAULT_RUNTIME_GUARD_DISTANCE,
  hasRuntimeGuardDistance,
  isRuntimeGuarding,
} from "./CombatResolver";
import type { CharacterRuntimeState } from "./types";

export type RuntimeGuardDistanceMove = {
  activeStart: number;
  activeEnd: number;
  hitbox: CollisionBox;
  guardFlag?: string;
  guardDistance?: number;
};

export type RuntimeGuardDistanceDefender = {
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "moveType" | "stateType" | "assertSpecial">;
  hurtBoxes: CollisionBox[];
};

export type RuntimeGuardDistanceAttacker = {
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "assertSpecial">;
  currentMove?: RuntimeGuardDistanceMove;
  moveTick: number;
  hasHit: boolean;
};

export class RuntimeGuardDistanceWorld {
  isMoveInGuardDistanceWindow(move: RuntimeGuardDistanceMove, tick: number): boolean {
    return isRuntimeMoveInGuardDistanceWindow(move, tick);
  }

  isInGuardDistance(defender: RuntimeGuardDistanceDefender, attacker: RuntimeGuardDistanceAttacker): boolean {
    return isRuntimeInGuardDistance(defender, attacker);
  }
}

export function isRuntimeMoveInGuardDistanceWindow(move: RuntimeGuardDistanceMove, tick: number): boolean {
  return tick >= Math.max(0, move.activeStart - 1) && tick <= move.activeEnd;
}

export function isRuntimeInGuardDistance(
  defender: RuntimeGuardDistanceDefender,
  attacker: RuntimeGuardDistanceAttacker,
): boolean {
  const move = attacker.currentMove;
  if (!move || attacker.hasHit || !isRuntimeMoveInGuardDistanceWindow(move, attacker.moveTick)) {
    return false;
  }
  if (
    !isRuntimeGuarding(true, defender.runtime.moveType, defender.runtime.stateType, move.guardFlag ?? "MA", {
      defenderAssertSpecial: defender.runtime.assertSpecial,
      attackUnguardable: attacker.runtime.assertSpecial?.unguardable,
    })
  ) {
    return false;
  }
  return hasRuntimeGuardDistance(
    attacker.runtime,
    move.hitbox,
    defender.runtime,
    defender.hurtBoxes,
    move.guardDistance ?? DEFAULT_RUNTIME_GUARD_DISTANCE,
  );
}

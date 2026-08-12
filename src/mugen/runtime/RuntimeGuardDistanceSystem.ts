import type { CollisionBox } from "../model/CollisionBox";
import {
  DEFAULT_RUNTIME_GUARD_DISTANCE,
  hasRuntimeGuardDistance,
  isRuntimeGuarding,
} from "./CombatResolver";
import type { CharacterRuntimeState, RuntimeInGuardDistanceLatch } from "./types";
import type { RuntimeGuardDistanceBounds } from "./CombatResolver";
import type { RuntimeProjectileGuardDistanceBounds } from "./ProjectileSystem";

export type RuntimeGuardDistanceMove = {
  activeStart: number;
  activeEnd: number;
  hitbox: CollisionBox;
  guardFlag?: string;
  guardDistance?: number;
  guardDistanceBounds?: RuntimeGuardDistanceBounds;
};

export type RuntimeGuardDistanceDefender = {
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "moveType" | "stateType" | "assertSpecial" | "combatDepth">;
  hurtBoxes: CollisionBox[];
};

export type RuntimeGuardDistanceAttacker = {
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "assertSpecial" | "combatDepth">;
  currentMove?: RuntimeGuardDistanceMove;
  moveTick: number;
  hasHit: boolean;
};

export type RuntimeGuardDistanceProjectile = {
  pos: { x: number; y: number; z?: number };
  facing: 1 | -1;
  guardDistanceBounds: RuntimeProjectileGuardDistanceBounds;
  guardFlag?: string;
  removalReason?: string;
  terminalPlayback?: unknown;
  hasHit: boolean;
  hitsRemaining: number;
  missTimeRemaining: number;
};

export type RuntimeGuardDistanceLatchInput = {
  defender: RuntimeGuardDistanceDefender;
  attacker: RuntimeGuardDistanceAttacker & { id: string };
  projectiles: readonly RuntimeGuardDistanceProjectile[];
  tick: number;
};

export class RuntimeGuardDistanceWorld {
  isMoveInGuardDistanceWindow(move: RuntimeGuardDistanceMove, tick: number): boolean {
    return isRuntimeMoveInGuardDistanceWindow(move, tick);
  }

  isInGuardDistance(defender: RuntimeGuardDistanceDefender, attacker: RuntimeGuardDistanceAttacker): boolean {
    return isRuntimeInGuardDistance(defender, attacker);
  }

  refreshLatch(input: RuntimeGuardDistanceLatchInput): RuntimeInGuardDistanceLatch | undefined {
    const direct = isRuntimeInGuardDistance(input.defender, input.attacker);
    const projectile = input.projectiles.some((candidate) =>
      isRuntimeProjectileInGuardDistance(input.defender, input.attacker, candidate),
    );
    if (!direct && !projectile) {
      return undefined;
    }
    return {
      attackerId: input.attacker.id,
      source: direct && projectile ? "direct+projectile" : direct ? "direct" : "projectile",
      observedTick: input.tick,
    };
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
    move.guardDistanceBounds,
  );
}

export function isRuntimeProjectileInGuardDistance(
  defender: RuntimeGuardDistanceDefender,
  attacker: Pick<RuntimeGuardDistanceAttacker, "runtime">,
  projectile: RuntimeGuardDistanceProjectile,
): boolean {
  if (
    projectile.removalReason !== undefined ||
    projectile.terminalPlayback !== undefined ||
    projectile.hasHit ||
    projectile.hitsRemaining <= 0 ||
    projectile.missTimeRemaining > 0
  ) {
    return false;
  }
  if (
    !isRuntimeGuarding(true, defender.runtime.moveType, defender.runtime.stateType, projectile.guardFlag ?? "MA", {
      defenderAssertSpecial: defender.runtime.assertSpecial,
      attackUnguardable: attacker.runtime.assertSpecial?.unguardable,
    })
  ) {
    return false;
  }
  const distX = (defender.runtime.pos.x - projectile.pos.x) * projectile.facing;
  const distY = defender.runtime.pos.y - projectile.pos.y;
  const distZ = (defender.runtime.combatDepth?.position ?? 0) - (projectile.pos.z ?? 0);
  const { width, height, depth } = projectile.guardDistanceBounds;
  const inWidth = distX < width[0] && distX > -width[1];
  const inHeight = distY === 0 || (distY > -height[0] && distY < height[1]);
  const inDepth = distZ === 0 || (distZ > -depth[0] && distZ < depth[1]);
  return inWidth && inHeight && inDepth;
}

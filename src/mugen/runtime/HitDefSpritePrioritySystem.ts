import type { DemoMove } from "./demoFighters";
import {
  resolveRuntimeHitDefSpritePriorities,
  type RuntimeHitDefPriorityProfile,
  type RuntimeResolvedHitDefSpritePriority,
} from "./HitDefPriorityPolicy";
import type { CharacterRuntimeState, RuntimeHitDefContactKind } from "./types";

export type RuntimeHitDefSpritePriorityActor = {
  runtime: CharacterRuntimeState;
};

export type RuntimeProjectileHitDefSpritePriority = {
  p2SpritePriority?: number;
};

export function applyRuntimeHitDefSpritePriorityContact<
  TAttacker extends RuntimeHitDefSpritePriorityActor,
  TDefender extends RuntimeHitDefSpritePriorityActor,
>(
  attacker: TAttacker,
  defender: TDefender,
  move: DemoMove,
  contactKind: RuntimeHitDefContactKind,
  profile: RuntimeHitDefPriorityProfile,
): void {
  const priorities = resolveRuntimeHitDefSpritePriorities({
    profile,
    authored: {
      p1: move.p1SpritePriority,
      p2: move.p2SpritePriority,
    },
    current: {
      p1: attacker.runtime.spritePriority ?? 0,
      p2: defender.runtime.spritePriority ?? 0,
    },
  });
  applyResolvedSpritePriority(attacker.runtime, profile, "p1", contactKind, priorities.p1);
  applyResolvedSpritePriority(defender.runtime, profile, "p2", contactKind, priorities.p2);
}

/**
 * Projectile contacts only replace P2 sprite priority in Ikemen. The
 * projectile's visual order remains owned by projsprpriority.
 */
export function applyRuntimeProjectileHitDefSpritePriorityContact<
  TDefender extends RuntimeHitDefSpritePriorityActor,
>(
  defender: TDefender,
  projectile: RuntimeProjectileHitDefSpritePriority,
  contactKind: RuntimeHitDefContactKind,
  profile: RuntimeHitDefPriorityProfile,
): void {
  const priorities = resolveRuntimeHitDefSpritePriorities({
    profile,
    authored: { p2: projectile.p2SpritePriority },
    current: {
      p1: 0,
      p2: defender.runtime.spritePriority ?? 0,
    },
  });
  applyResolvedSpritePriority(defender.runtime, profile, "p2", contactKind, priorities.p2);
}

function applyResolvedSpritePriority(
  runtime: CharacterRuntimeState,
  profile: RuntimeHitDefPriorityProfile,
  role: "p1" | "p2",
  contactKind: RuntimeHitDefContactKind,
  resolved: RuntimeResolvedHitDefSpritePriority,
): void {
  if (resolved.source === "preserve-current" && runtime.spritePriority === undefined) {
    return;
  }
  const previousValue = runtime.spritePriority;
  runtime.spritePriority = resolved.value;
  runtime.hitDefSpritePriority = {
    profile,
    role,
    contactKind,
    ...(previousValue !== undefined ? { previousValue } : {}),
    ...resolved,
  };
}

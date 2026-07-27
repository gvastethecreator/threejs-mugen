import { runtimeHitTmpValue } from "./RuntimeHitTmpSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeStateChangeTmpActor = Partial<
  Pick<CharacterRuntimeState, "actTmp" | "hitFall" | "hitTmp" | "moveType" | "stateChangeTmp">
>;

export type RuntimeStateRedirectMove = {
  p1StateNo?: number;
  p2StateNo?: number;
};

/** Materializes the pending state-change flag used by IKEMEN contact gates. */
export class RuntimeStateChangeTmpWorld {
  mark(actor: RuntimeStateChangeTmpActor): void {
    actor.stateChangeTmp = true;
  }

  settle(actor: RuntimeStateChangeTmpActor, hitPaused: boolean): boolean {
    if (!hitPaused) {
      actor.stateChangeTmp = false;
    }
    return actor.stateChangeTmp === true;
  }
}

/** IKEMEN blocks a target-owned custom state redirect during a pending get-hit/action change. */
export function runtimeStateChangeTmpBlocksTargetStateRedirect(actor: RuntimeStateChangeTmpActor): boolean {
  return actor.stateChangeTmp === true && (runtimeHitTmpValue(actor) > 0 || (actor.actTmp ?? 0) > 0);
}

/** IKEMEN blocks an attacker-owned custom state redirect while its state change is pending. */
export function runtimeStateChangeTmpBlocksSelfStateRedirect(actor: RuntimeStateChangeTmpActor): boolean {
  return actor.stateChangeTmp === true || runtimeHitTmpValue(actor) > 0;
}

/** Applies the bounded stchtmp admission rule to direct p1stateno/p2stateno redirects. */
export function runtimeStateChangeTmpBlocksDirectStateRedirect(
  attacker: RuntimeStateChangeTmpActor,
  defender: RuntimeStateChangeTmpActor,
  move: RuntimeStateRedirectMove,
): boolean {
  return (
    (move.p2StateNo !== undefined && runtimeStateChangeTmpBlocksTargetStateRedirect(defender))
    || (move.p1StateNo !== undefined && runtimeStateChangeTmpBlocksSelfStateRedirect(attacker))
  );
}

/** IKEMEN blocks a projectile when a getting-hit/action state change is pending. */
export function runtimeStateChangeTmpBlocksProjectile(actor: RuntimeStateChangeTmpActor): boolean {
  return runtimeStateChangeTmpBlocksTargetStateRedirect(actor);
}

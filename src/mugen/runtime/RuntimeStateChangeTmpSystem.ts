import { runtimeHitTmpValue } from "./RuntimeHitTmpSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeStateChangeTmpActor = Partial<
  Pick<CharacterRuntimeState, "actTmp" | "hitFall" | "hitTmp" | "moveType" | "stateChangeTmp">
>;

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

/** IKEMEN blocks a projectile when a getting-hit/action state change is pending. */
export function runtimeStateChangeTmpBlocksProjectile(actor: RuntimeStateChangeTmpActor): boolean {
  return actor.stateChangeTmp === true && (runtimeHitTmpValue(actor) > 0 || (actor.actTmp ?? 0) > 0);
}

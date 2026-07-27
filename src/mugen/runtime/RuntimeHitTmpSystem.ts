import type { CharacterRuntimeState, RuntimeHitTmp } from "./types";

export type RuntimeHitTmpActor = Partial<
  Pick<CharacterRuntimeState, "hitFall" | "hitTmp" | "moveType">
>;

/** Materializes the small get-hit phase used by IKEMEN admission predicates. */
export class RuntimeHitTmpWorld {
  sync(actor: RuntimeHitTmpActor): RuntimeHitTmp {
    if (actor.moveType === "H") {
      const next: RuntimeHitTmp = actor.hitFall?.falling === true ? 2 : 1;
      actor.hitTmp = next;
      return next;
    }
    if (actor.hitTmp !== -1) {
      actor.hitTmp = 0;
    }
    return actor.hitTmp ?? 0;
  }
}

/** Reads explicit runtime state and keeps handcrafted/static paths compatible. */
export function runtimeHitTmpValue(actor: RuntimeHitTmpActor): RuntimeHitTmp {
  if (actor.hitTmp !== undefined) {
    return actor.hitTmp;
  }
  if (actor.moveType !== "H") {
    return 0;
  }
  return actor.hitFall?.falling === true ? 2 : 1;
}

/** IKEMEN marks the actor being reversed only when it was idle. */
export function markRuntimeHitTmpReversal(
  actor: Pick<CharacterRuntimeState, "hitTmp">,
): RuntimeHitTmp {
  if ((actor.hitTmp ?? 0) === 0) {
    actor.hitTmp = -1;
  }
  return actor.hitTmp ?? 0;
}

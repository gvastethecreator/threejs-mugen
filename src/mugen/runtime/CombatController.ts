import type { ActorSnapshot } from "./types";

export function hasActiveHitbox(actor: ActorSnapshot): boolean {
  return actor.clsn1.length > 0 && actor.runtime.moveType === "A";
}

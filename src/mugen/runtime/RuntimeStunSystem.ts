import type { CharacterRuntimeState } from "./types";

export type RuntimeStunActor = {
  runtime: Pick<CharacterRuntimeState, "guardStun" | "guarding" | "moveType" | "vel">;
  hitStun: number;
};

export type RuntimeStunTickResult = {
  guardActive: boolean;
  hitActive: boolean;
};

export function hasRuntimeStun(actor: RuntimeStunActor): boolean {
  return actor.hitStun > 0 || (actor.runtime.guardStun ?? 0) > 0;
}

export function tickRuntimeStun(actor: RuntimeStunActor): RuntimeStunTickResult {
  const result: RuntimeStunTickResult = {
    guardActive: false,
    hitActive: false,
  };

  actor.runtime.guarding = false;
  if ((actor.runtime.guardStun ?? 0) > 0) {
    actor.runtime.guardStun = Math.max(0, (actor.runtime.guardStun ?? 0) - 1);
    actor.runtime.guarding = actor.runtime.guardStun > 0;
    actor.runtime.moveType = actor.runtime.guarding ? "H" : actor.runtime.moveType;
    actor.runtime.vel.x *= 0.82;
    result.guardActive = true;
  }

  if (actor.hitStun > 0) {
    actor.hitStun = Math.max(0, actor.hitStun - 1);
    actor.runtime.vel.x *= 0.88;
    result.hitActive = true;
  }

  return result;
}

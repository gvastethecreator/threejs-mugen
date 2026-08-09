import type { DemoMove } from "./demoFighters";
import type { CharacterRuntimeState } from "./types";

export function hasRuntimeUnhittableTime(
  state: Pick<CharacterRuntimeState, "unhittableTime">,
): boolean {
  return (state.unhittableTime ?? 0) > 0;
}

export function applyRuntimeReceiverUnhittableTime(
  state: Pick<CharacterRuntimeState, "unhittableTime">,
  move: Pick<DemoMove, "unhittableTime">,
): void {
  const value = move.unhittableTime?.[1];
  if (value === undefined || value < 0) return;
  state.unhittableTime = Math.max(0, Math.trunc(value));
}

export function applyRuntimeAttackerUnhittableTime(
  state: Pick<CharacterRuntimeState, "unhittableTime">,
  move: Pick<DemoMove, "unhittableTime">,
): void {
  const value = move.unhittableTime?.[0];
  if (value === undefined || value < 0) return;
  state.unhittableTime = Math.max(0, Math.trunc(value));
}

export function applyRuntimeHitOverrideUnhittableTime(
  attacker: Pick<CharacterRuntimeState, "unhittableTime">,
  receiver: Pick<CharacterRuntimeState, "unhittableTime">,
  move: Pick<DemoMove, "unhittableTime">,
  guarded: boolean,
): void {
  applyRuntimeAttackerUnhittableTime(attacker, move);
  if (!guarded) {
    applyRuntimeReceiverUnhittableTime(receiver, move);
  }
}

export function tickRuntimeUnhittableTime(
  state: Pick<CharacterRuntimeState, "unhittableTime">,
): number {
  const current = Math.max(0, Math.trunc(state.unhittableTime ?? 0));
  state.unhittableTime = Math.max(0, current - 1);
  return state.unhittableTime;
}

import { isRuntimeHoldingBack } from "./RuntimeInput";
import type { CharacterRuntimeState } from "./types";

export type RuntimeGuardState = Pick<
  CharacterRuntimeState,
  "stateNo" | "stateType" | "moveType" | "ctrl" | "vel" | "guardStun"
>;

export type RuntimeGuardStatePredicate = (stateNo: number) => boolean;

export type RuntimeAutoGuardOptions = {
  currentMoveActive: boolean;
  hitPause: number;
  hitStun: number;
};

export class RuntimeGuardWorld {
  isGuardState(stateNo: number): boolean {
    return isRuntimeGuardState(stateNo);
  }

  defaultGuardHitStateNo(state: Pick<CharacterRuntimeState, "stateType">, canEnterState: RuntimeGuardStatePredicate): number | undefined {
    return defaultRuntimeGuardHitStateNo(state, canEnterState);
  }

  defaultGuardStartStateNo(state: Pick<CharacterRuntimeState, "stateType">, canEnterState: RuntimeGuardStatePredicate): number | undefined {
    return defaultRuntimeGuardStartStateNo(state, canEnterState);
  }

  canAttemptAutoGuardStart(input: Iterable<string>, state: RuntimeGuardState, options: RuntimeAutoGuardOptions): boolean {
    return canAttemptRuntimeAutoGuardStart(input, state, options);
  }

  applyAutoGuardStart(state: RuntimeGuardState): void {
    applyRuntimeAutoGuardStart(state);
  }
}

export function defaultRuntimeGuardHitStateNo(
  state: Pick<CharacterRuntimeState, "stateType">,
  canEnterState: RuntimeGuardStatePredicate,
): number | undefined {
  const preferred = state.stateType === "A" ? [154, 150] : state.stateType === "C" ? [152, 150] : [150];
  return preferred.find((stateNo) => canEnterState(stateNo));
}

export function defaultRuntimeGuardStartStateNo(
  state: Pick<CharacterRuntimeState, "stateType">,
  canEnterState: RuntimeGuardStatePredicate,
): number | undefined {
  const stateTypedGuard = state.stateType === "A" ? [132, 120] : state.stateType === "C" ? [131, 120] : [130, 120];
  return [120, ...stateTypedGuard].find((stateNo) => canEnterState(stateNo));
}

export function isRuntimeGuardState(stateNo: number): boolean {
  return stateNo >= 120 && stateNo <= 155;
}

export function canAttemptRuntimeAutoGuardStart(
  input: Iterable<string>,
  state: RuntimeGuardState,
  options: RuntimeAutoGuardOptions,
): boolean {
  if (!isRuntimeHoldingBack(input)) {
    return false;
  }
  if (options.currentMoveActive || options.hitPause > 0 || options.hitStun > 0 || (state.guardStun ?? 0) > 0) {
    return false;
  }
  return state.ctrl && state.moveType !== "H" && !isRuntimeGuardState(state.stateNo);
}

export function applyRuntimeAutoGuardStart(state: RuntimeGuardState): void {
  state.ctrl = false;
  state.vel.x = 0;
}

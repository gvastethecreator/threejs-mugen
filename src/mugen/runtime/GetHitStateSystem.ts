import type { CharacterRuntimeState } from "./types";

export type RuntimeGetHitState = Pick<CharacterRuntimeState, "stateType">;

export type RuntimeGetHitStatePredicate = (stateNo: number) => boolean;

export class RuntimeGetHitStateWorld {
  defaultGetHitStateNo(state: RuntimeGetHitState, canEnterState: RuntimeGetHitStatePredicate): number | undefined {
    return defaultRuntimeGetHitStateNo(state, canEnterState);
  }
}

export function defaultRuntimeGetHitStateNo(
  state: RuntimeGetHitState,
  canEnterState: RuntimeGetHitStatePredicate,
): number | undefined {
  const preferred = state.stateType === "A" ? [5020, 5000] : state.stateType === "C" ? [5010, 5000] : [5000];
  return preferred.find((stateNo) => canEnterState(stateNo));
}

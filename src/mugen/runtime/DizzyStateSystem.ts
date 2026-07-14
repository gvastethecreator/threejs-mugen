export const DEFAULT_RUNTIME_DIZZY_STATE_NO = 6565300;
export const DEFAULT_RUNTIME_DIZZY_ANIM_NO = 5300;

export type RuntimeDizzyStatePredicate = (stateNo: number) => boolean;

export class RuntimeDizzyStateWorld {
  defaultDizzyStateNo(canEnterState: RuntimeDizzyStatePredicate): number | undefined {
    return defaultRuntimeDizzyStateNo(canEnterState);
  }
}

export function defaultRuntimeDizzyStateNo(canEnterState: RuntimeDizzyStatePredicate): number | undefined {
  return canEnterState(DEFAULT_RUNTIME_DIZZY_STATE_NO) ? DEFAULT_RUNTIME_DIZZY_STATE_NO : undefined;
}

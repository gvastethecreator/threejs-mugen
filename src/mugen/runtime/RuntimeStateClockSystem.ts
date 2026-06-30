export type RuntimeStateClock = {
  stateElapsed: number;
};

export type RuntimeStateClockTransition = {
  changed: boolean;
};

export type RuntimeStateClockResetOptions = {
  resetElapsed?: boolean;
};

export class RuntimeStateClockWorld {
  advance(clock: RuntimeStateClock): number {
    clock.stateElapsed += 1;
    return clock.stateElapsed;
  }

  resetForTransition(
    clock: RuntimeStateClock,
    transition: RuntimeStateClockTransition,
    options: RuntimeStateClockResetOptions = {},
  ): boolean {
    if (!transition.changed || options.resetElapsed !== true) {
      return false;
    }
    clock.stateElapsed = -1;
    return true;
  }
}

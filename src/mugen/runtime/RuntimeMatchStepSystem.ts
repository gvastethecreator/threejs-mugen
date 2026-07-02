export type RuntimeMatchStepInput<TSnapshot> = {
  playing: boolean;
  frameClock: number;
  speed: number;
  force?: boolean;
  isRoundOver: () => boolean;
  advanceOneTick: () => void;
  snapshot: () => TSnapshot;
};

export type RuntimeMatchStepResult<TSnapshot> = {
  frameClock: number;
  iterations: number;
  advancedTicks: number;
  snapshot: TSnapshot;
};

export class RuntimeMatchStepWorld {
  step<TSnapshot>(input: RuntimeMatchStepInput<TSnapshot>): RuntimeMatchStepResult<TSnapshot> {
    if (!input.playing && !input.force) {
      return {
        frameClock: input.frameClock,
        iterations: 0,
        advancedTicks: 0,
        snapshot: input.snapshot(),
      };
    }

    const frameClock = input.frameClock + 1;
    const iterations = input.force ? 1 : runtimeMatchStepIterations(input.speed, frameClock);
    let advancedTicks = 0;

    for (let index = 0; index < iterations; index += 1) {
      if (input.isRoundOver()) {
        break;
      }
      input.advanceOneTick();
      advancedTicks += 1;
    }

    return {
      frameClock,
      iterations,
      advancedTicks,
      snapshot: input.snapshot(),
    };
  }
}

export function runtimeMatchStepIterations(speed: number, frameClock: number): number {
  if (speed < 1) {
    const skipEvery = Math.round(1 / speed);
    return frameClock % skipEvery === 0 ? 1 : 0;
  }
  return Math.max(1, Math.round(speed));
}

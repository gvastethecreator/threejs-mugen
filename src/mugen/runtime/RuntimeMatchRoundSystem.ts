import type { RuntimeRoundFinishResult, RuntimeRoundSystem } from "./RuntimeRoundSystem";

export type RuntimeMatchRoundActor = {
  label: string;
  runtime: {
    life: number;
  };
};

export type RuntimeMatchRoundFinishOptions<TActor extends RuntimeMatchRoundActor> = {
  round: RuntimeRoundSystem;
  p1: TActor;
  p2: TActor;
  stopPlaying: () => void;
  log: (message: string) => void;
};

export class RuntimeMatchRoundWorld {
  tickTimer(round: RuntimeRoundSystem): void {
    round.tickTimer();
  }

  finishIfNeeded<TActor extends RuntimeMatchRoundActor>(
    options: RuntimeMatchRoundFinishOptions<TActor>,
  ): RuntimeRoundFinishResult | undefined {
    const finish = options.round.finishIfNeeded(
      { label: options.p1.label, life: options.p1.runtime.life },
      { label: options.p2.label, life: options.p2.runtime.life },
    );
    if (!finish) {
      return undefined;
    }
    options.stopPlaying();
    options.log(finish.message);
    return finish;
  }
}

import type { RuntimeRoundFinishResult, RuntimeRoundSystem } from "./RuntimeRoundSystem";

export type RuntimeMatchRoundActor = {
  label: string;
  runtime: {
    life: number;
    assertSpecial?: {
      flags: string[];
      globalFlags: string[];
      timerFreeze?: boolean;
      roundNotOver?: boolean;
    };
  };
};

export type RuntimeMatchRoundTimerResult = {
  frozen: boolean;
};

export type RuntimeMatchRoundFinishOptions<TActor extends RuntimeMatchRoundActor> = {
  round: RuntimeRoundSystem;
  p1: TActor;
  p2: TActor;
  stopPlaying: () => void;
  log: (message: string) => void;
  emitKoSound?: (actor: TActor) => void;
};

export class RuntimeMatchRoundWorld {
  tickTimer(round: RuntimeRoundSystem, actors: readonly RuntimeMatchRoundActor[] = []): RuntimeMatchRoundTimerResult {
    if (actors.some(hasTimerFreeze)) {
      return { frozen: true };
    }
    round.tickTimer();
    return { frozen: false };
  }

  finishIfNeeded<TActor extends RuntimeMatchRoundActor>(
    options: RuntimeMatchRoundFinishOptions<TActor>,
  ): RuntimeRoundFinishResult | undefined {
    if (hasRoundNotOver(options.p1) || hasRoundNotOver(options.p2)) {
      return undefined;
    }
    const finish = options.round.finishIfNeeded(
      { label: options.p1.label, life: options.p1.runtime.life },
      { label: options.p2.label, life: options.p2.runtime.life },
    );
    if (!finish) {
      return undefined;
    }
    if (finish.state === "ko" && !hasNoKoSound(options.p1, options.p2)) {
      if (options.p1.runtime.life <= 0) options.emitKoSound?.(options.p1);
      if (options.p2.runtime.life <= 0) options.emitKoSound?.(options.p2);
    }
    options.stopPlaying();
    options.log(finish.message);
    return finish;
  }
}

function hasNoKoSound(...actors: RuntimeMatchRoundActor[]): boolean {
  return actors.some((actor) => actor.runtime.assertSpecial?.globalFlags.includes("nokosnd") === true);
}

function hasTimerFreeze(actor: RuntimeMatchRoundActor): boolean {
  const assertSpecial = actor.runtime.assertSpecial;
  return Boolean(
    assertSpecial?.timerFreeze ||
      assertSpecial?.flags.includes("timerfreeze") ||
      assertSpecial?.globalFlags.includes("timerfreeze"),
  );
}

function hasRoundNotOver(actor: RuntimeMatchRoundActor): boolean {
  const assertSpecial = actor.runtime.assertSpecial;
  return Boolean(
    assertSpecial?.roundNotOver ||
      assertSpecial?.flags.includes("roundnotover") ||
      assertSpecial?.globalFlags.includes("roundnotover"),
  );
}

import type {
  RuntimeRoundFinishResult,
  RuntimeRoundSystem,
  RuntimeRoundTickOptions,
} from "./RuntimeRoundSystem";
import {
  RuntimeGlobalAssertSpecialWorld,
  type RuntimeGlobalAssertSpecialActor,
  type RuntimeGlobalAssertSpecialSnapshot,
} from "./RuntimeGlobalAssertSpecialSystem";
import {
  RuntimeTeamRoundDecisionWorld,
  type RuntimeTeamRoundDecision,
  type RuntimeTeamRoundDecisionInput,
} from "./RuntimeTeamRoundDecisionSystem";
import {
  RuntimeTeamRoundHandoffWorld,
  type RuntimeTeamRoundHandoffInput,
  type RuntimeTeamRoundHandoffResult,
} from "./RuntimeTeamRoundHandoffSystem";

export type RuntimeMatchRoundActor = RuntimeGlobalAssertSpecialActor & {
  label: string;
  runtime: {
    life: number;
  };
};

export type RuntimeMatchRoundTimerResult = {
  frozen: boolean;
  held?: boolean;
  introSkipResetReady?: boolean;
};

export type RuntimeMatchRoundTimerOptions = RuntimeRoundTickOptions;

export type RuntimeMatchRoundFinishOptions<TActor extends RuntimeMatchRoundActor> = {
  round: RuntimeRoundSystem;
  p1: TActor;
  p2: TActor;
  tick?: number;
  stopPlaying: () => void;
  log: (message: string) => void;
  emitKoSound?: (actor: TActor) => void;
};

export class RuntimeMatchRoundWorld {
  constructor(
    private readonly globalAssertSpecialWorld = new RuntimeGlobalAssertSpecialWorld(),
    private readonly teamRoundDecisionWorld = new RuntimeTeamRoundDecisionWorld(),
    private readonly teamRoundHandoffWorld = new RuntimeTeamRoundHandoffWorld(),
  ) {}

  snapshotGlobalAssertSpecial(
    actors: readonly RuntimeMatchRoundActor[] = [],
    tick = 0,
  ): RuntimeGlobalAssertSpecialSnapshot {
    return this.globalAssertSpecialWorld.snapshot({ actors, tick });
  }

  snapshotTeamRoundDecision(input: RuntimeTeamRoundDecisionInput): RuntimeTeamRoundDecision {
    return this.teamRoundDecisionWorld.snapshot(input);
  }

  applyTeamRoundHandoff(input: RuntimeTeamRoundHandoffInput): RuntimeTeamRoundHandoffResult {
    return this.teamRoundHandoffWorld.apply(input);
  }

  tickTimer(
    round: RuntimeRoundSystem,
    actors: readonly RuntimeMatchRoundActor[] = [],
    tick = 0,
    options: RuntimeMatchRoundTimerOptions = {},
  ): RuntimeMatchRoundTimerResult {
    return this.advanceTimer(round, actors, undefined, tick, options);
  }

  advanceTimer(
    round: RuntimeRoundSystem,
    actors: readonly RuntimeMatchRoundActor[] = [],
    stopPlaying?: () => void,
    runtimeTick = 0,
    options: RuntimeMatchRoundTimerOptions = {},
  ): RuntimeMatchRoundTimerResult {
    const globalAssertSpecial = this.snapshotGlobalAssertSpecial(actors, runtimeTick);
    const roundSnapshot = round.snapshot();
    if (roundSnapshot.state === "fight" && globalAssertSpecial.timerFreeze) {
      return { frozen: true };
    }
    if (
      (roundSnapshot.state === "ko" || roundSnapshot.state === "timeover") &&
      round.currentPhase === 4 &&
      globalAssertSpecial.roundNotOver
    ) {
      return { frozen: false, held: true };
    }
    const timerTick = round.tickTimer({
      ...options,
      skipRoundDisplay: globalAssertSpecial.skipRoundDisplay,
      skipFightDisplay: globalAssertSpecial.skipFightDisplay,
    });
    if (timerTick.finishedNow) stopPlaying?.();
    return {
      frozen: false,
      ...(round.consumeIntroSkipResetSignal() ? { introSkipResetReady: true } : {}),
    };
  }

  finishIfNeeded<TActor extends RuntimeMatchRoundActor>(
    options: RuntimeMatchRoundFinishOptions<TActor>,
  ): RuntimeRoundFinishResult | undefined {
    const globalAssertSpecial = this.snapshotGlobalAssertSpecial([options.p1, options.p2], options.tick);
    if (globalAssertSpecial.roundNotOver) {
      return undefined;
    }
    const finish = options.round.finishIfNeeded(
      { label: options.p1.label, life: options.p1.runtime.life },
      { label: options.p2.label, life: options.p2.runtime.life },
      { noKoSlow: globalAssertSpecial.noKoSlow },
    );
    if (!finish) {
      return undefined;
    }
    if (finish.state === "ko" && !globalAssertSpecial.noKoSound) {
      if (options.p1.runtime.life <= 0) options.emitKoSound?.(options.p1);
      if (options.p2.runtime.life <= 0) options.emitKoSound?.(options.p2);
    }
    if (options.round.isOver) options.stopPlaying();
    options.log(finish.message);
    return finish;
  }
}

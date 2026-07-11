export type RuntimeMatchResetFighterStart = {
  x: number;
  y: number;
  facing: 1 | -1;
};

export type RuntimeMatchResetRound = {
  reset: (frames?: number) => void;
};

export type RuntimeMatchResettableWorld = {
  reset: () => void;
};

export type RuntimeMatchResetInput<TActor extends object, TDefinition> = {
  p1: TActor;
  p2: TActor;
  p1Definition: TDefinition;
  p2Definition: TDefinition;
  p1Start: RuntimeMatchResetFighterStart;
  p2Start: RuntimeMatchResetFighterStart;
  round: RuntimeMatchResetRound;
  roundTimerFrames?: number;
  pauseWorld: RuntimeMatchResettableWorld;
  envColorWorld: RuntimeMatchResettableWorld;
  effectActorWorld: RuntimeMatchResettableWorld;
  reserveActors?: Array<{
    actor: TActor;
    id: string;
    definition: TDefinition;
    start: RuntimeMatchResetFighterStart;
  }>;
  createFighter: (id: string, definition: TDefinition, start: RuntimeMatchResetFighterStart) => TActor;
  attachHelperTargetStateHandlers: () => void;
  log: (message: string) => void;
};

export type RuntimeMatchResetResult = {
  tick: 0;
  frameClock: 0;
  playing: true;
};

export class RuntimeMatchResetWorld {
  reset<TActor extends object, TDefinition>(input: RuntimeMatchResetInput<TActor, TDefinition>): RuntimeMatchResetResult {
    input.round.reset(input.roundTimerFrames);
    input.pauseWorld.reset();
    input.envColorWorld.reset();
    input.effectActorWorld.reset();

    Object.assign(input.p1, input.createFighter("p1", input.p1Definition, input.p1Start));
    Object.assign(input.p2, input.createFighter("p2", input.p2Definition, input.p2Start));
    for (const reserve of input.reserveActors ?? []) {
      Object.assign(reserve.actor, input.createFighter(reserve.id, reserve.definition, reserve.start));
    }
    input.attachHelperTargetStateHandlers();
    input.log("Round reset");

    return {
      tick: 0,
      frameClock: 0,
      playing: true,
    };
  }
}

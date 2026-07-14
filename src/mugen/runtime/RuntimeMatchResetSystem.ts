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
  resetRound?: boolean;
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
  attachHelperHandlers: () => void;
  log: (message: string) => void;
};

export type RuntimeMatchResetResult = {
  tick: 0;
  frameClock: 0;
  playing: true;
};

export class RuntimeMatchResetWorld {
  reset<TActor extends object, TDefinition>(input: RuntimeMatchResetInput<TActor, TDefinition>): RuntimeMatchResetResult {
    if (input.resetRound !== false) {
      input.round.reset(input.roundTimerFrames);
    }
    input.pauseWorld.reset();
    input.envColorWorld.reset();
    input.effectActorWorld.reset();

    replaceObjectContents(input.p1, input.createFighter("p1", input.p1Definition, input.p1Start));
    replaceObjectContents(input.p2, input.createFighter("p2", input.p2Definition, input.p2Start));
    for (const reserve of input.reserveActors ?? []) {
      replaceObjectContents(reserve.actor, input.createFighter(reserve.id, reserve.definition, reserve.start));
    }
    input.attachHelperHandlers();
    input.log("Round reset");

    return {
      tick: 0,
      frameClock: 0,
      playing: true,
    };
  }
}

function replaceObjectContents<TActor extends object>(target: TActor, replacement: TActor): void {
  for (const key of Object.keys(target)) {
    delete (target as Record<string, unknown>)[key];
  }
  Object.assign(target, replacement);
}

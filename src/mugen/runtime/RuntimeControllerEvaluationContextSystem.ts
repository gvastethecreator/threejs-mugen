import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";

export type RuntimeControllerEvaluationActor = {
  hitPause: number;
};

export type RuntimeControllerEvaluationContextInput<TActor extends RuntimeControllerEvaluationActor, TOwner> = {
  actor: TActor;
  owner: TOwner;
  stageBounds?: { left: number; right: number };
  tick: number;
  getConst: (owner: TOwner, name: string) => number | undefined;
  nextRandom: (actor: TActor) => number;
};

export class RuntimeControllerEvaluationContextWorld {
  create<TActor extends RuntimeControllerEvaluationActor, TOwner>(
    input: RuntimeControllerEvaluationContextInput<TActor, TOwner>,
  ): RuntimeControllerEvaluationContext {
    return {
      getConst: (name) => input.getConst(input.owner, name),
      hitPauseTime: () => input.actor.hitPause,
      random: () => input.nextRandom(input.actor),
      stageBounds: input.stageBounds,
      stageTime: input.tick,
    };
  }
}

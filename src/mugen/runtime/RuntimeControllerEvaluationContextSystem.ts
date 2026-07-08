import type { ExpressionGameSpace, ExpressionRedirectTarget } from "./ExpressionEvaluator";
import type { RuntimeControllerEvaluationContext } from "./RuntimeControllerExpressionContextSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeControllerEvaluationActor = {
  hitPause: number;
};

export type RuntimeControllerEvaluationRedirectActor = {
  runtime: CharacterRuntimeState;
};

export type RuntimeControllerEvaluationContextInput<TActor extends RuntimeControllerEvaluationActor, TOwner> = {
  actor: TActor;
  owner: TOwner;
  opponent?: RuntimeControllerEvaluationRedirectActor;
  parent?: RuntimeControllerEvaluationRedirectActor;
  root?: RuntimeControllerEvaluationRedirectActor;
  target?: (targetId?: number) => ExpressionRedirectTarget | undefined;
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
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
      gameSpace: input.gameSpace,
      stageTime: input.tick,
      opponent: input.opponent?.runtime,
      parent: input.parent?.runtime,
      root: input.root?.runtime,
      target: input.target,
    };
  }
}

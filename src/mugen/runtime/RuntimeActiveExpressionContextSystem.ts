import type { ExpressionContext, ExpressionGameSpace } from "./ExpressionEvaluator";
import {
  RuntimeExpressionContextWorld,
  type RuntimeExpressionContextActor,
} from "./RuntimeExpressionContextSystem";

export type RuntimeActiveExpressionContextRequest<TActor extends RuntimeExpressionContextActor> = {
  actor: TActor;
  opponent: TActor;
  opponents?: readonly TActor[];
  characters?: readonly TActor[];
  owner: TActor;
  tick?: number;
};

export type RuntimeActiveExpressionContextFactoryInput<TActor extends RuntimeExpressionContextActor> = {
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
  nextRandom: (actor: TActor) => number;
  animTimeRemaining: (actor: TActor) => number;
  animElemTime: (actor: TActor, elementNumber: number) => number | undefined;
  inGuardDist: (actor: TActor, opponent: TActor) => boolean;
};

export class RuntimeActiveExpressionContextWorld {
  constructor(private readonly expressionContextWorld = new RuntimeExpressionContextWorld()) {}

  create<TActor extends RuntimeExpressionContextActor>(
    input: RuntimeActiveExpressionContextFactoryInput<TActor> & RuntimeActiveExpressionContextRequest<TActor>,
  ): ExpressionContext {
    return this.expressionContextWorld.create({
      actor: input.actor,
      opponent: input.opponent,
      opponents: input.opponents,
      characters: input.characters ?? [input.actor, input.opponent, ...(input.opponents ?? [])],
      owner: input.owner,
      stageBounds: input.stageBounds,
      gameSpace: input.gameSpace,
      stageTime: input.tick,
      random: () => input.nextRandom(input.actor),
      animTimeRemaining: input.animTimeRemaining(input.actor),
      animElemTime: (elementNumber) => input.animElemTime(input.actor, elementNumber),
      inGuardDist: () => input.inGuardDist(input.actor, input.opponent),
    });
  }

  createFactory<TActor extends RuntimeExpressionContextActor>(
    input: RuntimeActiveExpressionContextFactoryInput<TActor>,
  ): (request: RuntimeActiveExpressionContextRequest<TActor>) => ExpressionContext {
    return (request) => this.create({ ...input, ...request });
  }
}

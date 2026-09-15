import type { ExpressionContext, ExpressionGameSpace, ExpressionRedirectTarget } from "./ExpressionEvaluator";
import {
  RuntimeExpressionContextWorld,
  type RuntimeExpressionContextActor,
} from "./RuntimeExpressionContextSystem";
import type { RuntimeP2SelectionOptions } from "./RuntimeOpponentSelectionSystem";
import type { RuntimeRootSelectionEntry } from "./RuntimeRootSelectionSystem";

export type RuntimeActiveExpressionContextRequest<TActor extends RuntimeExpressionContextActor> = {
  actor: TActor;
  opponent: TActor;
  opponents?: readonly TActor[];
  characters?: readonly TActor[];
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined;
  rootSelection?: RuntimeRootSelectionEntry;
  p2Selection?: RuntimeP2SelectionOptions;
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
  characters?: readonly TActor[];
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined;
  resolveRootSelection?: (actor: TActor, characters: readonly TActor[]) => RuntimeRootSelectionEntry | undefined;
  defaultP2Selection?: RuntimeP2SelectionOptions;
  teamMode?: string | ((actor: TActor) => string | undefined);
  roundDecision?: ExpressionContext["roundDecision"] | ((actor: TActor) => ExpressionContext["roundDecision"] | undefined);
};

export class RuntimeActiveExpressionContextWorld {
  constructor(private readonly expressionContextWorld = new RuntimeExpressionContextWorld()) {}

  create<TActor extends RuntimeExpressionContextActor>(
    input: RuntimeActiveExpressionContextFactoryInput<TActor> & RuntimeActiveExpressionContextRequest<TActor>,
  ): ExpressionContext {
    const characters = input.characters ?? [input.actor, input.opponent, ...(input.opponents ?? [])];
    const rootSelection = input.rootSelection ?? input.resolveRootSelection?.(input.actor, characters);
    return this.expressionContextWorld.create({
      actor: input.actor,
      opponent: input.opponent,
      opponents: input.opponents,
      characters,
      playerIdTarget: input.playerIdTarget,
      rootSelection,
      p2Selection: input.p2Selection ?? input.defaultP2Selection,
      owner: input.owner,
      stageBounds: input.stageBounds,
      gameSpace: input.gameSpace,
      stageTime: input.tick,
      random: () => input.nextRandom(input.actor),
      animTimeRemaining: input.animTimeRemaining(input.actor),
      animElemTime: (elementNumber) => input.animElemTime(input.actor, elementNumber),
      inGuardDist: () => input.inGuardDist(input.actor, input.opponent),
      ...(resolveActiveTeamMode(input.teamMode, input.actor) === undefined
        ? {}
        : { teamMode: resolveActiveTeamMode(input.teamMode, input.actor) }),
      ...(input.roundDecision === undefined ? {} : { roundDecision: input.roundDecision }),
    });
  }

  createFactory<TActor extends RuntimeExpressionContextActor>(
    input: RuntimeActiveExpressionContextFactoryInput<TActor>,
  ): (request: RuntimeActiveExpressionContextRequest<TActor>) => ExpressionContext {
    return (request) => this.create({ ...input, ...request });
  }
}

function resolveActiveTeamMode<TActor extends RuntimeExpressionContextActor>(
  teamMode: RuntimeActiveExpressionContextFactoryInput<TActor>["teamMode"],
  actor: TActor,
): string | undefined {
  return typeof teamMode === "function" ? teamMode(actor) : teamMode;
}

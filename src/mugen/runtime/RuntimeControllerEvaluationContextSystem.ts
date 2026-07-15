import type { ExpressionGameSpace, ExpressionRedirectTarget } from "./ExpressionEvaluator";
import type { RuntimeControllerEvaluationContext } from "./RuntimeControllerExpressionContextSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeControllerEvaluationActor = {
  hitPause: number;
  playerId?: number;
  playerNo?: number;
};

export type RuntimeControllerEvaluationRedirectActor = {
  runtime: CharacterRuntimeState;
  playerId?: number;
  playerNo?: number;
};

export type RuntimeControllerEvaluationContextInput<TActor extends RuntimeControllerEvaluationActor, TOwner> = {
  actor: TActor;
  owner: TOwner;
  opponent?: RuntimeControllerEvaluationRedirectActor;
  parent?: RuntimeControllerEvaluationRedirectActor;
  root?: RuntimeControllerEvaluationRedirectActor;
  target?: (targetId?: number) => ExpressionRedirectTarget | undefined;
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined;
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
  localCoord?: [number, number];
  opponentLocalCoord?: [number, number];
  parentLocalCoord?: [number, number];
  rootLocalCoord?: [number, number];
  tick: number;
  getConst: (owner: TOwner, name: string) => number | undefined;
  nextRandom: (actor: TActor) => number;
};

export class RuntimeControllerEvaluationContextWorld {
  create<TActor extends RuntimeControllerEvaluationActor, TOwner>(
    input: RuntimeControllerEvaluationContextInput<TActor, TOwner>,
  ): RuntimeControllerEvaluationContext {
    return {
      playerId: input.actor.playerId,
      playerNo: input.actor.playerNo,
      getConst: (name) => input.getConst(input.owner, name),
      hitPauseTime: () => input.actor.hitPause,
      random: () => input.nextRandom(input.actor),
      stageBounds: input.stageBounds,
      gameSpace: input.gameSpace,
      localCoord: input.localCoord,
      opponentLocalCoord: input.opponentLocalCoord,
      parentLocalCoord: input.parentLocalCoord,
      rootLocalCoord: input.rootLocalCoord,
      stageTime: input.tick,
      opponent: input.opponent?.runtime,
      opponentPlayerId: input.opponent?.playerId,
      opponentPlayerNo: input.opponent?.playerNo,
      parent: input.parent?.runtime,
      parentPlayerId: input.parent?.playerId,
      parentPlayerNo: input.parent?.playerNo,
      root: input.root?.runtime,
      rootPlayerId: input.root?.playerId,
      rootPlayerNo: input.root?.playerNo,
      target: input.target,
      playerIdTarget: input.playerIdTarget,
    };
  }
}

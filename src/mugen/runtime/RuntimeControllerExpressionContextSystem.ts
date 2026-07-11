import type { MugenAnimationAction } from "../model/MugenAnimation";
import { evaluateExpression, type ExpressionContext, type ExpressionGameSpace, type ExpressionRedirectTarget } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeControllerEvaluationContext = {
  playerId?: number;
  playerNo?: number;
  getConst?: (name: string) => number | undefined;
  getAnimation?: (animNo: number, source: NonNullable<CharacterRuntimeState["animationSource"]>) => MugenAnimationAction | undefined;
  hitPauseTime?: () => number;
  random?: () => number;
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
  localCoord?: [number, number];
  opponentLocalCoord?: [number, number];
  parentLocalCoord?: [number, number];
  rootLocalCoord?: [number, number];
  stageTime?: number;
  opponent?: CharacterRuntimeState;
  opponentPlayerId?: number;
  opponentPlayerNo?: number;
  parent?: CharacterRuntimeState;
  parentPlayerId?: number;
  parentPlayerNo?: number;
  root?: CharacterRuntimeState;
  rootPlayerId?: number;
  rootPlayerNo?: number;
  target?: (targetId?: number) => ExpressionRedirectTarget | undefined;
  teamSide?: number;
  opponentTeamSide?: number;
  parentTeamSide?: number;
  rootTeamSide?: number;
  isHelper?: boolean;
  helperId?: number;
  stateTime?: number;
};

export function createRuntimeControllerExpressionContext(
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): ExpressionContext {
  return {
    self: state,
    playerId: context.playerId,
    playerNo: context.playerNo,
    opponent: context.opponent,
    opponentPlayerId: context.opponentPlayerId,
    opponentPlayerNo: context.opponentPlayerNo,
    parent: context.parent,
    parentPlayerId: context.parentPlayerId,
    parentPlayerNo: context.parentPlayerNo,
    root: context.root,
    rootPlayerId: context.rootPlayerId,
    rootPlayerNo: context.rootPlayerNo,
    target: context.target,
    getConst: context.getConst,
    getHitVar: (name) => runtimeHitVar(state, name),
    hitPauseTime: context.hitPauseTime,
    random: context.random,
    stageBounds: context.stageBounds,
    gameSpace: context.gameSpace,
    localCoord: context.localCoord,
    opponentLocalCoord: context.opponentLocalCoord,
    parentLocalCoord: context.parentLocalCoord,
    rootLocalCoord: context.rootLocalCoord,
    stageTime: context.stageTime,
    stateTime: context.stateTime,
    teamSide: context.teamSide,
    opponentTeamSide: context.opponentTeamSide,
    parentTeamSide: context.parentTeamSide,
    rootTeamSide: context.rootTeamSide,
    isHelper: context.isHelper,
    helperId: context.helperId,
  };
}

export function evaluateRuntimeControllerNumber(
  raw: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): number | undefined {
  if (!raw) {
    return undefined;
  }
  const direct = Number(raw);
  if (Number.isFinite(direct)) {
    return direct;
  }
  const value = Number(evaluateExpression(raw, createRuntimeControllerExpressionContext(state, context)));
  return Number.isFinite(value) ? value : undefined;
}

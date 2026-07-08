import type { MugenAnimationAction } from "../model/MugenAnimation";
import { evaluateExpression, type ExpressionContext, type ExpressionGameSpace, type ExpressionRedirectTarget } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeControllerEvaluationContext = {
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
  parent?: CharacterRuntimeState;
  root?: CharacterRuntimeState;
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
    opponent: context.opponent,
    parent: context.parent,
    root: context.root,
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

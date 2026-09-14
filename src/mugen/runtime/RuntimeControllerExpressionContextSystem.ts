import type { MugenAnimationAction } from "../model/MugenAnimation";
import { evaluateExpression, type ExpressionContext, type ExpressionGameSpace, type ExpressionRedirectTarget } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import type { CharacterRuntimeState } from "./types";

/** Dynamic identity and roster reads shared with controller value expressions. */
export type RuntimeControllerExpressionBindings = Pick<
  ExpressionContext,
  | "enemyNear"
  | "enemyNearFallbackToOpponent"
  | "partner"
  | "enemy"
  | "name"
  | "authorName"
  | "opponentName"
  | "opponentAuthorName"
  | "p3Name"
  | "p4Name"
  | "p5Name"
  | "p6Name"
  | "p7Name"
  | "p8Name"
  | "introState"
  | "fightScreen"
  | "fightScreenState"
  | "fightScreenVar"
  | "gameVar"
  | "animElemVar"
  | "animExists"
  | "activeAnimExists"
  | "animElemNo"
  | "animLength"
  | "animPlayerNo"
  | "teamMode"
  | "roundDecision"
  | "clsnVar"
  | "opponentClsnVar"
  | "clsnOverlap"
  | "opponentClsnOverlap"
  | "projClsnOverlap"
  | "opponentProjClsnOverlap"
  | "projVar"
  | "opponentProjVar"
  | "projVarFlag"
  | "opponentProjVarFlag"
>;

export type RuntimeControllerEvaluationContext = RuntimeControllerExpressionBindings & {
  /** The bounded post-round window where resource writes must not alter combat state. */
  roundNoDamage?: boolean;
  self?: CharacterRuntimeState;
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
  outputLocalCoord?: [number, number];
  sizeBoxX?: { x1: number; x2: number } | null;
  opponentSizeBoxX?: { x1: number; x2: number } | null;
  sizeBoxY?: { y1: number; y2: number } | null;
  opponentSizeBoxY?: { y1: number; y2: number } | null;
  p2BodyDistYUsesSizeBoxes?: boolean;
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
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined;
  teamSide?: number;
  opponentTeamSide?: number;
  parentTeamSide?: number;
  rootTeamSide?: number;
  isHelper?: boolean;
  helperId?: number;
  stateTime?: number;
  introState?: number;
  fightScreen?: ExpressionContext["fightScreen"];
  fightScreenState?: ExpressionContext["fightScreenState"];
  fightScreenVar?: ExpressionContext["fightScreenVar"];
  gameVar?: ExpressionContext["gameVar"];
  animElemVar?: ExpressionContext["animElemVar"];
  animExists?: ExpressionContext["animExists"];
  activeAnimExists?: ExpressionContext["activeAnimExists"];
  animElemNo?: ExpressionContext["animElemNo"];
  animLength?: ExpressionContext["animLength"];
  animPlayerNo?: ExpressionContext["animPlayerNo"];
  roundDecision?: ExpressionContext["roundDecision"];
  parentClsnVar?: ExpressionContext["parentClsnVar"];
  rootClsnVar?: ExpressionContext["rootClsnVar"];
  parentClsnOverlap?: ExpressionContext["parentClsnOverlap"];
  rootClsnOverlap?: ExpressionContext["rootClsnOverlap"];
  parentProjClsnOverlap?: ExpressionContext["parentProjClsnOverlap"];
  rootProjClsnOverlap?: ExpressionContext["rootProjClsnOverlap"];
  parentProjVar?: ExpressionContext["parentProjVar"];
  rootProjVar?: ExpressionContext["rootProjVar"];
  parentProjVarFlag?: ExpressionContext["parentProjVarFlag"];
  rootProjVarFlag?: ExpressionContext["rootProjVarFlag"];
};

export function createRuntimeControllerExpressionContext(
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): ExpressionContext {
  return {
    self: context.self ?? state,
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
    playerIdTarget: context.playerIdTarget,
    enemyNear: context.enemyNear,
    enemyNearFallbackToOpponent: context.enemyNearFallbackToOpponent,
    partner: context.partner,
    enemy: context.enemy,
    name: context.name,
    authorName: context.authorName,
    opponentName: context.opponentName,
    opponentAuthorName: context.opponentAuthorName,
    p3Name: context.p3Name,
    p4Name: context.p4Name,
    p5Name: context.p5Name,
    p6Name: context.p6Name,
    p7Name: context.p7Name,
    p8Name: context.p8Name,
    introState: context.introState,
    fightScreen: context.fightScreen,
    fightScreenState: context.fightScreenState,
    fightScreenVar: context.fightScreenVar,
    gameVar: context.gameVar,
    animElemVar: context.animElemVar,
    animExists: context.animExists,
    activeAnimExists: context.activeAnimExists,
    animElemNo: context.animElemNo,
    animLength: context.animLength,
    animPlayerNo: context.animPlayerNo,
    teamMode: context.teamMode,
    roundDecision: context.roundDecision,
    clsnVar: context.clsnVar,
    opponentClsnVar: context.opponentClsnVar,
    parentClsnVar: context.parentClsnVar,
    rootClsnVar: context.rootClsnVar,
    clsnOverlap: context.clsnOverlap,
    opponentClsnOverlap: context.opponentClsnOverlap,
    parentClsnOverlap: context.parentClsnOverlap,
    rootClsnOverlap: context.rootClsnOverlap,
    projClsnOverlap: context.projClsnOverlap,
    opponentProjClsnOverlap: context.opponentProjClsnOverlap,
    parentProjClsnOverlap: context.parentProjClsnOverlap,
    rootProjClsnOverlap: context.rootProjClsnOverlap,
    projVar: context.projVar,
    opponentProjVar: context.opponentProjVar,
    parentProjVar: context.parentProjVar,
    rootProjVar: context.rootProjVar,
    projVarFlag: context.projVarFlag,
    opponentProjVarFlag: context.opponentProjVarFlag,
    parentProjVarFlag: context.parentProjVarFlag,
    rootProjVarFlag: context.rootProjVarFlag,
    getConst: context.getConst,
    getHitVar: (name) => runtimeHitVar(state, name),
    hitPauseTime: context.hitPauseTime,
    random: context.random,
    stageBounds: context.stageBounds,
    gameSpace: context.gameSpace,
    localCoord: context.localCoord,
    opponentLocalCoord: context.opponentLocalCoord,
    outputLocalCoord: context.outputLocalCoord,
    sizeBoxX: context.sizeBoxX,
    opponentSizeBoxX: context.opponentSizeBoxX,
    sizeBoxY: context.sizeBoxY,
    opponentSizeBoxY: context.opponentSizeBoxY,
    p2BodyDistYUsesSizeBoxes: context.p2BodyDistYUsesSizeBoxes,
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

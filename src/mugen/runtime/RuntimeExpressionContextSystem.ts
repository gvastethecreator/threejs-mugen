import type { TriggerIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateSpecial } from "../model/MugenState";
import {
  hitAttributeMatches,
  runtimeGuardFlagComparison,
  runtimeGuardFlagOverlaps,
  runtimeHitAttributeComparison,
  runtimeHitFlagComparison,
  runtimeHitFlagOverlaps,
} from "./CombatResolver";
import type { CommandBuffer } from "./CommandBuffer";
import type { RuntimeContactKind, RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { RuntimeEffectActorCountKind, RuntimeEffectActorWorld } from "./EffectActorSystem";
import { evaluateExpression, type ExpressionContext, type ExpressionGameSpace, type ExpressionRedirectTarget } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import { RuntimeOpponentSelectionWorld, type RuntimeP2SelectionOptions } from "./RuntimeOpponentSelectionSystem";
import { resolveRuntimePushSizeBox, usesMugenPlayerPushMinimumWidth } from "./RuntimeRootBodyPushSystem";
import type { RuntimeRootSelectionEntry } from "./RuntimeRootSelectionSystem";
import { runtimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTargetWorld, RuntimeTargetWorldActor } from "./TargetSystem";
import { evaluateTriggerIr } from "./TriggerEvaluator";
import { runtimeCurrentSizeBox } from "./RuntimeSizeBoxSystem";
import { runtimeAnimationElementVar, runtimeAnimationLength, runtimeAnimationPlayerNo } from "./RuntimeAnimationSystem";
import { runtimeClsnOverlap, runtimeClsnVar } from "./RuntimeFrameSystem";
import { runtimeProjectileClsnOverlap, runtimeProjectileVar } from "./ProjectileSystem";
import {
  runtimeFightScreenStateValue,
  runtimeGameVarValue,
  runtimeFightScreenVarValue,
  type RuntimeFightScreenContext,
} from "./RuntimeFightScreenTriggerSystem";

export { runtimeHitVar, type RuntimeHitVarTiming } from "./RuntimeHitVarSystem";

export type RuntimeExpressionContextDefinition = {
  source?: "demo" | "imported";
  ikemenVersion?: string;
  displayName: string;
  authorName?: string;
  localCoord?: [number, number];
  constants?: Record<string, number>;
  commands?: MugenCommand[];
  animations: Pick<Map<number, unknown>, "has">;
  states?: readonly { id: number; special?: MugenStateSpecial }[];
};

export type RuntimeExpressionContextActor = RuntimeTargetWorldActor & {
  playerId?: number;
  playerNo?: number;
  animationOwnerPlayerNo?: number;
  definition: RuntimeExpressionContextDefinition;
  runtimeProgram?: { states: readonly { id: number; special?: MugenStateSpecial }[] };
  commandBuffer: Pick<CommandBuffer, "isCommandActive">;
  currentAction?: MugenAnimationAction;
  currentMove?: { attr?: string };
  stateElapsed: number;
  hitPause: number;
  hitStun: number;
  contact: RuntimeContactMemory;
  contactWorld: Pick<
    RuntimeContactMemoryWorld,
    | "moveContactValue"
    | "moveHitCountValue"
    | "moveReversedValue"
    | "receivedDamageValue"
    | "receivedHitsValue"
    | "hasProjectileContact"
    | "projectileContactTime"
    | "projectileCancelTime"
  >;
  targetWorld: Pick<RuntimeTargetWorld, "count" | "find">;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "countActors"> &
    Partial<Pick<RuntimeEffectActorWorld, "projectilesOwnedBy">>;
  fightScreen?: RuntimeFightScreenContext;
};

export type RuntimeExpressionContextInput<TActor extends RuntimeExpressionContextActor> = {
  actor: TActor;
  opponent: TActor;
  opponents?: readonly TActor[];
  characters?: readonly TActor[];
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined;
  rootSelection?: RuntimeRootSelectionEntry;
  p2Selection?: RuntimeP2SelectionOptions;
  owner?: TActor;
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
  stageTime?: number;
  random?: () => number;
  animTimeRemaining?: number;
  animElemTime?: (elementNumber: number) => number | undefined;
  inGuardDist?: () => boolean;
  reportUnsupported?: (feature: string) => void;
  teamMode?: string;
  roundDecision?: ExpressionContext["roundDecision"];
};

export class RuntimeExpressionContextWorld {
  constructor(private readonly opponentSelectionWorld = new RuntimeOpponentSelectionWorld()) {}

  create<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): ExpressionContext {
    const { actor } = input;
    const owner = input.owner ?? actor;
    const opponentRoster = this.opponentRoster(input);
    const enemyRoster = this.enemyRoster(input);
    const partnerRoster = this.partnerRoster(input);
    const p2Roster = this.p2Roster(input);
    const selectedP2 = input.rootSelection ? p2Roster[0] : input.opponent;
    const selectedP3 = partnerRoster[0];
    const selectedP4 = p2Roster[1];
    const selectedP5 = partnerRoster[1];
    const selectedP6 = p2Roster[2];
    const selectedP7 = partnerRoster[2];
    const selectedP8 = p2Roster[3];
    const includeWidth = !usesMugenPlayerPushMinimumWidth(actor.definition);
    const currentAction = actor.currentAction;
    const expressionActors = input.characters ?? [actor, input.opponent, ...(input.opponents ?? [])];

    return {
      self: actor.runtime,
      playerId: actor.playerId,
      playerNo: actor.playerNo,
      animPlayerNo: runtimeAnimationPlayerNo(actor),
      opponent: selectedP2?.runtime,
      opponentPlayerId: selectedP2?.playerId,
      opponentPlayerNo: selectedP2?.playerNo,
      opponentAnimPlayerNo: selectedP2 ? runtimeAnimationPlayerNo(selectedP2) : undefined,
      clsnVar: runtimeExpressionClsnVar(actor),
      opponentClsnVar: selectedP2 ? runtimeExpressionClsnVar(selectedP2) : undefined,
      parentClsnVar: runtimeExpressionClsnVar(owner),
      rootClsnVar: runtimeExpressionClsnVar(actor),
      clsnOverlap: runtimeExpressionClsnOverlap(actor, expressionActors),
      opponentClsnOverlap: selectedP2 ? runtimeExpressionClsnOverlap(selectedP2, expressionActors) : undefined,
      parentClsnOverlap: runtimeExpressionClsnOverlap(owner, expressionActors),
      rootClsnOverlap: runtimeExpressionClsnOverlap(actor, expressionActors),
      projClsnOverlap: runtimeExpressionProjClsnOverlap(actor, expressionActors),
      opponentProjClsnOverlap: selectedP2 ? runtimeExpressionProjClsnOverlap(selectedP2, expressionActors) : undefined,
      parentProjClsnOverlap: runtimeExpressionProjClsnOverlap(owner, expressionActors),
      rootProjClsnOverlap: runtimeExpressionProjClsnOverlap(actor, expressionActors),
      projVar: runtimeExpressionProjVar(actor),
      opponentProjVar: selectedP2 ? runtimeExpressionProjVar(selectedP2) : undefined,
      parentProjVar: runtimeExpressionProjVar(owner),
      rootProjVar: runtimeExpressionProjVar(actor),
      projVarFlag: runtimeExpressionProjVarFlag(actor),
      opponentProjVarFlag: selectedP2 ? runtimeExpressionProjVarFlag(selectedP2) : undefined,
      parentProjVarFlag: runtimeExpressionProjVarFlag(owner),
      rootProjVarFlag: runtimeExpressionProjVarFlag(actor),
      enemyNear: (index) => this.resolveEnemyNearRedirect(actor, opponentRoster, index, expressionActors),
      enemyNearFallbackToOpponent: input.rootSelection ? false : undefined,
      partner: (index) => this.resolveRosterRedirect(actor, partnerRoster, index, expressionActors),
      enemy: (index) => this.resolveRosterRedirect(actor, enemyRoster, index, expressionActors),
      name: actor.definition.displayName,
      authorName: actor.definition.authorName,
      introState: actor.fightScreen?.introState ?? 0,
      fightScreen: actor.fightScreen,
      fightScreenState: (parameter) => runtimeFightScreenStateValue(actor.fightScreen, parameter),
      fightScreenVar: (parameter) => runtimeFightScreenVarValue(actor.fightScreen, parameter),
      gameVar: (parameter) => runtimeGameVarValue(actor.fightScreen, parameter),
      opponentName: selectedP2?.definition.displayName,
      opponentAuthorName: selectedP2?.definition.authorName,
      p3Name: selectedP3?.definition.displayName,
      p4Name: selectedP4?.definition.displayName,
      p5Name: selectedP5?.definition.displayName,
      p6Name: selectedP6?.definition.displayName,
      p7Name: selectedP7?.definition.displayName,
      p8Name: selectedP8?.definition.displayName,
      teamSide: runtimeActorTeamSide(actor),
      opponentTeamSide: selectedP2 ? runtimeActorTeamSide(selectedP2) : undefined,
      stageBounds: input.stageBounds,
      gameSpace: input.gameSpace,
      localCoord: actor.definition.localCoord,
      opponentLocalCoord: selectedP2?.definition.localCoord,
      outputLocalCoord: actor.definition.localCoord,
      sizeBoxX: runtimeExpressionSizeBoxX(actor, includeWidth),
      opponentSizeBoxX: selectedP2 ? runtimeExpressionSizeBoxX(selectedP2, includeWidth) : undefined,
      sizeBoxY: runtimeExpressionSizeBoxY(actor, includeWidth),
      opponentSizeBoxY: selectedP2 ? runtimeExpressionSizeBoxY(selectedP2, includeWidth) : undefined,
      p2BodyDistYUsesSizeBoxes: includeWidth,
      parentLocalCoord: owner.definition.localCoord,
      rootLocalCoord: actor.definition.localCoord,
      parentPlayerId: owner.playerId,
      parentPlayerNo: owner.playerNo,
      rootPlayerId: actor.playerId,
      rootPlayerNo: actor.playerNo,
      target: (targetId) => this.resolveTargetRedirect(actor, input.opponent, targetId, expressionActors),
      playerIdTarget:
        input.playerIdTarget ??
        (input.characters ? (playerId) => this.resolvePlayerIdRedirect(actor, input.characters ?? [], playerId) : undefined),
      stageTime: input.stageTime,
      stateTime: runtimeExpressionStateTime(actor),
      random: input.random,
      animLength: currentAction ? runtimeAnimationLength(currentAction) : undefined,
      animTimeRemaining: input.animTimeRemaining,
      animElemTime: input.animElemTime,
      animElemVar: currentAction
        ? (parameter) => runtimeAnimationElementVar({ currentAction, runtime: actor.runtime }, parameter)
        : undefined,
      animExists: (animationId) => actor.definition.animations.has(animationId),
      activeAnimExists: (animationId) => runtimeActiveAnimExists(actor, owner, expressionActors, animationId),
      stateExists: (stateNo) => runtimeActorHasState(actor, stateNo),
      commandActive: (name) => actor.commandBuffer.isCommandActive(name, actor.definition.commands ?? []),
      getConst: (name) => runtimeDefinitionConst(owner.definition, name),
      getHitVar: (name) => runtimeHitVar(actor.runtime, name, {
        hitPause: actor.hitPause,
        hitStun: actor.hitStun,
        standFriction: actor.definition.constants?.["movement.stand.friction"],
        crouchFriction: actor.definition.constants?.["movement.crouch.friction"],
      }),
      getHitVarAttr: (state, filter) => {
        const sourceAttr = state.hitVars?.sourceAttr;
        return sourceAttr !== undefined && hitAttributeMatches(filter, sourceAttr);
      },
      getHitVarGuardFlag: (state, filter) => {
        const sourceGuardFlag = state.hitVars?.sourceGuardFlag;
        return sourceGuardFlag !== undefined && runtimeGuardFlagOverlaps(filter, sourceGuardFlag);
      },
      getHitVarHitFlag: (state, filter) => {
        const sourceHitFlag = state.hitVars?.sourceHitFlag;
        return sourceHitFlag !== undefined && runtimeHitFlagOverlaps(filter, sourceHitFlag);
      },
      hitDefAttr: (filter) => (actor.currentMove ? hitAttributeMatches(filter, actor.currentMove.attr ?? "S,NA") : false),
      hitCount: () => this.moveHitCountValue(actor, false),
      hitPauseTime: () => actor.hitPause,
      hitShakeOver: () => actor.hitPause <= 0,
      hitOver: () => actor.hitStun <= 0 && (actor.runtime.guardStun ?? 0) <= 0,
      inGuardDist: input.inGuardDist,
      moveContact: () => this.moveContactValue(actor, "contact"),
      moveHit: () => this.moveContactValue(actor, "hit"),
      moveGuarded: () => this.moveContactValue(actor, "guard"),
      moveReversed: () => this.moveReversedValue(actor),
      receivedDamage: () => this.receivedDamageValue(actor),
      receivedHits: () => this.receivedHitsValue(actor),
      numEnemy: () => opponentRoster.length,
      numPartner: () => partnerRoster.length,
      numExplod: (explodId) => this.countEffectActors(actor, "explod", explodId),
      numHelper: (helperId) => this.countEffectActors(actor, "helper", helperId),
      numProj: (projectileId) => this.countEffectActors(actor, "projectile", projectileId),
      numTarget: (targetId) => this.countTargets(actor, targetId),
      projContact: (projectileId) => this.hasProjectileContact(actor, "contact", projectileId),
      projHit: (projectileId) => this.hasProjectileContact(actor, "hit", projectileId),
      projGuarded: (projectileId) => this.hasProjectileContact(actor, "guard", projectileId),
      projContactTime: (projectileId) => this.projectileContactTime(actor, "contact", projectileId),
      projHitTime: (projectileId) => this.projectileContactTime(actor, "hit", projectileId),
      projGuardedTime: (projectileId) => this.projectileContactTime(actor, "guard", projectileId),
      projCancelTime: (projectileId) => this.projectileCancelTime(actor, projectileId),
      uniqueHitCount: () => this.moveHitCountValue(actor, true),
      reportUnsupported: input.reportUnsupported,
      ...(input.teamMode === undefined ? {} : { teamMode: input.teamMode }),
      ...(input.roundDecision === undefined ? {} : { roundDecision: input.roundDecision }),
    };
  }

  evaluateNumber<TActor extends RuntimeExpressionContextActor>(
    expression: string,
    input: RuntimeExpressionContextInput<TActor>,
  ): number | undefined {
    const evaluated = evaluateExpression(expression, this.create(input));
    const numberValue = Number(evaluated);
    return Number.isFinite(numberValue) ? Math.trunc(numberValue) : undefined;
  }

  evaluateTrigger<TActor extends RuntimeExpressionContextActor>(
    trigger: TriggerIr,
    input: RuntimeExpressionContextInput<TActor>,
  ): boolean {
    return evaluateTriggerIr(trigger, this.create(input));
  }

  resolveTargetRedirect<TActor extends RuntimeExpressionContextActor>(
    actor: TActor,
    opponent: TActor,
    targetId?: number,
    characters: readonly TActor[] = [actor, opponent],
  ): ExpressionRedirectTarget | undefined {
    if (!actor.targetWorld.find(actor, opponent.id, targetId)) {
      return undefined;
    }
    const includeWidth = !usesMugenPlayerPushMinimumWidth(actor.definition);
    return {
      ...this.createRedirectTarget(actor, opponent, includeWidth, characters),
    };
  }

  resolvePlayerIdRedirect<TActor extends RuntimeExpressionContextActor>(
    actor: TActor,
    characters: readonly TActor[],
    playerId: number,
  ): ExpressionRedirectTarget | undefined {
    const redirected = characters.find((candidate) => candidate.playerId === playerId);
    if (!redirected) {
      return undefined;
    }
    const includeWidth = !usesMugenPlayerPushMinimumWidth(actor.definition);
    return this.createRedirectTarget(actor, redirected, includeWidth, characters);
  }

  resolveEnemyNearRedirect<TActor extends RuntimeExpressionContextActor>(
    actor: TActor,
    opponents: readonly TActor[],
    index: number,
    characters: readonly TActor[] = [actor, ...opponents],
  ): ExpressionRedirectTarget | undefined {
    const opponent = opponents[index];
    if (!opponent) {
      return undefined;
    }
    const includeWidth = !usesMugenPlayerPushMinimumWidth(actor.definition);
    return {
      ...this.createRedirectTarget(actor, opponent, includeWidth, characters),
    };
  }

  moveContactValue(actor: RuntimeExpressionContextActor, kind: RuntimeContactKind): number {
    return actor.contactWorld.moveContactValue(actor.contact, actor.runtime.stateNo, kind);
  }

  moveHitCountValue(actor: RuntimeExpressionContextActor, unique: boolean): number {
    return actor.contactWorld.moveHitCountValue(actor.contact, actor.runtime.stateNo, unique);
  }

  moveReversedValue(actor: RuntimeExpressionContextActor): number {
    return actor.contactWorld.moveReversedValue(actor.contact, actor.runtime.stateNo);
  }

  receivedDamageValue(actor: RuntimeExpressionContextActor): number {
    return actor.contactWorld.receivedDamageValue(actor.contact, actor.runtime.stateNo);
  }

  receivedHitsValue(actor: RuntimeExpressionContextActor): number {
    return actor.contactWorld.receivedHitsValue(actor.contact, actor.runtime.stateNo);
  }

  hasProjectileContact(actor: RuntimeExpressionContextActor, kind: RuntimeContactKind, projectileId?: number): boolean {
    return actor.contactWorld.hasProjectileContact(actor.contact, actor.runtime.stateNo, kind, projectileId);
  }

  projectileContactTime(actor: RuntimeExpressionContextActor, kind: RuntimeContactKind, projectileId?: number): number {
    return actor.contactWorld.projectileContactTime(actor.contact, actor.runtime.stateNo, kind, projectileId);
  }

  projectileCancelTime(actor: RuntimeExpressionContextActor, projectileId?: number): number {
    return actor.contactWorld.projectileCancelTime(actor.contact, actor.runtime.stateNo, projectileId);
  }

  countTargets(actor: RuntimeExpressionContextActor, targetId?: number): number {
    return actor.targetWorld.count(actor, targetId);
  }

  countEffectActors(actor: RuntimeExpressionContextActor, kind: RuntimeEffectActorCountKind, actorId?: number): number {
    return actor.effectActorWorld.countActors(actor.id, kind, actorId);
  }

  private opponentRoster<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): readonly TActor[] {
    if (input.rootSelection) {
      const byId = new Map(input.characters?.map((actor) => [actor.id, actor]) ?? []);
      return this.opponentSelectionWorld.orderByNearest(
        input.actor,
        input.rootSelection.enemyIds.flatMap((id) => {
          const actor = byId.get(id);
          return actor ? [actor] : [];
        }),
      );
    }
    const opponents = input.opponents ?? [input.opponent];
    return this.opponentSelectionWorld.orderByNearest(input.actor, opponents);
  }

  private enemyRoster<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): readonly TActor[] {
    if (input.rootSelection) {
      return this.actorsForIds(input, input.rootSelection.enemyIds);
    }
    return input.opponents ?? [input.opponent];
  }

  /**
   * P2, P4, P6 and P8 share Ikemen's P2 enemy list. Keep that roster separate
   * from EnemyNear so indexed P2-family reads do not inherit the legacy body
   * order used by EnemyNear.
   */
  private p2Roster<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): readonly TActor[] {
    if (!input.rootSelection) {
      return input.opponents ?? [input.opponent];
    }
    const candidates = this.actorsForIds(input, input.rootSelection.p2CandidateIds);
    return this.opponentSelectionWorld.orderP2ByNearest(input.actor, candidates, input.p2Selection);
  }

  private partnerRoster<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): readonly TActor[] {
    if (!input.rootSelection) {
      return [];
    }
    return this.actorsForIds(input, input.rootSelection.partnerIds);
  }

  private actorsForIds<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>, ids: readonly string[]): readonly TActor[] {
    const byId = new Map(input.characters?.map((actor) => [actor.id, actor]) ?? []);
    return ids.flatMap((id) => {
      const actor = byId.get(id);
      return actor ? [actor] : [];
    });
  }

  private resolveRosterRedirect<TActor extends RuntimeExpressionContextActor>(
    actor: TActor,
    roster: readonly TActor[],
    index: number,
    characters: readonly TActor[] = [actor, ...roster],
  ): ExpressionRedirectTarget | undefined {
    const redirected = roster[index];
    return redirected ? this.createRedirectTarget(actor, redirected, undefined, characters) : undefined;
  }

  private createRedirectTarget<TActor extends RuntimeExpressionContextActor>(
    actor: TActor,
    redirected: TActor,
    includeWidth = !usesMugenPlayerPushMinimumWidth(actor.definition),
    characters: readonly TActor[] = [actor, redirected],
  ): ExpressionRedirectTarget {
    return {
      self: redirected.runtime,
      playerId: redirected.playerId,
      playerNo: redirected.playerNo,
      animPlayerNo: runtimeAnimationPlayerNo(redirected),
      animExists: (animationId) => redirected.definition.animations.has(animationId),
      activeAnimExists: (animationId) => runtimeActiveAnimExists(redirected, actor, characters, animationId),
      opponent: actor.runtime,
      opponentPlayerId: actor.playerId,
      opponentPlayerNo: actor.playerNo,
      opponentAnimPlayerNo: runtimeAnimationPlayerNo(actor),
      clsnVar: runtimeExpressionClsnVar(redirected),
      opponentClsnVar: runtimeExpressionClsnVar(actor),
      clsnOverlap: runtimeExpressionClsnOverlap(redirected, characters),
      opponentClsnOverlap: runtimeExpressionClsnOverlap(actor, characters),
      projClsnOverlap: runtimeExpressionProjClsnOverlap(redirected, characters),
      opponentProjClsnOverlap: runtimeExpressionProjClsnOverlap(actor, characters),
      projVar: runtimeExpressionProjVar(redirected),
      opponentProjVar: runtimeExpressionProjVar(actor),
      projVarFlag: runtimeExpressionProjVarFlag(redirected),
      opponentProjVarFlag: runtimeExpressionProjVarFlag(actor),
      localCoord: redirected.definition.localCoord,
      opponentLocalCoord: actor.definition.localCoord,
      sizeBoxX: runtimeExpressionSizeBoxX(redirected, includeWidth),
      opponentSizeBoxX: runtimeExpressionSizeBoxX(actor, includeWidth),
      sizeBoxY: runtimeExpressionSizeBoxY(redirected, includeWidth),
      opponentSizeBoxY: runtimeExpressionSizeBoxY(actor, includeWidth),
      name: redirected.definition.displayName,
      authorName: redirected.definition.authorName,
      opponentName: actor.definition.displayName,
      opponentAuthorName: actor.definition.authorName,
      teamSide: runtimeActorTeamSide(redirected),
      opponentTeamSide: runtimeActorTeamSide(actor),
    };
  }

}

function runtimeExpressionClsnVar(
  actor: Pick<RuntimeExpressionContextActor, "currentAction" | "definition" | "runtime">,
): ExpressionContext["clsnVar"] {
  if (!actor.currentAction) return undefined;
  return (group, index, coordinate) => runtimeClsnVar({
    runtime: actor.runtime,
    currentAction: actor.currentAction!,
    definition: actor.definition,
  }, group, index, coordinate);
}

function runtimeExpressionClsnOverlap<TActor extends RuntimeExpressionContextActor>(
  actor: TActor,
  characters: readonly TActor[],
): ExpressionContext["clsnOverlap"] {
  if (!actor.currentAction) return undefined;
  return (actorGroup, playerId, targetGroup) => {
    const target = characters.find((candidate) => candidate.playerId === playerId);
    if (!target?.currentAction) return false;
    return runtimeClsnOverlap({
      runtime: actor.runtime,
      currentAction: actor.currentAction!,
      definition: actor.definition,
    }, {
      runtime: target.runtime,
      currentAction: target.currentAction,
      definition: target.definition,
    }, actorGroup, targetGroup);
  };
}

function runtimeExpressionProjClsnOverlap<TActor extends RuntimeExpressionContextActor>(
  actor: TActor,
  characters: readonly TActor[],
): ExpressionContext["projClsnOverlap"] {
  return (index, playerId, targetGroup) => {
    const projectile = actor.effectActorWorld.projectilesOwnedBy?.(actor.id)[index];
    const target = characters.find((candidate) => candidate.playerId === playerId);
    if (!projectile || !target?.currentAction) return false;
    return runtimeProjectileClsnOverlap(projectile, {
      runtime: target.runtime,
      currentAction: target.currentAction,
      definition: target.definition,
    }, targetGroup);
  };
}

function runtimeExpressionProjVar<TActor extends RuntimeExpressionContextActor>(
  actor: TActor,
): ExpressionContext["projVar"] {
  return (projectileId, index, parameter, outputLocalCoord) => {
    const projectile = runtimeExpressionOwnedProjectile(actor, projectileId, index);
    return projectile ? runtimeProjectileVar(projectile, parameter, outputLocalCoord) : undefined;
  };
}

function runtimeExpressionProjVarFlag<TActor extends RuntimeExpressionContextActor>(
  actor: TActor,
): ExpressionContext["projVarFlag"] {
  return (projectileId, index, parameter, filter, operator) => {
    const projectile = runtimeExpressionOwnedProjectile(actor, projectileId, index);
    if (!projectile) return false;
    if (parameter === "attr") {
      return projectile.attr !== undefined && runtimeHitAttributeComparison(filter, projectile.attr, operator);
    }
    if (parameter === "guardflag") {
      return projectile.guardFlag !== undefined && runtimeGuardFlagComparison(filter, projectile.guardFlag, operator);
    }
    return projectile.hitFlag !== undefined && runtimeHitFlagComparison(filter, projectile.hitFlag, operator);
  };
}

function runtimeExpressionOwnedProjectile<TActor extends RuntimeExpressionContextActor>(
  actor: TActor,
  projectileId: number,
  index: number,
) {
  return actor.effectActorWorld.projectilesOwnedBy?.(
    actor.id,
    projectileId < 0 ? undefined : projectileId,
  )[index];
}

function runtimeExpressionStateTime(actor: Pick<RuntimeExpressionContextActor, "runtime" | "stateElapsed">): number {
  const elapsed = Number.isFinite(actor.stateElapsed) ? actor.stateElapsed : actor.runtime.animTime;
  return Math.max(0, Math.trunc(Number.isFinite(elapsed) ? elapsed : 0));
}

function runtimeExpressionSizeBoxX(
  actor: Pick<RuntimeExpressionContextActor, "definition" | "runtime">,
  includeWidth: boolean,
): { x1: number; x2: number } | null {
  const stateType = actor.runtime.stateType === "C" || actor.runtime.stateType === "A" || actor.runtime.stateType === "L"
    ? actor.runtime.stateType
    : "S";
  const box = resolveRuntimePushSizeBox(actor.definition.constants, stateType);
  const projected = runtimeCurrentSizeBox(actor.runtime, box, { includeHeight: false, includeWidth });
  return projected ? { x1: projected.x1, x2: projected.x2 } : null;
}

function runtimeExpressionSizeBoxY(
  actor: Pick<RuntimeExpressionContextActor, "definition" | "runtime">,
  includeHeight: boolean,
): { y1: number; y2: number } | null {
  const stateType = actor.runtime.stateType === "C" || actor.runtime.stateType === "A" || actor.runtime.stateType === "L"
    ? actor.runtime.stateType
    : "S";
  const box = resolveRuntimePushSizeBox(actor.definition.constants, stateType);
  const projected = runtimeCurrentSizeBox(actor.runtime, box, { includeHeight, includeWidth: false });
  return projected ? { y1: projected.y1, y2: projected.y2 } : null;
}

function runtimeActiveAnimExists(
  actor: RuntimeExpressionContextActor,
  owner: RuntimeExpressionContextActor,
  characters: readonly RuntimeExpressionContextActor[],
  animationId: number,
): boolean {
  const playerNo = runtimeAnimationPlayerNo(actor);
  const tableOwner =
    playerNo !== undefined && Number.isFinite(playerNo)
      ? characters.find((candidate) => candidate.playerNo === playerNo)
      : undefined;
  const fallback = actor.runtime.animationSource === "state-owner" ? owner : actor;
  return (tableOwner ?? fallback).definition.animations.has(animationId);
}

export function runtimeActorHasState(actor: Pick<RuntimeExpressionContextActor, "runtimeProgram" | "definition">, stateNo: number): boolean {
  const id = Math.trunc(stateNo);
  return (
    actor.runtimeProgram?.states.some((state) => state.id === id && state.special === undefined) ??
    actor.definition.states?.some((state) => state.id === id && state.special === undefined) ??
    false
  );
}

export function runtimeActorTeamSide(actor: Pick<RuntimeExpressionContextActor, "id">): number {
  return runtimeTeamSide(actor) ?? 0;
}

export function runtimeDefinitionConst(definition: Pick<RuntimeExpressionContextDefinition, "constants">, name: string): number | undefined {
  return definition.constants?.[name.trim().toLowerCase()];
}

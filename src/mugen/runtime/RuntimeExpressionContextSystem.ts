import type { TriggerIr } from "../compiler/RuntimeIr";
import type { MugenCommand } from "../model/MugenCommand";
import { hitAttributeMatches } from "./CombatResolver";
import type { CommandBuffer } from "./CommandBuffer";
import type { RuntimeContactKind, RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { RuntimeEffectActorCountKind, RuntimeEffectActorWorld } from "./EffectActorSystem";
import { evaluateExpression, type ExpressionContext, type ExpressionGameSpace, type ExpressionRedirectTarget } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import { RuntimeOpponentSelectionWorld } from "./RuntimeOpponentSelectionSystem";
import type { RuntimeRootSelectionEntry } from "./RuntimeRootSelectionSystem";
import { runtimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTargetWorld, RuntimeTargetWorldActor } from "./TargetSystem";
import { evaluateTriggerIr } from "./TriggerEvaluator";

export { runtimeHitVar, type RuntimeHitVarTiming } from "./RuntimeHitVarSystem";

export type RuntimeExpressionContextDefinition = {
  displayName: string;
  authorName?: string;
  localCoord?: [number, number];
  constants?: Record<string, number>;
  commands?: MugenCommand[];
  animations: Pick<Map<number, unknown>, "has">;
  states?: readonly { id: number }[];
};

export type RuntimeExpressionContextActor = RuntimeTargetWorldActor & {
  definition: RuntimeExpressionContextDefinition;
  runtimeProgram?: { states: readonly { id: number }[] };
  commandBuffer: Pick<CommandBuffer, "isCommandActive">;
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
  effectActorWorld: Pick<RuntimeEffectActorWorld, "countActors">;
};

export type RuntimeExpressionContextInput<TActor extends RuntimeExpressionContextActor> = {
  actor: TActor;
  opponent: TActor;
  opponents?: readonly TActor[];
  characters?: readonly TActor[];
  rootSelection?: RuntimeRootSelectionEntry;
  owner?: TActor;
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
  stageTime?: number;
  random?: () => number;
  animTimeRemaining?: number;
  animElemTime?: (elementNumber: number) => number | undefined;
  inGuardDist?: () => boolean;
  reportUnsupported?: (feature: string) => void;
};

export class RuntimeExpressionContextWorld {
  constructor(private readonly opponentSelectionWorld = new RuntimeOpponentSelectionWorld()) {}

  create<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): ExpressionContext {
    const { actor } = input;
    const owner = input.owner ?? actor;
    const opponentRoster = this.opponentRoster(input);
    const selectedP2 = this.selectedP2(input);

    return {
      self: actor.runtime,
      opponent: selectedP2?.runtime,
      enemyNear: (index) => this.resolveEnemyNearRedirect(actor, opponentRoster, index),
      enemyNearFallbackToOpponent: input.rootSelection ? false : undefined,
      name: actor.definition.displayName,
      authorName: actor.definition.authorName,
      opponentName: selectedP2?.definition.displayName,
      opponentAuthorName: selectedP2?.definition.authorName,
      teamSide: runtimeActorTeamSide(actor),
      opponentTeamSide: selectedP2 ? runtimeActorTeamSide(selectedP2) : undefined,
      stageBounds: input.stageBounds,
      gameSpace: input.gameSpace,
      localCoord: actor.definition.localCoord,
      opponentLocalCoord: selectedP2?.definition.localCoord,
      parentLocalCoord: owner.definition.localCoord,
      rootLocalCoord: actor.definition.localCoord,
      target: (targetId) => this.resolveTargetRedirect(actor, input.opponent, targetId),
      stageTime: input.stageTime,
      stateTime: runtimeExpressionStateTime(actor),
      random: input.random,
      animTimeRemaining: input.animTimeRemaining,
      animElemTime: input.animElemTime,
      animExists: (animationId) => actor.definition.animations.has(animationId),
      stateExists: (stateNo) => runtimeActorHasState(actor, stateNo),
      commandActive: (name) => actor.commandBuffer.isCommandActive(name, actor.definition.commands ?? []),
      getConst: (name) => runtimeDefinitionConst(owner.definition, name),
      getHitVar: (name) => runtimeHitVar(actor.runtime, name, { hitPause: actor.hitPause, hitStun: actor.hitStun }),
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
  ): ExpressionRedirectTarget | undefined {
    if (!actor.targetWorld.find(actor, opponent.id, targetId)) {
      return undefined;
    }
    return {
      self: opponent.runtime,
      opponent: actor.runtime,
      localCoord: opponent.definition.localCoord,
      opponentLocalCoord: actor.definition.localCoord,
      name: opponent.definition.displayName,
      authorName: opponent.definition.authorName,
      opponentName: actor.definition.displayName,
      opponentAuthorName: actor.definition.authorName,
      teamSide: runtimeActorTeamSide(opponent),
      opponentTeamSide: runtimeActorTeamSide(actor),
    };
  }

  resolveEnemyNearRedirect<TActor extends RuntimeExpressionContextActor>(
    actor: TActor,
    opponents: readonly TActor[],
    index: number,
  ): ExpressionRedirectTarget | undefined {
    const opponent = opponents[index];
    if (!opponent) {
      return undefined;
    }
    return {
      self: opponent.runtime,
      opponent: actor.runtime,
      localCoord: opponent.definition.localCoord,
      opponentLocalCoord: actor.definition.localCoord,
      name: opponent.definition.displayName,
      authorName: opponent.definition.authorName,
      opponentName: actor.definition.displayName,
      opponentAuthorName: actor.definition.authorName,
      teamSide: runtimeActorTeamSide(opponent),
      opponentTeamSide: runtimeActorTeamSide(actor),
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

  private selectedP2<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): TActor | undefined {
    if (!input.rootSelection) {
      return input.opponent;
    }
    const byId = new Map(input.characters?.map((actor) => [actor.id, actor]) ?? []);
    return input.rootSelection.p2CandidateIds.flatMap((id) => {
      const actor = byId.get(id);
      return actor ? [actor] : [];
    })[0];
  }
}

function runtimeExpressionStateTime(actor: Pick<RuntimeExpressionContextActor, "runtime" | "stateElapsed">): number {
  const elapsed = Number.isFinite(actor.stateElapsed) ? actor.stateElapsed : actor.runtime.animTime;
  return Math.max(0, Math.trunc(Number.isFinite(elapsed) ? elapsed : 0));
}

export function runtimeActorHasState(actor: Pick<RuntimeExpressionContextActor, "runtimeProgram" | "definition">, stateNo: number): boolean {
  const id = Math.trunc(stateNo);
  return (
    actor.runtimeProgram?.states.some((state) => state.id === id) ??
    actor.definition.states?.some((state) => state.id === id) ??
    false
  );
}

export function runtimeActorTeamSide(actor: Pick<RuntimeExpressionContextActor, "id">): number {
  return runtimeTeamSide(actor) ?? 0;
}

export function runtimeDefinitionConst(definition: Pick<RuntimeExpressionContextDefinition, "constants">, name: string): number | undefined {
  return definition.constants?.[name.trim().toLowerCase()];
}

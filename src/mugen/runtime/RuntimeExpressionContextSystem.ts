import type { TriggerIr } from "../compiler/RuntimeIr";
import type { MugenCommand } from "../model/MugenCommand";
import { hitAttributeMatches } from "./CombatResolver";
import type { CommandBuffer } from "./CommandBuffer";
import type { RuntimeContactKind, RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { RuntimeEffectActorCountKind, RuntimeEffectActorWorld } from "./EffectActorSystem";
import { evaluateExpression, type ExpressionContext, type ExpressionRedirectTarget } from "./ExpressionEvaluator";
import type { RuntimeTargetWorld, RuntimeTargetWorldActor } from "./TargetSystem";
import { evaluateTriggerIr } from "./TriggerEvaluator";
import type { CharacterRuntimeState } from "./types";

export type RuntimeExpressionContextDefinition = {
  displayName: string;
  authorName?: string;
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
  >;
  targetWorld: Pick<RuntimeTargetWorld, "count" | "find">;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "countActors">;
};

export type RuntimeExpressionContextInput<TActor extends RuntimeExpressionContextActor> = {
  actor: TActor;
  opponent: TActor;
  owner?: TActor;
  stageTime?: number;
  random?: () => number;
  animTimeRemaining?: number;
  animElemTime?: (elementNumber: number) => number | undefined;
  inGuardDist?: () => boolean;
  reportUnsupported?: (feature: string) => void;
};

export class RuntimeExpressionContextWorld {
  create<TActor extends RuntimeExpressionContextActor>(input: RuntimeExpressionContextInput<TActor>): ExpressionContext {
    const { actor, opponent } = input;
    const owner = input.owner ?? actor;

    return {
      self: actor.runtime,
      opponent: opponent.runtime,
      name: actor.definition.displayName,
      authorName: actor.definition.authorName,
      opponentName: opponent.definition.displayName,
      opponentAuthorName: opponent.definition.authorName,
      target: (targetId) => this.resolveTargetRedirect(actor, opponent, targetId),
      stageTime: input.stageTime,
      stateTime: actor.stateElapsed,
      random: input.random,
      animTimeRemaining: input.animTimeRemaining,
      animElemTime: input.animElemTime,
      animExists: (animationId) => actor.definition.animations.has(animationId),
      stateExists: (stateNo) => runtimeActorHasState(actor, stateNo),
      commandActive: (name) => actor.commandBuffer.isCommandActive(name, actor.definition.commands ?? []),
      getConst: (name) => runtimeDefinitionConst(owner.definition, name),
      getHitVar: (name) => runtimeHitVar(actor.runtime, name),
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
      name: opponent.definition.displayName,
      authorName: opponent.definition.authorName,
      opponentName: actor.definition.displayName,
      opponentAuthorName: actor.definition.authorName,
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

  countTargets(actor: RuntimeExpressionContextActor, targetId?: number): number {
    return actor.targetWorld.count(actor, targetId);
  }

  countEffectActors(actor: RuntimeExpressionContextActor, kind: RuntimeEffectActorCountKind, actorId?: number): number {
    return actor.effectActorWorld.countActors(actor.id, kind, actorId);
  }
}

export function runtimeActorHasState(actor: Pick<RuntimeExpressionContextActor, "runtimeProgram" | "definition">, stateNo: number): boolean {
  const id = Math.trunc(stateNo);
  return (
    actor.runtimeProgram?.states.some((state) => state.id === id) ??
    actor.definition.states?.some((state) => state.id === id) ??
    false
  );
}

export function runtimeDefinitionConst(definition: Pick<RuntimeExpressionContextDefinition, "constants">, name: string): number | undefined {
  return definition.constants?.[name.trim().toLowerCase()];
}

export function runtimeHitVar(state: CharacterRuntimeState, name: string): number | undefined {
  const key = name.trim().toLowerCase();
  if (key === "animtype") {
    return state.hitVars?.animType ?? 0;
  }
  if (key === "groundtype") {
    return state.hitVars?.groundType ?? 0;
  }
  if (key === "airtype") {
    return state.hitVars?.airType ?? 0;
  }
  if (key === "isbound") {
    return state.hitVars?.isBound ? 1 : 0;
  }
  if (key === "fall") {
    return state.hitFall?.falling ? 1 : 0;
  }
  if (key === "fall.damage") {
    return state.hitFall?.damage ?? 0;
  }
  if (key === "fall.defence_up") {
    return state.hitFall?.defenceUp ?? 100;
  }
  if (key === "fall.kill") {
    return state.hitFall?.kill === false ? 0 : 1;
  }
  if (key === "fall.xvel" || key === "fall.xvelocity") {
    return state.hitFall?.velocity.x ?? 0;
  }
  if (key === "fall.yvel" || key === "fall.yvelocity") {
    return state.hitFall?.velocity.y ?? 0;
  }
  if (key === "fall.recover") {
    return state.hitFall?.recover && (state.hitFall.recoverTime ?? 0) <= 0 ? 1 : 0;
  }
  if (key === "fall.recovertime") {
    return state.hitFall?.recoverTime ?? 0;
  }
  if (key === "down.recover") {
    return state.hitFall?.downRecover === false ? 0 : 1;
  }
  if (key === "recovertime" || key === "down.recovertime") {
    return state.hitFall?.downRecoverTime ?? 0;
  }
  if (key === "fall.envshake.time") {
    return state.hitFall?.envShake?.time ?? 0;
  }
  if (key === "fall.envshake.freq") {
    return state.hitFall?.envShake?.freq ?? 60;
  }
  if (key === "fall.envshake.ampl") {
    return state.hitFall?.envShake?.ampl ?? 0;
  }
  if (key === "fall.envshake.phase") {
    return state.hitFall?.envShake?.phase ?? 0;
  }
  if (key === "xvel") {
    return state.hitVelocity?.x ?? 0;
  }
  if (key === "yvel") {
    return state.hitVelocity?.y ?? 0;
  }
  if (key === "hittime") {
    return state.guardStun ?? 0;
  }
  if (key === "slidetime") {
    return state.guardSlideTime ?? 0;
  }
  if (key === "ctrltime") {
    return state.guardControlTime ?? 0;
  }
  if (key === "yaccel") {
    return 0.44;
  }
  return undefined;
}

import type { CollisionBox } from "../model/CollisionBox";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { markRuntimeEffectActorGotHit } from "./EffectLifecycleSystem";
import {
  applyRuntimeDamage,
  canRuntimeDamageKill,
  type RuntimeCombatHitResult,
} from "./CombatResolver";
import { applyRuntimeCornerPush, type RuntimeStageBounds } from "./HitDefCornerPush";
import {
  RuntimeContactMemoryWorld,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
import { applyRuntimeControl, applyRuntimePowerDelta } from "./RuntimeResourceSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeDirectCombatActor = {
  id: string;
  label: string;
  definition: Pick<DemoFighterDefinition, "constants">;
  runtime: CharacterRuntimeState;
  currentMove?: DemoMove;
  currentMoveLabel?: string;
  moveTick: number;
  hitStun: number;
  hitPause: number;
  hasHit: boolean;
  contact: RuntimeContactMemory;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit">;
};

export type RuntimeDirectCombatHooks<TActor extends RuntimeDirectCombatActor = RuntimeDirectCombatActor> = {
  applyGuardHit: (defender: TActor) => void;
  applyHitStateTransitions: (attacker: TActor, defender: TActor, move: DemoMove) => void;
  applyDefaultGetHit: (defender: TActor, move: DemoMove) => void;
};

export type RuntimeDirectCombatOutcome = {
  kind: RuntimeCombatHitResult["kind"];
  damage: number;
  message: string;
};

export type RuntimeDirectCombatOptions = {
  stageBounds?: RuntimeStageBounds;
};

export type RuntimeDirectPriorityHooks = {
  isMoveActive: (move: DemoMove, tick: number) => boolean;
  worldBox: (state: CharacterRuntimeState, box: CollisionBox) => CollisionBox;
  boxesIntersect: (left: CollisionBox, right: CollisionBox) => boolean;
};

export type RuntimeDirectPriorityOutcome = {
  kind: "trade" | "win";
  winnerId?: string;
  loserId?: string;
  message: string;
};

export class RuntimeDirectCombatWorld {
  constructor(private readonly contactWorld: RuntimeContactMemoryWorld = new RuntimeContactMemoryWorld()) {}

  resolvePriorityClash<TActor extends RuntimeDirectCombatActor>(
    left: TActor,
    right: TActor,
    hooks: RuntimeDirectPriorityHooks,
  ): RuntimeDirectPriorityOutcome | undefined {
    const leftMove = getActiveDirectHitDefMove(left, hooks);
    const rightMove = getActiveDirectHitDefMove(right, hooks);
    if (!leftMove || !rightMove) {
      return undefined;
    }
    const leftBox = hooks.worldBox(left.runtime, leftMove.hitbox);
    const rightBox = hooks.worldBox(right.runtime, rightMove.hitbox);
    if (!hooks.boxesIntersect(leftBox, rightBox)) {
      return undefined;
    }
    const leftPriority = clampHitDefPriority(leftMove.priority ?? 4);
    const rightPriority = clampHitDefPriority(rightMove.priority ?? 4);
    if (leftPriority === rightPriority) {
      left.hasHit = true;
      right.hasHit = true;
      return {
        kind: "trade",
        message: `HitDef priority clash: ${left.label} priority ${leftPriority} traded with ${right.label} priority ${rightPriority}`,
      };
    }
    const winner = leftPriority > rightPriority ? left : right;
    const loser = winner === left ? right : left;
    winner.hasHit = false;
    loser.hasHit = true;
    return {
      kind: "win",
      winnerId: winner.id,
      loserId: loser.id,
      message: `HitDef priority clash: ${winner.label} priority ${Math.max(leftPriority, rightPriority)} beat ${loser.label} priority ${Math.min(leftPriority, rightPriority)}`,
    };
  }

  applyResolvedHit<TActor extends RuntimeDirectCombatActor>(
    attacker: TActor,
    defender: TActor,
    move: DemoMove,
    result: RuntimeCombatHitResult,
    hooks: RuntimeDirectCombatHooks<TActor>,
    options: RuntimeDirectCombatOptions = {},
  ): RuntimeDirectCombatOutcome {
    attacker.hasHit = true;
    if (result.kind === "guard") {
      return this.applyGuard(attacker, defender, move, result, hooks, options);
    }
    return this.applyHit(attacker, defender, move, result, hooks, options);
  }

  private applyGuard<TActor extends RuntimeDirectCombatActor>(
    attacker: TActor,
    defender: TActor,
    move: DemoMove,
    result: Extract<RuntimeCombatHitResult, { kind: "guard" }>,
    hooks: RuntimeDirectCombatHooks<TActor>,
    options: RuntimeDirectCombatOptions,
  ): RuntimeDirectCombatOutcome {
    this.contactWorld.markMoveContact(attacker.contact, attacker.runtime.stateNo, "guard", defender.id);
    interruptCurrentMove(defender);
    attacker.hitPause = result.pause;
    defender.hitPause = result.pause;
    defender.runtime.guardStun = result.stun;
    defender.runtime.guardSlideTime = result.slideTime ?? 0;
    defender.runtime.guardControlTime = result.controlTime ?? 0;
    defender.runtime.guarding = true;
    defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
    defender.runtime.vel.x = attacker.runtime.facing * result.push;
    defender.runtime.hitVelocity = { x: attacker.runtime.facing * result.push, y: result.hitVelocityY ?? 0 };
    applyRuntimeCornerPush(attacker.runtime, defender.runtime, options.stageBounds, result.cornerPush, result.push);
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move, {
      guarded: true,
      damage: result.damage,
      hitShakeTime: result.pause,
      hitTime: result.stun,
    });
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    markRuntimeEffectActorGotHit(defender);
    applyRuntimeControl(defender.runtime, false);
    applyRuntimePowerDelta(attacker.runtime, result.powerGain, attacker.definition.constants);
    hooks.applyGuardHit(defender);
    return {
      kind: "guard",
      damage: result.damage,
      message: `${defender.label} guarded ${attacker.label} for ${result.damage}`,
    };
  }

  private applyHit<TActor extends RuntimeDirectCombatActor>(
    attacker: TActor,
    defender: TActor,
    move: DemoMove,
    result: Extract<RuntimeCombatHitResult, { kind: "hit" }>,
    hooks: RuntimeDirectCombatHooks<TActor>,
    options: RuntimeDirectCombatOptions,
  ): RuntimeDirectCombatOutcome {
    this.contactWorld.markMoveContact(attacker.contact, attacker.runtime.stateNo, "hit", defender.id);
    attacker.hitPause = result.pause;
    interruptCurrentMove(defender);
    defender.hitPause = result.pause;
    defender.hitStun = result.stun;
    defender.runtime.guardStun = 0;
    defender.runtime.guardSlideTime = 0;
    defender.runtime.guardControlTime = 0;
    defender.runtime.guarding = false;
    defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
    defender.runtime.vel.x = attacker.runtime.facing * result.push;
    defender.runtime.hitVelocity = { x: attacker.runtime.facing * result.push, y: result.hitVelocityY ?? 0 };
    applyRuntimeCornerPush(attacker.runtime, defender.runtime, options.stageBounds, result.cornerPush, result.push);
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move, {
      damage: result.damage,
      hitShakeTime: result.pause,
      hitTime: result.stun,
    });
    defender.runtime.hitFall = runtimeHitFallFromMove(move, attacker.runtime.facing);
    applyHitSnap(attacker, defender, move);
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    markRuntimeEffectActorGotHit(defender);
    applyRuntimePowerDelta(attacker.runtime, result.powerGain, attacker.definition.constants);
    hooks.applyHitStateTransitions(attacker, defender, move);
    hooks.applyDefaultGetHit(defender, move);
    this.contactWorld.markReceivedDamage(defender.contact, defender.runtime.stateNo, result.damage);
    return {
      kind: "hit",
      damage: result.damage,
      message: `${attacker.label} hit ${defender.label} for ${result.damage}`,
    };
  }
}

function getActiveDirectHitDefMove(actor: RuntimeDirectCombatActor, hooks: Pick<RuntimeDirectPriorityHooks, "isMoveActive">): DemoMove | undefined {
  const move = actor.currentMove;
  if (!move || actor.hasHit || move.requiresHitDef || move.isReversal || !hooks.isMoveActive(move, actor.moveTick)) {
    return undefined;
  }
  return move;
}

function interruptCurrentMove(actor: RuntimeDirectCombatActor): void {
  actor.currentMove = undefined;
  actor.currentMoveLabel = undefined;
  actor.moveTick = 0;
  actor.hasHit = false;
}

function runtimeGetHitVarsFromMove(
  move: DemoMove,
  timing: { guarded?: boolean; damage: number; hitShakeTime: number; hitTime: number },
): CharacterRuntimeState["hitVars"] {
  return {
    damage: Math.max(0, Math.round(timing.damage)),
    kill: timing.guarded ? (move.guardKill ?? true) : (move.kill ?? true),
    ...(move.hitVars?.hitId !== undefined ? { hitId: move.hitVars.hitId } : {}),
    ...(move.hitVars?.chainId !== undefined ? { chainId: move.hitVars.chainId } : {}),
    ...(move.hitVars?.hitCount !== undefined ? { hitCount: move.hitVars.hitCount } : {}),
    ...(move.hitVars?.hitOffset !== undefined
      ? {
          hitOffset: {
            x: move.hitVars.hitOffset.x,
            ...(move.hitVars.hitOffset.y !== undefined ? { y: move.hitVars.hitOffset.y } : {}),
            ...(move.hitVars.hitOffset.z !== undefined ? { z: move.hitVars.hitOffset.z } : {}),
          },
        }
      : {}),
    animType: move.hitVars?.animType ?? 0,
    groundType: move.hitVars?.groundType ?? 1,
    airType: move.hitVars?.airType ?? move.hitVars?.groundType ?? 1,
    isBound: false,
    hitShakeTime: timing.hitShakeTime,
    hitTime: timing.hitTime,
    ...(move.hitVars?.yAccel !== undefined ? { yAccel: move.hitVars.yAccel } : {}),
    ...(timing.guarded ? { guarded: true } : {}),
  };
}

function applyHitSnap<TActor extends RuntimeDirectCombatActor>(attacker: TActor, defender: TActor, move: DemoMove): void {
  const snap = move.hitVars?.hitOffset;
  if (!snap) {
    return;
  }
  defender.runtime.pos.x = attacker.runtime.pos.x + attacker.runtime.facing * snap.x;
  if (snap.y !== undefined) {
    defender.runtime.pos.y = attacker.runtime.pos.y + snap.y;
  }
}

function runtimeHitFallFromMove(move: DemoMove, attackerFacing: 1 | -1): CharacterRuntimeState["hitFall"] | undefined {
  const fall = move.fall;
  if (!fall) {
    return undefined;
  }
  const xVelocity = fall.velocity?.x;
  return {
    falling: fall.enabled,
    damage: Math.max(0, fall.damage ?? 0),
    defenceUp: fall.defenceUp,
    kill: fall.kill,
    recover: fall.recover,
    recoverTime: fall.recoverTime,
    downRecover: fall.downRecover ?? true,
    downRecoverTime: fall.downRecoverTime,
    velocity: {
      x: xVelocity !== undefined ? attackerFacing * Math.abs(xVelocity) : undefined,
      y: fall.velocity?.y ?? move.hitVelocityY ?? -4.5,
    },
    envShake: fall.envShake,
  };
}

function clampHitDefPriority(value: number): number {
  if (!Number.isFinite(value)) {
    return 4;
  }
  return Math.max(1, Math.min(7, Math.round(value)));
}

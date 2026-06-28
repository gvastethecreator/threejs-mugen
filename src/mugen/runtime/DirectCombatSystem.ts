import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import {
  applyRuntimeDamage,
  canRuntimeDamageKill,
  type RuntimeCombatHitResult,
} from "./CombatResolver";
import {
  markRuntimeMoveContact,
  markRuntimeReceivedDamage,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
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

export class RuntimeDirectCombatWorld {
  applyResolvedHit<TActor extends RuntimeDirectCombatActor>(
    attacker: TActor,
    defender: TActor,
    move: DemoMove,
    result: RuntimeCombatHitResult,
    hooks: RuntimeDirectCombatHooks<TActor>,
  ): RuntimeDirectCombatOutcome {
    attacker.hasHit = true;
    if (result.kind === "guard") {
      return this.applyGuard(attacker, defender, move, result, hooks);
    }
    return this.applyHit(attacker, defender, move, result, hooks);
  }

  private applyGuard<TActor extends RuntimeDirectCombatActor>(
    attacker: TActor,
    defender: TActor,
    move: DemoMove,
    result: Extract<RuntimeCombatHitResult, { kind: "guard" }>,
    hooks: RuntimeDirectCombatHooks<TActor>,
  ): RuntimeDirectCombatOutcome {
    markRuntimeMoveContact(attacker.contact, attacker.runtime.stateNo, "guard", defender.id);
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
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move);
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    markActorGotHit(defender);
    defender.runtime.ctrl = false;
    attacker.runtime.power = Math.min(runtimePowerMax(attacker), attacker.runtime.power + result.powerGain);
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
  ): RuntimeDirectCombatOutcome {
    markRuntimeMoveContact(attacker.contact, attacker.runtime.stateNo, "hit", defender.id);
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
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move);
    defender.runtime.hitFall = runtimeHitFallFromMove(move, attacker.runtime.facing);
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    markActorGotHit(defender);
    attacker.runtime.power = Math.min(runtimePowerMax(attacker), attacker.runtime.power + result.powerGain);
    hooks.applyHitStateTransitions(attacker, defender, move);
    hooks.applyDefaultGetHit(defender, move);
    markRuntimeReceivedDamage(defender.contact, defender.runtime.stateNo, result.damage);
    return {
      kind: "hit",
      damage: result.damage,
      message: `${attacker.label} hit ${defender.label} for ${result.damage}`,
    };
  }
}

function interruptCurrentMove(actor: RuntimeDirectCombatActor): void {
  actor.currentMove = undefined;
  actor.currentMoveLabel = undefined;
  actor.moveTick = 0;
  actor.hasHit = false;
}

function markActorGotHit(actor: RuntimeDirectCombatActor): void {
  actor.runtime.moveType = "H";
  actor.effectActorWorld.removeExplodsOnGetHit(actor.id);
}

function runtimeGetHitVarsFromMove(move: DemoMove): CharacterRuntimeState["hitVars"] {
  return {
    animType: move.hitVars?.animType ?? 0,
    groundType: move.hitVars?.groundType ?? 1,
    airType: move.hitVars?.airType ?? move.hitVars?.groundType ?? 1,
    isBound: false,
  };
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

function runtimePowerMax(actor: RuntimeDirectCombatActor): number {
  return boundedRuntimeResourceMax(actor.runtime.powerMax ?? actor.definition.constants?.["data.power"], 3000);
}

function boundedRuntimeResourceMax(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.round(value));
}

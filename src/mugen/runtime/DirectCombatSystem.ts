import type { CollisionBox } from "../model/CollisionBox";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { markRuntimeEffectActorGotHit } from "./EffectLifecycleSystem";
import {
  applyRuntimeDamage,
  canRuntimeDamageKill,
  resolveRuntimeFallEnabled,
  resolveRuntimeFallYVelocityDefaults,
  resolveRuntimeFallRecoveryDefaults,
  type RuntimeCombatHitResult,
} from "./CombatResolver";
import { applyRuntimeCornerPush, type RuntimeStageBounds } from "./HitDefCornerPush";
import { normalizeRuntimeHitDefPriority } from "./HitDefContactPriority";
import type { RuntimeHitDefPriorityProfile } from "./HitDefPriorityPolicy";
import { applyRuntimeHitDefSpritePriorityContact } from "./HitDefSpritePrioritySystem";
import {
  RuntimeContactMemoryWorld,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
import { applyRuntimeControl, applyRuntimeDizzyPointsAdd, applyRuntimeGuardPointsAdd, applyRuntimePowerDelta, applyRuntimeRedLifeAdd } from "./RuntimeResourceSystem";
import type { CharacterRuntimeState } from "./types";
import {
  recordRuntimeRoundWinType,
  runtimeRoundHitSourceMetadata,
} from "./RuntimeRoundWinTypeSystem";
import { runtimeCombatDepthFromConstants } from "./RuntimeCombatDepthSystem";
import {
  bufferRuntimeHitDefTarget,
  type RuntimeHitDefContactMemoryActor,
} from "./RuntimeHitDefContactMemorySystem";

export type RuntimeDirectCombatActor = {
  id: string;
  playerNo?: number;
  rootId?: string;
  rootOwned?: boolean;
  effectOwnerId?: string;
  label: string;
  definition: Pick<DemoFighterDefinition, "constants" | "hitDefPriorityProfile" | "localCoord">;
  runtime: CharacterRuntimeState;
  currentMove?: DemoMove;
  currentMoveLabel?: string;
  moveTick: number;
  hitStun: number;
  hitPause: number;
  hasHit: boolean;
  hitDefTargets?: RuntimeHitDefContactMemoryActor["hitDefTargets"];
  pendingHitDefTargets?: RuntimeHitDefContactMemoryActor["pendingHitDefTargets"];
  contact: RuntimeContactMemory;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit">;
};

export type RuntimeDirectCombatHooks<TActor extends RuntimeDirectCombatActor = RuntimeDirectCombatActor> = {
  applyGuardHit: (defender: TActor) => void;
  applyHitStateTransitions: (attacker: TActor, defender: TActor, move: DemoMove) => void;
  applyDefaultGetHit: (defender: TActor, move: DemoMove) => void;
  applyDizzyState?: (defender: TActor, move: DemoMove) => void;
};

export type RuntimeDirectCombatOutcome = {
  kind: RuntimeCombatHitResult["kind"];
  damage: number;
  message: string;
};

export type RuntimeDirectCombatOptions = {
  stageBounds?: RuntimeStageBounds;
  hitDefPriorityProfile?: RuntimeHitDefPriorityProfile;
  preserveDefenderMove?: boolean;
};

export type RuntimeDirectPriorityHooks = {
  isMoveActive: (move: DemoMove, tick: number) => boolean;
  worldBox: (state: CharacterRuntimeState, box: CollisionBox) => CollisionBox;
  boxesIntersect: (left: CollisionBox, right: CollisionBox) => boolean;
  collisionBoxes?: (actor: RuntimeDirectCombatActor, move: DemoMove, opponent: RuntimeDirectCombatActor) => CollisionBox[] | undefined;
  contact?: (
    left: RuntimeDirectCombatActor,
    leftMove: DemoMove,
    right: RuntimeDirectCombatActor,
    rightMove: DemoMove,
  ) => boolean;
};

export type RuntimeDirectPriorityOutcome = {
  kind: "trade" | "win" | "tie-win" | "no-hit";
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
    const leftBoxes = hooks.collisionBoxes?.(left, leftMove, right) ?? [leftMove.hitbox];
    const rightBoxes = hooks.collisionBoxes?.(right, rightMove, left) ?? [rightMove.hitbox];
    const contact = hooks.contact?.(left, leftMove, right, rightMove) ?? leftBoxes.some((leftBox) =>
      rightBoxes.some((rightBox) => hooks.boxesIntersect(
        hooks.worldBox(left.runtime, leftBox),
        hooks.worldBox(right.runtime, rightBox),
      )),
    );
    if (!contact) {
      return undefined;
    }
    const leftPriority = normalizeRuntimeHitDefPriority(leftMove.priority);
    const rightPriority = normalizeRuntimeHitDefPriority(rightMove.priority);
    if (leftPriority === rightPriority) {
      const leftType = leftMove.priorityType ?? "hit";
      const rightType = rightMove.priorityType ?? "hit";
      if (leftType === "hit" && rightType === "hit") {
        return {
          kind: "trade",
          message: `HitDef priority clash: ${left.label} priority ${leftPriority} Hit traded with ${right.label} priority ${rightPriority} Hit`,
        };
      }
      if (leftType === "hit" && rightType === "miss") {
        return {
          kind: "tie-win",
          winnerId: left.id,
          loserId: right.id,
          message: `HitDef priority clash: ${left.label} Hit beat ${right.label} Miss at priority ${leftPriority}`,
        };
      }
      if (rightType === "hit" && leftType === "miss") {
        return {
          kind: "tie-win",
          winnerId: right.id,
          loserId: left.id,
          message: `HitDef priority clash: ${right.label} Hit beat ${left.label} Miss at priority ${leftPriority}`,
        };
      }
      return {
        kind: "no-hit",
        message: `HitDef priority clash: ${left.label} ${priorityTypeLabel(leftType)} and ${right.label} ${priorityTypeLabel(rightType)} both missed at priority ${leftPriority}`,
      };
    }
    const winner = leftPriority > rightPriority ? left : right;
    const loser = winner === left ? right : left;
    winner.hasHit = false;
    loser.hasHit = true;
    bufferRuntimeHitDefTarget(loser, winner.id);
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
    applyRuntimeHitDefSpritePriorityContact(attacker, defender, move, result.kind, options.hitDefPriorityProfile ?? "unknown");
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
    if (!options.preserveDefenderMove) interruptRuntimeDirectMove(defender);
    const lifeBefore = defender.runtime.life;
    attacker.hitPause = result.pause;
    defender.hitPause = result.pause;
    defender.runtime.guardStun = result.stun;
    defender.runtime.guardSlideTime = result.slideTime ?? 0;
    defender.runtime.guardControlTime = result.controlTime ?? 0;
    const guardSlideTime = result.slideTime ?? result.stun;
    const guardControlTime = result.controlTime ?? guardSlideTime;
    defender.runtime.guardSlideTimeRemaining = normalizeGuardTimer(guardSlideTime);
    defender.runtime.guardControlTimeRemaining = normalizeGuardTimer(guardControlTime);
    defender.runtime.guarding = true;
    defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
    recordRuntimeRoundWinType(attacker, defender, move.attr, result.kind, lifeBefore);
    if (result.guardPoints !== undefined) {
      applyRuntimeGuardPointsAdd(defender.runtime, result.guardPoints);
    }
    if (result.redLife !== undefined) {
      applyRuntimeRedLifeAdd(defender.runtime, result.redLife, true);
    }
    defender.runtime.vel.x = attacker.runtime.facing * result.push;
    defender.runtime.hitVelocity = {
      x: attacker.runtime.facing * result.push,
      y: result.hitVelocityY ?? 0,
      ...(result.hitVelocityZ === undefined ? {} : { z: result.hitVelocityZ }),
    };
    if (result.hitVelocityZ !== undefined) {
      defender.runtime.combatDepth = {
        ...(defender.runtime.combatDepth ?? runtimeCombatDepthFromConstants(defender.definition.constants)),
        velocity: result.hitVelocityZ,
      };
    }
    applyRuntimeCornerPush(attacker.runtime, defender.runtime, options.stageBounds, result.cornerPush, result.push);
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move, {
      guarded: true,
      damage: result.damage,
      hitShakeTime: result.pause,
      hitTime: result.stun,
      sourceGuardKo: defender.runtime.life <= 0,
    }, attacker);
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
    if (!options.preserveDefenderMove) interruptRuntimeDirectMove(defender);
    const lifeBefore = defender.runtime.life;
    defender.hitPause = result.pause;
    defender.hitStun = result.stun;
    defender.runtime.guardStun = 0;
    defender.runtime.guardSlideTime = 0;
    defender.runtime.guardControlTime = 0;
    defender.runtime.guardSlideTimeRemaining = undefined;
    defender.runtime.guardControlTimeRemaining = undefined;
    defender.runtime.guarding = false;
    defender.runtime.receivedHitSequence = (defender.runtime.receivedHitSequence ?? 0) + 1;
    defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
    recordRuntimeRoundWinType(attacker, defender, move.attr, result.kind, lifeBefore);
    const previousDizzyPoints = defender.runtime.dizzyPoints ?? defender.runtime.dizzyPointsMax ?? 1000;
    if (result.dizzyPoints !== undefined) {
      applyRuntimeDizzyPointsAdd(defender.runtime, result.dizzyPoints);
    }
    if (result.redLife !== undefined) {
      applyRuntimeRedLifeAdd(defender.runtime, result.redLife, true);
    }
    const hitVelocityX = result.hitVelocityX === undefined
      ? attacker.runtime.facing * result.push
      : -attacker.runtime.facing * result.hitVelocityX;
    defender.runtime.vel.x = hitVelocityX;
    defender.runtime.hitVelocity = {
      x: hitVelocityX,
      y: result.hitVelocityY ?? 0,
      ...(result.hitVelocityZ === undefined ? {} : { z: result.hitVelocityZ }),
    };
    if (result.hitVelocityZ !== undefined) {
      defender.runtime.combatDepth = {
        ...(defender.runtime.combatDepth ?? runtimeCombatDepthFromConstants(defender.definition.constants)),
        velocity: result.hitVelocityZ,
      };
    }
    applyRuntimeCornerPush(attacker.runtime, defender.runtime, options.stageBounds, result.cornerPush, result.push);
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move, {
      damage: result.damage,
      hitShakeTime: result.pause,
      hitTime: result.stun,
      sourceGuardKo: false,
    }, attacker);
    defender.runtime.hitFall = runtimeHitFallFromMove(move, defender.runtime.stateType, defender.definition.localCoord);
    applyHitSnap(attacker, defender, move);
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    markRuntimeEffectActorGotHit(defender);
    applyRuntimePowerDelta(attacker.runtime, result.powerGain, attacker.definition.constants);
    hooks.applyHitStateTransitions(attacker, defender, move);
    hooks.applyDefaultGetHit(defender, move);
    if (result.dizzyPoints !== undefined && previousDizzyPoints > 0 && defender.runtime.dizzyPoints === 0) {
      hooks.applyDizzyState?.(defender, move);
    }
    this.contactWorld.markReceivedDamage(defender.contact, defender.runtime.stateNo, result.damage);
    const receivedHitCount = move.hitVars?.hitCount ?? 1;
    if (receivedHitCount !== 1) {
      this.contactWorld.markReceivedHits(defender.contact, defender.runtime.stateNo, receivedHitCount - 1);
    }
    return {
      kind: "hit",
      damage: result.damage,
      message: `${attacker.label} hit ${defender.label} for ${result.damage}`,
    };
  }
}

function normalizeGuardTimer(value: number | undefined): number {
  return Math.max(0, Math.trunc(value ?? 0));
}

function priorityTypeLabel(type: NonNullable<DemoMove["priorityType"]>): "Hit" | "Miss" | "Dodge" {
  return type === "hit" ? "Hit" : type === "miss" ? "Miss" : "Dodge";
}

function getActiveDirectHitDefMove(actor: RuntimeDirectCombatActor, hooks: Pick<RuntimeDirectPriorityHooks, "isMoveActive">): DemoMove | undefined {
  const move = actor.currentMove;
  const legacyConsumed = actor.hitDefTargets === undefined && actor.pendingHitDefTargets === undefined && actor.hasHit;
  const hitOnceConsumed = move?.hitOnce === true && actor.hasHit;
  if (!move || legacyConsumed || hitOnceConsumed || move.requiresHitDef || move.isReversal || !hooks.isMoveActive(move, actor.moveTick)) {
    return undefined;
  }
  return move;
}

export function interruptRuntimeDirectMove(actor: RuntimeDirectCombatActor, expectedMove?: DemoMove): void {
  if (expectedMove && actor.currentMove !== expectedMove) return;
  actor.currentMove = undefined;
  actor.currentMoveLabel = undefined;
  actor.moveTick = 0;
  actor.hasHit = false;
}

function runtimeGetHitVarsFromMove(
  move: DemoMove,
  timing: { guarded?: boolean; damage: number; hitShakeTime: number; hitTime: number; sourceGuardKo?: boolean },
  source?: RuntimeDirectCombatActor,
): CharacterRuntimeState["hitVars"] {
  const sourceMetadata = source === undefined ? undefined : runtimeRoundHitSourceMetadata({
    id: source.id,
    playerNo: source.playerNo,
    rootId: source.rootId,
    rootOwned: source.rootOwned ?? (source.rootId === undefined || source.rootId === source.id),
    attr: move.attr ?? "S,NA",
    guardKo: timing.sourceGuardKo,
  });
  return {
    damage: Math.max(0, Math.round(timing.damage)),
    kill: timing.guarded ? (move.guardKill ?? true) : (move.kill ?? true),
    ...(sourceMetadata ?? {}),
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

function runtimeHitFallFromMove(
  move: DemoMove,
  defenderStateType: CharacterRuntimeState["stateType"],
  defenderLocalCoord?: readonly [number, number],
): CharacterRuntimeState["hitFall"] | undefined {
  const fall = move.fall;
  if (!fall) {
    return undefined;
  }
  const xVelocity = fall.velocity?.x;
  const zVelocity = fall.velocity?.z;
  const falling = resolveRuntimeFallEnabled(fall, defenderStateType);
  const recovery = resolveRuntimeFallRecoveryDefaults({ ...fall, enabled: falling });
  return {
    falling,
    damage: Math.max(0, fall.damage ?? 0),
    ...(move.downBounce === undefined ? {} : { downBounce: move.downBounce }),
    defenceUp: fall.defenceUp,
    kill: fall.kill,
    recover: recovery.recover,
    recoverTime: recovery.recoverTime,
    downRecover: fall.downRecover ?? true,
    downRecoverTime: fall.downRecoverTime,
    velocity: {
      // `fall.xvelocity` is an authored bounce velocity, not an
      // attacker-relative HitDef velocity. M.U.G.E.N/Ikemen preserve its
      // signed value when HitFallVel applies it.
      x: xVelocity,
      y: fall.velocity?.y ?? move.hitVelocityY ?? resolveRuntimeFallYVelocityDefaults(defenderLocalCoord),
      ...(zVelocity === undefined ? {} : { z: zVelocity }),
    },
    envShake: fall.envShake,
  };
}

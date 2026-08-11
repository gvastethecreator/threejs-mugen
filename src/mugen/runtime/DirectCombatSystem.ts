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
  applyRuntimeAttackerUnhittableTime,
  applyRuntimeReceiverUnhittableTime,
} from "./RuntimeUnhittableTimeSystem";
import {
  RuntimeContactMemoryWorld,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
import { applyRuntimeControl, applyRuntimeDizzyPointsAdd, applyRuntimeGuardPointsAdd, applyRuntimePowerDelta, applyRuntimeRedLifeAdd } from "./RuntimeResourceSystem";
import { applyRuntimeContactPaletteFx } from "./SpriteEffectSystem";
import type { CharacterRuntimeState } from "./types";
import {
  recordRuntimeRoundWinType,
  runtimeRoundHitSourceMetadata,
} from "./RuntimeRoundWinTypeSystem";
import { runtimeCombatDepthFromConstants, runtimeCombatLocalScale } from "./RuntimeCombatDepthSystem";
import { runtimeTeamSideFromId } from "./RuntimeTeamTopologySystem";
import { RUNTIME_DEFAULT_HIT_FLAG } from "./RuntimeHitFlagDefaults";
import {
  bufferRuntimeHitDefTarget,
  type RuntimeHitDefContactMemoryActor,
} from "./RuntimeHitDefContactMemorySystem";

export type RuntimeDirectCombatActor = {
  id: string;
  playerId?: number;
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
  /** One-shot target-facing override consumed after the next auto-facing pass. */
  pendingDirectHitFacing?: 1 | -1;
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
  emitHitEnvShake?: (attacker: TActor, move: DemoMove) => void;
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
  /** Ikemen-GO keeps GetHitVar(hitcount) mutable even when HitDef numhits exists. */
  trackAuthoredHitCountCombo?: boolean;
  /** Ikemen-GO records the extra KO velocity separately for xveladd/yveladd. */
  trackIkemenKoVelocityDelta?: boolean;
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
    applyRuntimeAttackerUnhittableTime(attacker.runtime, move);
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
    const previousComboHitCount = defender.runtime.hitVars?.comboHitCount;
    const tracksComboHitCount = options.trackAuthoredHitCountCombo === true || move.hitVars?.hitCount === undefined;
    if (!options.preserveDefenderMove) interruptRuntimeDirectMove(defender);
    const lifeBefore = defender.runtime.life;
    attacker.hitPause = result.attackerPause ?? result.pause;
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
      guardCount: (defender.runtime.hitVars?.guardCount ?? 0) + 1,
      comboHitCount: tracksComboHitCount ? previousComboHitCount : undefined,
      sourceGuardKo: defender.runtime.life <= 0,
    }, attacker);
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    const keepState = move.keepState === true || move.hitVars?.keepState === true;
    if (!keepState) {
      markRuntimeEffectActorGotHit(defender);
      applyRuntimeControl(defender.runtime, false);
    }
    applyRuntimePowerDelta(
      attacker.runtime,
      runtimeAttackerPowerGain(move.attackerGuardPower, result.powerGain),
      attacker.definition.constants,
    );
    applyRuntimePowerDelta(
      defender.runtime,
      runtimeAttackerPowerGain(move.guardPower, 0),
      defender.definition.constants,
    );
    if (!keepState) {
      hooks.applyGuardHit(defender);
    }
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
    const authoredHitCount = Math.trunc(move.hitVars?.hitCount ?? 1);
    if (authoredHitCount !== 1) {
      this.contactWorld.applyHitAdd(attacker.contact, attacker.runtime.stateNo, authoredHitCount - 1);
    }
    applyRuntimeDirectAttackerFacing(attacker, defender, move);
    latchRuntimeDirectDefenderFacing(attacker, defender, move);
    const tracksComboHitCount = options.trackAuthoredHitCountCombo === true || move.hitVars?.hitCount === undefined;
    const wasInHitCombo = tracksComboHitCount && defender.runtime.moveType === "H" && defender.runtime.hitVars?.guarded !== true;
    const comboHitCount = tracksComboHitCount
      ? (wasInHitCombo ? (defender.runtime.hitVars?.comboHitCount ?? 0) + 1 : 1)
      : undefined;
    attacker.hitPause = result.attackerPause ?? result.pause;
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
    applyRuntimeReceiverUnhittableTime(defender.runtime, move);
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
    const hitVelocityAdd = options.trackIkemenKoVelocityDelta === true &&
      defender.runtime.life <= 0
      ? runtimeKoVelocityAddFromMove(move)
      : undefined;
    defender.runtime.hitVars = runtimeGetHitVarsFromMove(move, {
      grounded: defender.runtime.stateType === "S" || defender.runtime.stateType === "C",
      damage: result.damage,
      hitShakeTime: result.pause,
      hitTime: result.stun,
      guardCount: defender.runtime.hitVars?.guardCount,
      comboHitCount,
      sourceGuardKo: false,
      hitVelocityAdd,
    }, attacker);
    const hitFall = runtimeHitFallFromMove(move, defender.runtime.stateType, defender.definition.localCoord);
    if (hitFall) {
      defender.runtime.hitFall = hitFall;
    } else if (move.forceNoFall && defender.runtime.hitFall) {
      defender.runtime.hitFall = { ...defender.runtime.hitFall, falling: false };
    } else {
      defender.runtime.hitFall = undefined;
    }
    applyHitSnap(attacker, defender, move);
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    if (hitVelocityAdd) {
      defender.runtime.vel.x += hitVelocityAdd.x;
      defender.runtime.vel.y += hitVelocityAdd.y;
    }
    const keepState = move.keepState === true || move.hitVars?.keepState === true;
    if (!keepState) {
      markRuntimeEffectActorGotHit(defender);
    }
    applyRuntimeContactPaletteFx(defender.runtime, move.paletteFx);
    hooks.emitHitEnvShake?.(attacker, move);
    applyRuntimePowerDelta(
      attacker.runtime,
      runtimeAttackerPowerGain(move.attackerHitPower, result.powerGain),
      attacker.definition.constants,
    );
    applyRuntimePowerDelta(
      defender.runtime,
      runtimeAttackerPowerGain(move.hitPower, 0),
      defender.definition.constants,
    );
    if (!keepState) {
      hooks.applyHitStateTransitions(attacker, defender, move);
      hooks.applyDefaultGetHit(defender, move);
    }
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

export function consumeRuntimeDirectHitFacing(
  actor: Pick<RuntimeDirectCombatActor, "runtime" | "pendingDirectHitFacing">,
): boolean {
  const facing = actor.pendingDirectHitFacing;
  if (facing === undefined) return false;
  actor.runtime.facing = facing;
  delete actor.pendingDirectHitFacing;
  return true;
}

function runtimeAttackerPowerGain(authored: number | undefined, fallback: number): number {
  return authored !== undefined && Number.isFinite(authored)
    ? Math.trunc(authored)
    : fallback;
}

function applyRuntimeDirectAttackerFacing<TActor extends RuntimeDirectCombatActor>(
  attacker: TActor,
  defender: TActor,
  move: DemoMove,
): void {
  const getP2Facing = move.p1GetP2Facing ?? 0;
  if (getP2Facing !== 0) {
    attacker.runtime.facing = getP2Facing < 0
      ? (defender.runtime.facing === 1 ? -1 : 1)
      : defender.runtime.facing;
  } else if ((move.p1Facing ?? 0) < 0) {
    attacker.runtime.facing = attacker.runtime.facing === 1 ? -1 : 1;
  }
}

function latchRuntimeDirectDefenderFacing<TActor extends RuntimeDirectCombatActor>(
  attacker: TActor,
  defender: TActor,
  move: DemoMove,
): void {
  const authored = Math.trunc(move.p2Facing ?? 0);
  if (authored === 0) return;
  defender.pendingDirectHitFacing = authored > 0
    ? attacker.runtime.facing
    : attacker.runtime.facing === 1 ? -1 : 1;
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
  timing: {
    guarded?: boolean;
    grounded?: boolean;
    damage: number;
    hitShakeTime: number;
      hitTime: number;
    guardCount?: number;
    comboHitCount?: number;
    sourceGuardKo?: boolean;
    hitVelocityAdd?: { x: number; y: number };
  },
  source?: RuntimeDirectCombatActor,
): CharacterRuntimeState["hitVars"] {
  const sourceMetadata = source === undefined ? undefined : runtimeRoundHitSourceMetadata({
    id: source.id,
    playerId: source.playerId,
    playerNo: source.playerNo,
    rootId: source.rootId,
    rootOwned: source.rootOwned ?? (source.rootId === undefined || source.rootId === source.id),
    attr: move.attr ?? "S,NA",
    guardFlag: move.guardFlag ?? "MA",
    hitFlag: move.hitFlag ?? RUNTIME_DEFAULT_HIT_FLAG,
    guardKo: timing.sourceGuardKo,
  });
  const sourceTeamSide = source === undefined ? undefined : (move.teamSide ?? runtimeTeamSideFromId(source.id));
  const keepState = move.keepState ?? move.hitVars?.keepState;
  return {
    damage: Math.max(0, Math.round(timing.damage)),
    hitDamage: Math.max(0, Math.round(move.damage)),
    guardDamage: Math.max(0, Math.round(move.guardDamage ?? 0)),
    kill: timing.guarded ? (move.guardKill ?? true) : (move.kill ?? true),
    ...(sourceMetadata ?? {}),
    ...(source === undefined ? {} : { sourceTeamSide: sourceTeamSide ?? -1 }),
    sourcePriority: normalizeRuntimeHitDefPriority(move.priority),
    ...(move.dizzyPoints === undefined ? {} : { sourceDizzyPoints: Math.trunc(move.dizzyPoints) }),
    ...(move.guardPoints === undefined ? {} : { sourceGuardPoints: Math.trunc(move.guardPoints) }),
    ...(move.redLife === undefined ? {} : { sourceRedLife: Math.trunc(move.redLife) }),
    ...(move.guardPower === undefined ? {} : { sourceGuardPower: Math.trunc(move.guardPower) }),
    ...(move.hitPower === undefined ? {} : { sourceHitPower: Math.trunc(move.hitPower) }),
    ...((timing.guarded ? move.guardPower : move.hitPower) === undefined
      ? {}
      : { sourcePower: Math.trunc((timing.guarded ? move.guardPower : move.hitPower) as number) }),
    ...(timing.guarded || move.p2Facing === undefined
      ? {}
      : { sourceFacing: Math.trunc(move.p2Facing) }),
    ...(move.score === undefined ? {} : { sourceScore: move.score }),
    ...(keepState === undefined ? {} : { keepState }),
    ...(timing.guardCount === undefined || timing.guardCount <= 0
      ? {}
      : { guardCount: Math.max(0, Math.trunc(timing.guardCount)) }),
    ...(timing.comboHitCount === undefined || timing.comboHitCount <= 0
      ? {}
      : { comboHitCount: Math.max(0, Math.trunc(timing.comboHitCount)) }),
    ...(timing.hitVelocityAdd === undefined ? {} : { hitVelocityAdd: timing.hitVelocityAdd }),
    frame: true,
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
    groundAnimType: move.hitVars?.groundAnimType ?? move.hitVars?.animType ?? 0,
    airAnimType: move.hitVars?.airAnimType ?? move.hitVars?.groundAnimType ?? move.hitVars?.animType ?? 0,
    fallAnimType:
      move.hitVars?.fallAnimType
      ?? move.hitVars?.animType
      ?? move.hitVars?.airAnimType
      ?? move.hitVars?.groundAnimType
      ?? 0,
    groundType: move.hitVars?.groundType ?? 1,
    airType: move.hitVars?.airType ?? move.hitVars?.groundType ?? 1,
    isBound: false,
    hitShakeTime: timing.hitShakeTime,
    hitTime: timing.hitTime,
    ...(timing.guarded || timing.grounded !== true || move.hitVars?.slideTime === undefined
      ? {}
      : { slideTime: move.hitVars.slideTime }),
    ...(move.hitVars?.xAccel !== undefined ? { xAccel: move.hitVars.xAccel } : {}),
    ...(move.hitVars?.yAccel !== undefined ? { yAccel: move.hitVars.yAccel } : {}),
    ...(move.hitVars?.zAccel !== undefined ? { zAccel: move.hitVars.zAccel } : {}),
    ...(move.hitVars?.standFriction !== undefined ? { standFriction: move.hitVars.standFriction } : {}),
    ...(move.hitVars?.crouchFriction !== undefined ? { crouchFriction: move.hitVars.crouchFriction } : {}),
    ...(move.hitVelocities === undefined ? {} : { hitVelocities: move.hitVelocities }),
    ...(timing.guarded ? { guarded: true } : {}),
  };
}

function runtimeKoVelocityAddFromMove(move: DemoMove): { x: number; y: number } | undefined {
  const x = move.koVelocityAdd?.x;
  const y = move.koVelocityAdd?.y;
  const hasX = typeof x === "number" && Number.isFinite(x);
  const hasY = typeof y === "number" && Number.isFinite(y);
  if (!hasX && !hasY) {
    return undefined;
  }
  return { x: hasX ? x! : 0, y: hasY ? y! : 0 };
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
  if (snap.z !== undefined) {
    const attackerDepth = attacker.runtime.combatDepth ?? runtimeCombatDepthFromConstants(attacker.definition.constants);
    const defenderDepth = defender.runtime.combatDepth ?? runtimeCombatDepthFromConstants(defender.definition.constants);
    defender.runtime.combatDepth = {
      ...defenderDepth,
      position:
        attackerDepth.position *
          (runtimeCombatLocalScale(attacker.definition.localCoord) / runtimeCombatLocalScale(defender.definition.localCoord)) +
        snap.z,
    };
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

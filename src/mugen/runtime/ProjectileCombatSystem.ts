import type { CollisionBox, MugenCollisionBoxType } from "../model/CollisionBox";
import {
  applyRuntimeDamage,
  canRuntimeDamageKill,
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  parseHitAttribute,
  resolveRuntimeCombatHit,
  resolveRuntimeFallEnabled,
  resolveRuntimeFallYVelocityDefaults,
  resolveRuntimeFallRecoveryDefaults,
  runtimeHitFlagRejectionReason,
  runtimeWorldBox,
  type RuntimeCombatAttack,
  type RuntimeHitFlagRejectionReason,
} from "./CombatResolver";
import { applyRuntimeCornerPush, type RuntimeStageBounds } from "./HitDefCornerPush";
import { normalizeRuntimeHitDefPriority } from "./HitDefContactPriority";
import { applyRuntimeProjectileHitDefSpritePriorityContact } from "./HitDefSpritePrioritySystem";
import {
  beginRuntimeProjectileHitPause,
  canRuntimeProjectileContact,
  describeRuntimeProjectileRemoval,
  getRuntimeProjectileCollisionBoxes,
  getRuntimeProjectileHitboxes,
  markRuntimeProjectileForRemoval,
  recordRuntimeProjectileContact,
  runtimeProjectileAffectTeamAllows,
  runtimeProjectileCombatDepth,
  runtimeProjectileTeamSide,
  runtimeProjectileWorldBox,
  type RuntimeProjectile,
} from "./ProjectileSystem";
import { applyRuntimeControl, applyRuntimeGuardPointsAdd, applyRuntimePowerDelta } from "./RuntimeResourceSystem";
import { applyRuntimeContactPaletteFx } from "./SpriteEffectSystem";
import type { CharacterRuntimeState, RuntimeHitOverrideSlot } from "./types";
import type { DemoFighterDefinition } from "./demoFighters";
import type { MugenAffectTeam } from "../model/MugenTeam";
import { runtimeAffectTeamAllows, runtimeTeamSideFromId, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import { hasRuntimeCombatDepthContact, runtimeCombatDepthFromConstants } from "./RuntimeCombatDepthSystem";
import {
  applyRuntimeProjectileAirJuggleHit,
  canRuntimeProjectileAirJuggle,
  prepareRuntimeInheritedJugglePoints,
  type RuntimeDirectJuggleActor,
} from "./RuntimeJuggleSystem";
import { runtimeStateChangeTmpBlocksProjectile } from "./RuntimeStateChangeTmpSystem";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import { runtimeChainIdOverridesEqualNoChainId } from "./RuntimeChainIdPolicy";
import {
  recordRuntimeRoundWinType,
  runtimeRoundHitSourceMetadata,
  type RuntimeRoundHitSourceActor,
} from "./RuntimeRoundWinTypeSystem";
import { RUNTIME_DEFAULT_HIT_FLAG } from "./RuntimeHitFlagDefaults";
import {
  applyRuntimeReceiverUnhittableTime,
  hasRuntimeUnhittableTime,
} from "./RuntimeUnhittableTimeSystem";

export type RuntimeProjectileCombatActor = {
  id: string;
  playerId?: number;
  playerNo?: number;
  label: string;
  runtime: CharacterRuntimeState;
  definition?: Pick<DemoFighterDefinition, "constants">;
  hitPause: number;
  hitStun: number;
  pendingProjectileHitFacing?: 1 | -1;
};

/**
 * Ikemen applies Projectile p2facing after the contact frame has completed.
 * Keep the latch one-shot so the normal auto-facing pass cannot overwrite the
 * authored result before it becomes observable.
 */
export function consumeRuntimeProjectileHitFacing(
  actor: Pick<RuntimeProjectileCombatActor, "runtime" | "pendingProjectileHitFacing">,
): boolean {
  const facing = actor.pendingProjectileHitFacing;
  if (facing === undefined) return false;
  actor.runtime.facing = facing;
  delete actor.pendingProjectileHitFacing;
  return true;
}

export type RuntimeProjectileReversalResult = boolean | "state-change-pending";

export type RuntimeProjectileCombatInput<TActor extends RuntimeProjectileCombatActor> = {
  attacker: TActor;
  defender: TActor;
  projectiles: RuntimeProjectile[];
  hurtBoxes: CollisionBox[];
  runtimeProfile?: RuntimeCompatibilityProfile;
  getProjectileJuggleActor?: (
    attacker: TActor,
    projectile: RuntimeProjectile,
  ) => RuntimeDirectJuggleActor | undefined;
  attackerLocalCoord?: readonly [number, number];
  defenderLocalCoord?: readonly [number, number];
  getTargetCollisionBoxes?: (defender: TActor, boxType: MugenCollisionBoxType) => CollisionBox[] | undefined;
  holdingBack: boolean;
  canDefenderBeHit?: (defender: TActor) => boolean;
  resolveProjectileHitSource?: (attacker: TActor, projectile: RuntimeProjectile) => RuntimeRoundHitSourceActor | undefined;
  log: (line: string) => void;
  rememberTarget: (
    attacker: TActor,
    defender: TActor,
    targetId: number | undefined,
    projectile: RuntimeProjectile,
  ) => void;
  applyHitOverride: (
    attacker: TActor,
    defender: TActor,
    override: RuntimeHitOverrideSlot,
    hitPause: number,
    log: (line: string) => void,
  ) => void;
  applyProjectileReversal?: (
    attacker: TActor,
    defender: TActor,
    projectile: RuntimeProjectile,
    attackBox: CollisionBox,
  ) => RuntimeProjectileReversalResult;
  applyGuardHit?: (defender: TActor) => void;
  applyHitState?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile) => void;
  markDefenderGotHit?: (defender: TActor) => void;
  recordProjectileContact?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile, kind: "hit" | "guard") => void;
  emitProjectileContactEffects?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile, kind: "hit" | "guard") => void;
  emitProjectileEnvShake?: (attacker: TActor, projectile: RuntimeProjectile) => void;
  recordReceivedDamage?: (defender: TActor, damage: number) => void;
  removeProjectilesMarkedForRemoval: () => void;
  stageBounds?: RuntimeStageBounds;
  projectileCollisionMode?: boolean;
  projectileDefense?: {
    collisionBoxes: CollisionBox[];
    affectTeam?: MugenAffectTeam;
    teamSide?: RuntimeTeamSide;
    attackDepth?: [number, number];
    localCoord?: readonly [number, number];
    onCancel?: (projectile: RuntimeProjectile) => void;
  };
};

export type RuntimeProjectileClashInput = {
  leftLabel: string;
  rightLabel: string;
  leftProjectiles: RuntimeProjectile[];
  rightProjectiles: RuntimeProjectile[];
  log: (line: string) => void;
  recordProjectileCancel?: (projectile: RuntimeProjectile) => void;
  removeProjectilesMarkedForRemoval: () => void;
};

export class RuntimeProjectileCombatWorld {
  resolveCombat<TActor extends RuntimeProjectileCombatActor>(
    input: RuntimeProjectileCombatInput<TActor>,
  ): void {
    const { attacker, defender, hurtBoxes, log } = input;
    let apProjectileContacted = false;
    if (input.projectileDefense) {
      for (const projectile of input.projectiles) {
        if (!canRuntimeProjectileContact(projectile)) {
          continue;
        }
        if (!runtimeProjectileAffectTeamAllows(projectile, defender.id)) {
          continue;
        }
        if (!runtimeAffectTeamAllows(
          input.projectileDefense.teamSide ?? undefined,
          runtimeProjectileTeamSide(projectile),
          input.projectileDefense.affectTeam,
        )) {
          continue;
        }
        if (!projectileDepthContactsAttackDepth(projectile, defender, input.projectileDefense.attackDepth, input.projectileDefense.localCoord ?? input.defenderLocalCoord)) {
          continue;
        }
        if (!projectileTargetRequirementSatisfied(input, projectile, defender, hurtBoxes)) {
          continue;
        }
        const collisionBoxes = getRuntimeProjectileCollisionBoxes(projectile, 2);
        const contactAttackBox = findProjectileContactAttackBox(projectile, defender, collisionBoxes, input.projectileDefense.collisionBoxes);
        if (!contactAttackBox) {
          continue;
        }
        markRuntimeProjectileForRemoval(projectile, "cancel");
        input.projectileDefense.onCancel?.(projectile);
        log(`${defender.label} canceled ${attacker.label} projectile ${projectile.serialId} via HitFlag P`);
      }
    }
    for (const projectile of input.projectiles) {
      if (!canRuntimeProjectileContact(projectile)) {
        continue;
      }
      if (!runtimeProjectileAffectTeamAllows(projectile, defender.id)) {
        continue;
      }
      if (!projectileDepthContactsActor(projectile, defender, input.defenderLocalCoord)) {
        continue;
      }
      const targetBoxes = resolveProjectileTargetBoxes(input, projectile, defender, hurtBoxes);
      if (targetBoxes === undefined) {
        continue;
      }
      const hitBoxes = input.projectileCollisionMode
        ? getRuntimeProjectileCollisionBoxes(projectile, 2)
        : getRuntimeProjectileHitboxes(projectile);
      const contactAttackBox = findProjectileContactAttackBox(projectile, defender, hitBoxes, targetBoxes);
      if (!contactAttackBox) {
        continue;
      }
      if (hasRuntimeUnhittableTime(defender.runtime)) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via HitDef unhittabletime`);
        continue;
      }
      if (runtimeProjectileChainIdRejects(projectile, defender.runtime)) {
        const previousHitId = defender.runtime.hitVars?.hitId;
        log(
          `${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via ChainID ${Math.trunc(projectile.chainId!)} (previous HitDef id ${previousHitId === undefined ? "none" : previousHitId})`,
        );
        continue;
      }
      const projectileHitSource = resolveRuntimeProjectileHitSource(input, attacker, projectile);
      const rejectedNoChainId = runtimeProjectileNoChainIdRejection(
        projectile,
        defender,
        projectileHitSource,
        input.runtimeProfile,
      );
      if (rejectedNoChainId !== undefined) {
        log(
          `${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via NoChainID ${rejectedNoChainId} (same source player ${projectileHitSource?.playerId})`,
        );
        continue;
      }
      const reversalResult = input.applyProjectileReversal?.(attacker, defender, projectile, contactAttackBox);
      if (reversalResult === true) {
        continue;
      }
      if (reversalResult === "state-change-pending") {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via pending state change`);
        continue;
      }
      if (input.canDefenderBeHit?.(defender) === false) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via SuperPause unhittable`);
        continue;
      }
      const projectileIsAp = isRuntimeProjectileAttackAttribute(projectile.attr ?? "S,SP");
      if (projectileIsAp && apProjectileContacted) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via same-frame AP projectile contact`);
        continue;
      }
      const hitFlagReason = runtimeHitFlagRejectionReason({
        attacker: attacker.runtime,
        defender: defender.runtime,
        hitFlag: projectile.hitFlag,
      });
      if (hitFlagReason) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via ${runtimeHitFlagRejectionLabel(hitFlagReason)}`);
        continue;
      }
      if (!canRuntimeBeHitBy(defender.runtime, projectile.attr ?? "S,SP")) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via HitBy/NotHitBy`);
        continue;
      }
      const targetWasFalling = defender.runtime.moveType === "H" && defender.runtime.hitFall?.falling === true;
      const projectileJuggleOwner = projectile.rootId === attacker.id
        ? input.getProjectileJuggleActor?.(attacker, projectile) ?? projectileJuggleActor(attacker)
        : undefined;
      if (projectileJuggleOwner) {
        prepareRuntimeInheritedJugglePoints({
          profile: input.runtimeProfile,
          attacker: projectileJuggleOwner,
          defender: projectileJuggleActor(defender),
        });
      }
      if (projectileJuggleOwner && !canRuntimeProjectileAirJuggle({
        profile: input.runtimeProfile,
        attacker: projectileJuggleOwner,
        defender: projectileJuggleActor(defender),
        airJuggle: projectile.airJuggle ?? 0,
        targetWasFalling,
      })) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via air.juggle`);
        continue;
      }
      if (runtimeStateChangeTmpBlocksProjectile(defender.runtime)) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via pending state change`);
        continue;
      }
      const override = findRuntimeHitOverride(defender.runtime, projectile.attr ?? "S,SP", projectile.guardFlag ?? "MA");
      if (override) {
        if (projectile.missOnOverride === true) {
          log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} because missonoverride = 1 forces active override miss`);
          continue;
        }
        const overrideContact = resolveRuntimeCombatHit({
          attacker: attacker.runtime,
          defender: defender.runtime,
          attack: runtimeCombatAttackFromProjectile(projectile),
          holdingBack: input.holdingBack,
        });
        recordRuntimeProjectileContact(projectile);
        if (projectileIsAp) apProjectileContacted = true;
        input.rememberTarget(attacker, defender, projectile.targetId, projectile);
        if (override.forceGuard !== true && overrideContact.kind !== "guard") {
          applyRuntimeReceiverUnhittableTime(defender.runtime, projectile);
        }
        input.applyHitOverride(attacker, defender, override, projectile.hitShakeTime, log);
        continue;
      }
      const result = resolveRuntimeCombatHit({
        attacker: attacker.runtime,
        defender: defender.runtime,
        attack: runtimeCombatAttackFromProjectile(projectile),
        holdingBack: input.holdingBack,
      });
      if (result.kind === "hit") {
        applyRuntimeReceiverUnhittableTime(defender.runtime, projectile);
      }
      applyRuntimeProjectileHitDefSpritePriorityContact(
        defender,
        projectile,
        result.kind,
        input.runtimeProfile ?? "unknown",
      );
      recordRuntimeProjectileContact(projectile, result.kind);
      beginRuntimeProjectileHitPause(projectile, result.kind);
      if (projectileIsAp) apProjectileContacted = true;
      input.rememberTarget(attacker, defender, projectile.targetId, projectile);
      applyRuntimeProjectileTargetDistanceBounds(projectile, defender, result.kind);
      input.emitProjectileEnvShake?.(attacker, projectile);
      const source = projectileHitSource;
      const tracksComboHitCount = input.runtimeProfile === "ikemen-go" || projectile.hitDefHitCount === undefined;
      const wasInHitCombo = tracksComboHitCount && defender.runtime.moveType === "H" && defender.runtime.hitVars?.guarded !== true;
      const previousComboHitCount = defender.runtime.hitVars?.comboHitCount;
      const comboHitCount = tracksComboHitCount
        ? result.kind === "hit"
          ? (wasInHitCombo ? (previousComboHitCount ?? 0) + 1 : 1)
          : previousComboHitCount
        : undefined;
      const lifeBefore = defender.runtime.life;
      defender.hitPause = result.pause;
      defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
      recordRuntimeRoundWinType(attacker, defender, projectile.attr ?? "S,SP", result.kind, lifeBefore, {
        sourceEligible: source?.rootOwned === true,
      });
      const hitVelocityX = result.kind === "hit" && result.hitVelocityX !== undefined
        ? -projectile.facing * result.hitVelocityX
        : projectile.facing * result.push;
      defender.runtime.vel.x = hitVelocityX;
      defender.runtime.hitVelocity = {
        x: hitVelocityX,
        y: result.hitVelocityY ?? 0,
        ...(result.hitVelocityZ === undefined ? {} : { z: result.hitVelocityZ }),
      };
      if (result.hitVelocityZ !== undefined) {
        defender.runtime.combatDepth = {
          ...(defender.runtime.combatDepth ?? runtimeCombatDepthFromConstants(defender.definition?.constants)),
          velocity: result.hitVelocityZ,
        };
      }
      applyRuntimeCornerPush(attacker.runtime, defender.runtime, input.stageBounds, result.cornerPush, result.push);
      if (result.hitVelocityY !== undefined) {
        defender.runtime.vel.y = result.hitVelocityY;
      }
      const hitVelocityAdd = result.kind === "hit" &&
        input.runtimeProfile === "ikemen-go" &&
        source?.rootOwned === true &&
        defender.runtime.life <= 0
        ? runtimeKoVelocityAddFromProjectile(projectile)
        : undefined;
      if (hitVelocityAdd) {
        defender.runtime.vel.x += hitVelocityAdd.x;
        defender.runtime.vel.y += hitVelocityAdd.y;
      }
      if (projectile.keepState !== true) {
        if (input.markDefenderGotHit) {
          input.markDefenderGotHit(defender);
        } else {
          defender.runtime.moveType = "H";
        }
      }
      applyRuntimePowerDelta(
        attacker.runtime,
        runtimeAttackerPowerGain(
          result.kind === "guard" ? projectile.attackerGuardPower : projectile.attackerHitPower,
          result.powerGain,
        ),
      );
      applyRuntimePowerDelta(
        defender.runtime,
        runtimeAttackerPowerGain(result.kind === "guard" ? projectile.guardPower : projectile.hitPower, 0),
        defender.definition?.constants,
      );
      if (result.kind === "guard") {
        if (result.guardPoints !== undefined) {
          applyRuntimeGuardPointsAdd(defender.runtime, result.guardPoints);
        }
        input.recordProjectileContact?.(attacker, defender, projectile, "guard");
        input.emitProjectileContactEffects?.(attacker, defender, projectile, "guard");
        defender.runtime.guardStun = result.stun;
        defender.runtime.guardSlideTime = result.slideTime ?? 0;
        defender.runtime.guardControlTime = result.controlTime ?? 0;
        const guardSlideTime = result.slideTime ?? result.stun;
        const guardControlTime = result.controlTime ?? guardSlideTime;
        defender.runtime.guardSlideTimeRemaining = normalizeGuardTimer(guardSlideTime);
        defender.runtime.guardControlTimeRemaining = normalizeGuardTimer(guardControlTime);
        defender.runtime.guarding = true;
        defender.runtime.hitVars = runtimeGetHitVarsFromProjectileResult(
          projectile,
          true,
          result.damage,
          result.stun,
          result.pause,
          result.kill,
          source,
          defender.runtime.life <= 0,
          (defender.runtime.hitVars?.guardCount ?? 0) + 1,
          comboHitCount,
        );
        if (projectile.keepState !== true) {
          applyRuntimeControl(defender.runtime, false);
          input.applyGuardHit?.(defender);
        }
        log(
          `${defender.label} guarded ${attacker.label} projectile for ${result.damage}; hits remaining ${projectile.hitsRemaining}, miss ${projectile.missTimeRemaining}; ${describeRuntimeProjectileRemoval(projectile)}`,
        );
        continue;
      }
      input.recordProjectileContact?.(attacker, defender, projectile, "hit");
      input.emitProjectileContactEffects?.(attacker, defender, projectile, "hit");
      latchRuntimeProjectileDefenderFacing(projectile, defender);
      defender.hitStun = result.stun;
      defender.runtime.guardStun = 0;
      defender.runtime.guardSlideTime = 0;
      defender.runtime.guardControlTime = 0;
      defender.runtime.guardSlideTimeRemaining = undefined;
      defender.runtime.guardControlTimeRemaining = undefined;
      defender.runtime.guarding = false;
      defender.runtime.receivedHitSequence = (defender.runtime.receivedHitSequence ?? 0) + 1;
      defender.runtime.hitVars = runtimeGetHitVarsFromProjectileResult(
        projectile,
        false,
        result.damage,
        result.stun,
        result.pause,
        result.kill,
        source,
        false,
        defender.runtime.hitVars?.guardCount,
        comboHitCount,
        hitVelocityAdd,
      );
      applyRuntimeContactPaletteFx(defender.runtime, projectile.paletteFx);
      const projectileHitFall = runtimeHitFallFromProjectile(projectile, defender.runtime.stateType);
      if (projectileHitFall) {
        defender.runtime.hitFall = projectile.forceNoFall
          ? { ...projectileHitFall, falling: false }
          : projectileHitFall;
      } else if (projectile.forceNoFall && defender.runtime.hitFall) {
        defender.runtime.hitFall = { ...defender.runtime.hitFall, falling: false };
      }
      if (projectile.keepState !== true) {
        input.applyHitState?.(attacker, defender, projectile);
      }
      if (projectileJuggleOwner) {
        applyRuntimeProjectileAirJuggleHit({
          profile: input.runtimeProfile,
          attacker: projectileJuggleOwner,
          defender: projectileJuggleActor(defender),
          airJuggle: projectile.airJuggle ?? 0,
          targetWasFalling,
        });
      }
      input.recordReceivedDamage?.(defender, result.damage);
      log(
        `${attacker.label} projectile hit ${defender.label} for ${result.damage}; hits remaining ${projectile.hitsRemaining}, miss ${projectile.missTimeRemaining}; ${describeRuntimeProjectileRemoval(projectile)}`,
      );
    }
    input.removeProjectilesMarkedForRemoval();
  }

  resolveClashes(input: RuntimeProjectileClashInput): void {
    const { leftLabel, rightLabel, log } = input;
    const sameOwner = input.leftProjectiles === input.rightProjectiles;
    if (sameOwner) {
      const projectiles = input.leftProjectiles;
      for (let leftIndex = 0; leftIndex < projectiles.length; leftIndex += 1) {
        const left = projectiles[leftIndex];
        if (!left || !canRuntimeProjectileContact(left)) {
          continue;
        }
        for (let rightIndex = leftIndex + 1; rightIndex < projectiles.length; rightIndex += 1) {
          if (!canRuntimeProjectileContact(left)) {
            break;
          }
          const right = projectiles[rightIndex];
          if (!right || !canRuntimeProjectileContact(right)) {
            continue;
          }
          if (!projectilesCanClash(left, right)) continue;
          this.resolveClashPair(left, right, leftLabel, rightLabel, input, log);
        }
      }
      input.removeProjectilesMarkedForRemoval();
      return;
    }
    for (const left of input.leftProjectiles) {
      if (!canRuntimeProjectileContact(left)) {
        continue;
      }
      for (const right of input.rightProjectiles) {
        if (!canRuntimeProjectileContact(left)) {
          break;
        }
        if (!canRuntimeProjectileContact(right)) {
          continue;
        }
        if (!projectilesCanClash(left, right)) continue;
        this.resolveClashPair(left, right, leftLabel, rightLabel, input, log);
      }
    }
    input.removeProjectilesMarkedForRemoval();
  }

  private resolveClashPair(
    left: RuntimeProjectile,
    right: RuntimeProjectile,
    leftLabel: string,
    rightLabel: string,
    input: RuntimeProjectileClashInput,
    log: (line: string) => void,
  ): void {
    if (!projectilesCanClash(left, right)) return;
    if (!projectilesDepthIntersect(left, right)) return;
    if (!projectilesIntersect(left, right)) {
      return;
    }
    if (left.priority === right.priority) {
      markRuntimeProjectileForRemoval(left, "cancel");
      markRuntimeProjectileForRemoval(right, "cancel");
      input.recordProjectileCancel?.(left);
      input.recordProjectileCancel?.(right);
      log(
        `Projectile clash: ${leftLabel} ${left.serialId} traded with ${rightLabel} ${right.serialId} at priority ${left.priority}; ${left.serialId} ${describeRuntimeProjectileRemoval(left)}; ${right.serialId} ${describeRuntimeProjectileRemoval(right)}`,
      );
    } else if (left.priority > right.priority) {
      const previousPriority = left.priority;
      left.priority = decrementProjectilePriority(left.priority);
      markRuntimeProjectileForRemoval(right, "cancel");
      input.recordProjectileCancel?.(right);
      log(
        `Projectile clash: ${leftLabel} ${left.serialId} canceled ${rightLabel} ${right.serialId} by priority ${previousPriority} > ${right.priority}; winner priority ${previousPriority} -> ${left.priority}; ${right.serialId} ${describeRuntimeProjectileRemoval(right)}`,
      );
    } else {
      const previousPriority = right.priority;
      right.priority = decrementProjectilePriority(right.priority);
      markRuntimeProjectileForRemoval(left, "cancel");
      input.recordProjectileCancel?.(left);
      log(
        `Projectile clash: ${rightLabel} ${right.serialId} canceled ${leftLabel} ${left.serialId} by priority ${previousPriority} > ${left.priority}; winner priority ${previousPriority} -> ${right.priority}; ${left.serialId} ${describeRuntimeProjectileRemoval(left)}`,
      );
    }
  }
}

function runtimeAttackerPowerGain(authored: number | undefined, fallback: number): number {
  return authored !== undefined && Number.isFinite(authored)
    ? Math.trunc(authored)
    : fallback;
}

function runtimeCombatAttackFromProjectile(projectile: RuntimeProjectile): RuntimeCombatAttack {
  return {
    damage: projectile.damage,
    ...(projectile.guardPoints === undefined ? {} : { guardPoints: projectile.guardPoints }),
    ...(projectile.guardPointsAttackMultiplier === undefined
      ? {}
      : { guardPointsAttackMultiplier: projectile.guardPointsAttackMultiplier }),
    kill: projectile.kill,
    attr: projectile.attr,
    hitPause: projectile.hitShakeTime,
    hitStun: projectile.hitStun,
    airHitTime: projectile.airHitTime,
    downHitTime: projectile.downHitTime,
    downVelocityX: projectile.downVelocityX,
    downVelocityY: projectile.downVelocityY,
    downVelocityZ: projectile.downVelocityZ,
    downBounce: projectile.downBounce,
    ...(projectile.fall === undefined
      ? {}
      : { fall: { enabled: projectile.fall.enabled ?? false, airFall: projectile.fall.airFall } }),
    push: projectile.push,
    hitVelocityY: projectile.hitVelocityY,
    hitVelocityZ: projectile.hitVelocityZ,
    airVelocityX: projectile.airVelocityX,
    airVelocityY: projectile.airVelocityY,
    airVelocityZ: projectile.airVelocityZ,
    guardDistance: projectile.guardDistanceBounds.width[0],
    guardFlag: projectile.guardFlag,
    guardDamage: projectile.guardDamage,
    guardKill: projectile.guardKill,
    guardPause: projectile.guardShakeTime,
    guardStun: projectile.guardStun,
    guardSlideTime: projectile.guardSlideTime,
    guardControlTime: projectile.guardControlTime,
    airGuardControlTime: projectile.airGuardControlTime,
    guardPush: projectile.guardPush,
    guardVelocityY: projectile.guardVelocityY,
    guardVelocityZ: projectile.guardVelocityZ,
    airGuardPush: projectile.airGuardPush,
    airGuardVelocityY: projectile.airGuardVelocityY,
    airGuardVelocityZ: projectile.airGuardVelocityZ,
    cornerPush: projectile.cornerPush,
    airCornerPush: projectile.airCornerPush,
    downCornerPush: projectile.downCornerPush,
    guardCornerPush: projectile.guardCornerPush,
    airGuardCornerPush: projectile.airGuardCornerPush,
  };
}

function applyRuntimeProjectileTargetDistanceBounds<TActor extends RuntimeProjectileCombatActor>(
  projectile: RuntimeProjectile,
  defender: TActor,
  contactKind: "hit" | "guard",
): void {
  const minDistance = projectile.minDistance;
  const maxDistance = projectile.maxDistance;
  if (!minDistance && !maxDistance) return;

  const origin = projectile.pos;
  const facing = projectile.facing;
  const minX = finiteDistanceComponent(minDistance?.[0]);
  const maxX = finiteDistanceComponent(maxDistance?.[0]);
  if (minX !== undefined) {
    const limit = origin.x + facing * minX;
    if ((facing < 0 && defender.runtime.pos.x > limit) || (facing > 0 && defender.runtime.pos.x < limit)) {
      defender.runtime.pos.x = limit;
    }
  }
  if (maxX !== undefined) {
    const limit = origin.x + facing * maxX;
    if ((facing < 0 && defender.runtime.pos.x < limit) || (facing > 0 && defender.runtime.pos.x > limit)) {
      defender.runtime.pos.x = limit;
    }
  }

  if (contactKind === "hit" || defender.runtime.stateType === "A") {
    const minY = finiteDistanceComponent(minDistance?.[1]);
    const maxY = finiteDistanceComponent(maxDistance?.[1]);
    if (minY !== undefined && defender.runtime.pos.y < origin.y + minY) {
      defender.runtime.pos.y = origin.y + minY;
    }
    if (maxY !== undefined && defender.runtime.pos.y > origin.y + maxY) {
      defender.runtime.pos.y = origin.y + maxY;
    }
  }

  const minZ = finiteDistanceComponent(minDistance?.[2]);
  const maxZ = finiteDistanceComponent(maxDistance?.[2]);
  if (minZ === undefined && maxZ === undefined) return;
  const depth = defender.runtime.combatDepth ?? runtimeCombatDepthFromConstants(defender.definition?.constants);
  if (minZ !== undefined && depth.position < (origin.z ?? 0) + minZ) {
    depth.position = (origin.z ?? 0) + minZ;
  }
  if (maxZ !== undefined && depth.position > (origin.z ?? 0) + maxZ) {
    depth.position = (origin.z ?? 0) + maxZ;
  }
  defender.runtime.combatDepth = depth;
}

function finiteDistanceComponent(value: number | undefined): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}

function runtimeHitFallFromProjectile(
  projectile: RuntimeProjectile,
  defenderStateType: CharacterRuntimeState["stateType"],
): CharacterRuntimeState["hitFall"] | undefined {
  const fall = projectile.fall;
  if (!fall) {
    return undefined;
  }
  const xVelocity = fall.xVelocity;
  const zVelocity = fall.zVelocity;
  const falling = resolveRuntimeFallEnabled(fall, defenderStateType);
  const recovery = resolveRuntimeFallRecoveryDefaults({ ...fall, enabled: falling });
  const hasEnvShake =
    fall.envShakeTime !== undefined ||
    fall.envShakeFrequency !== undefined ||
    fall.envShakeAmplitude !== undefined ||
    fall.envShakePhase !== undefined ||
    fall.envShakeMultiplier !== undefined ||
    fall.envShakeDirection !== undefined;
  return {
    falling,
    damage: Math.max(0, fall.damage ?? 0),
    ...(projectile.downBounce === undefined ? {} : { downBounce: projectile.downBounce }),
    defenceUp: fall.defenceUp,
    kill: fall.kill,
    recover: recovery.recover,
    recoverTime: recovery.recoverTime,
    downRecover: fall.downRecover ?? true,
    downRecoverTime: fall.downRecoverTime,
    velocity: {
      // Fall bounce X is authored in world coordinates; unlike hit velocity,
      // it is not mirrored by the projectile's facing.
      x: xVelocity,
      y: fall.yVelocity ?? projectile.hitVelocityY ?? resolveRuntimeFallYVelocityDefaults(projectile.localCoord),
      ...(zVelocity === undefined ? {} : { z: zVelocity }),
    },
    envShake:
      !hasEnvShake
        ? undefined
        : {
            time: fall.envShakeTime ?? 0,
            freq: fall.envShakeFrequency ?? 60,
            ampl: fall.envShakeAmplitude ?? -4,
            phase: fall.envShakePhase ?? 0,
            ...(fall.envShakeMultiplier === undefined ? {} : { mul: fall.envShakeMultiplier }),
            ...(fall.envShakeDirection === undefined ? {} : { dir: fall.envShakeDirection }),
          },
  };
}

function projectileJuggleActor(actor: RuntimeProjectileCombatActor) {
  return {
    id: actor.id,
    definition: actor.definition ?? {},
    runtime: actor.runtime,
  };
}

function isRuntimeProjectileAttackAttribute(attr: string): boolean {
  return [...parseHitAttribute(attr).types].some((type) => type.length === 2 && type[1] === "P");
}

const defaultProjectileCombatWorld = new RuntimeProjectileCombatWorld();

export function resolveRuntimeProjectileCombat<TActor extends RuntimeProjectileCombatActor>(
  input: RuntimeProjectileCombatInput<TActor>,
): void {
  defaultProjectileCombatWorld.resolveCombat(input);
}

export function resolveRuntimeProjectileClashes(input: RuntimeProjectileClashInput): void {
  defaultProjectileCombatWorld.resolveClashes(input);
}

function decrementProjectilePriority(priority: number): number {
  return Math.max(0, priority - 1);
}

function runtimeHitFlagRejectionLabel(
  reason: RuntimeHitFlagRejectionReason,
): string {
  if (reason === "state-type-hitflag-rejected") return "HitFlag state type";
  if (reason === "fall-hitflag-rejected") return "fall HitFlag/NoFallHitFlag";
  if (reason === "minus-hitflag-rejected") return "HitFlag -";
  return "HitFlag +";
}

function runtimeProjectileChainIdRejects(projectile: RuntimeProjectile, defender: CharacterRuntimeState): boolean {
  if (projectile.chainId === undefined || projectile.chainId < 0) {
    return false;
  }
  return defender.hitVars?.hitId !== Math.trunc(projectile.chainId);
}

function runtimeProjectileNoChainIdRejection(
  projectile: RuntimeProjectile,
  defender: RuntimeProjectileCombatActor,
  source: RuntimeRoundHitSourceActor | undefined,
  profile?: RuntimeCompatibilityProfile,
): number | undefined {
  const previous = defender.runtime.hitVars;
  if (!previous || previous.hitId === undefined || source?.playerId === undefined || previous.sourcePlayerId !== source.playerId) {
    return undefined;
  }
  const blockedId = projectile.noChainIds
    ?.slice(0, 8)
    .map(Math.trunc)
    .find((candidate) => candidate >= 0 && candidate === previous.hitId);
  if (blockedId === undefined) return undefined;
  if (runtimeChainIdOverridesEqualNoChainId(profile, projectile.chainId, blockedId)) return undefined;
  const activeHitShake = defender.hitPause > 0;
  const sameLastTargetingActor = previous.sourceActorId === source.id;
  return activeHitShake || sameLastTargetingActor ? blockedId : undefined;
}

function latchRuntimeProjectileDefenderFacing<TActor extends RuntimeProjectileCombatActor>(
  projectile: RuntimeProjectile,
  defender: TActor,
): void {
  const authored = Math.trunc(projectile.p2Facing ?? 0);
  if (!Number.isFinite(authored) || authored === 0) return;
  defender.pendingProjectileHitFacing = authored > 0
    ? projectile.facing
    : projectile.facing === 1 ? -1 : 1;
}

function resolveRuntimeProjectileHitSource<TActor extends RuntimeProjectileCombatActor>(
  input: RuntimeProjectileCombatInput<TActor>,
  attacker: TActor,
  projectile: RuntimeProjectile,
): RuntimeRoundHitSourceActor | undefined {
  if (input.resolveProjectileHitSource) {
    return input.resolveProjectileHitSource(attacker, projectile);
  }
  if (projectile.parentId !== projectile.rootId || projectile.rootId !== attacker.id) {
    return undefined;
  }
  return {
    id: attacker.id,
    playerId: attacker.playerId,
    playerNo: attacker.playerNo,
    rootId: projectile.rootId,
    rootOwned: true,
  };
}

function runtimeGetHitVarsFromProjectileResult(
  projectile: RuntimeProjectile,
  guarded: boolean,
  damage: number,
  hitTime: number,
  hitShakeTime: number,
  kill: boolean,
  source: RuntimeRoundHitSourceActor | undefined,
  guardKo: boolean,
  guardCount?: number,
  comboHitCount?: number,
  hitVelocityAdd?: { x: number; y: number },
): CharacterRuntimeState["hitVars"] {
  const sourceMetadata = source === undefined ? undefined : runtimeRoundHitSourceMetadata({
    ...source,
    attr: projectile.attr ?? "S,SP",
    guardFlag: projectile.guardFlag ?? "MA",
    hitFlag: projectile.hitFlag ?? RUNTIME_DEFAULT_HIT_FLAG,
    guardKo,
  });
  return {
    damage: Math.max(0, Math.round(damage)),
    hitDamage: Math.max(0, Math.round(projectile.damage)),
    guardDamage: Math.max(0, Math.round(projectile.guardDamage)),
    kill,
    ...(sourceMetadata ?? {}),
    sourceProjectileId: projectile.projectileId ?? -1,
    sourceTeamSide: projectile.teamSide ?? runtimeTeamSideFromId(source?.id ?? projectile.rootId) ?? -1,
    sourcePriority: normalizeRuntimeHitDefPriority(projectile.hitPriority),
    ...(projectile.dizzyPoints === undefined ? {} : { sourceDizzyPoints: Math.trunc(projectile.dizzyPoints) }),
    ...(projectile.guardPoints === undefined ? {} : { sourceGuardPoints: Math.trunc(projectile.guardPoints) }),
    ...((guarded ? projectile.guardRedLife ?? projectile.redLife : projectile.redLife) === undefined
      ? {}
      : { sourceRedLife: Math.trunc((guarded ? projectile.guardRedLife ?? projectile.redLife : projectile.redLife) as number) }),
    ...(projectile.guardPower === undefined ? {} : { sourceGuardPower: Math.trunc(projectile.guardPower) }),
    ...(projectile.hitPower === undefined ? {} : { sourceHitPower: Math.trunc(projectile.hitPower) }),
    ...((guarded ? projectile.guardPower : projectile.hitPower) === undefined
      ? {}
      : { sourcePower: Math.trunc((guarded ? projectile.guardPower : projectile.hitPower) as number) }),
    ...(guarded || projectile.p2Facing === undefined
      ? {}
      : { sourceFacing: Math.trunc(projectile.p2Facing) }),
    ...(projectile.keepState === undefined ? {} : { keepState: projectile.keepState }),
    ...((guarded ? projectile.guardScore ?? projectile.score : projectile.score) === undefined
      ? {}
      : { sourceScore: (guarded ? projectile.guardScore ?? projectile.score : projectile.score) as number }),
    ...(guardCount === undefined || guardCount <= 0 ? {} : { guardCount: Math.max(0, Math.trunc(guardCount)) }),
    ...(comboHitCount === undefined || comboHitCount <= 0 ? {} : { comboHitCount: Math.max(0, Math.trunc(comboHitCount)) }),
    ...(hitVelocityAdd === undefined ? {} : { hitVelocityAdd }),
    frame: true,
    hitId: projectile.targetId,
    ...(projectile.chainId !== undefined ? { chainId: projectile.chainId } : {}),
    hitCount: projectile.hitDefHitCount ?? 1,
    animType: 0,
    groundAnimType: projectile.hitAnimTypes?.ground ?? 0,
    airAnimType: projectile.hitAnimTypes?.air ?? projectile.hitAnimTypes?.ground ?? 0,
    fallAnimType: projectile.hitAnimTypes?.fall ?? 0,
    groundType: 1,
    airType: 1,
    ...(projectile.hitXAccel !== undefined ? { xAccel: projectile.hitXAccel } : {}),
    ...(projectile.hitYAccel !== undefined ? { yAccel: projectile.hitYAccel } : {}),
    ...(projectile.hitZAccel !== undefined ? { zAccel: projectile.hitZAccel } : {}),
    ...(projectile.standFriction !== undefined ? { standFriction: projectile.standFriction } : {}),
    ...(projectile.crouchFriction !== undefined ? { crouchFriction: projectile.crouchFriction } : {}),
    ...(projectile.hitVelocities === undefined ? {} : { hitVelocities: projectile.hitVelocities }),
    isBound: false,
    hitShakeTime,
    hitTime,
    ...(!guarded && projectile.groundSlideTime !== undefined
      ? { slideTime: Math.trunc(projectile.groundSlideTime) }
      : {}),
    ...(guarded ? { guarded: true } : {}),
  };
}

function runtimeKoVelocityAddFromProjectile(projectile: RuntimeProjectile): { x: number; y: number } | undefined {
  const x = projectile.koVelocityAdd?.x;
  const y = projectile.koVelocityAdd?.y;
  const hasX = typeof x === "number" && Number.isFinite(x);
  const hasY = typeof y === "number" && Number.isFinite(y);
  if (!hasX && !hasY) {
    return undefined;
  }
  return { x: hasX ? x! : 0, y: hasY ? y! : 0 };
}

function findProjectileContactAttackBox<TActor extends RuntimeProjectileCombatActor>(
  projectile: RuntimeProjectile,
  defender: TActor,
  hitBoxes: CollisionBox[],
  hurtBoxes: CollisionBox[],
): CollisionBox | undefined {
  for (const hitBox of hitBoxes) {
    const attackBox = runtimeProjectileWorldBox(projectile, hitBox);
    if (hurtBoxes.some((hurtBox) => collisionBoxesIntersect(attackBox, runtimeWorldBox(defender.runtime, hurtBox)))) {
      return attackBox;
    }
  }
  return undefined;
}

function resolveProjectileTargetBoxes<TActor extends RuntimeProjectileCombatActor>(
  input: RuntimeProjectileCombatInput<TActor>,
  projectile: RuntimeProjectile,
  defender: TActor,
  defaultHurtBoxes: CollisionBox[],
): CollisionBox[] | undefined {
  if (!projectileTargetRequirementSatisfied(input, projectile, defender, defaultHurtBoxes)) {
    return undefined;
  }
  const boxType = input.projectileCollisionMode ? "clsn2" : projectile.p2ClsnCheck ?? "clsn2";
  if (boxType === "none") {
    return [];
  }
  return input.getTargetCollisionBoxes?.(defender, boxType) ?? (boxType === "clsn2" ? defaultHurtBoxes : undefined);
}

function projectileTargetRequirementSatisfied<TActor extends RuntimeProjectileCombatActor>(
  input: RuntimeProjectileCombatInput<TActor>,
  projectile: RuntimeProjectile,
  defender: TActor,
  defaultHurtBoxes: CollisionBox[],
): boolean {
  const requiredType = projectile.p2ClsnRequire;
  if (!requiredType || requiredType === "none") {
    return true;
  }
  const requiredBoxes = input.getTargetCollisionBoxes?.(defender, requiredType) ??
    (requiredType === "clsn2" ? defaultHurtBoxes : undefined);
  return Boolean(requiredBoxes?.length);
}

function normalizeGuardTimer(value: number | undefined): number {
  return Math.max(0, Math.trunc(value ?? 0));
}

function projectilesIntersect(left: RuntimeProjectile, right: RuntimeProjectile): boolean {
  return getRuntimeProjectileCollisionBoxes(left, 2).some((leftBox) =>
    getRuntimeProjectileCollisionBoxes(right, 2).some((rightBox) =>
      collisionBoxesIntersect(runtimeProjectileWorldBox(left, leftBox), runtimeProjectileWorldBox(right, rightBox)),
    ),
  );
}

function projectileDepthContactsActor<TActor extends RuntimeProjectileCombatActor>(
  projectile: RuntimeProjectile,
  defender: TActor,
  defenderLocalCoord?: readonly [number, number],
): boolean {
  const defenderDepth = defender.runtime.combatDepth;
  if (!defenderDepth) {
    return true;
  }
  const projectileDepth = runtimeProjectileCombatDepth(projectile);
  return hasRuntimeCombatDepthContact({
    attacker: projectileDepth,
    attackDepth: projectileDepth.attack,
    attackerLocalCoord: projectile.localCoord,
    getter: defenderDepth,
    getterDepth: defenderDepth.size,
    getterLocalCoord: defenderLocalCoord,
  });
}

function projectileDepthContactsAttackDepth<TActor extends RuntimeProjectileCombatActor>(
  projectile: RuntimeProjectile,
  defender: TActor,
  attackDepth: [number, number] | undefined,
  defenderLocalCoord?: readonly [number, number],
): boolean {
  if (!attackDepth || !defender.runtime.combatDepth) {
    return true;
  }
  const projectileDepth = runtimeProjectileCombatDepth(projectile);
  return hasRuntimeCombatDepthContact({
    attacker: projectileDepth,
    attackDepth: projectileDepth.attack,
    attackerLocalCoord: projectile.localCoord,
    getter: defender.runtime.combatDepth,
    getterDepth: attackDepth,
    getterLocalCoord: defenderLocalCoord,
  });
}

function projectilesDepthIntersect(left: RuntimeProjectile, right: RuntimeProjectile): boolean {
  const leftDepth = runtimeProjectileCombatDepth(left);
  const rightDepth = runtimeProjectileCombatDepth(right);
  return hasRuntimeCombatDepthContact({
    attacker: leftDepth,
    attackDepth: leftDepth.attack,
    attackerLocalCoord: left.localCoord,
    getter: rightDepth,
    getterDepth: rightDepth.attack,
    getterLocalCoord: right.localCoord,
  });
}

function projectilesCanClash(left: RuntimeProjectile, right: RuntimeProjectile): boolean {
  return runtimeAffectTeamAllows(runtimeProjectileTeamSide(left), runtimeProjectileTeamSide(right), left.affectTeam)
    && runtimeAffectTeamAllows(runtimeProjectileTeamSide(right), runtimeProjectileTeamSide(left), right.affectTeam);
}

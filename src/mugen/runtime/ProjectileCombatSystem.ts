import type { CollisionBox } from "../model/CollisionBox";
import {
  applyRuntimeDamage,
  canRuntimeDamageKill,
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
} from "./CombatResolver";
import { applyRuntimeCornerPush, type RuntimeStageBounds } from "./HitDefCornerPush";
import {
  canRuntimeProjectileContact,
  describeRuntimeProjectileRemoval,
  getRuntimeProjectileHitboxes,
  markRuntimeProjectileForRemoval,
  recordRuntimeProjectileContact,
  runtimeProjectileWorldBox,
  type RuntimeProjectile,
} from "./ProjectileSystem";
import { applyRuntimeControl, applyRuntimePowerDelta } from "./RuntimeResourceSystem";
import type { CharacterRuntimeState, RuntimeHitOverrideSlot } from "./types";

export type RuntimeProjectileCombatActor = {
  id: string;
  label: string;
  runtime: CharacterRuntimeState;
  hitPause: number;
  hitStun: number;
};

export type RuntimeProjectileCombatInput<TActor extends RuntimeProjectileCombatActor> = {
  attacker: TActor;
  defender: TActor;
  projectiles: RuntimeProjectile[];
  hurtBoxes: CollisionBox[];
  holdingBack: boolean;
  canDefenderBeHit?: (defender: TActor) => boolean;
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
  ) => boolean;
  applyGuardHit?: (defender: TActor) => void;
  applyHitState?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile) => void;
  markDefenderGotHit?: (defender: TActor) => void;
  recordProjectileContact?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile, kind: "hit" | "guard") => void;
  emitProjectileContactEffects?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile, kind: "hit" | "guard") => void;
  recordReceivedDamage?: (defender: TActor, damage: number) => void;
  removeProjectilesMarkedForRemoval: () => void;
  stageBounds?: RuntimeStageBounds;
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
    for (const projectile of input.projectiles) {
      if (!canRuntimeProjectileContact(projectile)) {
        continue;
      }
      const hitBoxes = getRuntimeProjectileHitboxes(projectile);
      const contactAttackBox = findProjectileContactAttackBox(projectile, defender, hitBoxes, hurtBoxes);
      if (!contactAttackBox) {
        continue;
      }
      if (input.applyProjectileReversal?.(attacker, defender, projectile, contactAttackBox)) {
        continue;
      }
      if (input.canDefenderBeHit?.(defender) === false) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via SuperPause unhittable`);
        continue;
      }
      if (!canRuntimeBeHitBy(defender.runtime, projectile.attr ?? "S,SP")) {
        log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via HitBy/NotHitBy`);
        continue;
      }
      const override = findRuntimeHitOverride(defender.runtime, projectile.attr ?? "S,SP", projectile.guardFlag ?? "MA");
      if (override) {
        if (projectile.missOnOverride === true) {
          log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} because missonoverride = 1 forces active override miss`);
          continue;
        }
        recordRuntimeProjectileContact(projectile);
        input.rememberTarget(attacker, defender, projectile.targetId, projectile);
        input.applyHitOverride(attacker, defender, override, projectile.hitPause, log);
        continue;
      }
      const result = resolveRuntimeCombatHit({
        attacker: attacker.runtime,
        defender: defender.runtime,
        attack: {
          damage: projectile.damage,
          kill: projectile.kill,
          attr: projectile.attr,
          hitPause: projectile.hitPause,
          hitStun: projectile.hitStun,
          push: projectile.push,
          hitVelocityY: projectile.hitVelocityY,
          guardDistance: projectile.guardDistance,
          guardFlag: projectile.guardFlag,
          guardDamage: projectile.guardDamage,
          guardKill: projectile.guardKill,
          guardPause: projectile.guardPause,
          guardStun: projectile.guardStun,
          guardSlideTime: projectile.guardSlideTime,
          guardControlTime: projectile.guardControlTime,
          guardPush: projectile.guardPush,
          guardVelocityY: projectile.guardVelocityY,
          airGuardPush: projectile.airGuardPush,
          airGuardVelocityY: projectile.airGuardVelocityY,
          cornerPush: projectile.cornerPush,
          airCornerPush: projectile.airCornerPush,
          downCornerPush: projectile.downCornerPush,
          guardCornerPush: projectile.guardCornerPush,
          airGuardCornerPush: projectile.airGuardCornerPush,
        },
        holdingBack: input.holdingBack,
      });
      recordRuntimeProjectileContact(projectile, result.kind);
      input.rememberTarget(attacker, defender, projectile.targetId, projectile);
      attacker.hitPause = result.pause;
      defender.hitPause = result.pause;
      defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
      defender.runtime.vel.x = projectile.facing * result.push;
      defender.runtime.hitVelocity = { x: projectile.facing * result.push, y: result.hitVelocityY ?? 0 };
      applyRuntimeCornerPush(attacker.runtime, defender.runtime, input.stageBounds, result.cornerPush, result.push);
      if (result.hitVelocityY !== undefined) {
        defender.runtime.vel.y = result.hitVelocityY;
      }
      if (input.markDefenderGotHit) {
        input.markDefenderGotHit(defender);
      } else {
        defender.runtime.moveType = "H";
      }
      applyRuntimePowerDelta(attacker.runtime, result.powerGain);
      if (result.kind === "guard") {
        input.recordProjectileContact?.(attacker, defender, projectile, "guard");
        input.emitProjectileContactEffects?.(attacker, defender, projectile, "guard");
        defender.runtime.guardStun = result.stun;
        defender.runtime.guardSlideTime = result.slideTime ?? 0;
        defender.runtime.guardControlTime = result.controlTime ?? 0;
        defender.runtime.guarding = true;
        defender.runtime.hitVars = runtimeGetHitVarsFromProjectileResult(projectile, true, result.damage, result.stun, result.pause, result.kill);
        applyRuntimeControl(defender.runtime, false);
        input.applyGuardHit?.(defender);
        log(
          `${defender.label} guarded ${attacker.label} projectile for ${result.damage}; hits remaining ${projectile.hitsRemaining}, miss ${projectile.missTimeRemaining}; ${describeRuntimeProjectileRemoval(projectile)}`,
        );
        continue;
      }
      input.recordProjectileContact?.(attacker, defender, projectile, "hit");
      input.emitProjectileContactEffects?.(attacker, defender, projectile, "hit");
      defender.hitStun = result.stun;
      defender.runtime.guardStun = 0;
      defender.runtime.guardSlideTime = 0;
      defender.runtime.guardControlTime = 0;
      defender.runtime.guarding = false;
      defender.runtime.receivedHitSequence = (defender.runtime.receivedHitSequence ?? 0) + 1;
      defender.runtime.hitVars = runtimeGetHitVarsFromProjectileResult(projectile, false, result.damage, result.stun, result.pause, result.kill);
      input.applyHitState?.(attacker, defender, projectile);
      input.recordReceivedDamage?.(defender, result.damage);
      log(
        `${attacker.label} projectile hit ${defender.label} for ${result.damage}; hits remaining ${projectile.hitsRemaining}, miss ${projectile.missTimeRemaining}; ${describeRuntimeProjectileRemoval(projectile)}`,
      );
    }
    input.removeProjectilesMarkedForRemoval();
  }

  resolveClashes(input: RuntimeProjectileClashInput): void {
    const { leftLabel, rightLabel, log } = input;
    for (const left of input.leftProjectiles) {
      if (!canRuntimeProjectileContact(left)) {
        continue;
      }
      for (const right of input.rightProjectiles) {
        if (!canRuntimeProjectileContact(left) || !canRuntimeProjectileContact(right)) {
          continue;
        }
        if (!projectilesIntersect(left, right)) {
          continue;
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
    input.removeProjectilesMarkedForRemoval();
  }
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

function runtimeGetHitVarsFromProjectileResult(
  projectile: RuntimeProjectile,
  guarded: boolean,
  damage: number,
  hitTime: number,
  hitShakeTime: number,
  kill: boolean,
): CharacterRuntimeState["hitVars"] {
  return {
    damage: Math.max(0, Math.round(damage)),
    kill,
    hitId: projectile.targetId,
    ...(projectile.chainId !== undefined ? { chainId: projectile.chainId } : {}),
    hitCount: projectile.hitDefHitCount ?? 1,
    animType: 0,
    groundType: 1,
    airType: 1,
    isBound: false,
    hitShakeTime,
    hitTime,
    ...(guarded ? { guarded: true } : {}),
  };
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

function projectilesIntersect(left: RuntimeProjectile, right: RuntimeProjectile): boolean {
  return getRuntimeProjectileHitboxes(left).some((leftBox) =>
    getRuntimeProjectileHitboxes(right).some((rightBox) =>
      collisionBoxesIntersect(runtimeProjectileWorldBox(left, leftBox), runtimeProjectileWorldBox(right, rightBox)),
    ),
  );
}

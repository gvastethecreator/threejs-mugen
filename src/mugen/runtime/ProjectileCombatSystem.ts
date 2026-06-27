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
import {
  canRuntimeProjectileContact,
  describeRuntimeProjectileRemoval,
  getRuntimeProjectileHitboxes,
  markRuntimeProjectileForRemoval,
  recordRuntimeProjectileContact,
  runtimeProjectileWorldBox,
  type RuntimeProjectile,
} from "./ProjectileSystem";
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
  log: (line: string) => void;
  rememberTarget: (attacker: TActor, defender: TActor, targetId: number | undefined) => void;
  applyHitOverride: (
    attacker: TActor,
    defender: TActor,
    override: RuntimeHitOverrideSlot,
    hitPause: number,
    log: (line: string) => void,
  ) => void;
  applyGuardHit?: (defender: TActor) => void;
  applyHitState?: (defender: TActor) => void;
  markDefenderGotHit?: (defender: TActor) => void;
  recordProjectileContact?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile, kind: "hit" | "guard") => void;
  recordReceivedDamage?: (defender: TActor, damage: number) => void;
  removeProjectilesMarkedForRemoval: () => void;
};

export type RuntimeProjectileClashInput = {
  leftLabel: string;
  rightLabel: string;
  leftProjectiles: RuntimeProjectile[];
  rightProjectiles: RuntimeProjectile[];
  log: (line: string) => void;
  removeProjectilesMarkedForRemoval: () => void;
};

export function resolveRuntimeProjectileCombat<TActor extends RuntimeProjectileCombatActor>(
  input: RuntimeProjectileCombatInput<TActor>,
): void {
  const { attacker, defender, hurtBoxes, log } = input;
  for (const projectile of input.projectiles) {
    if (!canRuntimeProjectileContact(projectile)) {
      continue;
    }
    const hitBoxes = getRuntimeProjectileHitboxes(projectile);
    const hit = hitBoxes.some((hitBox) =>
      hurtBoxes.some((hurtBox) =>
        collisionBoxesIntersect(runtimeProjectileWorldBox(projectile, hitBox), runtimeWorldBox(defender.runtime, hurtBox)),
      ),
    );
    if (!hit) {
      continue;
    }
    if (!canRuntimeBeHitBy(defender.runtime, projectile.attr ?? "S,SP")) {
      log(`${defender.label} rejected ${attacker.label} projectile ${projectile.attr ?? "S,SP"} via HitBy/NotHitBy`);
      continue;
    }
    const override = findRuntimeHitOverride(defender.runtime, projectile.attr ?? "S,SP");
    if (override) {
      recordRuntimeProjectileContact(projectile);
      input.rememberTarget(attacker, defender, projectile.targetId);
      input.applyHitOverride(attacker, defender, override, projectile.hitPause, log);
      continue;
    }
    recordRuntimeProjectileContact(projectile);
    input.rememberTarget(attacker, defender, projectile.targetId);
    const result = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: defender.runtime,
      attack: {
        damage: projectile.damage,
        attr: projectile.attr,
        hitPause: projectile.hitPause,
        hitStun: projectile.hitStun,
        push: projectile.push,
        hitVelocityY: projectile.hitVelocityY,
        guardDistance: projectile.guardDistance,
        guardFlag: projectile.guardFlag,
        guardDamage: projectile.guardDamage,
        guardPause: projectile.guardPause,
        guardStun: projectile.guardStun,
        guardSlideTime: projectile.guardSlideTime,
        guardControlTime: projectile.guardControlTime,
        guardPush: projectile.guardPush,
        guardVelocityY: projectile.guardVelocityY,
      },
      holdingBack: input.holdingBack,
    });
    attacker.hitPause = result.pause;
    defender.hitPause = result.pause;
    defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
    defender.runtime.vel.x = projectile.facing * result.push;
    defender.runtime.hitVelocity = { x: projectile.facing * result.push, y: result.hitVelocityY ?? 0 };
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    if (input.markDefenderGotHit) {
      input.markDefenderGotHit(defender);
    } else {
      defender.runtime.moveType = "H";
    }
    attacker.runtime.power = Math.min(3000, attacker.runtime.power + result.powerGain);
    if (result.kind === "guard") {
      input.recordProjectileContact?.(attacker, defender, projectile, "guard");
      defender.runtime.guardStun = result.stun;
      defender.runtime.guardSlideTime = result.slideTime ?? 0;
      defender.runtime.guardControlTime = result.controlTime ?? 0;
      defender.runtime.guarding = true;
      defender.runtime.ctrl = false;
      input.applyGuardHit?.(defender);
      log(
        `${defender.label} guarded ${attacker.label} projectile for ${result.damage}; hits remaining ${projectile.hitsRemaining}, miss ${projectile.missTimeRemaining}; ${describeRuntimeProjectileRemoval(projectile)}`,
      );
      continue;
    }
    input.recordProjectileContact?.(attacker, defender, projectile, "hit");
    defender.hitStun = result.stun;
    defender.runtime.guardStun = 0;
    defender.runtime.guardSlideTime = 0;
    defender.runtime.guardControlTime = 0;
    defender.runtime.guarding = false;
    input.applyHitState?.(defender);
    input.recordReceivedDamage?.(defender, result.damage);
    log(
      `${attacker.label} projectile hit ${defender.label} for ${result.damage}; hits remaining ${projectile.hitsRemaining}, miss ${projectile.missTimeRemaining}; ${describeRuntimeProjectileRemoval(projectile)}`,
    );
  }
  input.removeProjectilesMarkedForRemoval();
}

export function resolveRuntimeProjectileClashes(input: RuntimeProjectileClashInput): void {
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
        log(
          `Projectile clash: ${leftLabel} ${left.serialId} traded with ${rightLabel} ${right.serialId} at priority ${left.priority}; ${left.serialId} ${describeRuntimeProjectileRemoval(left)}; ${right.serialId} ${describeRuntimeProjectileRemoval(right)}`,
        );
      } else if (left.priority > right.priority) {
        const previousPriority = left.priority;
        left.priority = decrementProjectilePriority(left.priority);
        markRuntimeProjectileForRemoval(right, "cancel");
        log(
          `Projectile clash: ${leftLabel} ${left.serialId} canceled ${rightLabel} ${right.serialId} by priority ${previousPriority} > ${right.priority}; winner priority ${previousPriority} -> ${left.priority}; ${right.serialId} ${describeRuntimeProjectileRemoval(right)}`,
        );
      } else {
        const previousPriority = right.priority;
        right.priority = decrementProjectilePriority(right.priority);
        markRuntimeProjectileForRemoval(left, "cancel");
        log(
          `Projectile clash: ${rightLabel} ${right.serialId} canceled ${leftLabel} ${left.serialId} by priority ${previousPriority} > ${left.priority}; winner priority ${previousPriority} -> ${right.priority}; ${left.serialId} ${describeRuntimeProjectileRemoval(left)}`,
        );
      }
    }
  }
  input.removeProjectilesMarkedForRemoval();
}

function decrementProjectilePriority(priority: number): number {
  return Math.max(0, priority - 1);
}

function projectilesIntersect(left: RuntimeProjectile, right: RuntimeProjectile): boolean {
  return getRuntimeProjectileHitboxes(left).some((leftBox) =>
    getRuntimeProjectileHitboxes(right).some((rightBox) =>
      collisionBoxesIntersect(runtimeProjectileWorldBox(left, leftBox), runtimeProjectileWorldBox(right, rightBox)),
    ),
  );
}

import type { CollisionBox } from "../model/CollisionBox";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
} from "./CombatResolver";
import { getRuntimeProjectileHitboxes, runtimeProjectileWorldBox, type RuntimeProjectile } from "./ProjectileSystem";
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
    if (projectile.hasHit) {
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
      projectile.hasHit = true;
      input.rememberTarget(attacker, defender, projectile.targetId);
      input.applyHitOverride(attacker, defender, override, projectile.hitPause, log);
      continue;
    }
    projectile.hasHit = true;
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
    defender.runtime.life = Math.max(0, defender.runtime.life - result.damage);
    defender.runtime.vel.x = projectile.facing * result.push;
    defender.runtime.hitVelocity = { x: projectile.facing * result.push, y: result.hitVelocityY ?? 0 };
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    defender.runtime.moveType = "H";
    attacker.runtime.power = Math.min(3000, attacker.runtime.power + result.powerGain);
    if (result.kind === "guard") {
      defender.runtime.guardStun = result.stun;
      defender.runtime.guardSlideTime = result.slideTime ?? 0;
      defender.runtime.guardControlTime = result.controlTime ?? 0;
      defender.runtime.guarding = true;
      defender.runtime.ctrl = false;
      input.applyGuardHit?.(defender);
      log(`${defender.label} guarded ${attacker.label} projectile for ${result.damage}`);
      continue;
    }
    defender.hitStun = result.stun;
    defender.runtime.guardStun = 0;
    defender.runtime.guardSlideTime = 0;
    defender.runtime.guardControlTime = 0;
    defender.runtime.guarding = false;
    log(`${attacker.label} projectile hit ${defender.label} for ${result.damage}`);
  }
  input.removeProjectilesMarkedForRemoval();
}

export function resolveRuntimeProjectileClashes(input: RuntimeProjectileClashInput): void {
  const { leftLabel, rightLabel, log } = input;
  for (const left of input.leftProjectiles) {
    if (left.hasHit) {
      continue;
    }
    for (const right of input.rightProjectiles) {
      if (left.hasHit || right.hasHit) {
        continue;
      }
      if (!projectilesIntersect(left, right)) {
        continue;
      }
      if (left.priority === right.priority) {
        left.hasHit = true;
        right.hasHit = true;
        log(`Projectile clash: ${leftLabel} ${left.serialId} traded with ${rightLabel} ${right.serialId} at priority ${left.priority}`);
      } else if (left.priority > right.priority) {
        right.hasHit = true;
        log(
          `Projectile clash: ${leftLabel} ${left.serialId} canceled ${rightLabel} ${right.serialId} by priority ${left.priority} > ${right.priority}`,
        );
      } else {
        left.hasHit = true;
        log(
          `Projectile clash: ${rightLabel} ${right.serialId} canceled ${leftLabel} ${left.serialId} by priority ${right.priority} > ${left.priority}`,
        );
      }
    }
  }
  input.removeProjectilesMarkedForRemoval();
}

function projectilesIntersect(left: RuntimeProjectile, right: RuntimeProjectile): boolean {
  return getRuntimeProjectileHitboxes(left).some((leftBox) =>
    getRuntimeProjectileHitboxes(right).some((rightBox) =>
      collisionBoxesIntersect(runtimeProjectileWorldBox(left, leftBox), runtimeProjectileWorldBox(right, rightBox)),
    ),
  );
}

import type { CollisionBox } from "../model/CollisionBox";
import type { ProjectileControllerOp } from "../compiler/ControllerOps";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { ActorSnapshot } from "./types";

export type RuntimeProjectile = {
  serialId: string;
  projectileId?: number;
  actorKind: "projectile";
  ownerId: string;
  rootId: string;
  parentId: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  action: MugenAnimationAction;
  animNo: number;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  facing: 1 | -1;
  frameIndex: number;
  frameElapsed: number;
  age: number;
  removeTime: number;
  spritePriority: number;
  priority: number;
  opacity: number;
  damage: number;
  attr?: string;
  targetId?: number;
  hitPause: number;
  hitStun: number;
  push: number;
  hitVelocityY?: number;
  guardDamage: number;
  guardDistance: number;
  guardFlag?: string;
  guardPause: number;
  guardStun: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guardPush: number;
  guardVelocityY?: number;
  hitbox: CollisionBox;
  removeOnHit: boolean;
  hasHit: boolean;
};

export type RuntimeProjectileSpawnInput = {
  serialId: string;
  controller: MugenStateController;
  operation?: ProjectileControllerOp;
  ownerId?: string;
  rootId?: string;
  parentId?: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  action: MugenAnimationAction;
  animNo: number;
  pos: { x: number; y: number };
  fallbackFacing: 1 | -1;
  damageScale?: number;
};

export function createRuntimeProjectile(input: RuntimeProjectileSpawnInput): RuntimeProjectile {
  const operation = input.operation;
  const forcedFacing = operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const facing = forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing;
  const rawVelocity = operation?.velocity ?? numberPair(findControllerParam(input.controller, "velocity") ?? findControllerParam(input.controller, "vel")) ?? [0, 0];
  const groundVelocity = normalizeOptionalVelocityPair(operation?.groundVelocity) ?? velocityPair(findControllerParam(input.controller, "ground.velocity"));
  const frame = input.action.frames[0];
  const projectileId = operation?.projectileId ?? firstNumber(findControllerParam(input.controller, "projid") ?? findControllerParam(input.controller, "id"));
  const baseDamage = Math.max(0, operation?.damage ?? firstNumber(findControllerParam(input.controller, "damage")) ?? 30);
  const hitPause = Math.max(0, Math.round(operation?.hitPause ?? firstNumber(findControllerParam(input.controller, "pausetime")) ?? 6));
  const hitStun = Math.max(1, Math.round(operation?.hitStun ?? firstNumber(findControllerParam(input.controller, "ground.hittime")) ?? 18));
  const push = Math.abs(groundVelocity?.[0] ?? 18);
  const guardVelocity = normalizeOptionalVelocityPair(operation?.guardVelocity) ?? velocityPair(findControllerParam(input.controller, "guard.velocity"));
  const guardDamage = Math.max(0, operation?.guardDamage ?? secondNumber(findControllerParam(input.controller, "damage")) ?? 0);
  const guardPause = Math.max(
    0,
    Math.round(operation?.guardPauseTime ?? firstNumber(findControllerParam(input.controller, "guard.pausetime")) ?? Math.max(1, Math.round(hitPause * 0.75))),
  );
  const guardStun = Math.max(
    1,
    Math.round(operation?.guardHitTime ?? firstNumber(findControllerParam(input.controller, "guard.hittime")) ?? Math.max(1, Math.round(hitStun * 0.55))),
  );
  const guardSlideTime = operation?.guardSlideTime ?? firstNumber(findControllerParam(input.controller, "guard.slidetime"));
  const guardControlTime = operation?.guardControlTime ?? firstNumber(findControllerParam(input.controller, "guard.ctrltime"));
  const identity = resolveActorIdentity(input);
  return {
    serialId: input.serialId,
    projectileId,
    ...identity,
    spriteOwnerId: input.spriteOwnerId,
    spriteOwnerDefinitionId: input.spriteOwnerDefinitionId,
    spriteOwnerLabel: input.spriteOwnerLabel,
    action: input.action,
    animNo: input.animNo,
    pos: input.pos,
    vel: { x: rawVelocity[0] * facing, y: rawVelocity[1] },
    facing,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: clampProjectileTime(operation?.removeTime ?? firstNumber(findControllerParam(input.controller, "projremovetime") ?? findControllerParam(input.controller, "removetime")) ?? -1),
    spritePriority: Math.max(-5, Math.min(10, Math.round(operation?.spritePriority ?? firstNumber(findControllerParam(input.controller, "sprpriority")) ?? 4))),
    priority: clampProjectilePriority(operation?.priority ?? firstNumber(findControllerParam(input.controller, "projpriority") ?? findControllerParam(input.controller, "priority")) ?? 1),
    opacity: parseProjectileOpacity(operation?.trans ?? findControllerParam(input.controller, "trans")),
    damage: Math.max(0, Math.round(baseDamage * (input.damageScale ?? 1))),
    attr: operation?.attr ?? stripMugenString(findControllerParam(input.controller, "attr")) ?? "S,SP",
    targetId: projectileId,
    hitPause,
    hitStun,
    push,
    hitVelocityY: groundVelocity?.[1],
    guardDamage,
    guardDistance: Math.max(0, Math.round(operation?.guardDistance ?? firstNumber(findControllerParam(input.controller, "guard.dist")) ?? 0)),
    guardFlag: operation?.guardFlag ?? stripMugenString(findControllerParam(input.controller, "guardflag")) ?? "MA",
    guardPause,
    guardStun,
    guardSlideTime,
    guardControlTime,
    guardPush: Math.abs(guardVelocity?.[0] ?? Math.max(1, Math.round(push * 0.55))),
    guardVelocityY: guardVelocity?.[1],
    hitbox: cloneBox(frame?.clsn1[0] ?? { x1: 8, y1: -48, x2: 56, y2: -18 }),
    removeOnHit: operation?.removeOnHit ?? (firstNumber(findControllerParam(input.controller, "projremove")) ?? 1) !== 0,
    hasHit: false,
  };
}

export function advanceRuntimeProjectiles(
  projectiles: RuntimeProjectile[],
  stage: Pick<MugenStageDefinition, "bounds">,
): RuntimeProjectile[] {
  for (const projectile of projectiles) {
    projectile.age += 1;
    projectile.pos.x += projectile.vel.x;
    projectile.pos.y += projectile.vel.y;
    projectile.frameElapsed += 1;
    const frame = projectile.action.frames[projectile.frameIndex];
    if (frame && projectile.frameElapsed >= Math.max(1, frame.duration)) {
      projectile.frameElapsed = 0;
      const next = projectile.frameIndex + 1;
      projectile.frameIndex =
        next < projectile.action.frames.length ? next : projectile.action.loopStart ?? projectile.action.frames.length - 1;
    }
  }
  const margin = 240;
  return projectiles.filter((projectile) => {
    if (projectile.hasHit && projectile.removeOnHit) {
      return false;
    }
    if (projectile.removeTime >= 0 && projectile.age >= projectile.removeTime) {
      return false;
    }
    return (
      projectile.pos.x >= stage.bounds.left - margin &&
      projectile.pos.x <= stage.bounds.right + margin &&
      projectile.pos.y >= -360 &&
      projectile.pos.y <= 180
    );
  });
}

export function runtimeProjectilesToSnapshots(projectiles: RuntimeProjectile[], sourceStateNo: number): ActorSnapshot[] {
  return projectiles
    .map((projectile): ActorSnapshot | undefined => {
      const frame = projectile.action.frames[projectile.frameIndex];
      if (!frame) {
        return undefined;
      }
      return {
        id: projectile.serialId,
        label: `Projectile ${projectile.projectileId ?? projectile.animNo}`,
        actorKind: "projectile",
        ownerId: projectile.ownerId,
        rootId: projectile.rootId,
        parentId: projectile.parentId,
        source: "effect",
        spriteOwnerId: projectile.spriteOwnerId,
        spriteOwnerDefinitionId: projectile.spriteOwnerDefinitionId,
        spriteOwnerLabel: projectile.spriteOwnerLabel,
        runtime: {
          pos: { ...projectile.pos },
          vel: { ...projectile.vel },
          facing: projectile.facing,
          spritePriority: projectile.spritePriority,
          stateNo: sourceStateNo,
          animNo: projectile.animNo,
          animTime: projectile.age,
          frameIndex: projectile.frameIndex,
          life: 0,
          power: 0,
          ctrl: false,
          stateType: "S",
          moveType: "A",
          physics: "N",
          vars: [],
          fvars: [],
          renderOpacity: projectile.opacity,
        },
        frame,
        clsn1: getRuntimeProjectileHitboxes(projectile).map(cloneBox),
        clsn2: frame.clsn2.map(cloneBox),
      };
    })
    .filter((snapshot): snapshot is ActorSnapshot => snapshot !== undefined);
}

function resolveActorIdentity(input: RuntimeProjectileSpawnInput): Pick<
  RuntimeProjectile,
  "actorKind" | "ownerId" | "rootId" | "parentId"
> {
  const ownerId = input.ownerId ?? input.spriteOwnerId;
  const rootId = input.rootId ?? ownerId;
  const parentId = input.parentId ?? ownerId;
  return { actorKind: "projectile", ownerId, rootId, parentId };
}

export function runtimeProjectileWorldBox(projectile: RuntimeProjectile, box: CollisionBox): CollisionBox {
  if (projectile.facing === 1) {
    return {
      x1: projectile.pos.x + box.x1,
      x2: projectile.pos.x + box.x2,
      y1: projectile.pos.y + box.y1,
      y2: projectile.pos.y + box.y2,
    };
  }
  return {
    x1: projectile.pos.x - box.x2,
    x2: projectile.pos.x - box.x1,
    y1: projectile.pos.y + box.y1,
    y2: projectile.pos.y + box.y2,
  };
}

export function getRuntimeProjectileHitboxes(projectile: RuntimeProjectile): CollisionBox[] {
  const frame = projectile.action.frames[projectile.frameIndex];
  return frame?.clsn1.length ? frame.clsn1 : [projectile.hitbox];
}

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? numbers[0]];
}

function velocityPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? 0];
}

function normalizeOptionalVelocityPair(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? [value[0], value[1] ?? 0] : undefined;
}

function clampProjectileTime(value: number): number {
  return value < 0 ? -1 : Math.max(1, Math.min(1200, Math.round(value)));
}

function clampProjectilePriority(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function parseProjectileOpacity(value: string | undefined): number {
  if (!value) {
    return 1;
  }
  const lower = value.toLowerCase();
  if (lower.includes("add")) {
    return 0.78;
  }
  if (lower.includes("none")) {
    return 0.9;
  }
  return 1;
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

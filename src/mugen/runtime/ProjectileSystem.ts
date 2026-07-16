import type { CollisionBox } from "../model/CollisionBox";
import type { ModifyProjectileControllerOp, ProjectileControllerOp } from "../compiler/ControllerOps";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { resolveHitDefCornerPush } from "./HitDefCornerPush";
import { resolveHitDefGuardTiming } from "./HitDefTiming";
import { deriveDefaultAirGuardVelocity } from "./HitDefVelocity";
import { findControllerParam } from "./StateProgramExecutor";
import { runtimeTeamSideFromId, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { ActorSnapshot, RuntimeResolvedSoundRef } from "./types";

const DEFAULT_PROJECTILE_EDGE_BOUND = 40;
const DEFAULT_PROJECTILE_STAGE_BOUND = 40;
const DEFAULT_PROJECTILE_HEIGHT_BOUND = { low: -240, high: 1 } as const;
const DEFAULT_PROJECTILE_LOCAL_COORD_WIDTH = 320;

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
  accel: { x: number; y: number };
  velMul: { x: number; y: number };
  scale: { x: number; y: number };
  facing: 1 | -1;
  hitAnimNo?: number;
  removeAnimNo?: number;
  cancelAnimNo?: number;
  removalReason?: RuntimeProjectileRemovalReason;
  removalAnimNo?: number;
  terminalActions: RuntimeProjectileTerminalActions;
  terminalPlayback?: RuntimeProjectileTerminalPlayback;
  frameIndex: number;
  frameElapsed: number;
  age: number;
  removeTime: number;
  edgeBound?: number;
  stageBound: number;
  heightBound?: { low: number; high: number };
  spritePriority: number;
  priority: number;
  hitsRemaining: number;
  missTime: number;
  missTimeRemaining: number;
  opacity: number;
  damage: number;
  kill: boolean;
  guardKill: boolean;
  attr?: string;
  targetId?: number;
  chainId?: number;
  hitDefHitCount?: number;
  teamSide?: RuntimeTeamSide;
  hitPause: number;
  hitStun: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  missOnOverride?: boolean;
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
  airGuardPush?: number;
  airGuardVelocityY?: number;
  cornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
  hitSound?: string;
  hitSoundValue?: RuntimeResolvedSoundRef;
  guardSound?: string;
  guardSoundValue?: RuntimeResolvedSoundRef;
  hitSpark?: string;
  guardSpark?: string;
  sparkXy?: [number, number];
  hitbox: CollisionBox;
  removeOnHit: boolean;
  hasHit: boolean;
  lastContactKind?: RuntimeProjectileContactKind;
  lastContactTime?: number;
  lastCancelTime?: number;
};

export type RuntimeProjectileRemovalReason = "hit" | "timeout" | "bounds" | "cancel";
export type RuntimeProjectileContactKind = "contact" | "hit" | "guard";

export type RuntimeProjectileTerminalActions = {
  hit?: MugenAnimationAction;
  remove?: MugenAnimationAction;
  cancel?: MugenAnimationAction;
};

export type RuntimeProjectileTerminalPlayback = {
  reason: RuntimeProjectileRemovalReason;
  duration: number;
  age: number;
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
  terminalActions?: RuntimeProjectileTerminalActions;
  pos: { x: number; y: number };
  fallbackFacing: 1 | -1;
  localCoord?: [number, number];
  damageScale?: number;
  resolveSoundValue?: (key: "hitsound" | "guardsound") => RuntimeResolvedSoundRef | undefined;
};

export type RuntimeProjectileModifyInput = {
  controller: MugenStateController;
  operation?: ModifyProjectileControllerOp;
  resolveModifyProjectile?: RuntimeProjectileModifyResolver;
};

export type RuntimeModifyProjectileNumberParam =
  | "projid"
  | "projedgebound"
  | "projstagebound"
  | "projremovetime"
  | "sprpriority"
  | "projpriority"
  | "projhits"
  | "projmisstime"
  | "teamside"
  | "projremove";
export type RuntimeModifyProjectilePairParam = "velocity" | "accel" | "velmul" | "projscale" | "projheightbound";

export type RuntimeProjectileModifyResolver = {
  resolveNumber?: (key: RuntimeModifyProjectileNumberParam) => number | undefined;
  resolvePair?: (key: RuntimeModifyProjectilePairParam) => [number, number] | undefined;
};

export function createRuntimeProjectile(input: RuntimeProjectileSpawnInput): RuntimeProjectile {
  const operation = input.operation;
  const forcedFacing = operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const facing = forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing;
  const rawVelocity = operation?.velocity ?? numberPair(findControllerParam(input.controller, "velocity") ?? findControllerParam(input.controller, "vel")) ?? [0, 0];
  const rawAcceleration = operation?.acceleration ?? numberPair(findControllerParam(input.controller, "accel")) ?? [0, 0];
  const rawVelocityMultiplier = operation?.velocityMultiplier ?? scalePair(findControllerParam(input.controller, "velmul")) ?? [1, 1];
  const rawScale = operation?.scale ?? scalePair(findControllerParam(input.controller, "projscale") ?? findControllerParam(input.controller, "scale")) ?? [1, 1];
  const groundVelocity = normalizeOptionalVelocityPair(operation?.groundVelocity) ?? velocityPair(findControllerParam(input.controller, "ground.velocity"));
  const frame = input.action.frames[0];
  const projectileId = operation?.projectileId ?? firstNumber(findControllerParam(input.controller, "projid") ?? findControllerParam(input.controller, "id")) ?? 0;
  const targetId = operation?.targetId ?? firstNumber(findControllerParam(input.controller, "id")) ?? projectileId;
  const chainId = operation?.chainId ?? firstNumber(findControllerParam(input.controller, "chainid"));
  const hitDefHitCount = operation?.hitDefHitCount ?? firstNumber(findControllerParam(input.controller, "numhits")) ?? 1;
  const teamSide = operation?.teamSide ?? normalizeRuntimeProjectileTeamSide(firstNumber(findControllerParam(input.controller, "teamside")));
  const baseDamage = Math.max(0, operation?.damage ?? firstNumber(findControllerParam(input.controller, "damage")) ?? 30);
  const hitPause = Math.max(0, Math.round(operation?.hitPause ?? firstNumber(findControllerParam(input.controller, "pausetime")) ?? 6));
  const hitStun = Math.max(1, Math.round(operation?.hitStun ?? firstNumber(findControllerParam(input.controller, "ground.hittime")) ?? 18));
  const push = Math.abs(groundVelocity?.[0] ?? 18);
  const guardVelocity = normalizeOptionalVelocityPair(operation?.guardVelocity) ?? velocityPair(findControllerParam(input.controller, "guard.velocity"));
  const guardVelocityX = guardVelocity?.[0] ?? groundVelocity?.[0];
  const airVelocity = normalizeOptionalVelocityPair(operation?.airVelocity) ?? velocityPair(findControllerParam(input.controller, "air.velocity"));
  const airGuardVelocity =
    normalizeOptionalVelocityPair(operation?.airGuardVelocity) ??
    velocityPair(findControllerParam(input.controller, "airguard.velocity")) ??
    deriveDefaultAirGuardVelocity(airVelocity);
  const guardDamage = Math.max(0, operation?.guardDamage ?? secondNumber(findControllerParam(input.controller, "damage")) ?? 0);
  const defaultBoundScale = projectileDefaultBoundScale(input.localCoord);
  const edgeBound = operation?.edgeBound ?? firstNumber(findControllerParam(input.controller, "projedgebound"));
  const stageBound = operation?.stageBound ?? firstNumber(findControllerParam(input.controller, "projstagebound"));
  const heightBound = operation?.heightBound ?? projectileHeightBound(numberPair(findControllerParam(input.controller, "projheightbound")));
  const guardPause = Math.max(
    0,
    Math.round(operation?.guardPauseTime ?? firstNumber(findControllerParam(input.controller, "guard.pausetime")) ?? Math.max(1, Math.round(hitPause * 0.75))),
  );
  const guardTiming = resolveHitDefGuardTiming({
    groundHitTime: hitStun,
    guardHitTime: operation?.guardHitTime ?? firstNumber(findControllerParam(input.controller, "guard.hittime")),
    guardSlideTime: operation?.guardSlideTime ?? firstNumber(findControllerParam(input.controller, "guard.slidetime")),
    guardControlTime: operation?.guardControlTime ?? firstNumber(findControllerParam(input.controller, "guard.ctrltime")),
  });
  const guardStun = Math.max(1, Math.round(guardTiming.guardHitTime ?? Math.max(1, Math.round(hitStun * 0.55))));
  const guardSlideTime = guardTiming.guardSlideTime;
  const guardControlTime = guardTiming.guardControlTime;
  const attr = operation?.attr ?? stripMugenString(findControllerParam(input.controller, "attr")) ?? "S,SP";
  const cornerPush = resolveHitDefCornerPush({
    attr,
    guardVelocityX,
    groundCornerPush: operation?.groundCornerPush ?? firstNumber(findControllerParam(input.controller, "ground.cornerpush.veloff")),
    airCornerPush: operation?.airCornerPush ?? firstNumber(findControllerParam(input.controller, "air.cornerpush.veloff")),
    downCornerPush: operation?.downCornerPush ?? firstNumber(findControllerParam(input.controller, "down.cornerpush.veloff")),
    guardCornerPush: operation?.guardCornerPush ?? firstNumber(findControllerParam(input.controller, "guard.cornerpush.veloff")),
    airGuardCornerPush: operation?.airGuardCornerPush ?? firstNumber(findControllerParam(input.controller, "airguard.cornerpush.veloff")),
  });
  const hitSound = operation?.hitSound ?? stripMugenString(findControllerParam(input.controller, "hitsound"));
  const guardSound = operation?.guardSound ?? stripMugenString(findControllerParam(input.controller, "guardsound"));
  const hitSoundValue = input.resolveSoundValue?.("hitsound");
  const guardSoundValue = input.resolveSoundValue?.("guardsound");
  const hitSpark = operation?.hitSpark ?? stripMugenString(findControllerParam(input.controller, "sparkno"));
  const guardSpark = operation?.guardSpark ?? stripMugenString(findControllerParam(input.controller, "guard.sparkno"));
  const sparkXy = operation?.sparkXy ?? numberPair(findControllerParam(input.controller, "sparkxy"));
  const kill = operation?.kill ?? (firstNumber(findControllerParam(input.controller, "kill")) ?? 1) !== 0;
  const guardKill = operation?.guardKill ?? (firstNumber(findControllerParam(input.controller, "guard.kill")) ?? 1) !== 0;
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
    accel: { x: rawAcceleration[0] * facing, y: rawAcceleration[1] },
    velMul: pairToVelocityMultiplier(rawVelocityMultiplier),
    scale: pairToScale(rawScale),
    facing,
    hitAnimNo: normalizeProjectileAnim(operation?.hitAnim ?? firstNumber(findControllerParam(input.controller, "projhitanim"))),
    removeAnimNo: normalizeProjectileAnim(operation?.removeAnim ?? firstNumber(findControllerParam(input.controller, "projremanim"))),
    cancelAnimNo: normalizeProjectileAnim(operation?.cancelAnim ?? firstNumber(findControllerParam(input.controller, "projcancelanim"))),
    terminalActions: input.terminalActions ?? {},
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: clampProjectileTime(operation?.removeTime ?? firstNumber(findControllerParam(input.controller, "projremovetime") ?? findControllerParam(input.controller, "removetime")) ?? -1),
    edgeBound: clampProjectileStageBound(edgeBound ?? scaledDefaultProjectileBound(DEFAULT_PROJECTILE_EDGE_BOUND, defaultBoundScale)),
    stageBound: clampProjectileStageBound(stageBound ?? scaledDefaultProjectileBound(DEFAULT_PROJECTILE_STAGE_BOUND, defaultBoundScale)),
    heightBound: optionalProjectileHeightBound(heightBound) ?? defaultProjectileHeightBound(defaultBoundScale),
    spritePriority: Math.max(-5, Math.min(10, Math.round(operation?.spritePriority ?? firstNumber(findControllerParam(input.controller, "sprpriority")) ?? 4))),
    priority: clampProjectilePriority(operation?.priority ?? firstNumber(findControllerParam(input.controller, "projpriority") ?? findControllerParam(input.controller, "priority")) ?? 1),
    hitsRemaining: clampProjectileHits(operation?.hitCount ?? firstNumber(findControllerParam(input.controller, "projhits")) ?? 1),
    missTime: clampProjectileMissTime(operation?.missTime ?? firstNumber(findControllerParam(input.controller, "projmisstime")) ?? 0),
    missTimeRemaining: 0,
    opacity: parseProjectileOpacity(operation?.trans ?? findControllerParam(input.controller, "trans")),
    damage: Math.max(0, Math.round(baseDamage * (input.damageScale ?? 1))),
    kill,
    guardKill,
    attr,
    targetId,
    chainId,
    hitDefHitCount: Math.max(0, Math.trunc(hitDefHitCount)),
    teamSide,
    hitPause,
    hitStun,
    p2StateNo: operation?.p2StateNo ?? firstNumber(findControllerParam(input.controller, "p2stateno")),
    p2GetP1State: resolveProjectileP2GetP1State(input.controller, operation),
    missOnOverride: operation?.missOnOverride ?? booleanNumber(findControllerParam(input.controller, "missonoverride")),
    push,
    hitVelocityY: groundVelocity?.[1],
    guardDamage,
    guardDistance: Math.max(0, Math.round(operation?.guardDistance ?? firstNumber(findControllerParam(input.controller, "guard.dist")) ?? 0)),
    guardFlag: operation?.guardFlag ?? stripMugenString(findControllerParam(input.controller, "guardflag")) ?? "MA",
    guardPause,
    guardStun,
    guardSlideTime,
    guardControlTime,
    guardPush: Math.abs(guardVelocityX ?? Math.max(1, Math.round(push * 0.55))),
    guardVelocityY: guardVelocity?.[1],
    airGuardPush: airGuardVelocity ? Math.abs(airGuardVelocity[0]) : undefined,
    airGuardVelocityY: airGuardVelocity?.[1],
    cornerPush: cornerPush.cornerPush,
    airCornerPush: cornerPush.airCornerPush,
    downCornerPush: cornerPush.downCornerPush,
    guardCornerPush: cornerPush.guardCornerPush,
    airGuardCornerPush: cornerPush.airGuardCornerPush,
    hitSound,
    hitSoundValue,
    guardSound,
    guardSoundValue,
    hitSpark,
    guardSpark,
    sparkXy,
    hitbox: cloneBox(frame?.clsn1[0] ?? { x1: 8, y1: -48, x2: 56, y2: -18 }),
    removeOnHit: operation?.removeOnHit ?? (firstNumber(findControllerParam(input.controller, "projremove")) ?? 1) !== 0,
    hasHit: false,
  };
}

export function modifyRuntimeProjectiles(projectiles: RuntimeProjectile[], input: RuntimeProjectileModifyInput): number {
  const operation = input.operation;
  const projectileId = operation?.projectileId ?? resolveModifyProjectileNumberParam(input, "projid");
  const teamSide = operation?.teamSide ?? resolveModifyProjectileNumberParam(input, "teamside");
  const velocity = operation?.velocity ?? resolveModifyProjectilePairParam(input, "velocity", numberPair);
  const acceleration = operation?.acceleration ?? resolveModifyProjectilePairParam(input, "accel", numberPair);
  const velocityMultiplier = operation?.velocityMultiplier ?? resolveModifyProjectilePairParam(input, "velmul", scalePair);
  const scale = operation?.scale ?? resolveModifyProjectilePairParam(input, "projscale", scalePair);
  const edgeBound = operation?.edgeBound ?? resolveModifyProjectileNumberParam(input, "projedgebound");
  const stageBound = operation?.stageBound ?? resolveModifyProjectileNumberParam(input, "projstagebound");
  const heightBound = operation?.heightBound ?? resolveModifyProjectileHeightBoundParam(input);
  const removeTime = operation?.removeTime ?? resolveModifyProjectileNumberParam(input, "projremovetime");
  const spritePriority = operation?.spritePriority ?? resolveModifyProjectileNumberParam(input, "sprpriority");
  const priority = operation?.priority ?? resolveModifyProjectileNumberParam(input, "projpriority");
  const hitCount = operation?.hitCount ?? resolveModifyProjectileNumberParam(input, "projhits");
  const missTime = operation?.missTime ?? resolveModifyProjectileNumberParam(input, "projmisstime");
  const removeOnHitParam = operation?.removeOnHit === undefined ? resolveModifyProjectileNumberParam(input, "projremove") : undefined;
  const removeOnHit = operation?.removeOnHit ?? (removeOnHitParam === undefined ? undefined : removeOnHitParam !== 0);
  let changed = 0;

  for (const projectile of projectiles) {
    if (projectile.removalReason || projectile.terminalPlayback) {
      continue;
    }
    if (projectileId !== undefined && projectile.projectileId !== projectileId) {
      continue;
    }
    if (velocity) {
      projectile.vel = { x: velocity[0] * projectile.facing, y: velocity[1] };
    }
    if (acceleration) {
      projectile.accel = { x: acceleration[0] * projectile.facing, y: acceleration[1] };
    }
    if (velocityMultiplier) {
      projectile.velMul = pairToVelocityMultiplier(velocityMultiplier);
    }
    if (scale) {
      projectile.scale = pairToScale(scale);
    }
    if (edgeBound !== undefined) {
      projectile.edgeBound = clampProjectileStageBound(edgeBound);
    }
    if (stageBound !== undefined) {
      projectile.stageBound = clampProjectileStageBound(stageBound);
    }
    if (heightBound !== undefined) {
      projectile.heightBound = optionalProjectileHeightBound(heightBound);
    }
    if (removeTime !== undefined) {
      projectile.removeTime = clampProjectileTime(removeTime);
    }
    if (spritePriority !== undefined) {
      projectile.spritePriority = Math.max(-5, Math.min(10, Math.round(spritePriority)));
    }
    if (priority !== undefined) {
      projectile.priority = clampProjectilePriority(priority);
    }
    if (hitCount !== undefined) {
      projectile.hitsRemaining = clampProjectileHits(hitCount);
      projectile.hasHit = false;
    }
    if (missTime !== undefined) {
      projectile.missTime = clampProjectileMissTime(missTime);
      projectile.missTimeRemaining = Math.min(projectile.missTimeRemaining, projectile.missTime);
    }
    if (teamSide !== undefined) {
      const normalizedTeamSide = normalizeRuntimeProjectileTeamSide(teamSide);
      if (normalizedTeamSide !== undefined) {
        projectile.teamSide = normalizedTeamSide;
      }
    }
    if (removeOnHit !== undefined) {
      projectile.removeOnHit = removeOnHit;
    }
    changed += 1;
  }

  return changed;
}

function resolveModifyProjectileNumberParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectileNumberParam,
): number | undefined {
  const raw = findModifyProjectileNumberParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  const staticValue = firstNumber(raw);
  return staticValue ?? input.resolveModifyProjectile?.resolveNumber?.(key);
}

function resolveModifyProjectilePairParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectilePairParam,
  parseStatic: (raw: string | undefined) => [number, number] | undefined,
): [number, number] | undefined {
  const raw = findModifyProjectilePairParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return isStaticNumericList(raw) ? parseStatic(raw) : input.resolveModifyProjectile?.resolvePair?.(key);
}

function resolveModifyProjectileHeightBoundParam(input: RuntimeProjectileModifyInput): { low: number; high: number } | undefined {
  return projectileHeightBound(resolveModifyProjectilePairParam(input, "projheightbound", numberPair));
}

function findModifyProjectileNumberParam(
  controller: MugenStateController,
  key: RuntimeModifyProjectileNumberParam,
): string | undefined {
  switch (key) {
    case "projid":
      return findControllerParam(controller, "projid") ?? findControllerParam(controller, "id");
    case "projremovetime":
      return findControllerParam(controller, "projremovetime") ?? findControllerParam(controller, "removetime");
    case "sprpriority":
      return findControllerParam(controller, "sprpriority") ?? findControllerParam(controller, "projsprpriority");
    case "projpriority":
      return findControllerParam(controller, "projpriority") ?? findControllerParam(controller, "priority");
    default:
      return findControllerParam(controller, key);
  }
}

function findModifyProjectilePairParam(
  controller: MugenStateController,
  key: RuntimeModifyProjectilePairParam,
): string | undefined {
  switch (key) {
    case "velocity":
      return findControllerParam(controller, "velocity") ?? findControllerParam(controller, "vel");
    case "projscale":
      return findControllerParam(controller, "projscale") ?? findControllerParam(controller, "scale");
    default:
      return findControllerParam(controller, key);
  }
}

export function advanceRuntimeProjectiles(
  projectiles: RuntimeProjectile[],
  stage: Pick<MugenStageDefinition, "bounds">,
): RuntimeProjectile[] {
  for (const projectile of projectiles) {
    advanceRuntimeProjectileContactTimer(projectile);
    if (projectile.terminalPlayback) {
      advanceRuntimeProjectileTerminalPlayback(projectile);
      continue;
    }
    if (projectile.removalReason) {
      continue;
    }
    projectile.age += 1;
    projectile.missTimeRemaining = Math.max(0, projectile.missTimeRemaining - 1);
    projectile.pos.x += projectile.vel.x;
    projectile.pos.y += projectile.vel.y;
    projectile.vel.x += projectile.accel.x;
    projectile.vel.y += projectile.accel.y;
    projectile.vel.x *= projectile.velMul.x;
    projectile.vel.y *= projectile.velMul.y;
    projectile.frameElapsed += 1;
    const frame = projectile.action.frames[projectile.frameIndex];
    if (frame && projectile.frameElapsed >= Math.max(1, frame.duration)) {
      projectile.frameElapsed = 0;
      const next = projectile.frameIndex + 1;
      projectile.frameIndex =
        next < projectile.action.frames.length ? next : projectile.action.loopStart ?? projectile.action.frames.length - 1;
    }
  }
  return projectiles.filter((projectile) => {
    if (projectile.hasHit && projectile.removeOnHit) {
      markRuntimeProjectileForRemoval(projectile, "hit");
    } else if (projectile.removeTime >= 0 && projectile.age >= projectile.removeTime) {
      markRuntimeProjectileForRemoval(projectile, "timeout");
    } else if (
      projectile.pos.x < stage.bounds.left - runtimeProjectileHorizontalRemovalBound(projectile) ||
      projectile.pos.x > stage.bounds.right + runtimeProjectileHorizontalRemovalBound(projectile) ||
      projectile.pos.y < runtimeProjectileVerticalRemovalBound(projectile).low ||
      projectile.pos.y > runtimeProjectileVerticalRemovalBound(projectile).high
    ) {
      markRuntimeProjectileForRemoval(projectile, "bounds");
    }
    return shouldKeepRuntimeProjectileAfterRemoval(projectile);
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
        effect: {
          kind: "projectile",
          id: projectile.projectileId,
          age: projectile.age,
          removeTime: projectile.removeTime,
          ...(projectile.edgeBound === undefined || projectile.edgeBound === DEFAULT_PROJECTILE_EDGE_BOUND ? {} : { edgeBound: projectile.edgeBound }),
          ...(projectile.stageBound === DEFAULT_PROJECTILE_STAGE_BOUND ? {} : { stageBound: projectile.stageBound }),
          ...(projectile.heightBound === undefined || isDefaultProjectileHeightBound(projectile.heightBound) ? {} : { heightBound: projectile.heightBound }),
          spritePriority: projectile.spritePriority,
          priority: projectile.priority,
          hitsRemaining: projectile.hitsRemaining,
          missTime: projectile.missTime,
          missTimeRemaining: projectile.missTimeRemaining,
          damage: projectile.damage,
          hitPause: projectile.hitPause,
          hitStun: projectile.hitStun,
          guardDamage: projectile.guardDamage,
          guardPause: projectile.guardPause,
          guardStun: projectile.guardStun,
          guardDistance: projectile.guardDistance,
          guardFlag: projectile.guardFlag,
          ...(projectile.teamSide === undefined ? {} : { teamSide: projectile.teamSide }),
          p2StateNo: projectile.p2StateNo,
          p2GetP1State: projectile.p2GetP1State,
          missOnOverride: projectile.missOnOverride,
          removeOnHit: projectile.removeOnHit,
          hasHit: projectile.hasHit,
          removalReason: projectile.removalReason,
          terminalReason: projectile.terminalPlayback?.reason,
          terminalAge: projectile.terminalPlayback?.age,
          terminalDuration: projectile.terminalPlayback?.duration,
          hitAnimNo: projectile.hitAnimNo,
          removeAnimNo: projectile.removeAnimNo,
          cancelAnimNo: projectile.cancelAnimNo,
          ...(isDefaultVector(projectile.accel) ? {} : { accel: { ...projectile.accel } }),
          ...(isDefaultVelocityMultiplier(projectile.velMul) ? {} : { velMul: { ...projectile.velMul } }),
          ...(isDefaultScale(projectile.scale) ? {} : { scale: { ...projectile.scale } }),
        },
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
          moveType: projectile.terminalPlayback ? "I" : "A",
          physics: "N",
          vars: [],
          fvars: [],
          renderOpacity: projectile.opacity,
          ...(isDefaultScale(projectile.scale) ? {} : { renderScale: { ...projectile.scale } }),
        },
        frame,
        clsn1: projectile.terminalPlayback ? [] : getRuntimeProjectileHitboxes(projectile).map(cloneBox),
        clsn2: projectile.terminalPlayback ? [] : frame.clsn2.map(cloneBox),
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

function resolveProjectileP2GetP1State(
  controller: MugenStateController,
  operation?: ProjectileControllerOp,
): boolean | undefined {
  const p2StateNo = operation?.p2StateNo ?? firstNumber(findControllerParam(controller, "p2stateno"));
  if (p2StateNo === undefined) {
    return undefined;
  }
  return operation?.p2GetP1State ?? (firstNumber(findControllerParam(controller, "p2getp1state")) ?? 1) !== 0;
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

export function canRuntimeProjectileContact(projectile: RuntimeProjectile): boolean {
  return !projectile.removalReason && !projectile.terminalPlayback && !projectile.hasHit && projectile.hitsRemaining > 0 && projectile.missTimeRemaining <= 0;
}

export function runtimeProjectileHasOppositeTeamSide(
  projectile: RuntimeProjectile,
  ownerId = projectile.ownerId,
): boolean {
  const ownerTeamSide = runtimeTeamSideFromId(ownerId);
  return ownerTeamSide !== undefined && projectile.teamSide !== undefined && projectile.teamSide !== ownerTeamSide;
}

export function recordRuntimeProjectileContact(projectile: RuntimeProjectile, kind: Exclude<RuntimeProjectileContactKind, "contact"> | undefined = undefined): void {
  projectile.lastContactKind = kind;
  projectile.lastContactTime = 0;
  projectile.hitsRemaining = Math.max(0, projectile.hitsRemaining - 1);
  if (projectile.hitsRemaining <= 0) {
    projectile.hasHit = true;
    projectile.missTimeRemaining = 0;
    if (projectile.removeOnHit) {
      markRuntimeProjectileForRemoval(projectile, "hit");
    }
    return;
  }
  projectile.missTimeRemaining = projectile.missTime;
}

export function hasRuntimeProjectileContact(
  projectile: RuntimeProjectile,
  kind: RuntimeProjectileContactKind,
  projectileId?: number,
): boolean {
  if (projectileId !== undefined && projectile.projectileId !== projectileId) {
    return false;
  }
  if (projectile.lastContactTime === undefined) {
    return false;
  }
  return kind === "contact" || projectile.lastContactKind === kind;
}

export function runtimeProjectileContactTime(
  projectile: RuntimeProjectile,
  kind: RuntimeProjectileContactKind,
  projectileId?: number,
): number {
  return hasRuntimeProjectileContact(projectile, kind, projectileId) ? (projectile.lastContactTime ?? 0) : -1;
}

export function runtimeProjectileCancelTime(projectile: RuntimeProjectile, projectileId?: number): number {
  if (projectileId !== undefined && projectile.projectileId !== projectileId) {
    return -1;
  }
  return projectile.lastCancelTime ?? -1;
}

export function markRuntimeProjectileForRemoval(
  projectile: RuntimeProjectile,
  reason: RuntimeProjectileRemovalReason,
): void {
  if (projectile.removalReason) {
    return;
  }
  projectile.removalReason = reason;
  projectile.removalAnimNo = resolveProjectileRemovalAnim(projectile, reason);
  projectile.hasHit = projectile.hasHit || reason === "hit" || reason === "cancel";
  if (reason === "cancel") {
    projectile.lastCancelTime = 0;
  }
}

export function isRuntimeProjectileMarkedForRemoval(projectile: RuntimeProjectile): boolean {
  return projectile.removalReason !== undefined;
}

export function shouldKeepRuntimeProjectileAfterRemoval(projectile: RuntimeProjectile): boolean {
  if (!projectile.removalReason) {
    return true;
  }
  if (!projectile.terminalPlayback) {
    startRuntimeProjectileTerminalPlayback(projectile);
  }
  return projectile.terminalPlayback !== undefined && projectile.terminalPlayback.age < projectile.terminalPlayback.duration;
}

export function startRuntimeProjectileTerminalPlayback(projectile: RuntimeProjectile): boolean {
  const reason = projectile.removalReason;
  if (!reason || projectile.terminalPlayback) {
    return projectile.terminalPlayback !== undefined;
  }
  const action = resolveProjectileRemovalAction(projectile, reason);
  if (!action || action.frames.length === 0) {
    return false;
  }
  projectile.action = action;
  projectile.animNo = action.id;
  projectile.frameIndex = 0;
  projectile.frameElapsed = 0;
  projectile.age = 0;
  projectile.vel = { x: 0, y: 0 };
  projectile.accel = { x: 0, y: 0 };
  projectile.velMul = { x: 1, y: 1 };
  projectile.terminalPlayback = {
    reason,
    duration: actionDuration(action),
    age: 0,
  };
  return true;
}

export function describeRuntimeProjectileRemoval(projectile: RuntimeProjectile): string {
  if (!projectile.removalReason) {
    return "removal pending none";
  }
  return `${projectile.removalReason} removal anim ${projectile.removalAnimNo ?? "none"}`;
}

function resolveProjectileRemovalAnim(projectile: RuntimeProjectile, reason: RuntimeProjectileRemovalReason): number | undefined {
  if (reason === "cancel") {
    return projectile.cancelAnimNo ?? projectile.removeAnimNo ?? projectile.hitAnimNo;
  }
  if (reason === "timeout" || reason === "bounds") {
    return projectile.removeAnimNo ?? projectile.hitAnimNo;
  }
  return projectile.hitAnimNo;
}

function resolveProjectileRemovalAction(
  projectile: RuntimeProjectile,
  reason: RuntimeProjectileRemovalReason,
): MugenAnimationAction | undefined {
  if (reason === "cancel") {
    return projectile.terminalActions.cancel ?? projectile.terminalActions.remove ?? projectile.terminalActions.hit;
  }
  if (reason === "timeout" || reason === "bounds") {
    return projectile.terminalActions.remove ?? projectile.terminalActions.hit;
  }
  return projectile.terminalActions.hit;
}

function advanceRuntimeProjectileTerminalPlayback(projectile: RuntimeProjectile): void {
  const terminal = projectile.terminalPlayback;
  if (!terminal) {
    return;
  }
  terminal.age += 1;
  projectile.age = terminal.age;
  projectile.frameElapsed += 1;
  const frame = projectile.action.frames[projectile.frameIndex];
  if (frame && projectile.frameElapsed >= Math.max(1, frame.duration)) {
    projectile.frameElapsed = 0;
    const next = projectile.frameIndex + 1;
    projectile.frameIndex = next < projectile.action.frames.length ? next : projectile.action.frames.length - 1;
  }
}

function advanceRuntimeProjectileContactTimer(projectile: RuntimeProjectile): void {
  if (projectile.lastContactTime !== undefined) {
    projectile.lastContactTime += 1;
  }
  if (projectile.lastCancelTime !== undefined) {
    projectile.lastCancelTime += 1;
  }
}

function actionDuration(action: MugenAnimationAction): number {
  const duration = action.frames.reduce((sum, frame) => sum + Math.max(1, frame.duration), 0);
  return Math.max(1, Math.min(600, duration));
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

function normalizeRuntimeProjectileTeamSide(value: number | undefined): RuntimeTeamSide | undefined {
  return value === 1 || value === 2 ? value : undefined;
}

function isStaticNumericList(value: string): boolean {
  const parts = value.split(",").map((part) => part.trim());
  return parts.length > 0 && parts.every((part) => part.length > 0 && Number.isFinite(Number(part)));
}

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function booleanNumber(value: string | undefined): boolean | undefined {
  const numberValue = firstNumber(value);
  return numberValue === undefined ? undefined : numberValue !== 0;
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

function scalePair(value: string | undefined): [number, number] | undefined {
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

function pairToScale(value: [number, number] | undefined): { x: number; y: number } {
  return {
    x: clampProjectileScale(value?.[0] ?? 1),
    y: clampProjectileScale(value?.[1] ?? value?.[0] ?? 1),
  };
}

function pairToVelocityMultiplier(value: [number, number] | undefined): { x: number; y: number } {
  return {
    x: clampProjectileVelocityMultiplier(value?.[0] ?? 1),
    y: clampProjectileVelocityMultiplier(value?.[1] ?? value?.[0] ?? 1),
  };
}

function isDefaultVector(value: { x: number; y: number }): boolean {
  return value.x === 0 && value.y === 0;
}

function isDefaultVelocityMultiplier(value: { x: number; y: number }): boolean {
  return value.x === 1 && value.y === 1;
}

function isDefaultScale(value: { x: number; y: number }): boolean {
  return value.x === 1 && value.y === 1;
}

function normalizeOptionalVelocityPair(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? [value[0], value[1] ?? 0] : undefined;
}

function clampProjectileTime(value: number): number {
  return value < 0 ? -1 : Math.max(1, Math.min(1200, Math.round(value)));
}

function optionalProjectileHeightBound(value: { low: number; high: number } | undefined): { low: number; high: number } | undefined {
  if (!value) {
    return undefined;
  }
  const low = clampProjectileHeightBound(value.low);
  const high = clampProjectileHeightBound(value.high);
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

function projectileHeightBound(value: [number, number] | undefined): { low: number; high: number } | undefined {
  if (!value) {
    return undefined;
  }
  return { low: value[0], high: value[1] };
}

function clampProjectileStageBound(value: number): number {
  return Math.max(0, Math.min(2000, Math.round(value)));
}

function clampProjectileHeightBound(value: number): number {
  return Math.max(-4000, Math.min(4000, Math.round(value)));
}

function runtimeProjectileHorizontalRemovalBound(projectile: RuntimeProjectile): number {
  return Math.min(projectile.stageBound, projectile.edgeBound ?? DEFAULT_PROJECTILE_EDGE_BOUND);
}

function runtimeProjectileVerticalRemovalBound(projectile: RuntimeProjectile): { low: number; high: number } {
  return projectile.heightBound ?? defaultProjectileHeightBound(1);
}

function defaultProjectileHeightBound(scale: number): { low: number; high: number } {
  return {
    low: scaledDefaultProjectileBound(DEFAULT_PROJECTILE_HEIGHT_BOUND.low, scale),
    high: scaledDefaultProjectileBound(DEFAULT_PROJECTILE_HEIGHT_BOUND.high, scale),
  };
}

function isDefaultProjectileHeightBound(value: { low: number; high: number }): boolean {
  return value.low === DEFAULT_PROJECTILE_HEIGHT_BOUND.low && value.high === DEFAULT_PROJECTILE_HEIGHT_BOUND.high;
}

function projectileDefaultBoundScale(localCoord: [number, number] | undefined): number {
  const width = localCoord?.[0];
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) {
    return 1;
  }
  return width / DEFAULT_PROJECTILE_LOCAL_COORD_WIDTH;
}

function scaledDefaultProjectileBound(value: number, scale: number): number {
  return Math.round(value * scale);
}

function clampProjectilePriority(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function clampProjectileHits(value: number): number {
  return Math.max(1, Math.min(16, Math.round(value)));
}

function clampProjectileMissTime(value: number): number {
  return Math.max(0, Math.min(120, Math.round(value)));
}

function clampProjectileScale(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0.05, Math.min(8, value));
}

function clampProjectileVelocityMultiplier(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(-4, Math.min(4, value));
}

function normalizeProjectileAnim(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return Math.round(value);
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

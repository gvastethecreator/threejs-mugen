import { normalizeMugenCollisionBoxType, type CollisionBox, type MugenCollisionBoxType } from "../model/CollisionBox";
import type {
  HitDefFallOp,
  ModifyProjectileControllerOp,
  MugenHitDefEnvShakeOp,
  MugenHitDefFallFlagsOp,
  MugenHitDefFallImpactOp,
  MugenHitDefFallRecoveryOp,
  MugenPartialHitDefVector,
  MugenProjectileProjection,
  MugenProjectileWindow,
  ProjectileControllerOp,
} from "../compiler/ControllerOps";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { normalizeMugenAffectTeam, normalizeMugenTeamSide } from "../model/MugenTeam";
import { resolveHitDefCornerPush } from "./HitDefCornerPush";
import { collisionBoxesIntersect, runtimeWorldBox } from "./CombatResolver";
import { resolveHitDefGuardTiming } from "./HitDefTiming";
import { derivePinnedIkemenFreshAirGuardVelocity } from "./HitDefVelocity";
import { runtimeHitDefGetPowerDefaults, runtimeHitDefGivePowerDefaults } from "./HitDefGetPowerDefaults";
import { resolveRuntimeHitDefPaletteFx } from "./HitDefPaletteFx";
import type { RuntimePaletteFxResolver } from "./SpriteEffectSystem";
import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";
import { findControllerParam } from "./StateProgramExecutor";
import { runtimeAffectTeamAllows, runtimeTeamSideFromId, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import {
  DEFAULT_RUNTIME_ATTACK_DEPTH,
  DEFAULT_RUNTIME_SIZE_DEPTH,
  runtimeCombatLocalScale,
} from "./RuntimeCombatDepthSystem";
import { scaleRuntimeCollisionBoxes, type RuntimeCollisionBox } from "./RuntimeCollisionTransformSystem";
import { createActorPresentationOrder } from "./PresentationOrder";
import {
  runtimeClsnOverlapWorldBoxes,
  type RuntimeClsnOverlapActor,
  type RuntimeClsnVarGroup,
} from "./RuntimeFrameSystem";
import type {
  ActorSnapshot,
  RuntimeCombatDepth,
  RuntimeHitAnimTypeMetadata,
  RuntimeHitVelocityMetadata,
  RuntimePaletteRemap,
  RuntimePaletteFxPayload,
  RuntimeResolvedSoundRef,
} from "./types";

const DEFAULT_PROJECTILE_EDGE_BOUND = 40;
const DEFAULT_PROJECTILE_STAGE_BOUND = 40;
const DEFAULT_PROJECTILE_HEIGHT_BOUND = { low: -240, high: 1 } as const;
const DEFAULT_PROJECTILE_LOCAL_COORD_WIDTH = 320;

export type RuntimeProjectileGuardDistanceBounds = {
  /** Front/back distance from the Projectile origin. */
  width: [number, number];
  /** Top/bottom distance from the Projectile origin. */
  height: [number, number];
  /** Top/bottom combat-depth distance from the Projectile origin. */
  depth: [number, number];
};

export const DEFAULT_RUNTIME_PROJECTILE_GUARD_DISTANCE_BOUNDS: Readonly<RuntimeProjectileGuardDistanceBounds> = {
  width: [90, 0],
  height: [1000, 1000],
  depth: [10, 10],
};

export type RuntimeProjectileStage = Pick<MugenStageDefinition, "bounds"> & {
  depthBounds?: MugenStageDefinition["depthBounds"];
  localCoord?: Partial<MugenStageDefinition["localCoord"]>;
};

export type RuntimeProjectileEnvShake = {
  time: number;
  freq: number;
  ampl: number;
  phase: number;
  mul: number;
  dir: number;
};

export type RuntimeProjectileFallImpact = {
  damage?: number;
  xVelocity?: number;
  yVelocity?: number;
  zVelocity?: number;
};

export type RuntimeProjectileFallRecovery = {
  recover?: number;
  recoverTime?: number;
  downRecover?: number;
  downRecoverTime?: number;
};

/** Finite fall-policy components resolved in the Projectile caller context. */
export type RuntimeProjectileFallFlags = {
  enabled?: number;
  airFall?: number;
  kill?: number;
};

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
  pos: { x: number; y: number; z?: number };
  vel: { x: number; y: number; z?: number };
  remVelocity: { x: number; y: number; z?: number };
  accel: { x: number; y: number; z?: number };
  velMul: { x: number; y: number; z?: number };
  scale: { x: number; y: number };
  angle: number;
  xAngle: number;
  yAngle: number;
  xShear: number;
  shadow: [number, number, number];
  reflection: number;
  projection: MugenProjectileProjection;
  focalLength: number;
  window: MugenProjectileWindow;
  /** Whether this projectile owns an independent palette effect state. */
  ownPalette: boolean;
  /** Current draw palette exposed through Ikemen ProjVar(DrawPal.*). */
  drawPalette: [number, number];
  /** Bounded palette lookup routing for the existing sprite renderer. */
  paletteRemap?: RuntimePaletteRemap;
  /** Projectile-only collision scale. This is intentionally independent from draw scale. */
  clsnScale?: { x: number; y: number };
  /** Projectile-only collision angle in degrees. */
  clsnAngle?: number;
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
  depthBound?: number;
  heightBound?: { low: number; high: number };
  layerNo: -1 | 0 | 1;
  spritePriority: number;
  /** Nested HitDef priority, separate from Projectile clash priority. */
  hitPriority?: number;
  hitPriorityType?: "hit" | "miss" | "dodge";
  /** Projectile HitDef sprite priorities. P1 is retained but ignored on projectile contact. */
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  priority: number;
  hitsRemaining: number;
  /** Initial authored hit capacity used by Ikemen ProjVar(projhitsmax). */
  hitsMax?: number;
  missTime: number;
  missTimeRemaining: number;
  pauseMoveTime: number;
  superMoveTime: number;
  opacity: number;
  damage: number;
  /** Authored Projectile HitDef dizzypoints exposed by GetHitVar. */
  dizzyPoints?: number;
  /** AttackMulSet dizzypoints multiplier frozen at Projectile creation. */
  dizzyPointsAttackMultiplier?: number;
  /** Authored Projectile HitDef guardpoints exposed by GetHitVar. */
  guardPoints?: number;
  /** AttackMulSet guardpoints multiplier frozen at Projectile creation. */
  guardPointsAttackMultiplier?: number;
  /** AttackMulSet redlife multiplier frozen at Projectile creation. */
  redLifeAttackMultiplier?: number;
  /** Authored Projectile HitDef redlife exposed by GetHitVar. */
  redLife?: number;
  /** Authored Projectile guard redlife exposed by guarded GetHitVar. */
  guardRedLife?: number;
  /** Explicit Projectile HitDef getpower reward selected on an unguarded contact. */
  attackerHitPower?: number;
  /** Explicit Projectile HitDef getpower reward selected on a guarded contact. */
  attackerGuardPower?: number;
  /** Authored Projectile second givepower value exposed by GetHitVar. */
  guardPower?: number;
  /** Authored Projectile first givepower value exposed by GetHitVar. */
  hitPower?: number;
  /** Authored Projectile HitDef score exposed by GetHitVar. */
  score?: number;
  /** Authored Projectile guard score exposed by guarded GetHitVar. */
  guardScore?: number;
  /** Projectile HitDef actor-role immunity pair; contact applies only receiver component one. */
  unhittableTime?: [number, number];
  /** Grounded get-hit friction overrides copied to the receiver on accepted contact. */
  standFriction?: number;
  crouchFriction?: number;
  /** Independent X/Y draw scales selected by normal or guard contact. */
  hitSparkScale?: [number, number];
  guardSparkScale?: [number, number];
  /** PalFX copied to the receiver by an accepted, unguarded contact. */
  paletteFx?: RuntimePaletteFxPayload;
  /** Authored Projectile HitDef p2facing exposed by GetHitVar(facing). */
  p2Facing?: number;
  /** Authored Projectile HitDef keepstate exposed by GetHitVar(keepstate). */
  keepState?: boolean;
  /** Projectile-origin target-distance bounds applied after accepted contact. */
  minDistance?: [number, number?, number?];
  maxDistance?: [number, number?, number?];
  /** Projectile HitDef air.juggle cost used by the bounded IKEMEN path. */
  airJuggle?: number;
  kill: boolean;
  guardKill: boolean;
  attr?: string;
  hitFlag?: string;
  affectTeam?: -1 | 0 | 1;
  attackDepth?: [number, number];
  localCoord?: [number, number];
  targetId?: number;
  chainId?: number;
  noChainIds?: number[];
  hitDefHitCount?: number;
  teamSide?: RuntimeTeamSide;
  /** First authored `pausetime` value. */
  hitPause: number;
  /** Second authored `pausetime` value used by the defender. */
  hitShakeTime: number;
  /** Projectile-local active hit-pause countdown. */
  hitPauseRemaining: number;
  hitStun: number;
  groundSlideTime?: number;
  airHitTime?: number;
  downHitTime?: number;
  downVelocityX?: number;
  downVelocityY?: number;
  downVelocityZ?: number;
  downBounce?: boolean;
  /** Ikemen HitDef flag that clears the target fall flag on contact. */
  forceNoFall?: boolean;
  /** Ikemen HitDef posture overrides used before default get-hit selection. */
  forceStand?: boolean;
  forceCrouch?: boolean;
  fall?: HitDefFallOp;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  p2ClsnCheck?: MugenCollisionBoxType;
  p2ClsnRequire?: MugenCollisionBoxType;
  missOnOverride?: boolean;
  push: number;
  hitVelocityY?: number;
  hitVelocityZ?: number;
  airVelocityX?: number;
  airVelocityY?: number;
  airVelocityZ?: number;
  /** Last projectile HitDef velocity vectors for Ikemen GetHitVar aliases. */
  hitVelocities?: RuntimeHitVelocityMetadata;
  /** Bounded Ikemen-GO KO velocity delta metadata, separate from hit velocity. */
  koVelocityAdd?: { x?: number; y?: number };
  /** Last projectile HitDef reaction animation types for Ikemen GetHitVar aliases. */
  hitAnimTypes?: RuntimeHitAnimTypeMetadata;
  /** Projectile HitDef acceleration metadata exposed through GetHitVar. */
  hitXAccel?: number;
  hitYAccel?: number;
  hitZAccel?: number;
  /** Accepted-contact camera shake payload. */
  envShake?: RuntimeProjectileEnvShake;
  guardDamage: number;
  guardDistanceBounds: RuntimeProjectileGuardDistanceBounds;
  guardFlag?: string;
  /** First authored `guard.pausetime` value. */
  guardPause: number;
  /** Second authored `guard.pausetime` value used by the defender. */
  guardShakeTime: number;
  guardStun: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
  guardPush: number;
  guardVelocityY?: number;
  guardVelocityZ?: number;
  airGuardPush?: number;
  airGuardVelocityY?: number;
  airGuardVelocityZ?: number;
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
  hitSparkAngle?: number;
  guardSpark?: string;
  guardSparkAngle?: number;
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
  pos: { x: number; y: number; z?: number };
  fallbackFacing: 1 | -1;
  ownerLayerNo?: number;
  localCoord?: [number, number];
  clsnScale?: { x: number; y: number };
  attackDepth?: [number, number];
  depthBound?: number;
  damageScale?: number;
  /** Snapshot of the creator's AttackMulSet dizzypoints multiplier. */
  dizzyPointsAttackMultiplier?: number;
  /** Snapshot of the creator's AttackMulSet guardpoints multiplier. */
  guardPointsAttackMultiplier?: number;
  /** Snapshot of the creator's AttackMulSet redlife multiplier. */
  redLifeAttackMultiplier?: number;
  constants?: RuntimeResourceConstants;
  defaultHitFlag?: string;
  resolveSoundValue?: (key: "hitsound" | "guardsound") => RuntimeResolvedSoundRef | undefined;
  resolveUnhittableTime?: () => [number, number?] | undefined;
  resolveGroundFriction?: () => { stand?: number; crouch?: number } | undefined;
  resolveSparkScale?: () => { hit?: [number?, number?]; guard?: [number?, number?] } | undefined;
  /** Resolves fresh Projectile EnvShake expressions in the original caller context. */
  resolveEnvShake?: () => Partial<RuntimeProjectileEnvShake> | undefined;
  /** Resolves fresh Projectile fall EnvShake expressions in the original caller context. */
  resolveFallEnvShake?: () => Partial<RuntimeProjectileEnvShake> | undefined;
  /** Resolves fresh Projectile fall impact expressions in the original caller context. */
  resolveFallImpact?: () => Partial<RuntimeProjectileFallImpact> | undefined;
  /** Resolves fresh Projectile fall/down recovery expressions in the original caller context. */
  resolveFallRecovery?: () => Partial<RuntimeProjectileFallRecovery> | undefined;
  /** Resolves fresh Projectile fall-policy expressions in the original caller context. */
  resolveFallFlags?: () => Partial<RuntimeProjectileFallFlags> | undefined;
  /** Resolves Projectile ground.velocity authored expressions in the original caller context. */
  resolveGroundVelocity?: () => [number?, number?, number?] | undefined;
  /** Resolves Projectile guard.velocity authored expressions in the original caller context. */
  resolveGuardVelocity?: () => [number?, number?, number?] | undefined;
  /** Resolves Projectile air.velocity authored expressions in the original caller context. */
  resolveAirVelocity?: () => [number?, number?, number?] | undefined;
  /** Resolves Projectile down.velocity authored expressions in the original caller context. */
  resolveDownVelocity?: () => [number?, number?, number?] | undefined;
  /** Resolves fresh Projectile down.hittime authored expressions in the original caller context. */
  resolveDownHitTime?: () => number | undefined;
  /** Resolves fresh Projectile ground.hittime authored expressions in the original caller context. */
  resolveGroundHitTime?: () => number | undefined;
  /** Resolves fresh Projectile ground.slidetime authored expressions in the original caller context. */
  resolveGroundSlideTime?: () => number | undefined;
  /** Resolves fresh Projectile air.hittime authored expressions in the original caller context. */
  resolveAirHitTime?: () => number | undefined;
  /** Resolves fresh Projectile pausetime authored expressions in the original caller context. */
  resolvePauseTime?: () => [number?, number?] | undefined;
  /** Resolves fresh Projectile guard.pausetime authored expressions in the original caller context. */
  resolveGuardPauseTime?: () => [number?, number?] | undefined;
  /** Resolves fresh Projectile projremovetime authored expressions in the original caller context. */
  resolveRemoveTime?: () => number | undefined;
  /** Resolves fresh Projectile projmisstime authored expressions in the original caller context. */
  resolveMissTime?: () => number | undefined;
  /** Resolves fresh Projectile projpriority authored expressions in the original caller context. */
  resolvePriority?: () => number | undefined;
  /** Resolves fresh Projectile projhits authored expressions in the original caller context. */
  resolveHitCount?: () => number | undefined;
  /** Resolves fresh Projectile guard.hittime authored expressions in the original caller context. */
  resolveGuardHitTime?: () => number | undefined;
  /** Resolves Projectile airguard.velocity authored expressions in the original caller context. */
  resolveAirGuardVelocity?: () => [number?, number?, number?] | undefined;
  resolvePaletteFx?: RuntimePaletteFxResolver;
  /** Resolves fresh Projectile damage/guard damage expressions in caller context. */
  resolveProjectileDamage?: () => { hit?: number; guard?: number } | undefined;
  resolveProjectileGetPower?: () => { hit?: number; guard?: number } | undefined;
  resolveProjectileGivePower?: () => { hit?: number; guard?: number } | undefined;
  /** Resolves fresh Projectile guardpoints in the original caller context. */
  resolveGuardPoints?: () => number | undefined;
  /** Resolves fresh Projectile p2facing in the original caller context. */
  resolveP2Facing?: () => number | undefined;
  /** Resolves fresh Projectile keepstate in the original caller context. */
  resolveKeepState?: () => number | undefined;
  resolveForceNoFall?: () => number | undefined;
  resolveDownBounce?: () => number | undefined;
  resolvePosture?: (key: "forcestand" | "forcecrouch") => number | undefined;
};

export type RuntimeProjectileModifyInput = {
  controller: MugenStateController;
  operation?: ModifyProjectileControllerOp;
  resolveModifyProjectile?: RuntimeProjectileModifyResolver;
  resolveAction?: (animNo: number) => MugenAnimationAction | undefined;
};

export type RuntimeModifyProjectileNumberParam =
  | "id"
  | "index"
  | "projid"
  | "chainid"
  | "kill"
  | "guard.kill"
  | "fall.kill"
  | "forcenofall"
  | "forcestand"
  | "forcecrouch"
  | "fall.damage"
  | "fall.xvelocity"
  | "fall.yvelocity"
  | "fall.zvelocity"
  | "fall.recover"
  | "fall.recovertime"
  | "down.recover"
  | "down.recovertime"
  | "fall.envshake.time"
  | "fall.envshake.freq"
  | "fall.envshake.ampl"
  | "fall.envshake.phase"
  | "fall.envshake.mul"
  | "fall.envshake.dir"
  | "air.juggle"
  | "dizzypoints"
  | "guardpoints"
  | "numhits"
  | "priority"
  | "p2sprpriority"
  | "p1stateno"
  | "p2stateno"
  | "p2getp1state"
  | "p2facing"
  | "air.hittime"
  | "fall"
  | "air.fall"
  | "down.bounce"
  | "ground.hittime"
  | "ground.slidetime"
  | "guard.hittime"
  | "guard.slidetime"
  | "guard.ctrltime"
  | "airguard.ctrltime"
  | "down.hittime"
  | "sparkangle"
  | "guard.sparkangle"
  | "xaccel"
  | "yaccel"
  | "zaccel"
  | "envshake.time"
  | "envshake.freq"
  | "envshake.ampl"
  | "envshake.phase"
  | "envshake.mul"
  | "envshake.dir"
  | "missonoverride"
  | "projanim"
  | "projhitanim"
  | "projremanim"
  | "projcancelanim"
  | "projangle"
  | "projxangle"
  | "projyangle"
  | "projxshear"
  | "projreflection"
  | "projfocallength"
  | "projlayerno"
  | "projedgebound"
  | "projstagebound"
  | "projdepthbound"
  | "projremovetime"
  | "projsprpriority"
  | "projpriority"
  | "projhits"
  | "projmisstime"
  | "pausemovetime"
  | "supermovetime"
  | "projclsnangle"
  | "teamside"
  | "projremove";
export type RuntimeModifyProjectilePairParam = "damage" | "getpower" | "givepower" | "redlife" | "score" | "attack.depth" | "pausetime" | "guard.pausetime" | "guard.dist" | "guard.dist.width" | "guard.dist.height" | "guard.dist.depth" | "sparkxy" | "velocity" | "remvelocity" | "accel" | "velmul" | "projscale" | "projclsnscale" | "projheightbound";
export type RuntimeModifyProjectileTerminalAnimationParam = "projhitanim" | "projremanim" | "projcancelanim";
export type RuntimeModifyProjectileTripleParam = "down.velocity" | "air.velocity" | "guard.velocity" | "airguard.velocity" | "mindist" | "maxdist";
export type RuntimeModifyProjectilePartialTripleParam = "ground.velocity";
export type RuntimeModifyProjectileIntegerListParam = "nochainid";
export type RuntimeModifyProjectileGroundVelocity = MugenPartialHitDefVector;

export type RuntimeProjectileModifyResolver = {
  /** Resolves a live ModifyProjectile RedirectID in the original caller context. */
  resolveRedirectPlayerId?: () => number | undefined;
  resolveNumber?: (key: RuntimeModifyProjectileNumberParam) => number | undefined;
  /** Resolves a typed ModifyProjectile `projanim` expression in caller context. */
  resolveAnimation?: () => number | undefined;
  /** Resolves a typed terminal animation expression in caller context. */
  resolveTerminalAnimation?: (key: RuntimeModifyProjectileTerminalAnimationParam) => number | undefined;
  /** Resolves typed live ModifyProjectile pause budgets in caller context. */
  resolveMoveTime?: (key: "pausemovetime" | "supermovetime") => number | undefined;
  resolveFloat?: (key: RuntimeModifyProjectileNumberParam) => number | undefined;
  resolvePair?: (key: RuntimeModifyProjectilePairParam) => [number, number, number?] | undefined;
  resolveFloatPair?: (key: RuntimeModifyProjectilePairParam) => [number, number, number?] | undefined;
  resolveFloatTriple?: (key: RuntimeModifyProjectileTripleParam) => [number, number, number] | undefined;
  resolveFloatPartialTriple?: (key: RuntimeModifyProjectilePartialTripleParam) => RuntimeModifyProjectileGroundVelocity | undefined;
  resolveIntegerList?: (key: RuntimeModifyProjectileIntegerListParam) => number[] | undefined;
};

export type RuntimeProjectileVarParameter =
  | "accel.x"
  | "accel.y"
  | "accel.z"
  | "anim"
  | "animelem"
  | "drawpal.group"
  | "drawpal.index"
  | "facing"
  | "highbound"
  | "lowbound"
  | "pausemovetime"
  | "pos.x"
  | "pos.y"
  | "pos.z"
  | "projangle"
  | "projxangle"
  | "projyangle"
  | "projxshear"
  | "projshadow.r"
  | "projshadow.g"
  | "projshadow.b"
  | "projcancelanim"
  | "projedgebound"
  | "projhitanim"
  | "projhits"
  | "projhitsmax"
  | "projid"
  | "projlayerno"
  | "projmisstime"
  | "projpriority"
  | "projremanim"
  | "projremove"
  | "projremovetime"
  | "projsprpriority"
  | "projstagebound"
  | "remvelocity.x"
  | "remvelocity.y"
  | "remvelocity.z"
  | "scale.x"
  | "scale.y"
  | "supermovetime"
  | "teamside"
  | "time"
  | "vel.x"
  | "vel.y"
  | "vel.z"
  | "velmul.x"
  | "velmul.y"
  | "velmul.z";

export function createRuntimeProjectile(input: RuntimeProjectileSpawnInput): RuntimeProjectile {
  const operation = input.operation;
  const forcedFacing = operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const facing = forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing;
  const rawVelocity = operation?.velocity ?? numberTriple(findControllerParam(input.controller, "velocity") ?? findControllerParam(input.controller, "vel")) ?? [0, 0];
  const rawRemovalVelocity = operation?.removalVelocity ?? numberTriple(findControllerParam(input.controller, "remvelocity")) ?? [0, 0];
  const rawAcceleration = operation?.acceleration ?? numberTriple(findControllerParam(input.controller, "accel")) ?? [0, 0];
  const rawVelocityMultiplier = operation?.velocityMultiplier ?? projectileVelocityMultiplier(findControllerParam(input.controller, "velmul"), 1) ?? [1, 1, 1];
  const rawScale = operation?.scale ?? scalePair(findControllerParam(input.controller, "projscale") ?? findControllerParam(input.controller, "scale")) ?? [1, 1];
  const angle = finiteProjectileAngle(operation?.angle ?? firstNumber(findControllerParam(input.controller, "projangle")) ?? 0);
  const xAngle = finiteProjectileAngle(operation?.xAngle ?? firstNumber(findControllerParam(input.controller, "projxangle")) ?? 0);
  const yAngle = finiteProjectileAngle(operation?.yAngle ?? firstNumber(findControllerParam(input.controller, "projyangle")) ?? 0);
  const xShear = finiteProjectileAngle(operation?.xShear ?? firstNumber(findControllerParam(input.controller, "projxshear")) ?? 0);
  const shadow = runtimeProjectileShadow(
    operation?.shadow ?? partialNumberTriple(findControllerParam(input.controller, "projshadow")),
  );
  const reflection = finiteProjectileInteger(
    operation?.reflection ?? firstNumber(findControllerParam(input.controller, "projreflection")) ?? -1,
    -1,
  );
  const projection = runtimeProjectileProjection(
    operation?.projection ?? projectileProjection(findControllerParam(input.controller, "projprojection")),
  );
  const focalLength = finiteProjectileAngle(
    operation?.focalLength ?? firstNumber(findControllerParam(input.controller, "projfocallength")) ?? 0,
  );
  const window = runtimeProjectileWindow(
    operation?.window ?? numberQuad(findControllerParam(input.controller, "projwindow")),
  );
  const ownPalette = operation?.ownPalette ?? booleanNumber(findControllerParam(input.controller, "ownpal")) ?? false;
  const authoredPaletteRemap = operation?.paletteRemap ?? projectilePaletteRemap(findControllerParam(input.controller, "remappal"));
  const drawPalette: [number, number] = ownPalette && authoredPaletteRemap?.[0] !== undefined && authoredPaletteRemap[0] >= 0
    ? [...authoredPaletteRemap]
    : [0, 0];
  const paletteRemap: RuntimePaletteRemap | undefined = drawPalette[0] === 0 && drawPalette[1] === 0
    ? undefined
    : { source: [1, 1], dest: [...drawPalette] };
  const pauseMoveTime = initialRuntimeProjectileMoveTime(
    operation?.pauseMoveTime ?? firstNumber(findControllerParam(input.controller, "pausemovetime")) ?? 0,
  );
  const superMoveTime = initialRuntimeProjectileMoveTime(
    operation?.superMoveTime ?? firstNumber(findControllerParam(input.controller, "supermovetime")) ?? 0,
  );
  const rawClsnScale = operation?.clsnScale ?? projectileClsnScalePair(findControllerParam(input.controller, "projclsnscale"), 1);
  const clsnAngle = operation?.clsnAngle ?? firstNumber(findControllerParam(input.controller, "projclsnangle"));
  const hasDynamicGroundVelocity = operation?.groundVelocityExpressions !== undefined || operation?.groundVelocityZExpression !== undefined;
  const groundVelocity: [number, number?, number?] | undefined = hasDynamicGroundVelocity
    ? completeFreshProjectileGroundVelocity(input.resolveGroundVelocity?.())
    : normalizeOptionalVelocityVector(operation?.groundVelocity) ?? velocityPair(findControllerParam(input.controller, "ground.velocity"));
  const frame = input.action.frames[0];
  const projectileId = operation?.projectileId ?? firstNumber(findControllerParam(input.controller, "projid") ?? findControllerParam(input.controller, "id")) ?? 0;
  const targetId = operation?.targetId ?? firstNumber(findControllerParam(input.controller, "id")) ?? projectileId;
  const chainId = operation?.chainId ?? firstNumber(findControllerParam(input.controller, "chainid"));
  const noChainIds = operation?.noChainIds ?? staticRuntimeIntegerList(findControllerParam(input.controller, "nochainid"), 8);
  const hitDefHitCount = operation?.hitDefHitCount ?? firstNumber(findControllerParam(input.controller, "numhits")) ?? 1;
  const affectTeam = operation?.affectTeam ?? normalizeMugenAffectTeam(findControllerParam(input.controller, "affectteam"));
  const teamSide = operation?.teamSide ?? normalizeMugenTeamSide(firstNumber(findControllerParam(input.controller, "teamside")));
  const damageRaw = findControllerParam(input.controller, "damage");
  const resolvedDamage = resolveRuntimeProjectileFreshDamagePair(
    operation?.damageExpressions,
    operation === undefined || operation.damageExpressions !== undefined ? damageRaw : undefined,
    input.resolveProjectileDamage?.(),
  );
  const hasAuthoredDamage = operation?.damageExpressions !== undefined || damageRaw !== undefined;
  const hasDynamicDamage = operation?.damageExpressions !== undefined;
  const baseDamage = Math.max(
    0,
    resolvedDamage?.hit
      ?? (hasDynamicDamage ? undefined : operation?.damage)
      ?? (hasAuthoredDamage ? firstNumber(damageRaw) ?? 0 : 30),
  );
  const dizzyPoints = operation?.dizzyPoints ?? firstNumber(findControllerParam(input.controller, "dizzypoints"));
  const dynamicGuardPoints = operation?.guardPointsExpression === undefined
    ? undefined
    : typeof operation.guardPointsExpression === "number"
      ? operation.guardPointsExpression
      : input.resolveGuardPoints?.();
  const guardPoints = operation?.guardPoints
    ?? (operation?.guardPointsExpression === undefined
      ? firstNumber(findControllerParam(input.controller, "guardpoints"))
      : dynamicGuardPoints === undefined || !Number.isFinite(dynamicGuardPoints)
        ? undefined
        : Math.trunc(dynamicGuardPoints));
  const redLifeRaw = findControllerParam(input.controller, "redlife");
  const redLife = operation?.redLife ?? firstNumber(redLifeRaw);
  const guardRedLife = operation?.guardRedLife ?? secondNumber(redLifeRaw) ?? (redLife === undefined ? undefined : 0);
  const attackerPower = resolveRuntimeProjectileFreshPowerPair(
    operation?.getPower,
    findControllerParam(input.controller, "getpower"),
    input.resolveProjectileGetPower?.(),
  );
  const givePowerParam = findControllerParam(input.controller, "givepower");
  const resolvedGivePower = resolveRuntimeProjectileFreshPowerPair(
    operation?.givePower,
    givePowerParam,
    input.resolveProjectileGivePower?.(),
  );
  const authoredGuardPower = resolvedGivePower?.guard ?? operation?.guardPower ?? secondNumber(givePowerParam);
  const authoredHitPower = resolvedGivePower?.hit ?? operation?.hitPower ?? firstNumber(givePowerParam);
  const scoreRaw = findControllerParam(input.controller, "score");
  const score = operation?.score ?? firstNumber(scoreRaw);
  const guardScore = operation?.guardScore ?? secondNumber(scoreRaw) ?? (score === undefined ? undefined : 0);
  const unhittableTime = resolveRuntimeProjectileUnhittableTime(
    operation?.unhittableTime,
    findControllerParam(input.controller, "unhittabletime"),
    input.resolveUnhittableTime?.(),
  );
  const resolvedGroundFriction = input.resolveGroundFriction?.();
  const standFriction = resolveRuntimeProjectileScalar(
    operation?.standFriction,
    findControllerParam(input.controller, "stand.friction"),
    resolvedGroundFriction?.stand,
  );
  const crouchFriction = resolveRuntimeProjectileScalar(
    operation?.crouchFriction,
    findControllerParam(input.controller, "crouch.friction"),
    resolvedGroundFriction?.crouch,
  );
  const resolvedSparkScale = input.resolveSparkScale?.();
  const hitSparkScale = resolveRuntimeProjectileSparkScale(
    operation?.hitSparkScale,
    findControllerParam(input.controller, "sparkscale"),
    resolvedSparkScale?.hit,
  );
  const guardSparkScale = resolveRuntimeProjectileSparkScale(
    operation?.guardSparkScale,
    findControllerParam(input.controller, "guard.sparkscale"),
    resolvedSparkScale?.guard,
  );
  const paletteFx = resolveRuntimeHitDefPaletteFx({
    operation: operation?.paletteFx,
    controller: input.controller,
    resolver: input.resolvePaletteFx,
  });
  const dynamicP2Facing = operation?.p2FacingExpression === undefined
    ? undefined
    : typeof operation.p2FacingExpression === "number"
      ? operation.p2FacingExpression
      : input.resolveP2Facing?.();
  const p2Facing = operation?.p2Facing !== undefined
    ? operation.p2Facing
    : operation?.p2FacingExpression !== undefined
      ? (dynamicP2Facing === undefined || !Number.isFinite(dynamicP2Facing) ? undefined : Math.trunc(dynamicP2Facing))
      : firstNumber(findControllerParam(input.controller, "p2facing"));
  const keepStateExpression = operation?.keepStateExpression;
  const dynamicKeepState = keepStateExpression === undefined
    ? undefined
    : typeof keepStateExpression === "number"
      ? keepStateExpression
      : input.resolveKeepState?.();
  const keepState = keepStateExpression === undefined
    ? operation?.keepState ?? booleanNumber(findControllerParam(input.controller, "keepstate"))
    : dynamicKeepState === undefined || !Number.isFinite(dynamicKeepState)
      ? undefined
      : dynamicKeepState !== 0;
  const airJuggle = operation?.airJuggle ?? firstNumber(findControllerParam(input.controller, "air.juggle"));
  const normalizedAirJuggle = airJuggle === undefined || !Number.isFinite(airJuggle) ? undefined : Math.trunc(airJuggle);
  const pauseTimeRaw = findControllerParam(input.controller, "pausetime");
  const authoredPauseTime = runtimeProjectileStaticIntegerPair(pauseTimeRaw);
  const resolvedPauseTime = resolveRuntimeProjectileFreshPausePair(
    operation?.pauseTimeExpressions,
    pauseTimeRaw,
    input.resolvePauseTime?.(),
    operation?.hitPause === undefined && operation?.hitShakeTime === undefined
      ? undefined
      : [operation.hitPause, operation.hitShakeTime],
    [0, 0],
    authoredPauseTime,
  );
  const hitPause = Math.max(0, Math.round(resolvedPauseTime[0]));
  const hitShakeTime = Math.max(0, Math.round(resolvedPauseTime[1]));
  const dynamicGroundHitTime = operation?.groundHitTimeExpression === undefined
    ? undefined
    : input.resolveGroundHitTime?.();
  const finiteDynamicGroundHitTime = dynamicGroundHitTime !== undefined && Number.isFinite(dynamicGroundHitTime)
    ? dynamicGroundHitTime
    : undefined;
  const hitStun = Math.max(
    1,
    finiteDynamicGroundHitTime === undefined
      ? Math.round(operation?.hitStun ?? firstNumber(findControllerParam(input.controller, "ground.hittime")) ?? 18)
      : Math.trunc(finiteDynamicGroundHitTime),
  );
  const dynamicGroundSlideTime = operation?.groundSlideTimeExpression === undefined
    ? undefined
    : input.resolveGroundSlideTime?.();
  const finiteDynamicGroundSlideTime = dynamicGroundSlideTime !== undefined && Number.isFinite(dynamicGroundSlideTime)
    ? dynamicGroundSlideTime
    : undefined;
  const groundSlideTime = finiteDynamicGroundSlideTime === undefined
    ? operation?.groundSlideTime ?? firstNumber(findControllerParam(input.controller, "ground.slidetime"))
    : Math.trunc(finiteDynamicGroundSlideTime);
  const dynamicAirHitTime = operation?.airHitTimeExpression === undefined
    ? undefined
    : input.resolveAirHitTime?.();
  const finiteDynamicAirHitTime = dynamicAirHitTime !== undefined && Number.isFinite(dynamicAirHitTime)
    ? dynamicAirHitTime
    : undefined;
  const airHitTime = Math.max(
    0,
    finiteDynamicAirHitTime === undefined
      ? Math.round(operation?.airHitTime ?? firstNumber(findControllerParam(input.controller, "air.hittime")) ?? 20)
      : Math.trunc(finiteDynamicAirHitTime),
  );
  const dynamicDownHitTime = operation?.downHitTimeExpression === undefined
    ? undefined
    : input.resolveDownHitTime?.();
  const finiteDynamicDownHitTime = dynamicDownHitTime !== undefined && Number.isFinite(dynamicDownHitTime)
    ? dynamicDownHitTime
    : undefined;
  const downHitTime = Math.max(
    0,
    finiteDynamicDownHitTime === undefined
      ? Math.round(operation?.downHitTime ?? firstNumber(findControllerParam(input.controller, "down.hittime")) ?? 20)
      : Math.trunc(finiteDynamicDownHitTime),
  );
  const dynamicGuardHitTime = operation?.guardHitTimeExpression === undefined
    ? undefined
    : input.resolveGuardHitTime?.();
  const finiteDynamicGuardHitTime = dynamicGuardHitTime !== undefined && Number.isFinite(dynamicGuardHitTime)
    ? dynamicGuardHitTime
    : undefined;
  const bounceValue = operation?.downBounceExpression === undefined ? undefined : input.resolveDownBounce?.();
  const downBounce = operation?.downBounceExpression === undefined
    ? operation?.downBounce ?? booleanNumber(findControllerParam(input.controller, "down.bounce"))
    : bounceValue !== undefined && Number.isFinite(bounceValue) ? bounceValue !== 0 : undefined;
  const forceNoFallExpression = operation?.forceNoFallExpression;
  const dynamicForceNoFall = typeof forceNoFallExpression === "number"
    ? forceNoFallExpression
    : forceNoFallExpression === undefined ? undefined : input.resolveForceNoFall?.();
  const forceNoFall = forceNoFallExpression === undefined
    ? operation?.forceNoFall ?? booleanNumber(findControllerParam(input.controller, "forcenofall"))
    : dynamicForceNoFall === undefined || !Number.isFinite(dynamicForceNoFall)
      ? undefined
      : dynamicForceNoFall !== 0;
  const resolvePosture = (key: "forcestand" | "forcecrouch"): boolean | undefined => {
    const expression = key === "forcestand" ? operation?.forceStandExpression : operation?.forceCrouchExpression;
    if (expression === undefined) {
      const literal = key === "forcestand" ? operation?.forceStand : operation?.forceCrouch;
      return literal ?? booleanNumber(findControllerParam(input.controller, key));
    }
    const value = input.resolvePosture?.(key);
    return value !== undefined && Number.isFinite(value) ? value !== 0 : undefined;
  };
  const forceStand = resolvePosture("forcestand");
  const forceCrouch = resolvePosture("forcecrouch");
  const staticFall = operation?.fall ?? projectileFallData(input.controller);
  const fallFlags = operation?.fallFlags === undefined
    ? undefined
    : resolveRuntimeProjectileFallFlags(operation.fallFlags, input.resolveFallFlags?.());
  const authoredFallWithFlags = operation?.fallFlags === undefined
    ? staticFall
    : {
        ...staticFall,
        ...projectileFallFlagsFields(fallFlags),
      };
  const fallImpact = operation?.fallImpact === undefined
    ? undefined
    : resolveRuntimeProjectileFallImpact(operation.fallImpact, input.resolveFallImpact?.());
  const authoredFallWithImpact = operation?.fallImpact === undefined
    ? authoredFallWithFlags
    : {
        ...withoutProjectileFallImpact(authoredFallWithFlags),
        ...projectileFallImpactFields(fallImpact),
      };
  const fallRecovery = operation?.fallRecovery === undefined
    ? undefined
    : resolveRuntimeProjectileFallRecovery(operation.fallRecovery, input.resolveFallRecovery?.());
  const authoredFallBase = operation?.fallRecovery === undefined
    ? authoredFallWithImpact
    : {
        ...withoutProjectileFallRecovery(authoredFallWithImpact),
        ...projectileFallRecoveryFields(fallRecovery),
      };
  const fallEnvShake = resolveRuntimeProjectileEnvShake(
    operation?.fallEnvShake,
    input.resolveFallEnvShake?.(),
    projectileFallEnvShake(authoredFallBase),
  );
  const authoredFall = operation?.fallEnvShake === undefined
    ? authoredFallBase
    : {
        ...withoutProjectileFallEnvShake(authoredFallBase),
        ...projectileFallEnvShakeFields(fallEnvShake),
      };
  const fall = Object.keys(authoredFall).length === 0 ? undefined : authoredFall;
  const push = Math.abs(groundVelocity?.[0] ?? 18);
  const hasDynamicGuardVelocity = operation?.guardVelocityExpressions !== undefined || operation?.guardVelocityZExpression !== undefined;
  const authoredGuardVelocity = hasDynamicGuardVelocity
    ? input.resolveGuardVelocity?.()
    : normalizeOptionalVelocityVector(operation?.guardVelocity) ?? velocityPair(findControllerParam(input.controller, "guard.velocity"));
  const guardVelocity: [number, number?, number?] | undefined = hasDynamicGuardVelocity
    ? completeFreshProjectileGuardVelocity(authoredGuardVelocity, groundVelocity)
    : authoredGuardVelocity as [number, number?, number?] | undefined;
  const guardVelocityX = guardVelocity?.[0] ?? groundVelocity?.[0];
  const hasDynamicAirVelocity = operation?.airVelocityExpressions !== undefined || operation?.airVelocityZExpression !== undefined;
  const authoredAirVelocity = hasDynamicAirVelocity
    ? input.resolveAirVelocity?.()
    : normalizeOptionalVelocityVector(operation?.airVelocity) ?? velocityPair(findControllerParam(input.controller, "air.velocity"));
  const airVelocity = hasDynamicAirVelocity
    ? completeFreshProjectileAirVelocity(authoredAirVelocity)
    : authoredAirVelocity as [number, number?, number?] | undefined;
  const hasDynamicDownVelocity = operation?.downVelocityExpressions !== undefined || operation?.downVelocityZExpression !== undefined;
  const authoredDownVelocity = hasDynamicDownVelocity
    ? input.resolveDownVelocity?.()
    : normalizeOptionalVelocityVector(operation?.downVelocity) ?? velocityPair(findControllerParam(input.controller, "down.velocity"));
  const downVelocity: [number, number?, number?] | undefined = hasDynamicDownVelocity
    ? completeFreshProjectileDownVelocity(authoredDownVelocity, completeFreshProjectileAirVelocity(airVelocity))
    : authoredDownVelocity as [number, number?, number?] | undefined;
  const downVelocityX = downVelocity?.[0] ?? airVelocity?.[0] ?? 0;
  const downVelocityY = downVelocity?.[1] ?? airVelocity?.[1] ?? 0;
  const downVelocityZ = downVelocity?.[2] ?? airVelocity?.[2];
  const hasDynamicAirGuardVelocity = operation?.airGuardVelocityExpressions !== undefined || operation?.airGuardVelocityZExpression !== undefined;
  const authoredAirGuardVelocity = hasDynamicAirGuardVelocity
    ? input.resolveAirGuardVelocity?.()
    : normalizeOptionalVelocityVector(operation?.airGuardVelocity) ??
      partialNumberTriple(findControllerParam(input.controller, "airguard.velocity"));
  const airGuardVelocity = completeFreshProjectileAirGuardVelocity(
    authoredAirGuardVelocity,
    derivePinnedIkemenFreshAirGuardVelocity(airVelocity),
  );
  const hitVelocities = runtimeHitVelocityMetadata({ groundVelocity, airVelocity, downVelocity, guardVelocity, airGuardVelocity });
  const groundAnimType = operation?.animType ?? hitAnimType(findControllerParam(input.controller, "animtype")) ?? 0;
  const airAnimType = operation?.airAnimType ?? hitAnimType(findControllerParam(input.controller, "air.animtype")) ?? groundAnimType;
  const fallAnimType = operation?.fallAnimType ?? hitAnimType(findControllerParam(input.controller, "fall.animtype")) ?? defaultFallAnimType(airAnimType);
  const hitXAccel = operation?.xAccel ?? firstNumber(findControllerParam(input.controller, "xaccel"));
  const hitYAccel = operation?.yAccel ?? firstNumber(findControllerParam(input.controller, "yaccel"));
  const hitZAccel = operation?.zAccel ?? firstNumber(findControllerParam(input.controller, "zaccel"));
  const envShake = resolveRuntimeProjectileEnvShake(
    operation?.envShake,
    input.resolveEnvShake?.(),
    {
      time: operation?.envShakeTime ?? firstNumber(findControllerParam(input.controller, "envshake.time")),
      freq: operation?.envShakeFrequency ?? firstNumber(findControllerParam(input.controller, "envshake.freq")),
      ampl: operation?.envShakeAmplitude ?? firstNumber(findControllerParam(input.controller, "envshake.ampl")),
      phase: operation?.envShakePhase ?? firstNumber(findControllerParam(input.controller, "envshake.phase")),
      mul: operation?.envShakeMultiplier ?? firstNumber(findControllerParam(input.controller, "envshake.mul")),
      dir: operation?.envShakeDirection ?? firstNumber(findControllerParam(input.controller, "envshake.dir")),
    },
  );
  const koVelocityAdd = operation?.koVelocityAdd ?? velocityPair(findControllerParam(input.controller, "ko.velocity.add"));
  const guardDamage = Math.max(
    0,
    resolvedDamage?.guard
      ?? (hasDynamicDamage ? undefined : operation?.guardDamage)
      ?? (hasAuthoredDamage ? secondNumber(damageRaw) ?? 0 : 0),
  );
  const defaultBoundScale = projectileDefaultBoundScale(input.localCoord);
  const edgeBound = operation?.edgeBound ?? firstNumber(findControllerParam(input.controller, "projedgebound"));
  const stageBound = operation?.stageBound ?? firstNumber(findControllerParam(input.controller, "projstagebound"));
  const depthBound = normalizeProjectileDepthBound(
    operation?.depthBound ?? input.depthBound ?? firstNumber(findControllerParam(input.controller, "projdepthbound")),
  );
  const heightBound = operation?.heightBound ?? projectileHeightBound(numberPair(findControllerParam(input.controller, "projheightbound")));
  const layerNo = normalizeRuntimeProjectileLayerNo(
    operation?.layerNo ?? firstNumber(findControllerParam(input.controller, "projlayerno")) ?? input.ownerLayerNo ?? 0,
  );
  const guardPauseTimeRaw = findControllerParam(input.controller, "guard.pausetime");
  const authoredGuardPauseTime = runtimeProjectileStaticIntegerPair(guardPauseTimeRaw);
  const guardPauseAuthored = guardPauseTimeRaw !== undefined ||
    operation?.guardPauseTimeExpressions !== undefined ||
    operation?.guardPauseTime !== undefined ||
    operation?.guardShakeTime !== undefined;
  const resolvedGuardPauseTime = resolveRuntimeProjectileFreshPausePair(
    operation?.guardPauseTimeExpressions,
    guardPauseTimeRaw,
    input.resolveGuardPauseTime?.(),
    operation?.guardPauseTime === undefined && operation?.guardShakeTime === undefined
      ? undefined
      : [operation.guardPauseTime, operation.guardShakeTime],
    [hitPause, hitShakeTime],
    guardPauseAuthored ? authoredGuardPauseTime : undefined,
  );
  const guardPause = Math.max(0, Math.round(resolvedGuardPauseTime[0]));
  const guardShakeTime = Math.max(0, Math.round(resolvedGuardPauseTime[1]));
  const guardDistanceBounds = runtimeProjectileGuardDistanceBounds(input.controller, operation?.guardDistanceBounds);
  const minDistance = operation?.minDistance ?? partialNumberTriple(findControllerParam(input.controller, "mindist"));
  const maxDistance = operation?.maxDistance ?? partialNumberTriple(findControllerParam(input.controller, "maxdist"));
  const guardTiming = resolveHitDefGuardTiming({
    groundHitTime: hitStun,
    guardHitTime:
      finiteDynamicGuardHitTime === undefined
        ? operation?.guardHitTime ?? firstNumber(findControllerParam(input.controller, "guard.hittime"))
        : Math.trunc(finiteDynamicGuardHitTime),
    guardSlideTime: operation?.guardSlideTime ?? firstNumber(findControllerParam(input.controller, "guard.slidetime")),
    guardControlTime: operation?.guardControlTime ?? firstNumber(findControllerParam(input.controller, "guard.ctrltime")),
    airGuardControlTime: operation?.airGuardControlTime ?? firstNumber(findControllerParam(input.controller, "airguard.ctrltime")),
  });
  const guardStun = Math.max(1, Math.round(guardTiming.guardHitTime ?? Math.max(1, Math.round(hitStun * 0.55))));
  const guardSlideTime = guardTiming.guardSlideTime;
  const guardControlTime = guardTiming.guardControlTime;
  const attr = operation?.attr ?? stripMugenString(findControllerParam(input.controller, "attr")) ?? "S,SP";
  const defaultAttackerPower = runtimeHitDefGetPowerDefaults(baseDamage, attr, input.constants);
  const attackerHitPower = attackerPower?.hit ?? defaultAttackerPower.hit;
  const attackerGuardPower = attackerPower?.guard ?? Math.trunc(attackerHitPower * 0.5);
  const defaultGivePower = givePowerParam === undefined && authoredHitPower === undefined && authoredGuardPower === undefined
    ? runtimeHitDefGivePowerDefaults(baseDamage, attr, input.constants)
    : undefined;
  const hitPower = authoredHitPower ?? defaultGivePower?.hit;
  const guardPower = authoredGuardPower ?? (hitPower === undefined ? undefined : Math.trunc(hitPower * 0.5));
  const rawHitFlag = stripMugenString(findControllerParam(input.controller, "hitflag"));
  const hitFlag = operation?.hitFlag ?? (rawHitFlag === undefined ? input.defaultHitFlag : staticHitFlag(rawHitFlag));
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
  const hitSpark = operation?.hitSpark ?? staticRuntimeProjectileSparkRef(findControllerParam(input.controller, "sparkno"));
  const hitSparkAngle = operation?.hitSparkAngle ?? firstNumber(findControllerParam(input.controller, "sparkangle"));
  const guardSpark = operation?.guardSpark ?? staticRuntimeProjectileSparkRef(findControllerParam(input.controller, "guard.sparkno"));
  const guardSparkAngle = operation?.guardSparkAngle ?? firstNumber(findControllerParam(input.controller, "guard.sparkangle"));
  const sparkXy = operation?.sparkXy ?? projectileZeroDefaultPair(findControllerParam(input.controller, "sparkxy"));
  const kill = operation?.kill ?? (firstNumber(findControllerParam(input.controller, "kill")) ?? 1) !== 0;
  const guardKill = operation?.guardKill ?? (firstNumber(findControllerParam(input.controller, "guard.kill")) ?? 1) !== 0;
  const attackDepth =
    operation?.attackDepth ??
    normalizedNumberPair(findControllerParam(input.controller, "attack.depth")) ??
    input.attackDepth ??
    [...DEFAULT_RUNTIME_ATTACK_DEPTH] as [number, number];
  const dynamicRemoveTime = operation?.removeTimeExpression === undefined
    ? undefined
    : input.resolveRemoveTime?.();
  const finiteDynamicRemoveTime = dynamicRemoveTime !== undefined && Number.isFinite(dynamicRemoveTime)
    ? Math.trunc(dynamicRemoveTime)
    : undefined;
  const dynamicMissTime = operation?.missTimeExpression === undefined
    ? undefined
    : input.resolveMissTime?.();
  const finiteDynamicMissTime = dynamicMissTime !== undefined && Number.isFinite(dynamicMissTime)
    ? Math.trunc(dynamicMissTime)
    : undefined;
  const dynamicPriority = operation?.priorityExpression === undefined
    ? undefined
    : input.resolvePriority?.();
  const finiteDynamicPriority = dynamicPriority !== undefined && Number.isFinite(dynamicPriority)
    ? Math.trunc(dynamicPriority)
    : undefined;
  const dynamicHitCount = operation?.hitCountExpression === undefined
    ? undefined
    : input.resolveHitCount?.();
  const finiteDynamicHitCount = dynamicHitCount !== undefined && Number.isFinite(dynamicHitCount)
    ? Math.trunc(dynamicHitCount)
    : undefined;
  const initialHitCount = clampProjectileHits(
    finiteDynamicHitCount ??
    operation?.hitCount ??
    firstNumber(findControllerParam(input.controller, "projhits")) ??
    1,
  );
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
    pos: { ...input.pos },
    vel: {
      x: rawVelocity[0] * facing,
      y: rawVelocity[1],
      ...(rawVelocity[2] === undefined ? {} : { z: rawVelocity[2] }),
    },
    remVelocity: {
      x: rawRemovalVelocity[0],
      y: rawRemovalVelocity[1],
      ...(rawRemovalVelocity[2] === undefined ? {} : { z: rawRemovalVelocity[2] }),
    },
    accel: {
      x: rawAcceleration[0] * facing,
      y: rawAcceleration[1],
      ...(rawAcceleration[2] === undefined ? {} : { z: rawAcceleration[2] }),
    },
    velMul: pairToVelocityMultiplier(rawVelocityMultiplier),
    scale: pairToScale(rawScale),
    angle,
    xAngle,
    yAngle,
    xShear,
    shadow,
    reflection,
    projection,
    focalLength,
    window,
    ownPalette,
    drawPalette,
    ...(paletteRemap === undefined ? {} : { paletteRemap }),
    clsnScale: rawClsnScale ? pairToScale(rawClsnScale) : { ...(input.clsnScale ?? { x: 1, y: 1 }) },
    clsnAngle: clsnAngle ?? 0,
    facing,
    hitAnimNo: normalizeProjectileAnim(operation?.hitAnim ?? firstNumber(findControllerParam(input.controller, "projhitanim"))),
    removeAnimNo: normalizeProjectileAnim(operation?.removeAnim ?? firstNumber(findControllerParam(input.controller, "projremanim"))),
    cancelAnimNo: normalizeProjectileAnim(operation?.cancelAnim ?? firstNumber(findControllerParam(input.controller, "projcancelanim"))),
    terminalActions: input.terminalActions ?? {},
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: clampProjectileTime(
      finiteDynamicRemoveTime ??
      operation?.removeTime ??
      firstNumber(findControllerParam(input.controller, "projremovetime") ?? findControllerParam(input.controller, "removetime")) ??
      -1,
    ),
    edgeBound: clampProjectileStageBound(edgeBound ?? scaledDefaultProjectileBound(DEFAULT_PROJECTILE_EDGE_BOUND, defaultBoundScale)),
    stageBound: clampProjectileStageBound(stageBound ?? scaledDefaultProjectileBound(DEFAULT_PROJECTILE_STAGE_BOUND, defaultBoundScale)),
    ...(depthBound === undefined ? {} : { depthBound }),
    heightBound: optionalProjectileHeightBound(heightBound) ?? defaultProjectileHeightBound(defaultBoundScale),
    layerNo,
    spritePriority: Math.max(-5, Math.min(10, Math.round(
      operation?.spritePriority
      ?? firstNumber(findControllerParam(input.controller, "projsprpriority"))
      ?? 4,
    ))),
    ...((operation?.hitPriority ?? firstNumber(findControllerParam(input.controller, "priority"))) === undefined
      ? {}
      : { hitPriority: Math.trunc((operation?.hitPriority ?? firstNumber(findControllerParam(input.controller, "priority"))) as number) }),
    ...((operation?.hitPriorityType ?? projectileHitDefPriorityType(findControllerParam(input.controller, "priority"))) === undefined
      ? {}
      : { hitPriorityType: (operation?.hitPriorityType ?? projectileHitDefPriorityType(findControllerParam(input.controller, "priority"))) as "hit" | "miss" | "dodge" }),
    ...((operation?.p1SpritePriority ?? firstNumber(findControllerParam(input.controller, "p1sprpriority") ?? findControllerParam(input.controller, "sprpriority"))) === undefined
      ? {}
      : { p1SpritePriority: Math.trunc((operation?.p1SpritePriority ?? firstNumber(findControllerParam(input.controller, "p1sprpriority") ?? findControllerParam(input.controller, "sprpriority"))) as number) }),
    ...((operation?.p2SpritePriority ?? firstNumber(findControllerParam(input.controller, "p2sprpriority"))) === undefined
      ? {}
      : { p2SpritePriority: Math.trunc((operation?.p2SpritePriority ?? firstNumber(findControllerParam(input.controller, "p2sprpriority"))) as number) }),
    priority: clampProjectilePriority(
      finiteDynamicPriority ??
      operation?.priority ??
      firstNumber(findControllerParam(input.controller, "projpriority")) ??
      1,
    ),
    hitsRemaining: initialHitCount,
    hitsMax: initialHitCount,
    missTime: clampProjectileMissTime(
      finiteDynamicMissTime ??
      operation?.missTime ??
      firstNumber(findControllerParam(input.controller, "projmisstime")) ??
      0,
    ),
    missTimeRemaining: 0,
    pauseMoveTime,
    superMoveTime,
    opacity: parseProjectileOpacity(operation?.trans ?? findControllerParam(input.controller, "trans")),
    damage: Math.max(0, Math.round(baseDamage * (input.damageScale ?? 1))),
    ...(dizzyPoints === undefined ? {} : { dizzyPoints: Math.trunc(dizzyPoints) }),
    ...(input.dizzyPointsAttackMultiplier === undefined || !Number.isFinite(input.dizzyPointsAttackMultiplier)
      ? {}
      : { dizzyPointsAttackMultiplier: Math.max(0, Math.min(10, input.dizzyPointsAttackMultiplier)) }),
    ...(guardPoints === undefined ? {} : { guardPoints: Math.trunc(guardPoints) }),
    ...(input.guardPointsAttackMultiplier === undefined || !Number.isFinite(input.guardPointsAttackMultiplier)
      ? {}
      : { guardPointsAttackMultiplier: Math.max(0, Math.min(10, input.guardPointsAttackMultiplier)) }),
    ...(input.redLifeAttackMultiplier === undefined || !Number.isFinite(input.redLifeAttackMultiplier)
      ? {}
      : { redLifeAttackMultiplier: Math.max(0, Math.min(10, input.redLifeAttackMultiplier)) }),
    ...(redLife === undefined ? {} : { redLife: Math.trunc(redLife) }),
    ...(guardRedLife === undefined ? {} : { guardRedLife: Math.trunc(guardRedLife) }),
    attackerHitPower,
    attackerGuardPower,
    ...(guardPower === undefined ? {} : { guardPower: Math.trunc(guardPower) }),
    ...(hitPower === undefined ? {} : { hitPower: Math.trunc(hitPower) }),
    ...(score === undefined ? {} : { score }),
    ...(guardScore === undefined ? {} : { guardScore }),
    ...(unhittableTime === undefined ? {} : { unhittableTime: [...unhittableTime] as [number, number] }),
    ...(standFriction === undefined ? {} : { standFriction }),
    ...(crouchFriction === undefined ? {} : { crouchFriction }),
    hitSparkScale,
    guardSparkScale,
    ...(paletteFx === undefined ? {} : { paletteFx }),
    ...(p2Facing === undefined ? {} : { p2Facing: Math.trunc(p2Facing) }),
    ...(keepState === undefined ? {} : { keepState }),
    ...(minDistance === undefined ? {} : { minDistance: [...minDistance] as [number, number?, number?] }),
    ...(maxDistance === undefined ? {} : { maxDistance: [...maxDistance] as [number, number?, number?] }),
    ...(normalizedAirJuggle === undefined ? {} : { airJuggle: normalizedAirJuggle }),
    kill,
    guardKill,
    attr,
    ...(hitFlag === undefined ? {} : { hitFlag }),
    affectTeam,
    attackDepth: [...attackDepth],
    localCoord: input.localCoord,
    targetId,
    chainId: chainId === undefined ? undefined : Math.trunc(chainId),
    ...(noChainIds === undefined ? {} : { noChainIds: normalizeRuntimeIntegerList(noChainIds, 8) }),
    hitDefHitCount: Math.max(0, Math.trunc(hitDefHitCount)),
    teamSide,
    hitPause,
    hitShakeTime,
    hitPauseRemaining: 0,
    hitStun,
    ...(groundSlideTime === undefined ? {} : { groundSlideTime: Math.trunc(groundSlideTime) }),
    airHitTime,
    downHitTime,
    downVelocityX,
    downVelocityY,
    ...(downVelocityZ === undefined ? {} : { downVelocityZ }),
    ...(downBounce === undefined ? {} : { downBounce }),
    ...(forceNoFall === undefined ? {} : { forceNoFall }),
    ...(forceStand === undefined ? {} : { forceStand }),
    ...(forceCrouch === undefined ? {} : { forceCrouch }),
    ...(fall === undefined ? {} : { fall }),
    p1StateNo: operation?.p1StateNo ?? firstNumber(findControllerParam(input.controller, "p1stateno")),
    p2StateNo: operation?.p2StateNo ?? firstNumber(findControllerParam(input.controller, "p2stateno")),
    p2GetP1State: resolveProjectileP2GetP1State(input.controller, operation),
    p2ClsnCheck: operation?.p2ClsnCheck ?? normalizeMugenCollisionBoxType(findControllerParam(input.controller, "p2clsncheck")),
    p2ClsnRequire: operation?.p2ClsnRequire ?? normalizeMugenCollisionBoxType(findControllerParam(input.controller, "p2clsnrequire")),
    missOnOverride: operation?.missOnOverride ?? booleanNumber(findControllerParam(input.controller, "missonoverride")),
    push,
    hitVelocityY: groundVelocity?.[1],
    hitVelocityZ: groundVelocity?.[2],
    airVelocityX: airVelocity?.[0],
    airVelocityY: airVelocity?.[1],
    airVelocityZ: airVelocity?.[2],
    ...(hitVelocities === undefined ? {} : { hitVelocities }),
    hitAnimTypes: { ground: groundAnimType, air: airAnimType, fall: fallAnimType },
    ...(hitXAccel === undefined ? {} : { hitXAccel }),
    ...(hitYAccel === undefined ? {} : { hitYAccel }),
    ...(hitZAccel === undefined ? {} : { hitZAccel }),
    ...(envShake === undefined ? {} : { envShake }),
    ...(koVelocityAdd === undefined ? {} : { koVelocityAdd: { x: koVelocityAdd[0], y: koVelocityAdd[1] ?? 0 } }),
    guardDamage,
    guardDistanceBounds,
    guardFlag: operation?.guardFlag ?? stripMugenString(findControllerParam(input.controller, "guardflag")) ?? "MA",
    guardPause,
    guardShakeTime,
    guardStun,
    guardSlideTime,
    guardControlTime,
    airGuardControlTime: guardTiming.airGuardControlTime,
    guardPush: Math.abs(guardVelocityX ?? Math.max(1, Math.round(push * 0.55))),
    guardVelocityY: guardVelocity?.[1],
    guardVelocityZ: guardVelocity?.[2],
    airGuardPush: airGuardVelocity ? Math.abs(airGuardVelocity[0]) : undefined,
    airGuardVelocityY: airGuardVelocity?.[1],
    airGuardVelocityZ: airGuardVelocity?.[2],
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
    hitSparkAngle,
    guardSpark,
    guardSparkAngle,
    sparkXy,
    hitbox: cloneBox(frame?.clsn1[0] ?? { x1: 8, y1: -48, x2: 56, y2: -18 }),
    removeOnHit: operation?.removeOnHit ?? (firstNumber(findControllerParam(input.controller, "projremove")) ?? 1) !== 0,
    hasHit: false,
  };
}

export function runtimeProjectileVar(
  projectile: RuntimeProjectile,
  parameter: string,
  outputLocalCoord?: [number, number],
): number | undefined {
  const normalized = normalizeRuntimeProjectileVarParameter(parameter);
  if (!normalized) return undefined;
  const scaled = (value: number | undefined): number | undefined =>
    value === undefined ? undefined : value * runtimeProjectileVarLocalScale(projectile.localCoord, outputLocalCoord);

  switch (normalized) {
    case "accel.x": return scaled(projectile.accel.x);
    case "accel.y": return scaled(projectile.accel.y);
    case "accel.z": return scaled(projectile.accel.z);
    case "anim": return projectile.animNo;
    case "animelem": return projectile.frameIndex + 1;
    case "drawpal.group": return projectile.drawPalette[0];
    case "drawpal.index": return projectile.drawPalette[1];
    case "facing": return projectile.facing;
    case "highbound": return scaled(projectile.heightBound?.high);
    case "lowbound": return scaled(projectile.heightBound?.low);
    case "pausemovetime": return projectile.pauseMoveTime;
    case "pos.x": return scaled(projectile.pos.x);
    case "pos.y": return scaled(projectile.pos.y);
    case "pos.z": return scaled(projectile.pos.z);
    case "projangle": return projectile.angle;
    case "projxangle": return projectile.xAngle;
    case "projyangle": return projectile.yAngle;
    case "projxshear": return projectile.xShear;
    case "projshadow.r": return projectile.shadow[0];
    case "projshadow.g": return projectile.shadow[1];
    case "projshadow.b": return projectile.shadow[2];
    case "projcancelanim": return projectile.cancelAnimNo ?? -1;
    case "projedgebound": return scaled(projectile.edgeBound);
    case "projhitanim": return projectile.hitAnimNo ?? -1;
    case "projhits": return projectile.hitsRemaining;
    case "projhitsmax": return projectile.hitsMax ?? projectile.hitsRemaining;
    case "projid": return projectile.projectileId ?? 0;
    case "projlayerno": return projectile.layerNo;
    case "projmisstime": return projectile.missTimeRemaining;
    case "projpriority": return projectile.priority;
    case "projremanim": return projectile.removeAnimNo ?? -1;
    case "projremove": return projectile.removeOnHit ? 1 : 0;
    case "projremovetime": return projectile.removeTime < 0 ? projectile.removeTime : Math.max(0, projectile.removeTime - projectile.age);
    case "projsprpriority": return projectile.spritePriority;
    case "projstagebound": return scaled(projectile.stageBound);
    case "remvelocity.x": return scaled(projectile.remVelocity.x);
    case "remvelocity.y": return scaled(projectile.remVelocity.y);
    case "remvelocity.z": return scaled(projectile.remVelocity.z);
    case "scale.x": return projectile.scale.x;
    case "scale.y": return projectile.scale.y;
    case "supermovetime": return projectile.superMoveTime;
    case "teamside": return projectile.teamSide ?? runtimeTeamSideFromId(projectile.rootId) ?? 0;
    case "time": return projectile.age;
    case "vel.x": return scaled(projectile.vel.x);
    case "vel.y": return scaled(projectile.vel.y);
    case "vel.z": return scaled(projectile.vel.z);
    case "velmul.x": return projectile.velMul.x;
    case "velmul.y": return projectile.velMul.y;
    case "velmul.z": return projectile.velMul.z ?? 1;
  }
}

export function normalizeRuntimeProjectileVarParameter(parameter: string): RuntimeProjectileVarParameter | undefined {
  const key = parameter.trim().toLowerCase().replace(/[\s_.]/g, "");
  const aliases: Record<string, RuntimeProjectileVarParameter> = {
    accelx: "accel.x", accely: "accel.y", accelz: "accel.z",
    anim: "anim", animelem: "animelem", drawpalgroup: "drawpal.group", drawpalindex: "drawpal.index", facing: "facing",
    highbound: "highbound", lowbound: "lowbound", pausemovetime: "pausemovetime",
    posx: "pos.x", posy: "pos.y", posz: "pos.z", projangle: "projangle",
    anglex: "projxangle", projxangle: "projxangle", angley: "projyangle", projyangle: "projyangle",
    xshear: "projxshear", projxshear: "projxshear",
    shadowr: "projshadow.r", projshadowr: "projshadow.r",
    shadowg: "projshadow.g", projshadowg: "projshadow.g",
    shadowb: "projshadow.b", projshadowb: "projshadow.b",
    projcancelanim: "projcancelanim", projedgebound: "projedgebound",
    projhitanim: "projhitanim", projhits: "projhits", projhitsmax: "projhitsmax",
    projid: "projid", projlayerno: "projlayerno", projmisstime: "projmisstime", projpriority: "projpriority",
    projremanim: "projremanim", projremove: "projremove", projremovetime: "projremovetime",
    projsprpriority: "projsprpriority", sprpriority: "projsprpriority",
    projstagebound: "projstagebound", scalex: "scale.x", scaley: "scale.y", supermovetime: "supermovetime",
    remvelocityx: "remvelocity.x", remvelocityy: "remvelocity.y", remvelocityz: "remvelocity.z",
    teamside: "teamside", time: "time", velx: "vel.x", vely: "vel.y", velz: "vel.z",
    velmulx: "velmul.x", velmuly: "velmul.y", velmulz: "velmul.z",
  };
  return aliases[key];
}

function runtimeProjectileVarLocalScale(
  sourceLocalCoord: [number, number] | undefined,
  outputLocalCoord: [number, number] | undefined,
): number {
  const sourceWidth = sourceLocalCoord?.[0] ?? DEFAULT_PROJECTILE_LOCAL_COORD_WIDTH;
  const outputWidth = outputLocalCoord?.[0] ?? sourceWidth;
  if (!Number.isFinite(sourceWidth) || sourceWidth <= 0 || !Number.isFinite(outputWidth) || outputWidth <= 0) {
    return 1;
  }
  return outputWidth / sourceWidth;
}

export function modifyRuntimeProjectiles(projectiles: RuntimeProjectile[], input: RuntimeProjectileModifyInput): number {
  const operation = input.operation;
  const selectionId = operation?.selectionId ?? resolveModifyProjectileNumberParam(input, "id");
  const rawTargetId = operation?.targetId ?? selectionId;
  const targetId = rawTargetId === undefined ? undefined : Math.max(0, Math.trunc(rawTargetId));
  const chainId = operation?.chainId ?? resolveModifyProjectileNumberParam(input, "chainid");
  const noChainIds = operation?.noChainIds
    ?? input.resolveModifyProjectile?.resolveIntegerList?.("nochainid")
    ?? staticRuntimeIntegerList(findControllerParam(input.controller, "nochainid"), 8);
  const selectionIndex = operation?.selectionIndex ?? resolveModifyProjectileNumberParam(input, "index");
  const projectileId = operation?.projectileId ?? resolveModifyProjectileNumberParam(input, "projid");
  const resolvedProjAnimExpression = operation?.projAnimExpression === undefined
    ? undefined
    : typeof operation.projAnimExpression === "number"
      ? Number.isFinite(operation.projAnimExpression) ? Math.trunc(operation.projAnimExpression) : undefined
      : input.resolveModifyProjectile?.resolveAnimation?.()
        ?? resolveModifyProjectileNumberParam(input, "projanim");
  const projAnim = operation?.projAnim ?? resolvedProjAnimExpression
    ?? (operation?.projAnimExpression === undefined
      ? resolveModifyProjectileNumberParam(input, "projanim")
      : undefined);
  const normalizedProjAnim = projAnim === undefined ? undefined : Math.trunc(projAnim);
  const replacementAction = normalizedProjAnim === undefined ? undefined : input.resolveAction?.(normalizedProjAnim);
  const hasHitAnim = operation?.hitAnim !== undefined || operation?.hitAnimExpression !== undefined || findControllerParam(input.controller, "projhitanim") !== undefined;
  const hasRemoveAnim = operation?.removeAnim !== undefined || operation?.removeAnimExpression !== undefined || findControllerParam(input.controller, "projremanim") !== undefined;
  const hasCancelAnim = operation?.cancelAnim !== undefined || operation?.cancelAnimExpression !== undefined || findControllerParam(input.controller, "projcancelanim") !== undefined;
  const hitAnim = operation?.hitAnim ?? resolveModifyProjectileTerminalAnimationParam(input, "projhitanim", operation?.hitAnimExpression);
  const removeAnim = operation?.removeAnim ?? resolveModifyProjectileTerminalAnimationParam(input, "projremanim", operation?.removeAnimExpression);
  const cancelAnim = operation?.cancelAnim ?? resolveModifyProjectileTerminalAnimationParam(input, "projcancelanim", operation?.cancelAnimExpression);
  const normalizedHitAnim = normalizeProjectileAnim(hitAnim);
  const normalizedRemoveAnim = normalizeProjectileAnim(removeAnim);
  const normalizedCancelAnim = normalizeProjectileAnim(cancelAnim);
  const teamSide = operation?.teamSide ?? resolveModifyProjectileNumberParam(input, "teamside");
  const affectTeam = operation?.affectTeam ?? normalizeMugenAffectTeam(findControllerParam(input.controller, "affectteam"));
  const animType = operation?.animType ?? hitAnimType(findControllerParam(input.controller, "animtype"));
  const airAnimType = operation?.airAnimType ?? hitAnimType(findControllerParam(input.controller, "air.animtype"));
  const fallAnimType = operation?.fallAnimType ?? hitAnimType(findControllerParam(input.controller, "fall.animtype"));
  const killParam = operation?.kill === undefined ? resolveModifyProjectileFloatParam(input, "kill") : undefined;
  const guardKillParam = operation?.guardKill === undefined ? resolveModifyProjectileFloatParam(input, "guard.kill") : undefined;
  const fallKillParam = operation?.fallKill === undefined ? resolveModifyProjectileFloatParam(input, "fall.kill") : undefined;
  const forceNoFallParam = operation?.forceNoFall === undefined ? resolveModifyProjectileFloatParam(input, "forcenofall") : undefined;
  const forceStandParam = operation?.forceStand === undefined ? resolveModifyProjectileFloatParam(input, "forcestand") : undefined;
  const forceCrouchParam = operation?.forceCrouch === undefined ? resolveModifyProjectileFloatParam(input, "forcecrouch") : undefined;
  const kill = operation?.kill ?? (killParam === undefined ? undefined : killParam !== 0);
  const guardKill = operation?.guardKill ?? (guardKillParam === undefined ? undefined : guardKillParam !== 0);
  const fallKill = operation?.fallKill ?? (fallKillParam === undefined ? undefined : fallKillParam !== 0);
  const forceNoFall = operation?.forceNoFall ?? (forceNoFallParam === undefined ? undefined : forceNoFallParam !== 0);
  const forceStand = operation?.forceStand ?? (forceStandParam === undefined ? undefined : forceStandParam !== 0);
  const forceCrouch = operation?.forceCrouch ?? (forceCrouchParam === undefined ? undefined : forceCrouchParam !== 0);
  const fallDamage = operation?.fallDamage ?? resolveModifyProjectileNumberParam(input, "fall.damage");
  const fallXVelocity = operation?.fallXVelocity ?? resolveModifyProjectileFloatParam(input, "fall.xvelocity");
  const fallYVelocity = operation?.fallYVelocity ?? resolveModifyProjectileFloatParam(input, "fall.yvelocity");
  const fallZVelocity = operation?.fallZVelocity ?? resolveModifyProjectileFloatParam(input, "fall.zvelocity");
  const fallRecoverParam = operation?.fallRecover === undefined ? resolveModifyProjectileFloatParam(input, "fall.recover") : undefined;
  const fallRecover = operation?.fallRecover ?? (fallRecoverParam === undefined ? undefined : fallRecoverParam !== 0);
  const fallRecoverTime = operation?.fallRecoverTime ?? resolveModifyProjectileNumberParam(input, "fall.recovertime");
  const downRecoverParam = operation?.downRecover === undefined ? resolveModifyProjectileFloatParam(input, "down.recover") : undefined;
  const downRecover = operation?.downRecover ?? (downRecoverParam === undefined ? undefined : downRecoverParam !== 0);
  const downRecoverTime = operation?.downRecoverTime ?? resolveModifyProjectileNumberParam(input, "down.recovertime");
  const fallEnvShakeTime = operation?.fallEnvShakeTime ?? resolveModifyProjectileNumberParam(input, "fall.envshake.time");
  const fallEnvShakeFrequency = operation?.fallEnvShakeFrequency ?? resolveModifyProjectileFloatParam(input, "fall.envshake.freq");
  const fallEnvShakeAmplitude = operation?.fallEnvShakeAmplitude ?? resolveModifyProjectileNumberParam(input, "fall.envshake.ampl");
  const fallEnvShakePhase = operation?.fallEnvShakePhase ?? resolveModifyProjectileFloatParam(input, "fall.envshake.phase");
  const fallEnvShakeMultiplier = operation?.fallEnvShakeMultiplier ?? resolveModifyProjectileFloatParam(input, "fall.envshake.mul");
  const fallEnvShakeDirection = operation?.fallEnvShakeDirection ?? resolveModifyProjectileFloatParam(input, "fall.envshake.dir");
  const airJuggle = operation?.airJuggle ?? resolveModifyProjectileNumberParam(input, "air.juggle");
  const typedDamagePair = operation?.damageExpressions === undefined
    ? undefined
    : resolveRuntimeProjectileModifyDamagePair(
        operation.damageExpressions,
        resolveModifyProjectilePairParam(input, "damage", projectileZeroDefaultPair),
      );
  const damagePair = typedDamagePair
    ?? (operation?.damage === undefined && operation?.guardDamage === undefined
      ? resolveModifyProjectilePairParam(input, "damage", projectileZeroDefaultPair)
      : undefined);
  const damage = operation?.damage ?? damagePair?.[0];
  const guardDamage = operation?.guardDamage ?? damagePair?.[1];
  const dizzyPoints = operation?.dizzyPoints ?? resolveModifyProjectileNumberParam(input, "dizzypoints");
  const guardPoints = operation?.guardPoints ?? resolveModifyProjectileNumberParam(input, "guardpoints");
  const getPowerRaw = findControllerParam(input.controller, "getpower");
  const attackerPower = operation?.getPower !== undefined || getPowerRaw !== undefined
    ? resolveRuntimeProjectileModifyPowerPair(
        operation?.getPower,
        getPowerRaw,
        resolveModifyProjectilePairParam(input, "getpower", projectileZeroDefaultPair),
      )
    : undefined;
  const givePowerPair = operation?.hitPower === undefined && operation?.guardPower === undefined
    ? resolveModifyProjectilePairParam(input, "givepower", projectileZeroDefaultPair)
    : undefined;
  const hitPower = operation?.hitPower ?? givePowerPair?.[0];
  const guardPower = operation?.guardPower ?? givePowerPair?.[1];
  const redLifePair = operation?.redLife === undefined && operation?.guardRedLife === undefined
    ? resolveModifyProjectilePairParam(input, "redlife", projectileZeroDefaultPair)
    : undefined;
  const redLife = operation?.redLife ?? redLifePair?.[0];
  const guardRedLife = operation?.guardRedLife ?? redLifePair?.[1];
  const scorePair = operation?.score === undefined && operation?.guardScore === undefined
    ? resolveModifyProjectileFloatPairParam(input, "score", projectileZeroDefaultPair)
    : undefined;
  const score = operation?.score ?? scorePair?.[0];
  const guardScore = operation?.guardScore ?? scorePair?.[1];
  const hitDefHitCount = operation?.hitDefHitCount ?? resolveModifyProjectileNumberParam(input, "numhits");
  const hitPriority = operation?.hitPriority ?? resolveModifyProjectileNumberParam(input, "priority");
  const hitPriorityType = operation?.hitPriorityType ?? projectileHitDefPriorityType(findControllerParam(input.controller, "priority"));
  const p2SpritePriority = operation?.p2SpritePriority ?? resolveModifyProjectileNumberParam(input, "p2sprpriority");
  const p1StateNo = operation?.p1StateNo ?? resolveModifyProjectileIntegerExpressionParam(
    input,
    "p1stateno",
    operation?.p1StateNoExpression,
  );
  const hasP2StateNo = operation?.p2StateNo !== undefined ||
    operation?.p2StateNoExpression !== undefined ||
    findControllerParam(input.controller, "p2stateno") !== undefined;
  const p2StateNo = operation?.p2StateNo ?? resolveModifyProjectileIntegerExpressionParam(
    input,
    "p2stateno",
    operation?.p2StateNoExpression,
  );
  const p2GetP1StateParam = operation?.p2GetP1State === undefined
    ? resolveModifyProjectileIntegerExpressionParam(
        input,
        "p2getp1state",
        operation?.p2GetP1StateExpression,
      )
    : undefined;
  const p2GetP1State = operation?.p2GetP1State
    ?? (p2GetP1StateParam === undefined ? (hasP2StateNo && p2StateNo !== undefined ? true : undefined) : p2GetP1StateParam !== 0);
  const p2Facing = operation?.p2Facing ?? resolveModifyProjectileIntegerExpressionParam(
    input,
    "p2facing",
    operation?.p2FacingExpression,
  );
  const minDistance = normalizeModifyProjectileVelocity(operation?.minDistance
    ?? resolveModifyProjectileFloatTripleParam(input, "mindist", projectileZeroDefaultTriple));
  const maxDistance = normalizeModifyProjectileVelocity(operation?.maxDistance
    ?? resolveModifyProjectileFloatTripleParam(input, "maxdist", projectileZeroDefaultTriple));
  const airHitTime = operation?.airHitTime ?? resolveModifyProjectileNumberParam(input, "air.hittime");
  const groundFallParam = operation?.groundFall === undefined
    ? resolveModifyProjectileFloatParam(input, "fall")
    : undefined;
  const groundFall = operation?.groundFall ?? (groundFallParam === undefined ? undefined : groundFallParam !== 0);
  const airFallParam = operation?.airFall === undefined
    ? resolveModifyProjectileFloatParam(input, "air.fall")
    : undefined;
  const airFall = operation?.airFall ?? (airFallParam === undefined ? undefined : airFallParam !== 0);
  const downBounceParam = operation?.downBounce === undefined
    ? resolveModifyProjectileFloatParam(input, "down.bounce")
    : undefined;
  const downBounce = operation?.downBounce ?? (downBounceParam === undefined ? undefined : downBounceParam !== 0);
  const hitStun = operation?.hitStun ?? resolveModifyProjectileNumberParam(input, "ground.hittime");
  const pauseTime = operation?.pauseTime
    ?? resolveModifyProjectilePairParam(input, "pausetime", projectileZeroDefaultPair);
  const guardPauseTime = operation?.guardPauseTime
    ?? resolveModifyProjectilePairParam(input, "guard.pausetime", projectileZeroDefaultPair);
  const guardDistanceWidth = operation?.guardDistanceBounds?.width
    ?? (findControllerParam(input.controller, "guard.dist.width") !== undefined
      ? resolveModifyProjectilePairParam(input, "guard.dist.width", projectileZeroDefaultPair)
      : resolveModifyProjectilePairParam(input, "guard.dist", projectileZeroDefaultPair));
  const guardDistanceHeight = operation?.guardDistanceBounds?.height
    ?? resolveModifyProjectilePairParam(input, "guard.dist.height", projectileZeroDefaultPair);
  const guardDistanceDepth = operation?.guardDistanceBounds?.depth
    ?? resolveModifyProjectilePairParam(input, "guard.dist.depth", projectileZeroDefaultPair);
  const hitSpark = operation?.hitSpark ?? staticRuntimeProjectileSparkRef(findControllerParam(input.controller, "sparkno"));
  const hitSparkAngle = operation?.hitSparkAngle ?? resolveModifyProjectileFloatParam(input, "sparkangle");
  const guardSpark = operation?.guardSpark ?? staticRuntimeProjectileSparkRef(findControllerParam(input.controller, "guard.sparkno"));
  const guardSparkAngle = operation?.guardSparkAngle ?? resolveModifyProjectileFloatParam(input, "guard.sparkangle");
  const sparkXy = operation?.sparkXy
    ?? resolveModifyProjectileFloatPairParam(input, "sparkxy", projectileZeroDefaultPair);
  const groundSlideTime = operation?.groundSlideTime ?? resolveModifyProjectileNumberParam(input, "ground.slidetime");
  const guardHitTime = operation?.guardHitTime ?? resolveModifyProjectileNumberParam(input, "guard.hittime");
  const guardSlideTime = operation?.guardSlideTime ?? resolveModifyProjectileNumberParam(input, "guard.slidetime");
  const guardControlTime = operation?.guardControlTime ?? resolveModifyProjectileNumberParam(input, "guard.ctrltime");
  const airGuardControlTime = operation?.airGuardControlTime ?? resolveModifyProjectileNumberParam(input, "airguard.ctrltime");
  const downHitTime = operation?.downHitTime ?? resolveModifyProjectileNumberParam(input, "down.hittime");
  const groundVelocity = operation?.groundVelocity
    ?? resolveModifyProjectileFloatPartialTripleParam(input, "ground.velocity");
  const downVelocity = normalizeModifyProjectileVelocity(operation?.downVelocity
    ?? resolveModifyProjectileFloatTripleParam(input, "down.velocity", projectileZeroDefaultTriple));
  const airVelocity = normalizeModifyProjectileVelocity(operation?.airVelocity
    ?? resolveModifyProjectileFloatTripleParam(input, "air.velocity", projectileZeroDefaultTriple));
  const guardVelocity = normalizeModifyProjectileVelocity(operation?.guardVelocity
    ?? resolveModifyProjectileFloatTripleParam(input, "guard.velocity", projectileZeroDefaultTriple));
  const airGuardVelocity = normalizeModifyProjectileVelocity(operation?.airGuardVelocity
    ?? resolveModifyProjectileFloatTripleParam(input, "airguard.velocity", projectileZeroDefaultTriple));
  const xAccel = operation?.xAccel ?? resolveModifyProjectileFloatParam(input, "xaccel");
  const yAccel = operation?.yAccel ?? resolveModifyProjectileFloatParam(input, "yaccel");
  const zAccel = operation?.zAccel ?? resolveModifyProjectileFloatParam(input, "zaccel");
  const envShakeTime = operation?.envShakeTime ?? resolveModifyProjectileNumberParam(input, "envshake.time");
  const envShakeFrequency = operation?.envShakeFrequency ?? resolveModifyProjectileFloatParam(input, "envshake.freq");
  const envShakeAmplitude = operation?.envShakeAmplitude ?? resolveModifyProjectileNumberParam(input, "envshake.ampl");
  const envShakePhase = operation?.envShakePhase ?? resolveModifyProjectileFloatParam(input, "envshake.phase");
  const envShakeMultiplier = operation?.envShakeMultiplier ?? resolveModifyProjectileFloatParam(input, "envshake.mul");
  const envShakeDirection = operation?.envShakeDirection ?? resolveModifyProjectileFloatParam(input, "envshake.dir");
  const missOnOverrideParam = operation?.missOnOverride === undefined
    ? resolveModifyProjectileNumberParam(input, "missonoverride")
    : undefined;
  const missOnOverride = operation?.missOnOverride
    ?? (missOnOverrideParam === undefined ? undefined : missOnOverrideParam !== 0);
  const p2ClsnCheck = operation?.p2ClsnCheck ?? normalizeMugenCollisionBoxType(findControllerParam(input.controller, "p2clsncheck"));
  const p2ClsnRequire = operation?.p2ClsnRequire ?? normalizeMugenCollisionBoxType(findControllerParam(input.controller, "p2clsnrequire"));
  const attackDepth = operation?.attackDepth
    ?? resolveModifyProjectileFloatPairParam(input, "attack.depth", projectileZeroDefaultPair);
  const velocity = operation?.velocity ?? resolveModifyProjectilePairParam(input, "velocity", numberPair);
  const removalVelocity = operation?.removalVelocity ?? resolveModifyProjectilePairParam(input, "remvelocity", numberTriple);
  const acceleration = operation?.acceleration ?? resolveModifyProjectilePairParam(input, "accel", numberPair);
  const velocityMultiplier = operation?.velocityMultiplier ?? resolveModifyProjectilePairParam(
    input,
    "velmul",
    (raw) => projectileVelocityMultiplier(raw, 0),
  );
  const scale = operation?.scale ?? resolveModifyProjectilePairParam(input, "projscale", scalePair);
  const angle = operation?.angle ?? resolveModifyProjectileNumberParam(input, "projangle");
  const xAngle = operation?.xAngle ?? resolveModifyProjectileNumberParam(input, "projxangle");
  const yAngle = operation?.yAngle ?? resolveModifyProjectileNumberParam(input, "projyangle");
  const xShear = operation?.xShear ?? resolveModifyProjectileNumberParam(input, "projxshear");
  const shadow = operation?.shadow ?? partialNumberTriple(findControllerParam(input.controller, "projshadow"));
  const reflection = operation?.reflection ?? resolveModifyProjectileNumberParam(input, "projreflection");
  const projection = operation?.projection ?? projectileProjection(findControllerParam(input.controller, "projprojection"));
  const focalLength = operation?.focalLength ?? resolveModifyProjectileNumberParam(input, "projfocallength");
  const window = operation?.window ?? numberQuad(findControllerParam(input.controller, "projwindow"));
  const clsnScale = operation?.clsnScale ?? resolveModifyProjectilePairParam(
    input,
    "projclsnscale",
    (raw) => projectileClsnScalePair(raw, 0),
  );
  const clsnAngle = operation?.clsnAngle ?? resolveModifyProjectileNumberParam(input, "projclsnangle");
  const edgeBound = operation?.edgeBound ?? resolveModifyProjectileNumberParam(input, "projedgebound");
  const stageBound = operation?.stageBound ?? resolveModifyProjectileNumberParam(input, "projstagebound");
  const depthBound = operation?.depthBound ?? resolveModifyProjectileNumberParam(input, "projdepthbound");
  const heightBound = operation?.heightBound ?? resolveModifyProjectileHeightBoundParam(input);
  const layerNo = operation?.layerNo ?? resolveModifyProjectileNumberParam(input, "projlayerno");
  const removeTime = operation?.removeTime ?? resolveModifyProjectileNumberParam(input, "projremovetime");
  const spritePriority = operation?.spritePriority ?? resolveModifyProjectileNumberParam(input, "projsprpriority");
  const priority = operation?.priority ?? resolveModifyProjectileNumberParam(input, "projpriority");
  const hitCount = operation?.hitCount ?? resolveModifyProjectileNumberParam(input, "projhits");
  const missTime = operation?.missTime ?? resolveModifyProjectileNumberParam(input, "projmisstime");
  const pauseMoveTime = operation?.pauseMoveTime
    ?? resolveModifyProjectileMoveTimeParam(input, "pausemovetime", operation?.pauseMoveTimeExpression);
  const superMoveTime = operation?.superMoveTime
    ?? resolveModifyProjectileMoveTimeParam(input, "supermovetime", operation?.superMoveTimeExpression);
  const attr = operation?.attr ?? staticHitFlag(findControllerParam(input.controller, "attr"));
  const guardFlag = operation?.guardFlag ?? staticHitFlag(findControllerParam(input.controller, "guardflag"));
  const hitFlag = operation?.hitFlag ?? staticHitFlag(findControllerParam(input.controller, "hitflag"));
  const removeOnHitParam = operation?.removeOnHit === undefined ? resolveModifyProjectileNumberParam(input, "projremove") : undefined;
  const removeOnHit = operation?.removeOnHit ?? (removeOnHitParam === undefined ? undefined : removeOnHitParam !== 0);
  let changed = 0;
  const activeMatches = projectiles
    .filter((projectile) =>
      !projectile.removalReason &&
      !projectile.terminalPlayback &&
      (selectionId === undefined || selectionId < 0 || projectile.projectileId === Math.trunc(selectionId)),
    )
    .reverse();
  const selected = selectionIndex !== undefined && selectionIndex >= 0
    ? activeMatches.slice(Math.trunc(selectionIndex), Math.trunc(selectionIndex) + 1)
    : activeMatches;

  for (const projectile of selected) {
    if (targetId !== undefined) {
      projectile.targetId = targetId;
    }
    if (chainId !== undefined) {
      projectile.chainId = Math.trunc(chainId);
    }
    if (noChainIds !== undefined) {
      projectile.noChainIds = normalizeRuntimeIntegerList(noChainIds, 8);
    }
    if (projectileId !== undefined) {
      projectile.projectileId = Math.trunc(projectileId);
    }
    if (
      normalizedProjAnim !== undefined &&
      normalizedProjAnim !== projectile.animNo &&
      replacementAction &&
      replacementAction.frames.length > 0
    ) {
      projectile.animNo = normalizedProjAnim;
      projectile.action = replacementAction;
      projectile.frameIndex = 0;
      projectile.frameElapsed = 0;
    }
    if (hasHitAnim && hitAnim !== undefined) {
      projectile.hitAnimNo = normalizedHitAnim;
      projectile.terminalActions.hit = normalizedHitAnim === undefined ? undefined : input.resolveAction?.(normalizedHitAnim);
    }
    if (hasRemoveAnim && removeAnim !== undefined) {
      projectile.removeAnimNo = normalizedRemoveAnim;
      projectile.terminalActions.remove = normalizedRemoveAnim === undefined ? undefined : input.resolveAction?.(normalizedRemoveAnim);
    }
    if (hasCancelAnim && cancelAnim !== undefined) {
      projectile.cancelAnimNo = normalizedCancelAnim;
      projectile.terminalActions.cancel = normalizedCancelAnim === undefined ? undefined : input.resolveAction?.(normalizedCancelAnim);
    }
    if (velocity) {
      projectile.vel = {
        x: velocity[0] * projectile.facing,
        y: velocity[1],
        ...(velocity[2] === undefined ? (projectile.vel.z === undefined ? {} : { z: projectile.vel.z }) : { z: velocity[2] }),
      };
    }
    if (removalVelocity) {
      projectile.remVelocity = {
        x: removalVelocity[0],
        y: removalVelocity[1],
        ...(removalVelocity[2] === undefined
          ? (projectile.remVelocity.z === undefined ? {} : { z: projectile.remVelocity.z })
          : { z: removalVelocity[2] }),
      };
    }
    if (acceleration) {
      projectile.accel = {
        x: acceleration[0] * projectile.facing,
        y: acceleration[1],
        ...(acceleration[2] === undefined ? (projectile.accel.z === undefined ? {} : { z: projectile.accel.z }) : { z: acceleration[2] }),
      };
    }
    if (velocityMultiplier) {
      projectile.velMul = pairToVelocityMultiplier(velocityMultiplier);
    }
    if (scale) {
      projectile.scale = pairToScale(scale);
    }
    if (angle !== undefined) {
      projectile.angle = finiteProjectileAngle(angle);
    }
    if (xAngle !== undefined) {
      projectile.xAngle = finiteProjectileAngle(xAngle);
    }
    if (yAngle !== undefined) {
      projectile.yAngle = finiteProjectileAngle(yAngle);
    }
    if (xShear !== undefined) {
      projectile.xShear = finiteProjectileAngle(xShear);
    }
    if (shadow !== undefined) {
      projectile.shadow = modifyRuntimeProjectileShadow(projectile.shadow, shadow);
    }
    if (reflection !== undefined) {
      projectile.reflection = finiteProjectileInteger(reflection, -1);
    }
    if (projection !== undefined) {
      projectile.projection = runtimeProjectileProjection(projection);
    }
    if (focalLength !== undefined) {
      projectile.focalLength = finiteProjectileAngle(focalLength);
    }
    if (window !== undefined) {
      projectile.window = runtimeProjectileWindow(window);
    }
    if (clsnScale) {
      projectile.clsnScale = pairToScale(clsnScale);
    }
    if (clsnAngle !== undefined) {
      projectile.clsnAngle = clsnAngle;
    }
    if (edgeBound !== undefined) {
      projectile.edgeBound = clampProjectileStageBound(edgeBound);
    }
    if (stageBound !== undefined) {
      projectile.stageBound = clampProjectileStageBound(stageBound);
    }
    if (depthBound !== undefined) {
      projectile.depthBound = normalizeProjectileDepthBound(depthBound);
    }
    if (heightBound !== undefined) {
      projectile.heightBound = optionalProjectileHeightBound(heightBound);
    }
    if (layerNo !== undefined) {
      projectile.layerNo = normalizeRuntimeProjectileLayerNo(layerNo);
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
    if (pauseMoveTime !== undefined) {
      projectile.pauseMoveTime = initialRuntimeProjectileMoveTime(pauseMoveTime);
    }
    if (superMoveTime !== undefined) {
      projectile.superMoveTime = initialRuntimeProjectileMoveTime(superMoveTime);
    }
    if (attr !== undefined) {
      projectile.attr = attr;
    }
    if (guardFlag !== undefined) {
      projectile.guardFlag = guardFlag;
    }
    if (hitFlag !== undefined) {
      projectile.hitFlag = hitFlag;
    }
    if (affectTeam !== undefined) {
      projectile.affectTeam = affectTeam;
    }
    if (animType !== undefined || airAnimType !== undefined || fallAnimType !== undefined) {
      projectile.hitAnimTypes = {
        ...projectile.hitAnimTypes,
        ...(animType === undefined ? {} : { ground: animType }),
        ...(airAnimType === undefined ? {} : { air: airAnimType }),
        ...(fallAnimType === undefined ? {} : { fall: fallAnimType }),
      };
    }
    if (kill !== undefined) {
      projectile.kill = kill;
    }
    if (guardKill !== undefined) {
      projectile.guardKill = guardKill;
    }
    if (fallKill !== undefined) {
      projectile.fall = { ...projectile.fall, kill: fallKill };
    }
    if (forceNoFall !== undefined) {
      projectile.forceNoFall = forceNoFall;
    }
    if (forceStand !== undefined) {
      projectile.forceStand = forceStand;
    }
    if (forceCrouch !== undefined) {
      projectile.forceCrouch = forceCrouch;
    }
    if (
      fallDamage !== undefined ||
      fallXVelocity !== undefined ||
      fallYVelocity !== undefined ||
      fallZVelocity !== undefined ||
      fallRecover !== undefined ||
      fallRecoverTime !== undefined ||
      downRecover !== undefined ||
      downRecoverTime !== undefined ||
      fallEnvShakeTime !== undefined ||
      fallEnvShakeFrequency !== undefined ||
      fallEnvShakeAmplitude !== undefined ||
      fallEnvShakePhase !== undefined ||
      fallEnvShakeMultiplier !== undefined ||
      fallEnvShakeDirection !== undefined
    ) {
      projectile.fall = {
        ...projectile.fall,
        ...(fallDamage === undefined ? {} : { damage: Math.trunc(fallDamage) }),
        ...(fallXVelocity === undefined ? {} : { xVelocity: fallXVelocity }),
        ...(fallYVelocity === undefined ? {} : { yVelocity: fallYVelocity }),
        ...(fallZVelocity === undefined ? {} : { zVelocity: fallZVelocity }),
        ...(fallRecover === undefined ? {} : { recover: fallRecover }),
        ...(fallRecoverTime === undefined ? {} : { recoverTime: Math.trunc(fallRecoverTime) }),
        ...(downRecover === undefined ? {} : { downRecover }),
        ...(downRecoverTime === undefined ? {} : { downRecoverTime: Math.trunc(downRecoverTime) }),
        ...(fallEnvShakeTime === undefined ? {} : { envShakeTime: Math.trunc(fallEnvShakeTime) }),
        ...(fallEnvShakeFrequency === undefined ? {} : { envShakeFrequency: Math.max(0, fallEnvShakeFrequency) }),
        ...(fallEnvShakeAmplitude === undefined ? {} : { envShakeAmplitude: Math.trunc(fallEnvShakeAmplitude) }),
        ...(fallEnvShakePhase === undefined ? {} : { envShakePhase: fallEnvShakePhase }),
        ...(fallEnvShakeMultiplier === undefined ? {} : { envShakeMultiplier: fallEnvShakeMultiplier }),
        ...(fallEnvShakeDirection === undefined ? {} : { envShakeDirection: fallEnvShakeDirection }),
      };
    }
    if (airJuggle !== undefined) {
      projectile.airJuggle = Math.trunc(airJuggle);
    }
    if (damage !== undefined) {
      projectile.damage = Math.max(0, damage);
    }
    if (guardDamage !== undefined) {
      projectile.guardDamage = Math.max(0, guardDamage);
    }
    if (dizzyPoints !== undefined) {
      projectile.dizzyPoints = Math.trunc(dizzyPoints);
    }
    if (guardPoints !== undefined) {
      projectile.guardPoints = Math.trunc(guardPoints);
    }
    if (attackerPower?.hit !== undefined) {
      projectile.attackerHitPower = attackerPower.hit;
    }
    if (attackerPower?.guard !== undefined) {
      projectile.attackerGuardPower = attackerPower.guard;
    }
    if (hitPower !== undefined) {
      projectile.hitPower = Math.trunc(hitPower);
    }
    if (guardPower !== undefined) {
      projectile.guardPower = Math.trunc(guardPower);
    }
    if (redLife !== undefined) {
      projectile.redLife = Math.trunc(redLife);
    }
    if (guardRedLife !== undefined) {
      projectile.guardRedLife = Math.trunc(guardRedLife);
    }
    if (score !== undefined) {
      projectile.score = score;
    }
    if (guardScore !== undefined) {
      projectile.guardScore = guardScore;
    }
    if (hitDefHitCount !== undefined) {
      projectile.hitDefHitCount = Math.max(0, Math.trunc(hitDefHitCount));
    }
    if (hitPriority !== undefined) {
      projectile.hitPriority = Math.trunc(hitPriority);
    }
    if (hitPriorityType !== undefined) {
      projectile.hitPriorityType = hitPriorityType;
    }
    if (p2SpritePriority !== undefined) {
      projectile.p2SpritePriority = Math.trunc(p2SpritePriority);
    }
    if (p1StateNo !== undefined) {
      projectile.p1StateNo = Math.trunc(p1StateNo);
    }
    if (p2StateNo !== undefined) {
      projectile.p2StateNo = Math.trunc(p2StateNo);
    }
    if (p2GetP1State !== undefined) {
      projectile.p2GetP1State = p2GetP1State;
    }
    if (p2Facing !== undefined) {
      projectile.p2Facing = Math.trunc(p2Facing);
    }
    if (minDistance !== undefined) {
      projectile.minDistance = [...minDistance];
    }
    if (maxDistance !== undefined) {
      projectile.maxDistance = [...maxDistance];
    }
    if (airHitTime !== undefined) {
      projectile.airHitTime = Math.max(0, Math.trunc(airHitTime));
    }
    if (groundFall !== undefined || airFall !== undefined) {
      projectile.fall = {
        ...projectile.fall,
        ...(groundFall === undefined ? {} : { enabled: groundFall }),
        ...(airFall === undefined ? {} : { airFall }),
      };
    }
    if (downBounce !== undefined) {
      projectile.downBounce = downBounce;
    }
    if (hitStun !== undefined) {
      projectile.hitStun = Math.max(0, Math.trunc(hitStun));
    }
    if (pauseTime !== undefined) {
      projectile.hitPause = Math.max(0, Math.trunc(pauseTime[0]));
      projectile.hitShakeTime = Math.max(0, Math.trunc(pauseTime[1]));
    }
    if (guardPauseTime !== undefined) {
      projectile.guardPause = Math.max(0, Math.trunc(guardPauseTime[0]));
      projectile.guardShakeTime = Math.max(0, Math.trunc(guardPauseTime[1]));
    }
    if (guardDistanceWidth !== undefined || guardDistanceHeight !== undefined || guardDistanceDepth !== undefined) {
      projectile.guardDistanceBounds = {
        width: applyRuntimeProjectileGuardDistancePair(projectile.guardDistanceBounds.width, guardDistanceWidth),
        height: applyRuntimeProjectileGuardDistancePair(projectile.guardDistanceBounds.height, guardDistanceHeight),
        depth: applyRuntimeProjectileGuardDistancePair(projectile.guardDistanceBounds.depth, guardDistanceDepth),
      };
    }
    if (hitSpark !== undefined) {
      projectile.hitSpark = hitSpark;
    }
    if (hitSparkAngle !== undefined) {
      projectile.hitSparkAngle = hitSparkAngle;
    }
    if (guardSpark !== undefined) {
      projectile.guardSpark = guardSpark;
    }
    if (guardSparkAngle !== undefined) {
      projectile.guardSparkAngle = guardSparkAngle;
    }
    if (sparkXy !== undefined) {
      projectile.sparkXy = [sparkXy[0], sparkXy[1]];
    }
    if (groundSlideTime !== undefined) {
      projectile.groundSlideTime = Math.trunc(groundSlideTime);
    }
    if (guardHitTime !== undefined) {
      projectile.guardStun = Math.max(1, Math.trunc(guardHitTime));
    }
    if (guardSlideTime !== undefined) {
      projectile.guardSlideTime = Math.max(0, Math.trunc(guardSlideTime));
    }
    if (guardControlTime !== undefined) {
      projectile.guardControlTime = Math.max(0, Math.trunc(guardControlTime));
    }
    if (airGuardControlTime !== undefined) {
      projectile.airGuardControlTime = Math.max(0, Math.trunc(airGuardControlTime));
    }
    if (downHitTime !== undefined) {
      projectile.downHitTime = Math.max(0, Math.trunc(downHitTime));
    }
    if (
      groundVelocity?.x !== undefined ||
      groundVelocity?.y !== undefined ||
      groundVelocity?.z !== undefined
    ) {
      const currentGroundVelocity = projectile.hitVelocities?.ground;
      if (groundVelocity.x !== undefined) projectile.push = Math.abs(groundVelocity.x);
      if (groundVelocity.y !== undefined) projectile.hitVelocityY = groundVelocity.y;
      if (groundVelocity.z !== undefined) projectile.hitVelocityZ = groundVelocity.z;
      projectile.hitVelocities = {
        ...projectile.hitVelocities,
        ground: {
          x: groundVelocity.x ?? currentGroundVelocity?.x ?? projectile.push,
          y: groundVelocity.y ?? currentGroundVelocity?.y ?? projectile.hitVelocityY ?? 0,
          z: groundVelocity.z ?? currentGroundVelocity?.z ?? projectile.hitVelocityZ ?? 0,
        },
      };
    }
    if (downVelocity !== undefined) {
      projectile.downVelocityX = downVelocity[0];
      projectile.downVelocityY = downVelocity[1];
      projectile.downVelocityZ = downVelocity[2];
      projectile.hitVelocities = {
        ...projectile.hitVelocities,
        down: { x: downVelocity[0], y: downVelocity[1], z: downVelocity[2] },
      };
    }
    if (airVelocity !== undefined) {
      projectile.airVelocityX = airVelocity[0];
      projectile.airVelocityY = airVelocity[1];
      projectile.airVelocityZ = airVelocity[2];
      projectile.hitVelocities = {
        ...projectile.hitVelocities,
        air: { x: airVelocity[0], y: airVelocity[1], z: airVelocity[2] },
      };
    }
    if (guardVelocity !== undefined) {
      projectile.guardPush = Math.abs(guardVelocity[0]);
      projectile.guardVelocityY = guardVelocity[1];
      projectile.guardVelocityZ = guardVelocity[2];
      projectile.hitVelocities = {
        ...projectile.hitVelocities,
        guard: { x: guardVelocity[0], y: guardVelocity[1], z: guardVelocity[2] },
      };
    }
    if (airGuardVelocity !== undefined) {
      projectile.airGuardPush = Math.abs(airGuardVelocity[0]);
      projectile.airGuardVelocityY = airGuardVelocity[1];
      projectile.airGuardVelocityZ = airGuardVelocity[2];
      projectile.hitVelocities = {
        ...projectile.hitVelocities,
        airGuard: { x: airGuardVelocity[0], y: airGuardVelocity[1], z: airGuardVelocity[2] },
      };
    }
    if (xAccel !== undefined) {
      projectile.hitXAccel = xAccel;
    }
    if (yAccel !== undefined) {
      projectile.hitYAccel = yAccel;
    }
    if (zAccel !== undefined) {
      projectile.hitZAccel = zAccel;
    }
    if (
      envShakeTime !== undefined ||
      envShakeFrequency !== undefined ||
      envShakeAmplitude !== undefined ||
      envShakePhase !== undefined ||
      envShakeMultiplier !== undefined ||
      envShakeDirection !== undefined
    ) {
      projectile.envShake = runtimeProjectileEnvShake({
        time: envShakeTime ?? projectile.envShake?.time ?? 0,
        freq: envShakeFrequency ?? projectile.envShake?.freq ?? 60,
        ampl: envShakeAmplitude ?? projectile.envShake?.ampl ?? -4,
        phase: envShakePhase ?? projectile.envShake?.phase ?? 0,
        mul: envShakeMultiplier ?? projectile.envShake?.mul ?? 1,
        dir: envShakeDirection ?? projectile.envShake?.dir ?? 0,
      });
    }
    if (missOnOverride !== undefined) {
      projectile.missOnOverride = missOnOverride;
    }
    if (p2ClsnCheck !== undefined) {
      projectile.p2ClsnCheck = p2ClsnCheck;
    }
    if (p2ClsnRequire !== undefined) {
      projectile.p2ClsnRequire = p2ClsnRequire;
    }
    if (attackDepth !== undefined) {
      projectile.attackDepth = [attackDepth[0], attackDepth[1]];
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

function runtimeProjectileEnvShake(
  input: Partial<RuntimeProjectileEnvShake>,
): RuntimeProjectileEnvShake | undefined {
  if (Object.values(input).every((value) => value === undefined)) {
    return undefined;
  }
  const finite = (value: number | undefined, fallback: number): number =>
    value !== undefined && Number.isFinite(value) ? value : fallback;
  return {
    time: Math.trunc(finite(input.time, 0)),
    freq: Math.max(0, finite(input.freq, 60)),
    ampl: Math.trunc(finite(input.ampl, -4)),
    phase: finite(input.phase, 0),
    mul: finite(input.mul, 1),
    dir: finite(input.dir, 0),
  };
}

function resolveRuntimeProjectileEnvShake(
  authored: MugenHitDefEnvShakeOp | undefined,
  resolved: Partial<RuntimeProjectileEnvShake> | undefined,
  fallback: Partial<RuntimeProjectileEnvShake>,
): RuntimeProjectileEnvShake | undefined {
  if (authored === undefined) {
    return runtimeProjectileEnvShake(fallback);
  }
  const hasExpression = Object.values(authored).some((value) => typeof value === "string");
  const source = hasExpression ? resolved : authored;
  if (source === undefined) {
    return undefined;
  }
  const sourceNumbers = {
    time: typeof source.time === "number" ? source.time : undefined,
    freq: typeof source.freq === "number" ? source.freq : undefined,
    ampl: typeof source.ampl === "number" ? source.ampl : undefined,
    phase: typeof source.phase === "number" ? source.phase : undefined,
    mul: typeof source.mul === "number" ? source.mul : undefined,
    dir: typeof source.dir === "number" ? source.dir : undefined,
  };
  const hasFiniteResolvedAuthoredComponent = (
    authoredComponent: number | string | undefined,
    resolvedComponent: number | undefined,
  ): boolean => authoredComponent === undefined ||
    (typeof resolvedComponent === "number" && Number.isFinite(resolvedComponent));
  if (
    hasExpression && (
      !hasFiniteResolvedAuthoredComponent(authored.time, sourceNumbers.time) ||
      !hasFiniteResolvedAuthoredComponent(authored.freq, sourceNumbers.freq) ||
      !hasFiniteResolvedAuthoredComponent(authored.ampl, sourceNumbers.ampl) ||
      !hasFiniteResolvedAuthoredComponent(authored.phase, sourceNumbers.phase) ||
      !hasFiniteResolvedAuthoredComponent(authored.mul, sourceNumbers.mul) ||
      !hasFiniteResolvedAuthoredComponent(authored.dir, sourceNumbers.dir)
    )
  ) {
    return undefined;
  }
  return runtimeProjectileEnvShake(sourceNumbers);
}

function resolveRuntimeProjectileFallImpact(
  authored: MugenHitDefFallImpactOp | undefined,
  resolved: Partial<RuntimeProjectileFallImpact> | undefined,
): RuntimeProjectileFallImpact | undefined {
  if (authored === undefined) return undefined;
  const component = (key: keyof RuntimeProjectileFallImpact): number | undefined => {
    const source = authored[key];
    if (typeof source === "number") {
      return Number.isFinite(source) ? source : undefined;
    }
    if (typeof source !== "string") return undefined;
    const value = resolved?.[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  };
  const damage = component("damage");
  const xVelocity = component("xVelocity");
  const yVelocity = component("yVelocity");
  const zVelocity = component("zVelocity");
  if (damage === undefined && xVelocity === undefined && yVelocity === undefined && zVelocity === undefined) {
    return undefined;
  }
  return {
    ...(damage === undefined ? {} : { damage: Math.trunc(damage) }),
    ...(xVelocity === undefined ? {} : { xVelocity }),
    ...(yVelocity === undefined ? {} : { yVelocity }),
    ...(zVelocity === undefined ? {} : { zVelocity }),
  };
}

function resolveRuntimeProjectileFallRecovery(
  authored: MugenHitDefFallRecoveryOp | undefined,
  resolved: Partial<RuntimeProjectileFallRecovery> | undefined,
): RuntimeProjectileFallRecovery | undefined {
  if (authored === undefined) return undefined;
  const component = (key: keyof RuntimeProjectileFallRecovery): number | undefined => {
    const source = authored[key];
    const isBoolean = key === "recover" || key === "downRecover";
    if (typeof source === "number") {
      return Number.isFinite(source) ? (isBoolean ? source : Math.trunc(source)) : undefined;
    }
    if (typeof source !== "string") return undefined;
    const value = resolved?.[key];
    return typeof value === "number" && Number.isFinite(value) ? (isBoolean ? value : Math.trunc(value)) : undefined;
  };
  const recover = component("recover");
  const recoverTime = component("recoverTime");
  const downRecover = component("downRecover");
  const downRecoverTime = component("downRecoverTime");
  if (recover === undefined && recoverTime === undefined && downRecover === undefined && downRecoverTime === undefined) {
    return undefined;
  }
  return {
    ...(recover === undefined ? {} : { recover }),
    ...(recoverTime === undefined ? {} : { recoverTime }),
    ...(downRecover === undefined ? {} : { downRecover }),
    ...(downRecoverTime === undefined ? {} : { downRecoverTime }),
  };
}

function resolveRuntimeProjectileFallFlags(
  authored: MugenHitDefFallFlagsOp | undefined,
  resolved: Partial<RuntimeProjectileFallFlags> | undefined,
): RuntimeProjectileFallFlags | undefined {
  if (authored === undefined) return undefined;
  const component = (key: keyof RuntimeProjectileFallFlags): number | undefined => {
    const source = authored[key];
    if (typeof source === "number") return Number.isFinite(source) ? source : undefined;
    if (typeof source !== "string") return undefined;
    const value = resolved?.[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  };
  const enabled = component("enabled");
  const airFall = component("airFall");
  const kill = component("kill");
  if (enabled === undefined && airFall === undefined && kill === undefined) return undefined;
  return {
    ...(enabled === undefined ? {} : { enabled }),
    ...(airFall === undefined ? {} : { airFall }),
    ...(kill === undefined ? {} : { kill }),
  };
}

function projectileFallEnvShake(fall: HitDefFallOp): Partial<RuntimeProjectileEnvShake> {
  return {
    time: fall.envShakeTime,
    freq: fall.envShakeFrequency,
    ampl: fall.envShakeAmplitude,
    phase: fall.envShakePhase,
    mul: fall.envShakeMultiplier,
    dir: fall.envShakeDirection,
  };
}

function withoutProjectileFallEnvShake(fall: HitDefFallOp): HitDefFallOp {
  const {
    envShakeTime: _time,
    envShakeFrequency: _freq,
    envShakeAmplitude: _ampl,
    envShakePhase: _phase,
    envShakeMultiplier: _mul,
    envShakeDirection: _dir,
    ...rest
  } = fall;
  return rest;
}

function withoutProjectileFallImpact(fall: HitDefFallOp): HitDefFallOp {
  const {
    damage: _damage,
    xVelocity: _xVelocity,
    yVelocity: _yVelocity,
    zVelocity: _zVelocity,
    ...rest
  } = fall;
  return rest;
}

function withoutProjectileFallRecovery(fall: HitDefFallOp): HitDefFallOp {
  const {
    recover: _recover,
    recoverTime: _recoverTime,
    downRecover: _downRecover,
    downRecoverTime: _downRecoverTime,
    ...rest
  } = fall;
  return rest;
}

function projectileFallImpactFields(
  impact: RuntimeProjectileFallImpact | undefined,
): Pick<HitDefFallOp, "damage" | "xVelocity" | "yVelocity" | "zVelocity"> {
  if (impact === undefined) return {};
  return {
    ...(impact.damage === undefined ? {} : { damage: impact.damage }),
    ...(impact.xVelocity === undefined ? {} : { xVelocity: impact.xVelocity }),
    ...(impact.yVelocity === undefined ? {} : { yVelocity: impact.yVelocity }),
    ...(impact.zVelocity === undefined ? {} : { zVelocity: impact.zVelocity }),
  };
}

function projectileFallRecoveryFields(
  recovery: RuntimeProjectileFallRecovery | undefined,
): Pick<HitDefFallOp, "recover" | "recoverTime" | "downRecover" | "downRecoverTime"> {
  if (recovery === undefined) return {};
  return {
    ...(recovery.recover === undefined ? {} : { recover: recovery.recover !== 0 }),
    ...(recovery.recoverTime === undefined ? {} : { recoverTime: recovery.recoverTime }),
    ...(recovery.downRecover === undefined ? {} : { downRecover: recovery.downRecover !== 0 }),
    ...(recovery.downRecoverTime === undefined ? {} : { downRecoverTime: recovery.downRecoverTime }),
  };
}

function projectileFallFlagsFields(
  flags: RuntimeProjectileFallFlags | undefined,
): Pick<HitDefFallOp, "enabled" | "airFall" | "kill"> {
  if (flags === undefined) return {};
  return {
    ...(flags.enabled === undefined ? {} : { enabled: flags.enabled !== 0 }),
    ...(flags.airFall === undefined ? {} : { airFall: flags.airFall !== 0 }),
    ...(flags.kill === undefined ? {} : { kill: flags.kill !== 0 }),
  };
}

function projectileFallEnvShakeFields(
  envShake: RuntimeProjectileEnvShake | undefined,
): Pick<
  HitDefFallOp,
  "envShakeTime" | "envShakeFrequency" | "envShakeAmplitude" | "envShakePhase" | "envShakeMultiplier" | "envShakeDirection"
> {
  if (envShake === undefined) return {};
  return {
    envShakeTime: envShake.time,
    envShakeFrequency: envShake.freq,
    envShakeAmplitude: envShake.ampl,
    envShakePhase: envShake.phase,
    envShakeMultiplier: envShake.mul,
    envShakeDirection: envShake.dir,
  };
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

function resolveModifyProjectileIntegerExpressionParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectileNumberParam,
  expression: number | string | undefined,
): number | undefined {
  if (expression === undefined) return resolveModifyProjectileNumberParam(input, key);
  if (typeof expression === "number") {
    return Number.isFinite(expression) ? Math.trunc(expression) : undefined;
  }
  const resolved = input.resolveModifyProjectile?.resolveNumber?.(key);
  return resolved === undefined || !Number.isFinite(resolved) ? undefined : Math.trunc(resolved);
}

function resolveModifyProjectileTerminalAnimationParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectileTerminalAnimationParam,
  expression: number | string | undefined,
): number | undefined {
  if (expression !== undefined) {
    if (typeof expression === "number") {
      return Number.isFinite(expression) ? Math.trunc(expression) : undefined;
    }
    return input.resolveModifyProjectile?.resolveTerminalAnimation?.(key)
      ?? input.resolveModifyProjectile?.resolveNumber?.(key)
      ?? resolveModifyProjectileNumberParam(input, key);
  }
  return resolveModifyProjectileNumberParam(input, key);
}

function resolveModifyProjectileMoveTimeParam(
  input: RuntimeProjectileModifyInput,
  key: "pausemovetime" | "supermovetime",
  expression: number | string | undefined,
): number | undefined {
  if (expression !== undefined) {
    if (typeof expression === "number") {
      return Number.isFinite(expression) ? Math.trunc(expression) : undefined;
    }
    return input.resolveModifyProjectile?.resolveMoveTime?.(key)
      ?? input.resolveModifyProjectile?.resolveNumber?.(key)
      ?? resolveModifyProjectileNumberParam(input, key);
  }
  return resolveModifyProjectileNumberParam(input, key);
}

function resolveModifyProjectileFloatParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectileNumberParam,
): number | undefined {
  const raw = findModifyProjectileNumberParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  const staticValue = firstNumber(raw);
  return staticValue ?? input.resolveModifyProjectile?.resolveFloat?.(key) ?? input.resolveModifyProjectile?.resolveNumber?.(key);
}

function resolveModifyProjectilePairParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectilePairParam,
  parseStatic: (raw: string | undefined) => [number, number, number?] | undefined,
): [number, number, number?] | undefined {
  const raw = findModifyProjectilePairParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return isStaticNumericList(raw) ? parseStatic(raw) : input.resolveModifyProjectile?.resolvePair?.(key);
}

function resolveModifyProjectileFloatPairParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectilePairParam,
  parseStatic: (raw: string | undefined) => [number, number, number?] | undefined,
): [number, number, number?] | undefined {
  const raw = findModifyProjectilePairParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return isStaticNumericList(raw)
    ? parseStatic(raw)
    : input.resolveModifyProjectile?.resolveFloatPair?.(key) ?? input.resolveModifyProjectile?.resolvePair?.(key);
}

function resolveModifyProjectileFloatTripleParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectileTripleParam,
  parseStatic: (raw: string | undefined) => [number, number, number] | undefined,
): [number, number, number] | undefined {
  const raw = findControllerParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return isStaticNumericList(raw)
    ? parseStatic(raw)
    : input.resolveModifyProjectile?.resolveFloatTriple?.(key);
}

function resolveModifyProjectileFloatPartialTripleParam(
  input: RuntimeProjectileModifyInput,
  key: RuntimeModifyProjectilePartialTripleParam,
): RuntimeModifyProjectileGroundVelocity | undefined {
  const raw = findControllerParam(input.controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return staticModifyProjectileGroundVelocity(raw)
    ?? input.resolveModifyProjectile?.resolveFloatPartialTriple?.(key);
}

function resolveModifyProjectileHeightBoundParam(input: RuntimeProjectileModifyInput): { low: number; high: number } | undefined {
  const value = resolveModifyProjectilePairParam(input, "projheightbound", numberPair);
  return value ? projectileHeightBound([value[0], value[1]]) : undefined;
}

function findModifyProjectileNumberParam(
  controller: MugenStateController,
  key: RuntimeModifyProjectileNumberParam,
): string | undefined {
  switch (key) {
    case "id":
      return findControllerParam(controller, "id");
    case "index":
      return findControllerParam(controller, "index");
    case "projid":
      return findControllerParam(controller, "projid");
    case "projremovetime":
      return findControllerParam(controller, "projremovetime") ?? findControllerParam(controller, "removetime");
    case "projsprpriority":
      return findControllerParam(controller, "projsprpriority");
    case "projpriority":
      return findControllerParam(controller, "projpriority");
    default:
      return findControllerParam(controller, key);
  }
}

function projectileHitDefPriorityType(value: string | undefined): "hit" | "miss" | "dodge" | undefined {
  const normalized = /,\s*"?(hit|miss|dodge)"?\s*$/i.exec(value ?? "")?.[1]?.toLowerCase();
  return normalized === "hit" || normalized === "miss" || normalized === "dodge" ? normalized : undefined;
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

export type RuntimeProjectilePauseKind = "Pause" | "SuperPause" | "hitpause";

export type RuntimeProjectileAdvanceOptions = {
  pauseKind?: RuntimeProjectilePauseKind;
};

export function runtimeProjectileCanAdvance(
  projectile: Pick<RuntimeProjectile, "pauseMoveTime" | "superMoveTime" | "hitPauseRemaining">,
  pauseKind: RuntimeProjectilePauseKind | undefined,
): boolean {
  if (projectile.hitPauseRemaining > 0) return false;
  if (!pauseKind || pauseKind === "hitpause") return true;
  const moveTime = pauseKind === "SuperPause" ? projectile.superMoveTime : projectile.pauseMoveTime;
  return moveTime === -1 || moveTime > 0;
}

export function advanceRuntimeProjectiles(
  projectiles: RuntimeProjectile[],
  stage: RuntimeProjectileStage,
  options: RuntimeProjectileAdvanceOptions = {},
): RuntimeProjectile[] {
  const advanced = new Set<RuntimeProjectile>();
  for (const projectile of projectiles) {
    if (!runtimeProjectileCanAdvance(projectile, options.pauseKind)) {
      if (
        projectile.hitPauseRemaining > 0 &&
        options.pauseKind !== "Pause" &&
        options.pauseKind !== "SuperPause"
      ) {
        projectile.hitPauseRemaining = Math.max(0, projectile.hitPauseRemaining - 1);
      }
      continue;
    }
    advanced.add(projectile);
    advanceRuntimeProjectileContactTimer(projectile);
    if (projectile.terminalPlayback) {
      advanceRuntimeProjectileTerminalPlayback(projectile);
      consumeRuntimeProjectileMoveTime(projectile);
      continue;
    }
    if (projectile.removalReason) {
      consumeRuntimeProjectileMoveTime(projectile);
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
    if (projectile.pos.z !== undefined || projectile.vel.z !== undefined || projectile.accel.z !== undefined) {
      projectile.pos.z = (projectile.pos.z ?? 0) + (projectile.vel.z ?? 0);
      projectile.vel.z = (projectile.vel.z ?? 0) + (projectile.accel.z ?? 0);
      projectile.vel.z *= projectile.velMul.z ?? 1;
    }
    projectile.frameElapsed += 1;
    const frame = projectile.action.frames[projectile.frameIndex];
    if (frame && projectile.frameElapsed >= Math.max(1, frame.duration)) {
      projectile.frameElapsed = 0;
      const next = projectile.frameIndex + 1;
      projectile.frameIndex =
        next < projectile.action.frames.length ? next : projectile.action.loopStart ?? projectile.action.frames.length - 1;
    }
    consumeRuntimeProjectileMoveTime(projectile);
  }
  return projectiles.filter((projectile) => {
    if (!advanced.has(projectile)) {
      return true;
    }
    if (projectile.hasHit && projectile.removeOnHit) {
      markRuntimeProjectileForRemoval(projectile, "hit");
    } else if (projectile.removeTime >= 0 && projectile.age >= projectile.removeTime) {
      markRuntimeProjectileForRemoval(projectile, "timeout");
    } else if (
      projectile.pos.x < stage.bounds.left - runtimeProjectileHorizontalRemovalBound(projectile) ||
      projectile.pos.x > stage.bounds.right + runtimeProjectileHorizontalRemovalBound(projectile) ||
      projectile.pos.y < runtimeProjectileVerticalRemovalBound(projectile).low ||
      projectile.pos.y > runtimeProjectileVerticalRemovalBound(projectile).high ||
      runtimeProjectileOutsideDepthBounds(projectile, stage)
    ) {
      markRuntimeProjectileForRemoval(projectile, "bounds");
    }
    return shouldKeepRuntimeProjectileAfterRemoval(projectile);
  });
}

export function runtimeProjectilesToSnapshots(projectiles: RuntimeProjectile[], sourceStateNo: number): ActorSnapshot[] {
  return projectiles
    .map((projectile, index): ActorSnapshot | undefined => {
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
        presentationOrder: createActorPresentationOrder(
          "projectile",
          projectile.spritePriority,
          index,
          { layerNo: projectile.layerNo },
        ),
        effect: {
          kind: "projectile",
          id: projectile.projectileId,
          age: projectile.age,
          removeTime: projectile.removeTime,
          ...(projectile.edgeBound === undefined || projectile.edgeBound === DEFAULT_PROJECTILE_EDGE_BOUND ? {} : { edgeBound: projectile.edgeBound }),
          ...(projectile.stageBound === DEFAULT_PROJECTILE_STAGE_BOUND ? {} : { stageBound: projectile.stageBound }),
          ...(projectile.depthBound === undefined ? {} : { depthBound: projectile.depthBound }),
          ...(projectile.heightBound === undefined || isDefaultProjectileHeightBound(projectile.heightBound) ? {} : { heightBound: projectile.heightBound }),
          layerNo: projectile.layerNo,
          ...(projectile.angle === 0 ? {} : { angle: projectile.angle }),
          ...(projectile.xAngle === 0 ? {} : { xAngle: projectile.xAngle }),
          ...(projectile.yAngle === 0 ? {} : { yAngle: projectile.yAngle }),
          ...(projectile.xShear === 0 ? {} : { xShear: projectile.xShear }),
          ...(isZeroProjectileShadow(projectile.shadow) ? {} : { shadow: [...projectile.shadow] }),
          ...(projectile.reflection === -1 ? {} : { reflection: projectile.reflection }),
          ...(projectile.projection === "orthographic" ? {} : { projection: projectile.projection }),
          ...(projectile.focalLength === 0 ? {} : { focalLength: projectile.focalLength }),
          ...(isZeroProjectileWindow(projectile.window) ? {} : { window: [...projectile.window] as MugenProjectileWindow }),
          ...(projectile.ownPalette ? { ownPalette: true as const, drawPalette: [...projectile.drawPalette] as [number, number] } : {}),
          ...(projectile.paletteRemap === undefined
            ? {}
            : { paletteRemap: cloneRuntimePaletteRemap(projectile.paletteRemap) }),
          spritePriority: projectile.spritePriority,
          priority: projectile.priority,
          hitsRemaining: projectile.hitsRemaining,
          missTime: projectile.missTime,
          missTimeRemaining: projectile.missTimeRemaining,
          ...(projectile.pauseMoveTime === 0 ? {} : { pauseMoveTime: projectile.pauseMoveTime }),
          ...(projectile.superMoveTime === 0 ? {} : { superMoveTime: projectile.superMoveTime }),
          damage: projectile.damage,
          ...(projectile.airJuggle === undefined ? {} : { airJuggle: projectile.airJuggle }),
          hitPause: projectile.hitPause,
          hitStun: projectile.hitStun,
          guardDamage: projectile.guardDamage,
          guardPause: projectile.guardPause,
          guardStun: projectile.guardStun,
          guardDistance: projectile.guardDistanceBounds.width[0],
          guardFlag: projectile.guardFlag,
          ...(projectile.hitFlag === undefined ? {} : { hitFlag: projectile.hitFlag }),
          ...(projectile.affectTeam === undefined ? {} : { affectTeam: projectile.affectTeam }),
          ...(projectile.teamSide === undefined ? {} : { teamSide: projectile.teamSide }),
          ...(runtimeProjectileHasExplicitDepth(projectile)
            ? {
                depth: {
                  position: projectile.pos.z ?? 0,
                  velocity: projectile.vel.z ?? 0,
                  attack: [...(projectile.attackDepth ?? DEFAULT_RUNTIME_ATTACK_DEPTH)] as [number, number],
                },
              }
            : {}),
          p2StateNo: projectile.p2StateNo,
          p2GetP1State: projectile.p2GetP1State,
          ...(projectile.p2ClsnCheck === undefined ? {} : { p2ClsnCheck: projectile.p2ClsnCheck }),
          ...(projectile.p2ClsnRequire === undefined ? {} : { p2ClsnRequire: projectile.p2ClsnRequire }),
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
          ...(isDefaultVector(projectile.remVelocity) ? {} : { remVelocity: { ...projectile.remVelocity } }),
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
          ...(projectile.angle === 0 ? {} : { renderAngle: projectile.angle }),
          ...(projectile.xAngle === 0 ? {} : { renderAngleX: projectile.xAngle }),
          ...(projectile.yAngle === 0 ? {} : { renderAngleY: projectile.yAngle }),
          ...(projectile.xShear === 0 ? {} : { renderShearX: projectile.xShear }),
          ...(isZeroProjectileShadow(projectile.shadow) ? {} : { shadowColor: [...projectile.shadow] }),
          ...(projectile.reflection === -1 ? {} : { reflectionMode: projectile.reflection }),
          ...(projectile.projection === "orthographic" ? {} : { renderProjection: projectile.projection }),
          ...(projectile.focalLength === 0 ? {} : { renderFocalLength: projectile.focalLength }),
          ...(isZeroProjectileWindow(projectile.window) ? {} : { renderWindow: renderProjectileWindow(projectile) }),
          ...(projectile.paletteRemap === undefined
            ? {}
            : { paletteRemap: cloneRuntimePaletteRemap(projectile.paletteRemap) }),
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

export function getRuntimeProjectileCollisionBoxes(projectile: RuntimeProjectile, boxType: 1 | 2): CollisionBox[] {
  if (boxType === 1) {
    return getRuntimeProjectileHitboxes(projectile);
  }
  const frame = projectile.action.frames[projectile.frameIndex];
  return frame?.clsn2 ?? [];
}

/** Raw AIR boxes used by ProjClsnOverlap. Unlike combat, this never fabricates a fallback Clsn1. */
export function getRuntimeProjectileTriggerCollisionBoxes(projectile: RuntimeProjectile, boxType: 1 | 2): CollisionBox[] {
  const frame = projectile.action.frames[projectile.frameIndex];
  return boxType === 1 ? frame?.clsn1 ?? [] : frame?.clsn2 ?? [];
}

/** Ikemen ProjClsnOverlap over both projectile collision groups and one character group. */
export function runtimeProjectileClsnOverlap(
  projectile: RuntimeProjectile,
  target: RuntimeClsnOverlapActor,
  targetGroup: RuntimeClsnVarGroup,
): boolean {
  const projectileBoxes = [
    ...getRuntimeProjectileTriggerCollisionBoxes(projectile, 1),
    ...getRuntimeProjectileTriggerCollisionBoxes(projectile, 2),
  ];
  if (projectileBoxes.length === 0) return false;
  const localScale = DEFAULT_PROJECTILE_LOCAL_COORD_WIDTH / (projectile.localCoord?.[0] ?? DEFAULT_PROJECTILE_LOCAL_COORD_WIDTH);
  const clsnScale = projectile.clsnScale ?? { x: 1, y: 1 };
  const normalized = scaleRuntimeCollisionBoxes(projectileBoxes, {
    x: clsnScale.x * localScale,
    y: clsnScale.y * localScale,
  });
  const state = {
    pos: { x: projectile.pos.x * localScale, y: projectile.pos.y * localScale },
    facing: projectile.facing,
    clsnAngle: projectile.clsnAngle,
  };
  const projectileWorldBoxes = normalized.map((box): RuntimeCollisionBox => runtimeWorldBox(state, box));
  const targetWorldBoxes = runtimeClsnOverlapWorldBoxes(target, targetGroup);
  return projectileWorldBoxes.some((projectileBox) =>
    targetWorldBoxes.some((targetBox) => collisionBoxesIntersect(projectileBox, targetBox))
  );
}

export function canRuntimeProjectileContact(projectile: RuntimeProjectile): boolean {
  return !projectile.removalReason && !projectile.terminalPlayback && !projectile.hasHit && projectile.hitsRemaining > 0 && projectile.missTimeRemaining <= 0;
}

export function runtimeProjectileCombatDepth(projectile: RuntimeProjectile): RuntimeCombatDepth {
  const attack = projectile.attackDepth ?? DEFAULT_RUNTIME_ATTACK_DEPTH;
  return {
    position: projectile.pos.z ?? 0,
    velocity: projectile.vel.z ?? 0,
    size: [...DEFAULT_RUNTIME_SIZE_DEPTH] as [number, number],
    attack: [...attack] as [number, number],
  };
}

export function runtimeProjectileHasOppositeTeamSide(
  projectile: RuntimeProjectile,
  ownerId = projectile.ownerId,
): boolean {
  const ownerTeamSide = runtimeTeamSideFromId(ownerId);
  return ownerTeamSide !== undefined && runtimeProjectileTeamSide(projectile) !== undefined && runtimeProjectileTeamSide(projectile) !== ownerTeamSide;
}

export function runtimeProjectileTeamSide(projectile: RuntimeProjectile): RuntimeTeamSide | undefined {
  return projectile.teamSide ??
    runtimeTeamSideFromId(projectile.ownerId) ??
    runtimeTeamSideFromId(projectile.rootId);
}

export function runtimeProjectileAffectTeamAllows(projectile: RuntimeProjectile, targetId: string): boolean {
  return runtimeAffectTeamAllows(
    runtimeProjectileTeamSide(projectile),
    runtimeTeamSideFromId(targetId),
    projectile.affectTeam,
  );
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

export function beginRuntimeProjectileHitPause(
  projectile: RuntimeProjectile,
  kind: Exclude<RuntimeProjectileContactKind, "contact">,
): void {
  const value = kind === "guard" ? projectile.guardPause : projectile.hitPause;
  projectile.hitPauseRemaining = Math.max(0, Math.trunc(value));
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
  projectile.vel = {
    x: projectile.remVelocity.x * projectile.facing,
    y: projectile.remVelocity.y,
    ...(projectile.remVelocity.z === undefined ? {} : { z: projectile.remVelocity.z }),
  };
  projectile.accel = {
    x: 0,
    y: 0,
    ...(projectile.vel.z === undefined ? {} : { z: 0 }),
  };
  projectile.velMul = { x: 1, y: 1, z: 1 };
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
  projectile.pos.x += projectile.vel.x;
  projectile.pos.y += projectile.vel.y;
  if (projectile.pos.z !== undefined || projectile.vel.z !== undefined) {
    projectile.pos.z = (projectile.pos.z ?? 0) + (projectile.vel.z ?? 0);
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

function initialRuntimeProjectileMoveTime(value: number): number {
  const normalized = Number.isFinite(value) ? Math.trunc(value) : 0;
  return normalized >= 0 ? normalized + 1 : normalized;
}

function consumeRuntimeProjectileMoveTime(
  projectile: Pick<RuntimeProjectile, "pauseMoveTime" | "superMoveTime">,
): void {
  if (projectile.pauseMoveTime > 0) projectile.pauseMoveTime -= 1;
  if (projectile.superMoveTime > 0) projectile.superMoveTime -= 1;
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function staticRuntimeIntegerList(value: string | undefined, maxLength: number): number[] | undefined {
  if (value === undefined) return undefined;
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.some((part) => part.length === 0)) return undefined;
  const values = parts.slice(0, maxLength).map(Number);
  return values.every(Number.isFinite) ? normalizeRuntimeIntegerList(values, maxLength) : undefined;
}

function normalizeRuntimeIntegerList(values: readonly number[], maxLength: number): number[] {
  return values.slice(0, maxLength).filter(Number.isFinite).map(Math.trunc);
}

function partialNumberTriple(value: string | undefined): [number, number?, number?] | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length > 3) return undefined;
  if (!Number.isFinite(values[0])) return undefined;
  if (values.length > 1 && !Number.isFinite(values[1])) return undefined;
  if (values.length > 2 && !Number.isFinite(values[2])) return undefined;
  if (values.length > 2) return [values[0]!, values[1]!, values[2]!];
  if (values.length > 1) return [values[0]!, values[1]!];
  return [values[0]!];
}

function numberQuad(value: string | undefined): MugenProjectileWindow | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  return values.length === 4 && values.every(Number.isFinite)
    ? [values[0]!, values[1]!, values[2]!, values[3]!]
    : undefined;
}

function runtimeProjectileShadow(value: [number, number?, number?] | undefined): [number, number, number] {
  return [
    finiteProjectileShadowChannel(value?.[0]),
    finiteProjectileShadowChannel(value?.[1]),
    finiteProjectileShadowChannel(value?.[2]),
  ];
}

function modifyRuntimeProjectileShadow(
  current: [number, number, number],
  value: [number, number?, number?],
): [number, number, number] {
  return [
    finiteProjectileShadowChannel(value[0]),
    value[1] === undefined ? current[1] : finiteProjectileShadowChannel(value[1]),
    value[2] === undefined ? current[2] : finiteProjectileShadowChannel(value[2]),
  ];
}

function finiteProjectileShadowChannel(value: number | undefined): number {
  return value === undefined || !Number.isFinite(value) ? 0 : Math.trunc(value);
}

function finiteProjectileInteger(value: number | undefined, fallback: number): number {
  return value === undefined || !Number.isFinite(value) ? fallback : Math.trunc(value);
}

function projectileProjection(value: string | undefined): MugenProjectileProjection | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized === "orthographic" || normalized === "perspective" || normalized === "perspective2"
    ? normalized
    : undefined;
}

function runtimeProjectileProjection(value: MugenProjectileProjection | undefined): MugenProjectileProjection {
  return value ?? "orthographic";
}

function runtimeProjectileWindow(value: MugenProjectileWindow | undefined): MugenProjectileWindow {
  if (!value) return [0, 0, 0, 0];
  return value.map((item) => Number.isFinite(item) ? item : 0) as MugenProjectileWindow;
}

function isZeroProjectileWindow(value: MugenProjectileWindow): boolean {
  return value.every((item) => item === 0);
}

function renderProjectileWindow(projectile: Pick<RuntimeProjectile, "window" | "localCoord">): MugenProjectileWindow {
  const scale = runtimeCombatLocalScale(projectile.localCoord);
  return projectile.window.map((item) => item * scale) as MugenProjectileWindow;
}

function isZeroProjectileShadow(value: [number, number, number]): boolean {
  return value[0] === 0 && value[1] === 0 && value[2] === 0;
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

function projectileFallData(controller: MugenStateController): HitDefFallOp {
  const enabled = booleanNumber(findControllerParam(controller, "fall"));
  const airFall = booleanNumber(findControllerParam(controller, "air.fall"));
  return {
    ...(enabled === undefined ? {} : { enabled }),
    ...(airFall === undefined ? {} : { airFall }),
    ...(firstNumber(findControllerParam(controller, "fall.xvelocity")) === undefined
      ? {}
      : { xVelocity: firstNumber(findControllerParam(controller, "fall.xvelocity")) }),
    ...(firstNumber(findControllerParam(controller, "fall.yvelocity")) === undefined
      ? {}
      : { yVelocity: firstNumber(findControllerParam(controller, "fall.yvelocity")) }),
    ...(firstNumber(findControllerParam(controller, "fall.zvelocity")) === undefined
      ? {}
      : { zVelocity: firstNumber(findControllerParam(controller, "fall.zvelocity")) }),
    ...(firstNumber(findControllerParam(controller, "fall.damage")) === undefined
      ? {}
      : { damage: firstNumber(findControllerParam(controller, "fall.damage")) }),
    ...(firstNumber(findControllerParam(controller, "fall.defence_up")) === undefined
      ? {}
      : { defenceUp: firstNumber(findControllerParam(controller, "fall.defence_up")) }),
    ...(booleanNumber(findControllerParam(controller, "fall.kill")) === undefined
      ? {}
      : { kill: booleanNumber(findControllerParam(controller, "fall.kill")) }),
    ...(booleanNumber(findControllerParam(controller, "fall.recover")) === undefined
      ? {}
      : { recover: booleanNumber(findControllerParam(controller, "fall.recover")) }),
    ...(firstNumber(findControllerParam(controller, "fall.recovertime")) === undefined
      ? {}
      : { recoverTime: firstNumber(findControllerParam(controller, "fall.recovertime")) }),
    ...(booleanNumber(findControllerParam(controller, "down.recover")) === undefined
      ? {}
      : { downRecover: booleanNumber(findControllerParam(controller, "down.recover")) }),
    ...(firstNumber(findControllerParam(controller, "down.recovertime")) === undefined
      ? {}
      : { downRecoverTime: firstNumber(findControllerParam(controller, "down.recovertime")) }),
    ...(firstNumber(findControllerParam(controller, "fall.envshake.time")) === undefined
      ? {}
      : { envShakeTime: firstNumber(findControllerParam(controller, "fall.envshake.time")) }),
    ...(firstNumber(findControllerParam(controller, "fall.envshake.freq")) === undefined
      ? {}
      : { envShakeFrequency: firstNumber(findControllerParam(controller, "fall.envshake.freq")) }),
    ...(firstNumber(findControllerParam(controller, "fall.envshake.ampl")) === undefined
      ? {}
      : { envShakeAmplitude: firstNumber(findControllerParam(controller, "fall.envshake.ampl")) }),
    ...(firstNumber(findControllerParam(controller, "fall.envshake.phase")) === undefined
      ? {}
      : { envShakePhase: firstNumber(findControllerParam(controller, "fall.envshake.phase")) }),
    ...(firstNumber(findControllerParam(controller, "fall.envshake.mul")) === undefined
      ? {}
      : { envShakeMultiplier: firstNumber(findControllerParam(controller, "fall.envshake.mul")) }),
    ...(firstNumber(findControllerParam(controller, "fall.envshake.dir")) === undefined
      ? {}
      : { envShakeDirection: firstNumber(findControllerParam(controller, "fall.envshake.dir")) }),
  };
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

function resolveRuntimeProjectileUnhittableTime(
  operationValue: ProjectileControllerOp["unhittableTime"],
  rawValue: string | undefined,
  resolvedValue: [number, number?] | undefined,
): [number, number] | undefined {
  const source = resolvedValue ?? operationValue ?? runtimeProjectileStaticUnhittableTime(rawValue);
  if (!source || typeof source[0] !== "number" || (source[1] !== undefined && typeof source[1] !== "number")) {
    return undefined;
  }
  if (!Number.isFinite(source[0]) || (source[1] !== undefined && !Number.isFinite(source[1]))) {
    return undefined;
  }
  return [Math.trunc(source[0]), Math.trunc(source[1] ?? -1)];
}

function resolveRuntimeProjectileScalar(
  operationValue: number | string | undefined,
  rawValue: string | undefined,
  resolvedValue: number | undefined,
): number | undefined {
  const source = resolvedValue ?? (typeof operationValue === "number" ? operationValue : undefined);
  if (source !== undefined) return Number.isFinite(source) ? source : undefined;
  if (typeof operationValue === "string") return undefined;
  if (rawValue === undefined || rawValue.includes(",")) return undefined;
  const parsed = Number(rawValue.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveRuntimeProjectileFreshPowerPair(
  operationValue: ProjectileControllerOp["getPower"],
  rawValue: string | undefined,
  resolvedValue: { hit?: number; guard?: number } | undefined,
): { hit?: number; guard?: number } | undefined {
  const staticRaw = operationValue === undefined ? runtimeProjectileStaticIntegerPair(rawValue) : undefined;
  const authored = operationValue ?? staticRaw;
  if (!authored && !resolvedValue) return undefined;
  const component = (value: number | string | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : undefined;
  const hit = component(resolvedValue?.hit) ?? component(authored?.[0]);
  const explicitGuard = component(resolvedValue?.guard) ?? component(authored?.[1]);
  if (hit === undefined && explicitGuard === undefined) return undefined;
  return {
    ...(hit === undefined ? {} : { hit }),
    ...(explicitGuard !== undefined
      ? { guard: explicitGuard }
      : hit === undefined || authored?.[1] !== undefined || authored === undefined
        ? {}
        : { guard: Math.trunc(hit * 0.5) }),
  };
}

function resolveRuntimeProjectileFreshDamagePair(
  operationValue: ProjectileControllerOp["damageExpressions"],
  rawValue: string | undefined,
  resolvedValue: { hit?: number; guard?: number } | undefined,
): { hit?: number; guard?: number } | undefined {
  const staticRaw = operationValue === undefined ? runtimeProjectileStaticIntegerPair(rawValue) : undefined;
  const authored = operationValue ?? staticRaw;
  if (authored === undefined && resolvedValue === undefined) return undefined;
  const component = (value: number | string | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : undefined;
  const hit = component(resolvedValue?.hit) ?? component(authored?.[0]);
  const guard = component(resolvedValue?.guard) ?? component(authored?.[1]);
  return {
    ...(hit === undefined ? {} : { hit }),
    ...(guard === undefined ? {} : { guard }),
  };
}

function resolveRuntimeProjectileModifyPowerPair(
  operationValue: ModifyProjectileControllerOp["getPower"],
  rawValue: string | undefined,
  resolvedValue: [number, number, number?] | undefined,
): { hit?: number; guard?: number } | undefined {
  const staticRaw = operationValue === undefined ? runtimeProjectileStaticIntegerPair(rawValue) : undefined;
  const authored = operationValue ?? staticRaw;
  if (!authored) return undefined;
  const component = (value: number | string | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : undefined;
  const hit = component(resolvedValue?.[0]) ?? component(authored[0]);
  if (hit === undefined) return undefined;
  if (authored[1] === undefined) return { hit, guard: 0 };
  const guard = component(resolvedValue?.[1]) ?? component(authored[1]);
  return { hit, ...(guard === undefined ? {} : { guard }) };
}

function resolveRuntimeProjectileModifyDamagePair(
  operationValue: ModifyProjectileControllerOp["damageExpressions"],
  resolvedValue: [number, number, number?] | undefined,
): [number, number] | undefined {
  if (operationValue === undefined) return undefined;
  const component = (value: number | string | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : undefined;
  const hit = component(resolvedValue?.[0]) ?? component(operationValue[0]);
  if (hit === undefined) return undefined;
  const guard = operationValue[1] === undefined
    ? 0
    : component(resolvedValue?.[1]) ?? component(operationValue[1]) ?? 0;
  return [hit, guard];
}

function runtimeProjectileStaticIntegerPair(value: string | undefined): [number, number?] | undefined {
  if (value === undefined) return undefined;
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.length > 2 || parts.some((part) => part.length === 0)) return undefined;
  const numbers = parts.map(Number);
  if (!numbers.every(Number.isFinite) || numbers[0] === undefined) return undefined;
  return numbers.length === 2 ? [Math.trunc(numbers[0]), Math.trunc(numbers[1]!)] : [Math.trunc(numbers[0])];
}

function resolveRuntimeProjectileFreshPausePair(
  expressionValue: ProjectileControllerOp["pauseTimeExpressions"] | ProjectileControllerOp["guardPauseTimeExpressions"] | undefined,
  rawValue: string | undefined,
  resolvedValue: [number?, number?] | undefined,
  operationValue: [number?, number?] | undefined,
  fallback: [number, number],
  staticRawValue?: [number, number?],
): [number, number] {
  const rawPair = staticRawValue ?? runtimeProjectileStaticIntegerPair(rawValue);
  const component = (value: number | string | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : undefined;
  const resolveComponent = (index: 0 | 1): number =>
    component(resolvedValue?.[index]) ??
    component(expressionValue?.[index]) ??
    component(operationValue?.[index]) ??
    component(rawPair?.[index]) ??
    fallback[index];
  return [resolveComponent(0), resolveComponent(1)];
}

function resolveRuntimeProjectileSparkScale(
  operationValue: ProjectileControllerOp["hitSparkScale"],
  rawValue: string | undefined,
  resolvedValue: [number?, number?] | undefined,
): [number, number] {
  const staticRaw = rawValue === undefined
    ? undefined
    : rawValue.split(",").map((part) => Number(part.trim()));
  const source = resolvedValue
    ?? operationValue
    ?? (staticRaw?.length === 1 || staticRaw?.length === 2 ? staticRaw : undefined);
  const component = (value: number | string | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;
  return [component(source?.[0]) ?? 1, component(source?.[1]) ?? 1];
}

function runtimeProjectileStaticUnhittableTime(value: string | undefined): [number, number?] | undefined {
  if (value === undefined) return undefined;
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.length > 2 || parts.some((part) => part.length === 0)) return undefined;
  const numbers = parts.map(Number);
  if (!numbers.every(Number.isFinite) || numbers[0] === undefined) return undefined;
  return numbers.length === 2 ? [numbers[0], numbers[1]!] : [numbers[0]];
}

function projectileZeroDefaultPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.length > 2 || parts.some((part) => part.length === 0)) {
    return undefined;
  }
  const values = parts.map(Number);
  if (values.some((item) => !Number.isFinite(item)) || values[0] === undefined) {
    return undefined;
  }
  return [values[0], values[1] ?? 0];
}

function staticRuntimeProjectileSparkRef(value: string | undefined): string | undefined {
  const normalized = stripMugenString(value);
  return normalized && /^[fs]?-?\d+$/i.test(normalized) ? normalized : undefined;
}

function runtimeProjectileGuardDistanceBounds(
  controller: MugenStateController,
  operationBounds: ProjectileControllerOp["guardDistanceBounds"],
): RuntimeProjectileGuardDistanceBounds {
  const widthRaw = findControllerParam(controller, "guard.dist.width") ?? findControllerParam(controller, "guard.dist");
  const heightRaw = findControllerParam(controller, "guard.dist.height");
  const depthRaw = findControllerParam(controller, "guard.dist.depth");
  return {
    width: applyRuntimeProjectileGuardDistancePair(
      DEFAULT_RUNTIME_PROJECTILE_GUARD_DISTANCE_BOUNDS.width,
      operationBounds?.width ?? projectileZeroDefaultPair(widthRaw),
    ),
    height: applyRuntimeProjectileGuardDistancePair(
      DEFAULT_RUNTIME_PROJECTILE_GUARD_DISTANCE_BOUNDS.height,
      operationBounds?.height ?? projectileZeroDefaultPair(heightRaw),
    ),
    depth: applyRuntimeProjectileGuardDistancePair(
      DEFAULT_RUNTIME_PROJECTILE_GUARD_DISTANCE_BOUNDS.depth,
      operationBounds?.depth ?? projectileZeroDefaultPair(depthRaw),
    ),
  };
}

function applyRuntimeProjectileGuardDistancePair(
  current: readonly [number, number],
  replacement: readonly [number, number?, number?] | undefined,
): [number, number] {
  if (replacement === undefined) {
    return [current[0], current[1]];
  }
  const next = (value: number | undefined, fallback: number): number =>
    value !== undefined && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : fallback;
  return [next(replacement[0], current[0]), next(replacement[1], current[1])];
}

function projectileZeroDefaultTriple(value: string | undefined): [number, number, number] | undefined {
  const vector = partialNumberTriple(value);
  return vector === undefined
    ? undefined
    : [vector[0], vector[1] ?? 0, vector[2] ?? 0];
}

function normalizeModifyProjectileVelocity(
  vector: [number, number?, number?] | undefined,
): [number, number, number] | undefined {
  return vector === undefined
    ? undefined
    : [vector[0], vector[1] ?? 0, vector[2] ?? 0];
}

function numberTriple(value: string | undefined): [number, number, number?] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(numbers[0]) || !Number.isFinite(numbers[1])) {
    return undefined;
  }
  return Number.isFinite(numbers[2]) ? [numbers[0]!, numbers[1]!, numbers[2]!] : [numbers[0]!, numbers[1]!];
}

function normalizedNumberPair(value: string | undefined): [number, number] | undefined {
  const pair = numberPair(value);
  return pair ? [pair[0], pair[1]] : undefined;
}

function projectilePaletteRemap(value: string | undefined): [number, number] | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length !== 2 || !Number.isFinite(values[0]) || !Number.isFinite(values[1])) return undefined;
  return [Math.trunc(values[0]!), Math.trunc(values[1]!)];
}

function cloneRuntimePaletteRemap(value: RuntimePaletteRemap): RuntimePaletteRemap {
  return { source: [...value.source], dest: [...value.dest] };
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

function projectileVelocityMultiplier(
  value: string | undefined,
  trailingDefault: number,
): [number, number, number] | undefined {
  if (!value) return undefined;
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(parts[0])) return undefined;
  return [
    parts[0]!,
    Number.isFinite(parts[1]) ? parts[1]! : trailingDefault,
    Number.isFinite(parts[2]) ? parts[2]! : trailingDefault,
  ];
}

function projectileClsnScalePair(value: string | undefined, secondDefault: number): [number, number] | undefined {
  if (!value) return undefined;
  const [first, second] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(first)) return undefined;
  return [first!, Number.isFinite(second) ? second! : secondDefault];
}

function runtimeHitVelocityMetadata(input: {
  groundVelocity?: [number, number?, number?];
  airVelocity?: [number, number?, number?];
  downVelocity?: [number, number?, number?];
  guardVelocity?: [number, number?, number?];
  airGuardVelocity?: [number, number?, number?];
}): RuntimeHitVelocityMetadata | undefined {
  const vector = (value: [number, number?, number?]) => ({ x: value[0] ?? 0, y: value[1] ?? 0, z: value[2] ?? 0 });
  const result: RuntimeHitVelocityMetadata = {
    ...(input.groundVelocity === undefined ? {} : { ground: vector(input.groundVelocity) }),
    ...(input.airVelocity === undefined ? {} : { air: vector(input.airVelocity) }),
    ...(input.downVelocity === undefined ? {} : { down: vector(input.downVelocity) }),
    ...(input.guardVelocity === undefined ? {} : { guard: vector(input.guardVelocity) }),
    ...(input.airGuardVelocity === undefined ? {} : { airGuard: vector(input.airGuardVelocity) }),
  };
  return Object.keys(result).length > 0 ? result : undefined;
}

function staticModifyProjectileGroundVelocity(value: string): RuntimeModifyProjectileGroundVelocity | undefined {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length < 1 || parts.length > 3 || parts.some((part) => part.length === 0)) {
    return undefined;
  }
  const result: RuntimeModifyProjectileGroundVelocity = {};
  const keys = ["x", "y", "z"] as const;
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]!;
    if (/^n$/i.test(part)) continue;
    const number = Number(part);
    if (!Number.isFinite(number)) return undefined;
    result[keys[index]!] = number;
  }
  return result;
}

function velocityPair(value: string | undefined): [number, number, number?] | undefined {
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
  return numbers.length > 2 && numbers[2] !== undefined
    ? [numbers[0], numbers[1] ?? 0, numbers[2]]
    : [numbers[0], numbers[1] ?? 0];
}

function pairToScale(value: [number, number, number?] | [number, number] | undefined): { x: number; y: number } {
  return {
    x: clampProjectileScale(value?.[0] ?? 1),
    y: clampProjectileScale(value?.[1] ?? value?.[0] ?? 1),
  };
}

function pairToVelocityMultiplier(value: [number, number, number?] | [number, number] | undefined): { x: number; y: number; z: number } {
  return {
    x: clampProjectileVelocityMultiplier(value?.[0] ?? 1),
    y: clampProjectileVelocityMultiplier(value?.[1] ?? 1),
    z: clampProjectileVelocityMultiplier(value?.[2] ?? 1),
  };
}

function isDefaultVector(value: { x: number; y: number }): boolean {
  return value.x === 0 && value.y === 0;
}

function isDefaultVelocityMultiplier(value: { x: number; y: number; z?: number }): boolean {
  return value.x === 1 && value.y === 1 && (value.z ?? 1) === 1;
}

function isDefaultScale(value: { x: number; y: number }): boolean {
  return value.x === 1 && value.y === 1;
}

function normalizeOptionalVelocityVector(value: [number, number, number?] | [number, number?] | undefined): [number, number, number?] | undefined {
  if (!value) return undefined;
  return value[2] === undefined ? [value[0], value[1] ?? 0] : [value[0], value[1] ?? 0, value[2]];
}

function completeFreshProjectileAirGuardVelocity(
  authored: [number?, number?, number?] | undefined,
  defaults: [number, number?, number?] | undefined,
): [number, number?, number?] | undefined {
  if (authored === undefined) return defaults;
  const x = authored[0] ?? defaults?.[0];
  if (x === undefined) return defaults;
  const y = authored[1] ?? defaults?.[1] ?? 0;
  const z = authored[2] ?? defaults?.[2];
  return z === undefined ? [x, y] : [x, y, z];
}

function completeFreshProjectileAirVelocity(
  authored: [number?, number?, number?] | undefined,
): [number, number, number] {
  return [authored?.[0] ?? 0, authored?.[1] ?? 0, authored?.[2] ?? 0];
}

function completeFreshProjectileGroundVelocity(
  authored: [number?, number?, number?] | undefined,
): [number, number, number] {
  return [authored?.[0] ?? 0, authored?.[1] ?? 0, authored?.[2] ?? 0];
}

function completeFreshProjectileGuardVelocity(
  authored: [number?, number?, number?] | undefined,
  defaults: [number, number?, number?] | undefined,
): [number, number, number] {
  return [
    authored?.[0] ?? defaults?.[0] ?? 0,
    authored?.[1] ?? 0,
    authored?.[2] ?? defaults?.[2] ?? 0,
  ];
}

function completeFreshProjectileDownVelocity(
  authored: [number?, number?, number?] | undefined,
  defaults: [number, number, number],
): [number, number, number] {
  return [
    authored?.[0] ?? defaults[0],
    authored?.[1] ?? defaults[1],
    authored?.[2] ?? defaults[2],
  ];
}

function runtimeProjectileHasExplicitDepth(projectile: RuntimeProjectile): boolean {
  const attackDepth = projectile.attackDepth;
  return projectile.pos.z !== undefined || projectile.vel.z !== undefined || projectile.accel.z !== undefined ||
    (attackDepth !== undefined && (attackDepth[0] !== DEFAULT_RUNTIME_ATTACK_DEPTH[0] || attackDepth[1] !== DEFAULT_RUNTIME_ATTACK_DEPTH[1]));
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

export function normalizeRuntimeProjectileLayerNo(value: number): -1 | 0 | 1 {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

function finiteProjectileAngle(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function normalizeProjectileDepthBound(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.max(0, Math.round(value));
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

function runtimeProjectileOutsideDepthBounds(
  projectile: RuntimeProjectile,
  stage: RuntimeProjectileStage,
): boolean {
  if (projectile.depthBound === undefined || !stage.depthBounds) {
    return false;
  }
  const stageScale = runtimeCombatLocalScale(
    stage.localCoord?.width === undefined
      ? undefined
      : [stage.localCoord.width, stage.localCoord.height ?? 240],
  );
  const projectileScale = runtimeCombatLocalScale(projectile.localCoord);
  const stageTop = (stage.depthBounds.top * stageScale) / projectileScale - projectile.depthBound;
  const stageBottom = (stage.depthBounds.bottom * stageScale) / projectileScale + projectile.depthBound;
  const top = Math.min(stageTop, stageBottom);
  const bottom = Math.max(stageTop, stageBottom);
  const position = projectile.pos.z ?? 0;
  return position < top || position > bottom;
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

function hitAnimType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) return numeric;
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) return undefined;
  const values: Record<string, number> = {
    light: 0,
    medium: 1,
    med: 1,
    hard: 2,
    heavy: 2,
    back: 3,
    up: 4,
    diagup: 5,
    diagonalup: 5,
  };
  return values[normalized];
}

function defaultFallAnimType(airAnimType: number): number {
  return airAnimType >= 4 ? airAnimType : 3;
}

function staticHitFlag(value: string | undefined): string | undefined {
  const stripped = stripMugenString(value);
  return stripped && !/[()]/.test(stripped) ? stripped : undefined;
}

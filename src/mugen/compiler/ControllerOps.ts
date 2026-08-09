import type { MugenStateController } from "../model/MugenState";
import { compileExpression } from "./ExpressionCompiler";
import { normalizeMugenCollisionBoxType, type MugenCollisionBoxType } from "../model/CollisionBox";
import { normalizeMugenAffectTeam, normalizeMugenTeamSide, type MugenAffectTeam } from "../model/MugenTeam";

export type MugenProjectileVector = [number, number, number?];
export type MugenHitDefVector = [number, number?, number?];
export type MugenHitDefExpressionPair = [number | string, (number | string)?];
export type MugenHitDefExpressionTriplet = [number | string, number | string, number | string];
export type MugenHitDefPaletteFxOp = {
  time?: number | string;
  add?: MugenHitDefExpressionTriplet;
  mul?: MugenHitDefExpressionTriplet;
  color?: number | string;
  invertAll?: number | string;
};
export type MugenHitDefEnvShakeOp = {
  time?: number | string;
  freq?: number | string;
  ampl?: number | string;
  phase?: number | string;
  /** Ikemen-GO contact EnvShake multiplier. */
  mul?: number | string;
  /** Ikemen-GO contact EnvShake direction in degrees. */
  dir?: number | string;
};
export type MugenHitDefFallImpactOp = {
  damage?: number | string;
  xVelocity?: number | string;
  yVelocity?: number | string;
  /** Pinned Ikemen-GO depth-axis fall velocity. */
  zVelocity?: number | string;
};
export type MugenHitDefFallRecoveryOp = {
  /** M.U.G.E.N air-recovery permission after a fall. */
  recover?: number | string;
  /** Delay before the air-recovery command is accepted. */
  recoverTime?: number | string;
  /** Ikemen-GO lie-down fast-recovery permission. */
  downRecover?: number | string;
  /** Ikemen-GO lie-down recovery countdown. */
  downRecoverTime?: number | string;
};
export type MugenHitDefFallFlagsOp = {
  /** Grounded knockdown policy. */
  enabled?: number | string;
  /** Airborne-only knockdown policy; omitted follows the base fall flag. */
  airFall?: number | string;
  /** Deferred fall-damage KO permission. */
  kill?: number | string;
};
export type MugenHitDefLethalFlagsOp = {
  /** Whether normal hit damage may reduce the receiver to zero life. */
  kill?: number | string;
  /** Whether guarded damage may reduce the receiver to zero life. */
  guardKill?: number | string;
  /** Whether one accepted direct contact retires the active HitDef target set. */
  hitOnce?: number | string;
};
export type MugenPartialHitDefVector = { x?: number; y?: number; z?: number };
export type MugenProjectileShadow = [number, number?, number?];
export type MugenProjectileProjection = "orthographic" | "perspective" | "perspective2";
export type MugenProjectileWindow = [number, number, number, number];
export type MugenProjectileGuardDistanceBounds = {
  /** Front/back width pair. Old `guard.dist` is an alias for this field. */
  width?: [number, number];
  /** Top/bottom height pair. */
  height?: [number, number];
  /** Top/bottom depth pair. */
  depth?: [number, number];
};

export type ControllerCompileContext = {
  constants?: Record<string, number>;
};

export type HitDefControllerOp = {
  kind: "hitdef";
  redirectPlayerIdExpression?: string;
  /** Nonnegative HitDef ID expression evaluated in caller context. */
  id?: number | string;
  /** Raw HitDef chain ID expression; -1 disables chaining. */
  chainId?: number | string;
  noChainIds?: number[];
  hitCount?: number;
  /** Dynamic direct HitDef numhits expression evaluated in the caller context. */
  hitCountExpression?: number | string;
  attr?: string;
  hitFlag?: string;
  affectTeam?: MugenAffectTeam;
  teamSide?: 1 | 2;
  p2ClsnCheck?: MugenCollisionBoxType;
  p2ClsnRequire?: MugenCollisionBoxType;
  damage?: number;
  guardDamage?: number;
  /** Dynamic or mixed HitDef damage pair evaluated in caller context. */
  damageExpressions?: MugenHitDefExpressionPair;
  guardPoints?: number;
  dizzyPoints?: number;
  redLife?: number;
  guardRedLife?: number;
  /** Second HitDef givepower value exposed by GetHitVar(guardpower). */
  guardPower?: number;
  /** First HitDef givepower value exposed by GetHitVar(hitpower). */
  hitPower?: number;
  /** One or two defender power-gain expressions from HitDef givepower. */
  givePower?: MugenHitDefExpressionPair;
  /** Authored HitDef score exposed by GetHitVar(score). */
  score?: number;
  /** One or two attacker power-gain expressions from HitDef getpower. */
  getPower?: MugenHitDefExpressionPair;
  kill?: boolean;
  /** Ikemen direct HitDef keepstate flag exposed by GetHitVar(keepstate). */
  keepState?: boolean;
  guardKill?: boolean;
  hitOnce?: boolean;
  airJuggle?: number;
  /** Dynamic direct HitDef air.juggle expression evaluated in the caller context. */
  airJuggleExpression?: number | string;
  priority?: number;
  /** Dynamic direct HitDef numeric priority expression. */
  priorityExpression?: number | string;
  priorityType?: "hit" | "miss" | "dodge";
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  /** Dynamic direct HitDef P1 sprite-priority expression. */
  p1SpritePriorityExpression?: number | string;
  /** Dynamic direct HitDef P2 sprite-priority expression. */
  p2SpritePriorityExpression?: number | string;
  attackDepth?: [number, number];
  unhittableTime?: MugenHitDefExpressionPair;
  /** Static attacker component of HitDef pausetime. */
  pauseTime?: number;
  /** Static defender component of HitDef pausetime. */
  hitShakeTime?: number;
  /** Dynamic or mixed HitDef pausetime pair evaluated in caller context. */
  pauseTimeExpressions?: MugenHitDefExpressionPair;
  /** Direct ground.hittime scalar evaluated in the HitDef caller context. */
  groundHitTime?: number | string;
  /** Direct ground.slidetime scalar evaluated in the HitDef caller context. */
  groundSlideTime?: number | string;
  /** Direct air.hittime scalar evaluated in the HitDef caller context. */
  airHitTime?: number | string;
  /** Direct down.hittime expression evaluated in the HitDef caller context. */
  downHitTime?: number | string;
  /** M.U.G.E.N down.bounce toggle; explicit false suppresses the Common1 bounce. */
  downBounce?: boolean;
  /** Dynamic M.U.G.E.N down.bounce expression evaluated in the HitDef caller context. */
  downBounceExpression?: number | string;
  /** Direct-hit defender posture overrides evaluated in the HitDef caller context. */
  forceStand?: number | string;
  forceCrouch?: number | string;
  /** Direct-hit fall suppression evaluated in the HitDef caller context. */
  forceNoFall?: number | string;
  groundVelocity?: MugenHitDefVector;
  /** Dynamic direct HitDef ground.velocity X/Y pair evaluated in caller context. */
  groundVelocityExpressions?: MugenHitDefExpressionPair;
  airVelocity?: MugenHitDefVector;
  /** Dynamic direct HitDef air.velocity X/Y pair evaluated in caller context. */
  airVelocityExpressions?: MugenHitDefExpressionPair;
  downVelocity?: MugenHitDefVector;
  /** Dynamic direct HitDef down.velocity X/Y pair evaluated in caller context. */
  downVelocityExpressions?: MugenHitDefExpressionPair;
  /** Direct guard.dist scalar evaluated in the HitDef caller context. */
  guardDistance?: number | string;
  guardFlag?: string;
  /** Static attacker component of guard.pausetime. */
  guardPauseTime?: number;
  /** Static defender component of guard.pausetime. */
  guardShakeTime?: number;
  /** Dynamic or mixed guard.pausetime pair evaluated in caller context. */
  guardPauseTimeExpressions?: MugenHitDefExpressionPair;
  /** Direct guard.hittime scalar evaluated in the HitDef caller context. */
  guardHitTime?: number | string;
  /** Direct guard.slidetime scalar evaluated in the HitDef caller context. */
  guardSlideTime?: number | string;
  /** Direct guard.ctrltime scalar evaluated in the HitDef caller context. */
  guardControlTime?: number | string;
  /** Direct airguard.ctrltime scalar evaluated in the HitDef caller context. */
  airGuardControlTime?: number | string;
  guardVelocity?: MugenHitDefVector;
  /** Direct guard.velocity X expression evaluated in the HitDef caller context. */
  guardVelocityExpression?: number | string;
  airGuardVelocity?: MugenHitDefVector;
  /** One-, two-, or three-component dynamic/mixed airguard.velocity evaluated in caller context. */
  airGuardVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed airguard.velocity Z component when the expression vector has three components. */
  airGuardVelocityZExpression?: number | string;
  groundCornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
  /** Root-owned attacker state expression evaluated when this fresh HitDef activates. */
  p1StateNo?: number | string;
  /** Root-owned target state expression evaluated when this fresh HitDef activates. */
  p2StateNo?: number | string;
  /** State-owner toggle for p2StateNo, evaluated only when p2StateNo resolves. */
  p2GetP1State?: number | string;
  /** Direct-hit attacker facing override; evaluated in the HitDef caller context. */
  p1Facing?: number | string;
  /** Direct-hit attacker facing derived from P2; nonzero values take precedence over p1facing. */
  p1GetP2Facing?: number | string;
  /** HitDef p2facing expression evaluated in the caller context. */
  p2Facing?: number | string;
  missOnOverride?: boolean;
  ignoreReversalDef?: boolean;
  snap?: [number, number?];
  animType?: number;
  /** Ikemen GetHitVar ground/air reaction metadata. */
  airAnimType?: number;
  groundType?: number;
  airType?: number;
  /** Ikemen-GO HitDef acceleration metadata copied into GetHitVars. */
  xAccel?: number | string;
  yAccel?: number | string;
  zAccel?: number | string;
  /** Grounded get-hit friction overrides copied to the receiver on contact. */
  standFriction?: number | string;
  crouchFriction?: number | string;
  /** Independent X/Y scales for normal and guarded hit sparks. */
  hitSparkScale?: MugenHitDefExpressionPair;
  guardSparkScale?: MugenHitDefExpressionPair;
  /** PalFX copied to the receiver by an accepted, unguarded contact. */
  paletteFx?: MugenHitDefPaletteFxOp;
  /** Camera shake emitted by an accepted, unguarded direct contact. */
  envShake?: MugenHitDefEnvShakeOp;
  /** Camera shake stored on the receiver until the authored fall impact. */
  fallEnvShake?: MugenHitDefEnvShakeOp;
  /** Deferred ground-impact damage and bounce velocity. */
  fallImpact?: MugenHitDefFallImpactOp;
  /** Fall and lie-down recovery policy evaluated in the HitDef caller context. */
  fallRecovery?: MugenHitDefFallRecoveryOp;
  /** Fall, air-fall, and deferred KO policy evaluated in the HitDef caller context. */
  fallFlags?: MugenHitDefFallFlagsOp;
  /** Dynamic lethal and direct one-contact policy evaluated in the HitDef caller context. */
  lethalFlags?: MugenHitDefLethalFlagsOp;
  /** Bounded synthetic/Ikemen KO velocity-delta metadata, separate from HitDef velocity. */
  koVelocityAdd?: MugenHitDefVector;
  fallAnimType?: number;
  hitSound?: string;
  guardSound?: string;
  hitSpark?: string;
  guardSpark?: string;
  sparkXy?: [number, number?];
  fall: HitDefFallOp;
};

export type ModifyHitDefControllerOp = {
  kind: "modifyhitdef";
  redirectPlayerIdExpression: string;
  damage?: number;
  guardDamage?: number;
  /** Dynamic or mixed live damage pair evaluated in caller context. */
  damageExpressions?: MugenHitDefExpressionPair;
  /** Live ground.hittime replacement evaluated in the ModifyHitDef caller context. */
  groundHitTime?: number | string;
  /** Live ground.slidetime replacement evaluated in the ModifyHitDef caller context. */
  groundSlideTime?: number | string;
  /** Live guard.hittime replacement evaluated in the ModifyHitDef caller context. */
  guardHitTime?: number | string;
  /** Live guard.slidetime replacement evaluated in the ModifyHitDef caller context. */
  guardSlideTime?: number | string;
  /** Live guard.ctrltime replacement evaluated in the ModifyHitDef caller context. */
  guardControlTime?: number | string;
  /** Live airguard.ctrltime replacement evaluated in the ModifyHitDef caller context. */
  airGuardControlTime?: number | string;
  /** Live air.hittime replacement evaluated in the ModifyHitDef caller context. */
  airHitTime?: number | string;
  /** Live guard.dist replacement evaluated in the ModifyHitDef caller context. */
  guardDistance?: number | string;
  /** Live down.hittime replacement evaluated in the ModifyHitDef caller context. */
  downHitTime?: number | string;
  /** Component-wise live ground.velocity X/Y replacement evaluated in caller context. */
  groundVelocity?: MugenHitDefExpressionPair;
  /** Bounded Ikemen vector-Z mutation for an active HitDef. */
  groundVelocityZ?: number;
  /** Component-wise live air.velocity X/Y replacement evaluated in caller context. */
  airVelocity?: MugenHitDefExpressionPair;
  airVelocityZ?: number;
  downVelocity?: MugenHitDefVector;
  /** Component-wise live down.velocity X/Y replacement evaluated in caller context. */
  downVelocityExpressions?: MugenHitDefExpressionPair;
  /** Live down.velocity Z replacement; dynamic values resolve in caller context. */
  downVelocityZ?: number;
  downVelocityZExpression?: number | string;
  /** Root-owned live guard.velocity X replacement evaluated in caller context. */
  guardVelocityExpression?: number | string;
  guardVelocityZ?: number;
  /** Root-owned live airguard.velocity X, X/Y, or X/Y/Z replacement evaluated in caller context. */
  airGuardVelocityExpressions?: MugenHitDefExpressionPair;
  airGuardVelocityZ?: number;
  /** Root-owned live airguard.velocity Z replacement evaluated in caller context. */
  airGuardVelocityZExpression?: number | string;
  /** HitDef acceleration metadata mutation; dynamic scalar expressions are retained for runtime evaluation. */
  xAccel?: number | string;
  yAccel?: number | string;
  zAccel?: number | string;
  /** Grounded get-hit friction mutation; each scalar remains independent. */
  standFriction?: number | string;
  crouchFriction?: number | string;
  /** Component-wise live hit/guard spark scale mutation. */
  hitSparkScale?: MugenHitDefExpressionPair;
  guardSparkScale?: MugenHitDefExpressionPair;
  /** Component-wise live replacement for the contact PalFX payload. */
  paletteFx?: MugenHitDefPaletteFxOp;
  /** Component-wise live replacement for direct-contact camera shake. */
  envShake?: MugenHitDefEnvShakeOp;
  /** Component-wise live replacement for fall-impact camera shake. */
  fallEnvShake?: MugenHitDefEnvShakeOp;
  /** Component-wise live replacement for deferred fall impact metadata. */
  fallImpact?: MugenHitDefFallImpactOp;
  /** Component-wise live replacement for fall and lie-down recovery policy. */
  fallRecovery?: MugenHitDefFallRecoveryOp;
  /** Component-wise live replacement for fall, air-fall, and deferred KO policy. */
  fallFlags?: MugenHitDefFallFlagsOp;
  /** Component-wise live replacement for lethal and direct one-contact policy. */
  lethalFlags?: MugenHitDefLethalFlagsOp;
  /** Component-wise live replacement for attacker hit/guard power gain. */
  getPower?: MugenHitDefExpressionPair;
  /** Component-wise live replacement for defender hit/guard power gain. */
  givePower?: MugenHitDefExpressionPair;
  /** M.U.G.E.N down.bounce toggle for an active normal HitDef. */
  downBounce?: boolean;
  /** Dynamic M.U.G.E.N down.bounce replacement evaluated in the ModifyHitDef caller context. */
  downBounceExpression?: number | string;
  /** Live defender posture replacements evaluated independently in caller context. */
  forceStand?: number | string;
  forceCrouch?: number | string;
  /** Live fall-suppression replacement evaluated in caller context. */
  forceNoFall?: number | string;
  /** Live nonnegative HitDef ID replacement evaluated in caller context. */
  id?: number | string;
  /** Live raw chain ID replacement; -1 disables chaining. */
  chainId?: number | string;
  noChainIds?: number[];
  hitCount?: number;
  /** Dynamic live numhits replacement evaluated in the ModifyHitDef caller context. */
  hitCountExpression?: number | string;
  attr?: string;
  guardFlag?: string;
  hitFlag?: string;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  /** Live direct-HitDef attacker-facing replacements, evaluated independently. */
  p1Facing?: number | string;
  p1GetP2Facing?: number | string;
  /** Live defender-facing replacement evaluated in the ModifyHitDef caller context. */
  p2Facing?: number | string;
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  /** Dynamic live P1 sprite-priority replacement. */
  p1SpritePriorityExpression?: number | string;
  /** Dynamic live P2 sprite-priority replacement. */
  p2SpritePriorityExpression?: number | string;
  priority?: number;
  /** Dynamic live numeric priority replacement. */
  priorityExpression?: number | string;
  priorityType?: "hit" | "miss" | "dodge";
  kill?: boolean;
  guardKill?: boolean;
  fallKill?: boolean;
  hitOnce?: boolean;
  unhittableTime?: MugenHitDefExpressionPair;
};

export type ModifyReversalDefControllerOp = {
  kind: "modifyreversaldef";
  redirectPlayerIdExpression: string;
  reversalAttr?: string;
  reversalGuardFlag?: string;
  reversalGuardFlagNot?: string;
  hitDefAttr?: string;
  guardFlag?: string;
  missOnOverride?: boolean;
  hitPause?: number;
  hitCount?: number;
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  p2Facing?: number;
  targetId?: number;
  attackDepth?: [number, number];
};

export type HitDefFallOp = {
  enabled?: boolean;
  /** M.U.G.E.N air.fall; only enables the fall reaction when P2 is airborne. */
  airFall?: boolean;
  xVelocity?: number;
  yVelocity?: number;
  /** Ikemen-GO fall.zvelocity; omitted keeps the current depth velocity. */
  zVelocity?: number;
  damage?: number;
  defenceUp?: number;
  kill?: boolean;
  recover?: boolean;
  recoverTime?: number;
  downRecover?: boolean;
  downRecoverTime?: number;
  envShakeTime?: number;
  envShakeFrequency?: number;
  envShakeAmplitude?: number;
  envShakePhase?: number;
  /** Ikemen-GO fall.envshake.mul readback metadata. */
  envShakeMultiplier?: number;
  /** Ikemen-GO fall.envshake.dir readback and presentation metadata. */
  envShakeDirection?: number;
};

export type TargetControllerOp =
  | ({ kind: "target"; controllerType: "targetdrop"; excludeId?: number; keepOne: boolean } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetlifeadd"; requestedId?: number; value: number; absolute: boolean; kill: boolean; dizzy?: boolean; redLife?: boolean } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetredlifeadd"; requestedId?: number; value: number; absolute: boolean } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetguardpointsadd"; requestedId?: number; value: number; absolute?: boolean } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetdizzypointsadd"; requestedId?: number; value: number; absolute?: boolean } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetpoweradd"; requestedId?: number; value: number } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetfacing"; requestedId?: number; value: number } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetveladd"; requestedId?: number; x: number; y: number } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetvelset"; requestedId?: number; x?: number; y?: number } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetbind"; requestedId?: number; pos: [number, number, number?]; time: number } & RedirectableTargetControllerOp)
  | ({ kind: "target"; controllerType: "targetstate"; requestedId?: number; stateNo?: number } & RedirectableTargetControllerOp);

export type BindToTargetControllerOp = {
  kind: "bindtotarget";
  requestedId?: number;
  pos: [number, number];
  posZ?: number;
  postype: "foot" | "mid" | "head";
  time: number;
} & RedirectableTargetControllerOp;

export type PauseControllerOp = {
  kind: "pause";
  controllerType: "pause" | "superpause";
  time: number;
  moveTime: number;
  pauseBg: boolean;
  darken: boolean;
  unhittable?: boolean;
  powerAdd: number;
  p2DefMul?: number;
  sound?: string;
  anim?: string;
  pos?: [number, number];
};

export type AudioControllerOp = {
  kind: "audio";
  controllerType: "playsnd" | "stopsnd" | "sndpan";
  value?: string;
  channel?: number;
  lowPriority?: boolean;
  volumeScale?: number;
  legacyVolume?: number;
  freqMul?: number;
  loop?: boolean;
  pan?: number;
  absPan?: number;
};

export type NoopControllerOp = {
  kind: "noop";
  controllerType:
    | "null"
    | "forcefeedback"
    | "displaytoclipboard"
    | "appendtoclipboard"
    | "clearclipboard"
    | "makedust"
    | "destroyself";
};

export type AssertSpecialControllerOp = {
  kind: "assertspecial";
  flags: string[];
  globalFlags: string[];
};

export type ProjectileControllerOp = {
  kind: "projectile";
  redirectPlayerIdExpression?: string;
  projectileId?: number;
  targetId?: number;
  chainId?: number;
  /** Up to eight HitDef IDs that block repeat contact from the same source player. */
  noChainIds?: number[];
  hitDefHitCount?: number;
  p1StateNo?: number;
  affectTeam?: MugenAffectTeam;
  teamSide?: 1 | 2;
  projAnim?: number;
  offset?: MugenProjectileVector;
  pos?: MugenProjectileVector;
  postype?: string;
  velocity: MugenProjectileVector;
  removalVelocity?: MugenProjectileVector;
  acceleration?: MugenProjectileVector;
  velocityMultiplier?: MugenProjectileVector;
  scale?: [number, number];
  angle?: number;
  xAngle?: number;
  yAngle?: number;
  xShear?: number;
  shadow?: MugenProjectileShadow;
  reflection?: number;
  projection?: MugenProjectileProjection;
  focalLength?: number;
  window?: MugenProjectileWindow;
  /** Ikemen spawn-only palette isolation flag. ModifyProjectile intentionally omits it. */
  ownPalette?: boolean;
  /** Ikemen spawn-only destination palette requested by remappal. */
  paletteRemap?: [number, number];
  clsnScale?: [number, number];
  clsnAngle?: number;
  facing?: number;
  hitAnim?: number;
  /** Ikemen GetHitVar reaction animation metadata carried by projectile HitDef. */
  animType?: number;
  airAnimType?: number;
  fallAnimType?: number;
  removeAnim?: number;
  cancelAnim?: number;
  edgeBound?: number;
  stageBound?: number;
  depthBound?: number;
  heightBound?: { low: number; high: number };
  removeTime: number;
  layerNo?: -1 | 0 | 1;
  spritePriority: number;
  /** Nested HitDef priority, separate from Projectile `projpriority`. */
  hitPriority?: number;
  hitPriorityType?: "hit" | "miss" | "dodge";
  /** Nested HitDef sprite priorities, separate from Projectile `projsprpriority`. */
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  priority: number;
  hitCount: number;
  missTime: number;
  pauseMoveTime?: number;
  superMoveTime?: number;
  trans?: string;
  damage: number;
  /** Authored Projectile HitDef dizzypoints exposed by GetHitVar. */
  dizzyPoints?: number;
  /** Authored Projectile HitDef guardpoints exposed by GetHitVar. */
  guardPoints?: number;
  /** Authored Projectile HitDef redlife exposed by GetHitVar. */
  redLife?: number;
  /** Authored Projectile guard redlife exposed by guarded GetHitVar. */
  guardRedLife?: number;
  /** Authored Projectile second givepower value exposed by GetHitVar. */
  guardPower?: number;
  /** Authored Projectile first givepower value exposed by GetHitVar. */
  hitPower?: number;
  /** One or two defender power-gain expressions from Projectile HitDef givepower. */
  givePower?: MugenHitDefExpressionPair;
  /** Authored Projectile HitDef score exposed by GetHitVar. */
  score?: number;
  /** Authored Projectile guard score exposed by guarded GetHitVar. */
  guardScore?: number;
  /** One or two attacker power-gain expressions from Projectile HitDef getpower. */
  getPower?: MugenHitDefExpressionPair;
  /** Projectile HitDef actor-role immunity expressions; only receiver component one mutates on contact. */
  unhittableTime?: MugenHitDefExpressionPair;
  /** Grounded get-hit friction expressions resolved in the Projectile caller context. */
  standFriction?: number | string;
  crouchFriction?: number | string;
  /** Independent X/Y scales for normal and guarded Projectile hit sparks. */
  hitSparkScale?: MugenHitDefExpressionPair;
  guardSparkScale?: MugenHitDefExpressionPair;
  /** PalFX copied to the receiver by an accepted, unguarded Projectile contact. */
  paletteFx?: MugenHitDefPaletteFxOp;
  airJuggle?: number;
  kill?: boolean;
  guardKill?: boolean;
  attr?: string;
  hitFlag?: string;
  /** First `pausetime` value: Projectile-local pause after hit contact. */
  hitPause: number;
  /** Second `pausetime` value: defender hit-shake time. */
  hitShakeTime?: number;
  hitStun: number;
  /** M.U.G.E.N grounded hit slide duration. */
  groundSlideTime?: number;
  airHitTime?: number;
  downHitTime?: number;
  /** Fresh Projectile down.hittime expression evaluated in the original caller context. */
  downHitTimeExpression?: number | string;
  groundVelocity?: MugenProjectileVector;
  /** One-, two-, or three-component dynamic/mixed ground.velocity evaluated in projectile caller context. */
  groundVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed ground.velocity Z component when the expression vector has three components. */
  groundVelocityZExpression?: number | string;
  airVelocity?: MugenProjectileVector;
  /** One-, two-, or three-component dynamic/mixed air.velocity evaluated in projectile caller context. */
  airVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed air.velocity Z component when the expression vector has three components. */
  airVelocityZExpression?: number | string;
  downVelocity?: MugenProjectileVector;
  /** One-, two-, or three-component dynamic/mixed down.velocity evaluated in projectile caller context. */
  downVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed down.velocity Z component when the expression vector has three components. */
  downVelocityZExpression?: number | string;
  /** M.U.G.E.N down.bounce toggle carried by projectile HitDef data. */
  downBounce?: boolean;
  /** Ikemen HitDef flag that clears the target fall flag on contact. */
  forceNoFall?: boolean;
  /** Ikemen HitDef posture overrides used before default get-hit selection. */
  forceStand?: boolean;
  forceCrouch?: boolean;
  fall?: HitDefFallOp;
  attackDepth?: [number, number];
  p2StateNo?: number;
  p2GetP1State?: boolean;
  /** Authored Projectile HitDef p2facing exposed by GetHitVar(facing). */
  p2Facing?: number;
  /** Optional Projectile target-distance bounds; omitted spawn components stay unset. */
  minDistance?: MugenHitDefVector;
  maxDistance?: MugenHitDefVector;
  p2ClsnCheck?: MugenCollisionBoxType;
  p2ClsnRequire?: MugenCollisionBoxType;
  missOnOverride?: boolean;
  guardDamage?: number;
  guardDistanceBounds?: MugenProjectileGuardDistanceBounds;
  guardFlag?: string;
  /** First `guard.pausetime` value: Projectile-local pause after guard contact. */
  guardPauseTime?: number;
  /** Second `guard.pausetime` value: defender guard hit-shake time. */
  guardShakeTime?: number;
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
  guardVelocity?: MugenProjectileVector;
  /** One-, two-, or three-component dynamic/mixed guard.velocity evaluated in projectile caller context. */
  guardVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed guard.velocity Z component when the expression vector has three components. */
  guardVelocityZExpression?: number | string;
  airGuardVelocity?: MugenProjectileVector;
  /** One-, two-, or three-component dynamic/mixed airguard.velocity evaluated in projectile caller context. */
  airGuardVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed airguard.velocity Z component when the expression vector has three components. */
  airGuardVelocityZExpression?: number | string;
  /** Ikemen-GO HitDef acceleration metadata carried by projectile impacts. */
  xAccel?: number;
  yAccel?: number;
  zAccel?: number;
  /** Ikemen-GO HitDef EnvShake metadata emitted by accepted projectile contact. */
  envShakeTime?: number;
  envShakeFrequency?: number;
  envShakeAmplitude?: number;
  envShakePhase?: number;
  envShakeMultiplier?: number;
  envShakeDirection?: number;
  /** Bounded synthetic/Ikemen KO velocity-delta metadata, separate from Projectile velocity. */
  koVelocityAdd?: MugenProjectileVector;
  groundCornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
  hitSound?: string;
  guardSound?: string;
  hitSpark?: string;
  hitSparkAngle?: number;
  guardSpark?: string;
  guardSparkAngle?: number;
  sparkXy?: [number, number];
  removeOnHit: boolean;
};

export type ModifyProjectileControllerOp = {
  kind: "modifyprojectile";
  redirectPlayerIdExpression?: string;
  /** Ikemen `id` selector. Negative or omitted values match every active projectile. */
  selectionId?: number;
  /** The same authored `id` also replaces the selected Projectile HitDef target ID. */
  targetId?: number;
  chainId?: number;
  /** Replacement list for the selected Projectile HitDef, capped to Ikemen's first eight entries. */
  noChainIds?: number[];
  /** Ikemen `index` selector over oldest-first ID matches. */
  selectionIndex?: number;
  /** Shared Projectile `projid` field mutates the selected projectile IDs. */
  projectileId?: number;
  /** Numeric owner AIR action selected by Ikemen `projanim`. */
  projAnim?: number;
  hitAnim?: number;
  removeAnim?: number;
  cancelAnim?: number;
  teamSide?: 1 | 2;
  affectTeam?: MugenAffectTeam;
  animType?: number;
  airAnimType?: number;
  fallAnimType?: number;
  kill?: boolean;
  guardKill?: boolean;
  fallKill?: boolean;
  /** Ikemen ModifyProjectile mutation for the nested HitDef fall flag. */
  forceNoFall?: boolean;
  /** Ikemen ModifyProjectile mutations for default get-hit posture. */
  forceStand?: boolean;
  forceCrouch?: boolean;
  /** Core Ikemen fall payload replaced on selected Projectile HitDef data. */
  fallDamage?: number;
  fallXVelocity?: number;
  fallYVelocity?: number;
  fallZVelocity?: number;
  fallRecover?: boolean;
  fallRecoverTime?: number;
  /** Grounded recovery policy carried into the target's fall metadata. */
  downRecover?: boolean;
  downRecoverTime?: number;
  /** Supported fall envshake fields carried into target get-hit metadata. */
  fallEnvShakeTime?: number;
  fallEnvShakeFrequency?: number;
  fallEnvShakeAmplitude?: number;
  fallEnvShakePhase?: number;
  fallEnvShakeMultiplier?: number;
  fallEnvShakeDirection?: number;
  airJuggle?: number;
  damage?: number;
  guardDamage?: number;
  /** Authored point metadata exposed by the later contact GetHitVar payload. */
  dizzyPoints?: number;
  guardPoints?: number;
  hitPower?: number;
  guardPower?: number;
  /** Selected Projectile attacker hit/guard power replacement from getpower. */
  getPower?: MugenHitDefExpressionPair;
  /** Hit and guard redlife metadata exposed by the later contact GetHitVar payload. */
  redLife?: number;
  guardRedLife?: number;
  /** Hit and guard score metadata exposed without moving score resources. */
  score?: number;
  guardScore?: number;
  /** HitDef `numhits` metadata, separate from Projectile `projhits` capacity. */
  hitDefHitCount?: number;
  /** Nested HitDef priority, separate from Projectile `projpriority`. */
  hitPriority?: number;
  hitPriorityType?: "hit" | "miss" | "dodge";
  /** Ikemen ModifyProjectile mutates only the defender's HitDef sprite priority. */
  p2SpritePriority?: number;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  /** Ikemen ModifyProjectile replacement for accepted-hit target facing. */
  p2Facing?: number;
  /** Ikemen target-distance replacement; omitted components become zero. */
  minDistance?: MugenHitDefVector;
  maxDistance?: MugenHitDefVector;
  /** Ikemen ModifyProjectile airborne get-hit duration. */
  airHitTime?: number;
  /** Ikemen ModifyProjectile fall admission flags. */
  groundFall?: boolean;
  airFall?: boolean;
  downBounce?: boolean;
  /** Ikemen ModifyProjectile grounded get-hit duration. */
  hitStun?: number;
  /** Ikemen two-value Projectile-local and defender pause replacement. */
  pauseTime?: [number, number];
  /** Ikemen two-value guarded Projectile-local and defender pause replacement. */
  guardPauseTime?: [number, number];
  /** Ikemen live Projectile guard-distance width/height/depth replacement. */
  guardDistanceBounds?: MugenProjectileGuardDistanceBounds;
  /** Selected live Projectile hit/guard spark presentation replacement. */
  hitSpark?: string;
  hitSparkAngle?: number;
  guardSpark?: string;
  guardSparkAngle?: number;
  sparkXy?: [number, number];
  /** Ikemen ModifyProjectile unguarded grounded slide duration. */
  groundSlideTime?: number;
  /** Ikemen ModifyProjectile guarded get-hit duration. */
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
  /** Ikemen ModifyProjectile lying-state get-hit duration. */
  downHitTime?: number;
  /** Ikemen ModifyProjectile component-wise grounded velocity replacement; omitted components preserve live values. */
  groundVelocity?: MugenPartialHitDefVector;
  /** Dynamic/mixed ModifyProjectile ground.velocity expressions evaluated in the root caller context. */
  groundVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed ModifyProjectile ground.velocity Z component. */
  groundVelocityZExpression?: number | string;
  /** Ikemen ModifyProjectile replacement for the selected HitDef down velocity. */
  downVelocity?: MugenHitDefVector;
  /** Dynamic/mixed ModifyProjectile down.velocity expressions evaluated in the root caller context. */
  downVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed ModifyProjectile down.velocity Z component. */
  downVelocityZExpression?: number | string;
  /** Ikemen ModifyProjectile replacement for the selected HitDef air velocity. */
  airVelocity?: MugenHitDefVector;
  /** Dynamic/mixed ModifyProjectile air.velocity expressions evaluated in the root caller context. */
  airVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed ModifyProjectile air.velocity Z component. */
  airVelocityZExpression?: number | string;
  /** Ikemen ModifyProjectile replacement for ground and air guard velocity. */
  guardVelocity?: MugenHitDefVector;
  /** Dynamic/mixed ModifyProjectile guard.velocity expressions evaluated in the root caller context. */
  guardVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed ModifyProjectile guard.velocity Z component. */
  guardVelocityZExpression?: number | string;
  airGuardVelocity?: MugenHitDefVector;
  /** Dynamic/mixed ModifyProjectile airguard.velocity expressions evaluated in the root caller context. */
  airGuardVelocityExpressions?: MugenHitDefExpressionPair;
  /** Dynamic/mixed ModifyProjectile airguard.velocity Z component. */
  airGuardVelocityZExpression?: number | string;
  /** Ikemen ModifyProjectile replacement for contact GetHitVar acceleration metadata. */
  xAccel?: number;
  yAccel?: number;
  zAccel?: number;
  /** Ikemen-GO ModifyProjectile contact EnvShake replacement fields. */
  envShakeTime?: number;
  envShakeFrequency?: number;
  envShakeAmplitude?: number;
  envShakePhase?: number;
  envShakeMultiplier?: number;
  envShakeDirection?: number;
  missOnOverride?: boolean;
  /** Static target collision group used by the selected Projectile HitDef. */
  p2ClsnCheck?: MugenCollisionBoxType;
  /** Static target collision group required before Projectile contact. */
  p2ClsnRequire?: MugenCollisionBoxType;
  /** Ikemen ModifyProjectile replaces both nested HitDef depth bounds. */
  attackDepth?: [number, number];
  attr?: string;
  guardFlag?: string;
  hitFlag?: string;
  velocity?: MugenProjectileVector;
  removalVelocity?: MugenProjectileVector;
  acceleration?: MugenProjectileVector;
  velocityMultiplier?: MugenProjectileVector;
  scale?: [number, number];
  angle?: number;
  xAngle?: number;
  yAngle?: number;
  xShear?: number;
  shadow?: MugenProjectileShadow;
  reflection?: number;
  projection?: MugenProjectileProjection;
  focalLength?: number;
  window?: MugenProjectileWindow;
  clsnScale?: [number, number];
  clsnAngle?: number;
  edgeBound?: number;
  stageBound?: number;
  depthBound?: number;
  heightBound?: { low: number; high: number };
  removeTime?: number;
  layerNo?: -1 | 0 | 1;
  spritePriority?: number;
  priority?: number;
  hitCount?: number;
  missTime?: number;
  pauseMoveTime?: number;
  superMoveTime?: number;
  removeOnHit?: boolean;
};

export type HelperControllerOp = {
  kind: "helper";
  helperId?: number;
  helperType?: 1 | 2;
  name?: string;
  stateNo?: number;
  animNo?: number;
  keyCtrl?: boolean;
  standby?: boolean;
  standbyExpression?: string;
  ownProjectile?: boolean;
  ownProjectileExpression?: string;
  inheritJuggle?: 0 | 1 | 2;
  inheritJuggleExpression?: string;
  ownPalette?: boolean;
  ownPaletteExpression?: string;
  preserve?: boolean;
  preserveExpression?: string;
  ownClsnScale?: boolean;
  ownClsnScaleExpression?: string;
  clsnProxy?: boolean;
  clsnProxyExpression?: string;
  pos?: MugenProjectileVector;
  velocity?: [number, number];
  scale?: [number, number];
  postype?: string;
  facing?: number;
  removeTime: number;
  ignoreHitPause: boolean;
  pauseMoveTime?: number;
  superMoveTime?: number;
  spritePriority: number;
};

export type HelperBindControllerOp = {
  kind: "helper-bind";
  controllerType: "bindtoparent" | "bindtoroot";
  pos: [number, number];
  time: number;
  facing?: number;
};

export type ExplodControllerOp = {
  kind: "explod";
  explodId?: number;
  animNo?: number;
  pos?: [number, number];
  postype?: string;
  bindTime?: number;
  scale?: [number, number];
  velocity?: [number, number];
  acceleration?: [number, number];
  facing?: number;
  removeTime?: number;
  removeOnGetHit: boolean;
  ignoreHitPause: boolean;
  pauseMoveTime?: number;
  superMoveTime?: number;
  spritePriority: number;
  trans?: string;
};

export type RemoveExplodControllerOp = {
  kind: "removeexplod";
  explodId?: number;
};

export type ModifyExplodControllerOp = {
  kind: "modifyexplod";
  explodId?: number;
  bindTime?: number;
  scale?: [number, number];
  velocity?: [number, number];
  acceleration?: [number, number];
  facing?: number;
  removeTime?: number;
  removeOnGetHit?: boolean;
  ignoreHitPause?: boolean;
  pauseMoveTime?: number;
  superMoveTime?: number;
  spritePriority?: number;
  trans?: string;
};

export type HitFallControllerOp =
  | {
      kind: "hitfall";
      controllerType: "hitfallvel" | "hitfalldamage";
    }
  | {
      kind: "hitfall";
      controllerType: "hitfallset";
      falling?: boolean;
      xVelocity?: number;
      yVelocity?: number;
      zVelocity?: number;
    };

export type FallEnvShakeControllerOp = {
  kind: "fallenvshake";
};

export type EnvShakeControllerOp = {
  kind: "envshake";
  time: number;
  freq: number;
  ampl: number;
  phase: number;
};

export type EnvColorControllerOp = {
  kind: "envcolor";
  color: [number, number, number];
  time: number;
  under: boolean;
};

export type MovementKinematicControllerOp = {
  kind: "kinematic";
  controllerType: "velset" | "veladd" | "velmul" | "hitvelset" | "posset" | "posadd";
  x?: number;
  y?: number;
  z?: number;
};

export type GravityKinematicControllerOp = {
  kind: "kinematic";
  controllerType: "gravity";
  y: number;
};

export type KinematicControllerOp = MovementKinematicControllerOp | GravityKinematicControllerOp;

export type BoundsControllerOp =
  | {
      kind: "bounds";
      controllerType: "posfreeze";
      x: boolean;
      y: boolean;
      z?: boolean;
      redirectPlayerIdExpression?: string;
    }
  | {
      kind: "bounds";
      controllerType: "screenbound";
      bound: boolean;
      moveCameraX: boolean;
      moveCameraY: boolean;
      stageBound?: boolean;
      redirectPlayerIdExpression?: string;
    };

export type CollisionControllerOp =
  | {
      kind: "collision";
      controllerType: "width";
      front: number;
      back: number;
      mode?: "edge" | "value";
      edgeFront?: number;
      edgeBack?: number;
      redirectPlayerIdExpression?: string;
    }
    | {
        kind: "collision";
        controllerType: "height";
      top: number;
      bottom: number;
        redirectPlayerIdExpression?: string;
      }
    | {
        kind: "collision";
        controllerType: "overrideclsn";
        group: 0 | 1 | 2 | 3;
        index: number;
        rect: [number, number, number, number];
        redirectPlayerIdExpression?: string;
      }
  | {
      kind: "collision";
      controllerType: "playerpush";
      enabled?: boolean;
      priority?: number;
      affectTeam?: -1 | 0 | 1;
      redirectPlayerIdExpression?: string;
    }
  | {
      kind: "collision";
      controllerType: "depth";
      mode: "player" | "edge" | "value";
      top: number;
      bottom: number;
      redirectPlayerIdExpression?: string;
    };

export type CollisionTransformControllerOp = {
  kind: "collision-transform";
  controllerType: "transformclsn";
  scale?: [number, number];
  angle?: number;
  redirectPlayerIdExpression?: string;
};

export type MetadataControllerOp = {
  kind: "metadata";
  controllerType: "statetypeset";
  stateType?: "S" | "C" | "A" | "L";
  moveType?: "I" | "A" | "H";
  physics?: "S" | "C" | "A" | "N";
};

export type OrientationControllerOp = {
  kind: "orientation";
  controllerType: "turn";
};

export type SpriteEffectControllerOp =
  | {
      kind: "sprite-effect";
      controllerType: "sprpriority";
      priority: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "palfx";
      time: number;
      add: [number, number, number];
      mul: [number, number, number];
      color: number;
      invert: boolean;
    }
  | {
      kind: "sprite-effect";
      controllerType: "remappal";
      source: [number, number];
      dest: [number, number];
    }
  | {
      kind: "sprite-effect";
      controllerType: "afterimage";
      time: number;
      length: number;
      timeGap: number;
      frameGap: number;
      palAdd: [number, number, number];
      palMul: [number, number, number];
      opacity: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "afterimagetime";
      time: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "trans";
      trans: string;
      opacity: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "angleset";
      angle: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "angleadd";
      delta: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "anglemul";
      multiplier: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "angledraw";
      angle?: number;
      scale?: [number, number];
    };

type RedirectableResourceControllerOp = {
  redirectPlayerIdExpression?: string;
};

type RedirectableTargetControllerOp = {
  redirectPlayerIdExpression?: string;
};

export type ResourceControllerOp =
  | ({ kind: "resource"; controllerType: "ctrlset"; value: boolean } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "lifeadd"; value: number; kill?: boolean } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "lifeset"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "guardpointsadd"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "guardpointsset"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "dizzypointsadd"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "dizzypointsset"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "redlifeadd"; value: number; absolute?: boolean } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "redlifeset"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "poweradd"; value: number } & RedirectableResourceControllerOp)
  | ({ kind: "resource"; controllerType: "powerset"; value: number } & RedirectableResourceControllerOp);

export type VariableControllerOp =
  | {
      kind: "variable";
      controllerType: "varset";
      variableType: "var" | "fvar" | "sysvar";
      index: number;
      value: number;
    }
  | {
      kind: "variable";
      controllerType: "varadd";
      variableType: "var" | "fvar" | "sysvar";
      index: number;
      value: number;
    }
  | {
      kind: "variable";
      controllerType: "varrandom";
      variableType: "var";
      index: number;
      min: number;
      max: number;
    }
  | {
      kind: "variable";
      controllerType: "varrangeset";
      variableType: "var" | "fvar";
      first: number;
      last: number;
      value: number;
    };

export type HitEligibilityControllerOp = {
  kind: "eligibility";
  controllerType: "hitby" | "nothitby";
  mode: "allow" | "deny";
  slots: Array<{ slot: 1 | 2; attr: string; remaining: number }>;
  redirectPlayerIdExpression?: string;
};

export type HitOverrideControllerOp = {
  kind: "hitoverride";
  slot: number;
  attr: string;
  remaining: number;
  stateNo?: number;
  guardFlag?: string;
  guardFlagNot?: string;
  forceAir: boolean;
  forceGuard: boolean;
  keepState: boolean;
  redirectPlayerIdExpression?: string;
};

export type ReversalDefControllerOp = {
  kind: "reversaldef";
  attr: string;
  reversalGuardFlag?: string;
  reversalGuardFlagNot?: string;
  hitDefAttr?: string;
  guardFlag?: string;
  missOnOverride?: boolean;
  hitPause: number;
  hitCount?: number;
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  p2Facing?: number;
  targetId?: number;
  attackDepth?: [number, number];
  unhittableTime?: MugenHitDefExpressionPair;
  redirectPlayerIdExpression?: string;
};

export type DamageScaleControllerOp = {
  kind: "damage-scale";
  controllerType: "attackmulset" | "defencemulset";
  multiplier?: number;
  dizzyPointsMultiplier?: number;
};

export type ContactControllerOp =
  | { kind: "contact"; controllerType: "movehitreset" }
  | { kind: "contact"; controllerType: "hitadd"; value: number };

export type TeamStandbyControllerOp = {
  kind: "team-standby";
  controllerType: "tagin" | "tagout";
  standby: boolean;
  redirectPlayerId?: number;
  redirectPlayerIdExpression?: string;
  self: boolean;
  selfExpression?: string;
  partnerOrdinal?: number;
  partnerOrdinalExpression?: string;
  callerStateNo?: number;
  callerStateExpression?: string;
  partnerStateNo?: number;
  partnerStateExpression?: string;
  callerControl?: boolean;
  callerControlExpression?: string;
  partnerControl?: boolean;
  partnerControlExpression?: string;
  memberPosition?: number;
  memberPositionExpression?: string;
  leaderPlayerNo?: number;
  leaderPlayerNoExpression?: string;
};

export type ControllerOp =
  | HitDefControllerOp
  | ModifyHitDefControllerOp
  | ModifyReversalDefControllerOp
  | TargetControllerOp
  | BindToTargetControllerOp
  | PauseControllerOp
  | AudioControllerOp
  | NoopControllerOp
  | AssertSpecialControllerOp
  | ProjectileControllerOp
  | ModifyProjectileControllerOp
  | HelperControllerOp
  | HelperBindControllerOp
  | ExplodControllerOp
  | RemoveExplodControllerOp
  | ModifyExplodControllerOp
  | HitFallControllerOp
  | FallEnvShakeControllerOp
  | EnvShakeControllerOp
  | EnvColorControllerOp
  | KinematicControllerOp
  | BoundsControllerOp
  | CollisionControllerOp
  | CollisionTransformControllerOp
  | MetadataControllerOp
  | OrientationControllerOp
  | SpriteEffectControllerOp
  | ResourceControllerOp
  | VariableControllerOp
  | HitEligibilityControllerOp
  | HitOverrideControllerOp
  | ReversalDefControllerOp
  | DamageScaleControllerOp
  | ContactControllerOp
  | TeamStandbyControllerOp;

export function compileControllerOp(controller: MugenStateController, context: ControllerCompileContext = {}): ControllerOp | undefined {
  const type = controller.type.toLowerCase();
  if (isKinematicController(type)) {
    return compileKinematicControllerOp(controller, type);
  }
  if (type === "posfreeze" || type === "screenbound") {
    return compileBoundsControllerOp(controller, type);
  }
  if (type === "width") {
    return compileWidthControllerOp(controller);
  }
  if (type === "height") {
    return compileHeightControllerOp(controller);
  }
  if (type === "overrideclsn") {
    return compileOverrideClsnControllerOp(controller);
  }
  if (type === "transformclsn") {
    return compileTransformClsnControllerOp(controller);
  }
  if (type === "depth") {
    return compileDepthControllerOp(controller);
  }
  if (type === "playerpush") {
    return compilePlayerPushControllerOp(controller);
  }
  if (type === "statetypeset") {
    return compileStateTypeSetControllerOp(controller);
  }
  if (type === "turn") {
    return { kind: "orientation", controllerType: "turn" };
  }
  if (type === "tagin" || type === "tagout") {
    return compileTeamStandbyControllerOp(controller, type);
  }
  if (type === "sprpriority") {
    return compileSprPriorityControllerOp(controller);
  }
  if (type === "palfx") {
    return compilePalFxControllerOp(controller);
  }
  if (type === "remappal") {
    return compileRemapPalControllerOp(controller);
  }
  if (type === "afterimage") {
    return compileAfterImageControllerOp(controller);
  }
  if (type === "afterimagetime") {
    return compileAfterImageTimeControllerOp(controller);
  }
  if (type === "trans") {
    return compileTransControllerOp(controller);
  }
  if (type === "angleset") {
    return compileAngleSetControllerOp(controller);
  }
  if (type === "angleadd") {
    return compileAngleAddControllerOp(controller);
  }
  if (type === "anglemul") {
    return compileAngleMulControllerOp(controller);
  }
  if (type === "angledraw") {
    return compileAngleDrawControllerOp(controller);
  }
  if (isResourceController(type)) {
    return compileResourceControllerOp(controller, type);
  }
  if (isVariableController(type)) {
    return compileVariableControllerOp(controller, type);
  }
  if (type === "hitby" || type === "nothitby") {
    return compileHitEligibilityControllerOp(controller, type);
  }
  if (type === "hitoverride") {
    return compileHitOverrideControllerOp(controller);
  }
  if (type === "reversaldef") {
    return compileReversalDefControllerOp(controller);
  }
  if (type === "modifyreversaldef") {
    return compileModifyReversalDefControllerOp(controller);
  }
  if (type === "attackmulset" || type === "defencemulset") {
    return compileDamageScaleControllerOp(controller, type);
  }
  if (type === "movehitreset") {
    return { kind: "contact", controllerType: "movehitreset" };
  }
  if (type === "hitadd") {
    return compileHitAddControllerOp(controller);
  }
  if (type === "hitdef") {
    return compileHitDefControllerOp(controller, context);
  }
  if (type === "modifyhitdef") {
    return compileModifyHitDefControllerOp(controller);
  }
  if (type.startsWith("target")) {
    return compileTargetControllerOp(controller);
  }
  if (type === "bindtotarget") {
    return compileBindToTargetControllerOp(controller);
  }
  if (type === "pause" || type === "superpause") {
    return compilePauseControllerOp(controller, type);
  }
  if (type === "playsnd" || type === "stopsnd" || type === "sndpan") {
    return compileAudioControllerOp(controller, type);
  }
  if (isNoopController(type)) {
    return { kind: "noop", controllerType: type };
  }
  if (type === "assertspecial") {
    return compileAssertSpecialControllerOp(controller);
  }
  if (type === "projectile") {
    return compileProjectileControllerOp(controller);
  }
  if (type === "modifyprojectile") {
    return compileModifyProjectileControllerOp(controller);
  }
  if (type === "helper") {
    return compileHelperControllerOp(controller);
  }
  if (type === "bindtoparent" || type === "bindtoroot") {
    return compileHelperBindControllerOp(controller, type);
  }
  if (type === "explod") {
    return compileExplodControllerOp(controller);
  }
  if (type === "removeexplod") {
    return compileRemoveExplodControllerOp(controller);
  }
  if (type === "modifyexplod") {
    return compileModifyExplodControllerOp(controller);
  }
  if (type === "hitfallvel" || type === "hitfalldamage" || type === "hitfallset") {
    return compileHitFallControllerOp(controller, type);
  }
  if (type === "fallenvshake") {
    return { kind: "fallenvshake" };
  }
  if (type === "envshake") {
    return compileEnvShakeControllerOp(controller);
  }
  if (type === "envcolor") {
    return compileEnvColorControllerOp(controller);
  }
  return undefined;
}

function compileTeamStandbyControllerOp(
  controller: MugenStateController,
  type: "tagin" | "tagout",
): TeamStandbyControllerOp | undefined {
  const keys = Object.keys(controller.params).map((key) => key.toLowerCase());
  if (
    keys.some(
      (key) =>
        key !== "type" &&
        key !== "redirectid" &&
        key !== "self" &&
        key !== "partner" &&
        key !== "stateno" &&
        key !== "partnerstateno" &&
        key !== "ctrl" &&
        key !== "partnerctrl" &&
        key !== "memberno" &&
        key !== "leader",
    )
  ) {
    return undefined;
  }
  const redirectPlayerIdRaw = findParam(controller, "redirectid");
  const partnerRaw = findParam(controller, "partner");
  const callerStateRaw = findParam(controller, "stateno");
  const partnerStateRaw = findParam(controller, "partnerstateno");
  const callerControlRaw = findParam(controller, "ctrl");
  const partnerControlRaw = findParam(controller, "partnerctrl");
  const memberPositionRaw = findParam(controller, "memberno");
  const leaderPlayerNoRaw = findParam(controller, "leader");
  if (type !== "tagin" && (callerControlRaw !== undefined || partnerControlRaw !== undefined)) {
    return undefined;
  }
  if (type !== "tagin" && leaderPlayerNoRaw !== undefined) return undefined;
  if ((partnerStateRaw !== undefined || partnerControlRaw !== undefined) && partnerRaw === undefined) {
    return undefined;
  }
  let redirectPlayerIdExpression: string | undefined;
  if (redirectPlayerIdRaw !== undefined) {
    if (!hasValidScalarExpressionStructure(redirectPlayerIdRaw)) return undefined;
    const compiledRedirectPlayerId = compileExpression(redirectPlayerIdRaw);
    if (compiledRedirectPlayerId.supportLevel === "unsupported") return undefined;
    redirectPlayerIdExpression = compiledRedirectPlayerId.normalized;
  }
  let partnerOrdinal: number | undefined;
  let partnerOrdinalExpression: string | undefined;
  if (partnerRaw !== undefined) {
    const normalizedPartner = partnerRaw.trim();
    partnerOrdinal = normalizedPartner ? Number(normalizedPartner) : undefined;
    if (partnerOrdinal === undefined || !Number.isInteger(partnerOrdinal) || partnerOrdinal < 0) {
      if (!hasValidScalarExpressionStructure(partnerRaw)) return undefined;
      const compiledPartnerOrdinal = compileExpression(partnerRaw);
      if (compiledPartnerOrdinal.supportLevel === "unsupported") return undefined;
      partnerOrdinal = undefined;
      partnerOrdinalExpression = compiledPartnerOrdinal.normalized;
    }
  }
  const selfRaw = findParam(controller, "self");
  let self = partnerRaw === undefined;
  let selfExpression: string | undefined;
  if (selfRaw !== undefined) {
    const selfValue = Number(selfRaw.trim());
    if (selfValue === 0 || selfValue === 1) {
      self = selfValue === 1;
    } else {
      if (!hasValidScalarExpressionStructure(selfRaw)) return undefined;
      const compiledSelf = compileExpression(selfRaw);
      if (compiledSelf.supportLevel === "unsupported") return undefined;
      self = false;
      selfExpression = compiledSelf.normalized;
    }
  }
  let callerControl = parseStaticTagBoolean(callerControlRaw);
  let callerControlExpression: string | undefined;
  if (callerControlRaw !== undefined && callerControl === undefined) {
    if (!hasValidScalarExpressionStructure(callerControlRaw)) return undefined;
    const compiledControl = compileExpression(callerControlRaw);
    if (compiledControl.supportLevel === "unsupported") return undefined;
    callerControl = false;
    callerControlExpression = compiledControl.normalized;
  }
  let partnerControl = parseStaticTagBoolean(partnerControlRaw);
  let partnerControlExpression: string | undefined;
  if (partnerControlRaw !== undefined && partnerControl === undefined) {
    if (!hasValidScalarExpressionStructure(partnerControlRaw)) return undefined;
    const compiledPartnerControl = compileExpression(partnerControlRaw);
    if (compiledPartnerControl.supportLevel === "unsupported") return undefined;
    partnerControl = false;
    partnerControlExpression = compiledPartnerControl.normalized;
  }
  if (selfRaw === undefined && callerControl !== undefined) {
    self = true;
  }
  let callerStateNo: number | undefined;
  let callerStateExpression: string | undefined;
  if (callerStateRaw !== undefined) {
    callerStateNo = Number(callerStateRaw.trim());
    if (!Number.isInteger(callerStateNo) || callerStateNo < 0) {
      if (!hasValidScalarExpressionStructure(callerStateRaw)) return undefined;
      const compiledCallerState = compileExpression(callerStateRaw);
      if (compiledCallerState.supportLevel === "unsupported") return undefined;
      callerStateNo = undefined;
      callerStateExpression = compiledCallerState.normalized;
    }
  }
  let partnerStateNo: number | undefined;
  let partnerStateExpression: string | undefined;
  if (partnerStateRaw !== undefined) {
    partnerStateNo = Number(partnerStateRaw.trim());
    if (!Number.isInteger(partnerStateNo) || partnerStateNo < 0) {
      if (!hasValidScalarExpressionStructure(partnerStateRaw)) return undefined;
      const compiledPartnerState = compileExpression(partnerStateRaw);
      if (compiledPartnerState.supportLevel === "unsupported") return undefined;
      partnerStateNo = undefined;
      partnerStateExpression = compiledPartnerState.normalized;
    }
  }
  let memberPosition: number | undefined;
  let memberPositionExpression: string | undefined;
  if (memberPositionRaw !== undefined) {
    const normalizedMemberPosition = memberPositionRaw.trim();
    memberPosition = normalizedMemberPosition ? Number(normalizedMemberPosition) : undefined;
    if (memberPosition === undefined || !Number.isInteger(memberPosition) || memberPosition < 1) {
      if (!hasValidScalarExpressionStructure(memberPositionRaw)) return undefined;
      const compiledMemberPosition = compileExpression(memberPositionRaw);
      if (compiledMemberPosition.supportLevel === "unsupported") return undefined;
      memberPosition = undefined;
      memberPositionExpression = compiledMemberPosition.normalized;
    }
  }
  let leaderPlayerNo: number | undefined;
  let leaderPlayerNoExpression: string | undefined;
  if (leaderPlayerNoRaw !== undefined) {
    const normalizedLeaderPlayerNo = leaderPlayerNoRaw.trim();
    leaderPlayerNo = normalizedLeaderPlayerNo ? Number(normalizedLeaderPlayerNo) : undefined;
    if (leaderPlayerNo === undefined || !Number.isInteger(leaderPlayerNo) || leaderPlayerNo < 1) {
      if (!hasValidScalarExpressionStructure(leaderPlayerNoRaw)) return undefined;
      const compiledLeaderPlayerNo = compileExpression(leaderPlayerNoRaw);
      if (compiledLeaderPlayerNo.supportLevel === "unsupported") return undefined;
      leaderPlayerNo = undefined;
      leaderPlayerNoExpression = compiledLeaderPlayerNo.normalized;
    }
  }
  return {
    kind: "team-standby",
    controllerType: type,
    standby: type === "tagout",
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    self,
    ...(selfExpression === undefined ? {} : { selfExpression }),
    ...(partnerOrdinal === undefined ? {} : { partnerOrdinal }),
    ...(partnerOrdinalExpression === undefined ? {} : { partnerOrdinalExpression }),
    ...(callerStateNo === undefined ? {} : { callerStateNo }),
    ...(callerStateExpression === undefined ? {} : { callerStateExpression }),
    ...(partnerStateNo === undefined ? {} : { partnerStateNo }),
    ...(partnerStateExpression === undefined ? {} : { partnerStateExpression }),
    ...(callerControl === undefined ? {} : { callerControl }),
    ...(callerControlExpression === undefined ? {} : { callerControlExpression }),
    ...(partnerControl === undefined ? {} : { partnerControl }),
    ...(partnerControlExpression === undefined ? {} : { partnerControlExpression }),
    ...(memberPosition === undefined ? {} : { memberPosition }),
    ...(memberPositionExpression === undefined ? {} : { memberPositionExpression }),
    ...(leaderPlayerNo === undefined ? {} : { leaderPlayerNo }),
    ...(leaderPlayerNoExpression === undefined ? {} : { leaderPlayerNoExpression }),
  };
}

function hasValidScalarExpressionStructure(raw: string): boolean {
  const expression = raw.trim();
  if (!expression) return false;
  let depth = 0;
  for (const character of expression) {
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth < 0) return false;
    }
    if (character === "," && depth === 0) return false;
  }
  return depth === 0;
}

function parseStaticTagBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = Number(raw.trim());
  return value === 0 || value === 1 ? value === 1 : undefined;
}

function isKinematicController(type: string): type is KinematicControllerOp["controllerType"] {
  return (
    type === "velset" ||
    type === "veladd" ||
    type === "velmul" ||
    type === "hitvelset" ||
    type === "posset" ||
    type === "posadd" ||
    type === "gravity"
  );
}

function compileKinematicControllerOp(controller: MugenStateController, type: KinematicControllerOp["controllerType"]): KinematicControllerOp | undefined {
  if (type === "gravity") {
    return { kind: "kinematic", controllerType: "gravity", y: 0.55 };
  }
  const pair = strictNumberPair(findParam(controller, "value"));
  const supportsZ = true;
  const op = definedObject({
    kind: "kinematic" as const,
    controllerType: type,
    x: firstNumber(findParam(controller, "x")) ?? pair?.[0],
    y: firstNumber(findParam(controller, "y")) ?? pair?.[1],
    z: supportsZ ? firstNumber(findParam(controller, "z")) : undefined,
  });
  return op.x === undefined && op.y === undefined && op.z === undefined ? undefined : op;
}

function compileBoundsControllerOp(controller: MugenStateController, type: BoundsControllerOp["controllerType"]): BoundsControllerOp | undefined {
  if (type === "posfreeze") {
    const valueRaw = findParam(controller, "value");
    const xRaw = findParam(controller, "x");
    const yRaw = findParam(controller, "y");
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    const value = optionalBooleanParam(valueRaw);
    const x = optionalBooleanParam(xRaw);
    const y = optionalBooleanParam(yRaw);
    if (value === "invalid" || x === "invalid" || y === "invalid" || redirectPlayerIdExpression === "invalid") {
      return undefined;
    }
    const freeze = value === undefined ? x === undefined && y === undefined : value;
    return {
      kind: "bounds",
      controllerType: "posfreeze",
      x: value === undefined ? x ?? freeze : freeze,
      y: value === undefined ? y ?? freeze : freeze,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }

  const valueRaw = findParam(controller, "value");
  const moveCameraRaw = findParam(controller, "movecamera");
  const stageBoundRaw = findParam(controller, "stagebound");
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  const value = valueRaw === undefined ? 0 : firstNumber(valueRaw);
  const moveCamera = moveCameraRaw === undefined ? undefined : strictNumberPair(moveCameraRaw);
  const stageBound = optionalBooleanParam(stageBoundRaw);
  if (
    value === undefined ||
    (moveCameraRaw !== undefined && moveCamera === undefined) ||
    stageBound === "invalid" ||
    redirectPlayerIdExpression === "invalid"
  ) {
    return undefined;
  }
  return {
    kind: "bounds",
    controllerType: "screenbound",
    bound: value !== 0,
    moveCameraX: (moveCamera?.[0] ?? 0) !== 0,
    moveCameraY: (moveCamera?.[1] ?? 0) !== 0,
    ...(stageBound === undefined ? {} : { stageBound }),
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compileWidthControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const edgeRaw = findParam(controller, "edge");
  const playerRaw = findParam(controller, "player");
  const valueRaw = findParam(controller, "value");
  const edge = edgeRaw === undefined ? undefined : strictNumberPair(edgeRaw);
  const player = playerRaw === undefined ? undefined : strictNumberPair(playerRaw);
  const value = edgeRaw === undefined && playerRaw === undefined
    ? strictNumberPair(valueRaw)
    : undefined;
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (
    (edgeRaw !== undefined && !edge) ||
    (playerRaw !== undefined && !player) ||
    (edgeRaw === undefined && playerRaw === undefined && !value) ||
    redirectPlayerIdExpression === "invalid"
  ) {
    return undefined;
  }
  const body = player ?? value;
  const edgePair = edge ?? value;
  const pair = body ?? edgePair!;
  return {
    kind: "collision",
    controllerType: "width",
    front: body ? clampStaticBodyWidth(pair[0]) : pair[0],
    back: body ? clampStaticBodyWidth(pair[1] ?? pair[0]) : pair[1] ?? pair[0],
    ...(body === undefined ? { mode: "edge" as const } : value ? { mode: "value" as const } : {}),
    ...(edgePair && body
      ? { edgeFront: edgePair[0], edgeBack: edgePair[1] ?? edgePair[0] }
      : {}),
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compileHeightControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const pair = strictNumberPair(findParam(controller, "value"));
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (!pair || redirectPlayerIdExpression === "invalid") return undefined;
  return {
    kind: "collision",
    controllerType: "height",
    top: pair[0],
    bottom: pair[1] ?? 0,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compileOverrideClsnControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const group = parseCollisionGroup(findParam(controller, "group"));
  const indexRaw = findParam(controller, "index");
  const index = indexRaw === undefined ? 0 : firstNumber(indexRaw);
  const rectRaw = findParam(controller, "rect");
  const rectValues = rectRaw === undefined ? [0] : rectRaw.split(",").map((part) => Number(part.trim()));
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (
    group === undefined || index === undefined || redirectPlayerIdExpression === "invalid" ||
    rectValues.length < 1 || rectValues.length > 4 || rectValues.some((value) => !Number.isFinite(value))
  ) return undefined;
  const [rawX1 = 0, rawY1 = 0, rawX2 = 0, rawY2 = 0] = rectValues;
  return {
    kind: "collision",
    controllerType: "overrideclsn",
    group,
    index: Math.trunc(index),
    rect: [Math.min(rawX1, rawX2), Math.min(rawY1, rawY2), Math.max(rawX1, rawX2), Math.max(rawY1, rawY2)],
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compileTransformClsnControllerOp(controller: MugenStateController): CollisionTransformControllerOp | undefined {
  const scale = strictNumberPair(findParam(controller, "scale"));
  const angleRaw = findParam(controller, "angle");
  const angle = angleRaw === undefined ? undefined : strictNumberSingle(angleRaw);
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if ((!scale && angle === undefined) || (angleRaw !== undefined && angle === undefined) || redirectPlayerIdExpression === "invalid") {
    return undefined;
  }
  return {
    kind: "collision-transform",
    controllerType: "transformclsn",
    ...(scale ? { scale: [scale[0], scale[1] ?? 1] as [number, number] } : {}),
    ...(angle === undefined ? {} : { angle }),
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function parseCollisionGroup(raw: string | undefined): 0 | 1 | 2 | 3 | undefined {
  const token = raw?.trim().toLowerCase();
  if (token === "none") return 0;
  if (token === "clsn1") return 1;
  if (token === "clsn2") return 2;
  if (token === "size") return 3;
  return undefined;
}

function compileDepthControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const mode =
    findParam(controller, "edge") !== undefined
      ? "edge"
      : findParam(controller, "player") !== undefined
        ? "player"
        : "value";
  const pair = strictNumberPair(findParam(controller, mode));
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (!pair || redirectPlayerIdExpression === "invalid") return undefined;
  return {
    kind: "collision",
    controllerType: "depth",
    mode,
    top: pair[0],
    bottom: pair[1] ?? 0,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compileRedirectPlayerIdExpression(controller: MugenStateController): string | "invalid" | undefined {
  const raw = findParam(controller, "redirectid");
  if (raw === undefined) return undefined;
  if (!hasValidScalarExpressionStructure(raw)) return "invalid";
  const compiled = compileExpression(raw);
  return compiled.supportLevel === "unsupported" ? "invalid" : compiled.normalized;
}

function compilePlayerPushControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const raw = findParam(controller, "value");
  const priorityRaw = findParam(controller, "priority");
  const affectTeamRaw = findParam(controller, "affectteam");
  const enabled = raw === undefined ? undefined : booleanNumber(raw);
  const priority = priorityRaw === undefined ? undefined : firstNumber(priorityRaw);
  const affectTeam = parsePlayerPushAffectTeam(affectTeamRaw);
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (
    enabled === undefined && raw !== undefined ||
    priority === undefined && priorityRaw !== undefined ||
    affectTeam === "invalid" ||
    redirectPlayerIdExpression === "invalid"
  ) return undefined;
  const hasIkemenPayload = raw !== undefined || priorityRaw !== undefined || affectTeamRaw !== undefined;
  return {
    kind: "collision",
    controllerType: "playerpush",
    ...(hasIkemenPayload ? {} : { enabled: true }),
    ...(enabled === undefined ? {} : { enabled }),
    ...(priority === undefined ? {} : { priority: Math.trunc(priority) }),
    ...(affectTeam === undefined ? {} : { affectTeam }),
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function parsePlayerPushAffectTeam(raw: string | undefined): -1 | 0 | 1 | "invalid" | undefined {
  if (raw === undefined) return undefined;
  const token = raw.trim().toLowerCase()[0];
  if (token === "e") return 1;
  if (token === "f") return -1;
  if (token === "b") return 0;
  return "invalid";
}

function compileStateTypeSetControllerOp(controller: MugenStateController): MetadataControllerOp | undefined {
  const stateType = normalizeStateType(findParam(controller, "statetype") ?? findParam(controller, "stateType"));
  const moveType = normalizeMoveType(findParam(controller, "movetype") ?? findParam(controller, "moveType"));
  const physics = normalizePhysics(findParam(controller, "physics"));
  if (!stateType && !moveType && !physics) {
    return undefined;
  }
  return definedObject({
    kind: "metadata" as const,
    controllerType: "statetypeset" as const,
    stateType,
    moveType,
    physics,
  });
}

function compileSprPriorityControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const priority = firstNumber(findParam(controller, "value") ?? findParam(controller, "priority"));
  if (priority === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "sprpriority",
    priority: clampSpritePriority(priority),
  };
}

function compilePalFxControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const time = firstNumber(findParam(controller, "time"));
  const add = strictNumberTripletOrDefault(findParam(controller, "add"), [0, 0, 0], -255, 255);
  const mul = strictNumberTripletOrDefault(findParam(controller, "mul"), [256, 256, 256], 0, 512);
  const color = firstNumber(findParam(controller, "color"));
  const invertRaw = findParam(controller, "invertall") ?? findParam(controller, "invert");
  const invert = booleanNumber(invertRaw);
  if (
    time === undefined ||
    add === undefined ||
    mul === undefined ||
    (findParam(controller, "color") !== undefined && color === undefined) ||
    (invertRaw !== undefined && invert === undefined)
  ) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "palfx",
    time: clampPaletteFxTime(time),
    add,
    mul,
    color: clampPaletteFxColor(color ?? 256),
    invert: invert ?? false,
  };
}

function compileRemapPalControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const source = strictNumberPairExact(findParam(controller, "source"));
  const dest = strictNumberPairExact(findParam(controller, "dest"));
  if (!source || !dest) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "remappal",
    source: [normalizePaletteNumber(source[0]), normalizePaletteNumber(source[1])],
    dest: [normalizePaletteNumber(dest[0]), normalizePaletteNumber(dest[1])],
  };
}

function compileAfterImageControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const time = staticNumberParam(controller, "time", 20);
  const length = staticNumberParam(controller, "length", 6);
  const timeGap = staticNumberParam(controller, "timegap", 1);
  const frameGap = staticNumberParam(controller, "framegap", 1);
  const palAdd = strictNumberTripletOrDefault(findParam(controller, "paladd") ?? findParam(controller, "add"), [0, 0, 0], -255, 255);
  const palMul = strictNumberTripletOrDefault(findParam(controller, "palmul") ?? findParam(controller, "mul"), [192, 192, 192], 0, 512);
  if (
    time === undefined ||
    length === undefined ||
    timeGap === undefined ||
    frameGap === undefined ||
    palAdd === undefined ||
    palMul === undefined
  ) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "afterimage",
    time: clampAfterImageTime(time),
    length: clampAfterImageLength(length),
    timeGap: clampAfterImageGap(timeGap),
    frameGap: clampAfterImageGap(frameGap),
    palAdd,
    palMul,
    opacity: normalizeAfterImageOpacity(findParam(controller, "trans")),
  };
}

function compileAfterImageTimeControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const raw = findParam(controller, "time") ?? findParam(controller, "value");
  const time = raw === undefined ? 0 : firstNumber(raw);
  if (time === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "afterimagetime",
    time: clampAfterImageTime(time),
  };
}

function compileTransControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const trans = stripMugenString(findParam(controller, "trans") ?? findParam(controller, "value")) ?? "default";
  const alphaParam = findParam(controller, "alpha");
  const alpha = strictNumberPairExact(alphaParam);
  if (alphaParam !== undefined && !alpha) {
    return undefined;
  }
  if (!alpha && hasInvalidInlineTransAlpha(trans)) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "trans",
    trans,
    opacity: normalizeTransOpacity(trans, alpha),
  };
}

function compileAngleSetControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const angle = firstNumber(findParam(controller, "value"));
  if (angle === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "angleset",
    angle: clampRenderAngle(angle),
  };
}

function compileAngleAddControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const delta = firstNumber(findParam(controller, "value"));
  if (delta === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "angleadd",
    delta: clampRenderAngle(delta),
  };
}

function compileAngleMulControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const multiplier = firstNumber(findParam(controller, "value"));
  if (multiplier === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "anglemul",
    multiplier,
  };
}

function compileAngleDrawControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const valueParam = findParam(controller, "value");
  const scaleParam = findParam(controller, "scale");
  const angle = valueParam === undefined ? undefined : firstNumber(valueParam);
  const scale = scaleParam === undefined ? undefined : strictNumberPairExact(scaleParam);
  if ((valueParam !== undefined && angle === undefined) || (scaleParam !== undefined && !scale)) {
    return undefined;
  }
  return definedObject({
    kind: "sprite-effect" as const,
    controllerType: "angledraw" as const,
    angle: angle === undefined ? undefined : clampRenderAngle(angle),
    scale: scale === undefined ? undefined : clampRenderScalePair(scale),
  });
}

function isResourceController(type: string): type is ResourceControllerOp["controllerType"] {
  return type === "ctrlset" || type === "lifeadd" || type === "lifeset" || type === "guardpointsadd" || type === "guardpointsset" || type === "dizzypointsadd" || type === "dizzypointsset" || type === "redlifeadd" || type === "redlifeset" || type === "poweradd" || type === "powerset";
}

function compileResourceControllerOp(controller: MugenStateController, type: ResourceControllerOp["controllerType"]): ResourceControllerOp | undefined {
  const value = firstNumber(findParam(controller, "value"));
  if (value === undefined) {
    return undefined;
  }
  const redirectPlayerIdExpression =
    compileRedirectPlayerIdExpression(controller);
  if (redirectPlayerIdExpression === "invalid") {
    return undefined;
  }
  const redirect = redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression };
  if (type === "ctrlset") {
    return { kind: "resource", controllerType: "ctrlset", value: value !== 0, ...redirect };
  }
  if (type === "lifeadd") {
    return definedObject({
      kind: "resource" as const,
      controllerType: "lifeadd" as const,
      value,
      kill: booleanNumber(findParam(controller, "kill")),
      ...redirect,
    });
  }
  if (type === "redlifeadd") {
    return definedObject({
      kind: "resource" as const,
      controllerType: "redlifeadd" as const,
      value,
      absolute: booleanNumber(findParam(controller, "absolute")),
      ...redirect,
    });
  }
  return type === "lifeset" || type === "poweradd" || type === "powerset"
    ? { kind: "resource", controllerType: type, value, ...redirect }
    : { kind: "resource", controllerType: type, value, ...redirect };
}

function isVariableController(type: string): type is VariableControllerOp["controllerType"] {
  return type === "varset" || type === "varadd" || type === "varrandom" || type === "varrangeset";
}

function compileVariableControllerOp(controller: MugenStateController, type: VariableControllerOp["controllerType"]): VariableControllerOp | undefined {
  if (type === "varrandom") {
    const index = firstNumber(findParam(controller, "v") ?? findParam(controller, "var"));
    const range = staticVariableRandomRange(findParam(controller, "range"));
    if (index === undefined || index < 0 || !range) {
      return undefined;
    }
    return {
      kind: "variable",
      controllerType: "varrandom",
      variableType: "var",
      index: Math.round(index),
      min: range[0],
      max: range[1],
    };
  }

  if (type === "varrangeset") {
    const isFloat = findParam(controller, "fvalue") !== undefined;
    const value = firstNumber(findParam(controller, isFloat ? "fvalue" : "value"));
    if (value === undefined) {
      return undefined;
    }
    return {
      kind: "variable",
      controllerType: "varrangeset",
      variableType: isFloat ? "fvar" : "var",
      first: Math.max(0, Math.round(firstNumber(findParam(controller, "first")) ?? 0)),
      last: Math.max(0, Math.round(firstNumber(findParam(controller, "last")) ?? (isFloat ? 39 : 59))),
      value,
    };
  }

  const assignment = staticVariableAssignmentParam(controller);
  const variableType = assignment?.variableType ?? (findParam(controller, "fv") !== undefined || findParam(controller, "fvar") !== undefined ? "fvar" : "var");
  const index = assignment?.index ?? firstNumber(findParam(controller, variableType === "fvar" ? "fv" : "v") ?? findParam(controller, variableType));
  const value = assignment?.value ?? firstNumber(findParam(controller, "value"));
  if (index === undefined || value === undefined || index < 0) {
    return undefined;
  }
  return {
    kind: "variable",
    controllerType: type,
    variableType,
    index: Math.round(index),
    value,
  };
}

function staticVariableAssignmentParam(controller: MugenStateController): { variableType: "var" | "fvar" | "sysvar"; index: number; value: number } | undefined {
  for (const [key, rawValue] of Object.entries(controller.params)) {
    const match = /^(sysvar|f?var)\((\d+)\)$/i.exec(key.trim());
    if (!match) {
      continue;
    }
    const value = firstNumber(rawValue);
    if (value === undefined) {
      continue;
    }
    return {
      variableType: match[1]?.toLowerCase() === "sysvar" ? "sysvar" : match[1]?.toLowerCase() === "fvar" ? "fvar" : "var",
      index: Number(match[2]),
      value,
    };
  }
  return undefined;
}

function staticVariableRandomRange(value: string | undefined): [number, number] | undefined {
  if (value === undefined) {
    return [0, 1000];
  }
  const values = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter(Number.isFinite);
  if (values.length === 0 || values[0] === undefined) {
    return undefined;
  }
  const first = values.length > 1 && values[1] !== undefined ? values[0] : 0;
  const second = values.length > 1 && values[1] !== undefined ? values[1] : values[0];
  return normalizeRandomRange(first, second);
}

function compileHitEligibilityControllerOp(
  controller: MugenStateController,
  type: "hitby" | "nothitby",
): HitEligibilityControllerOp | undefined {
  const remaining = staticDurationParam(controller, "time", 1);
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (remaining === undefined || redirectPlayerIdExpression === "invalid") {
    return undefined;
  }
  const value = stripMugenString(findParam(controller, "value"));
  const value2 = stripMugenString(findParam(controller, "value2"));
  const slots: HitEligibilityControllerOp["slots"] = [];
  if (value) {
    slots.push({ slot: 1, attr: value, remaining });
  }
  if (value2) {
    slots.push({ slot: 2, attr: value2, remaining });
  }
  if (slots.length === 0) {
    return undefined;
  }
  return {
    kind: "eligibility",
    controllerType: type,
    mode: type === "hitby" ? "allow" : "deny",
    slots,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compileHitOverrideControllerOp(controller: MugenStateController): HitOverrideControllerOp | undefined {
  const attr = stripMugenString(findParam(controller, "attr"));
  if (!attr) {
    return undefined;
  }
  const slot = staticNumberParam(controller, "slot", 0);
  const remaining = staticDurationParam(controller, "time", 1);
  const stateNo = staticOptionalNumberParam(controller, "stateno", "value");
  const guardFlag = stripMugenString(findParam(controller, "guardflag"));
  const guardFlagNot = stripMugenString(findParam(controller, "guardflag.not"));
  const forceAir = staticOptionalBooleanParam(controller, "forceair") ?? false;
  const forceGuard = staticOptionalBooleanParam(controller, "forceguard") ?? false;
  const keepState = staticOptionalBooleanParam(controller, "keepstate") ?? false;
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (
    slot === undefined ||
    remaining === undefined ||
    stateNo === false ||
    forceAir === undefined ||
    forceGuard === undefined ||
    keepState === undefined ||
    redirectPlayerIdExpression === "invalid"
  ) {
    return undefined;
  }
  const operation = definedObject({
    kind: "hitoverride" as const,
    slot: clampIndex(Math.round(slot), 7),
    attr,
    remaining,
    stateNo: stateNo === true ? undefined : Math.max(0, Math.round(stateNo)),
    guardFlag,
    guardFlagNot,
    forceAir,
    forceGuard,
    keepState,
    redirectPlayerIdExpression: redirectPlayerIdExpression === undefined ? undefined : redirectPlayerIdExpression,
  });
  return operation as HitOverrideControllerOp;
}

function compileReversalDefControllerOp(controller: MugenStateController): ReversalDefControllerOp | undefined {
  const attr = stripMugenString(findParam(controller, "reversal.attr"));
  if (!attr) {
    return undefined;
  }
  const reversalGuardFlag = staticOptionalGuardFlagParam(controller, "reversal.guardflag");
  const reversalGuardFlagNot = staticOptionalGuardFlagParam(controller, "reversal.guardflag.not");
  const hitDefAttr = staticOptionalHitAttributeParam(controller, "attr");
  const guardFlag = staticOptionalGuardFlagParam(controller, "guardflag");
  const missOnOverride = staticOptionalReversalBooleanParam(controller, "missonoverride");
  const hitPause = staticNumberParam(controller, "pausetime", 0);
  const hitCount = staticOptionalHitCountParam(controller, "numhits");
  const p1SpritePriority = staticOptionalReversalSpritePriorityParam(controller, "p1sprpriority");
  const p2SpritePriority = staticOptionalReversalSpritePriorityParam(controller, "p2sprpriority");
  const p1StateNo = staticOptionalNumberParam(controller, "p1stateno");
  const p2StateNo = staticOptionalNumberParam(controller, "p2stateno");
  const p2GetP1State = staticOptionalStrictNumberParam(controller, "p2getp1state");
  const p2Facing = staticOptionalReversalFacingParam(controller, "p2facing");
  const targetId = staticOptionalNumberParam(controller, "id");
  const attackDepthRaw = findParam(controller, "attack.depth");
  const attackDepth = normalizedNumberPair(attackDepthRaw);
  const unhittableTime = optionalIntegerExpressionPairParam(controller, "unhittabletime");
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (
    hitPause === undefined ||
    reversalGuardFlag === false ||
    reversalGuardFlagNot === false ||
    hitDefAttr === false ||
    guardFlag === false ||
    missOnOverride === "invalid" ||
    hitCount === false ||
    p1SpritePriority === false ||
    p2SpritePriority === false ||
    p1StateNo === false ||
    p2StateNo === false ||
    p2GetP1State === false ||
    p2Facing === false ||
    targetId === false ||
    (attackDepthRaw !== undefined && attackDepth === undefined) ||
    unhittableTime === false ||
    redirectPlayerIdExpression === "invalid"
  ) {
    return undefined;
  }
  const operation = definedObject({
    kind: "reversaldef" as const,
    attr,
    reversalGuardFlag: reversalGuardFlag === true ? undefined : reversalGuardFlag,
    reversalGuardFlagNot: reversalGuardFlagNot === true ? undefined : reversalGuardFlagNot,
    hitDefAttr: hitDefAttr === true ? undefined : hitDefAttr,
    guardFlag: guardFlag === true ? undefined : guardFlag,
    missOnOverride,
    hitPause: Math.max(0, Math.round(hitPause)),
    hitCount: hitCount === true ? undefined : hitCount,
    p1SpritePriority: p1SpritePriority === true ? undefined : p1SpritePriority,
    p2SpritePriority: p2SpritePriority === true ? undefined : p2SpritePriority,
    p1StateNo: p1StateNo === true ? undefined : Math.max(0, Math.round(p1StateNo)),
    p2StateNo: p2StateNo === true ? undefined : Math.max(0, Math.round(p2StateNo)),
    p2GetP1State: p2GetP1State === true ? undefined : p2GetP1State !== 0,
    p2Facing: p2Facing === true ? undefined : p2Facing,
    targetId: targetId === true ? undefined : Math.max(0, Math.round(targetId)),
    attackDepth,
    unhittableTime: unhittableTime === true ? undefined : unhittableTime,
    redirectPlayerIdExpression: redirectPlayerIdExpression === undefined ? undefined : redirectPlayerIdExpression,
  });
  return operation as ReversalDefControllerOp;
}

function compileDamageScaleControllerOp(
  controller: MugenStateController,
  type: DamageScaleControllerOp["controllerType"],
): DamageScaleControllerOp | undefined {
  const value = staticOptionalNumberParam(controller, "value");
  const dizzyPoints = type === "attackmulset" ? staticOptionalNumberParam(controller, "dizzypoints") : true;
  if ((value === true || value === false) && (dizzyPoints === true || dizzyPoints === false)) {
    return undefined;
  }
  return {
    kind: "damage-scale",
    controllerType: type,
    ...(typeof value === "number" ? { multiplier: Math.max(0, Math.min(10, value)) } : {}),
    ...(typeof dizzyPoints === "number" ? { dizzyPointsMultiplier: Math.max(0, Math.min(10, dizzyPoints)) } : {}),
  };
}

function compileHitDefControllerOp(
  controller: MugenStateController,
  context: ControllerCompileContext,
): HitDefControllerOp | undefined {
  const damageValue = optionalIntegerExpressionPairParam(controller, "damage");
  const damageExpressions = Array.isArray(damageValue) && damageValue.some((value) => typeof value === "string")
    ? damageValue
    : undefined;
  const damage = Array.isArray(damageValue) && damageExpressions === undefined ? damageValue : undefined;
  const groundVelocityRaw = findParam(controller, "ground.velocity");
  const groundVelocity = groundVelocityRaw === undefined ? undefined : strictStaticNumberVector(groundVelocityRaw);
  const groundVelocityExpressionValue = groundVelocityRaw === undefined || groundVelocity !== undefined
    ? true
    : optionalFloatExpressionPairParam(controller, "ground.velocity");
  const groundVelocityExpressions = Array.isArray(groundVelocityExpressionValue)
    ? groundVelocityExpressionValue
    : undefined;
  const airVelocityRaw = findParam(controller, "air.velocity");
  const airVelocity = airVelocityRaw === undefined ? undefined : strictStaticNumberVector(airVelocityRaw);
  const airVelocityExpressionValue = airVelocityRaw === undefined || airVelocity !== undefined
    ? true
    : optionalFloatExpressionPairParam(controller, "air.velocity");
  const airVelocityExpressions = Array.isArray(airVelocityExpressionValue)
    ? airVelocityExpressionValue
    : undefined;
  const downVelocityRaw = findParam(controller, "down.velocity");
  const downVelocity = downVelocityRaw === undefined ? undefined : strictStaticNumberVector(downVelocityRaw);
  const downVelocityExpressionValue = downVelocityRaw === undefined || downVelocity !== undefined
    ? true
    : optionalFloatExpressionPairParam(controller, "down.velocity");
  const downVelocityExpressions = Array.isArray(downVelocityExpressionValue)
    ? downVelocityExpressionValue
    : undefined;
  const guardVelocityRaw = findParam(controller, "guard.velocity");
  const guardVelocity = hitDefVelocity(guardVelocityRaw);
  const guardVelocityExpression = guardVelocityRaw === undefined || guardVelocity !== undefined
    ? true
    : optionalScalarNumberOrExpression(controller, "guard.velocity");
  const airGuardVelocityRaw = findParam(controller, "airguard.velocity");
  const airGuardVelocity = airGuardVelocityRaw === undefined ? undefined : strictStaticNumberVector(airGuardVelocityRaw);
  const airGuardVelocityExpressionValue = airGuardVelocityRaw === undefined || airGuardVelocity !== undefined
    ? true
    : optionalFloatExpressionVectorParam(controller, "airguard.velocity");
  const airGuardVelocityExpressions: MugenHitDefExpressionPair | undefined = Array.isArray(airGuardVelocityExpressionValue)
    ? airGuardVelocityExpressionValue.length === 1
      ? [airGuardVelocityExpressionValue[0]]
      : [airGuardVelocityExpressionValue[0], airGuardVelocityExpressionValue[1]]
    : undefined;
  const airGuardVelocityZExpression = Array.isArray(airGuardVelocityExpressionValue) && airGuardVelocityExpressionValue.length === 3
    ? airGuardVelocityExpressionValue[2]
    : undefined;
  const p1StateNo = optionalIntegerExpressionParam(controller, "p1stateno");
  const p2StateNo = optionalIntegerExpressionParam(controller, "p2stateno");
  const p2GetP1State = optionalIntegerExpressionParam(controller, "p2getp1state");
  const id = optionalIntegerExpressionParam(controller, "id");
  const chainId = optionalIntegerExpressionParam(controller, "chainid");
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (redirectPlayerIdExpression === "invalid") return undefined;
  const xAccel = optionalScalarNumberOrExpression(controller, "xaccel");
  const yAccel = optionalScalarNumberOrExpression(controller, "yaccel");
  const zAccel = optionalScalarNumberOrExpression(controller, "zaccel");
  const standFriction = optionalScalarNumberOrExpression(controller, "stand.friction");
  const crouchFriction = optionalScalarNumberOrExpression(controller, "crouch.friction");
  const hitSparkScale = optionalFloatExpressionPairParam(controller, "sparkscale");
  const guardSparkScale = optionalFloatExpressionPairParam(controller, "guard.sparkscale");
  const paletteFx = optionalHitDefPaletteFxParam(controller);
  const envShake = optionalHitDefEnvShakeParam(controller);
  const fallEnvShake = optionalHitDefEnvShakeParam(controller, "fall.envshake");
  const fallImpact = optionalHitDefFallImpactParam(controller);
  const fallRecovery = optionalHitDefFallRecoveryParam(controller);
  const fallFlags = optionalHitDefFallFlagsParam(controller);
  const lethalFlags = optionalHitDefLethalFlagsParam(controller);
  const downBounceExpression = optionalIntegerExpressionParam(controller, "down.bounce");
  const forceStand = optionalIntegerExpressionParam(controller, "forcestand");
  const forceCrouch = optionalIntegerExpressionParam(controller, "forcecrouch");
  const forceNoFall = optionalIntegerExpressionParam(controller, "forcenofall");
  const groundHitTime = optionalIntegerExpressionParam(controller, "ground.hittime");
  const groundSlideTime = optionalIntegerExpressionParam(controller, "ground.slidetime");
  const airHitTime = optionalIntegerExpressionParam(controller, "air.hittime");
  const downHitTime = optionalIntegerExpressionParam(controller, "down.hittime");
  const guardDistance = optionalIntegerExpressionParam(controller, "guard.dist");
  const guardHitTime = optionalIntegerExpressionParam(controller, "guard.hittime");
  const guardSlideTime = optionalIntegerExpressionParam(controller, "guard.slidetime");
  const guardControlTime = optionalIntegerExpressionParam(controller, "guard.ctrltime");
  const airGuardControlTime = optionalIntegerExpressionParam(controller, "airguard.ctrltime");
  const airJuggleExpression = optionalIntegerExpressionParam(controller, "air.juggle");
  const hitCountExpression = optionalIntegerExpressionParam(controller, "numhits");
  const getPower = optionalIntegerExpressionPairParam(controller, "getpower");
  const givePower = optionalIntegerExpressionPairParam(controller, "givepower");
  const p1Facing = optionalIntegerExpressionParam(controller, "p1facing");
  const p1GetP2Facing = optionalIntegerExpressionParam(controller, "p1getp2facing");
  const p2Facing = optionalIntegerExpressionParam(controller, "p2facing");
  const p1SpritePriorityKey = findParam(controller, "p1sprpriority") === undefined ? "sprpriority" : "p1sprpriority";
  const p1SpritePriorityValue = optionalIntegerExpressionParam(controller, p1SpritePriorityKey);
  const p2SpritePriorityValue = optionalIntegerExpressionParam(controller, "p2sprpriority");
  const priorityValue = optionalHitDefPriorityParam(controller);
  const pauseTimeValue = optionalIntegerExpressionPairParam(controller, "pausetime");
  const pauseTimeExpressions = Array.isArray(pauseTimeValue) && pauseTimeValue.some((value) => typeof value === "string")
    ? pauseTimeValue
    : undefined;
  const pauseTime = Array.isArray(pauseTimeValue) && pauseTimeExpressions === undefined ? pauseTimeValue : undefined;
  const guardPauseTimeValue = optionalIntegerExpressionPairParam(controller, "guard.pausetime");
  const guardPauseTimeExpressions = Array.isArray(guardPauseTimeValue) && guardPauseTimeValue.some((value) => typeof value === "string")
    ? guardPauseTimeValue
    : undefined;
  const guardPauseTime = Array.isArray(guardPauseTimeValue) && guardPauseTimeExpressions === undefined
    ? guardPauseTimeValue
    : undefined;
  const noChainIds = optionalIntegerExpressionListParam(controller, "nochainid", 8);
  if (
    noChainIds === false ||
    damageValue === false ||
    groundVelocityExpressionValue === false ||
    airVelocityExpressionValue === false ||
    downVelocityExpressionValue === false ||
    guardVelocityExpression === false ||
    airGuardVelocityExpressionValue === false ||
    (Array.isArray(airGuardVelocityExpressionValue) && airGuardVelocityExpressions === undefined) ||
    hitSparkScale === false ||
    guardSparkScale === false ||
    paletteFx === false ||
    envShake === false ||
    fallEnvShake === false ||
    fallImpact === false ||
    fallRecovery === false ||
    fallFlags === false ||
    lethalFlags === false ||
    downBounceExpression === false ||
    forceStand === false ||
    forceCrouch === false ||
    forceNoFall === false ||
    groundHitTime === false ||
    groundSlideTime === false ||
    airHitTime === false ||
    downHitTime === false ||
    guardDistance === false ||
    guardHitTime === false ||
    guardSlideTime === false ||
    guardControlTime === false ||
    airGuardControlTime === false ||
    airJuggleExpression === false ||
    hitCountExpression === false ||
    getPower === false ||
    givePower === false ||
    p1Facing === false ||
    p1GetP2Facing === false ||
    p2Facing === false ||
    p1StateNo === false ||
    p2StateNo === false ||
    p2GetP1State === false ||
    id === false ||
    chainId === false ||
    p1SpritePriorityValue === false ||
    p2SpritePriorityValue === false ||
    priorityValue === false
    || pauseTimeValue === false
    || guardPauseTimeValue === false
  ) return undefined;
  const unhittableTime = optionalIntegerExpressionPairParam(controller, "unhittabletime");
  if (unhittableTime === false) return undefined;
  const koVelocityAdd = hitDefVelocity(findParam(controller, "ko.velocity.add"));
  return definedObject({
    kind: "hitdef" as const,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    ...(id === true ? {} : { id: typeof id === "number" ? Math.max(0, id) : id }),
    ...(chainId === true ? {} : { chainId }),
    noChainIds: Array.isArray(noChainIds) ? noChainIds : undefined,
    hitCount: firstNumber(findParam(controller, "numhits")),
    ...(typeof hitCountExpression === "string" ? { hitCountExpression } : {}),
    attr: stripMugenString(findParam(controller, "attr")),
    hitFlag: stripMugenString(findParam(controller, "hitflag")),
    affectTeam: normalizeMugenAffectTeam(findParam(controller, "affectteam")),
    teamSide: normalizeMugenTeamSide(firstNumber(findParam(controller, "teamside"))),
    p2ClsnCheck: normalizeMugenCollisionBoxType(findParam(controller, "p2clsncheck")),
    p2ClsnRequire: normalizeMugenCollisionBoxType(findParam(controller, "p2clsnrequire")),
    damage: damage?.[0] as number | undefined,
    guardDamage: damage?.[1] as number | undefined,
    ...(damageExpressions === undefined ? {} : { damageExpressions }),
    redLife: firstNumber(findParam(controller, "redlife")),
    guardRedLife: secondNumber(findParam(controller, "redlife")),
    guardPower: secondNumber(findParam(controller, "givepower")),
    hitPower: firstNumber(findParam(controller, "givepower")),
    ...(givePower === true ? {} : { givePower }),
    score: firstNumber(findParam(controller, "score")),
    ...(getPower === true ? {} : { getPower }),
    guardPoints: firstNumber(findParam(controller, "guardpoints")),
    dizzyPoints: firstNumber(findParam(controller, "dizzypoints")),
    kill: booleanNumber(findParam(controller, "kill")),
    keepState: booleanNumber(findParam(controller, "keepstate")),
    guardKill: booleanNumber(findParam(controller, "guard.kill")),
    hitOnce: booleanNumber(findParam(controller, "hitonce")),
    airJuggle: firstNumber(findParam(controller, "air.juggle")),
    ...(typeof airJuggleExpression === "string" ? { airJuggleExpression } : {}),
    priority: typeof priorityValue === "object" && typeof priorityValue.priority === "number" ? priorityValue.priority : undefined,
    ...(typeof priorityValue === "object" && typeof priorityValue.priority === "string" ? { priorityExpression: priorityValue.priority } : {}),
    priorityType: typeof priorityValue === "object" ? priorityValue.priorityType : undefined,
    p1SpritePriority: typeof p1SpritePriorityValue === "number" ? p1SpritePriorityValue : undefined,
    p2SpritePriority: typeof p2SpritePriorityValue === "number" ? p2SpritePriorityValue : undefined,
    ...(typeof p1SpritePriorityValue === "string" ? { p1SpritePriorityExpression: p1SpritePriorityValue } : {}),
    ...(typeof p2SpritePriorityValue === "string" ? { p2SpritePriorityExpression: p2SpritePriorityValue } : {}),
    attackDepth: normalizedNumberPair(findParam(controller, "attack.depth")),
    unhittableTime: unhittableTime === true ? undefined : unhittableTime,
    pauseTime: pauseTime?.[0] as number | undefined,
    hitShakeTime: pauseTime === undefined ? undefined : (pauseTime[1] as number | undefined) ?? 0,
    ...(pauseTimeExpressions === undefined ? {} : { pauseTimeExpressions }),
    ...(groundHitTime === true ? {} : { groundHitTime }),
    ...(groundSlideTime === true ? {} : { groundSlideTime }),
    ...(airHitTime === true ? {} : { airHitTime }),
    ...(downHitTime === true ? {} : { downHitTime }),
    downBounce: booleanNumber(findParam(controller, "down.bounce")),
    ...(typeof downBounceExpression === "string" ? { downBounceExpression } : {}),
    ...(forceStand === true ? {} : { forceStand }),
    ...(forceCrouch === true ? {} : { forceCrouch }),
    ...(forceNoFall === true ? {} : { forceNoFall }),
    groundVelocity,
    ...(groundVelocityExpressions === undefined ? {} : { groundVelocityExpressions }),
    airVelocity,
    ...(airVelocityExpressions === undefined ? {} : { airVelocityExpressions }),
    downVelocity,
    ...(downVelocityExpressions === undefined ? {} : { downVelocityExpressions }),
    ...(guardDistance === true ? {} : { guardDistance }),
    guardFlag: stripMugenString(findParam(controller, "guardflag")),
    guardPauseTime: guardPauseTime?.[0] as number | undefined,
    guardShakeTime: guardPauseTime === undefined ? undefined : (guardPauseTime[1] as number | undefined) ?? 0,
    ...(guardPauseTimeExpressions === undefined ? {} : { guardPauseTimeExpressions }),
    ...(guardHitTime === true ? {} : { guardHitTime }),
    ...(guardSlideTime === true ? {} : { guardSlideTime }),
    ...(guardControlTime === true ? {} : { guardControlTime }),
    ...(airGuardControlTime === true ? {} : { airGuardControlTime }),
    guardVelocity,
    ...(guardVelocityExpression === true ? {} : { guardVelocityExpression }),
    airGuardVelocity,
    ...(airGuardVelocityExpressions === undefined ? {} : { airGuardVelocityExpressions }),
    ...(airGuardVelocityZExpression === undefined ? {} : { airGuardVelocityZExpression }),
    groundCornerPush: firstNumber(findParam(controller, "ground.cornerpush.veloff")),
    airCornerPush: firstNumber(findParam(controller, "air.cornerpush.veloff")),
    downCornerPush: firstNumber(findParam(controller, "down.cornerpush.veloff")),
    guardCornerPush: firstNumber(findParam(controller, "guard.cornerpush.veloff")),
    airGuardCornerPush: firstNumber(findParam(controller, "airguard.cornerpush.veloff")),
    ...(p1StateNo === true ? {} : { p1StateNo }),
    ...(p2StateNo === true ? {} : { p2StateNo }),
    ...(p2GetP1State === true ? {} : { p2GetP1State }),
    ...(p1Facing === true ? {} : { p1Facing }),
    ...(p1GetP2Facing === true ? {} : { p1GetP2Facing }),
    ...(p2Facing === true ? {} : { p2Facing }),
    missOnOverride: booleanNumber(findParam(controller, "missonoverride")),
    ignoreReversalDef: booleanNumber(findParam(controller, "ignorereversaldef")),
    snap: numberPair(findParam(controller, "snap")),
    animType: hitAnimType(findParam(controller, "animtype")),
    airAnimType: hitAnimType(findParam(controller, "air.animtype")),
    groundType: hitType(findParam(controller, "ground.type") ?? findParam(controller, "type")),
    airType: hitType(findParam(controller, "air.type")),
    ...(xAccel === true || xAccel === false ? {} : { xAccel }),
    ...(yAccel === true || yAccel === false ? {} : { yAccel }),
    ...(zAccel === true || zAccel === false ? {} : { zAccel }),
    ...(standFriction === true || standFriction === false ? {} : { standFriction }),
    ...(crouchFriction === true || crouchFriction === false ? {} : { crouchFriction }),
    ...(hitSparkScale === true ? {} : { hitSparkScale }),
    ...(guardSparkScale === true ? {} : { guardSparkScale }),
    ...(paletteFx === true ? {} : { paletteFx }),
    ...(envShake === true ? {} : { envShake }),
    ...(fallEnvShake === true ? {} : { fallEnvShake }),
    ...(fallImpact === true ? {} : { fallImpact }),
    ...(fallRecovery === true ? {} : { fallRecovery }),
    ...(fallFlags === true ? {} : { fallFlags }),
    ...(lethalFlags === true ? {} : { lethalFlags }),
    ...(koVelocityAdd === undefined ? {} : { koVelocityAdd }),
    fallAnimType: hitAnimType(findParam(controller, "fall.animtype")),
    hitSound: stripMugenString(findParam(controller, "hitsound")),
    guardSound: stripMugenString(findParam(controller, "guardsound")),
    hitSpark: hitDefSparkParam(controller, context, "sparkno"),
    guardSpark: hitDefSparkParam(controller, context, "guard.sparkno"),
    sparkXy: numberPair(findParam(controller, "sparkxy")),
    fall: compileHitDefFallOp(controller),
  });
}

function compileModifyHitDefControllerOp(controller: MugenStateController): ModifyHitDefControllerOp | undefined {
  const allowedParams = new Set([
    "type",
    "redirectid",
    "damage",
    "ground.hittime",
    "ground.slidetime",
    "guard.hittime",
    "guard.slidetime",
    "guard.ctrltime",
    "air.hittime",
    "guard.dist",
    "down.hittime",
    "ground.velocity",
    "air.velocity",
    "down.velocity",
    "down.bounce",
    "forcestand",
    "forcecrouch",
    "forcenofall",
    "airguard.ctrltime",
    "guard.velocity",
    "airguard.velocity",
    "xaccel",
    "yaccel",
    "zaccel",
    "stand.friction",
    "crouch.friction",
    "sparkscale",
    "guard.sparkscale",
    "palfx.time",
    "palfx.add",
    "palfx.mul",
    "palfx.color",
    "palfx.invertall",
    "envshake.time",
    "envshake.freq",
    "envshake.ampl",
    "envshake.phase",
    "envshake.mul",
    "envshake.dir",
    "fall.envshake.time",
    "fall.envshake.freq",
    "fall.envshake.ampl",
    "fall.envshake.phase",
    "fall.envshake.mul",
    "fall.envshake.dir",
    "fall.damage",
    "fall.xvelocity",
    "fall.yvelocity",
    "fall.zvelocity",
    "fall",
    "air.fall",
    "fall.recover",
    "fall.recovertime",
    "down.recover",
    "down.recovertime",
    "getpower",
    "givepower",
    "id",
    "chainid",
    "nochainid",
    "numhits",
    "attr",
    "guardflag",
    "hitflag",
    "p1stateno",
    "p2stateno",
    "p2getp1state",
    "p1facing",
    "p1getp2facing",
    "p2facing",
    "p1sprpriority",
    "sprpriority",
    "p2sprpriority",
    "priority",
    "kill",
    "guard.kill",
    "fall.kill",
    "hitonce",
    "unhittabletime",
  ]);
  if (Object.keys(controller.params).some((key) => !allowedParams.has(key.toLowerCase()))) {
    return undefined;
  }
  const damageValue = optionalIntegerExpressionPairParam(controller, "damage");
  const damageExpressions = Array.isArray(damageValue) && damageValue.some((value) => typeof value === "string")
    ? damageValue
    : undefined;
  const damage = Array.isArray(damageValue) && damageExpressions === undefined ? damageValue : undefined;
  const groundHitTime = optionalIntegerExpressionParam(controller, "ground.hittime");
  const groundSlideTime = optionalIntegerExpressionParam(controller, "ground.slidetime");
  const guardHitTime = optionalIntegerExpressionParam(controller, "guard.hittime");
  const guardSlideTime = optionalIntegerExpressionParam(controller, "guard.slidetime");
  const guardControlTime = optionalIntegerExpressionParam(controller, "guard.ctrltime");
  const airHitTime = optionalIntegerExpressionParam(controller, "air.hittime");
  const guardDistance = optionalIntegerExpressionParam(controller, "guard.dist");
  const downHitTime = optionalIntegerExpressionParam(controller, "down.hittime");
  const groundVelocityValue = optionalModifyHitDefVelocityParam(controller, "ground.velocity");
  const groundVelocity = typeof groundVelocityValue === "object" ? groundVelocityValue.xy : undefined;
  const groundVelocityZ = typeof groundVelocityValue === "object" && typeof groundVelocityValue.z === "number"
    ? groundVelocityValue.z
    : true;
  const airVelocityValue = optionalModifyHitDefVelocityParam(controller, "air.velocity");
  const airVelocity = typeof airVelocityValue === "object" ? airVelocityValue.xy : undefined;
  const airVelocityZ = typeof airVelocityValue === "object" && typeof airVelocityValue.z === "number"
    ? airVelocityValue.z
    : true;
  const downVelocityRaw = findParam(controller, "down.velocity");
  const staticDownVelocity = downVelocityRaw === undefined ? undefined : strictStaticNumberVector(downVelocityRaw);
  const downVelocityValue = optionalModifyHitDefVelocityParam(controller, "down.velocity", true);
  const downVelocity = downVelocityRaw === undefined
    ? true
    : staticDownVelocity ?? (downVelocityValue === false ? false : undefined);
  const downVelocityExpressions = staticDownVelocity === undefined && typeof downVelocityValue === "object"
    ? downVelocityValue.xy
    : undefined;
  const downVelocityZValue = typeof downVelocityValue === "object" ? downVelocityValue.z : undefined;
  const downVelocityZ = staticDownVelocity === undefined && typeof downVelocityZValue === "number"
    ? downVelocityZValue
    : undefined;
  const downVelocityZExpression = staticDownVelocity === undefined && typeof downVelocityZValue === "string"
    ? downVelocityZValue
    : undefined;
  const downBounceValue = optionalIntegerExpressionParam(controller, "down.bounce");
  const downBounce = typeof downBounceValue === "number" ? downBounceValue !== 0 : undefined;
  const downBounceExpression = typeof downBounceValue === "string" ? downBounceValue : undefined;
  const forceStand = optionalIntegerExpressionParam(controller, "forcestand");
  const forceCrouch = optionalIntegerExpressionParam(controller, "forcecrouch");
  const forceNoFall = optionalIntegerExpressionParam(controller, "forcenofall");
  const airGuardControlTime = optionalIntegerExpressionParam(controller, "airguard.ctrltime");
  const guardVelocityRaw = findParam(controller, "guard.velocity");
  const staticGuardVelocity = guardVelocityRaw === undefined ? undefined : strictStaticNumberVector(guardVelocityRaw);
  const guardVelocityExpression = guardVelocityRaw === undefined
    ? true
    : staticGuardVelocity !== undefined
      ? staticGuardVelocity[0]
      : optionalScalarNumberOrExpression(controller, "guard.velocity");
  const guardVelocityZ = staticGuardVelocity?.[2] ?? true;
  const airGuardVelocityValue = optionalModifyHitDefAirGuardVelocityParam(controller);
  const airGuardVelocityExpressions = typeof airGuardVelocityValue === "object"
    ? airGuardVelocityValue.xy
    : undefined;
  const airGuardVelocityZ = typeof airGuardVelocityValue === "object" && typeof airGuardVelocityValue.z === "number"
    ? airGuardVelocityValue.z
    : true;
  const airGuardVelocityZExpression = typeof airGuardVelocityValue === "object" && typeof airGuardVelocityValue.z === "string"
    ? airGuardVelocityValue.z
    : undefined;
  const xAccel = optionalScalarNumberOrExpression(controller, "xaccel");
  const yAccel = optionalScalarNumberOrExpression(controller, "yaccel");
  const zAccel = optionalScalarNumberOrExpression(controller, "zaccel");
  const standFriction = optionalScalarNumberOrExpression(controller, "stand.friction");
  const crouchFriction = optionalScalarNumberOrExpression(controller, "crouch.friction");
  const hitSparkScale = optionalFloatExpressionPairParam(controller, "sparkscale");
  const guardSparkScale = optionalFloatExpressionPairParam(controller, "guard.sparkscale");
  const paletteFx = optionalHitDefPaletteFxParam(controller);
  const envShake = optionalHitDefEnvShakeParam(controller);
  const fallEnvShake = optionalHitDefEnvShakeParam(controller, "fall.envshake");
  const fallImpact = optionalHitDefFallImpactParam(controller);
  const fallRecovery = optionalHitDefFallRecoveryParam(controller);
  const fallFlags = optionalHitDefFallFlagsParam(controller);
  const lethalFlags = optionalHitDefLethalFlagsParam(controller);
  const getPower = optionalIntegerExpressionPairParam(controller, "getpower");
  const givePower = optionalIntegerExpressionPairParam(controller, "givepower");
  const id = optionalIntegerExpressionParam(controller, "id");
  const chainId = optionalIntegerExpressionParam(controller, "chainid");
  const noChainIds = optionalIntegerExpressionListParam(controller, "nochainid", 8);
  const hitCountValue = optionalIntegerExpressionParam(controller, "numhits");
  const hitCount = typeof hitCountValue === "number" ? hitCountValue : undefined;
  const hitCountExpression = typeof hitCountValue === "string" ? hitCountValue : undefined;
  const attr = staticOptionalHitAttributeParam(controller, "attr");
  const guardFlag = staticOptionalGuardFlagParam(controller, "guardflag");
  const hitFlag = staticOptionalHitFlagParam(controller, "hitflag");
  const p1StateNo = staticOptionalStrictNumberParam(controller, "p1stateno");
  const p2StateNo = staticOptionalStrictNumberParam(controller, "p2stateno");
  const p2GetP1State = staticOptionalStrictNumberParam(controller, "p2getp1state");
  const p1Facing = optionalIntegerExpressionParam(controller, "p1facing");
  const p1GetP2Facing = optionalIntegerExpressionParam(controller, "p1getp2facing");
  const p2Facing = optionalIntegerExpressionParam(controller, "p2facing");
  const p1SpritePriorityKey = findParam(controller, "p1sprpriority") === undefined ? "sprpriority" : "p1sprpriority";
  const p1SpritePriorityValue = optionalIntegerExpressionParam(controller, p1SpritePriorityKey);
  const p2SpritePriorityValue = optionalIntegerExpressionParam(controller, "p2sprpriority");
  const p1SpritePriority = typeof p1SpritePriorityValue === "number" ? p1SpritePriorityValue : undefined;
  const p2SpritePriority = typeof p2SpritePriorityValue === "number" ? p2SpritePriorityValue : undefined;
  const p1SpritePriorityExpression = typeof p1SpritePriorityValue === "string" ? p1SpritePriorityValue : undefined;
  const p2SpritePriorityExpression = typeof p2SpritePriorityValue === "string" ? p2SpritePriorityValue : undefined;
  const priority = optionalHitDefPriorityParam(controller);
  const staticKill = strictNumberSingle(findParam(controller, "kill"));
  const kill = staticKill === undefined ? undefined : staticKill !== 0;
  const staticGuardKill = strictNumberSingle(findParam(controller, "guard.kill"));
  const guardKill = staticGuardKill === undefined ? undefined : staticGuardKill !== 0;
  const staticFallKill = strictNumberSingle(findParam(controller, "fall.kill"));
  const fallKill = staticFallKill === undefined ? undefined : staticFallKill !== 0;
  const staticHitOnce = strictNumberSingle(findParam(controller, "hitonce"));
  const hitOnce = staticHitOnce === undefined ? undefined : staticHitOnce !== 0;
  const unhittableTime = optionalIntegerExpressionPairParam(controller, "unhittabletime");
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  const hasPayload =
    damageValue !== true ||
    groundHitTime !== true ||
    groundSlideTime !== true ||
    guardHitTime !== true ||
    guardSlideTime !== true ||
    guardControlTime !== true ||
    airHitTime !== true ||
    guardDistance !== true ||
    downHitTime !== true ||
    groundVelocityValue !== true ||
    groundVelocityZ !== true ||
    airVelocityValue !== true ||
    airVelocityZ !== true ||
    downVelocityValue !== true ||
    downBounceValue !== true ||
    forceStand !== true ||
    forceCrouch !== true ||
    forceNoFall !== true ||
    airGuardControlTime !== true ||
    guardVelocityExpression !== true ||
    guardVelocityZ !== true ||
    airGuardVelocityValue !== true ||
    xAccel !== true ||
    yAccel !== true ||
    zAccel !== true ||
    standFriction !== true ||
    crouchFriction !== true ||
    hitSparkScale !== true ||
    guardSparkScale !== true ||
    paletteFx !== true ||
    envShake !== true ||
    fallEnvShake !== true ||
    fallImpact !== true ||
    fallRecovery !== true ||
    fallFlags !== true ||
    lethalFlags !== true ||
    getPower !== true ||
    givePower !== true ||
    id !== true ||
    chainId !== true ||
    noChainIds !== true ||
    hitCountValue !== true ||
    attr !== true ||
    guardFlag !== true ||
    hitFlag !== true ||
    p1StateNo !== true ||
    p2StateNo !== true ||
    p2GetP1State !== true ||
    p1Facing !== true ||
    p1GetP2Facing !== true ||
    p2Facing !== true ||
    p1SpritePriorityValue !== true ||
    p2SpritePriorityValue !== true ||
    priority !== true ||
    kill !== undefined ||
    guardKill !== undefined ||
    fallKill !== undefined ||
    hitOnce !== undefined ||
    unhittableTime !== true;
  if (
    !hasPayload ||
    damageValue === false ||
    groundHitTime === false ||
    groundSlideTime === false ||
    guardHitTime === false ||
    guardSlideTime === false ||
    guardControlTime === false ||
    airHitTime === false ||
    guardDistance === false ||
    downHitTime === false ||
    groundVelocityValue === false ||
    airVelocityValue === false ||
    downVelocityValue === false ||
    downBounceValue === false ||
    forceStand === false ||
    forceCrouch === false ||
    forceNoFall === false ||
    airGuardControlTime === false ||
    guardVelocityExpression === false ||
    airGuardVelocityValue === false ||
    xAccel === false ||
    yAccel === false ||
    zAccel === false ||
    standFriction === false ||
    crouchFriction === false ||
    hitSparkScale === false ||
    guardSparkScale === false ||
    paletteFx === false ||
    envShake === false ||
    fallEnvShake === false ||
    fallImpact === false ||
    fallRecovery === false ||
    fallFlags === false ||
    lethalFlags === false ||
    getPower === false ||
    givePower === false ||
    id === false ||
    chainId === false ||
    noChainIds === false ||
    hitCountValue === false ||
    attr === false ||
    guardFlag === false ||
    hitFlag === false ||
    p1StateNo === false ||
    p2StateNo === false ||
    p2GetP1State === false ||
    p1Facing === false ||
    p1GetP2Facing === false ||
    p2Facing === false ||
    p1SpritePriorityValue === false ||
    p2SpritePriorityValue === false ||
    priority === false ||
    unhittableTime === false ||
    redirectPlayerIdExpression === undefined ||
    redirectPlayerIdExpression === "invalid"
  ) {
    return undefined;
  }
  const normalizedP1StateNo = p1StateNo === true ? undefined : Math.max(0, Math.round(p1StateNo));
  const normalizedP2StateNo = p2StateNo === true ? undefined : Math.max(0, Math.round(p2StateNo));
  const normalizedP2GetP1State = p2GetP1State === true ? undefined : p2GetP1State !== 0;
  return {
    kind: "modifyhitdef",
    redirectPlayerIdExpression,
    ...(damage === undefined ? {} : { damage: damage[0] as number }),
    ...(damage?.[1] === undefined ? {} : { guardDamage: damage[1] as number }),
    ...(damageExpressions === undefined ? {} : { damageExpressions }),
    ...(groundHitTime === true ? {} : { groundHitTime }),
    ...(groundSlideTime === true ? {} : { groundSlideTime }),
    ...(guardHitTime === true ? {} : { guardHitTime }),
    ...(guardSlideTime === true ? {} : { guardSlideTime }),
    ...(guardControlTime === true ? {} : { guardControlTime }),
    ...(airHitTime === true ? {} : { airHitTime }),
    ...(guardDistance === true ? {} : { guardDistance }),
    ...(downHitTime === true ? {} : { downHitTime }),
    ...(groundVelocity === undefined ? {} : { groundVelocity }),
    ...(groundVelocityZ === true ? {} : { groundVelocityZ }),
    ...(airVelocity === undefined ? {} : { airVelocity }),
    ...(airVelocityZ === true ? {} : { airVelocityZ }),
    ...(downVelocity === true || downVelocity === false || downVelocity === undefined ? {} : { downVelocity }),
    ...(downVelocityExpressions === undefined ? {} : { downVelocityExpressions }),
    ...(downVelocityZ === undefined ? {} : { downVelocityZ }),
    ...(downVelocityZExpression === undefined ? {} : { downVelocityZExpression }),
    ...(downBounce === undefined ? {} : { downBounce }),
    ...(downBounceExpression === undefined ? {} : { downBounceExpression }),
    ...(forceStand === true ? {} : { forceStand }),
    ...(forceCrouch === true ? {} : { forceCrouch }),
    ...(forceNoFall === true ? {} : { forceNoFall }),
    ...(airGuardControlTime === true ? {} : { airGuardControlTime }),
    ...(guardVelocityExpression === true ? {} : { guardVelocityExpression }),
    ...(guardVelocityZ === true ? {} : { guardVelocityZ }),
    ...(airGuardVelocityExpressions === undefined ? {} : { airGuardVelocityExpressions }),
    ...(airGuardVelocityZ === true ? {} : { airGuardVelocityZ }),
    ...(airGuardVelocityZExpression === undefined ? {} : { airGuardVelocityZExpression }),
    ...(xAccel === true ? {} : { xAccel }),
    ...(yAccel === true ? {} : { yAccel }),
    ...(zAccel === true ? {} : { zAccel }),
    ...(standFriction === true ? {} : { standFriction }),
    ...(crouchFriction === true ? {} : { crouchFriction }),
    ...(hitSparkScale === true ? {} : { hitSparkScale }),
    ...(guardSparkScale === true ? {} : { guardSparkScale }),
    ...(paletteFx === true ? {} : { paletteFx }),
    ...(envShake === true ? {} : { envShake }),
    ...(fallEnvShake === true ? {} : { fallEnvShake }),
    ...(fallImpact === true ? {} : { fallImpact }),
    ...(fallRecovery === true ? {} : { fallRecovery }),
    ...(fallFlags === true ? {} : { fallFlags }),
    ...(lethalFlags === true ? {} : { lethalFlags }),
    ...(getPower === true ? {} : { getPower }),
    ...(givePower === true ? {} : { givePower }),
    ...(id === true ? {} : { id: typeof id === "number" ? Math.max(0, id) : id }),
    ...(chainId === true ? {} : { chainId }),
    ...(Array.isArray(noChainIds) ? { noChainIds } : {}),
    ...(hitCount === undefined ? {} : { hitCount }),
    ...(hitCountExpression === undefined ? {} : { hitCountExpression }),
    ...(attr === true ? {} : { attr }),
    ...(guardFlag === true ? {} : { guardFlag }),
    ...(hitFlag === true ? {} : { hitFlag }),
    ...(normalizedP1StateNo === undefined ? {} : { p1StateNo: normalizedP1StateNo }),
    ...(normalizedP2StateNo === undefined ? {} : { p2StateNo: normalizedP2StateNo }),
    ...(normalizedP2GetP1State === undefined ? {} : { p2GetP1State: normalizedP2GetP1State }),
    ...(p1Facing === true ? {} : { p1Facing }),
    ...(p1GetP2Facing === true ? {} : { p1GetP2Facing }),
    ...(p2Facing === true ? {} : { p2Facing }),
    ...(p1SpritePriority === undefined ? {} : { p1SpritePriority }),
    ...(p2SpritePriority === undefined ? {} : { p2SpritePriority }),
    ...(p1SpritePriorityExpression === undefined ? {} : { p1SpritePriorityExpression }),
    ...(p2SpritePriorityExpression === undefined ? {} : { p2SpritePriorityExpression }),
    ...(typeof priority === "object" && typeof priority.priority === "number" ? { priority: priority.priority } : {}),
    ...(typeof priority === "object" && typeof priority.priority === "string" ? { priorityExpression: priority.priority } : {}),
    ...(typeof priority === "object" ? { priorityType: priority.priorityType } : {}),
    ...(kill === undefined ? {} : { kill }),
    ...(guardKill === undefined ? {} : { guardKill }),
    ...(fallKill === undefined ? {} : { fallKill }),
    ...(hitOnce === undefined ? {} : { hitOnce }),
    ...(unhittableTime === true ? {} : { unhittableTime }),
  };
}

function compileModifyReversalDefControllerOp(controller: MugenStateController): ModifyReversalDefControllerOp | undefined {
  const allowedParams = new Set([
    "type",
    "redirectid",
    "reversal.attr",
    "reversal.guardflag",
    "reversal.guardflag.not",
    "attr",
    "guardflag",
    "missonoverride",
    "pausetime",
    "numhits",
    "p1sprpriority",
    "p2sprpriority",
    "p1stateno",
    "p2stateno",
    "p2getp1state",
    "p2facing",
    "id",
    "attack.depth",
  ]);
  if (Object.keys(controller.params).some((key) => !allowedParams.has(key.toLowerCase()))) {
    return undefined;
  }
  const reversalAttr = stripMugenString(findParam(controller, "reversal.attr"))?.trim();
  const reversalGuardFlag = staticOptionalGuardFlagParam(controller, "reversal.guardflag");
  const reversalGuardFlagNot = staticOptionalGuardFlagParam(controller, "reversal.guardflag.not");
  const hitDefAttr = staticOptionalHitAttributeParam(controller, "attr");
  const guardFlag = staticOptionalGuardFlagParam(controller, "guardflag");
  const missOnOverride = staticOptionalReversalBooleanParam(controller, "missonoverride");
  const hitPauseRaw = findParam(controller, "pausetime");
  const hitPausePair = hitPauseRaw === undefined ? undefined : strictStaticNumberPair(hitPauseRaw);
  const hitCount = staticOptionalHitCountParam(controller, "numhits");
  const p1SpritePriority = staticOptionalReversalSpritePriorityParam(controller, "p1sprpriority");
  const p2SpritePriority = staticOptionalReversalSpritePriorityParam(controller, "p2sprpriority");
  const p1StateNo = staticOptionalStrictNumberParam(controller, "p1stateno");
  const p2StateNo = staticOptionalStrictNumberParam(controller, "p2stateno");
  const p2GetP1State = staticOptionalStrictNumberParam(controller, "p2getp1state");
  const p2Facing = staticOptionalReversalFacingParam(controller, "p2facing");
  const targetId = staticOptionalStrictNumberParam(controller, "id");
  const attackDepthRaw = findParam(controller, "attack.depth");
  const attackDepthPair = attackDepthRaw === undefined ? undefined : strictStaticNumberPair(attackDepthRaw);
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (
    reversalAttr === "" ||
    reversalGuardFlag === false ||
    reversalGuardFlagNot === false ||
    hitDefAttr === false ||
    guardFlag === false ||
    missOnOverride === "invalid" ||
    (hitPauseRaw !== undefined && !hitPausePair) ||
    hitCount === false ||
    p1SpritePriority === false ||
    p2SpritePriority === false ||
    p1StateNo === false ||
    p2StateNo === false ||
    p2GetP1State === false ||
    p2Facing === false ||
    targetId === false ||
    (attackDepthRaw !== undefined && !attackDepthPair) ||
    redirectPlayerIdExpression === undefined ||
    redirectPlayerIdExpression === "invalid"
  ) {
    return undefined;
  }
  const hitPause = hitPausePair === undefined ? undefined : Math.max(0, Math.round(hitPausePair[0]));
  const normalizedHitCount = hitCount === true ? undefined : hitCount;
  const normalizedP1StateNo = p1StateNo === true ? undefined : Math.max(0, Math.round(p1StateNo));
  const normalizedP2StateNo = p2StateNo === true ? undefined : Math.max(0, Math.round(p2StateNo));
  const normalizedP2GetP1State = p2GetP1State === true ? undefined : p2GetP1State !== 0;
  const normalizedP2Facing = p2Facing === true ? undefined : p2Facing;
  const normalizedTargetId = targetId === true ? undefined : Math.max(0, Math.round(targetId));
  const attackDepth = attackDepthPair === undefined
    ? undefined
    : [attackDepthPair[0], attackDepthPair[1] ?? attackDepthPair[0]] as [number, number];
  if (
    reversalAttr === undefined &&
    reversalGuardFlag === true &&
    reversalGuardFlagNot === true &&
    hitDefAttr === true &&
    guardFlag === true &&
    missOnOverride === undefined &&
    hitPause === undefined &&
    normalizedHitCount === undefined &&
    p1SpritePriority === true &&
    p2SpritePriority === true &&
    normalizedP1StateNo === undefined &&
    normalizedP2StateNo === undefined &&
    normalizedP2GetP1State === undefined &&
    normalizedP2Facing === undefined &&
    normalizedTargetId === undefined &&
    attackDepth === undefined
  ) {
    return undefined;
  }
  return {
    kind: "modifyreversaldef",
    redirectPlayerIdExpression,
    ...(reversalAttr === undefined ? {} : { reversalAttr }),
    ...(reversalGuardFlag === true ? {} : { reversalGuardFlag }),
    ...(reversalGuardFlagNot === true ? {} : { reversalGuardFlagNot }),
    ...(hitDefAttr === true ? {} : { hitDefAttr }),
    ...(guardFlag === true ? {} : { guardFlag }),
    ...(missOnOverride === undefined ? {} : { missOnOverride }),
    ...(hitPause === undefined ? {} : { hitPause }),
    ...(normalizedHitCount === undefined ? {} : { hitCount: normalizedHitCount }),
    ...(p1SpritePriority === true ? {} : { p1SpritePriority }),
    ...(p2SpritePriority === true ? {} : { p2SpritePriority }),
    ...(normalizedP1StateNo === undefined ? {} : { p1StateNo: normalizedP1StateNo }),
    ...(normalizedP2StateNo === undefined ? {} : { p2StateNo: normalizedP2StateNo }),
    ...(normalizedP2GetP1State === undefined ? {} : { p2GetP1State: normalizedP2GetP1State }),
    ...(normalizedP2Facing === undefined ? {} : { p2Facing: normalizedP2Facing }),
    ...(normalizedTargetId === undefined ? {} : { targetId: normalizedTargetId }),
    ...(attackDepth === undefined ? {} : { attackDepth }),
  };
}

function hitDefSparkParam(
  controller: MugenStateController,
  context: ControllerCompileContext,
  key: "sparkno" | "guard.sparkno",
): string | undefined {
  const explicit = stripMugenString(findParam(controller, key));
  if (explicit !== undefined) {
    return explicit;
  }
  const fallback = context.constants?.[`data.${key}`];
  return Number.isFinite(fallback) ? String(fallback) : undefined;
}

function compileHitDefFallOp(controller: MugenStateController): HitDefFallOp {
  return definedObject({
    enabled: booleanNumber(findParam(controller, "fall")),
    airFall: booleanNumber(findParam(controller, "air.fall")),
    xVelocity: firstNumber(findParam(controller, "fall.xvelocity")),
    yVelocity: firstNumber(findParam(controller, "fall.yvelocity")),
    zVelocity: firstNumber(findParam(controller, "fall.zvelocity")),
    damage: firstNumber(findParam(controller, "fall.damage")),
    defenceUp: firstNumber(findParam(controller, "fall.defence_up")),
    kill: booleanNumber(findParam(controller, "fall.kill")),
    recover: booleanNumber(findParam(controller, "fall.recover")),
    recoverTime: firstNumber(findParam(controller, "fall.recovertime")),
    downRecover: booleanNumber(findParam(controller, "down.recover")),
    downRecoverTime: firstNumber(findParam(controller, "down.recovertime")),
    envShakeTime: firstNumber(findParam(controller, "fall.envshake.time")),
    envShakeFrequency: firstNumber(findParam(controller, "fall.envshake.freq")),
    envShakeAmplitude: firstNumber(findParam(controller, "fall.envshake.ampl")),
    envShakePhase: firstNumber(findParam(controller, "fall.envshake.phase")),
    envShakeMultiplier: firstNumber(findParam(controller, "fall.envshake.mul")),
    envShakeDirection: firstNumber(findParam(controller, "fall.envshake.dir")),
  });
}

function compileHitAddControllerOp(controller: MugenStateController): ContactControllerOp | undefined {
  const value = firstNumber(findParam(controller, "value"));
  if (value === undefined) {
    return undefined;
  }
  return { kind: "contact", controllerType: "hitadd", value: clampHitAdd(value) };
}

function compileTargetControllerOp(controller: MugenStateController): TargetControllerOp | undefined {
  const type = controller.type.toLowerCase();
  const requestedId = firstNumber(findParam(controller, "id"));
  if (type === "targetdrop") {
    const excludeId = firstNumber(findParam(controller, "excludeid") ?? findParam(controller, "id"));
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetdrop",
      excludeId,
      keepOne: (firstNumber(findParam(controller, "keepone")) ?? 1) !== 0,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetlifeadd") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetlifeadd",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 0,
      absolute: (firstNumber(findParam(controller, "absolute")) ?? 0) !== 0,
      kill: (firstNumber(findParam(controller, "kill")) ?? 1) !== 0,
      dizzy: booleanNumber(findParam(controller, "dizzy")) ?? true,
      redLife: booleanNumber(findParam(controller, "redlife")) ?? true,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetredlifeadd") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetredlifeadd",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 0,
      absolute: (firstNumber(findParam(controller, "absolute")) ?? 0) !== 0,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetguardpointsadd") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetguardpointsadd",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 0,
      absolute: (firstNumber(findParam(controller, "absolute")) ?? 0) !== 0,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetdizzypointsadd") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetdizzypointsadd",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 0,
      absolute: (firstNumber(findParam(controller, "absolute")) ?? 0) !== 0,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetpoweradd") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetpoweradd",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 0,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetfacing") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetfacing",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 1,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetveladd") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetveladd",
      requestedId,
      x: firstNumber(findParam(controller, "x")) ?? 0,
      y: firstNumber(findParam(controller, "y")) ?? 0,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetvelset") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return definedObject({
      kind: "target" as const,
      controllerType: "targetvelset" as const,
      requestedId,
      x: firstNumber(findParam(controller, "x")),
      y: firstNumber(findParam(controller, "y")),
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    });
  }
  if (type === "targetbind") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetbind",
      requestedId,
      pos: numberTriple(findParam(controller, "pos")) ?? [0, 0],
      time: firstNumber(findParam(controller, "time")) ?? 1,
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  if (type === "targetstate") {
    const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
    if (redirectPlayerIdExpression === "invalid") return undefined;
    return {
      kind: "target",
      controllerType: "targetstate",
      requestedId,
      stateNo: firstNumber(findParam(controller, "value")),
      ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    };
  }
  return undefined;
}

function compileBindToTargetControllerOp(controller: MugenStateController): BindToTargetControllerOp | undefined {
  const pos = posWithPostype(findParam(controller, "pos"));
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (redirectPlayerIdExpression === "invalid") return undefined;
  return {
    kind: "bindtotarget",
    requestedId: firstNumber(findParam(controller, "id")),
    pos: pos?.pos ?? [0, 0],
    posZ: firstNumber(findParam(controller, "posz")),
    postype: pos?.postype ?? "foot",
    time: firstNumber(findParam(controller, "time")) ?? 1,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
  };
}

function compilePauseControllerOp(controller: MugenStateController, type: "pause" | "superpause"): PauseControllerOp {
  return definedObject({
    kind: "pause",
    controllerType: type,
    time: firstNumber(findParam(controller, "time")) ?? 0,
    moveTime: firstNumber(findParam(controller, "movetime")) ?? 0,
    pauseBg: (firstNumber(findParam(controller, "pausebg")) ?? 1) !== 0,
    darken: type === "superpause" ? (firstNumber(findParam(controller, "darken")) ?? 1) !== 0 : false,
    unhittable: type === "superpause" ? (firstNumber(findParam(controller, "unhittable")) ?? 1) !== 0 : undefined,
    powerAdd: type === "superpause" ? firstNumber(findParam(controller, "poweradd")) ?? 0 : 0,
    p2DefMul: type === "superpause" ? firstNumber(findParam(controller, "p2defmul")) : undefined,
    sound: type === "superpause" ? staticSoundValueParam(controller, "sound") : undefined,
    anim: type === "superpause" ? stripMugenString(findParam(controller, "anim")) : undefined,
    pos: type === "superpause" ? pairWithDefaultOrUndefined(numberPair(findParam(controller, "pos"))) : undefined,
  });
}

function compileAudioControllerOp(controller: MugenStateController, type: AudioControllerOp["controllerType"]): AudioControllerOp | undefined {
  const value = staticSoundValueParam(controller, "value");
  const channel = staticOptionalAudioNumberParam(controller, "channel");
  const lowPriority = type === "playsnd" ? staticOptionalAudioBooleanParam(controller, "lowpriority") : undefined;
  const volumeScale = type === "playsnd" ? staticOptionalAudioNumberParam(controller, "volumescale") : undefined;
  const legacyVolume = type === "playsnd" ? staticOptionalAudioNumberParam(controller, "volume") : undefined;
  const freqMul = type === "playsnd" ? staticOptionalAudioNumberParam(controller, "freqmul") : undefined;
  const loop = type === "playsnd" ? staticOptionalAudioBooleanParam(controller, "loop") : undefined;
  const pan = type === "playsnd" || type === "sndpan" ? staticOptionalAudioNumberParam(controller, "pan") : undefined;
  const absPan = type === "playsnd" || type === "sndpan" ? staticOptionalAudioNumberParam(controller, "abspan") : undefined;
  if (type === "playsnd" && value === undefined) {
    return undefined;
  }
  if (
    hasDynamicAudioNumberParam(controller, "channel") ||
    (type === "playsnd" &&
      (hasDynamicAudioNumberParam(controller, "lowpriority") ||
        hasDynamicAudioNumberParam(controller, "volumescale") ||
        hasDynamicAudioNumberParam(controller, "volume") ||
        hasDynamicAudioNumberParam(controller, "freqmul") ||
        hasDynamicAudioNumberParam(controller, "loop"))) ||
    ((type === "playsnd" || type === "sndpan") &&
      (hasDynamicAudioNumberParam(controller, "pan") || hasDynamicAudioNumberParam(controller, "abspan")))
  ) {
    return undefined;
  }
  if (type === "sndpan" && (channel === undefined || (pan === undefined && absPan === undefined))) {
    return undefined;
  }
  return definedObject({
    kind: "audio" as const,
    controllerType: type,
    value,
    channel,
    lowPriority,
    volumeScale,
    legacyVolume,
    freqMul,
    loop,
    pan,
    absPan,
  });
}

function staticOptionalAudioNumberParam(controller: MugenStateController, key: string): number | undefined {
  return firstNumber(findParam(controller, key));
}

function staticOptionalAudioBooleanParam(controller: MugenStateController, key: string): boolean | undefined {
  return booleanNumber(findParam(controller, key));
}

function hasDynamicAudioNumberParam(controller: MugenStateController, key: string): boolean {
  const raw = findParam(controller, key);
  return raw !== undefined && firstNumber(raw) === undefined;
}

function isNoopController(type: string): type is NoopControllerOp["controllerType"] {
  return (
    type === "null" ||
    type === "forcefeedback" ||
    type === "displaytoclipboard" ||
    type === "appendtoclipboard" ||
    type === "clearclipboard" ||
    type === "makedust" ||
    type === "destroyself"
  );
}

function compileAssertSpecialControllerOp(controller: MugenStateController): AssertSpecialControllerOp | undefined {
  const enabledRaw = findParam(controller, "value") ?? findParam(controller, "enabled");
  const enabled = enabledRaw === undefined ? true : booleanNumber(enabledRaw);
  if (enabled !== true) {
    return undefined;
  }

  const flags: string[] = [];
  const globalFlags: string[] = [];
  for (const rawFlag of assertSpecialFlagParams(controller)) {
    const normalized = normalizeAssertSpecialFlag(rawFlag);
    if (!normalized) {
      return undefined;
    }
    addUnique(normalized.global ? globalFlags : flags, normalized.name);
  }

  return flags.length > 0 || globalFlags.length > 0 ? { kind: "assertspecial", flags, globalFlags } : undefined;
}

function compileProjectileControllerOp(controller: MugenStateController): ProjectileControllerOp | undefined {
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (redirectPlayerIdExpression === "invalid") {
    return undefined;
  }
  const unhittableTime = optionalIntegerExpressionPairParam(controller, "unhittabletime");
  if (unhittableTime === false) return undefined;
  const getPower = optionalIntegerExpressionPairParam(controller, "getpower");
  if (getPower === false) return undefined;
  const givePower = optionalIntegerExpressionPairParam(controller, "givepower");
  if (givePower === false) return undefined;
  const downHitTime = optionalIntegerExpressionParam(controller, "down.hittime");
  if (downHitTime === false) return undefined;
  const standFriction = optionalScalarNumberOrExpression(controller, "stand.friction");
  const crouchFriction = optionalScalarNumberOrExpression(controller, "crouch.friction");
  const hitSparkScale = optionalFloatExpressionPairParam(controller, "sparkscale");
  const guardSparkScale = optionalFloatExpressionPairParam(controller, "guard.sparkscale");
  const paletteFx = optionalHitDefPaletteFxParam(controller);
  if (
    standFriction === false ||
    crouchFriction === false ||
    hitSparkScale === false ||
    guardSparkScale === false ||
    paletteFx === false
  ) return undefined;
  const fall = compileHitDefFallOp(controller);
  const redLifeRaw = findParam(controller, "redlife");
  const redLife = redLifeRaw === undefined ? undefined : strictStaticNumberPair(redLifeRaw);
  const scoreRaw = findParam(controller, "score");
  const score = scoreRaw === undefined ? undefined : strictStaticNumberPair(scoreRaw);
  const pauseTimeRaw = findParam(controller, "pausetime");
  const guardPauseTimeRaw = findParam(controller, "guard.pausetime");
  const groundVelocityRaw = findParam(controller, "ground.velocity");
  const groundVelocity = numberTriple(groundVelocityRaw);
  const groundVelocityExpressionValue = groundVelocityRaw === undefined || groundVelocity !== undefined
    ? true
    : optionalFloatExpressionVectorParam(controller, "ground.velocity");
  const groundVelocityExpressions: MugenHitDefExpressionPair | undefined = Array.isArray(groundVelocityExpressionValue)
    ? groundVelocityExpressionValue.length === 1
      ? [groundVelocityExpressionValue[0]]
      : [groundVelocityExpressionValue[0], groundVelocityExpressionValue[1]]
    : undefined;
  const groundVelocityZExpression = Array.isArray(groundVelocityExpressionValue) && groundVelocityExpressionValue.length === 3
    ? groundVelocityExpressionValue[2]
    : undefined;
  const airVelocityRaw = findParam(controller, "air.velocity");
  const airVelocity = numberTriple(airVelocityRaw);
  const airVelocityExpressionValue = airVelocityRaw === undefined || airVelocity !== undefined
    ? true
    : optionalFloatExpressionVectorParam(controller, "air.velocity");
  const airVelocityExpressions: MugenHitDefExpressionPair | undefined = Array.isArray(airVelocityExpressionValue)
    ? airVelocityExpressionValue.length === 1
      ? [airVelocityExpressionValue[0]]
      : [airVelocityExpressionValue[0], airVelocityExpressionValue[1]]
    : undefined;
  const airVelocityZExpression = Array.isArray(airVelocityExpressionValue) && airVelocityExpressionValue.length === 3
    ? airVelocityExpressionValue[2]
    : undefined;
  const airGuardVelocityRaw = findParam(controller, "airguard.velocity");
  const airGuardVelocity = numberTriple(airGuardVelocityRaw);
  const airGuardVelocityExpressionValue = airGuardVelocityRaw === undefined || airGuardVelocity !== undefined
    ? true
    : optionalFloatExpressionVectorParam(controller, "airguard.velocity");
  const airGuardVelocityExpressions: MugenHitDefExpressionPair | undefined = Array.isArray(airGuardVelocityExpressionValue)
    ? airGuardVelocityExpressionValue.length === 1
      ? [airGuardVelocityExpressionValue[0]]
      : [airGuardVelocityExpressionValue[0], airGuardVelocityExpressionValue[1]]
    : undefined;
  const airGuardVelocityZExpression = Array.isArray(airGuardVelocityExpressionValue) && airGuardVelocityExpressionValue.length === 3
    ? airGuardVelocityExpressionValue[2]
    : undefined;
  const downVelocityRaw = findParam(controller, "down.velocity");
  const downVelocity = numberTriple(downVelocityRaw);
  const downVelocityExpressionValue = downVelocityRaw === undefined || downVelocity !== undefined
    ? true
    : optionalFloatExpressionVectorParam(controller, "down.velocity");
  const downVelocityExpressions: MugenHitDefExpressionPair | undefined = Array.isArray(downVelocityExpressionValue)
    ? downVelocityExpressionValue.length === 1
      ? [downVelocityExpressionValue[0]]
      : [downVelocityExpressionValue[0], downVelocityExpressionValue[1]]
    : undefined;
  const downVelocityZExpression = Array.isArray(downVelocityExpressionValue) && downVelocityExpressionValue.length === 3
    ? downVelocityExpressionValue[2]
    : undefined;
  const guardVelocityRaw = findParam(controller, "guard.velocity");
  const guardVelocity = numberTriple(guardVelocityRaw);
  const guardVelocityExpressionValue = guardVelocityRaw === undefined || guardVelocity !== undefined
    ? true
    : optionalFloatExpressionVectorParam(controller, "guard.velocity");
  const guardVelocityExpressions: MugenHitDefExpressionPair | undefined = Array.isArray(guardVelocityExpressionValue)
    ? guardVelocityExpressionValue.length === 1
      ? [guardVelocityExpressionValue[0]]
      : [guardVelocityExpressionValue[0], guardVelocityExpressionValue[1]]
    : undefined;
  const guardVelocityZExpression = Array.isArray(guardVelocityExpressionValue) && guardVelocityExpressionValue.length === 3
    ? guardVelocityExpressionValue[2]
    : undefined;
  if (
    groundVelocityExpressionValue === false ||
    (Array.isArray(groundVelocityExpressionValue) && groundVelocityExpressions === undefined) ||
    airGuardVelocityExpressionValue === false ||
    (Array.isArray(airGuardVelocityExpressionValue) && airGuardVelocityExpressions === undefined) ||
    airVelocityExpressionValue === false ||
    (Array.isArray(airVelocityExpressionValue) && airVelocityExpressions === undefined) ||
    downVelocityExpressionValue === false ||
    (Array.isArray(downVelocityExpressionValue) && downVelocityExpressions === undefined) ||
    guardVelocityExpressionValue === false ||
    (Array.isArray(guardVelocityExpressionValue) && guardVelocityExpressions === undefined)
  ) return undefined;
  const guardDistanceBounds = staticProjectileGuardDistanceBounds(controller);
  return definedObject({
    kind: "projectile" as const,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    projectileId: firstNumber(findParam(controller, "projid") ?? findParam(controller, "id")),
    targetId: firstNumber(findParam(controller, "id")),
    chainId: firstNumber(findParam(controller, "chainid")),
    noChainIds: staticIntegerList(findParam(controller, "nochainid"), 8),
    hitDefHitCount: firstNumber(findParam(controller, "numhits")),
    p1StateNo: firstNumber(findParam(controller, "p1stateno")),
    affectTeam: normalizeMugenAffectTeam(findParam(controller, "affectteam")),
    teamSide: normalizeMugenTeamSide(firstNumber(findParam(controller, "teamside"))),
    projAnim: firstNumber(findParam(controller, "projanim") ?? findParam(controller, "anim")),
    offset: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "offset"))),
    pos: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "pos"))),
    postype: stripMugenString(findParam(controller, "postype")),
    velocity: tripleWithDefault(numberTriple(findParam(controller, "velocity") ?? findParam(controller, "vel"))),
    removalVelocity: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "remvelocity"))),
    acceleration: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "accel"))),
    velocityMultiplier: projectileVelocityMultiplierParam(findParam(controller, "velmul"), 1),
    scale: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "projscale") ?? findParam(controller, "scale"))),
    angle: firstNumber(findParam(controller, "projangle")),
    xAngle: firstNumber(findParam(controller, "projxangle")),
    yAngle: firstNumber(findParam(controller, "projyangle")),
    xShear: firstNumber(findParam(controller, "projxshear")),
    shadow: numberPartialTriple(findParam(controller, "projshadow")),
    reflection: firstNumber(findParam(controller, "projreflection")),
    projection: projectileProjection(findParam(controller, "projprojection")),
    focalLength: firstNumber(findParam(controller, "projfocallength")),
    window: numberQuad(findParam(controller, "projwindow")),
    ownPalette: booleanNumber(findParam(controller, "ownpal")),
    paletteRemap: projectilePaletteRemap(findParam(controller, "remappal")),
    clsnScale: projectileClsnScaleWithDefaultOrUndefined(numberPair(findParam(controller, "projclsnscale")), 1),
    clsnAngle: firstNumber(findParam(controller, "projclsnangle")),
    facing: firstNumber(findParam(controller, "facing")),
    hitAnim: firstNumber(findParam(controller, "projhitanim")),
    animType: hitAnimType(findParam(controller, "animtype")),
    airAnimType: hitAnimType(findParam(controller, "air.animtype")),
    fallAnimType: hitAnimType(findParam(controller, "fall.animtype")),
    removeAnim: firstNumber(findParam(controller, "projremanim")),
    cancelAnim: firstNumber(findParam(controller, "projcancelanim")),
    edgeBound: firstNumber(findParam(controller, "projedgebound")),
    stageBound: firstNumber(findParam(controller, "projstagebound")),
    depthBound: firstNumber(findParam(controller, "projdepthbound")),
    heightBound: projectileHeightBound(numberPair(findParam(controller, "projheightbound"))),
    removeTime: firstNumber(findParam(controller, "projremovetime") ?? findParam(controller, "removetime")) ?? -1,
    layerNo: projectileLayerNo(firstNumber(findParam(controller, "projlayerno"))),
    spritePriority: firstNumber(findParam(controller, "projsprpriority")) ?? 4,
    hitPriority: firstNumber(findParam(controller, "priority")),
    hitPriorityType: hitDefPriorityType(findParam(controller, "priority")),
    p1SpritePriority: firstNumber(findParam(controller, "p1sprpriority") ?? findParam(controller, "sprpriority")),
    p2SpritePriority: firstNumber(findParam(controller, "p2sprpriority")),
    priority: firstNumber(findParam(controller, "projpriority")) ?? 1,
    hitCount: firstNumber(findParam(controller, "projhits")) ?? 1,
    missTime: firstNumber(findParam(controller, "projmisstime")) ?? 0,
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
    trans: stripMugenString(findParam(controller, "trans")),
    damage: firstNumber(findParam(controller, "damage")) ?? 30,
    dizzyPoints: firstNumber(findParam(controller, "dizzypoints")),
    guardPoints: firstNumber(findParam(controller, "guardpoints")),
    redLife: redLife?.[0],
    guardRedLife: redLife === undefined ? undefined : redLife[1] ?? 0,
    guardPower: secondNumber(findParam(controller, "givepower")),
    hitPower: firstNumber(findParam(controller, "givepower")),
    givePower: givePower === true ? undefined : givePower,
    score: score?.[0],
    guardScore: score === undefined ? undefined : score[1] ?? 0,
    getPower: getPower === true ? undefined : getPower,
    unhittableTime: unhittableTime === true ? undefined : unhittableTime,
    ...(standFriction === true ? {} : { standFriction }),
    ...(crouchFriction === true ? {} : { crouchFriction }),
    ...(hitSparkScale === true ? {} : { hitSparkScale }),
    ...(guardSparkScale === true ? {} : { guardSparkScale }),
    ...(paletteFx === true ? {} : { paletteFx }),
    airJuggle: firstNumber(findParam(controller, "air.juggle")),
    kill: booleanNumber(findParam(controller, "kill")),
    guardKill: booleanNumber(findParam(controller, "guard.kill")),
    attr: stripMugenString(findParam(controller, "attr")),
    hitFlag: staticHitFlagParam(findParam(controller, "hitflag")),
    hitPause: firstNumber(pauseTimeRaw) ?? 0,
    hitShakeTime: pauseTimeRaw === undefined ? undefined : secondNumber(pauseTimeRaw) ?? 0,
    hitStun: firstNumber(findParam(controller, "ground.hittime")) ?? 18,
    groundSlideTime: firstNumber(findParam(controller, "ground.slidetime")),
    airHitTime: firstNumber(findParam(controller, "air.hittime")) ?? 20,
    groundVelocity,
    ...(groundVelocityExpressions === undefined ? {} : { groundVelocityExpressions }),
    ...(groundVelocityZExpression === undefined ? {} : { groundVelocityZExpression }),
    airVelocity,
    ...(airVelocityExpressions === undefined ? {} : { airVelocityExpressions }),
    ...(airVelocityZExpression === undefined ? {} : { airVelocityZExpression }),
    downHitTime: downHitTime === true || typeof downHitTime === "string" ? 20 : downHitTime,
    ...(typeof downHitTime === "string" ? { downHitTimeExpression: downHitTime } : {}),
    downVelocity,
    ...(downVelocityExpressions === undefined ? {} : { downVelocityExpressions }),
    ...(downVelocityZExpression === undefined ? {} : { downVelocityZExpression }),
    downBounce: booleanNumber(findParam(controller, "down.bounce")),
    forceNoFall: booleanNumber(findParam(controller, "forcenofall")),
    forceStand: booleanNumber(findParam(controller, "forcestand")),
    forceCrouch: booleanNumber(findParam(controller, "forcecrouch")),
    ...(Object.keys(fall).length === 0 ? {} : { fall }),
    attackDepth: normalizedNumberPair(findParam(controller, "attack.depth")),
    p2StateNo: firstNumber(findParam(controller, "p2stateno")),
    p2GetP1State:
      firstNumber(findParam(controller, "p2stateno")) !== undefined
        ? (firstNumber(findParam(controller, "p2getp1state")) ?? 1) !== 0
        : undefined,
    p2Facing: firstNumber(findParam(controller, "p2facing")),
    minDistance: numberPartialTriple(findParam(controller, "mindist")),
    maxDistance: numberPartialTriple(findParam(controller, "maxdist")),
    p2ClsnCheck: normalizeMugenCollisionBoxType(findParam(controller, "p2clsncheck")),
    p2ClsnRequire: normalizeMugenCollisionBoxType(findParam(controller, "p2clsnrequire")),
    missOnOverride: booleanNumber(findParam(controller, "missonoverride")),
    guardDamage: secondNumber(findParam(controller, "damage")),
    guardDistanceBounds,
    guardFlag: stripMugenString(findParam(controller, "guardflag")),
    guardPauseTime: firstNumber(guardPauseTimeRaw),
    guardShakeTime: guardPauseTimeRaw === undefined ? undefined : secondNumber(guardPauseTimeRaw) ?? 0,
    guardHitTime: firstNumber(findParam(controller, "guard.hittime")),
    guardSlideTime: firstNumber(findParam(controller, "guard.slidetime")),
    guardControlTime: firstNumber(findParam(controller, "guard.ctrltime")),
    airGuardControlTime: firstNumber(findParam(controller, "airguard.ctrltime")),
    guardVelocity,
    ...(guardVelocityExpressions === undefined ? {} : { guardVelocityExpressions }),
    ...(guardVelocityZExpression === undefined ? {} : { guardVelocityZExpression }),
    airGuardVelocity,
    ...(airGuardVelocityExpressions === undefined ? {} : { airGuardVelocityExpressions }),
    ...(airGuardVelocityZExpression === undefined ? {} : { airGuardVelocityZExpression }),
    xAccel: firstNumber(findParam(controller, "xaccel")),
    yAccel: firstNumber(findParam(controller, "yaccel")),
    zAccel: firstNumber(findParam(controller, "zaccel")),
    envShakeTime: firstNumber(findParam(controller, "envshake.time")),
    envShakeFrequency: firstNumber(findParam(controller, "envshake.freq")),
    envShakeAmplitude: firstNumber(findParam(controller, "envshake.ampl")),
    envShakePhase: firstNumber(findParam(controller, "envshake.phase")),
    envShakeMultiplier: firstNumber(findParam(controller, "envshake.mul")),
    envShakeDirection: firstNumber(findParam(controller, "envshake.dir")),
    koVelocityAdd: numberTriple(findParam(controller, "ko.velocity.add")),
    groundCornerPush: firstNumber(findParam(controller, "ground.cornerpush.veloff")),
    airCornerPush: firstNumber(findParam(controller, "air.cornerpush.veloff")),
    downCornerPush: firstNumber(findParam(controller, "down.cornerpush.veloff")),
    guardCornerPush: firstNumber(findParam(controller, "guard.cornerpush.veloff")),
    airGuardCornerPush: firstNumber(findParam(controller, "airguard.cornerpush.veloff")),
    hitSound: stripMugenString(findParam(controller, "hitsound")),
    guardSound: stripMugenString(findParam(controller, "guardsound")),
    hitSpark: staticProjectileSparkRef(findParam(controller, "sparkno")),
    hitSparkAngle: firstNumber(findParam(controller, "sparkangle")),
    guardSpark: staticProjectileSparkRef(findParam(controller, "guard.sparkno")),
    guardSparkAngle: firstNumber(findParam(controller, "guard.sparkangle")),
    sparkXy: pairWithDefaultOrUndefined(numberPair(findParam(controller, "sparkxy"))),
    removeOnHit: (firstNumber(findParam(controller, "projremove")) ?? 1) !== 0,
  });
}

function compileModifyProjectileControllerOp(controller: MugenStateController): ModifyProjectileControllerOp | undefined {
  const redirectPlayerIdExpression = compileRedirectPlayerIdExpression(controller);
  if (redirectPlayerIdExpression === "invalid") {
    return undefined;
  }
  const damageRaw = findParam(controller, "damage");
  const damage = damageRaw === undefined ? undefined : strictStaticNumberPair(damageRaw);
  const getPower = optionalIntegerExpressionPairParam(controller, "getpower");
  if (getPower === false) return undefined;
  const givePowerRaw = findParam(controller, "givepower");
  const givePower = givePowerRaw === undefined ? undefined : strictStaticNumberPair(givePowerRaw);
  const redLifeRaw = findParam(controller, "redlife");
  const redLife = redLifeRaw === undefined ? undefined : strictStaticNumberPair(redLifeRaw);
  const scoreRaw = findParam(controller, "score");
  const score = scoreRaw === undefined ? undefined : strictStaticNumberPair(scoreRaw);
  const attackDepthRaw = findParam(controller, "attack.depth");
  const attackDepth = attackDepthRaw === undefined ? undefined : strictStaticNumberPair(attackDepthRaw);
  const pauseTimeRaw = findParam(controller, "pausetime");
  const pauseTime = pauseTimeRaw === undefined ? undefined : strictStaticNumberPair(pauseTimeRaw);
  const guardPauseTimeRaw = findParam(controller, "guard.pausetime");
  const guardPauseTime = guardPauseTimeRaw === undefined ? undefined : strictStaticNumberPair(guardPauseTimeRaw);
  const guardDistanceBounds = staticProjectileGuardDistanceBounds(controller);
  const downVelocityRaw = findParam(controller, "down.velocity");
  const downVelocity = modifyProjectileVelocityVector(downVelocityRaw);
  const downVelocityValue = optionalModifyHitDefVelocityParam(controller, "down.velocity", true);
  if (
    downVelocityRaw !== undefined &&
    downVelocity === undefined &&
    downVelocityValue === false
  ) return undefined;
  const downVelocityExpressions = downVelocity === undefined && typeof downVelocityValue === "object"
    ? downVelocityValue.xy
    : undefined;
  const downVelocityZExpression = downVelocity === undefined && typeof downVelocityValue === "object"
    ? downVelocityValue.z
    : undefined;
  const airVelocityRaw = findParam(controller, "air.velocity");
  const airVelocity = modifyProjectileVelocityVector(airVelocityRaw);
  const airVelocityValue = optionalModifyHitDefVelocityParam(controller, "air.velocity", true);
  if (
    airVelocityRaw !== undefined &&
    airVelocity === undefined &&
    airVelocityValue === false
  ) return undefined;
  const airVelocityExpressions = airVelocity === undefined && typeof airVelocityValue === "object"
    ? airVelocityValue.xy
    : undefined;
  const airVelocityZExpression = airVelocity === undefined && typeof airVelocityValue === "object"
    ? airVelocityValue.z
    : undefined;
  const airGuardVelocityRaw = findParam(controller, "airguard.velocity");
  const airGuardVelocity = modifyProjectileVelocityVector(airGuardVelocityRaw);
  const airGuardVelocityValue = optionalModifyHitDefAirGuardVelocityParam(controller);
  if (
    airGuardVelocityRaw !== undefined &&
    airGuardVelocity === undefined &&
    airGuardVelocityValue === false
  ) return undefined;
  const airGuardVelocityExpressions = airGuardVelocity === undefined && typeof airGuardVelocityValue === "object"
    ? airGuardVelocityValue.xy
    : undefined;
  const airGuardVelocityZExpression = airGuardVelocity === undefined && typeof airGuardVelocityValue === "object"
    ? airGuardVelocityValue.z
    : undefined;
  const guardVelocityRaw = findParam(controller, "guard.velocity");
  const guardVelocity = modifyProjectileVelocityVector(guardVelocityRaw);
  const guardVelocityValue = optionalModifyHitDefVelocityParam(controller, "guard.velocity", true);
  if (
    guardVelocityRaw !== undefined &&
    guardVelocity === undefined &&
    guardVelocityValue === false
  ) return undefined;
  const guardVelocityExpressions = guardVelocity === undefined && typeof guardVelocityValue === "object"
    ? guardVelocityValue.xy
    : undefined;
  const guardVelocityZExpression = guardVelocity === undefined && typeof guardVelocityValue === "object"
    ? guardVelocityValue.z
    : undefined;
  const groundVelocityRaw = findParam(controller, "ground.velocity");
  const groundVelocity = modifyProjectileGroundVelocity(groundVelocityRaw);
  const groundVelocityValue = optionalModifyHitDefVelocityParam(controller, "ground.velocity", true);
  if (
    groundVelocityRaw !== undefined &&
    groundVelocity === undefined &&
    groundVelocityValue === false
  ) return undefined;
  const groundVelocityExpressions = groundVelocity === undefined && typeof groundVelocityValue === "object"
    ? groundVelocityValue.xy
    : undefined;
  const groundVelocityZExpression = groundVelocity === undefined && typeof groundVelocityValue === "object"
    ? groundVelocityValue.z
    : undefined;
  return definedObject({
    kind: "modifyprojectile" as const,
    ...(redirectPlayerIdExpression === undefined ? {} : { redirectPlayerIdExpression }),
    selectionId: firstNumber(findParam(controller, "id")),
    targetId: firstNumber(findParam(controller, "id")),
    chainId: firstNumber(findParam(controller, "chainid")),
    noChainIds: staticIntegerList(findParam(controller, "nochainid"), 8),
    selectionIndex: firstNumber(findParam(controller, "index")),
    projectileId: firstNumber(findParam(controller, "projid")),
    projAnim: firstNumber(findParam(controller, "projanim")),
    hitAnim: firstNumber(findParam(controller, "projhitanim")),
    removeAnim: firstNumber(findParam(controller, "projremanim")),
    cancelAnim: firstNumber(findParam(controller, "projcancelanim")),
    teamSide: normalizeMugenTeamSide(firstNumber(findParam(controller, "teamside"))),
    affectTeam: normalizeMugenAffectTeam(findParam(controller, "affectteam")),
    animType: hitAnimType(findParam(controller, "animtype")),
    airAnimType: hitAnimType(findParam(controller, "air.animtype")),
    fallAnimType: hitAnimType(findParam(controller, "fall.animtype")),
    kill: booleanNumber(findParam(controller, "kill")),
    guardKill: booleanNumber(findParam(controller, "guard.kill")),
    fallKill: booleanNumber(findParam(controller, "fall.kill")),
    forceNoFall: booleanNumber(findParam(controller, "forcenofall")),
    forceStand: booleanNumber(findParam(controller, "forcestand")),
    forceCrouch: booleanNumber(findParam(controller, "forcecrouch")),
    fallDamage: firstNumber(findParam(controller, "fall.damage")),
    fallXVelocity: firstNumber(findParam(controller, "fall.xvelocity")),
    fallYVelocity: firstNumber(findParam(controller, "fall.yvelocity")),
    fallZVelocity: firstNumber(findParam(controller, "fall.zvelocity")),
    fallRecover: booleanNumber(findParam(controller, "fall.recover")),
    fallRecoverTime: firstNumber(findParam(controller, "fall.recovertime")),
    downRecover: booleanNumber(findParam(controller, "down.recover")),
    downRecoverTime: firstNumber(findParam(controller, "down.recovertime")),
    fallEnvShakeTime: firstNumber(findParam(controller, "fall.envshake.time")),
    fallEnvShakeFrequency: firstNumber(findParam(controller, "fall.envshake.freq")),
    fallEnvShakeAmplitude: firstNumber(findParam(controller, "fall.envshake.ampl")),
    fallEnvShakePhase: firstNumber(findParam(controller, "fall.envshake.phase")),
    fallEnvShakeMultiplier: firstNumber(findParam(controller, "fall.envshake.mul")),
    fallEnvShakeDirection: firstNumber(findParam(controller, "fall.envshake.dir")),
    airJuggle: firstNumber(findParam(controller, "air.juggle")),
    damage: damage?.[0],
    guardDamage: damage === undefined ? undefined : damage[1] ?? 0,
    dizzyPoints: firstNumber(findParam(controller, "dizzypoints")),
    guardPoints: firstNumber(findParam(controller, "guardpoints")),
    hitPower: givePower?.[0],
    guardPower: givePower === undefined ? undefined : givePower[1] ?? 0,
    getPower: getPower === true ? undefined : getPower,
    redLife: redLife?.[0],
    guardRedLife: redLife === undefined ? undefined : redLife[1] ?? 0,
    score: score?.[0],
    guardScore: score === undefined ? undefined : score[1] ?? 0,
    hitDefHitCount: firstNumber(findParam(controller, "numhits")),
    hitPriority: firstNumber(findParam(controller, "priority")),
    hitPriorityType: hitDefPriorityType(findParam(controller, "priority")),
    p2SpritePriority: firstNumber(findParam(controller, "p2sprpriority")),
    p1StateNo: firstNumber(findParam(controller, "p1stateno")),
    p2StateNo: firstNumber(findParam(controller, "p2stateno")),
    p2GetP1State: booleanNumber(findParam(controller, "p2getp1state")),
    p2Facing: firstNumber(findParam(controller, "p2facing")),
    minDistance: modifyProjectileVelocityVector(findParam(controller, "mindist")),
    maxDistance: modifyProjectileVelocityVector(findParam(controller, "maxdist")),
    airHitTime: firstNumber(findParam(controller, "air.hittime")),
    groundFall: booleanNumber(findParam(controller, "fall")),
    airFall: booleanNumber(findParam(controller, "air.fall")),
    downBounce: booleanNumber(findParam(controller, "down.bounce")),
    hitStun: firstNumber(findParam(controller, "ground.hittime")),
    pauseTime: pauseTime === undefined ? undefined : [pauseTime[0], pauseTime[1] ?? 0] as [number, number],
    guardPauseTime: guardPauseTime === undefined
      ? undefined
      : [guardPauseTime[0], guardPauseTime[1] ?? 0] as [number, number],
    guardDistanceBounds,
    hitSpark: staticProjectileSparkRef(findParam(controller, "sparkno")),
    hitSparkAngle: firstNumber(findParam(controller, "sparkangle")),
    guardSpark: staticProjectileSparkRef(findParam(controller, "guard.sparkno")),
    guardSparkAngle: firstNumber(findParam(controller, "guard.sparkangle")),
    sparkXy: staticProjectileZeroDefaultPair(findParam(controller, "sparkxy")),
    groundSlideTime: firstNumber(findParam(controller, "ground.slidetime")),
    guardHitTime: firstNumber(findParam(controller, "guard.hittime")),
    guardSlideTime: firstNumber(findParam(controller, "guard.slidetime")),
    guardControlTime: firstNumber(findParam(controller, "guard.ctrltime")),
    airGuardControlTime: firstNumber(findParam(controller, "airguard.ctrltime")),
    downHitTime: firstNumber(findParam(controller, "down.hittime")),
    groundVelocity,
    ...(groundVelocityExpressions === undefined ? {} : { groundVelocityExpressions }),
    ...(groundVelocityZExpression === undefined ? {} : { groundVelocityZExpression }),
    downVelocity,
    ...(downVelocityExpressions === undefined ? {} : { downVelocityExpressions }),
    ...(downVelocityZExpression === undefined ? {} : { downVelocityZExpression }),
    airVelocity,
    ...(airVelocityExpressions === undefined ? {} : { airVelocityExpressions }),
    ...(airVelocityZExpression === undefined ? {} : { airVelocityZExpression }),
    guardVelocity,
    ...(guardVelocityExpressions === undefined ? {} : { guardVelocityExpressions }),
    ...(guardVelocityZExpression === undefined ? {} : { guardVelocityZExpression }),
    airGuardVelocity,
    ...(airGuardVelocityExpressions === undefined ? {} : { airGuardVelocityExpressions }),
    ...(airGuardVelocityZExpression === undefined ? {} : { airGuardVelocityZExpression }),
    xAccel: firstNumber(findParam(controller, "xaccel")),
    yAccel: firstNumber(findParam(controller, "yaccel")),
    zAccel: firstNumber(findParam(controller, "zaccel")),
    envShakeTime: firstNumber(findParam(controller, "envshake.time")),
    envShakeFrequency: firstNumber(findParam(controller, "envshake.freq")),
    envShakeAmplitude: firstNumber(findParam(controller, "envshake.ampl")),
    envShakePhase: firstNumber(findParam(controller, "envshake.phase")),
    envShakeMultiplier: firstNumber(findParam(controller, "envshake.mul")),
    envShakeDirection: firstNumber(findParam(controller, "envshake.dir")),
    missOnOverride: booleanNumber(findParam(controller, "missonoverride")),
    p2ClsnCheck: normalizeMugenCollisionBoxType(findParam(controller, "p2clsncheck")),
    p2ClsnRequire: normalizeMugenCollisionBoxType(findParam(controller, "p2clsnrequire")),
    attackDepth: attackDepth === undefined
      ? undefined
      : [attackDepth[0], attackDepth[1] ?? 0] as [number, number],
    attr: staticHitFlagParam(findParam(controller, "attr")),
    guardFlag: staticHitFlagParam(findParam(controller, "guardflag")),
    hitFlag: staticHitFlagParam(findParam(controller, "hitflag")),
    velocity: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "velocity") ?? findParam(controller, "vel"))),
    removalVelocity: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "remvelocity"))),
    acceleration: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "accel"))),
    velocityMultiplier: projectileVelocityMultiplierParam(findParam(controller, "velmul"), 0),
    scale: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "projscale") ?? findParam(controller, "scale"))),
    angle: firstNumber(findParam(controller, "projangle")),
    xAngle: firstNumber(findParam(controller, "projxangle")),
    yAngle: firstNumber(findParam(controller, "projyangle")),
    xShear: firstNumber(findParam(controller, "projxshear")),
    shadow: numberPartialTriple(findParam(controller, "projshadow")),
    reflection: firstNumber(findParam(controller, "projreflection")),
    projection: projectileProjection(findParam(controller, "projprojection")),
    focalLength: firstNumber(findParam(controller, "projfocallength")),
    window: numberQuad(findParam(controller, "projwindow")),
    clsnScale: projectileClsnScaleWithDefaultOrUndefined(numberPair(findParam(controller, "projclsnscale")), 0),
    clsnAngle: firstNumber(findParam(controller, "projclsnangle")),
    edgeBound: firstNumber(findParam(controller, "projedgebound")),
    stageBound: firstNumber(findParam(controller, "projstagebound")),
    depthBound: firstNumber(findParam(controller, "projdepthbound")),
    heightBound: projectileHeightBound(numberPair(findParam(controller, "projheightbound"))),
    removeTime: firstNumber(findParam(controller, "projremovetime") ?? findParam(controller, "removetime")),
    layerNo: projectileLayerNo(firstNumber(findParam(controller, "projlayerno"))),
    spritePriority: firstNumber(findParam(controller, "projsprpriority")),
    priority: firstNumber(findParam(controller, "projpriority")),
    hitCount: firstNumber(findParam(controller, "projhits")),
    missTime: firstNumber(findParam(controller, "projmisstime")),
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
    removeOnHit: booleanNumber(findParam(controller, "projremove")),
  });
}

function compileHelperControllerOp(controller: MugenStateController): HelperControllerOp | undefined {
  const helperType = compileHelperType(findParam(controller, "helpertype"));
  if (helperType === "invalid") return undefined;
  const standbyRaw = findParam(controller, "standby");
  let standby: boolean | undefined;
  let standbyExpression: string | undefined;
  if (standbyRaw !== undefined) {
    const trimmedStandby = standbyRaw.trim();
    if (!trimmedStandby) return undefined;
    const staticStandby = Number(trimmedStandby);
    if (Number.isFinite(staticStandby)) {
      standby = staticStandby !== 0;
    } else {
      if (!hasValidScalarExpressionStructure(standbyRaw)) return undefined;
      const compiledStandby = compileExpression(standbyRaw);
      if (compiledStandby.supportLevel === "unsupported") return undefined;
      standbyExpression = compiledStandby.normalized;
    }
  }
  const ownProjectileRaw = findParam(controller, "ownprojectile");
  let ownProjectile: boolean | undefined;
  let ownProjectileExpression: string | undefined;
  if (ownProjectileRaw !== undefined) {
    const trimmedOwnProjectile = ownProjectileRaw.trim();
    const staticOwnProjectile = Number(trimmedOwnProjectile);
    if (Number.isFinite(staticOwnProjectile)) {
      ownProjectile = staticOwnProjectile !== 0;
    } else {
      if (!hasValidScalarExpressionStructure(ownProjectileRaw)) return undefined;
      const compiledOwnProjectile = compileExpression(ownProjectileRaw);
      if (compiledOwnProjectile.supportLevel === "unsupported") return undefined;
      ownProjectile = false;
      ownProjectileExpression = compiledOwnProjectile.normalized;
    }
  }
  const inheritJuggleRaw = findParam(controller, "inheritjuggle");
  let inheritJuggle: 0 | 1 | 2 | undefined;
  let inheritJuggleExpression: string | undefined;
  if (inheritJuggleRaw !== undefined) {
    const trimmedInheritJuggle = inheritJuggleRaw.trim();
    if (!trimmedInheritJuggle) return undefined;
    const staticInheritJuggle = Number(trimmedInheritJuggle);
    if (Number.isFinite(staticInheritJuggle)) {
      const normalizedInheritJuggle = Math.trunc(staticInheritJuggle);
      if (!Number.isInteger(staticInheritJuggle) || (normalizedInheritJuggle !== 0 && normalizedInheritJuggle !== 1 && normalizedInheritJuggle !== 2)) {
        return undefined;
      }
      inheritJuggle = normalizedInheritJuggle;
    } else {
      if (!hasValidScalarExpressionStructure(inheritJuggleRaw)) return undefined;
      const compiledInheritJuggle = compileExpression(inheritJuggleRaw);
      if (compiledInheritJuggle.supportLevel === "unsupported") return undefined;
      inheritJuggle = 0;
      inheritJuggleExpression = compiledInheritJuggle.normalized;
    }
  }
  const ownPaletteRaw = findParam(controller, "ownpal");
  let ownPalette: boolean | undefined;
  let ownPaletteExpression: string | undefined;
  if (ownPaletteRaw !== undefined) {
    const trimmedOwnPalette = ownPaletteRaw.trim();
    const staticOwnPalette = Number(trimmedOwnPalette);
    if (Number.isFinite(staticOwnPalette)) {
      ownPalette = staticOwnPalette !== 0;
    } else {
      if (!hasValidScalarExpressionStructure(ownPaletteRaw)) return undefined;
      const compiledOwnPalette = compileExpression(ownPaletteRaw);
      if (compiledOwnPalette.supportLevel === "unsupported") return undefined;
      ownPalette = false;
      ownPaletteExpression = compiledOwnPalette.normalized;
    }
  }
  const preserveRaw = findParam(controller, "preserve");
  let preserve: boolean | undefined;
  let preserveExpression: string | undefined;
  if (preserveRaw !== undefined) {
    const trimmedPreserve = preserveRaw.trim();
    const staticPreserve = Number(trimmedPreserve);
    if (Number.isFinite(staticPreserve)) {
      preserve = staticPreserve !== 0;
    } else {
      if (!hasValidScalarExpressionStructure(preserveRaw)) return undefined;
      const compiledPreserve = compileExpression(preserveRaw);
      if (compiledPreserve.supportLevel === "unsupported") return undefined;
      preserve = false;
      preserveExpression = compiledPreserve.normalized;
    }
  }
  const ownClsnScaleRaw = findParam(controller, "ownclsnscale");
  let ownClsnScale: boolean | undefined;
  let ownClsnScaleExpression: string | undefined;
  if (ownClsnScaleRaw !== undefined) {
    const trimmedOwnClsnScale = ownClsnScaleRaw.trim();
    const staticOwnClsnScale = Number(trimmedOwnClsnScale);
    if (Number.isFinite(staticOwnClsnScale)) {
      ownClsnScale = staticOwnClsnScale !== 0;
    } else {
      if (!hasValidScalarExpressionStructure(ownClsnScaleRaw)) return undefined;
      const compiledOwnClsnScale = compileExpression(ownClsnScaleRaw);
      if (compiledOwnClsnScale.supportLevel === "unsupported") return undefined;
      ownClsnScale = false;
      ownClsnScaleExpression = compiledOwnClsnScale.normalized;
    }
  }
  const clsnProxyRaw = findParam(controller, "clsnproxy");
  let clsnProxy: boolean | undefined;
  let clsnProxyExpression: string | undefined;
  if (clsnProxyRaw !== undefined) {
    const trimmedClsnProxy = clsnProxyRaw.trim();
    const staticClsnProxy = Number(trimmedClsnProxy);
    if (Number.isFinite(staticClsnProxy)) {
      clsnProxy = staticClsnProxy !== 0;
    } else {
      if (!hasValidScalarExpressionStructure(clsnProxyRaw)) return undefined;
      const compiledClsnProxy = compileExpression(clsnProxyRaw);
      if (compiledClsnProxy.supportLevel === "unsupported") return undefined;
      clsnProxy = false;
      clsnProxyExpression = compiledClsnProxy.normalized;
    }
  }
  return definedObject({
    kind: "helper" as const,
    helperId: firstNumber(findParam(controller, "id")),
    helperType,
    name: stripMugenString(findParam(controller, "name")),
    stateNo: firstNumber(findParam(controller, "stateno") ?? findParam(controller, "value")),
    animNo: firstNumber(findParam(controller, "anim")),
    keyCtrl: booleanNumber(findParam(controller, "keyctrl")) ?? false,
    standby,
    standbyExpression,
    ownProjectile,
    ownProjectileExpression,
    inheritJuggle,
    inheritJuggleExpression,
    ownPalette,
    ownPaletteExpression,
    preserve,
    preserveExpression,
    ownClsnScale,
    ownClsnScaleExpression,
    clsnProxy,
    clsnProxyExpression,
    pos: tripleWithDefaultOrUndefined(numberTriple(findParam(controller, "pos"))),
    velocity: pairWithDefaultOrUndefined(numberPair(findParam(controller, "velset") ?? findParam(controller, "vel") ?? findParam(controller, "velocity"))),
    scale: scalePairWithDefaultOrUndefined(helperScalePair(controller)),
    postype: stripMugenString(findParam(controller, "postype")),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")) ?? 180,
    ignoreHitPause: booleanNumber(findParam(controller, "ignorehitpause")) ?? false,
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 3,
  });
}

function compileHelperType(raw: string | undefined): 1 | 2 | "invalid" | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "normal") return 1;
  if (value === "player") return 2;
  return "invalid";
}

function helperScalePair(controller: MugenStateController): [number, number?] | undefined {
  const explicit = numberPair(findParam(controller, "scale"));
  if (explicit) {
    return explicit;
  }
  const x = firstNumber(findParam(controller, "size.xscale") ?? findParam(controller, "xscale"));
  const y = firstNumber(findParam(controller, "size.yscale") ?? findParam(controller, "yscale"));
  return x === undefined && y === undefined ? undefined : [x ?? 1, y ?? x ?? 1];
}

function compileHelperBindControllerOp(controller: MugenStateController, type: HelperBindControllerOp["controllerType"]): HelperBindControllerOp {
  return definedObject({
    kind: "helper-bind" as const,
    controllerType: type,
    pos: pairWithDefault(numberPair(findParam(controller, "pos"))),
    time: controllerDuration(firstNumber(findParam(controller, "time")) ?? 1),
    facing: firstNumber(findParam(controller, "facing")),
  });
}

function compileExplodControllerOp(controller: MugenStateController): ExplodControllerOp {
  return definedObject({
    kind: "explod" as const,
    explodId: firstNumber(findParam(controller, "id")),
    animNo: firstNumber(findParam(controller, "anim")),
    pos: pairWithDefaultOrUndefined(numberPair(findParam(controller, "pos"))),
    postype: stripMugenString(findParam(controller, "postype")),
    bindTime: firstNumber(findParam(controller, "bindtime")),
    scale: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "scale"))),
    velocity: pairWithDefaultOrUndefined(numberPair(findParam(controller, "vel") ?? findParam(controller, "velocity"))),
    acceleration: pairWithDefaultOrUndefined(numberPair(findParam(controller, "accel"))),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")),
    removeOnGetHit: booleanNumber(findParam(controller, "removeongethit")) ?? false,
    ignoreHitPause: booleanNumber(findParam(controller, "ignorehitpause")) ?? false,
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 3,
    trans: stripMugenString(findParam(controller, "trans")),
  });
}

function compileRemoveExplodControllerOp(controller: MugenStateController): RemoveExplodControllerOp {
  return definedObject({
    kind: "removeexplod" as const,
    explodId: firstNumber(findParam(controller, "id")),
  });
}

function compileModifyExplodControllerOp(controller: MugenStateController): ModifyExplodControllerOp {
  return definedObject({
    kind: "modifyexplod" as const,
    explodId: firstNumber(findParam(controller, "id")),
    bindTime: firstNumber(findParam(controller, "bindtime")),
    scale: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "scale"))),
    velocity: pairWithDefaultOrUndefined(numberPair(findParam(controller, "vel") ?? findParam(controller, "velocity"))),
    acceleration: pairWithDefaultOrUndefined(numberPair(findParam(controller, "accel"))),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")),
    removeOnGetHit: booleanNumber(findParam(controller, "removeongethit")),
    ignoreHitPause: booleanNumber(findParam(controller, "ignorehitpause")),
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
    spritePriority: firstNumber(findParam(controller, "sprpriority")),
    trans: stripMugenString(findParam(controller, "trans")),
  });
}

function compileHitFallControllerOp(
  controller: MugenStateController,
  type: "hitfallvel" | "hitfalldamage" | "hitfallset",
): HitFallControllerOp {
  if (type === "hitfallset") {
    return definedObject({
      kind: "hitfall" as const,
      controllerType: "hitfallset" as const,
      falling: booleanNumber(findParam(controller, "value")),
      xVelocity: firstNumber(findParam(controller, "xvel") ?? findParam(controller, "x")),
      yVelocity: firstNumber(findParam(controller, "yvel") ?? findParam(controller, "y")),
      zVelocity: firstNumber(findParam(controller, "zvel") ?? findParam(controller, "z")),
    });
  }
  return { kind: "hitfall", controllerType: type };
}

function compileEnvShakeControllerOp(controller: MugenStateController): EnvShakeControllerOp | undefined {
  const time = staticNumberParam(controller, "time", 0);
  const freq = staticNumberParam(controller, "freq", 60);
  const ampl = staticNumberParam(controller, "ampl", -4);
  const phase = staticNumberParam(controller, "phase", 0);
  if (time === undefined || freq === undefined || ampl === undefined || phase === undefined) {
    return undefined;
  }
  const clampedTime = clampShakeTime(time);
  if (clampedTime <= 0) {
    return undefined;
  }
  return {
    kind: "envshake",
    time: clampedTime,
    freq: clampShakeFrequency(freq),
    ampl: clampShakeAmplitude(ampl),
    phase,
  };
}

function compileEnvColorControllerOp(controller: MugenStateController): EnvColorControllerOp | undefined {
  const color = strictNumberTripletOrDefault(findParam(controller, "value"), [255, 255, 255], 0, 255);
  const time = staticNumberParam(controller, "time", 1);
  const under = staticNumberParam(controller, "under", 0);
  if (color === undefined || time === undefined || under === undefined) {
    return undefined;
  }
  const clampedTime = clampEnvColorTime(time);
  if (clampedTime <= 0) {
    return undefined;
  }
  return {
    kind: "envcolor",
    color,
    time: clampedTime,
    under: under !== 0,
  };
}

function findParam(controller: MugenStateController, key: string): string | undefined {
  const lower = key.toLowerCase();
  return Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower)?.[1];
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function staticIntegerList(value: string | undefined, maxLength: number): number[] | undefined {
  if (value === undefined) return undefined;
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.some((part) => part.length === 0)) return undefined;
  const values = parts.slice(0, maxLength).map(Number);
  return values.every(Number.isFinite) ? values.map(Math.trunc) : undefined;
}

function optionalIntegerExpressionListParam(
  controller: MugenStateController,
  key: string,
  maxLength: number,
): number[] | "dynamic" | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  const staticValues = staticIntegerList(raw, maxLength);
  if (staticValues !== undefined) return staticValues;
  const expressions = raw.split(",").slice(0, maxLength).map((part) => part.trim());
  if (expressions.length === 0 || expressions.some((part) => part.length === 0)) return false;
  return expressions.every((expression) =>
    hasValidScalarExpressionStructure(expression) && compileExpression(expression).supportLevel !== "unsupported")
    ? "dynamic"
    : false;
}

function staticNumberParam(controller: MugenStateController, key: string, fallback: number): number | undefined {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return fallback;
  }
  return firstNumber(raw);
}

function staticSoundValueParam(controller: MugenStateController, key: string): string | undefined {
  const value = stripMugenString(findParam(controller, key));
  if (!value || !/^\s*S?\s*-?\d+\s*,\s*-?\d+/i.test(value)) {
    return undefined;
  }
  return value;
}

function staticOptionalNumberParam(controller: MugenStateController, ...keys: string[]): number | true | false {
  for (const key of keys) {
    const raw = findParam(controller, key);
    if (raw === undefined) {
      continue;
    }
    const value = firstNumber(raw);
    return value === undefined ? false : value;
  }
  return true;
}

function staticOptionalStrictNumberParam(controller: MugenStateController, key: string): number | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return true;
  }
  return strictNumberSingle(raw) ?? false;
}

/**
 * Keep one scalar controller parameter typed when it is static, while retaining
 * a supported expression for the runtime to evaluate in the active context.
 * `true` means omitted and `false` means malformed/unsupported.
 */
function optionalScalarNumberOrExpression(controller: MugenStateController, key: string): number | string | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return true;
  }
  const staticValue = strictNumberSingle(raw);
  if (staticValue !== undefined) {
    return staticValue;
  }
  if (!hasValidScalarExpressionStructure(raw)) {
    return false;
  }
  const compiled = compileExpression(raw);
  return compiled.supportLevel === "unsupported" ? false : compiled.normalized;
}

/** Compile one integer-valued expression, including redirect expressions with a top-level comma. */
function optionalIntegerExpressionParam(controller: MugenStateController, key: string): number | string | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  const value = compileFloatExpressionComponent(raw);
  if (value === undefined) return false;
  return typeof value === "number" ? Math.trunc(value) : value;
}

function optionalHitDefPaletteFxParam(
  controller: MugenStateController,
): MugenHitDefPaletteFxOp | true | false {
  const time = optionalIntegerExpressionParam(controller, "palfx.time");
  const add = optionalIntegerExpressionTripletParam(controller, "palfx.add");
  const mul = optionalIntegerExpressionTripletParam(controller, "palfx.mul");
  const color = optionalIntegerExpressionParam(controller, "palfx.color");
  const invertAll = optionalIntegerExpressionParam(controller, "palfx.invertall");
  if (time === false || add === false || mul === false || color === false || invertAll === false) return false;
  if (time === true && add === true && mul === true && color === true && invertAll === true) return true;
  return {
    ...(time === true ? {} : { time }),
    ...(add === true ? {} : { add }),
    ...(mul === true ? {} : { mul }),
    ...(color === true ? {} : { color }),
    ...(invertAll === true ? {} : { invertAll }),
  };
}

function optionalHitDefEnvShakeParam(
  controller: MugenStateController,
  prefix = "envshake",
): MugenHitDefEnvShakeOp | true | false {
  const time = optionalIntegerExpressionParam(controller, `${prefix}.time`);
  const freq = optionalFloatExpressionParam(controller, `${prefix}.freq`);
  const ampl = optionalIntegerExpressionParam(controller, `${prefix}.ampl`);
  const phase = optionalFloatExpressionParam(controller, `${prefix}.phase`);
  const mul = optionalFloatExpressionParam(controller, `${prefix}.mul`);
  const dir = optionalFloatExpressionParam(controller, `${prefix}.dir`);
  if (time === false || freq === false || ampl === false || phase === false || mul === false || dir === false) return false;
  if (time === true && freq === true && ampl === true && phase === true && mul === true && dir === true) return true;
  return {
    ...(time === true ? {} : { time }),
    ...(freq === true ? {} : { freq }),
    ...(ampl === true ? {} : { ampl }),
    ...(phase === true ? {} : { phase }),
    ...(mul === true ? {} : { mul }),
    ...(dir === true ? {} : { dir }),
  };
}

function optionalHitDefFallImpactParam(
  controller: MugenStateController,
): MugenHitDefFallImpactOp | true | false {
  const damage = optionalIntegerExpressionParam(controller, "fall.damage");
  const xVelocity = optionalFloatExpressionParam(controller, "fall.xvelocity");
  const yVelocity = optionalFloatExpressionParam(controller, "fall.yvelocity");
  const zVelocity = optionalFloatExpressionParam(controller, "fall.zvelocity");
  if (damage === false || xVelocity === false || yVelocity === false || zVelocity === false) return false;
  if (damage === true && xVelocity === true && yVelocity === true && zVelocity === true) return true;
  return {
    ...(damage === true ? {} : { damage }),
    ...(xVelocity === true ? {} : { xVelocity }),
    ...(yVelocity === true ? {} : { yVelocity }),
    ...(zVelocity === true ? {} : { zVelocity }),
  };
}

function optionalHitDefFallRecoveryParam(
  controller: MugenStateController,
): MugenHitDefFallRecoveryOp | true | false {
  const recover = optionalIntegerExpressionParam(controller, "fall.recover");
  const recoverTime = optionalIntegerExpressionParam(controller, "fall.recovertime");
  const downRecover = optionalIntegerExpressionParam(controller, "down.recover");
  const downRecoverTime = optionalIntegerExpressionParam(controller, "down.recovertime");
  if (recover === false || recoverTime === false || downRecover === false || downRecoverTime === false) return false;
  if (recover === true && recoverTime === true && downRecover === true && downRecoverTime === true) return true;
  return {
    ...(recover === true ? {} : { recover }),
    ...(recoverTime === true ? {} : { recoverTime }),
    ...(downRecover === true ? {} : { downRecover }),
    ...(downRecoverTime === true ? {} : { downRecoverTime }),
  };
}

function optionalHitDefFallFlagsParam(
  controller: MugenStateController,
): MugenHitDefFallFlagsOp | true | false {
  const enabled = optionalIntegerExpressionParam(controller, "fall");
  const airFall = optionalIntegerExpressionParam(controller, "air.fall");
  const kill = optionalIntegerExpressionParam(controller, "fall.kill");
  if (enabled === false || airFall === false || kill === false) return false;
  const dynamicKill = typeof kill === "string" ? kill : true;
  if (enabled === true && airFall === true && dynamicKill === true) return true;
  return {
    ...(enabled === true ? {} : { enabled }),
    ...(airFall === true ? {} : { airFall }),
    ...(dynamicKill === true ? {} : { kill: dynamicKill }),
  };
}

function optionalHitDefLethalFlagsParam(
  controller: MugenStateController,
): MugenHitDefLethalFlagsOp | true | false {
  const kill = optionalIntegerExpressionParam(controller, "kill");
  const guardKill = optionalIntegerExpressionParam(controller, "guard.kill");
  const hitOnce = optionalIntegerExpressionParam(controller, "hitonce");
  if (kill === false || guardKill === false || hitOnce === false) return false;
  const dynamicKill = typeof kill === "string" ? kill : true;
  const dynamicGuardKill = typeof guardKill === "string" ? guardKill : true;
  const dynamicHitOnce = typeof hitOnce === "string" ? hitOnce : true;
  if (dynamicKill === true && dynamicGuardKill === true && dynamicHitOnce === true) return true;
  return {
    ...(dynamicKill === true ? {} : { kill: dynamicKill }),
    ...(dynamicGuardKill === true ? {} : { guardKill: dynamicGuardKill }),
    ...(dynamicHitOnce === true ? {} : { hitOnce: dynamicHitOnce }),
  };
}

function optionalFloatExpressionParam(controller: MugenStateController, key: string): number | string | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  return compileFloatExpressionComponent(raw) ?? false;
}

function optionalIntegerExpressionTripletParam(
  controller: MugenStateController,
  key: string,
): MugenHitDefExpressionTriplet | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  const triplet = compileFloatExpressionTriplet(raw);
  if (!triplet) return false;
  return triplet.map((value) => typeof value === "number" ? Math.trunc(value) : value) as MugenHitDefExpressionTriplet;
}

/** Compile one or two float expressions while preserving an omitted second component. */
function optionalFloatExpressionPairParam(
  controller: MugenStateController,
  key: string,
): MugenHitDefExpressionPair | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  return compileFloatExpressionPair(raw) ?? false;
}

/** Compile one, two, or three float expressions while preserving authored arity. */
function optionalFloatExpressionVectorParam(
  controller: MugenStateController,
  key: string,
): MugenHitDefExpressionPair | MugenHitDefExpressionTriplet | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  return compileFloatExpressionVector(raw) ?? false;
}

function compileFloatExpressionPair(raw: string): MugenHitDefExpressionPair | undefined {
  const scalar = compileFloatExpressionComponent(raw);
  if (scalar !== undefined) return [scalar];
  const splitIndices = topLevelExpressionCommaIndices(raw);
  if (!splitIndices) return undefined;
  for (const index of splitIndices) {
    const first = compileFloatExpressionComponent(raw.slice(0, index));
    const second = compileFloatExpressionComponent(raw.slice(index + 1));
    if (first !== undefined && second !== undefined) return [first, second];
  }
  return undefined;
}

function compileFloatExpressionVector(raw: string): MugenHitDefExpressionPair | MugenHitDefExpressionTriplet | undefined {
  return compileFloatExpressionPair(raw) ?? compileFloatExpressionTriplet(raw);
}

function compileFloatExpressionTriplet(raw: string): MugenHitDefExpressionTriplet | undefined {
  const splitIndices = topLevelExpressionCommaIndices(raw);
  if (!splitIndices || splitIndices.length < 2) return undefined;
  for (let firstIndex = 0; firstIndex < splitIndices.length - 1; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < splitIndices.length; secondIndex += 1) {
      const firstCut = splitIndices[firstIndex]!;
      const secondCut = splitIndices[secondIndex]!;
      const first = compileFloatExpressionComponent(raw.slice(0, firstCut));
      const second = compileFloatExpressionComponent(raw.slice(firstCut + 1, secondCut));
      const third = compileFloatExpressionComponent(raw.slice(secondCut + 1));
      if (first !== undefined && second !== undefined && third !== undefined) return [first, second, third];
    }
  }
  return undefined;
}

function compileFloatExpressionComponent(raw: string): number | string | undefined {
  const staticValue = strictNumberSingle(raw);
  if (staticValue !== undefined) return staticValue;
  if (!hasValidRedirectAwareScalarExpressionStructure(raw)) return undefined;
  const expression = compileExpression(raw);
  return expression.supportLevel === "unsupported" ? undefined : expression.normalized;
}

function hasValidRedirectAwareScalarExpressionStructure(raw: string): boolean {
  const expression = raw.trim();
  if (!expression) return false;
  const commaIndices = topLevelExpressionCommaIndices(expression);
  if (!commaIndices) return false;
  let segmentStart = 0;
  for (const index of commaIndices) {
    if (!endsWithRedirectSelector(expression.slice(segmentStart, index))) return false;
    segmentStart = index + 1;
  }
  return expression.slice(segmentStart).trim().length > 0;
}

function endsWithRedirectSelector(raw: string): boolean {
  const expression = raw.trimEnd();
  if (!expression) return false;
  let identifierEnd = expression.length;
  if (expression[identifierEnd - 1] === ")") {
    let depth = 0;
    let openIndex = -1;
    for (let index = identifierEnd - 1; index >= 0; index -= 1) {
      const char = expression[index]!;
      if (char === ")") depth += 1;
      else if (char === "(") {
        depth -= 1;
        if (depth === 0) {
          openIndex = index;
          break;
        }
      }
    }
    if (openIndex < 0) return false;
    identifierEnd = openIndex;
    while (identifierEnd > 0 && /\s/.test(expression[identifierEnd - 1]!)) identifierEnd -= 1;
  }
  let identifierStart = identifierEnd;
  while (identifierStart > 0 && /[A-Za-z]/.test(expression[identifierStart - 1]!)) identifierStart -= 1;
  const identifier = expression.slice(identifierStart, identifierEnd).toLowerCase();
  return (
    identifier === "parent" ||
    identifier === "root" ||
    identifier === "partner" ||
    identifier === "enemynear" ||
    identifier === "enemy" ||
    identifier === "target" ||
    identifier === "playerid"
  );
}

function topLevelExpressionCommaIndices(raw: string): number[] | undefined {
  const indices: number[] = [];
  let depth = 0;
  let quote: '"' | "'" | undefined;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index]!;
    if (quote) {
      if (char === quote) quote = undefined;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "," && depth === 0) indices.push(index);
    if (depth < 0) return undefined;
  }
  return quote || depth !== 0 ? undefined : indices;
}

/** Compile one or two integer-valued expressions without splitting function arguments. */
function optionalIntegerExpressionPairParam(
  controller: MugenStateController,
  key: string,
): MugenHitDefExpressionPair | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  const pair = compileFloatExpressionPair(raw);
  if (!pair) return false;
  const first = typeof pair[0] === "number" ? Math.trunc(pair[0]) : pair[0];
  if (pair[1] === undefined) return [first];
  const second = typeof pair[1] === "number" ? Math.trunc(pair[1]) : pair[1];
  return [first, second];
}

function optionalModifyHitDefVelocityParam(
  controller: MugenStateController,
  key: "ground.velocity" | "air.velocity" | "down.velocity" | "guard.velocity",
  allowDynamicZ = false,
): { xy: MugenHitDefExpressionPair; z?: number | string } | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) return true;
  const staticVector = strictStaticNumberVector(raw);
  if (staticVector !== undefined) {
    return {
      xy: staticVector[1] === undefined ? [staticVector[0]] : [staticVector[0], staticVector[1]],
      ...(staticVector[2] === undefined ? {} : { z: staticVector[2] }),
    };
  }
  const dynamicPair = compileFloatExpressionPair(raw);
  if (dynamicPair !== undefined) return { xy: dynamicPair };
  if (!allowDynamicZ) return false;
  const dynamicTriplet = compileFloatExpressionTriplet(raw);
  return dynamicTriplet === undefined
    ? false
    : { xy: [dynamicTriplet[0], dynamicTriplet[1]], z: dynamicTriplet[2] };
}

function optionalModifyHitDefAirGuardVelocityParam(
  controller: MugenStateController,
): { xy: MugenHitDefExpressionPair; z?: number | string } | true | false {
  const raw = findParam(controller, "airguard.velocity");
  if (raw === undefined) return true;
  const staticVector = strictStaticNumberVector(raw);
  if (staticVector !== undefined) {
    return {
      xy: staticVector[1] === undefined ? [staticVector[0]] : [staticVector[0], staticVector[1]],
      ...(staticVector[2] === undefined ? {} : { z: staticVector[2] }),
    };
  }
  const dynamicPair = compileFloatExpressionPair(raw);
  if (dynamicPair !== undefined) return { xy: dynamicPair };
  const dynamicTriplet = compileFloatExpressionTriplet(raw);
  return dynamicTriplet === undefined
    ? false
    : { xy: [dynamicTriplet[0], dynamicTriplet[1]], z: dynamicTriplet[2] };
}

function staticOptionalGuardFlagParam(controller: MugenStateController, key: string): string | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return true;
  }
  const value = stripMugenString(raw)?.replace(/[\s,]+/g, "").toUpperCase();
  if (!value || !/^[HLMA]+$/.test(value)) {
    return false;
  }
  return value;
}

function staticOptionalHitAttributeParam(controller: MugenStateController, key: string): string | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return true;
  }
  const value = stripMugenString(raw)?.replace(/\s+/g, "").toUpperCase();
  const parts = value?.split(",");
  if (!parts || parts.length < 2 || !/^[SCA]+$/.test(parts[0] ?? "") || parts.slice(1).some((part) => !/^[A-Z]+$/.test(part))) {
    return false;
  }
  return parts.join(",");
}

function staticOptionalReversalSpritePriorityParam(controller: MugenStateController, key: string): number | true | false {
  const value = staticOptionalStrictNumberParam(controller, key);
  return typeof value === "number" ? Math.trunc(value) : value;
}

function optionalHitDefPriorityParam(
  controller: MugenStateController,
): { priority: number | string; priorityType: "hit" | "miss" | "dodge" } | true | false {
  const raw = findParam(controller, "priority");
  if (raw === undefined) {
    return true;
  }
  const scalar = compileFloatExpressionComponent(raw);
  if (scalar !== undefined) {
    return { priority: typeof scalar === "number" ? Math.trunc(scalar) : scalar, priorityType: "hit" };
  }
  const commaIndices = topLevelExpressionCommaIndices(raw);
  if (!commaIndices) return false;
  for (let index = commaIndices.length - 1; index >= 0; index -= 1) {
    const splitIndex = commaIndices[index]!;
    const priorityType = staticHitDefPriorityType(raw.slice(splitIndex + 1));
    if (priorityType === undefined) continue;
    const value = compileFloatExpressionComponent(raw.slice(0, splitIndex));
    if (value !== undefined) {
      return { priority: typeof value === "number" ? Math.trunc(value) : value, priorityType };
    }
  }
  return false;
}

function staticHitDefPriorityType(value: string | undefined): "hit" | "miss" | "dodge" | undefined {
  switch (stripMugenString(value)?.trim().toLowerCase()[0]) {
    case undefined:
    case "":
    case "h":
      return "hit";
    case "m":
      return "miss";
    case "d":
      return "dodge";
    default:
      return undefined;
  }
}

function staticOptionalReversalFacingParam(controller: MugenStateController, key: string): number | true | false {
  const value = staticOptionalStrictNumberParam(controller, key);
  return typeof value === "number" ? Math.trunc(value) : value;
}

function staticOptionalIntegerParam(controller: MugenStateController, key: string): number | true | false {
  const value = staticOptionalStrictNumberParam(controller, key);
  return typeof value === "number" ? Math.trunc(value) : value;
}

function staticOptionalHitCountParam(controller: MugenStateController, key: string): number | true | false {
  return staticOptionalIntegerParam(controller, key);
}

function staticOptionalHitFlagParam(controller: MugenStateController, key: string): string | true | false {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return true;
  }
  return staticHitFlagParam(raw) ?? false;
}

function staticOptionalReversalBooleanParam(
  controller: MugenStateController,
  key: string,
): boolean | undefined | "invalid" {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  const value = strictNumberSingle(raw);
  return value === undefined ? "invalid" : value !== 0;
}

function staticOptionalBooleanParam(controller: MugenStateController, key: string): boolean | undefined {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return false;
  }
  return booleanNumber(raw);
}

function staticDurationParam(controller: MugenStateController, key: string, fallback: number): number | undefined {
  const value = staticNumberParam(controller, key, fallback);
  return value === undefined ? undefined : controllerDuration(value);
}

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function hitDefPriorityType(value: string | undefined): "hit" | "miss" | "dodge" | undefined {
  const normalized = /,\s*"?(hit|miss|dodge)"?\s*$/i.exec(value ?? "")?.[1]?.toLowerCase();
  return normalized === "hit" || normalized === "miss" || normalized === "dodge" ? normalized : undefined;
}

function numberPair(value: string | undefined): [number, number?] | undefined {
  if (!value) {
    return undefined;
  }
  const values = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter(Number.isFinite);
  if (values.length === 0 || values[0] === undefined) {
    return undefined;
  }
  return values.length > 1 ? [values[0], values[1]] : [values[0]];
}

function normalizedNumberPair(value: string | undefined): [number, number] | undefined {
  const pair = numberPair(value);
  return pair ? [pair[0], pair[1] ?? pair[0]] : undefined;
}

function projectilePaletteRemap(value: string | undefined): [number, number] | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length !== 2 || !Number.isFinite(values[0]) || !Number.isFinite(values[1])) return undefined;
  return [Math.trunc(values[0]!), Math.trunc(values[1]!)];
}

function numberTriple(value: string | undefined): [number, number, number?] | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(values[0]) || !Number.isFinite(values[1])) return undefined;
  return Number.isFinite(values[2]) ? [values[0]!, values[1]!, values[2]!] : [values[0]!, values[1]!];
}

function numberPartialTriple(value: string | undefined): [number, number?, number?] | undefined {
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

function modifyProjectileVelocityVector(value: string | undefined): MugenHitDefVector | undefined {
  const parts = value?.split(",").map((part) => part.trim()) ?? [];
  if (parts.length < 1 || parts.length > 3 || parts.some((part) => part.length === 0)) {
    return undefined;
  }
  const vector = parts.map(Number);
  return vector.every(Number.isFinite)
    ? [vector[0]!, vector[1] ?? 0, vector[2] ?? 0]
    : undefined;
}

function modifyProjectileGroundVelocity(value: string | undefined): MugenPartialHitDefVector | undefined {
  const parts = value?.split(",").map((part) => part.trim()) ?? [];
  if (parts.length < 1 || parts.length > 3 || parts.some((part) => part.length === 0)) {
    return undefined;
  }
  const result: MugenPartialHitDefVector = {};
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

function numberQuad(value: string | undefined): MugenProjectileWindow | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  return values.length === 4 && values.every(Number.isFinite)
    ? [values[0]!, values[1]!, values[2]!, values[3]!]
    : undefined;
}

function projectileProjection(value: string | undefined): MugenProjectileProjection | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized === "orthographic" || normalized === "perspective" || normalized === "perspective2"
    ? normalized
    : undefined;
}

function hitDefVelocity(value: string | undefined): MugenHitDefVector | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(values[0])) return undefined;
  if (Number.isFinite(values[1]) && Number.isFinite(values[2])) {
    return [values[0]!, values[1]!, values[2]!];
  }
  return Number.isFinite(values[1]) ? [values[0]!, values[1]] : [values[0]!];
}

function posWithPostype(value: string | undefined): { pos: [number, number]; postype?: "foot" | "mid" | "head" } | undefined {
  if (!value) {
    return undefined;
  }
  const [xRaw, yRaw, postypeRaw] = value.split(",").map((part) => part.trim());
  const x = Number(xRaw);
  const y = Number(yRaw);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return undefined;
  }
  const postype = normalizeBindPostype(postypeRaw);
  return {
    pos: [x, y],
    ...(postype ? { postype } : {}),
  };
}

function normalizeBindPostype(value: string | undefined): "foot" | "mid" | "head" | undefined {
  const normalized = value?.replace(/^"|"$/g, "").trim().toLowerCase();
  if (normalized === "foot" || normalized === "mid" || normalized === "head") {
    return normalized;
  }
  return undefined;
}

function strictNumberPair(value: string | undefined): [number, number?] | undefined {
  if (!value) {
    return undefined;
  }
  const rawParts = value.split(",").map((part) => part.trim());
  const values = rawParts.map((part) => Number(part));
  if (values.length === 0 || values.some((item) => !Number.isFinite(item)) || values[0] === undefined) {
    return undefined;
  }
  return values.length > 1 ? [values[0], values[1]] : [values[0]];
}

function strictStaticNumberPair(value: string): [number, number?] | undefined {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.length > 2 || parts.some((part) => part.length === 0)) {
    return undefined;
  }
  return strictNumberPair(value);
}

function staticProjectileGuardDistanceBounds(
  controller: MugenStateController,
): MugenProjectileGuardDistanceBounds | undefined {
  const widthRaw = findParam(controller, "guard.dist.width") ?? findParam(controller, "guard.dist");
  const heightRaw = findParam(controller, "guard.dist.height");
  const depthRaw = findParam(controller, "guard.dist.depth");
  const width = widthRaw === undefined ? undefined : strictStaticNumberPair(widthRaw);
  const height = heightRaw === undefined ? undefined : strictStaticNumberPair(heightRaw);
  const depth = depthRaw === undefined ? undefined : strictStaticNumberPair(depthRaw);
  if (width === undefined && height === undefined && depth === undefined) {
    return undefined;
  }
  return {
    ...(width === undefined ? {} : { width: [width[0], width[1] ?? 0] as [number, number] }),
    ...(height === undefined ? {} : { height: [height[0], height[1] ?? 0] as [number, number] }),
    ...(depth === undefined ? {} : { depth: [depth[0], depth[1] ?? 0] as [number, number] }),
  };
}

function staticProjectileSparkRef(value: string | undefined): string | undefined {
  const normalized = stripMugenString(value);
  return normalized && /^[fs]?-?\d+$/i.test(normalized) ? normalized : undefined;
}

function staticProjectileZeroDefaultPair(value: string | undefined): [number, number] | undefined {
  const pair = value === undefined ? undefined : strictStaticNumberPair(value);
  return pair === undefined ? undefined : [pair[0], pair[1] ?? 0];
}

function strictStaticNumberVector(value: string): MugenHitDefVector | undefined {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0 || parts.length > 3 || parts.some((part) => part.length === 0)) {
    return undefined;
  }
  const values = parts.map((part) => Number(part));
  if (values.some((item) => !Number.isFinite(item)) || values[0] === undefined) {
    return undefined;
  }
  if (values.length === 3) return [values[0], values[1], values[2]];
  return values.length === 2 ? [values[0], values[1]] : [values[0]];
}

function strictNumberSingle(value: string | undefined): number | undefined {
  if (!value || value.includes(",")) {
    return undefined;
  }
  const numberValue = Number(value.trim());
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function strictNumberPairExact(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length < 2 || values.some((item) => !Number.isFinite(item))) {
    return undefined;
  }
  return [values[0]!, values[1]!];
}

function strictNumberTripletOrDefault(
  value: string | undefined,
  fallback: [number, number, number],
  min: number,
  max: number,
): [number, number, number] | undefined {
  if (value === undefined) {
    return fallback;
  }
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length < 3 || values.some((item) => !Number.isFinite(item))) {
    return undefined;
  }
  return [clampNumber(values[0]!, min, max), clampNumber(values[1]!, min, max), clampNumber(values[2]!, min, max)];
}

function pairWithDefault(value: [number, number?] | undefined): [number, number] {
  return [value?.[0] ?? 0, value?.[1] ?? 0];
}

function pairWithDefaultOrUndefined(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? pairWithDefault(value) : undefined;
}

function tripleWithDefault(value: MugenProjectileVector | undefined): MugenProjectileVector {
  return value?.[2] === undefined ? [value?.[0] ?? 0, value?.[1] ?? 0] : [value[0], value[1], value[2]];
}

function tripleWithDefaultOrUndefined(value: MugenProjectileVector | undefined): MugenProjectileVector | undefined {
  return value ? tripleWithDefault(value) : undefined;
}

function projectileHeightBound(value: [number, number?] | undefined): { low: number; high: number } | undefined {
  if (!value) {
    return undefined;
  }
  const low = value[0];
  const high = value[1] ?? value[0];
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

function projectileLayerNo(value: number | undefined): -1 | 0 | 1 | undefined {
  if (value === undefined) return undefined;
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

function scalePairWithDefaultOrUndefined(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? [value[0], value[1] ?? value[0]] : undefined;
}

function projectileVelocityMultiplierParam(
  value: string | undefined,
  trailingDefault: number,
): MugenProjectileVector | undefined {
  if (!value) return undefined;
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(parts[0])) return undefined;
  return [
    parts[0]!,
    Number.isFinite(parts[1]) ? parts[1]! : trailingDefault,
    Number.isFinite(parts[2]) ? parts[2]! : trailingDefault,
  ];
}

function projectileClsnScaleWithDefaultOrUndefined(
  value: [number, number?] | undefined,
  secondDefault: number,
): [number, number] | undefined {
  return value ? [value[0], value[1] ?? secondDefault] : undefined;
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function staticHitFlagParam(value: string | undefined): string | undefined {
  const stripped = stripMugenString(value);
  return stripped && !/[()]/.test(stripped) ? stripped : undefined;
}

function hitAnimType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) {
    return undefined;
  }
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

function hitType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) {
    return undefined;
  }
  const values: Record<string, number> = {
    high: 1,
    low: 2,
    trip: 3,
  };
  return values[normalized];
}

function normalizeStateType(value: string | undefined): MetadataControllerOp["stateType"] | undefined {
  const normalized = stripMugenString(value)?.toUpperCase();
  return normalized === "S" || normalized === "C" || normalized === "A" || normalized === "L" ? normalized : undefined;
}

function normalizeMoveType(value: string | undefined): MetadataControllerOp["moveType"] | undefined {
  const normalized = stripMugenString(value)?.toUpperCase();
  return normalized === "I" || normalized === "A" || normalized === "H" ? normalized : undefined;
}

function normalizePhysics(value: string | undefined): MetadataControllerOp["physics"] | undefined {
  const normalized = stripMugenString(value)?.toUpperCase();
  return normalized === "S" || normalized === "C" || normalized === "A" || normalized === "N" ? normalized : undefined;
}

function assertSpecialFlagParams(controller: MugenStateController): string[] {
  return Object.entries(controller.params)
    .filter(([key]) => key.toLowerCase().startsWith("flag"))
    .flatMap(([, value]) => value.split(",").map((part) => part.trim()))
    .filter(Boolean);
}

function normalizeAssertSpecialFlag(rawFlag: string): { name: string; global: boolean } | undefined {
  const name = stripMugenString(rawFlag)?.toLowerCase();
  if (!name || !/^[a-z][a-z0-9_]*$/.test(name)) {
    return undefined;
  }
  const globalFlags = new Set([
    "intro",
    "globalnoko",
    "globalnoshadow",
    "nobardisplay",
    "nobg",
    "nofg",
    "nokoslow",
    "nokosnd",
    "nomusic",
    "roundnotover",
    "skipfightdisplay",
    "skiprounddisplay",
    "timerfreeze",
  ]);
  return { name, global: globalFlags.has(name) };
}

function booleanNumber(value: string | undefined): boolean | undefined {
  const numberValue = firstNumber(value);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

function optionalBooleanParam(value: string | undefined): boolean | "invalid" | undefined {
  if (value === undefined) {
    return undefined;
  }
  return booleanNumber(value) ?? "invalid";
}

function clampStaticBodyWidth(value: number): number {
  return Math.max(1, Math.min(160, Math.abs(Math.round(value))));
}

function clampSpritePriority(value: number): number {
  return Math.max(-5, Math.min(10, Math.round(value)));
}

function clampPaletteFxTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampPaletteFxColor(value: number): number {
  return Math.max(0, Math.min(256, Math.round(value)));
}

function clampAfterImageTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampAfterImageLength(value: number): number {
  return Math.max(1, Math.min(24, Math.round(value)));
}

function clampAfterImageGap(value: number): number {
  return Math.max(1, Math.min(30, Math.round(value)));
}

function clampRenderAngle(value: number): number {
  return Math.max(-720, Math.min(720, Math.round(value * 1000) / 1000));
}

function clampRenderScalePair(value: [number, number]): [number, number] {
  return [clampRenderScale(value[0]), clampRenderScale(value[1])];
}

function clampRenderScale(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0.05, Math.min(8, Math.abs(value)));
}

function clampHitAdd(value: number): number {
  return clampNumber(Math.round(value), -999, 999);
}

function normalizeAfterImageOpacity(value: string | undefined): number {
  const normalized = stripMugenString(value)?.toLowerCase();
  if (!normalized) {
    return 0.42;
  }
  if (normalized.includes("add")) {
    return 0.34;
  }
  if (normalized.includes("none")) {
    return 0.25;
  }
  return 0.42;
}

function normalizeTransOpacity(value: string, alpha?: [number, number]): number {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "default") {
    return 1;
  }
  if (normalized === "none") {
    return 1;
  }
  if (normalized.includes("addalpha") || normalized.includes("alpha")) {
    const alphaSource = alpha?.[0];
    const source = alphaSource ?? transInlineAlphaSource(normalized);
    return source === undefined ? 0.5 : Math.max(0, Math.min(1, source / 256));
  }
  if (normalized.includes("add")) {
    return 0.78;
  }
  if (normalized.includes("sub")) {
    return 0.65;
  }
  return 1;
}

function hasInvalidInlineTransAlpha(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized.includes("addalpha") && !normalized.includes("alpha")) {
    return false;
  }
  const [, ...alphaParts] = normalized.split(",");
  return alphaParts.some((part) => {
    const trimmed = part.trim();
    return trimmed.length > 0 && !Number.isFinite(Number(trimmed));
  });
}

function transInlineAlphaSource(value: string): number | undefined {
  const [, sourceRaw] = value.split(",");
  const source = Number(sourceRaw?.trim());
  return Number.isFinite(source) ? source : undefined;
}

function normalizePaletteNumber(value: number): number {
  return Math.max(0, Math.round(value));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeRandomRange(first: number, second: number): [number, number] {
  const lower = Math.round(Math.min(first, second));
  const upper = Math.round(Math.max(first, second));
  return [lower, upper];
}

function clampEnvColorTime(value: number): number {
  return Math.max(0, Math.min(240, Math.round(value)));
}

function clampShakeTime(value: number): number {
  return Math.max(0, Math.min(240, Math.round(value)));
}

function clampShakeFrequency(value: number): number {
  return Math.max(1, Math.min(180, Math.abs(value)));
}

function clampShakeAmplitude(value: number): number {
  return Math.max(-64, Math.min(64, value));
}

function controllerDuration(value: number): number {
  if (value < 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.min(3600, Math.round(value)));
}

function clampIndex(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function definedObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

function addUnique<T>(values: T[], value: T): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

import type { HitDefControllerOp, ModifyHitDefControllerOp, MugenHitDefEnvShakeOp, MugenHitDefExpressionPair, MugenHitDefFallFlagsOp, MugenHitDefFallImpactOp, MugenHitDefFallRecoveryOp, MugenHitDefLethalFlagsOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenAnimationFrame } from "../model/MugenAnimation";
import type { CollisionBox } from "../model/CollisionBox";
import { normalizeMugenCollisionBoxType } from "../model/CollisionBox";
import { normalizeMugenAffectTeam, normalizeMugenTeamSide } from "../model/MugenTeam";
import type { MugenStateController } from "../model/MugenState";
import { DEFAULT_RUNTIME_GUARD_DISTANCE, parseHitAttribute } from "./CombatResolver";
import type { DemoMove } from "./demoFighters";
import { resolveHitDefCornerPush } from "./HitDefCornerPush";
import { normalizeRuntimeHitDefPriority } from "./HitDefContactPriority";
import { resolveHitDefGuardTiming } from "./HitDefTiming";
import { derivePinnedIkemenFreshAirGuardVelocity } from "./HitDefVelocity";
import { runtimeDizzyPointsFromHitDef } from "./DizzyPointsDefaults";
import { runtimeHitDefGetPowerDefaults, runtimeHitDefGivePowerDefaults } from "./HitDefGetPowerDefaults";
import { resolveRuntimeHitDefPaletteFx } from "./HitDefPaletteFx";
import { runtimeAnimationFrameDuration } from "./RuntimeAnimationSystem";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import { resetRuntimeHitDefContactMemory, type RuntimeHitDefContactMemoryActor } from "./RuntimeHitDefContactMemorySystem";
import { applyRuntimeHitDefJuggle } from "./RuntimeJuggleSystem";
import { applyRuntimeControl } from "./RuntimeResourceSystem";
import { findControllerParam } from "./StateProgramExecutor";
import { evaluateRuntimeControllerNumber, type RuntimeControllerEvaluationContext } from "./RuntimeControllerExpressionContextSystem";
import type { CharacterRuntimeState, RuntimeContactEnvShake, RuntimeHitVelocityMetadata, RuntimeResolvedSoundRef } from "./types";
import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";
import type { RuntimePaletteFxResolver } from "./SpriteEffectSystem";

export type RuntimeHitDefControllerDispatchActor = {
  runtime: CharacterRuntimeState;
  currentMove?: DemoMove;
  currentMoveLabel?: string;
  moveTick: number;
  frameElapsed: number;
  hasHit: boolean;
  hitDefTargets?: RuntimeHitDefContactMemoryActor["hitDefTargets"];
  pendingHitDefTargets?: RuntimeHitDefContactMemoryActor["pendingHitDefTargets"];
  firedHitDefs: Set<string>;
  constants?: RuntimeResourceConstants;
};

export type RuntimeHitDefControllerDispatchOptions<TActor extends RuntimeHitDefControllerDispatchActor> = {
  actor: TActor;
  controller: ControllerIr;
  defaultHitFlag?: string;
  frame?: MugenAnimationFrame;
  constants?: RuntimeResourceConstants;
  /** Active controller-expression bindings for dynamic scalar HitDef fields. */
  context?: RuntimeControllerEvaluationContext;
  resolveIntegerList?: (key: "nochainid") => number[] | undefined;
  resolveIntegerPair?: (key: "damage" | "pausetime" | "guard.pausetime" | "unhittabletime" | "getpower" | "givepower") => [number?, number?] | undefined;
  resolveIntegerScalar?: (key: "id" | "chainid" | "p1facing" | "p1getp2facing" | "p2facing" | "p1sprpriority" | "p2sprpriority" | "priority" | "ground.hittime" | "ground.slidetime" | "air.hittime" | "down.hittime" | "guard.hittime" | "guard.slidetime" | "guard.ctrltime" | "airguard.ctrltime" | "guard.dist" | "down.bounce" | "air.juggle" | "numhits" | "forcestand" | "forcecrouch" | "forcenofall" | "p1stateno" | "p2stateno" | "p2getp1state" | "hitsound.channel" | "guardsound.channel") => number | undefined;
  resolveScalar?: (key: "stand.friction" | "crouch.friction") => number | undefined;
  resolveFloatPair?: (key: "ground.velocity" | "air.velocity" | "down.velocity" | "guard.velocity" | "airguard.velocity" | "sparkscale" | "guard.sparkscale" | "sparkxy" | "snap") => [number?, number?] | undefined;
  resolveFloatScalar?: (key: "down.velocity" | "guard.velocity" | "airguard.velocity" | "snap" | "ground.cornerpush.veloff" | "air.cornerpush.veloff" | "down.cornerpush.veloff" | "guard.cornerpush.veloff" | "airguard.cornerpush.veloff" | "sparkangle" | "guard.sparkangle") => number | undefined;
  resolvePaletteFx?: RuntimePaletteFxResolver;
  resolveEnvShake?: RuntimeHitDefEnvShakeResolver;
  resolveFallEnvShake?: RuntimeHitDefEnvShakeResolver;
  resolveFallImpact?: RuntimeHitDefFallImpactResolver;
  resolveFallRecovery?: RuntimeHitDefFallRecoveryResolver;
  resolveFallFlags?: RuntimeHitDefFallFlagsResolver;
  resolveLethalFlags?: RuntimeHitDefLethalFlagsResolver;
  /** When `ikemen-go`, an explicit HitDef `air.juggle` arms the active character juggle cost. */
  runtimeProfile?: RuntimeCompatibilityProfile;
  resolveSoundValue?: (key: "hitsound" | "guardsound") => RuntimeResolvedSoundRef | undefined;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: HitDefControllerOp) => void;
};

export type RuntimeHitDefControllerDispatchResult = {
  activated: boolean;
  duplicate: boolean;
  key: string;
  recordedController: boolean;
  recordedOperation: boolean;
  operation?: HitDefControllerOp;
};

export type RuntimeModifyHitDefControllerDispatchOptions<TActor extends RuntimeHitDefControllerDispatchActor> = {
  actor: TActor;
  controller: ControllerIr;
  /** Active controller-expression bindings for dynamic scalar ModifyHitDef fields. */
  context?: RuntimeControllerEvaluationContext;
  resolveIntegerList?: (key: "nochainid") => number[] | undefined;
  resolveIntegerPair?: (key: "damage" | "unhittabletime" | "getpower" | "givepower") => [number?, number?] | undefined;
  resolveIntegerScalar?: (key: "id" | "chainid" | "p1facing" | "p1getp2facing" | "p2facing" | "p1sprpriority" | "p2sprpriority" | "priority" | "ground.hittime" | "ground.slidetime" | "air.hittime" | "down.hittime" | "guard.hittime" | "guard.slidetime" | "guard.ctrltime" | "airguard.ctrltime" | "guard.dist" | "down.bounce" | "numhits" | "forcestand" | "forcecrouch" | "forcenofall" | "hitsound.channel" | "guardsound.channel") => number | undefined;
  resolveFloatPair?: (key: "ground.velocity" | "air.velocity" | "down.velocity" | "guard.velocity" | "airguard.velocity" | "sparkxy" | "snap") => [number?, number?] | undefined;
  /** Resolves live dynamic float scalars in the caller context. */
  resolveFloatScalar?: (key: "down.velocity" | "guard.velocity" | "airguard.velocity" | "snap" | "ground.cornerpush.veloff" | "air.cornerpush.veloff" | "down.cornerpush.veloff" | "guard.cornerpush.veloff" | "airguard.cornerpush.veloff" | "sparkangle" | "guard.sparkangle") => number | undefined;
  /** Resolves a live spark identity's numeric suffix in the caller context. */
  resolveSparkNumber?: (key: "guard.sparkno", expression?: string) => number | undefined;
  resolvePaletteFx?: RuntimePaletteFxResolver;
  resolveEnvShake?: RuntimeHitDefEnvShakeResolver;
  resolveFallEnvShake?: RuntimeHitDefEnvShakeResolver;
  resolveFallImpact?: RuntimeHitDefFallImpactResolver;
  resolveFallRecovery?: RuntimeHitDefFallRecoveryResolver;
  resolveFallFlags?: RuntimeHitDefFallFlagsResolver;
  resolveLethalFlags?: RuntimeHitDefLethalFlagsResolver;
  /** Resolves a live sound reference in the ModifyHitDef caller context. */
  resolveSoundValue?: (key: "hitsound" | "guardsound", expression?: string) => RuntimeResolvedSoundRef | undefined;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: ModifyHitDefControllerOp) => void;
};

export type RuntimeHitDefEnvShakeResolver = (
  key: "time" | "freq" | "ampl" | "phase" | "mul" | "dir",
) => number | undefined;

export type RuntimeHitDefFallImpactResolver = (
  key: "damage" | "xVelocity" | "yVelocity" | "zVelocity",
) => number | undefined;

export type RuntimeHitDefFallRecoveryResolver = (
  key: "recover" | "recoverTime" | "downRecover" | "downRecoverTime",
) => number | undefined;

export type RuntimeHitDefFallFlagsResolver = (
  key: "enabled" | "airFall" | "kill",
) => number | undefined;

export type RuntimeHitDefLethalFlagsResolver = (
  key: "kill" | "guardKill" | "hitOnce",
) => number | undefined;

export type RuntimeModifyHitDefControllerDispatchResult = {
  modified: boolean;
  reason?: "missing-normal-hitdef" | "unsupported-operation";
  recordedController: boolean;
  recordedOperation: boolean;
  operation?: ModifyHitDefControllerOp;
};

export class RuntimeHitDefControllerDispatchWorld {
  apply<TActor extends RuntimeHitDefControllerDispatchActor>({
    actor,
    controller,
    defaultHitFlag,
    frame,
    constants,
    runtimeProfile,
    context,
    resolveIntegerList,
    resolveIntegerPair,
    resolveIntegerScalar,
    resolveScalar,
    resolveFloatPair,
    resolveFloatScalar,
    resolvePaletteFx,
    resolveEnvShake,
    resolveFallEnvShake,
    resolveFallImpact,
    resolveFallRecovery,
    resolveFallFlags,
    resolveLethalFlags,
    resolveSoundValue,
    recordController,
    recordOperation,
  }: RuntimeHitDefControllerDispatchOptions<TActor>): RuntimeHitDefControllerDispatchResult {
    const source = controller.source;
    const key = `${actor.runtime.stateNo}:${source.line}:${actor.runtime.frameIndex}`;
    if (actor.firedHitDefs.has(key)) {
      return {
        activated: false,
        duplicate: true,
        key,
        recordedController: false,
        recordedOperation: false,
      };
    }
    actor.firedHitDefs.add(key);
    const operation = controller.operation?.kind === "hitdef" ? controller.operation : undefined;
    recordController?.(actor, source);
    if (operation) {
      recordOperation?.(actor, operation);
    }

    const existing = actor.currentMove;
    const activeStart = actor.moveTick;
    const activeEnd = activeStart + Math.max(1, runtimeAnimationFrameDuration(frame) - actor.frameElapsed);
    const damageParam = findParam(source, "damage");
    const resolvedDamage = resolveRuntimeHitDefPowerPair(
      operation?.damageExpressions,
      damageParam,
      actor.runtime,
      context ?? {},
      resolveIntegerPair?.("damage"),
    );
    const damage = resolvedDamage?.hit ?? operation?.damage ?? firstNumber(damageParam) ?? 0;
    const guardDamage = resolvedDamage === undefined
      ? operation?.guardDamage ?? secondNumber(damageParam) ?? 0
      : resolvedDamage.componentCount === 1
        ? 0
        : resolvedDamage.guard ?? 0;
    const guardPoints = operation?.guardPoints ?? firstNumber(findParam(source, "guardpoints")) ?? existing?.guardPoints;
    const attr = operation?.attr ?? stripMugenString(findParam(source, "attr")) ?? existing?.attr ?? "S,NA";
    const dizzyPoints =
      operation?.dizzyPoints ??
      firstNumber(findParam(source, "dizzypoints")) ??
      runtimeDizzyPointsFromHitDef(damage, attr, actor.constants ?? constants);
    const redLife = operation?.redLife ?? firstNumber(findParam(source, "redlife")) ?? existing?.redLife;
    const guardRedLife = operation?.guardRedLife ?? secondNumber(findParam(source, "redlife")) ?? existing?.guardRedLife;
    const givePowerParam = findParam(source, "givepower");
    const resolvedGivePower = resolveRuntimeHitDefPowerPair(
      operation?.givePower,
      givePowerParam,
      actor.runtime,
      context ?? {},
      resolveIntegerPair?.("givepower"),
    );
    const authoredGuardPower = operation?.guardPower ?? secondNumber(givePowerParam);
    const authoredHitPower = operation?.hitPower ?? firstNumber(givePowerParam);
    const defaultGivePower = givePowerParam === undefined && authoredHitPower === undefined && authoredGuardPower === undefined
      ? runtimeHitDefGivePowerDefaults(damage, attr, actor.constants ?? constants)
      : undefined;
    const hitPower = resolvedGivePower
      ? resolvedGivePower.hit
      : authoredHitPower ?? defaultGivePower?.hit;
    const guardPower = resolvedGivePower
      ? (resolvedGivePower.componentCount === 1
        ? (hitPower === undefined ? undefined : Math.trunc(hitPower * 0.5))
        : resolvedGivePower.guard)
      : authoredGuardPower ?? (hitPower === undefined ? undefined : Math.trunc(hitPower * 0.5));
    const score = operation?.score ?? firstNumber(findParam(source, "score")) ?? existing?.score;
    const attackerPower = resolveRuntimeHitDefPowerPair(
      operation?.getPower,
      findParam(source, "getpower"),
      actor.runtime,
      context ?? {},
      resolveIntegerPair?.("getpower"),
    );
    const defaultAttackerPower = runtimeHitDefGetPowerDefaults(damage, attr, actor.constants ?? constants);
    const attackerHitPower = attackerPower?.hit ?? defaultAttackerPower.hit;
    const attackerGuardPower = attackerPower?.guard ?? Math.trunc(attackerHitPower * 0.5);
    const lethalFlags = resolveRuntimeHitDefLethalFlags(
      operation?.lethalFlags,
      source,
      actor.runtime,
      context ?? {},
      resolveLethalFlags,
    );
    const kill = lethalFlags?.kill === undefined
      ? operation?.kill ?? booleanHitDefParam(source, "kill") ?? existing?.kill ?? true
      : lethalFlags.kill !== 0;
    const guardKill = lethalFlags?.guardKill === undefined
      ? operation?.guardKill ?? booleanHitDefParam(source, "guard.kill") ?? existing?.guardKill ?? true
      : lethalFlags.guardKill !== 0;
    const keepState = operation?.keepState ?? booleanHitDefParam(source, "keepstate") ?? existing?.keepState;
    const hitOnce = lethalFlags?.hitOnce === undefined
      ? operation?.hitOnce ?? booleanHitDefParam(source, "hitonce") ?? existing?.hitOnce ?? false
      : lethalFlags.hitOnce !== 0;
    // Presence matters: omitted leaves active `c.juggle`; explicit 0 updates it under IKEMEN.
    const airJuggleParam = resolveRuntimeHitDefIntegerScalar(
      operation?.airJuggleExpression,
      findParam(source, "air.juggle"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("air.juggle"),
    ) ?? operation?.airJuggle ?? firstNumber(findParam(source, "air.juggle"));
    const airJugglePresent = airJuggleParam !== undefined;
    // Field default after setup matches pin `ifierrset` to 0 when omitted.
    const airJuggle = airJuggleParam ?? 0;
    const hitFlag =
      operation?.hitFlag ??
      stripMugenString(findParam(source, "hitflag")) ??
      defaultHitFlag ??
      existing?.hitFlag;
    const affectTeam = operation?.affectTeam ?? normalizeMugenAffectTeam(findParam(source, "affectteam")) ?? existing?.affectTeam;
    const teamSide = operation?.teamSide ?? normalizeMugenTeamSide(firstNumber(findParam(source, "teamside"))) ?? existing?.teamSide;
    const p2ClsnCheck = operation?.p2ClsnCheck ?? normalizeMugenCollisionBoxType(findParam(source, "p2clsncheck")) ?? existing?.p2ClsnCheck;
    const p2ClsnRequire = operation?.p2ClsnRequire ?? normalizeMugenCollisionBoxType(findParam(source, "p2clsnrequire")) ?? existing?.p2ClsnRequire;
    const pauseTime = resolveRuntimeHitDefPowerPair(
      operation?.pauseTimeExpressions,
      findParam(source, "pausetime"),
      actor.runtime,
      context ?? {},
      resolveIntegerPair?.("pausetime"),
    );
    const hitPause = pauseTime?.hit ?? operation?.pauseTime ?? 0;
    const hitShakeTime = pauseTime === undefined
      ? operation?.hitShakeTime ?? 0
      : pauseTime.componentCount === 1
        ? 0
        : pauseTime.guard ?? 0;
    const hitStun = resolveRuntimeHitDefIntegerScalar(
      operation?.groundHitTime,
      findParam(source, "ground.hittime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("ground.hittime"),
    ) ?? 0;
    const groundSlideTime = resolveRuntimeHitDefIntegerScalar(
      operation?.groundSlideTime,
      findParam(source, "ground.slidetime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("ground.slidetime"),
    ) ?? 0;
    const airHitTime = resolveRuntimeHitDefIntegerScalar(
      operation?.airHitTime,
      findParam(source, "air.hittime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("air.hittime"),
    ) ?? 20;
    const downHitTime = resolveRuntimeHitDefIntegerScalar(
      operation?.downHitTime,
      findParam(source, "down.hittime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("down.hittime"),
    ) ?? 20;
    const priority = normalizeRuntimeHitDefPriority(resolveRuntimeHitDefIntegerScalar(
      operation?.priorityExpression ?? operation?.priority,
      findParam(source, "priority"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("priority"),
    ));
    const priorityType = operation?.priorityType ?? hitDefPriorityType(findParam(source, "priority")) ?? "hit";
    const staticGroundVelocity = operation?.groundVelocity ?? velocityPair(findParam(source, "ground.velocity"));
    const resolvedGroundVelocity = resolveRuntimeHitDefFloatExpressionPair(
      operation?.groundVelocityExpressions,
      findParam(source, "ground.velocity"),
      actor.runtime,
      context ?? {},
      resolveFloatPair?.("ground.velocity"),
    );
    const groundVelocity: [number, number?, number?] = resolvedGroundVelocity === undefined
      ? staticGroundVelocity ?? [0, 0, 0]
      : [
          resolvedGroundVelocity.first
            ?? staticGroundVelocity?.[0]
            ?? existing?.hitVelocities?.ground?.x
            ?? existing?.push
            ?? 0,
          resolvedGroundVelocity.componentCount === 1
            ? 0
            : resolvedGroundVelocity.second
              ?? staticGroundVelocity?.[1]
              ?? existing?.hitVelocities?.ground?.y
              ?? existing?.hitVelocityY
              ?? 0,
          staticGroundVelocity?.[2]
            ?? existing?.hitVelocities?.ground?.z
            ?? existing?.hitVelocityZ,
        ];
    const forceStandValue = resolveRuntimeHitDefIntegerScalar(
      operation?.forceStand,
      findParam(source, "forcestand"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("forcestand"),
    );
    const forceCrouchValue = resolveRuntimeHitDefIntegerScalar(
      operation?.forceCrouch,
      findParam(source, "forcecrouch"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("forcecrouch"),
    );
    const forceStand = forceStandValue === undefined ? (groundVelocity?.[1] ?? 0) !== 0 : forceStandValue !== 0;
    const forceCrouch = forceCrouchValue !== undefined && forceCrouchValue !== 0;
    const forceNoFallValue = resolveRuntimeHitDefIntegerScalar(
      operation?.forceNoFall,
      findParam(source, "forcenofall"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("forcenofall"),
    );
    const forceNoFall = forceNoFallValue !== undefined && forceNoFallValue !== 0;
    const koVelocityAdd = operation?.koVelocityAdd ?? velocityPair(findParam(source, "ko.velocity.add"));
    const push = Math.abs(groundVelocity[0]);
    const guardPauseTime = resolveRuntimeHitDefPowerPair(
      operation?.guardPauseTimeExpressions,
      findParam(source, "guard.pausetime"),
      actor.runtime,
      context ?? {},
      resolveIntegerPair?.("guard.pausetime"),
    );
    const guardPause = guardPauseTime?.hit ?? operation?.guardPauseTime ?? hitPause;
    const guardShakeTime = guardPauseTime === undefined
      ? operation?.guardShakeTime ?? hitShakeTime
      : guardPauseTime.componentCount === 1
        ? hitShakeTime
        : guardPauseTime.guard ?? hitShakeTime;
    const guardHitTime = resolveRuntimeHitDefIntegerScalar(
      operation?.guardHitTime,
      findParam(source, "guard.hittime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("guard.hittime"),
    );
    const resolvedGuardSlideTime = resolveRuntimeHitDefIntegerScalar(
      operation?.guardSlideTime,
      findParam(source, "guard.slidetime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("guard.slidetime"),
    );
    const resolvedGuardControlTime = resolveRuntimeHitDefIntegerScalar(
      operation?.guardControlTime,
      findParam(source, "guard.ctrltime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("guard.ctrltime"),
    );
    const resolvedAirGuardControlTime = resolveRuntimeHitDefIntegerScalar(
      operation?.airGuardControlTime,
      findParam(source, "airguard.ctrltime"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("airguard.ctrltime"),
    );
    const guardTiming = resolveHitDefGuardTiming({
      groundHitTime: hitStun,
      groundSlideTime,
      guardHitTime,
      guardSlideTime: resolvedGuardSlideTime,
      guardControlTime: resolvedGuardControlTime,
      airGuardControlTime: resolvedAirGuardControlTime,
      runtimeProfile,
    });
    const guardStun = guardTiming.guardHitTime ?? existing?.guardStun ?? Math.max(1, Math.round(hitStun * 0.55));
    const guardSlideTime = guardTiming.guardSlideTime ?? existing?.guardSlideTime;
    const guardControlTime = guardTiming.guardControlTime ?? existing?.guardControlTime;
    const guardVelocity = operation?.guardVelocity ?? velocityPair(findParam(source, "guard.velocity"));
    const resolvedGuardVelocityX = resolveHitDefScalar(
      operation?.guardVelocityExpression,
      findParam(source, "guard.velocity"),
      actor.runtime,
      context ?? {},
    );
    const guardVelocityX = Number.isFinite(resolvedGuardVelocityX)
      ? resolvedGuardVelocityX!
      : guardVelocity?.[0] ?? groundVelocity[0];
    const effectiveGuardVelocity: [number, number?, number?] | undefined = operation?.guardVelocityExpression === undefined
      ? guardVelocity
      : [guardVelocityX];
    const staticAirVelocity = operation?.airVelocity ?? velocityPair(findParam(source, "air.velocity"));
    const resolvedAirVelocity = operation?.airVelocityExpressions === undefined && staticAirVelocity !== undefined
      ? undefined
      : resolveRuntimeHitDefFloatExpressionPair(
          operation?.airVelocityExpressions,
          findParam(source, "air.velocity"),
          actor.runtime,
          context ?? {},
          resolveFloatPair?.("air.velocity"),
        );
    const airVelocity: [number, number?, number?] | undefined = resolvedAirVelocity === undefined
      ? staticAirVelocity
      : [
          resolvedAirVelocity.first ?? 0,
          resolvedAirVelocity.componentCount === 1 ? 0 : resolvedAirVelocity.second ?? 0,
          0,
        ];
    const inheritedDownVelocity: [number, number, number] = [
      airVelocity?.[0] ?? 0,
      airVelocity?.[1] ?? 0,
      airVelocity?.[2] ?? 0,
    ];
    const staticDownVelocity = operation?.downVelocity ?? velocityPair(findParam(source, "down.velocity"));
    const resolvedDownVelocity = operation?.downVelocityExpressions === undefined && staticDownVelocity !== undefined
      ? undefined
      : resolveRuntimeHitDefFloatExpressionPair(
          operation?.downVelocityExpressions,
          findParam(source, "down.velocity"),
          actor.runtime,
          context ?? {},
          resolveFloatPair?.("down.velocity"),
        );
    const downVelocity: [number, number, number] = resolvedDownVelocity === undefined
      ? [
          staticDownVelocity?.[0] ?? inheritedDownVelocity[0],
          staticDownVelocity?.[1] ?? inheritedDownVelocity[1],
          staticDownVelocity?.[2] ?? inheritedDownVelocity[2],
        ]
      : [
          resolvedDownVelocity.first ?? inheritedDownVelocity[0],
          resolvedDownVelocity.componentCount === 1
            ? inheritedDownVelocity[1]
            : resolvedDownVelocity.second ?? inheritedDownVelocity[1],
          inheritedDownVelocity[2],
        ];
    const downVelocityX = downVelocity[0];
    const downVelocityY = downVelocity[1];
    const downVelocityZ = downVelocity[2];
    const resolvedDownBounce = resolveRuntimeHitDefIntegerScalar(
      operation?.downBounceExpression,
      findParam(source, "down.bounce"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("down.bounce"),
    );
    const downBounce = resolvedDownBounce !== undefined
      ? resolvedDownBounce !== 0
      : operation?.downBounce ?? booleanHitDefParam(source, "down.bounce") ?? existing?.downBounce;
    const staticAirGuardVelocity =
      operation?.airGuardVelocity ?? velocityPair(findParam(source, "airguard.velocity"));
    const resolvedAirGuardVelocity = operation?.airGuardVelocityExpressions === undefined && staticAirGuardVelocity !== undefined
      ? undefined
      : resolveRuntimeHitDefFloatExpressionPair(
          operation?.airGuardVelocityExpressions,
          findParam(source, "airguard.velocity"),
          actor.runtime,
          context ?? {},
          resolveFloatPair?.("airguard.velocity"),
        );
    const resolvedAirGuardVelocityZ = operation?.airGuardVelocityZExpression === undefined
      ? undefined
      : resolveRuntimeHitDefFloatExpressionScalar(
          operation.airGuardVelocityZExpression,
          undefined,
          actor.runtime,
          context ?? {},
          resolveFloatScalar?.("airguard.velocity"),
        );
    const defaultAirGuardVelocity = derivePinnedIkemenFreshAirGuardVelocity(airVelocity);
    const resolvedAirGuardVelocityVector: [number, number?, number?] | undefined = resolvedAirGuardVelocity === undefined
      ? undefined
      : resolvedAirGuardVelocity.componentCount === 1
        ? [resolvedAirGuardVelocity.first ?? 0, undefined, resolvedAirGuardVelocityZ]
        : [resolvedAirGuardVelocity.first ?? 0, resolvedAirGuardVelocity.second ?? 0, resolvedAirGuardVelocityZ];
    const airGuardVelocity = completeFreshAirGuardVelocity(
      resolvedAirGuardVelocityVector ?? staticAirGuardVelocity,
      defaultAirGuardVelocity,
    );
    const hitVelocities: RuntimeHitVelocityMetadata = {
      ground: runtimeHitVelocityVector(groundVelocity),
      ...(airVelocity === undefined ? {} : { air: runtimeHitVelocityVector(airVelocity) }),
      down: runtimeHitVelocityVector(downVelocity),
      ...(effectiveGuardVelocity === undefined ? {} : { guard: runtimeHitVelocityVector(effectiveGuardVelocity) }),
      ...(airGuardVelocity === undefined ? {} : { airGuard: runtimeHitVelocityVector(airGuardVelocity) }),
    };
    const resolvedGuardDistance = resolveRuntimeHitDefIntegerScalar(
      operation?.guardDistance,
      findParam(source, "guard.dist"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("guard.dist"),
    );
    const guardDistance = resolvedGuardDistance !== undefined && resolvedGuardDistance >= 0
      ? resolvedGuardDistance
      : existing?.guardDistance ?? DEFAULT_RUNTIME_GUARD_DISTANCE;
    const guardPush = Math.abs(guardVelocityX ?? existing?.guardPush ?? Math.max(1, Math.round(push * 0.55)));
    const airGuardPush = airGuardVelocity ? Math.abs(airGuardVelocity[0]) : existing?.airGuardPush;
    const cornerPush = resolveHitDefCornerPush({
      attr,
      guardVelocityX: guardVelocityX ?? existing?.guardPush,
      groundCornerPush: operation?.groundCornerPush ?? firstNumber(findParam(source, "ground.cornerpush.veloff")) ?? existing?.cornerPush,
      airCornerPush: operation?.airCornerPush ?? firstNumber(findParam(source, "air.cornerpush.veloff")) ?? existing?.airCornerPush,
      downCornerPush: operation?.downCornerPush ?? firstNumber(findParam(source, "down.cornerpush.veloff")) ?? existing?.downCornerPush,
      guardCornerPush: operation?.guardCornerPush ?? firstNumber(findParam(source, "guard.cornerpush.veloff")) ?? existing?.guardCornerPush,
      airGuardCornerPush:
        operation?.airGuardCornerPush ?? firstNumber(findParam(source, "airguard.cornerpush.veloff")) ?? existing?.airGuardCornerPush,
    });
    const groundType = operation?.groundType ?? hitType(findParam(source, "ground.type") ?? findParam(source, "type")) ?? existing?.hitVars?.groundType ?? 1;
    const airType = operation?.airType ?? hitType(findParam(source, "air.type")) ?? existing?.hitVars?.airType ?? groundType;
    const groundAnimType =
      operation?.animType ??
      hitAnimType(findParam(source, "animtype")) ??
      existing?.hitVars?.groundAnimType ??
      existing?.hitVars?.animType ??
      0;
    const airAnimType =
      operation?.airAnimType ??
      hitAnimType(findParam(source, "air.animtype")) ??
      existing?.hitVars?.airAnimType ??
      groundAnimType;
    const fallAnimType =
      operation?.fallAnimType ??
      hitAnimType(findParam(source, "fall.animtype")) ??
      existing?.hitVars?.fallAnimType ??
      defaultFallAnimType(airAnimType);
    const animType =
      operation?.fallAnimType ??
      hitAnimType(findParam(source, "fall.animtype")) ??
      operation?.animType ??
      hitAnimType(findParam(source, "animtype")) ??
      existing?.hitVars?.animType ??
      0;
    const xAccel = resolveHitDefScalar(operation?.xAccel, findParam(source, "xaccel"), actor.runtime, context) ?? existing?.hitVars?.xAccel;
    const yAccel = resolveHitDefScalar(operation?.yAccel, findParam(source, "yaccel"), actor.runtime, context) ?? existing?.hitVars?.yAccel;
    const zAccel = resolveHitDefScalar(operation?.zAccel, findParam(source, "zaccel"), actor.runtime, context) ?? existing?.hitVars?.zAccel;
    const standFriction = resolveScalar?.("stand.friction")
      ?? resolveHitDefScalar(operation?.standFriction, findParam(source, "stand.friction"), actor.runtime, context);
    const crouchFriction = resolveScalar?.("crouch.friction")
      ?? resolveHitDefScalar(operation?.crouchFriction, findParam(source, "crouch.friction"), actor.runtime, context);
    const hitSparkScale = resolveRuntimeHitDefFloatPair(
      operation?.hitSparkScale,
      findParam(source, "sparkscale"),
      actor.runtime,
      context ?? {},
      resolveFloatPair?.("sparkscale"),
      [1, 1],
    );
    const guardSparkScale = resolveRuntimeHitDefFloatPair(
      operation?.guardSparkScale,
      findParam(source, "guard.sparkscale"),
      actor.runtime,
      context ?? {},
      resolveFloatPair?.("guard.sparkscale"),
      [1, 1],
    );
    const authoredHitSparkAngle = operation?.hitSparkAngle ?? firstNumber(findParam(source, "sparkangle"));
    const hitSparkAngle = authoredHitSparkAngle === undefined
      ? existing?.hitSparkAngle
      : resolveRuntimeHitDefFloatExpressionScalar(
          authoredHitSparkAngle,
          findParam(source, "sparkangle"),
          actor.runtime,
          context ?? {},
          resolveFloatScalar?.("sparkangle"),
        ) ?? existing?.hitSparkAngle;
    const authoredGuardSparkAngle = operation?.guardSparkAngle ?? firstNumber(findParam(source, "guard.sparkangle"));
    const guardSparkAngle = authoredGuardSparkAngle === undefined
      ? existing?.guardSparkAngle
      : resolveRuntimeHitDefFloatExpressionScalar(
          authoredGuardSparkAngle,
          findParam(source, "guard.sparkangle"),
          actor.runtime,
          context ?? {},
          resolveFloatScalar?.("guard.sparkangle"),
        ) ?? existing?.guardSparkAngle;
    const paletteFx = resolveRuntimeHitDefPaletteFx({
      operation: operation?.paletteFx,
      controller: source,
      state: actor.runtime,
      context,
      resolver: resolvePaletteFx,
    });
    const envShake = resolveRuntimeHitDefEnvShake(
      operation?.envShake,
      source,
      actor.runtime,
      context,
      resolveEnvShake,
    );
    const resolvedId = resolveRuntimeHitDefIntegerScalar(
      operation?.id,
      findParam(source, "id"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("id"),
    );
    const targetId = Math.max(0, resolvedId ?? 0);
    const resolvedChainId = resolveRuntimeHitDefIntegerScalar(
      operation?.chainId,
      findParam(source, "chainid"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("chainid"),
    );
    const chainId = resolvedChainId === -1 ? undefined : resolvedChainId;
    const noChainIds = operation?.noChainIds
      ?? resolveIntegerList?.("nochainid")
      ?? staticRuntimeIntegerList(findParam(source, "nochainid"), 8)
      ?? existing?.noChainIds;
    const defaultUnhittableTime: [number, number] = runtimeHitDefUsesThrowAttribute(attr)
      ? [Math.trunc(hitPause) + 1, Math.trunc(hitPause) + 1]
      : [-1, -1];
    const unhittableTime = resolveRuntimeHitDefIntegerPair(
      operation?.unhittableTime,
      findParam(source, "unhittabletime"),
      actor.runtime,
      context ?? {},
      resolveIntegerPair?.("unhittabletime"),
      defaultUnhittableTime,
    );
    const hitCount = resolveRuntimeHitDefIntegerScalar(
      operation?.hitCountExpression,
      findParam(source, "numhits"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("numhits"),
    ) ?? operation?.hitCount ?? firstNumber(findParam(source, "numhits")) ?? existing?.hitVars?.hitCount ?? 1;
    const staticSnap = operation?.snap ?? snapVector(findParam(source, "snap"));
    const resolvedSnap = operation?.snapExpressions === undefined && staticSnap !== undefined
      ? undefined
      : resolveRuntimeHitDefFloatExpressionPair(
          operation?.snapExpressions,
          findParam(source, "snap"),
          actor.runtime,
          context ?? {},
          resolveFloatPair?.("snap"),
        );
    const resolvedSnapZ = operation?.snapZExpression === undefined
      ? undefined
      : resolveRuntimeHitDefFloatExpressionScalar(
          operation.snapZExpression,
          findParam(source, "snap"),
          actor.runtime,
          context ?? {},
          resolveFloatScalar?.("snap"),
        );
    const snap: [number, number?, number?] | undefined = resolvedSnap === undefined
      ? staticSnap
      : resolvedSnap.first === undefined
        ? undefined
        : [
            resolvedSnap.first,
            resolvedSnap.componentCount === 2 ? resolvedSnap.second : undefined,
            resolvedSnapZ,
          ];
    const resolveFreshStateScalar = (
      key: "p1stateno" | "p2stateno" | "p2getp1state",
      operationValue: number | string | undefined,
    ): number | undefined => {
      const rawValue = findParam(source, key);
      if (operationValue === undefined && rawValue === undefined) return undefined;
      if (resolveIntegerScalar !== undefined) {
        const value = resolveIntegerScalar(key);
        if (value !== undefined && Number.isFinite(value)) return Math.trunc(value);
        return typeof operationValue === "number" ? Math.trunc(operationValue) : undefined;
      }
      return resolveRuntimeHitDefIntegerScalar(
        operationValue,
        rawValue,
        actor.runtime,
        context ?? {},
      );
    };
    const p1StateNo = resolveFreshStateScalar("p1stateno", operation?.p1StateNo);
    const p2StateNo = resolveFreshStateScalar("p2stateno", operation?.p2StateNo);
    const p2GetP1StateValue = p2StateNo === undefined
      ? undefined
      : resolveFreshStateScalar("p2getp1state", operation?.p2GetP1State);
    const p2GetP1State = p2StateNo === undefined ? false : (p2GetP1StateValue ?? 1) !== 0;
    const p1Facing = resolveRuntimeHitDefIntegerScalar(
      operation?.p1Facing,
      findParam(source, "p1facing"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("p1facing"),
    ) ?? 0;
    const p1GetP2Facing = resolveRuntimeHitDefIntegerScalar(
      operation?.p1GetP2Facing,
      findParam(source, "p1getp2facing"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("p1getp2facing"),
    ) ?? 0;
    const p2Facing = resolveRuntimeHitDefIntegerScalar(
      operation?.p2Facing,
      findParam(source, "p2facing"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("p2facing"),
    ) ?? 0;
    const missOnOverride = operation?.missOnOverride ?? booleanHitDefParam(source, "missonoverride") ?? existing?.missOnOverride;
    const ignoreReversalDef = operation?.ignoreReversalDef ?? booleanHitDefParam(source, "ignorereversaldef") ?? false;
    const p1SpritePriorityRaw = findParam(source, "p1sprpriority") ?? findParam(source, "sprpriority");
    const p1SpritePriority = resolveRuntimeHitDefIntegerScalar(
      operation?.p1SpritePriorityExpression ?? operation?.p1SpritePriority,
      p1SpritePriorityRaw,
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("p1sprpriority"),
    );
    const p2SpritePriority = resolveRuntimeHitDefIntegerScalar(
      operation?.p2SpritePriorityExpression ?? operation?.p2SpritePriority,
      findParam(source, "p2sprpriority"),
      actor.runtime,
      context ?? {},
      resolveIntegerScalar?.("p2sprpriority"),
    );
    const attackDepth =
      operation?.attackDepth ??
      normalizedNumberPair(findParam(source, "attack.depth")) ??
      actor.runtime.combatDepth?.attack ??
      existing?.attackDepth;
    const hitSound = operation?.hitSound ?? stripMugenString(findParam(source, "hitsound")) ?? existing?.hitSound;
    const guardSound = operation?.guardSound ?? stripMugenString(findParam(source, "guardsound")) ?? existing?.guardSound;
    const fallbackHitbox = existing?.hitbox ?? { x1: 14, y1: -72, x2: 78, y2: -38 };

    actor.currentMove = {
      actionId: actor.runtime.stateNo,
      startup: existing?.startup ?? 0,
      activeStart,
      activeEnd,
      recovery: Math.max(existing?.recovery ?? 0, activeEnd + 12),
      damage,
      ...(guardPoints === undefined ? {} : { guardPoints }),
      ...(dizzyPoints === undefined ? {} : { dizzyPoints }),
      ...(redLife === undefined ? {} : { redLife }),
      ...(guardRedLife === undefined ? {} : { guardRedLife }),
      ...(guardPower === undefined ? {} : { guardPower }),
      ...(hitPower === undefined ? {} : { hitPower }),
      ...(score === undefined ? {} : { score }),
      ...(attackerHitPower === undefined ? {} : { attackerHitPower }),
      ...(attackerGuardPower === undefined ? {} : { attackerGuardPower }),
      kill,
      ...(keepState === undefined ? {} : { keepState }),
      hitOnce,
      airJuggle,
      ...(noChainIds === undefined ? {} : { noChainIds: normalizeRuntimeIntegerList(noChainIds, 8) }),
      ...(hitFlag === undefined ? {} : { hitFlag }),
      ...(affectTeam === undefined ? {} : { affectTeam }),
      ...(teamSide === undefined ? {} : { teamSide }),
      ...(p2ClsnCheck === undefined ? {} : { p2ClsnCheck }),
      ...(p2ClsnRequire === undefined ? {} : { p2ClsnRequire }),
      priority,
      priorityType,
      p1SpritePriority,
      p2SpritePriority,
      forceStand,
      forceCrouch,
      forceNoFall,
      attackDepth,
      unhittableTime,
      requiresHitDef: false,
      attr,
      targetId,
      hitPause,
      hitShakeTime,
      hitStun,
      airHitTime,
      downHitTime,
      ...(downVelocityX === undefined ? {} : { downVelocityX }),
      ...(downVelocityZ === undefined ? {} : { downVelocityZ }),
      downVelocityY,
      ...(downBounce === undefined ? {} : { downBounce }),
      push,
      hitVelocityY: groundVelocity[1] ?? 0,
      hitVelocityZ: groundVelocity[2] ?? 0,
      airVelocityZ: airVelocity?.[2] ?? existing?.airVelocityZ,
      hitVelocities: Object.keys(hitVelocities).length > 0 ? hitVelocities : existing?.hitVelocities,
      ...(koVelocityAdd === undefined ? {} : { koVelocityAdd: { x: koVelocityAdd[0], y: koVelocityAdd[1] ?? 0 } }),
      hitVars: {
        hitId: targetId,
        ...(chainId !== undefined ? { chainId } : {}),
        hitCount,
        ...(snap
          ? {
              hitOffset: {
                x: snap[0],
                ...(snap[1] !== undefined ? { y: snap[1] } : {}),
                ...(snap[2] !== undefined ? { z: snap[2] } : {}),
              },
            }
          : {}),
        animType,
        groundAnimType,
        airAnimType,
        fallAnimType,
        groundType,
        airType,
        slideTime: groundSlideTime,
        ...(xAccel !== undefined ? { xAccel } : {}),
        ...(yAccel !== undefined ? { yAccel } : {}),
        ...(zAccel !== undefined ? { zAccel } : {}),
        ...(standFriction !== undefined ? { standFriction } : {}),
        ...(crouchFriction !== undefined ? { crouchFriction } : {}),
      },
      guardDistance,
      guardFlag: operation?.guardFlag ?? stripMugenString(findParam(source, "guardflag")) ?? existing?.guardFlag ?? "MA",
      guardDamage,
      guardKill,
      guardPause,
      guardShakeTime,
      guardStun,
      guardSlideTime,
      guardControlTime,
      airGuardControlTime: guardTiming.airGuardControlTime ?? existing?.airGuardControlTime,
      guardPush,
      guardVelocityY: guardVelocity?.[1] ?? existing?.guardVelocityY,
      guardVelocityZ: guardVelocity?.[2] ?? existing?.guardVelocityZ,
      airGuardPush,
      airGuardVelocityY: airGuardVelocity?.[1] ?? existing?.airGuardVelocityY,
      airGuardVelocityZ: airGuardVelocity?.[2] ?? existing?.airGuardVelocityZ,
      cornerPush: cornerPush.cornerPush,
      airCornerPush: cornerPush.airCornerPush,
      downCornerPush: cornerPush.downCornerPush,
      guardCornerPush: cornerPush.guardCornerPush,
      airGuardCornerPush: cornerPush.airGuardCornerPush,
      hitSound,
      guardSound,
      hitSoundValue: resolveSoundValue?.("hitsound") ?? existing?.hitSoundValue,
      guardSoundValue: resolveSoundValue?.("guardsound") ?? existing?.guardSoundValue,
      hitSpark: operation?.hitSpark ?? stripMugenString(findParam(source, "sparkno")) ?? existing?.hitSpark,
      guardSpark: operation?.guardSpark ?? stripMugenString(findParam(source, "guard.sparkno")) ?? existing?.guardSpark,
      hitSparkScale,
      guardSparkScale,
      ...(hitSparkAngle === undefined ? {} : { hitSparkAngle }),
      ...(guardSparkAngle === undefined ? {} : { guardSparkAngle }),
      ...(paletteFx === undefined ? {} : { paletteFx }),
      ...(envShake === undefined ? {} : { envShake }),
      sparkXy: operation?.sparkXy ? normalizeSparkOffset(operation.sparkXy) : numberPair(findParam(source, "sparkxy")) ?? existing?.sparkXy,
      p1StateNo,
      p2StateNo,
      p2GetP1State,
      p1Facing,
      p1GetP2Facing,
      ...(p2Facing === undefined ? {} : { p2Facing }),
      missOnOverride,
      ignoreReversalDef,
      fall: buildMoveFallData(
        source,
        existing,
        operation,
        actor.runtime,
        context,
        resolveFallEnvShake,
        resolveFallImpact,
        resolveFallRecovery,
        resolveFallFlags,
      ),
      hitbox: cloneBox(frame?.clsn1[0] ?? fallbackHitbox),
    };
    actor.currentMoveLabel = source.name ?? "HitDef";
    actor.hasHit = false;
    resetRuntimeHitDefContactMemory(actor);
    actor.runtime.reversal = undefined;
    actor.runtime.moveType = "A";
    applyRuntimeControl(actor.runtime, false);
    // Pin: only an explicit HitDef air.juggle arms c.juggle under IKEMEN; omitted keeps prior cost.
    if (airJugglePresent) {
      applyRuntimeHitDefJuggle(actor.runtime, airJuggle, { profile: runtimeProfile });
    }

    return {
      activated: true,
      duplicate: false,
      key,
      recordedController: recordController !== undefined,
      recordedOperation: operation !== undefined && recordOperation !== undefined,
      ...(operation ? { operation } : {}),
    };
  }

  modify<TActor extends RuntimeHitDefControllerDispatchActor>({
    actor,
    controller,
    context,
    resolveIntegerList,
    resolveIntegerPair,
    resolveIntegerScalar,
    resolveFloatPair,
    resolveFloatScalar,
    resolveSparkNumber,
    resolvePaletteFx,
    resolveEnvShake,
    resolveFallEnvShake,
    resolveFallImpact,
    resolveFallRecovery,
    resolveFallFlags,
    resolveLethalFlags,
    resolveSoundValue,
    recordController,
    recordOperation,
  }: RuntimeModifyHitDefControllerDispatchOptions<TActor>): RuntimeModifyHitDefControllerDispatchResult {
    const operation = controller.operation?.kind === "modifyhitdef" ? controller.operation : undefined;
    if (!operation) {
      return {
        modified: false,
        reason: "unsupported-operation",
        recordedController: false,
        recordedOperation: false,
      };
    }

    const existing = actor.currentMove;
    if (
      !existing ||
      existing.requiresHitDef ||
      existing.isReversal ||
      actor.runtime.reversal !== undefined ||
      actor.runtime.moveType !== "A" ||
      !existing.attr
    ) {
      return {
        modified: false,
        reason: "missing-normal-hitdef",
        recordedController: false,
        recordedOperation: false,
      };
    }

    if (operation.damage !== undefined) {
      existing.damage = operation.damage;
    }
    if (operation.guardDamage !== undefined) {
      existing.guardDamage = operation.guardDamage;
    }
    if (operation.damageExpressions !== undefined) {
      const damage = resolveRuntimeHitDefPowerPair(
        operation.damageExpressions,
        findParam(controller.source, "damage"),
        actor.runtime,
        context ?? {},
        resolveIntegerPair?.("damage"),
      );
      if (damage?.hit !== undefined) existing.damage = damage.hit;
      if (damage?.componentCount === 2 && damage.guard !== undefined) existing.guardDamage = damage.guard;
    }
    if (operation.groundHitTime !== undefined) {
      const groundHitTime = resolveRuntimeHitDefIntegerScalar(
        operation.groundHitTime,
        findParam(controller.source, "ground.hittime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("ground.hittime"),
      );
      if (groundHitTime !== undefined) existing.hitStun = groundHitTime;
    }
    if (operation.groundSlideTime !== undefined) {
      const groundSlideTime = resolveRuntimeHitDefIntegerScalar(
        operation.groundSlideTime,
        findParam(controller.source, "ground.slidetime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("ground.slidetime"),
      );
      if (groundSlideTime !== undefined) {
        existing.hitVars = { ...existing.hitVars, slideTime: groundSlideTime };
      }
    }
    if (operation.guardHitTime !== undefined) {
      const guardHitTime = resolveRuntimeHitDefIntegerScalar(
        operation.guardHitTime,
        findParam(controller.source, "guard.hittime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("guard.hittime"),
      );
      if (guardHitTime !== undefined) existing.guardStun = guardHitTime;
    }
    if (operation.guardSlideTime !== undefined) {
      const guardSlideTime = resolveRuntimeHitDefIntegerScalar(
        operation.guardSlideTime,
        findParam(controller.source, "guard.slidetime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("guard.slidetime"),
      );
      if (guardSlideTime !== undefined) existing.guardSlideTime = guardSlideTime;
    }
    if (operation.guardControlTime !== undefined) {
      const guardControlTime = resolveRuntimeHitDefIntegerScalar(
        operation.guardControlTime,
        findParam(controller.source, "guard.ctrltime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("guard.ctrltime"),
      );
      if (guardControlTime !== undefined) existing.guardControlTime = guardControlTime;
    }
    if (operation.airHitTime !== undefined) {
      const airHitTime = resolveRuntimeHitDefIntegerScalar(
        operation.airHitTime,
        findParam(controller.source, "air.hittime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("air.hittime"),
      );
      if (airHitTime !== undefined) existing.airHitTime = airHitTime;
    }
    if (operation.guardDistance !== undefined) {
      const guardDistance = resolveRuntimeHitDefIntegerScalar(
        operation.guardDistance,
        findParam(controller.source, "guard.dist"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("guard.dist"),
      );
      if (guardDistance !== undefined && guardDistance >= 0) existing.guardDistance = guardDistance;
    }
    if (operation.downHitTime !== undefined) {
      const downHitTime = resolveRuntimeHitDefIntegerScalar(
        operation.downHitTime,
        findParam(controller.source, "down.hittime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("down.hittime"),
      );
      if (downHitTime !== undefined) existing.downHitTime = downHitTime;
    }
    if (operation.groundVelocity !== undefined) {
      const groundVelocity = resolveRuntimeHitDefFloatExpressionPair(
        operation.groundVelocity,
        findParam(controller.source, "ground.velocity"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("ground.velocity"),
      );
      const currentGroundVelocity = existing.hitVelocities?.ground ?? {
        x: existing.push,
        y: existing.hitVelocityY ?? 0,
        z: existing.hitVelocityZ ?? 0,
      };
      if (groundVelocity?.first !== undefined) {
        existing.push = Math.abs(groundVelocity.first);
        existing.hitVelocities = {
          ...existing.hitVelocities,
          ground: { ...currentGroundVelocity, x: groundVelocity.first },
        };
      }
      if (groundVelocity?.componentCount === 2 && groundVelocity.second !== undefined) {
        existing.hitVelocityY = groundVelocity.second;
        existing.hitVelocities = {
          ...existing.hitVelocities,
          ground: {
            ...(existing.hitVelocities?.ground ?? currentGroundVelocity),
            y: groundVelocity.second,
          },
        };
      }
    }
    if (operation.groundVelocityZ !== undefined) {
      existing.hitVelocityZ = operation.groundVelocityZ;
      existing.hitVelocities = {
        ...existing.hitVelocities,
        ground: {
          ...(existing.hitVelocities?.ground ?? { x: existing.push, y: existing.hitVelocityY ?? 0, z: 0 }),
          z: operation.groundVelocityZ,
        },
      };
    }
    if (operation.airVelocity !== undefined) {
      const airVelocity = resolveRuntimeHitDefFloatExpressionPair(
        operation.airVelocity,
        findParam(controller.source, "air.velocity"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("air.velocity"),
      );
      const currentAirVelocity = existing.hitVelocities?.air ?? {
        x: 0,
        y: 0,
        z: existing.airVelocityZ ?? 0,
      };
      if (airVelocity?.first !== undefined) {
        existing.hitVelocities = {
          ...existing.hitVelocities,
          air: { ...currentAirVelocity, x: airVelocity.first },
        };
      }
      if (airVelocity?.componentCount === 2 && airVelocity.second !== undefined) {
        existing.hitVelocities = {
          ...existing.hitVelocities,
          air: {
            ...(existing.hitVelocities?.air ?? currentAirVelocity),
            y: airVelocity.second,
          },
        };
      }
    }
    if (operation.airVelocityZ !== undefined) {
      existing.airVelocityZ = operation.airVelocityZ;
      existing.hitVelocities = {
        ...existing.hitVelocities,
        air: {
          ...(existing.hitVelocities?.air ?? { x: 0, y: 0, z: 0 }),
          z: operation.airVelocityZ,
        },
      };
    }
    if (operation.downVelocity !== undefined) {
      const currentDownVelocity = existing.hitVelocities?.down ?? {
        x: existing.downVelocityX ?? 0,
        y: existing.downVelocityY ?? 0,
        z: existing.downVelocityZ ?? 0,
      };
      if (operation.downVelocity[0] !== undefined) {
        existing.downVelocityX = operation.downVelocity[0];
      }
      if (operation.downVelocity[1] !== undefined) {
        existing.downVelocityY = operation.downVelocity[1];
      }
      if (operation.downVelocity[2] !== undefined) {
        existing.downVelocityZ = operation.downVelocity[2];
      }
      existing.hitVelocities = {
        ...existing.hitVelocities,
        down: {
          ...currentDownVelocity,
          ...(operation.downVelocity[0] === undefined ? {} : { x: operation.downVelocity[0] }),
          ...(operation.downVelocity[1] === undefined ? {} : { y: operation.downVelocity[1] }),
          ...(operation.downVelocity[2] === undefined ? {} : { z: operation.downVelocity[2] }),
        },
      };
    }
    if (operation.downVelocityExpressions !== undefined) {
      const downVelocity = resolveRuntimeHitDefFloatExpressionPair(
        operation.downVelocityExpressions,
        findParam(controller.source, "down.velocity"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("down.velocity"),
      );
      const currentDownVelocity = existing.hitVelocities?.down ?? {
        x: existing.downVelocityX ?? 0,
        y: existing.downVelocityY ?? 0,
        z: existing.downVelocityZ ?? 0,
      };
      if (downVelocity?.first !== undefined) {
        existing.downVelocityX = downVelocity.first;
        existing.hitVelocities = {
          ...existing.hitVelocities,
          down: { ...currentDownVelocity, x: downVelocity.first },
        };
      }
      if (downVelocity?.componentCount === 2 && downVelocity.second !== undefined) {
        existing.downVelocityY = downVelocity.second;
        existing.hitVelocities = {
          ...existing.hitVelocities,
          down: {
            ...(existing.hitVelocities?.down ?? currentDownVelocity),
            y: downVelocity.second,
          },
        };
      }
    }
    if (operation.downVelocityZ !== undefined || operation.downVelocityZExpression !== undefined) {
      const downVelocityZ = operation.downVelocityZExpression !== undefined
        ? resolveRuntimeHitDefFloatExpressionScalar(
            operation.downVelocityZExpression,
            findParam(controller.source, "down.velocity"),
            actor.runtime,
            context ?? {},
            resolveFloatScalar?.("down.velocity"),
          )
        : operation.downVelocityZ;
      if (downVelocityZ !== undefined) {
        const currentDownVelocity = existing.hitVelocities?.down ?? {
          x: existing.downVelocityX ?? 0,
          y: existing.downVelocityY ?? 0,
          z: existing.downVelocityZ ?? 0,
        };
        existing.downVelocityZ = downVelocityZ;
        existing.hitVelocities = {
          ...existing.hitVelocities,
          down: { ...currentDownVelocity, z: downVelocityZ },
        };
      }
    }
    if (operation.downBounce !== undefined) {
      existing.downBounce = operation.downBounce;
    }
    if (operation.downBounceExpression !== undefined) {
      const downBounce = resolveRuntimeHitDefIntegerScalar(
        operation.downBounceExpression,
        findParam(controller.source, "down.bounce"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("down.bounce"),
      );
      if (downBounce !== undefined) existing.downBounce = downBounce !== 0;
    }
    if (operation.forceStand !== undefined) {
      const forceStand = resolveRuntimeHitDefIntegerScalar(
        operation.forceStand,
        findParam(controller.source, "forcestand"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("forcestand"),
      );
      if (forceStand !== undefined) existing.forceStand = forceStand !== 0;
    }
    if (operation.forceCrouch !== undefined) {
      const forceCrouch = resolveRuntimeHitDefIntegerScalar(
        operation.forceCrouch,
        findParam(controller.source, "forcecrouch"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("forcecrouch"),
      );
      if (forceCrouch !== undefined) existing.forceCrouch = forceCrouch !== 0;
    }
    if (operation.forceNoFall !== undefined) {
      const forceNoFall = resolveRuntimeHitDefIntegerScalar(
        operation.forceNoFall,
        findParam(controller.source, "forcenofall"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("forcenofall"),
      );
      if (forceNoFall !== undefined) existing.forceNoFall = forceNoFall !== 0;
    }
    if (operation.airGuardControlTime !== undefined) {
      const airGuardControlTime = resolveRuntimeHitDefIntegerScalar(
        operation.airGuardControlTime,
        findParam(controller.source, "airguard.ctrltime"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("airguard.ctrltime"),
      );
      if (airGuardControlTime !== undefined) existing.airGuardControlTime = airGuardControlTime;
    }
    if (operation.guardVelocityExpressions !== undefined) {
      const guardVelocity = resolveRuntimeHitDefFloatExpressionPair(
        operation.guardVelocityExpressions,
        findParam(controller.source, "guard.velocity"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("guard.velocity"),
      );
      const guardVelocityZ = operation.guardVelocityZExpression === undefined
        ? operation.guardVelocityZ
        : resolveRuntimeHitDefFloatExpressionScalar(
            operation.guardVelocityZExpression,
            findParam(controller.source, "guard.velocity"),
            actor.runtime,
            context ?? {},
            resolveFloatScalar?.("guard.velocity"),
          );
      const currentGuardVelocity = existing.hitVelocities?.guard ?? {
        x: existing.guardPush ?? 0,
        y: existing.guardVelocityY ?? 0,
        z: existing.guardVelocityZ ?? 0,
      };
      const nextX = guardVelocity?.first ?? currentGuardVelocity.x;
      const nextY = guardVelocity?.componentCount === 2 && guardVelocity.second !== undefined
        ? guardVelocity.second
        : currentGuardVelocity.y;
      const hasXY = guardVelocity?.first !== undefined ||
        (guardVelocity?.componentCount === 2 && guardVelocity.second !== undefined);
      const hasZ = guardVelocityZ !== undefined && Number.isFinite(guardVelocityZ);
      if (hasXY || hasZ) {
        existing.guardPush = Math.abs(nextX);
        if (guardVelocity?.componentCount === 2 && guardVelocity.second !== undefined) {
          existing.guardVelocityY = nextY;
        }
        if (hasZ) existing.guardVelocityZ = guardVelocityZ;
        existing.hitVelocities = {
          ...existing.hitVelocities,
          guard: {
            ...currentGuardVelocity,
            x: nextX,
            ...(guardVelocity?.componentCount === 2 && guardVelocity.second !== undefined ? { y: nextY } : {}),
            ...(hasZ ? { z: guardVelocityZ } : {}),
          },
        };
      }
    } else if (operation.guardVelocityExpression !== undefined) {
      const guardVelocityX = resolveHitDefScalar(
        operation.guardVelocityExpression,
        findParam(controller.source, "guard.velocity"),
        actor.runtime,
        context ?? {},
      );
      if (guardVelocityX !== undefined && Number.isFinite(guardVelocityX)) {
        const currentGuardVelocity = existing.hitVelocities?.guard ?? {
          x: existing.guardPush ?? 0,
          y: existing.guardVelocityY ?? 0,
          z: existing.guardVelocityZ ?? 0,
        };
        existing.guardPush = Math.abs(guardVelocityX);
        existing.hitVelocities = {
          ...existing.hitVelocities,
          guard: { ...currentGuardVelocity, x: guardVelocityX },
        };
      }
    }
    if (operation.guardVelocityExpressions === undefined && operation.guardVelocityZ !== undefined) {
      existing.guardVelocityZ = operation.guardVelocityZ;
      existing.hitVelocities = {
        ...existing.hitVelocities,
        guard: {
          ...(existing.hitVelocities?.guard ?? { x: existing.guardPush ?? 0, y: existing.guardVelocityY ?? 0, z: 0 }),
          z: operation.guardVelocityZ,
        },
      };
    }
    if (operation.airGuardVelocityExpressions !== undefined) {
      const airGuardVelocity = resolveRuntimeHitDefFloatExpressionPair(
        operation.airGuardVelocityExpressions,
        findParam(controller.source, "airguard.velocity"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("airguard.velocity"),
      );
      if (airGuardVelocity !== undefined && (airGuardVelocity.first !== undefined || airGuardVelocity.second !== undefined)) {
        const currentAirGuardVelocity = existing.hitVelocities?.airGuard ?? {
          x: existing.airGuardPush ?? 0,
          y: existing.airGuardVelocityY ?? 0,
          z: existing.airGuardVelocityZ ?? 0,
        };
        const x = airGuardVelocity.first ?? currentAirGuardVelocity.x;
        const y = airGuardVelocity.componentCount === 1
          ? currentAirGuardVelocity.y
          : airGuardVelocity.second ?? currentAirGuardVelocity.y;
        existing.airGuardPush = Math.abs(x);
        existing.airGuardVelocityY = y;
        existing.hitVelocities = {
          ...existing.hitVelocities,
          airGuard: {
            ...currentAirGuardVelocity,
            x,
            y,
          },
        };
      }
    }
    const airGuardVelocityZ = operation.airGuardVelocityZExpression === undefined
      ? operation.airGuardVelocityZ
      : resolveRuntimeHitDefFloatExpressionScalar(
          operation.airGuardVelocityZExpression,
          undefined,
          actor.runtime,
          context ?? {},
          resolveFloatScalar?.("airguard.velocity"),
        );
    if (airGuardVelocityZ !== undefined) {
      existing.airGuardVelocityZ = airGuardVelocityZ;
      existing.hitVelocities = {
        ...existing.hitVelocities,
        airGuard: {
          ...(existing.hitVelocities?.airGuard ?? { x: existing.airGuardPush ?? 0, y: existing.airGuardVelocityY ?? 0, z: 0 }),
          z: airGuardVelocityZ,
        },
      };
    }
    const cornerPushMutations: Array<{
      field: "cornerPush" | "airCornerPush" | "downCornerPush" | "guardCornerPush" | "airGuardCornerPush";
      key: "ground.cornerpush.veloff" | "air.cornerpush.veloff" | "down.cornerpush.veloff" | "guard.cornerpush.veloff" | "airguard.cornerpush.veloff";
      value?: number;
      expression?: number | string;
    }> = [
      { field: "cornerPush", key: "ground.cornerpush.veloff", value: operation.groundCornerPush, expression: operation.groundCornerPushExpression },
      { field: "airCornerPush", key: "air.cornerpush.veloff", value: operation.airCornerPush, expression: operation.airCornerPushExpression },
      { field: "downCornerPush", key: "down.cornerpush.veloff", value: operation.downCornerPush, expression: operation.downCornerPushExpression },
      { field: "guardCornerPush", key: "guard.cornerpush.veloff", value: operation.guardCornerPush, expression: operation.guardCornerPushExpression },
      { field: "airGuardCornerPush", key: "airguard.cornerpush.veloff", value: operation.airGuardCornerPush, expression: operation.airGuardCornerPushExpression },
    ];
    for (const mutation of cornerPushMutations) {
      if (mutation.value !== undefined) {
        existing[mutation.field] = mutation.value;
      }
      if (mutation.expression !== undefined) {
        const value = resolveRuntimeHitDefFloatExpressionScalar(
          mutation.expression,
          findParam(controller.source, mutation.key),
          actor.runtime,
          context ?? {},
          resolveFloatScalar?.(mutation.key),
        );
        if (value !== undefined) {
          existing[mutation.field] = value;
        }
      }
    }
    if (operation.sparkXy !== undefined) {
      const sparkXy = resolveRuntimeHitDefFloatExpressionPair(
        operation.sparkXy,
        findParam(controller.source, "sparkxy"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("sparkxy"),
      );
      if (sparkXy !== undefined && (sparkXy.first !== undefined || (sparkXy.componentCount === 2 && sparkXy.second !== undefined))) {
        const currentSparkXy = existing.sparkXy ?? [0, 0];
        existing.sparkXy = [
          sparkXy.first ?? currentSparkXy[0],
          sparkXy.componentCount === 2 ? sparkXy.second ?? currentSparkXy[1] : currentSparkXy[1],
        ];
      }
    }
    if (operation.snap !== undefined) {
      const snap = resolveRuntimeHitDefFloatExpressionPair(
        operation.snap,
        findParam(controller.source, "snap"),
        actor.runtime,
        context ?? {},
        resolveFloatPair?.("snap"),
      );
      if (snap !== undefined && (snap.first !== undefined || (snap.componentCount === 2 && snap.second !== undefined))) {
        const currentSnap = existing.hitVars?.hitOffset ?? { x: 0 };
        existing.hitVars = {
          ...existing.hitVars,
          hitOffset: {
            x: snap.first ?? currentSnap.x,
            ...(snap.componentCount === 2
              ? { y: snap.second ?? currentSnap.y }
              : currentSnap.y === undefined ? {} : { y: currentSnap.y }),
            ...(currentSnap.z === undefined ? {} : { z: currentSnap.z }),
          },
        };
      }
    }
    if (operation.hitSparkAngle !== undefined) {
      const hitSparkAngle = resolveRuntimeHitDefFloatExpressionScalar(
        operation.hitSparkAngle,
        findParam(controller.source, "sparkangle"),
        actor.runtime,
        context ?? {},
        resolveFloatScalar?.("sparkangle"),
      );
      if (hitSparkAngle !== undefined) {
        existing.hitSparkAngle = hitSparkAngle;
      }
    }
    if (operation.guardSparkAngle !== undefined) {
      const guardSparkAngle = resolveRuntimeHitDefFloatExpressionScalar(
        operation.guardSparkAngle,
        findParam(controller.source, "guard.sparkangle"),
        actor.runtime,
        context ?? {},
        resolveFloatScalar?.("guard.sparkangle"),
      );
      if (guardSparkAngle !== undefined) {
        existing.guardSparkAngle = guardSparkAngle;
      }
    }
    if (operation.guardSpark !== undefined) {
      existing.guardSpark = operation.guardSpark;
    }
    if (operation.guardSparkExpression !== undefined) {
      const guardSparkNo = resolveSparkNumber?.("guard.sparkno", operation.guardSparkExpression)
        ?? resolveRuntimeHitDefInteger(
          runtimeHitDefSparkNumericExpression(operation.guardSparkExpression) ?? operation.guardSparkExpression,
          actor.runtime,
          context ?? {},
        );
      if (guardSparkNo !== undefined && Number.isFinite(guardSparkNo)) {
        existing.guardSpark = `${runtimeHitDefSparkPrefix(operation.guardSparkExpression)}${Math.trunc(guardSparkNo)}`;
      }
    }
    if (operation.hitSound !== undefined) {
      const hitSoundValue = resolveSoundValue?.("hitsound", operation.hitSound)
        ?? runtimeHitDefStaticSoundRef(operation.hitSound);
      if (hitSoundValue !== undefined) {
        existing.hitSound = operation.hitSound;
        existing.hitSoundValue = hitSoundValue;
      }
    }
    if (operation.hitSoundExpression !== undefined) {
      const hitSoundValue = resolveSoundValue?.("hitsound", operation.hitSoundExpression);
      if (hitSoundValue !== undefined) {
        existing.hitSound = operation.hitSoundExpression;
        existing.hitSoundValue = hitSoundValue;
      }
    }
    if (operation.hitSoundChannel !== undefined) {
      const resolvedHitSoundChannel = resolveIntegerScalar
        ? resolveIntegerScalar("hitsound.channel")
        : resolveRuntimeHitDefIntegerScalar(
            operation.hitSoundChannel,
            findParam(controller.source, "hitsound.channel"),
            actor.runtime,
            context ?? {},
          );
      const hitSoundChannel = resolvedHitSoundChannel === undefined || !Number.isFinite(resolvedHitSoundChannel)
        ? undefined
        : Math.trunc(resolvedHitSoundChannel);
      if (hitSoundChannel !== undefined) {
        existing.hitSoundChannel = hitSoundChannel;
      }
    }
    if (operation.guardSound !== undefined) {
      const guardSoundValue = resolveSoundValue?.("guardsound", operation.guardSound)
        ?? runtimeHitDefStaticSoundRef(operation.guardSound);
      if (guardSoundValue !== undefined) {
        existing.guardSound = operation.guardSound;
        existing.guardSoundValue = guardSoundValue;
      }
    }
    if (operation.guardSoundExpression !== undefined) {
      const guardSoundValue = resolveSoundValue?.("guardsound", operation.guardSoundExpression);
      if (guardSoundValue !== undefined) {
        existing.guardSound = operation.guardSoundExpression;
        existing.guardSoundValue = guardSoundValue;
      }
    }
    if (operation.guardSoundChannel !== undefined) {
      const resolvedGuardSoundChannel = resolveIntegerScalar
        ? resolveIntegerScalar("guardsound.channel")
        : resolveRuntimeHitDefIntegerScalar(
            operation.guardSoundChannel,
            findParam(controller.source, "guardsound.channel"),
            actor.runtime,
            context ?? {},
          );
      const guardSoundChannel = resolvedGuardSoundChannel === undefined || !Number.isFinite(resolvedGuardSoundChannel)
        ? undefined
        : Math.trunc(resolvedGuardSoundChannel);
      if (guardSoundChannel !== undefined) {
        existing.guardSoundChannel = guardSoundChannel;
      }
    }
    const xAccel = resolveHitDefScalar(operation.xAccel, undefined, actor.runtime, context);
    const yAccel = resolveHitDefScalar(operation.yAccel, undefined, actor.runtime, context);
    const zAccel = resolveHitDefScalar(operation.zAccel, undefined, actor.runtime, context);
    const standFriction = resolveHitDefScalar(operation.standFriction, undefined, actor.runtime, context);
    const crouchFriction = resolveHitDefScalar(operation.crouchFriction, undefined, actor.runtime, context);
    if (
      xAccel !== undefined ||
      yAccel !== undefined ||
      zAccel !== undefined ||
      standFriction !== undefined ||
      crouchFriction !== undefined
    ) {
      existing.hitVars = {
        ...existing.hitVars,
        ...(xAccel === undefined ? {} : { xAccel }),
        ...(yAccel === undefined ? {} : { yAccel }),
        ...(zAccel === undefined ? {} : { zAccel }),
        ...(standFriction === undefined ? {} : { standFriction }),
        ...(crouchFriction === undefined ? {} : { crouchFriction }),
      };
    }
    if (operation.hitSparkScale !== undefined) {
      existing.hitSparkScale = resolveRuntimeHitDefFloatPair(
        operation.hitSparkScale,
        undefined,
        actor.runtime,
        context ?? {},
        undefined,
        existing.hitSparkScale ?? [1, 1],
      );
    }
    if (operation.guardSparkScale !== undefined) {
      existing.guardSparkScale = resolveRuntimeHitDefFloatPair(
        operation.guardSparkScale,
        undefined,
        actor.runtime,
        context ?? {},
        undefined,
        existing.guardSparkScale ?? [1, 1],
      );
    }
    if (operation.paletteFx !== undefined) {
      existing.paletteFx = resolveRuntimeHitDefPaletteFx({
        operation: operation.paletteFx,
        controller: controller.source,
        state: actor.runtime,
        context,
        resolver: resolvePaletteFx,
        fallback: existing.paletteFx,
      });
    }
    if (operation.envShake !== undefined) {
      existing.envShake = resolveRuntimeHitDefEnvShake(
        operation.envShake,
        controller.source,
        actor.runtime,
        context,
        resolveEnvShake,
        existing.envShake,
      );
    }
    if (operation.fallEnvShake !== undefined) {
      const fallEnvShake = resolveRuntimeHitDefEnvShake(
        operation.fallEnvShake,
        controller.source,
        actor.runtime,
        context,
        resolveFallEnvShake,
        existing.fall?.envShake === undefined
          ? undefined
          : { ...DEFAULT_RUNTIME_HITDEF_ENV_SHAKE, ...existing.fall.envShake },
        "fall.envshake",
      );
      if (fallEnvShake !== undefined) {
        existing.fall = {
          ...existing.fall,
          enabled: existing.fall?.enabled ?? false,
          envShake: fallEnvShake,
        };
      }
    }
    if (operation.fallImpact !== undefined) {
      const fallImpact = resolveRuntimeHitDefFallImpact(
        operation.fallImpact,
        controller.source,
        actor.runtime,
        context,
        resolveFallImpact,
      );
      if (fallImpact !== undefined) {
        const hasVelocity = fallImpact.xVelocity !== undefined || fallImpact.yVelocity !== undefined || fallImpact.zVelocity !== undefined;
        existing.fall = {
          ...existing.fall,
          enabled: existing.fall?.enabled ?? false,
          ...(fallImpact.damage === undefined ? {} : { damage: fallImpact.damage }),
          ...(hasVelocity
            ? {
                velocity: {
                  ...existing.fall?.velocity,
                  ...(fallImpact.xVelocity === undefined ? {} : { x: fallImpact.xVelocity }),
                  ...(fallImpact.yVelocity === undefined ? {} : { y: fallImpact.yVelocity }),
                  ...(fallImpact.zVelocity === undefined ? {} : { z: fallImpact.zVelocity }),
                },
              }
            : {}),
        };
      }
    }
    if (operation.fallRecovery !== undefined) {
      const fallRecovery = resolveRuntimeHitDefFallRecovery(
        operation.fallRecovery,
        controller.source,
        actor.runtime,
        context,
        resolveFallRecovery,
      );
      if (fallRecovery !== undefined) {
        existing.fall = {
          ...existing.fall,
          enabled: existing.fall?.enabled ?? false,
          ...(fallRecovery.recover === undefined ? {} : { recover: fallRecovery.recover !== 0 }),
          ...(fallRecovery.recoverTime === undefined ? {} : { recoverTime: fallRecovery.recoverTime }),
          ...(fallRecovery.downRecover === undefined ? {} : { downRecover: fallRecovery.downRecover !== 0 }),
          ...(fallRecovery.downRecoverTime === undefined ? {} : { downRecoverTime: fallRecovery.downRecoverTime }),
        };
      }
    }
    if (operation.fallFlags !== undefined) {
      const fallFlags = resolveRuntimeHitDefFallFlags(
        operation.fallFlags,
        controller.source,
        actor.runtime,
        context,
        resolveFallFlags,
      );
      if (fallFlags !== undefined) {
        existing.fall = {
          ...existing.fall,
          enabled: fallFlags.enabled === undefined ? existing.fall?.enabled ?? false : fallFlags.enabled !== 0,
          ...(fallFlags.airFall === undefined ? {} : { airFall: fallFlags.airFall !== 0 }),
          ...(fallFlags.kill === undefined ? {} : { kill: fallFlags.kill !== 0 }),
        };
      }
    }
    if (operation.getPower !== undefined) {
      const attackerPower = resolveRuntimeHitDefPowerPair(
        operation.getPower,
        findParam(controller.source, "getpower"),
        actor.runtime,
        context ?? {},
        resolveIntegerPair?.("getpower"),
      );
      if (attackerPower?.hit !== undefined) existing.attackerHitPower = attackerPower.hit;
      if (attackerPower?.componentCount === 2 && attackerPower.guard !== undefined) {
        existing.attackerGuardPower = attackerPower.guard;
      }
    }
    if (operation.givePower !== undefined) {
      const givePower = resolveRuntimeHitDefPowerPair(
        operation.givePower,
        findParam(controller.source, "givepower"),
        actor.runtime,
        context ?? {},
        resolveIntegerPair?.("givepower"),
      );
      if (givePower?.hit !== undefined) existing.hitPower = givePower.hit;
      if (givePower?.componentCount === 2 && givePower.guard !== undefined) {
        existing.guardPower = givePower.guard;
      }
    }
    if (operation.id !== undefined) {
      const id = resolveRuntimeHitDefIntegerScalar(
        operation.id,
        findParam(controller.source, "id"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("id"),
      );
      if (id !== undefined) {
        existing.targetId = Math.max(0, id);
        existing.hitVars = { ...existing.hitVars, hitId: existing.targetId };
      }
    }
    if (operation.chainId !== undefined) {
      const chainId = resolveRuntimeHitDefIntegerScalar(
        operation.chainId,
        findParam(controller.source, "chainid"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("chainid"),
      );
      if (chainId === -1) {
        const { chainId: _removedChainId, ...hitVars } = existing.hitVars ?? {};
        existing.hitVars = hitVars;
      } else if (chainId !== undefined) {
        existing.hitVars = { ...existing.hitVars, chainId };
      }
    }
    const noChainIds = operation.noChainIds
      ?? resolveIntegerList?.("nochainid")
      ?? staticRuntimeIntegerList(findParam(controller.source, "nochainid"), 8);
    if (noChainIds !== undefined) {
      existing.noChainIds = normalizeRuntimeIntegerList(noChainIds, 8);
    }
    if (operation.unhittableTime !== undefined) {
      const unhittableTime = resolveRuntimeHitDefIntegerPair(
        operation.unhittableTime,
        findParam(controller.source, "unhittabletime"),
        actor.runtime,
        context ?? {},
        resolveIntegerPair?.("unhittabletime"),
        existing.unhittableTime ?? [-1, -1],
        true,
      );
      if (unhittableTime) existing.unhittableTime = unhittableTime;
    }
    if (operation.hitCount !== undefined) {
      existing.hitVars = { ...existing.hitVars, hitCount: operation.hitCount };
    }
    if (operation.hitCountExpression !== undefined) {
      const hitCount = resolveRuntimeHitDefIntegerScalar(
        operation.hitCountExpression,
        findParam(controller.source, "numhits"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("numhits"),
      );
      if (hitCount !== undefined) existing.hitVars = { ...existing.hitVars, hitCount };
    }
    if (operation.attr !== undefined) {
      existing.attr = operation.attr;
    }
    if (operation.guardFlag !== undefined) {
      existing.guardFlag = operation.guardFlag;
    }
    if (operation.hitFlag !== undefined) {
      existing.hitFlag = operation.hitFlag;
    }
    if (operation.p1StateNo !== undefined) {
      existing.p1StateNo = operation.p1StateNo;
    }
    if (operation.p2StateNo !== undefined) {
      existing.p2StateNo = operation.p2StateNo;
      existing.p2GetP1State = true;
    }
    if (operation.p2GetP1State !== undefined) {
      existing.p2GetP1State = operation.p2GetP1State;
    }
    if (operation.p1Facing !== undefined) {
      const p1Facing = resolveRuntimeHitDefIntegerScalar(
        operation.p1Facing,
        undefined,
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("p1facing"),
      );
      if (p1Facing !== undefined) existing.p1Facing = p1Facing;
    }
    if (operation.p1GetP2Facing !== undefined) {
      const p1GetP2Facing = resolveRuntimeHitDefIntegerScalar(
        operation.p1GetP2Facing,
        undefined,
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("p1getp2facing"),
      );
      if (p1GetP2Facing !== undefined) existing.p1GetP2Facing = p1GetP2Facing;
    }
    if (operation.p2Facing !== undefined) {
      const p2Facing = resolveRuntimeHitDefIntegerScalar(
        operation.p2Facing,
        findParam(controller.source, "p2facing"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("p2facing"),
      );
      if (p2Facing !== undefined) existing.p2Facing = p2Facing;
    }
    if (operation.p1SpritePriority !== undefined || operation.p1SpritePriorityExpression !== undefined) {
      const p1SpritePriority = resolveRuntimeHitDefIntegerScalar(
        operation.p1SpritePriorityExpression ?? operation.p1SpritePriority,
        findParam(controller.source, "p1sprpriority") ?? findParam(controller.source, "sprpriority"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("p1sprpriority"),
      );
      if (p1SpritePriority !== undefined) existing.p1SpritePriority = p1SpritePriority;
    }
    if (operation.p2SpritePriority !== undefined || operation.p2SpritePriorityExpression !== undefined) {
      const p2SpritePriority = resolveRuntimeHitDefIntegerScalar(
        operation.p2SpritePriorityExpression ?? operation.p2SpritePriority,
        findParam(controller.source, "p2sprpriority"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("p2sprpriority"),
      );
      if (p2SpritePriority !== undefined) existing.p2SpritePriority = p2SpritePriority;
    }
    if (operation.priority !== undefined || operation.priorityExpression !== undefined) {
      const priority = resolveRuntimeHitDefIntegerScalar(
        operation.priorityExpression ?? operation.priority,
        findParam(controller.source, "priority"),
        actor.runtime,
        context ?? {},
        resolveIntegerScalar?.("priority"),
      );
      if (priority !== undefined) existing.priority = normalizeRuntimeHitDefPriority(priority);
      existing.priorityType = operation.priorityType ?? "hit";
    }
    if (operation.kill !== undefined) {
      existing.kill = operation.kill;
    }
    if (operation.guardKill !== undefined) {
      existing.guardKill = operation.guardKill;
    }
    if (operation.hitOnce !== undefined) {
      existing.hitOnce = operation.hitOnce;
    }
    if (operation.lethalFlags !== undefined) {
      const lethalFlags = resolveRuntimeHitDefLethalFlags(
        operation.lethalFlags,
        controller.source,
        actor.runtime,
        context ?? {},
        resolveLethalFlags,
      );
      if (lethalFlags?.kill !== undefined) existing.kill = lethalFlags.kill !== 0;
      if (lethalFlags?.guardKill !== undefined) existing.guardKill = lethalFlags.guardKill !== 0;
      if (lethalFlags?.hitOnce !== undefined) existing.hitOnce = lethalFlags.hitOnce !== 0;
    }
    if (operation.fallKill !== undefined) {
      existing.fall = {
        ...existing.fall,
        enabled: existing.fall?.enabled ?? false,
        kill: operation.fallKill,
      };
    }
    recordController?.(actor, controller.source);
    recordOperation?.(actor, operation);
    return {
      modified: true,
      recordedController: recordController !== undefined,
      recordedOperation: recordOperation !== undefined,
      operation,
    };
  }
}

function hitDefPriorityType(value: string | undefined): DemoMove["priorityType"] | undefined {
  const normalized = value?.split(",")[1]?.trim().replace(/^"|"$/g, "").toLowerCase();
  return normalized === "hit" || normalized === "miss" || normalized === "dodge" ? normalized : undefined;
}

function normalizedNumberPair(value: string | undefined): [number, number] | undefined {
  const pair = numberPair(value);
  return pair ? [pair[0], pair[1] ?? pair[0]] : undefined;
}

function buildMoveFallData(
  controller: MugenStateController,
  existing: DemoMove | undefined,
  operation: HitDefControllerOp | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  resolveFallEnvShake?: RuntimeHitDefEnvShakeResolver,
  resolveFallImpact?: RuntimeHitDefFallImpactResolver,
  resolveFallRecovery?: RuntimeHitDefFallRecoveryResolver,
  resolveFallFlags?: RuntimeHitDefFallFlagsResolver,
): DemoMove["fall"] | undefined {
  const fallFlags = resolveRuntimeHitDefFallFlags(
    operation?.fallFlags,
    controller,
    state,
    context,
    resolveFallFlags,
  );
  const enabled =
    fallFlags?.enabled ??
    (operation?.fall.enabled === undefined ? undefined : operation.fall.enabled ? 1 : 0) ??
    firstNumber(findParam(controller, "fall")) ??
    firstNumber(findParam(controller, "ground.fall"));
  const airFall = fallFlags?.airFall
    ?? (operation?.fall.airFall === undefined ? firstNumber(findParam(controller, "air.fall")) : operation.fall.airFall ? 1 : 0);
  const fallImpact = resolveRuntimeHitDefFallImpact(
    operation?.fallImpact,
    controller,
    state,
    context,
    resolveFallImpact,
  );
  const damage = fallImpact?.damage ?? operation?.fall.damage ?? firstNumber(findParam(controller, "fall.damage")) ?? existing?.fall?.damage;
  const defenceUp = operation?.fall.defenceUp ?? firstNumber(findParam(controller, "fall.defence_up")) ?? existing?.fall?.defenceUp;
  const kill = fallFlags?.kill === undefined
    ? operation?.fall.kill ?? booleanHitDefParam(controller, "fall.kill") ?? existing?.fall?.kill ?? true
    : fallFlags.kill !== 0;
  const xVelocity = fallImpact?.xVelocity ?? operation?.fall.xVelocity ?? firstNumber(findParam(controller, "fall.xvelocity")) ?? existing?.fall?.velocity?.x;
  const yVelocity = fallImpact?.yVelocity ?? operation?.fall.yVelocity ?? firstNumber(findParam(controller, "fall.yvelocity")) ?? existing?.fall?.velocity?.y;
  const zVelocity = fallImpact?.zVelocity ?? operation?.fall.zVelocity ?? firstNumber(findParam(controller, "fall.zvelocity")) ?? existing?.fall?.velocity?.z;
  const envShake = resolveRuntimeHitDefEnvShake(
    operation?.fallEnvShake,
    controller,
    state,
    context,
    resolveFallEnvShake,
    undefined,
    "fall.envshake",
  );
  const fallRecovery = resolveRuntimeHitDefFallRecovery(
    operation?.fallRecovery,
    controller,
    state,
    context,
    resolveFallRecovery,
  );
  const recover = fallRecovery?.recover
    ?? (operation?.fall.recover === undefined ? firstNumber(findParam(controller, "fall.recover")) : operation.fall.recover ? 1 : 0);
  const recoverTime = fallRecovery?.recoverTime
    ?? operation?.fall.recoverTime
    ?? firstNumber(findParam(controller, "fall.recovertime"))
    ?? existing?.fall?.recoverTime;
  const downRecover = fallRecovery?.downRecover
    ?? (operation?.fall.downRecover === undefined ? firstNumber(findParam(controller, "down.recover")) : operation.fall.downRecover ? 1 : 0);
  const downRecoverTime = fallRecovery?.downRecoverTime
    ?? operation?.fall.downRecoverTime
    ?? firstNumber(findParam(controller, "down.recovertime"))
    ?? existing?.fall?.downRecoverTime;
  const hasAny =
    enabled !== undefined ||
    airFall !== undefined ||
    damage !== undefined ||
    defenceUp !== undefined ||
    operation?.fall.kill !== undefined ||
    findParam(controller, "fall.kill") !== undefined ||
    xVelocity !== undefined ||
    yVelocity !== undefined ||
    zVelocity !== undefined ||
    envShake !== undefined ||
    recover !== undefined ||
    recoverTime !== undefined ||
    downRecover !== undefined ||
    downRecoverTime !== undefined;
  if (!hasAny) {
    return existing?.fall?.envShake === undefined
      ? existing?.fall
      : { ...existing.fall, envShake: undefined };
  }
  return {
    enabled: enabled !== undefined ? enabled !== 0 : existing?.fall?.enabled ?? false,
    ...(airFall !== undefined || existing?.fall?.airFall !== undefined
      ? { airFall: airFall !== undefined ? airFall !== 0 : existing?.fall?.airFall }
      : {}),
    damage,
    defenceUp,
    kill,
    velocity:
      xVelocity !== undefined || yVelocity !== undefined || zVelocity !== undefined
        ? { x: xVelocity, y: yVelocity, ...(zVelocity === undefined ? {} : { z: zVelocity }) }
        : existing?.fall?.velocity,
    recover: recover !== undefined ? recover !== 0 : existing?.fall?.recover,
    recoverTime,
    downRecover: downRecover !== undefined ? downRecover !== 0 : existing?.fall?.downRecover,
    downRecoverTime,
    envShake,
  };
}

function findParam(controller: { params: Record<string, string> }, key: string): string | undefined {
  return findControllerParam(controller, key);
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
  return values.every(Number.isFinite) ? values.map(Math.trunc) : undefined;
}

function normalizeRuntimeIntegerList(values: readonly number[], maxLength: number): number[] {
  return values.slice(0, maxLength).map((value) => Math.trunc(value));
}

function resolveHitDefScalar(
  operationValue: number | string | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): number | undefined {
  if (typeof operationValue === "number") {
    return operationValue;
  }
  if (typeof operationValue === "string") {
    return evaluateRuntimeControllerNumber(operationValue, state, context);
  }
  return firstNumber(rawValue);
}

const DEFAULT_RUNTIME_HITDEF_ENV_SHAKE: RuntimeContactEnvShake = {
  time: 0,
  freq: 60,
  ampl: -4,
  phase: 0,
  mul: 1,
  dir: 0,
};

function resolveRuntimeHitDefEnvShake(
  operation: MugenHitDefEnvShakeOp | undefined,
  controller: MugenStateController,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  resolver?: RuntimeHitDefEnvShakeResolver,
  fallback?: RuntimeContactEnvShake,
  prefix = "envshake",
): RuntimeContactEnvShake | undefined {
  const raw = {
    time: findParam(controller, `${prefix}.time`),
    freq: findParam(controller, `${prefix}.freq`),
    ampl: findParam(controller, `${prefix}.ampl`),
    phase: findParam(controller, `${prefix}.phase`),
    mul: findParam(controller, `${prefix}.mul`),
    dir: findParam(controller, `${prefix}.dir`),
  };
  const authored = operation !== undefined || Object.values(raw).some((value) => value !== undefined);
  if (!authored) return fallback;
  const base = fallback ?? DEFAULT_RUNTIME_HITDEF_ENV_SHAKE;
  const component = (
    key: keyof RuntimeContactEnvShake,
    operationValue: number | string | undefined,
  ): number => {
    const value = resolver?.(key) ?? resolveHitDefScalar(operationValue, raw[key], state, context);
    return value !== undefined && Number.isFinite(value) ? value : base[key];
  };
  return {
    time: Math.trunc(component("time", operation?.time)),
    freq: Math.max(0, component("freq", operation?.freq)),
    ampl: Math.trunc(component("ampl", operation?.ampl)),
    phase: component("phase", operation?.phase),
    mul: component("mul", operation?.mul),
    dir: component("dir", operation?.dir),
  };
}

function resolveRuntimeHitDefFallImpact(
  operation: MugenHitDefFallImpactOp | undefined,
  controller: MugenStateController,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  resolver?: RuntimeHitDefFallImpactResolver,
): { damage?: number; xVelocity?: number; yVelocity?: number; zVelocity?: number } | undefined {
  const raw = {
    damage: findParam(controller, "fall.damage"),
    xVelocity: findParam(controller, "fall.xvelocity"),
    yVelocity: findParam(controller, "fall.yvelocity"),
    zVelocity: findParam(controller, "fall.zvelocity"),
  };
  if (operation === undefined && Object.values(raw).every((value) => value === undefined)) return undefined;
  const component = (
    key: keyof typeof raw,
    operationValue: number | string | undefined,
  ): number | undefined => {
    const value = resolver?.(key) ?? resolveHitDefScalar(operationValue, raw[key], state, context);
    return value !== undefined && Number.isFinite(value) ? value : undefined;
  };
  const damage = component("damage", operation?.damage);
  const xVelocity = component("xVelocity", operation?.xVelocity);
  const yVelocity = component("yVelocity", operation?.yVelocity);
  const zVelocity = component("zVelocity", operation?.zVelocity);
  if (damage === undefined && xVelocity === undefined && yVelocity === undefined && zVelocity === undefined) return undefined;
  return {
    ...(damage === undefined ? {} : { damage: Math.trunc(damage) }),
    ...(xVelocity === undefined ? {} : { xVelocity }),
    ...(yVelocity === undefined ? {} : { yVelocity }),
    ...(zVelocity === undefined ? {} : { zVelocity }),
  };
}

function resolveRuntimeHitDefFallRecovery(
  operation: MugenHitDefFallRecoveryOp | undefined,
  controller: MugenStateController,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  resolver?: RuntimeHitDefFallRecoveryResolver,
): { recover?: number; recoverTime?: number; downRecover?: number; downRecoverTime?: number } | undefined {
  const raw = {
    recover: findParam(controller, "fall.recover"),
    recoverTime: findParam(controller, "fall.recovertime"),
    downRecover: findParam(controller, "down.recover"),
    downRecoverTime: findParam(controller, "down.recovertime"),
  };
  if (operation === undefined && Object.values(raw).every((value) => value === undefined)) return undefined;
  const component = (
    key: keyof typeof raw,
    operationValue: number | string | undefined,
  ): number | undefined => {
    const value = resolver?.(key) ?? resolveHitDefScalar(operationValue, raw[key], state, context);
    return value !== undefined && Number.isFinite(value) ? Math.trunc(value) : undefined;
  };
  const recover = component("recover", operation?.recover);
  const recoverTime = component("recoverTime", operation?.recoverTime);
  const downRecover = component("downRecover", operation?.downRecover);
  const downRecoverTime = component("downRecoverTime", operation?.downRecoverTime);
  if (recover === undefined && recoverTime === undefined && downRecover === undefined && downRecoverTime === undefined) return undefined;
  return {
    ...(recover === undefined ? {} : { recover }),
    ...(recoverTime === undefined ? {} : { recoverTime }),
    ...(downRecover === undefined ? {} : { downRecover }),
    ...(downRecoverTime === undefined ? {} : { downRecoverTime }),
  };
}

function resolveRuntimeHitDefFallFlags(
  operation: MugenHitDefFallFlagsOp | undefined,
  controller: MugenStateController,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  resolver?: RuntimeHitDefFallFlagsResolver,
): { enabled?: number; airFall?: number; kill?: number } | undefined {
  const raw = {
    enabled: findParam(controller, "fall") ?? findParam(controller, "ground.fall"),
    airFall: findParam(controller, "air.fall"),
    kill: findParam(controller, "fall.kill"),
  };
  if (operation === undefined && Object.values(raw).every((value) => value === undefined)) return undefined;
  const component = (
    key: keyof typeof raw,
    operationValue: number | string | undefined,
  ): number | undefined => {
    const value = resolver?.(key) ?? resolveHitDefScalar(operationValue, raw[key], state, context);
    return value !== undefined && Number.isFinite(value) ? Math.trunc(value) : undefined;
  };
  const enabled = component("enabled", operation?.enabled);
  const airFall = component("airFall", operation?.airFall);
  const kill = component("kill", operation?.kill);
  if (enabled === undefined && airFall === undefined && kill === undefined) return undefined;
  return {
    ...(enabled === undefined ? {} : { enabled }),
    ...(airFall === undefined ? {} : { airFall }),
    ...(kill === undefined ? {} : { kill }),
  };
}

function resolveRuntimeHitDefLethalFlags(
  operation: MugenHitDefLethalFlagsOp | undefined,
  controller: MugenStateController,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  resolver?: RuntimeHitDefLethalFlagsResolver,
): { kill?: number; guardKill?: number; hitOnce?: number } | undefined {
  const raw = {
    kill: findParam(controller, "kill"),
    guardKill: findParam(controller, "guard.kill"),
    hitOnce: findParam(controller, "hitonce"),
  };
  if (operation === undefined && Object.values(raw).every((value) => value === undefined)) return undefined;
  const component = (
    key: keyof typeof raw,
    operationValue: number | string | undefined,
  ): number | undefined => {
    const value = resolver?.(key) ?? resolveHitDefScalar(operationValue, raw[key], state, context);
    return value !== undefined && Number.isFinite(value) ? Math.trunc(value) : undefined;
  };
  const kill = component("kill", operation?.kill);
  const guardKill = component("guardKill", operation?.guardKill);
  const hitOnce = component("hitOnce", operation?.hitOnce);
  if (kill === undefined && guardKill === undefined && hitOnce === undefined) return undefined;
  return {
    ...(kill === undefined ? {} : { kill }),
    ...(guardKill === undefined ? {} : { guardKill }),
    ...(hitOnce === undefined ? {} : { hitOnce }),
  };
}

function resolveRuntimeHitDefIntegerScalar(
  operationValue: number | string | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  resolvedOverride?: number,
): number | undefined {
  const value = resolvedOverride ?? operationValue;
  if (value !== undefined) return resolveRuntimeHitDefInteger(value, state, context);
  const rawNumber = firstNumber(rawValue);
  return rawNumber === undefined ? undefined : Math.trunc(rawNumber);
}

function resolveRuntimeHitDefIntegerPair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  resolvedOverride: [number?, number?] | undefined,
  fallback: [number, number],
  preserveMissingSecond = false,
): [number, number] {
  const source = resolvedOverride ?? operationValue ?? splitRuntimeExpressionPair(rawValue);
  if (!source) return [...fallback];
  const first = source[0] === undefined ? undefined : resolveRuntimeHitDefInteger(source[0], state, context);
  const second = source[1] === undefined
    ? (preserveMissingSecond ? fallback[1] : -1)
    : resolveRuntimeHitDefInteger(source[1], state, context);
  return [first ?? fallback[0], second ?? fallback[1]];
}

function resolveRuntimeHitDefPowerPair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  resolvedOverride: [number?, number?] | undefined,
): { componentCount: 1 | 2; hit?: number; guard?: number } | undefined {
  const authored = operationValue ?? splitRuntimeExpressionPair(rawValue);
  if (!authored) return undefined;
  const values = resolvedOverride ?? authored;
  const hit = values[0] === undefined ? undefined : resolveRuntimeHitDefInteger(values[0], state, context);
  const componentCount = authored[1] === undefined ? 1 : 2;
  if (componentCount === 1) {
    return { componentCount, ...(hit === undefined ? {} : { hit }) };
  }
  const guard = values[1] === undefined ? undefined : resolveRuntimeHitDefInteger(values[1], state, context);
  return {
    componentCount,
    ...(hit === undefined ? {} : { hit }),
    ...(guard === undefined ? {} : { guard }),
  };
}

function resolveRuntimeHitDefFloatPair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  resolvedOverride: [number?, number?] | undefined,
  fallback: [number, number],
): [number, number] {
  const source = resolvedOverride ?? operationValue ?? splitRuntimeExpressionPair(rawValue);
  if (!source) return [...fallback];
  const resolveComponent = (value: number | string | undefined): number | undefined => {
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (typeof value !== "string") return undefined;
    const resolved = evaluateRuntimeControllerNumber(value, state, context);
    return resolved !== undefined && Number.isFinite(resolved) ? resolved : undefined;
  };
  return [
    resolveComponent(source[0]) ?? fallback[0],
    resolveComponent(source[1]) ?? fallback[1],
  ];
}

function resolveRuntimeHitDefFloatExpressionPair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  resolvedOverride: [number?, number?] | undefined,
): { first?: number; second?: number; componentCount: 1 | 2 } | undefined {
  const authored = operationValue ?? splitRuntimeExpressionPair(rawValue);
  if (!authored) return undefined;
  const source = resolvedOverride ?? authored;
  const resolveComponent = (value: number | string | undefined): number | undefined => {
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (typeof value !== "string") return undefined;
    const resolved = evaluateRuntimeControllerNumber(value, state, context);
    return resolved !== undefined && Number.isFinite(resolved) ? resolved : undefined;
  };
  const componentCount = authored.length === 1 ? 1 : 2;
  const first = resolveComponent(source[0]);
  const second = componentCount === 2 ? resolveComponent(source[1]) : undefined;
  return {
    ...(first === undefined ? {} : { first }),
    ...(second === undefined ? {} : { second }),
    componentCount,
  };
}

function resolveRuntimeHitDefFloatExpressionScalar(
  operationValue: number | string,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  resolvedOverride: number | undefined,
): number | undefined {
  const authored = resolvedOverride ?? operationValue ?? firstNumber(rawValue);
  const resolved = typeof authored === "number"
    ? authored
    : evaluateRuntimeControllerNumber(authored, state, context);
  return resolved !== undefined && Number.isFinite(resolved) ? resolved : undefined;
}

function runtimeHitDefUsesThrowAttribute(attr: string): boolean {
  const { types } = parseHitAttribute(attr);
  return [...types].some((type) => type === "NT" || type === "ST" || type === "HT" || type === "AT");
}

function resolveRuntimeHitDefInteger(
  value: number | string,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
): number | undefined {
  const resolved = typeof value === "number"
    ? value
    : evaluateRuntimeControllerNumber(value, state, context);
  return Number.isFinite(resolved) ? Math.trunc(resolved!) : undefined;
}

function splitRuntimeExpressionPair(raw: string | undefined): [string, string?] | undefined {
  if (!raw) return undefined;
  let depth = 0;
  let split = -1;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index]!;
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "," && depth === 0) {
      if (split >= 0) return undefined;
      split = index;
    }
    if (depth < 0) return undefined;
  }
  if (depth !== 0) return undefined;
  const first = (split < 0 ? raw : raw.slice(0, split)).trim();
  const second = split < 0 ? undefined : raw.slice(split + 1).trim();
  return first && (split < 0 || second) ? [first, second] : undefined;
}

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function booleanHitDefParam(controller: { params: Record<string, string> }, key: string): boolean | undefined {
  const value = firstNumber(findParam(controller, key));
  return value === undefined ? undefined : value !== 0;
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

function snapVector(value: string | undefined): [number, number?, number?] | undefined {
  if (!value) return undefined;
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length < 1 || parts.length > 3 || parts.some((part) => part.length === 0)) return undefined;
  const values = parts.map(Number);
  if (values.some((part) => !Number.isFinite(part)) || values[0] === undefined) return undefined;
  return values.length === 3
    ? [values[0]!, values[1]!, values[2]!]
    : values.length === 2
      ? [values[0]!, values[1]!]
      : [values[0]!];
}

function normalizeSparkOffset(value: [number, number?]): [number, number] {
  return [value[0], value[1] ?? value[0]];
}

/** Removes the supported MUGEN/Ikemen spark prefix before caller evaluation. */
export function runtimeHitDefSparkNumericExpression(value: string | undefined): string | undefined {
  const normalized = stripMugenString(value);
  if (!normalized) return undefined;
  const prefixed = /^([FSM])\s*(.+)$/i.exec(normalized);
  return (prefixed?.[2] ?? normalized).trim() || undefined;
}

/** Resolves the prefix used by a dynamic spark expression; omitted prefixes use FightFX. */
export function runtimeHitDefSparkPrefix(value: string | undefined): string {
  const normalized = stripMugenString(value);
  const prefixed = normalized ? /^([FSM])\s*(.+)$/i.exec(normalized) : undefined;
  return prefixed?.[1]?.toUpperCase() ?? "F";
}

function runtimeHitVelocityVector(value: [number, number?, number?]): { x: number; y: number; z: number } {
  return { x: value[0] ?? 0, y: value[1] ?? 0, z: value[2] ?? 0 };
}

function completeFreshAirGuardVelocity(
  authored: [number, number?, number?] | undefined,
  defaults: [number, number?, number?] | undefined,
): [number, number?, number?] | undefined {
  if (authored === undefined) return defaults;
  const y = authored[1] ?? defaults?.[1] ?? 0;
  const z = authored[2] ?? defaults?.[2];
  return z === undefined ? [authored[0], y] : [authored[0], y, z];
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

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function runtimeHitDefStaticSoundRef(value: string | undefined): RuntimeResolvedSoundRef | undefined {
  const normalized = stripMugenString(value);
  if (!normalized) return undefined;
  const match = /^\s*([FS])?\s*(-?\d+)\s*,\s*(-?\d+)\s*$/i.exec(normalized);
  if (!match || match[2] === undefined || match[3] === undefined) return undefined;
  const group = Number(match[2]);
  const index = Number(match[3]);
  if (!Number.isFinite(group) || !Number.isFinite(index)) return undefined;
  const rawPrefix = match[1]?.toUpperCase() as "F" | "S" | undefined;
  return { ...(rawPrefix ? { rawPrefix } : {}), group, index };
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

function defaultFallAnimType(airAnimType: number): number {
  return airAnimType >= 4 ? airAnimType : 3;
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

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

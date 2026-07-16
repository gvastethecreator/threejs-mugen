import type { HitDefControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenAnimationFrame } from "../model/MugenAnimation";
import type { CollisionBox } from "../model/CollisionBox";
import { normalizeMugenCollisionBoxType } from "../model/CollisionBox";
import type { MugenStateController } from "../model/MugenState";
import { DEFAULT_RUNTIME_GUARD_DISTANCE } from "./CombatResolver";
import type { DemoMove } from "./demoFighters";
import { resolveHitDefCornerPush } from "./HitDefCornerPush";
import { resolveHitDefGuardTiming } from "./HitDefTiming";
import { deriveDefaultAirGuardVelocity } from "./HitDefVelocity";
import { runtimeDizzyPointsFromHitDef } from "./DizzyPointsDefaults";
import { runtimeAnimationFrameDuration } from "./RuntimeAnimationSystem";
import { resetRuntimeHitDefContactMemory, type RuntimeHitDefContactMemoryActor } from "./RuntimeHitDefContactMemorySystem";
import { applyRuntimeControl } from "./RuntimeResourceSystem";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState, RuntimeResolvedSoundRef } from "./types";
import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";

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
  frame?: MugenAnimationFrame;
  constants?: RuntimeResourceConstants;
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

export class RuntimeHitDefControllerDispatchWorld {
  apply<TActor extends RuntimeHitDefControllerDispatchActor>({
    actor,
    controller,
    frame,
    constants,
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
    const damage = operation?.damage ?? firstNumber(findParam(source, "damage")) ?? existing?.damage ?? 45;
    const guardDamage = operation?.guardDamage ?? secondNumber(findParam(source, "damage")) ?? existing?.guardDamage ?? 0;
    const guardPoints = operation?.guardPoints ?? firstNumber(findParam(source, "guardpoints")) ?? existing?.guardPoints;
    const attr = operation?.attr ?? stripMugenString(findParam(source, "attr")) ?? existing?.attr ?? "S,NA";
    const dizzyPoints =
      operation?.dizzyPoints ??
      firstNumber(findParam(source, "dizzypoints")) ??
      runtimeDizzyPointsFromHitDef(damage, attr, actor.constants ?? constants);
    const redLife = operation?.redLife ?? firstNumber(findParam(source, "redlife")) ?? existing?.redLife;
    const guardRedLife = operation?.guardRedLife ?? secondNumber(findParam(source, "redlife")) ?? existing?.guardRedLife;
    const kill = operation?.kill ?? booleanHitDefParam(source, "kill") ?? existing?.kill ?? true;
    const guardKill = operation?.guardKill ?? booleanHitDefParam(source, "guard.kill") ?? existing?.guardKill ?? true;
    const hitFlag = operation?.hitFlag ?? stripMugenString(findParam(source, "hitflag")) ?? existing?.hitFlag;
    const p2ClsnCheck = operation?.p2ClsnCheck ?? normalizeMugenCollisionBoxType(findParam(source, "p2clsncheck")) ?? existing?.p2ClsnCheck;
    const p2ClsnRequire = operation?.p2ClsnRequire ?? normalizeMugenCollisionBoxType(findParam(source, "p2clsnrequire")) ?? existing?.p2ClsnRequire;
    const hitPause = operation?.pauseTime ?? firstNumber(findParam(source, "pausetime")) ?? existing?.hitPause ?? (damage >= 60 ? 9 : 7);
    const hitStun = operation?.groundHitTime ?? firstNumber(findParam(source, "ground.hittime")) ?? existing?.hitStun ?? (damage >= 60 ? 28 : 22);
    const priority = clampHitDefPriority(operation?.priority ?? firstNumber(findParam(source, "priority")) ?? 4);
    const priorityType = operation?.priorityType ?? hitDefPriorityType(findParam(source, "priority")) ?? "hit";
    const groundVelocity = operation?.groundVelocity ?? velocityPair(findParam(source, "ground.velocity"));
    const push = Math.abs(groundVelocity?.[0] ?? existing?.push ?? (damage >= 60 ? 30 : 20));
    const guardPause =
      operation?.guardPauseTime ?? firstNumber(findParam(source, "guard.pausetime")) ?? existing?.guardPause ?? Math.max(1, Math.round(hitPause * 0.75));
    const guardTiming = resolveHitDefGuardTiming({
      groundHitTime: hitStun,
      guardHitTime: operation?.guardHitTime ?? firstNumber(findParam(source, "guard.hittime")),
      guardSlideTime: operation?.guardSlideTime ?? firstNumber(findParam(source, "guard.slidetime")),
      guardControlTime: operation?.guardControlTime ?? firstNumber(findParam(source, "guard.ctrltime")),
    });
    const guardStun = guardTiming.guardHitTime ?? existing?.guardStun ?? Math.max(1, Math.round(hitStun * 0.55));
    const guardSlideTime = guardTiming.guardSlideTime ?? existing?.guardSlideTime;
    const guardControlTime = guardTiming.guardControlTime ?? existing?.guardControlTime;
    const guardVelocity = operation?.guardVelocity ?? velocityPair(findParam(source, "guard.velocity"));
    const airVelocity = operation?.airVelocity ?? velocityPair(findParam(source, "air.velocity"));
    const airGuardVelocity =
      operation?.airGuardVelocity ?? velocityPair(findParam(source, "airguard.velocity")) ?? deriveDefaultAirGuardVelocity(airVelocity);
    const guardVelocityX = guardVelocity?.[0] ?? groundVelocity?.[0];
    const guardDistance =
      operation?.guardDistance ?? firstNumber(findParam(source, "guard.dist")) ?? existing?.guardDistance ?? DEFAULT_RUNTIME_GUARD_DISTANCE;
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
    const animType =
      operation?.fallAnimType ??
      hitAnimType(findParam(source, "fall.animtype")) ??
      operation?.animType ??
      hitAnimType(findParam(source, "animtype")) ??
      existing?.hitVars?.animType ??
      0;
    const yAccel = operation?.yAccel ?? firstNumber(findParam(source, "yaccel")) ?? existing?.hitVars?.yAccel;
    const targetId = operation?.id ?? firstNumber(findParam(source, "id")) ?? existing?.targetId ?? 0;
    const chainId = operation?.chainId ?? firstNumber(findParam(source, "chainid")) ?? existing?.hitVars?.chainId;
    const hitCount = operation?.hitCount ?? firstNumber(findParam(source, "numhits")) ?? existing?.hitVars?.hitCount ?? 1;
    const existingSnap = existing?.hitVars?.hitOffset
      ? ([existing.hitVars.hitOffset.x, existing.hitVars.hitOffset.y] as [number, number?])
      : undefined;
    const snap = operation?.snap ?? numberPair(findParam(source, "snap")) ?? existingSnap;
    const p1StateNo = operation?.p1StateNo ?? firstNumber(findParam(source, "p1stateno"));
    const p2StateNo = operation?.p2StateNo ?? firstNumber(findParam(source, "p2stateno"));
    const p2GetP1State = operation?.p2GetP1State ?? (p2StateNo !== undefined ? (firstNumber(findParam(source, "p2getp1state")) ?? 1) !== 0 : false);
    const missOnOverride = operation?.missOnOverride ?? booleanHitDefParam(source, "missonoverride") ?? existing?.missOnOverride;
    const p1SpritePriority = operation?.p1SpritePriority ?? firstNumber(findParam(source, "p1sprpriority"));
    const p2SpritePriority = operation?.p2SpritePriority ?? firstNumber(findParam(source, "p2sprpriority"));
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
      kill,
      ...(hitFlag === undefined ? {} : { hitFlag }),
      ...(p2ClsnCheck === undefined ? {} : { p2ClsnCheck }),
      ...(p2ClsnRequire === undefined ? {} : { p2ClsnRequire }),
      priority,
      priorityType,
      p1SpritePriority,
      p2SpritePriority,
      attackDepth,
      requiresHitDef: false,
      attr,
      targetId,
      hitPause,
      hitStun,
      push,
      hitVelocityY: groundVelocity?.[1] ?? existing?.hitVelocityY,
      hitVars: {
        hitId: targetId,
        ...(chainId !== undefined ? { chainId } : {}),
        hitCount,
        ...(snap ? { hitOffset: { x: snap[0], ...(snap[1] !== undefined ? { y: snap[1] } : {}) } } : {}),
        animType,
        groundType,
        airType,
        ...(yAccel !== undefined ? { yAccel } : {}),
      },
      guardDistance,
      guardFlag: operation?.guardFlag ?? stripMugenString(findParam(source, "guardflag")) ?? existing?.guardFlag ?? "MA",
      guardDamage,
      guardKill,
      guardPause,
      guardStun,
      guardSlideTime,
      guardControlTime,
      guardPush,
      guardVelocityY: guardVelocity?.[1] ?? existing?.guardVelocityY,
      airGuardPush,
      airGuardVelocityY: airGuardVelocity?.[1] ?? existing?.airGuardVelocityY,
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
      sparkXy: operation?.sparkXy ? normalizeSparkOffset(operation.sparkXy) : numberPair(findParam(source, "sparkxy")) ?? existing?.sparkXy,
      p1StateNo,
      p2StateNo,
      p2GetP1State,
      missOnOverride,
      fall: buildMoveFallData(source, existing, operation),
      hitbox: cloneBox(frame?.clsn1[0] ?? fallbackHitbox),
    };
    actor.currentMoveLabel = source.name ?? "HitDef";
    actor.hasHit = false;
    resetRuntimeHitDefContactMemory(actor);
    actor.runtime.reversal = undefined;
    actor.runtime.moveType = "A";
    applyRuntimeControl(actor.runtime, false);

    return {
      activated: true,
      duplicate: false,
      key,
      recordedController: recordController !== undefined,
      recordedOperation: operation !== undefined && recordOperation !== undefined,
      ...(operation ? { operation } : {}),
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

function buildMoveFallData(controller: MugenStateController, existing?: DemoMove, operation?: HitDefControllerOp): DemoMove["fall"] | undefined {
  const enabled =
    (operation?.fall.enabled === undefined ? undefined : operation.fall.enabled ? 1 : 0) ??
    firstNumber(findParam(controller, "fall")) ??
    firstNumber(findParam(controller, "air.fall")) ??
    firstNumber(findParam(controller, "ground.fall"));
  const damage = operation?.fall.damage ?? firstNumber(findParam(controller, "fall.damage")) ?? existing?.fall?.damage;
  const defenceUp = operation?.fall.defenceUp ?? firstNumber(findParam(controller, "fall.defence_up")) ?? existing?.fall?.defenceUp;
  const kill = operation?.fall.kill ?? booleanHitDefParam(controller, "fall.kill") ?? existing?.fall?.kill ?? true;
  const xVelocity = operation?.fall.xVelocity ?? firstNumber(findParam(controller, "fall.xvelocity")) ?? existing?.fall?.velocity?.x;
  const yVelocity = operation?.fall.yVelocity ?? firstNumber(findParam(controller, "fall.yvelocity")) ?? existing?.fall?.velocity?.y;
  const envShakeTime = operation?.fall.envShakeTime ?? firstNumber(findParam(controller, "fall.envshake.time")) ?? existing?.fall?.envShake?.time;
  const envShakeFreq = operation?.fall.envShakeFrequency ?? firstNumber(findParam(controller, "fall.envshake.freq")) ?? existing?.fall?.envShake?.freq;
  const envShakeAmpl = operation?.fall.envShakeAmplitude ?? firstNumber(findParam(controller, "fall.envshake.ampl")) ?? existing?.fall?.envShake?.ampl;
  const envShakePhase = operation?.fall.envShakePhase ?? firstNumber(findParam(controller, "fall.envshake.phase")) ?? existing?.fall?.envShake?.phase;
  const recover = operation?.fall.recover === undefined ? firstNumber(findParam(controller, "fall.recover")) : operation.fall.recover ? 1 : 0;
  const recoverTime = operation?.fall.recoverTime ?? firstNumber(findParam(controller, "fall.recovertime")) ?? existing?.fall?.recoverTime;
  const downRecover =
    operation?.fall.downRecover === undefined ? firstNumber(findParam(controller, "down.recover")) : operation.fall.downRecover ? 1 : 0;
  const downRecoverTime =
    operation?.fall.downRecoverTime ?? firstNumber(findParam(controller, "down.recovertime")) ?? existing?.fall?.downRecoverTime;
  const hasAny =
    enabled !== undefined ||
    damage !== undefined ||
    defenceUp !== undefined ||
    operation?.fall.kill !== undefined ||
    findParam(controller, "fall.kill") !== undefined ||
    xVelocity !== undefined ||
    yVelocity !== undefined ||
    envShakeTime !== undefined ||
    recover !== undefined ||
    recoverTime !== undefined ||
    downRecover !== undefined ||
    downRecoverTime !== undefined;
  if (!hasAny) {
    return existing?.fall;
  }
  return {
    enabled: enabled !== undefined ? enabled !== 0 : existing?.fall?.enabled ?? false,
    damage,
    defenceUp,
    kill,
    velocity: xVelocity !== undefined || yVelocity !== undefined ? { x: xVelocity, y: yVelocity } : existing?.fall?.velocity,
    recover: recover !== undefined ? recover !== 0 : existing?.fall?.recover,
    recoverTime,
    downRecover: downRecover !== undefined ? downRecover !== 0 : existing?.fall?.downRecover,
    downRecoverTime,
    envShake:
      envShakeTime !== undefined
        ? {
            time: envShakeTime,
            freq: envShakeFreq ?? 60,
            ampl: envShakeAmpl ?? -4,
            phase: envShakePhase ?? 0,
          }
        : existing?.fall?.envShake,
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

function normalizeSparkOffset(value: [number, number?]): [number, number] {
  return [value[0], value[1] ?? value[0]];
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

function clampHitDefPriority(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
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

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

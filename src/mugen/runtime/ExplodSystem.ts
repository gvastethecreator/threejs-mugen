import type { ExplodControllerOp } from "../compiler/ControllerOps";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { ActorSnapshot } from "./types";

export type RuntimeExplod = {
  serialId: string;
  explodId?: number;
  actorKind: "explod";
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
  scale: { x: number; y: number };
  bind?: RuntimeExplodBind;
  facing: 1 | -1;
  frameIndex: number;
  frameElapsed: number;
  age: number;
  removeTime: number;
  removeOnGetHit: boolean;
  ignoreHitPause: boolean;
  pauseMoveTime: number;
  superMoveTime: number;
  spritePriority: number;
  opacity: number;
};

export type RuntimeExplodBind = {
  localOffset: { x: number; y: number };
  remaining: number;
};

export type RuntimeExplodBindInput = {
  localOffset: { x: number; y: number };
};

export type RuntimeExplodBindAnchor = {
  pos: { x: number; y: number };
  facing: 1 | -1;
};

export type RuntimeExplodPauseKind = "hitpause" | "Pause" | "SuperPause";

export type RuntimeExplodAdvanceOptions = {
  pauseKind?: RuntimeExplodPauseKind;
};

export type RuntimeExplodSpawnInput = {
  serialId: string;
  controller: MugenStateController;
  operation?: ExplodControllerOp;
  ownerId?: string;
  rootId?: string;
  parentId?: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  action: MugenAnimationAction;
  animNo: number;
  pos: { x: number; y: number };
  bind?: RuntimeExplodBindInput;
  fallbackFacing: 1 | -1;
  defaultRemoveTime: number;
};

export function createRuntimeExplod(input: RuntimeExplodSpawnInput): RuntimeExplod {
  const forcedFacing = input.operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const identity = resolveActorIdentity(input);
  const bindTime = clampExplodBindTime(input.operation?.bindTime ?? firstNumber(findControllerParam(input.controller, "bindtime")) ?? 0);
  return {
    serialId: input.serialId,
    explodId: input.operation?.explodId ?? firstNumber(findControllerParam(input.controller, "id")),
    ...identity,
    spriteOwnerId: input.spriteOwnerId,
    spriteOwnerDefinitionId: input.spriteOwnerDefinitionId,
    spriteOwnerLabel: input.spriteOwnerLabel,
    action: input.action,
    animNo: input.animNo,
    pos: input.pos,
    vel: pairToVector(
      input.operation?.velocity ?? numberPair(findControllerParam(input.controller, "vel") ?? findControllerParam(input.controller, "velocity")),
    ),
    accel: pairToVector(input.operation?.acceleration ?? numberPair(findControllerParam(input.controller, "accel"))),
    scale: pairToScale(input.operation?.scale ?? scalePair(findControllerParam(input.controller, "scale"))),
    bind:
      input.bind && bindTime !== 0
        ? {
            localOffset: { ...input.bind.localOffset },
            remaining: bindTime,
          }
        : undefined,
    facing: forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: clampExplodTime(
      input.operation?.removeTime ?? firstNumber(findControllerParam(input.controller, "removetime")) ?? input.defaultRemoveTime,
    ),
    removeOnGetHit: input.operation?.removeOnGetHit ?? booleanNumber(findControllerParam(input.controller, "removeongethit")) ?? false,
    ignoreHitPause: input.operation?.ignoreHitPause ?? booleanNumber(findControllerParam(input.controller, "ignorehitpause")) ?? false,
    pauseMoveTime: clampExplodMoveTime(input.operation?.pauseMoveTime ?? firstNumber(findControllerParam(input.controller, "pausemovetime")) ?? 0),
    superMoveTime: clampExplodMoveTime(
      input.operation?.superMoveTime ?? firstNumber(findControllerParam(input.controller, "supermovetime")) ?? 0,
    ),
    spritePriority: Math.max(
      -5,
      Math.min(10, Math.round(input.operation?.spritePriority ?? firstNumber(findControllerParam(input.controller, "sprpriority")) ?? 3)),
    ),
    opacity: parseExplodOpacity(input.operation?.trans ?? findControllerParam(input.controller, "trans")),
  };
}

export function removeRuntimeExplods(explods: RuntimeExplod[], explodId: number | undefined): RuntimeExplod[] {
  if (explodId === undefined) {
    return [];
  }
  return explods.filter((explod) => explod.explodId !== explodId);
}

export function removeRuntimeExplodsOnGetHit(explods: RuntimeExplod[]): RuntimeExplod[] {
  return explods.filter((explod) => !explod.removeOnGetHit);
}

export function advanceRuntimeExplods(
  explods: RuntimeExplod[],
  bindAnchor?: RuntimeExplodBindAnchor,
  options: RuntimeExplodAdvanceOptions = {},
): RuntimeExplod[] {
  for (const explod of explods) {
    if (shouldAdvanceRuntimeExplod(explod, options.pauseKind)) {
      advanceRuntimeExplod(explod, bindAnchor);
      consumeRuntimeExplodPauseMoveTime(explod, options.pauseKind);
    }
  }
  return explods.filter((explod) => explod.removeTime < 0 || explod.age < explod.removeTime);
}

function advanceRuntimeExplod(explod: RuntimeExplod, bindAnchor?: RuntimeExplodBindAnchor): void {
  explod.age += 1;
  if (!applyRuntimeExplodBind(explod, bindAnchor)) {
    explod.pos.x += explod.vel.x;
    explod.pos.y += explod.vel.y;
    explod.vel.x += explod.accel.x;
    explod.vel.y += explod.accel.y;
  }
  explod.frameElapsed += 1;
  const frame = explod.action.frames[explod.frameIndex];
  if (frame && explod.frameElapsed >= Math.max(1, frame.duration)) {
    explod.frameElapsed = 0;
    const next = explod.frameIndex + 1;
    explod.frameIndex = next < explod.action.frames.length ? next : explod.action.loopStart ?? explod.action.frames.length - 1;
  }
}

function shouldAdvanceRuntimeExplod(explod: RuntimeExplod, pauseKind: RuntimeExplodPauseKind | undefined): boolean {
  if (!pauseKind) {
    return true;
  }
  if (pauseKind === "hitpause") {
    return explod.ignoreHitPause;
  }
  const moveTime = pauseKind === "SuperPause" ? explod.superMoveTime : explod.pauseMoveTime;
  return moveTime < 0 || moveTime > 0;
}

function consumeRuntimeExplodPauseMoveTime(explod: RuntimeExplod, pauseKind: RuntimeExplodPauseKind | undefined): void {
  if (pauseKind === "Pause" && explod.pauseMoveTime > 0) {
    explod.pauseMoveTime -= 1;
  }
  if (pauseKind === "SuperPause" && explod.superMoveTime > 0) {
    explod.superMoveTime -= 1;
  }
}

function applyRuntimeExplodBind(explod: RuntimeExplod, bindAnchor: RuntimeExplodBindAnchor | undefined): boolean {
  if (!explod.bind || !bindAnchor) {
    return false;
  }
  explod.pos = {
    x: bindAnchor.pos.x + explod.bind.localOffset.x * bindAnchor.facing,
    y: bindAnchor.pos.y + explod.bind.localOffset.y,
  };
  if (explod.bind.remaining > 0) {
    explod.bind.remaining -= 1;
    if (explod.bind.remaining === 0) {
      explod.bind = undefined;
    }
  }
  return true;
}

export function runtimeExplodsToSnapshots(explods: RuntimeExplod[], sourceStateNo: number): ActorSnapshot[] {
  return explods
    .map((explod): ActorSnapshot | undefined => {
      const frame = explod.action.frames[explod.frameIndex];
      if (!frame) {
        return undefined;
      }
      return {
        id: explod.serialId,
        label: `Explod ${explod.explodId ?? explod.animNo}`,
        actorKind: "explod",
        ownerId: explod.ownerId,
        rootId: explod.rootId,
        parentId: explod.parentId,
        source: "effect",
        spriteOwnerId: explod.spriteOwnerId,
        spriteOwnerDefinitionId: explod.spriteOwnerDefinitionId,
        spriteOwnerLabel: explod.spriteOwnerLabel,
        runtime: {
          pos: { ...explod.pos },
          vel: { ...explod.vel },
          facing: explod.facing,
          spritePriority: explod.spritePriority,
          stateNo: sourceStateNo,
          animNo: explod.animNo,
          animTime: explod.age,
          frameIndex: explod.frameIndex,
          life: 0,
          power: 0,
          ctrl: false,
          stateType: "S",
          moveType: "I",
          physics: "N",
          vars: [],
          fvars: [],
          renderOpacity: explod.opacity,
          ...(isDefaultScale(explod.scale) ? {} : { renderScale: { ...explod.scale } }),
          paletteFx: {
            remaining: Math.max(1, explod.removeTime - explod.age),
            time: Math.max(1, explod.removeTime),
            add: [0, 0, 0],
            mul: [256, 256, 256],
            color: 256,
            invert: false,
          },
        },
        frame,
        clsn1: [],
        clsn2: [],
      };
    })
    .filter((snapshot): snapshot is ActorSnapshot => snapshot !== undefined);
}

function resolveActorIdentity(input: RuntimeExplodSpawnInput): Pick<
  RuntimeExplod,
  "actorKind" | "ownerId" | "rootId" | "parentId"
> {
  const ownerId = input.ownerId ?? input.spriteOwnerId;
  const rootId = input.rootId ?? ownerId;
  const parentId = input.parentId ?? ownerId;
  return { actorKind: "explod", ownerId, rootId, parentId };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
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
  const values = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter(Number.isFinite);
  if (values[0] === undefined) {
    return undefined;
  }
  return [values[0], values[1] ?? 0];
}

function pairToVector(value: [number, number] | undefined): { x: number; y: number } {
  return {
    x: clampMotionValue(value?.[0] ?? 0),
    y: clampMotionValue(value?.[1] ?? 0),
  };
}

function scalePair(value: string | undefined): [number, number] | undefined {
  const pair = numberPair(value);
  return pair === undefined ? undefined : [pair[0], pair[1] ?? pair[0]];
}

function pairToScale(value: [number, number] | undefined): { x: number; y: number } {
  return {
    x: clampScaleValue(value?.[0] ?? 1),
    y: clampScaleValue(value?.[1] ?? value?.[0] ?? 1),
  };
}

function clampMotionValue(value: number): number {
  return Math.max(-80, Math.min(80, value));
}

function clampScaleValue(value: number): number {
  return Math.max(0.05, Math.min(8, Math.abs(value)));
}

function isDefaultScale(scale: { x: number; y: number }): boolean {
  return scale.x === 1 && scale.y === 1;
}

function clampExplodTime(value: number): number {
  return value < 0 ? -1 : Math.max(1, Math.min(600, Math.round(value)));
}

function clampExplodBindTime(value: number): number {
  return value < 0 ? -1 : Math.max(0, Math.min(600, Math.round(value)));
}

function clampExplodMoveTime(value: number): number {
  return value < 0 ? -1 : Math.max(0, Math.min(600, Math.round(value)));
}

function parseExplodOpacity(value: string | undefined): number {
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

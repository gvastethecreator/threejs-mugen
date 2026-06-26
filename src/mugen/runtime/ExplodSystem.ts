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
  facing: 1 | -1;
  frameIndex: number;
  frameElapsed: number;
  age: number;
  removeTime: number;
  spritePriority: number;
  opacity: number;
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
  fallbackFacing: 1 | -1;
  defaultRemoveTime: number;
};

export function createRuntimeExplod(input: RuntimeExplodSpawnInput): RuntimeExplod {
  const forcedFacing = input.operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const identity = resolveActorIdentity(input);
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
    facing: forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: clampExplodTime(
      input.operation?.removeTime ?? firstNumber(findControllerParam(input.controller, "removetime")) ?? input.defaultRemoveTime,
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

export function advanceRuntimeExplods(explods: RuntimeExplod[]): RuntimeExplod[] {
  for (const explod of explods) {
    explod.age += 1;
    explod.frameElapsed += 1;
    const frame = explod.action.frames[explod.frameIndex];
    if (frame && explod.frameElapsed >= Math.max(1, frame.duration)) {
      explod.frameElapsed = 0;
      const next = explod.frameIndex + 1;
      explod.frameIndex = next < explod.action.frames.length ? next : explod.action.loopStart ?? explod.action.frames.length - 1;
    }
  }
  return explods.filter((explod) => explod.removeTime < 0 || explod.age < explod.removeTime);
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
          vel: { x: 0, y: 0 },
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

function clampExplodTime(value: number): number {
  return value < 0 ? -1 : Math.max(1, Math.min(600, Math.round(value)));
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

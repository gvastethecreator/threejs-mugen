import type { HelperControllerOp } from "../compiler/ControllerOps";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { ActorSnapshot } from "./types";

export type RuntimeHelper = {
  serialId: string;
  helperId?: number;
  name?: string;
  actorKind: "helper";
  ownerId: string;
  rootId: string;
  parentId: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  action: MugenAnimationAction;
  stateNo?: number;
  animNo: number;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  scale: { x: number; y: number };
  facing: 1 | -1;
  frameIndex: number;
  frameElapsed: number;
  age: number;
  removeTime: number;
  spritePriority: number;
};

export type RuntimeHelperSpawnInput = {
  serialId: string;
  controller: MugenStateController;
  operation?: HelperControllerOp;
  ownerId?: string;
  rootId?: string;
  parentId?: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  action: MugenAnimationAction;
  stateNo?: number;
  animNo: number;
  pos: { x: number; y: number };
  fallbackFacing: 1 | -1;
};

export function createRuntimeHelper(input: RuntimeHelperSpawnInput): RuntimeHelper {
  const operation = input.operation;
  const forcedFacing = operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const identity = resolveActorIdentity(input);
  return {
    serialId: input.serialId,
    helperId: operation?.helperId ?? firstNumber(findControllerParam(input.controller, "id")),
    name: operation?.name ?? stripMugenString(findControllerParam(input.controller, "name")),
    ...identity,
    spriteOwnerId: input.spriteOwnerId,
    spriteOwnerDefinitionId: input.spriteOwnerDefinitionId,
    spriteOwnerLabel: input.spriteOwnerLabel,
    action: input.action,
    stateNo: input.stateNo,
    animNo: input.animNo,
    pos: input.pos,
    vel: helperVelocity(input.controller, operation),
    scale: helperScale(input.controller, operation),
    facing: forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: clampHelperTime(operation?.removeTime ?? firstNumber(findControllerParam(input.controller, "removetime")) ?? 180),
    spritePriority: Math.max(-5, Math.min(10, Math.round(operation?.spritePriority ?? firstNumber(findControllerParam(input.controller, "sprpriority")) ?? 3))),
  };
}

export function advanceRuntimeHelpers(helpers: RuntimeHelper[], stage: Pick<MugenStageDefinition, "bounds">): RuntimeHelper[] {
  for (const helper of helpers) {
    helper.age += 1;
    helper.pos.x += helper.vel.x;
    helper.pos.y += helper.vel.y;
    helper.frameElapsed += 1;
    const frame = helper.action.frames[helper.frameIndex];
    if (frame && helper.frameElapsed >= Math.max(1, frame.duration)) {
      helper.frameElapsed = 0;
      const next = helper.frameIndex + 1;
      helper.frameIndex = next < helper.action.frames.length ? next : helper.action.loopStart ?? helper.action.frames.length - 1;
    }
  }
  const margin = 240;
  return helpers.filter((helper) => {
    if (helper.removeTime >= 0 && helper.age >= helper.removeTime) {
      return false;
    }
    return (
      helper.pos.x >= stage.bounds.left - margin &&
      helper.pos.x <= stage.bounds.right + margin &&
      helper.pos.y >= -360 &&
      helper.pos.y <= 180
    );
  });
}

export function runtimeHelpersToSnapshots(helpers: RuntimeHelper[], sourceStateNo: number): ActorSnapshot[] {
  return helpers
    .map((helper): ActorSnapshot | undefined => {
      const frame = helper.action.frames[helper.frameIndex];
      if (!frame) {
        return undefined;
      }
      return {
        id: helper.serialId,
        label: `Helper ${helper.name ?? helper.helperId ?? helper.stateNo ?? helper.animNo}`,
        actorKind: "helper",
        ownerId: helper.ownerId,
        rootId: helper.rootId,
        parentId: helper.parentId,
        source: "effect",
        spriteOwnerId: helper.spriteOwnerId,
        spriteOwnerDefinitionId: helper.spriteOwnerDefinitionId,
        spriteOwnerLabel: helper.spriteOwnerLabel,
        effect: {
          kind: "helper",
          id: helper.helperId,
          name: helper.name,
          stateNo: helper.stateNo,
          age: helper.age,
          removeTime: helper.removeTime,
          spritePriority: helper.spritePriority,
          scale: { ...helper.scale },
        },
        runtime: {
          pos: { ...helper.pos },
          vel: { ...helper.vel },
          facing: helper.facing,
          spritePriority: helper.spritePriority,
          stateNo: helper.stateNo ?? sourceStateNo,
          animNo: helper.animNo,
          animTime: helper.age,
          frameIndex: helper.frameIndex,
          life: 0,
          power: 0,
          ctrl: false,
          stateType: "S",
          moveType: "I",
          physics: "N",
          vars: [],
          fvars: [],
          ...(isDefaultScale(helper.scale) ? {} : { renderScale: { ...helper.scale } }),
        },
        frame,
        clsn1: frame.clsn1.map(cloneBox),
        clsn2: frame.clsn2.map(cloneBox),
      };
    })
    .filter((snapshot): snapshot is ActorSnapshot => snapshot !== undefined);
}

function resolveActorIdentity(input: RuntimeHelperSpawnInput): Pick<
  RuntimeHelper,
  "actorKind" | "ownerId" | "rootId" | "parentId"
> {
  const ownerId = input.ownerId ?? input.spriteOwnerId;
  const rootId = input.rootId ?? ownerId;
  const parentId = input.parentId ?? ownerId;
  return { actorKind: "helper", ownerId, rootId, parentId };
}

function cloneBox<T extends { x1: number; y1: number; x2: number; y2: number }>(box: T): T {
  return { ...box };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function helperVelocity(controller: MugenStateController, operation: HelperControllerOp | undefined): { x: number; y: number } {
  const velocity = operation?.velocity ?? numberPair(findControllerParam(controller, "velset") ?? findControllerParam(controller, "vel") ?? findControllerParam(controller, "velocity"));
  return {
    x: clampHelperVelocity(velocity?.[0] ?? 0),
    y: clampHelperVelocity(velocity?.[1] ?? 0),
  };
}

function helperScale(controller: MugenStateController, operation: HelperControllerOp | undefined): { x: number; y: number } {
  const scale = operation?.scale ?? helperScalePair(controller);
  return {
    x: clampHelperScale(scale?.[0] ?? 1),
    y: clampHelperScale(scale?.[1] ?? 1),
  };
}

function helperScalePair(controller: MugenStateController): [number, number] | undefined {
  const explicit = numberPair(findControllerParam(controller, "scale"));
  if (explicit) {
    return explicit;
  }
  const x = firstNumber(findControllerParam(controller, "size.xscale") ?? findControllerParam(controller, "xscale"));
  const y = firstNumber(findControllerParam(controller, "size.yscale") ?? findControllerParam(controller, "yscale"));
  return x === undefined && y === undefined ? undefined : [x ?? 1, y ?? x ?? 1];
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const [rawX, rawY] = value.split(",");
  const x = Number(rawX?.trim());
  const y = Number(rawY?.trim());
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : undefined;
}

function clampHelperVelocity(value: number): number {
  return Math.max(-80, Math.min(80, value));
}

function clampHelperScale(value: number): number {
  return Math.max(0.05, Math.min(8, value));
}

function isDefaultScale(scale: { x: number; y: number }): boolean {
  return scale.x === 1 && scale.y === 1;
}

function clampHelperTime(value: number): number {
  return value < 0 ? -1 : Math.max(1, Math.min(1200, Math.round(value)));
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

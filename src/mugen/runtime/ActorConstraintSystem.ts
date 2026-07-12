import type { CollisionControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeActorConstraintState = Pick<
  CharacterRuntimeState,
  "pos" | "combatDepth" | "facing" | "bodyWidth" | "playerPush" | "posFreeze" | "screenBound"
>;

export type RuntimeActorConstraintControllerDispatchOptions<TActor extends { runtime: RuntimeActorConstraintState }> = {
  actor: TActor;
  controller: ControllerIr;
  actorConstraintWorld: RuntimeActorConstraintWorld;
  resolveWidth?: RuntimeWidthResolver;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: CollisionControllerOp) => void;
};

export type RuntimeWidthResolver = {
  resolvePair(key: "player" | "value"): [number, number?] | undefined;
};

export type RuntimeDepthResolver = {
  resolvePair(key: "edge" | "player" | "value"): [number, number?] | undefined;
};

export type RuntimeActorConstraintControllerDispatchResult = {
  recordedController: boolean;
  recordedOperation: boolean;
};

export class RuntimeActorConstraintWorld {
  resetFrameConstraints(state: RuntimeActorConstraintState): void {
    state.playerPush = true;
    state.posFreeze = undefined;
    state.screenBound = undefined;
    if (state.combatDepth?.baseSize) {
      state.combatDepth.size = state.combatDepth.baseSize;
      state.combatDepth.baseSize = undefined;
    }
    if (state.combatDepth) state.combatDepth.edge = undefined;
  }

  applyDepth(
    state: RuntimeActorConstraintState,
    controller: MugenStateController,
    operation?: Extract<CollisionControllerOp, { controllerType: "depth" }>,
    resolveDepth?: RuntimeDepthResolver,
  ): Extract<CollisionControllerOp, { controllerType: "depth" }> | undefined {
    if (!state.combatDepth) return undefined;
    const mode =
      operation?.mode ??
      (findControllerParam(controller, "edge") !== undefined
        ? "edge"
        : findControllerParam(controller, "player") !== undefined
          ? "player"
          : "value");
    const pair = operation
      ? ([operation.top, operation.bottom] as [number, number])
      : resolveDepth?.resolvePair(mode) ?? numberPair(findControllerParam(controller, mode));
    if (!pair) return undefined;
    const applied = { kind: "collision", controllerType: "depth", mode, top: pair[0], bottom: pair[1] ?? 0 } as const;
    if (mode === "player" || mode === "value") {
      state.combatDepth.baseSize ??= [...state.combatDepth.size];
      state.combatDepth.size = [
        state.combatDepth.baseSize[0] + applied.top,
        state.combatDepth.baseSize[1] + applied.bottom,
      ];
    }
    if (mode === "edge" || mode === "value") state.combatDepth.edge = [applied.top, applied.bottom];
    return applied;
  }

  applyWidth(
    state: RuntimeActorConstraintState,
    controller: MugenStateController,
    operation?: Extract<CollisionControllerOp, { controllerType: "width" }>,
    resolveWidth?: RuntimeWidthResolver,
  ): Extract<CollisionControllerOp, { controllerType: "width" }> | undefined {
    const pair = operation
      ? undefined
      : resolveWidth?.resolvePair("player") ??
        resolveWidth?.resolvePair("value") ??
        numberPair(findControllerParam(controller, "player") ?? findControllerParam(controller, "value"));
    const front = operation?.front ?? pair?.[0];
    if (front === undefined) {
      return undefined;
    }
    const appliedOperation: Extract<CollisionControllerOp, { controllerType: "width" }> = {
      kind: "collision",
      controllerType: "width",
      front: clampBodyWidth(front),
      back: clampBodyWidth(operation?.back ?? pair?.[1] ?? front),
    };
    state.bodyWidth = {
      front: appliedOperation.front,
      back: appliedOperation.back,
    };
    return appliedOperation;
  }

  preserveFrozenPosition(state: RuntimeActorConstraintState, tickStartPos: { x: number; y: number; z: number }): void {
    const posFreeze = state.posFreeze;
    if (posFreeze?.x) {
      state.pos.x = tickStartPos.x;
    }
    if (posFreeze?.y) {
      state.pos.y = tickStartPos.y;
    }
    if (posFreeze?.z && state.combatDepth) {
      state.combatDepth.position = tickStartPos.z;
    }
  }

  clampToStage(
    state: RuntimeActorConstraintState,
    stage: Pick<MugenStageDefinition, "bounds"> & Partial<Pick<MugenStageDefinition, "depthBounds" | "localCoord">>,
    actorLocalCoord?: { width: number } | readonly [number, number],
  ): void {
    if (state.screenBound?.bound !== false) {
      state.pos.x = Math.max(stage.bounds.left, Math.min(stage.bounds.right, state.pos.x));
    }
    if (!stage.depthBounds || !state.combatDepth) return;

    const stageScale = 320 / (stage.localCoord?.width ?? 320);
    const actorWidth = actorLocalCoord && "width" in actorLocalCoord ? actorLocalCoord.width : actorLocalCoord?.[0];
    const actorScale = 320 / (actorWidth ?? 320);
    const top = (stage.depthBounds.top * stageScale) / actorScale + (state.combatDepth.edge?.[0] ?? 0);
    const bottom = (stage.depthBounds.bottom * stageScale) / actorScale - (state.combatDepth.edge?.[1] ?? 0);
    state.combatDepth.position = Math.max(top, Math.min(bottom, state.combatDepth.position));
  }

  clampBodyPushToStage(state: RuntimeActorConstraintState, stage: Pick<MugenStageDefinition, "bounds">): void {
    state.pos.x = Math.max(stage.bounds.left, Math.min(stage.bounds.right, state.pos.x));
  }

  separate(left: RuntimeActorConstraintState, right: RuntimeActorConstraintState): void {
    if (left.playerPush === false || right.playerPush === false) {
      return;
    }
    const minDistance = widthToward(left, right) + widthToward(right, left);
    const delta = right.pos.x - left.pos.x;
    const distance = Math.abs(delta);
    if (distance >= minDistance || distance === 0) {
      return;
    }
    const push = (minDistance - distance) / 2;
    const direction = delta > 0 ? 1 : -1;
    left.pos.x -= push * direction;
    right.pos.x += push * direction;
  }
}

export class RuntimeActorConstraintControllerDispatchWorld {
  apply<TActor extends { runtime: RuntimeActorConstraintState }>(
    options: RuntimeActorConstraintControllerDispatchOptions<TActor>,
  ): RuntimeActorConstraintControllerDispatchResult {
    const operation =
      options.controller.operation?.kind === "collision" && options.controller.operation.controllerType === "width"
        ? options.controller.operation
        : undefined;
    options.recordController?.(options.actor, options.controller.source);
    const appliedOperation = options.actorConstraintWorld.applyWidth(
      options.actor.runtime,
      options.controller.source,
      operation,
      options.resolveWidth,
    );
    if (appliedOperation) {
      options.recordOperation?.(options.actor, appliedOperation);
    }
    return {
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(appliedOperation && options.recordOperation),
    };
  }

  applyDepth<TActor extends { runtime: RuntimeActorConstraintState }>(
    options: RuntimeActorConstraintControllerDispatchOptions<TActor> & { resolveDepth?: RuntimeDepthResolver },
  ): RuntimeActorConstraintControllerDispatchResult {
    const operation =
      options.controller.operation?.kind === "collision" && options.controller.operation.controllerType === "depth"
        ? options.controller.operation
        : undefined;
    options.recordController?.(options.actor, options.controller.source);
    const appliedOperation = options.actorConstraintWorld.applyDepth(
      options.actor.runtime,
      options.controller.source,
      operation,
      options.resolveDepth,
    );
    if (appliedOperation) options.recordOperation?.(options.actor, appliedOperation);
    return {
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(appliedOperation && options.recordOperation),
    };
  }
}

function widthToward(self: RuntimeActorConstraintState, target: RuntimeActorConstraintState): number {
  const width = self.bodyWidth ?? { front: 39, back: 39 };
  const targetIsInFront = (target.pos.x - self.pos.x) * self.facing >= 0;
  return targetIsInFront ? width.front : width.back;
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value.split(",").map((part) => Number(part.trim()));
  if (numbers.length === 0 || numbers.some((numberValue) => !Number.isFinite(numberValue)) || numbers[0] === undefined) {
    return undefined;
  }
  return numbers.length > 1 ? [numbers[0], numbers[1]!] : [numbers[0], numbers[0]];
}

function clampBodyWidth(value: number): number {
  return Math.max(1, Math.min(160, Math.abs(Math.round(value))));
}

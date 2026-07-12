import type { CollisionControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeActorConstraintState = Pick<
  CharacterRuntimeState,
  "pos" | "combatDepth" | "facing" | "bodyWidth" | "playerPush" | "pushPriority" | "pushAffectTeam" | "posFreeze" | "screenBound" | "stageBound"
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
    state.pushPriority = 0;
    state.pushAffectTeam = 1;
    state.posFreeze = undefined;
    state.screenBound = undefined;
    state.stageBound = undefined;
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
    const redirectPlayerIdExpression = operation?.redirectPlayerIdExpression ?? findControllerParam(controller, "redirectid")?.trim();
    const applied: Extract<CollisionControllerOp, { controllerType: "depth" }> = {
      kind: "collision",
      controllerType: "depth",
      mode,
      top: pair[0],
      bottom: pair[1] ?? 0,
      ...(redirectPlayerIdExpression ? { redirectPlayerIdExpression } : {}),
    };
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
    if (!stage.depthBounds || !state.combatDepth || state.stageBound === false) return;

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

  clampBodyPushDepthToStage(
    state: RuntimeActorConstraintState,
    stage: Partial<Pick<MugenStageDefinition, "depthBounds" | "localCoord">>,
    actorLocalCoord?: readonly [number, number],
  ): void {
    if (!stage.depthBounds || !state.combatDepth || state.stageBound === false) return;
    const stageScale = 320 / (stage.localCoord?.width ?? 320);
    const actorScale = 320 / (actorLocalCoord?.[0] ?? 320);
    const top = (stage.depthBounds.top * stageScale) / actorScale + (state.combatDepth.edge?.[0] ?? 0);
    const bottom = (stage.depthBounds.bottom * stageScale) / actorScale - (state.combatDepth.edge?.[1] ?? 0);
    state.combatDepth.position = Math.max(top, Math.min(bottom, state.combatDepth.position));
  }

  separate(
    left: RuntimeActorConstraintState,
    right: RuntimeActorConstraintState,
    leftLocalCoord?: readonly [number, number],
    rightLocalCoord?: readonly [number, number],
    factors: { left: number; right: number } = { left: 0.5, right: 0.5 },
  ): void {
    if (left.playerPush === false || right.playerPush === false) {
      return;
    }
    const leftScale = 320 / (leftLocalCoord?.[0] ?? 320);
    const rightScale = 320 / (rightLocalCoord?.[0] ?? 320);
    const deltaX = right.pos.x * rightScale - left.pos.x * leftScale;
    const overlapX = widthToward(left, right) * leftScale + widthToward(right, left) * rightScale - Math.abs(deltaX);
    if (overlapX <= 0) {
      return;
    }

    const leftDepth = left.combatDepth;
    const rightDepth = right.combatDepth;
    if (!leftDepth || !rightDepth) {
      if (deltaX !== 0) separateX(left, right, overlapX, deltaX, leftScale, rightScale, factors);
      return;
    }

    const leftZ = leftDepth.position * leftScale;
    const rightZ = rightDepth.position * rightScale;
    const overlapZ = Math.min(leftZ + leftDepth.size[1] * leftScale, rightZ + rightDepth.size[1] * rightScale) -
      Math.max(leftZ - leftDepth.size[0] * leftScale, rightZ - rightDepth.size[0] * rightScale);
    if (overlapZ <= 0) return;

    const deltaZ = rightZ - leftZ;
    let pushX = deltaZ === 0;
    let pushZ = false;
    if (deltaZ !== 0) {
      const xTotal = (bodySpan(left) * leftScale) + (bodySpan(right) * rightScale);
      const zTotal = depthSpan(leftDepth) * leftScale + depthSpan(rightDepth) * rightScale;
      const adjustedZDistance = zTotal === 0 ? Math.abs(deltaZ) : (xTotal / zTotal) * Math.abs(deltaZ);
      const ratio = adjustedZDistance === 0 ? Number.POSITIVE_INFINITY : Math.abs(deltaX) / adjustedZDistance;
      pushX = ratio > 0.75 && ratio < 1 / 0.75 || Math.abs(deltaX) >= adjustedZDistance;
      pushZ = ratio > 0.75 && ratio < 1 / 0.75 || Math.abs(deltaX) < adjustedZDistance;
    }

    if (pushX && deltaX !== 0) separateX(left, right, overlapX, deltaX, leftScale, rightScale, factors);
    if (pushZ) separateZ(leftDepth, rightDepth, overlapZ, deltaZ, leftScale, rightScale, factors);
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

function bodySpan(state: RuntimeActorConstraintState): number {
  const width = state.bodyWidth ?? { front: 39, back: 39 };
  return width.front + width.back;
}

function depthSpan(depth: NonNullable<RuntimeActorConstraintState["combatDepth"]>): number {
  return depth.size[0] + depth.size[1];
}

function separateX(
  left: RuntimeActorConstraintState,
  right: RuntimeActorConstraintState,
  overlap: number,
  delta: number,
  leftScale: number,
  rightScale: number,
  factors: { left: number; right: number },
): void {
  const direction = delta > 0 ? 1 : -1;
  left.pos.x -= (overlap * factors.left / leftScale) * direction;
  right.pos.x += (overlap * factors.right / rightScale) * direction;
}

function separateZ(
  left: NonNullable<RuntimeActorConstraintState["combatDepth"]>,
  right: NonNullable<RuntimeActorConstraintState["combatDepth"]>,
  overlap: number,
  delta: number,
  leftScale: number,
  rightScale: number,
  factors: { left: number; right: number },
): void {
  const direction = delta > 0 ? 1 : -1;
  left.position -= (overlap * factors.left / leftScale) * direction;
  right.position += (overlap * factors.right / rightScale) * direction;
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

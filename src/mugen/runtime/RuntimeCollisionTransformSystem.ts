import type { CollisionTransformControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { CollisionBox } from "../model/CollisionBox";
import { findControllerParam } from "./StateProgramExecutor";
import {
  evaluateRuntimeControllerNumber,
  type RuntimeControllerEvaluationContext,
} from "./RuntimeControllerExpressionContextSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeCollisionScaleMultiplier = {
  x: number;
  y: number;
};

export type RuntimeCollisionBox = CollisionBox & {
  collisionTransformDisabled?: true;
  runtimeRotation?: {
    angle: number;
    pivotX: number;
    pivotY: number;
  };
};

export type RuntimeCollisionTransformState = Pick<CharacterRuntimeState, "clsnScaleMultiplier" | "clsnAngle">;

export type RuntimeCollisionTransformResolver = {
  resolveScale: (key: "scale") => [number, number?] | undefined;
  resolveAngle: () => number | undefined;
};

export function resolveRuntimeCollisionTransformControllerOperation(
  controller: ControllerIr,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): CollisionTransformControllerOp | undefined {
  const scale = resolveScale(controller, state, context);
  const angle = resolveAngle(controller, state, context);
  if (!scale && angle === undefined) return undefined;
  const redirectPlayerIdExpression = findControllerParam(controller, "redirectid")?.trim();
  return {
    kind: "collision-transform",
    controllerType: "transformclsn",
    ...(scale ? { scale: [scale[0], scale[1] ?? 1] as [number, number] } : {}),
    ...(angle === undefined ? {} : { angle }),
    ...(redirectPlayerIdExpression ? { redirectPlayerIdExpression } : {}),
  };
}

export class RuntimeCollisionTransformWorld {
  resetFrame(state: RuntimeCollisionTransformState): void {
    state.clsnScaleMultiplier = undefined;
    state.clsnAngle = undefined;
  }

  applyController(
    state: CharacterRuntimeState,
    controller: ControllerIr,
    operation?: CollisionTransformControllerOp,
    context: RuntimeControllerEvaluationContext = {},
    resolver?: RuntimeCollisionTransformResolver,
  ): CollisionTransformControllerOp | undefined {
    const scale = operation?.scale ?? resolver?.resolveScale("scale") ?? resolveScale(controller, state, context);
    const angle = operation?.angle ?? resolver?.resolveAngle() ?? resolveAngle(controller, state, context);
    if (!scale && angle === undefined) return undefined;

    if (scale) {
      const current = state.clsnScaleMultiplier ?? { x: 1, y: 1 };
      state.clsnScaleMultiplier = {
        x: current.x * scale[0],
        y: current.y * (scale[1] ?? 1),
      };
    }
    if (angle !== undefined) {
      state.clsnAngle = (state.clsnAngle ?? 0) + angle;
    }
    return {
      kind: "collision-transform",
      controllerType: "transformclsn",
      ...(scale ? { scale: [scale[0], scale[1] ?? 1] as [number, number] } : {}),
      ...(angle === undefined ? {} : { angle }),
      ...(operation?.redirectPlayerIdExpression === undefined
        ? {}
        : { redirectPlayerIdExpression: operation.redirectPlayerIdExpression }),
    };
  }
}

export function scaleRuntimeCollisionBoxes(
  boxes: readonly CollisionBox[],
  multiplier: RuntimeCollisionScaleMultiplier | undefined,
): CollisionBox[] {
  const scaleX = finiteScale(multiplier?.x);
  const scaleY = finiteScale(multiplier?.y);
  return boxes.map((box) => {
    const x1 = box.x1 * scaleX;
    const x2 = box.x2 * scaleX;
    const y1 = box.y1 * scaleY;
    const y2 = box.y2 * scaleY;
    return {
      ...box,
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
    };
  });
}

function resolveScale(
  controller: Pick<ControllerIr, "params">,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
): [number, number?] | undefined {
  const raw = findControllerParam(controller, "scale");
  if (raw === undefined) return undefined;
  const values = raw.split(",").map((part) => evaluateRuntimeControllerNumber(part.trim(), state, context));
  if (values.length === 0 || values[0] === undefined) return undefined;
  if (values.length > 2 || values.some((value) => value === undefined)) return undefined;
  return [values[0], values[1]];
}

function resolveAngle(
  controller: Pick<ControllerIr, "params">,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
): number | undefined {
  const raw = findControllerParam(controller, "angle");
  if (raw === undefined || raw.includes(",")) return undefined;
  return evaluateRuntimeControllerNumber(raw.trim(), state, context);
}

function finiteScale(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) ? value : 1;
}

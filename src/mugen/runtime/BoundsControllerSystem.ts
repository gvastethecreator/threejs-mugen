import type { BoundsControllerOp, CollisionControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeBoundsControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeBoundsControllerResult = {
  applied: boolean;
  controllerType?: BoundsControllerOp["controllerType"] | Extract<CollisionControllerOp, { controllerType: "playerpush" }>["controllerType"];
  operation?: BoundsControllerOp | Extract<CollisionControllerOp, { controllerType: "playerpush" }>;
};

export class RuntimeBoundsControllerWorld {
  applyPlayerPushController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<CollisionControllerOp, { controllerType: "playerpush" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    const appliedOperation = operation ?? resolveRuntimePlayerPushControllerOperation(controller, state, context);
    state.playerPush = appliedOperation.enabled;
    return { applied: true, controllerType: "playerpush", operation: appliedOperation };
  }

  applyPosFreezeController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<BoundsControllerOp, { controllerType: "posfreeze" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    const appliedOperation = operation ?? resolveRuntimePosFreezeControllerOperation(controller, state, context);
    state.posFreeze = {
      x: appliedOperation.x,
      y: appliedOperation.y,
    };
    return { applied: true, controllerType: "posfreeze", operation: appliedOperation };
  }

  applyScreenBoundController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<BoundsControllerOp, { controllerType: "screenbound" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    const camera = operation ? undefined : pairParam(controller, state, context, "movecamera");
    state.screenBound = {
      bound: operation?.bound ?? ((numberParam(controller, state, context, "value") ?? 0) !== 0),
      moveCameraX: operation?.moveCameraX ?? ((camera?.[0] ?? 0) !== 0),
      moveCameraY: operation?.moveCameraY ?? ((camera?.[1] ?? 0) !== 0),
    };
    return { applied: true, controllerType: "screenbound" };
  }
}

export function resolveRuntimePlayerPushControllerOperation(
  controller: RuntimeBoundsControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): Extract<CollisionControllerOp, { controllerType: "playerpush" }> {
  return {
    kind: "collision",
    controllerType: "playerpush",
    enabled: (numberParam(controller, state, context, "value") ?? 1) !== 0,
  };
}

export function resolveRuntimePosFreezeControllerOperation(
  controller: RuntimeBoundsControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): Extract<BoundsControllerOp, { controllerType: "posfreeze" }> {
  const value = numberParam(controller, state, context, "value");
  const x = numberParam(controller, state, context, "x");
  const y = numberParam(controller, state, context, "y");
  const freeze = value !== undefined ? value !== 0 : x === undefined && y === undefined;
  return {
    kind: "bounds",
    controllerType: "posfreeze",
    x: value !== undefined ? freeze : x !== undefined ? x !== 0 : freeze,
    y: value !== undefined ? freeze : y !== undefined ? y !== 0 : freeze,
  };
}

function numberParam(
  controller: RuntimeBoundsControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const raw = findParam(controller, key);
    if (raw === undefined) {
      continue;
    }
    return evaluateNumber(raw.trim(), state, context);
  }
  return undefined;
}

function pairParam(
  controller: RuntimeBoundsControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  key: string,
): [number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(",").map((part) => evaluateNumber(part.trim(), state, context));
  if (parts.length < 2 || parts[0] === undefined || parts[1] === undefined) {
    return undefined;
  }
  return [parts[0], parts[1]];
}

function findParam(controller: RuntimeBoundsControllerSource, key: string): string | undefined {
  const lower = key.toLowerCase();
  const match = Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower);
  return match?.[1];
}

function evaluateNumber(
  raw: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): number | undefined {
  return evaluateRuntimeControllerNumber(raw, state, context);
}

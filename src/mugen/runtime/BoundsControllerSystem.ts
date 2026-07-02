import type { BoundsControllerOp, CollisionControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeBoundsControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeBoundsControllerResult = {
  applied: boolean;
  controllerType?: BoundsControllerOp["controllerType"] | Extract<CollisionControllerOp, { controllerType: "playerpush" }>["controllerType"];
};

export class RuntimeBoundsControllerWorld {
  applyPlayerPushController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<CollisionControllerOp, { controllerType: "playerpush" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    state.playerPush = operation?.enabled ?? (numberParam(controller, state, context, "value") ?? 1) !== 0;
    return { applied: true, controllerType: "playerpush" };
  }

  applyPosFreezeController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<BoundsControllerOp, { controllerType: "posfreeze" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    const value = operation ? undefined : numberParam(controller, state, context, "value");
    const x = operation ? undefined : numberParam(controller, state, context, "x");
    const y = operation ? undefined : numberParam(controller, state, context, "y");
    const freeze = value !== undefined ? value !== 0 : x === undefined && y === undefined;
    state.posFreeze = {
      x: operation?.x ?? (value !== undefined ? freeze : x !== undefined ? x !== 0 : freeze),
      y: operation?.y ?? (value !== undefined ? freeze : y !== undefined ? y !== 0 : freeze),
    };
    return { applied: true, controllerType: "posfreeze" };
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
    return evaluateNumber(raw.split(",")[0]?.trim(), state, context);
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
  if (!raw) {
    return undefined;
  }
  const direct = Number(raw);
  if (Number.isFinite(direct)) {
    return direct;
  }
  const evaluated = evaluateExpression(raw, {
    self: state,
    getConst: context.getConst,
    getHitVar: (name) => runtimeHitVar(state, name),
    hitPauseTime: context.hitPauseTime,
    random: context.random,
    stageBounds: context.stageBounds,
    stageTime: context.stageTime,
  });
  const value = Number(evaluated);
  return Number.isFinite(value) ? value : undefined;
}

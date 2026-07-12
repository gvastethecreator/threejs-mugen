import type { KinematicControllerOp, MovementKinematicControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";
import { runtimeCombatDepthFromConstants } from "./RuntimeCombatDepthSystem";

export type RuntimeKinematicControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeKinematicControllerResult = {
  applied: boolean;
  controllerType?: KinematicControllerOp["controllerType"];
  operation?: KinematicControllerOp;
};

export class RuntimeKinematicControllerWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeKinematicControllerSource,
    operation?: KinematicControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeKinematicControllerResult {
    const controllerType = operation?.controllerType ?? kinematicControllerType(controller);
    if (!controllerType) {
      return { applied: false };
    }
    const effectiveOperation = resolveRuntimeKinematicControllerOperation(controller, state, context, operation);

    if (controllerType === "gravity") {
      const y = effectiveOperation?.controllerType === "gravity" ? effectiveOperation.y : 0.55;
      state.vel = { ...state.vel, y: state.vel.y + y };
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    if (controllerType === "velset") {
      const { x, y } = movementAxisParamsFromOperation(effectiveOperation);
      state.vel = { x: x ?? state.vel.x, y: y ?? state.vel.y };
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    if (controllerType === "veladd") {
      const { x, y } = movementAxisParamsFromOperation(effectiveOperation);
      state.vel = { x: state.vel.x + (x ?? 0), y: state.vel.y + (y ?? 0) };
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    if (controllerType === "velmul") {
      const { x, y } = movementAxisParamsFromOperation(effectiveOperation);
      state.vel = { x: state.vel.x * (x ?? 1), y: state.vel.y * (y ?? 1) };
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    if (controllerType === "hitvelset") {
      const { x, y } = movementAxisParamsFromOperation(effectiveOperation);
      if (state.hitVelocity && (x ?? 0) !== 0) {
        state.vel.x = state.hitVelocity.x;
      }
      if (state.hitVelocity && (y ?? 0) !== 0) {
        state.vel.y = state.hitVelocity.y;
      }
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    if (controllerType === "posset") {
      const { x, y, z } = movementAxisParamsFromOperation(effectiveOperation);
      state.pos = { x: x ?? state.pos.x, y: y ?? state.pos.y };
      if (z !== undefined) {
        state.combatDepth ??= runtimeCombatDepthFromConstants();
        state.combatDepth.position = z;
      }
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    if (controllerType === "posadd") {
      const { x, y, z } = movementAxisParamsFromOperation(effectiveOperation);
      state.pos = { x: state.pos.x + (x ?? 0), y: state.pos.y + (y ?? 0) };
      if (z !== undefined) {
        state.combatDepth ??= runtimeCombatDepthFromConstants();
        state.combatDepth.position += z;
      }
      return { applied: true, controllerType, ...(effectiveOperation ? { operation: effectiveOperation } : {}) };
    }

    return { applied: false };
  }
}

export function resolveRuntimeKinematicControllerOperation(
  controller: RuntimeKinematicControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  operation?: KinematicControllerOp,
): KinematicControllerOp | undefined {
  const controllerType = operation?.controllerType ?? kinematicControllerType(controller);
  if (!controllerType) {
    return undefined;
  }
  if (controllerType === "gravity") {
    return operation?.controllerType === "gravity" ? operation : { kind: "kinematic", controllerType: "gravity", y: 0.55 };
  }
  const movementOperation = operation?.controllerType === controllerType ? operation : undefined;
  const { x, y, z } = movementAxisParams(controller, state, context, movementOperation);
  if (x === undefined && y === undefined && z === undefined) {
    return undefined;
  }
  return {
    kind: "kinematic",
    controllerType,
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
    ...(z !== undefined ? { z } : {}),
  };
}

function movementAxisParamsFromOperation(operation?: KinematicControllerOp): { x?: number; y?: number; z?: number } {
  return operation && operation.controllerType !== "gravity" ? { x: operation.x, y: operation.y, z: operation.z } : {};
}

function movementAxisParams(
  controller: RuntimeKinematicControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  operation?: MovementKinematicControllerOp,
): { x?: number; y?: number; z?: number } {
  const pair = pairParam(controller, state, context, "value");
  return {
    x: operation?.x ?? numberParam(controller, state, context, "x") ?? pair?.[0],
    y: operation?.y ?? numberParam(controller, state, context, "y") ?? pair?.[1],
    z:
      controller.normalizedType === "posset" || controller.normalizedType === "posadd"
        ? operation?.z ?? numberParam(controller, state, context, "z")
        : undefined,
  };
}

function kinematicControllerType(controller: RuntimeKinematicControllerSource): KinematicControllerOp["controllerType"] | undefined {
  const normalized = controller.normalizedType.toLowerCase();
  if (
    normalized === "velset" ||
    normalized === "veladd" ||
    normalized === "velmul" ||
    normalized === "hitvelset" ||
    normalized === "posset" ||
    normalized === "posadd" ||
    normalized === "gravity"
  ) {
    return normalized;
  }
  return undefined;
}

function numberParam(
  controller: RuntimeKinematicControllerSource,
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
  controller: RuntimeKinematicControllerSource,
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

function findParam(controller: RuntimeKinematicControllerSource, key: string): string | undefined {
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

import type { MetadataControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { CharacterRuntimeState } from "./types";
import { evaluateExpression } from "./ExpressionEvaluator";
import {
  createRuntimeControllerExpressionContext,
  type RuntimeControllerEvaluationContext,
} from "./RuntimeControllerExpressionContextSystem";

export type RuntimeStateTypeControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeStateTypeControllerResult = {
  applied: boolean;
  stateType?: CharacterRuntimeState["stateType"];
  moveType?: CharacterRuntimeState["moveType"];
  physics?: CharacterRuntimeState["physics"];
};

export class RuntimeStateTypeWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeStateTypeControllerSource,
    operation?: MetadataControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeStateTypeControllerResult {
    const resolvedOperation = operation ?? resolveRuntimeStateTypeSetControllerOperation(controller, state, context);
    const stateType = resolvedOperation?.stateType;
    const moveType = resolvedOperation?.moveType;
    const physics = resolvedOperation?.physics;
    let applied = false;
    const result: RuntimeStateTypeControllerResult = { applied: false };

    if (stateType === "S" || stateType === "C" || stateType === "A" || stateType === "L") {
      state.stateType = stateType;
      result.stateType = stateType;
      applied = true;
    }
    if (moveType === "I" || moveType === "A" || moveType === "H") {
      state.moveType = moveType;
      result.moveType = moveType;
      applied = true;
    }
    if (physics === "S" || physics === "C" || physics === "A" || physics === "N") {
      state.physics = physics;
      result.physics = physics;
      applied = true;
    }

    result.applied = applied;
    return result;
  }
}

export function resolveRuntimeStateTypeSetControllerOperation(
  controller: RuntimeStateTypeControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): MetadataControllerOp | undefined {
  const stateType = enumParam(controller, state, context, isStateType, "statetype", "stateType");
  const moveType = enumParam(controller, state, context, isMoveType, "movetype", "moveType");
  const physics = enumParam(controller, state, context, isPhysics, "physics");
  if (!stateType && !moveType && !physics) {
    return undefined;
  }
  const operation: MetadataControllerOp = {
    kind: "metadata",
    controllerType: "statetypeset",
  };
  if (stateType) {
    operation.stateType = stateType;
  }
  if (moveType) {
    operation.moveType = moveType;
  }
  if (physics) {
    operation.physics = physics;
  }
  return operation;
}

function enumParam<T extends string>(
  controller: RuntimeStateTypeControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  isAllowed: (value: string) => value is T,
  ...keys: string[]
): T | undefined {
  for (const key of keys) {
    const raw = findParam(controller, key);
    const resolved = raw ? enumValue(raw, state, context, isAllowed) : undefined;
    if (resolved) {
      return resolved;
    }
  }
  return undefined;
}

function enumValue<T extends string>(
  raw: string,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  isAllowed: (value: string) => value is T,
): T | undefined {
  const direct = raw.trim().toUpperCase();
  if (isAllowed(direct)) {
    return direct;
  }
  try {
    const evaluated = evaluateExpression(raw, createRuntimeControllerExpressionContext(state, context));
    const normalized = String(evaluated).trim().toUpperCase();
    return isAllowed(normalized) ? normalized : undefined;
  } catch {
    return undefined;
  }
}

function findParam(controller: RuntimeStateTypeControllerSource, key: string): string | undefined {
  const lower = key.toLowerCase();
  const match = Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower);
  return match?.[1];
}

function isStateType(value: string): value is NonNullable<MetadataControllerOp["stateType"]> {
  return value === "S" || value === "C" || value === "A" || value === "L";
}

function isMoveType(value: string): value is NonNullable<MetadataControllerOp["moveType"]> {
  return value === "I" || value === "A" || value === "H";
}

function isPhysics(value: string): value is NonNullable<MetadataControllerOp["physics"]> {
  return value === "S" || value === "C" || value === "A" || value === "N";
}

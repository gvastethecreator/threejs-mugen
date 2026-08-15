import type { DamageScaleControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeDamageScaleControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeDamageScaleControllerResult = {
  applied: boolean;
  multiplier?: number;
  dizzyPointsMultiplier?: number;
  guardPointsMultiplier?: number;
  redLifeMultiplier?: number;
};

export function resolveRuntimeDamageScaleControllerOperation(
  controller: RuntimeDamageScaleControllerSource,
  state: CharacterRuntimeState,
  controllerType: DamageScaleControllerOp["controllerType"],
  context: RuntimeControllerEvaluationContext = {},
): DamageScaleControllerOp | undefined {
  const value = numberParam(controller, state, context, "value");
  const dizzyPoints = controllerType === "attackmulset" ? numberParam(controller, state, context, "dizzypoints") : undefined;
  const guardPoints = controllerType === "attackmulset" ? numberParam(controller, state, context, "guardpoints") : undefined;
  const redLife = controllerType === "attackmulset" ? numberParam(controller, state, context, "redlife") : undefined;
  if (value === undefined && dizzyPoints === undefined && guardPoints === undefined && redLife === undefined) {
    return undefined;
  }
  return {
    kind: "damage-scale",
    controllerType,
    ...(value === undefined ? {} : { multiplier: clampDamageScaleMultiplier(value) }),
    ...(dizzyPoints === undefined ? {} : { dizzyPointsMultiplier: clampDamageScaleMultiplier(dizzyPoints) }),
    ...(guardPoints === undefined ? {} : { guardPointsMultiplier: clampDamageScaleMultiplier(guardPoints) }),
    ...(redLife === undefined ? {} : { redLifeMultiplier: clampDamageScaleMultiplier(redLife) }),
  };
}

export class RuntimeDamageScaleWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeDamageScaleControllerSource,
    controllerType: DamageScaleControllerOp["controllerType"],
    operation?: DamageScaleControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeDamageScaleControllerResult {
    const value = operation?.multiplier ?? numberParam(controller, state, context, "value");
    const dizzyPoints =
      controllerType === "attackmulset"
        ? operation?.dizzyPointsMultiplier ?? numberParam(controller, state, context, "dizzypoints")
        : undefined;
    const guardPoints =
      controllerType === "attackmulset"
        ? operation?.guardPointsMultiplier ?? numberParam(controller, state, context, "guardpoints")
        : undefined;
    const redLife =
      controllerType === "attackmulset"
        ? operation?.redLifeMultiplier ?? numberParam(controller, state, context, "redlife")
        : undefined;
    if (value === undefined && dizzyPoints === undefined && guardPoints === undefined && redLife === undefined) {
      return { applied: false };
    }

    const multiplier = value === undefined ? undefined : clampDamageScaleMultiplier(value);
    const dizzyPointsMultiplier = dizzyPoints === undefined ? undefined : clampDamageScaleMultiplier(dizzyPoints);
    const guardPointsMultiplier = guardPoints === undefined ? undefined : clampDamageScaleMultiplier(guardPoints);
    const redLifeMultiplier = redLife === undefined ? undefined : clampDamageScaleMultiplier(redLife);
    if (controllerType === "attackmulset") {
      if (multiplier !== undefined) {
        state.attackMultiplier = multiplier;
      }
      if (dizzyPointsMultiplier !== undefined) {
        state.dizzyPointsAttackMultiplier = dizzyPointsMultiplier;
      }
      if (guardPointsMultiplier !== undefined) {
        state.guardPointsAttackMultiplier = guardPointsMultiplier;
      }
      if (redLifeMultiplier !== undefined) {
        state.redLifeAttackMultiplier = redLifeMultiplier;
      }
    } else if (multiplier !== undefined) {
      state.defenseMultiplier = multiplier;
    }
    return {
      applied: true,
      ...(multiplier === undefined ? {} : { multiplier }),
      ...(dizzyPointsMultiplier === undefined ? {} : { dizzyPointsMultiplier }),
      ...(guardPointsMultiplier === undefined ? {} : { guardPointsMultiplier }),
      ...(redLifeMultiplier === undefined ? {} : { redLifeMultiplier }),
    };
  }
}

function numberParam(
  controller: RuntimeDamageScaleControllerSource,
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

function clampDamageScaleMultiplier(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function findParam(controller: RuntimeDamageScaleControllerSource, key: string): string | undefined {
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

import type { DamageScaleControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeDamageScaleControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeDamageScaleControllerResult = {
  applied: boolean;
  multiplier?: number;
};

export class RuntimeDamageScaleWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeDamageScaleControllerSource,
    controllerType: DamageScaleControllerOp["controllerType"],
    operation?: DamageScaleControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeDamageScaleControllerResult {
    const value = operation?.multiplier ?? numberParam(controller, state, context, "value");
    if (value === undefined) {
      return { applied: false };
    }

    const multiplier = Math.max(0, Math.min(10, value));
    if (controllerType === "attackmulset") {
      state.attackMultiplier = multiplier;
    } else {
      state.defenseMultiplier = multiplier;
    }
    return { applied: true, multiplier };
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

import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import { applyRuntimeStateMetadataTransition } from "./RuntimeStateMetadataSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeStateTransitionControllerType = "changestate" | "selfstate";

export type RuntimeStateTransitionControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeStateTransitionControllerResult = {
  applied: boolean;
  controllerType?: RuntimeStateTransitionControllerType;
  stateNo?: number;
  missingValue?: boolean;
};

export class RuntimeStateTransitionControllerWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeStateTransitionControllerSource,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeStateTransitionControllerResult {
    const controllerType = stateTransitionControllerType(controller);
    if (!controllerType) {
      return { applied: false };
    }

    const stateNo = numberParam(controller, state, context, "value", "stateno");
    if (stateNo === undefined) {
      return { applied: false, controllerType, missingValue: true };
    }

    applyRuntimeStateMetadataTransition(state, stateNo);
    state.animTime = 0;
    state.frameIndex = 0;

    const ctrl = numberParam(controller, state, context, "ctrl");
    if (ctrl !== undefined) {
      state.ctrl = ctrl !== 0;
    }

    return { applied: true, controllerType, stateNo };
  }
}

function stateTransitionControllerType(
  controller: RuntimeStateTransitionControllerSource,
): RuntimeStateTransitionControllerType | undefined {
  const normalized = controller.normalizedType.toLowerCase();
  if (normalized === "changestate" || normalized === "selfstate") {
    return normalized;
  }
  return undefined;
}

function numberParam(
  controller: RuntimeStateTransitionControllerSource,
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

function findParam(controller: RuntimeStateTransitionControllerSource, key: string): string | undefined {
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

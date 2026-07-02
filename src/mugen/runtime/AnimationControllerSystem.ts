import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import { runtimeAnimationElapsedBeforeFrame, runtimeAnimationFrameDuration } from "./RuntimeAnimationSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeAnimationControllerType = "changeanim" | "changeanim2";

export type RuntimeAnimationControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeAnimationControllerResult = {
  applied: boolean;
  controllerType?: RuntimeAnimationControllerType;
  animationSource?: NonNullable<CharacterRuntimeState["animationSource"]>;
  animNo?: number;
};

export class RuntimeAnimationControllerWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeAnimationControllerSource,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeAnimationControllerResult {
    const controllerType = animationControllerType(controller);
    if (!controllerType) {
      return { applied: false };
    }

    const animNo = numberParam(controller, state, context, "value", "anim");
    if (animNo === undefined) {
      return { applied: false, controllerType };
    }

    const animationSource = controllerType === "changeanim2" ? "state-owner" : "self";
    state.animNo = animNo;
    state.animationSource = animationSource;
    state.frameIndex = 0;
    state.animTime = 0;

    applyAnimationElement(state, controller, animNo, animationSource, context);

    return { applied: true, controllerType, animationSource, animNo };
  }
}

function applyAnimationElement(
  state: CharacterRuntimeState,
  controller: RuntimeAnimationControllerSource,
  animNo: number,
  animationSource: NonNullable<CharacterRuntimeState["animationSource"]>,
  context: RuntimeControllerEvaluationContext,
): void {
  const elem = numberParam(controller, state, context, "elem");
  if (elem === undefined) {
    return;
  }

  const requestedFrameIndex = Math.max(0, Math.round(elem) - 1);
  const action = context.getAnimation?.(animNo, animationSource);
  if (!action || action.frames.length === 0) {
    state.frameIndex = requestedFrameIndex;
    state.animTime = Math.max(0, Math.round(numberParam(controller, state, context, "elemtime") ?? 0));
    return;
  }

  const frameIndex = clamp(requestedFrameIndex, 0, action.frames.length - 1);
  const frameDuration = runtimeAnimationFrameDuration(action.frames[frameIndex]);
  const elemTime = clamp(Math.round(numberParam(controller, state, context, "elemtime") ?? 0), 0, frameDuration - 1);
  state.frameIndex = frameIndex;
  state.animTime = runtimeAnimationElapsedBeforeFrame(action, frameIndex) + elemTime;
}

function animationControllerType(controller: RuntimeAnimationControllerSource): RuntimeAnimationControllerType | undefined {
  const normalized = controller.normalizedType.toLowerCase();
  if (normalized === "changeanim" || normalized === "changeanim2") {
    return normalized;
  }
  return undefined;
}

function numberParam(
  controller: RuntimeAnimationControllerSource,
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

function findParam(controller: RuntimeAnimationControllerSource, key: string): string | undefined {
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

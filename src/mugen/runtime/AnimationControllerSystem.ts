import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
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
    stageTime: context.stageTime,
  });
  const value = Number(evaluated);
  return Number.isFinite(value) ? value : undefined;
}

function runtimeHitVar(state: CharacterRuntimeState, name: string): number | undefined {
  const key = name.trim().toLowerCase();
  if (key === "animtype") {
    return state.hitVars?.animType ?? 0;
  }
  if (key === "groundtype") {
    return state.hitVars?.groundType ?? 0;
  }
  if (key === "airtype") {
    return state.hitVars?.airType ?? 0;
  }
  if (key === "isbound") {
    return state.hitVars?.isBound ? 1 : 0;
  }
  if (key === "fall") {
    return state.hitFall?.falling ? 1 : 0;
  }
  if (key === "fall.damage") {
    return state.hitFall?.damage ?? 0;
  }
  if (key === "fall.defence_up") {
    return state.hitFall?.defenceUp ?? 100;
  }
  if (key === "fall.kill") {
    return state.hitFall?.kill === false ? 0 : 1;
  }
  if (key === "fall.xvel" || key === "fall.xvelocity") {
    return state.hitFall?.velocity.x ?? 0;
  }
  if (key === "fall.yvel" || key === "fall.yvelocity") {
    return state.hitFall?.velocity.y ?? 0;
  }
  if (key === "fall.recover") {
    return state.hitFall?.recover && (state.hitFall.recoverTime ?? 0) <= 0 ? 1 : 0;
  }
  if (key === "fall.recovertime") {
    return state.hitFall?.recoverTime ?? 0;
  }
  if (key === "down.recover") {
    return state.hitFall?.downRecover === false ? 0 : 1;
  }
  if (key === "recovertime" || key === "down.recovertime") {
    return state.hitFall?.downRecoverTime ?? 0;
  }
  if (key === "yaccel") {
    return 0.44;
  }
  if (key === "fall.envshake.time") {
    return state.hitFall?.envShake?.time ?? 0;
  }
  if (key === "fall.envshake.freq") {
    return state.hitFall?.envShake?.freq ?? 60;
  }
  if (key === "fall.envshake.ampl") {
    return state.hitFall?.envShake?.ampl ?? 0;
  }
  if (key === "fall.envshake.phase") {
    return state.hitFall?.envShake?.phase ?? 0;
  }
  if (key === "xvel") {
    return state.hitVelocity?.x ?? 0;
  }
  if (key === "yvel") {
    return state.hitVelocity?.y ?? 0;
  }
  if (key === "hittime") {
    return state.guardStun ?? 0;
  }
  if (key === "slidetime") {
    return state.guardSlideTime ?? 0;
  }
  if (key === "ctrltime") {
    return state.guardControlTime ?? 0;
  }
  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

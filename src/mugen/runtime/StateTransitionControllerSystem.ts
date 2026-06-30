import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
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
    return evaluateNumber(raw.split(",")[0]?.trim(), state, context);
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

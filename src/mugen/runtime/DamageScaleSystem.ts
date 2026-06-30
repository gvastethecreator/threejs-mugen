import type { DamageScaleControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
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
    return evaluateNumber(raw.split(",")[0]?.trim(), state, context);
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
  return undefined;
}

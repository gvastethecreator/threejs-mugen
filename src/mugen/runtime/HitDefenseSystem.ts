import type { HitEligibilityControllerOp, HitOverrideControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState, RuntimeHitBySlot, RuntimeHitOverrideSlot } from "./types";

export type RuntimeHitDefenseControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeHitByControllerResult = {
  slot1Active: boolean;
  slot2Active: boolean;
};

export type RuntimeHitOverrideControllerResult = {
  active: boolean;
  slot: number;
};

export class RuntimeHitDefenseWorld {
  applyHitByController(
    state: CharacterRuntimeState,
    controller: RuntimeHitDefenseControllerSource,
    mode: RuntimeHitBySlot["mode"],
    operation?: HitEligibilityControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeHitByControllerResult {
    const hitBy = { ...(state.hitBy ?? {}) };
    if (operation) {
      for (const slot of operation.slots) {
        if (slot.slot === 1) {
          hitBy.slot1 = { mode: operation.mode, attr: slot.attr, remaining: slot.remaining };
        } else {
          hitBy.slot2 = { mode: operation.mode, attr: slot.attr, remaining: slot.remaining };
        }
      }
      state.hitBy = hitBy;
      return { slot1Active: Boolean(hitBy.slot1), slot2Active: Boolean(hitBy.slot2) };
    }

    const time = controllerDuration(numberParam(controller, state, context, "time") ?? 1);
    const value = findParam(controller, "value");
    const value2 = findParam(controller, "value2");
    if (value !== undefined) {
      hitBy.slot1 = { mode, attr: value.trim(), remaining: time };
    }
    if (value2 !== undefined) {
      hitBy.slot2 = { mode, attr: value2.trim(), remaining: time };
    }
    state.hitBy = hitBy;
    return { slot1Active: Boolean(hitBy.slot1), slot2Active: Boolean(hitBy.slot2) };
  }

  applyHitOverrideController(
    state: CharacterRuntimeState,
    controller: RuntimeHitDefenseControllerSource,
    operation?: HitOverrideControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeHitOverrideControllerResult {
    const slot = operation?.slot ?? clampIndex(Math.round(numberParam(controller, state, context, "slot") ?? 0), 7);
    const attr = operation?.attr ?? findParam(controller, "attr")?.trim() ?? "";
    const remaining = operation?.remaining ?? controllerDuration(numberParam(controller, state, context, "time") ?? 1);
    const overrides = (state.hitOverrides ?? []).filter((entry) => entry.slot !== slot);

    if (!attr || remaining <= 0) {
      state.hitOverrides = overrides.length > 0 ? overrides : undefined;
      return { active: false, slot };
    }

    const stateNo = numberParam(controller, state, context, "stateno", "value");
    const next: RuntimeHitOverrideSlot = {
      slot,
      attr,
      remaining,
      forceAir: operation?.forceAir ?? ((numberParam(controller, state, context, "forceair") ?? 0) !== 0),
      forceGuard: operation?.forceGuard ?? ((numberParam(controller, state, context, "forceguard") ?? 0) !== 0),
      keepState: operation?.keepState ?? ((numberParam(controller, state, context, "keepstate") ?? 0) !== 0),
    };
    const targetStateNo = operation?.stateNo ?? stateNo;
    if (targetStateNo !== undefined && targetStateNo >= 0) {
      next.stateNo = targetStateNo;
    }

    state.hitOverrides = [...overrides, next].sort((a, b) => a.slot - b.slot);
    return { active: true, slot };
  }
}

function numberParam(
  controller: RuntimeHitDefenseControllerSource,
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

function findParam(controller: RuntimeHitDefenseControllerSource, key: string): string | undefined {
  const lower = key.toLowerCase();
  const match = Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower);
  return match?.[1];
}

function controllerDuration(value: number): number {
  if (value < 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.min(3600, Math.round(value)));
}

function clampIndex(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
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

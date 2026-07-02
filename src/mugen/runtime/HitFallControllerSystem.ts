import type { HitFallControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { applyRuntimeDamage, canRuntimeDamageKill } from "./CombatResolver";
import { evaluateExpression } from "./ExpressionEvaluator";
import { runtimeHitVar } from "./RuntimeHitVarSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeHitFallControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeHitFallControllerResult = {
  applied: boolean;
  controllerType?: HitFallControllerOp["controllerType"];
  damageApplied?: number;
};

export class RuntimeHitFallControllerWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeHitFallControllerSource,
    operation?: HitFallControllerOp,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeHitFallControllerResult {
    const controllerType = operation?.controllerType ?? hitFallControllerType(controller);
    if (!controllerType) {
      return { applied: false };
    }

    if (controllerType === "hitfallvel") {
      return applyHitFallVelocity(state);
    }
    if (controllerType === "hitfalldamage") {
      return applyHitFallDamage(state);
    }
    return applyHitFallSet(state, controller, operation, context);
  }
}

function applyHitFallVelocity(state: CharacterRuntimeState): RuntimeHitFallControllerResult {
  if (state.moveType !== "H" || !state.hitFall) {
    return { applied: false, controllerType: "hitfallvel" };
  }
  if (state.hitFall.velocity.x !== undefined) {
    state.vel.x = state.hitFall.velocity.x;
  }
  state.vel.y = state.hitFall.velocity.y;
  return { applied: true, controllerType: "hitfallvel" };
}

function applyHitFallDamage(state: CharacterRuntimeState): RuntimeHitFallControllerResult {
  if (state.moveType !== "H" || !state.hitFall || state.hitFall.damage <= 0) {
    return { applied: false, controllerType: "hitfalldamage" };
  }
  const defenceScale = state.hitFall.defenceUp === undefined ? 1 : Math.max(0, Math.min(10, state.hitFall.defenceUp / 100));
  const scaledDamage = Math.max(0, Math.round(state.hitFall.damage * defenceScale));
  state.life = applyRuntimeDamage(state.life, scaledDamage, canRuntimeDamageKill(state, state.hitFall.kill ?? true));
  state.hitFall = { ...state.hitFall, damage: 0 };
  return { applied: true, controllerType: "hitfalldamage", damageApplied: scaledDamage };
}

function applyHitFallSet(
  state: CharacterRuntimeState,
  controller: RuntimeHitFallControllerSource,
  operation?: HitFallControllerOp,
  context: RuntimeControllerEvaluationContext = {},
): RuntimeHitFallControllerResult {
  const current = state.hitFall ?? {
    falling: false,
    damage: 0,
    velocity: { y: -4.5 },
  };
  const value =
    operation?.controllerType === "hitfallset" && operation.falling !== undefined
      ? operation.falling
        ? 1
        : 0
      : numberParam(controller, state, context, "value");
  const x =
    operation?.controllerType === "hitfallset"
      ? operation.xVelocity ?? numberParam(controller, state, context, "xvel", "x")
      : numberParam(controller, state, context, "xvel", "x");
  const y =
    operation?.controllerType === "hitfallset"
      ? operation.yVelocity ?? numberParam(controller, state, context, "yvel", "y")
      : numberParam(controller, state, context, "yvel", "y");
  state.hitFall = {
    ...current,
    falling: value !== undefined ? value !== 0 : current.falling,
    velocity: {
      x: x ?? current.velocity.x,
      y: y ?? current.velocity.y,
    },
  };
  return { applied: true, controllerType: "hitfallset" };
}

function hitFallControllerType(controller: RuntimeHitFallControllerSource): HitFallControllerOp["controllerType"] | undefined {
  const type = controller.normalizedType.toLowerCase();
  return type === "hitfallvel" || type === "hitfalldamage" || type === "hitfallset" ? type : undefined;
}

function numberParam(
  controller: RuntimeHitFallControllerSource,
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

function findParam(controller: RuntimeHitFallControllerSource, key: string): string | undefined {
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

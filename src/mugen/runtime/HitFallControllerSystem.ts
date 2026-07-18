import type { HitFallControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { applyRuntimeDamage, canRuntimeDamageKill, scaleRuntimeIncomingDamage } from "./CombatResolver";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

const COMMON1_GROUND_IMPACT_STATE_NO = 5100;

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
  if (state.moveType !== "H" || !state.hitFall) {
    return { applied: false, controllerType: "hitfalldamage" };
  }
  const { hitFall, countedGroundImpact } = countCommon1GroundImpact(
    state.stateNo,
    state.hitFall,
    state.assertSpecial?.noFallCount === true,
  );
  if (hitFall.damage <= 0) {
    state.hitFall = hitFall;
    return { applied: countedGroundImpact, controllerType: "hitfalldamage" };
  }
  const scaledDamage =
    state.fallDefenseMultiplier === undefined
      ? Math.max(0, Math.round(hitFall.damage * legacyHitFallDefenceScale(hitFall.defenceUp)))
      : scaleRuntimeIncomingDamage(state, hitFall.damage);
  state.life = applyRuntimeDamage(state.life, scaledDamage, canRuntimeDamageKill(state, hitFall.kill ?? true));
  state.hitFall = { ...hitFall, damage: 0 };
  return { applied: true, controllerType: "hitfalldamage", damageApplied: scaledDamage };
}

function legacyHitFallDefenceScale(defenceUp: number | undefined): number {
  return defenceUp === undefined ? 1 : Math.max(0, Math.min(10, defenceUp / 100));
}

function countCommon1GroundImpact(
  stateNo: number,
  hitFall: NonNullable<CharacterRuntimeState["hitFall"]>,
  noFallCount: boolean,
): {
  hitFall: NonNullable<CharacterRuntimeState["hitFall"]>;
  countedGroundImpact: boolean;
} {
  if (stateNo !== COMMON1_GROUND_IMPACT_STATE_NO || noFallCount || hitFall.fallCountedGroundImpact) {
    return { hitFall, countedGroundImpact: false };
  }
  return {
    hitFall: {
      ...hitFall,
      fallCount: (hitFall.fallCount ?? 0) + 1,
      fallCountedGroundImpact: true,
    },
    countedGroundImpact: true,
  };
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
    return evaluateNumber(raw.trim(), state, context);
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
  return evaluateRuntimeControllerNumber(raw, state, context);
}

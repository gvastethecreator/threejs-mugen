import type { BoundsControllerOp, CollisionControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { evaluateExpression } from "./ExpressionEvaluator";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeBoundsControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeBoundsControllerResult = {
  applied: boolean;
  controllerType?: BoundsControllerOp["controllerType"] | Extract<CollisionControllerOp, { controllerType: "playerpush" }>["controllerType"];
};

export class RuntimeBoundsControllerWorld {
  applyPlayerPushController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<CollisionControllerOp, { controllerType: "playerpush" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    state.playerPush = operation?.enabled ?? (numberParam(controller, state, context, "value") ?? 1) !== 0;
    return { applied: true, controllerType: "playerpush" };
  }

  applyPosFreezeController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<BoundsControllerOp, { controllerType: "posfreeze" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    const value = operation ? undefined : numberParam(controller, state, context, "value");
    const x = operation ? undefined : numberParam(controller, state, context, "x");
    const y = operation ? undefined : numberParam(controller, state, context, "y");
    const freeze = value !== undefined ? value !== 0 : x === undefined && y === undefined;
    state.posFreeze = {
      x: operation?.x ?? (value !== undefined ? freeze : x !== undefined ? x !== 0 : freeze),
      y: operation?.y ?? (value !== undefined ? freeze : y !== undefined ? y !== 0 : freeze),
    };
    return { applied: true, controllerType: "posfreeze" };
  }

  applyScreenBoundController(
    state: CharacterRuntimeState,
    controller: RuntimeBoundsControllerSource,
    operation?: Extract<BoundsControllerOp, { controllerType: "screenbound" }>,
    context: RuntimeControllerEvaluationContext = {},
  ): RuntimeBoundsControllerResult {
    const camera = operation ? undefined : pairParam(controller, state, context, "movecamera");
    state.screenBound = {
      bound: operation?.bound ?? ((numberParam(controller, state, context, "value") ?? 0) !== 0),
      moveCameraX: operation?.moveCameraX ?? ((camera?.[0] ?? 0) !== 0),
      moveCameraY: operation?.moveCameraY ?? ((camera?.[1] ?? 0) !== 0),
    };
    return { applied: true, controllerType: "screenbound" };
  }
}

function numberParam(
  controller: RuntimeBoundsControllerSource,
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

function pairParam(
  controller: RuntimeBoundsControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
  key: string,
): [number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(",").map((part) => evaluateNumber(part.trim(), state, context));
  if (parts.length < 2 || parts[0] === undefined || parts[1] === undefined) {
    return undefined;
  }
  return [parts[0], parts[1]];
}

function findParam(controller: RuntimeBoundsControllerSource, key: string): string | undefined {
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

import type { MugenHitDefExpressionTriplet, MugenHitDefPaletteFxOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import { evaluateRuntimeControllerNumber, type RuntimeControllerEvaluationContext } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimePaletteFxResolver } from "./SpriteEffectSystem";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState, RuntimePaletteFxPayload } from "./types";

export const DEFAULT_RUNTIME_HITDEF_PALETTE_FX: RuntimePaletteFxPayload = {
  time: 0,
  add: [0, 0, 0],
  // Ikemen GO 149402fa resets the HitDef-local multiplier to 255.
  mul: [255, 255, 255],
  color: 256,
  invert: false,
};

export function resolveRuntimeHitDefPaletteFx(input: {
  operation?: MugenHitDefPaletteFxOp;
  controller: MugenStateController;
  state?: CharacterRuntimeState;
  context?: RuntimeControllerEvaluationContext;
  resolver?: RuntimePaletteFxResolver;
  fallback?: RuntimePaletteFxPayload;
}): RuntimePaletteFxPayload | undefined {
  const { operation, controller, state, context = {}, resolver } = input;
  const authored = operation !== undefined || ["time", "add", "mul", "color", "invertall"]
    .some((key) => findControllerParam(controller, `palfx.${key}`) !== undefined);
  if (!authored) return undefined;

  const fallback = clonePaletteFx(input.fallback ?? DEFAULT_RUNTIME_HITDEF_PALETTE_FX);
  const time = resolveNumber("time", operation?.time, findControllerParam(controller, "palfx.time"), state, context, resolver) ?? fallback.time;
  const add = resolveTriplet("add", operation?.add, findControllerParam(controller, "palfx.add"), state, context, resolver, fallback.add);
  const mul = resolveTriplet("mul", operation?.mul, findControllerParam(controller, "palfx.mul"), state, context, resolver, fallback.mul);
  const color = resolveNumber("color", operation?.color, findControllerParam(controller, "palfx.color"), state, context, resolver) ?? fallback.color;
  const invertAll = resolveNumber("invertall", operation?.invertAll, findControllerParam(controller, "palfx.invertall"), state, context, resolver);
  return {
    time: Math.trunc(time),
    add: add.map(Math.trunc) as [number, number, number],
    mul: mul.map(Math.trunc) as [number, number, number],
    color: Math.trunc(color),
    invert: invertAll === undefined ? fallback.invert : invertAll !== 0,
  };
}

function resolveNumber(
  key: "time" | "color" | "invertall",
  value: number | string | undefined,
  raw: string | undefined,
  state: CharacterRuntimeState | undefined,
  context: RuntimeControllerEvaluationContext,
  resolver: RuntimePaletteFxResolver | undefined,
): number | undefined {
  const resolved = resolver?.resolveNumber(key);
  if (resolved !== undefined && Number.isFinite(resolved)) return resolved;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const expression = typeof value === "string" ? value : raw;
  if (!expression) return undefined;
  if (!state) {
    const staticValue = Number(expression.trim());
    return Number.isFinite(staticValue) ? staticValue : undefined;
  }
  const evaluated = evaluateRuntimeControllerNumber(expression, state, context);
  return evaluated !== undefined && Number.isFinite(evaluated) ? evaluated : undefined;
}

function resolveTriplet(
  key: "add" | "mul",
  value: MugenHitDefExpressionTriplet | undefined,
  raw: string | undefined,
  state: CharacterRuntimeState | undefined,
  context: RuntimeControllerEvaluationContext,
  resolver: RuntimePaletteFxResolver | undefined,
  fallback: [number, number, number],
): [number, number, number] {
  const resolved = resolver?.resolveTriplet(key);
  const source = resolved ?? value ?? staticTriplet(raw);
  if (!source) return [...fallback];
  return source.map((component, index) => {
    if (typeof component === "number") return Number.isFinite(component) ? component : fallback[index]!;
    if (!state) return fallback[index]!;
    const evaluated = evaluateRuntimeControllerNumber(component, state, context);
    return evaluated !== undefined && Number.isFinite(evaluated) ? evaluated : fallback[index]!;
  }) as [number, number, number];
}

function staticTriplet(raw: string | undefined): [number, number, number] | undefined {
  if (!raw) return undefined;
  const values = raw.split(",").map((part) => Number(part.trim()));
  return values.length === 3 && values.every(Number.isFinite)
    ? [values[0]!, values[1]!, values[2]!]
    : undefined;
}

function clonePaletteFx(value: RuntimePaletteFxPayload): RuntimePaletteFxPayload {
  return { ...value, add: [...value.add], mul: [...value.mul] };
}

import type { EnvColorControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeEnvColorEvent, RuntimeStageFlash } from "./types";

export function createRuntimeEnvColorEvent(
  controller: MugenStateController,
  runtimeTick: number,
  operation?: EnvColorControllerOp,
): RuntimeEnvColorEvent | undefined {
  const time = operation?.time ?? clampFlashTime(firstNumber(findControllerParam(controller, "time")) ?? 1);
  if (time <= 0) {
    return undefined;
  }
  return {
    type: "EnvColor",
    color: operation?.color ?? colorTriplet(findControllerParam(controller, "value"), [255, 255, 255]),
    time,
    under: operation?.under ?? (firstNumber(findControllerParam(controller, "under")) ?? 0) !== 0,
    runtimeTick,
  };
}

export function pushRuntimeEnvColorEvent(events: RuntimeEnvColorEvent[], event: RuntimeEnvColorEvent, maxEvents = 8): void {
  events.unshift(event);
  events.splice(maxEvents);
}

export function calculateRuntimeStageFlash(runtimeTick: number, events: readonly RuntimeEnvColorEvent[]): RuntimeStageFlash | undefined {
  const active = events
    .map((event) => ({ event, age: runtimeTick - event.runtimeTick }))
    .filter(({ event, age }) => age >= 0 && age < event.time)
    .sort((left, right) => right.event.runtimeTick - left.event.runtimeTick)[0];
  if (!active) {
    return undefined;
  }
  const remaining = Math.max(0, active.event.time - active.age);
  return {
    color: [active.event.color[0], active.event.color[1], active.event.color[2]],
    opacity: roundFlashOpacity(Math.min(0.65, 0.18 + (remaining / Math.max(1, active.event.time)) * 0.42)),
    remaining,
    under: active.event.under,
  };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function colorTriplet(value: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!value) {
    return fallback;
  }
  const numbers = value.split(",").map((part) => Number(part.trim()));
  if (numbers.length < 3 || numbers.some((numberValue) => !Number.isFinite(numberValue))) {
    return fallback;
  }
  return [clampColor(numbers[0]!), clampColor(numbers[1]!), clampColor(numbers[2]!)];
}

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampFlashTime(value: number): number {
  return Math.max(0, Math.min(240, Math.round(value)));
}

function roundFlashOpacity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

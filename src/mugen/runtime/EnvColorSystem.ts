import type { EnvColorControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeEnvColorEvent, RuntimeStageFlash } from "./types";

export type RuntimeEnvColorControllerDispatchOptions<TActor> = {
  actor: TActor;
  controller: ControllerIr;
  runtimeTick: number;
  emitController: (
    controller: MugenStateController,
    runtimeTick: number,
    operation?: EnvColorControllerOp,
    resolveEnvColor?: RuntimeEnvColorResolver,
  ) => RuntimeEnvColorEvent | undefined | void;
  resolveEnvColor?: RuntimeEnvColorResolver;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: EnvColorControllerOp) => void;
};

export type RuntimeEnvColorResolver = {
  resolveNumber: (key: "time" | "under") => number | undefined;
  resolveTriplet: (key: "value") => [number, number, number] | undefined;
};

export type RuntimeEnvColorControllerDispatchResult = {
  event?: RuntimeEnvColorEvent;
  recordedController: boolean;
  recordedOperation: boolean;
};

export function createRuntimeEnvColorEvent(
  controller: MugenStateController,
  runtimeTick: number,
  operation?: EnvColorControllerOp,
  resolveEnvColor?: RuntimeEnvColorResolver,
): RuntimeEnvColorEvent | undefined {
  const time =
    operation?.time ??
    normalizeEnvColorTime(resolveEnvColor?.resolveNumber("time") ?? firstNumber(findControllerParam(controller, "time")) ?? 1);
  if (time === 0) {
    return undefined;
  }
  return {
    type: "EnvColor",
    color:
      operation?.color ??
      clampColorTriplet(resolveEnvColor?.resolveTriplet("value")) ??
      colorTriplet(findControllerParam(controller, "value"), [255, 255, 255]),
    time,
    under: operation?.under ?? (resolveEnvColor?.resolveNumber("under") ?? firstNumber(findControllerParam(controller, "under")) ?? 0) !== 0,
    runtimeTick,
  };
}

export function resolveRuntimeEnvColorControllerOperation(
  controller: MugenStateController,
  resolveEnvColor?: RuntimeEnvColorResolver,
): EnvColorControllerOp | undefined {
  const color = resolveEnvColorTripletParam(controller, "value", resolveEnvColor, [255, 255, 255]);
  const time = resolveEnvColorNumberParam(controller, "time", resolveEnvColor, normalizeEnvColorTime, 1);
  const under = resolveEnvColorNumberParam(controller, "under", resolveEnvColor, (value) => value, 0);
  if (color === undefined || time === undefined || under === undefined || time === 0) {
    return undefined;
  }
  return {
    kind: "envcolor",
    color,
    time,
    under: under !== 0,
  };
}

export function pushRuntimeEnvColorEvent(events: RuntimeEnvColorEvent[], event: RuntimeEnvColorEvent, maxEvents = 8): void {
  events.unshift(event);
  events.splice(maxEvents);
}

export class RuntimeEnvColorWorld {
  private readonly events: RuntimeEnvColorEvent[] = [];

  emitController(
    controller: MugenStateController,
    runtimeTick: number,
    operation?: EnvColorControllerOp,
    resolveEnvColor?: RuntimeEnvColorResolver,
  ): RuntimeEnvColorEvent | undefined {
    const event = createRuntimeEnvColorEvent(controller, runtimeTick, operation, resolveEnvColor);
    if (!event) {
      return undefined;
    }
    pushRuntimeEnvColorEvent(this.events, event);
    return event;
  }

  snapshotStageFlash(runtimeTick: number): RuntimeStageFlash | undefined {
    return calculateRuntimeStageFlash(runtimeTick, this.events);
  }

  reset(): void {
    this.events.length = 0;
  }
}

export class RuntimeEnvColorControllerDispatchWorld {
  apply<TActor>(options: RuntimeEnvColorControllerDispatchOptions<TActor>): RuntimeEnvColorControllerDispatchResult {
    const operation =
      options.controller.operation?.kind === "envcolor"
        ? options.controller.operation
        : resolveRuntimeEnvColorControllerOperation(options.controller.source, options.resolveEnvColor);
    options.recordController?.(options.actor, options.controller.source);
    if (operation) {
      options.recordOperation?.(options.actor, operation);
    }
    const event = options.emitController(options.controller.source, options.runtimeTick, operation, options.resolveEnvColor) ?? undefined;
    return {
      event,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(operation && options.recordOperation),
    };
  }
}

export function calculateRuntimeStageFlash(runtimeTick: number, events: readonly RuntimeEnvColorEvent[]): RuntimeStageFlash | undefined {
  let current: RuntimeEnvColorEvent | undefined;
  for (const event of events) {
    if (event.runtimeTick > runtimeTick || (current && event.runtimeTick <= current.runtimeTick)) {
      continue;
    }
    current = event;
  }
  if (!current) {
    return undefined;
  }
  const age = runtimeTick - current.runtimeTick;
  if (current.time >= 0 && age >= current.time) {
    return undefined;
  }
  const remaining = current.time < 0 ? -1 : Math.max(0, current.time - age);
  return {
    color: [current.color[0], current.color[1], current.color[2]],
    opacity: current.time < 0 ? 0.6 : roundFlashOpacity(Math.min(0.65, 0.18 + (remaining / Math.max(1, current.time)) * 0.42)),
    remaining,
    under: current.under,
    ...(current.sourceActorId === undefined ? {} : { sourceActorId: current.sourceActorId }),
    ...(current.sourceRootId === undefined ? {} : { sourceRootId: current.sourceRootId }),
    ...(current.sourceParentId === undefined ? {} : { sourceParentId: current.sourceParentId }),
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

function clampColorTriplet(value: [number, number, number] | undefined): [number, number, number] | undefined {
  if (!value) {
    return undefined;
  }
  return [clampColor(value[0]), clampColor(value[1]), clampColor(value[2])];
}

function resolveEnvColorNumberParam(
  controller: MugenStateController,
  key: "time" | "under",
  resolver: RuntimeEnvColorResolver | undefined,
  clamp: (value: number) => number,
  defaultValue: number,
): number | undefined {
  const param = findControllerParam(controller, key);
  if (param === undefined) {
    return clamp(defaultValue);
  }
  const value = resolver?.resolveNumber(key) ?? firstNumber(param);
  return value === undefined || !Number.isFinite(value) ? undefined : clamp(value);
}

function resolveEnvColorTripletParam(
  controller: MugenStateController,
  key: "value",
  resolver: RuntimeEnvColorResolver | undefined,
  fallback: [number, number, number],
): [number, number, number] | undefined {
  const param = findControllerParam(controller, key);
  if (param === undefined) {
    return fallback;
  }
  const resolved = clampColorTriplet(resolver?.resolveTriplet(key));
  if (resolved) {
    return resolved;
  }
  const numbers = param.split(",").map((part) => Number(part.trim()));
  if (numbers.length < 3 || numbers.some((numberValue) => !Number.isFinite(numberValue))) {
    return undefined;
  }
  return [clampColor(numbers[0]!), clampColor(numbers[1]!), clampColor(numbers[2]!)];
}

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeEnvColorTime(value: number): number {
  const rounded = Math.round(value);
  return rounded < 0 ? -1 : Math.max(0, rounded);
}

function roundFlashOpacity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

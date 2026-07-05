import type { EnvShakeControllerOp, FallEnvShakeControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState, RuntimeEnvShakeEvent } from "./types";

export type RuntimeEnvShakeActor = {
  runtime: Pick<CharacterRuntimeState, "stateNo" | "hitFall">;
  stateElapsed: number;
};

export type RuntimeEnvShakeWorldActor = RuntimeEnvShakeActor & {
  envShakeEvents: RuntimeEnvShakeEvent[];
};

export type RuntimeCameraShake = {
  x: number;
  y: number;
  remaining: number;
  amplitude: number;
};

export type RuntimeEnvShakeControllerDispatchOptions<TActor extends RuntimeEnvShakeWorldActor> = {
  actor: TActor;
  controller: ControllerIr;
  runtimeTick: number;
  envShakeWorld: RuntimeEnvShakeWorld;
  resolveEnvShake?: RuntimeEnvShakeResolver;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: EnvShakeControllerOp) => void;
};

export type RuntimeEnvShakeResolver = {
  resolveNumber: (key: "time" | "ampl") => number | undefined;
  resolveFloat: (key: "freq" | "phase") => number | undefined;
};

export type RuntimeEnvShakeControllerDispatchResult = {
  event?: RuntimeEnvShakeEvent;
  recordedController: boolean;
  recordedOperation: boolean;
};

export type RuntimeFallEnvShakeControllerDispatchOptions<TActor extends RuntimeEnvShakeWorldActor> = {
  actor: TActor;
  controller: ControllerIr;
  runtimeTick: number;
  envShakeWorld: RuntimeEnvShakeWorld;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: FallEnvShakeControllerOp) => void;
};

export type RuntimeFallEnvShakeControllerDispatchResult = {
  event?: RuntimeEnvShakeEvent;
  clearedFallEnvShake: boolean;
  recordedController: boolean;
  recordedOperation: boolean;
};

export function createRuntimeEnvShakeEvent(
  actor: RuntimeEnvShakeActor,
  controller: MugenStateController,
  runtimeTick: number,
  operation?: EnvShakeControllerOp,
  resolveEnvShake?: RuntimeEnvShakeResolver,
): RuntimeEnvShakeEvent | undefined {
  const time =
    operation?.time ??
    clampShakeTime(resolveEnvShake?.resolveNumber("time") ?? firstNumber(findControllerParam(controller, "time")) ?? 0);
  if (time <= 0) {
    return undefined;
  }
  return {
    type: "EnvShake",
    time,
    freq:
      operation?.freq ??
      clampShakeFrequency(resolveEnvShake?.resolveFloat("freq") ?? firstNumber(findControllerParam(controller, "freq")) ?? 60),
    ampl:
      operation?.ampl ??
      clampShakeAmplitude(resolveEnvShake?.resolveNumber("ampl") ?? firstNumber(findControllerParam(controller, "ampl")) ?? -4),
    phase: operation?.phase ?? resolveEnvShake?.resolveFloat("phase") ?? firstNumber(findControllerParam(controller, "phase")) ?? 0,
    stateNo: actor.runtime.stateNo,
    tick: actor.stateElapsed,
    runtimeTick,
  };
}

export function createRuntimeFallEnvShakeEvent(
  actor: RuntimeEnvShakeActor,
  runtimeTick: number,
): RuntimeEnvShakeEvent | undefined {
  const envShake = actor.runtime.hitFall?.envShake;
  if (!envShake || envShake.time <= 0) {
    return undefined;
  }
  return {
    type: "EnvShake",
    time: clampShakeTime(envShake.time),
    freq: clampShakeFrequency(envShake.freq),
    ampl: clampShakeAmplitude(envShake.ampl),
    phase: envShake.phase,
    stateNo: actor.runtime.stateNo,
    tick: actor.stateElapsed,
    runtimeTick,
  };
}

export function pushRuntimeEnvShakeEvent(events: RuntimeEnvShakeEvent[], event: RuntimeEnvShakeEvent, maxEvents = 8): void {
  events.unshift(event);
  events.splice(maxEvents);
}

export class RuntimeEnvShakeWorld {
  emitController(
    actor: RuntimeEnvShakeWorldActor,
    controller: MugenStateController,
    runtimeTick: number,
    operation?: EnvShakeControllerOp,
    resolveEnvShake?: RuntimeEnvShakeResolver,
  ): RuntimeEnvShakeEvent | undefined {
    const event = createRuntimeEnvShakeEvent(actor, controller, runtimeTick, operation, resolveEnvShake);
    if (!event) {
      return undefined;
    }
    pushRuntimeEnvShakeEvent(actor.envShakeEvents, event);
    return event;
  }

  emitFall(actor: RuntimeEnvShakeWorldActor, runtimeTick: number): RuntimeEnvShakeEvent | undefined {
    const event = createRuntimeFallEnvShakeEvent(actor, runtimeTick);
    if (!event) {
      return undefined;
    }
    pushRuntimeEnvShakeEvent(actor.envShakeEvents, event);
    return event;
  }

  snapshotCameraShake(runtimeTick: number, actors: readonly RuntimeEnvShakeWorldActor[]): RuntimeCameraShake | undefined {
    return calculateRuntimeCameraShake(
      runtimeTick,
      actors.flatMap((actor) => actor.envShakeEvents),
    );
  }
}

export class RuntimeEnvShakeControllerDispatchWorld {
  apply<TActor extends RuntimeEnvShakeWorldActor>(
    options: RuntimeEnvShakeControllerDispatchOptions<TActor>,
  ): RuntimeEnvShakeControllerDispatchResult {
    const operation = options.controller.operation?.kind === "envshake" ? options.controller.operation : undefined;
    options.recordController?.(options.actor, options.controller.source);
    if (operation) {
      options.recordOperation?.(options.actor, operation);
    }
    const event = options.envShakeWorld.emitController(
      options.actor,
      options.controller.source,
      options.runtimeTick,
      operation,
      options.resolveEnvShake,
    );
    return {
      event,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(operation && options.recordOperation),
    };
  }
}

export class RuntimeFallEnvShakeControllerDispatchWorld {
  apply<TActor extends RuntimeEnvShakeWorldActor>(
    options: RuntimeFallEnvShakeControllerDispatchOptions<TActor>,
  ): RuntimeFallEnvShakeControllerDispatchResult {
    const operation = options.controller.operation?.kind === "fallenvshake" ? options.controller.operation : undefined;
    options.recordController?.(options.actor, options.controller.source);
    const hitFall = options.actor.runtime.hitFall;
    const event = options.envShakeWorld.emitFall(options.actor, options.runtimeTick);
    if (!event || !hitFall) {
      return {
        event,
        clearedFallEnvShake: false,
        recordedController: Boolean(options.recordController),
        recordedOperation: false,
      };
    }
    options.actor.runtime.hitFall = {
      ...hitFall,
      envShake: undefined,
    };
    if (operation) {
      options.recordOperation?.(options.actor, operation);
    }
    return {
      event,
      clearedFallEnvShake: true,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(operation && options.recordOperation),
    };
  }
}

export function calculateRuntimeCameraShake(
  runtimeTick: number,
  events: readonly RuntimeEnvShakeEvent[],
): RuntimeCameraShake | undefined {
  const activeEvents = events
    .map((event) => ({ event, age: runtimeTick - event.runtimeTick }))
    .filter(({ event, age }) => age >= 0 && age < event.time);
  if (activeEvents.length === 0) {
    return undefined;
  }

  const strongest = activeEvents.reduce((best, candidate) =>
    Math.abs(candidate.event.ampl) > Math.abs(best.event.ampl) ? candidate : best,
  );
  const { event, age } = strongest;
  const remaining = Math.max(0, event.time - age);
  const decay = remaining / Math.max(1, event.time);
  const amplitude = event.ampl * decay;
  const phase = event.phase + (age / Math.max(1, event.freq)) * Math.PI * 2;
  return {
    x: Math.cos(phase * 0.63) * amplitude * 0.35,
    y: Math.sin(phase) * amplitude,
    remaining,
    amplitude,
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

function clampShakeTime(value: number): number {
  return Math.max(0, Math.min(240, Math.round(value)));
}

function clampShakeFrequency(value: number): number {
  return Math.max(1, Math.min(180, Math.abs(value)));
}

function clampShakeAmplitude(value: number): number {
  return Math.max(-64, Math.min(64, value));
}

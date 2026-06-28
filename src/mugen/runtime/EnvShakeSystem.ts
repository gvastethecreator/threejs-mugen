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

export function createRuntimeEnvShakeEvent(
  actor: RuntimeEnvShakeActor,
  controller: MugenStateController,
  runtimeTick: number,
): RuntimeEnvShakeEvent | undefined {
  const time = clampShakeTime(firstNumber(findControllerParam(controller, "time")) ?? 0);
  if (time <= 0) {
    return undefined;
  }
  return {
    type: "EnvShake",
    time,
    freq: clampShakeFrequency(firstNumber(findControllerParam(controller, "freq")) ?? 60),
    ampl: clampShakeAmplitude(firstNumber(findControllerParam(controller, "ampl")) ?? -4),
    phase: firstNumber(findControllerParam(controller, "phase")) ?? 0,
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
  emitController(actor: RuntimeEnvShakeWorldActor, controller: MugenStateController, runtimeTick: number): RuntimeEnvShakeEvent | undefined {
    const event = createRuntimeEnvShakeEvent(actor, controller, runtimeTick);
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

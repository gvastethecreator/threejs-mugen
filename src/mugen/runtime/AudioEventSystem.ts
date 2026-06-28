import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeSoundEvent } from "./types";

export type RuntimeSoundActor = {
  runtime: {
    stateNo: number;
  };
  stateElapsed: number;
};

export type RuntimeAudioWorldActor = RuntimeSoundActor & {
  soundEvents: RuntimeSoundEvent[];
};

export function createRuntimeSoundEvent(
  actor: RuntimeSoundActor,
  controller: MugenStateController,
  runtimeTick: number,
): RuntimeSoundEvent {
  const parsed = parseMugenSoundValue(findControllerParam(controller, "value"));
  return {
    type: soundEventType(controller),
    group: parsed?.group,
    index: parsed?.index,
    channel: firstNumber(findControllerParam(controller, "channel")),
    raw: findControllerParam(controller, "value"),
    stateNo: actor.runtime.stateNo,
    tick: actor.stateElapsed,
    runtimeTick,
  };
}

export function pushRuntimeSoundEvent(events: RuntimeSoundEvent[], event: RuntimeSoundEvent, maxEvents = 8): void {
  events.unshift(event);
  events.splice(maxEvents);
}

export class RuntimeAudioWorld {
  emitController(actor: RuntimeAudioWorldActor, controller: MugenStateController, runtimeTick: number): RuntimeSoundEvent {
    const event = createRuntimeSoundEvent(actor, controller, runtimeTick);
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }

  emitHitDefSound(actor: RuntimeAudioWorldActor, sound: string | undefined, runtimeTick: number): RuntimeSoundEvent | undefined {
    if (!sound) {
      return undefined;
    }
    const parsed = parseMugenSoundValue(sound);
    const event: RuntimeSoundEvent = {
      type: "PlaySnd",
      group: parsed?.group,
      index: parsed?.index,
      raw: sound,
      stateNo: actor.runtime.stateNo,
      tick: actor.stateElapsed,
      runtimeTick,
    };
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }
}

export function parseMugenSoundValue(value: string | undefined): { group: number; index: number } | undefined {
  if (!value) {
    return undefined;
  }
  const match = /^\s*S?\s*(-?\d+)\s*,\s*(-?\d+)/i.exec(value);
  if (!match || match[1] === undefined || match[2] === undefined) {
    return undefined;
  }
  return { group: Number(match[1]), index: Number(match[2]) };
}

function soundEventType(controller: MugenStateController): RuntimeSoundEvent["type"] {
  return controller.type.toLowerCase() === "stopsnd" ? "StopSnd" : "PlaySnd";
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

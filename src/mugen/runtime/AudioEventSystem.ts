import type { AudioControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeHitDefContactMetadata, RuntimeSoundEvent } from "./types";

export type RuntimeSoundActor = {
  runtime: {
    stateNo: number;
  };
  stateElapsed: number;
};

export type RuntimeAudioWorldActor = RuntimeSoundActor & {
  soundEvents: RuntimeSoundEvent[];
};

export type RuntimeAudioControllerDispatchOptions<TActor extends RuntimeAudioWorldActor> = {
  actor: TActor;
  controller: ControllerIr;
  runtimeTick: number;
  audioWorld: RuntimeAudioWorld;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: AudioControllerOp) => void;
};

export type RuntimeAudioControllerDispatchResult = {
  event: RuntimeSoundEvent;
  recordedController: boolean;
  recordedOperation: boolean;
};

export function createRuntimeSoundEvent(
  actor: RuntimeSoundActor,
  controller: MugenStateController,
  runtimeTick: number,
  operation?: AudioControllerOp,
): RuntimeSoundEvent {
  const rawValue = operation?.value ?? findControllerParam(controller, "value");
  const parsed = parseMugenSoundValue(rawValue);
  return {
    type: operation ? operationSoundEventType(operation) : soundEventType(controller),
    group: parsed?.group,
    index: parsed?.index,
    channel: operation?.channel ?? firstNumber(findControllerParam(controller, "channel")),
    raw: rawValue,
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
  emitController(
    actor: RuntimeAudioWorldActor,
    controller: MugenStateController,
    runtimeTick: number,
    operation?: AudioControllerOp,
  ): RuntimeSoundEvent {
    const event = createRuntimeSoundEvent(actor, controller, runtimeTick, operation);
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }

  emitHitDefSound(
    actor: RuntimeAudioWorldActor,
    sound: string | undefined,
    runtimeTick: number,
    contact?: RuntimeHitDefContactMetadata,
  ): RuntimeSoundEvent | undefined {
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
      ...(contact ? { contactId: contact.contactId, contactTick: contact.contactTick, contactKind: contact.contactKind } : {}),
    };
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }
}

export class RuntimeAudioControllerDispatchWorld {
  apply<TActor extends RuntimeAudioWorldActor>(
    options: RuntimeAudioControllerDispatchOptions<TActor>,
  ): RuntimeAudioControllerDispatchResult {
    const operation = options.controller.operation?.kind === "audio" ? options.controller.operation : undefined;
    options.recordController?.(options.actor, options.controller.source);
    if (operation) {
      options.recordOperation?.(options.actor, operation);
    }
    const event = options.audioWorld.emitController(options.actor, options.controller.source, options.runtimeTick, operation);
    return {
      event,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(operation && options.recordOperation),
    };
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

function operationSoundEventType(operation: AudioControllerOp): RuntimeSoundEvent["type"] {
  return operation.controllerType === "stopsnd" ? "StopSnd" : "PlaySnd";
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

import type { AudioControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeHitDefContactMetadata, RuntimeResolvedSoundRef, RuntimeSoundEvent } from "./types";

export type RuntimeSoundActor = {
  runtime: {
    stateNo: number;
  };
  definition?: {
    fightFxPrefix?: string;
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
  resolveAudio?: RuntimeAudioParamResolver;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: AudioControllerOp) => void;
};

export type RuntimeAudioParamResolver = {
  resolveNumber: (key: "channel" | "lowpriority" | "volumescale" | "volume" | "freqmul" | "loop" | "pan" | "abspan") => number | undefined;
  resolveSoundValue?: (key: "value") => RuntimeResolvedSoundValue | undefined;
};

export type RuntimeResolvedSoundValue = RuntimeResolvedSoundRef;

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
  resolveAudio?: RuntimeAudioParamResolver,
): RuntimeSoundEvent {
  const rawValue = operation?.value ?? findControllerParam(controller, "value");
  const parsed = parseMugenSoundRef(rawValue) ?? resolveAudio?.resolveSoundValue?.("value");
  const lowPriority = operation?.lowPriority ?? booleanParam(controller, resolveAudio, "lowpriority");
  const volumeScale = operation?.volumeScale ?? numberParam(controller, resolveAudio, "volumescale");
  const legacyVolume = operation?.legacyVolume ?? numberParam(controller, resolveAudio, "volume");
  const freqMul = operation?.freqMul ?? numberParam(controller, resolveAudio, "freqmul");
  const loop = operation?.loop ?? booleanParam(controller, resolveAudio, "loop");
  const pan = operation?.pan ?? numberParam(controller, resolveAudio, "pan");
  const absPan = operation?.absPan ?? numberParam(controller, resolveAudio, "abspan");
  return {
    type: operation ? operationSoundEventType(operation) : soundEventType(controller),
    group: parsed?.group,
    index: parsed?.index,
    channel: operation?.channel ?? numberParam(controller, resolveAudio, "channel"),
    ...(lowPriority !== undefined ? { lowPriority } : {}),
    ...(volumeScale !== undefined ? { volumeScale } : {}),
    ...(legacyVolume !== undefined ? { legacyVolume } : {}),
    ...(freqMul !== undefined ? { freqMul } : {}),
    ...(loop !== undefined ? { loop } : {}),
    ...(pan !== undefined ? { pan } : {}),
    ...(absPan !== undefined ? { absPan } : {}),
    raw: rawValue,
    ...soundPrefixMetadata(actor, parsed?.rawPrefix),
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
    resolveAudio?: RuntimeAudioParamResolver,
  ): RuntimeSoundEvent {
    const event = createRuntimeSoundEvent(actor, controller, runtimeTick, operation, resolveAudio);
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }

  emitHitDefSound(
    actor: RuntimeAudioWorldActor,
    sound: string | undefined,
    runtimeTick: number,
    contact?: RuntimeHitDefContactMetadata,
    resolvedSound?: RuntimeResolvedSoundRef,
  ): RuntimeSoundEvent | undefined {
    if (!sound && !resolvedSound) {
      return undefined;
    }
    const parsed = parseMugenSoundRef(sound) ?? resolvedSound;
    const event: RuntimeSoundEvent = {
      type: "PlaySnd",
      group: parsed?.group,
      index: parsed?.index,
      raw: sound,
      ...soundPrefixMetadata(actor, parsed?.rawPrefix),
      stateNo: actor.runtime.stateNo,
      tick: actor.stateElapsed,
      runtimeTick,
      ...(contact ? { contactId: contact.contactId, contactTick: contact.contactTick, contactKind: contact.contactKind } : {}),
    };
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }

  emitSuperPauseSound(
    actor: RuntimeAudioWorldActor,
    sound: string | undefined,
    runtimeTick: number,
    resolvedSound?: RuntimeResolvedSoundRef,
  ): RuntimeSoundEvent | undefined {
    if (!sound && !resolvedSound) {
      return undefined;
    }
    const parsed = parseMugenSoundRef(sound) ?? resolvedSound;
    const event: RuntimeSoundEvent = {
      type: "PlaySnd",
      group: parsed?.group,
      index: parsed?.index,
      raw: sound,
      ...soundPrefixMetadata(actor, parsed?.rawPrefix),
      stateNo: actor.runtime.stateNo,
      tick: actor.stateElapsed,
      runtimeTick,
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
    const event = options.audioWorld.emitController(
      options.actor,
      options.controller.source,
      options.runtimeTick,
      operation,
      options.resolveAudio,
    );
    return {
      event,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(operation && options.recordOperation),
    };
  }
}

export function parseMugenSoundValue(value: string | undefined): { group: number; index: number } | undefined {
  const parsed = parseMugenSoundRef(value);
  return parsed ? { group: parsed.group, index: parsed.index } : undefined;
}

function parseMugenSoundRef(value: string | undefined): { rawPrefix?: "F" | "S"; group: number; index: number } | undefined {
  if (!value) {
    return undefined;
  }
  const match = /^\s*([FS])?\s*(-?\d+)\s*,\s*(-?\d+)/i.exec(value);
  if (!match || match[2] === undefined || match[3] === undefined) {
    return undefined;
  }
  const rawPrefix = match[1]?.toUpperCase() as "F" | "S" | undefined;
  return { ...(rawPrefix ? { rawPrefix } : {}), group: Number(match[2]), index: Number(match[3]) };
}

function soundPrefixMetadata(
  actor: RuntimeSoundActor,
  rawPrefix: "F" | "S" | undefined,
): Pick<RuntimeSoundEvent, "soundPrefix"> {
  if (rawPrefix !== "F") {
    return {};
  }
  return { soundPrefix: actor.definition?.fightFxPrefix ?? "f" };
}

function soundEventType(controller: MugenStateController): RuntimeSoundEvent["type"] {
  const type = controller.type.toLowerCase();
  if (type === "stopsnd") {
    return "StopSnd";
  }
  if (type === "sndpan") {
    return "SndPan";
  }
  return "PlaySnd";
}

function operationSoundEventType(operation: AudioControllerOp): RuntimeSoundEvent["type"] {
  if (operation.controllerType === "stopsnd") {
    return "StopSnd";
  }
  if (operation.controllerType === "sndpan") {
    return "SndPan";
  }
  return "PlaySnd";
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function numberParam(
  controller: MugenStateController,
  resolveAudio: RuntimeAudioParamResolver | undefined,
  key: Parameters<RuntimeAudioParamResolver["resolveNumber"]>[0],
): number | undefined {
  return firstNumber(findControllerParam(controller, key)) ?? resolveAudio?.resolveNumber(key);
}

function booleanParam(
  controller: MugenStateController,
  resolveAudio: RuntimeAudioParamResolver | undefined,
  key: "lowpriority" | "loop",
): boolean | undefined {
  const numberValue = numberParam(controller, resolveAudio, key);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

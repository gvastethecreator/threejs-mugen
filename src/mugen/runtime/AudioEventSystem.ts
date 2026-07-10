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
  const sourceRawValue = findControllerParam(controller, "value");
  const operationRawValue = operation?.value;
  const parsedOperationRaw = parseMugenSoundRef(operationRawValue);
  const parsedSourceRaw = parseMugenSoundRef(sourceRawValue);
  const rawValue =
    sourceRawValue !== undefined && parsedSourceRaw === undefined && parsedOperationRaw !== undefined
      ? sourceRawValue
      : operationRawValue ?? sourceRawValue;
  const parsed = parsedOperationRaw ?? parsedSourceRaw ?? resolveAudio?.resolveSoundValue?.("value");
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
  emitKoSound(actor: RuntimeAudioWorldActor, runtimeTick: number): RuntimeSoundEvent {
    const event: RuntimeSoundEvent = {
      type: "PlaySnd",
      group: 11,
      index: 0,
      raw: "11,0",
      soundPrefix: "f",
      stateNo: actor.runtime.stateNo,
      tick: actor.stateElapsed,
      runtimeTick,
    };
    pushRuntimeSoundEvent(actor.soundEvents, event);
    return event;
  }

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
      ...soundPrefixMetadata(actor, parsed?.rawPrefix, "common"),
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
      ...soundPrefixMetadata(actor, parsed?.rawPrefix, "common"),
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
    const operation =
      options.controller.operation?.kind === "audio"
        ? options.controller.operation
        : resolveRuntimeAudioControllerOperation(options.controller.source, options.resolveAudio);
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

export function resolveRuntimeAudioControllerOperation(
  controller: MugenStateController,
  resolveAudio?: RuntimeAudioParamResolver,
): AudioControllerOp | undefined {
  const controllerType = audioControllerType(controller);
  if (!controllerType) {
    return undefined;
  }

  const operation: AudioControllerOp = {
    kind: "audio",
    controllerType,
  };
  const value = controllerType === "playsnd" ? resolvedSoundValueParam(controller, resolveAudio) : undefined;
  const channel = numberParam(controller, resolveAudio, "channel");
  const lowPriority = controllerType === "playsnd" ? booleanParam(controller, resolveAudio, "lowpriority") : undefined;
  const volumeScale = controllerType === "playsnd" ? numberParam(controller, resolveAudio, "volumescale") : undefined;
  const legacyVolume = controllerType === "playsnd" ? numberParam(controller, resolveAudio, "volume") : undefined;
  const freqMul = controllerType === "playsnd" ? numberParam(controller, resolveAudio, "freqmul") : undefined;
  const loop = controllerType === "playsnd" ? booleanParam(controller, resolveAudio, "loop") : undefined;
  const pan = controllerType === "playsnd" || controllerType === "sndpan" ? numberParam(controller, resolveAudio, "pan") : undefined;
  const absPan =
    controllerType === "playsnd" || controllerType === "sndpan" ? numberParam(controller, resolveAudio, "abspan") : undefined;

  if (value !== undefined) operation.value = value;
  if (channel !== undefined) operation.channel = channel;
  if (lowPriority !== undefined) operation.lowPriority = lowPriority;
  if (volumeScale !== undefined) operation.volumeScale = volumeScale;
  if (legacyVolume !== undefined) operation.legacyVolume = legacyVolume;
  if (freqMul !== undefined) operation.freqMul = freqMul;
  if (loop !== undefined) operation.loop = loop;
  if (pan !== undefined) operation.pan = pan;
  if (absPan !== undefined) operation.absPan = absPan;

  if (controllerType === "playsnd" && value === undefined) {
    return undefined;
  }
  if (controllerType === "sndpan" && channel === undefined && pan === undefined && absPan === undefined) {
    return undefined;
  }
  if (controllerType === "stopsnd" && channel === undefined) {
    return undefined;
  }
  return operation;
}

export function parseMugenSoundValue(value: string | undefined): { group: number; index: number } | undefined {
  const parsed = parseMugenSoundRef(value);
  return parsed ? { group: parsed.group, index: parsed.index } : undefined;
}

function audioControllerType(controller: MugenStateController): AudioControllerOp["controllerType"] | undefined {
  const type = controller.type.toLowerCase();
  if (type === "playsnd" || type === "stopsnd" || type === "sndpan") {
    return type;
  }
  return undefined;
}

function resolvedSoundValueParam(
  controller: MugenStateController,
  resolveAudio: RuntimeAudioParamResolver | undefined,
): string | undefined {
  const rawValue = findControllerParam(controller, "value");
  const parsed = parseMugenSoundRef(rawValue);
  if (parsed) {
    return soundRefToString(parsed);
  }
  const resolved = resolveAudio?.resolveSoundValue?.("value");
  return resolved ? soundRefToString(resolved) : undefined;
}

function soundRefToString(ref: RuntimeResolvedSoundRef): string {
  return `${ref.rawPrefix ?? ""}${ref.group},${ref.index}`;
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
  unprefixedBank: "player" | "common" = "player",
): Pick<RuntimeSoundEvent, "soundPrefix"> {
  if (rawPrefix === "F") {
    return { soundPrefix: actor.definition?.fightFxPrefix ?? "f" };
  }
  if (rawPrefix === undefined && unprefixedBank === "common") {
    return { soundPrefix: "f" };
  }
  return {};
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
  const rawValue = findControllerParam(controller, key);
  if (rawValue === undefined) {
    return undefined;
  }
  return firstNumber(rawValue) ?? resolveAudio?.resolveNumber(key);
}

function booleanParam(
  controller: MugenStateController,
  resolveAudio: RuntimeAudioParamResolver | undefined,
  key: "lowpriority" | "loop",
): boolean | undefined {
  const numberValue = numberParam(controller, resolveAudio, key);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

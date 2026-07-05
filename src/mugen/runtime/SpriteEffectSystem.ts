import type { SpriteEffectControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState, RuntimeAfterImageSample } from "./types";

export type RuntimeAfterImageSampleFactory = () => RuntimeAfterImageSample | undefined;

export type RuntimeAngleSpriteEffectOp =
  | Extract<SpriteEffectControllerOp, { controllerType: "angleset" }>
  | Extract<SpriteEffectControllerOp, { controllerType: "angleadd" }>
  | Extract<SpriteEffectControllerOp, { controllerType: "angledraw" }>;

export type RuntimeRemapPalPairResolver = (key: "source" | "dest") => [number, number] | undefined;
export type RuntimeSpritePriorityResolver = (key: "value" | "priority") => number | undefined;

export type RuntimeSpriteEffectControllerEffect =
  | "sprpriority"
  | "palfx"
  | "remappal"
  | "afterimage"
  | "afterimagetime"
  | "trans"
  | "angle";

export type RuntimeSpriteEffectControllerActor = {
  runtime: CharacterRuntimeState;
};

export type RuntimeSpriteEffectControllerApplyInput<TActor extends RuntimeSpriteEffectControllerActor> = {
  actor: TActor;
  controller: ControllerIr;
  effect: RuntimeSpriteEffectControllerEffect;
  spriteEffectWorld: RuntimeSpriteEffectWorld;
  sampleFactory: RuntimeAfterImageSampleFactory;
  resolveRemapPalPair?: RuntimeRemapPalPairResolver;
  resolveSpritePriority?: RuntimeSpritePriorityResolver;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: SpriteEffectControllerOp) => void;
};

export type RuntimeSpriteEffectControllerApplyResult = {
  applied: boolean;
  recordedController: boolean;
  recordedOperation: boolean;
};

export class RuntimeSpriteEffectWorld {
  applySpritePriority(
    state: CharacterRuntimeState,
    controller: MugenStateController,
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "sprpriority" }>,
    resolvePriority?: RuntimeSpritePriorityResolver,
  ): void {
    applyRuntimeSpritePriorityController(state, controller, operation, resolvePriority);
  }

  applyPaletteFx(
    state: CharacterRuntimeState,
    controller: MugenStateController,
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "palfx" }>,
  ): void {
    applyRuntimePaletteFxController(state, controller, operation);
  }

  applyRemapPal(
    state: CharacterRuntimeState,
    controller: { params: Record<string, string> },
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "remappal" }>,
    resolvePair?: RuntimeRemapPalPairResolver,
  ): void {
    applyRuntimeRemapPalController(state, controller, operation, resolvePair);
  }

  applyAfterImage(
    state: CharacterRuntimeState,
    controller: MugenStateController,
    sampleFactory: RuntimeAfterImageSampleFactory,
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimage" }>,
  ): void {
    applyRuntimeAfterImageController(state, controller, sampleFactory, operation);
  }

  applyAfterImageTime(
    state: CharacterRuntimeState,
    controller: MugenStateController,
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimagetime" }>,
  ): void {
    applyRuntimeAfterImageTimeController(state, controller, operation);
  }

  applyTrans(
    state: CharacterRuntimeState,
    controller: { params: Record<string, string> },
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "trans" }>,
  ): void {
    applyRuntimeTransController(state, controller, operation);
  }

  applyAngle(
    state: CharacterRuntimeState,
    controller: { type: string; params: Record<string, string> },
    operation?: RuntimeAngleSpriteEffectOp,
  ): void {
    applyRuntimeAngleController(state, controller, operation);
  }

  tick(state: CharacterRuntimeState, sampleFactory: RuntimeAfterImageSampleFactory): void {
    tickRuntimePaletteFx(state);
    tickRuntimeAfterImage(state, sampleFactory);
  }
}

export class RuntimeSpriteEffectControllerWorld {
  apply<TActor extends RuntimeSpriteEffectControllerActor>(
    input: RuntimeSpriteEffectControllerApplyInput<TActor>,
  ): RuntimeSpriteEffectControllerApplyResult {
    const operation = spriteEffectOperationFor(input.effect, input.controller.operation);
    input.recordController?.(input.actor, input.controller.source);
    if (operation) {
      input.recordOperation?.(input.actor, operation);
    }

    if (input.effect === "sprpriority") {
      input.spriteEffectWorld.applySpritePriority(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "sprpriority" ? operation : undefined,
        input.resolveSpritePriority,
      );
    } else if (input.effect === "palfx") {
      input.spriteEffectWorld.applyPaletteFx(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "palfx" ? operation : undefined,
      );
    } else if (input.effect === "remappal") {
      input.spriteEffectWorld.applyRemapPal(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "remappal" ? operation : undefined,
        input.resolveRemapPalPair,
      );
    } else if (input.effect === "afterimage") {
      input.spriteEffectWorld.applyAfterImage(
        input.actor.runtime,
        input.controller.source,
        input.sampleFactory,
        operation?.controllerType === "afterimage" ? operation : undefined,
      );
    } else if (input.effect === "afterimagetime") {
      input.spriteEffectWorld.applyAfterImageTime(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "afterimagetime" ? operation : undefined,
      );
    } else if (input.effect === "trans") {
      input.spriteEffectWorld.applyTrans(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "trans" ? operation : undefined,
      );
    } else {
      input.spriteEffectWorld.applyAngle(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "angleset" ||
          operation?.controllerType === "angleadd" ||
          operation?.controllerType === "angledraw"
          ? operation
          : undefined,
      );
    }

    return {
      applied: true,
      recordedController: Boolean(input.recordController),
      recordedOperation: Boolean(operation && input.recordOperation),
    };
  }
}

export function isRuntimeSpriteEffectControllerEffect(effect: string): effect is RuntimeSpriteEffectControllerEffect {
  return (
    effect === "sprpriority" ||
    effect === "palfx" ||
    effect === "remappal" ||
    effect === "afterimage" ||
    effect === "afterimagetime" ||
    effect === "trans" ||
    effect === "angle"
  );
}

export function applyRuntimeSpritePriorityController(
  state: CharacterRuntimeState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "sprpriority" }>,
  resolvePriority?: RuntimeSpritePriorityResolver,
): void {
  const valueParam = findControllerParam(controller, "value");
  const priorityParam = findControllerParam(controller, "priority");
  const priority =
    operation?.priority ??
    (valueParam === undefined ? undefined : resolvePriority?.("value")) ??
    (priorityParam === undefined ? undefined : resolvePriority?.("priority")) ??
    firstNumber(valueParam ?? priorityParam);
  if (priority === undefined) {
    return;
  }
  state.spritePriority = Math.max(-5, Math.min(10, Math.round(priority)));
}

export function applyRuntimePaletteFxController(
  state: CharacterRuntimeState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "palfx" }>,
): void {
  const time = operation?.time ?? clampFxTime(firstNumber(findControllerParam(controller, "time")) ?? 0);
  if (time <= 0) {
    state.paletteFx = undefined;
    return;
  }
  state.paletteFx = {
    remaining: time,
    time,
    add: operation?.add ?? colorTriplet(findControllerParam(controller, "add"), [0, 0, 0], -255, 255),
    mul: operation?.mul ?? colorTriplet(findControllerParam(controller, "mul"), [256, 256, 256], 0, 512),
    color: operation?.color ?? clampColorLevel(firstNumber(findControllerParam(controller, "color")) ?? 256),
    invert:
      operation?.invert ??
      (firstNumber(findControllerParam(controller, "invertall")) ??
        firstNumber(findControllerParam(controller, "invert"))) === 1,
  };
}

export function applyRuntimeRemapPalController(
  state: CharacterRuntimeState,
  controller: { params: Record<string, string> },
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "remappal" }>,
  resolvePair?: RuntimeRemapPalPairResolver,
): void {
  const source = operation?.source ?? resolvePair?.("source") ?? palettePair(findControllerParam(controller, "source"));
  const dest = operation?.dest ?? resolvePair?.("dest") ?? palettePair(findControllerParam(controller, "dest"));
  if (!source || !dest) {
    return;
  }
  state.paletteRemap = {
    source: normalizePalettePair(source),
    dest: normalizePalettePair(dest),
  };
}

export function tickRuntimePaletteFx(state: CharacterRuntimeState): void {
  if (!state.paletteFx) {
    return;
  }
  state.paletteFx.remaining -= 1;
  if (state.paletteFx.remaining <= 0) {
    state.paletteFx = undefined;
  }
}

export function applyRuntimeAfterImageController(
  state: CharacterRuntimeState,
  controller: MugenStateController,
  sampleFactory: RuntimeAfterImageSampleFactory,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimage" }>,
): void {
  const time = operation?.time ?? clampAfterImageTime(firstNumber(findControllerParam(controller, "time")) ?? 20);
  if (time <= 0) {
    state.afterImage = undefined;
    return;
  }
  state.afterImage = {
    remaining: time,
    time,
    length: operation?.length ?? clampAfterImageLength(firstNumber(findControllerParam(controller, "length")) ?? 6),
    timeGap: operation?.timeGap ?? clampAfterImageGap(firstNumber(findControllerParam(controller, "timegap")) ?? 1),
    frameGap: operation?.frameGap ?? clampAfterImageGap(firstNumber(findControllerParam(controller, "framegap")) ?? 1),
    palAdd:
      operation?.palAdd ??
      colorTriplet(
        findControllerParam(controller, "paladd") ?? findControllerParam(controller, "add"),
        [0, 0, 0],
        -255,
        255,
      ),
    palMul:
      operation?.palMul ??
      colorTriplet(
        findControllerParam(controller, "palmul") ?? findControllerParam(controller, "mul"),
        [192, 192, 192],
        0,
        512,
      ),
    opacity: operation?.opacity ?? parseAfterImageOpacity(findControllerParam(controller, "trans")),
    elapsed: 0,
    samples: [],
  };
  captureRuntimeAfterImageSample(state, sampleFactory);
}

export function applyRuntimeAfterImageTimeController(
  state: CharacterRuntimeState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimagetime" }>,
): void {
  const time =
    operation?.time ??
    clampAfterImageTime(
      firstNumber(findControllerParam(controller, "time")) ?? firstNumber(findControllerParam(controller, "value")) ?? 0,
    );
  if (time <= 0) {
    state.afterImage = undefined;
    return;
  }
  if (!state.afterImage) {
    state.afterImage = {
      remaining: time,
      time,
      length: 6,
      timeGap: 1,
      frameGap: 1,
      palAdd: [0, 0, 0],
      palMul: [192, 192, 192],
      opacity: 0.42,
      elapsed: 0,
      samples: [],
    };
  }
  state.afterImage.remaining = time;
  state.afterImage.time = Math.max(state.afterImage.time, time);
}

export function applyRuntimeTransController(
  state: CharacterRuntimeState,
  controller: { params: Record<string, string> },
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "trans" }>,
): void {
  const trans = operation?.trans ?? stripMugenString(findControllerParam(controller, "trans") ?? findControllerParam(controller, "value")) ?? "default";
  state.renderOpacity = operation?.opacity ?? parseTransOpacity(trans);
}

export function applyRuntimeAngleController(
  state: CharacterRuntimeState,
  controller: { type: string; params: Record<string, string> },
  operation?: RuntimeAngleSpriteEffectOp,
): void {
  const type = operation?.controllerType ?? controller.type.toLowerCase();
  if (type === "angleset") {
    const angle = operation?.controllerType === "angleset" ? operation.angle : firstNumber(findControllerParam(controller, "value"));
    if (angle !== undefined) {
      state.angle = clampRenderAngle(angle);
    }
    return;
  }
  if (type === "angleadd") {
    const delta = operation?.controllerType === "angleadd" ? operation.delta : firstNumber(findControllerParam(controller, "value"));
    if (delta !== undefined) {
      state.angle = clampRenderAngle((state.angle ?? 0) + delta);
    }
    return;
  }
  if (type === "angledraw") {
    state.renderAngle = clampRenderAngle(state.angle ?? 0);
  }
}

export function tickRuntimeAfterImage(
  state: CharacterRuntimeState,
  sampleFactory: RuntimeAfterImageSampleFactory,
): void {
  const effect = state.afterImage;
  if (!effect) {
    return;
  }
  effect.remaining -= 1;
  effect.elapsed += 1;
  for (const sample of effect.samples) {
    sample.age += 1;
  }
  if (effect.remaining <= 0) {
    state.afterImage = undefined;
    return;
  }
  if (effect.elapsed % effect.timeGap === 0) {
    captureRuntimeAfterImageSample(state, sampleFactory);
  }
}

export function captureRuntimeAfterImageSample(
  state: CharacterRuntimeState,
  sampleFactory: RuntimeAfterImageSampleFactory,
): void {
  const effect = state.afterImage;
  const sample = sampleFactory();
  if (!effect || !sample) {
    return;
  }
  effect.samples.unshift(sample);
  effect.samples.splice(effect.length);
}

function spriteEffectOperationFor(
  effect: RuntimeSpriteEffectControllerEffect,
  operation: ControllerIr["operation"],
): SpriteEffectControllerOp | undefined {
  if (operation?.kind !== "sprite-effect") {
    return undefined;
  }
  if (effect === "angle") {
    return operation.controllerType === "angleset" ||
      operation.controllerType === "angleadd" ||
      operation.controllerType === "angledraw"
      ? operation
      : undefined;
  }
  return operation.controllerType === effect ? operation : undefined;
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function palettePair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length < 2 || parts[0] === undefined || parts[1] === undefined) {
    return undefined;
  }
  if (!Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
    return undefined;
  }
  return [parts[0]!, parts[1]!];
}

function normalizePalettePair(pair: [number, number]): [number, number] {
  return [Math.max(0, Math.round(pair[0])), Math.max(0, Math.round(pair[1]))];
}

function clampFxTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampColorLevel(value: number): number {
  return Math.max(0, Math.min(256, Math.round(value)));
}

function clampAfterImageTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampAfterImageLength(value: number): number {
  return Math.max(1, Math.min(24, Math.round(value)));
}

function clampAfterImageGap(value: number): number {
  return Math.max(1, Math.min(30, Math.round(value)));
}

function colorTriplet(
  value: string | undefined,
  fallback: [number, number, number],
  min: number,
  max: number,
): [number, number, number] {
  if (!value) {
    return fallback;
  }
  const numbers = value.split(",").map((part) => Number(part.trim()));
  if (numbers.length < 3 || numbers.some((numberValue) => !Number.isFinite(numberValue))) {
    return fallback;
  }
  return [
    clampNumber(numbers[0]!, min, max),
    clampNumber(numbers[1]!, min, max),
    clampNumber(numbers[2]!, min, max),
  ];
}

function parseAfterImageOpacity(value: string | undefined): number {
  if (!value) {
    return 0.42;
  }
  const lower = value.toLowerCase();
  if (lower.includes("add")) {
    return 0.34;
  }
  if (lower.includes("none")) {
    return 0.25;
  }
  return 0.42;
}

function parseTransOpacity(value: string): number {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "default" || normalized === "none") {
    return 1;
  }
  if (normalized.includes("addalpha") || normalized.includes("alpha")) {
    const numbers = normalized
      .split(/[^0-9.-]+/)
      .filter((part) => part.length > 0)
      .map((part) => Number(part))
      .filter(Number.isFinite);
    const source = numbers[0];
    return source === undefined ? 0.5 : clampNumber(source / 256, 0, 1);
  }
  if (normalized.includes("add")) {
    return 0.78;
  }
  if (normalized.includes("sub")) {
    return 0.65;
  }
  return 1;
}

function clampRenderAngle(value: number): number {
  return Math.max(-720, Math.min(720, Math.round(value * 1000) / 1000));
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

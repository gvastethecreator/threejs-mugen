import type { SpriteEffectControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState, RuntimeAfterImageSample } from "./types";

export type RuntimeAfterImageSampleFactory = () => RuntimeAfterImageSample | undefined;

export function applyRuntimeSpritePriorityController(
  state: CharacterRuntimeState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "sprpriority" }>,
): void {
  const priority = operation?.priority ?? firstNumber(findControllerParam(controller, "value") ?? findControllerParam(controller, "priority"));
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

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
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

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

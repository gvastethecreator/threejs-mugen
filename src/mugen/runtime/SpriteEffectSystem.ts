import type { SpriteEffectControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState, RuntimeAfterImageSample } from "./types";

export type RuntimeAfterImageSampleFactory = () => RuntimeAfterImageSample | undefined;

export type RuntimeAngleSpriteEffectOp =
  | Extract<SpriteEffectControllerOp, { controllerType: "angleset" }>
  | Extract<SpriteEffectControllerOp, { controllerType: "angleadd" }>
  | Extract<SpriteEffectControllerOp, { controllerType: "anglemul" }>
  | Extract<SpriteEffectControllerOp, { controllerType: "angledraw" }>;

export type RuntimeRemapPalPairResolver = (key: "source" | "dest") => [number, number] | undefined;
export type RuntimeSpritePriorityResolver = (key: "value" | "priority") => number | undefined;
export type RuntimeTransAlphaResolver = (key: "alpha") => [number, number] | undefined;
export type RuntimePaletteFxResolver = {
  resolveNumber: (key: "time" | "color" | "invertall" | "invert") => number | undefined;
  resolveTriplet: (key: "add" | "mul") => [number, number, number] | undefined;
};
export type RuntimeAfterImageResolver = {
  resolveNumber: (key: "time" | "length" | "timegap" | "framegap") => number | undefined;
  resolveTriplet: (key: "paladd" | "palmul" | "add" | "mul") => [number, number, number] | undefined;
};
export type RuntimeAfterImageTimeResolver = (key: "time" | "value") => number | undefined;
export type RuntimeAngleResolver = {
  resolveNumber: (key: "value") => number | undefined;
  resolvePair: (key: "scale") => [number, number] | undefined;
};

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
  resolveTransAlpha?: RuntimeTransAlphaResolver;
  resolvePaletteFx?: RuntimePaletteFxResolver;
  resolveAfterImage?: RuntimeAfterImageResolver;
  resolveAfterImageTime?: RuntimeAfterImageTimeResolver;
  resolveAngle?: RuntimeAngleResolver;
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
    resolvePaletteFx?: RuntimePaletteFxResolver,
  ): void {
    applyRuntimePaletteFxController(state, controller, operation, resolvePaletteFx);
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
    resolveAfterImage?: RuntimeAfterImageResolver,
  ): void {
    applyRuntimeAfterImageController(state, controller, sampleFactory, operation, resolveAfterImage);
  }

  applyAfterImageTime(
    state: CharacterRuntimeState,
    controller: MugenStateController,
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimagetime" }>,
    resolveAfterImageTime?: RuntimeAfterImageTimeResolver,
  ): void {
    applyRuntimeAfterImageTimeController(state, controller, operation, resolveAfterImageTime);
  }

  applyTrans(
    state: CharacterRuntimeState,
    controller: { params: Record<string, string> },
    operation?: Extract<SpriteEffectControllerOp, { controllerType: "trans" }>,
    resolveAlpha?: RuntimeTransAlphaResolver,
  ): void {
    applyRuntimeTransController(state, controller, operation, resolveAlpha);
  }

  applyAngle(
    state: CharacterRuntimeState,
    controller: { type: string; params: Record<string, string> },
    operation?: RuntimeAngleSpriteEffectOp,
    resolveAngle?: RuntimeAngleResolver,
  ): void {
    applyRuntimeAngleController(state, controller, operation, resolveAngle);
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
    const operation = spriteEffectOperationFor(input.effect, input.controller.operation) ?? resolvedSpriteEffectOperationFor(input);
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
        input.resolvePaletteFx,
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
        input.resolveAfterImage,
      );
    } else if (input.effect === "afterimagetime") {
      input.spriteEffectWorld.applyAfterImageTime(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "afterimagetime" ? operation : undefined,
        input.resolveAfterImageTime,
      );
    } else if (input.effect === "trans") {
      input.spriteEffectWorld.applyTrans(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "trans" ? operation : undefined,
        input.resolveTransAlpha,
      );
    } else {
      input.spriteEffectWorld.applyAngle(
        input.actor.runtime,
        input.controller.source,
        operation?.controllerType === "angleset" ||
          operation?.controllerType === "angleadd" ||
          operation?.controllerType === "anglemul" ||
          operation?.controllerType === "angledraw"
          ? operation
          : undefined,
        input.resolveAngle,
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
  const priority = operation?.priority ?? resolveRuntimeSpritePriorityControllerOperation(controller, resolvePriority)?.priority;
  if (priority === undefined) {
    return;
  }
  state.spritePriority = clampSpritePriority(priority);
}

export function resolveRuntimeSpritePriorityControllerOperation(
  controller: MugenStateController,
  resolvePriority?: RuntimeSpritePriorityResolver,
): Extract<SpriteEffectControllerOp, { controllerType: "sprpriority" }> | undefined {
  const valueParam = findControllerParam(controller, "value");
  const priorityParam = findControllerParam(controller, "priority");
  const priority =
    (valueParam === undefined ? undefined : resolvePriority?.("value")) ??
    (priorityParam === undefined ? undefined : resolvePriority?.("priority")) ??
    firstNumber(valueParam ?? priorityParam);
  if (priority === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "sprpriority",
    priority: clampSpritePriority(priority),
  };
}

export function applyRuntimePaletteFxController(
  state: CharacterRuntimeState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "palfx" }>,
  resolvePaletteFx?: RuntimePaletteFxResolver,
): void {
  const timeParam = findControllerParam(controller, "time");
  const addParam = findControllerParam(controller, "add");
  const mulParam = findControllerParam(controller, "mul");
  const colorParam = findControllerParam(controller, "color");
  const invertAllParam = findControllerParam(controller, "invertall");
  const invertParam = findControllerParam(controller, "invert");
  const time =
    operation?.time ??
    resolvePaletteFxNumber(timeParam, "time", resolvePaletteFx, clampFxTime) ??
    clampFxTime(firstNumber(timeParam) ?? 0);
  if (time <= 0) {
    state.paletteFx = undefined;
    return;
  }
  state.paletteFx = {
    remaining: time,
    time,
    add:
      operation?.add ??
      clampColorTriplet(addParam === undefined ? undefined : resolvePaletteFx?.resolveTriplet("add"), -255, 255) ??
      colorTriplet(addParam, [0, 0, 0], -255, 255),
    mul:
      operation?.mul ??
      clampColorTriplet(mulParam === undefined ? undefined : resolvePaletteFx?.resolveTriplet("mul"), 0, 512) ??
      colorTriplet(mulParam, [256, 256, 256], 0, 512),
    color:
      operation?.color ??
      resolvePaletteFxNumber(colorParam, "color", resolvePaletteFx, clampColorLevel) ??
      clampColorLevel(firstNumber(colorParam) ?? 256),
    invert:
      operation?.invert ??
      (invertAllParam === undefined ? undefined : legacyBoolean(resolvePaletteFx?.resolveNumber("invertall"))) ??
      (invertParam === undefined ? undefined : legacyBoolean(resolvePaletteFx?.resolveNumber("invert"))) ??
      (firstNumber(invertAllParam) ?? firstNumber(invertParam)) === 1,
  };
}

export function applyRuntimeRemapPalController(
  state: CharacterRuntimeState,
  controller: { params: Record<string, string> },
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "remappal" }>,
  resolvePair?: RuntimeRemapPalPairResolver,
): void {
  const resolvedOperation = operation ?? resolveRuntimeRemapPalControllerOperation(controller, resolvePair);
  const source =
    resolvedOperation?.source ??
    normalizePalettePair(resolvePair?.("source") ?? palettePair(findControllerParam(controller, "source")));
  const dest =
    resolvedOperation?.dest ??
    normalizePalettePair(resolvePair?.("dest") ?? palettePair(findControllerParam(controller, "dest")));
  if (!source || !dest) {
    return;
  }
  state.paletteRemap = {
    source,
    dest,
  };
}

export function resolveRuntimeRemapPalControllerOperation(
  controller: { params: Record<string, string> },
  resolvePair?: RuntimeRemapPalPairResolver,
): Extract<SpriteEffectControllerOp, { controllerType: "remappal" }> | undefined {
  const sourceParam = findControllerParam(controller, "source");
  const destParam = findControllerParam(controller, "dest");
  const source = normalizePalettePair(
    (sourceParam === undefined ? undefined : resolvePair?.("source")) ?? palettePair(sourceParam),
  );
  const dest = normalizePalettePair(
    (destParam === undefined ? undefined : resolvePair?.("dest")) ?? palettePair(destParam),
  );
  if (!source || !dest) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "remappal",
    source,
    dest,
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
  resolveAfterImage?: RuntimeAfterImageResolver,
): void {
  const timeParam = findControllerParam(controller, "time");
  const lengthParam = findControllerParam(controller, "length");
  const timeGapParam = findControllerParam(controller, "timegap");
  const frameGapParam = findControllerParam(controller, "framegap");
  const palAddParam = findControllerParam(controller, "paladd") ?? findControllerParam(controller, "add");
  const palMulParam = findControllerParam(controller, "palmul") ?? findControllerParam(controller, "mul");
  const time =
    operation?.time ??
    resolveAfterImageNumber(timeParam, "time", resolveAfterImage, clampAfterImageTime) ??
    clampAfterImageTime(firstNumber(timeParam) ?? 20);
  if (time <= 0) {
    state.afterImage = undefined;
    return;
  }
  state.afterImage = {
    remaining: time,
    time,
    length:
      operation?.length ??
      resolveAfterImageNumber(lengthParam, "length", resolveAfterImage, clampAfterImageLength) ??
      clampAfterImageLength(firstNumber(lengthParam) ?? 6),
    timeGap:
      operation?.timeGap ??
      resolveAfterImageNumber(timeGapParam, "timegap", resolveAfterImage, clampAfterImageGap) ??
      clampAfterImageGap(firstNumber(timeGapParam) ?? 1),
    frameGap:
      operation?.frameGap ??
      resolveAfterImageNumber(frameGapParam, "framegap", resolveAfterImage, clampAfterImageGap) ??
      clampAfterImageGap(firstNumber(frameGapParam) ?? 1),
    palAdd:
      operation?.palAdd ??
      clampColorTriplet(
        palAddParam === undefined
          ? undefined
          : resolveAfterImage?.resolveTriplet(findControllerParam(controller, "paladd") === undefined ? "add" : "paladd"),
        -255,
        255,
      ) ??
      colorTriplet(palAddParam, [0, 0, 0], -255, 255),
    palMul:
      operation?.palMul ??
      clampColorTriplet(
        palMulParam === undefined
          ? undefined
          : resolveAfterImage?.resolveTriplet(findControllerParam(controller, "palmul") === undefined ? "mul" : "palmul"),
        0,
        512,
      ) ??
      colorTriplet(palMulParam, [192, 192, 192], 0, 512),
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
  resolveAfterImageTime?: RuntimeAfterImageTimeResolver,
): void {
  const resolvedOperation =
    operation ?? resolveRuntimeAfterImageTimeControllerOperation(controller, resolveAfterImageTime);
  const timeParam = findControllerParam(controller, "time");
  const valueParam = findControllerParam(controller, "value");
  const time =
    resolvedOperation?.time ??
    resolveAfterImageTimeNumber(
      timeParam === undefined ? valueParam : timeParam,
      timeParam === undefined ? "value" : "time",
      resolveAfterImageTime,
    ) ??
    clampAfterImageTime(firstNumber(timeParam) ?? firstNumber(valueParam) ?? 0);
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

export function resolveRuntimeAfterImageTimeControllerOperation(
  controller: MugenStateController,
  resolveAfterImageTime?: RuntimeAfterImageTimeResolver,
): Extract<SpriteEffectControllerOp, { controllerType: "afterimagetime" }> | undefined {
  const timeParam = findControllerParam(controller, "time");
  const valueParam = findControllerParam(controller, "value");
  const param = timeParam === undefined ? valueParam : timeParam;
  const key = timeParam === undefined ? "value" : "time";
  const time = resolveAfterImageTimeNumber(param, key, resolveAfterImageTime) ?? staticAfterImageTimeNumber(param);
  if (time === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "afterimagetime",
    time,
  };
}

export function applyRuntimeTransController(
  state: CharacterRuntimeState,
  controller: { params: Record<string, string> },
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "trans" }>,
  resolveAlpha?: RuntimeTransAlphaResolver,
): void {
  const trans = operation?.trans ?? stripMugenString(findControllerParam(controller, "trans") ?? findControllerParam(controller, "value")) ?? "default";
  state.renderOpacity =
    operation?.opacity ?? parseTransOpacity(trans, findControllerParam(controller, "alpha"), resolveAlpha);
}

export function resolveRuntimeTransControllerOperation(
  controller: MugenStateController,
  resolveAlpha?: RuntimeTransAlphaResolver,
): Extract<SpriteEffectControllerOp, { controllerType: "trans" }> | undefined {
  const trans = stripMugenString(findControllerParam(controller, "trans") ?? findControllerParam(controller, "value")) ?? "default";
  const alphaParam = findControllerParam(controller, "alpha");
  const resolvedAlpha = alphaParam === undefined ? undefined : normalizeTransAlpha(resolveAlpha?.("alpha"));
  const staticAlpha = alphaParam === undefined ? undefined : transAlphaPair(alphaParam);
  if (requiresResolvedTransAlpha(trans, alphaParam) && resolvedAlpha === undefined && staticAlpha === undefined) {
    return undefined;
  }
  if (alphaParam === undefined && hasInvalidInlineTransAlpha(trans)) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "trans",
    trans,
    opacity: parseTransOpacity(trans, alphaParam, () => resolvedAlpha ?? staticAlpha),
  };
}

export function applyRuntimeAngleController(
  state: CharacterRuntimeState,
  controller: { type: string; params: Record<string, string> },
  operation?: RuntimeAngleSpriteEffectOp,
  resolveAngle?: RuntimeAngleResolver,
): void {
  const type = operation?.controllerType ?? controller.type.toLowerCase();
  if (type === "angleset") {
    const valueParam = findControllerParam(controller, "value");
    const angle =
      operation?.controllerType === "angleset"
        ? operation.angle
        : resolveAngleNumber(valueParam, resolveAngle) ?? firstNumber(valueParam);
    if (angle !== undefined) {
      state.angle = clampRenderAngle(angle);
    }
    return;
  }
  if (type === "angleadd") {
    const valueParam = findControllerParam(controller, "value");
    const delta =
      operation?.controllerType === "angleadd"
        ? operation.delta
        : resolveAngleNumber(valueParam, resolveAngle) ?? firstNumber(valueParam);
    if (delta !== undefined) {
      state.angle = clampRenderAngle((state.angle ?? 0) + delta);
    }
    return;
  }
  if (type === "anglemul") {
    const valueParam = findControllerParam(controller, "value");
    const multiplier =
      operation?.controllerType === "anglemul"
        ? operation.multiplier
        : resolveAngleNumber(valueParam, resolveAngle) ?? firstNumber(valueParam);
    if (multiplier !== undefined && Number.isFinite(multiplier)) {
      state.angle = clampRenderAngle((state.angle ?? 0) * multiplier);
    }
    return;
  }
  if (type === "angledraw") {
    const valueParam = findControllerParam(controller, "value");
    const scaleParam = findControllerParam(controller, "scale");
    const angle =
      operation?.controllerType === "angledraw"
        ? operation.angle
        : resolveAngleNumber(valueParam, resolveAngle) ?? firstNumber(valueParam);
    const scale =
      operation?.controllerType === "angledraw"
        ? operation.scale
        : resolveAngleScale(scaleParam, resolveAngle) ?? numberPair(scaleParam);
    state.renderAngle = clampRenderAngle(angle ?? state.angle ?? 0);
    state.renderScale = scale === undefined ? undefined : pairToRenderScale(scale);
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
      operation.controllerType === "anglemul" ||
      operation.controllerType === "angledraw"
      ? operation
      : undefined;
  }
  return operation.controllerType === effect ? operation : undefined;
}

function resolvedSpriteEffectOperationFor<TActor extends RuntimeSpriteEffectControllerActor>(
  input: RuntimeSpriteEffectControllerApplyInput<TActor>,
): SpriteEffectControllerOp | undefined {
  if (input.effect === "sprpriority") {
    return resolveRuntimeSpritePriorityControllerOperation(input.controller.source, input.resolveSpritePriority);
  }
  if (input.effect === "remappal") {
    return resolveRuntimeRemapPalControllerOperation(input.controller.source, input.resolveRemapPalPair);
  }
  if (input.effect === "trans") {
    return resolveRuntimeTransControllerOperation(input.controller.source, input.resolveTransAlpha);
  }
  if (input.effect === "afterimagetime") {
    return resolveRuntimeAfterImageTimeControllerOperation(input.controller.source, input.resolveAfterImageTime);
  }
  return undefined;
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function clampSpritePriority(value: number): number {
  return Math.max(-5, Math.min(10, Math.round(value)));
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

function numberPair(value: string | undefined): [number, number] | undefined {
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

function normalizePalettePair(pair: [number, number] | undefined): [number, number] | undefined {
  if (!pair || pair.some((numberValue) => !Number.isFinite(numberValue))) {
    return undefined;
  }
  return [Math.max(0, Math.round(pair[0])), Math.max(0, Math.round(pair[1]))];
}

function clampFxTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampColorLevel(value: number): number {
  return Math.max(0, Math.min(256, Math.round(value)));
}

function resolvePaletteFxNumber(
  param: string | undefined,
  key: "time" | "color" | "invertall" | "invert",
  resolver: RuntimePaletteFxResolver | undefined,
  clamp: (value: number) => number,
): number | undefined {
  if (param === undefined) {
    return undefined;
  }
  const value = resolver?.resolveNumber(key);
  return value === undefined || !Number.isFinite(value) ? undefined : clamp(value);
}

function legacyBoolean(value: number | undefined): boolean | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value === 1;
}

function clampAfterImageTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function staticAfterImageTimeNumber(param: string | undefined): number | undefined {
  const value = firstNumber(param);
  return value === undefined ? undefined : clampAfterImageTime(value);
}

function clampAfterImageLength(value: number): number {
  return Math.max(1, Math.min(24, Math.round(value)));
}

function clampAfterImageGap(value: number): number {
  return Math.max(1, Math.min(30, Math.round(value)));
}

function resolveAfterImageNumber(
  param: string | undefined,
  key: "time" | "length" | "timegap" | "framegap",
  resolver: RuntimeAfterImageResolver | undefined,
  clamp: (value: number) => number,
): number | undefined {
  if (param === undefined) {
    return undefined;
  }
  const value = resolver?.resolveNumber(key);
  return value === undefined || !Number.isFinite(value) ? undefined : clamp(value);
}

function resolveAfterImageTimeNumber(
  param: string | undefined,
  key: "time" | "value",
  resolver: RuntimeAfterImageTimeResolver | undefined,
): number | undefined {
  if (param === undefined) {
    return undefined;
  }
  const value = resolver?.(key);
  return value === undefined || !Number.isFinite(value) ? undefined : clampAfterImageTime(value);
}

function resolveAngleNumber(param: string | undefined, resolver: RuntimeAngleResolver | undefined): number | undefined {
  if (param === undefined) {
    return undefined;
  }
  const value = resolver?.resolveNumber("value");
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

function resolveAngleScale(
  param: string | undefined,
  resolver: RuntimeAngleResolver | undefined,
): [number, number] | undefined {
  if (param === undefined) {
    return undefined;
  }
  const value = resolver?.resolvePair("scale");
  return value === undefined ? undefined : [clampRenderScale(value[0]), clampRenderScale(value[1])];
}

function pairToRenderScale(value: [number, number]): { x: number; y: number } {
  return {
    x: clampRenderScale(value[0]),
    y: clampRenderScale(value[1]),
  };
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

function clampColorTriplet(
  value: [number, number, number] | undefined,
  min: number,
  max: number,
): [number, number, number] | undefined {
  if (!value || value.some((numberValue) => !Number.isFinite(numberValue))) {
    return undefined;
  }
  return [
    clampNumber(value[0], min, max),
    clampNumber(value[1], min, max),
    clampNumber(value[2], min, max),
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

function parseTransOpacity(
  value: string,
  alphaValue?: string,
  resolveAlpha?: RuntimeTransAlphaResolver,
): number {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "default" || normalized === "none") {
    return 1;
  }
  if (normalized.includes("addalpha") || normalized.includes("alpha")) {
    const resolvedAlpha = alphaValue === undefined ? undefined : normalizeTransAlpha(resolveAlpha?.("alpha"));
    const sourceFromAlpha = resolvedAlpha?.[0] ?? transAlphaSource(alphaValue);
    const source = sourceFromAlpha ?? transInlineAlphaSource(normalized);
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

function transAlphaSource(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const source = Number(raw);
  return Number.isFinite(source) ? source : undefined;
}

function transInlineAlphaSource(value: string): number | undefined {
  const [, sourceRaw] = value.split(",");
  const source = Number(sourceRaw?.trim());
  return Number.isFinite(source) ? source : undefined;
}

function transAlphaPair(value: string | undefined): [number, number] | undefined {
  const values = value?.split(",").map((part) => Number(part.trim()));
  if (!values || values.length < 2 || values.some((item) => !Number.isFinite(item))) {
    return undefined;
  }
  return [Math.round(values[0]!), Math.round(values[1]!)];
}

function requiresResolvedTransAlpha(trans: string, alphaValue: string | undefined): boolean {
  const normalized = trans.trim().toLowerCase();
  return alphaValue !== undefined && (normalized.includes("addalpha") || normalized.includes("alpha"));
}

function hasInvalidInlineTransAlpha(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized.includes("addalpha") && !normalized.includes("alpha")) {
    return false;
  }
  const [, ...alphaParts] = normalized.split(",");
  return alphaParts.some((part) => {
    const trimmed = part.trim();
    return trimmed.length > 0 && !Number.isFinite(Number(trimmed));
  });
}

function normalizeTransAlpha(value: [number, number] | undefined): [number, number] | undefined {
  if (!value || value.some((numberValue) => !Number.isFinite(numberValue))) {
    return undefined;
  }
  return [Math.round(value[0]), Math.round(value[1])];
}

function clampRenderAngle(value: number): number {
  return Math.max(-720, Math.min(720, Math.round(value * 1000) / 1000));
}

function clampRenderScale(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0.05, Math.min(8, Math.abs(value)));
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

import type { MugenSprite } from "../../mugen/model/MugenSprite";
import type { MugenStageBgCtrl, MugenStageLayer } from "../../mugen/model/MugenStage";
import type { StageSnapshot } from "../../mugen/runtime/types";

export type StageSpritePlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
  uv?: StageSpritePlacementUv;
};

export type StageSpritePlacementUv = {
  u1: number;
  v1: number;
  u2: number;
  v2: number;
};

export type StageLayerClipRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type StageLayerScale = {
  x: number;
  y: number;
};

export function projectStageSpriteLayer(
  layer: MugenStageLayer,
  sprite: MugenSprite,
  stage: StageSnapshot,
  viewportWidth: number,
): StageSpritePlacement[] {
  const scale = resolveStageLayerScale(layer, stage);
  const width = sprite.width * scale.x;
  const height = sprite.height * scale.y;
  if (width <= 0 || height <= 0) {
    return [];
  }
  const centerX = projectStageSpriteX(layer, sprite, stage, scale);
  const centerY = projectStageSpriteY(layer, sprite, stage, scale);
  const base: StageSpritePlacement = {
    x: centerX,
    y: centerY,
    width,
    height,
  };

  if (!layer.tile || (layer.tile.x === 0 && layer.tile.y === 0)) {
    return clipStagePlacements([base], layer, stage);
  }

  const xStep = Math.max(1, width + (layer.tile.spacingX ?? 0) * scale.x);
  const yStep = Math.max(1, height + (layer.tile.spacingY ?? 0) * scale.y);
  const cameraX = stage.camera.x;
  const left = cameraX - viewportWidth;
  const right = cameraX + viewportWidth;
  const xOffsets = layer.tile.x === 0 ? [0] : boundedTileOffsets(centerX, xStep, left, right);
  const yOffsets = layer.tile.y === 0 ? [0] : boundedTileOffsets(centerY, yStep, -height * 2, height * 3);

  return clipStagePlacements(
    xOffsets.flatMap((xOffset) =>
      yOffsets.map((yOffset) => ({
        ...base,
        x: centerX + xOffset,
        y: centerY + yOffset,
      })),
    ),
    layer,
    stage,
  );
}

export function resolveStageLayerForTick(layer: MugenStageLayer, stage: StageSnapshot, tick: number): MugenStageLayer | undefined {
  const controllers = stage.bgControllers?.flatMap((group) => group.controllers) ?? [];
  const targetedControllers = controllers.filter((controller) => targetsLayer(controller, layer));
  const motionControllers = targetedControllers.filter((controller) => isMotionController(controller.type));
  let resolved = motionControllers.length > 0
    ? resolveStageMotion(layer, motionControllers, tick)
    : { ...layer };
  const enabledControllers = controllers.filter((controller) =>
    controller.type.toLowerCase() === "enabled" && targetsLayer(controller, layer),
  );
  for (const controller of controllers) {
    if (!targetsLayer(controller, layer) || !isControllerActive(controller, tick) || isMotionController(controller.type)) {
      continue;
    }
    const next = applyStageBgController(resolved, controller, tick);
    if (!next) {
      return undefined;
    }
    resolved = next;
  }
  if (enabledControllers.length > 0) {
    resolved.animationTick = countEnabledTicks(enabledControllers, tick);
  }
  return resolved;
}

function isMotionController(type: string): boolean {
  return ["velset", "veladd", "posset", "posadd"].includes(type.toLowerCase());
}

function resolveStageMotion(
  layer: MugenStageLayer,
  controllers: readonly MugenStageBgCtrl[],
  tick: number,
): MugenStageLayer {
  const safeTick = Math.max(0, Math.trunc(tick));
  const simulationStart = stageMotionSimulationStart(controllers, safeTick);
  const baseY = layer.startY ?? 0;
  let x = layer.startX ?? layer.x ?? 0;
  let y = baseY;
  let velocityX = layer.velocity?.x ?? 0;
  let velocityY = layer.velocity?.y ?? 0;

  for (let cursor = simulationStart; cursor <= safeTick; cursor += 1) {
    for (const controller of controllers) {
      if (!isControllerActive(controller, cursor)) continue;
      const [valueX, valueY] = controllerPair(controller, ["x", "y", "value"], [Number.NaN, Number.NaN]);
      switch (controller.type.toLowerCase()) {
        case "velset":
          if (Number.isFinite(valueX)) velocityX = valueX;
          if (Number.isFinite(valueY)) velocityY = valueY;
          break;
        case "veladd":
          if (Number.isFinite(valueX)) velocityX += valueX;
          if (Number.isFinite(valueY)) velocityY += valueY;
          break;
        case "posset":
          if (Number.isFinite(valueX)) x = valueX;
          if (Number.isFinite(valueY)) y = valueY;
          break;
        case "posadd":
          if (Number.isFinite(valueX)) x += valueX;
          if (Number.isFinite(valueY)) y += valueY;
          break;
      }
    }
    x += velocityX;
    y += velocityY;
  }

  return {
    ...layer,
    x,
    startX: x,
    startY: y,
    y: layer.y - (y - baseY),
  };
}

function stageMotionSimulationStart(controllers: readonly MugenStageBgCtrl[], tick: number): number {
  const resetPeriods = controllers
    .map((controller) => positiveLoopTime(controller.timing.groupLoopTime ?? controller.timing.loopTime))
    .filter((period): period is number => period !== undefined);
  const firstPeriod = resetPeriods[0];
  if (firstPeriod === undefined || resetPeriods.some((period) => period !== firstPeriod)) {
    return 0;
  }
  return Math.floor(tick / firstPeriod) * firstPeriod;
}

function applyStageBgController(layer: MugenStageLayer, controller: MugenStageBgCtrl, tick: number): MugenStageLayer | undefined {
  const type = controller.type.toLowerCase();
  const elapsed = activeElapsedTicks(controller, tick);
  if (type === "null") {
    return layer;
  }
  if (type === "visible" || type === "enabled") {
    return firstControllerNumber(controller, ["value"]) === 0 ? undefined : layer;
  }
  if (type === "velset") {
    const [x, y] = controllerPair(controller, ["x", "y", "value"]);
    return offsetStageLayer(layer, x * elapsed, y * elapsed);
  }
  if (type === "veladd") {
    const [x, y] = controllerPair(controller, ["x", "y", "value"]);
    const displacement = (elapsed * (elapsed + 1)) / 2;
    return offsetStageLayer(layer, x * displacement, y * displacement);
  }
  if (type === "posset") {
    const [x, y] = controllerPair(controller, ["x", "y", "value"], [Number.NaN, Number.NaN]);
    return {
      ...layer,
      ...(Number.isFinite(x) ? { startX: x, x } : {}),
      ...(Number.isFinite(y) ? { startY: y } : {}),
    };
  }
  if (type === "posadd") {
    const [x, y] = controllerPair(controller, ["x", "y", "value"]);
    return offsetStageLayer(layer, x * elapsed, y * elapsed);
  }
  if (type === "anim") {
    const actionNo = firstControllerNumber(controller, ["value", "actionno", "anim"]);
    return actionNo === undefined ? layer : { ...layer, actionNo, type: "anim" };
  }
  if (type === "sinx" || type === "siny") {
    const [amplitude, period, phase] = controllerList(controller, "value", [0, 1, 0]);
    const safePeriod = Math.max(1, period ?? 1);
    const offset = (amplitude ?? 0) * Math.sin((((loopedTick(controller, tick) + (phase ?? 0)) % safePeriod) / safePeriod) * Math.PI * 2);
    return type === "sinx" ? offsetStageLayer(layer, offset, 0) : offsetStageLayer(layer, 0, offset);
  }
  return layer;
}

function targetsLayer(controller: MugenStageBgCtrl, layer: MugenStageLayer): boolean {
  if (!controller.ctrlIds?.length) {
    return true;
  }
  return layer.controlId !== undefined && controller.ctrlIds.includes(layer.controlId);
}

function isControllerActive(controller: MugenStageBgCtrl, tick: number): boolean {
  const localTick = loopedTick(controller, tick);
  const { start, end } = controller.timing;
  return (start < 0 || localTick >= start) && (end < 0 || localTick <= end);
}

function countEnabledTicks(controllers: readonly MugenStageBgCtrl[], tick: number): number {
  const safeTick = Math.max(0, Math.trunc(tick));
  let enabledTicks = 0;
  for (let cursor = 0; cursor <= safeTick; cursor += 1) {
    let enabled = true;
    for (const controller of controllers) {
      if (!isControllerActive(controller, cursor)) continue;
      const value = firstControllerNumber(controller, ["value"]);
      if (value !== undefined) enabled = value !== 0;
    }
    if (enabled) enabledTicks += 1;
  }
  return enabledTicks;
}

function activeElapsedTicks(controller: MugenStageBgCtrl, tick: number): number {
  if (!isControllerActive(controller, tick)) {
    return 0;
  }
  const localTick = loopedTick(controller, tick);
  return Math.max(1, localTick - Math.max(0, controller.timing.start) + 1);
}

function loopedTick(controller: MugenStageBgCtrl, tick: number): number {
  const safeTick = Math.max(0, Math.trunc(tick));
  const controllerLoopTime = positiveLoopTime(controller.timing.loopTime);
  const groupLoopTime = positiveLoopTime(controller.timing.groupLoopTime);
  if (controllerLoopTime && groupLoopTime && controllerLoopTime !== groupLoopTime) {
    const controllerReset = Math.floor(safeTick / controllerLoopTime) * controllerLoopTime;
    const groupReset = Math.floor(safeTick / groupLoopTime) * groupLoopTime;
    return safeTick - Math.max(controllerReset, groupReset);
  }
  const loopTime = controllerLoopTime ?? groupLoopTime;
  return loopTime === undefined ? safeTick : safeTick % loopTime;
}

function positiveLoopTime(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? Math.trunc(value) : undefined;
}

function offsetStageLayer(layer: MugenStageLayer, x: number, y: number): MugenStageLayer {
  const startX = layer.startX ?? layer.x ?? 0;
  const startY = layer.startY ?? 0;
  return {
    ...layer,
    x: (layer.x ?? startX) + x,
    startX: startX + x,
    startY: startY + y,
    y: layer.y - y,
  };
}

export function resolveStageLayerScale(layer: MugenStageLayer, stage: StageSnapshot): StageLayerScale {
  const scaleStart = layer.scaleStart ?? { x: 1, y: 1 };
  const scaleDelta = layer.scaleDelta ?? { x: 0, y: 0 };
  const deltaX = layer.deltaX ?? 1;
  const deltaY = layer.deltaY ?? 1;
  const cameraScale = {
    x: scaleStart.x + scaleDelta.x * stage.camera.x * deltaX,
    y: scaleStart.y + scaleDelta.y * stage.camera.y * deltaY,
  };
  const zoom = Number.isFinite(stage.camera.zoom) && stage.camera.zoom > 0 ? stage.camera.zoom : 1;
  const zoomScale = layer.zoomDelta
    ? {
        // The Three.js camera already applies the default zoomdelta=1 globally.
        x: Math.max(0, 1 + (zoom - 1) * layer.zoomDelta.x) / zoom,
        y: Math.max(0, 1 + (zoom - 1) * layer.zoomDelta.y) / zoom,
      }
    : { x: 1, y: 1 };
  return {
    x: Math.max(0, cameraScale.x * zoomScale.x),
    y: Math.max(0, cameraScale.y * zoomScale.y),
  };
}

function controllerPair(
  controller: MugenStageBgCtrl,
  keys: [string, string, string],
  fallback: [number, number] = [0, 0],
): [number, number] {
  const directX = parseControllerNumber(controller.params[keys[0]]);
  const directY = parseControllerNumber(controller.params[keys[1]]);
  if (directX !== undefined || directY !== undefined) {
    return [directX ?? fallback[0], directY ?? fallback[1]];
  }
  const value = controllerList(controller, keys[2]);
  return [value[0] ?? fallback[0], value[1] ?? fallback[1]];
}

function firstControllerNumber(controller: MugenStageBgCtrl, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = parseControllerNumber(getControllerParam(controller, key));
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function controllerList(controller: MugenStageBgCtrl, key: string, fallback: number[] = []): number[] {
  const value = getControllerParam(controller, key);
  if (!value) {
    return fallback;
  }
  const parsed = value
    .split(",")
    .map((part) => parseControllerNumber(part))
    .filter((part): part is number => part !== undefined);
  return parsed.length ? parsed : fallback;
}

function getControllerParam(controller: MugenStageBgCtrl, key: string): string | undefined {
  return Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase())?.[1];
}

function parseControllerNumber(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function projectStageSpriteX(layer: MugenStageLayer, sprite: MugenSprite, stage: StageSnapshot, scale: StageLayerScale): number {
  const startX = layer.startX ?? layer.x ?? 0;
  const deltaX = layer.deltaX ?? 1;
  return startX + (sprite.width / 2 - sprite.axisX) * scale.x + stage.camera.x * (1 - deltaX);
}

function projectStageSpriteY(layer: MugenStageLayer, sprite: MugenSprite, stage: StageSnapshot, scale: StageLayerScale): number {
  return (stage.zOffset ?? 200) - (layer.startY ?? 0) + (sprite.axisY - sprite.height / 2) * scale.y;
}

export function projectStageLayerClip(layer: Pick<MugenStageLayer, "clip">, stage: StageSnapshot): StageLayerClipRect | undefined {
  const clip = layer.clip;
  if (!clip) {
    return undefined;
  }
  const xOffset = (stage.camera.x ?? 0) * (clip.delta?.x ?? 0);
  const yOffset = (stage.camera.y ?? 0) * (clip.delta?.y ?? 0);
  const left = Math.min(clip.x1, clip.x2) + xOffset;
  const right = Math.max(clip.x1, clip.x2) + xOffset;
  const top = (stage.zOffset ?? 200) - Math.min(clip.y1, clip.y2) - yOffset;
  const bottom = (stage.zOffset ?? 200) - Math.max(clip.y1, clip.y2) - yOffset;
  if (right <= left || top <= bottom) {
    return undefined;
  }
  return { left, right, top, bottom };
}

export function clipStagePlacement(placement: StageSpritePlacement, clip: StageLayerClipRect): StageSpritePlacement | undefined {
  const left = placement.x - placement.width / 2;
  const right = placement.x + placement.width / 2;
  const bottom = placement.y - placement.height / 2;
  const top = placement.y + placement.height / 2;
  const clippedLeft = Math.max(left, clip.left);
  const clippedRight = Math.min(right, clip.right);
  const clippedBottom = Math.max(bottom, clip.bottom);
  const clippedTop = Math.min(top, clip.top);
  if (clippedRight <= clippedLeft || clippedTop <= clippedBottom) {
    return undefined;
  }
  const u1 = (clippedLeft - left) / placement.width;
  const u2 = (clippedRight - left) / placement.width;
  const v1 = (clippedBottom - bottom) / placement.height;
  const v2 = (clippedTop - bottom) / placement.height;
  return {
    x: (clippedLeft + clippedRight) / 2,
    y: (clippedBottom + clippedTop) / 2,
    width: clippedRight - clippedLeft,
    height: clippedTop - clippedBottom,
    uv: { u1, v1, u2, v2 },
  };
}

function clipStagePlacements(placements: StageSpritePlacement[], layer: MugenStageLayer, stage: StageSnapshot): StageSpritePlacement[] {
  const clip = projectStageLayerClip(layer, stage);
  if (!clip) {
    return placements;
  }
  return placements.map((placement) => clipStagePlacement(placement, clip)).filter((placement): placement is StageSpritePlacement => Boolean(placement));
}

function boundedTileOffsets(center: number, step: number, left: number, right: number): number[] {
  const min = Math.max(-24, Math.floor((left - center) / step) - 1);
  const max = Math.min(24, Math.ceil((right - center) / step) + 1);
  const offsets: number[] = [];
  for (let index = min; index <= max; index += 1) {
    offsets.push(index * step);
  }
  return offsets;
}

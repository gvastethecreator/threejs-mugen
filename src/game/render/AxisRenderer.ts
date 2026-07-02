import * as THREE from "three";
import type { MugenAnimationAction, MugenAnimationFrame } from "../../mugen/model/MugenAnimation";
import type { MugenSprite, SffArchive } from "../../mugen/model/MugenSprite";
import type { MugenStageLayerTrans } from "../../mugen/model/MugenStage";
import type { StageSnapshot } from "../../mugen/runtime/types";
import { TextureStore } from "./TextureStore";
import { projectStageSpriteLayer, resolveStageLayerForTick } from "./stageProjection";

export class AxisRenderer {
  readonly group = new THREE.Group();
  private readonly stageSprites = new Map<string, Map<string, MugenSprite>>();
  private readonly assetTextures = new Map<string, THREE.Texture>();
  private readonly assetLoader = new THREE.TextureLoader();
  private readonly materials = {
    backdrop: new THREE.MeshBasicMaterial({ color: "#111821", transparent: true, opacity: 1 }),
    farWall: new THREE.MeshBasicMaterial({ color: "#1b2530", transparent: true, opacity: 0.86 }),
    floorFill: new THREE.MeshBasicMaterial({ color: "#182027", transparent: true, opacity: 1 }),
    floor: new THREE.MeshBasicMaterial({ color: "#6b7280", transparent: true, opacity: 0.8 }),
    stageLimit: new THREE.MeshBasicMaterial({ color: "#e3b341", transparent: true, opacity: 0.5 }),
    axisX: new THREE.MeshBasicMaterial({ color: "#44c7b6", transparent: true, opacity: 0.9 }),
    axisY: new THREE.MeshBasicMaterial({ color: "#e3b341", transparent: true, opacity: 0.9 }),
    grid: new THREE.MeshBasicMaterial({ color: "#2d3542", transparent: true, opacity: 0.5 }),
  };

  constructor(private readonly textures: TextureStore) {}

  setStageSpriteArchives(archives: Array<{ stageId: string; archive?: SffArchive }>): void {
    this.stageSprites.clear();
    for (const { stageId, archive } of archives) {
      if (!archive?.sprites.length) {
        continue;
      }
      this.stageSprites.set(
        stageId,
        new Map(archive.sprites.map((sprite) => [spriteKey(sprite.group, sprite.index), sprite])),
      );
    }
  }

  update(options: { width: number; height: number; showAxis: boolean; showGrid: boolean; stage: StageSnapshot; tick: number }): void {
    this.clear();
    const stageWidth = Math.max(900, options.width * 2.4);
    const layers = options.stage.layers;
    if (layers?.length) {
      layers.forEach((layer, index) => {
        const controlledLayer = resolveStageLayerForTick(layer, options.stage, options.tick);
        if (!controlledLayer) {
          return;
        }
        const animatedFrame = getStageActionFrame(options.stage.animations?.get(controlledLayer.actionNo ?? Number.NaN), options.tick);
        const renderLayer = animatedFrame ? layerWithFrame(controlledLayer, animatedFrame) : controlledLayer;
        const sprite = this.getLayerSprite(options.stage.id, renderLayer.spriteGroup, renderLayer.spriteIndex);
        if (sprite) {
          for (const mesh of createStageSprites(renderLayer, sprite, options.stage, this.textures, index, stageWidth)) {
            this.group.add(mesh);
          }
          return;
        }
        if (renderLayer.assetUrl) {
          this.group.add(createAssetLayer(renderLayer, this.getAssetTexture(renderLayer.assetUrl), options.stage, index));
          return;
        }
        this.group.add(
          createRect(
            renderLayer.x ?? 0,
            renderLayer.y,
            Math.max(stageWidth, renderLayer.width),
            renderLayer.height,
            layerMaterial(renderLayer.color, renderLayer.opacity, renderLayer.trans),
            layerZ(renderLayer.layerNo, index),
          ),
        );
      });
    } else {
      this.group.add(createRect(0, 88, stageWidth, options.height * 2.2, this.materials.backdrop, -10));
      this.group.add(createRect(0, 64, stageWidth, 110, this.materials.farWall, -9));
      this.group.add(createRect(0, -42, stageWidth, 84, this.materials.floorFill, -8));
    }
    const left = options.stage.bounds?.left ?? -320;
    const right = options.stage.bounds?.right ?? 320;
    this.group.add(createRect(left, -42, 3, 84, this.materials.stageLimit, -2));
    this.group.add(createRect(right, -42, 3, 84, this.materials.stageLimit, -2));
    if (options.showGrid) {
      for (let x = -options.width; x <= options.width; x += 50) {
        this.group.add(createRect(x, 0, 1, options.height * 2, this.materials.grid, -1));
      }
      for (let y = -options.height; y <= options.height; y += 50) {
        this.group.add(createRect(0, y, options.width * 2, 1, this.materials.grid, -1));
      }
    }
    this.group.add(createRect(0, 0, stageWidth, 2, this.materials.floor, 0));
    if (options.showAxis) {
      this.group.add(createRect(0, 0, 100, 2, this.materials.axisX, 1));
      this.group.add(createRect(0, 40, 2, 80, this.materials.axisY, 1));
    }
  }

  dispose(): void {
    this.clear();
    this.assetTextures.forEach((texture) => texture.dispose());
    this.assetTextures.clear();
    Object.values(this.materials).forEach((material) => material.dispose());
  }

  private clear(): void {
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        disposeTransientMaterial(child.material, Object.values(this.materials));
      }
    }
  }

  private getLayerSprite(stageId: string | undefined, group: number | undefined, index: number | undefined): MugenSprite | undefined {
    if (!stageId || group === undefined || index === undefined) {
      return undefined;
    }
    return this.stageSprites.get(stageId)?.get(spriteKey(group, index));
  }

  private getAssetTexture(assetUrl: string): THREE.Texture {
    const existing = this.assetTextures.get(assetUrl);
    if (existing) {
      return existing;
    }
    const texture = this.assetLoader.load(assetUrl, () => {
      texture.userData.loaded = true;
      texture.needsUpdate = true;
    });
    texture.userData.loaded = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    this.assetTextures.set(assetUrl, texture);
    return texture;
  }
}

function layerWithFrame(
  layer: NonNullable<StageSnapshot["layers"]>[number],
  frame: MugenAnimationFrame,
): NonNullable<StageSnapshot["layers"]>[number] {
  return {
    ...layer,
    spriteGroup: frame.spriteGroup,
    spriteIndex: frame.spriteIndex,
    startX: (layer.startX ?? layer.x ?? 0) + frame.offsetX,
    startY: (layer.startY ?? 0) + frame.offsetY,
  };
}

function getStageActionFrame(action: MugenAnimationAction | undefined, tick: number): MugenAnimationFrame | undefined {
  if (!action || action.frames.length === 0) {
    return undefined;
  }
  const loopStart = action.loopStart === undefined ? 0 : Math.max(0, Math.min(action.loopStart, action.frames.length - 1));
  const headDuration = durationOf(action.frames.slice(0, loopStart));
  if (tick < headDuration) {
    return frameAtTick(action.frames.slice(0, loopStart), tick) ?? action.frames[0];
  }
  const loopFrames = action.frames.slice(loopStart);
  const loopDuration = durationOf(loopFrames);
  if (loopDuration <= 0) {
    return loopFrames[0] ?? action.frames[0];
  }
  return frameAtTick(loopFrames, (tick - headDuration) % loopDuration) ?? loopFrames[0] ?? action.frames[0];
}

function frameAtTick(frames: MugenAnimationFrame[], tick: number): MugenAnimationFrame | undefined {
  let cursor = 0;
  for (const frame of frames) {
    const duration = stageFrameDuration(frame);
    if (tick < cursor + duration) {
      return frame;
    }
    cursor += duration;
  }
  return frames.at(-1);
}

function durationOf(frames: MugenAnimationFrame[]): number {
  return frames.reduce((total, frame) => total + stageFrameDuration(frame), 0);
}

function stageFrameDuration(frame: MugenAnimationFrame): number {
  return Number.isFinite(frame.duration) && frame.duration > 0 ? Math.min(600, Math.round(frame.duration)) : 1;
}

function layerMaterial(color: string, opacity: number, trans?: MugenStageLayerTrans): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial(stageLayerMaterialParameters(color, opacity, trans));
}

export function stageLayerMaterialParameters(
  color: THREE.ColorRepresentation,
  opacity: number,
  trans?: MugenStageLayerTrans,
): THREE.MeshBasicMaterialParameters {
  const blending = stageLayerBlending(trans);
  const materialOpacity = stageLayerOpacity(opacity, trans);
  return {
    color,
    transparent: materialOpacity < 1 || blending !== THREE.NormalBlending,
    opacity: materialOpacity,
    blending,
    depthWrite: blending === THREE.NormalBlending,
  };
}

function createStageSprites(
  layer: NonNullable<StageSnapshot["layers"]>[number],
  sprite: MugenSprite,
  stage: StageSnapshot,
  textures: TextureStore,
  index: number,
  stageWidth: number,
): THREE.Mesh[] {
  const texture = textures.getTexture(sprite, `stage:${stage.id ?? "unknown"}`);
  return projectStageSpriteLayer(layer, sprite, stage, stageWidth).map((placement) =>
    createRect(
      placement.x,
      placement.y,
      placement.width,
      placement.height,
      new THREE.MeshBasicMaterial({
        ...stageLayerMaterialParameters(0xffffff, layer.opacity, layer.trans),
        transparent: true,
        map: texture,
      }),
      layerZ(layer.layerNo, index),
    ),
  );
}

function createAssetLayer(
  layer: NonNullable<StageSnapshot["layers"]>[number],
  texture: THREE.Texture,
  stage: StageSnapshot,
  index: number,
): THREE.Mesh {
  const deltaX = layer.deltaX ?? 1;
  const image = texture.image as { width?: number } | undefined;
  const textureLoaded = texture.userData.loaded === true || Boolean(image?.width);
  const materialOptions: THREE.MeshBasicMaterialParameters = {
    ...stageLayerMaterialParameters(textureLoaded ? 0xffffff : "#111821", textureLoaded ? layer.opacity : Math.min(layer.opacity, 0.96), layer.trans),
    transparent: true,
  };
  if (textureLoaded) {
    materialOptions.map = texture;
  }
  return createRect(
    (layer.x ?? 0) + stage.camera.x * (1 - deltaX),
    layer.y,
    layer.width,
    layer.height,
    new THREE.MeshBasicMaterial(materialOptions),
    layerZ(layer.layerNo, index),
  );
}

function layerZ(layerNo: number | undefined, index: number): number {
  const base = layerNo && layerNo > 0 ? -0.5 : -10;
  return base + index * 0.01;
}

function stageLayerOpacity(opacity: number, trans: MugenStageLayerTrans | undefined): number {
  const base = clamp01(opacity);
  if (trans?.mode === "addalpha") {
    const source = trans.alpha?.source;
    return base * (Number.isFinite(source) ? clamp01((source ?? 256) / 256) : 1);
  }
  if (trans?.mode === "none") {
    return base;
  }
  return base;
}

function stageLayerBlending(trans: MugenStageLayerTrans | undefined): THREE.Blending {
  if (!trans || trans.mode === "none") {
    return THREE.NormalBlending;
  }
  if (trans.mode === "sub") {
    return THREE.SubtractiveBlending;
  }
  return THREE.AdditiveBlending;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0, Math.min(1, value));
}

function spriteKey(group: number, index: number): string {
  return `${group}:${index}`;
}

function disposeTransientMaterial(material: THREE.Material | THREE.Material[], sharedMaterials: THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach((item) => disposeTransientMaterial(item, sharedMaterials));
    return;
  }
  if (!sharedMaterials.includes(material)) {
    material.dispose();
  }
}

export function createRect(
  x: number,
  y: number,
  width: number,
  height: number,
  material: THREE.Material,
  z = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.position.set(x, y, z);
  mesh.scale.set(width, height, 1);
  return mesh;
}

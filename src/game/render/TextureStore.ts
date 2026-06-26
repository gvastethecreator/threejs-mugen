import * as THREE from "three";
import type { MugenSprite } from "../../mugen/model/MugenSprite";

export class TextureStore {
  private readonly textures = new Map<string, THREE.CanvasTexture>();

  getTexture(sprite: MugenSprite, namespace = "default"): THREE.Texture {
    const key = `${namespace}:${sprite.group}:${sprite.index}:${textureSourceKey(sprite)}`;
    const existing = this.textures.get(key);
    if (existing) {
      return existing;
    }

    const canvas = sprite.canvas ?? createFallbackCanvas(sprite);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.textures.set(key, texture);
    return texture;
  }

  dispose(): void {
    for (const texture of this.textures.values()) {
      texture.dispose();
    }
    this.textures.clear();
  }
}

function textureSourceKey(sprite: MugenSprite): string {
  const raw = sprite.raw;
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (record.atlas) {
      const rect = record.rect as { x?: number; y?: number; w?: number; h?: number } | undefined;
      return `atlas:${String(record.rowName ?? "")}:${rect?.x ?? 0}:${rect?.y ?? 0}:${rect?.w ?? sprite.width}:${rect?.h ?? sprite.height}`;
    }
    if (record.mock) {
      return `mock:${sprite.width}x${sprite.height}`;
    }
  }
  return `canvas:${sprite.width}x${sprite.height}`;
}

function createFallbackCanvas(sprite: MugenSprite): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, sprite.width);
  canvas.height = Math.max(1, sprite.height);
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#8844aa";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

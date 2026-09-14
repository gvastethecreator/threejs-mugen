import * as THREE from "three";

export type RenderPaletteFx = {
  remaining: number;
  time: number;
  add: [number, number, number];
  mul: [number, number, number];
  color: number;
  invert: boolean;
};

/**
 * Decoded RGBA PalFX from Ikemen sprite.frag: invert, color (gray mix),
 * add, then mul. Channel values are 0..255. Identity is add 0, mul 256,
 * color 256, invert false. Duration is on/off; this function does not fade.
 */
export function transformPaletteFxRgba(
  red: number,
  green: number,
  blue: number,
  alpha: number,
  paletteFx: RenderPaletteFx,
): [number, number, number, number] {
  let r = red;
  let g = green;
  let b = blue;
  const a = alpha;
  if (paletteFx.invert) {
    r = a - r;
    g = a - g;
    b = a - b;
  }
  const color = clamp(paletteFx.color, 0, 256) / 256;
  const gray = (r + g + b) / 3;
  r = gray + (r - gray) * color;
  g = gray + (g - gray) * color;
  b = gray + (b - gray) * color;
  r += paletteFx.add[0];
  g += paletteFx.add[1];
  b += paletteFx.add[2];
  r = (r * paletteFx.mul[0]) / 256;
  g = (g * paletteFx.mul[1]) / 256;
  b = (b * paletteFx.mul[2]) / 256;
  return [r, g, b, a];
}

/** Local PalFX then AllPalFX. Sequential ticket-35 RGBA, not indexed LUT synthesize. */
export function composePaletteFxRgba(
  red: number,
  green: number,
  blue: number,
  alpha: number,
  local: RenderPaletteFx | undefined,
  global?: RenderPaletteFx,
): [number, number, number, number] {
  let color: [number, number, number, number] = [red, green, blue, alpha];
  if (local && local.remaining > 0) {
    color = transformPaletteFxRgba(color[0], color[1], color[2], color[3], local);
  }
  if (global && global.remaining > 0) {
    color = transformPaletteFxRgba(color[0], color[1], color[2], color[3], global);
  }
  return color;
}

/** Tint a stage-layer material with PalFX without changing blend or opacity. */
export function applyStageLayerPaletteFx(
  material: THREE.MeshBasicMaterial,
  paletteFx: RenderPaletteFx | undefined,
  globalPaletteFx?: RenderPaletteFx,
): void {
  const localOn = paletteFx && paletteFx.remaining > 0 ? paletteFx : undefined;
  const globalOn = globalPaletteFx && globalPaletteFx.remaining > 0 ? globalPaletteFx : undefined;
  bindPaletteFxMap(material, localOn, globalOn);
  if (material.map) {
    material.color.setRGB(1, 1, 1);
    return;
  }
  if (!localOn && !globalOn) {
    return;
  }
  const [red, green, blue] = composePaletteFxRgba(
    material.color.r * 255,
    material.color.g * 255,
    material.color.b * 255,
    255,
    localOn,
    globalOn,
  );
  material.color.setRGB(clamp01(red / 255), clamp01(green / 255), clamp01(blue / 255));
}

export function applyPaletteFxMaterial(
  material: THREE.MeshBasicMaterial,
  paletteFx: RenderPaletteFx | undefined,
  renderOpacity = 1,
  globalPaletteFx?: RenderPaletteFx,
): void {
  material.opacity = renderOpacity;
  material.transparent = true;
  const localOn = paletteFx && paletteFx.remaining > 0 ? paletteFx : undefined;
  const globalOn = globalPaletteFx && globalPaletteFx.remaining > 0 ? globalPaletteFx : undefined;
  bindPaletteFxMap(material, localOn, globalOn);
  if (readTextureRgba(material.map)) {
    delete material.userData.paletteFxAuthoredColor;
    material.color.setRGB(1, 1, 1);
    return;
  }
  const authored = (material.userData.paletteFxAuthoredColor as [number, number, number] | undefined) ?? [
    material.color.r,
    material.color.g,
    material.color.b,
  ];
  if (!localOn && !globalOn) {
    material.color.setRGB(authored[0], authored[1], authored[2]);
    delete material.userData.paletteFxAuthoredColor;
    return;
  }
  material.userData.paletteFxAuthoredColor = authored;
  const [red, green, blue] = composePaletteFxRgba(
    authored[0] * 255,
    authored[1] * 255,
    authored[2] * 255,
    255,
    localOn,
    globalOn,
  );
  material.color.setRGB(clamp01(red / 255), clamp01(green / 255), clamp01(blue / 255));
}

const paletteFxTextureCache = new WeakMap<THREE.Texture, { key: string; texture: THREE.DataTexture }>();

function bindPaletteFxMap(
  material: THREE.MeshBasicMaterial,
  localOn: RenderPaletteFx | undefined,
  globalOn: RenderPaletteFx | undefined,
): void {
  const source = (material.userData.paletteFxSource as THREE.Texture | undefined) ?? material.map ?? undefined;
  if (!source) {
    return;
  }
  material.userData.paletteFxSource = source;
  if (!localOn && !globalOn) {
    material.map = source;
    return;
  }
  material.map = paletteFxTexture(source, localOn, globalOn);
}

function paletteFxTexture(
  source: THREE.Texture,
  localOn: RenderPaletteFx | undefined,
  globalOn: RenderPaletteFx | undefined,
): THREE.Texture {
  const pixels = readTextureRgba(source);
  if (!pixels) {
    return source;
  }
  const key = JSON.stringify([localOn, globalOn]);
  const cached = paletteFxTextureCache.get(source);
  if (cached?.key === key) {
    return cached.texture;
  }
  cached?.texture.dispose();
  const dest = new Uint8Array(pixels.data.length);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const [red, green, blue, alpha] = composePaletteFxRgba(
      pixels.data[index]!,
      pixels.data[index + 1]!,
      pixels.data[index + 2]!,
      pixels.data[index + 3]!,
      localOn,
      globalOn,
    );
    dest[index] = toByte(red);
    dest[index + 1] = toByte(green);
    dest[index + 2] = toByte(blue);
    dest[index + 3] = toByte(alpha);
  }
  const texture = new THREE.DataTexture(dest, pixels.width, pixels.height);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.colorSpace = source.colorSpace;
  texture.magFilter = source.magFilter;
  texture.minFilter = source.minFilter;
  texture.wrapS = source.wrapS;
  texture.wrapT = source.wrapT;
  texture.needsUpdate = true;
  paletteFxTextureCache.set(source, { key, texture });
  return texture;
}

export function readTextureRgba(texture: THREE.Texture | null | undefined): {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
} | undefined {
  const image = texture?.image as
    | { data?: ArrayLike<number>; width?: number; height?: number }
    | HTMLCanvasElement
    | undefined;
  if (!image) {
    return undefined;
  }
  if (typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement) {
    const context = image.getContext("2d");
    if (!context) {
      return undefined;
    }
    const pixels = context.getImageData(0, 0, image.width, image.height);
    return { data: pixels.data, width: pixels.width, height: pixels.height };
  }
  if (image.data && image.width && image.height) {
    return {
      data: image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray
        ? image.data
        : Uint8Array.from(image.data),
      width: image.width,
      height: image.height,
    };
  }
  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

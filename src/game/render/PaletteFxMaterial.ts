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
  material.blending = THREE.NormalBlending;
  material.transparent = true;
  const localOn = paletteFx && paletteFx.remaining > 0 ? paletteFx : undefined;
  const globalOn = globalPaletteFx && globalPaletteFx.remaining > 0 ? globalPaletteFx : undefined;
  if (!localOn && !globalOn) {
    material.color.setRGB(1, 1, 1);
    return;
  }

  const [red, green, blue] = composePaletteFxRgba(255, 255, 255, 255, localOn, globalOn);
  material.color.setRGB(clamp01(red / 255), clamp01(green / 255), clamp01(blue / 255));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

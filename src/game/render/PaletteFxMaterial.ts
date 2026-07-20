import * as THREE from "three";

export type RenderPaletteFx = {
  remaining: number;
  time: number;
  add: [number, number, number];
  mul: [number, number, number];
  color: number;
  invert: boolean;
};

export function applyPaletteFxMaterial(
  material: THREE.MeshBasicMaterial,
  paletteFx: RenderPaletteFx | undefined,
  renderOpacity = 1,
): void {
  if (!paletteFx) {
    material.color.setRGB(1, 1, 1);
    material.opacity = renderOpacity;
    material.blending = THREE.NormalBlending;
    material.transparent = true;
    return;
  }

  const progress = paletteFx.time > 0 ? paletteFx.remaining / paletteFx.time : 1;
  const addTint = paletteFx.add.map((value) => Math.max(0, value) / 255) as [number, number, number];
  const mulTint = paletteFx.mul.map((value) => Math.max(0, value) / 256) as [number, number, number];
  const colorLevel = paletteFx.color / 256;
  const saturationLoss = (1 - colorLevel) * 0.25;
  const invertBoost = paletteFx.invert ? 0.35 : 0;
  material.color.setRGB(
    clamp01((mulTint[0] * (1 - saturationLoss) + addTint[0] * 0.42 + invertBoost) * progress + (1 - progress)),
    clamp01((mulTint[1] * (1 - saturationLoss) + addTint[1] * 0.42 + invertBoost) * progress + (1 - progress)),
    clamp01((mulTint[2] * (1 - saturationLoss) + addTint[2] * 0.42 + invertBoost) * progress + (1 - progress)),
  );
  material.opacity = clamp01((0.72 + progress * 0.28) * renderOpacity);
  material.blending = paletteFx.add.some((value) => value > 0) ? THREE.AdditiveBlending : THREE.NormalBlending;
  material.transparent = true;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

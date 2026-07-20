import { runtimeHitDefIsSuper } from "./DizzyPointsDefaults";
import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";

export const DEFAULT_RUNTIME_LIFE_TO_RED_LIFE_MUL = 0.75;
export const DEFAULT_RUNTIME_SUPER_LIFE_TO_RED_LIFE_MUL = 0.75;

export function runtimeRedLifeMultiplier(
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): number {
  const isSuper = runtimeHitDefIsSuper(attr);
  const key = isSuper ? "super.lifetoredlifemul" : "default.lifetoredlifemul";
  const fallback = isSuper ? DEFAULT_RUNTIME_SUPER_LIFE_TO_RED_LIFE_MUL : DEFAULT_RUNTIME_LIFE_TO_RED_LIFE_MUL;
  const value = constants?.[key];
  return Number.isFinite(value) ? value! : fallback;
}

import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";

export const DEFAULT_RUNTIME_LIFE_TO_DIZZY_POINTS_MUL = 1.8;
export const DEFAULT_RUNTIME_SUPER_LIFE_TO_DIZZY_POINTS_MUL = 0;

export function runtimeDizzyPointsFromHitDef(
  damage: number,
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): number {
  return -damage * runtimeDizzyPointsMultiplier(attr, constants);
}

export function runtimeDizzyPointsMultiplier(
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): number {
  const isSuper = runtimeHitDefIsSuper(attr);
  const key = isSuper ? "super.lifetodizzypointsmul" : "default.lifetodizzypointsmul";
  const fallback = isSuper ? DEFAULT_RUNTIME_SUPER_LIFE_TO_DIZZY_POINTS_MUL : DEFAULT_RUNTIME_LIFE_TO_DIZZY_POINTS_MUL;
  const value = constants?.[key];
  return Number.isFinite(value) ? value! : fallback;
}

export function runtimeHitDefIsSuper(attr: string | undefined): boolean {
  const moveType = attr
    ?.split(",")[1]
    ?.trim()
    .replace(/^"|"$/g, "")
    .toUpperCase();
  return moveType?.startsWith("H") ?? false;
}

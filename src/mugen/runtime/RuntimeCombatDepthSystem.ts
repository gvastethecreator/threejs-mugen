import type { RuntimeCombatDepth } from "./types";

export const DEFAULT_RUNTIME_SIZE_DEPTH: [number, number] = [3, 3];
export const DEFAULT_RUNTIME_ATTACK_DEPTH: [number, number] = [4, 4];

export function runtimeCombatLocalScale(localCoord?: readonly [number, number]): number {
  const width = localCoord?.[0];
  return typeof width === "number" && Number.isFinite(width) && width > 0 ? 320 / width : 1;
}

export function runtimeCombatDepthFromConstants(constants?: Record<string, number>): RuntimeCombatDepth {
  return {
    position: 0,
    size: constantDepthPair(constants, "size.depth", DEFAULT_RUNTIME_SIZE_DEPTH),
    attack: constantDepthPair(constants, "size.attack.depth", DEFAULT_RUNTIME_ATTACK_DEPTH),
  };
}

export function runtimeDepthRangesOverlap(
  leftPosition: number,
  leftDepth: readonly [number, number],
  rightPosition: number,
  rightDepth: readonly [number, number],
  leftScale = 1,
  rightScale = 1,
): boolean {
  const leftTop = (leftPosition - leftDepth[0]) * leftScale;
  const leftBottom = (leftPosition + leftDepth[1]) * leftScale;
  const rightTop = (rightPosition - rightDepth[0]) * rightScale;
  const rightBottom = (rightPosition + rightDepth[1]) * rightScale;
  return leftBottom >= rightTop && leftTop <= rightBottom;
}

export function hasRuntimeCombatDepthContact(input: {
  attacker: RuntimeCombatDepth | undefined;
  attackDepth: [number, number] | undefined;
  attackerLocalCoord?: readonly [number, number];
  getter: RuntimeCombatDepth | undefined;
  getterDepth: [number, number] | undefined;
  getterLocalCoord?: readonly [number, number];
}): boolean {
  if (!input.attacker || !input.getter || !input.attackDepth || !input.getterDepth) return true;
  return runtimeDepthRangesOverlap(
    input.attacker.position,
    input.attackDepth,
    input.getter.position,
    input.getterDepth,
    runtimeCombatLocalScale(input.attackerLocalCoord),
    runtimeCombatLocalScale(input.getterLocalCoord),
  );
}

function constantDepthPair(
  constants: Record<string, number> | undefined,
  key: string,
  fallback: readonly [number, number],
): [number, number] {
  const scalar = finite(constants?.[key]);
  const top = finite(constants?.[`${key}.top`]) ?? finite(constants?.[`${key}.x`]) ?? scalar ?? fallback[0];
  const bottom = finite(constants?.[`${key}.bottom`]) ?? finite(constants?.[`${key}.y`]) ?? scalar ?? fallback[1];
  return [top, bottom];
}

function finite(value: number | undefined): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}

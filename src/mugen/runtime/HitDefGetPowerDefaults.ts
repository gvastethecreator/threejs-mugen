import { parseHitAttribute } from "./CombatResolver";
import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";

export const DEFAULT_RUNTIME_ATTACK_LIFE_TO_POWER_MUL = 0.7;
export const DEFAULT_RUNTIME_SUPER_ATTACK_LIFE_TO_POWER_MUL = 0;
export const DEFAULT_RUNTIME_GETHIT_LIFE_TO_POWER_MUL = 0.6;
export const DEFAULT_RUNTIME_SUPER_GETHIT_LIFE_TO_POWER_MUL = 0.6;

export function runtimeHitDefGetPowerDefaults(
  damage: number,
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): { hit: number; guard: number } {
  const hit = Math.trunc(damage * runtimeHitDefAttackLifeToPowerMultiplier(attr, constants));
  return { hit, guard: Math.trunc(hit * 0.5) };
}

export function runtimeHitDefAttackLifeToPowerMultiplier(
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): number {
  const isSuper = runtimeHitDefUsesSuperPowerProfile(attr);
  const key = isSuper ? "super.attack.lifetopowermul" : "default.attack.lifetopowermul";
  const fallback = isSuper
    ? DEFAULT_RUNTIME_SUPER_ATTACK_LIFE_TO_POWER_MUL
    : DEFAULT_RUNTIME_ATTACK_LIFE_TO_POWER_MUL;
  const value = constants?.[key];
  return Number.isFinite(value) ? value! : fallback;
}

export function runtimeHitDefGivePowerDefaults(
  damage: number,
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): { hit: number; guard: number } {
  const hit = Math.trunc(damage * runtimeHitDefGetHitLifeToPowerMultiplier(attr, constants));
  return { hit, guard: Math.trunc(hit * 0.5) };
}

export function runtimeHitDefGetHitLifeToPowerMultiplier(
  attr: string | undefined,
  constants?: RuntimeResourceConstants,
): number {
  const isSuper = runtimeHitDefUsesSuperPowerProfile(attr);
  const key = isSuper ? "super.gethit.lifetopowermul" : "default.gethit.lifetopowermul";
  const fallback = isSuper
    ? DEFAULT_RUNTIME_SUPER_GETHIT_LIFE_TO_POWER_MUL
    : DEFAULT_RUNTIME_GETHIT_LIFE_TO_POWER_MUL;
  const value = constants?.[key];
  return Number.isFinite(value) ? value! : fallback;
}

function runtimeHitDefUsesSuperPowerProfile(attr: string | undefined): boolean {
  return [...parseHitAttribute(attr ?? "S,NA").types].some(
    (type) => type === "HA" || type === "HT" || type === "HP",
  );
}

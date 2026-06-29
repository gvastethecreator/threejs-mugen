import type { CharacterRuntimeState } from "./types";

export type RuntimeRandomAdvance = {
  seed: number;
  value: number;
};

export type RuntimeRandomFallbackInput = {
  state: Pick<CharacterRuntimeState, "stateNo" | "animNo" | "animTime">;
  variableIndex: number;
  lower: number;
  upper: number;
  stageTime?: number;
};

export function createRuntimeRandomSeed(actorId: string, definitionId: string): number {
  let seed = 2166136261;
  for (const char of `${actorId}:${definitionId}`) {
    seed = mixRuntimeRandomSeed(seed, char.charCodeAt(0));
  }
  return seed || 1;
}

export function nextRuntimeRandomUnit(seed: number): RuntimeRandomAdvance {
  const nextSeed = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return {
    seed: nextSeed,
    value: nextSeed / 0x100000000,
  };
}

export function clampRuntimeRandomUnit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(0.999999999, value));
}

export function fallbackRuntimeRandomUnit(input: RuntimeRandomFallbackInput): number {
  let seed = 2166136261;
  seed = mixRuntimeRandomSeed(seed, input.state.stateNo);
  seed = mixRuntimeRandomSeed(seed, input.state.animNo);
  seed = mixRuntimeRandomSeed(seed, input.state.animTime);
  seed = mixRuntimeRandomSeed(seed, input.stageTime ?? 0);
  seed = mixRuntimeRandomSeed(seed, input.variableIndex);
  seed = mixRuntimeRandomSeed(seed, input.lower);
  seed = mixRuntimeRandomSeed(seed, input.upper);
  return (seed >>> 0) / 0x100000000;
}

function mixRuntimeRandomSeed(seed: number, value: number): number {
  return Math.imul(seed ^ Math.trunc(value), 16777619) >>> 0;
}

import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";

export type RuntimeDirection = "B" | "DB" | "D" | "DF" | "F" | "UF" | "U" | "UB";
export type RuntimeSocdResolution = 0 | 1 | 2 | 3 | 4;

export type RuntimeSocdInputState = {
  first: [boolean, boolean, boolean, boolean];
};

export function createRuntimeSocdInputState(): RuntimeSocdInputState {
  return { first: [false, false, false, false] };
}

export function resetRuntimeSocdInputState(state: RuntimeSocdInputState): void {
  state.first = [false, false, false, false];
}

export function parseRuntimeSocdResolution(value: string | number | undefined): RuntimeSocdResolution | undefined {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 && value <= 4 ? value as RuntimeSocdResolution : undefined;
  }
  if (typeof value !== "string" || !/^[0-4]$/.test(value.trim())) {
    return undefined;
  }
  return Number(value.trim()) as RuntimeSocdResolution;
}

export function defaultRuntimeSocdResolution(profile: RuntimeCompatibilityProfile): RuntimeSocdResolution {
  return profile === "ikemen-go" ? 4 : 0;
}

export function resolveRuntimeSocdInput(
  values: Iterable<string>,
  resolution: RuntimeSocdResolution = 0,
  state?: RuntimeSocdInputState,
): Set<string> {
  const entries = [...values];
  const resolved = new Set(entries);
  if (resolution === 0) {
    return resolved;
  }

  if (state && (resolution === 1 || resolution === 3)) {
    updateRuntimeSocdFirstState(state, entries);
    resolveStatefulOpposingDirections(resolved, entries, "B", "F", resolution, state.first[2]);
    resolveStatefulOpposingDirections(resolved, entries, "D", "U", resolution, state.first[1]);
    return resolved;
  }

  resolveOpposingDirections(resolved, entries, "B", "F", resolution);
  resolveOpposingDirections(resolved, entries, "D", "U", resolution);
  return resolved;
}

export function runtimeCurrentDirection(values: Iterable<string>): RuntimeDirection | undefined {
  const input = normalizeRuntimeInput(values);
  const has = (value: string): boolean => input.has(value);
  if (has("DF") || (has("D") && has("F"))) {
    return "DF";
  }
  if (has("DB") || (has("D") && has("B"))) {
    return "DB";
  }
  if (has("UF") || (has("U") && has("F"))) {
    return "UF";
  }
  if (has("UB") || (has("U") && has("B"))) {
    return "UB";
  }
  if (has("D")) {
    return "D";
  }
  if (has("F")) {
    return "F";
  }
  if (has("B")) {
    return "B";
  }
  if (has("U")) {
    return "U";
  }
  return undefined;
}

export function hasRuntimeDirection(values: Iterable<string>, direction: "B" | "D" | "F" | "U"): boolean {
  const current = runtimeCurrentDirection(values);
  return current !== undefined && runtimeDirectionFamily(direction).includes(current);
}

export function isRuntimeHoldingBack(values: Iterable<string>): boolean {
  return hasRuntimeDirection(values, "B");
}

function normalizeRuntimeInput(values: Iterable<string>): Set<string> {
  return new Set([...values].map((value) => value.toUpperCase()));
}

function runtimeDirectionFamily(direction: "B" | "D" | "F" | "U"): RuntimeDirection[] {
  if (direction === "D") {
    return ["D", "DB", "DF"];
  }
  if (direction === "B") {
    return ["B", "DB", "UB"];
  }
  if (direction === "F") {
    return ["F", "DF", "UF"];
  }
  return ["U", "UB", "UF"];
}

function resolveOpposingDirections(
  resolved: Set<string>,
  entries: readonly string[],
  negative: "B" | "D",
  positive: "F" | "U",
  resolution: RuntimeSocdResolution,
): void {
  const negativeIndex = directionIndex(entries, negative);
  const positiveIndex = directionIndex(entries, positive);
  if (negativeIndex === undefined || positiveIndex === undefined) {
    return;
  }

  if (resolution === 4) {
    deleteDirection(resolved, negative);
    deleteDirection(resolved, positive);
    return;
  }
  if (resolution === 2) {
    deleteDirection(resolved, negative);
    return;
  }
  if (resolution === 1) {
    deleteDirection(resolved, negativeIndex > positiveIndex ? positive : negative);
    return;
  }
  if (resolution === 3) {
    deleteDirection(resolved, negativeIndex < positiveIndex ? positive : negative);
  }
}

function updateRuntimeSocdFirstState(state: RuntimeSocdInputState, entries: readonly string[]): void {
  updateRuntimeSocdAxisFirstState(state.first, entries, "D", "U", 1, 0);
  updateRuntimeSocdAxisFirstState(state.first, entries, "B", "F", 2, 3);
}

function updateRuntimeSocdAxisFirstState(
  first: [boolean, boolean, boolean, boolean],
  entries: readonly string[],
  negative: RuntimeDirection,
  positive: RuntimeDirection,
  negativeSlot: 1 | 2,
  positiveSlot: 0 | 3,
): void {
  const negativeHeld = directionIndex(entries, negative) !== undefined;
  const positiveHeld = directionIndex(entries, positive) !== undefined;
  if (!negativeHeld && !positiveHeld) {
    first[negativeSlot] = false;
    first[positiveSlot] = false;
    return;
  }
  if (!negativeHeld) first[negativeSlot] = false;
  if (!positiveHeld) first[positiveSlot] = false;
  if (!first[negativeSlot] && !first[positiveSlot]) {
    first[negativeSlot] = negativeHeld;
    first[positiveSlot] = !negativeHeld && positiveHeld;
  }
}

function resolveStatefulOpposingDirections(
  resolved: Set<string>,
  entries: readonly string[],
  negative: RuntimeDirection,
  positive: RuntimeDirection,
  resolution: RuntimeSocdResolution,
  negativeFirst: boolean,
): void {
  if (directionIndex(entries, negative) === undefined || directionIndex(entries, positive) === undefined) {
    return;
  }
  if (resolution === 1) {
    deleteDirection(resolved, negativeFirst ? negative : positive);
    return;
  }
  if (resolution === 3) {
    deleteDirection(resolved, negativeFirst ? positive : negative);
  }
}

function directionIndex(entries: readonly string[], direction: RuntimeDirection): number | undefined {
  const index = entries.findIndex((value) => value.trim().toUpperCase() === direction);
  return index >= 0 ? index : undefined;
}

function deleteDirection(values: Set<string>, direction: RuntimeDirection): void {
  for (const value of values) {
    if (value.trim().toUpperCase() === direction) {
      values.delete(value);
    }
  }
}

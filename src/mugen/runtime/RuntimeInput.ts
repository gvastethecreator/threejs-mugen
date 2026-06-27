export type RuntimeDirection = "B" | "DB" | "D" | "DF" | "F" | "UF" | "U" | "UB";

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

import { describe, expect, it } from "vitest";
import {
  defaultRuntimeSocdResolution,
  hasRuntimeDirection,
  isRuntimeHoldingBack,
  parseRuntimeSocdResolution,
  resolveRuntimeSocdInput,
  runtimeCurrentDirection,
} from "../mugen/runtime/RuntimeInput";
import type { RuntimeCompatibilityProfile } from "../mugen/runtime/RuntimeCompatibilityProfile";

describe("RuntimeInput", () => {
  it("normalizes atomic diagonal directions into direction families", () => {
    expect(runtimeCurrentDirection(["DB"])).toBe("DB");
    expect(hasRuntimeDirection(["DB"], "B")).toBe(true);
    expect(hasRuntimeDirection(["DB"], "D")).toBe(true);
    expect(isRuntimeHoldingBack(["DB"])).toBe(true);
  });

  it("preserves forward and upward diagonal families without reporting back", () => {
    expect(runtimeCurrentDirection(["UF"])).toBe("UF");
    expect(hasRuntimeDirection(["UF"], "U")).toBe(true);
    expect(hasRuntimeDirection(["UF"], "F")).toBe(true);
    expect(isRuntimeHoldingBack(["UF"])).toBe(false);
  });

  it("resolves opposing directions according to all documented modes", () => {
    expect([...resolveRuntimeSocdInput(["F", "B", "U", "D", "x"], 0)]).toEqual(["F", "B", "U", "D", "x"]);
    expect([...resolveRuntimeSocdInput(["F", "B", "U", "D", "x"], 2)]).toEqual(["F", "U", "x"]);
    expect([...resolveRuntimeSocdInput(["F", "B", "U", "D", "x"], 4)]).toEqual(["x"]);
    expect([...resolveRuntimeSocdInput(["F", "B", "U", "D", "x"], 1)]).toEqual(["B", "D", "x"]);
    expect([...resolveRuntimeSocdInput(["F", "B", "U", "D", "x"], 3)]).toEqual(["F", "U", "x"]);
  });

  it("uses input insertion order for first and last priority", () => {
    expect([...resolveRuntimeSocdInput(["B", "F"], 1)]).toEqual(["F"]);
    expect([...resolveRuntimeSocdInput(["B", "F"], 3)]).toEqual(["B"]);
    expect([...resolveRuntimeSocdInput(["F", "B"], 1)]).toEqual(["B"]);
    expect([...resolveRuntimeSocdInput(["F", "B"], 3)]).toEqual(["F"]);
  });

  it.each([
    ["mugen-1.1", 0],
    ["unknown", 0],
    ["ikemen-go", 4],
  ] as const)("selects profile default for %s", (profile, expected) => {
    expect(defaultRuntimeSocdResolution(profile as RuntimeCompatibilityProfile)).toBe(expected);
  });

  it("rejects invalid config values without inventing a mode", () => {
    expect(parseRuntimeSocdResolution(" 4 ")).toBe(4);
    expect(parseRuntimeSocdResolution("5")).toBeUndefined();
    expect(parseRuntimeSocdResolution("4x")).toBeUndefined();
    expect(parseRuntimeSocdResolution(2.5)).toBeUndefined();
  });
});

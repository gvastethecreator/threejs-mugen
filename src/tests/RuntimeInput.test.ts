import { describe, expect, it } from "vitest";
import {
  createRuntimeSocdInputState,
  defaultRuntimeSocdResolution,
  hasRuntimeDirection,
  isRuntimeHoldingBack,
  parseRuntimeSocdResolution,
  resetRuntimeSocdInputState,
  resolveRuntimeSocdResolution,
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

  it("keeps first-direction history across reconstructed input sets for modes 1 and 3", () => {
    const lastDirection = createRuntimeSocdInputState();
    resolveRuntimeSocdInput(["B"], 1, lastDirection);
    expect([...resolveRuntimeSocdInput(["F", "B"], 1, lastDirection)]).toEqual(["F"]);

    const firstDirection = createRuntimeSocdInputState();
    resolveRuntimeSocdInput(["F"], 3, firstDirection);
    expect([...resolveRuntimeSocdInput(["B", "F"], 3, firstDirection)]).toEqual(["F"]);
  });

  it("clears first-direction history after both directions release and reset", () => {
    const state = createRuntimeSocdInputState();
    resolveRuntimeSocdInput(["F"], 1, state);
    expect([...resolveRuntimeSocdInput(["B", "F"], 1, state)]).toEqual(["B"]);
    expect([...resolveRuntimeSocdInput([], 1, state)]).toEqual([]);
    expect([...resolveRuntimeSocdInput(["B", "F"], 1, state)]).toEqual(["F"]);

    resolveRuntimeSocdInput(["F"], 1, state);
    resetRuntimeSocdInputState(state);
    expect([...resolveRuntimeSocdInput(["F", "B"], 1, state)]).toEqual(["F"]);
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

  it("publishes explicit SOCD authority and conflicts without hiding package provenance", () => {
    expect(resolveRuntimeSocdResolution({ profile: "ikemen-go", runtimeOption: 2, p1Package: 1, p2Package: 3 })).toEqual({
      schema: "RuntimeSocdResolutionAuthority/v0",
      resolution: 2,
      source: "runtime-option",
      packageValues: { p1: 1, p2: 3 },
      diagnostics: ["package-socd-resolution-conflict"],
    });
    expect(resolveRuntimeSocdResolution({ profile: "ikemen-go", p1Package: 1, p2Package: 3 }).source).toBe("package-conflict-p1-fallback");
    expect(resolveRuntimeSocdResolution({ profile: "ikemen-go", runtimeOption: "invalid" }).diagnostics).toEqual(["invalid-runtime-option"]);
  });
});

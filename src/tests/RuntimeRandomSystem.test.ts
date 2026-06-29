import { describe, expect, it } from "vitest";
import {
  clampRuntimeRandomUnit,
  createRuntimeRandomSeed,
  fallbackRuntimeRandomUnit,
  nextRuntimeRandomUnit,
} from "../mugen/runtime/RuntimeRandomSystem";

describe("RuntimeRandomSystem", () => {
  it("creates deterministic non-zero seeds per actor and definition", () => {
    const p1Seed = createRuntimeRandomSeed("p1", "kfm");
    const sameSeed = createRuntimeRandomSeed("p1", "kfm");
    const p2Seed = createRuntimeRandomSeed("p2", "kfm");

    expect(p1Seed).toBe(sameSeed);
    expect(p1Seed).not.toBe(0);
    expect(p2Seed).not.toBe(p1Seed);
  });

  it("advances a deterministic unit sequence without using Math.random", () => {
    const seed = createRuntimeRandomSeed("p1", "nova-boxer");
    const first = nextRuntimeRandomUnit(seed);
    const second = nextRuntimeRandomUnit(first.seed);
    const repeatFirst = nextRuntimeRandomUnit(seed);

    expect(first).toEqual(repeatFirst);
    expect(second.seed).not.toBe(first.seed);
    expect(first.value).toBeGreaterThanOrEqual(0);
    expect(first.value).toBeLessThan(1);
    expect(second.value).toBeGreaterThanOrEqual(0);
    expect(second.value).toBeLessThan(1);
  });

  it("clamps random units to the controller-safe range", () => {
    expect(clampRuntimeRandomUnit(Number.NaN)).toBe(0);
    expect(clampRuntimeRandomUnit(-0.25)).toBe(0);
    expect(clampRuntimeRandomUnit(0.25)).toBe(0.25);
    expect(clampRuntimeRandomUnit(1)).toBe(0.999999999);
    expect(clampRuntimeRandomUnit(10)).toBe(0.999999999);
  });

  it("builds a stable fallback unit from runtime state and VarRandom range", () => {
    const base = {
      state: { stateNo: 200, animNo: 200, animTime: 3 },
      variableIndex: 5,
      lower: 10,
      upper: 12,
      stageTime: 60,
    };
    const first = fallbackRuntimeRandomUnit(base);
    const repeat = fallbackRuntimeRandomUnit(base);
    const changedStageTime = fallbackRuntimeRandomUnit({ ...base, stageTime: 61 });
    const changedRange = fallbackRuntimeRandomUnit({ ...base, upper: 20 });

    expect(first).toBe(repeat);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(1);
    expect(changedStageTime).not.toBe(first);
    expect(changedRange).not.toBe(first);
  });
});

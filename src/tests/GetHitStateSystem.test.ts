import { describe, expect, it } from "vitest";
import { RuntimeGetHitStateWorld } from "../mugen/runtime/GetHitStateSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeGetHitStateSystem", () => {
  it("selects default get-hit states with Common1 fallbacks", () => {
    const world = new RuntimeGetHitStateWorld();

    expect(world.defaultGetHitStateNo(runtime({ stateType: "S" }), hasStates(5000))).toBe(5000);
    expect(world.defaultGetHitStateNo(runtime({ stateType: "C" }), hasStates(5010, 5000))).toBe(5010);
    expect(world.defaultGetHitStateNo(runtime({ stateType: "A" }), hasStates(5020, 5000))).toBe(5020);
  });

  it("falls back to standing get-hit states when state-typed routes are missing", () => {
    const world = new RuntimeGetHitStateWorld();

    expect(world.defaultGetHitStateNo(runtime({ stateType: "C" }), hasStates(5000))).toBe(5000);
    expect(world.defaultGetHitStateNo(runtime({ stateType: "A" }), hasStates(5000))).toBe(5000);
  });

  it("returns undefined when no default get-hit state exists", () => {
    const world = new RuntimeGetHitStateWorld();

    expect(world.defaultGetHitStateNo(runtime({ stateType: "S" }), hasStates(5010, 5020))).toBeUndefined();
  });
});

function hasStates(...ids: number[]): (stateNo: number) => boolean {
  return (stateNo) => ids.includes(stateNo);
}

function runtime(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

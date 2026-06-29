import { describe, expect, it } from "vitest";
import { applyRuntimeTurn, RuntimeOrientationWorld, updateRuntimeAutoFacing } from "../mugen/runtime/OrientationSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeOrientationSystem", () => {
  it("updates auto-facing toward the opponent position", () => {
    const self = runtime({ pos: { x: 20, y: 0 }, facing: -1 });

    updateRuntimeAutoFacing(self, { pos: { x: 120, y: 0 } });
    expect(self.facing).toBe(1);

    updateRuntimeAutoFacing(self, { pos: { x: -40, y: 0 } });
    expect(self.facing).toBe(-1);
  });

  it("preserves facing when AssertSpecial NoAutoTurn is active", () => {
    const self = runtime({
      pos: { x: 20, y: 0 },
      facing: -1,
      assertSpecial: { flags: ["noautoturn"], globalFlags: [], noAutoTurn: true },
    });

    updateRuntimeAutoFacing(self, { pos: { x: 120, y: 0 } });
    expect(self.facing).toBe(-1);
  });

  it("applies Turn through the world boundary", () => {
    const state = runtime({ facing: 1 });
    const world = new RuntimeOrientationWorld();

    world.applyTurn(state);
    expect(state.facing).toBe(-1);

    applyRuntimeTurn(state);
    expect(state.facing).toBe(1);
  });
});

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

import { describe, expect, it } from "vitest";
import {
  applyRuntimeStateMetadataTransition,
  RuntimeStateMetadataWorld,
} from "../mugen/runtime/RuntimeStateMetadataSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeStateMetadataSystem", () => {
  it("records previous state metadata when state number changes", () => {
    const runtime = runtimeState({
      stateNo: 200,
      animNo: 205,
      stateType: "A",
      moveType: "A",
    });

    const result = applyRuntimeStateMetadataTransition(runtime, 269, {
      stateType: "A",
      moveType: "A",
    });

    expect(result).toEqual({
      changed: true,
      previous: { stateNo: 200, animNo: 205, stateType: "A", moveType: "A" },
    });
    expect(runtime).toMatchObject({
      stateNo: 269,
      prevStateNo: 200,
      prevAnimNo: 205,
      prevStateType: "A",
      prevMoveType: "A",
    });
  });

  it("leaves previous metadata untouched when state number is unchanged", () => {
    const runtime = runtimeState({
      stateNo: 200,
      animNo: 205,
      prevStateNo: 100,
      prevAnimNo: 101,
      prevStateType: "C",
      prevMoveType: "H",
    });
    const world = new RuntimeStateMetadataWorld();

    expect(world.setStateNo(runtime, 200)).toEqual({ changed: false });
    expect(runtime).toMatchObject({
      stateNo: 200,
      prevStateNo: 100,
      prevAnimNo: 101,
      prevStateType: "C",
      prevMoveType: "H",
    });
  });
});

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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

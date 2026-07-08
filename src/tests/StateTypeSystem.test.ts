import { describe, expect, it } from "vitest";
import type { MetadataControllerOp } from "../mugen/compiler/ControllerOps";
import {
  resolveRuntimeStateTypeSetControllerOperation,
  RuntimeStateTypeWorld,
  type RuntimeStateTypeControllerSource,
} from "../mugen/runtime/StateTypeSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeStateTypeWorld", () => {
  it("applies typed StateTypeSet metadata", () => {
    const world = new RuntimeStateTypeWorld();
    const state = runtime();
    const operation: MetadataControllerOp = {
      kind: "metadata",
      controllerType: "statetypeset",
      stateType: "C",
      moveType: "A",
      physics: "N",
    };

    expect(world.applyController(state, controller(), operation)).toEqual({
      applied: true,
      stateType: "C",
      moveType: "A",
      physics: "N",
    });
    expect(state.stateType).toBe("C");
    expect(state.moveType).toBe("A");
    expect(state.physics).toBe("N");
  });

  it("keeps raw param fallback with legacy case handling", () => {
    const world = new RuntimeStateTypeWorld();
    const state = runtime();

    expect(world.applyController(state, controller({ stateType: "a", movetype: "h", physics: "c" }))).toEqual({
      applied: true,
      stateType: "A",
      moveType: "H",
      physics: "C",
    });

    expect(state.stateType).toBe("A");
    expect(state.moveType).toBe("H");
    expect(state.physics).toBe("C");
  });

  it("resolves dynamic StateTypeSet metadata from bounded expression fallback", () => {
    const world = new RuntimeStateTypeWorld();
    const state = runtime({ vars: [1, 1, 1] });
    const source = controller({
      statetype: "IfElse(var(0), C, S)",
      movetype: "IfElse(var(1), A, I)",
      physics: "IfElse(var(2), N, S)",
    });

    expect(resolveRuntimeStateTypeSetControllerOperation(source, state)).toEqual({
      kind: "metadata",
      controllerType: "statetypeset",
      stateType: "C",
      moveType: "A",
      physics: "N",
    });
    expect(world.applyController(state, source)).toEqual({
      applied: true,
      stateType: "C",
      moveType: "A",
      physics: "N",
    });
    expect(state.stateType).toBe("C");
    expect(state.moveType).toBe("A");
    expect(state.physics).toBe("N");
  });

  it("does not mutate invalid raw metadata", () => {
    const world = new RuntimeStateTypeWorld();
    const state = runtime({ stateType: "S", moveType: "I", physics: "S" });

    expect(world.applyController(state, controller({ statetype: "standing", movetype: "attack", physics: "fall" }))).toEqual({
      applied: false,
    });

    expect(state.stateType).toBe("S");
    expect(state.moveType).toBe("I");
    expect(state.physics).toBe("S");
  });
});

function controller(params: Record<string, string> = {}): RuntimeStateTypeControllerSource {
  return {
    type: "StateTypeSet",
    normalizedType: "statetypeset",
    params,
  };
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

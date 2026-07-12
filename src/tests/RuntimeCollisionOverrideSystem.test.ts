import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import { applyCollisionOverrides, RuntimeCollisionOverrideWorld, type RuntimeCollisionOverrideState } from "../mugen/runtime/RuntimeCollisionOverrideSystem";

describe("RuntimeCollisionOverrideWorld", () => {
  it("normalizes and appends an out-of-range static box", () => {
    const state: RuntimeCollisionOverrideState = {};
    const applied = new RuntimeCollisionOverrideWorld().apply(state, controller({ group: "Clsn2", index: "9", rect: "30, 10, -20, -40" }));
    expect(applied).toMatchObject({ group: 2, index: 9, rect: [-20, -40, 30, 10] });
    expect(applyCollisionOverrides([{ x1: -5, y1: -10, x2: 5, y2: 0 }], state.clsnOverrides, 2)).toEqual([
      { x1: -5, y1: -10, x2: 5, y2: 0 },
      { x1: -20, y1: -40, x2: 30, y2: 10 },
    ]);
  });

  it("replaces all, deletes indexed boxes, and clears every modifier", () => {
    const world = new RuntimeCollisionOverrideWorld();
    const state: RuntimeCollisionOverrideState = {};
    world.apply(state, controller({ group: "Clsn1", index: "-1", rect: "1,2,3,4" }));
    world.apply(state, controller({ group: "Clsn2", index: "0", rect: "0,0,0,0" }));
    expect(applyCollisionOverrides([{ x1: 0, y1: 0, x2: 2, y2: 2 }, { x1: 4, y1: 4, x2: 6, y2: 6 }], state.clsnOverrides, 1)).toEqual([
      { x1: 1, y1: 2, x2: 3, y2: 4 }, { x1: 1, y1: 2, x2: 3, y2: 4 },
    ]);
    expect(applyCollisionOverrides([{ x1: -5, y1: -5, x2: 5, y2: 5 }], state.clsnOverrides, 2)).toEqual([]);
    world.apply(state, controller({ group: "None" }));
    expect(state.clsnOverrides).toBeUndefined();
  });

  it("resolves dynamic params in caller coordinates and resets every frame", () => {
    const world = new RuntimeCollisionOverrideWorld();
    const state: RuntimeCollisionOverrideState = {};
    const applied = world.apply(state, controller({ group: "Size", index: "var(0)", rect: "fvar(0),-20,40,0" }), undefined, {
      resolveNumber: (key) => key === "index" ? -1 : undefined,
      resolveRect: () => [10, -20, 40, 0],
    }, 2);
    expect(applied).toMatchObject({ group: 3, index: -1, rect: [20, -40, 80, 0] });
    world.resetFrame(state);
    expect(state.clsnOverrides).toBeUndefined();
  });
});

function controller(params: Record<string, string>): MugenStateController {
  return { stateId: 200, type: "OverrideClsn", params, triggers: [], line: 1, rawHeader: "State 200, Override" };
}

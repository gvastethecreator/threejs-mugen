import { describe, expect, it } from "vitest";
import {
  runtimeStateChangeTmpBlocksProjectile,
  RuntimeStateChangeTmpWorld,
  type RuntimeStateChangeTmpActor,
} from "../mugen/runtime/RuntimeStateChangeTmpSystem";

describe("RuntimeStateChangeTmpWorld", () => {
  it("keeps a marked state change through hitpause and settles it after active advance", () => {
    const actor: RuntimeStateChangeTmpActor = {};
    const world = new RuntimeStateChangeTmpWorld();

    world.mark(actor);
    expect(world.settle(actor, true)).toBe(true);
    expect(actor.stateChangeTmp).toBe(true);
    expect(world.settle(actor, false)).toBe(false);
    expect(actor.stateChangeTmp).toBe(false);
  });

  it("blocks only the source getting-hit or active-action projectile case", () => {
    expect(runtimeStateChangeTmpBlocksProjectile({ stateChangeTmp: true, moveType: "H", hitTmp: 1 })).toBe(true);
    expect(runtimeStateChangeTmpBlocksProjectile({ stateChangeTmp: true, moveType: "I", actTmp: 1 })).toBe(true);
    expect(runtimeStateChangeTmpBlocksProjectile({ stateChangeTmp: true, moveType: "I", actTmp: 0 })).toBe(false);
    expect(runtimeStateChangeTmpBlocksProjectile({ stateChangeTmp: true, moveType: "I", hitTmp: -1, actTmp: 0 })).toBe(false);
    expect(runtimeStateChangeTmpBlocksProjectile({ stateChangeTmp: false, moveType: "H", hitTmp: 1, actTmp: 1 })).toBe(false);
  });
});

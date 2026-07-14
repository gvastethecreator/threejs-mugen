import { describe, expect, it } from "vitest";
import {
  DEFAULT_RUNTIME_DIZZY_ANIM_NO,
  DEFAULT_RUNTIME_DIZZY_STATE_NO,
  RuntimeDizzyStateWorld,
} from "../mugen/runtime/DizzyStateSystem";

describe("RuntimeDizzyStateWorld", () => {
  it("selects the common dizzy state only when the target can enter it", () => {
    const world = new RuntimeDizzyStateWorld();

    expect(world.defaultDizzyStateNo((stateNo) => stateNo === DEFAULT_RUNTIME_DIZZY_STATE_NO)).toBe(DEFAULT_RUNTIME_DIZZY_STATE_NO);
    expect(DEFAULT_RUNTIME_DIZZY_ANIM_NO).toBe(5300);
  });

  it("fails closed when the common dizzy state is unavailable", () => {
    expect(new RuntimeDizzyStateWorld().defaultDizzyStateNo(() => false)).toBeUndefined();
  });
});

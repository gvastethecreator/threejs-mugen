import { describe, expect, it } from "vitest";
import {
  runtimeCombatLocalScale,
  runtimeCombatDepthFromConstants,
  runtimeDepthRangesOverlap,
} from "../mugen/runtime/RuntimeCombatDepthSystem";

describe("RuntimeCombatDepthSystem", () => {
  it("uses Ikemen character depth defaults and preserves asymmetric constants", () => {
    expect(runtimeCombatDepthFromConstants()).toEqual({ position: 0, size: [3, 3], attack: [4, 4] });
    expect(
      runtimeCombatDepthFromConstants({
        "size.depth.top": 2,
        "size.depth.bottom": 5,
        "size.attack.depth.top": 7,
        "size.attack.depth.bottom": 11,
      }),
    ).toEqual({ position: 0, size: [2, 5], attack: [7, 11] });
  });

  it("derives Ikemen local scale from localcoord width", () => {
    expect(runtimeCombatLocalScale()).toBe(1);
    expect(runtimeCombatLocalScale([640, 480])).toBe(0.5);
    expect(runtimeCombatLocalScale([0, 480])).toBe(1);
  });

  it("includes touching edges and applies each actor local scale", () => {
    expect(runtimeDepthRangesOverlap(0, [4, 8], 10, [3, 3])).toBe(true);
    expect(runtimeDepthRangesOverlap(0, [4, 8], 11, [3, 3])).toBe(true);
    expect(runtimeDepthRangesOverlap(0, [4, 8], 12, [3, 3])).toBe(false);
    expect(runtimeDepthRangesOverlap(0, [4, 4], 6, [3, 3], 2, 1)).toBe(true);
  });
});

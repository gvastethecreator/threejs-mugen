import { describe, expect, it } from "vitest";
import { runtimeCurrentSizeBox } from "../mugen/runtime/RuntimeSizeBoxSystem";

describe("RuntimeSizeBoxSystem", () => {
  it("composes Width and Height before group-3 overrides", () => {
    const base = { x1: -8, y1: -60, x2: 10, y2: 0 };

    expect(runtimeCurrentSizeBox({
      bodyWidthDelta: { front: 4, back: 2 },
      bodyHeightDelta: { top: 3, bottom: 1 },
    }, base)).toEqual({ x1: -10, y1: -63, x2: 14, y2: 1 });

    expect(runtimeCurrentSizeBox({
      bodyWidthDelta: { front: 4, back: 2 },
      bodyHeightDelta: { top: 3, bottom: 1 },
      clsnOverrides: [{ group: 3, index: -1, rect: { x1: -4, y1: -80, x2: 30, y2: 0 } }],
    }, base)).toEqual({ x1: -4, y1: -80, x2: 30, y2: 0 });
  });

  it("returns no size box after a group-3 deletion", () => {
    expect(runtimeCurrentSizeBox({
      clsnOverrides: [{ group: 3, index: -1, rect: { x1: 0, y1: 0, x2: 0, y2: 0 } }],
    }, { x1: -8, y1: -60, x2: 10, y2: 0 })).toBeUndefined();
  });
});

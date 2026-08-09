import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { MugenRuntime } from "../mugen/runtime/MugenRuntime";

describe("MugenRuntime frame selection", () => {
  it("seeks and clamps an authored action frame for inspection", () => {
    const runtime = new MugenRuntime(new Map<number, MugenAnimationAction>([[200, action(200, [3, 5, 7])]]));

    expect(runtime.dispatch({ type: "select-frame", frameIndex: 2 }).actors[0]?.runtime).toMatchObject({
      animNo: 200,
      frameIndex: 2,
      animTime: 8,
    });
    expect(runtime.dispatch({ type: "select-frame", frameIndex: 99 }).actors[0]?.runtime.frameIndex).toBe(2);
    expect(runtime.dispatch({ type: "select-frame", frameIndex: -4 }).actors[0]?.runtime.frameIndex).toBe(0);
  });
});

function action(id: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    loopStart: 0,
    rawLines: [],
    frames: durations.map((duration, spriteIndex) => ({
      spriteGroup: 15000,
      spriteIndex,
      offsetX: 0,
      offsetY: 0,
      duration,
      clsn1: [],
      clsn2: [],
      raw: "",
      line: spriteIndex + 1,
    })),
  };
}

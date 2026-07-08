import { describe, expect, it } from "vitest";
import { runtimeStageGameSpace } from "../mugen/runtime/RuntimeStageGameSpaceSystem";

describe("RuntimeStageGameSpaceSystem", () => {
  it("derives Elecbyte game-space dimensions from stage localcoord and inverse zoom", () => {
    expect(
      runtimeStageGameSpace({
        bounds: { left: -160, right: 160 },
        localCoord: { width: 640, height: 480 },
        camera: { zoom: 0.5 },
      }),
    ).toEqual({ width: 640, height: 480, zoom: 0.5 });
  });

  it("prefers parsed mugen.cfg game-space dimensions over stage localcoord", () => {
    expect(
      runtimeStageGameSpace({
        bounds: { left: -160, right: 160 },
        gameSpace: { width: 1280, height: 720 },
        localCoord: { width: 640, height: 480 },
        camera: { zoom: 0.5 },
      }),
    ).toEqual({ width: 1280, height: 720, zoom: 0.5 });
  });

  it("falls back to horizontal bounds and 480 height when localcoord is unavailable", () => {
    expect(runtimeStageGameSpace({ bounds: { left: -120, right: 200 }, camera: { zoom: 0 } })).toEqual({
      width: 320,
      height: 480,
      zoom: 1,
    });
  });
});

import { describe, expect, it } from "vitest";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import { resolveStageZOffsetLink } from "../game/render/stageProjection";
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

  it("moves presentation floor with a zoffsetlink target and leaves physics zoffset unchanged", () => {
    const platform = {
      id: "BG Platform",
      controlId: 4,
      color: "#000",
      y: 0,
      width: 320,
      height: 40,
      deltaX: 1,
      opacity: 1,
      startX: 0,
      startY: 12,
      sinusoid: { y: { amplitude: 10, period: 8, phase: 0 } },
    };
    const stage = {
      id: "link",
      displayName: "Link",
      floorY: 0,
      zOffset: 180,
      zOffsetLink: 4,
      localCoord: { width: 320, height: 240 },
      bounds: { left: -160, right: 160 },
      camera: { startX: 0, startY: 0, zoom: 1 },
      playerStart: {
        p1: { x: -40, y: 0, facing: 1 },
        p2: { x: 40, y: 0, facing: -1 },
      },
      layers: [platform],
    } satisfies MugenStageDefinition;

    const snapshot = {
      id: stage.id,
      displayName: stage.displayName,
      floorY: stage.floorY,
      zOffset: stage.zOffset,
      zOffsetLink: stage.zOffsetLink,
      camera: { x: 0, y: 0, zoom: 1 },
      layers: stage.layers,
    };
    const rest = resolveStageZOffsetLink(snapshot, 0);
    const first = resolveStageZOffsetLink(snapshot, 2);
    const second = resolveStageZOffsetLink(snapshot, 2);
    const missing = resolveStageZOffsetLink({ ...snapshot, zOffsetLink: 99 }, 2);
    const unlinked = resolveStageZOffsetLink({ ...snapshot, zOffsetLink: undefined }, 2);

    expect(rest).toEqual({ floorY: 0 });
    expect(first.floorY).toBeCloseTo(-10);
    expect(second.floorY).toBe(first.floorY);
    expect(missing).toEqual({ floorY: 0, unsupported: "zoffsetlink target missing" });
    expect(unlinked).toEqual({ floorY: 0 });
    expect(stage.zOffset).toBe(180);
    expect(stage.playerStart.p1.y).toBe(0);
  });
});

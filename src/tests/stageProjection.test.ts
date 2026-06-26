import { describe, expect, it } from "vitest";
import type { MugenSprite } from "../mugen/model/MugenSprite";
import type { MugenStageLayer } from "../mugen/model/MugenStage";
import type { StageSnapshot } from "../mugen/runtime/types";
import { projectStageSpriteLayer, resolveStageLayerForTick } from "../game/render/stageProjection";
import { bgCtrlLabStage } from "../mugen/runtime/demoStage";

const sprite: MugenSprite = {
  group: 1,
  index: 0,
  width: 100,
  height: 40,
  axisX: 10,
  axisY: 5,
};

const stage: StageSnapshot = {
  id: "stage-test",
  displayName: "Test",
  floorY: 0,
  zOffset: 200,
  camera: { x: 80, y: 112, zoom: 1 },
};

describe("projectStageSpriteLayer", () => {
  it("applies horizontal parallax from stage camera and layer delta", () => {
    const layer: MugenStageLayer = {
      id: "BG",
      color: "#000",
      y: 0,
      width: 320,
      height: 200,
      deltaX: 0.5,
      opacity: 1,
      startX: 20,
      startY: 30,
    };

    const [placement] = projectStageSpriteLayer(layer, sprite, stage, 640);

    expect(placement?.x).toBe(100);
    expect(placement?.y).toBe(155);
  });

  it("creates bounded horizontal tile placements around the camera", () => {
    const layer: MugenStageLayer = {
      id: "BG tile",
      color: "#000",
      y: 0,
      width: 320,
      height: 200,
      deltaX: 1,
      opacity: 1,
      startX: 0,
      startY: 0,
      tile: { x: 1, y: 0, spacingX: 20 },
    };

    const placements = projectStageSpriteLayer(layer, sprite, stage, 180);

    expect(placements.length).toBeGreaterThan(3);
    expect(new Set(placements.map((placement) => placement.y)).size).toBe(1);
    expect(placements.some((placement) => placement.x < stage.camera.x)).toBe(true);
    expect(placements.some((placement) => placement.x > stage.camera.x)).toBe(true);
  });
});

describe("resolveStageLayerForTick", () => {
  const layer: MugenStageLayer = {
    id: "BG controlled",
    controlId: 7,
    color: "#000",
    y: 0,
    width: 320,
    height: 200,
    deltaX: 1,
    opacity: 1,
    startX: 10,
    startY: 20,
  };

  it("hides a targeted layer while Visible/Enabled value is zero", () => {
    const hidden = resolveStageLayerForTick(
      layer,
      {
        ...stage,
        bgControllers: [
          {
            name: "hide",
            controllers: [
              {
                name: "hide-target",
                type: "visible",
                timing: { start: 2, end: 5 },
                ctrlIds: [7],
                params: { value: "0" },
                rawParams: { type: "Visible", time: "2,5", value: "0" },
              },
            ],
            rawParams: {},
          },
        ],
      },
      3,
    );

    const visible = resolveStageLayerForTick(layer, { ...stage, bgControllers: [] }, 3);

    expect(hidden).toBeUndefined();
    expect(visible).toMatchObject({ id: layer.id });
  });

  it("applies bounded PosAdd and VelSet offsets only to matching ctrlID layers", () => {
    const motionStage: StageSnapshot = {
      ...stage,
      bgControllers: [
        {
          name: "motion",
          controllers: [
            {
              name: "drift",
              type: "posadd",
              timing: { start: 0, end: 20 },
              ctrlIds: [7],
              params: { x: "2", y: "1" },
              rawParams: { type: "PosAdd", time: "0,20", x: "2", y: "1" },
            },
            {
              name: "scroll",
              type: "velset",
              timing: { start: 4, end: 10 },
              ctrlIds: [7],
              params: { value: "3,0" },
              rawParams: { type: "VelSet", time: "4,10", value: "3,0" },
            },
          ],
          rawParams: {},
        },
      ],
    };
    const controlled = resolveStageLayerForTick(layer, motionStage, 5);
    const other = resolveStageLayerForTick({ ...layer, controlId: 8 }, motionStage, 5);

    expect(controlled).toMatchObject({ startX: 28, startY: 26 });
    expect(other).toMatchObject({ startX: 10, startY: 20 });
  });

  it("supports looped SinX and Anim controllers for action-backed backgrounds", () => {
    const resolved = resolveStageLayerForTick(
      layer,
      {
        ...stage,
        bgControllers: [
          {
            name: "loop",
            loopTime: 8,
            controllers: [
              {
                name: "pulse",
                type: "sinx",
                timing: { start: 0, end: 7, loopTime: 8 },
                ctrlIds: [7],
                params: { value: "10,8,0" },
                rawParams: { type: "SinX", time: "0,7", value: "10,8,0" },
              },
              {
                name: "swap",
                type: "anim",
                timing: { start: 0, end: 7, loopTime: 8 },
                ctrlIds: [7],
                params: { value: "42" },
                rawParams: { type: "Anim", time: "0,7", value: "42" },
              },
            ],
            rawParams: {},
          },
        ],
      },
      2,
    );

    expect(resolved?.actionNo).toBe(42);
    expect(resolved?.type).toBe("anim");
    expect(Math.round(resolved?.startX ?? 0)).toBe(20);
  });

  it("moves the native BGCtrl Lab controlled layers deterministically", () => {
    const ribbon = bgCtrlLabStage.layers.find((candidate) => candidate.id === "lab-sine-ribbon");
    const cloud = bgCtrlLabStage.layers.find((candidate) => candidate.id === "lab-cloud-drift");

    expect(ribbon).toBeDefined();
    expect(cloud).toBeDefined();

    const resolvedRibbon = resolveStageLayerForTick(ribbon!, { ...stage, ...bgCtrlLabStage, camera: stage.camera }, 30);
    const resolvedCloud = resolveStageLayerForTick(cloud!, { ...stage, ...bgCtrlLabStage, camera: stage.camera }, 30);

    expect(Math.round(resolvedRibbon?.startX ?? 0)).toBe(54);
    expect(Math.round(resolvedRibbon?.startY ?? 0)).toBe(0);
    expect(Math.round(resolvedCloud?.startX ?? 0)).toBe(7);
  });
});

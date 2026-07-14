import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { MugenSprite } from "../mugen/model/MugenSprite";
import type { MugenStageLayer } from "../mugen/model/MugenStage";
import type { StageSnapshot } from "../mugen/runtime/types";
import { AxisRenderer, stageLayerMaterialParameters } from "../game/render/AxisRenderer";
import type { TextureStore } from "../game/render/TextureStore";
import { clipStagePlacement, projectStageLayerClip, projectStageSpriteLayer, resolveStageLayerForTick, resolveStageLayerScale } from "../game/render/stageProjection";
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

  it("clips sprite placements to bounded stage BG windows without scaling texture UVs", () => {
    const layer: MugenStageLayer = {
      id: "BG clipped",
      color: "#000",
      y: 0,
      width: 320,
      height: 200,
      deltaX: 1,
      opacity: 1,
      startX: 20,
      startY: 30,
      clip: { source: "maskwindow", x1: 30, y1: 50, x2: 90, y2: 90 },
    };

    const [placement] = projectStageSpriteLayer(layer, sprite, stage, 640);

    expect(placement).toMatchObject({
      x: 60,
      y: 142.5,
      width: 60,
      height: 15,
      uv: { u1: 0.2, v1: 0, u2: 0.8, v2: 0.375 },
    });
  });

  it("scales sprite placement around its authored axis and compensates explicit zoomdelta", () => {
    const layer: MugenStageLayer = {
      id: "BG scaled",
      color: "#000",
      y: 0,
      width: 320,
      height: 200,
      deltaX: 1,
      opacity: 1,
      startX: 20,
      startY: 30,
      scaleStart: { x: 2, y: 1.5 },
      zoomDelta: { x: 1, y: 1 },
    };

    const [placement] = projectStageSpriteLayer(layer, sprite, { ...stage, camera: { ...stage.camera, zoom: 1 } }, 640);

    expect(placement).toMatchObject({ x: 100, y: 147.5, width: 200, height: 60 });
  });

  it("resolves camera movement scale and keeps zoomdelta=0 screen-stable", () => {
    const scale = resolveStageLayerScale(
      {
        id: "BG scale contract",
        color: "#000",
        y: 0,
        width: 100,
        height: 50,
        deltaX: 1,
        deltaY: 1,
        opacity: 1,
        scaleStart: { x: 1.2, y: 0.8 },
        scaleDelta: { x: 0.01, y: 0.002 },
        zoomDelta: { x: 0.5, y: 0 },
      },
      { ...stage, camera: { x: 20, y: 10, zoom: 0.8 } },
    );

    expect(scale.x).toBeCloseTo(1.575);
    expect(scale.y).toBeCloseTo(1.025);
  });
});

describe("stage layer clipping", () => {
  it("projects static BG clip rectangles and rejects non-overlapping placements", () => {
    const layer: MugenStageLayer = {
      id: "BG clip rect",
      color: "#000",
      y: 0,
      width: 100,
      height: 40,
      deltaX: 1,
      opacity: 1,
      clip: { source: "window", x1: -40, y1: 20, x2: 40, y2: 80 },
    };
    const clip = projectStageLayerClip(layer, stage);

    expect(clip).toEqual({ left: -40, right: 40, top: 180, bottom: 120 });
    expect(clipStagePlacement({ x: 200, y: 0, width: 20, height: 20 }, clip!)).toBeUndefined();
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

  it("keeps initial velocity when VelSet updates only one axis", () => {
    const movingLayer = { ...layer, velocity: { x: 0, y: 1 } };
    const resolved = resolveStageLayerForTick(
      movingLayer,
      {
        ...stage,
        bgControllers: [
          {
            name: "motion",
            controllers: [
              {
                name: "horizontal",
                type: "velset",
                timing: { start: 0, end: 0 },
                ctrlIds: [7],
                params: { x: "3" },
                rawParams: { type: "VelSet", time: "0", x: "3" },
              },
            ],
            rawParams: {},
          },
        ],
      },
      2,
    );

    expect(resolved).toMatchObject({ startX: 19, startY: 23 });
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

  it("honors a parent BGCtrlDef reset when it differs from the controller loop", () => {
    const timedStage: StageSnapshot = {
      ...stage,
      bgControllers: [
        {
          name: "independent-loops",
          loopTime: 10,
          controllers: [
            {
              name: "pulse",
              type: "visible",
              timing: { start: 4, end: 4, loopTime: 6, groupLoopTime: 10 },
              ctrlIds: [7],
              params: { value: "0" },
              rawParams: { type: "Visible", time: "4,4,6", value: "0" },
            },
          ],
          rawParams: { looptime: "10" },
        },
      ],
    };

    expect(resolveStageLayerForTick(layer, timedStage, 4)).toBeUndefined();
    expect(resolveStageLayerForTick(layer, timedStage, 10)).toMatchObject({ id: layer.id });
  });

  it("pauses the action clock while an Enabled controller disables the layer", () => {
    const enabledStage: StageSnapshot = {
      ...stage,
      bgControllers: [
        {
          name: "pause-animation",
          controllers: [
            {
              name: "pause",
              type: "enabled",
              timing: { start: 2, end: 3 },
              ctrlIds: [7],
              params: { value: "0" },
              rawParams: { type: "Enabled", time: "2,3", value: "0" },
            },
          ],
          rawParams: {},
        },
      ],
    };

    expect(resolveStageLayerForTick(layer, enabledStage, 1)).toMatchObject({ animationTick: 2 });
    expect(resolveStageLayerForTick(layer, enabledStage, 2)).toBeUndefined();
    expect(resolveStageLayerForTick(layer, enabledStage, 4)).toMatchObject({ animationTick: 3 });
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

describe("stage layer material params", () => {
  it("maps bounded stage trans modes into Three.js blending and opacity", () => {
    const addAlpha = stageLayerMaterialParameters("#fff", 0.8, { mode: "addalpha", alpha: { source: 128, destination: 256 } });
    const subtractive = stageLayerMaterialParameters("#fff", 1, { mode: "sub" });
    const normal = stageLayerMaterialParameters("#fff", 1, { mode: "none" });

    expect(addAlpha.blending).toBe(THREE.AdditiveBlending);
    expect(addAlpha.opacity).toBeCloseTo(0.4);
    expect(addAlpha.transparent).toBe(true);
    expect(addAlpha.depthWrite).toBe(false);
    expect(subtractive.blending).toBe(THREE.SubtractiveBlending);
    expect(normal.blending).toBe(THREE.NormalBlending);
    expect(normal.transparent).toBe(true);
    expect(normal.depthTest).toBe(false);
    expect(normal.depthWrite).toBe(false);
  });

  it("reports layerno and authored order through semantic and effective presentation diagnostics", () => {
    const renderer = new AxisRenderer({} as TextureStore);
    renderer.update({
      width: 640,
      height: 360,
      showAxis: false,
      showGrid: false,
      tick: 0,
      stage: {
        ...stage,
        layers: [
          { id: "back", color: "#001", y: 0, width: 640, height: 360, deltaX: 1, opacity: 1, layerNo: 0 },
          { id: "front", color: "#fff", y: 0, width: 40, height: 80, deltaX: 1, opacity: 0.5, layerNo: 1 },
        ],
      },
    });

    expect(renderer.getDiagnostics()).toMatchObject([
      {
        id: "back",
        layerNo: 0,
        authoredOrder: 0,
        presentationOrder: {
          semantic: { phase: "stage-background", blendPolicy: "normal", tiePolicy: "authored-order" },
          three: { renderOrder: 0, depthTest: false, depthWrite: false },
        },
      },
      {
        id: "front",
        layerNo: 1,
        authoredOrder: 1,
        presentationOrder: {
          semantic: { phase: "stage-foreground", blendPolicy: "alpha", tiePolicy: "authored-order" },
          three: { renderOrder: 40_000_100, depthTest: false, depthWrite: false },
        },
      },
    ]);
    renderer.dispose();
  });
});

import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  applyLinkedStageFloorPresentation,
  resolveRootCollisionActors,
  resolveRootPresentationActors,
  resolveRoundFadePresentation,
  resolveRoundShutterPresentation,
} from "../game/render/ThreeMugenRenderer";
import { AxisRenderer } from "../game/render/AxisRenderer";
import { CollisionBoxRenderer } from "../game/render/CollisionBoxRenderer";
import { composePaletteFxRgba, transformPaletteFxRgba } from "../game/render/PaletteFxMaterial";
import { projectCollisionBox } from "../game/render/projection";
import { resolveStageLayerForTick, resolveStageZOffsetLink } from "../game/render/stageProjection";
import type { TextureStore } from "../game/render/TextureStore";
import { createStageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import { MugenStageLoader } from "../mugen/loader/MugenStageLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import type { MugenSprite } from "../mugen/model/MugenSprite";
import { runtimeStageGameSpace } from "../mugen/runtime/RuntimeStageGameSpaceSystem";
import {
  clipFightScreenPlacement,
  projectFightScreenSprite,
  resolveFightScreenAnnouncementSelection,
  resolveRoundDisplayAsset,
} from "../game/render/FightScreenAnnouncementRenderer";
import {
  resolveFightScreenAnimationCompletion,
  resolveFightScreenAnnouncementCompletion,
} from "../mugen/runtime/FightScreenAnimationSemantics";
import { projectRoundFadeSprite, resolveRoundFadeAnimationFrame } from "../game/render/RoundFadeRenderer";
import { projectRoundShutterBars } from "../game/render/RoundShutterRenderer";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenFightScreenDisplayDefinitions } from "../mugen/model/MugenSystemAssets";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import type { ActorSnapshot, MugenSnapshot, StageSnapshot } from "../mugen/runtime/types";

describe("resolveRootPresentationActors", () => {
  it("selects and orders promoted reserve roots without widening snapshot actors", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = actor("p3");
    const snapshot = {
      actors: [p1, p2],
      reserveActors: [p3],
      rootPresentation: diagnostic(["p3", "p2"]),
    };

    expect(resolveRootPresentationActors(snapshot).map(({ id }) => id)).toEqual(["p3", "p2"]);
    expect(snapshot.actors.map(({ id }) => id)).toEqual(["p1", "p2"]);
  });

  it("resolves collision roots independently from draw roots", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = actor("p3");
    const snapshot = {
      actors: [p1, p2],
      reserveActors: [p3],
      rootPresentation: diagnostic(["p2"], ["p3", "p2"]),
    };

    expect(resolveRootPresentationActors(snapshot).map(({ id }) => id)).toEqual(["p2"]);
    expect(resolveRootCollisionActors(snapshot).map(({ id }) => id)).toEqual(["p3", "p2"]);
  });

  it("preserves the playable pair when the diagnostic is absent", () => {
    const actors = [actor("p1"), actor("p2")];

    expect(resolveRootPresentationActors({ actors }).map(({ id }) => id)).toEqual(["p1", "p2"]);
  });

  it("rejects duplicate and unknown draw ids", () => {
    const actors = [actor("p1"), actor("p2")];

    expect(() => resolveRootPresentationActors({
      actors,
      rootPresentation: diagnostic(["p1", "p1"]),
    })).toThrow("Duplicate root presentation draw id p1");
    expect(() => resolveRootPresentationActors({
      actors,
      rootPresentation: diagnostic(["p3"]),
    })).toThrow("Unknown root presentation draw actor p3");
    expect(() => resolveRootCollisionActors({
      actors,
      rootPresentation: diagnostic(["p1"], ["p1", "p1"]),
    })).toThrow("Duplicate root presentation collision id p1");
    expect(() => resolveRootCollisionActors({
      actors,
      rootPresentation: diagnostic(["p1"], ["p3"]),
    })).toThrow("Unknown root presentation collision actor p3");
  });
});

describe("resolveRoundFadePresentation", () => {
  it("returns only an active imported round fade for the renderer overlay", () => {
    const fade = {
      schema: "RuntimeRoundFade/v0" as const,
      active: true,
      frame: 2,
      remaining: 2,
      duration: 4,
      opacity: 0.5,
      color: [12, 34, 56] as [number, number, number],
    };
    const fadeIn = { ...fade, direction: "in" as const };

    expect(resolveRoundFadePresentation({ round: { postRound: { fadeOut: fade } } as MugenSnapshot["round"] })).toEqual(fade);
    expect(resolveRoundFadePresentation({ round: { postRound: { fadeOut: { ...fade, active: false } } } as MugenSnapshot["round"] })).toBeUndefined();
    expect(resolveRoundFadePresentation({ round: { preRound: { fadeIn } } as MugenSnapshot["round"] })).toEqual(fadeIn);
    expect(resolveRoundFadePresentation({
      round: { postRound: { fadeOut: { ...fade, active: false } }, preRound: { fadeIn } } as MugenSnapshot["round"],
    })).toEqual(fadeIn);
    expect(resolveRoundFadePresentation({ round: undefined })).toBeUndefined();
  });
});

describe("RoundFadeRenderer asset projection", () => {
  it("advances FightScreen AIR frames using imported durations", () => {
    const action: MugenAnimationAction = {
      id: 7001,
      frames: [fadeFrame(1, 3), fadeFrame(2, 2)],
      rawLines: [],
    };

    expect(resolveRoundFadeAnimationFrame(action, 0)).toMatchObject({ frameIndex: 0, frame: { spriteIndex: 1 } });
    expect(resolveRoundFadeAnimationFrame(action, 3)).toMatchObject({ frameIndex: 1, frame: { spriteIndex: 2 } });
    expect(resolveRoundFadeAnimationFrame(action, 4)).toMatchObject({ frameIndex: 1, frame: { spriteIndex: 2 } });
  });

  it("anchors a full-screen SFF sprite to the active viewport", () => {
    expect(projectRoundFadeSprite(
      { x: 12, y: 30, width: 640, height: 360, zoom: 1 },
      { width: 640, height: 360, axisX: 0, axisY: 0 },
      { offsetX: 0, offsetY: 0 },
    )).toEqual({ x: 12, y: 30, width: 640, height: 360, flipX: 1, flipY: 1 });
  });
});

describe("RoundShutterRenderer", () => {
  it("projects the imported shutter into symmetric closing bars", () => {
    expect(projectRoundShutterBars(
      { frame: 3, duration: 6, shutterTime: 3 },
      { x: 12, y: 30, width: 640, height: 360, zoom: 1 },
    )).toEqual({
      coverHeight: 180,
      top: { x: 12, y: 120, width: 640, height: 180 },
      bottom: { x: 12, y: -60, width: 640, height: 180 },
    });
  });

  it("selects only an active pre-round shutter", () => {
    const shutter = {
      schema: "RuntimeRoundShutter/v0" as const,
      active: true,
      frame: 1,
      remaining: 5,
      duration: 6,
      shutterTime: 3,
      color: [17, 18, 19] as [number, number, number],
      phase: "closing" as const,
    };
    expect(resolveRoundShutterPresentation({ round: { preRound: { shutter } } as MugenSnapshot["round"] })).toEqual(shutter);
    expect(resolveRoundShutterPresentation({ round: { preRound: { shutter: { ...shutter, active: false } } } as MugenSnapshot["round"] })).toBeUndefined();
  });
});

describe("FightScreenAnnouncementRenderer asset selection", () => {
  const display: MugenFightScreenDisplayDefinitions = {
    round: new Map([[2, { animationNo: 7002 }]]),
    roundDefault: { animationNo: 7000 },
    roundSingle: { animationNo: 7001 },
    roundFinal: { animationNo: 7003 },
    fight: { animationNo: 7004 },
  };

  it("selects numbered, single, final, and fight assets from the runtime announcement", () => {
    expect(resolveRoundDisplayAsset(display, "normal", 2)).toEqual({ animationNo: 7002 });
    expect(resolveRoundDisplayAsset(display, "normal", 3)).toEqual({ animationNo: 7000 });
    expect(resolveRoundDisplayAsset(display, "single", 1)).toEqual({ animationNo: 7001 });
    expect(resolveRoundDisplayAsset(display, "final", 2)).toEqual({ animationNo: 7003 });
    expect(resolveFightScreenAnnouncementSelection({
      state: "fight",
      timer: 99,
      message: "Fight",
      announcement: {
        schema: "RuntimeRoundAnnouncement/v0",
        visibility: "visible",
        phase: "fight",
        roundNo: 2,
        mode: "normal",
        round: { phase: "active", skipped: false, elapsed: 4, animationStart: 0, soundTime: 0, soundDue: false },
        fight: { phase: "active", skipped: false, elapsed: 0, animationStart: 0, soundTime: 0, soundDue: false },
        roundDisplaySkipped: false,
        fightDisplaySkipped: false,
        callFightElapsed: 0,
        completion: "asset-owned",
        timing: {} as never,
      },
    }, display)?.asset).toEqual({ animationNo: 7004 });
  });

  it("keeps the default primary announcement when a numbered variant only adds layouts", () => {
    const display: MugenFightScreenDisplayDefinitions = {
      round: new Map([[2, { top: { sprite: [9100, 1] } }]]),
      roundDefault: { animationNo: 7000 },
    };

    expect(resolveRoundDisplayAsset(display, "normal", 2)).toEqual({ animationNo: 7000 });
  });

  it("mirrors AnimTextSnd End for displaytime, finite AIR, and terminal AIR frames", () => {
    const finite = actionWithDurations(7100, [3, 4]);
    const terminal = actionWithDurations(7101, [3, -1]);
    const animations = new Map([[7100, finite], [7101, terminal]]);

    expect(resolveFightScreenAnimationCompletion({ animationNo: 7100 }, animations)).toEqual({
      frame: 7,
      reason: "finite-animation",
      actionNos: [7100],
    });
    expect(resolveFightScreenAnimationCompletion({ animationNo: 7101 }, animations)).toEqual({
      frame: 3,
      reason: "terminal-frame",
      actionNos: [7101],
    });
    expect(resolveFightScreenAnimationCompletion({ animationNo: 7100, displayTime: 4 }, animations)).toEqual({
      frame: 3,
      reason: "displaytime",
      actionNos: [7100],
    });
  });

  it("waits for both the selected round variant and round.default", () => {
    const display: MugenFightScreenDisplayDefinitions = {
      round: new Map([[2, { animationNo: 7100 }]]),
      roundDefault: { animationNo: 7101 },
      fight: { animationNo: 7100 },
    };
    const animations = new Map([
      [7100, actionWithDurations(7100, [3, 4])],
      [7101, actionWithDurations(7101, [9])],
    ]);

    expect(resolveFightScreenAnnouncementCompletion(display, animations, "round", "normal", 2)).toEqual({
      frame: 9,
      reason: "parallel",
      actionNos: [7100, 7101],
    });
    expect(resolveFightScreenAnnouncementCompletion(display, animations, "fight", "normal", 1)).toEqual({
      frame: 7,
      reason: "finite-animation",
      actionNos: [7100],
    });
  });

  it("projects FightScreen layout coordinates with AIR offsets and authored flips", () => {
    expect(projectFightScreenSprite(
      { x: 0, y: 0, width: 640, height: 360, zoom: 1 },
      [320, 240],
      { width: 32, height: 16, axisX: 8, axisY: 4 },
      { offsetX: 2, offsetY: -3, flip: "" },
      { offset: [160, 100], scale: [1, 1], facing: 1, vfacing: 1 },
    )).toEqual({
      x: 20,
      y: 28.5,
      width: 64,
      height: 24,
      scaleX: 64,
      scaleY: 24,
    });
  });

  it("clips FightScreen layout placements to a local window and returns UV bounds", () => {
    const placement = projectFightScreenSprite(
      { x: 0, y: 0, width: 640, height: 360, zoom: 1 },
      [320, 240],
      { width: 80, height: 40, axisX: 0, axisY: 0 },
      { offsetX: 0, offsetY: 0, flip: "" },
      { offset: [160, 100], scale: [1, 1], facing: 1, vfacing: 1 },
    );

    expect(clipFightScreenPlacement(
      placement,
      { x: 0, y: 0, width: 640, height: 360, zoom: 1 },
      [320, 240],
      [150, 90, 30, 20],
    )).toMatchObject({
      width: 40,
      height: 15,
      uv: { u1: 0, u2: 0.25, v1: 0.75, v2: 1 },
    });
    expect(clipFightScreenPlacement(
      placement,
      { x: 0, y: 0, width: 640, height: 360, zoom: 1 },
      [320, 240],
      [0, 0, 20, 20],
    )).toBeUndefined();
  });
});

describe("ThreeMugenRenderer stage BGPalFX", () => {
  it("tints background and foreground stage layers without floor, axis, or additive blend", () => {
    const renderer = new AxisRenderer({} as TextureStore);
    const paletteFx = {
      remaining: 4,
      time: 4,
      add: [-80, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const stage = {
      id: "stage-test",
      displayName: "Test",
      floorY: 0,
      camera: { x: 0, y: 0, zoom: 1 },
      layers: [
        { id: "back", color: "#ffffff", y: 0, width: 640, height: 360, deltaX: 1, opacity: 1, layerNo: 0 },
        { id: "front", color: "#ffffff", y: 0, width: 40, height: 80, deltaX: 1, opacity: 0.5, layerNo: 1 },
      ],
      bgPalFx: paletteFx,
    };
    const view = { width: 640, height: 360, showAxis: false, showGrid: false, tick: 0, stage };

    renderer.update(view);
    const layerMeshCount = renderer.getDiagnostics().reduce((count, layer) => count + layer.meshCount, 0);
    const [expectedR, expectedG, expectedB] = transformPaletteFxRgba(255, 255, 255, 255, paletteFx);
    const layerMeshes = renderer.group.children.slice(0, layerMeshCount) as THREE.Mesh[];
    expect(layerMeshes).toHaveLength(2);
    expect(renderer.getDiagnostics().map((layer) => layer.layerNo)).toEqual([0, 1]);
    for (const mesh of layerMeshes) {
      const material = mesh.material as THREE.MeshBasicMaterial;
      expect(material.color.r).toBeCloseTo(expectedR / 255);
      expect(material.color.g).toBeCloseTo(expectedG / 255);
      expect(material.color.b).toBeCloseTo(expectedB / 255);
      expect(material.blending).toBe(THREE.NormalBlending);
    }
    const floor = renderer.group.children[layerMeshCount] as THREE.Mesh;
    expect((floor.material as THREE.MeshBasicMaterial).color.getHexString()).toBe("6b7280");

    const first = (layerMeshes[0]!.material as THREE.MeshBasicMaterial).color.clone();
    renderer.update(view);
    const second = ((renderer.group.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color;
    expect(second.r).toBeCloseTo(first.r);
    expect(second.g).toBeCloseTo(first.g);
    expect(second.b).toBeCloseTo(first.b);

    renderer.update({ ...view, stage: { ...stage, bgPalFx: undefined } });
    const restored = ((renderer.group.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color;
    expect(restored.r).toBeCloseTo(1);
    expect(restored.g).toBeCloseTo(1);
    expect(restored.b).toBeCloseTo(1);
    renderer.dispose();
  });

  it("composes BGPalFX then AllPalFX on stage layers and leaves floor untinted", () => {
    const renderer = new AxisRenderer({} as TextureStore);
    const local = {
      remaining: 4,
      time: 4,
      add: [-40, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const global = {
      remaining: 4,
      time: 4,
      add: [0, -40, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const stage = {
      id: "stage-test",
      displayName: "Test",
      floorY: 0,
      camera: { x: 0, y: 0, zoom: 1 },
      layers: [
        { id: "back", color: "#ffffff", y: 0, width: 640, height: 360, deltaX: 1, opacity: 1, layerNo: 0 },
        { id: "front", color: "#ffffff", y: 0, width: 40, height: 80, deltaX: 1, opacity: 0.5, layerNo: 1 },
      ],
      bgPalFx: local,
      allPalFx: global,
    };
    renderer.update({ width: 640, height: 360, showAxis: false, showGrid: false, tick: 0, stage });
    const layerMeshCount = renderer.getDiagnostics().reduce((count, layer) => count + layer.meshCount, 0);
    const [expectedR, expectedG, expectedB] = composePaletteFxRgba(255, 255, 255, 255, local, global);
    const layerMeshes = renderer.group.children.slice(0, layerMeshCount) as THREE.Mesh[];
    for (const mesh of layerMeshes) {
      const material = mesh.material as THREE.MeshBasicMaterial;
      expect(material.color.r).toBeCloseTo(expectedR / 255);
      expect(material.color.g).toBeCloseTo(expectedG / 255);
      expect(material.color.b).toBeCloseTo(expectedB / 255);
    }
    const floor = renderer.group.children[layerMeshCount] as THREE.Mesh;
    expect((floor.material as THREE.MeshBasicMaterial).color.getHexString()).toBe("6b7280");
    renderer.dispose();
  });

  it("renders more than eight authored stage layers in order", () => {
    const renderer = new AxisRenderer({} as TextureStore);
    renderer.update({
      width: 640,
      height: 360,
      showAxis: false,
      showGrid: false,
      tick: 0,
      stage: {
        id: "nine",
        displayName: "Nine",
        floorY: 0,
        camera: { x: 0, y: 0, zoom: 1 },
        layers: Array.from({ length: 9 }, (_, index) => ({
          id: `layer-${index}`,
          color: "#ffffff",
          y: 0,
          width: 40,
          height: 40,
          deltaX: 1,
          opacity: 1,
          layerNo: index === 8 ? 1 : 0,
        })),
      },
    });
    expect(renderer.getDiagnostics()).toHaveLength(9);
    expect(renderer.getDiagnostics()[8]).toMatchObject({ id: "layer-8", layerNo: 1, authoredOrder: 8 });
    renderer.dispose();
  });

  it("renders parallax width as non-rectangular geometry and keeps a normal sprite rectangular", () => {
    const textures = { getTexture: () => new THREE.Texture() } as unknown as TextureStore;
    const renderer = new AxisRenderer(textures);
    const sprite = { group: 0, index: 0, width: 100, height: 40, axisX: 50, axisY: 20 };
    renderer.setStageSpriteArchives([{ stageId: "trap", archive: { version: "v1", sprites: [sprite], warnings: [] } }]);
    renderer.update({
      width: 640,
      height: 360,
      showAxis: false,
      showGrid: false,
      tick: 0,
      stage: {
        id: "trap",
        displayName: "Trap",
        floorY: 0,
        zOffset: 200,
        camera: { x: 0, y: 0, zoom: 1 },
        layers: [
          {
            id: "floor",
            type: "parallax",
            color: "#fff",
            y: 0,
            width: 320,
            height: 40,
            deltaX: 1,
            opacity: 1,
            startX: 0,
            startY: 0,
            spriteGroup: 0,
            spriteIndex: 0,
            parallaxWidth: { top: 200, bottom: 80 },
          },
          {
            id: "wall",
            type: "normal",
            color: "#fff",
            y: 0,
            width: 320,
            height: 40,
            deltaX: 1,
            opacity: 1,
            startX: 0,
            startY: 0,
            spriteGroup: 0,
            spriteIndex: 0,
          },
        ],
      },
    });
    const floor = renderer.group.children[0] as THREE.Mesh;
    const wall = renderer.group.children[1] as THREE.Mesh;
    const floorPos = floor.geometry.getAttribute("position") as THREE.BufferAttribute;
    expect(floor.scale.x).toBe(1);
    expect(floorPos.getX(1) - floorPos.getX(0)).toBe(200);
    expect(floorPos.getX(3) - floorPos.getX(2)).toBe(80);
    expect(wall.scale.x).toBe(100);
    expect(wall.scale.y).toBe(40);
    renderer.dispose();
  });

  it("renders bounded horizontal parallax tiles as trapezoids and releases them on stage replacement", () => {
    const textures = { getTexture: () => new THREE.Texture() } as unknown as TextureStore;
    const renderer = new AxisRenderer(textures);
    const sprite = { group: 0, index: 0, width: 100, height: 40, axisX: 50, axisY: 20 };
    renderer.setStageSpriteArchives([{ stageId: "tiled", archive: { version: "v1", sprites: [sprite], warnings: [] } }]);
    const tiledLayer = {
      id: "floor",
      type: "parallax",
      color: "#fff",
      y: 0,
      width: 320,
      height: 40,
      deltaX: 1,
      opacity: 1,
      startX: 0,
      startY: 0,
      spriteGroup: 0,
      spriteIndex: 0,
      parallaxWidth: { top: 200, bottom: 80 },
      tile: { x: 1, y: 0, spacingX: 20 },
    };
    renderer.update({
      width: 320,
      height: 240,
      showAxis: false,
      showGrid: false,
      tick: 0,
      stage: {
        id: "tiled",
        displayName: "Tiled",
        floorY: 0,
        zOffset: 200,
        camera: { x: 0, y: 0, zoom: 1 },
        layers: [tiledLayer],
      },
    });
    const tiles = renderer.group.children.filter((child): child is THREE.Mesh => {
      if (!(child instanceof THREE.Mesh)) {
        return false;
      }
      const pos = child.geometry.getAttribute("position") as THREE.BufferAttribute;
      return pos.getX(1) - pos.getX(0) !== pos.getX(3) - pos.getX(2);
    });
    expect(tiles.length).toBeGreaterThan(1);
    expect(renderer.getDiagnostics()[0]?.meshCount).toBe(tiles.length);
    const widths = tiles.map((mesh) => {
      const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
      return {
        top: pos.getX(1) - pos.getX(0),
        bottom: pos.getX(3) - pos.getX(2),
      };
    });
    expect(widths.every((item) => item.top === 200 && item.bottom === 80)).toBe(true);
    const xs = tiles.map((mesh) => mesh.position.x).sort((a, b) => a - b);
    expect(new Set(xs.slice(1).map((x, index) => x - xs[index]!))).toEqual(new Set([220]));

    renderer.update({
      width: 320,
      height: 240,
      showAxis: false,
      showGrid: false,
      tick: 0,
      stage: {
        id: "empty",
        displayName: "Empty",
        floorY: 0,
        zOffset: 200,
        camera: { x: 0, y: 0, zoom: 1 },
        layers: [],
      },
    });
    const remainingTiles = renderer.group.children.filter((child): child is THREE.Mesh => {
      if (!(child instanceof THREE.Mesh)) {
        return false;
      }
      const pos = child.geometry.getAttribute("position") as THREE.BufferAttribute;
      return pos.getX(1) - pos.getX(0) !== pos.getX(3) - pos.getX(2);
    });
    expect(remainingTiles).toHaveLength(0);
    expect(renderer.getDiagnostics()).toHaveLength(0);
    renderer.dispose();
  });

  it("renders a nine-layer loaded stage with sinusoid, trapezoid and linked floor together", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile("stages/composition-nine/stage.def", new TextEncoder().encode(NINE_LAYER_COMPOSITION_DEF));
    vfs.addFile("stages/composition-nine/stage.sff", new Uint8Array([0]));
    const [loaded] = await new MugenStageLoader().loadAll("composition-nine.zip", vfs);
    expect(loaded?.stage.layers).toHaveLength(9);
    expect(loaded?.stage.zOffset).toBe(180);
    expect(loaded?.stage.zOffsetLink).toBe(4);
    expect(loaded?.stage.playerStart.p1.y).toBe(0);
    expect(loaded?.stage.layers.map((layer) => layer.sectionName)).toEqual([
      "BG Sky",
      "BG Far",
      "BG Mid",
      "BG Wave",
      "BG Floor",
      "BG Extra 5",
      "BG Extra 6",
      "BG Extra 7",
      "BG Front",
    ]);
    expect(loaded?.stage.layers[8]).toMatchObject({ layerNo: 1, spriteGroup: 8, spriteIndex: 0 });
    expect(loaded?.stage.layers[3]?.sinusoid).toEqual({ x: { amplitude: 10, period: 8, phase: 0 } });
    expect(loaded?.stage.layers[4]).toMatchObject({
      type: "parallax",
      controlId: 4,
      parallaxWidth: { top: 200, bottom: 80 },
      sinusoid: { y: { amplitude: 10, period: 8, phase: 0 } },
    });
    expect(runtimeStageGameSpace(loaded!.stage)).toMatchObject({ width: 320, height: 240 });

    const report = createStageCompatibilityReport({
      ...loaded!,
      spriteArchive: { version: "v1", sprites: compositionSprites(), warnings: [] },
    });
    expect(report.backgrounds.total).toBe(9);
    expect(report.zOffsetLink).toEqual({ controlId: 4, resolved: true });
    expect(report.backgrounds.layers[4]).toMatchObject({
      section: "BG Floor",
      status: "rendered",
      projected: true,
      parallaxWidth: { top: 200, bottom: 80 },
    });

    const renderer = new AxisRenderer({ getTexture: () => new THREE.Texture() } as unknown as TextureStore);
    renderer.setStageSpriteArchives([
      { stageId: loaded!.stage.id, archive: { version: "v1", sprites: compositionSprites(), warnings: [] } },
    ]);
    const namedTicks = [0, 2, 8] as const;
    const captures = namedTicks.map((tick) => captureCompositionTick(renderer, loaded!.stage, tick, 0));
    const rest = captures[0]!;
    const quarter = captures[1]!;
    const period = captures[2]!;
    const moved = captureCompositionTick(renderer, loaded!.stage, 0, 80);

    expect(rest.diagnostics).toHaveLength(9);
    expect(rest.diagnostics.map((layer) => layer.authoredOrder)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(rest.diagnostics[8]).toMatchObject({ id: loaded!.stage.layers[8]!.id, layerNo: 1, authoredOrder: 8 });
    expect(rest.waveX).toBeCloseTo(quarter.waveX - 10);
    expect(quarter.waveX).not.toBeCloseTo(rest.waveX);
    expect(period.waveX).toBeCloseTo(rest.waveX);
    expect(period.floorY).toBeCloseTo(rest.floorY);
    expect(quarter.floorY).toBeCloseTo(rest.floorY - 10);
    expect(rest.trapezoid).toEqual({ top: 200, bottom: 80, uv: [[0, 1], [1, 1], [0, 0], [1, 0]] });
    expect(quarter.trapezoid).toEqual(rest.trapezoid);
    expect(moved.farX).not.toBeCloseTo(rest.farX);
    expect(moved.trapezoid).toEqual(rest.trapezoid);
    expect(resolveStageLayerForTick(loaded!.stage.layers[3]!, { ...loaded!.stage, camera: { x: 0, y: 0, zoom: 1 } }, 0)?.startX).toBeCloseTo(
      resolveStageLayerForTick(loaded!.stage.layers[3]!, { ...loaded!.stage, camera: { x: 0, y: 0, zoom: 1 } }, 8)?.startX ?? Number.NaN,
    );

    const fighter = compositionFighter();
    const characters = new THREE.Group();
    const boxes = new CollisionBoxRenderer();
    const hitSparks = new THREE.Group();
    const fighterMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
    fighterMesh.position.set(fighter.runtime.pos.x, fighter.runtime.pos.y, 0);
    characters.add(fighterMesh);
    boxes.update([fighter], { showClsn1: false, showClsn2: true });
    const logicalBox = projectCollisionBox(fighter, fighter.clsn2[0]!);
    const boxMesh = boxes.group.children[0] as THREE.Mesh;
    applyLinkedStageFloorPresentation({ characters, boxes: boxes.group, hitSparks }, quarter.floorY);

    expect(loaded!.stage.zOffset).toBe(180);
    expect(loaded!.stage.playerStart.p1.y).toBe(0);
    expect(fighter.runtime.pos.y).toBe(0);
    expect(fighterMesh.position.y).toBe(0);
    expect(boxMesh.position.y).toBeCloseTo(logicalBox.y);
    expect(characters.position.y).toBeCloseTo(quarter.floorY);
    expect(boxes.group.position.y).toBeCloseTo(quarter.floorY);
    expect(hitSparks.position.y).toBeCloseTo(quarter.floorY);
    expect(quarter.floorMeshY).toBeCloseTo(quarter.floorY);
    expect(characters.position.y).toBeCloseTo(quarter.floorMeshY);
    applyLinkedStageFloorPresentation({ characters, boxes: boxes.group, hitSparks }, rest.floorY);
    expect(fighter.runtime.pos.y).toBe(0);
    expect(characters.position.y).toBeCloseTo(rest.floorY);
    boxes.dispose();
    renderer.dispose();
  });
});

function actor(id: string): ActorSnapshot {
  return { id } as ActorSnapshot;
}

function fadeFrame(spriteIndex: number, duration: number): MugenAnimationAction["frames"][number] {
  return {
    spriteGroup: 9000,
    spriteIndex,
    offsetX: 0,
    offsetY: 0,
    duration,
    clsn1: [],
    clsn2: [],
    raw: `${spriteIndex},0,0,0,${duration}`,
    line: spriteIndex,
  };
}

function actionWithDurations(id: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    frames: durations.map((duration, index) => fadeFrame(index, duration)),
    rawLines: [`[Begin Action ${id}]`],
  };
}

function diagnostic(drawRootIds: string[], collisionRootIds = drawRootIds): NonNullable<MugenSnapshot["rootPresentation"]> {
  return {
    schema: "RuntimeRootPresentation/v1",
    mode: "ikemen-tag",
    roots: [],
    drawRootIds,
    cameraRootIds: [],
    collisionRootIds,
  };
}

const NINE_LAYER_COMPOSITION_DEF = `[Info]
name = Composition Nine
displayname = Composition Nine
[Camera]
startx = 0
starty = 0
[PlayerInfo]
p1startx = -40
p1starty = 0
p2startx = 40
p2starty = 0
[StageInfo]
zoffset = 180
zoffsetlink = 4
localcoord = 320,240
[BGDef]
spr = stage.sff
[BG Sky]
type = normal
spriteno = 0,0
start = 0,0
delta = 0.2,1
[BG Far]
type = normal
spriteno = 1,0
start = 0,8
delta = 0.4,1
[BG Mid]
type = normal
spriteno = 2,0
start = 0,16
delta = 0.6,1
[BG Wave]
type = normal
spriteno = 3,0
start = 20,0
delta = 1,1
sin.x = 10,8,0
[BG Floor]
type = parallax
id = 4
spriteno = 4,0
start = 0,12
delta = 1,1
width = 200,80
sin.y = 10,8,0
[BG Extra 5]
type = normal
spriteno = 5,0
start = 0,24
delta = 1,1
[BG Extra 6]
type = normal
spriteno = 6,0
start = 0,32
delta = 1,1
[BG Extra 7]
type = normal
spriteno = 7,0
start = 0,40
delta = 1,1
[BG Front]
type = normal
layerno = 1
spriteno = 8,0
start = 0,0
delta = 1,1
`;

function compositionSprites(): MugenSprite[] {
  return Array.from({ length: 9 }, (_, index) => ({
    group: index,
    index: 0,
    width: 100,
    height: 40,
    axisX: 50,
    axisY: 20,
  }));
}

function compositionSnapshot(stage: MugenStageDefinition, cameraX: number): StageSnapshot {
  return {
    id: stage.id,
    displayName: stage.displayName,
    floorY: stage.floorY,
    zOffset: stage.zOffset,
    zOffsetLink: stage.zOffsetLink,
    bounds: stage.bounds,
    camera: { x: cameraX, y: 0, zoom: 1 },
    layers: stage.layers,
    animations: stage.animations,
    bgControllers: stage.bgControllers,
  };
}

function captureCompositionTick(renderer: AxisRenderer, stage: MugenStageDefinition, tick: number, cameraX: number) {
  const snapshot = compositionSnapshot(stage, cameraX);
  renderer.update({ width: 640, height: 360, showAxis: false, showGrid: false, tick, stage: snapshot });
  const diagnostics = renderer.getDiagnostics();
  const layerMeshCount = diagnostics.reduce((count, layer) => count + layer.meshCount, 0);
  const far = renderer.group.children[1] as THREE.Mesh;
  const wave = renderer.group.children[3] as THREE.Mesh;
  const trapezoidMesh = renderer.group.children[4] as THREE.Mesh;
  const floor = renderer.group.children[layerMeshCount] as THREE.Mesh;
  const position = trapezoidMesh.geometry.getAttribute("position") as THREE.BufferAttribute;
  const uv = trapezoidMesh.geometry.getAttribute("uv") as THREE.BufferAttribute;
  return {
    diagnostics,
    farX: far.position.x,
    waveX: wave.position.x,
    floorY: resolveStageZOffsetLink(snapshot, tick).floorY,
    floorMeshY: floor.position.y,
    trapezoid: {
      top: position.getX(1) - position.getX(0),
      bottom: position.getX(3) - position.getX(2),
      uv: Array.from({ length: uv.count }, (_, index) => [uv.getX(index), uv.getY(index)]),
    },
  };
}

function compositionFighter(): ActorSnapshot {
  return {
    id: "p1",
    runtime: { pos: { x: -40, y: 0 }, facing: 1 },
    clsn1: [],
    clsn2: [{ x1: -10, y1: 0, x2: 10, y2: 60 }],
  } as ActorSnapshot;
}

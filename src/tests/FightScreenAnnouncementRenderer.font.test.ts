/** @vitest-environment jsdom */

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { FightScreenAnnouncementRenderer } from "../game/render/FightScreenAnnouncementRenderer";
import { TextureStore } from "../game/render/TextureStore";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenFightScreenAssets, MugenFightScreenFont } from "../mugen/model/MugenSystemAssets";
import type { MugenSnapshot } from "../mugen/runtime/types";

describe("FightScreenAnnouncementRenderer bitmap text", () => {
  it("renders a loaded FNT bitmap string through reusable glyph meshes", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    const font = createFont("Round 2");
    const assets: MugenFightScreenAssets = {
      sourcePath: "data/fight.def",
      animations: new Map(),
      display: {
        round: new Map(),
        roundDefault: {
          text: "Round %i",
          font: [1, 0, 0],
          offset: [160, 100],
        },
      },
      fonts: new Map([[1, font]]),
      diagnostics: [],
    };
    renderer.setAssets(assets);

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      active: true,
      resolved: true,
      text: "Round 2",
      font: { index: 1, bank: 0, alignment: 0, format: "bitmap" },
      glyphCount: 6,
      textLineCount: 1,
      paletteBank: { requested: 0, resolved: 0, source: "missing" },
    });
    renderer.dispose();
    textures.dispose();
  });

  it("presents a non-zero indexed font bank through the FightScreen path", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    const font = createFont("A");
    const glyph = font.spriteArchive!.sprites[0]!;
    glyph.indexed = {
      pixels: new Uint8Array([1]),
      palette: {
        bytes: new Uint8Array([0, 0, 0, 0, 1, 2, 3, 255]),
        stride: 4,
        transparentIndex: 0,
        key: "glyph-default",
      },
    };
    font.spriteArchive!.paletteBanks = [
      { slot: 0, group: 0, index: 0, colors: 256, bytes: new Uint8Array([0, 0, 0, 0, 10, 20, 30, 255]), stride: 4 },
      { slot: 1, group: 0, index: 1, colors: 256, bytes: new Uint8Array([0, 0, 0, 0, 40, 50, 60, 255]), stride: 4 },
    ];
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map(),
      display: {
        round: new Map(),
        roundDefault: { text: "A", font: [1, 1, 0], offset: [160, 100] },
      },
      fonts: new Map([[1, font]]),
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      resolved: true,
      paletteBank: { requested: 1, resolved: 1, source: "sff" },
      glyphCount: 1,
    });
    renderer.dispose();
    textures.dispose();
  });

  it("renders bounded top/background layouts with static sprites and AIR frames", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    const action: MugenAnimationAction = {
      id: 7002,
      frames: [{
        spriteGroup: 9100,
        spriteIndex: 0,
        offsetX: 2,
        offsetY: -1,
        duration: 3,
        flip: "",
        clsn1: [],
        clsn2: [],
        raw: "9100,0,2,-1,3",
        line: 1,
      }],
      rawLines: [],
    };
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map([[7002, action]]),
      display: {
        round: new Map(),
        roundDefault: {
          background: [
            { animationNo: 7002, offset: [160, 100], layerNo: 0, window: [140, 80, 40, 40] },
            { sprite: [9100, 0], offset: [160, 100], angle: 15, window: [140, 80, 40, 40] },
          ],
          top: {
            sprite: [9100, 1],
            offset: [160, 120],
            facing: -1,
            layerNo: 1,
            angle: 15,
            paletteFx: {
              time: 3,
              add: [32, 0, 0],
              mul: [64, 32, 32],
              color: 128,
              invertAll: true,
            },
          },
        },
      },
      spriteArchive: {
        version: "v1",
        sprites: [
          createSprite(9100, 0, 24, 12),
          createSprite(9100, 1, 16, 8),
        ],
        warnings: [],
      },
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      active: true,
      resolved: true,
      backgroundLayerCount: 2,
      backgroundResolved: 1,
      topLayerCount: 1,
      topResolved: 1,
      windowApplied: 1,
      windowCulled: 0,
      layerNoApplied: 2,
      layerNoCulled: 0,
      angleApplied: 1,
      angleCulled: 1,
      paletteFxApplied: 1,
      paletteFxExpired: 0,
    });
    const backgroundGroup = renderer.group.children[0]!;
    const topGroup = renderer.group.children[3]!;
    expect(backgroundGroup.children[0]?.renderOrder).toBeLessThan(topGroup.children[0]?.renderOrder ?? Number.POSITIVE_INFINITY);
    expect(topGroup.children[0]?.rotation.z).toBeCloseTo(15 * Math.PI / 180);
    const topMesh = topGroup.children[0] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    expect(topMesh.material.color.getHex()).not.toBe(0xffffff);
    await renderer.update(snapshot(3), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });
    expect(renderer.getDiagnostics()).toMatchObject({ paletteFxApplied: 0, paletteFxExpired: 1 });
    expect(topMesh.material.color.getHex()).toBe(0xffffff);
    renderer.dispose();
    textures.dispose();
  });
});

function createSprite(group: number, index: number, width: number, height: number) {
  return {
    group,
    index,
    width,
    height,
    axisX: 0,
    axisY: 0,
    canvas: document.createElement("canvas"),
  };
}

function createFont(text: string): MugenFightScreenFont {
  const characters = [...new Set([...text].filter((character) => character !== " "))];
  return {
    index: 1,
    sourcePath: "font/standard.def",
    format: "bitmap",
    bankType: "palette",
    size: [8, 12],
    spacing: [1, 0],
    offset: [0, 0],
    spriteArchive: {
      version: "v1",
      sprites: characters.map((character) => ({
        group: 0,
        index: character.codePointAt(0)!,
        width: 6,
        height: 8,
        axisX: 0,
        axisY: 8,
        canvas: document.createElement("canvas"),
      })),
      warnings: [],
    },
    diagnostics: [],
  };
}

function snapshot(elapsed = 0): MugenSnapshot {
  return {
    round: {
      announcement: {
        schema: "RuntimeRoundAnnouncement/v0",
        visibility: "visible",
        phase: "round",
        roundNo: 2,
        mode: "normal",
        round: {
          phase: "active",
          skipped: false,
          elapsed,
          animationStart: 0,
          soundTime: 0,
          soundDue: false,
        },
        fight: {
          phase: "pending",
          skipped: false,
          elapsed: 0,
          animationStart: 0,
          soundTime: 0,
          soundDue: false,
        },
        roundDisplaySkipped: false,
        fightDisplaySkipped: false,
        callFightElapsed: 0,
        completion: "asset-owned",
        timing: {} as never,
      },
    },
  } as unknown as MugenSnapshot;
}

/** @vitest-environment jsdom */

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  FightScreenAnnouncementRenderer,
  resolveFightScreenAnnouncementSelection,
  resolveFightScreenOutcomeKind,
} from "../game/render/FightScreenAnnouncementRenderer";
import { TextureStore } from "../game/render/TextureStore";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type {
  MugenFightScreenAssets,
  MugenFightScreenDisplayDefinitions,
  MugenFightScreenFont,
} from "../mugen/model/MugenSystemAssets";
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

  it("shares the AnimTextSnd layout with FSText and clips transformed glyphs", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map(),
      display: {
        round: new Map(),
        roundDefault: {
          text: "A",
          font: [1, 0, 0],
          offset: [160, 100],
          layout: {
            angle: 12,
            xShear: 0.15,
            window: [140, 80, 40, 40],
          },
        },
      },
      fonts: new Map([[1, createFont("A")]]),
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      resolved: true,
      text: "A",
      textTransform: {
        windowApplied: 1,
        windowCulled: 0,
        angleApplied: 1,
        xShearApplied: 1,
      },
    });
    const textGroup = renderer.group.children[2]!;
    const textMesh = textGroup.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
    expect(textMesh.userData.fightScreenPolygonGeometry).toBe(true);
    expect((textMesh.geometry.getAttribute("position") as THREE.BufferAttribute).count).toBeGreaterThanOrEqual(3);
    expect(textMesh.rotation.z).toBe(0);
    renderer.dispose();
    textures.dispose();
  });

  it("selects and renders the bounded KO display family from the round outcome", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    const font = createFont("KO");
    const display: MugenFightScreenDisplayDefinitions = {
      round: new Map(),
      ko: { text: "KO", font: [1, 0, 0], offset: [160, 100] },
      doubleKo: { text: "Double KO", font: [1, 0, 0], offset: [160, 100] },
      timeOver: { text: "Time Over", font: [1, 0, 0], offset: [160, 100] },
      draw: { text: "Draw", font: [1, 0, 0], offset: [160, 100] },
    };
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map(),
      display,
      fonts: new Map([[1, font]]),
      diagnostics: [],
    });

    const outcome = outcomeSnapshot("ko", "Nova Boxer");
    await renderer.update(outcome, { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      active: true,
      resolved: true,
      kind: "ko",
      text: "KO",
      glyphCount: 2,
    });
    expect(resolveFightScreenAnnouncementSelection(outcome.round, display)).toMatchObject({ kind: "ko" });
    expect(resolveFightScreenAnnouncementSelection(outcomeSnapshot("ko", "Draw").round, display)).toMatchObject({
      kind: "double-ko",
      asset: display.doubleKo,
    });
    expect(resolveFightScreenAnnouncementSelection(outcomeSnapshot("timeover", "Nova Boxer").round, display)).toMatchObject({
      kind: "time-over",
      asset: display.timeOver,
    });
    expect(resolveFightScreenAnnouncementSelection(outcomeSnapshot("timeover", "Draw").round, display)).toMatchObject({
      kind: "draw",
      asset: display.draw,
    });
    expect(resolveFightScreenOutcomeKind(outcomeSnapshot("ko", "Draw").round!)).toBe("double-ko");
    renderer.dispose();
    textures.dispose();
  });

  it("applies the FSText palette effect while preserving authored font color", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    const font = createFont("A");
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map(),
      display: {
        round: new Map(),
        roundDefault: {
          text: "A",
          font: [1, 0, 0],
          fontColor: [128, 255, 255, 255],
          displayTime: 10,
          textPaletteFx: {
            time: 3,
            add: [16, 0, 0],
            mul: [128, 64, 64],
            color: 192,
          },
        },
      },
      fonts: new Map([[1, font]]),
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({ text: "A", textPaletteFxApplied: 1, textPaletteFxExpired: 0 });
    const textGroup = renderer.group.children[2]!;
    const textMesh = textGroup.children[0] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    expect(textMesh.material.color.r).toBeLessThan(128 / 255);

    await renderer.update(snapshot(3), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({ textPaletteFxApplied: 0, textPaletteFxExpired: 1 });
    expect(textMesh.material.color.r).toBeCloseTo(128 / 255);
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

  it("applies the primary AnimTextSnd palette effect for its active frame window", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    const action: MugenAnimationAction = {
      id: 7002,
      frames: [{
        spriteGroup: 9100,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 10,
        flip: "",
        clsn1: [],
        clsn2: [],
        raw: "9100,0,0,0,10",
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
          animationNo: 7002,
          paletteFx: {
            time: 3,
            add: [32, 0, 0],
            mul: [64, 32, 32],
            color: 128,
            invertAll: true,
          },
          layout: {
            angle: 12,
            xAngle: 4,
            yAngle: -6,
            xShear: 0.15,
          },
        },
      },
      spriteArchive: {
        version: "v1",
        sprites: [createSprite(9100, 0, 24, 12)],
        warnings: [],
      },
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      actionNo: 7002,
      primaryPaletteFxApplied: 1,
      primaryPaletteFxExpired: 0,
      primaryTransform: {
        angleApplied: 1,
        xAngleApplied: 1,
        yAngleApplied: 1,
        xShearApplied: 1,
      },
    });
    const primaryMesh = renderer.group.children[1] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    expect(primaryMesh.material.color.getHex()).not.toBe(0xffffff);
    expect(primaryMesh.rotation.z).toBeCloseTo(12 * Math.PI / 180);
    expect(primaryMesh.rotation.x).toBeCloseTo(-4 * Math.PI / 180);
    expect(primaryMesh.rotation.y).toBeCloseTo(-6 * Math.PI / 180);

    await renderer.update(snapshot(3), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({ primaryPaletteFxApplied: 0, primaryPaletteFxExpired: 1 });
    expect(primaryMesh.material.color.getHex()).toBe(0xffffff);
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
            {
              sprite: [9100, 0],
              offset: [160, 100],
              angle: 15,
              xAngle: 5,
              yAngle: -6,
              xShear: 0.25,
              window: [140, 80, 40, 40],
            },
          ],
          top: {
            sprite: [9100, 1],
            offset: [160, 120],
            facing: -1,
            layerNo: 1,
            angle: 15,
            xAngle: 10,
            yAngle: -20,
            xShear: -0.25,
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
      backgroundResolved: 2,
      topLayerCount: 1,
      topResolved: 1,
      windowApplied: 2,
      windowCulled: 0,
      layerNoApplied: 2,
      layerNoCulled: 0,
      angleApplied: 2,
      angleCulled: 0,
      xAngleApplied: 2,
      xAngleCulled: 0,
      yAngleApplied: 2,
      yAngleCulled: 0,
      xShearApplied: 2,
      xShearCulled: 0,
      paletteFxApplied: 1,
      paletteFxExpired: 0,
    });
    const backgroundGroup = renderer.group.children[0]!;
    const topGroup = renderer.group.children[3]!;
    expect(backgroundGroup.children[0]?.renderOrder).toBeLessThan(topGroup.children[0]?.renderOrder ?? Number.POSITIVE_INFINITY);
    expect(backgroundGroup.children[1]?.userData.fightScreenPolygonGeometry).toBe(true);
    const clippedBackground = backgroundGroup.children[1] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
    expect((clippedBackground.geometry.getAttribute("position") as THREE.BufferAttribute).count).toBeGreaterThanOrEqual(3);
    expect(topGroup.children[0]?.rotation.z).toBeCloseTo(15 * Math.PI / 180);
    expect(topGroup.children[0]?.rotation.x).toBeCloseTo(-10 * Math.PI / 180);
    expect(topGroup.children[0]?.rotation.y).toBeCloseTo(-20 * Math.PI / 180);
    const topMesh = topGroup.children[0] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    expect(topMesh.material.color.getHex()).not.toBe(0xffffff);
    expect((topMesh.geometry.getAttribute("position") as THREE.BufferAttribute).getX(0)).not.toBe(-0.5);
    await renderer.update(snapshot(3), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });
    expect(renderer.getDiagnostics()).toMatchObject({ paletteFxApplied: 0, paletteFxExpired: 1 });
    expect(topMesh.material.color.getHex()).toBe(0xffffff);
    renderer.dispose();
    textures.dispose();
  });

  it("projects a perspective layout quad with finite focal length", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map(),
      display: {
        round: new Map(),
        roundDefault: {
          top: {
            sprite: [9100, 0],
            offset: [160, 120],
            projection: "perspective",
            focalLength: 96,
            angle: 8,
            xAngle: 24,
            yAngle: -16,
            xShear: 0.2,
          },
        },
      },
      spriteArchive: {
        version: "v1",
        sprites: [createSprite(9100, 0, 24, 12)],
        warnings: [],
      },
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      resolved: true,
      topResolved: 1,
      projectionApplied: 1,
      projectionCulled: 0,
      focalLengthApplied: 1,
      focalLengthCulled: 0,
    });
    const topGroup = renderer.group.children[3]!;
    const topMesh = topGroup.children[0] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    const position = topMesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const topWidth = Math.abs(position.getX(1) - position.getX(0));
    const bottomWidth = Math.abs(position.getX(3) - position.getX(2));
    expect(topMesh.scale.x).toBe(1);
    expect(topMesh.rotation.x).toBe(0);
    expect(topMesh.rotation.y).toBe(0);
    expect(topWidth).not.toBeCloseTo(bottomWidth, 2);
    renderer.dispose();
    textures.dispose();
  });

  it("keeps perspective2 layouts explicit and culled", async () => {
    const textures = new TextureStore();
    const renderer = new FightScreenAnnouncementRenderer(textures);
    renderer.setAssets({
      sourcePath: "data/fight.def",
      animations: new Map(),
      display: {
        round: new Map(),
        roundDefault: {
          background: [{ sprite: [9100, 0], offset: [140, 120] }],
          top: {
            sprite: [9100, 0],
            offset: [180, 120],
            projection: "perspective2",
            focalLength: 64,
          },
        },
      },
      spriteArchive: {
        version: "v1",
        sprites: [createSprite(9100, 0, 24, 12)],
        warnings: [],
      },
      diagnostics: [],
    });

    await renderer.update(snapshot(), { x: 0, y: 0, width: 640, height: 360, zoom: 1 });

    expect(renderer.getDiagnostics()).toMatchObject({
      resolved: true,
      backgroundResolved: 1,
      topResolved: 0,
      projectionApplied: 0,
      projectionCulled: 1,
      focalLengthApplied: 0,
      focalLengthCulled: 1,
    });
    expect(renderer.group.children[3]?.visible).toBe(false);
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

function outcomeSnapshot(state: "ko" | "timeover", winner: string, frame = 0): MugenSnapshot {
  const base = snapshot();
  return {
    ...base,
    round: {
      ...(base.round ?? {}),
      state,
      timer: 0,
      roundNo: 2,
      winner,
      message: state === "timeover"
        ? winner === "Draw" ? "Time over - draw" : "Time over"
        : winner === "Draw" ? "Double KO" : `${winner} wins`,
      announcement: undefined,
      postRound: {
        schema: "RuntimePostRound/v0",
        frame,
        remaining: Math.max(0, 255 - frame),
        duration: 255,
        slowRemaining: 0,
        slowDuration: 0,
        playbackRate: 1,
        noKoSlow: false,
      },
    },
  };
}

import * as THREE from "three";
import type {
  MugenFightScreenAssets,
  MugenFightScreenDisplayAsset,
  MugenFightScreenDisplayDefinitions,
  MugenFightScreenFont,
} from "../../mugen/model/MugenSystemAssets";
import type { MugenAnimationAction, MugenAnimationFrame } from "../../mugen/model/MugenAnimation";
import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";
import type { RuntimeRoundAnnouncementSnapshot } from "../../mugen/runtime/RuntimeRoundAnnouncementSystem";
import type { MugenSnapshot, RoundSnapshot } from "../../mugen/runtime/types";
import { SffSpriteProvider } from "../textures/SffSpriteProvider";
import { applyThreePresentationOrder, resolvePresentationOrder } from "./PresentationOrder";
import { resolveRoundFadeAnimationFrame } from "./RoundFadeRenderer";
import { TextureStore } from "./TextureStore";
import { resolveFightScreenAnnouncementCompletion } from "../../mugen/runtime/FightScreenAnimationSemantics";
import {
  formatFightScreenText,
  layoutFightScreenFontText,
  resolveFightScreenFontPalette,
} from "./FightScreenFontRenderer";

export type FightScreenAnnouncementViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  coordinateWidth: number;
  coordinateHeight: number;
};

export type FightScreenAnnouncementDiagnostics = {
  active: boolean;
  configured: boolean;
  resolved: boolean;
  kind?: "round" | "fight";
  mode?: RuntimeRoundAnnouncementSnapshot["mode"];
  roundNo?: number;
  actionNo?: number;
  frameIndex?: number;
  frameTick?: number;
  displayTime?: number;
  text?: string;
  font?: { index: number; bank: number; alignment: number; format: MugenFightScreenFont["format"] };
  glyphCount?: number;
  missingCharacters?: string[];
  textWidth?: number;
  textLineCount?: number;
  paletteBank?: {
    requested: number;
    resolved: number;
    source: "sff" | "sprite" | "missing";
  };
  animationEndFrame?: number;
  animationComplete?: boolean;
  completionReason?: string;
  sprite?: { group: number; index: number; width: number; height: number; axisX: number; axisY: number };
  placement?: FightScreenAnnouncementPlacement;
  meshRenderOrder?: number;
  fallbackReason?: string;
};

export type FightScreenAnnouncementPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
};

type FightScreenAnnouncementSelection = {
  kind: "round" | "fight";
  track: RuntimeRoundAnnouncementSnapshot["round"];
  asset?: MugenFightScreenDisplayAsset;
  mode: RuntimeRoundAnnouncementSnapshot["mode"];
  roundNo: number;
};

type FightScreenMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

type FightScreenTextRenderResult = {
  rendered: boolean;
  text?: string;
  font?: { index: number; bank: number; alignment: number; format: MugenFightScreenFont["format"] };
  glyphCount?: number;
  missingCharacters?: string[];
  textWidth?: number;
  textLineCount?: number;
  paletteBank?: {
    requested: number;
    resolved: number;
    source: "sff" | "sprite" | "missing";
  };
  fallbackReason?: string;
};

export class FightScreenAnnouncementRenderer {
  readonly group = new THREE.Group();
  private readonly mesh: FightScreenMesh;
  private readonly textGroup = new THREE.Group();
  private readonly textMeshes: Array<FightScreenMesh | undefined> = [];
  private animations = new Map<number, MugenAnimationAction>();
  private display?: MugenFightScreenDisplayDefinitions;
  private fonts = new Map<number, MugenFightScreenFont>();
  private spriteProvider?: SpriteProvider;
  private coordinate: [number, number] = [320, 240];
  private diagnostics: FightScreenAnnouncementDiagnostics = {
    active: false,
    configured: false,
    resolved: false,
  };

  constructor(private readonly textures: TextureStore) {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
      }),
    );
    this.mesh.visible = false;
    this.group.add(this.mesh);
    this.textGroup.visible = false;
    this.group.add(this.textGroup);
  }

  setAssets(assets: MugenFightScreenAssets | undefined): void {
    this.animations = assets?.animations ? new Map(assets.animations) : new Map();
    this.display = assets?.display;
    this.fonts = assets?.fonts ? new Map(assets.fonts) : new Map();
    this.spriteProvider = assets?.spriteArchive ? new SffSpriteProvider(assets.spriteArchive) : undefined;
    this.coordinate = assets?.localCoord ?? [320, 240];
    this.mesh.visible = false;
    this.hideTextMeshes();
    this.diagnostics = {
      active: false,
      configured: Boolean(this.display) || this.animations.size > 0 || this.fonts.size > 0,
      resolved: false,
      ...(!this.display ? { fallbackReason: "FightScreen display definitions are not available." } : {}),
    };
  }

  async update(snapshot: MugenSnapshot, viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">): Promise<void> {
    const selection = resolveFightScreenAnnouncementSelection(snapshot.round, this.display);
    const baseDiagnostics: FightScreenAnnouncementDiagnostics = {
      active: Boolean(selection),
      configured: Boolean(this.display) || this.animations.size > 0 || this.fonts.size > 0,
      resolved: false,
      ...(selection?.kind ? { kind: selection.kind } : {}),
      ...(selection?.mode ? { mode: selection.mode } : {}),
      ...(selection ? { roundNo: selection.roundNo } : {}),
    };
    if (!selection) {
      this.hide(baseDiagnostics);
      return;
    }
    if (!selection.asset) {
      this.hide({
        ...baseDiagnostics,
        fallbackReason: `No FightScreen ${selection.kind} display definition is available.`,
      });
      return;
    }

    const actionNo = selection.asset.animationNo;
    const action = actionNo === undefined ? undefined : this.animations.get(actionNo);
    const frameTick = announcementFrameTick(selection.track);
    const completion = resolveFightScreenAnnouncementCompletion(
      this.display,
      this.animations,
      selection.kind,
      selection.mode,
      selection.roundNo,
    );
    const displayTime = selection.asset.displayTime;
    const textCanUseImmediateCompletion = (!action || actionNo === undefined)
      && Boolean(selection.asset.text && selection.asset.font)
      && completion?.frame === 0
      && frameTick === 0;
    if (completion && frameTick >= completion.frame && !textCanUseImmediateCompletion) {
      this.hide({
        ...baseDiagnostics,
        ...(actionNo === undefined ? {} : { actionNo }),
        frameTick,
        animationEndFrame: completion.frame,
        animationComplete: true,
        completionReason: completion.reason,
        displayTime,
        fallbackReason: "FightScreen AnimTextSnd completion reached.",
      });
      return;
    }
    if (actionNo === undefined) {
      const textResult = this.renderText(selection.asset, selection.roundNo, viewport);
      if (textResult.rendered) {
        const { rendered: _rendered, ...textDiagnostics } = textResult;
        this.diagnostics = {
          ...baseDiagnostics,
          configured: true,
          resolved: true,
          frameTick,
          ...(completion ? {
            animationEndFrame: completion.frame,
            animationComplete: false,
            completionReason: completion.reason,
          } : {}),
          ...(displayTime === undefined ? {} : { displayTime }),
          ...textDiagnostics,
        };
        return;
      }
      this.hide({
        ...baseDiagnostics,
        frameTick,
        ...(completion ? {
          animationEndFrame: completion.frame,
          animationComplete: false,
          completionReason: completion.reason,
        } : {}),
        ...(displayTime === undefined ? {} : { displayTime }),
        fallbackReason: textResult.fallbackReason ?? "FightScreen display has no AIR animation or renderable FNT text.",
      });
      return;
    }
    if (!action) {
      const textResult = this.renderText(selection.asset, selection.roundNo, viewport);
      if (textResult.rendered) {
        const { rendered: _rendered, ...textDiagnostics } = textResult;
        this.diagnostics = {
          ...baseDiagnostics,
          configured: true,
          resolved: true,
          actionNo,
          frameTick,
          ...(completion ? {
            animationEndFrame: completion.frame,
            animationComplete: false,
            completionReason: completion.reason,
          } : {}),
          ...(displayTime === undefined ? {} : { displayTime }),
          ...textDiagnostics,
        };
        return;
      }
      this.hide({
        ...baseDiagnostics,
        actionNo,
        frameTick,
        ...(completion ? {
          animationEndFrame: completion.frame,
          animationComplete: false,
          completionReason: completion.reason,
        } : {}),
        ...(displayTime === undefined ? {} : { displayTime }),
        fallbackReason: textResult.fallbackReason ?? `FightScreen AIR action ${actionNo} is unavailable.`,
      });
      return;
    }
    const animationFrame = resolveRoundFadeAnimationFrame(action, frameTick);
    if (!animationFrame) {
      this.hide({
        ...baseDiagnostics,
        actionNo,
        frameTick,
        ...(completion ? {
          animationEndFrame: completion.frame,
          animationComplete: false,
          completionReason: completion.reason,
        } : {}),
        ...(displayTime === undefined ? {} : { displayTime }),
        fallbackReason: `FightScreen AIR action ${actionNo} has no drawable frames.`,
      });
      return;
    }
    const sprite = await this.spriteProvider?.getSprite(
      animationFrame.frame.spriteGroup,
      animationFrame.frame.spriteIndex,
    );
    if (!sprite) {
      this.hide({
        ...baseDiagnostics,
        actionNo,
        frameIndex: animationFrame.frameIndex,
        frameTick,
        ...(completion ? {
          animationEndFrame: completion.frame,
          animationComplete: false,
          completionReason: completion.reason,
        } : {}),
        ...(displayTime === undefined ? {} : { displayTime }),
        fallbackReason: `FightScreen AIR action ${actionNo} frame ${animationFrame.frameIndex} references missing sprite ${animationFrame.frame.spriteGroup},${animationFrame.frame.spriteIndex}.`,
      });
      return;
    }

    const placement = projectFightScreenSprite(viewport, this.coordinate, sprite, animationFrame.frame, selection.asset);
    this.hideTextMeshes();
    this.mesh.visible = true;
    this.mesh.position.set(placement.x, placement.y, 10.4);
    this.mesh.scale.set(placement.scaleX, placement.scaleY, 1);
    this.mesh.material.map = this.textures.getTexture(sprite, "fight-screen");
    this.mesh.material.color.setHex(0xffffff);
    this.mesh.material.opacity = 1;
    this.mesh.material.blending = isAdditiveBlend(animationFrame.frame.blend) ? THREE.AdditiveBlending : THREE.NormalBlending;
    applyThreePresentationOrder(
      this.mesh,
      this.mesh.material,
      resolvePresentationOrder({
        profile: "unknown",
        phase: "overlay",
        sourceKind: "overlay",
        blendPolicy: isAdditiveBlend(animationFrame.frame.blend) ? "additive" : "alpha",
        priority: 4,
        tieBreaker: 20,
        tiePolicy: "explicit",
      }),
    );
    this.mesh.material.needsUpdate = true;
    this.diagnostics = {
      ...baseDiagnostics,
      active: true,
      configured: true,
      resolved: true,
      actionNo,
      frameIndex: animationFrame.frameIndex,
      frameTick,
      ...(completion ? {
        animationEndFrame: completion.frame,
        animationComplete: false,
        completionReason: completion.reason,
      } : {}),
      ...(displayTime === undefined ? {} : { displayTime }),
      sprite: {
        group: sprite.group,
        index: sprite.index,
        width: sprite.width,
        height: sprite.height,
        axisX: sprite.axisX,
        axisY: sprite.axisY,
      },
      placement,
      meshRenderOrder: this.mesh.renderOrder,
    };
  }

  getDiagnostics(): FightScreenAnnouncementDiagnostics {
    return structuredClone(this.diagnostics);
  }

  getCoordinate(): [number, number] {
    return [...this.coordinate] as [number, number];
  }

  dispose(): void {
    this.group.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    for (const textMesh of this.textMeshes) {
      if (!textMesh) continue;
      this.textGroup.remove(textMesh);
      textMesh.geometry.dispose();
      textMesh.material.dispose();
    }
    this.textMeshes.length = 0;
  }

  private hide(diagnostics: FightScreenAnnouncementDiagnostics): void {
    this.mesh.visible = false;
    this.hideTextMeshes();
    this.diagnostics = diagnostics;
  }

  private renderText(
    asset: MugenFightScreenDisplayAsset,
    roundNo: number,
    viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
  ): FightScreenTextRenderResult {
    const textTemplate = asset.text;
    const fontTuple = asset.font;
    if (!textTemplate || !fontTuple) {
      return { rendered: false };
    }
    const [fontIndex, bank, alignment] = fontTuple;
    const font = this.fonts.get(fontIndex);
    if (!font) {
      return {
        rendered: false,
        fallbackReason: `FightScreen font ${fontIndex} is not loaded.`,
      };
    }
    if (font.format !== "bitmap") {
      return {
        rendered: false,
        font: { index: fontIndex, bank, alignment, format: font.format },
        fallbackReason: `FightScreen font ${fontIndex} uses unsupported ${font.format} rendering.`,
      };
    }
    if (!font.spriteArchive) {
      return {
        rendered: false,
        font: { index: fontIndex, bank, alignment, format: font.format },
        fallbackReason: `FightScreen font ${fontIndex} has no decoded glyph SFF.`,
      };
    }

    const paletteResolution = resolveFightScreenFontPalette(font, bank);
    const text = formatFightScreenText(textTemplate, roundNo);
    const layout = layoutFightScreenFontText(font, text, bank, alignment);
    const origin = asset.offset ?? [0, 0];
    const fontHeight = font.height ?? font.size[1];
    const baseOffset: [number, number] = [
      origin[0] + font.offset[0],
      origin[1] + font.offset[1] - fontHeight + 1,
    ];
    this.mesh.visible = false;
    this.hideTextMeshes();
    for (const [glyphIndex, glyph] of layout.glyphs.entries()) {
      if (!glyph.sprite) continue;
      const textMesh = this.ensureTextMesh(glyphIndex);
      const placement = projectFightScreenSprite(
        viewport,
        this.coordinate,
        glyph.sprite,
        { offsetX: glyph.x, offsetY: -glyph.line * layout.lineHeight, flip: "" },
        { ...asset, offset: baseOffset },
      );
      textMesh.visible = true;
      textMesh.position.set(placement.x, placement.y, 10.45);
      textMesh.scale.set(placement.scaleX, placement.scaleY, 1);
      textMesh.material.map = this.textures.getTexture(glyph.sprite, `fight-screen-font-${fontIndex}-${font.sourcePath}`);
      const color = asset.fontColor ?? [255, 255, 255, 255];
      textMesh.material.color.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
      textMesh.material.opacity = Math.max(0, Math.min(1, color[3] / 255));
      textMesh.material.blending = THREE.NormalBlending;
      applyThreePresentationOrder(
        textMesh,
        textMesh.material,
        resolvePresentationOrder({
          profile: "unknown",
          phase: "overlay",
          sourceKind: "overlay",
          blendPolicy: "alpha",
          priority: 4,
          tieBreaker: 21 + glyphIndex,
          tiePolicy: "explicit",
        }),
      );
      textMesh.material.needsUpdate = true;
    }
    this.textGroup.visible = true;
    return {
      rendered: true,
      text,
      font: { index: fontIndex, bank, alignment, format: font.format },
      glyphCount: layout.glyphs.filter((glyph) => glyph.sprite).length,
      paletteBank: {
        requested: paletteResolution.requestedBank,
        resolved: paletteResolution.resolvedBank,
        source: paletteResolution.source,
      },
      ...(layout.missingCharacters.length > 0 ? { missingCharacters: layout.missingCharacters } : {}),
      textWidth: layout.width,
      textLineCount: layout.lines.length,
    };
  }

  private ensureTextMesh(index: number): FightScreenMesh {
    const existing = this.textMeshes[index];
    if (existing) return existing;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    );
    this.textMeshes[index] = mesh;
    this.textGroup.add(mesh);
    return mesh;
  }

  private hideTextMeshes(): void {
    this.textGroup.visible = false;
    for (const mesh of this.textMeshes) {
      if (!mesh) continue;
      mesh.visible = false;
    }
  }
}

export function resolveFightScreenAnnouncementSelection(
  round: RoundSnapshot | undefined,
  display: MugenFightScreenDisplayDefinitions | undefined,
): FightScreenAnnouncementSelection | undefined {
  const announcement = round?.announcement;
  if (!announcement || announcement.visibility !== "visible") {
    return undefined;
  }
  if (announcement.phase === "round") {
    return {
      kind: "round",
      track: announcement.round,
      asset: resolveRoundDisplayAsset(display, announcement.mode, announcement.roundNo),
      mode: announcement.mode,
      roundNo: announcement.roundNo,
    };
  }
  if (announcement.phase === "fight") {
    return {
      kind: "fight",
      track: announcement.fight,
      asset: display?.fight,
      mode: announcement.mode,
      roundNo: announcement.roundNo,
    };
  }
  return undefined;
}

export function resolveRoundDisplayAsset(
  display: MugenFightScreenDisplayDefinitions | undefined,
  mode: RuntimeRoundAnnouncementSnapshot["mode"],
  roundNo: number,
): MugenFightScreenDisplayAsset | undefined {
  if (!display) return undefined;
  const candidates = mode === "single"
    ? [display.roundSingle, display.roundDefault]
    : mode === "final"
      ? [display.roundFinal, display.roundDefault]
      : [display.round.get(roundNo), display.roundDefault];
  return candidates.find((asset) => asset !== undefined && (asset.animationNo !== undefined || asset.text !== undefined));
}

export function projectFightScreenSprite(
  viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
  coordinate: [number, number],
  sprite: Pick<MugenSprite, "width" | "height" | "axisX" | "axisY">,
  frame: Pick<MugenAnimationFrame, "offsetX" | "offsetY" | "flip">,
  asset: Pick<MugenFightScreenDisplayAsset, "offset" | "scale" | "facing" | "vfacing">,
): FightScreenAnnouncementPlacement {
  const zoom = Math.max(0.01, viewport.zoom);
  const worldWidth = viewport.width / zoom;
  const worldHeight = viewport.height / zoom;
  const coordinateWidth = positiveCoordinate(coordinate[0], 320);
  const coordinateHeight = positiveCoordinate(coordinate[1], 240);
  const coordinateScaleX = worldWidth / coordinateWidth;
  const coordinateScaleY = worldHeight / coordinateHeight;
  const left = viewport.x - worldWidth / 2;
  const top = viewport.y + worldHeight / 2;
  const offset = asset.offset ?? [0, 0];
  const authoredScale = asset.scale ?? [1, 1];
  const scaleX = finiteScale(authoredScale[0]);
  const scaleY = finiteScale(authoredScale[1]);
  const frameFlip = frame.flip?.toLowerCase() ?? "";
  const flipX = (frameFlip.includes("h") ? -1 : 1) * (asset.facing ?? 1) * (scaleX < 0 ? -1 : 1);
  const flipY = (frameFlip.includes("v") ? -1 : 1) * (asset.vfacing ?? 1) * (scaleY < 0 ? -1 : 1);
  const absoluteScaleX = Math.abs(scaleX) * coordinateScaleX;
  const absoluteScaleY = Math.abs(scaleY) * coordinateScaleY;
  const anchorX = flipX === 1 ? sprite.axisX : sprite.width - sprite.axisX;
  const anchorY = flipY === 1 ? sprite.axisY : sprite.height - sprite.axisY;
  return {
    x: left + offset[0] * coordinateScaleX + frame.offsetX * absoluteScaleX - anchorX * absoluteScaleX + sprite.width * absoluteScaleX / 2,
    y: top - offset[1] * coordinateScaleY - frame.offsetY * absoluteScaleY + anchorY * absoluteScaleY - sprite.height * absoluteScaleY / 2,
    width: sprite.width * absoluteScaleX,
    height: sprite.height * absoluteScaleY,
    scaleX: sprite.width * absoluteScaleX * flipX,
    scaleY: sprite.height * absoluteScaleY * flipY,
  };
}

function announcementFrameTick(track: RuntimeRoundAnnouncementSnapshot["round"]): number {
  return Math.max(0, track.elapsed - track.animationStart);
}

function positiveCoordinate(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

function finiteScale(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) ? value : 1;
}

function isAdditiveBlend(value: string | undefined): boolean {
  return value?.toLowerCase().includes("add") ?? false;
}

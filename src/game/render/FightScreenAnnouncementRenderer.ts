import * as THREE from "three";
import type {
  MugenFightScreenAssets,
  MugenFightScreenDisplayAsset,
  MugenFightScreenDisplayDefinitions,
  MugenFightScreenFont,
  MugenFightScreenLayoutAsset,
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
  backgroundLayerCount?: number;
  backgroundResolved?: number;
  topLayerCount?: number;
  topResolved?: number;
  windowApplied?: number;
  windowCulled?: number;
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

export type FightScreenPlacementUv = {
  u1: number;
  v1: number;
  u2: number;
  v2: number;
};

type FightScreenClippedPlacement = FightScreenAnnouncementPlacement & { uv?: FightScreenPlacementUv };

const FULL_FIGHT_SCREEN_PLACEMENT_UV: FightScreenPlacementUv = {
  u1: 0,
  v1: 0,
  u2: 1,
  v2: 1,
};

type FightScreenAnnouncementSelection = {
  kind: "round" | "fight";
  track: RuntimeRoundAnnouncementSnapshot["round"];
  asset?: MugenFightScreenDisplayAsset;
  mode: RuntimeRoundAnnouncementSnapshot["mode"];
  roundNo: number;
};

type FightScreenMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

type FightScreenDisplayLayers = {
  background: MugenFightScreenLayoutAsset[];
  top?: MugenFightScreenLayoutAsset;
};

type FightScreenLayoutRenderResult = {
  backgroundLayerCount: number;
  backgroundResolved: number;
  topLayerCount: number;
  topResolved: number;
  windowApplied: number;
  windowCulled: number;
};

type FightScreenLayoutCollectionResult = {
  resolved: number;
  windowApplied: number;
  windowCulled: number;
};

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
  private readonly backgroundGroup = new THREE.Group();
  private readonly topGroup = new THREE.Group();
  private readonly backgroundMeshes: Array<FightScreenMesh | undefined> = [];
  private readonly topMeshes: Array<FightScreenMesh | undefined> = [];
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
  private layerDiagnostics: FightScreenLayoutRenderResult = {
    backgroundLayerCount: 0,
    backgroundResolved: 0,
    topLayerCount: 0,
    topResolved: 0,
    windowApplied: 0,
    windowCulled: 0,
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
    this.backgroundGroup.visible = false;
    this.topGroup.visible = false;
    this.group.add(this.backgroundGroup);
    this.group.add(this.mesh);
    this.textGroup.visible = false;
    this.group.add(this.textGroup);
    this.group.add(this.topGroup);
  }

  setAssets(assets: MugenFightScreenAssets | undefined): void {
    this.animations = assets?.animations ? new Map(assets.animations) : new Map();
    this.display = assets?.display;
    this.fonts = assets?.fonts ? new Map(assets.fonts) : new Map();
    this.spriteProvider = assets?.spriteArchive ? new SffSpriteProvider(assets.spriteArchive) : undefined;
    this.coordinate = assets?.localCoord ?? [320, 240];
    this.mesh.visible = false;
    this.hideTextMeshes();
    this.hideLayoutMeshes();
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
    const displayLayers = resolveFightScreenDisplayLayers(this.display, selection.kind, selection.mode, selection.roundNo);
    const hasDisplayLayers = hasRenderableFightScreenLayers(displayLayers);
    const textCanUseImmediateCompletion = (!action || actionNo === undefined)
      && Boolean(selection.asset.text && selection.asset.font)
      && completion?.frame === 0
      && frameTick === 0;
    const layersCanUseEmptyCompletion = !action
      && actionNo === undefined
      && hasDisplayLayers
      && completion !== undefined
      && completion.actionNos.length === 0
      && completion.reason !== "displaytime";
    if (completion && frameTick >= completion.frame && !textCanUseImmediateCompletion && !layersCanUseEmptyCompletion) {
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
    this.mesh.visible = false;
    this.hideTextMeshes();
    const layoutResult = await this.renderDisplayLayers(displayLayers, frameTick, viewport);
    const hasResolvedLayers = layoutResult.backgroundResolved > 0 || layoutResult.topResolved > 0;
    if (actionNo === undefined) {
      const textResult = this.renderText(selection.asset, selection.roundNo, viewport);
      if (textResult.rendered || hasResolvedLayers) {
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
          ...(textResult.rendered ? textDiagnostics : {}),
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
      if (textResult.rendered || hasResolvedLayers) {
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
          ...(textResult.rendered ? textDiagnostics : {}),
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
      if (hasResolvedLayers) {
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
        fallbackReason: `FightScreen AIR action ${actionNo} has no drawable frames.`,
      });
      return;
    }
    const sprite = await this.spriteProvider?.getSprite(
      animationFrame.frame.spriteGroup,
      animationFrame.frame.spriteIndex,
    );
    if (!sprite) {
      if (hasResolvedLayers) {
        this.diagnostics = {
          ...baseDiagnostics,
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
        };
        return;
      }
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
    return structuredClone({ ...this.diagnostics, ...this.layerDiagnostics });
  }

  getCoordinate(): [number, number] {
    return [...this.coordinate] as [number, number];
  }

  dispose(): void {
    this.disposeLayoutMeshes(this.backgroundMeshes, this.backgroundGroup);
    this.disposeLayoutMeshes(this.topMeshes, this.topGroup);
    this.group.remove(this.backgroundGroup, this.topGroup);
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
    this.hideLayoutMeshes();
    this.diagnostics = diagnostics;
  }

  private async renderDisplayLayers(
    layers: FightScreenDisplayLayers,
    frameTick: number,
    viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
  ): Promise<FightScreenLayoutRenderResult> {
    this.hideLayoutMeshes();
    const backgroundResult = await this.renderLayoutCollection(
      layers.background,
      this.backgroundMeshes,
      this.backgroundGroup,
      frameTick,
      viewport,
      "background",
    );
    const topResult = await this.renderLayoutCollection(
      layers.top ? [layers.top] : [],
      this.topMeshes,
      this.topGroup,
      frameTick,
      viewport,
      "top",
    );
    this.layerDiagnostics = {
      backgroundLayerCount: layers.background.length,
      backgroundResolved: backgroundResult.resolved,
      topLayerCount: layers.top ? 1 : 0,
      topResolved: topResult.resolved,
      windowApplied: backgroundResult.windowApplied + topResult.windowApplied,
      windowCulled: backgroundResult.windowCulled + topResult.windowCulled,
    };
    this.backgroundGroup.visible = backgroundResult.resolved > 0;
    this.topGroup.visible = topResult.resolved > 0;
    return this.layerDiagnostics;
  }

  private async renderLayoutCollection(
    layouts: MugenFightScreenLayoutAsset[],
    meshPool: Array<FightScreenMesh | undefined>,
    group: THREE.Group,
    frameTick: number,
    viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
    kind: "background" | "top",
  ): Promise<FightScreenLayoutCollectionResult> {
    let resolved = 0;
    let windowApplied = 0;
    let windowCulled = 0;
    for (const [index, layout] of layouts.entries()) {
      const resolvedFrame = resolveFightScreenLayoutFrame(layout, frameTick, this.animations);
      if (!resolvedFrame) continue;
      const sprite = await this.spriteProvider?.getSprite(
        resolvedFrame.frame.spriteGroup,
        resolvedFrame.frame.spriteIndex,
      );
      if (!sprite) continue;
      const placement = projectFightScreenSprite(
        viewport,
        this.coordinate,
        sprite,
        resolvedFrame.frame,
        layout,
      );
      const clippedPlacement = clipFightScreenPlacement(placement, viewport, this.coordinate, layout.window);
      if (!clippedPlacement) {
        if (layout.window) windowCulled += 1;
        continue;
      }
      if (layout.window) windowApplied += 1;
      const mesh = this.ensureLayoutMesh(index, meshPool, group);
      const blend = isAdditiveBlend(resolvedFrame.frame.blend ?? layout.blend) ? "additive" : "alpha";
      mesh.visible = true;
      mesh.position.set(clippedPlacement.x, clippedPlacement.y, 0);
      mesh.scale.set(clippedPlacement.scaleX, clippedPlacement.scaleY, 1);
      applyFightScreenMeshUv(mesh.geometry, clippedPlacement.uv ?? FULL_FIGHT_SCREEN_PLACEMENT_UV);
      mesh.material.map = this.textures.getTexture(sprite, `fight-screen-${kind}`);
      mesh.material.color.setHex(0xffffff);
      mesh.material.opacity = 1;
      mesh.material.blending = blend === "additive" ? THREE.AdditiveBlending : THREE.NormalBlending;
      applyThreePresentationOrder(
        mesh,
        mesh.material,
        resolvePresentationOrder({
          profile: "unknown",
          phase: "overlay",
          sourceKind: "overlay",
          blendPolicy: blend,
          priority: kind === "background" ? 2 : 6,
          tieBreaker: (kind === "background" ? 30 : 40) + index,
          tiePolicy: "authored-order",
        }),
      );
      mesh.material.needsUpdate = true;
      resolved += 1;
    }
    for (let index = layouts.length; index < meshPool.length; index += 1) {
      const mesh = meshPool[index];
      if (mesh) mesh.visible = false;
    }
    return { resolved, windowApplied, windowCulled };
  }

  private ensureLayoutMesh(
    index: number,
    meshPool: Array<FightScreenMesh | undefined>,
    group: THREE.Group,
  ): FightScreenMesh {
    const existing = meshPool[index];
    if (existing) return existing;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
      }),
    );
    meshPool[index] = mesh;
    group.add(mesh);
    return mesh;
  }

  private hideLayoutMeshes(): void {
    this.backgroundGroup.visible = false;
    this.topGroup.visible = false;
    for (const mesh of [...this.backgroundMeshes, ...this.topMeshes]) {
      if (mesh) mesh.visible = false;
    }
    this.layerDiagnostics = {
      backgroundLayerCount: 0,
      backgroundResolved: 0,
      topLayerCount: 0,
      topResolved: 0,
      windowApplied: 0,
      windowCulled: 0,
    };
  }

  private disposeLayoutMeshes(meshPool: Array<FightScreenMesh | undefined>, group: THREE.Group): void {
    for (const mesh of meshPool) {
      if (!mesh) continue;
      group.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    meshPool.length = 0;
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
  return candidates.find((asset) => hasFightScreenPrimaryContent(asset))
    ?? candidates.find((asset) => hasFightScreenDisplayContent(asset));
}

export function resolveFightScreenDisplayLayers(
  display: MugenFightScreenDisplayDefinitions | undefined,
  kind: "round" | "fight",
  mode: RuntimeRoundAnnouncementSnapshot["mode"],
  roundNo: number,
): FightScreenDisplayLayers {
  if (!display) return { background: [] };
  if (kind === "fight") {
    return {
      background: display.fight?.background ?? [],
      ...(display.fight?.top ? { top: display.fight.top } : {}),
    };
  }
  const variant = resolveRoundVariantDisplayAsset(display, mode, roundNo);
  const defaultAsset = display.roundDefault;
  const background = [
    ...(defaultAsset?.background ?? []),
    ...(variant && variant !== defaultAsset ? variant.background ?? [] : []),
  ];
  const top = variant?.top ?? defaultAsset?.top;
  return {
    background,
    ...(top ? { top } : {}),
  };
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

export function clipFightScreenPlacement(
  placement: FightScreenAnnouncementPlacement,
  viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
  coordinate: [number, number],
  window: [number, number, number, number] | undefined,
): FightScreenClippedPlacement | undefined {
  if (!window) return placement;
  const zoom = Math.max(0.01, viewport.zoom);
  const worldWidth = viewport.width / zoom;
  const worldHeight = viewport.height / zoom;
  const coordinateWidth = positiveCoordinate(coordinate[0], 320);
  const coordinateHeight = positiveCoordinate(coordinate[1], 240);
  const coordinateScaleX = worldWidth / coordinateWidth;
  const coordinateScaleY = worldHeight / coordinateHeight;
  const viewportLeft = viewport.x - worldWidth / 2;
  const viewportTop = viewport.y + worldHeight / 2;
  const windowLeft = viewportLeft + window[0] * coordinateScaleX;
  const windowRight = windowLeft + window[2] * coordinateScaleX;
  const windowTop = viewportTop - window[1] * coordinateScaleY;
  const windowBottom = windowTop - window[3] * coordinateScaleY;
  const spriteLeft = placement.x - placement.width / 2;
  const spriteRight = placement.x + placement.width / 2;
  const spriteBottom = placement.y - placement.height / 2;
  const spriteTop = placement.y + placement.height / 2;
  const clippedLeft = Math.max(spriteLeft, windowLeft);
  const clippedRight = Math.min(spriteRight, windowRight);
  const clippedBottom = Math.max(spriteBottom, windowBottom);
  const clippedTop = Math.min(spriteTop, windowTop);
  if (clippedRight <= clippedLeft || clippedTop <= clippedBottom || placement.width <= 0 || placement.height <= 0) {
    return undefined;
  }
  const u1 = (clippedLeft - spriteLeft) / placement.width;
  const u2 = (clippedRight - spriteLeft) / placement.width;
  const v1 = (clippedBottom - spriteBottom) / placement.height;
  const v2 = (clippedTop - spriteBottom) / placement.height;
  return {
    ...placement,
    x: (clippedLeft + clippedRight) / 2,
    y: (clippedBottom + clippedTop) / 2,
    width: clippedRight - clippedLeft,
    height: clippedTop - clippedBottom,
    scaleX: signedMagnitude(placement.scaleX, clippedRight - clippedLeft),
    scaleY: signedMagnitude(placement.scaleY, clippedTop - clippedBottom),
    uv: { u1, v1, u2, v2 },
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

function signedMagnitude(value: number, magnitude: number): number {
  return value < 0 ? -magnitude : magnitude;
}

function applyFightScreenMeshUv(geometry: THREE.PlaneGeometry, uv: FightScreenPlacementUv): void {
  const attribute = geometry.getAttribute("uv") as THREE.BufferAttribute;
  attribute.setXY(0, uv.u1, uv.v2);
  attribute.setXY(1, uv.u2, uv.v2);
  attribute.setXY(2, uv.u1, uv.v1);
  attribute.setXY(3, uv.u2, uv.v1);
  attribute.needsUpdate = true;
}

function hasFightScreenDisplayContent(asset: MugenFightScreenDisplayAsset | undefined): boolean {
  return Boolean(asset && (
    hasFightScreenPrimaryContent(asset)
    || asset.background?.some((layout) => hasRenderableFightScreenLayout(layout))
    || hasRenderableFightScreenLayout(asset.top)
  ));
}

function hasFightScreenPrimaryContent(asset: MugenFightScreenDisplayAsset | undefined): boolean {
  return Boolean(asset && (asset.animationNo !== undefined || asset.text !== undefined));
}

function hasRenderableFightScreenLayers(layers: FightScreenDisplayLayers): boolean {
  return layers.background.some((layout) => hasRenderableFightScreenLayout(layout))
    || hasRenderableFightScreenLayout(layers.top);
}

function hasRenderableFightScreenLayout(layout: MugenFightScreenLayoutAsset | undefined): boolean {
  return Boolean(layout && (layout.animationNo !== undefined || layout.sprite !== undefined));
}

function resolveRoundVariantDisplayAsset(
  display: MugenFightScreenDisplayDefinitions,
  mode: RuntimeRoundAnnouncementSnapshot["mode"],
  roundNo: number,
): MugenFightScreenDisplayAsset | undefined {
  if (mode === "single") return display.roundSingle;
  if (mode === "final") return display.roundFinal;
  return display.round.get(roundNo);
}

function resolveFightScreenLayoutFrame(
  layout: MugenFightScreenLayoutAsset,
  frameTick: number,
  animations: ReadonlyMap<number, MugenAnimationAction>,
): { frame: MugenAnimationFrame; frameIndex: number } | undefined {
  if (layout.animationNo !== undefined) {
    const action = animations.get(layout.animationNo);
    if (action) {
      const animationFrame = resolveRoundFadeAnimationFrame(action, frameTick);
      if (animationFrame) return animationFrame;
    }
  }
  if (!layout.sprite) return undefined;
  return {
    frame: {
      spriteGroup: layout.sprite[0],
      spriteIndex: layout.sprite[1],
      offsetX: 0,
      offsetY: 0,
      duration: -1,
      flip: "",
      clsn1: [],
      clsn2: [],
      raw: `${layout.sprite[0]},${layout.sprite[1]}`,
      line: 0,
    },
    frameIndex: 0,
  };
}

import * as THREE from "three";
import type {
  MugenFightScreenAssets,
  MugenFightScreenDisplayAsset,
  MugenFightScreenDisplayDefinitions,
  MugenFightScreenFont,
  MugenFightScreenLayoutAsset,
  MugenFightScreenLayoutTransform,
} from "../../mugen/model/MugenSystemAssets";
import type { MugenAnimationAction, MugenAnimationFrame } from "../../mugen/model/MugenAnimation";
import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";
import type { RuntimeRoundAnnouncementSnapshot } from "../../mugen/runtime/RuntimeRoundAnnouncementSystem";
import type { MugenSnapshot, RoundSnapshot } from "../../mugen/runtime/types";
import { SffSpriteProvider } from "../textures/SffSpriteProvider";
import { applyThreePresentationOrder, resolvePresentationOrder } from "./PresentationOrder";
import { resolveRoundFadeAnimationFrame } from "./RoundFadeRenderer";
import { TextureStore } from "./TextureStore";
import {
  resolveFightScreenAnimationCompletion,
  resolveFightScreenAnnouncementCompletion,
} from "../../mugen/runtime/FightScreenAnimationSemantics";
import {
  formatFightScreenText,
  layoutFightScreenFontText,
  resolveFightScreenFontPalette,
} from "./FightScreenFontRenderer";
import { applyPaletteFxMaterial, type RenderPaletteFx } from "./PaletteFxMaterial";

export type FightScreenAnnouncementViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  coordinateWidth: number;
  coordinateHeight: number;
};

export type FightScreenTransformDiagnostics = {
  windowApplied: number;
  windowCulled: number;
  layerNoApplied: number;
  layerNoCulled: number;
  angleApplied: number;
  angleCulled: number;
  xAngleApplied: number;
  xAngleCulled: number;
  yAngleApplied: number;
  yAngleCulled: number;
  xShearApplied: number;
  xShearCulled: number;
  projectionApplied: number;
  projectionCulled: number;
  focalLengthApplied: number;
  focalLengthCulled: number;
};

export type FightScreenAnnouncementDiagnostics = {
  active: boolean;
  configured: boolean;
  resolved: boolean;
  kind?: FightScreenAnnouncementKind;
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
  layerNoApplied?: number;
  layerNoCulled?: number;
  angleApplied?: number;
  angleCulled?: number;
  xAngleApplied?: number;
  xAngleCulled?: number;
  yAngleApplied?: number;
  yAngleCulled?: number;
  xShearApplied?: number;
  xShearCulled?: number;
  projectionApplied?: number;
  projectionCulled?: number;
  focalLengthApplied?: number;
  focalLengthCulled?: number;
  paletteFxApplied?: number;
  paletteFxExpired?: number;
  primaryPaletteFxApplied?: number;
  primaryPaletteFxExpired?: number;
  textPaletteFxApplied?: number;
  textPaletteFxExpired?: number;
  primaryTransform?: FightScreenTransformDiagnostics;
  textTransform?: FightScreenTransformDiagnostics;
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
  kind: FightScreenAnnouncementKind;
  track: RuntimeRoundAnnouncementSnapshot["round"];
  asset?: MugenFightScreenDisplayAsset;
  mode: RuntimeRoundAnnouncementSnapshot["mode"];
  roundNo: number;
};

export type FightScreenAnnouncementKind = "round" | "fight" | "ko" | "double-ko" | "time-over" | "draw";

type FightScreenMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
type FightScreenLayoutMesh = FightScreenMesh;

type FightScreenTransformVertex = {
  x: number;
  y: number;
  u: number;
  v: number;
};

type FightScreenWindowRect = {
  left: number;
  right: number;
  bottom: number;
  top: number;
};

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
  layerNoApplied: number;
  layerNoCulled: number;
  angleApplied: number;
  angleCulled: number;
  xAngleApplied: number;
  xAngleCulled: number;
  yAngleApplied: number;
  yAngleCulled: number;
  xShearApplied: number;
  xShearCulled: number;
  projectionApplied: number;
  projectionCulled: number;
  focalLengthApplied: number;
  focalLengthCulled: number;
  paletteFxApplied: number;
  paletteFxExpired: number;
};

type FightScreenLayoutCollectionResult = {
  resolved: number;
  windowApplied: number;
  windowCulled: number;
  layerNoApplied: number;
  layerNoCulled: number;
  angleApplied: number;
  angleCulled: number;
  xAngleApplied: number;
  xAngleCulled: number;
  yAngleApplied: number;
  yAngleCulled: number;
  xShearApplied: number;
  xShearCulled: number;
  projectionApplied: number;
  projectionCulled: number;
  focalLengthApplied: number;
  focalLengthCulled: number;
  paletteFxApplied: number;
  paletteFxExpired: number;
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
  textPaletteFxApplied?: number;
  textPaletteFxExpired?: number;
  textTransform?: FightScreenTransformDiagnostics;
  fallbackReason?: string;
};

type FightScreenTransformApplicationResult = FightScreenTransformDiagnostics & {
  placement?: FightScreenClippedPlacement;
  transformedWindow: boolean;
};

export class FightScreenAnnouncementRenderer {
  readonly group = new THREE.Group();
  private readonly mesh: FightScreenMesh;
  private readonly textGroup = new THREE.Group();
  private readonly textMeshes: Array<FightScreenMesh | undefined> = [];
  private readonly backgroundGroup = new THREE.Group();
  private readonly topGroup = new THREE.Group();
  private readonly backgroundMeshes: Array<FightScreenLayoutMesh | undefined> = [];
  private readonly topMeshes: Array<FightScreenLayoutMesh | undefined> = [];
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
    layerNoApplied: 0,
    layerNoCulled: 0,
    angleApplied: 0,
    angleCulled: 0,
    xAngleApplied: 0,
    xAngleCulled: 0,
    yAngleApplied: 0,
    yAngleCulled: 0,
    xShearApplied: 0,
    xShearCulled: 0,
    projectionApplied: 0,
    projectionCulled: 0,
    focalLengthApplied: 0,
    focalLengthCulled: 0,
    paletteFxApplied: 0,
    paletteFxExpired: 0,
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
    const completion = selection.kind === "round" || selection.kind === "fight"
      ? resolveFightScreenAnnouncementCompletion(
        this.display,
        this.animations,
        selection.kind,
        selection.mode,
        selection.roundNo,
      )
      : resolveFightScreenAnimationCompletion(selection.asset, this.animations);
    const displayTime = selection.asset.displayTime;
    const displayLayers = resolveFightScreenDisplayLayers(
      this.display,
      selection.kind,
      selection.mode,
      selection.roundNo,
      selection.asset,
    );
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
      const textResult = this.renderText(selection.asset, selection.roundNo, frameTick, viewport);
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
      const textResult = this.renderText(selection.asset, selection.roundNo, frameTick, viewport);
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
    this.mesh.position.z = 10.4;
    const primaryTransformResult = applyFightScreenLayoutTransform(
      this.mesh,
      placement,
      selection.asset.layout,
      viewport,
      this.coordinate,
    );
    const primaryTransform = toFightScreenTransformDiagnostics(primaryTransformResult);
    const primaryPresentationOrder = primaryTransformResult.placement
      ? resolveFightScreenLayoutPresentationOrder(
        selection.asset.layout?.layerNo,
        "primary",
        0,
        isAdditiveBlend(animationFrame.frame.blend) ? "additive" : "alpha",
      )
      : undefined;
    if (!primaryTransformResult.placement || !primaryPresentationOrder) {
      this.mesh.visible = false;
      const fallbackReason = primaryTransformResult.projectionCulled > 0
        ? "FightScreen primary AnimTextSnd perspective2 projection is not supported."
        : "FightScreen primary AnimTextSnd is outside its layout window.";
      const commonDiagnostics = {
        ...baseDiagnostics,
        active: true,
        configured: true,
        resolved: hasResolvedLayers,
        actionNo,
        frameIndex: animationFrame.frameIndex,
        frameTick,
        ...(completion ? {
          animationEndFrame: completion.frame,
          animationComplete: false,
          completionReason: completion.reason,
        } : {}),
        ...(displayTime === undefined ? {} : { displayTime }),
        primaryTransform,
      } satisfies FightScreenAnnouncementDiagnostics;
      if (hasResolvedLayers) {
        this.diagnostics = commonDiagnostics;
      } else {
        this.hide({ ...commonDiagnostics, resolved: false, fallbackReason });
      }
      return;
    }
    this.hideTextMeshes();
    this.mesh.visible = true;
    this.mesh.material.map = this.textures.getTexture(sprite, "fight-screen");
    const primaryPaletteFx = resolveFightScreenPaletteFx(selection.asset.paletteFx, frameTick);
    applyPaletteFxMaterial(this.mesh.material, primaryPaletteFx);
    this.mesh.material.blending = isAdditiveBlend(animationFrame.frame.blend) ? THREE.AdditiveBlending : THREE.NormalBlending;
    applyThreePresentationOrder(this.mesh, this.mesh.material, primaryPresentationOrder);
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
      ...(selection.asset.paletteFx ? {
        primaryPaletteFxApplied: primaryPaletteFx ? 1 : 0,
        primaryPaletteFxExpired: primaryPaletteFx ? 0 : 1,
      } : {}),
      primaryTransform,
      sprite: {
        group: sprite.group,
        index: sprite.index,
        width: sprite.width,
        height: sprite.height,
        axisX: sprite.axisX,
        axisY: sprite.axisY,
      },
      placement: primaryTransformResult.placement,
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
      layerNoApplied: backgroundResult.layerNoApplied + topResult.layerNoApplied,
      layerNoCulled: backgroundResult.layerNoCulled + topResult.layerNoCulled,
      angleApplied: backgroundResult.angleApplied + topResult.angleApplied,
      angleCulled: backgroundResult.angleCulled + topResult.angleCulled,
      xAngleApplied: backgroundResult.xAngleApplied + topResult.xAngleApplied,
      xAngleCulled: backgroundResult.xAngleCulled + topResult.xAngleCulled,
      yAngleApplied: backgroundResult.yAngleApplied + topResult.yAngleApplied,
      yAngleCulled: backgroundResult.yAngleCulled + topResult.yAngleCulled,
      xShearApplied: backgroundResult.xShearApplied + topResult.xShearApplied,
      xShearCulled: backgroundResult.xShearCulled + topResult.xShearCulled,
      projectionApplied: backgroundResult.projectionApplied + topResult.projectionApplied,
      projectionCulled: backgroundResult.projectionCulled + topResult.projectionCulled,
      focalLengthApplied: backgroundResult.focalLengthApplied + topResult.focalLengthApplied,
      focalLengthCulled: backgroundResult.focalLengthCulled + topResult.focalLengthCulled,
      paletteFxApplied: backgroundResult.paletteFxApplied + topResult.paletteFxApplied,
      paletteFxExpired: backgroundResult.paletteFxExpired + topResult.paletteFxExpired,
    };
    this.backgroundGroup.visible = backgroundResult.resolved > 0;
    this.topGroup.visible = topResult.resolved > 0;
    return this.layerDiagnostics;
  }

  private async renderLayoutCollection(
    layouts: MugenFightScreenLayoutAsset[],
    meshPool: Array<FightScreenLayoutMesh | undefined>,
    group: THREE.Group,
    frameTick: number,
    viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
    kind: "background" | "top",
  ): Promise<FightScreenLayoutCollectionResult> {
    let resolved = 0;
    let windowApplied = 0;
    let windowCulled = 0;
    let layerNoApplied = 0;
    let layerNoCulled = 0;
    let angleApplied = 0;
    let angleCulled = 0;
    let xAngleApplied = 0;
    let xAngleCulled = 0;
    let yAngleApplied = 0;
    let yAngleCulled = 0;
    let xShearApplied = 0;
    let xShearCulled = 0;
    let projectionApplied = 0;
    let projectionCulled = 0;
    let focalLengthApplied = 0;
    let focalLengthCulled = 0;
    let paletteFxApplied = 0;
    let paletteFxExpired = 0;
    for (const [index, layout] of layouts.entries()) {
      const resolvedFrame = resolveFightScreenLayoutFrame(layout, frameTick, this.animations);
      if (!resolvedFrame) continue;
      const sprite = await this.spriteProvider?.getSprite(
        resolvedFrame.frame.spriteGroup,
        resolvedFrame.frame.spriteIndex,
      );
      if (!sprite) continue;
      if (layout.projection === "perspective2") {
        projectionCulled += 1;
        if (layout.focalLength !== undefined) focalLengthCulled += 1;
        continue;
      }
      const blend = isAdditiveBlend(resolvedFrame.frame.blend ?? layout.blend) ? "additive" : "alpha";
      const presentationOrder = resolveFightScreenLayoutPresentationOrder(layout.layerNo, kind, index, blend);
      if (!presentationOrder) {
        layerNoCulled += 1;
        continue;
      }
      const placement = projectFightScreenSprite(
        viewport,
        this.coordinate,
        sprite,
        resolvedFrame.frame,
        layout,
      );
      const mesh = this.ensureLayoutMesh(index, meshPool, group);
      const transformResult = applyFightScreenLayoutTransform(
        mesh,
        placement,
        layout,
        viewport,
        this.coordinate,
      );
      if (!transformResult.placement) {
        if (layout.window) windowCulled += 1;
        continue;
      }
      windowApplied += transformResult.windowApplied;
      layerNoApplied += transformResult.layerNoApplied;
      angleApplied += transformResult.angleApplied;
      xAngleApplied += transformResult.xAngleApplied;
      yAngleApplied += transformResult.yAngleApplied;
      xShearApplied += transformResult.xShearApplied;
      projectionApplied += transformResult.projectionApplied;
      focalLengthApplied += transformResult.focalLengthApplied;
      const paletteFx = resolveFightScreenPaletteFx(layout.paletteFx, frameTick);
      if (layout.paletteFx && paletteFx) paletteFxApplied += 1;
      if (layout.paletteFx && !paletteFx) paletteFxExpired += 1;
      mesh.visible = true;
      mesh.material.map = this.textures.getTexture(sprite, `fight-screen-${kind}`);
      applyPaletteFxMaterial(mesh.material, paletteFx);
      mesh.material.blending = blend === "additive" ? THREE.AdditiveBlending : THREE.NormalBlending;
      applyThreePresentationOrder(mesh, mesh.material, presentationOrder);
      mesh.material.needsUpdate = true;
      resolved += 1;
    }
    for (let index = layouts.length; index < meshPool.length; index += 1) {
      const mesh = meshPool[index];
      if (mesh) mesh.visible = false;
    }
    return {
      resolved,
      windowApplied,
      windowCulled,
      layerNoApplied,
      layerNoCulled,
      angleApplied,
      angleCulled,
      xAngleApplied,
      xAngleCulled,
      yAngleApplied,
      yAngleCulled,
      xShearApplied,
      xShearCulled,
      projectionApplied,
      projectionCulled,
      focalLengthApplied,
      focalLengthCulled,
      paletteFxApplied,
      paletteFxExpired,
    };
  }

  private ensureLayoutMesh(
    index: number,
    meshPool: Array<FightScreenLayoutMesh | undefined>,
    group: THREE.Group,
  ): FightScreenLayoutMesh {
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
    meshPool[index] = mesh as FightScreenLayoutMesh;
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
      layerNoApplied: 0,
      layerNoCulled: 0,
      angleApplied: 0,
      angleCulled: 0,
      xAngleApplied: 0,
      xAngleCulled: 0,
      yAngleApplied: 0,
      yAngleCulled: 0,
      xShearApplied: 0,
      xShearCulled: 0,
      projectionApplied: 0,
      projectionCulled: 0,
      focalLengthApplied: 0,
      focalLengthCulled: 0,
      paletteFxApplied: 0,
      paletteFxExpired: 0,
    };
  }

  private disposeLayoutMeshes(meshPool: Array<FightScreenLayoutMesh | undefined>, group: THREE.Group): void {
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
    frameTick: number,
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
    const textTransform = asset.textLayout ?? asset.layout;
    const textTransformDiagnostics = createFightScreenTransformDiagnostics();
    const textPaletteFx = resolveFightScreenPaletteFx(asset.textPaletteFx, frameTick);
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
      textMesh.position.z = 10.45;
      const transformResult = applyFightScreenLayoutTransform(
        textMesh,
        placement,
        textTransform,
        viewport,
        this.coordinate,
      );
      addFightScreenTransformDiagnostics(textTransformDiagnostics, transformResult);
      const textPresentationOrder = transformResult.placement
        ? resolveFightScreenLayoutPresentationOrder(textTransform?.layerNo, "text", glyphIndex, "alpha")
        : undefined;
      if (!transformResult.placement || !textPresentationOrder) {
        if (transformResult.placement && !textPresentationOrder) {
          textTransformDiagnostics.layerNoCulled += 1;
        }
        textMesh.visible = false;
        continue;
      }
      textMesh.visible = true;
      textMesh.material.map = this.textures.getTexture(glyph.sprite, `fight-screen-font-${fontIndex}-${font.sourcePath}`);
      const color = asset.fontColor ?? [255, 255, 255, 255];
      const fontOpacity = Math.max(0, Math.min(1, color[3] / 255));
      applyPaletteFxMaterial(textMesh.material, textPaletteFx, fontOpacity);
      if (textPaletteFx) {
        textMesh.material.color.multiply(new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255));
      } else {
        textMesh.material.color.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
      }
      textMesh.material.blending = THREE.NormalBlending;
      applyThreePresentationOrder(textMesh, textMesh.material, textPresentationOrder);
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
      ...(asset.textPaletteFx ? {
        textPaletteFxApplied: textPaletteFx ? 1 : 0,
        textPaletteFxExpired: textPaletteFx ? 0 : 1,
      } : {}),
      ...(textTransform ? { textTransform: textTransformDiagnostics } : {}),
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
  if (announcement?.visibility === "visible") {
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
  }
  if (!round || round.state === "fight") return undefined;
  const kind = resolveFightScreenOutcomeKind(round);
  const asset = resolveFightScreenOutcomeAsset(display, kind);
  if (!asset) return undefined;
  return {
    kind,
    track: {
      phase: "active",
      skipped: false,
      elapsed: round.postRound?.frame ?? 0,
      animationStart: 0,
      soundTime: 0,
      soundDue: false,
    },
    asset,
    mode: announcement?.mode ?? "normal",
    roundNo: round.roundNo ?? 1,
  };
}

export function resolveFightScreenOutcomeKind(round: RoundSnapshot): Exclude<FightScreenAnnouncementKind, "round" | "fight"> {
  if (round.state === "timeover") return round.winner === "Draw" ? "draw" : "time-over";
  return round.winner === "Draw" ? "double-ko" : "ko";
}

export function resolveFightScreenOutcomeAsset(
  display: MugenFightScreenDisplayDefinitions | undefined,
  kind: Exclude<FightScreenAnnouncementKind, "round" | "fight">,
): MugenFightScreenDisplayAsset | undefined {
  if (!display) return undefined;
  const candidates = kind === "ko"
    ? [display.ko]
    : kind === "double-ko"
      ? [display.doubleKo, display.ko]
      : kind === "time-over"
        ? [display.timeOver]
        : [display.draw, display.timeOver];
  return candidates.find((asset): asset is MugenFightScreenDisplayAsset => asset !== undefined);
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
  kind: FightScreenAnnouncementKind,
  mode: RuntimeRoundAnnouncementSnapshot["mode"],
  roundNo: number,
  selectedAsset?: MugenFightScreenDisplayAsset,
): FightScreenDisplayLayers {
  if (!display) return { background: [] };
  if (kind === "fight") {
    return {
      background: display.fight?.background ?? [],
      ...(display.fight?.top ? { top: display.fight.top } : {}),
    };
  }
  if (kind !== "round") {
    return {
      background: selectedAsset?.background ?? [],
      ...(selectedAsset?.top ? { top: selectedAsset.top } : {}),
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
  const windowRect = resolveFightScreenWindowRect(viewport, coordinate, window);
  const windowLeft = windowRect.left;
  const windowRight = windowRect.right;
  const windowTop = windowRect.top;
  const windowBottom = windowRect.bottom;
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

function resolveFightScreenWindowRect(
  viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
  coordinate: [number, number],
  window: [number, number, number, number],
): FightScreenWindowRect {
  const zoom = Math.max(0.01, viewport.zoom);
  const worldWidth = viewport.width / zoom;
  const worldHeight = viewport.height / zoom;
  const coordinateWidth = positiveCoordinate(coordinate[0], 320);
  const coordinateHeight = positiveCoordinate(coordinate[1], 240);
  const coordinateScaleX = worldWidth / coordinateWidth;
  const coordinateScaleY = worldHeight / coordinateHeight;
  const viewportLeft = viewport.x - worldWidth / 2;
  const viewportTop = viewport.y + worldHeight / 2;
  const left = viewportLeft + window[0] * coordinateScaleX;
  const right = left + window[2] * coordinateScaleX;
  const top = viewportTop - window[1] * coordinateScaleY;
  const bottom = top - window[3] * coordinateScaleY;
  return { left, right, bottom, top };
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

function resolveFightScreenLayoutPresentationOrder(
  layerNo: number | undefined,
  kind: "background" | "top" | "primary" | "text",
  index: number,
  blend: "alpha" | "additive",
): ReturnType<typeof resolvePresentationOrder> | undefined {
  const phase = layerNo === undefined
    ? "overlay"
    : layerNo === -1
      ? "stage-background"
      : layerNo === 0
        ? "actor-underlay"
        : layerNo === 1
          ? "stage-foreground"
          : layerNo === 2
            ? "overlay"
            : undefined;
  if (!phase) return undefined;
  return resolvePresentationOrder({
    profile: "unknown",
    phase,
    sourceKind: "overlay",
    blendPolicy: blend,
    priority: kind === "background"
      ? 2
      : kind === "primary"
        ? 4
        : kind === "text"
          ? 5
          : 6,
    tieBreaker: (kind === "background"
      ? 30
      : kind === "primary"
        ? 20
        : kind === "text"
          ? 21
          : 40) + index,
    tiePolicy: "authored-order",
  });
}

function signedMagnitude(value: number, magnitude: number): number {
  return value < 0 ? -magnitude : magnitude;
}

function degreesToRadians(value: number): number {
  return (Number.isFinite(value) ? value : 0) * Math.PI / 180;
}

function createFightScreenTransformDiagnostics(): FightScreenTransformDiagnostics {
  return {
    windowApplied: 0,
    windowCulled: 0,
    layerNoApplied: 0,
    layerNoCulled: 0,
    angleApplied: 0,
    angleCulled: 0,
    xAngleApplied: 0,
    xAngleCulled: 0,
    yAngleApplied: 0,
    yAngleCulled: 0,
    xShearApplied: 0,
    xShearCulled: 0,
    projectionApplied: 0,
    projectionCulled: 0,
    focalLengthApplied: 0,
    focalLengthCulled: 0,
  };
}

function addFightScreenTransformDiagnostics(
  target: FightScreenTransformDiagnostics,
  source: FightScreenTransformDiagnostics,
): void {
  target.windowApplied += source.windowApplied;
  target.windowCulled += source.windowCulled;
  target.layerNoApplied += source.layerNoApplied;
  target.layerNoCulled += source.layerNoCulled;
  target.angleApplied += source.angleApplied;
  target.angleCulled += source.angleCulled;
  target.xAngleApplied += source.xAngleApplied;
  target.xAngleCulled += source.xAngleCulled;
  target.yAngleApplied += source.yAngleApplied;
  target.yAngleCulled += source.yAngleCulled;
  target.xShearApplied += source.xShearApplied;
  target.xShearCulled += source.xShearCulled;
  target.projectionApplied += source.projectionApplied;
  target.projectionCulled += source.projectionCulled;
  target.focalLengthApplied += source.focalLengthApplied;
  target.focalLengthCulled += source.focalLengthCulled;
}

function toFightScreenTransformDiagnostics(
  result: FightScreenTransformApplicationResult,
): FightScreenTransformDiagnostics {
  const {
    placement: _placement,
    transformedWindow: _transformedWindow,
    ...diagnostics
  } = result;
  return diagnostics;
}

function applyFightScreenLayoutTransform(
  mesh: FightScreenMesh,
  placement: FightScreenAnnouncementPlacement,
  transform: MugenFightScreenLayoutTransform | undefined,
  viewport: Omit<FightScreenAnnouncementViewport, "coordinateWidth" | "coordinateHeight">,
  coordinate: [number, number],
): FightScreenTransformApplicationResult {
  const diagnostics = createFightScreenTransformDiagnostics();
  const transformedWindow = Boolean(transform?.window && hasFightScreenLayoutTransform(transform));
  if (transform?.projection === "perspective2") {
    diagnostics.projectionCulled = 1;
    if (transform.focalLength !== undefined) diagnostics.focalLengthCulled = 1;
    return { ...diagnostics, transformedWindow };
  }
  const transformVertices = transform && hasFightScreenLayoutTransform(transform)
    ? projectFightScreenLayoutVertices(placement, transform)
    : undefined;
  const clippedPolygon = transformedWindow && transformVertices && transform?.window
    ? clipFightScreenPolygon(transformVertices, resolveFightScreenWindowRect(viewport, coordinate, transform.window))
    : undefined;
  const clippedPlacement = transformedWindow
    ? clippedPolygon && clippedPolygon.length >= 3 ? placement : undefined
    : clipFightScreenPlacement(placement, viewport, coordinate, transform?.window);
  if (!clippedPlacement) {
    if (transform?.window) diagnostics.windowCulled = 1;
    return { ...diagnostics, transformedWindow };
  }
  if (transform?.window) diagnostics.windowApplied = 1;
  if (transform?.layerNo !== undefined) diagnostics.layerNoApplied = 1;
  if (transform?.angle !== undefined) diagnostics.angleApplied = 1;
  if (transform?.xAngle !== undefined) diagnostics.xAngleApplied = 1;
  if (transform?.yAngle !== undefined) diagnostics.yAngleApplied = 1;
  if (transform?.xShear !== undefined) diagnostics.xShearApplied = 1;
  if (transform?.projection === "perspective") {
    diagnostics.projectionApplied = 1;
    if (transform.focalLength !== undefined) diagnostics.focalLengthApplied = 1;
  }
  if (transformedWindow && clippedPolygon) {
    mesh.position.set(placement.x, placement.y, mesh.position.z);
    mesh.scale.set(1, 1, 1);
    mesh.rotation.set(0, 0, 0);
    applyFightScreenPolygonGeometry(
      mesh,
      clippedPolygon.map((vertex) => ({
        ...vertex,
        x: vertex.x - placement.x,
        y: vertex.y - placement.y,
      })),
    );
  } else {
    mesh.position.set(clippedPlacement.x, clippedPlacement.y, mesh.position.z);
    ensureFightScreenPlaneGeometry(mesh);
    if (transform?.projection === "perspective") {
      mesh.scale.set(1, 1, 1);
      mesh.rotation.set(0, 0, 0);
      applyFightScreenPerspective(
        mesh.geometry,
        clippedPlacement.width,
        clippedPlacement.height,
        clippedPlacement.scaleX,
        clippedPlacement.scaleY,
        transform,
      );
    } else {
      mesh.scale.set(clippedPlacement.scaleX, clippedPlacement.scaleY, 1);
      mesh.rotation.set(
        -degreesToRadians(transform?.xAngle ?? 0),
        degreesToRadians(transform?.yAngle ?? 0),
        degreesToRadians(transform?.angle ?? 0),
      );
      applyFightScreenMeshShear(mesh.geometry, transform?.xShear);
    }
  }
  if (!transformedWindow) {
    const clippedUv = "uv" in clippedPlacement
      ? (clippedPlacement as FightScreenClippedPlacement).uv
      : undefined;
    applyFightScreenMeshUv(mesh.geometry, clippedUv ?? FULL_FIGHT_SCREEN_PLACEMENT_UV);
  }
  return { ...diagnostics, placement: clippedPlacement, transformedWindow };
}

function hasFightScreenLayoutTransform(layout: MugenFightScreenLayoutTransform | undefined): boolean {
  return layout?.angle !== undefined
    || layout?.xAngle !== undefined
    || layout?.yAngle !== undefined
    || layout?.xShear !== undefined
    || layout?.projection === "perspective";
}

function ensureFightScreenPlaneGeometry(mesh: FightScreenMesh): void {
  if (!mesh.userData.fightScreenPolygonGeometry) return;
  mesh.geometry.dispose();
  mesh.geometry = new THREE.PlaneGeometry(1, 1);
  delete mesh.userData.fightScreenPolygonGeometry;
}

function applyFightScreenPolygonGeometry(mesh: FightScreenMesh, vertices: FightScreenTransformVertex[]): void {
  if (!mesh.userData.fightScreenPolygonGeometry) {
    mesh.geometry.dispose();
    mesh.geometry = new THREE.BufferGeometry();
    mesh.userData.fightScreenPolygonGeometry = true;
  }
  const positions = new Float32Array(vertices.length * 3);
  const uvs = new Float32Array(vertices.length * 2);
  for (const [index, vertex] of vertices.entries()) {
    positions[index * 3] = vertex.x;
    positions[index * 3 + 1] = vertex.y;
    positions[index * 3 + 2] = 0;
    uvs[index * 2] = vertex.u;
    uvs[index * 2 + 1] = vertex.v;
  }
  const indices: number[] = [];
  for (let index = 1; index < vertices.length - 1; index += 1) {
    indices.push(0, index, index + 1);
  }
  mesh.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  mesh.geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  mesh.geometry.setIndex(indices);
  mesh.geometry.computeBoundingSphere();
}

function projectFightScreenLayoutVertices(
  placement: FightScreenAnnouncementPlacement,
  layout: MugenFightScreenLayoutTransform,
): FightScreenTransformVertex[] {
  if (layout.projection === "perspective") {
    return projectFightScreenPerspectiveVertices(placement, layout);
  }
  const rotation = new THREE.Euler(
    -degreesToRadians(layout.xAngle ?? 0),
    degreesToRadians(layout.yAngle ?? 0),
    degreesToRadians(layout.angle ?? 0),
    "XYZ",
  );
  const shear = Number.isFinite(layout.xShear) ? -(layout.xShear as number) : 0;
  const vertices: Array<[number, number, number, number]> = [
    [-0.5, 0.5, 0, 1],
    [0.5, 0.5, 1, 1],
    [-0.5, -0.5, 0, 0],
    [0.5, -0.5, 1, 0],
  ];
  return vertices.map(([x, y, u, v]) => {
    const point = new THREE.Vector3(
      (x + shear * y) * placement.scaleX,
      y * placement.scaleY,
      0,
    ).applyEuler(rotation);
    return { x: placement.x + point.x, y: placement.y + point.y, u, v };
  });
}

function projectFightScreenPerspectiveVertices(
  placement: FightScreenAnnouncementPlacement,
  layout: MugenFightScreenLayoutTransform,
): FightScreenTransformVertex[] {
  const focalLength = finiteFocalLength(layout.focalLength);
  const rotation = new THREE.Euler(
    -degreesToRadians(layout.xAngle ?? 0),
    degreesToRadians(layout.yAngle ?? 0),
    degreesToRadians(layout.angle ?? 0),
    "XYZ",
  );
  const shear = Number.isFinite(layout.xShear) ? -(layout.xShear as number) : 0;
  const flipX = placement.scaleX < 0 ? -1 : 1;
  const flipY = placement.scaleY < 0 ? -1 : 1;
  const vertices: Array<[number, number, number, number]> = [
    [-placement.width / 2, placement.height / 2, 0, 1],
    [placement.width / 2, placement.height / 2, 1, 1],
    [-placement.width / 2, -placement.height / 2, 0, 0],
    [placement.width / 2, -placement.height / 2, 1, 0],
  ];
  return vertices.map(([x, y, u, v]) => {
    const point = new THREE.Vector3(x * flipX, y * flipY, 0);
    point.x += shear * point.y;
    point.applyEuler(rotation);
    const perspectiveScale = focalLength / Math.max(1, focalLength - point.z);
    return {
      x: placement.x + point.x * perspectiveScale,
      y: placement.y + point.y * perspectiveScale,
      u,
      v,
    };
  });
}

function clipFightScreenPolygon(vertices: FightScreenTransformVertex[], bounds: FightScreenWindowRect): FightScreenTransformVertex[] {
  let clipped = vertices;
  const boundaries: Array<{
    coordinate: "x" | "y";
    value: number;
    keepGreater: boolean;
  }> = [
    { coordinate: "x", value: bounds.left, keepGreater: true },
    { coordinate: "x", value: bounds.right, keepGreater: false },
    { coordinate: "y", value: bounds.bottom, keepGreater: true },
    { coordinate: "y", value: bounds.top, keepGreater: false },
  ];
  for (const boundary of boundaries) {
    if (clipped.length === 0) return [];
    const next: FightScreenTransformVertex[] = [];
    for (const [index, current] of clipped.entries()) {
      const previous = clipped[(index + clipped.length - 1) % clipped.length]!;
      const currentInside = isFightScreenClipPointInside(current, boundary);
      const previousInside = isFightScreenClipPointInside(previous, boundary);
      if (currentInside !== previousInside) {
        next.push(intersectFightScreenClipEdge(previous, current, boundary));
      }
      if (currentInside) next.push(current);
    }
    clipped = next;
  }
  return clipped;
}

function isFightScreenClipPointInside(
  point: FightScreenTransformVertex,
  boundary: { coordinate: "x" | "y"; value: number; keepGreater: boolean },
): boolean {
  const value = point[boundary.coordinate];
  return boundary.keepGreater ? value >= boundary.value : value <= boundary.value;
}

function intersectFightScreenClipEdge(
  start: FightScreenTransformVertex,
  end: FightScreenTransformVertex,
  boundary: { coordinate: "x" | "y"; value: number },
): FightScreenTransformVertex {
  const startValue = start[boundary.coordinate];
  const delta = end[boundary.coordinate] - startValue;
  const amount = Math.abs(delta) < 0.000001 ? 0 : (boundary.value - startValue) / delta;
  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount,
    u: start.u + (end.u - start.u) * amount,
    v: start.v + (end.v - start.v) * amount,
  };
}

function applyFightScreenMeshShear(geometry: THREE.BufferGeometry, value: number | undefined): void {
  const shear = Number.isFinite(value) ? -(value as number) : 0;
  const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
  const vertices: Array<[number, number]> = [
    [-0.5, 0.5],
    [0.5, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ];
  for (const [index, [x, y]] of vertices.entries()) {
    attribute.setX(index, x + shear * y);
    attribute.setY(index, y);
    attribute.setZ(index, 0);
  }
  attribute.needsUpdate = true;
  geometry.computeBoundingSphere();
}

function applyFightScreenPerspective(
  geometry: THREE.BufferGeometry,
  width: number,
  height: number,
  scaleX: number,
  scaleY: number,
  layout: MugenFightScreenLayoutTransform,
): void {
  const vertices = projectFightScreenPerspectiveVertices({
    x: 0,
    y: 0,
    width,
    height,
    scaleX,
    scaleY,
  }, layout);
  const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (const [index, vertex] of vertices.entries()) {
    attribute.setXYZ(index, vertex.x, vertex.y, 0);
  }
  attribute.needsUpdate = true;
  geometry.computeBoundingSphere();
}

function finiteFocalLength(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 2048;
}

function resolveFightScreenPaletteFx(
  paletteFx: MugenFightScreenLayoutAsset["paletteFx"],
  frameTick: number,
): RenderPaletteFx | undefined {
  if (!paletteFx) return undefined;
  const time = paletteFx.time !== undefined && Number.isFinite(paletteFx.time)
    ? Math.round(paletteFx.time)
    : -1;
  const color = paletteFx.color;
  const tick = Math.max(0, Math.round(frameTick));
  if (time === 0 || (time > 0 && tick >= time)) return undefined;
  return {
    remaining: time > 0 ? Math.max(1, time - tick) : time,
    time,
    add: finitePaletteTriplet(paletteFx.add, [0, 0, 0]),
    mul: finitePaletteTriplet(paletteFx.mul, [256, 256, 256]),
    color: color !== undefined && Number.isFinite(color) ? color : 256,
    invert: paletteFx.invertAll ?? false,
  };
}

function finitePaletteTriplet(
  value: [number, number, number] | undefined,
  fallback: [number, number, number],
): [number, number, number] {
  if (!value || value.some((component) => !Number.isFinite(component))) return fallback;
  return value.map((component) => Math.round(component)) as [number, number, number];
}

function applyFightScreenMeshUv(geometry: THREE.BufferGeometry, uv: FightScreenPlacementUv): void {
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

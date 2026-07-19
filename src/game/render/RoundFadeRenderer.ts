import * as THREE from "three";
import type { MugenAnimationAction, MugenAnimationFrame } from "../../mugen/model/MugenAnimation";
import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";
import type { RuntimeRoundFadeSnapshot } from "../../mugen/runtime/types";
import { applyThreePresentationOrder, resolvePresentationOrder } from "./PresentationOrder";
import { TextureStore } from "./TextureStore";

export type RoundFadeViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
};

export type RoundFadeSpritePlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
  flipX: 1 | -1;
  flipY: 1 | -1;
};

export type RoundFadeRendererDiagnostics = {
  active: boolean;
  configured: boolean;
  resolved: boolean;
  actionNo?: number;
  frameIndex?: number;
  sprite?: { group: number; index: number; width: number; height: number; axisX: number; axisY: number };
  meshRenderOrder?: number;
  fallbackReason?: string;
};

type RoundFadeMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

export class RoundFadeRenderer {
  readonly group = new THREE.Group();
  private readonly mesh: RoundFadeMesh;
  private animations = new Map<number, MugenAnimationAction>();
  private diagnostics: RoundFadeRendererDiagnostics = {
    active: false,
    configured: false,
    resolved: false,
  };

  constructor(
    private readonly spriteProvider: SpriteProvider,
    private readonly textures: TextureStore,
  ) {
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
  }

  setAnimations(animations: Map<number, MugenAnimationAction> | undefined): void {
    this.animations = animations ? new Map(animations) : new Map();
    this.mesh.visible = false;
    this.diagnostics = {
      active: false,
      configured: this.animations.size > 0,
      resolved: false,
      ...(this.animations.size === 0 ? { fallbackReason: "No FightScreen AIR actions are configured." } : {}),
    };
  }

  async update(fade: RuntimeRoundFadeSnapshot | undefined, viewport: RoundFadeViewport): Promise<void> {
    const actionNo = fade?.animationNo;
    const action = actionNo === undefined ? undefined : this.animations.get(actionNo);
    const animationFrame = action && fade ? resolveRoundFadeAnimationFrame(action, Math.max(0, fade.frame - 1)) : undefined;
    if (!fade?.active || actionNo === undefined || !action || !animationFrame) {
      this.mesh.visible = false;
      this.diagnostics = {
        active: Boolean(fade?.active),
        configured: this.animations.size > 0,
        resolved: false,
        ...(actionNo !== undefined ? { actionNo } : {}),
        ...(actionNo !== undefined && !action ? { fallbackReason: `FightScreen AIR action ${actionNo} is unavailable.` } : {}),
      };
      return;
    }

    const sprite = await this.spriteProvider.getSprite(animationFrame.frame.spriteGroup, animationFrame.frame.spriteIndex);
    if (!sprite) {
      this.mesh.visible = false;
      this.diagnostics = {
        active: true,
        configured: true,
        resolved: false,
        actionNo,
        frameIndex: animationFrame.frameIndex,
        fallbackReason: `FightScreen AIR action ${actionNo} frame ${animationFrame.frameIndex} references missing sprite ${animationFrame.frame.spriteGroup},${animationFrame.frame.spriteIndex}.`,
      };
      return;
    }

    const placement = projectRoundFadeSprite(viewport, sprite, animationFrame.frame);
    this.mesh.visible = true;
    this.mesh.position.set(placement.x, placement.y, 10.2);
    this.mesh.scale.set(placement.width * placement.flipX, placement.height * placement.flipY, 1);
    this.mesh.material.map = this.textures.getTexture(sprite, "round-fade");
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
        priority: 2,
        tieBreaker: 10,
        tiePolicy: "explicit",
      }),
    );
    this.mesh.material.needsUpdate = true;
    this.diagnostics = {
      active: true,
      configured: true,
      resolved: true,
      actionNo,
      frameIndex: animationFrame.frameIndex,
      sprite: {
        group: sprite.group,
        index: sprite.index,
        width: sprite.width,
        height: sprite.height,
        axisX: sprite.axisX,
        axisY: sprite.axisY,
      },
      meshRenderOrder: this.mesh.renderOrder,
    };
  }

  getDiagnostics(): RoundFadeRendererDiagnostics {
    return structuredClone(this.diagnostics);
  }

  dispose(): void {
    this.group.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export function resolveRoundFadeAnimationFrame(
  action: MugenAnimationAction,
  tick: number,
): { frame: MugenAnimationFrame; frameIndex: number } | undefined {
  if (action.frames.length === 0) return undefined;
  const safeTick = Math.max(0, Math.floor(tick));
  const loopStart = action.loopStart === undefined ? 0 : Math.max(0, Math.min(action.loopStart, action.frames.length - 1));
  const headFrames = action.frames.slice(0, loopStart);
  const headDuration = animationDuration(headFrames);
  if (safeTick < headDuration) {
    return frameAtTick(headFrames, safeTick, 0) ?? { frame: action.frames[0]!, frameIndex: 0 };
  }

  const loopFrames = action.frames.slice(loopStart);
  const loopDuration = animationDuration(loopFrames);
  if (loopDuration <= 0) {
    const lastIndex = action.frames.length - 1;
    return { frame: action.frames[lastIndex]!, frameIndex: lastIndex };
  }
  return frameAtTick(loopFrames, (safeTick - headDuration) % loopDuration, loopStart) ?? {
    frame: action.frames[loopStart]!,
    frameIndex: loopStart,
  };
}

export function projectRoundFadeSprite(
  viewport: RoundFadeViewport,
  sprite: Pick<MugenSprite, "width" | "height" | "axisX" | "axisY">,
  frame: Pick<MugenAnimationFrame, "offsetX" | "offsetY" | "flip">,
): RoundFadeSpritePlacement {
  const zoom = Math.max(0.01, viewport.zoom);
  const worldWidth = viewport.width / zoom;
  const worldHeight = viewport.height / zoom;
  const left = viewport.x - worldWidth / 2;
  const top = viewport.y + worldHeight / 2;
  const flip = frame.flip?.toLowerCase() ?? "";
  const flipX: 1 | -1 = flip.includes("h") ? -1 : 1;
  const flipY: 1 | -1 = flip.includes("v") ? -1 : 1;
  const anchorX = flipX === 1 ? sprite.axisX : sprite.width - sprite.axisX;
  const anchorY = flipY === 1 ? sprite.axisY : sprite.height - sprite.axisY;
  return {
    x: left + frame.offsetX - anchorX + sprite.width / 2,
    y: top - frame.offsetY + anchorY - sprite.height / 2,
    width: sprite.width,
    height: sprite.height,
    flipX,
    flipY,
  };
}

function frameAtTick(
  frames: MugenAnimationFrame[],
  tick: number,
  indexOffset: number,
): { frame: MugenAnimationFrame; frameIndex: number } | undefined {
  let cursor = 0;
  for (const [index, frame] of frames.entries()) {
    const duration = effectiveFrameDuration(frame.duration);
    if (tick < cursor + duration || index === frames.length - 1) {
      return { frame, frameIndex: indexOffset + index };
    }
    cursor += duration;
  }
  return undefined;
}

function animationDuration(frames: MugenAnimationFrame[]): number {
  return frames.reduce((total, frame) => total + effectiveFrameDuration(frame.duration), 0);
}

function effectiveFrameDuration(duration: number): number {
  return duration === -1 ? 1 : Math.max(0, Math.round(duration));
}

function isAdditiveBlend(value: string | undefined): boolean {
  return value?.toLowerCase().includes("add") ?? false;
}

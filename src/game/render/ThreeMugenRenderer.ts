import * as THREE from "three";
import type { MugenAnimationAction } from "../../mugen/model/MugenAnimation";
import type { SffArchive } from "../../mugen/model/MugenSprite";
import type { SpriteProvider } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot, MugenSnapshot } from "../../mugen/runtime/types";
import { AxisRenderer } from "./AxisRenderer";
import { CharacterRenderer } from "./CharacterRenderer";
import { CollisionBoxRenderer } from "./CollisionBoxRenderer";
import { HitSparkRenderer } from "./HitSparkRenderer";
import { RoundFadeRenderer } from "./RoundFadeRenderer";
import {
  applyThreePresentationOrder,
  resolveOverlayPresentationOrder,
  resolvePresentationOrder,
} from "./PresentationOrder";
import { TextureStore } from "./TextureStore";
import type { MugenRenderer } from "./types";

export class ThreeMugenRenderer implements MugenRenderer {
  private static readonly minimumWorldHeight = 420;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-320, 320, 180, -180, -100, 100);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  private readonly textures = new TextureStore();
  private readonly axis = new AxisRenderer(this.textures);
  private readonly boxes = new CollisionBoxRenderer();
  private readonly hitSparks: HitSparkRenderer;
  private readonly roundFade: RoundFadeRenderer;
  private readonly characters: CharacterRenderer;
  private readonly pauseOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0x05070c,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    depthTest: false,
  });
  private readonly pauseOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.pauseOverlayMaterial);
  private readonly envColorOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
  });
  private readonly envColorOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.envColorOverlayMaterial);
  private readonly roundFadeOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
  });
  private readonly roundFadeOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.roundFadeOverlayMaterial);
  private target?: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private size = { width: 640, height: 360 };

  constructor(spriteProvider: SpriteProvider) {
    this.characters = new CharacterRenderer(spriteProvider, this.textures);
    this.hitSparks = new HitSparkRenderer(spriteProvider, this.textures);
    this.roundFade = new RoundFadeRenderer(spriteProvider, this.textures);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.scene.add(this.axis.group);
    this.scene.add(this.characters.group);
    this.scene.add(this.hitSparks.group);
    this.scene.add(this.boxes.group);
    this.scene.add(this.roundFade.group);
    this.pauseOverlay.visible = false;
    applyThreePresentationOrder(this.pauseOverlay, this.pauseOverlayMaterial, resolveOverlayPresentationOrder(0));
    this.scene.add(this.pauseOverlay);
    this.envColorOverlay.visible = false;
    applyThreePresentationOrder(this.envColorOverlay, this.envColorOverlayMaterial, resolveOverlayPresentationOrder(1));
    this.scene.add(this.envColorOverlay);
    this.roundFadeOverlay.visible = false;
    applyThreePresentationOrder(this.roundFadeOverlay, this.roundFadeOverlayMaterial, resolveOverlayPresentationOrder(3));
    this.scene.add(this.roundFadeOverlay);
  }

  setStageSpriteArchives(archives: Array<{ stageId: string; archive?: SffArchive }>): void {
    this.axis.setStageSpriteArchives(archives);
  }

  setRoundFadeAnimations(animations: Map<number, MugenAnimationAction> | undefined): void {
    this.roundFade.setAnimations(animations);
  }

  mount(target: HTMLElement): void {
    this.resizeObserver?.disconnect();
    this.target = target;
    this.renderer.domElement.className = "stage-canvas";
    target.appendChild(this.renderer.domElement);
    this.resize();
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(target);
    }
  }

  async render(snapshot: MugenSnapshot): Promise<void> {
    this.axis.update({
      width: this.size.width,
      height: this.size.height,
      showAxis: snapshot.showAxis,
      showGrid: snapshot.showGrid,
      stage: snapshot.stage,
      tick: snapshot.tick,
    });
    const effects = snapshot.effects ?? [];
    const presentedRoots = resolveRootPresentationActors(snapshot);
    await this.characters.update([...presentedRoots, ...effects]);
    await this.hitSparks.update([...snapshot.actors, ...effects], snapshot.tick);
    const collisionActors = [
      ...resolveRootCollisionActors(snapshot),
      ...effects.filter((effect) => effect.clsn1.length > 0 || effect.clsn2.length > 0),
    ];
    this.boxes.update(collisionActors, {
      showClsn1: snapshot.showClsn1,
      showClsn2: snapshot.showClsn2,
    });
    this.camera.position.set(
      snapshot.stage.camera.x + (snapshot.stage.camera.shake?.x ?? 0),
      snapshot.stage.camera.y + (snapshot.stage.camera.shake?.y ?? 0),
      10,
    );
    this.camera.zoom = snapshot.stage.camera.zoom;
    const roundFade = resolveRoundFadePresentation(snapshot);
    await this.roundFade.update(roundFade, {
      x: this.camera.position.x,
      y: this.camera.position.y,
      width: this.size.width,
      height: this.size.height,
      zoom: this.camera.zoom,
    });
    this.pauseOverlay.visible = Boolean(snapshot.matchPause?.darken);
    if (this.pauseOverlay.visible) {
      this.pauseOverlay.position.set(this.camera.position.x, this.camera.position.y, 9);
      this.pauseOverlay.scale.set(this.size.width / this.camera.zoom, this.size.height / this.camera.zoom, 1);
    }
    this.envColorOverlay.visible = Boolean(snapshot.stage.envColor);
    if (snapshot.stage.envColor) {
      const color = snapshot.stage.envColor.color;
      this.envColorOverlayMaterial.color.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
      this.envColorOverlayMaterial.opacity = snapshot.stage.envColor.opacity;
      const envColorOrder = snapshot.stage.envColor.under
        ? resolvePresentationOrder({
            profile: "unknown",
            phase: "stage-background",
            sourceKind: "overlay",
            blendPolicy: "alpha",
            priority: 999,
            tieBreaker: 0,
            tiePolicy: "explicit",
          })
        : resolveOverlayPresentationOrder(2);
      applyThreePresentationOrder(this.envColorOverlay, this.envColorOverlayMaterial, envColorOrder);
      this.envColorOverlay.position.set(this.camera.position.x, this.camera.position.y, snapshot.stage.envColor.under ? -1 : 9.5);
      this.envColorOverlay.scale.set(this.size.width / this.camera.zoom, this.size.height / this.camera.zoom, 1);
    }
    this.roundFadeOverlay.visible = Boolean(roundFade);
    if (roundFade) {
      const color = roundFade.color;
      const fadeDiagnostics = this.roundFade.getDiagnostics();
      const fallbackOpacity = roundFade.animationNo !== undefined && !fadeDiagnostics.resolved
        ? roundFade.direction === "in"
          ? Math.max(0, 1 - roundFade.frame / Math.max(1, roundFade.duration))
          : Math.min(1, roundFade.frame / Math.max(1, roundFade.duration))
        : roundFade.opacity;
      this.roundFadeOverlayMaterial.color.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
      this.roundFadeOverlayMaterial.opacity = Math.max(0, Math.min(1, fallbackOpacity));
      this.roundFadeOverlay.position.set(this.camera.position.x, this.camera.position.y, 10);
      this.roundFadeOverlay.scale.set(this.size.width / this.camera.zoom, this.size.height / this.camera.zoom, 1);
    } else {
      this.roundFadeOverlayMaterial.opacity = 0;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  resize(): void {
    if (!this.target) {
      return;
    }
    const canvasRect = this.renderer.domElement.getBoundingClientRect();
    const targetRect = this.target.getBoundingClientRect();
    const rect = canvasRect.width > 0 && canvasRect.height > 0 ? canvasRect : targetRect;
    this.size = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };
    const aspect = this.size.width / this.size.height;
    const worldHeight = Math.max(this.size.height, ThreeMugenRenderer.minimumWorldHeight);
    const worldWidth = Math.max(this.size.width, worldHeight * aspect);
    const halfWidth = worldWidth / 2;
    const halfHeight = worldHeight / 2;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.width, this.size.height, false);
  }

  getDiagnostics(): {
    size: { width: number; height: number };
    pixelRatio: number;
    camera: { x: number; y: number; zoom: number };
    render: { calls: number; triangles: number; points: number; lines: number };
    memory: { geometries: number; textures: number };
    hitSparks: ReturnType<HitSparkRenderer["getDiagnostics"]>;
    characters: ReturnType<CharacterRenderer["getDiagnostics"]>;
    stage: ReturnType<AxisRenderer["getDiagnostics"]>;
    presentationGroups: { stage: number; characters: number; hitSparks: number; collision: number };
    collision: ReturnType<CollisionBoxRenderer["getDiagnostics"]>;
    roundFade: { visible: boolean; opacity: number; color: number; asset: ReturnType<RoundFadeRenderer["getDiagnostics"]> };
  } {
    return {
      size: this.size,
      pixelRatio: this.renderer.getPixelRatio(),
      camera: { x: this.camera.position.x, y: this.camera.position.y, zoom: this.camera.zoom },
      render: {
        calls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles,
        points: this.renderer.info.render.points,
        lines: this.renderer.info.render.lines,
      },
      memory: {
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
      },
      hitSparks: this.hitSparks.getDiagnostics(),
      characters: this.characters.getDiagnostics(),
      stage: this.axis.getDiagnostics(),
      collision: this.boxes.getDiagnostics(),
      presentationGroups: {
        stage: this.axis.group.renderOrder,
        characters: this.characters.group.renderOrder,
        hitSparks: this.hitSparks.group.renderOrder,
        collision: this.boxes.group.renderOrder,
      },
      roundFade: {
        visible: this.roundFadeOverlay.visible,
        opacity: this.roundFadeOverlayMaterial.opacity,
        color: this.roundFadeOverlayMaterial.color.getHex(),
        asset: this.roundFade.getDiagnostics(),
      },
    };
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.axis.dispose();
    this.boxes.dispose();
    this.hitSparks.dispose();
    this.roundFade.dispose();
    this.characters.dispose();
    this.pauseOverlay.geometry.dispose();
    this.pauseOverlayMaterial.dispose();
    this.envColorOverlay.geometry.dispose();
    this.envColorOverlayMaterial.dispose();
    this.roundFadeOverlay.geometry.dispose();
    this.roundFadeOverlayMaterial.dispose();
    this.textures.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export function resolveRoundFadePresentation(
  snapshot: Pick<MugenSnapshot, "round">,
): NonNullable<NonNullable<MugenSnapshot["round"]>["postRound"]>["fadeOut"] | undefined {
  const fadeOut = snapshot.round?.postRound?.fadeOut;
  if (fadeOut?.active) return fadeOut;
  const fadeIn = snapshot.round?.preRound?.fadeIn;
  return fadeIn?.active ? fadeIn : undefined;
}

export function resolveRootPresentationActors(
  snapshot: Pick<MugenSnapshot, "actors" | "reserveActors" | "rootPresentation">,
): ActorSnapshot[] {
  if (!snapshot.rootPresentation) return snapshot.actors;
  return resolveRootActors(snapshot, snapshot.rootPresentation.drawRootIds, "draw");
}

export function resolveRootCollisionActors(
  snapshot: Pick<MugenSnapshot, "actors" | "reserveActors" | "rootPresentation">,
): ActorSnapshot[] {
  if (!snapshot.rootPresentation) return snapshot.actors;
  return resolveRootActors(snapshot, snapshot.rootPresentation.collisionRootIds, "collision");
}

function resolveRootActors(
  snapshot: Pick<MugenSnapshot, "actors" | "reserveActors">,
  ids: readonly string[],
  consumer: "draw" | "collision",
): ActorSnapshot[] {

  const roots = [...snapshot.actors, ...(snapshot.reserveActors ?? [])];
  const byId = new Map<string, ActorSnapshot>();
  for (const root of roots) {
    if (byId.has(root.id)) throw new Error(`Duplicate root presentation snapshot actor ${root.id}`);
    byId.set(root.id, root);
  }

  const selected = new Set<string>();
  return ids.map((id) => {
    if (selected.has(id)) throw new Error(`Duplicate root presentation ${consumer} id ${id}`);
    selected.add(id);
    const root = byId.get(id);
    if (!root) throw new Error(`Unknown root presentation ${consumer} actor ${id}`);
    return root;
  });
}

import * as THREE from "three";
import type { SffArchive } from "../../mugen/model/MugenSprite";
import type { SpriteProvider } from "../../mugen/model/MugenSprite";
import type { MugenSnapshot } from "../../mugen/runtime/types";
import { AxisRenderer } from "./AxisRenderer";
import { CharacterRenderer } from "./CharacterRenderer";
import { CollisionBoxRenderer } from "./CollisionBoxRenderer";
import { HitSparkRenderer } from "./HitSparkRenderer";
import { TextureStore } from "./TextureStore";
import type { MugenRenderer } from "./types";

export class ThreeMugenRenderer implements MugenRenderer {
  private static readonly minimumWorldHeight = 888;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-320, 320, 180, -180, -100, 100);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  private readonly textures = new TextureStore();
  private readonly axis = new AxisRenderer(this.textures);
  private readonly boxes = new CollisionBoxRenderer();
  private readonly hitSparks = new HitSparkRenderer();
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
  private target?: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private size = { width: 640, height: 360 };

  constructor(spriteProvider: SpriteProvider) {
    this.characters = new CharacterRenderer(spriteProvider, this.textures);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.scene.add(this.axis.group);
    this.scene.add(this.characters.group);
    this.scene.add(this.hitSparks.group);
    this.scene.add(this.boxes.group);
    this.pauseOverlay.visible = false;
    this.pauseOverlay.renderOrder = 1000;
    this.scene.add(this.pauseOverlay);
    this.envColorOverlay.visible = false;
    this.envColorOverlay.renderOrder = 1001;
    this.scene.add(this.envColorOverlay);
  }

  setStageSpriteArchives(archives: Array<{ stageId: string; archive?: SffArchive }>): void {
    this.axis.setStageSpriteArchives(archives);
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
    await this.characters.update([...snapshot.actors, ...effects]);
    this.hitSparks.update([...snapshot.actors, ...effects], snapshot.tick);
    const collisionActors = [...snapshot.actors, ...effects.filter((effect) => effect.clsn1.length > 0 || effect.clsn2.length > 0)];
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
      this.envColorOverlay.renderOrder = snapshot.stage.envColor.under ? 2 : 1002;
      this.envColorOverlay.position.set(this.camera.position.x, this.camera.position.y, snapshot.stage.envColor.under ? -1 : 9.5);
      this.envColorOverlay.scale.set(this.size.width / this.camera.zoom, this.size.height / this.camera.zoom, 1);
    }
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  resize(): void {
    if (!this.target) {
      return;
    }
    const rect = this.target.getBoundingClientRect();
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
    render: { calls: number; triangles: number; points: number; lines: number };
    memory: { geometries: number; textures: number };
    hitSparks: { active: number };
  } {
    return {
      size: this.size,
      pixelRatio: this.renderer.getPixelRatio(),
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
      hitSparks: {
        active: this.hitSparks.getActiveCount(),
      },
    };
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.axis.dispose();
    this.boxes.dispose();
    this.hitSparks.dispose();
    this.characters.dispose();
    this.pauseOverlay.geometry.dispose();
    this.pauseOverlayMaterial.dispose();
    this.envColorOverlay.geometry.dispose();
    this.envColorOverlayMaterial.dispose();
    this.textures.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

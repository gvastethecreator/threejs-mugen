import * as THREE from "three";
import type { SffArchive } from "../../mugen/model/MugenSprite";
import type { SpriteProvider } from "../../mugen/model/MugenSprite";
import type { MugenSnapshot } from "../../mugen/runtime/types";
import { AxisRenderer } from "./AxisRenderer";
import { CharacterRenderer } from "./CharacterRenderer";
import { CollisionBoxRenderer } from "./CollisionBoxRenderer";
import { TextureStore } from "./TextureStore";
import type { MugenRenderer } from "./types";

export class ThreeMugenRenderer implements MugenRenderer {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-320, 320, 180, -180, -100, 100);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  private readonly textures = new TextureStore();
  private readonly axis = new AxisRenderer(this.textures);
  private readonly boxes = new CollisionBoxRenderer();
  private readonly characters: CharacterRenderer;
  private readonly pauseOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0x05070c,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    depthTest: false,
  });
  private readonly pauseOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.pauseOverlayMaterial);
  private target?: HTMLElement;
  private size = { width: 640, height: 360 };

  constructor(spriteProvider: SpriteProvider) {
    this.characters = new CharacterRenderer(spriteProvider, this.textures);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.scene.add(this.axis.group);
    this.scene.add(this.characters.group);
    this.scene.add(this.boxes.group);
    this.pauseOverlay.visible = false;
    this.pauseOverlay.renderOrder = 1000;
    this.scene.add(this.pauseOverlay);
  }

  setStageSpriteArchives(archives: Array<{ stageId: string; archive?: SffArchive }>): void {
    this.axis.setStageSpriteArchives(archives);
  }

  mount(target: HTMLElement): void {
    this.target = target;
    this.renderer.domElement.className = "stage-canvas";
    target.appendChild(this.renderer.domElement);
    this.resize();
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
    const halfWidth = this.size.width / 2;
    const halfHeight = this.size.height / 2;
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
    };
  }

  dispose(): void {
    this.axis.dispose();
    this.boxes.dispose();
    this.characters.dispose();
    this.pauseOverlay.geometry.dispose();
    this.pauseOverlayMaterial.dispose();
    this.textures.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

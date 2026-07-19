import * as THREE from "three";
import type { RuntimeRoundShutterSnapshot } from "../../mugen/runtime/types";
import { applyThreePresentationOrder, resolveOverlayPresentationOrder } from "./PresentationOrder";

export type RoundShutterViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
};

export type RoundShutterBarPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RoundShutterProjection = {
  coverHeight: number;
  top: RoundShutterBarPlacement;
  bottom: RoundShutterBarPlacement;
};

export type RoundShutterRendererDiagnostics = {
  active: boolean;
  coverHeight: number;
  color?: [number, number, number];
  renderOrder?: number;
};

type ShutterMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

export class RoundShutterRenderer {
  readonly group = new THREE.Group();
  private readonly material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    depthTest: false,
  });
  private readonly top: ShutterMesh;
  private readonly bottom: ShutterMesh;
  private diagnostics: RoundShutterRendererDiagnostics = { active: false, coverHeight: 0 };

  constructor() {
    this.top = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
    this.bottom = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
    this.top.visible = false;
    this.bottom.visible = false;
    this.group.add(this.top, this.bottom);
  }

  update(shutter: RuntimeRoundShutterSnapshot | undefined, viewport: RoundShutterViewport): void {
    if (!shutter?.active || shutter.remaining <= 0) {
      this.top.visible = false;
      this.bottom.visible = false;
      this.diagnostics = { active: false, coverHeight: 0 };
      return;
    }

    const projection = projectRoundShutterBars(shutter, viewport);
    const color = shutter.color;
    this.material.color.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
    this.material.opacity = 1;
    this.material.needsUpdate = true;
    this.applyBar(this.top, projection.top);
    this.applyBar(this.bottom, projection.bottom);
    this.top.visible = projection.coverHeight > 0;
    this.bottom.visible = projection.coverHeight > 0;
    this.diagnostics = {
      active: true,
      coverHeight: projection.coverHeight,
      color: [...color] as [number, number, number],
      renderOrder: this.top.renderOrder,
    };
  }

  getDiagnostics(): RoundShutterRendererDiagnostics {
    return structuredClone(this.diagnostics);
  }

  dispose(): void {
    this.group.remove(this.top, this.bottom);
    this.top.geometry.dispose();
    this.bottom.geometry.dispose();
    this.material.dispose();
  }

  private applyBar(
    mesh: ShutterMesh,
    placement: RoundShutterBarPlacement,
  ): void {
    mesh.position.set(placement.x, placement.y, 10.4);
    mesh.scale.set(placement.width, placement.height, 1);
    applyThreePresentationOrder(mesh, this.material, resolveOverlayPresentationOrder(4));
  }
}

export function projectRoundShutterBars(
  shutter: Pick<RuntimeRoundShutterSnapshot, "frame" | "duration" | "shutterTime">,
  viewport: RoundShutterViewport,
): RoundShutterProjection {
  const zoom = Math.max(0.01, viewport.zoom);
  const worldWidth = viewport.width / zoom;
  const worldHeight = viewport.height / zoom;
  const halfHeight = worldHeight / 2;
  const time = Math.max(1, shutter.shutterTime);
  const frame = Math.max(0, Math.min(shutter.duration, shutter.frame));
  const progress = frame <= time
    ? frame / time
    : Math.max(0, Math.min(1, (shutter.duration - frame) / time));
  const coverHeight = Math.max(0, Math.min(halfHeight, halfHeight * progress));
  return {
    coverHeight,
    top: {
      x: viewport.x,
      y: viewport.y + halfHeight - coverHeight / 2,
      width: worldWidth,
      height: coverHeight,
    },
    bottom: {
      x: viewport.x,
      y: viewport.y - halfHeight + coverHeight / 2,
      width: worldWidth,
      height: coverHeight,
    },
  };
}

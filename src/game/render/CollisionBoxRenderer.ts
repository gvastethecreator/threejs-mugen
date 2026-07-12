import * as THREE from "three";
import type { ActorSnapshot } from "../../mugen/runtime/types";
import { projectCollisionBox } from "./projection";
import { createRect } from "./AxisRenderer";
import { applyThreePresentationOrder, resolvePresentationOrder } from "./PresentationOrder";

export class CollisionBoxRenderer {
  readonly group = new THREE.Group();
  private readonly hitMaterial = new THREE.MeshBasicMaterial({
    color: "#ff4d5d",
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  private readonly hurtMaterial = new THREE.MeshBasicMaterial({
    color: "#42a5ff",
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  });
  private actorIds: string[] = [];
  private hitBoxCount = 0;
  private hurtBoxCount = 0;

  update(actors: ActorSnapshot[], options: { showClsn1: boolean; showClsn2: boolean }): void {
    this.clear();
    this.actorIds = actors.map(({ id }) => id);
    for (const actor of actors) {
      if (options.showClsn2) {
        for (const box of actor.clsn2) {
          this.hurtBoxCount += 1;
          const projected = projectCollisionBox(actor, box);
          const mesh = createRect(projected.x, projected.y, projected.width, projected.height, this.hurtMaterial);
          applyThreePresentationOrder(mesh, this.hurtMaterial, debugPresentationOrder(1));
          mesh.position.z = 3;
          this.group.add(mesh);
        }
      }
      if (options.showClsn1) {
        for (const box of actor.clsn1) {
          this.hitBoxCount += 1;
          const projected = projectCollisionBox(actor, box);
          const mesh = createRect(projected.x, projected.y, projected.width, projected.height, this.hitMaterial);
          applyThreePresentationOrder(mesh, this.hitMaterial, debugPresentationOrder(2));
          mesh.position.z = 4;
          this.group.add(mesh);
        }
      }
    }
  }

  dispose(): void {
    this.clear();
    this.hitMaterial.dispose();
    this.hurtMaterial.dispose();
  }

  getDiagnostics(): { actorIds: string[]; hitBoxCount: number; hurtBoxCount: number } {
    return {
      actorIds: [...this.actorIds],
      hitBoxCount: this.hitBoxCount,
      hurtBoxCount: this.hurtBoxCount,
    };
  }

  private clear(): void {
    this.actorIds = [];
    this.hitBoxCount = 0;
    this.hurtBoxCount = 0;
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
  }
}

function debugPresentationOrder(priority: number) {
  return resolvePresentationOrder({
    profile: "unknown",
    phase: "debug",
    sourceKind: "debug",
    blendPolicy: "alpha",
    priority,
    tieBreaker: 0,
    tiePolicy: "explicit",
  });
}

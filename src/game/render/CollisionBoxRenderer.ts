import * as THREE from "three";
import type { ActorSnapshot } from "../../mugen/runtime/types";
import { projectCollisionBox } from "./projection";
import { createRect } from "./AxisRenderer";

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

  update(actors: ActorSnapshot[], options: { showClsn1: boolean; showClsn2: boolean }): void {
    this.clear();
    for (const actor of actors) {
      if (options.showClsn2) {
        for (const box of actor.clsn2) {
          const projected = projectCollisionBox(actor, box);
          const mesh = createRect(projected.x, projected.y, projected.width, projected.height, this.hurtMaterial);
          mesh.position.z = 3;
          this.group.add(mesh);
        }
      }
      if (options.showClsn1) {
        for (const box of actor.clsn1) {
          const projected = projectCollisionBox(actor, box);
          const mesh = createRect(projected.x, projected.y, projected.width, projected.height, this.hitMaterial);
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

  private clear(): void {
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
  }
}

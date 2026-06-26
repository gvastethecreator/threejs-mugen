import * as THREE from "three";
import type { SpriteProvider } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot } from "../../mugen/runtime/types";
import { TextureStore } from "./TextureStore";
import { projectSprite } from "./projection";

export class CharacterRenderer {
  readonly group = new THREE.Group();
  private readonly meshes = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
  private readonly afterimageMeshes = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]>();

  constructor(
    private readonly spriteProvider: SpriteProvider,
    private readonly textures: TextureStore,
  ) {}

  async update(actors: ActorSnapshot[]): Promise<void> {
    const activeIds = new Set(actors.map((actor) => actor.id));
    for (const [id, mesh] of this.meshes) {
      if (!activeIds.has(id)) {
        this.group.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.meshes.delete(id);
      }
    }
    for (const [id, meshes] of this.afterimageMeshes) {
      if (!activeIds.has(id)) {
        meshes.forEach((mesh) => disposeMesh(this.group, mesh));
        this.afterimageMeshes.delete(id);
      }
    }

    for (const actor of actors) {
      await this.updateAfterImages(actor);
      const ownerContext = spriteLookupContext(actor);
      const frame = actor.frame;
      const sprite = frame
        ? await this.spriteProvider.getSprite(frame.spriteGroup, frame.spriteIndex, ownerContext)
        : await this.spriteProvider.getSprite(9000, actor.id === "p2" ? 2 : 1, ownerContext);
      if (!sprite) {
        continue;
      }

      let mesh = this.meshes.get(actor.id);
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ transparent: true, depthWrite: true }),
        );
        this.meshes.set(actor.id, mesh);
        this.group.add(mesh);
      }

      const projected = projectSprite(actor, sprite);
      mesh.material.map = this.textures.getTexture(sprite, ownerContext.ownerId ?? actor.id);
      applyPaletteFx(mesh.material, actor.runtime.paletteFx, actor.runtime.renderOpacity);
      mesh.material.needsUpdate = true;
      const priority = actor.runtime.spritePriority ?? (actor.id === "p2" ? 1 : 2);
      const orderBias = actor.id === "p2" ? 0.01 : 0.02;
      mesh.position.x = projected.x;
      mesh.position.y = projected.y;
      mesh.position.z = 1 + Math.max(-5, Math.min(10, priority)) * 0.05 + orderBias;
      mesh.scale.set(projected.width * projected.scaleX, projected.height, 1);
    }
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) {
      disposeMesh(this.group, mesh);
    }
    this.meshes.clear();
    for (const meshes of this.afterimageMeshes.values()) {
      meshes.forEach((mesh) => disposeMesh(this.group, mesh));
    }
    this.afterimageMeshes.clear();
  }

  private async updateAfterImages(actor: ActorSnapshot): Promise<void> {
    const effect = actor.runtime.afterImage;
    const samples = effect?.samples ?? [];
    const meshes = this.afterimageMeshes.get(actor.id) ?? [];
    this.afterimageMeshes.set(actor.id, meshes);
    while (meshes.length > samples.length) {
      disposeMesh(this.group, meshes.pop()!);
    }

    for (let index = 0; index < samples.length; index += 1) {
      const sample = samples[index]!;
      const sampleOwnerId = sample.spriteOwnerId ?? actor.spriteOwnerId ?? actor.id;
      const sprite = await this.spriteProvider.getSprite(sample.spriteGroup, sample.spriteIndex, { ownerId: sampleOwnerId });
      if (!sprite || !effect) {
        continue;
      }
      let mesh = meshes[index];
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.25 }),
        );
        meshes[index] = mesh;
        this.group.add(mesh);
      }
      const ghostActor = createAfterImageActor(actor, sample);
      const projected = projectSprite(ghostActor, sprite);
      mesh.material.map = this.textures.getTexture(sprite, sampleOwnerId);
      applyAfterImageMaterial(mesh.material, effect, index);
      mesh.material.needsUpdate = true;
      const priority = actor.runtime.spritePriority ?? (actor.id === "p2" ? 1 : 2);
      mesh.position.x = projected.x;
      mesh.position.y = projected.y;
      mesh.position.z = 0.78 + Math.max(-5, Math.min(10, priority)) * 0.05 - index * 0.012;
      mesh.scale.set(projected.width * projected.scaleX, projected.height, 1);
    }
  }
}

function createAfterImageActor(
  actor: ActorSnapshot,
  sample: NonNullable<ActorSnapshot["runtime"]["afterImage"]>["samples"][number],
): ActorSnapshot {
  const frame = actor.frame
    ? {
        ...actor.frame,
        spriteGroup: sample.spriteGroup,
        spriteIndex: sample.spriteIndex,
        offsetX: sample.offsetX,
        offsetY: sample.offsetY,
      }
    : undefined;
  return {
    ...actor,
    frame,
    runtime: {
      ...actor.runtime,
      pos: { ...sample.pos },
      facing: sample.facing,
    },
  };
}

function spriteLookupContext(actor: ActorSnapshot): { ownerId: string } {
  return { ownerId: actor.spriteOwnerId ?? actor.id };
}

function applyAfterImageMaterial(
  material: THREE.MeshBasicMaterial,
  effect: NonNullable<ActorSnapshot["runtime"]["afterImage"]>,
  index: number,
): void {
  const fade = Math.max(0, 1 - index / Math.max(1, effect.length));
  const addTint = effect.palAdd.map((value) => Math.max(0, value) / 255) as [number, number, number];
  const mulTint = effect.palMul.map((value) => Math.max(0, value) / 256) as [number, number, number];
  material.color.setRGB(
    clamp01(mulTint[0] + addTint[0] * 0.32),
    clamp01(mulTint[1] + addTint[1] * 0.32),
    clamp01(mulTint[2] + addTint[2] * 0.32),
  );
  material.opacity = clamp01(effect.opacity * fade);
  material.blending = effect.palAdd.some((value) => value > 0) ? THREE.AdditiveBlending : THREE.NormalBlending;
  material.transparent = true;
  material.depthWrite = false;
}

function disposeMesh(group: THREE.Group, mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>): void {
  group.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
}

function applyPaletteFx(
  material: THREE.MeshBasicMaterial,
  paletteFx: ActorSnapshot["runtime"]["paletteFx"],
  renderOpacity = 1,
): void {
  if (!paletteFx) {
    material.color.setRGB(1, 1, 1);
    material.opacity = renderOpacity;
    material.blending = THREE.NormalBlending;
    material.transparent = true;
    return;
  }

  const progress = paletteFx.time > 0 ? paletteFx.remaining / paletteFx.time : 1;
  const addTint = paletteFx.add.map((value) => Math.max(0, value) / 255) as [number, number, number];
  const mulTint = paletteFx.mul.map((value) => Math.max(0, value) / 256) as [number, number, number];
  const colorLevel = paletteFx.color / 256;
  const saturationLoss = (1 - colorLevel) * 0.25;
  const invertBoost = paletteFx.invert ? 0.35 : 0;
  material.color.setRGB(
    clamp01((mulTint[0] * (1 - saturationLoss) + addTint[0] * 0.42 + invertBoost) * progress + (1 - progress)),
    clamp01((mulTint[1] * (1 - saturationLoss) + addTint[1] * 0.42 + invertBoost) * progress + (1 - progress)),
    clamp01((mulTint[2] * (1 - saturationLoss) + addTint[2] * 0.42 + invertBoost) * progress + (1 - progress)),
  );
  material.opacity = clamp01((0.72 + progress * 0.28) * renderOpacity);
  material.blending = paletteFx.add.some((value) => value > 0) ? THREE.AdditiveBlending : THREE.NormalBlending;
  material.transparent = true;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

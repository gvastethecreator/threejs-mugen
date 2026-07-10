import * as THREE from "three";
import type { SpriteProvider } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot } from "../../mugen/runtime/types";
import { TextureStore } from "./TextureStore";
import { projectSprite } from "./projection";

export class CharacterRenderer {
  readonly group = new THREE.Group();
  private readonly meshes = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
  private readonly shadowMeshes = new Map<string, THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>>();
  private readonly afterimageMeshes = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]>();
  private readonly presentations = new Map<string, CharacterSpritePresentation>();

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
        this.presentations.delete(id);
      }
    }
    for (const [id, mesh] of this.shadowMeshes) {
      if (!activeIds.has(id)) {
        disposeMesh(this.group, mesh);
        this.shadowMeshes.delete(id);
      }
    }
    for (const [id, meshes] of this.afterimageMeshes) {
      if (!activeIds.has(id)) {
        meshes.forEach((mesh) => disposeMesh(this.group, mesh));
        this.afterimageMeshes.delete(id);
      }
    }

    for (const actor of actors) {
      this.updateShadow(actor);
      await this.updateAfterImages(actor);
      const ownerContext = spriteLookupContext(actor);
      const frame = actor.frame;
      const sprite = frame
        ? await this.spriteProvider.getSprite(frame.spriteGroup, frame.spriteIndex, ownerContext)
        : await this.spriteProvider.getSprite(9000, actor.id === "p2" ? 2 : 1, ownerContext);
      if (!sprite) {
        this.presentations.delete(actor.id);
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
      mesh.rotation.z = THREE.MathUtils.degToRad(-(actor.runtime.renderAngle ?? 0));
      mesh.scale.set(projected.width * projected.scaleX, projected.height, 1);
      this.presentations.set(actor.id, {
        actorId: actor.id,
        actorPosition: { ...actor.runtime.pos },
        facing: actor.runtime.facing,
        sprite: { width: sprite.width, height: sprite.height, axisX: sprite.axisX, axisY: sprite.axisY },
        frameOffset: { x: frame?.offsetX ?? 0, y: frame?.offsetY ?? 0 },
        renderScale: { ...(actor.runtime.renderScale ?? { x: 1, y: 1 }) },
        meshPosition: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
        meshScale: { x: mesh.scale.x, y: mesh.scale.y },
      });
    }
  }

  getDiagnostics(): CharacterSpritePresentation[] {
    return [...this.presentations.values()].map((presentation) => structuredClone(presentation));
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) {
      disposeMesh(this.group, mesh);
    }
    this.meshes.clear();
    this.presentations.clear();
    for (const mesh of this.shadowMeshes.values()) {
      disposeMesh(this.group, mesh);
    }
    this.shadowMeshes.clear();
    for (const meshes of this.afterimageMeshes.values()) {
      meshes.forEach((mesh) => disposeMesh(this.group, mesh));
    }
    this.afterimageMeshes.clear();
  }

  private updateShadow(actor: ActorSnapshot): void {
    const presentation = resolveActorShadowPresentation(actor);
    const existing = this.shadowMeshes.get(actor.id);
    if (!presentation) {
      if (existing) {
        disposeMesh(this.group, existing);
        this.shadowMeshes.delete(actor.id);
      }
      return;
    }

    let mesh = existing;
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.5, 40),
        new THREE.MeshBasicMaterial({
          color: 0x05070c,
          transparent: true,
          opacity: presentation.opacity,
          depthWrite: false,
        }),
      );
      this.shadowMeshes.set(actor.id, mesh);
      this.group.add(mesh);
    }
    mesh.material.opacity = presentation.opacity;
    mesh.position.set(presentation.x, presentation.y, presentation.z);
    mesh.scale.set(presentation.width, presentation.height, 1);
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
      const sprite = await this.spriteProvider.getSprite(sample.spriteGroup, sample.spriteIndex, {
        ownerId: sampleOwnerId,
        paletteRemap: actor.runtime.paletteRemap,
      });
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
      mesh.rotation.z = 0;
      mesh.scale.set(projected.width * projected.scaleX, projected.height, 1);
    }
  }
}

export type CharacterSpritePresentation = {
  actorId: string;
  actorPosition: { x: number; y: number };
  facing: 1 | -1;
  sprite: { width: number; height: number; axisX: number; axisY: number };
  frameOffset: { x: number; y: number };
  renderScale: { x: number; y: number };
  meshPosition: { x: number; y: number; z: number };
  meshScale: { x: number; y: number };
};

export type ActorShadowPresentation = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  opacity: number;
};

export function resolveActorShadowPresentation(actor: ActorSnapshot): ActorShadowPresentation | undefined {
  if (actor.shadowVisible === false || !supportsActorShadow(actor)) {
    return undefined;
  }
  const scale = actor.runtime.renderScale ?? { x: 1, y: 1 };
  const scaleX = Math.max(0.1, Math.abs(scale.x));
  const scaleY = Math.max(0.1, Math.abs(scale.y));
  const bodyWidth = actor.runtime.bodyWidth ? (actor.runtime.bodyWidth.front + actor.runtime.bodyWidth.back) * scaleX : 0;
  const hurtBoxWidth = actor.clsn2.reduce((maxWidth, box) => Math.max(maxWidth, Math.abs(box.x2 - box.x1) * scaleX), 0);
  const minimumWidth = actor.actorKind === "explod" ? 24 : 36;
  const width = Math.max(minimumWidth, bodyWidth, hurtBoxWidth * 0.72);
  const height = Math.max(6, width * 0.18 * scaleY);
  return {
    x: actor.runtime.pos.x,
    y: 0,
    z: 0.08,
    width,
    height,
    opacity: actor.actorKind === "explod" ? 0.14 : 0.2,
  };
}

function supportsActorShadow(actor: ActorSnapshot): boolean {
  return actor.actorKind === "player" || actor.actorKind === "helper" || actor.actorKind === "explod";
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

function spriteLookupContext(actor: ActorSnapshot): { ownerId: string; paletteRemap: ActorSnapshot["runtime"]["paletteRemap"] } {
  return { ownerId: actor.spriteOwnerId ?? actor.id, paletteRemap: actor.runtime.paletteRemap };
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

function disposeMesh(group: THREE.Group, mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>): void {
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

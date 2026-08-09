import * as THREE from "three";
import type { SpriteProvider } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot } from "../../mugen/runtime/types";
import { TextureStore } from "./TextureStore";
import {
  applyThreePresentationOrder,
  resolveActorPresentationOrder,
  resolveActorUnderlayPresentationOrder,
  resolveThreePresentationOrder,
  type ResolvedPresentationOrder,
} from "./PresentationOrder";
import { applyPaletteFxMaterial } from "./PaletteFxMaterial";
import { projectSprite, type ProjectedSprite } from "./projection";

export class CharacterRenderer {
  readonly group = new THREE.Group();
  private readonly meshes = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
  private readonly shadowMeshes = new Map<string, THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>>();
  private readonly reflectionMeshes = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
  private readonly shadowPresentationOrders = new Map<string, ResolvedPresentationOrder>();
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
        this.shadowPresentationOrders.delete(id);
      }
    }
    for (const [id, mesh] of this.reflectionMeshes) {
      if (!activeIds.has(id)) {
        disposeMesh(this.group, mesh);
        this.reflectionMeshes.delete(id);
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
        this.removeReflection(actor.id);
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
      applyPaletteFxMaterial(mesh.material, actor.runtime.paletteFx, actor.runtime.renderOpacity);
      mesh.material.needsUpdate = true;
      const priority = actor.runtime.spritePriority ?? (actor.id === "p2" ? 1 : 2);
      const orderBias = actor.id === "p2" ? 0.01 : 0.02;
      const presentationOrder = actor.presentationOrder
        ? resolveThreePresentationOrder(actor.presentationOrder)
        : resolveActorPresentationOrder(actor.actorKind, priority, Math.round(orderBias * 100));
      applyThreePresentationOrder(mesh, mesh.material, presentationOrder);
      mesh.position.x = projected.x;
      mesh.position.y = projected.y;
      mesh.position.z = resolveCharacterRenderDepth(priority, orderBias);
      mesh.scale.set(projected.width * projected.scaleX, projected.height, 1);
      applyCharacterMeshProjection(mesh, {
        projection: actor.runtime.renderProjection ?? "orthographic",
        focalLength: actor.runtime.renderFocalLength ?? 0,
        angle: actor.runtime.renderAngle ?? 0,
        xAngle: actor.runtime.renderAngleX ?? 0,
        yAngle: actor.runtime.renderAngleY ?? 0,
        xShear: actor.runtime.renderShearX ?? 0,
        clip: resolveCharacterMeshClip(actor, projected),
      });
      this.updateReflection(actor, mesh);
      this.presentations.set(actor.id, {
        actorId: actor.id,
        actorPosition: { ...actor.runtime.pos },
        facing: actor.runtime.facing,
        sprite: { width: sprite.width, height: sprite.height, axisX: sprite.axisX, axisY: sprite.axisY },
        frame: { group: frame?.spriteGroup ?? 9000, index: frame?.spriteIndex ?? (actor.id === "p2" ? 2 : 1) },
        frameOffset: { x: frame?.offsetX ?? 0, y: frame?.offsetY ?? 0 },
        renderScale: { ...(actor.runtime.renderScale ?? { x: 1, y: 1 }) },
        spritePriority: priority,
        orderBias,
        presentationOrder,
        meshRenderOrder: mesh.renderOrder,
        material: {
          transparent: mesh.material.transparent,
          depthTest: mesh.material.depthTest,
          depthWrite: mesh.material.depthWrite,
        },
        shadow: this.shadowDiagnostic(actor.id),
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
    this.shadowPresentationOrders.clear();
    for (const mesh of this.reflectionMeshes.values()) {
      disposeMesh(this.group, mesh);
    }
    this.reflectionMeshes.clear();
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
        this.shadowPresentationOrders.delete(actor.id);
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
    mesh.material.color.setRGB(
      clamp01(presentation.color[0] / 255),
      clamp01(presentation.color[1] / 255),
      clamp01(presentation.color[2] / 255),
    );
    const presentationOrder = resolveActorUnderlayPresentationOrder(
      actor.id === "p2" ? 1 : 2,
      actor.presentationOrder?.profile ?? "unknown",
    );
    applyThreePresentationOrder(mesh, mesh.material, presentationOrder);
    this.shadowPresentationOrders.set(actor.id, presentationOrder);
    mesh.position.set(presentation.x, presentation.y, presentation.z);
    mesh.scale.set(presentation.width, presentation.height, 1);
  }

  private shadowDiagnostic(actorId: string): CharacterShadowPresentation | undefined {
    const mesh = this.shadowMeshes.get(actorId);
    const presentationOrder = this.shadowPresentationOrders.get(actorId);
    if (!mesh || !presentationOrder) {
      return undefined;
    }
    return {
      presentationOrder,
      meshRenderOrder: mesh.renderOrder,
      material: {
        transparent: mesh.material.transparent,
        depthTest: mesh.material.depthTest,
        depthWrite: mesh.material.depthWrite,
      },
    };
  }

  private updateReflection(
    actor: ActorSnapshot,
    source: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
  ): void {
    if (!source.visible || !shouldRenderActorReflection(actor)) {
      this.removeReflection(actor.id);
      return;
    }

    let mesh = this.reflectionMeshes.get(actor.id);
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
          opacity: 0.28,
          side: THREE.DoubleSide,
        }),
      );
      mesh.name = `mugen-reflection:${actor.id}`;
      this.reflectionMeshes.set(actor.id, mesh);
      this.group.add(mesh);
    }

    mesh.material.map = source.material.map;
    mesh.material.color.copy(source.material.color).multiplyScalar(0.62);
    mesh.material.opacity = clamp01(source.material.opacity * 0.32);
    mesh.material.blending = source.material.blending;
    mesh.material.needsUpdate = true;
    applyThreePresentationOrder(
      mesh,
      mesh.material,
      resolveActorUnderlayPresentationOrder(
        actor.id === "p2" ? 1 : 2,
        actor.presentationOrder?.profile ?? "unknown",
      ),
    );
    mesh.position.set(source.position.x, -source.position.y, 0.07);
    copyCharacterMeshQuad(source, mesh);
    mesh.rotation.copy(source.rotation);
    mesh.scale.set(source.scale.x, -Math.abs(source.scale.y), 1);
  }

  private removeReflection(actorId: string): void {
    const mesh = this.reflectionMeshes.get(actorId);
    if (!mesh) {
      return;
    }
    disposeMesh(this.group, mesh);
    this.reflectionMeshes.delete(actorId);
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
      const orderBias = actor.id === "p2" ? 1 : 2;
      const presentationOrder = resolveActorPresentationOrder(actor.actorKind, priority, orderBias - index - 1);
      applyThreePresentationOrder(mesh, mesh.material, presentationOrder);
      mesh.position.x = projected.x;
      mesh.position.y = projected.y;
      mesh.position.z = 0.78 + Math.max(-5, Math.min(10, priority)) * 0.05 - index * 0.012;
      mesh.rotation.z = 0;
      mesh.scale.set(projected.width * projected.scaleX, projected.height, 1);
    }
  }
}

export function applyCharacterMeshXShear(
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
  authoredShear: number,
): void {
  applyCharacterMeshOrthographic(mesh, authoredShear);
}

export type CharacterMeshClip = {
  visible: boolean;
  left: number;
  right: number;
  bottom: number;
  top: number;
};

export function resolveCharacterMeshClip(
  actor: ActorSnapshot,
  projected: ProjectedSprite,
): CharacterMeshClip | undefined {
  const window = actor.runtime.renderWindow;
  if (!window || window.every((value) => value === 0)) {
    return undefined;
  }

  const signedWidth = projected.width * projected.scaleX;
  const signedHeight = projected.height;
  const width = Math.abs(signedWidth);
  const height = Math.abs(signedHeight);
  if (width <= 0 || height <= 0) {
    return { visible: false, left: -0.5, right: 0.5, bottom: -0.5, top: 0.5 };
  }

  const originX = actor.runtime.pos.x;
  const originY = -actor.runtime.pos.y;
  const authoredX1 = originX + window[0] * actor.runtime.facing;
  const authoredX2 = originX + window[2] * actor.runtime.facing;
  const authoredY1 = originY - window[1];
  const authoredY2 = originY - window[3];
  const worldLeft = Math.max(projected.x - width / 2, Math.min(authoredX1, authoredX2));
  const worldRight = Math.min(projected.x + width / 2, Math.max(authoredX1, authoredX2));
  const worldBottom = Math.max(projected.y - height / 2, Math.min(authoredY1, authoredY2));
  const worldTop = Math.min(projected.y + height / 2, Math.max(authoredY1, authoredY2));
  if (worldRight <= worldLeft || worldTop <= worldBottom) {
    return { visible: false, left: -0.5, right: 0.5, bottom: -0.5, top: 0.5 };
  }

  const localX1 = (worldLeft - projected.x) / signedWidth;
  const localX2 = (worldRight - projected.x) / signedWidth;
  const localY1 = (worldBottom - projected.y) / signedHeight;
  const localY2 = (worldTop - projected.y) / signedHeight;
  return {
    visible: true,
    left: Math.max(-0.5, Math.min(localX1, localX2)),
    right: Math.min(0.5, Math.max(localX1, localX2)),
    bottom: Math.max(-0.5, Math.min(localY1, localY2)),
    top: Math.min(0.5, Math.max(localY1, localY2)),
  };
}

function applyCharacterMeshOrthographic(
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
  authoredShear: number,
  clip?: CharacterMeshClip,
): void {
  const position = mesh.geometry.getAttribute("position");
  const base = characterMeshBasePositions(mesh.geometry);
  const uv = mesh.geometry.getAttribute("uv");
  const shear = Number.isFinite(authoredShear) ? -authoredShear : 0;
  for (let index = 0; index < position.count; index += 1) {
    const point = characterMeshQuadPoint(base, clip, index);
    position.setXYZ(index, point.x + shear * point.y, point.y, base.z[index] ?? 0);
    uv.setXY(index, point.x + 0.5, point.y + 0.5);
  }
  position.needsUpdate = true;
  uv.needsUpdate = true;
  mesh.geometry.computeBoundingSphere();
}

export type CharacterMeshProjectionInput = {
  projection: "orthographic" | "perspective" | "perspective2";
  focalLength: number;
  angle: number;
  xAngle: number;
  yAngle: number;
  xShear: number;
  clip?: CharacterMeshClip;
};

export function applyCharacterMeshProjection(
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
  input: CharacterMeshProjectionInput,
): void {
  if (input.clip?.visible === false) {
    mesh.visible = false;
    applyCharacterMeshOrthographic(mesh, input.xShear);
    return;
  }
  if (input.projection !== "perspective") {
    mesh.visible = input.projection !== "perspective2";
    applyCharacterMeshOrthographic(mesh, input.xShear, input.clip);
    mesh.rotation.x = THREE.MathUtils.degToRad(-input.xAngle);
    mesh.rotation.y = THREE.MathUtils.degToRad(input.yAngle);
    mesh.rotation.z = THREE.MathUtils.degToRad(-input.angle);
    return;
  }

  mesh.visible = true;
  const position = mesh.geometry.getAttribute("position");
  const base = characterMeshBasePositions(mesh.geometry);
  const uv = mesh.geometry.getAttribute("uv");
  const signedWidth = mesh.scale.x;
  const signedHeight = mesh.scale.y;
  const width = Math.max(0.0001, Math.abs(signedWidth));
  const height = Math.max(0.0001, Math.abs(signedHeight));
  const facing = signedWidth < 0 ? -1 : 1;
  const verticalFacing = signedHeight < 0 ? -1 : 1;
  const shear = Number.isFinite(input.xShear) ? -input.xShear : 0;
  const focalLength = Number.isFinite(input.focalLength) && input.focalLength > 0 ? input.focalLength : 2048;
  const rotation = new THREE.Euler(
    THREE.MathUtils.degToRad(-input.xAngle),
    THREE.MathUtils.degToRad(input.yAngle),
    THREE.MathUtils.degToRad(-input.angle),
    "XYZ",
  );

  for (let index = 0; index < position.count; index += 1) {
    const basePoint = characterMeshQuadPoint(base, input.clip, index);
    const baseY = basePoint.y;
    const point = new THREE.Vector3(
      (basePoint.x + shear * baseY) * width * facing,
      baseY * height * verticalFacing,
      base.z[index] ?? 0,
    ).applyEuler(rotation);
    const perspectiveScale = focalLength / Math.max(1, focalLength - point.z);
    position.setXYZ(
      index,
      point.x * perspectiveScale / width,
      point.y * perspectiveScale / height,
      0,
    );
    uv.setXY(index, basePoint.x + 0.5, basePoint.y + 0.5);
  }
  position.needsUpdate = true;
  uv.needsUpdate = true;
  mesh.geometry.computeBoundingSphere();
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(width, height, 1);
}

function characterMeshQuadPoint(
  base: { x: number[]; y: number[]; z: number[] },
  clip: CharacterMeshClip | undefined,
  index: number,
): { x: number; y: number } {
  const baseX = base.x[index] ?? 0;
  const baseY = base.y[index] ?? 0;
  return {
    x: clip ? (baseX < 0 ? clip.left : clip.right) : baseX,
    y: clip ? (baseY < 0 ? clip.bottom : clip.top) : baseY,
  };
}

function copyCharacterMeshQuad(
  source: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
  target: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
): void {
  const sourcePosition = source.geometry.getAttribute("position");
  const targetPosition = target.geometry.getAttribute("position");
  const sourceUv = source.geometry.getAttribute("uv");
  const targetUv = target.geometry.getAttribute("uv");
  for (let index = 0; index < targetPosition.count; index += 1) {
    targetPosition.setXYZ(index, sourcePosition.getX(index), sourcePosition.getY(index), sourcePosition.getZ(index));
    targetUv.setXY(index, sourceUv.getX(index), sourceUv.getY(index));
  }
  targetPosition.needsUpdate = true;
  targetUv.needsUpdate = true;
  target.geometry.computeBoundingSphere();
}

function characterMeshBasePositions(geometry: THREE.PlaneGeometry): { x: number[]; y: number[]; z: number[] } {
  const cached = geometry.userData.mugenBasePositions as { x: number[]; y: number[]; z: number[] } | undefined;
  if (cached) {
    return cached;
  }
  const position = geometry.getAttribute("position");
  const base = {
    x: Array.from({ length: position.count }, (_, index) => position.getX(index)),
    y: Array.from({ length: position.count }, (_, index) => position.getY(index)),
    z: Array.from({ length: position.count }, (_, index) => position.getZ(index)),
  };
  geometry.userData.mugenBasePositions = base;
  return base;
}

export type CharacterSpritePresentation = {
  actorId: string;
  actorPosition: { x: number; y: number };
  facing: 1 | -1;
  sprite: { width: number; height: number; axisX: number; axisY: number };
  frame: { group: number; index: number };
  frameOffset: { x: number; y: number };
  renderScale: { x: number; y: number };
  spritePriority: number;
  orderBias: number;
  presentationOrder: ResolvedPresentationOrder;
  meshRenderOrder: number;
  material: { transparent: boolean; depthTest: boolean; depthWrite: boolean };
  shadow?: CharacterShadowPresentation;
  meshPosition: { x: number; y: number; z: number };
  meshScale: { x: number; y: number };
};

export type CharacterShadowPresentation = {
  presentationOrder: ResolvedPresentationOrder;
  meshRenderOrder: number;
  material: { transparent: boolean; depthTest: boolean; depthWrite: boolean };
};

export function resolveCharacterRenderDepth(priority: number, orderBias: number): number {
  return 1 + Math.max(-5, Math.min(10, Math.round(priority))) * 0.05 + orderBias;
}

export type ActorShadowPresentation = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  opacity: number;
  color: [number, number, number];
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
  const minimumWidth = actor.actorKind === "explod" || actor.actorKind === "projectile" ? 24 : 36;
  const width = Math.max(minimumWidth, bodyWidth, hurtBoxWidth * 0.72);
  const height = Math.max(6, width * 0.18 * scaleY);
  return {
    x: actor.runtime.pos.x,
    y: 0,
    z: 0.08,
    width,
    height,
    opacity: actor.actorKind === "explod" ? 0.14 : 0.2,
    color: actor.runtime.shadowColor ?? [5, 7, 12],
  };
}

function supportsActorShadow(actor: ActorSnapshot): boolean {
  if (actor.actorKind === "projectile") {
    return actor.runtime.shadowColor?.some((value) => value !== 0) === true;
  }
  return actor.actorKind === "player" || actor.actorKind === "helper" || actor.actorKind === "explod";
}

export function shouldRenderActorReflection(actor: ActorSnapshot): boolean {
  if (actor.actorKind !== "projectile") {
    return false;
  }
  const mode = Number.isFinite(actor.runtime.reflectionMode)
    ? Math.trunc(actor.runtime.reflectionMode!)
    : -1;
  return mode > 0 || (mode < 0 && actor.runtime.shadowColor?.some((value) => value !== 0) === true);
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

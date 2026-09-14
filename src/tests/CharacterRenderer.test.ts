import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  CharacterRenderer,
  resolveActorShadowPresentation,
  resolveCharacterRenderDepth,
  shouldRenderActorReflection,
} from "../game/render/CharacterRenderer";
import { transformPaletteFxRgba } from "../game/render/PaletteFxMaterial";
import type { TextureStore } from "../game/render/TextureStore";
import type { MugenSprite, SpriteLookupContext, SpriteProvider } from "../mugen/model/MugenSprite";
import type { ActorSnapshot } from "../mugen/runtime/types";

describe("CharacterRenderer", () => {
  it("forwards actor RemapPal context into sprite lookups", async () => {
    const provider = new RecordingSpriteProvider();
    const renderer = new CharacterRenderer(provider, fakeTextureStore());

    await renderer.update([
      actor({
        paletteRemap: { source: [1, 1], dest: [1, 2] },
      }),
    ]);

    expect(provider.lookups[0]).toMatchObject({
      group: 10,
      index: 0,
      ownerId: "p1",
      paletteRemap: { source: [1, 1], dest: [1, 2] },
    });
    renderer.dispose();
  });

  it("reports the effective Three.js sprite-axis presentation", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());

    await renderer.update([actor({ pos: { x: 40, y: -12 }, facing: -1, renderScale: { x: 1.5, y: 0.75 } })]);

    expect(renderer.getDiagnostics()).toEqual([
      {
        actorId: "p1",
        actorPosition: { x: 40, y: -12 },
        facing: -1,
        sprite: { width: 12, height: 16, axisX: 6, axisY: 14 },
        frame: { group: 10, index: 0 },
        frameOffset: { x: 0, y: 0 },
        renderScale: { x: 1.5, y: 0.75 },
        spritePriority: 2,
        orderBias: 0.02,
        presentationOrder: {
          semantic: {
            schema: "MugenPresentationOrder/v0",
            profile: "unknown",
            phase: "actor",
            sourceKind: "player",
            blendPolicy: "alpha",
            priority: 2,
            tieBreaker: 2,
            tiePolicy: "unknown-reference",
          },
          three: {
            renderOrder: 20_000_202,
            boundedPriority: 2,
            boundedTieBreaker: 2,
            transparent: true,
            depthTest: false,
            depthWrite: false,
          },
        },
        meshRenderOrder: 20_000_202,
        material: {
          transparent: true,
          depthTest: false,
          depthWrite: false,
        },
        shadow: {
          presentationOrder: {
            semantic: {
              schema: "MugenPresentationOrder/v0",
              profile: "unknown",
              phase: "actor-underlay",
              sourceKind: "shadow",
              blendPolicy: "alpha",
              priority: 0,
              tieBreaker: 2,
              tiePolicy: "unknown-reference",
            },
            three: {
              renderOrder: 10_000_002,
              boundedPriority: 0,
              boundedTieBreaker: 2,
              transparent: true,
              depthTest: false,
              depthWrite: false,
            },
          },
          meshRenderOrder: 10_000_002,
          material: {
            transparent: true,
            depthTest: false,
            depthWrite: false,
          },
        },
        meshPosition: { x: 40, y: 16.5, z: 1.12 },
        meshScale: { x: -18, y: 12 },
      },
    ]);
    renderer.dispose();
  });

  it("orders higher sprite priority in front while preserving effect-actor range", () => {
    expect(resolveCharacterRenderDepth(-99, 0.01)).toBeCloseTo(0.76);
    expect(resolveCharacterRenderDepth(0, 0.01)).toBeCloseTo(1.01);
    expect(resolveCharacterRenderDepth(99, 0.01)).toBeCloseTo(1.51);
    expect(resolveCharacterRenderDepth(3, 0.01)).toBeGreaterThan(resolveCharacterRenderDepth(2, 0.02));
  });

  it("applies Projectile render angles to the live sprite mesh", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());

    await renderer.update([
      actor({ renderAngle: 30, renderAngleX: 20, renderAngleY: -15 }, { actorKind: "projectile" }),
    ]);

    const mesh = renderer.group.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh | undefined;
    expect(mesh?.rotation.x).toBeCloseTo(-Math.PI / 9);
    expect(mesh?.rotation.y).toBeCloseTo(-Math.PI / 12);
    expect(mesh?.rotation.z).toBeCloseTo(-Math.PI / 6);

    await renderer.update([actor({}, { actorKind: "projectile" })]);
    expect(mesh?.rotation.x).toBeCloseTo(0);
    expect(mesh?.rotation.y).toBeCloseTo(0);
    expect(mesh?.rotation.z).toBeCloseTo(0);
    renderer.dispose();
  });

  it("applies Projectile X shear before rotation and resets the quad", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    await renderer.update([actor({}, { actorKind: "projectile" })]);
    const mesh = renderer.group.children.find((child) => child instanceof THREE.Mesh) as
      | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
      | undefined;
    const position = mesh?.geometry.getAttribute("position");
    const baseX = position ? Array.from({ length: position.count }, (_, index) => position.getX(index)) : [];
    const baseY = position ? Array.from({ length: position.count }, (_, index) => position.getY(index)) : [];

    await renderer.update([actor({ renderShearX: 0.5, renderAngle: 20 }, { actorKind: "projectile" })]);
    for (let index = 0; index < baseX.length; index += 1) {
      expect(position?.getX(index)).toBeCloseTo((baseX[index] ?? 0) - 0.5 * (baseY[index] ?? 0));
    }
    expect(mesh?.rotation.z).toBeCloseTo(-THREE.MathUtils.degToRad(20));

    await renderer.update([actor({}, { actorKind: "projectile" })]);
    for (let index = 0; index < baseX.length; index += 1) {
      expect(position?.getX(index)).toBeCloseTo(baseX[index] ?? 0);
    }
    renderer.dispose();
  });

  it("applies bounded Projectile perspective and resets or culls named projection modes", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    await renderer.update([
      actor({
        renderProjection: "perspective",
        renderFocalLength: 64,
        renderAngleX: 35,
        renderAngleY: 20,
      }, { actorKind: "projectile" }),
    ]);
    const mesh = renderer.group.children.find((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) as
      | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
      | undefined;
    const position = mesh?.geometry.getAttribute("position");
    const projected = position ? Array.from({ length: position.count }, (_, index) => [position.getX(index), position.getY(index)]) : [];
    expect(mesh?.visible).toBe(true);
    expect(mesh?.rotation.toArray().slice(0, 3)).toEqual([0, 0, 0]);
    expect(projected).not.toEqual([
      [-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5],
    ]);

    await renderer.update([actor({}, { actorKind: "projectile" })]);
    const reset = position ? Array.from({ length: position.count }, (_, index) => [position.getX(index), position.getY(index)]) : [];
    expect(mesh?.visible).toBe(true);
    expect(reset).toEqual([
      [-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5],
    ]);

    await renderer.update([actor({ renderProjection: "perspective2" }, { actorKind: "projectile" })]);
    expect(mesh?.visible).toBe(false);
    renderer.dispose();
  });

  it("clips the live Projectile quad and UVs to projwindow, then resets or culls it", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    await renderer.update([
      actor({ renderWindow: [-3, -4, 3, 4] }, { actorKind: "projectile" }),
    ]);
    const mesh = renderer.group.children.find((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) as
      | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
      | undefined;
    const position = mesh?.geometry.getAttribute("position");
    const uv = mesh?.geometry.getAttribute("uv");
    expect(mesh?.visible).toBe(true);
    expect(position ? Array.from({ length: position.count }, (_, index) => [position.getX(index), position.getY(index)]) : []).toEqual([
      [-0.25, -0.125], [0.25, -0.125], [-0.25, -0.5], [0.25, -0.5],
    ]);
    expect(uv ? Array.from({ length: uv.count }, (_, index) => [uv.getX(index), uv.getY(index)]) : []).toEqual([
      [0.25, 0.375], [0.75, 0.375], [0.25, 0], [0.75, 0],
    ]);

    await renderer.update([actor({}, { actorKind: "projectile" })]);
    expect(mesh?.visible).toBe(true);
    expect(position ? Array.from({ length: position.count }, (_, index) => [position.getX(index), position.getY(index)]) : []).toEqual([
      [-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5],
    ]);

    await renderer.update([
      actor({ renderWindow: [100, -4, 110, 4] }, { actorKind: "projectile" }),
    ]);
    expect(mesh?.visible).toBe(false);
    renderer.dispose();
  });

  it("renders supported actor shadows and removes them when suppressed", async () => {
    const provider = new RecordingSpriteProvider();
    const renderer = new CharacterRenderer(provider, fakeTextureStore());

    await renderer.update([actor({ bodyWidth: { front: 18, back: 22 } })]);

    const shadow = renderer.group.children.find((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.CircleGeometry) as
      | THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
      | undefined;
    expect(shadow).toBeDefined();
    expect(shadow?.position.x).toBe(0);
    expect(shadow?.position.y).toBe(0);
    expect(shadow?.scale.x).toBe(40);
    expect(shadow?.material.opacity).toBeCloseTo(0.2);

    await renderer.update([actor({}, { shadowVisible: false })]);

    expect(renderer.group.children.some((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.CircleGeometry)).toBe(false);
    renderer.dispose();
  });

  it("renders authored Projectile shadow color and removes the live shadow when cleared", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());

    await renderer.update([
      actor({ shadowColor: [64, 128, 192] }, { actorKind: "projectile" }),
    ]);

    const shadow = renderer.group.children.find((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.CircleGeometry) as
      | THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
      | undefined;
    expect(shadow).toBeDefined();
    expect(shadow?.scale.x).toBe(24);
    expect(shadow?.material.color.r).toBeCloseTo(64 / 255);
    expect(shadow?.material.color.g).toBeCloseTo(128 / 255);
    expect(shadow?.material.color.b).toBeCloseTo(192 / 255);

    await renderer.update([actor({}, { actorKind: "projectile" })]);
    expect(renderer.group.children.some((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.CircleGeometry)).toBe(false);
    renderer.dispose();
  });

  it("renders Projectile reflection auto/on modes and removes the off mode", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    const auto = actor({ shadowColor: [32, 64, 96] }, { actorKind: "projectile" });
    expect(shouldRenderActorReflection(auto)).toBe(true);
    expect(shouldRenderActorReflection(actor({}, { actorKind: "projectile" }))).toBe(false);
    expect(shouldRenderActorReflection(actor({ reflectionMode: 1 }, { actorKind: "projectile" }))).toBe(true);

    await renderer.update([auto]);
    let reflection = renderer.group.getObjectByName("mugen-reflection:p1") as
      | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
      | undefined;
    expect(reflection).toBeDefined();
    expect(reflection?.position).toMatchObject({ x: 0, y: -6, z: 0.07 });
    expect(reflection?.scale).toMatchObject({ x: 12, y: -16 });
    expect(reflection?.material.opacity).toBeCloseTo(0.32);

    await renderer.update([
      actor({ shadowColor: [32, 64, 96], reflectionMode: 0 }, { actorKind: "projectile" }),
    ]);
    expect(renderer.group.getObjectByName("mugen-reflection:p1")).toBeUndefined();

    await renderer.update([actor({ reflectionMode: 1 }, { actorKind: "projectile" })]);
    reflection = renderer.group.getObjectByName("mugen-reflection:p1") as
      | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
      | undefined;
    expect(reflection).toBeDefined();
    renderer.dispose();
  });

  it("resolves bounded shadow presentation only for player, helper, and explod actors", () => {
    const playerShadow = resolveActorShadowPresentation(actor({}, { actorKind: "player" }));
    const helperShadow = resolveActorShadowPresentation(actor({}, { actorKind: "helper" }));
    expect(playerShadow?.width).toBe(36);
    expect(playerShadow?.height).toBeCloseTo(6.48);
    expect(helperShadow?.width).toBe(36);
    expect(helperShadow?.height).toBeCloseTo(6.48);
    expect(resolveActorShadowPresentation(actor({}, { actorKind: "explod" }))).toMatchObject({ width: 24, height: 6 });
    expect(resolveActorShadowPresentation(actor({}, { actorKind: "projectile" }))).toBeUndefined();
    expect(resolveActorShadowPresentation(actor({ shadowColor: [64, 128, 192] }, { actorKind: "projectile" }))).toMatchObject({
      width: 24,
      height: 6,
      color: [64, 128, 192],
    });
    expect(resolveActorShadowPresentation(actor({}, { shadowVisible: false }))).toBeUndefined();
  });

  it("applies identity PalFX without fade, opacity loss, or additive blending", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    const identity = {
      remaining: 5,
      time: 10,
      add: [0, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };

    expect(transformPaletteFxRgba(40, 80, 120, 255, identity)).toEqual([40, 80, 120, 255]);
    expect(transformPaletteFxRgba(40, 80, 120, 255, { ...identity, remaining: 1 })).toEqual([40, 80, 120, 255]);
    expect(transformPaletteFxRgba(200, 10, 10, 255, { ...identity, add: [-40, 0, 0], invert: true })).toEqual([15, 245, 245, 255]);

    await renderer.update([actor({ paletteFx: identity, renderOpacity: 1 })]);
    const mesh = renderer.group.children.find((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    const material = mesh?.material as THREE.MeshBasicMaterial;
    expect(material.color.r).toBeCloseTo(1);
    expect(material.color.g).toBeCloseTo(1);
    expect(material.color.b).toBeCloseTo(1);
    expect(material.opacity).toBe(1);
    expect(material.blending).toBe(THREE.NormalBlending);

    await renderer.update([
      actor({
        paletteFx: { ...identity, remaining: 9, add: [80, 0, 0] },
        renderOpacity: 0.5,
      }),
    ]);
    expect(material.opacity).toBe(0.5);
    expect(material.blending).toBe(THREE.NormalBlending);
    renderer.dispose();
  });
});

class RecordingSpriteProvider implements SpriteProvider {
  readonly lookups: Array<{ group: number; index: number } & SpriteLookupContext> = [];

  async getSprite(group: number, index: number, context: SpriteLookupContext = {}): Promise<MugenSprite> {
    this.lookups.push({ group, index, ...context });
    return {
      group,
      index,
      width: 12,
      height: 16,
      axisX: 6,
      axisY: 14,
      raw: { test: true },
    };
  }
}

function actor(
  runtimeOverrides: Partial<ActorSnapshot["runtime"]>,
  snapshotOverrides: Partial<Pick<ActorSnapshot, "actorKind" | "shadowVisible">> = {},
): ActorSnapshot {
  return {
    id: "p1",
    label: "P1",
    actorKind: snapshotOverrides.actorKind ?? "player",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    shadowVisible: snapshotOverrides.shadowVisible,
    runtime: {
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      facing: 1,
      stateNo: 0,
      animNo: 10,
      animTime: 0,
      frameIndex: 0,
      life: 1000,
      power: 0,
      ctrl: true,
      stateType: "S",
      moveType: "I",
      physics: "S",
      vars: [],
      fvars: [],
      ...runtimeOverrides,
    },
    frame: {
      spriteGroup: 10,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 5,
      clsn1: [],
      clsn2: [],
      raw: "10,0,0,0,5",
      line: 1,
    },
    clsn1: [],
    clsn2: [],
  };
}

function fakeTextureStore(): TextureStore {
  return {
    getTexture: () => new THREE.Texture(),
  } as unknown as TextureStore;
}

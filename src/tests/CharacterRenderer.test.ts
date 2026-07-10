import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { CharacterRenderer, resolveActorShadowPresentation, resolveCharacterRenderDepth } from "../game/render/CharacterRenderer";
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

  it("resolves bounded shadow presentation only for player, helper, and explod actors", () => {
    const playerShadow = resolveActorShadowPresentation(actor({}, { actorKind: "player" }));
    const helperShadow = resolveActorShadowPresentation(actor({}, { actorKind: "helper" }));
    expect(playerShadow?.width).toBe(36);
    expect(playerShadow?.height).toBeCloseTo(6.48);
    expect(helperShadow?.width).toBe(36);
    expect(helperShadow?.height).toBeCloseTo(6.48);
    expect(resolveActorShadowPresentation(actor({}, { actorKind: "explod" }))).toMatchObject({ width: 24, height: 6 });
    expect(resolveActorShadowPresentation(actor({}, { actorKind: "projectile" }))).toBeUndefined();
    expect(resolveActorShadowPresentation(actor({}, { shadowVisible: false }))).toBeUndefined();
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

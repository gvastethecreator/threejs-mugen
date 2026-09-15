import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  CharacterRenderer,
  resolveActorShadowPresentation,
  resolveCharacterRenderDepth,
  shouldRenderActorReflection,
} from "../game/render/CharacterRenderer";
import { createActorPresentationOrder } from "../mugen/runtime/PresentationOrder";
import { composePaletteFxRgba, readTextureRgba, transformPaletteFxRgba } from "../game/render/PaletteFxMaterial";
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
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), palFxTextureStore([40, 80, 120, 255, 200, 10, 10, 180]));
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

    const quarter = { remaining: 7, time: 8, add: [80, 0, 0] as [number, number, number], mul: [256, 256, 256] as [number, number, number], color: 256, invert: false };
    await renderer.update([actor({ paletteFx: quarter, renderOpacity: 1 })]);
    const first = { r: material.color.r, g: material.color.g, b: material.color.b, opacity: material.opacity, blending: material.blending };
    await renderer.update([actor({ paletteFx: quarter, renderOpacity: 1 })]);
    expect(material.color.r).toBeCloseTo(first.r);
    expect(material.color.g).toBeCloseTo(first.g);
    expect(material.color.b).toBeCloseTo(first.b);
    expect(material.opacity).toBe(first.opacity);
    expect(material.blending).toBe(first.blending);
    expect(material.blending).toBe(THREE.NormalBlending);
    renderer.dispose();
  });

  it("transforms sampled texture pixels instead of tinting white", async () => {
    const renderer = new CharacterRenderer(
      new RecordingSpriteProvider(),
      palFxTextureStore([32, 32, 32, 255, 64, 64, 64, 255]),
    );
    const add = {
      remaining: 4,
      time: 4,
      add: [64, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const invert = {
      remaining: 4,
      time: 4,
      add: [0, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: true,
    };

    await renderer.update([actor({ paletteFx: add, renderOpacity: 1 })]);
    const mesh = renderer.group.children.find((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    const material = mesh?.material as THREE.MeshBasicMaterial;
    expect(material.color.r).toBeCloseTo(1);
    expect(sampledRgba(material.map)?.slice(0, 4)).toEqual([96, 32, 32, 255]);

    await renderer.update([actor({ paletteFx: invert, renderOpacity: 1 })]);
    expect(sampledRgba(material.map)?.slice(4, 8)).toEqual([191, 191, 191, 255]);

    await renderer.update([actor({ paletteFx: { ...add, remaining: 0 }, renderOpacity: 1 })]);
    expect(sampledRgba(material.map)).toEqual([32, 32, 32, 255, 64, 64, 64, 255]);
    renderer.dispose();
  });

  it("composes actor PalFX then AllPalFX and restores local after global expiry", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), palFxTextureStore([40, 80, 120, 255]));
    const local = {
      remaining: 8,
      time: 8,
      add: [-80, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const global = {
      remaining: 3,
      time: 3,
      add: [0, -80, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const source = [40, 80, 120, 255] as const;
    const composed = composePaletteFxRgba(source[0], source[1], source[2], source[3], local, global);
    const localOnly = transformPaletteFxRgba(source[0], source[1], source[2], source[3], local);

    await renderer.update([actor({ paletteFx: local, renderOpacity: 1 })], global);
    const mesh = renderer.group.children.find((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    const material = mesh?.material as THREE.MeshBasicMaterial;
    expect(material.color.r).toBeCloseTo(1);
    expect(sampledRgba(material.map)).toEqual(composed.map((value) => Math.max(0, Math.min(255, Math.round(value)))));

    await renderer.update([actor({ paletteFx: local, renderOpacity: 1 })]);
    expect(sampledRgba(material.map)).toEqual(localOnly.map((value) => Math.max(0, Math.min(255, Math.round(value)))));
    renderer.dispose();
  });

  it("keeps authored additive blending and transparent holes through PalFX", async () => {
    const renderer = new CharacterRenderer(
      new RecordingSpriteProvider(),
      palFxTextureStore([40, 80, 120, 255, 10, 20, 30, 0]),
    );
    const add = {
      remaining: 4,
      time: 4,
      add: [64, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    await renderer.update([actor({ paletteFx: add, renderOpacity: 0.78, renderBlend: "additive" })]);
    const mesh = renderer.group.children.find((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    const material = mesh?.material as THREE.MeshBasicMaterial;
    expect(material.blending).toBe(THREE.AdditiveBlending);
    expect(material.opacity).toBe(0.78);
    expect(sampledRgba(material.map)?.slice(0, 4)).toEqual([104, 80, 120, 255]);
    expect(sampledRgba(material.map)?.slice(4, 8)).toEqual([74, 20, 30, 0]);

    await renderer.update([actor({ paletteFx: { ...add, remaining: 0 }, renderOpacity: 0.78, renderBlend: "additive" })]);
    expect(material.blending).toBe(THREE.AdditiveBlending);
    expect(sampledRgba(material.map)?.slice(4, 8)).toEqual([10, 20, 30, 0]);

    const other = actor({ paletteFx: add, renderOpacity: 1, renderBlend: "normal" });
    other.id = "p2";
    await renderer.update([
      actor({ paletteFx: add, renderOpacity: 0.78, renderBlend: "additive" }),
      other,
    ]);
    const meshes = renderer.group.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    expect(meshes).toHaveLength(2);
    const blends = meshes.map((item) => (item.material as THREE.MeshBasicMaterial).blending).sort();
    expect(blends).toEqual([THREE.NormalBlending, THREE.AdditiveBlending].sort());
    renderer.dispose();
  });

  it("draws ontop Explods in the stage-foreground band above ordinary Explods", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    const fighter = actor({ spritePriority: 9999, pos: { x: 0, y: 0 } });
    fighter.id = "p1";
    const ordinary = actor(
      { spritePriority: 10, pos: { x: 0, y: 0 } },
      {
        actorKind: "explod",
        presentationOrder: createActorPresentationOrder("explod", 10, 0),
      },
    );
    ordinary.id = "explod-normal";
    const ontop = actor(
      { spritePriority: 0, pos: { x: 0, y: 0 } },
      {
        actorKind: "explod",
        presentationOrder: createActorPresentationOrder("explod", 0, 0, { layerNo: 1 }),
      },
    );
    ontop.id = "explod-ontop";

    await renderer.update([fighter, ordinary, ontop]);
    const diagnostics = renderer.getDiagnostics();
    const fighterOrder = diagnostics.find((entry) => entry.actorId === "p1")?.presentationOrder;
    const ordinaryOrder = diagnostics.find((entry) => entry.actorId === "explod-normal")?.presentationOrder;
    const ontopOrder = diagnostics.find((entry) => entry.actorId === "explod-ontop")?.presentationOrder;
    expect(fighterOrder?.semantic.phase).toBe("actor");
    expect(ordinaryOrder?.semantic.phase).toBe("actor");
    expect(ontopOrder?.semantic.phase).toBe("stage-foreground");
    expect(ontopOrder?.three.depthTest).toBe(false);
    expect(ontopOrder?.three.depthWrite).toBe(false);
    expect(fighterOrder?.three.renderOrder ?? 0).toBeLessThan(ontopOrder?.three.renderOrder ?? 0);
    expect(ordinaryOrder?.three.renderOrder ?? 0).toBeLessThan(ontopOrder?.three.renderOrder ?? 0);
    const meshes = renderer.group.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    const named = Object.fromEntries(
      meshes.map((mesh) => {
        const match = diagnostics.find((entry) => entry.presentationOrder?.three.renderOrder === mesh.renderOrder);
        return [match?.actorId ?? mesh.uuid, mesh];
      }),
    );
    expect(named["explod-ontop"]?.position.z).toBe(0);
    expect(named["p1"]?.position.z).toBeGreaterThan(named["explod-ontop"]?.position.z ?? -1);
    const explodMaterial = named["explod-ontop"]?.material;
    expect(Array.isArray(explodMaterial) ? explodMaterial[0]?.depthTest : explodMaterial?.depthTest).toBe(false);

    await renderer.update([fighter]);
    const remaining = renderer.group.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    expect(remaining).toHaveLength(1);
    renderer.dispose();
  });

  it("keeps two AfterImage samples on their captured remaps after the live actor remaps again", async () => {
    const provider = new RecordingSpriteProvider();
    const textures = recordingTextureStore();
    const renderer = new CharacterRenderer(provider, textures);
    const sampleA = afterImageSample({
      pos: { x: -20, y: 0 },
      spriteGroup: 200,
      spriteIndex: 0,
      paletteRemap: { source: [1, 1], dest: [1, 2] },
    });
    const sampleB = afterImageSample({
      pos: { x: -40, y: 0 },
      spriteGroup: 200,
      spriteIndex: 1,
      paletteRemap: { source: [1, 1], dest: [1, 3] },
    });
    const source = actor({
      paletteRemap: { source: [1, 1], dest: [1, 9] },
      afterImage: afterImageEffect([sampleA, sampleB]),
    });

    await renderer.update([source]);

    expect(provider.lookups).toEqual([
      { group: 200, index: 0, ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 2] } },
      { group: 200, index: 1, ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 3] } },
      { group: 10, index: 0, ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 9] } },
    ]);
    expect(textures.namespaces).toEqual(["p1:afterimage:0", "p1:afterimage:1", "p1"]);
    expect(sampleA.paletteRemap).toEqual({ source: [1, 1], dest: [1, 2] });
    expect(sampleB.paletteRemap).toEqual({ source: [1, 1], dest: [1, 3] });

    source.runtime.paletteRemap = { source: [1, 1], dest: [1, 4] };
    provider.lookups.length = 0;
    await renderer.update([source]);
    expect(provider.lookups.slice(0, 2)).toEqual([
      { group: 200, index: 0, ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 2] } },
      { group: 200, index: 1, ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 3] } },
    ]);
    renderer.dispose();
  });

  it("applies sample-time local PalFX and draw-time AllPalFX on AfterImage ghosts, not live PalFX", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), palFxTextureStore([40, 80, 120, 255]));
    const sampleLocal = {
      remaining: 1,
      time: 8,
      add: [-80, 0, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const liveLocal = {
      remaining: 8,
      time: 8,
      add: [0, 0, 200] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const allPalFx = {
      remaining: 3,
      time: 3,
      add: [0, -80, 0] as [number, number, number],
      mul: [256, 256, 256] as [number, number, number],
      color: 256,
      invert: false,
    };
    const sourcePixels = [40, 80, 120, 255] as const;
    const ghostExpected = composePaletteFxRgba(sourcePixels[0], sourcePixels[1], sourcePixels[2], sourcePixels[3], sampleLocal, allPalFx);
    const liveExpected = composePaletteFxRgba(sourcePixels[0], sourcePixels[1], sourcePixels[2], sourcePixels[3], liveLocal, allPalFx);

    await renderer.update(
      [
        actor({
          paletteFx: liveLocal,
          afterImage: afterImageEffect([
            afterImageSample({
              paletteFx: sampleLocal,
              paletteRemap: { source: [1, 1], dest: [1, 2] },
            }),
          ]),
        }),
      ],
      allPalFx,
    );

    const planes = renderer.group.children.filter(
      (child): child is THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> =>
        child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry,
    );
    const ghost = planes.find((mesh) => mesh.material.opacity < 1);
    const live = planes.find((mesh) => mesh.material.opacity === 1);
    expect(sampledRgba(ghost?.material.map ?? null)).toEqual(ghostExpected.map((value) => Math.max(0, Math.min(255, Math.round(value)))));
    expect(sampledRgba(live?.material.map ?? null)).toEqual(liveExpected.map((value) => Math.max(0, Math.min(255, Math.round(value)))));
    expect(sampledRgba(ghost?.material.map ?? null)).not.toEqual(sampledRgba(live?.material.map ?? null));
    renderer.dispose();
  });

  it("disposes AfterImage meshes on actor removal without mutating the sample archive", async () => {
    const renderer = new CharacterRenderer(new RecordingSpriteProvider(), fakeTextureStore());
    const samples = [
      afterImageSample({ pos: { x: -8, y: 0 }, spriteIndex: 0 }),
      afterImageSample({ pos: { x: -16, y: 0 }, spriteIndex: 1 }),
    ];
    const source = actor({ afterImage: afterImageEffect(samples) });
    await renderer.update([source]);
    const withTrail = renderer.group.children.filter((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    expect(withTrail).toHaveLength(3);

    await renderer.update([]);
    const afterRemoval = renderer.group.children.filter((child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry);
    expect(afterRemoval).toHaveLength(0);
    expect(samples[0]?.spriteIndex).toBe(0);
    expect(samples[1]?.spriteIndex).toBe(1);
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
  snapshotOverrides: Partial<Pick<ActorSnapshot, "actorKind" | "shadowVisible" | "presentationOrder">> = {},
): ActorSnapshot {
  return {
    id: "p1",
    label: "P1",
    actorKind: snapshotOverrides.actorKind ?? "player",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    shadowVisible: snapshotOverrides.shadowVisible,
    ...(snapshotOverrides.presentationOrder ? { presentationOrder: snapshotOverrides.presentationOrder } : {}),
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

function recordingTextureStore(): TextureStore & { namespaces: string[] } {
  const namespaces: string[] = [];
  return {
    namespaces,
    getTexture: (_sprite: MugenSprite, namespace?: string) => {
      namespaces.push(namespace ?? "");
      return new THREE.Texture();
    },
  } as unknown as TextureStore & { namespaces: string[] };
}

function afterImageSample(
  overrides: Partial<NonNullable<ActorSnapshot["runtime"]["afterImage"]>["samples"][number]> = {},
): NonNullable<ActorSnapshot["runtime"]["afterImage"]>["samples"][number] {
  return {
    age: 0,
    pos: { x: 0, y: 0 },
    facing: 1,
    spriteOwnerId: "p1",
    spriteGroup: 200,
    spriteIndex: 0,
    offsetX: 0,
    offsetY: 0,
    ...overrides,
  };
}

function afterImageEffect(
  samples: NonNullable<ActorSnapshot["runtime"]["afterImage"]>["samples"],
): NonNullable<ActorSnapshot["runtime"]["afterImage"]> {
  return {
    remaining: 20,
    time: 20,
    length: 4,
    timeGap: 2,
    frameGap: 1,
    palAdd: [0, 0, 0],
    palMul: [256, 256, 256],
    opacity: 0.5,
    elapsed: 4,
    samples,
  };
}

function palFxTextureStore(texels: number[]): TextureStore {
  const texture = new THREE.DataTexture(Uint8Array.from(texels), texels.length / 4, 1);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.needsUpdate = true;
  return {
    getTexture: () => texture,
    dispose: () => texture.dispose(),
  } as unknown as TextureStore;
}

function sampledRgba(texture: THREE.Texture | null): number[] | undefined {
  const pixels = readTextureRgba(texture ?? undefined);
  return pixels ? [...pixels.data] : undefined;
}

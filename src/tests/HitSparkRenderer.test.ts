import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  HitSparkRenderer,
  hitSparkKey,
  HIT_SPARK_LIFETIME_FRAMES,
  resolveHitSparkAssetRef,
  resolveHitSparkPresentation,
} from "../game/render/HitSparkRenderer";
import type { TextureStore } from "../game/render/TextureStore";
import type { MugenSprite, SpriteLookupContext, SpriteProvider } from "../mugen/model/MugenSprite";
import type { ActorSnapshot, RuntimeHitEffectEvent } from "../mugen/runtime/types";

const actor: ActorSnapshot = {
  id: "p1",
  label: "P1",
  actorKind: "player",
  ownerId: "p1",
  rootId: "p1",
  parentId: "p1",
  runtime: {
    pos: { x: 120, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: false,
    stateType: "S",
    moveType: "A",
    physics: "S",
    vars: [],
    fvars: [],
  },
  clsn1: [],
  clsn2: [],
};

describe("HitSparkRenderer helpers", () => {
  it("creates stable keys from actor and hit-effect event identity", () => {
    const event: RuntimeHitEffectEvent = {
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7001,
      stateNo: 200,
      tick: 8,
      runtimeTick: 42,
    };

    expect(hitSparkKey(actor, event)).toBe("p1:42:8:hit:7001");
  });

  it("resolves bounded hit-spark presentation while event is recent", () => {
    const event: RuntimeHitEffectEvent = {
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7001,
      raw: "S7001",
      rawPrefix: "S",
      offset: { x: 10, y: -72 },
      stateNo: 200,
      tick: 8,
      runtimeTick: 40,
      assetFrame: {
        source: "player",
        actionId: 7001,
        frameIndex: 0,
        spriteGroup: 7001,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 3,
      },
    };

    const presentation = resolveHitSparkPresentation(actor, event, 44);

    expect(presentation).toMatchObject({
      key: "p1:40:8:hit:7001",
      x: 130,
      y: 72,
      age: 4,
      color: 0xffc247,
      asset: {
        source: "player",
        actionId: 7001,
        lookupKey: "player:7001",
        lookupStatus: "resolved-frame",
      },
      assetFrame: {
        source: "player",
        actionId: 7001,
        spriteGroup: 7001,
        spriteIndex: 0,
      },
      layer: "hit-spark",
      renderOrder: 720,
    });
    expect(presentation?.opacity).toBeGreaterThan(0);
    expect(presentation?.size).toBeGreaterThan(44);
  });

  it("hides spark presentation after bounded lifetime", () => {
    const event: RuntimeHitEffectEvent = {
      type: "HitSpark",
      kind: "guard",
      sparkNo: 7000,
      offset: { x: 12, y: -64 },
      stateNo: 200,
      tick: 8,
      runtimeTick: 10,
    };

    expect(resolveHitSparkPresentation(actor, event, 10 + HIT_SPARK_LIFETIME_FRAMES)).toBeUndefined();
  });

  it("can start fallback presentation lifetime when the renderer first observes an older event", () => {
    const event: RuntimeHitEffectEvent = {
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7002,
      offset: { x: 48, y: -44 },
      stateNo: 210,
      tick: 12,
      runtimeTick: 128,
    };

    const presentation = resolveHitSparkPresentation(actor, event, 200, 0, HIT_SPARK_LIFETIME_FRAMES, 200);

    expect(presentation).toMatchObject({
      key: "p1:128:12:hit:7002",
      age: 0,
      x: 168,
      y: 44,
    });
    expect(resolveHitSparkPresentation(actor, event, 200 + HIT_SPARK_LIFETIME_FRAMES, 0, HIT_SPARK_LIFETIME_FRAMES, 200)).toBeUndefined();
  });

  it("maps MUGEN spark prefixes into explicit presentation asset refs", () => {
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", sparkNo: 7000, rawPrefix: "S", stateNo: 200, tick: 1 })).toMatchObject({
      source: "player",
      actionId: 7000,
      lookupKey: "player:7000",
      lookupStatus: "missing-action",
    });
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", sparkNo: 7000, rawPrefix: "F", stateNo: 200, tick: 1 })).toMatchObject({
      source: "fightfx",
      actionId: 7000,
      lookupKey: "fightfx:7000",
      lookupStatus: "resolved-frame",
    });
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", sparkNo: 7000, stateNo: 200, tick: 1 })).toMatchObject({
      source: "common",
      actionId: 7000,
      lookupKey: "common:7000",
      lookupStatus: "resolved-frame",
    });
    expect(
      resolveHitSparkAssetRef({
        type: "HitSpark",
        kind: "hit",
        sparkNo: 7000,
        rawPrefix: "Q",
        stateNo: 200,
        tick: 1,
      }),
    ).toMatchObject({
      source: "unknown",
      lookupStatus: "unsupported-prefix",
    });
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", rawPrefix: "Q", stateNo: 200, tick: 1 })).toMatchObject({
      source: "unknown",
      lookupStatus: "missing-id",
    });
  });

  it("creates system spark lookup frames for common and FightFX refs", () => {
    const common = resolveHitSparkPresentation(
      actor,
      { type: "HitSpark", kind: "hit", sparkNo: 7001, stateNo: 200, tick: 1, runtimeTick: 20 },
      24,
    );
    const fightFx = resolveHitSparkPresentation(
      actor,
      { type: "HitSpark", kind: "guard", sparkNo: 7002, rawPrefix: "F", stateNo: 200, tick: 2, runtimeTick: 20 },
      25,
    );

    expect(common).toMatchObject({
      asset: {
        source: "common",
        actionId: 7001,
        lookupStatus: "resolved-frame",
      },
      assetFrame: {
        source: "common",
        actionId: 7001,
        frameIndex: 1,
        spriteGroup: 7001,
        spriteIndex: 1,
      },
    });
    expect(fightFx).toMatchObject({
      asset: {
        source: "fightfx",
        actionId: 7002,
        lookupStatus: "resolved-frame",
      },
      assetFrame: {
        source: "fightfx",
        actionId: 7002,
        frameIndex: 1,
        spriteGroup: 7002,
        spriteIndex: 1,
      },
    });
  });

  it("preserves package-backed common and FightFX frames before synthetic system fallback", () => {
    const common = resolveHitSparkPresentation(
      actor,
      {
        type: "HitSpark",
        kind: "hit",
        sparkNo: 7001,
        stateNo: 200,
        tick: 1,
        runtimeTick: 20,
        assetFrame: {
          source: "common",
          actionId: 7001,
          frameIndex: 0,
          spriteGroup: 14201,
          spriteIndex: 3,
          offsetX: -2,
          offsetY: 6,
          duration: 5,
        },
      },
      24,
    );
    const fightFx = resolveHitSparkPresentation(
      actor,
      {
        type: "HitSpark",
        kind: "guard",
        sparkNo: 7002,
        rawPrefix: "F",
        stateNo: 200,
        tick: 2,
        runtimeTick: 20,
        assetFrame: {
          source: "fightfx",
          actionId: 7002,
          frameIndex: 0,
          spriteGroup: 15302,
          spriteIndex: 4,
          offsetX: 1,
          offsetY: -3,
          duration: 6,
        },
      },
      25,
    );

    expect(common).toMatchObject({
      asset: {
        source: "common",
        actionId: 7001,
        lookupStatus: "resolved-frame",
      },
      assetFrame: {
        source: "common",
        actionId: 7001,
        frameIndex: 0,
        spriteGroup: 14201,
        spriteIndex: 3,
      },
    });
    expect(fightFx).toMatchObject({
      asset: {
        source: "fightfx",
        actionId: 7002,
        lookupStatus: "resolved-frame",
      },
      assetFrame: {
        source: "fightfx",
        actionId: 7002,
        frameIndex: 0,
        spriteGroup: 15302,
        spriteIndex: 4,
      },
    });
  });

  it("resolves package-backed common/FightFX frames through the global sprite provider route", async () => {
    const provider = new RecordingSpriteProvider([
      sprite(14201, 3),
      sprite(15302, 4),
    ]);
    const renderer = new HitSparkRenderer(provider, fakeTextureStore());
    const sourceActor: ActorSnapshot = {
      ...actor,
      hitEffectEvents: [
        {
          type: "HitSpark",
          kind: "hit",
          sparkNo: 7001,
          raw: "7001",
          stateNo: 200,
          tick: 1,
          runtimeTick: 10,
          assetFrame: {
            source: "common",
            actionId: 7001,
            frameIndex: 0,
            spriteGroup: 14201,
            spriteIndex: 3,
            offsetX: 0,
            offsetY: 0,
            duration: 5,
          },
        },
        {
          type: "HitSpark",
          kind: "guard",
          sparkNo: 7002,
          raw: "F7002",
          rawPrefix: "F",
          stateNo: 200,
          tick: 2,
          runtimeTick: 10,
          assetFrame: {
            source: "fightfx",
            actionId: 7002,
            frameIndex: 0,
            spriteGroup: 15302,
            spriteIndex: 4,
            offsetX: 0,
            offsetY: 0,
            duration: 6,
          },
        },
      ],
    };

    await renderer.update([sourceActor], 11);

    expect(renderer.getDiagnostics()).toMatchObject({
      active: 2,
      fallbackGeometry: false,
      resolvedSprites: 2,
      sources: {
        common: 1,
        fightfx: 1,
      },
    });
    expect(provider.lookups).toEqual([
      { group: 14201, index: 3, ownerId: undefined },
      { group: 15302, index: 4, ownerId: undefined },
    ]);
    renderer.dispose();
  });

  it("advances package-backed system spark frames by AIR frame duration", async () => {
    const provider = new RecordingSpriteProvider([
      sprite(14201, 0),
      sprite(14201, 1),
    ]);
    const renderer = new HitSparkRenderer(provider, fakeTextureStore());
    const sourceActor: ActorSnapshot = {
      ...actor,
      hitEffectEvents: [
        {
          type: "HitSpark",
          kind: "hit",
          sparkNo: 7001,
          raw: "7001",
          stateNo: 200,
          tick: 1,
          runtimeTick: 10,
          assetFrame: {
            source: "common",
            actionId: 7001,
            frameIndex: 0,
            spriteGroup: 14201,
            spriteIndex: 0,
            offsetX: 0,
            offsetY: 0,
            duration: 3,
          },
          assetFrames: [
            {
              source: "common",
              actionId: 7001,
              frameIndex: 0,
              spriteGroup: 14201,
              spriteIndex: 0,
              offsetX: 0,
              offsetY: 0,
              duration: 3,
            },
            {
              source: "common",
              actionId: 7001,
              frameIndex: 1,
              spriteGroup: 14201,
              spriteIndex: 1,
              offsetX: 0,
              offsetY: 0,
              duration: 5,
            },
          ],
        },
      ],
    };

    await renderer.update([sourceActor], 11);
    await renderer.update([sourceActor], 14);

    expect(provider.lookups).toEqual([
      { group: 14201, index: 0, ownerId: undefined },
      { group: 14201, index: 1, ownerId: undefined },
    ]);
    expect(renderer.getDiagnostics().presentations[0]).toMatchObject({
      source: "common",
      lookupStatus: "resolved-sprite",
    });
    renderer.dispose();
  });

  it("applies AIR frame offsets to resolved system spark sprites", async () => {
    const provider = new RecordingSpriteProvider([sprite(14201, 0)]);
    const renderer = new HitSparkRenderer(provider, fakeTextureStore());
    const sourceActor: ActorSnapshot = {
      ...actor,
      runtime: {
        ...actor.runtime,
        facing: -1,
      },
      hitEffectEvents: [
        {
          type: "HitSpark",
          kind: "hit",
          sparkNo: 7001,
          raw: "7001",
          stateNo: 200,
          tick: 1,
          runtimeTick: 10,
          assetFrame: {
            source: "common",
            actionId: 7001,
            frameIndex: 0,
            spriteGroup: 14201,
            spriteIndex: 0,
            offsetX: 12,
            offsetY: -6,
            duration: 3,
          },
        },
      ],
    };

    await renderer.update([sourceActor], 11);

    const sparkGroup = renderer.group.children[0] as THREE.Group;
    const spriteMesh = sparkGroup.children.find((child) => child instanceof THREE.Mesh && child.renderOrder === 1) as THREE.Mesh;
    const expectedSize = 44 + Math.abs(7001 % 5);

    expect(spriteMesh.position.x).toBeLessThan(0);
    expect(spriteMesh.position.y).toBeGreaterThan(0);
    expect(Math.abs(spriteMesh.position.x)).toBeCloseTo(12 / expectedSize, 3);
    expect(spriteMesh.position.y).toBeCloseTo(6 / expectedSize, 3);
    renderer.dispose();
  });
});

class RecordingSpriteProvider implements SpriteProvider {
  readonly lookups: Array<{ group: number; index: number; ownerId?: string }> = [];
  private readonly sprites = new Map<string, MugenSprite>();

  constructor(sprites: MugenSprite[]) {
    for (const spriteRecord of sprites) {
      this.sprites.set(`${spriteRecord.group}:${spriteRecord.index}`, spriteRecord);
    }
  }

  async getSprite(group: number, index: number, context: SpriteLookupContext = {}): Promise<MugenSprite | undefined> {
    this.lookups.push({ group, index, ownerId: context.ownerId });
    return this.sprites.get(`${group}:${index}`);
  }
}

function sprite(group: number, index: number): MugenSprite {
  return {
    group,
    index,
    width: 18,
    height: 18,
    axisX: 9,
    axisY: 9,
  };
}

function fakeTextureStore(): TextureStore {
  return {
    getTexture: () => new THREE.Texture(),
  } as unknown as TextureStore;
}

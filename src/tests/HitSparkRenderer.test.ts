import { describe, expect, it } from "vitest";
import {
  hitSparkKey,
  HIT_SPARK_LIFETIME_FRAMES,
  resolveHitSparkAssetRef,
  resolveHitSparkPresentation,
} from "../game/render/HitSparkRenderer";
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
    };

    const presentation = resolveHitSparkPresentation(actor, event, 44);

    expect(presentation).toMatchObject({
      key: "p1:40:8:hit:7001",
      x: 130,
      y: 72,
      age: 4,
      color: 0xffc247,
      asset: {
        source: "system",
        actionId: 7001,
        lookupKey: "system:7001",
        lookupStatus: "fallback-geometry",
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
      source: "system",
      actionId: 7000,
      lookupKey: "system:7000",
      lookupStatus: "fallback-geometry",
    });
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", sparkNo: 7000, rawPrefix: "F", stateNo: 200, tick: 1 })).toMatchObject({
      source: "fightfx",
      actionId: 7000,
      lookupKey: "fightfx:7000",
    });
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", sparkNo: 7000, stateNo: 200, tick: 1 })).toMatchObject({
      source: "character-or-common",
      actionId: 7000,
      lookupKey: "character-or-common:7000",
    });
    expect(resolveHitSparkAssetRef({ type: "HitSpark", kind: "hit", rawPrefix: "Q", stateNo: 200, tick: 1 })).toMatchObject({
      source: "unknown",
      lookupStatus: "missing-id",
    });
  });
});

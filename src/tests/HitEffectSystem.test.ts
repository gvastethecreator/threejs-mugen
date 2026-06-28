import { describe, expect, it } from "vitest";
import {
  parseMugenSparkValue,
  pushRuntimeHitEffectEvent,
  RuntimeHitEffectWorld,
} from "../mugen/runtime/HitEffectSystem";
import type { RuntimeHitEffectEvent } from "../mugen/runtime/types";

describe("HitEffectSystem", () => {
  it("parses prefixed MUGEN spark values", () => {
    expect(parseMugenSparkValue("S7000")).toEqual({ sparkNo: 7000, rawPrefix: "S" });
    expect(parseMugenSparkValue("  42")).toEqual({ sparkNo: 42, rawPrefix: undefined });
    expect(parseMugenSparkValue("bad")).toBeUndefined();
  });

  it("wraps bounded HitDef spark telemetry behind RuntimeHitEffectWorld", () => {
    const world = new RuntimeHitEffectWorld();
    const fighter = { runtime: { stateNo: 200 }, stateElapsed: 7, hitEffectEvents: [] as RuntimeHitEffectEvent[] };

    const event = world.emitHitDefEffect(fighter, "guard", "S7000", [12, -64], 140);

    expect(event).toMatchObject({
      type: "HitSpark",
      kind: "guard",
      sparkNo: 7000,
      raw: "S7000",
      rawPrefix: "S",
      offset: { x: 12, y: -64 },
      stateNo: 200,
      tick: 7,
      runtimeTick: 140,
    });
    expect(fighter.hitEffectEvents).toEqual([event]);
  });

  it("does not emit disabled negative spark ids", () => {
    const world = new RuntimeHitEffectWorld();
    const fighter = { runtime: { stateNo: 200 }, stateElapsed: 7, hitEffectEvents: [] as RuntimeHitEffectEvent[] };

    expect(world.emitHitDefEffect(fighter, "hit", "-1", undefined, 140)).toBeUndefined();
    expect(fighter.hitEffectEvents).toEqual([]);
  });

  it("keeps newest hit-effect events first and bounds history", () => {
    const events: RuntimeHitEffectEvent[] = [];
    for (let tick = 0; tick < 10; tick += 1) {
      pushRuntimeHitEffectEvent(events, { type: "HitSpark", kind: "hit", stateNo: 200, tick, runtimeTick: tick }, 4);
    }

    expect(events.map((event) => event.tick)).toEqual([9, 8, 7, 6]);
  });
});

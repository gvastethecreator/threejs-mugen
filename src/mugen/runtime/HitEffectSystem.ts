import type { RuntimeHitEffectAssetFrame, RuntimeHitEffectEvent } from "./types";

export type RuntimeHitEffectActor = {
  runtime: {
    stateNo: number;
  };
  stateElapsed: number;
  hitEffectEvents: RuntimeHitEffectEvent[];
};

export type RuntimeHitEffectKind = RuntimeHitEffectEvent["kind"];

export class RuntimeHitEffectWorld {
  emitHitDefEffect(
    actor: RuntimeHitEffectActor,
    kind: RuntimeHitEffectKind,
    spark: string | undefined,
    offset: [number, number] | undefined,
    runtimeTick: number,
    assetFrame?: RuntimeHitEffectAssetFrame,
  ): RuntimeHitEffectEvent | undefined {
    if (!spark) {
      return undefined;
    }
    const parsed = parseMugenSparkValue(spark);
    if (parsed?.sparkNo !== undefined && parsed.sparkNo < 0) {
      return undefined;
    }
    const event: RuntimeHitEffectEvent = {
      type: "HitSpark",
      kind,
      sparkNo: parsed?.sparkNo,
      raw: spark,
      rawPrefix: parsed?.rawPrefix,
      offset: offset ? { x: offset[0], y: offset[1] } : undefined,
      stateNo: actor.runtime.stateNo,
      tick: actor.stateElapsed,
      runtimeTick,
      assetFrame,
    };
    pushRuntimeHitEffectEvent(actor.hitEffectEvents, event);
    return event;
  }
}

export function pushRuntimeHitEffectEvent(events: RuntimeHitEffectEvent[], event: RuntimeHitEffectEvent, maxEvents = 8): void {
  events.unshift(event);
  events.splice(maxEvents);
}

export function parseMugenSparkValue(value: string | undefined): { sparkNo: number; rawPrefix?: string } | undefined {
  if (!value) {
    return undefined;
  }
  const match = /^\s*([A-Za-z])?\s*(-?\d+)/.exec(value);
  if (!match || match[2] === undefined) {
    return undefined;
  }
  const sparkNo = Number(match[2]);
  if (!Number.isFinite(sparkNo)) {
    return undefined;
  }
  return {
    sparkNo,
    rawPrefix: match[1]?.toUpperCase(),
  };
}

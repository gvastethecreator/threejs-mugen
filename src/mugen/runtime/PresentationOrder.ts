export const MUGEN_PRESENTATION_ORDER_SCHEMA = "MugenPresentationOrder/v0" as const;

export type MugenPresentationProfile = "mugen-1.0" | "mugen-1.1" | "ikemen-go" | "unknown";
export type MugenPresentationPhase =
  | "stage-background"
  | "actor-underlay"
  | "actor"
  | "effect"
  | "stage-foreground"
  | "debug"
  | "overlay";
export type MugenPresentationSourceKind =
  | "stage"
  | "shadow"
  | "player"
  | "helper"
  | "projectile"
  | "explod"
  | "hit-spark"
  | "debug"
  | "overlay";
export type MugenPresentationBlendPolicy = "normal" | "alpha" | "additive" | "subtractive";
export type MugenPresentationTiePolicy = "authored-order" | "unknown-reference" | "effect-kind" | "explicit";

export type MugenPresentationOrder = {
  schema: typeof MUGEN_PRESENTATION_ORDER_SCHEMA;
  profile: MugenPresentationProfile;
  phase: MugenPresentationPhase;
  sourceKind: MugenPresentationSourceKind;
  blendPolicy: MugenPresentationBlendPolicy;
  priority: number;
  tieBreaker: number;
  tiePolicy: MugenPresentationTiePolicy;
};

export function createMugenPresentationOrder(input: Omit<MugenPresentationOrder, "schema">): MugenPresentationOrder {
  return {
    schema: MUGEN_PRESENTATION_ORDER_SCHEMA,
    ...input,
    priority: normalizedInteger(input.priority),
    tieBreaker: normalizedInteger(input.tieBreaker),
  };
}

export function createStagePresentationOrder(
  layerNo: number | undefined,
  authoredOrder: number,
  options: { profile?: MugenPresentationProfile; blendPolicy?: MugenPresentationBlendPolicy } = {},
): MugenPresentationOrder {
  return createMugenPresentationOrder({
    profile: options.profile ?? "unknown",
    phase: layerNo !== undefined && layerNo > 0 ? "stage-foreground" : "stage-background",
    sourceKind: "stage",
    blendPolicy: options.blendPolicy ?? "normal",
    priority: authoredOrder,
    tieBreaker: 0,
    tiePolicy: "authored-order",
  });
}

export function createActorPresentationOrder(
  sourceKind: Extract<MugenPresentationSourceKind, "player" | "helper" | "projectile" | "explod">,
  spritePriority: number,
  actorBias: number,
  options: { profile?: MugenPresentationProfile; blendPolicy?: MugenPresentationBlendPolicy } = {},
): MugenPresentationOrder {
  return createMugenPresentationOrder({
    profile: options.profile ?? "unknown",
    phase: "actor",
    sourceKind,
    blendPolicy: options.blendPolicy ?? "alpha",
    priority: spritePriority,
    tieBreaker: actorBias,
    tiePolicy: "unknown-reference",
  });
}

export function createActorUnderlayPresentationOrder(
  actorBias: number,
  profile: MugenPresentationProfile = "unknown",
): MugenPresentationOrder {
  return createMugenPresentationOrder({
    profile,
    phase: "actor-underlay",
    sourceKind: "shadow",
    blendPolicy: "alpha",
    priority: 0,
    tieBreaker: actorBias,
    tiePolicy: "unknown-reference",
  });
}

export function createHitSparkPresentationOrder(
  kind: "guard" | "hit",
  profile: MugenPresentationProfile = "unknown",
): MugenPresentationOrder {
  return createMugenPresentationOrder({
    profile,
    phase: "effect",
    sourceKind: "hit-spark",
    blendPolicy: "additive",
    priority: kind === "guard" ? 1 : 2,
    tieBreaker: 0,
    tiePolicy: "effect-kind",
  });
}

export function createOverlayPresentationOrder(priority: number, profile: MugenPresentationProfile = "unknown"): MugenPresentationOrder {
  return createMugenPresentationOrder({
    profile,
    phase: "overlay",
    sourceKind: "overlay",
    blendPolicy: "alpha",
    priority,
    tieBreaker: 0,
    tiePolicy: "explicit",
  });
}

function normalizedInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(Number.MIN_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, Math.round(value)));
}

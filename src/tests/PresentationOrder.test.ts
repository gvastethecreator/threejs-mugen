import { describe, expect, it } from "vitest";
import {
  applyThreePresentationOrder,
  MUGEN_PRESENTATION_ORDER_SCHEMA,
  resolveActorPresentationOrder,
  resolveActorUnderlayPresentationOrder,
  resolveHitSparkPresentationOrder,
  resolveOverlayPresentationOrder,
  resolvePresentationOrder,
  resolveStagePresentationOrder,
} from "../game/render/PresentationOrder";

describe("MugenPresentationOrder/v0", () => {
  it("keeps stage background, actor underlays, actors, effects, stage foreground, and overlays in strict phase order", () => {
    const stageBack = resolveStagePresentationOrder(0, Number.MAX_SAFE_INTEGER);
    const actorUnderlay = resolveActorUnderlayPresentationOrder(1);
    const actor = resolveActorPresentationOrder("player", Number.MIN_SAFE_INTEGER, 1);
    const effect = resolveHitSparkPresentationOrder("guard");
    const stageFront = resolveStagePresentationOrder(1, Number.MIN_SAFE_INTEGER);
    const overlay = resolveOverlayPresentationOrder(Number.MIN_SAFE_INTEGER);

    expect(stageBack.three.renderOrder).toBeLessThan(actorUnderlay.three.renderOrder);
    expect(actorUnderlay.three.renderOrder).toBeLessThan(actor.three.renderOrder);
    expect(actor.three.renderOrder).toBeLessThan(effect.three.renderOrder);
    expect(effect.three.renderOrder).toBeLessThan(stageFront.three.renderOrder);
    expect(stageFront.three.renderOrder).toBeLessThan(overlay.three.renderOrder);
  });

  it("orders actor sprite priorities before deterministic actor ties", () => {
    const low = resolveActorPresentationOrder("player", 1, 49);
    const high = resolveActorPresentationOrder("helper", 2, -49);
    const p2Tie = resolveActorPresentationOrder("player", 2, 1);
    const p1Tie = resolveActorPresentationOrder("player", 2, 2);

    expect(low.three.renderOrder).toBeLessThan(high.three.renderOrder);
    expect(p2Tie.three.renderOrder).toBeLessThan(p1Tie.three.renderOrder);
  });

  it("preserves authored stage order inside each MUGEN layer", () => {
    expect(resolveStagePresentationOrder(0, 0).three.renderOrder).toBeLessThan(resolveStagePresentationOrder(0, 1).three.renderOrder);
    expect(resolveStagePresentationOrder(1, 3).three.renderOrder).toBeLessThan(resolveStagePresentationOrder(1, 4).three.renderOrder);
  });

  it("normalizes non-finite input and returns a 2D Three.js adapter policy", () => {
    const resolved = resolvePresentationOrder({
      profile: "unknown",
      phase: "actor",
      sourceKind: "explod",
      blendPolicy: "alpha",
      priority: Number.NaN,
      tieBreaker: Number.POSITIVE_INFINITY,
      tiePolicy: "explicit",
    });

    expect(resolved).toEqual({
      semantic: {
        schema: MUGEN_PRESENTATION_ORDER_SCHEMA,
        profile: "unknown",
        phase: "actor",
        sourceKind: "explod",
        blendPolicy: "alpha",
        priority: 0,
        tieBreaker: 0,
        tiePolicy: "explicit",
      },
      three: {
        renderOrder: 20_000_000,
        boundedPriority: 0,
        boundedTieBreaker: 0,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      },
    });
  });

  it("preserves semantic values while bounding only the Three.js numeric encoding", () => {
    const resolved = resolvePresentationOrder({
      profile: "unknown",
      phase: "actor",
      sourceKind: "explod",
      blendPolicy: "alpha",
      priority: 20_000,
      tieBreaker: 200,
      tiePolicy: "explicit",
    });

    expect(resolved.semantic).toMatchObject({ priority: 20_000, tieBreaker: 200 });
    expect(resolved.three).toMatchObject({ boundedPriority: 9_999, boundedTieBreaker: 49, renderOrder: 20_999_949 });
  });

  it("applies the effective adapter without leaking Three.js into the semantic key", () => {
    const object = { renderOrder: 0 };
    const material = { transparent: false, depthTest: true, depthWrite: true };
    const order = resolveActorPresentationOrder("projectile", 3, 2);

    applyThreePresentationOrder(object, material, order);

    expect(object.renderOrder).toBe(order.three.renderOrder);
    expect(material).toEqual({ transparent: true, depthTest: false, depthWrite: false });
  });
});

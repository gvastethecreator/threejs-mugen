import {
  createActorPresentationOrder,
  createActorUnderlayPresentationOrder,
  createHitSparkPresentationOrder,
  createMugenPresentationOrder,
  createOverlayPresentationOrder,
  createStagePresentationOrder,
  type MugenPresentationOrder,
  type MugenPresentationPhase,
} from "../../mugen/runtime/PresentationOrder";

export { MUGEN_PRESENTATION_ORDER_SCHEMA } from "../../mugen/runtime/PresentationOrder";
export type { MugenPresentationOrder } from "../../mugen/runtime/PresentationOrder";

export type ThreePresentationOrder = {
  renderOrder: number;
  boundedPriority: number;
  boundedTieBreaker: number;
  transparent: true;
  depthTest: false;
  depthWrite: false;
};

export type ResolvedPresentationOrder = {
  semantic: MugenPresentationOrder;
  three: ThreePresentationOrder;
};

type ThreeOrderObject = { renderOrder: number };
type ThreeOrderMaterial = { transparent: boolean; depthTest: boolean; depthWrite: boolean };

const PHASE_RANK: Record<MugenPresentationPhase, number> = {
  "stage-background": 0,
  "actor-underlay": 1,
  actor: 2,
  effect: 3,
  "stage-foreground": 4,
  debug: 5,
  overlay: 6,
};
const PHASE_STRIDE = 10_000_000;
const PRIORITY_STRIDE = 100;
const ADAPTER_PRIORITY_LIMIT = 9_999;
const ADAPTER_TIE_BREAKER_LIMIT = 49;

export function resolveThreePresentationOrder(semantic: MugenPresentationOrder): ResolvedPresentationOrder {
  const boundedPriority = boundedAdapterInteger(semantic.priority, ADAPTER_PRIORITY_LIMIT);
  const boundedTieBreaker = boundedAdapterInteger(semantic.tieBreaker, ADAPTER_TIE_BREAKER_LIMIT);
  return {
    semantic,
    three: {
      renderOrder: PHASE_RANK[semantic.phase] * PHASE_STRIDE + boundedPriority * PRIORITY_STRIDE + boundedTieBreaker,
      boundedPriority,
      boundedTieBreaker,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    },
  };
}

function boundedAdapterInteger(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

export function resolvePresentationOrder(input: Omit<MugenPresentationOrder, "schema">): ResolvedPresentationOrder {
  return resolveThreePresentationOrder(createMugenPresentationOrder(input));
}

export function resolveStagePresentationOrder(
  layerNo: number | undefined,
  authoredOrder: number,
  options?: Parameters<typeof createStagePresentationOrder>[2],
): ResolvedPresentationOrder {
  return resolveThreePresentationOrder(createStagePresentationOrder(layerNo, authoredOrder, options));
}

export function resolveActorPresentationOrder(
  ...input: Parameters<typeof createActorPresentationOrder>
): ResolvedPresentationOrder {
  return resolveThreePresentationOrder(createActorPresentationOrder(...input));
}

export function resolveActorUnderlayPresentationOrder(
  ...input: Parameters<typeof createActorUnderlayPresentationOrder>
): ResolvedPresentationOrder {
  return resolveThreePresentationOrder(createActorUnderlayPresentationOrder(...input));
}

export function resolveHitSparkPresentationOrder(
  ...input: Parameters<typeof createHitSparkPresentationOrder>
): ResolvedPresentationOrder {
  return resolveThreePresentationOrder(createHitSparkPresentationOrder(...input));
}

export function resolveOverlayPresentationOrder(
  ...input: Parameters<typeof createOverlayPresentationOrder>
): ResolvedPresentationOrder {
  return resolveThreePresentationOrder(createOverlayPresentationOrder(...input));
}

export function applyThreePresentationOrder(
  object: ThreeOrderObject,
  material: ThreeOrderMaterial,
  order: ResolvedPresentationOrder,
): void {
  object.renderOrder = order.three.renderOrder;
  material.transparent = order.three.transparent;
  material.depthTest = order.three.depthTest;
  material.depthWrite = order.three.depthWrite;
}

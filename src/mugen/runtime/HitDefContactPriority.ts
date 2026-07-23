export const DEFAULT_RUNTIME_HIT_DEF_PRIORITY = 4;

export function normalizeRuntimeHitDefPriority(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : DEFAULT_RUNTIME_HIT_DEF_PRIORITY;
}

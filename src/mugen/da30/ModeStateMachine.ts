/**
 * DA30-053: mode state machine transitions (design implemented as pure SM).
 */

export type ProductMode =
  | "title"
  | "select"
  | "versus"
  | "arcade"
  | "team"
  | "demo"
  | "training"
  | "survival"
  | "results"
  | "continue"
  | "match";

const TRANSITIONS: Record<ProductMode, ProductMode[]> = {
  title: ["select", "demo", "versus", "arcade", "training", "survival"],
  select: ["versus", "team", "match", "title"],
  versus: ["match", "select", "results"],
  arcade: ["match", "results", "continue", "title"],
  team: ["match", "select", "results"],
  demo: ["title", "match"],
  training: ["match", "select", "title"],
  survival: ["match", "results", "title"],
  results: ["continue", "select", "title", "versus"],
  continue: ["match", "title", "results"],
  match: ["results", "select", "title", "training"],
};

export function canTransition(from: ProductMode, to: ProductMode): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function transition(
  from: ProductMode,
  to: ProductMode,
): { ok: true; mode: ProductMode } | { ok: false; error: string } {
  if (!canTransition(from, to)) {
    return { ok: false, error: `illegal transition ${from} -> ${to}` };
  }
  return { ok: true, mode: to };
}

export function modeTransitionTable(): Array<{ from: ProductMode; to: ProductMode[] }> {
  return (Object.keys(TRANSITIONS) as ProductMode[]).map((from) => ({
    from,
    to: TRANSITIONS[from],
  }));
}

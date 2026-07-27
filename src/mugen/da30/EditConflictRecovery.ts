/**
 * DA30-074: edit conflicts and recovery routes.
 */

export type ConflictKind =
  | "stale-base"
  | "parallel-tab"
  | "external-file"
  | "partial-asset"
  | "autosave"
  | "retry"
  | "discard"
  | "export-copy"
  | "reopen";

export type ConflictEvent = {
  kind: ConflictKind;
  baseRev: number;
  incomingRev: number;
  choice: "keep-local" | "take-remote" | "export-copy" | "retry" | "discard";
  preserved: boolean;
};

export function resolveConflict(e: Omit<ConflictEvent, "preserved">): ConflictEvent {
  if (e.kind === "stale-base" && e.incomingRev > e.baseRev) {
    return { ...e, choice: e.choice, preserved: e.choice !== "discard" };
  }
  if (e.kind === "parallel-tab") {
    return { ...e, preserved: e.choice === "keep-local" || e.choice === "export-copy" };
  }
  if (e.kind === "discard") {
    return { ...e, choice: "discard", preserved: false };
  }
  if (e.kind === "export-copy") {
    return { ...e, choice: "export-copy", preserved: true };
  }
  return { ...e, preserved: e.choice !== "discard" };
}

export function runConflictRoutes(): {
  ok: boolean;
  events: ConflictEvent[];
} {
  const kinds: ConflictKind[] = [
    "stale-base",
    "parallel-tab",
    "external-file",
    "partial-asset",
    "autosave",
    "retry",
    "discard",
    "export-copy",
    "reopen",
  ];
  const events = kinds.map((kind, i) =>
    resolveConflict({
      kind,
      baseRev: 1,
      incomingRev: kind === "stale-base" ? 3 : 1,
      choice:
        kind === "discard"
          ? "discard"
          : kind === "export-copy"
            ? "export-copy"
            : kind === "parallel-tab"
              ? "keep-local"
              : "retry",
    }),
  );
  const discard = events.find((e) => e.kind === "discard");
  const exportCopy = events.find((e) => e.kind === "export-copy");
  return {
    ok: events.length === 9 && discard?.preserved === false && exportCopy?.preserved === true,
    events,
  };
}

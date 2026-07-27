/**
 * DA30-051: exact character/stage selection state model.
 */

export type SelectionEntry = {
  packageId: string;
  revision: string;
  legal: boolean;
  blockedReason?: string;
  missing?: boolean;
  profile?: string;
  palette?: number;
};

export type SelectionState = {
  schema: "Da30SelectionState/v1";
  seats: Record<string, SelectionEntry | null>;
  stageId: string | null;
  stageRevision: string | null;
};

export function createEmptySelection(): SelectionState {
  return {
    schema: "Da30SelectionState/v1",
    seats: { p1: null, p2: null },
    stageId: null,
    stageRevision: null,
  };
}

export function assignSeat(
  state: SelectionState,
  seat: string,
  entry: SelectionEntry,
): { ok: boolean; state: SelectionState; error?: string } {
  if (!entry.packageId.trim()) return { ok: false, state, error: "empty packageId" };
  if (entry.missing) return { ok: false, state, error: "missing package" };
  if (!entry.legal) return { ok: false, state, error: entry.blockedReason || "blocked" };
  // duplicate package same revision on both seats may be legal for mirror matches
  return {
    ok: true,
    state: {
      ...state,
      seats: { ...state.seats, [seat]: entry },
    },
  };
}

export function launchPackageIds(state: SelectionState): { ok: boolean; ids: string[]; error?: string } {
  const ids: string[] = [];
  for (const [seat, entry] of Object.entries(state.seats)) {
    if (!entry) return { ok: false, ids: [], error: `seat ${seat} empty` };
    if (!entry.legal || entry.missing) return { ok: false, ids: [], error: `seat ${seat} illegal` };
    ids.push(`${entry.packageId}@${entry.revision}`);
  }
  if (!state.stageId || !state.stageRevision) return { ok: false, ids: [], error: "stage missing" };
  return { ok: true, ids: [...ids, `${state.stageId}@${state.stageRevision}`] };
}

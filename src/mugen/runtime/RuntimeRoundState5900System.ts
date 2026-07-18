import type {
  MugenStateSourceKind,
  MugenStateSourceRef,
  MugenStateSourceSelection,
} from "../model/MugenState";

export const RUNTIME_ROUND_STATE_5900_SCHEMA = "mugen-web-sandbox/runtime-round-state-5900/v0";
export const RUNTIME_ROUND_STATE_5900_PROVENANCE_SCHEMA = "mugen-web-sandbox/runtime-round-state-5900-provenance/v1";
export const RUNTIME_ROUND_STATE_5900 = 5900;

export type RuntimeRoundState5900SourceSnapshot = {
  layer: MugenStateSourceKind;
  path: string;
  fingerprint: string;
};

export type RuntimeRoundState5900Provenance = {
  schema: typeof RUNTIME_ROUND_STATE_5900_PROVENANCE_SCHEMA;
  stateNo: typeof RUNTIME_ROUND_STATE_5900;
  status: "resolved" | "unknown" | "unavailable";
  selected?: RuntimeRoundState5900SourceSnapshot;
  precedence?: MugenStateSourceSelection["reason"];
  shadowed: RuntimeRoundState5900SourceSnapshot[];
  appended: RuntimeRoundState5900SourceSnapshot[];
  reason?: "state-not-available" | "state-source-selection-missing";
};

export type RuntimeRoundState5900Actor = {
  id: string;
  stateIds: readonly number[];
  stateSources?: readonly MugenStateSourceSelection[];
};

export type RuntimeRoundState5900ActorSnapshot = {
  actorId: string;
  stateNo: typeof RUNTIME_ROUND_STATE_5900;
  status: "available" | "unavailable";
  provenance?: RuntimeRoundState5900Provenance;
};

export type RuntimeRoundState5900Snapshot = {
  schema: typeof RUNTIME_ROUND_STATE_5900_SCHEMA;
  stateNo: typeof RUNTIME_ROUND_STATE_5900;
  actors: RuntimeRoundState5900ActorSnapshot[];
  availableActorIds: string[];
  unavailableActorIds: string[];
  diagnostics: string[];
};

export class RuntimeRoundState5900World {
  prepare(actors: readonly RuntimeRoundState5900Actor[]): RuntimeRoundState5900Snapshot {
    const diagnostics: string[] = [];
    const seenIds = new Set<string>();
    const snapshots: RuntimeRoundState5900ActorSnapshot[] = [];

    for (const actor of actors) {
      const actorId = actor.id.trim();
      if (!actorId) {
        diagnostics.push("invalid-actor-id");
        continue;
      }
      if (seenIds.has(actorId)) {
        diagnostics.push(`duplicate-actor:${actorId}`);
        continue;
      }
      seenIds.add(actorId);
      const stateAvailable = actor.stateIds.some((stateId) => stateId === RUNTIME_ROUND_STATE_5900);
      const provenance = actor.stateSources === undefined
        ? undefined
        : createState5900Provenance(actor.stateSources, stateAvailable);
      snapshots.push({
        actorId,
        stateNo: RUNTIME_ROUND_STATE_5900,
        status: stateAvailable ? "available" : "unavailable",
        ...(provenance === undefined ? {} : { provenance }),
      });
    }

    const availableActorIds = snapshots.filter(({ status }) => status === "available").map(({ actorId }) => actorId);
    const unavailableActorIds = snapshots.filter(({ status }) => status === "unavailable").map(({ actorId }) => actorId);
    if (unavailableActorIds.length > 0) diagnostics.push("state-5900-unavailable");
    return {
      schema: RUNTIME_ROUND_STATE_5900_SCHEMA,
      stateNo: RUNTIME_ROUND_STATE_5900,
      actors: snapshots,
      availableActorIds,
      unavailableActorIds,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

function createState5900Provenance(
  selections: readonly MugenStateSourceSelection[],
  stateAvailable: boolean,
): RuntimeRoundState5900Provenance {
  const selection = selections.find(({ stateId, special }) => stateId === RUNTIME_ROUND_STATE_5900 && special === undefined);
  if (!selection) {
    return {
      schema: RUNTIME_ROUND_STATE_5900_PROVENANCE_SCHEMA,
      stateNo: RUNTIME_ROUND_STATE_5900,
      status: stateAvailable ? "unknown" : "unavailable",
      shadowed: [],
      appended: [],
      reason: stateAvailable ? "state-source-selection-missing" : "state-not-available",
    };
  }
  return {
    schema: RUNTIME_ROUND_STATE_5900_PROVENANCE_SCHEMA,
    stateNo: RUNTIME_ROUND_STATE_5900,
    status: "resolved",
    selected: sourceSnapshot(selection.selected),
    precedence: selection.reason,
    shadowed: selection.shadowed.map(sourceSnapshot),
    appended: (selection.appended ?? []).map(sourceSnapshot),
  };
}

function sourceSnapshot(source: MugenStateSourceRef): RuntimeRoundState5900SourceSnapshot {
  return {
    layer: source.kind,
    path: source.path,
    fingerprint: source.fingerprint,
  };
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

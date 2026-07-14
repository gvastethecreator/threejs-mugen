export const RUNTIME_ROUND_STATE_5900_SCHEMA = "mugen-web-sandbox/runtime-round-state-5900/v0";
export const RUNTIME_ROUND_STATE_5900 = 5900;

export type RuntimeRoundState5900Actor = {
  id: string;
  stateIds: readonly number[];
};

export type RuntimeRoundState5900ActorSnapshot = {
  actorId: string;
  stateNo: typeof RUNTIME_ROUND_STATE_5900;
  status: "available" | "unavailable";
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
      snapshots.push({
        actorId,
        stateNo: RUNTIME_ROUND_STATE_5900,
        status: stateAvailable ? "available" : "unavailable",
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

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

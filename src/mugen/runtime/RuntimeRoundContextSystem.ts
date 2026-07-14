export const RUNTIME_ROUND_CONTEXT_SCHEMA = "mugen-web-sandbox/runtime-round-context/v0";

export type RuntimeRoundContextActor = {
  id: string;
};

export type RuntimeRoundContextActorSnapshot = {
  actorId: string;
  roundNo: number;
  roundsExisted: number;
  joinedRoundNo: number;
};

export type RuntimeRoundContextSnapshot = {
  schema: typeof RUNTIME_ROUND_CONTEXT_SCHEMA;
  roundNo: number;
  roundsExisted: number;
  matchOver: boolean;
  actors: RuntimeRoundContextActorSnapshot[];
  diagnostics: string[];
};

export type RuntimeRoundContextTransition = {
  applied: boolean;
  snapshot: RuntimeRoundContextSnapshot;
  joinedRoundNos: Record<string, number>;
  diagnostics: string[];
};

export class RuntimeRoundContextWorld {
  private roundNo = 1;
  private joinedRoundNos = new Map<string, number>();

  reset(actors: readonly RuntimeRoundContextActor[]): RuntimeRoundContextSnapshot {
    const normalized = normalizeActors(actors);
    this.roundNo = 1;
    this.joinedRoundNos = new Map(normalized.ids.map((id) => [id, 1]));
    return this.snapshot(false, normalized.diagnostics);
  }

  snapshot(matchOver = false, diagnostics: readonly string[] = []): RuntimeRoundContextSnapshot {
    return snapshotFrom(this.roundNo, Object.fromEntries(this.joinedRoundNos), matchOver, diagnostics);
  }

  prepareNextRound(nextRoundNo: number, actors: readonly RuntimeRoundContextActor[]): RuntimeRoundContextTransition {
    const normalized = normalizeActors(actors);
    const expectedRoundNo = this.roundNo + 1;
    if (!Number.isSafeInteger(nextRoundNo) || nextRoundNo !== expectedRoundNo) {
      const diagnostics = [...normalized.diagnostics, `non-sequential-round:${nextRoundNo}`];
      return {
        applied: false,
        snapshot: this.snapshot(false, diagnostics),
        joinedRoundNos: Object.fromEntries(this.joinedRoundNos),
        diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
      };
    }

    const joinedRoundNos = Object.fromEntries(this.joinedRoundNos);
    for (const id of normalized.ids) {
      joinedRoundNos[id] ??= nextRoundNo;
    }
    const snapshot = snapshotFrom(nextRoundNo, joinedRoundNos, false, normalized.diagnostics);
    return {
      applied: normalized.diagnostics.length === 0,
      snapshot,
      joinedRoundNos,
      diagnostics: normalized.diagnostics,
    };
  }

  commit(transition: RuntimeRoundContextTransition): RuntimeRoundContextSnapshot {
    if (!transition.applied) return this.snapshot(false, transition.diagnostics);
    this.roundNo = transition.snapshot.roundNo;
    this.joinedRoundNos = new Map(Object.entries(transition.joinedRoundNos));
    return this.snapshot(transition.snapshot.matchOver, transition.snapshot.diagnostics);
  }
}

function normalizeActors(actors: readonly RuntimeRoundContextActor[]): { ids: string[]; diagnostics: string[] } {
  const diagnostics: string[] = [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const actor of actors) {
    const id = actor.id.trim();
    if (!id) {
      diagnostics.push("invalid-actor-id");
      continue;
    }
    if (seen.has(id)) {
      diagnostics.push(`duplicate-actor:${id}`);
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return { ids, diagnostics: [...new Set(diagnostics)].sort(compareStableStrings) };
}

function snapshotFrom(
  roundNo: number,
  joinedRoundNos: Record<string, number>,
  matchOver: boolean,
  diagnostics: readonly string[],
): RuntimeRoundContextSnapshot {
  return {
    schema: RUNTIME_ROUND_CONTEXT_SCHEMA,
    roundNo,
    roundsExisted: Math.max(0, roundNo - 1),
    matchOver,
    actors: Object.entries(joinedRoundNos).map(([actorId, joinedRoundNo]) => ({
      actorId,
      roundNo,
      roundsExisted: Math.max(0, roundNo - joinedRoundNo),
      joinedRoundNo,
    })),
    diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
  };
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

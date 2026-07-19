import type { RuntimeRoundPhase } from "./RuntimeRoundPhaseSystem";

export const RUNTIME_ROUND_WIN_POSE_SCHEMA = "mugen-web-sandbox/runtime-round-win-pose/v0";

export const DEFAULT_RUNTIME_WIN_POSE_FRAMES = 45;
export const RUNTIME_WIN_POSE_STATE = 180;
export const RUNTIME_LOSE_POSE_STATE = 170;
export const RUNTIME_DRAW_POSE_STATE = 175;

export type RuntimeRoundWinPoseStateNo =
  | typeof RUNTIME_WIN_POSE_STATE
  | typeof RUNTIME_LOSE_POSE_STATE
  | typeof RUNTIME_DRAW_POSE_STATE;

export type RuntimeRoundWinPoseRole = "winner" | "loser" | "draw";

export type RuntimeRoundWinPoseActor = {
  id: string;
  label: string;
};

export type RuntimeRoundWinPoseActorSnapshot = {
  actorId: string;
  role: RuntimeRoundWinPoseRole;
  requestedStateNo: RuntimeRoundWinPoseStateNo;
  status: "started" | "unavailable";
  stateAvailable: boolean;
  appliedStateNo?: RuntimeRoundWinPoseStateNo;
  diagnostics: string[];
};

export type RuntimeRoundWinPoseSnapshot = {
  schema: typeof RUNTIME_ROUND_WIN_POSE_SCHEMA;
  phase: 4;
  status: "started" | "partial" | "unavailable";
  winner: string;
  actors: RuntimeRoundWinPoseActorSnapshot[];
  diagnostics: string[];
};

export type RuntimeRoundWinPoseApplyInput<TActor extends RuntimeRoundWinPoseActor> = {
  phase: RuntimeRoundPhase;
  winner?: string;
  actors: readonly TActor[];
  canEnterState: (actor: TActor, stateNo: RuntimeRoundWinPoseStateNo) => boolean;
  enterState: (actor: TActor, stateNo: RuntimeRoundWinPoseStateNo) => void;
};

export class RuntimeRoundWinPoseWorld {
  private readonly attempted = new Map<string, RuntimeRoundWinPoseActorSnapshot>();
  private lastSnapshot?: RuntimeRoundWinPoseSnapshot;

  reset(): void {
    this.attempted.clear();
    this.lastSnapshot = undefined;
  }

  snapshot(): RuntimeRoundWinPoseSnapshot | undefined {
    if (!this.lastSnapshot) return undefined;
    return {
      ...this.lastSnapshot,
      actors: this.lastSnapshot.actors.map((actor) => ({
        ...actor,
        diagnostics: [...actor.diagnostics],
      })),
      diagnostics: [...this.lastSnapshot.diagnostics],
    };
  }

  apply<TActor extends RuntimeRoundWinPoseActor>(
    input: RuntimeRoundWinPoseApplyInput<TActor>,
  ): RuntimeRoundWinPoseSnapshot | undefined {
    if (input.phase !== 4 || input.winner === undefined) return undefined;

    const winner = input.winner.trim();
    const diagnostics: string[] = [];
    if (!winner) diagnostics.push("invalid-winner");

    const normalizedActors: TActor[] = [];
    const seenIds = new Set<string>();
    for (const actor of input.actors) {
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
      normalizedActors.push(actor);
    }

    const winnerMatches = normalizedActors.filter((actor) => actor.label === winner);
    const winnerInRoster = winner === "Draw" || winnerMatches.length === 1;
    const winnerDiagnostic = winnerMatches.length > 1 ? "ambiguous-winner-label" : "winner-not-in-roster";
    if (!winnerInRoster && winner) diagnostics.push(winnerDiagnostic);

    const actors = normalizedActors.map((actor) => {
      const existing = this.attempted.get(actor.id.trim());
      if (existing) return cloneActorSnapshot(existing);

      const role = resolveRole(actor, winner, winnerInRoster);
      const requestedStateNo = stateForRole(role);
      const stateAvailable = winnerInRoster && input.canEnterState(actor, requestedStateNo);
      const actorDiagnostics = winnerInRoster ? [] : [winnerDiagnostic];
      if (stateAvailable) {
        input.enterState(actor, requestedStateNo);
        const snapshot: RuntimeRoundWinPoseActorSnapshot = {
          actorId: actor.id.trim(),
          role,
          requestedStateNo,
          status: "started",
          stateAvailable: true,
          appliedStateNo: requestedStateNo,
          diagnostics: actorDiagnostics,
        };
        this.attempted.set(snapshot.actorId, snapshot);
        return cloneActorSnapshot(snapshot);
      }

      actorDiagnostics.push("state-unavailable");
      const snapshot: RuntimeRoundWinPoseActorSnapshot = {
        actorId: actor.id.trim(),
        role,
        requestedStateNo,
        status: "unavailable",
        stateAvailable: false,
        diagnostics: actorDiagnostics,
      };
      this.attempted.set(snapshot.actorId, snapshot);
      return cloneActorSnapshot(snapshot);
    });

    const startedCount = actors.filter(({ status }) => status === "started").length;
    const status: RuntimeRoundWinPoseSnapshot["status"] = actors.length === 0 || startedCount === 0
      ? "unavailable"
      : startedCount === actors.length
        ? "started"
        : "partial";
    const snapshot: RuntimeRoundWinPoseSnapshot = {
      schema: RUNTIME_ROUND_WIN_POSE_SCHEMA,
      phase: 4,
      status,
      winner,
      actors,
      diagnostics: stableDiagnostics(diagnostics.concat(actors.flatMap(({ diagnostics: actorDiagnostics }) => actorDiagnostics))),
    };
    this.lastSnapshot = snapshot;
    return this.snapshot();
  }
}

function resolveRole<TActor extends RuntimeRoundWinPoseActor>(
  actor: TActor,
  winner: string,
  winnerInRoster: boolean,
): RuntimeRoundWinPoseRole {
  if (!winnerInRoster || winner === "Draw") return winner === "Draw" ? "draw" : "loser";
  return actor.label === winner ? "winner" : "loser";
}

function stateForRole(role: RuntimeRoundWinPoseRole): RuntimeRoundWinPoseStateNo {
  if (role === "winner") return RUNTIME_WIN_POSE_STATE;
  if (role === "loser") return RUNTIME_LOSE_POSE_STATE;
  return RUNTIME_DRAW_POSE_STATE;
}

function cloneActorSnapshot(snapshot: RuntimeRoundWinPoseActorSnapshot): RuntimeRoundWinPoseActorSnapshot {
  return {
    ...snapshot,
    diagnostics: [...snapshot.diagnostics],
  };
}

function stableDiagnostics(diagnostics: readonly string[]): string[] {
  return [...new Set(diagnostics)].sort((left, right) => left.localeCompare(right));
}

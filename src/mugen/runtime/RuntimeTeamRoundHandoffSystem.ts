import type { RuntimeTeamRoundDecision } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTeamState } from "./types";

export const RUNTIME_TEAM_ROUND_HANDOFF_SCHEMA = "mugen-web-sandbox/runtime-team-round-handoff/v0";

export type RuntimeTeamRoundHandoffActor = {
  id: string;
  side: RuntimeTeamSide;
  life: number;
  disabled?: boolean;
  standby?: boolean;
  overKo?: boolean;
  playerType?: boolean;
  replacementEligible?: boolean;
  memberNo?: number;
  teamState: RuntimeTeamState;
};

export type RuntimeTeamRoundHandoffChange = {
  side: RuntimeTeamSide;
  role: "outgoing" | "incoming";
  actorId: string;
  expected: Pick<RuntimeTeamState, "standby" | "overKo">;
  next: Pick<RuntimeTeamState, "standby" | "overKo">;
};

export type RuntimeTeamRoundHandoffOutcome =
  | "no-op"
  | "round-not-over"
  | "replacement"
  | "side-defeat"
  | "draw"
  | "blocked";

export type RuntimeTeamRoundHandoffPlan = {
  schema: typeof RUNTIME_TEAM_ROUND_HANDOFF_SCHEMA;
  tick: number;
  outcome: RuntimeTeamRoundHandoffOutcome;
  ready: boolean;
  changes: RuntimeTeamRoundHandoffChange[];
  phases: string[];
  diagnostics: string[];
};

export type RuntimeTeamRoundHandoffResult = RuntimeTeamRoundHandoffPlan & {
  applied: boolean;
};

export type RuntimeTeamRoundHandoffInput = {
  actors: readonly RuntimeTeamRoundHandoffActor[];
  decision: RuntimeTeamRoundDecision;
};

export class RuntimeTeamRoundHandoffWorld {
  plan(input: RuntimeTeamRoundHandoffInput): RuntimeTeamRoundHandoffPlan {
    const diagnostics: string[] = [];
    const changes: RuntimeTeamRoundHandoffChange[] = [];
    const actorsById = indexActors(input.actors, diagnostics);
    const invalidDecisionDiagnostic = input.decision.diagnostics.find(isBlockingDecisionDiagnostic);

    if (input.decision.schema !== "mugen-web-sandbox/runtime-team-round-decision/v0") {
      diagnostics.push("unsupported-decision-schema");
    }
    if (invalidDecisionDiagnostic) {
      diagnostics.push(`invalid-decision:${invalidDecisionDiagnostic}`);
    }

    const base = {
      schema: RUNTIME_TEAM_ROUND_HANDOFF_SCHEMA as typeof RUNTIME_TEAM_ROUND_HANDOFF_SCHEMA,
      tick: input.decision.tick,
      changes,
      diagnostics: [] as string[],
    };

    if (diagnostics.length > 0) {
      return {
        ...base,
        outcome: "blocked",
        ready: false,
        phases: ["decision:read", "handoff:blocked"],
        diagnostics: stableDiagnostics(diagnostics),
      };
    }

    if (input.decision.roundNotOver || input.decision.outcome === "round-not-over") {
      return {
        ...base,
        outcome: "round-not-over",
        ready: false,
        phases: ["decision:read", "decision:round-not-over", "handoff:skip"],
        diagnostics: [],
      };
    }

    if (input.decision.outcome === "replacement-required") {
      for (const side of [1, 2] as const) {
        const sideDecision = input.decision.sides.find((candidate) => candidate.side === side);
        if (!sideDecision) {
          diagnostics.push(`missing-side-decision:${side}`);
          continue;
        }
        if (!sideDecision.needsReplacement) continue;
        if (sideDecision.mode !== "turns") {
          diagnostics.push(`replacement-mode:${side}`);
          continue;
        }
        const incomingId = sideDecision.replacementCandidateIds[0];
        if (!incomingId) {
          diagnostics.push(`missing-replacement:${side}`);
          continue;
        }
        const incoming = actorsById.get(incomingId);
        if (!incoming) {
          diagnostics.push(`unknown-replacement:${incomingId}`);
          continue;
        }
        if (!isHealthyStandbyReplacement(incoming, side)) {
          diagnostics.push(`invalid-replacement:${incomingId}`);
          continue;
        }

        const outgoingId = sideDecision.koActorIds[0];
        const outgoing = outgoingId ? actorsById.get(outgoingId) : undefined;
        if (outgoingId && (!outgoing || !isValidOutgoing(outgoing, side))) {
          diagnostics.push(`invalid-outgoing:${outgoingId}`);
          continue;
        }

        if (outgoing) {
          changes.push({
            side,
            role: "outgoing",
            actorId: outgoing.id,
            expected: {
              standby: outgoing.teamState.standby,
              overKo: outgoing.teamState.overKo,
            },
            next: { standby: true, overKo: true },
          });
        }
        changes.push({
          side,
          role: "incoming",
          actorId: incoming.id,
          expected: {
            standby: incoming.teamState.standby,
            overKo: incoming.teamState.overKo,
          },
          next: { standby: false, overKo: false },
        });
      }
      if (diagnostics.length > 0 || changes.length === 0) {
        if (changes.length === 0 && diagnostics.length === 0) diagnostics.push("empty-handoff");
        return {
          ...base,
          outcome: "blocked",
          ready: false,
          changes: [],
          phases: ["decision:read", "decision:replacement-required", "handoff:blocked"],
          diagnostics: stableDiagnostics(diagnostics),
        };
      }
      return {
        ...base,
        outcome: "replacement",
        ready: true,
        phases: ["decision:read", "decision:replacement-required", "handoff:preflight"],
        diagnostics: [],
      };
    }

    const outcome = input.decision.outcome === "side-defeat" || input.decision.outcome === "draw"
      ? input.decision.outcome
      : "no-op";
    return {
      ...base,
      outcome,
      ready: false,
      phases: ["decision:read", `decision:${outcome}`, "handoff:skip"],
      diagnostics: [],
    };
  }

  apply(input: RuntimeTeamRoundHandoffInput): RuntimeTeamRoundHandoffResult {
    const plan = this.plan(input);
    if (!plan.ready) return { ...plan, applied: false };

    const actorsById = new Map(input.actors.map((actor) => [actor.id, actor]));
    for (const change of plan.changes) {
      const actor = actorsById.get(change.actorId);
      if (!actor) throw new Error(`Team handoff target ${change.actorId} disappeared during preflight`);
      if (
        actor.teamState.standby !== change.expected.standby ||
        actor.teamState.overKo !== change.expected.overKo
      ) {
        throw new Error(`Team handoff precondition changed for ${change.actorId}`);
      }
    }

    for (const change of plan.changes) {
      const actor = actorsById.get(change.actorId)!;
      actor.teamState.standby = change.next.standby;
      actor.teamState.overKo = change.next.overKo;
    }

    return {
      ...plan,
      applied: true,
      phases: [...plan.phases, "handoff:commit", "handoff:complete"],
    };
  }
}

function indexActors(
  actors: readonly RuntimeTeamRoundHandoffActor[],
  diagnostics: string[],
): Map<string, RuntimeTeamRoundHandoffActor> {
  const byId = new Map<string, RuntimeTeamRoundHandoffActor>();
  for (const actor of actors) {
    if (!actor.id.trim()) {
      diagnostics.push("invalid-actor-id");
      continue;
    }
    if (byId.has(actor.id)) {
      diagnostics.push(`duplicate-actor:${actor.id}`);
      continue;
    }
    byId.set(actor.id, actor);
  }
  return byId;
}

function isValidOutgoing(actor: RuntimeTeamRoundHandoffActor, side: RuntimeTeamSide): boolean {
  return actor.side === side &&
    actor.teamState.playerType &&
    !actor.teamState.disabled &&
    !actor.teamState.standby &&
    actor.life <= 0;
}

function isHealthyStandbyReplacement(actor: RuntimeTeamRoundHandoffActor, side: RuntimeTeamSide): boolean {
  return actor.side === side &&
    actor.teamState.playerType &&
    !actor.teamState.disabled &&
    actor.replacementEligible === true &&
    actor.teamState.standby &&
    !actor.teamState.overKo &&
    actor.life > 0;
}

function isBlockingDecisionDiagnostic(diagnostic: string): boolean {
  return diagnostic.startsWith("duplicate-") ||
    diagnostic.startsWith("unknown-side:") ||
    diagnostic.startsWith("invalid-") ||
    diagnostic.startsWith("replacement-not-standby:");
}

function stableDiagnostics(diagnostics: readonly string[]): string[] {
  return [...new Set(diagnostics)].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

import {
  RuntimeRoundResourceResetWorld,
  type RuntimeRoundResourceActor,
  type RuntimeRoundResourceResetResult,
} from "./RuntimeRoundResourceResetSystem";
import {
  RuntimeRoundState5900World,
  type RuntimeRoundState5900Actor,
  type RuntimeRoundState5900Snapshot,
} from "./RuntimeRoundState5900System";
import {
  RuntimeTeamRoundDecisionWorld,
  type RuntimeTeamRoundDecision,
  type RuntimeTeamRoundMode,
} from "./RuntimeTeamRoundDecisionSystem";
import {
  RuntimeTeamRoundHandoffWorld,
  type RuntimeTeamRoundHandoffActor,
  type RuntimeTeamRoundHandoffPlan,
} from "./RuntimeTeamRoundHandoffSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export const RUNTIME_TURNS_CONTINUATION_SCHEMA = "mugen-web-sandbox/runtime-turns-continuation/v0";

export type RuntimeTurnsContinuationStatus =
  | "round-not-over"
  | "ongoing"
  | "replacement-required"
  | "side-defeat"
  | "draw"
  | "blocked";

export type RuntimeTurnsContinuationInput = {
  actors: readonly RuntimeTeamRoundHandoffActor[];
  resourceActors?: readonly RuntimeRoundResourceActor[];
  modeBySide: Record<RuntimeTeamSide, RuntimeTeamRoundMode>;
  stateActors: readonly RuntimeRoundState5900Actor[];
  roundNotOver?: boolean;
  winnerId?: string;
  nextRoundNo?: number;
  tick?: number;
};

export type RuntimeTurnsContinuationPlan = {
  schema: typeof RUNTIME_TURNS_CONTINUATION_SCHEMA;
  tick: number;
  status: RuntimeTurnsContinuationStatus;
  ready: boolean;
  decision: RuntimeTeamRoundDecision;
  handoff: RuntimeTeamRoundHandoffPlan;
  resourceReset: RuntimeRoundResourceResetResult;
  state5900: RuntimeRoundState5900Snapshot;
  incomingActorIds: string[];
  phases: string[];
  diagnostics: string[];
};

export type RuntimeTurnsContinuationResult = RuntimeTurnsContinuationPlan & {
  applied: boolean;
};

export class RuntimeTurnsContinuationWorld {
  constructor(
    private readonly decisionWorld = new RuntimeTeamRoundDecisionWorld(),
    private readonly handoffWorld = new RuntimeTeamRoundHandoffWorld(),
    private readonly resourceResetWorld = new RuntimeRoundResourceResetWorld(),
    private readonly state5900World = new RuntimeRoundState5900World(),
  ) {}

  prepare(input: RuntimeTurnsContinuationInput): RuntimeTurnsContinuationPlan {
    const decision = this.decisionWorld.snapshot({
      actors: input.actors,
      modeBySide: input.modeBySide,
      roundNotOver: input.roundNotOver,
      tick: input.tick,
    });
    const handoff = this.handoffWorld.plan({ actors: input.actors, decision });
    const resourceReset = this.resourceResetWorld.prepare({
      actors: input.resourceActors ?? input.actors.map(resourceActor),
      mode: input.modeBySide[1],
      winnerId: input.winnerId,
      nextRoundNo: input.nextRoundNo,
      preserveDefeated: true,
    });
    const state5900 = this.state5900World.prepare(input.stateActors);
    const incomingActorIds = handoff.changes
      .filter(({ role }) => role === "incoming")
      .map(({ actorId }) => actorId);
    const diagnostics = stableDiagnostics([
      ...decision.diagnostics.filter((diagnostic) => !diagnostic.startsWith("empty-side:")),
      ...handoff.diagnostics,
      ...resourceReset.diagnostics,
      ...state5900.diagnostics,
    ]);

    if (decision.roundNotOver || decision.outcome === "round-not-over") {
      return this.basePlan({
        decision,
        handoff,
        resourceReset,
        state5900,
        incomingActorIds,
        status: "round-not-over",
        ready: false,
        phases: ["decision:read", "decision:round-not-over", "continuation:skip"],
        diagnostics,
      });
    }

    if (decision.outcome !== "replacement-required") {
      const status = decision.outcome === "side-defeat" || decision.outcome === "draw"
        ? decision.outcome
        : "ongoing";
      return this.basePlan({
        decision,
        handoff,
        resourceReset,
        state5900,
        incomingActorIds,
        status,
        ready: false,
        phases: ["decision:read", `decision:${status}`, "continuation:skip"],
        diagnostics,
      });
    }

    const unavailableIncoming = incomingActorIds.filter((actorId) =>
      state5900.unavailableActorIds.includes(actorId),
    );
    const blockedDiagnostics = [
      ...diagnostics,
      ...(handoff.ready ? [] : ["handoff-preflight-failed"]),
      ...unavailableIncoming.map((actorId) => `state-5900-required:${actorId}`),
    ];
    if (blockedDiagnostics.length > 0) {
      return this.basePlan({
        decision,
        handoff,
        resourceReset,
        state5900,
        incomingActorIds,
        status: "blocked",
        ready: false,
        phases: [
          "decision:read",
          "decision:replacement-required",
          "handoff:preflight",
          "resources:preflight",
          "state-5900:preflight",
          "continuation:blocked",
        ],
        diagnostics: stableDiagnostics(blockedDiagnostics),
      });
    }

    return this.basePlan({
      decision,
      handoff,
      resourceReset,
      state5900,
      incomingActorIds,
      status: "replacement-required",
      ready: true,
      phases: [
        "decision:read",
        "decision:replacement-required",
        "handoff:preflight",
        "resources:preflight",
        "state-5900:preflight",
        "continuation:ready",
      ],
      diagnostics: [],
    });
  }

  private basePlan(input: Omit<RuntimeTurnsContinuationPlan, "schema" | "tick">): RuntimeTurnsContinuationPlan {
    return {
      schema: RUNTIME_TURNS_CONTINUATION_SCHEMA,
      tick: input.decision.tick,
      ...input,
    };
  }
}

function resourceActor(actor: RuntimeTeamRoundHandoffActor): RuntimeRoundResourceActor {
  return {
    id: actor.id,
    life: actor.life,
    power: 0,
    guardPoints: 0,
    dizzyPoints: 0,
  };
}

function stableDiagnostics(diagnostics: readonly string[]): string[] {
  return [...new Set(diagnostics)].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

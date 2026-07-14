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
import {
  RuntimeTurnsRecoveryWorld,
  type RuntimeTurnsRecoveryActor,
  type RuntimeTurnsRecoveryResult,
} from "./RuntimeTurnsRecoverySystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export const RUNTIME_TURNS_CONTINUATION_SCHEMA = "mugen-web-sandbox/runtime-turns-continuation/v0";
export const RUNTIME_TURNS_ROSTER_SCHEMA = "mugen-web-sandbox/runtime-turns-roster/v0";

export type RuntimeTurnsRosterSideSnapshot = {
  side: RuntimeTeamSide;
  actorIds: string[];
  activeActorIds: string[];
  standbyActorIds: string[];
  defeatedActorIds: string[];
  replacementCandidateIds: string[];
  remainingCandidateIds: string[];
  nextIncomingActorId?: string;
};

export type RuntimeTurnsRosterSnapshot = {
  schema: typeof RUNTIME_TURNS_ROSTER_SCHEMA;
  sides: [RuntimeTurnsRosterSideSnapshot, RuntimeTurnsRosterSideSnapshot];
};

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
  recoveryTimeTicks?: number;
  matchOver?: boolean;
  nextRoundNo?: number;
  tick?: number;
};

export type RuntimeTurnsContinuationPlan = {
  schema: typeof RUNTIME_TURNS_CONTINUATION_SCHEMA;
  tick: number;
  status: RuntimeTurnsContinuationStatus;
  ready: boolean;
  decision: RuntimeTeamRoundDecision;
  roster: RuntimeTurnsRosterSnapshot;
  handoff: RuntimeTeamRoundHandoffPlan;
  recovery: RuntimeTurnsRecoveryResult;
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
    private readonly recoveryWorld = new RuntimeTurnsRecoveryWorld(),
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
    const roster = createRosterSnapshot(input.actors, decision);
    const handoff = this.handoffWorld.plan({ actors: input.actors, decision });
    const sourceResourceActors = input.resourceActors ?? input.actors.map(resourceActor);
    const sourceResourceById = new Map(sourceResourceActors.map((actor) => [actor.id, actor]));
    const recovery = this.recoveryWorld.prepare({
      actors: input.actors.map((actor) => recoveryActor(actor, sourceResourceById.get(actor.id))),
      winnerId: input.winnerId,
      timeTicks: input.recoveryTimeTicks,
      matchOver: input.matchOver,
    });
    const recoveredLifeById = new Map(recovery.states.map((state) => [state.actorId, state.lifeAfter]));
    const resourceActors = sourceResourceActors.map((actor) => {
      const recoveredLife = recoveredLifeById.get(actor.id);
      return recoveredLife === undefined ? actor : { ...actor, life: recoveredLife };
    });
    const resourceReset = this.resourceResetWorld.prepare({
      actors: resourceActors,
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
      ...recovery.diagnostics,
      ...resourceReset.diagnostics,
      ...state5900.diagnostics,
    ]);

    if (decision.roundNotOver || decision.outcome === "round-not-over") {
      return this.basePlan({
        decision,
        roster,
        handoff,
        recovery,
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
        roster,
        handoff,
        recovery,
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
        roster,
        handoff,
        recovery,
        resourceReset,
        state5900,
        incomingActorIds,
        status: "blocked",
        ready: false,
        phases: [
          "decision:read",
          "decision:replacement-required",
          "handoff:preflight",
          "recovery:preflight",
          "resources:preflight",
          "state-5900:preflight",
          "continuation:blocked",
        ],
        diagnostics: stableDiagnostics(blockedDiagnostics),
      });
    }

    return this.basePlan({
      decision,
      roster,
      handoff,
      recovery,
      resourceReset,
      state5900,
      incomingActorIds,
      status: "replacement-required",
      ready: true,
      phases: [
        "decision:read",
        "decision:replacement-required",
        "handoff:preflight",
        "recovery:preflight",
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

function createRosterSnapshot(
  actors: readonly RuntimeTeamRoundHandoffActor[],
  decision: RuntimeTeamRoundDecision,
): RuntimeTurnsRosterSnapshot {
  const sides = ([1, 2] as const).map((side) => {
    const sideActors = actors
      .filter((actor) => actor.side === side)
      .sort(compareRosterActors);
    const sideDecision = decision.sides.find((candidate) => candidate.side === side);
    const actorIds = sideActors.map(({ id }) => id);
    const activeActorIds = sideActors
      .filter((actor) => actor.disabled !== true && actor.playerType !== false && actor.standby !== true && actor.overKo !== true)
      .map(({ id }) => id);
    const standbyActorIds = sideActors.filter(({ standby }) => standby === true).map(({ id }) => id);
    const defeatedActorIds = sideActors
      .filter(({ life, overKo }) => life <= 0 || overKo === true)
      .map(({ id }) => id);
    const replacementCandidateIds = sideDecision?.replacementCandidateIds ?? [];
    return {
      side,
      actorIds,
      activeActorIds,
      standbyActorIds,
      defeatedActorIds,
      replacementCandidateIds,
      remainingCandidateIds: replacementCandidateIds.slice(1),
      ...(replacementCandidateIds[0] === undefined ? {} : { nextIncomingActorId: replacementCandidateIds[0] }),
    } satisfies RuntimeTurnsRosterSideSnapshot;
  }) as [RuntimeTurnsRosterSideSnapshot, RuntimeTurnsRosterSideSnapshot];
  return { schema: RUNTIME_TURNS_ROSTER_SCHEMA, sides };
}

function compareRosterActors(left: RuntimeTeamRoundHandoffActor, right: RuntimeTeamRoundHandoffActor): number {
  if (left.memberNo !== undefined && right.memberNo !== undefined && left.memberNo !== right.memberNo) {
    return left.memberNo - right.memberNo;
  }
  if (left.memberNo !== undefined) return -1;
  if (right.memberNo !== undefined) return 1;
  return compareStableStrings(left.id, right.id);
}

function recoveryActor(
  actor: RuntimeTeamRoundHandoffActor,
  resourceActor: RuntimeRoundResourceActor | undefined,
): RuntimeTurnsRecoveryActor {
  return {
    id: actor.id,
    life: resourceActor?.life ?? actor.life,
    ...(resourceActor?.lifeMax === undefined ? {} : { lifeMax: resourceActor.lifeMax }),
  };
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

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

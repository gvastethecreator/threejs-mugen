import { runtimeTeamSide, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export const RUNTIME_TEAM_ROUND_DECISION_SCHEMA = "mugen-web-sandbox/runtime-team-round-decision/v0";

export type RuntimeTeamRoundMode = "single" | "simul" | "tag" | "turns";

export type RuntimeTeamRoundActor = {
  id: string;
  side?: RuntimeTeamSide;
  rootId?: string;
  life: number;
  disabled?: boolean;
  standby?: boolean;
  overKo?: boolean;
  playerType?: boolean;
  replacementEligible?: boolean;
  memberNo?: number;
};

export type RuntimeTeamRoundDecisionInput = {
  actors: readonly RuntimeTeamRoundActor[];
  modeBySide: Record<RuntimeTeamSide, RuntimeTeamRoundMode>;
  loseOnKoBySide?: Partial<Record<RuntimeTeamSide, boolean>>;
  roundNotOver?: boolean;
  tick?: number;
};

export type RuntimeTeamRoundSideDecision = {
  side: RuntimeTeamSide;
  mode: RuntimeTeamRoundMode;
  loseOnKo: boolean;
  actorIds: string[];
  currentActorIds: string[];
  aliveActorIds: string[];
  koActorIds: string[];
  overKoActorIds: string[];
  replacementCandidateIds: string[];
  memberKo: boolean;
  needsReplacement: boolean;
  sideDefeated: boolean;
};

export type RuntimeTeamRoundDecisionOutcome =
  | "ongoing"
  | "round-not-over"
  | "replacement-required"
  | "side-defeat"
  | "draw";

export type RuntimeTeamRoundDecision = {
  schema: typeof RUNTIME_TEAM_ROUND_DECISION_SCHEMA;
  tick: number;
  roundNotOver: boolean;
  outcome: RuntimeTeamRoundDecisionOutcome;
  winnerSide?: RuntimeTeamSide;
  sides: [RuntimeTeamRoundSideDecision, RuntimeTeamRoundSideDecision];
  diagnostics: string[];
};

export class RuntimeTeamRoundDecisionWorld {
  snapshot(input: RuntimeTeamRoundDecisionInput): RuntimeTeamRoundDecision {
    const diagnostics: string[] = [];
    const actorsBySide: Record<RuntimeTeamSide, RuntimeTeamRoundActor[]> = { 1: [], 2: [] };
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
      if (actor.rootId !== undefined) {
        diagnostics.push(`ignored-helper:${actorId}`);
        continue;
      }
      const side = actor.side ?? runtimeTeamSide(actor);
      if (side === undefined) {
        diagnostics.push(`unknown-side:${actorId}`);
        continue;
      }
      if (!Number.isFinite(actor.life)) {
        diagnostics.push(`invalid-life:${actorId}`);
      }
      if (actor.replacementEligible === true && actor.standby !== true) {
        diagnostics.push(`replacement-not-standby:${actorId}`);
      }
      actorsBySide[side].push({ ...actor, id: actorId, side });
    }

    const sides: [RuntimeTeamRoundSideDecision, RuntimeTeamRoundSideDecision] = [
      createSideDecision(1, actorsBySide[1], input, diagnostics),
      createSideDecision(2, actorsBySide[2], input, diagnostics),
    ];
    const roundNotOver = input.roundNotOver === true;
    const defeated = sides.filter((side) => side.sideDefeated);
    const replacement = sides.some((side) => side.needsReplacement);
    const outcome: RuntimeTeamRoundDecisionOutcome = roundNotOver
      ? "round-not-over"
      : defeated.length === 2
        ? "draw"
        : defeated.length === 1
          ? "side-defeat"
          : replacement
            ? "replacement-required"
            : "ongoing";

    return {
      schema: RUNTIME_TEAM_ROUND_DECISION_SCHEMA,
      tick: normalizeTick(input.tick),
      roundNotOver,
      outcome,
      ...(outcome === "side-defeat" ? { winnerSide: defeated[0]!.side === 1 ? 2 : 1 } : {}),
      sides,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

function createSideDecision(
  side: RuntimeTeamSide,
  actors: readonly RuntimeTeamRoundActor[],
  input: RuntimeTeamRoundDecisionInput,
  diagnostics: string[],
): RuntimeTeamRoundSideDecision {
  const mode = input.modeBySide[side];
  const loseOnKo = input.loseOnKoBySide?.[side] === true;
  const orderedActors = [...actors].sort(compareActors);
  const participating = orderedActors.filter(isParticipating);
  const current = participating.filter((actor) => actor.standby !== true);
  const considered = mode === "turns" ? current : participating;
  const alive = considered.filter((actor) => actor.life > 0);
  const ko = considered.filter((actor) => actor.life <= 0);
  const overKo = orderedActors.filter((actor) => actor.overKo === true);
  const replacementCandidates = mode === "turns"
    ? orderedActors.filter(
        (actor) =>
          isParticipating(actor) &&
          actor.standby === true &&
          actor.replacementEligible === true &&
          actor.overKo !== true &&
          actor.life > 0,
      )
    : [];
  const memberKo = mode === "turns" && ko.length > 0;
  const missingCurrentTurnsActor = mode === "turns" && orderedActors.length > 0 && current.length === 0;
  const turnsNeedsReplacement = mode === "turns" && (memberKo || missingCurrentTurnsActor);
  const sideDefeated = mode === "turns"
    ? turnsNeedsReplacement && replacementCandidates.length === 0
    : considered.length > 0 && (loseOnKo ? ko.length > 0 : alive.length === 0);

  if (considered.length === 0) {
    diagnostics.push(`empty-side:${side}`);
  }
  if (missingCurrentTurnsActor) {
    diagnostics.push(`missing-current:${side}`);
  }

  return {
    side,
    mode,
    loseOnKo,
    actorIds: orderedActors.map((actor) => actor.id),
    currentActorIds: current.map((actor) => actor.id),
    aliveActorIds: alive.map((actor) => actor.id),
    koActorIds: ko.map((actor) => actor.id),
    overKoActorIds: overKo.map((actor) => actor.id),
    replacementCandidateIds: replacementCandidates.map((actor) => actor.id),
    memberKo,
    needsReplacement: turnsNeedsReplacement && replacementCandidates.length > 0,
    sideDefeated,
  };
}

function isParticipating(actor: RuntimeTeamRoundActor): boolean {
  return actor.disabled !== true && actor.playerType !== false;
}

function compareActors(left: RuntimeTeamRoundActor, right: RuntimeTeamRoundActor): number {
  if (left.memberNo !== undefined && right.memberNo !== undefined && left.memberNo !== right.memberNo) {
    return left.memberNo - right.memberNo;
  }
  if (left.memberNo !== undefined) return -1;
  if (right.memberNo !== undefined) return 1;
  return compareStableStrings(left.id, right.id);
}

function normalizeTick(tick: number | undefined): number {
  return Number.isFinite(tick) ? Math.max(0, Math.round(tick!)) : 0;
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

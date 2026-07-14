import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";

export const RUNTIME_ROUND_RESOURCE_RESET_SCHEMA = "mugen-web-sandbox/runtime-round-resource-reset/v0";

export type RuntimeRoundResourceActor = {
  id: string;
  life: number;
  lifeMax?: number;
  power: number;
  powerMax?: number;
  guardPoints: number;
  guardPointsMax?: number;
  dizzyPoints: number;
  dizzyPointsMax?: number;
  redLife?: number;
};

export type RuntimeRoundResourceState = {
  actorId: string;
  lifeBefore: number;
  lifeAfter: number;
  powerBefore: number;
  powerAfter: number;
  guardPointsBefore: number;
  guardPointsAfter: number;
  dizzyPointsBefore: number;
  dizzyPointsAfter: number;
  redLifeBefore: number;
  redLifeAfter: 0;
};

export type RuntimeRoundResourceResetInput = {
  actors: readonly RuntimeRoundResourceActor[];
  mode: RuntimeTeamRoundMode;
  winnerId?: string;
  nextRoundNo?: number;
  preserveDefeated?: boolean;
};

export type RuntimeRoundResourceResetResult = {
  schema: typeof RUNTIME_ROUND_RESOURCE_RESET_SCHEMA;
  nextRoundNo: number;
  roundsExisted: number;
  states: RuntimeRoundResourceState[];
  diagnostics: string[];
};

/**
 * Models the resource handoff performed before IKEMEN's nextRound reset.
 * Red life is intentionally transient between rounds; power, guard, and dizzy
 * values are carried forward and bounded by the newly created actor state.
 */
export class RuntimeRoundResourceResetWorld {
  prepare(input: RuntimeRoundResourceResetInput): RuntimeRoundResourceResetResult {
    const diagnostics: string[] = [];
    const seenIds = new Set<string>();
    const states = input.actors.flatMap((actor) => {
      const actorId = actor.id.trim();
      if (!actorId) {
        diagnostics.push("invalid-actor-id");
        return [];
      }
      if (seenIds.has(actorId)) {
        diagnostics.push(`duplicate-actor:${actorId}`);
        return [];
      }
      seenIds.add(actorId);

      const lifeMax = positiveMax(actor.lifeMax, 1000);
      const powerMax = positiveMax(actor.powerMax, 3000);
      const guardPointsMax = positiveMax(actor.guardPointsMax, 1000);
      const dizzyPointsMax = positiveMax(actor.dizzyPointsMax, 1000);
      const lifeBefore = nonNegative(actor.life);
      const winnerSurvives = input.mode === "turns" && actorId === input.winnerId;
      const lifeAfter = winnerSurvives
        ? clamp(Math.max(1, lifeBefore), 1, lifeMax)
        : input.preserveDefeated && lifeBefore <= 0
          ? 0
        : lifeMax;

      return [{
        actorId,
        lifeBefore,
        lifeAfter,
        powerBefore: nonNegative(actor.power),
        powerAfter: clamp(actor.power, 0, powerMax),
        guardPointsBefore: nonNegative(actor.guardPoints),
        guardPointsAfter: clamp(actor.guardPoints, 0, guardPointsMax),
        dizzyPointsBefore: nonNegative(actor.dizzyPoints),
        dizzyPointsAfter: clamp(actor.dizzyPoints, 0, dizzyPointsMax),
        redLifeBefore: nonNegative(actor.redLife),
        redLifeAfter: 0,
      } satisfies RuntimeRoundResourceState];
    });

    const nextRoundNo = positiveInteger(input.nextRoundNo, 2);
    return {
      schema: RUNTIME_ROUND_RESOURCE_RESET_SCHEMA,
      nextRoundNo,
      roundsExisted: Math.max(0, nextRoundNo - 1),
      states,
      diagnostics: [...new Set(diagnostics)].sort(),
    };
  }
}

function positiveMax(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
}

function nonNegative(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, value!) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, nonNegative(value)));
}

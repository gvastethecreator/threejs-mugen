/**
 * RuntimeTurnsJourney/v1 (DA26-16 bounded).
 * Named Turns 1→2→3 journey: two replacements, resources, input seat, effects, residue-free end.
 * Claim blocked: full browser HUD product path for Turns teams.
 */

import {
  checksumRuntimeTurnsWorld,
  runRuntimeTurnsTransaction,
  type RuntimeTurnsActorSnapshot,
  type RuntimeTurnsTransactionResult,
  type RuntimeTurnsWorldSnapshot,
} from "./RuntimeTurnsTransaction";

export const RUNTIME_TURNS_JOURNEY_SCHEMA = "RuntimeTurnsJourney/v1" as const;

export type RuntimeTurnsJourneyStepId = "start" | "replace-1" | "replace-2" | "resolve";

export type RuntimeTurnsJourneyStep = {
  id: RuntimeTurnsJourneyStepId;
  tick: number;
  activeBySide: { 1: string; 2: string };
  resources: { lifeSum: number; powerSum: number };
  inputSeat: 1 | 2;
  effectsChecksum: string;
  worldChecksum: string;
  transaction?: RuntimeTurnsTransactionResult;
};

export type RuntimeTurnsJourneyReport = {
  schema: typeof RUNTIME_TURNS_JOURNEY_SCHEMA;
  steps: RuntimeTurnsJourneyStep[];
  replacements: number;
  residueFree: boolean;
  finalChecksum: string;
  diagnostics: string[];
  claims: {
    allowed: string[];
    blocked: string[];
  };
};

export type RuntimeTurnsJourneyTeam = {
  side: 1 | 2;
  /** Active first, then reserves in entry order. */
  members: Array<{ id: string; life: number; lifeMax: number; power: number }>;
};

export function createRuntimeTurnsJourneyWorld(
  teams: readonly RuntimeTurnsJourneyTeam[],
  tick = 0,
): RuntimeTurnsWorldSnapshot {
  const actors: RuntimeTurnsActorSnapshot[] = [];
  for (const team of teams) {
    team.members.forEach((member, index) => {
      actors.push({
        id: member.id,
        side: team.side,
        life: member.life,
        lifeMax: member.lifeMax,
        power: member.power,
        standby: index !== 0,
        overKo: member.life <= 0,
        stateNo: index === 0 ? 0 : 5900,
      });
    });
  }
  return {
    tick,
    roundNo: 1,
    effectsChecksum: "fx:start",
    actors,
  };
}

/**
 * Run two forced replacements on side 1 (or both sides if configured), then resolve.
 * Proves journey checksum stability and no residual active+KO doubles.
 */
export function runRuntimeTurnsJourney(input: {
  teams: readonly RuntimeTurnsJourneyTeam[];
  /** Which seat holds input across the journey. */
  inputSeat?: 1 | 2;
}): RuntimeTurnsJourneyReport {
  const diagnostics: string[] = [];
  const inputSeat = input.inputSeat ?? 1;
  let world = createRuntimeTurnsJourneyWorld(input.teams);
  const steps: RuntimeTurnsJourneyStep[] = [snapshotStep("start", world, inputSeat)];

  const replace = (
    stepId: "replace-1" | "replace-2",
    side: 1 | 2,
  ): boolean => {
    const { world: next, result } = runRuntimeTurnsTransaction({
      world,
      mutate: (current) => applyReplacement(current, side),
    });
    if (!result.applied) {
      diagnostics.push(`${stepId}:blocked:${result.diagnostics.join(",")}`);
      steps.push({
        ...snapshotStep(stepId, currentOr(world), inputSeat),
        transaction: result,
      });
      return false;
    }
    world = next;
    steps.push({
      ...snapshotStep(stepId, world, inputSeat),
      transaction: result,
    });
    return true;
  };

  const firstOk = replace("replace-1", 1);
  const secondOk = firstOk ? replace("replace-2", 1) : false;

  // Clear transient effects and force win pose residue check on resolve.
  const { world: resolved, result: resolveTx } = runRuntimeTurnsTransaction({
    world,
    mutate: (current) => ({
      ...current,
      tick: current.tick + 1,
      effectsChecksum: "fx:clear",
      actors: current.actors.map((actor) => {
        if (actor.overKo && !actor.standby) {
          return { ...actor, standby: true, stateNo: 5150 };
        }
        if (!actor.standby && actor.life > 0) {
          return { ...actor, stateNo: 180, power: Math.max(0, actor.power) };
        }
        return actor;
      }),
    }),
  });
  if (resolveTx.applied) {
    world = resolved;
  } else {
    diagnostics.push(`resolve:blocked:${resolveTx.diagnostics.join(",")}`);
  }
  steps.push({
    ...snapshotStep("resolve", world, inputSeat),
    transaction: resolveTx,
  });

  const residueFree = isResidueFree(world);
  if (!residueFree) diagnostics.push("residue:active-ko-or-effects");
  if (!firstOk || !secondOk) diagnostics.push("replacements-incomplete");

  return {
    schema: RUNTIME_TURNS_JOURNEY_SCHEMA,
    steps,
    replacements: steps.filter((step) => step.id.startsWith("replace-") && step.transaction?.applied).length,
    residueFree,
    finalChecksum: checksumRuntimeTurnsWorld(world),
    diagnostics,
    claims: {
      allowed: [
        "two sequential side-1 replacements under RuntimeTurnsTransaction",
        "resource sums and input seat recorded per step",
        "effects cleared on resolve with residue-free active set",
      ],
      blocked: [
        "browser Turns HUD journey with real team switch controls",
        "pause coverage during handoff",
        "score movement",
      ],
    },
  };
}

export function runtimeTurnsJourneyIsDeterministic(
  teams: readonly RuntimeTurnsJourneyTeam[],
): boolean {
  const a = runRuntimeTurnsJourney({ teams });
  const b = runRuntimeTurnsJourney({ teams });
  return a.finalChecksum === b.finalChecksum && a.replacements === b.replacements && a.residueFree === b.residueFree;
}

function applyReplacement(
  world: RuntimeTurnsWorldSnapshot,
  side: 1 | 2,
): RuntimeTurnsWorldSnapshot | { error: string } {
  const sideActors = world.actors.filter((actor) => actor.side === side);
  const active = sideActors.find((actor) => !actor.standby);
  const nextReserve = sideActors.find((actor) => actor.standby && !actor.overKo && actor.life > 0);
  if (!active) return { error: `no-active-side-${side}` };
  if (!nextReserve) return { error: `no-reserve-side-${side}` };

  return {
    tick: world.tick + 1,
    roundNo: world.roundNo,
    effectsChecksum: `fx:handoff:${active.id}->${nextReserve.id}`,
    actors: world.actors.map((actor) => {
      if (actor.id === active.id) {
        return {
          ...actor,
          standby: true,
          overKo: actor.life <= 0,
          stateNo: actor.life <= 0 ? 5150 : 0,
          power: 0,
        };
      }
      if (actor.id === nextReserve.id) {
        return {
          ...actor,
          standby: false,
          overKo: false,
          stateNo: 5900,
          power: Math.max(actor.power, 50),
        };
      }
      return actor;
    }),
  };
}

function snapshotStep(
  id: RuntimeTurnsJourneyStepId,
  world: RuntimeTurnsWorldSnapshot,
  inputSeat: 1 | 2,
): RuntimeTurnsJourneyStep {
  const active1 = world.actors.find((actor) => actor.side === 1 && !actor.standby)?.id ?? "";
  const active2 = world.actors.find((actor) => actor.side === 2 && !actor.standby)?.id ?? "";
  return {
    id,
    tick: world.tick,
    activeBySide: { 1: active1, 2: active2 },
    resources: {
      lifeSum: world.actors.reduce((sum, actor) => sum + actor.life, 0),
      powerSum: world.actors.reduce((sum, actor) => sum + actor.power, 0),
    },
    inputSeat,
    effectsChecksum: world.effectsChecksum,
    worldChecksum: checksumRuntimeTurnsWorld(world),
  };
}

function isResidueFree(world: RuntimeTurnsWorldSnapshot): boolean {
  if (world.effectsChecksum !== "fx:clear") return false;
  const activeKo = world.actors.some((actor) => !actor.standby && (actor.overKo || actor.life <= 0));
  if (activeKo) return false;
  for (const side of [1, 2] as const) {
    const actives = world.actors.filter((actor) => actor.side === side && !actor.standby);
    if (actives.length !== 1) return false;
  }
  return true;
}

function currentOr(world: RuntimeTurnsWorldSnapshot): RuntimeTurnsWorldSnapshot {
  return world;
}

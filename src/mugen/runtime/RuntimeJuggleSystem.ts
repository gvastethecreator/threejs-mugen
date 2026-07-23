import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { CharacterRuntimeState } from "./types";

export const DEFAULT_RUNTIME_AIR_JUGGLE_POINTS = 15;

export type RuntimeDirectJuggleActor = {
  id: string;
  definition: Pick<DemoFighterDefinition, "constants">;
  runtime: Pick<CharacterRuntimeState, "airJugglePoints" | "assertSpecial" | "hitFall">;
};

export type RuntimeDirectAirJuggleHitResult = {
  cost: number;
  remainingBefore: number;
  remainingAfter: number;
  charged: boolean;
  bypassed: boolean;
};

export function canRuntimeDirectAirJuggle(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
  move: DemoMove;
}): boolean {
  if (input.profile !== "ikemen-go" || !runtimeDirectDefenderIsFalling(input.defender.runtime)) {
    return true;
  }
  if (input.attacker.runtime.assertSpecial?.noJuggleCheck) {
    return true;
  }
  return runtimeAirJuggleCost(input.move) <= runtimeAirJuggleRemaining(input.defender, input.attacker.id);
}

export function applyRuntimeDirectAirJuggleHit(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
  move: DemoMove;
  targetWasFalling: boolean;
}): RuntimeDirectAirJuggleHitResult | undefined {
  if (input.profile !== "ikemen-go") {
    return undefined;
  }
  const cost = runtimeAirJuggleCost(input.move);
  const remainingBefore = runtimeAirJuggleRemaining(input.defender, input.attacker.id);
  const bypassed = input.attacker.runtime.assertSpecial?.noJuggleCheck === true;
  const charged = !bypassed && (input.targetWasFalling || input.defender.runtime.hitFall?.falling === true);
  const remainingAfter = charged ? remainingBefore - cost : remainingBefore;
  input.defender.runtime.airJugglePoints = {
    ...input.defender.runtime.airJugglePoints,
    [input.attacker.id]: remainingAfter,
  };
  return { cost, remainingBefore, remainingAfter, charged, bypassed };
}

export function runtimeAirJuggleCost(move: Pick<DemoMove, "airJuggle">): number {
  return runtimeFiniteInteger(move.airJuggle, 0);
}

export function runtimeAirJuggleBudget(defender: Pick<RuntimeDirectJuggleActor, "definition">): number {
  return runtimeFiniteInteger(defender.definition.constants?.["data.airjuggle"], DEFAULT_RUNTIME_AIR_JUGGLE_POINTS);
}

export function runtimeAirJuggleRemaining(defender: RuntimeDirectJuggleActor, attackerId: string): number {
  return runtimeFiniteInteger(
    defender.runtime.airJugglePoints?.[attackerId],
    runtimeAirJuggleBudget(defender),
  );
}

function runtimeFiniteInteger(value: number | undefined, fallback: number): number {
  return value === undefined || !Number.isFinite(value) ? fallback : Math.trunc(value);
}

function runtimeDirectDefenderIsFalling(state: Pick<CharacterRuntimeState, "moveType" | "hitFall">): boolean {
  return state.moveType === "H" && state.hitFall?.falling === true;
}

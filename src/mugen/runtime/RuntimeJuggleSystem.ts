import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import { runtimeHitTmpValue } from "./RuntimeHitTmpSystem";
import type { CharacterRuntimeState } from "./types";

export const DEFAULT_RUNTIME_AIR_JUGGLE_POINTS = 15;

/** Source of the active character juggle cost (`c.juggle`). */
export type RuntimeJuggleOrigin = "statedef" | "hitdef" | "reset" | "default";

export type RuntimeDirectJuggleActor = {
  id: string;
  definition: Pick<DemoFighterDefinition, "constants">;
  runtime: Partial<
    Pick<
      CharacterRuntimeState,
      "airJugglePoints" | "assertSpecial" | "hitFall" | "hitTmp" | "juggle" | "juggleOrigin" | "moveType"
    >
  >;
  inheritJuggle?: 1 | 2;
  juggleParent?: RuntimeDirectJuggleActor;
  juggleRoot?: RuntimeDirectJuggleActor;
};

export type RuntimeDirectAirJuggleHitResult = {
  cost: number;
  remainingBefore: number;
  remainingAfter: number;
  charged: boolean;
  bypassed: boolean;
  fallingContact: boolean;
  costOrigin: RuntimeJuggleOrigin | "move";
  activeJuggle: number | undefined;
};

export type RuntimeProjectileAirJuggleHitResult = {
  cost: number;
  remainingBefore: number;
  remainingAfter: number;
  charged: boolean;
  bypassed: boolean;
  fallingContact: boolean;
};

/** Copy an existing Parent/Root target budget to a Helper before admission. */
export function prepareRuntimeInheritedJugglePoints(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
}): boolean {
  if (input.profile !== "ikemen-go" || input.attacker.inheritJuggle === undefined) {
    return false;
  }
  if (input.defender.runtime.airJugglePoints?.[input.attacker.id] !== undefined) {
    return false;
  }
  const origin = input.attacker.inheritJuggle === 1
    ? input.attacker.juggleParent
    : input.attacker.juggleRoot;
  if (!origin) {
    return false;
  }
  const inherited = input.defender.runtime.airJugglePoints?.[origin.id];
  if (inherited === undefined) {
    return false;
  }
  input.defender.runtime.airJugglePoints = {
    ...input.defender.runtime.airJugglePoints,
    [input.attacker.id]: inherited,
  };
  return true;
}

/** Causal snapshot for one direct juggle admission or spend decision. */
export type RuntimeJuggleTrace = {
  attackerId: string;
  defenderId: string;
  profile?: RuntimeCompatibilityProfile;
  cost: number;
  costOrigin: RuntimeJuggleOrigin | "move";
  activeJuggle: number | undefined;
  remainingBefore: number;
  remainingAfter: number;
  charged: boolean;
  bypassed: boolean;
  fallingContact: boolean;
  airJuggleOnMove: number | undefined;
  admitted: boolean;
};

export function canRuntimeDirectAirJuggle(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
  move: DemoMove;
}): boolean {
  if (input.profile !== "ikemen-go" || runtimeHitTmpValue(input.defender.runtime) < 2) {
    return true;
  }
  if (input.attacker.runtime.assertSpecial?.noJuggleCheck) {
    return true;
  }
  return runtimeDirectAirJuggleCost(input.attacker, input.move) <= runtimeAirJuggleRemaining(input.defender, input.attacker.id);
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
  const costDecision = runtimeDirectAirJuggleCostDecision(input.attacker, input.move);
  const remainingBefore = runtimeAirJuggleRemaining(input.defender, input.attacker.id);
  const bypassed = input.attacker.runtime.assertSpecial?.noJuggleCheck === true;
  const fallingContact = input.targetWasFalling
    // The contact has just installed this HitDef's fall data; hittmp can still
    // carry the pre-contact idle value until the next fighter advance.
    || input.move.fall?.enabled === true
    || (input.defender.runtime.hitTmp === undefined && input.defender.runtime.hitFall?.falling === true)
    || runtimeHitTmpValue(input.defender.runtime) >= 2;
  const charged = !bypassed && fallingContact;
  const remainingAfter = charged ? remainingBefore - costDecision.cost : remainingBefore;
  input.defender.runtime.airJugglePoints = {
    ...input.defender.runtime.airJugglePoints,
    [input.attacker.id]: remainingAfter,
  };
  // Pin: juggle cost resets after falling contact even when NoJuggleCheck bypasses the spend.
  if (fallingContact) {
    input.attacker.runtime.juggle = 0;
    input.attacker.runtime.juggleOrigin = "reset";
  }
  return {
    cost: costDecision.cost,
    remainingBefore,
    remainingAfter,
    charged,
    bypassed,
    fallingContact,
    costOrigin: costDecision.origin,
    activeJuggle: input.attacker.runtime.juggle,
  };
}

/** IKEMEN projectile admission follows the source `hittmp < 2` branch. */
export function canRuntimeProjectileAirJuggle(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
  airJuggle: number;
  targetWasFalling?: boolean;
}): boolean {
  if (input.profile !== "ikemen-go" || input.attacker.runtime.assertSpecial?.noJuggleCheck) {
    return true;
  }
  if (runtimeHitTmpValue(input.defender.runtime) < 2) {
    return true;
  }
  return runtimeAirJuggleCost({ airJuggle: input.airJuggle }) <= runtimeAirJuggleRemaining(input.defender, input.attacker.id);
}

/** Spend projectile `HitDef air.juggle` points without resetting attacker `c.juggle`. */
export function applyRuntimeProjectileAirJuggleHit(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
  airJuggle: number;
  targetWasFalling: boolean;
}): RuntimeProjectileAirJuggleHitResult | undefined {
  if (input.profile !== "ikemen-go") {
    return undefined;
  }
  const cost = runtimeAirJuggleCost({ airJuggle: input.airJuggle });
  const remainingBefore = runtimeAirJuggleRemaining(input.defender, input.attacker.id);
  const bypassed = input.attacker.runtime.assertSpecial?.noJuggleCheck === true;
  const fallingContact = input.targetWasFalling
    || (input.defender.runtime.hitTmp === undefined && input.defender.runtime.hitFall?.falling === true)
    || runtimeHitTmpValue(input.defender.runtime) >= 2;
  const charged = !bypassed && fallingContact;
  const remainingAfter = charged ? remainingBefore - cost : remainingBefore;
  const tracked = input.defender.runtime.airJugglePoints?.[input.attacker.id] !== undefined;
  if (fallingContact || tracked) {
    input.defender.runtime.airJugglePoints = {
      ...input.defender.runtime.airJugglePoints,
      [input.attacker.id]: remainingAfter,
    };
  }
  return {
    cost,
    remainingBefore,
    remainingAfter,
    charged,
    bypassed,
    fallingContact,
  };
}

/**
 * Build a JuggleTrace/v1 decision record for admission or post-contact spend.
 * Does not mutate actors.
 */
export function buildRuntimeJuggleTrace(input: {
  profile?: RuntimeCompatibilityProfile;
  attacker: RuntimeDirectJuggleActor;
  defender: RuntimeDirectJuggleActor;
  move: DemoMove;
  targetWasFalling?: boolean;
  hitResult?: RuntimeDirectAirJuggleHitResult;
}): RuntimeJuggleTrace {
  const costDecision = runtimeDirectAirJuggleCostDecision(input.attacker, input.move);
  const remainingBefore = runtimeAirJuggleRemaining(input.defender, input.attacker.id);
  const bypassed = input.attacker.runtime.assertSpecial?.noJuggleCheck === true;
  const fallingContact =
    input.hitResult?.fallingContact ??
    (input.targetWasFalling === true
      || input.move.fall?.enabled === true
      || (input.defender.runtime.hitTmp === undefined && input.defender.runtime.hitFall?.falling === true)
      || runtimeHitTmpValue(input.defender.runtime) >= 2);
  const admitted = canRuntimeDirectAirJuggle({
    profile: input.profile,
    attacker: input.attacker,
    defender: input.defender,
    move: input.move,
  });
  if (input.hitResult) {
    return {
      attackerId: input.attacker.id,
      defenderId: input.defender.id,
      profile: input.profile,
      cost: input.hitResult.cost,
      costOrigin: input.hitResult.costOrigin,
      activeJuggle: input.hitResult.activeJuggle,
      remainingBefore: input.hitResult.remainingBefore,
      remainingAfter: input.hitResult.remainingAfter,
      charged: input.hitResult.charged,
      bypassed: input.hitResult.bypassed,
      fallingContact: input.hitResult.fallingContact,
      airJuggleOnMove: input.move.airJuggle,
      admitted: true,
    };
  }
  return {
    attackerId: input.attacker.id,
    defenderId: input.defender.id,
    profile: input.profile,
    cost: costDecision.cost,
    costOrigin: costDecision.origin,
    activeJuggle: input.attacker.runtime.juggle,
    remainingBefore,
    remainingAfter: remainingBefore,
    charged: false,
    bypassed,
    fallingContact,
    airJuggleOnMove: input.move.airJuggle,
    admitted,
  };
}

export function runtimeAirJuggleCost(move: Pick<DemoMove, "airJuggle">): number {
  return runtimeFiniteInteger(move.airJuggle, 0);
}

/**
 * Active direct cost (`c.juggle`) for IKEMEN contacts.
 * Prefers armed character juggle (including post-contact 0). Falls back to the
 * static move field only when the character cost was never armed (demo/static path).
 */
export function runtimeDirectAirJuggleCost(
  attacker: Pick<RuntimeDirectJuggleActor, "runtime">,
  move: Pick<DemoMove, "airJuggle">,
): number {
  return runtimeDirectAirJuggleCostDecision(attacker, move).cost;
}

export function runtimeDirectAirJuggleCostDecision(
  attacker: Pick<RuntimeDirectJuggleActor, "runtime">,
  move: Pick<DemoMove, "airJuggle">,
): { cost: number; origin: RuntimeJuggleOrigin | "move" } {
  if (attacker.runtime.juggle !== undefined) {
    const cost = attacker.runtime.moveType === "A" ? runtimeFiniteInteger(attacker.runtime.juggle, 0) : 0;
    return {
      cost,
      origin: attacker.runtime.juggleOrigin ?? "default",
    };
  }
  return { cost: runtimeAirJuggleCost(move), origin: "move" };
}

/**
 * Apply StateDef `juggle` on state entry.
 * Present value always arms the active cost (pin bytecode).
 * Omitted value under IKEMEN non-A clears the active cost; attack states inherit.
 * MUGEN and unknown profiles leave the prior cost when omitted.
 */
export function applyRuntimeStateDefJuggle(
  state: Pick<CharacterRuntimeState, "moveType" | "juggle" | "juggleOrigin">,
  value: number | undefined,
  profile?: RuntimeCompatibilityProfile,
): void {
  if (value !== undefined) {
    state.juggle = runtimeFiniteInteger(value, 0);
    state.juggleOrigin = "statedef";
    return;
  }
  if (profile === "ikemen-go" && state.moveType !== "A") {
    state.juggle = 0;
    state.juggleOrigin = "reset";
  }
}

/**
 * Apply HitDef `air.juggle` to the active character cost when the field is present.
 * Omitted fields leave the prior active cost (pin: only explicit non-projectile IKEMEN values update `c.juggle`).
 * Pass `profile: "ikemen-go"` from runtime; omit profile only in pure unit tests that already gate the path.
 */
export function applyRuntimeHitDefJuggle(
  state: Pick<CharacterRuntimeState, "juggle" | "juggleOrigin">,
  value: number | undefined,
  options?: { profile?: RuntimeCompatibilityProfile },
): void {
  if (value === undefined) {
    return;
  }
  if (options?.profile !== undefined && options.profile !== "ikemen-go") {
    return;
  }
  state.juggle = runtimeFiniteInteger(value, 0);
  state.juggleOrigin = "hitdef";
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

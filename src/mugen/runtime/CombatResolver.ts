import type { CollisionBox } from "../model/CollisionBox";
import type { CharacterRuntimeState, RuntimeAssertSpecial, RuntimeHitBySlot, RuntimeHitOverrideSlot } from "./types";

export type RuntimeCombatAttack = {
  damage: number;
  attr?: string;
  hitPause: number;
  hitStun: number;
  push: number;
  hitVelocityY?: number;
  guardDistance?: number;
  guardFlag?: string;
  guardDamage?: number;
  guardPause?: number;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guardPush?: number;
  guardVelocityY?: number;
};

export type RuntimeCombatHitResult =
  | {
      kind: "guard";
      damage: number;
      pause: number;
      stun: number;
      slideTime?: number;
      controlTime?: number;
      push: number;
      hitVelocityY?: number;
      powerGain: number;
    }
  | {
      kind: "hit";
      damage: number;
      pause: number;
      stun: number;
      push: number;
      hitVelocityY?: number;
      powerGain: number;
    };

export const DEFAULT_RUNTIME_GUARD_DISTANCE = 96;

export function runtimeWorldBox(actor: Pick<CharacterRuntimeState, "pos" | "facing">, box: CollisionBox): CollisionBox {
  if (actor.facing === 1) {
    return {
      x1: actor.pos.x + box.x1,
      x2: actor.pos.x + box.x2,
      y1: actor.pos.y + box.y1,
      y2: actor.pos.y + box.y2,
    };
  }
  return {
    x1: actor.pos.x - box.x2,
    x2: actor.pos.x - box.x1,
    y1: actor.pos.y + box.y1,
    y2: actor.pos.y + box.y2,
  };
}

export function collisionBoxesIntersect(a: CollisionBox, b: CollisionBox): boolean {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

export function hasRuntimeBoxContact(
  attackBox: CollisionBox,
  defender: Pick<CharacterRuntimeState, "pos" | "facing">,
  hurtBoxes: CollisionBox[],
): boolean {
  return hurtBoxes.some((hurtBox) => collisionBoxesIntersect(attackBox, runtimeWorldBox(defender, hurtBox)));
}

export function hasRuntimeGuardDistance(
  attacker: Pick<CharacterRuntimeState, "pos" | "facing">,
  attackBox: CollisionBox,
  defender: Pick<CharacterRuntimeState, "pos" | "facing">,
  hurtBoxes: CollisionBox[],
  guardDistance = DEFAULT_RUNTIME_GUARD_DISTANCE,
): boolean {
  const worldAttackBox = runtimeWorldBox(attacker, attackBox);
  const expandedAttackBox = {
    ...worldAttackBox,
    x1: worldAttackBox.x1 - Math.max(0, guardDistance),
    x2: worldAttackBox.x2 + Math.max(0, guardDistance),
  };
  return hasRuntimeBoxContact(expandedAttackBox, defender, hurtBoxes);
}

export function canRuntimeBeHitBy(defender: Pick<CharacterRuntimeState, "hitBy">, attackAttr: string): boolean {
  const slots = [defender.hitBy?.slot1, defender.hitBy?.slot2].filter(
    (slot): slot is RuntimeHitBySlot => slot !== undefined && slot.remaining !== 0,
  );
  for (const slot of slots) {
    const matches = hitAttributeMatches(slot.attr, attackAttr);
    if (slot.mode === "deny" && matches) {
      return false;
    }
    if (slot.mode === "allow" && !matches) {
      return false;
    }
  }
  return true;
}

export function findRuntimeHitOverride(
  defender: Pick<CharacterRuntimeState, "hitOverrides">,
  attackAttr: string,
): RuntimeHitOverrideSlot | undefined {
  return defender.hitOverrides?.find((slot) => slot.remaining !== 0 && hitAttributeMatches(slot.attr, attackAttr));
}

export function resolveRuntimeCombatHit(input: {
  attacker: Pick<CharacterRuntimeState, "attackMultiplier" | "assertSpecial">;
  defender: Pick<CharacterRuntimeState, "defenseMultiplier" | "stateType" | "moveType" | "assertSpecial">;
  attack: RuntimeCombatAttack;
  holdingBack: boolean;
}): RuntimeCombatHitResult {
  if (
    isRuntimeGuarding(input.holdingBack, input.defender.moveType, input.defender.stateType, input.attack.guardFlag ?? "MA", {
      defenderAssertSpecial: input.defender.assertSpecial,
      attackUnguardable: input.attacker.assertSpecial?.unguardable,
    })
  ) {
    const pause = input.attack.guardPause ?? Math.max(1, Math.round(input.attack.hitPause * 0.75));
    const stun = input.attack.guardStun ?? Math.max(1, Math.round(input.attack.hitStun * 0.55));
    const push = input.attack.guardPush ?? Math.max(1, Math.round(input.attack.push * 0.55));
    return {
      kind: "guard",
      damage: scaleRuntimeIncomingDamage(
        input.defender,
        scaleRuntimeOutgoingDamage(input.attacker, input.attack.guardDamage ?? 0),
      ),
      pause,
      stun,
      slideTime: input.attack.guardSlideTime,
      controlTime: input.attack.guardControlTime,
      push,
      hitVelocityY: input.attack.guardVelocityY,
      powerGain: 12,
    };
  }

  return {
    kind: "hit",
    damage: scaleRuntimeIncomingDamage(input.defender, scaleRuntimeOutgoingDamage(input.attacker, input.attack.damage)),
    pause: input.attack.hitPause,
    stun: input.attack.hitStun,
    push: input.attack.push,
    hitVelocityY: input.attack.hitVelocityY,
    powerGain: 35,
  };
}

export function isRuntimeGuarding(
  holdingBack: boolean,
  moveType: CharacterRuntimeState["moveType"],
  stateType: CharacterRuntimeState["stateType"],
  guardFlag: string,
  options: { defenderAssertSpecial?: RuntimeAssertSpecial; attackUnguardable?: boolean } = {},
): boolean {
  if (!holdingBack || moveType === "H" || options.attackUnguardable) {
    return false;
  }
  if (guardRestrictedByAssertSpecial(stateType, options.defenderAssertSpecial)) {
    return false;
  }
  return guardFlagAllowsState(guardFlag, stateType);
}

export function hitAttributeMatches(filter: string, attackAttr: string): boolean {
  const filterParts = parseHitAttribute(filter);
  const attackParts = parseHitAttribute(attackAttr);
  if (filterParts.states.size > 0 && ![...attackParts.states].some((state) => filterParts.states.has(state))) {
    return false;
  }
  if (filterParts.types.size === 0) {
    return true;
  }
  return [...attackParts.types].some(
    (attackType) =>
      filterParts.types.has(attackType) ||
      [...filterParts.types].some((filterType) => filterType.length === 2 && filterType[1] === attackType[1]),
  );
}

export function parseHitAttribute(value: string): { states: Set<string>; types: Set<string> } {
  const parts = value
    .toUpperCase()
    .split(",")
    .map((part) => part.trim())
    .map((part) => part.replace(/\s+/g, ""));
  const states = new Set<string>();
  const types = new Set<string>();
  const first = parts[0] ?? "";
  if (first) {
    const stateLetters = first.replace(/[^SCA]/g, "");
    for (const letter of stateLetters) {
      states.add(letter);
    }
    if (stateLetters.length === 0) {
      types.add(first);
    }
  }
  for (const part of parts.slice(1)) {
    if (!part) {
      continue;
    }
    types.add(part);
  }
  return { states, types };
}

export function scaleRuntimeIncomingDamage(
  defender: Pick<CharacterRuntimeState, "defenseMultiplier">,
  damage: number,
): number {
  return Math.max(0, Math.round(damage * (defender.defenseMultiplier ?? 1)));
}

export function scaleRuntimeOutgoingDamage(
  attacker: Pick<CharacterRuntimeState, "attackMultiplier">,
  damage: number,
): number {
  return Math.max(0, Math.round(damage * (attacker.attackMultiplier ?? 1)));
}

function guardFlagAllowsState(guardFlag: string, stateType: CharacterRuntimeState["stateType"]): boolean {
  const upper = guardFlag.toUpperCase();
  if (stateType === "S") {
    return upper.includes("H") || upper.includes("M");
  }
  if (stateType === "C") {
    return upper.includes("L") || upper.includes("M");
  }
  if (stateType === "A") {
    return upper.includes("A");
  }
  return false;
}

function guardRestrictedByAssertSpecial(
  stateType: CharacterRuntimeState["stateType"],
  assertSpecial: RuntimeAssertSpecial | undefined,
): boolean {
  if (!assertSpecial) {
    return false;
  }
  if (stateType === "S") {
    return assertSpecial.noStandGuard === true;
  }
  if (stateType === "C") {
    return assertSpecial.noCrouchGuard === true;
  }
  if (stateType === "A") {
    return assertSpecial.noAirGuard === true;
  }
  return false;
}

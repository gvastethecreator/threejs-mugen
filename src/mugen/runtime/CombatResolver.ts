import type { CollisionBox } from "../model/CollisionBox";
import type { CharacterRuntimeState, RuntimeAssertSpecial, RuntimeHitBySlot, RuntimeHitOverrideSlot } from "./types";

export type RuntimeCombatAttack = {
  damage: number;
  guardPoints?: number;
  dizzyPoints?: number;
  redLife?: number;
  guardRedLife?: number;
  kill?: boolean;
  attr?: string;
  hitPause: number;
  hitStun: number;
  push: number;
  hitVelocityY?: number;
  guardDistance?: number;
  guardFlag?: string;
  guardDamage?: number;
  guardKill?: boolean;
  guardPause?: number;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guardPush?: number;
  guardVelocityY?: number;
  airGuardPush?: number;
  airGuardVelocityY?: number;
  cornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
};

export type RuntimeCombatHitResult =
  | {
      kind: "guard";
      damage: number;
      guardPoints?: number;
      redLife?: number;
      kill: boolean;
      pause: number;
      stun: number;
      slideTime?: number;
      controlTime?: number;
      push: number;
      hitVelocityY?: number;
      cornerPush?: number;
      powerGain: number;
    }
  | {
      kind: "hit";
      damage: number;
      dizzyPoints?: number;
      redLife?: number;
      kill: boolean;
      pause: number;
      stun: number;
      push: number;
      hitVelocityY?: number;
      cornerPush?: number;
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

export function hasRuntimeHitFlag(hitFlag: string | undefined, expectedFlag: string): boolean {
  const normalizedExpected = expectedFlag.trim().toUpperCase();
  if (!hitFlag || !normalizedExpected) return false;
  return hitFlag.split(",").some((token) => token.trim().toUpperCase() === normalizedExpected);
}

export function canRuntimeHitFallenTarget(input: {
  attacker: Pick<CharacterRuntimeState, "assertSpecial">;
  defender: Pick<CharacterRuntimeState, "moveType" | "hitFall">;
  hitFlag?: string;
}): boolean {
  if (
    input.hitFlag === undefined
    || input.defender.moveType !== "H"
    || input.defender.hitFall?.falling !== true
  ) {
    return true;
  }
  return hasRuntimeHitFlag(input.hitFlag, "F") && input.attacker.assertSpecial?.noFallHitFlag !== true;
}

export function findRuntimeHitOverride(
  defender: Pick<CharacterRuntimeState, "hitOverrides">,
  attackAttr: string,
  attackGuardFlag = "MA",
): RuntimeHitOverrideSlot | undefined {
  return defender.hitOverrides?.reduce<RuntimeHitOverrideSlot | undefined>((best, slot) => {
    if (
      slot.remaining === 0 ||
      !hitAttributeMatches(slot.attr, attackAttr) ||
      !hitOverrideGuardFlagsMatch(slot, attackGuardFlag)
    ) {
      return best;
    }
    if (!best || slot.slot < best.slot) {
      return slot;
    }
    return best;
  }, undefined);
}

export function resolveRuntimeCombatHit(input: {
  attacker: Pick<CharacterRuntimeState, "attackMultiplier" | "dizzyPointsAttackMultiplier" | "assertSpecial">;
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
    const isAirGuard = input.defender.stateType === "A";
    const push =
      (isAirGuard ? input.attack.airGuardPush : undefined) ??
      input.attack.guardPush ??
      Math.max(1, Math.round(input.attack.push * 0.55));
    const hitVelocityY = (isAirGuard ? input.attack.airGuardVelocityY : undefined) ?? input.attack.guardVelocityY;
    const cornerPush = (isAirGuard ? input.attack.airGuardCornerPush : undefined) ?? input.attack.guardCornerPush;
    return {
      kind: "guard",
      damage: scaleRuntimeIncomingDamage(
        input.defender,
        scaleRuntimeOutgoingDamage(input.attacker, input.attack.guardDamage ?? 0),
      ),
      ...(input.attack.guardPoints === undefined
        ? {}
        : { guardPoints: scaleRuntimeIncomingAmount(input.defender, scaleRuntimeOutgoingAmount(input.attacker, input.attack.guardPoints)) }),
      ...(input.attack.guardRedLife === undefined
        ? {}
        : { redLife: scaleRuntimeIncomingAmount(input.defender, scaleRuntimeOutgoingDamage(input.attacker, input.attack.guardRedLife)) }),
      kill: input.attack.guardKill ?? true,
      pause,
      stun,
      slideTime: input.attack.guardSlideTime,
      controlTime: input.attack.guardControlTime,
      push,
      hitVelocityY,
      cornerPush,
      powerGain: 12,
    };
  }

  const isAirHit = input.defender.stateType === "A";
  const isDownHit = input.defender.stateType === "L";
  return {
    kind: "hit",
    damage: scaleRuntimeIncomingDamage(input.defender, scaleRuntimeOutgoingDamage(input.attacker, input.attack.damage)),
    ...(input.attack.dizzyPoints === undefined || input.defender.assertSpecial?.noDizzyPointsDamage === true
      ? {}
      : {
          dizzyPoints: scaleRuntimeIncomingAmount(
            input.defender,
            scaleRuntimeOutgoingDizzyPoints(input.attacker, input.attack.dizzyPoints),
          ),
        }),
    ...(input.attack.redLife === undefined
      ? {}
      : { redLife: scaleRuntimeIncomingAmount(input.defender, scaleRuntimeOutgoingDamage(input.attacker, input.attack.redLife)) }),
    kill: input.attack.kill ?? true,
    pause: input.attack.hitPause,
    stun: input.attack.hitStun,
    push: input.attack.push,
    hitVelocityY: input.attack.hitVelocityY,
    cornerPush:
      (isDownHit ? input.attack.downCornerPush : undefined) ??
      (isAirHit ? input.attack.airCornerPush : undefined) ??
      input.attack.cornerPush,
    powerGain: 35,
  };
}

export function applyRuntimeDamage(life: number, damage: number, canKill = true): number {
  if (life <= 0) {
    return 0;
  }
  const floor = canKill ? 0 : 1;
  return Math.max(floor, life - Math.max(0, damage));
}

export function canRuntimeDamageKill(
  target: Pick<CharacterRuntimeState, "assertSpecial">,
  canKill = true,
): boolean {
  return canKill && target.assertSpecial?.noKo !== true;
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
  defender: Pick<CharacterRuntimeState, "defenseMultiplier" | "superPauseDefenseMultiplier" | "fallDefenseMultiplier">,
  damage: number,
): number {
  return Math.max(0, scaleRuntimeIncomingAmount(defender, damage));
}

export function scaleRuntimeIncomingAmount(
  defender: Pick<CharacterRuntimeState, "defenseMultiplier" | "superPauseDefenseMultiplier" | "fallDefenseMultiplier">,
  amount: number,
): number {
  return Math.round(
    amount *
      (defender.defenseMultiplier ?? 1) *
      (defender.superPauseDefenseMultiplier ?? 1) *
      (defender.fallDefenseMultiplier ?? 1),
  );
}

export function scaleRuntimeOutgoingDamage(
  attacker: Pick<CharacterRuntimeState, "attackMultiplier">,
  damage: number,
): number {
  return Math.max(0, scaleRuntimeOutgoingAmount(attacker, damage));
}

export function scaleRuntimeOutgoingAmount(
  attacker: Pick<CharacterRuntimeState, "attackMultiplier">,
  amount: number,
): number {
  return Math.round(amount * (attacker.attackMultiplier ?? 1));
}

export function scaleRuntimeOutgoingDizzyPoints(
  attacker: Pick<CharacterRuntimeState, "attackMultiplier" | "dizzyPointsAttackMultiplier">,
  amount: number,
): number {
  return Math.round(amount * (attacker.dizzyPointsAttackMultiplier ?? attacker.attackMultiplier ?? 1));
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

function hitOverrideGuardFlagsMatch(slot: RuntimeHitOverrideSlot, attackGuardFlag: string): boolean {
  if (slot.guardFlag && !guardFlagOverlaps(slot.guardFlag, attackGuardFlag)) {
    return false;
  }
  if (slot.guardFlagNot && guardFlagOverlaps(slot.guardFlagNot, attackGuardFlag)) {
    return false;
  }
  return true;
}

function guardFlagOverlaps(filter: string, attackGuardFlag: string): boolean {
  const filterFlags = normalizeGuardFlagSet(filter);
  const attackFlags = normalizeGuardFlagSet(attackGuardFlag);
  return [...filterFlags].some((flag) => attackFlags.has(flag));
}

function normalizeGuardFlagSet(value: string): Set<"H" | "L" | "A"> {
  const flags = new Set<"H" | "L" | "A">();
  for (const char of value.toUpperCase()) {
    if (char === "M") {
      flags.add("H");
      flags.add("L");
    } else if (char === "H" || char === "L" || char === "A") {
      flags.add(char);
    }
  }
  return flags;
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

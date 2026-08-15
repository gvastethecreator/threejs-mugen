import type { CollisionBox } from "../model/CollisionBox";
import type {
  CharacterRuntimeState,
  RuntimeAssertSpecial,
  RuntimeHitBySlot,
  RuntimeHitOverrideSlot,
  RuntimeHitVelocityMetadata,
} from "./types";
import type { RuntimeCollisionBox } from "./RuntimeCollisionTransformSystem";
import { runtimeHitTmpValue } from "./RuntimeHitTmpSystem";

export type RuntimeCombatAttack = {
  damage: number;
  guardPoints?: number;
  /** Projectile-created AttackMulSet guardpoints snapshot; direct moves use attacker state. */
  guardPointsAttackMultiplier?: number;
  dizzyPoints?: number;
  /** Projectile-created AttackMulSet dizzypoints snapshot; direct moves use attacker state. */
  dizzyPointsAttackMultiplier?: number;
  /** Projectile-created AttackMulSet red-life snapshot; direct moves use attacker state. */
  redLifeAttackMultiplier?: number;
  redLife?: number;
  guardRedLife?: number;
  kill?: boolean;
  attr?: string;
  hitPause: number;
  /** Defender-side HitDef pausetime component; omitted preserves legacy scalar pause. */
  hitShakeTime?: number;
  hitStun: number;
  airHitTime?: number;
  /** M.U.G.E.N down.hittime for a lying defender. */
  downHitTime?: number;
  /** Effective down.velocity Y; non-zero values transition the hit into air. */
  downVelocityY?: number;
  /** Authored down.velocity X for a lying defender; applied in attacker-relative coordinates. */
  downVelocityX?: number;
  /** Authored down.velocity Z for a lying defender. */
  downVelocityZ?: number;
  /** M.U.G.E.N down.bounce metadata carried to the hit-fall path. */
  downBounce?: boolean;
  /** M.U.G.E.N fall flag. Air hit time does not drive a falling reaction. */
  fall?: {
    enabled: boolean;
    airFall?: boolean;
  };
  push: number;
  hitVelocityY?: number;
  /** Ground HitDef velocity Z. */
  hitVelocityZ?: number;
  /** Air HitDef velocity X/Y, selected for airborne defenders. */
  airVelocityX?: number;
  airVelocityY?: number;
  /** Air HitDef velocity Z, selected for airborne defenders. */
  airVelocityZ?: number;
  /** Effective direct-HitDef vectors; Projectile adapters intentionally omit this metadata seam. */
  hitVelocities?: RuntimeHitVelocityMetadata;
  guardDistance?: number;
  guardFlag?: string;
  guardDamage?: number;
  guardKill?: boolean;
  guardPause?: number;
  /** Defender-side guard.pausetime component; omitted preserves legacy scalar guard pause. */
  guardShakeTime?: number;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
  guardPush?: number;
  guardVelocityY?: number;
  guardVelocityZ?: number;
  airGuardPush?: number;
  airGuardVelocityY?: number;
  airGuardVelocityZ?: number;
  cornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
};

/** Bounded direct guard-distance envelope used by Ikemen HitDef extensions. */
export type RuntimeGuardDistanceBounds = {
  width: [number, number];
  height: [number, number];
  depth: [number, number];
};

export type RuntimeCombatHitResult =
  | {
      kind: "guard";
      damage: number;
      guardPoints?: number;
      redLife?: number;
      kill: boolean;
      pause: number;
      /** Attacker-side pause when the authored pair differs from defender shaketime. */
      attackerPause?: number;
      stun: number;
      slideTime?: number;
      controlTime?: number;
      push: number;
      hitVelocityY?: number;
      hitVelocityZ?: number;
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
      /** Attacker-side pause when the authored pair differs from defender shaketime. */
      attackerPause?: number;
      stun: number;
      push: number;
      hitVelocityX?: number;
      hitVelocityY?: number;
      hitVelocityZ?: number;
      cornerPush?: number;
      powerGain: number;
    };

export const DEFAULT_RUNTIME_GUARD_DISTANCE = 96;

/**
 * M.U.G.E.N's fall.recover defaults are applied only when the HitDef actually
 * enables the fall path. Explicit values, including recover=0, remain intact.
 */
export const DEFAULT_RUNTIME_FALL_RECOVER_TIME = 4;

/** M.U.G.E.N's omitted 240p fall.yvelocity baseline. */
export const DEFAULT_RUNTIME_FALL_Y_VELOCITY = -4.5;

/**
 * Resolve the documented omitted fall.yvelocity for a player's localcoord.
 * M.U.G.E.N documents a width-scaled 240p/480p/720p sequence (-4.5/-9/-18).
 */
export function resolveRuntimeFallYVelocityDefaults(
  localCoord?: readonly [number, number],
): number {
  const width = localCoord?.[0];
  if (width === undefined || !Number.isFinite(width) || width <= 0) {
    return DEFAULT_RUNTIME_FALL_Y_VELOCITY;
  }
  return DEFAULT_RUNTIME_FALL_Y_VELOCITY * (width / 320);
}

export function resolveRuntimeFallRecoveryDefaults(input: {
  enabled?: boolean;
  recover?: boolean;
  recoverTime?: number;
}): { recover?: boolean; recoverTime?: number } {
  const recover = input.enabled === true && input.recover === undefined
    ? true
    : input.recover;
  return {
    recover,
    recoverTime:
      input.enabled === true && recover === true && input.recoverTime === undefined
        ? DEFAULT_RUNTIME_FALL_RECOVER_TIME
        : input.recoverTime,
  };
}

/**
 * Resolves the effective M.U.G.E.N fall flag for the defender's current state.
 * `air.fall` is an airborne-only override; omitted air.fall follows the base fall flag.
 */
export function resolveRuntimeFallEnabled(
  fall: { enabled?: boolean; airFall?: boolean } | undefined,
  defenderStateType: CharacterRuntimeState["stateType"],
): boolean {
  return fall?.enabled === true || (defenderStateType === "A" && fall?.airFall === true);
}

export function runtimeWorldBox(
  actor: Pick<CharacterRuntimeState, "pos" | "facing"> & Partial<Pick<CharacterRuntimeState, "clsnAngle">>,
  box: RuntimeCollisionBox,
): RuntimeCollisionBox {
  if (box.coordinateSpace === "world") {
    return box.runtimeRotation
      ? { ...box, runtimeRotation: { ...box.runtimeRotation } }
      : { ...box };
  }
  const worldBox = actor.facing === 1
    ? {
        x1: actor.pos.x + box.x1,
        x2: actor.pos.x + box.x2,
        y1: actor.pos.y + box.y1,
        y2: actor.pos.y + box.y2,
      }
    : {
        x1: actor.pos.x - box.x2,
        x2: actor.pos.x - box.x1,
        y1: actor.pos.y + box.y1,
      y2: actor.pos.y + box.y2,
      };
  if (box.collisionTransformDisabled || actor.clsnAngle === undefined || actor.clsnAngle === 0) {
    return box.runtimeRotation
      ? { ...worldBox, runtimeRotation: { ...box.runtimeRotation } }
      : worldBox;
  }
  return {
    ...worldBox,
    runtimeRotation: {
      angle: -((actor.clsnAngle * actor.facing) * Math.PI) / 180,
      pivotX: actor.pos.x,
      pivotY: actor.pos.y,
    },
  };
}

export function collisionBoxesIntersect(a: CollisionBox, b: CollisionBox): boolean {
  const left = a as RuntimeCollisionBox;
  const right = b as RuntimeCollisionBox;
  if (left.runtimeRotation || right.runtimeRotation) {
    return rotatedCollisionBoxesIntersect(left, right);
  }
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

function rotatedCollisionBoxesIntersect(a: RuntimeCollisionBox, b: RuntimeCollisionBox): boolean {
  const left = collisionBoxCorners(a);
  const right = collisionBoxCorners(b);
  const axes = [...collisionBoxAxes(left), ...collisionBoxAxes(right)];
  return axes.every((axis) => {
    const leftRange = projectCollisionCorners(left, axis);
    const rightRange = projectCollisionCorners(right, axis);
    return leftRange.max >= rightRange.min && rightRange.max >= leftRange.min;
  });
}

function collisionBoxCorners(box: RuntimeCollisionBox): Array<{ x: number; y: number }> {
  const corners = [
    { x: box.x1, y: box.y1 },
    { x: box.x2, y: box.y1 },
    { x: box.x2, y: box.y2 },
    { x: box.x1, y: box.y2 },
  ];
  const rotation = box.runtimeRotation;
  if (!rotation) return corners;
  const cosine = Math.cos(rotation.angle);
  const sine = Math.sin(rotation.angle);
  return corners.map((corner) => {
    const dx = corner.x - rotation.pivotX;
    const dy = corner.y - rotation.pivotY;
    return {
      x: cosine * dx - sine * dy + rotation.pivotX,
      y: sine * dx + cosine * dy + rotation.pivotY,
    };
  });
}

function collisionBoxAxes(corners: readonly { x: number; y: number }[]): Array<{ x: number; y: number }> {
  return corners.map((corner, index) => {
    const next = corners[(index + 1) % corners.length]!;
    const edgeX = next.x - corner.x;
    const edgeY = next.y - corner.y;
    return { x: -edgeY, y: edgeX };
  });
}

function projectCollisionCorners(
  corners: readonly { x: number; y: number }[],
  axis: { x: number; y: number },
): { min: number; max: number } {
  const values = corners.map((corner) => corner.x * axis.x + corner.y * axis.y);
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function hasRuntimeBoxContact(
  attackBox: CollisionBox,
  defender: Pick<CharacterRuntimeState, "pos" | "facing">,
  hurtBoxes: CollisionBox[],
): boolean {
  return hurtBoxes.some((hurtBox) => collisionBoxesIntersect(attackBox, runtimeWorldBox(defender, hurtBox)));
}

export function hasRuntimeGuardDistance(
  attacker: Pick<CharacterRuntimeState, "pos" | "facing" | "combatDepth">,
  attackBox: CollisionBox,
  defender: Pick<CharacterRuntimeState, "pos" | "facing" | "combatDepth">,
  hurtBoxes: CollisionBox[],
  guardDistance = DEFAULT_RUNTIME_GUARD_DISTANCE,
  guardDistanceBounds?: RuntimeGuardDistanceBounds,
): boolean {
  const worldAttackBox = runtimeWorldBox(attacker, attackBox);
  if (guardDistanceBounds !== undefined) {
    const [frontWidth, backWidth] = guardDistanceBounds.width.map((value) => Math.max(0, value)) as [number, number];
    const [lowerHeight, upperHeight] = guardDistanceBounds.height.map((value) => Math.max(0, value)) as [number, number];
    const [backDepth, frontDepth] = guardDistanceBounds.depth.map((value) => Math.max(0, value)) as [number, number];
    const expandedAttackBox = {
      ...worldAttackBox,
      x1: worldAttackBox.x1 - (attacker.facing === 1 ? backWidth : frontWidth),
      x2: worldAttackBox.x2 + (attacker.facing === 1 ? frontWidth : backWidth),
      y1: worldAttackBox.y1 - lowerHeight,
      y2: worldAttackBox.y2 + upperHeight,
    };
    const distanceZ = (defender.combatDepth?.position ?? 0) - (attacker.combatDepth?.position ?? 0);
    const inDepth = distanceZ === 0 || (distanceZ > -backDepth && distanceZ < frontDepth);
    return inDepth && hasRuntimeBoxContact(expandedAttackBox, defender, hurtBoxes);
  }
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
  return hitFlag
    .toUpperCase()
    .split(/[\s,]+/)
    .some((token) => token.includes(normalizedExpected));
}

export type RuntimeHitFlagRejectionReason =
  | "state-type-hitflag-rejected"
  | "fall-hitflag-rejected"
  | "minus-hitflag-rejected"
  | "plus-hitflag-rejected";

type RuntimeHitFlagDefender = Pick<CharacterRuntimeState, "moveType" | "hitFall">
  & Partial<Pick<CharacterRuntimeState, "hitTmp" | "stateNo" | "guarding" | "stateType">>;

export function runtimeHitFlagRejectionReason(input: {
  attacker: Pick<CharacterRuntimeState, "assertSpecial">;
  defender: RuntimeHitFlagDefender;
  hitFlag?: string;
}): RuntimeHitFlagRejectionReason | undefined {
  if (input.hitFlag === undefined) return undefined;

  if (input.defender.stateType !== undefined && !runtimeHitFlagAllowsStateType(input.hitFlag, input.defender.stateType)) {
    return "state-type-hitflag-rejected";
  }
  const hitTmp = runtimeHitTmpValue(input.defender);
  if (hitTmp >= 2 && (!hasRuntimeHitFlag(input.hitFlag, "F") || input.attacker.assertSpecial?.noFallHitFlag === true)) {
    return "fall-hitflag-rejected";
  }
  if (hasRuntimeHitFlag(input.hitFlag, "-") && hitTmp > 0) {
    return "minus-hitflag-rejected";
  }
  if (
    hasRuntimeHitFlag(input.hitFlag, "+")
    && (hitTmp <= 0 || isRuntimeHitFlagGuardState(input.defender))
  ) {
    return "plus-hitflag-rejected";
  }
  return undefined;
}

export function canRuntimeHitByHitFlag(input: {
  attacker: Pick<CharacterRuntimeState, "assertSpecial">;
  defender: RuntimeHitFlagDefender;
  hitFlag?: string;
}): boolean {
  return runtimeHitFlagRejectionReason(input) === undefined;
}

export function canRuntimeHitFallenTarget(input: {
  attacker: Pick<CharacterRuntimeState, "assertSpecial">;
  defender: Pick<CharacterRuntimeState, "moveType" | "hitFall">;
  hitFlag?: string;
}): boolean {
  return canRuntimeHitByHitFlag({
    ...input,
    defender: input.defender,
  });
}

function isRuntimeHitFlagGuardState(defender: RuntimeHitFlagDefender): boolean {
  if (defender.guarding === true) return true;
  const stateNo = defender.stateNo ?? 0;
  return stateNo === 120
    || (stateNo >= 130 && stateNo <= 132)
    || stateNo === 140
    || (stateNo >= 150 && stateNo <= 155);
}

function runtimeHitFlagAllowsStateType(
  hitFlag: string,
  stateType: CharacterRuntimeState["stateType"],
): boolean {
  if (stateType === "S") return hasRuntimeHitFlag(hitFlag, "H") || hasRuntimeHitFlag(hitFlag, "M");
  if (stateType === "C") return hasRuntimeHitFlag(hitFlag, "L") || hasRuntimeHitFlag(hitFlag, "M");
  if (stateType === "A") return hasRuntimeHitFlag(hitFlag, "A");
  return hasRuntimeHitFlag(hitFlag, "D");
}

export type RuntimeHitOverrideMatchOptions = {
  attackStateType?: CharacterRuntimeState["stateType"];
  attackUnguardable?: boolean;
};

export function findRuntimeHitOverride(
  defender: Pick<CharacterRuntimeState, "hitOverrides">,
  attackAttr: string,
  attackGuardFlag = "MA",
  options: RuntimeHitOverrideMatchOptions = {},
): RuntimeHitOverrideSlot | undefined {
  return defender.hitOverrides?.reduce<RuntimeHitOverrideSlot | undefined>((best, slot) => {
    if (
      slot.remaining === 0 ||
      !hitOverrideAttributeMatches(slot.attr, attackAttr, options.attackStateType) ||
      !hitOverrideGuardFlagsMatch(slot, attackGuardFlag, options.attackUnguardable)
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
  attacker: Pick<CharacterRuntimeState, "attackMultiplier" | "dizzyPointsAttackMultiplier" | "guardPointsAttackMultiplier" | "redLifeAttackMultiplier" | "assertSpecial">;
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
    const attackerPause = input.attack.guardPause ?? Math.max(1, Math.round(input.attack.hitPause * 0.75));
    const pause = input.attack.guardShakeTime ?? attackerPause;
    const stun = input.attack.guardStun ?? Math.max(1, Math.round(input.attack.hitStun * 0.55));
    const isAirGuard = input.defender.stateType === "A";
    const push =
      (isAirGuard ? input.attack.airGuardPush : undefined) ??
      input.attack.guardPush ??
      Math.max(1, Math.round(input.attack.push * 0.55));
    const hitVelocityY = (isAirGuard ? input.attack.airGuardVelocityY : undefined) ?? input.attack.guardVelocityY;
    const hitVelocityZ = (isAirGuard ? input.attack.airGuardVelocityZ : undefined) ?? input.attack.guardVelocityZ;
    const cornerPush = (isAirGuard ? input.attack.airGuardCornerPush : undefined) ?? input.attack.guardCornerPush;
    return {
      kind: "guard",
      damage: scaleRuntimeIncomingDamage(
        input.defender,
        scaleRuntimeOutgoingDamage(input.attacker, input.attack.guardDamage ?? 0),
      ),
      ...(input.attack.guardPoints === undefined
        ? {}
        : {
            guardPoints: scaleRuntimeIncomingAmount(
              input.defender,
              scaleRuntimeOutgoingGuardPoints(
                input.attacker,
                input.attack.guardPoints,
                input.attack.guardPointsAttackMultiplier,
              ),
            ),
          }),
      ...(input.attack.guardRedLife === undefined
        ? {}
        : {
            redLife: scaleRuntimeIncomingAmount(
              input.defender,
              scaleRuntimeOutgoingRedLife(input.attacker, input.attack.guardRedLife, input.attack.redLifeAttackMultiplier),
            ),
          }),
      kill: input.attack.guardKill ?? true,
      pause,
      ...(pause === attackerPause ? {} : { attackerPause }),
      stun,
      slideTime: input.attack.guardSlideTime,
      controlTime: (isAirGuard ? input.attack.airGuardControlTime : undefined) ?? input.attack.guardControlTime,
      push,
      hitVelocityY,
      hitVelocityZ,
      cornerPush,
      powerGain: 12,
    };
  }

  const isAirHit = input.defender.stateType === "A";
  const isDownHit = input.defender.stateType === "L";
  const usesDownHitTime = isDownHit && (input.attack.downVelocityY ?? 0) === 0;
  const usesAirHitTime =
    (isAirHit || (isDownHit && !usesDownHitTime)) &&
    !resolveRuntimeFallEnabled(input.attack.fall, input.defender.stateType);
  const directAirVelocity = input.attack.hitVelocities?.air;
  const airVelocityX = directAirVelocity?.x ?? input.attack.airVelocityX;
  const airVelocityY = directAirVelocity?.y ?? input.attack.airVelocityY;
  const airVelocityZ = directAirVelocity?.z ?? input.attack.airVelocityZ;
  const pause = input.attack.hitShakeTime ?? input.attack.hitPause;
  return {
    kind: "hit",
    damage: scaleRuntimeIncomingDamage(input.defender, scaleRuntimeOutgoingDamage(input.attacker, input.attack.damage)),
    ...(input.attack.dizzyPoints === undefined || input.defender.assertSpecial?.noDizzyPointsDamage === true
      ? {}
      : {
          dizzyPoints: scaleRuntimeIncomingAmount(
            input.defender,
            scaleRuntimeOutgoingDizzyPoints(
              input.attacker,
              input.attack.dizzyPoints,
              input.attack.dizzyPointsAttackMultiplier,
            ),
          ),
        }),
    ...(input.attack.redLife === undefined
      ? {}
      : {
          redLife: scaleRuntimeIncomingAmount(
            input.defender,
            scaleRuntimeOutgoingRedLife(input.attacker, input.attack.redLife, input.attack.redLifeAttackMultiplier),
          ),
        }),
    kill: input.attack.kill ?? true,
    pause,
    ...(pause === input.attack.hitPause ? {} : { attackerPause: input.attack.hitPause }),
    stun: usesDownHitTime
      ? input.attack.downHitTime ?? 20
      : usesAirHitTime
        ? input.attack.airHitTime ?? 20
        : input.attack.hitStun,
    push: isAirHit ? Math.abs(airVelocityX ?? input.attack.push) : input.attack.push,
    ...((isDownHit ? input.attack.downVelocityX : isAirHit ? airVelocityX : undefined) === undefined
      ? {}
      : { hitVelocityX: isDownHit ? input.attack.downVelocityX : airVelocityX }),
    hitVelocityY: isDownHit
      ? input.attack.downVelocityY ?? input.attack.hitVelocityY
      : isAirHit
        ? airVelocityY ?? input.attack.hitVelocityY
        : input.attack.hitVelocityY,
    hitVelocityZ: isDownHit
      ? input.attack.downVelocityZ ?? input.attack.airVelocityZ ?? input.attack.hitVelocityZ
      : isAirHit
        ? airVelocityZ ?? input.attack.hitVelocityZ
        : input.attack.hitVelocityZ,
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
  return hitAttributeTypesMatch(filterParts.types, attackParts.types);
}

function hitOverrideAttributeMatches(
  filter: string,
  attackAttr: string,
  attackStateType: CharacterRuntimeState["stateType"] | undefined,
): boolean {
  if (attackStateType === undefined) {
    return hitAttributeMatches(filter, attackAttr);
  }
  const filterParts = parseHitAttribute(filter);
  const attackParts = parseHitAttribute(attackAttr);
  if (filterParts.states.size > 0 && !filterParts.states.has(attackStateType)) {
    return false;
  }
  return hitAttributeTypesMatch(filterParts.types, attackParts.types);
}

function hitAttributeTypesMatch(filterTypes: Set<string>, attackTypes: Set<string>): boolean {
  if (filterTypes.size === 0) {
    return true;
  }
  return [...attackTypes].some(
    (attackType) =>
      filterTypes.has(attackType) ||
      [...filterTypes].some((filterType) => filterType.length === 2 && filterType[1] === attackType[1]),
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
  snapshot?: number,
): number {
  return Math.round(amount * (snapshot ?? attacker.dizzyPointsAttackMultiplier ?? attacker.attackMultiplier ?? 1));
}

export function scaleRuntimeOutgoingGuardPoints(
  attacker: Pick<CharacterRuntimeState, "attackMultiplier" | "guardPointsAttackMultiplier">,
  amount: number,
  snapshot?: number,
): number {
  return Math.round(amount * (snapshot ?? attacker.guardPointsAttackMultiplier ?? attacker.attackMultiplier ?? 1));
}

export function scaleRuntimeOutgoingRedLife(
  attacker: Pick<CharacterRuntimeState, "attackMultiplier" | "redLifeAttackMultiplier">,
  amount: number,
  snapshot?: number,
): number {
  return Math.max(0, Math.round(amount * (snapshot ?? attacker.redLifeAttackMultiplier ?? attacker.attackMultiplier ?? 1)));
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

function hitOverrideGuardFlagsMatch(
  slot: RuntimeHitOverrideSlot,
  attackGuardFlag: string,
  attackUnguardable = false,
): boolean {
  if (slot.guardFlag && (attackUnguardable || !runtimeGuardFlagOverlaps(slot.guardFlag, attackGuardFlag))) {
    return false;
  }
  if (slot.guardFlagNot && !attackUnguardable && runtimeGuardFlagOverlaps(slot.guardFlagNot, attackGuardFlag)) {
    return false;
  }
  return true;
}

export function runtimeGuardFlagOverlaps(filter: string, attackGuardFlag: string): boolean {
  return runtimeHitFlagOverlaps(filter, attackGuardFlag);
}

export function runtimeGuardFlagComparison(
  filter: string,
  attackGuardFlag: string,
  operator: "=" | "!=",
): boolean {
  return runtimeHitFlagComparison(filter, attackGuardFlag, operator);
}

/**
 * Ikemen's GetHitVar(hitflag) compares the last HitDef hitflag against a
 * documented flag filter. The same M/H/L expansion and +/- markers used by
 * guardflag matching apply to this read-only predicate.
 */
export function runtimeHitFlagOverlaps(filter: string, attackHitFlag: string): boolean {
  return runtimeHitFlagComparison(filter, attackHitFlag, "=");
}

export function runtimeHitFlagComparison(
  filter: string,
  attackHitFlag: string,
  operator: "=" | "!=",
): boolean {
  const filterFlags = normalizeGuardFlagSet(filter);
  const attackFlags = normalizeGuardFlagSet(attackHitFlag);
  return operator === "="
    ? [...attackFlags].some((flag) => filterFlags.has(flag))
    : [...attackFlags].some((flag) => !filterFlags.has(flag));
}

export function runtimeHitAttributeComparison(
  filter: string,
  attackAttr: string,
  operator: "=" | "!=",
): boolean {
  const filterParts = parseHitAttribute(filter);
  const attackParts = parseHitAttribute(attackAttr);
  const filterTypes = expandRuntimeHitAttributeTypes(filterParts.types);
  const attackTypes = expandRuntimeHitAttributeTypes(attackParts.types);
  if (operator === "=") {
    return [...attackParts.states].some((state) => filterParts.states.has(state))
      && [...attackTypes].some((type) => filterTypes.has(type));
  }
  return [...attackParts.states].some((state) => !filterParts.states.has(state))
    && [...attackTypes].some((type) => !filterTypes.has(type));
}

function expandRuntimeHitAttributeTypes(types: Set<string>): Set<string> {
  const expanded = new Set<string>();
  for (const type of types) {
    if (type === "N") {
      expanded.add("NA");
      expanded.add("NT");
      expanded.add("NP");
    } else if (type === "S") {
      expanded.add("SA");
      expanded.add("ST");
      expanded.add("SP");
    } else if (type === "H" || type === "A") {
      expanded.add("HA");
      expanded.add("HT");
      expanded.add("HP");
    } else {
      expanded.add(type);
    }
  }
  return expanded;
}

function normalizeGuardFlagSet(value: string): Set<string> {
  const flags = new Set<string>();
  for (const char of value.toUpperCase()) {
    if (char === "M") {
      flags.add("H");
      flags.add("L");
    } else if (char === "H" || char === "L" || char === "A" || char === "F" || char === "D" || char === "P" || char === "-" || char === "+") {
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

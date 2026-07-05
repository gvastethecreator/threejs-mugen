import { describe, expect, it } from "vitest";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  hasRuntimeGuardDistance,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  isRuntimeGuarding,
  parseHitAttribute,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
  scaleRuntimeIncomingDamage,
  scaleRuntimeOutgoingDamage,
} from "../mugen/runtime/CombatResolver";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("CombatResolver", () => {
  it("projects runtime boxes with facing-aware mirroring", () => {
    expect(runtimeWorldBox(actor({ pos: { x: 100, y: -20 }, facing: 1 }), { x1: -8, y1: -40, x2: 24, y2: -10 })).toEqual({
      x1: 92,
      x2: 124,
      y1: -60,
      y2: -30,
    });

    expect(runtimeWorldBox(actor({ pos: { x: 100, y: -20 }, facing: -1 }), { x1: -8, y1: -40, x2: 24, y2: -10 })).toEqual({
      x1: 76,
      x2: 108,
      y1: -60,
      y2: -30,
    });
  });

  it("checks projected hitbox contact against defender hurtboxes", () => {
    const attackBox = { x1: 10, y1: -40, x2: 40, y2: -10 };
    const defender = actor({ pos: { x: 45, y: 0 }, facing: -1 });

    expect(collisionBoxesIntersect(attackBox, { x1: 35, y1: -30, x2: 50, y2: -5 })).toBe(true);
    expect(collisionBoxesIntersect(attackBox, { x1: 40, y1: -30, x2: 50, y2: -5 })).toBe(false);
    expect(hasRuntimeBoxContact(attackBox, defender, [{ x1: 0, y1: -32, x2: 20, y2: -4 }])).toBe(true);
    expect(hasRuntimeBoxContact(attackBox, defender, [{ x1: -30, y1: -32, x2: -12, y2: -4 }])).toBe(false);
  });

  it("checks bounded guard distance without requiring hitbox contact", () => {
    const attacker = actor({ pos: { x: -95, y: 0 }, facing: 1 });
    const defender = actor({ pos: { x: 95, y: 0 }, facing: -1 });
    const hitbox = { x1: 12, y1: -70, x2: 76, y2: -35 };
    const hurtbox = { x1: -20, y1: -80, x2: 20, y2: 0 };
    const worldAttackBox = runtimeWorldBox(attacker, hitbox);

    expect(hasRuntimeBoxContact(worldAttackBox, defender, [hurtbox])).toBe(false);
    expect(hasRuntimeGuardDistance(attacker, hitbox, defender, [hurtbox], 96)).toBe(true);
    expect(hasRuntimeGuardDistance(attacker, hitbox, defender, [hurtbox], 40)).toBe(false);
  });

  it("parses and matches broad MUGEN hit attribute filters", () => {
    expect(parseHitAttribute("S, NA, SA")).toEqual({
      states: new Set(["S"]),
      types: new Set(["NA", "SA"]),
    });
    expect(hitAttributeMatches("S,NA", "S,SA")).toBe(true);
    expect(hitAttributeMatches("S,NA", "A,SA")).toBe(false);
    expect(hitAttributeMatches("SCA,NP", "C,SP")).toBe(true);
    expect(hitAttributeMatches("A,NT", "S,NA")).toBe(false);
  });

  it("applies HitBy and NotHitBy slots without mutating runtime state", () => {
    expect(canRuntimeBeHitBy(actor({ hitBy: { slot1: { mode: "deny", attr: "S,NA", remaining: 8 } } }), "S,NA")).toBe(false);
    expect(canRuntimeBeHitBy(actor({ hitBy: { slot1: { mode: "allow", attr: "S,NA", remaining: 8 } } }), "A,NA")).toBe(false);
    expect(canRuntimeBeHitBy(actor({ hitBy: { slot1: { mode: "allow", attr: "S,NA", remaining: 0 } } }), "A,NA")).toBe(true);
  });

  it("finds active hit overrides by attribute", () => {
    const defender = actor({
      hitOverrides: [
        { slot: 1, attr: "A,NA", stateNo: 1200, remaining: 12 },
        { slot: 2, attr: "S,SA", stateNo: 1300, remaining: 0 },
      ],
    });

    expect(findRuntimeHitOverride(defender, "A,SA")).toMatchObject({ slot: 1, stateNo: 1200 });
    expect(findRuntimeHitOverride(defender, "S,SA")).toBeUndefined();
  });

  it("chooses the lowest matching HitOverride slot even when storage order is unsorted", () => {
    const defender = actor({
      hitOverrides: [
        { slot: 5, attr: "S,NA", stateNo: 779, remaining: 12 },
        { slot: 2, attr: "S,NA", stateNo: 778, remaining: 12 },
        { slot: 1, attr: "A,NA", stateNo: 777, remaining: 12 },
      ],
    });

    expect(findRuntimeHitOverride(defender, "S,NA")).toMatchObject({ slot: 2, stateNo: 778 });
  });

  it("filters HitOverride slots by incoming HitDef guard flags before slot priority", () => {
    const defender = actor({
      hitOverrides: [
        { slot: 1, attr: "S,NA", stateNo: 776, remaining: 12, guardFlagNot: "HA" },
        { slot: 2, attr: "S,NA", stateNo: 778, remaining: 12, guardFlag: "A" },
        { slot: 5, attr: "S,NA", stateNo: 779, remaining: 12, guardFlag: "H" },
      ],
    });

    expect(findRuntimeHitOverride(defender, "S,NA", "H")).toMatchObject({ slot: 5, stateNo: 779 });
    expect(findRuntimeHitOverride(defender, "S,NA", "A")).toMatchObject({ slot: 2, stateNo: 778 });
    expect(findRuntimeHitOverride(defender, "S,NA", "L")).toMatchObject({ slot: 1, stateNo: 776 });
  });

  it("resolves scaled hit and guard results", () => {
    const attacker = actor({ attackMultiplier: 1.5 });
    const defender = actor({ defenseMultiplier: 0.5, stateType: "S", moveType: "I" });
    const attack = {
      damage: 40,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      hitVelocityY: -2,
      guardFlag: "MA",
      guardDamage: 10,
      guardPause: 4,
      guardStun: 7,
      guardSlideTime: 5,
      guardControlTime: 6,
      guardPush: 5,
      guardVelocityY: -1,
      airGuardPush: 9,
      airGuardVelocityY: -3,
      cornerPush: 13,
      guardCornerPush: 6,
      airGuardCornerPush: 10,
    };

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: false })).toEqual({
      kind: "hit",
      damage: 30,
      pause: 8,
      stun: 20,
      push: 12,
      hitVelocityY: -2,
      cornerPush: 13,
      powerGain: 35,
      kill: true,
    });

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: true })).toEqual({
      kind: "guard",
      damage: 8,
      pause: 4,
      stun: 7,
      slideTime: 5,
      controlTime: 6,
      push: 5,
      hitVelocityY: -1,
      cornerPush: 6,
      powerGain: 12,
      kill: true,
    });
  });

  it("uses explicit air guard velocity only for airborne guards", () => {
    const attack = {
      damage: 40,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      guardFlag: "MA",
      guardDamage: 10,
      guardPush: 5,
      guardVelocityY: -1,
      airGuardPush: 9,
      airGuardVelocityY: -3,
      guardCornerPush: 6,
      airGuardCornerPush: 10,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "A", moveType: "I" }),
        attack,
        holdingBack: true,
      }),
    ).toMatchObject({ kind: "guard", push: 9, hitVelocityY: -3, cornerPush: 10 });

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "S", moveType: "I" }),
        attack,
        holdingBack: true,
      }),
    ).toMatchObject({ kind: "guard", push: 5, hitVelocityY: -1, cornerPush: 6 });
  });

  it("uses aerial cornerpush only for airborne hits", () => {
    const attack = {
      damage: 40,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      cornerPush: 5,
      airCornerPush: 8,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "A" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", cornerPush: 8 });

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "S" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", cornerPush: 5 });
  });

  it("keeps guard eligibility and damage scaling helpers isolated", () => {
    expect(isRuntimeGuarding(true, "I", "S", "MA")).toBe(true);
    expect(isRuntimeGuarding(true, "I", "C", "H")).toBe(false);
    expect(isRuntimeGuarding(true, "H", "S", "MA")).toBe(false);
    expect(isRuntimeGuarding(true, "I", "S", "MA", { defenderAssertSpecial: { flags: ["nostandguard"], globalFlags: [], noStandGuard: true } })).toBe(false);
    expect(isRuntimeGuarding(true, "I", "C", "MA", { defenderAssertSpecial: { flags: ["nocrouchguard"], globalFlags: [], noCrouchGuard: true } })).toBe(false);
    expect(isRuntimeGuarding(true, "I", "A", "A", { defenderAssertSpecial: { flags: ["noairguard"], globalFlags: [], noAirGuard: true } })).toBe(false);
    expect(isRuntimeGuarding(true, "I", "S", "MA", { attackUnguardable: true })).toBe(false);
    expect(scaleRuntimeOutgoingDamage(actor({ attackMultiplier: 1.25 }), 20)).toBe(25);
    expect(scaleRuntimeIncomingDamage(actor({ defenseMultiplier: 0.75 }), 20)).toBe(15);
  });

  it("resolves AssertSpecial guard restrictions before applying guard damage", () => {
    const attack = {
      damage: 40,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      guardFlag: "MA",
      guardDamage: 10,
      guardPause: 4,
      guardStun: 7,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "S", assertSpecial: { flags: ["nostandguard"], globalFlags: [], noStandGuard: true } }),
        attack,
        holdingBack: true,
      }),
    ).toMatchObject({ kind: "hit", damage: 40 });

    expect(
      resolveRuntimeCombatHit({
        attacker: actor({ assertSpecial: { flags: ["unguardable"], globalFlags: [], unguardable: true } }),
        defender: actor({ stateType: "S" }),
        attack,
        holdingBack: true,
      }),
    ).toMatchObject({ kind: "hit", damage: 40 });
  });
});

function actor(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

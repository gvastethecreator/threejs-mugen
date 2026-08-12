import { describe, expect, it } from "vitest";
import {
  canRuntimeBeHitBy,
  canRuntimeHitFallenTarget,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  hasRuntimeGuardDistance,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  isRuntimeGuarding,
  parseHitAttribute,
  resolveRuntimeCombatHit,
  resolveRuntimeFallEnabled,
  resolveRuntimeFallYVelocityDefaults,
  resolveRuntimeFallRecoveryDefaults,
  runtimeHitFlagRejectionReason,
  runtimeWorldBox,
  scaleRuntimeIncomingDamage,
  scaleRuntimeOutgoingDamage,
} from "../mugen/runtime/CombatResolver";
import type { RuntimeCollisionBox } from "../mugen/runtime/RuntimeCollisionTransformSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("CombatResolver", () => {
  it("applies official fall recovery defaults only to enabled fall paths", () => {
    expect(resolveRuntimeFallRecoveryDefaults({ enabled: true })).toEqual({ recover: true, recoverTime: 4 });
    expect(resolveRuntimeFallRecoveryDefaults({ enabled: true, recover: false })).toEqual({ recover: false, recoverTime: undefined });
    expect(resolveRuntimeFallRecoveryDefaults({ enabled: true, recover: true, recoverTime: 9 })).toEqual({ recover: true, recoverTime: 9 });
    expect(resolveRuntimeFallRecoveryDefaults({ enabled: false })).toEqual({ recover: undefined, recoverTime: undefined });
    expect(resolveRuntimeFallRecoveryDefaults({ enabled: false, recover: true })).toEqual({ recover: true, recoverTime: undefined });
  });

  it("keeps air.fall airborne-only while preserving the base fall flag", () => {
    expect(resolveRuntimeFallEnabled({ enabled: false, airFall: true }, "S")).toBe(false);
    expect(resolveRuntimeFallEnabled({ enabled: false, airFall: true }, "A")).toBe(true);
    expect(resolveRuntimeFallEnabled({ enabled: true, airFall: false }, "S")).toBe(true);
  });

  it("scales omitted fall y velocity from the official localcoord baseline", () => {
    expect(resolveRuntimeFallYVelocityDefaults()).toBe(-4.5);
    expect(resolveRuntimeFallYVelocityDefaults([320, 240])).toBe(-4.5);
    expect(resolveRuntimeFallYVelocityDefaults([640, 480])).toBe(-9);
    expect(resolveRuntimeFallYVelocityDefaults([1280, 720])).toBe(-18);
    expect(resolveRuntimeFallYVelocityDefaults([0, 240])).toBe(-4.5);
    expect(resolveRuntimeFallYVelocityDefaults([Number.NaN, 240])).toBe(-4.5);
  });

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

  it("checks rotated collision boxes around the actor origin", () => {
    const attacker = actor({ pos: { x: 0, y: 0 }, facing: 1, clsnAngle: 90 });
    const defender = actor({ pos: { x: -5, y: -5 }, facing: 1 });
    const attack = { x1: 0, y1: -10, x2: 10, y2: 0 };
    const hurt = { x1: -2, y1: -2, x2: 2, y2: 2 };

    expect(hasRuntimeBoxContact(runtimeWorldBox(attacker, attack), defender, [hurt])).toBe(true);
    expect(hasRuntimeBoxContact(runtimeWorldBox({ ...attacker, clsnAngle: 0 }, attack), defender, [hurt])).toBe(false);
  });

  it("keeps size collision boxes unrotated", () => {
    expect(runtimeWorldBox(
      actor({ pos: { x: 10, y: -20 }, facing: 1, clsnAngle: 90 }),
      { x1: -8, y1: -40, x2: 24, y2: -10, collisionTransformDisabled: true },
    )).toEqual({
      x1: 2,
      x2: 34,
      y1: -60,
      y2: -30,
    });
  });

  it("preserves a world-space proxy box across a root collision transform", () => {
    const defender = actor({ pos: { x: 300, y: 0 }, facing: -1, clsnAngle: 45 });
    const proxyBox: RuntimeCollisionBox = {
      x1: 110,
      y1: -10,
      x2: 130,
      y2: 10,
      coordinateSpace: "world",
      runtimeRotation: {
        angle: Math.PI / 2,
        pivotX: 120,
        pivotY: 0,
      },
    };

    expect(runtimeWorldBox(defender, proxyBox)).toEqual(proxyBox);
    expect(hasRuntimeBoxContact({ x1: 115, y1: -5, x2: 125, y2: 5 }, defender, [proxyBox])).toBe(true);
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

  it("checks direct guard.dist width, height, and depth envelopes", () => {
    const attacker = actor({ pos: { x: 0, y: 0 }, facing: 1, combatDepth: { position: 0, velocity: 0, size: [0, 0], attack: [0, 0] } });
    const defender = actor({ pos: { x: 118, y: 30 }, facing: -1, combatDepth: { position: 4, velocity: 0, size: [0, 0], attack: [0, 0] } });
    const hitbox = { x1: 20, y1: -60, x2: 40, y2: -20 };
    const hurtbox = { x1: -10, y1: -50, x2: 10, y2: 0 };
    const bounds = {
      width: [90, 12] as [number, number],
      height: [25, 15] as [number, number],
      depth: [8, 6] as [number, number],
    };

    expect(hasRuntimeGuardDistance(attacker, hitbox, defender, [hurtbox], 0, bounds)).toBe(true);
    expect(hasRuntimeGuardDistance(attacker, hitbox, { ...defender, pos: { x: 145, y: 30 } }, [hurtbox], 0, bounds)).toBe(false);
    expect(hasRuntimeGuardDistance(attacker, hitbox, { ...defender, pos: { x: 118, y: 47 } }, [hurtbox], 0, bounds)).toBe(false);
    expect(hasRuntimeGuardDistance(attacker, hitbox, { ...defender, combatDepth: { ...defender.combatDepth!, position: 11 } }, [hurtbox], 0, bounds)).toBe(false);
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

  it("applies the bounded F and NoFallHitFlag predicate only to falling targets", () => {
    const falling = actor({ moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } });
    const attacker = actor();

    expect(canRuntimeHitFallenTarget({ attacker, defender: falling, hitFlag: "H, L, A" })).toBe(false);
    expect(canRuntimeHitFallenTarget({ attacker, defender: falling, hitFlag: "H, L, A, F" })).toBe(true);
    expect(canRuntimeHitFallenTarget({
      attacker: { ...attacker, assertSpecial: { flags: ["nofallhitflag"], globalFlags: [], noFallHitFlag: true } },
      defender: falling,
      hitFlag: "H,L,A,F",
    })).toBe(false);
    expect(canRuntimeHitFallenTarget({ attacker, defender: falling })).toBe(true);
    expect(canRuntimeHitFallenTarget({ attacker, defender: actor(), hitFlag: "H,L,A" })).toBe(true);
  });

  it("projects explicit compact plus and minus hitflags over the bounded hittmp model", () => {
    const attacker = actor();
    const idle = actor({ stateNo: 0, moveType: "I" });
    const gettingHit = actor({ stateNo: 5000, moveType: "H" });
    const guarded = actor({ stateNo: 150, moveType: "H", guarding: true });

    expect(runtimeHitFlagRejectionReason({ attacker, defender: idle, hitFlag: "H+" })).toBe("plus-hitflag-rejected");
    expect(runtimeHitFlagRejectionReason({ attacker, defender: gettingHit, hitFlag: "H+" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: guarded, hitFlag: "H+" })).toBe("plus-hitflag-rejected");
    expect(runtimeHitFlagRejectionReason({ attacker, defender: gettingHit, hitFlag: "H-" })).toBe("minus-hitflag-rejected");
    expect(runtimeHitFlagRejectionReason({ attacker, defender: idle, hitFlag: "H-" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: gettingHit, hitFlag: "HLAF" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: gettingHit, hitFlag: "H, L, A" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: idle })).toBeUndefined();
  });

  it("prefers materialized hittmp over the compatibility fallback", () => {
    const attacker = actor();
    expect(runtimeHitFlagRejectionReason({
      attacker,
      defender: actor({ moveType: "H", hitFall: { falling: true, damage: 0, velocity: { y: 0 } }, hitTmp: 1 }),
      hitFlag: "H+",
    })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({
      attacker,
      defender: actor({ moveType: "I", hitFall: { falling: true, damage: 0, velocity: { y: 0 } }, hitTmp: 2 }),
      hitFlag: "H, L, A",
    })).toBe("fall-hitflag-rejected");
  });

  it("matches explicit HitFlag state types before the fall and chain filters", () => {
    const attacker = actor();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "S" }), hitFlag: "L" }))
      .toBe("state-type-hitflag-rejected");
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "C" }), hitFlag: "M" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "A" }), hitFlag: "H" }))
      .toBe("state-type-hitflag-rejected");
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "A" }), hitFlag: "A" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "L" }), hitFlag: "A" }))
      .toBe("state-type-hitflag-rejected");
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "L" }), hitFlag: "D" })).toBeUndefined();
    expect(runtimeHitFlagRejectionReason({ attacker, defender: actor({ stateType: "C" }), hitFlag: "H,L,A,F" })).toBeUndefined();
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

  it("uses the ReversalDef owner's state and inherited guard payload for HitOverride matching", () => {
    const defender = actor({
      hitOverrides: [
        { slot: 1, attr: "S,SP", stateNo: 776, remaining: 12, guardFlag: "A" },
        { slot: 2, attr: "S,SP", stateNo: 778, remaining: 12, guardFlagNot: "A" },
      ],
    });

    expect(findRuntimeHitOverride(defender, "A,SP", "A", { attackStateType: "S" })).toMatchObject({ slot: 1, stateNo: 776 });
    expect(findRuntimeHitOverride(defender, "A,SP", "A", { attackStateType: "A" })).toBeUndefined();
    expect(findRuntimeHitOverride(defender, "A,SP", "A", {
      attackStateType: "S",
      attackUnguardable: true,
    })).toMatchObject({ slot: 2, stateNo: 778 });
  });

  it("resolves scaled hit and guard results", () => {
    const attacker = actor({ attackMultiplier: 1.5 });
    const defender = actor({ defenseMultiplier: 0.5, stateType: "S", moveType: "I" });
    const attack = {
      damage: 40,
      dizzyPoints: 20,
      hitPause: 8,
      hitShakeTime: 11,
      hitStun: 20,
      push: 12,
      hitVelocityY: -2,
      hitVelocityZ: 1.5,
      airVelocityZ: 2.5,
      guardFlag: "MA",
      guardDamage: 10,
      guardPoints: -20,
      guardPause: 4,
      guardShakeTime: 9,
      guardStun: 7,
      guardSlideTime: 5,
      guardControlTime: 6,
      guardPush: 5,
      guardVelocityY: -1,
      guardVelocityZ: 3,
      airGuardPush: 9,
      airGuardVelocityY: -3,
      airGuardVelocityZ: 4,
      cornerPush: 13,
      guardCornerPush: 6,
      airGuardCornerPush: 10,
    };

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: false })).toEqual({
      kind: "hit",
      damage: 30,
      pause: 11,
      attackerPause: 8,
      stun: 20,
      push: 12,
      hitVelocityY: -2,
      hitVelocityZ: 1.5,
      cornerPush: 13,
      powerGain: 35,
      dizzyPoints: 15,
      kill: true,
    });

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: true })).toEqual({
      kind: "guard",
      damage: 8,
      pause: 9,
      attackerPause: 4,
      stun: 7,
      slideTime: 5,
      controlTime: 6,
      push: 5,
      guardPoints: -15,
      hitVelocityY: -1,
      hitVelocityZ: 3,
      cornerPush: 6,
      powerGain: 12,
      kill: true,
    });
  });

  it("uses air.hittime for airborne normal hits and keeps ground/default fallbacks", () => {
    const attacker = actor();
    const attack = {
      damage: 20,
      hitPause: 4,
      hitStun: 9,
      airHitTime: 17,
      push: 0,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "A" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 17 });

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "S" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 9 });

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "A" }),
        attack: { ...attack, airHitTime: undefined },
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 20 });
  });

  it("selects direct HitDef air velocity metadata only for airborne hits", () => {
    const attacker = actor();
    const attack = {
      damage: 20,
      hitPause: 4,
      hitStun: 9,
      push: 2,
      hitVelocityY: -1,
      hitVelocityZ: 1,
      airVelocityX: -20,
      airVelocityY: -30,
      airVelocityZ: 40,
      downVelocityX: 3,
      downVelocityY: -2,
      guardPush: 3,
      guardVelocityY: -2,
      guardVelocityZ: 5,
      hitVelocities: {
        ground: { x: 9, y: -8, z: 7 },
        air: { x: -6, y: -10, z: 4 },
      },
    };

    expect(resolveRuntimeCombatHit({
      attacker,
      defender: actor({ stateType: "A" }),
      attack,
      holdingBack: false,
    })).toMatchObject({
      kind: "hit",
      push: 6,
      hitVelocityX: -6,
      hitVelocityY: -10,
      hitVelocityZ: 4,
    });
    expect(resolveRuntimeCombatHit({
      attacker,
      defender: actor({ stateType: "S" }),
      attack,
      holdingBack: false,
    })).toMatchObject({
      kind: "hit",
      push: 2,
      hitVelocityY: -1,
      hitVelocityZ: 1,
    });
    expect(resolveRuntimeCombatHit({
      attacker,
      defender: actor({ stateType: "L" }),
      attack,
      holdingBack: false,
    })).toMatchObject({
      kind: "hit",
      hitVelocityX: 3,
      hitVelocityY: -2,
      hitVelocityZ: 40,
    });
    expect(resolveRuntimeCombatHit({
      attacker,
      defender: actor({ stateType: "S" }),
      attack,
      holdingBack: true,
    })).toMatchObject({
      kind: "guard",
      push: 3,
      hitVelocityY: -2,
      hitVelocityZ: 5,
    });
  });

  it("does not use air.hittime when the hit starts a fall reaction", () => {
    const attacker = actor();
    const attack = {
      damage: 20,
      hitPause: 4,
      hitStun: 9,
      airHitTime: 17,
      fall: { enabled: true },
      push: 0,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "A" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 9 });

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "S" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 9 });
  });

  it("uses the base hit timing for an airborne-only air.fall reaction", () => {
    const attack = {
      damage: 20,
      hitPause: 4,
      hitStun: 9,
      airHitTime: 17,
      fall: { enabled: false, airFall: true },
      push: 0,
    };

    expect(resolveRuntimeCombatHit({ attacker: actor(), defender: actor({ stateType: "A" }), attack, holdingBack: false })).toMatchObject({
      kind: "hit",
      stun: 9,
    });
    expect(resolveRuntimeCombatHit({ attacker: actor(), defender: actor({ stateType: "S" }), attack, holdingBack: false })).toMatchObject({
      kind: "hit",
      stun: 9,
    });
  });

  it("uses down.hittime for lying hits and air timing when down.velocity launches", () => {
    const attacker = actor();
    const attack = {
      damage: 20,
      hitPause: 4,
      hitStun: 9,
      airHitTime: 17,
      downHitTime: 13,
      downVelocityX: 3,
      downVelocityY: 0,
      downVelocityZ: 1.25,
      hitVelocityY: -3,
      hitVelocityZ: 2.5,
      airVelocityZ: 3.5,
      push: 0,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "L" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 13, hitVelocityX: 3, hitVelocityY: 0, hitVelocityZ: 1.25 });

    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: actor({ stateType: "L" }),
        attack: { ...attack, downVelocityY: -2, downVelocityZ: undefined },
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", stun: 17, hitVelocityX: 3, hitVelocityY: -2, hitVelocityZ: 3.5 });
  });

  it("carries explicit HitDef red life through hit and guard scaling", () => {
    const attacker = actor({ attackMultiplier: 1.5 });
    const defender = actor({ defenseMultiplier: 0.5, stateType: "S", moveType: "I" });
    const attack = {
      damage: 40,
      redLife: 20,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      guardFlag: "MA",
      guardDamage: 10,
      guardRedLife: 10,
      guardPoints: -20,
    };

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: false })).toMatchObject({ kind: "hit", redLife: 15 });
    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: true })).toMatchObject({ kind: "guard", redLife: 8, guardPoints: -15 });
  });

  it("carries explicit HitDef dizzy points through direct-hit scaling only", () => {
    const attacker = actor({ attackMultiplier: 1.5 });
    const defender = actor({ defenseMultiplier: 0.5, stateType: "S", moveType: "I" });
    const attack = {
      damage: 40,
      dizzyPoints: 20,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      guardFlag: "MA",
      guardDamage: 10,
      guardPoints: -20,
    };

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: false })).toMatchObject({
      kind: "hit",
      dizzyPoints: 15,
    });
    expect(
      resolveRuntimeCombatHit({
        attacker,
        defender: { ...defender, assertSpecial: { flags: ["nodizzypointsdamage"], globalFlags: [], noDizzyPointsDamage: true } },
        attack,
        holdingBack: false,
      }),
    ).not.toHaveProperty("dizzyPoints");
    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: true })).not.toHaveProperty("dizzyPoints");
    expect(
      resolveRuntimeCombatHit({ attacker, defender, attack: { ...attack, dizzyPoints: -20 }, holdingBack: false }),
    ).toMatchObject({ kind: "hit", dizzyPoints: -15 });
  });

  it("uses the dedicated AttackMulSet dizzy-points multiplier when present", () => {
    const attacker = actor({ attackMultiplier: 1.5, dizzyPointsAttackMultiplier: 0.5 });
    const defender = actor({ defenseMultiplier: 0.5, stateType: "S", moveType: "I" });
    const attack = {
      damage: 40,
      dizzyPoints: -20,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      guardFlag: "MA",
    };

    expect(resolveRuntimeCombatHit({ attacker, defender, attack, holdingBack: false })).toMatchObject({
      kind: "hit",
      damage: 30,
      dizzyPoints: -5,
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
      guardControlTime: 4,
      guardVelocityY: -1,
      airGuardPush: 9,
      airGuardControlTime: 9,
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
    ).toMatchObject({ kind: "guard", push: 9, controlTime: 9, hitVelocityY: -3, cornerPush: 10 });

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "S", moveType: "I" }),
        attack,
        holdingBack: true,
      }),
    ).toMatchObject({ kind: "guard", push: 5, controlTime: 4, hitVelocityY: -1, cornerPush: 6 });
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

  it("uses down cornerpush for liedown hits before ground or air fallbacks", () => {
    const attack = {
      damage: 40,
      hitPause: 8,
      hitStun: 20,
      push: 12,
      cornerPush: 5,
      airCornerPush: 8,
      downCornerPush: 11,
    };

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "L" }),
        attack,
        holdingBack: false,
      }),
    ).toMatchObject({ kind: "hit", cornerPush: 11 });

    expect(
      resolveRuntimeCombatHit({
        attacker: actor(),
        defender: actor({ stateType: "L" }),
        attack: { ...attack, downCornerPush: undefined },
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
    expect(scaleRuntimeIncomingDamage(actor({ fallDefenseMultiplier: 2 / 3 }), 30)).toBe(20);
    expect(
      scaleRuntimeIncomingDamage(
        actor({ defenseMultiplier: 0.5, superPauseDefenseMultiplier: 2 / 3 }),
        31,
      ),
    ).toBe(10);
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

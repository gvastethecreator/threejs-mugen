import { describe, expect, it } from "vitest";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import {
  createRuntimeContactMemory,
  RuntimeContactMemoryWorld,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
  runtimeReceivedDamageValue,
  runtimeReceivedHitsValue,
  type RuntimeContactKind,
  type RuntimeContactMemory,
} from "../mugen/runtime/ContactMemorySystem";
import {
  consumeRuntimeDirectHitFacing,
  RuntimeDirectCombatWorld,
  type RuntimeDirectCombatActor,
  type RuntimeDirectCombatHooks,
  type RuntimeDirectPriorityHooks,
} from "../mugen/runtime/DirectCombatSystem";
import { resolveRuntimeCombatHit } from "../mugen/runtime/CombatResolver";
import { runtimeHitVar } from "../mugen/runtime/RuntimeExpressionContextSystem";
import type { CharacterRuntimeState, RuntimePaletteFxPayload, RuntimePaletteFxState } from "../mugen/runtime/types";

describe("DirectCombatSystem", () => {
  it("resolves bounded direct HitDef priority winners", () => {
    const world = new RuntimeDirectCombatWorld();
    const left = actor("p1", "P1", { currentMove: move({ priority: 6 }), moveTick: 1 });
    const right = actor("p2", "P2", { currentMove: move({ priority: 3 }), moveTick: 1 });

    const outcome = world.resolvePriorityClash(left, right, priorityHooks());

    expect(outcome).toEqual({
      kind: "win",
      winnerId: "p1",
      loserId: "p2",
      message: "HitDef priority clash: P1 priority 6 beat P2 priority 3",
    });
    expect(left.hasHit).toBe(false);
    expect(right.hasHit).toBe(true);
  });

  it("keeps high and negative integer HitDef priorities distinct", () => {
    const world = new RuntimeDirectCombatWorld();

    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 12.8 }), moveTick: 1 }),
      actor("p2", "P2", { currentMove: move({ priority: 8.9 }), moveTick: 1 }),
      priorityHooks(),
    )).toMatchObject({ kind: "win", winnerId: "p1", loserId: "p2", message: "HitDef priority clash: P1 priority 12 beat P2 priority 8" });

    expect(world.resolvePriorityClash(
      actor("p3", "P3", { currentMove: move({ priority: -4.8 }), moveTick: 1 }),
      actor("p4", "P4", { currentMove: move({ priority: -3.1 }), moveTick: 1 }),
      priorityHooks(),
    )).toMatchObject({ kind: "win", winnerId: "p4", loserId: "p3", message: "HitDef priority clash: P4 priority -3 beat P3 priority -4" });
  });

  it("resolves bounded equal-priority direct HitDef trades", () => {
    const world = new RuntimeDirectCombatWorld();
    const left = actor("p1", "P1", { currentMove: move({ priority: 4 }), moveTick: 1 });
    const right = actor("p2", "P2", { currentMove: move({ priority: 4 }), moveTick: 1 });

    const outcome = world.resolvePriorityClash(left, right, priorityHooks());

    expect(outcome).toEqual({
      kind: "trade",
      message: "HitDef priority clash: P1 priority 4 Hit traded with P2 priority 4 Hit",
    });
    expect(left.hasHit).toBe(false);
    expect(right.hasHit).toBe(false);
  });

  it.each([
    ["hit", "hit", "trade", undefined],
    ["hit", "miss", "tie-win", "p1"],
    ["hit", "dodge", "no-hit", undefined],
    ["dodge", "dodge", "no-hit", undefined],
    ["dodge", "miss", "no-hit", undefined],
    ["miss", "miss", "no-hit", undefined],
    ["miss", "hit", "tie-win", "p2"],
    ["dodge", "hit", "no-hit", undefined],
    ["miss", "dodge", "no-hit", undefined],
  ] as const)("resolves equal-priority %s versus %s as %s", (leftType, rightType, kind, winnerId) => {
    const world = new RuntimeDirectCombatWorld();
    const outcome = world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 4, priorityType: leftType }), moveTick: 1 }),
      actor("p2", "P2", { currentMove: move({ priority: 4, priorityType: rightType }), moveTick: 1 }),
      priorityHooks(),
    );

    expect(outcome).toMatchObject({ kind, ...(winnerId ? { winnerId } : {}) });
  });

  it("records priority suppression by exact getter without consuming other root pairs", () => {
    const world = new RuntimeDirectCombatWorld();
    const winner = actor("p3", "P3", {
      currentMove: move({ priority: 6 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const loser = actor("p4", "P4", {
      currentMove: move({ priority: 3 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const other = actor("p2", "P2", {
      currentMove: move({ priority: 2 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });

    expect(world.resolvePriorityClash(winner, loser, priorityHooks())).toMatchObject({ kind: "win", winnerId: "p3" });
    expect(loser.pendingHitDefTargets).toEqual(["p3"]);
    expect(world.resolvePriorityClash(loser, other, priorityHooks())).toMatchObject({ kind: "win", winnerId: "p4" });
    expect(other.pendingHitDefTargets).toEqual(["p4"]);
  });

  it("skips priority clashes for inactive, consumed, reversal, or separated attacks", () => {
    const world = new RuntimeDirectCombatWorld();
    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 6 }), hasHit: true }),
      actor("p2", "P2", { currentMove: move({ priority: 3 }) }),
      priorityHooks(),
    )).toBeUndefined();
    expect(world.resolvePriorityClash(
      actor("p3", "P3", {
        currentMove: move({ priority: 6, hitOnce: true }),
        hasHit: true,
        hitDefTargets: [],
        pendingHitDefTargets: [],
      }),
      actor("p4", "P4", { currentMove: move({ priority: 3 }) }),
      priorityHooks(),
    )).toBeUndefined();
    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 6, isReversal: true }) }),
      actor("p2", "P2", { currentMove: move({ priority: 3 }) }),
      priorityHooks(),
    )).toBeUndefined();
    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 6, requiresHitDef: true }) }),
      actor("p2", "P2", { currentMove: move({ priority: 3 }) }),
      priorityHooks(),
    )).toBeUndefined();
    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 6, hitbox: { x1: 200, y1: -40, x2: 240, y2: -10 } }) }),
      actor("p2", "P2", { currentMove: move({ priority: 3 }) }),
      priorityHooks(),
    )).toBeUndefined();
    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 6 }) }),
      actor("p2", "P2", { currentMove: move({ priority: 3 }) }),
      priorityHooks({ isMoveActive: () => false }),
    )).toBeUndefined();
  });

  it("applies bounded guard results and guard.kill hit vars behind RuntimeDirectCombatWorld", () => {
    const contactWorld = new RecordingContactWorld();
    const world = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "Attacker", { power: 18, powerMax: 24, facing: 1, stateNo: 200, spritePriority: 8 });
    const defender = actor("p2", "Defender", {
      life: 8,
      receivedHitSequence: 4,
      currentMove: move(),
      moveTick: 9,
      hasHit: true,
      guardStun: 99,
      guarding: false,
      stateNo: 130,
      spritePriority: 7,
    });
    let guardHookCount = 0;
    const guardMove = move({ kill: true, guardKill: false, p1SpritePriority: 4, p2SpritePriority: -2 });

    const outcome = world.applyResolvedHit(attacker, defender, guardMove, {
      kind: "guard",
      damage: 11,
      kill: false,
      pause: 4,
      stun: 7,
      slideTime: 5,
      controlTime: 6,
      push: 3,
      hitVelocityY: -1,
      powerGain: 12,
    }, hooks({ applyGuardHit: () => { guardHookCount += 1; } }), { hitDefPriorityProfile: "mugen-1.1" });

    expect(outcome).toEqual({ kind: "guard", damage: 11, message: "Defender guarded Attacker for 11" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.hitPause).toBe(4);
    expect(attacker.runtime.power).toBe(24);
    expect(attacker.runtime.spritePriority).toBe(4);
    expect(attacker.runtime.hitDefSpritePriority).toEqual({
      profile: "mugen-1.1",
      role: "p1",
      contactKind: "guard",
      previousValue: 8,
      value: 4,
      source: "authored",
      supported: true,
    });
    expect(defender.hitPause).toBe(4);
    expect(defender.currentMove).toBeUndefined();
    expect(defender.moveTick).toBe(0);
    expect(defender.hasHit).toBe(false);
    expect(defender.runtime.life).toBe(1);
    expect(defender.runtime.guardStun).toBe(7);
    expect(defender.runtime.guardSlideTime).toBe(5);
    expect(defender.runtime.guardControlTime).toBe(6);
    expect(defender.runtime.guardSlideTimeRemaining).toBe(5);
    expect(defender.runtime.guardControlTimeRemaining).toBe(6);
    expect(defender.runtime.guarding).toBe(true);
    expect(defender.runtime.receivedHitSequence).toBe(4);
    expect(defender.runtime.ctrl).toBe(false);
    expect(defender.runtime.spritePriority).toBe(-2);
    expect(defender.runtime.hitDefSpritePriority).toEqual({
      profile: "mugen-1.1",
      role: "p2",
      contactKind: "guard",
      previousValue: 7,
      value: -2,
      source: "authored",
      supported: true,
    });
    expect(defender.runtime.vel).toEqual({ x: 3, y: -1 });
    expect(defender.runtime.hitVelocity).toEqual({ x: 3, y: -1 });
    expect(defender.runtime.hitVars).toEqual({
      damage: 11,
      hitDamage: 30,
      guardDamage: 0,
      animType: 0,
      groundAnimType: 0,
      airAnimType: 0,
      fallAnimType: 0,
      groundType: 1,
      airType: 1,
      isBound: false,
      hitShakeTime: 4,
      hitTime: 7,
      guardCount: 1,
      guarded: true,
      kill: false,
      sourceTeamSide: 1,
      sourcePriority: 4,
      frame: true,
    });
    expect(defender.runtime.moveType).toBe("H");
    expect(guardHookCount).toBe(1);
    expect(attacker.removedExplodsOnGetHit).toBe(0);
    expect(defender.removedExplodsOnGetHit).toBe(1);
    expect(attacker.contact).toMatchObject({ moveContactState: 200, moveGuardState: 200, moveGuardTime: 0 });
    expect(contactWorld.calls).toEqual(["move:guard:200:p2"]);
    expect(runtimeMoveContactValue(attacker.contact, 200, "guard")).toBe(0);
    expect(runtimeReceivedDamageValue(defender.contact, 130)).toBe(0);
  });

  it("uses authored direct HitDef getpower for accepted hit and guard contacts", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker", { power: 100 });
    const defender = actor("p2", "Defender", { life: 1000 });
    const authored = move({ attackerHitPower: 47, attackerGuardPower: 19 });

    world.applyResolvedHit(attacker, defender, authored, {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 35,
    }, hooks());
    expect(attacker.runtime.power).toBe(147);

    world.applyResolvedHit(attacker, defender, authored, {
      kind: "guard",
      damage: 0,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 12,
    }, hooks());
    expect(attacker.runtime.power).toBe(166);
  });

  it("applies direct pause pairs asymmetrically while GetHitVar tracks the defender component", () => {
    const world = new RuntimeDirectCombatWorld();
    const hitAttacker = actor("p1", "Hit attacker");
    const hitDefender = actor("p2", "Hit defender");

    world.applyResolvedHit(hitAttacker, hitDefender, move({ hitPause: 4 }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 9,
      attackerPause: 4,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect([hitAttacker.hitPause, hitDefender.hitPause]).toEqual([4, 9]);
    expect(runtimeHitVar(hitDefender.runtime, "hitshaketime", { hitPause: hitDefender.hitPause })).toBe(9);

    const guardAttacker = actor("p3", "Guard attacker");
    const guardDefender = actor("p4", "Guard defender");
    world.applyResolvedHit(guardAttacker, guardDefender, move({ guardPause: 3 }), {
      kind: "guard",
      damage: 0,
      kill: true,
      pause: 7,
      attackerPause: 3,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect([guardAttacker.hitPause, guardDefender.hitPause]).toEqual([3, 7]);
    expect(runtimeHitVar(guardDefender.runtime, "hitshaketime", { hitPause: guardDefender.hitPause })).toBe(7);
  });

  it("carries authored guard hittime into accepted guard GetHitVar without changing direct hits", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const authored = move({ guardFlag: "MA", guardStun: 14, hitStun: 29 });
    const guarded = actor("p2", "Guarded defender");
    const guardResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: guarded.runtime,
      attack: authored,
      holdingBack: true,
    });

    expect(guardResult).toMatchObject({ kind: "guard", stun: 14 });
    world.applyResolvedHit(attacker, guarded, authored, guardResult, hooks());
    expect(runtimeHitVar(guarded.runtime, "hittime", { hitStun: guarded.hitStun })).toBe(14);

    const hit = actor("p3", "Hit defender");
    const hitResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: hit.runtime,
      attack: authored,
      holdingBack: false,
    });

    expect(hitResult).toMatchObject({ kind: "hit", stun: 29 });
    world.applyResolvedHit(attacker, hit, authored, hitResult, hooks());
    expect(runtimeHitVar(hit.runtime, "hittime", { hitStun: hit.hitStun })).toBe(29);
  });

  it("carries authored guard slidetime into accepted guard GetHitVar without changing direct hits", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const authored = move({ guardFlag: "MA", guardSlideTime: 17, hitVars: { slideTime: 11 } });
    const guarded = actor("p2", "Guarded defender");
    const guardResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: guarded.runtime,
      attack: authored,
      holdingBack: true,
    });

    expect(guardResult).toMatchObject({ kind: "guard", slideTime: 17 });
    world.applyResolvedHit(attacker, guarded, authored, guardResult, hooks());
    expect(runtimeHitVar(guarded.runtime, "slidetime")).toBe(17);

    const hit = actor("p3", "Hit defender");
    const hitResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: hit.runtime,
      attack: authored,
      holdingBack: false,
    });

    expect(hitResult.kind).toBe("hit");
    world.applyResolvedHit(attacker, hit, authored, hitResult, hooks());
    expect(runtimeHitVar(hit.runtime, "slidetime")).toBe(11);
  });

  it("keeps ground guard ctrltime separate from air guard and direct-hit metadata", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const authored = move({ guardFlag: "MA", guardControlTime: 18, airGuardControlTime: 27 });
    const grounded = actor("p2", "Ground guard");
    const groundGuardResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: grounded.runtime,
      attack: authored,
      holdingBack: true,
    });

    expect(groundGuardResult).toMatchObject({ kind: "guard", controlTime: 18 });
    world.applyResolvedHit(attacker, grounded, authored, groundGuardResult, hooks());
    expect(runtimeHitVar(grounded.runtime, "ctrltime")).toBe(18);

    const airborne = actor("p3", "Air guard", { stateType: "A" });
    const airGuardResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: airborne.runtime,
      attack: authored,
      holdingBack: true,
    });

    expect(airGuardResult).toMatchObject({ kind: "guard", controlTime: 27 });
    world.applyResolvedHit(attacker, airborne, authored, airGuardResult, hooks());
    expect(runtimeHitVar(airborne.runtime, "ctrltime")).toBe(27);

    const hit = actor("p4", "Hit defender", { guardControlTime: 99 });
    const hitResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: hit.runtime,
      attack: authored,
      holdingBack: false,
    });

    expect(hitResult.kind).toBe("hit");
    world.applyResolvedHit(attacker, hit, authored, hitResult, hooks());
    expect(runtimeHitVar(hit.runtime, "ctrltime")).toBe(0);
  });

  it("carries air hittime only for accepted airborne non-fall hits", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const authored = move({ hitStun: 13, airHitTime: 21 });
    const airborne = actor("p2", "Air defender", { stateType: "A" });
    const airResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: airborne.runtime,
      attack: authored,
      holdingBack: false,
    });

    expect(airResult).toMatchObject({ kind: "hit", stun: 21 });
    world.applyResolvedHit(attacker, airborne, authored, airResult, hooks());
    expect(runtimeHitVar(airborne.runtime, "hittime", { hitStun: airborne.hitStun })).toBe(21);

    const grounded = actor("p3", "Ground defender");
    const groundResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: grounded.runtime,
      attack: authored,
      holdingBack: false,
    });

    expect(groundResult).toMatchObject({ kind: "hit", stun: 13 });
    world.applyResolvedHit(attacker, grounded, authored, groundResult, hooks());
    expect(runtimeHitVar(grounded.runtime, "hittime", { hitStun: grounded.hitStun })).toBe(13);

    const falling = actor("p4", "Falling air defender", { stateType: "A" });
    const fallMove = move({ hitStun: 13, airHitTime: 21, fall: { enabled: true } });
    const fallResult = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: falling.runtime,
      attack: fallMove,
      holdingBack: false,
    });

    expect(fallResult).toMatchObject({ kind: "hit", stun: 13 });
    world.applyResolvedHit(attacker, falling, fallMove, fallResult, hooks());
    expect(runtimeHitVar(falling.runtime, "hittime", { hitStun: falling.hitStun })).toBe(13);
  });

  it("applies resolved ground velocity to an accepted grounded hit and GetHitVar", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker", { facing: 1 });
    const defender = actor("p2", "Ground defender", { stateType: "S" });
    const authored = move({ push: 7, hitVelocityY: -5 });
    const result = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: defender.runtime,
      attack: authored,
      holdingBack: false,
    });

    expect(result).toMatchObject({ kind: "hit", push: 7, hitVelocityY: -5 });
    world.applyResolvedHit(attacker, defender, authored, result, hooks());
    expect(defender.runtime.vel).toEqual({ x: 7, y: -5 });
    expect(runtimeHitVar(defender.runtime, "xvel")).toBe(7);
    expect(runtimeHitVar(defender.runtime, "yvel")).toBe(-5);
  });

  it("replaces stale direct-hit velocity with fresh omitted ground.velocity zero defaults", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker", { facing: 1 });
    const defender = actor("p2", "Ground defender", {
      stateType: "S",
      vel: { x: 13, y: -11 },
      hitVelocity: { x: 9, y: -7, z: 5 },
      hitVars: { hitVelocities: { ground: { x: 9, y: -7, z: 5 } } },
    });
    const freshOmitted = move({
      push: 0,
      hitVelocityY: 0,
      hitVelocityZ: 0,
      hitVelocities: { ground: { x: 0, y: 0, z: 0 } },
    });
    const result = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: defender.runtime,
      attack: freshOmitted,
      holdingBack: false,
    });

    expect(result).toMatchObject({ kind: "hit", push: 0, hitVelocityY: 0, hitVelocityZ: 0 });
    world.applyResolvedHit(attacker, defender, freshOmitted, result, hooks());

    expect(defender.runtime.vel).toEqual({ x: 0, y: 0 });
    expect(defender.runtime.hitVelocity).toEqual({ x: 0, y: 0, z: 0 });
    expect(defender.runtime.hitVars?.hitVelocities?.ground).toEqual({ x: 0, y: 0, z: 0 });
    expect(runtimeHitVar(defender.runtime, "xvel")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "yvel")).toBe(0);
  });

  it("applies contact PalFX and emits EnvShake only on accepted unguarded direct hits", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const paletteFx: RuntimePaletteFxPayload = { time: 9, add: [12, -6, 3], mul: [200, 220, 240], color: 192, invert: true };
    const envShake = { time: 12, freq: 75, ampl: -9, phase: 45, mul: 1.5, dir: -20 };
    const hitDef = move({ paletteFx, envShake });
    const result = { damage: 1, kill: true, pause: 0, stun: 1, push: 0, powerGain: 0 };
    const hitDefender = actor("p2", "Hit defender");
    const emitted: DemoMove[] = [];

    world.applyResolvedHit(attacker, hitDefender, hitDef, { kind: "hit", ...result }, hooks({
      emitHitEnvShake: (_source, currentMove) => emitted.push(currentMove),
    }));
    expect(hitDefender.runtime.paletteFx).toEqual({ remaining: 9, ...paletteFx });
    expect(emitted).toEqual([hitDef]);

    const existing: RuntimePaletteFxState = { remaining: 3, time: 3, add: [1, 1, 1], mul: [256, 256, 256], color: 256, invert: false };
    const guardDefender = actor("p3", "Guard defender", { paletteFx: existing });
    world.applyResolvedHit(attacker, guardDefender, hitDef, { kind: "guard", ...result }, hooks({
      emitHitEnvShake: (_source, currentMove) => emitted.push(currentMove),
    }));
    expect(guardDefender.runtime.paletteFx).toEqual(existing);
    expect(emitted).toEqual([hitDef]);
  });

  it.each([
    ["S,NA", "normal"],
    ["S,SA", "special"],
    ["S,HA", "hyper"],
    ["S,NT", "throw"],
  ] as const)("records %s as the direct KO base win type", (attr, winType) => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 10 });

    world.applyResolvedHit(attacker, defender, move({ attr }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe(winType);
  });

  it("increments direct guardcount across consecutive guard contacts", () => {
    const defender = actor("p2", "Defender", { hitVars: { guardCount: 2 } });
    const attacker = actor("p1", "Attacker");
    const result = {
      kind: "guard" as const,
      damage: 1,
      kill: false,
      pause: 1,
      stun: 4,
      push: 0,
      powerGain: 0,
    };

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move(), result, hooks());

    expect(defender.runtime.hitVars?.guardCount).toBe(3);
    expect(runtimeHitVar(defender.runtime, "guardcount")).toBe(3);
  });

  it("writes only non-negative receiver unhittabletime on accepted direct hits", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { unhittableTime: 3 });
    const hit = {
      kind: "hit" as const,
      damage: 1,
      kill: false,
      pause: 1,
      stun: 4,
      push: 0,
      powerGain: 0,
    };

    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [2, 8] }), hit, hooks());
    expect(defender.runtime.unhittableTime).toBe(8);

    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [2, 0] }), hit, hooks());
    expect(defender.runtime.unhittableTime).toBe(0);

    defender.runtime.unhittableTime = 5;
    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [2, -1] }), hit, hooks());
    expect(defender.runtime.unhittableTime).toBe(5);

    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [2, 9] }), {
      kind: "guard",
      damage: 0,
      kill: false,
      pause: 1,
      stun: 4,
      push: 0,
      powerGain: 0,
    }, hooks());
    expect(defender.runtime.unhittableTime).toBe(5);
  });

  it("writes only non-negative attacker unhittabletime on accepted hit and guard contacts", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker", { unhittableTime: 3 });
    const defender = actor("p2", "Defender");
    const hit = {
      kind: "hit" as const,
      damage: 1,
      kill: false,
      pause: 1,
      stun: 4,
      push: 0,
      powerGain: 0,
    };

    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [8, -1] }), hit, hooks());
    expect(attacker.runtime.unhittableTime).toBe(8);

    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [0, -1] }), hit, hooks());
    expect(attacker.runtime.unhittableTime).toBe(0);

    attacker.runtime.unhittableTime = 5;
    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [-1, -1] }), hit, hooks());
    world.applyResolvedHit(attacker, defender, move(), hit, hooks());
    expect(attacker.runtime.unhittableTime).toBe(5);

    world.applyResolvedHit(attacker, defender, move({ unhittableTime: [7, -1] }), {
      kind: "guard",
      damage: 0,
      kill: false,
      pause: 1,
      stun: 4,
      push: 0,
      powerGain: 0,
    }, hooks());
    expect(attacker.runtime.unhittableTime).toBe(7);
  });

  it("applies authored numhits to HitCount while GetHitVar(hitcount) tracks contacts", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 100 });
    const result = {
      kind: "hit" as const,
      damage: 1,
      kill: false,
      pause: 1,
      stun: 4,
      push: 0,
      powerGain: 0,
    };

    const authoredMultiHit = move({ hitVars: { hitCount: 3 } });
    world.applyResolvedHit(attacker, defender, authoredMultiHit, result, hooks(), { trackAuthoredHitCountCombo: true });
    expect(defender.runtime.hitVars).toMatchObject({ hitCount: 3, comboHitCount: 1 });
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(1);
    expect(runtimeMoveHitCountValue(attacker.contact, attacker.runtime.stateNo, false)).toBe(3);

    defender.runtime.moveType = "H";
    defender.runtime.hitVars = { ...defender.runtime.hitVars, guarded: false };
    world.applyResolvedHit(attacker, defender, authoredMultiHit, result, hooks(), { trackAuthoredHitCountCombo: true });
    expect(defender.runtime.hitVars?.comboHitCount).toBe(2);
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(2);
    expect(runtimeMoveHitCountValue(attacker.contact, attacker.runtime.stateNo, false)).toBe(6);

    defender.runtime.moveType = "H";
    defender.runtime.hitVars = { ...defender.runtime.hitVars, guarded: true };
    world.applyResolvedHit(attacker, defender, authoredMultiHit, result, hooks(), { trackAuthoredHitCountCombo: true });
    expect(defender.runtime.hitVars?.comboHitCount).toBe(1);
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(1);
  });

  it("gives p1getp2facing priority over p1facing before direct-hit velocity and snap", () => {
    const attacker = actor("p1", "Attacker", { facing: -1, pos: { x: 10, y: 0 } });
    const defender = actor("p2", "Defender", { facing: 1 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      p1Facing: -1,
      p1GetP2Facing: -1,
      hitVars: { hitOffset: { x: 12 } },
    }), {
      kind: "hit",
      damage: 0,
      kill: true,
      pause: 0,
      stun: 1,
      push: 4,
      powerGain: 0,
    }, hooks());

    expect(attacker.runtime.facing).toBe(-1);
    expect(defender.runtime.vel.x).toBe(-4);
    expect(defender.runtime.pos.x).toBe(-2);
  });

  it("inverts the current attacker facing for negative p1facing on direct hits", () => {
    const attacker = actor("p1", "Attacker", { facing: 1, pos: { x: 10, y: 0 } });
    const defender = actor("p2", "Defender", { facing: 1 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      p1Facing: -1,
      p1GetP2Facing: 0,
      hitVars: { hitOffset: { x: 12 } },
    }), {
      kind: "hit",
      damage: 0,
      kill: true,
      pause: 0,
      stun: 1,
      push: 4,
      powerGain: 0,
    }, hooks());

    expect(attacker.runtime.facing).toBe(-1);
    expect(defender.runtime.vel.x).toBe(-4);
    expect(defender.runtime.pos.x).toBe(-2);
  });

  it("keeps attacker facing unchanged on guarded direct contacts", () => {
    const attacker = actor("p1", "Attacker", { facing: 1 });
    const defender = actor("p2", "Defender", { facing: -1 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      p1Facing: -1,
      p1GetP2Facing: -1,
    }), {
      kind: "guard",
      damage: 0,
      kill: true,
      pause: 0,
      stun: 1,
      push: 4,
      powerGain: 0,
    }, hooks());

    expect(attacker.runtime.facing).toBe(1);
    expect(defender.runtime.vel.x).toBe(4);
  });

  it("records Ikemen KO velocity deltas separately from the authored direct HitDef velocity", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      koVelocityAdd: { x: 4, y: 2 },
    }), {
      kind: "hit",
      damage: 40,
      kill: true,
      pause: 1,
      stun: 1,
      push: 5,
      hitVelocityY: -3,
      powerGain: 0,
    }, hooks(), { trackIkemenKoVelocityDelta: true });

    expect(defender.runtime.life).toBe(0);
    expect(defender.runtime.hitVelocity).toEqual({ x: 5, y: -3 });
    expect(defender.runtime.vel).toEqual({ x: 9, y: -1 });
    expect(defender.runtime.hitVars?.hitVelocityAdd).toEqual({ x: 4, y: 2 });
    expect(runtimeHitVar(defender.runtime, "xveladd")).toBe(4);
    expect(runtimeHitVar(defender.runtime, "yveladd")).toBe(2);
  });

  it("keeps direct KO velocity deltas at zero outside the Ikemen compatibility opt-in", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      koVelocityAdd: { x: 4, y: 2 },
    }), {
      kind: "hit",
      damage: 40,
      kill: true,
      pause: 1,
      stun: 1,
      push: 5,
      hitVelocityY: -3,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.vel).toEqual({ x: 5, y: -3 });
    expect(defender.runtime.hitVars?.hitVelocityAdd).toBeUndefined();
    expect(runtimeHitVar(defender.runtime, "xveladd")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "yveladd")).toBe(0);
  });

  it("carries explicit direct-hit source identity into GetHitVar metadata", () => {
    const attacker = actor("p1", "Attacker", { playerId: 56, playerNo: 1 });
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ attr: "S,HA", guardFlag: "L" }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars).toMatchObject({
      hitDamage: 30,
      guardDamage: 0,
      sourcePlayerId: 56,
      sourcePlayerNo: 1,
      sourceActorId: "p1",
      sourceRootId: "p1",
      sourceRootOwned: true,
      sourceAttr: "S,HA",
      sourceGuardFlag: "L",
      sourceHitFlag: "MAF",
      sourceTeamSide: 1,
      sourceGuardKo: false,
      frame: true,
    });
    expect(runtimeHitVar(defender.runtime, "playerid")).toBe(56);
    expect(runtimeHitVar(defender.runtime, "playerno")).toBe(1);
    expect(runtimeHitVar(defender.runtime, "projid")).toBe(-1);
    expect(runtimeHitVar(defender.runtime, "frame")).toBe(1);
    expect(runtimeHitVar(defender.runtime, "priority")).toBe(4);
  });

  it("exposes direct HitDef priority through GetHitVar(priority)", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ priority: 9.8 }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourcePriority).toBe(9);
    expect(runtimeHitVar(defender.runtime, "priority")).toBe(9);
    expect(runtimeHitVar(actor("p3", "Missing").runtime, "priority")).toBe(4);
  });

  it("exposes direct HitDef dizzypoints without reading the current dizzy pool", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40, dizzyPoints: 91 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ dizzyPoints: 37 }), {
      kind: "hit",
      damage: 20,
      dizzyPoints: 37,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceDizzyPoints).toBe(37);
    expect(runtimeHitVar(defender.runtime, "dizzypoints")).toBe(37);
    expect(defender.runtime.dizzyPoints).toBe(128);
  });

  it("exposes direct HitDef guardpoints without reading the current guard pool", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40, guardPoints: 83 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ guardPoints: 41 }), {
      kind: "guard",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceGuardPoints).toBe(41);
    expect(runtimeHitVar(defender.runtime, "guardpoints")).toBe(41);
    expect(defender.runtime.guardPoints).toBe(83);
  });

  it("exposes direct HitDef redlife without reading the current red-life pool", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40, redLife: 83 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ redLife: 47 }), {
      kind: "hit",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceRedLife).toBe(47);
    expect(runtimeHitVar(defender.runtime, "redlife")).toBe(47);
    expect(defender.runtime.redLife).toBe(83);
  });

  it("applies direct HitDef guardpower while preserving its GetHitVar delta", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40, power: 83 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ guardPower: 47 }), {
      kind: "guard",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceGuardPower).toBe(47);
    expect(runtimeHitVar(defender.runtime, "guardpower")).toBe(47);
    expect(defender.runtime.power).toBe(130);
  });

  it("applies direct HitDef hitpower while preserving its GetHitVar delta", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40, power: 83 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ hitPower: 53 }), {
      kind: "hit",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceHitPower).toBe(53);
    expect(runtimeHitVar(defender.runtime, "hitpower")).toBe(53);
    expect(defender.runtime.power).toBe(136);
  });

  it("exposes the effective direct givepower through GetHitVar(power)", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40, power: 83 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ guardPower: 47 }), {
      kind: "guard",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourcePower).toBe(47);
    expect(runtimeHitVar(defender.runtime, "power")).toBe(47);
    expect(runtimeHitVar(actor("p3", "Missing").runtime, "power")).toBe(0);
    expect(defender.runtime.power).toBe(130);
  });

  it("exposes direct HitDef score without moving score adjudication", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ score: 6.5 }), {
      kind: "hit",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceScore).toBe(6.5);
    expect(runtimeHitVar(defender.runtime, "score")).toBe(6.5);
  });

  it("exposes direct HitDef p2facing only for hit contacts", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ p2Facing: -1 }), {
      kind: "hit",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.sourceFacing).toBe(-1);
    expect(runtimeHitVar(defender.runtime, "facing")).toBe(-1);
    expect(defender.runtime.facing).toBe(1);
    expect(defender.pendingDirectHitFacing).toBe(-1);
    expect(consumeRuntimeDirectHitFacing(defender)).toBe(true);
    expect(defender.runtime.facing).toBe(-1);
    expect(defender.pendingDirectHitFacing).toBeUndefined();
    expect(consumeRuntimeDirectHitFacing(defender)).toBe(false);
    expect(runtimeHitVar(defender.runtime, "facing")).toBe(-1);
  });

  it("latches positive direct p2facing to the attacker's accepted-hit facing", () => {
    const attacker = actor("p1", "Attacker", { facing: -1 });
    const defender = actor("p2", "Defender", { facing: 1 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ p2Facing: 1 }), {
      kind: "hit",
      damage: 4,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.facing).toBe(1);
    expect(defender.pendingDirectHitFacing).toBe(-1);
    consumeRuntimeDirectHitFacing(defender);
    expect(defender.runtime.facing).toBe(-1);
    expect(runtimeHitVar(defender.runtime, "facing")).toBe(1);
  });

  it("does not latch direct p2facing for guard or the default zero", () => {
    const attacker = actor("p1", "Attacker");
    const guarded = actor("p2", "Guarded", { facing: 1 });
    const defaulted = actor("p3", "Defaulted", { facing: -1 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, guarded, move({ p2Facing: -1 }), {
      kind: "guard",
      damage: 1,
      kill: false,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());
    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defaulted, move({ p2Facing: 0 }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(guarded.runtime.facing).toBe(1);
    expect(guarded.pendingDirectHitFacing).toBeUndefined();
    expect(runtimeHitVar(guarded.runtime, "facing")).toBe(0);
    expect(defaulted.runtime.facing).toBe(-1);
    expect(defaulted.pendingDirectHitFacing).toBeUndefined();
    expect(runtimeHitVar(defaulted.runtime, "facing")).toBe(0);
  });

  it("exposes a direct guard KO through GetHitVar(guardko)", () => {
    const attacker = actor("p1", "Attacker", { playerId: 56, playerNo: 1 });
    const defender = actor("p2", "Defender", { life: 8 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ guardKill: true }), {
      kind: "guard",
      damage: 11,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.life).toBe(0);
    expect(defender.runtime.hitVars?.sourceGuardKo).toBe(true);
    expect(runtimeHitVar(defender.runtime, "guardko")).toBe(1);
    expect(runtimeHitVar(defender.runtime, "frame")).toBe(1);
  });

  it("exposes direct HitDef keepstate through GetHitVar(keepstate)", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({ keepState: true }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.keepState).toBe(true);
    expect(runtimeHitVar(defender.runtime, "keepstate")).toBe(1);
    expect(runtimeHitVar(actor("p3", "Missing").runtime, "keepstate")).toBe(0);
  });

  it("preserves the active state and skips direct default hit-state hooks for keepstate", () => {
    const attacker = actor("p1", "Attacker", { stateNo: 200, moveType: "A" });
    const defender = actor("p2", "Defender", { stateNo: 201, moveType: "A" });
    const requests: string[] = [];

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      keepState: true,
      p1StateNo: 777,
      p2StateNo: 888,
    }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks({
      applyHitStateTransitions: () => requests.push("transition"),
      applyDefaultGetHit: () => requests.push("gethit"),
    }));

    expect(defender.runtime.stateNo).toBe(201);
    expect(defender.runtime.moveType).toBe("A");
    expect(requests).toEqual([]);
  });

  it("carries direct HitDef acceleration metadata into defender GetHitVars", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 40 });

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      hitVars: {
        xAccel: -0.2,
        yAccel: 0.4,
        zAccel: 0.15,
        standFriction: 0.55,
        crouchFriction: 0.45,
      },
    }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars).toMatchObject({
      xAccel: -0.2,
      yAccel: 0.4,
      zAccel: 0.15,
      standFriction: 0.55,
      crouchFriction: 0.45,
    });
    expect(runtimeHitVar(defender.runtime, "stand.friction")).toBe(0.55);
    expect(runtimeHitVar(defender.runtime, "crouch.friction")).toBe(0.45);
    expect(runtimeHitVar(actor("p3", "Missing").runtime, "stand.friction", { standFriction: 0.77 })).toBe(0.77);
  });

  it("carries direct HitDef velocity vectors into Ikemen GetHitVar metadata", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender");

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      hitVelocities: {
        ground: { x: 3, y: -2, z: 1.5 },
        air: { x: 4, y: -6, z: 2.25 },
        down: { x: 5, y: -7, z: 3.5 },
        guard: { x: 2, y: -1, z: 0.75 },
        airGuard: { x: 1, y: -3, z: 1.25 },
      },
    }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars?.hitVelocities).toEqual({
      ground: { x: 3, y: -2, z: 1.5 },
      air: { x: 4, y: -6, z: 2.25 },
      down: { x: 5, y: -7, z: 3.5 },
      guard: { x: 2, y: -1, z: 0.75 },
      airGuard: { x: 1, y: -3, z: 1.25 },
    });
  });

  it("carries direct HitDef ground, air, and fall anim types into GetHitVar metadata", () => {
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender");

    new RuntimeDirectCombatWorld().applyResolvedHit(attacker, defender, move({
      hitVars: { animType: 5, groundAnimType: 1, airAnimType: 4, fallAnimType: 5 },
    }), {
      kind: "hit",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitVars).toMatchObject({
      animType: 5,
      groundAnimType: 1,
      airAnimType: 4,
      fallAnimType: 5,
    });
  });

  it("records a guard KO as cheese", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 10 });

    world.applyResolvedHit(attacker, defender, move(), {
      kind: "guard",
      damage: 20,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe("cheese");
  });

  it("defaults direct fall recovery to the official enabled-fall values", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { currentMove: move() });

    world.applyResolvedHit(attacker, defender, move({ fall: { enabled: true } }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall).toMatchObject({
      falling: true,
      recover: true,
      recoverTime: 4,
    });
  });

  it("clears direct falling without discarding existing or newly-authored fall payload", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const existingFall = {
      falling: true,
      damage: 9,
      recover: false,
      recoverTime: 18,
      downRecover: false,
      velocity: { x: -2, y: -7 },
    };
    const existingDefender = actor("p2", "Existing Fall Defender", { hitFall: existingFall });

    world.applyResolvedHit(attacker, existingDefender, move({ forceNoFall: true }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    const newDefender = actor("p3", "New Fall Defender");
    world.applyResolvedHit(attacker, newDefender, move({
      forceNoFall: true,
      fall: {
        enabled: false,
        damage: 7,
        recover: false,
        recoverTime: 20,
        velocity: { x: 5, y: -8 },
      },
    }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(existingDefender.runtime.hitFall).toEqual({ ...existingFall, falling: false });
    expect(newDefender.runtime.hitFall).toMatchObject({
      falling: false,
      damage: 7,
      recover: false,
      recoverTime: 20,
      velocity: { x: 5, y: -8 },
    });
  });

  it("keeps effective authored fall enabled when direct forcenofall is also set", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", {
      hitFall: { falling: true, damage: 9, velocity: { x: -2, y: -7 } },
    });

    world.applyResolvedHit(attacker, defender, move({ forceNoFall: true, fall: { enabled: true, damage: 5 } }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall).toMatchObject({ falling: true, damage: 5 });
  });

  it("leaves fall state unchanged when direct forcenofall contacts a guard", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const existingFall = { falling: true, damage: 9, recover: false, velocity: { x: -2, y: -7 } };
    const defender = actor("p2", "Defender", { hitFall: existingFall });

    world.applyResolvedHit(attacker, defender, move({ forceNoFall: true }), {
      kind: "guard",
      damage: 1,
      kill: false,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall).toEqual(existingFall);
  });

  it("applies air.fall only when the direct defender is airborne", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const groundDefender = actor("p2", "Ground Defender", { currentMove: move() });
    world.applyResolvedHit(attacker, groundDefender, move({ fall: { enabled: false, airFall: true } }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    const airborneDefender = actor("p3", "Airborne Defender", { currentMove: move(), stateType: "A" });
    world.applyResolvedHit(attacker, airborneDefender, move({ fall: { enabled: false, airFall: true } }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(groundDefender.runtime.hitFall).toMatchObject({ falling: false });
    expect(airborneDefender.runtime.hitFall).toMatchObject({ falling: true, recover: true, recoverTime: 4 });
  });

  it("defaults direct fall y velocity from the defender localcoord", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", {
      definition: { constants: {}, localCoord: [640, 480] },
    });

    world.applyResolvedHit(attacker, defender, move({ fall: { enabled: true } }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall?.velocity.y).toBe(-9);
  });

  it("preserves signed authored fall.xvelocity across attacker facing", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker", { facing: -1 });
    const defender = actor("p2", "Defender");

    world.applyResolvedHit(attacker, defender, move({
      fall: { enabled: true, velocity: { x: -3, y: -9 } },
    }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall?.velocity).toEqual({ x: -3, y: -9 });
  });

  it("carries authored Ikemen fall.zvelocity into the defender fall metadata", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", {
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    });

    world.applyResolvedHit(attacker, defender, move({
      fall: { enabled: true, velocity: { x: 1, y: -6, z: -2.5 } },
    }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall?.velocity).toEqual({ x: 1, y: -6, z: -2.5 });
  });

  it("carries authored Ikemen fall.envshake.mul and dir into GetHitVar metadata", () => {
    const world = new RuntimeDirectCombatWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender");

    world.applyResolvedHit(attacker, defender, move({
      fall: {
        enabled: true,
        velocity: { x: 1, y: -6 },
        envShake: { time: 15, freq: 60, ampl: -4, phase: 0, mul: 0.75, dir: 67.5 },
      },
    }), {
      kind: "hit",
      damage: 1,
      kill: true,
      pause: 0,
      stun: 1,
      push: 0,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.hitFall?.envShake?.mul).toBeCloseTo(0.75, 5);
    expect(defender.runtime.hitFall?.envShake?.dir).toBeCloseTo(67.5, 5);
  });

  it("applies bounded hit results, hitFall metadata, and received damage", () => {
    const contactWorld = new RecordingContactWorld();
    const world = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "Attacker", {
      power: 20,
      facing: -1,
      stateNo: 210,
      pos: { x: 40, y: -10 },
      spritePriority: 8,
    });
    const defender = actor("p2", "Defender", {
      life: 80,
      dizzyPoints: 50,
      dizzyPointsMax: 100,
      receivedHitSequence: 4,
      currentMove: move(),
      guardStun: 9,
      guardSlideTime: 4,
      guardControlTime: 6,
      guarding: true,
      stateNo: 5000,
      spritePriority: 7,
    });
    const transitions: string[] = [];
    const combatMove = move({
      dizzyPoints: 20,
      guardKill: false,
      hitVars: { hitId: 77, chainId: 43, hitCount: 3, hitOffset: { x: 16, y: -24 }, animType: 3, groundType: 2, airType: 4, slideTime: 11, yAccel: 0.62 },
      fall: {
        enabled: true,
        damage: 7,
        defenceUp: 50,
        kill: false,
        recover: true,
        recoverTime: 20,
        velocity: { x: 5, y: -7 },
      },
      downBounce: false,
    });

    const outcome = world.applyResolvedHit(attacker, defender, combatMove, {
      kind: "hit",
      damage: 30,
      dizzyPoints: 20,
      kill: true,
      pause: 6,
      stun: 13,
      push: 4,
      hitVelocityY: -2,
      powerGain: 35,
    }, hooks({
      applyHitStateTransitions: () => transitions.push("state-transition"),
      applyDefaultGetHit: () => transitions.push("default-gethit"),
    }), { hitDefPriorityProfile: "mugen-1.1" });

    expect(outcome).toEqual({ kind: "hit", damage: 30, message: "Attacker hit Defender for 30" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.hitPause).toBe(6);
    expect(attacker.runtime.power).toBe(55);
    expect(attacker.runtime.spritePriority).toBe(1);
    expect(attacker.runtime.hitDefSpritePriority).toMatchObject({
      profile: "mugen-1.1",
      role: "p1",
      contactKind: "hit",
      previousValue: 8,
      value: 1,
      source: "mugen-1.1-default",
      supported: true,
    });
    expect(defender.hitPause).toBe(6);
    expect(defender.hitStun).toBe(13);
    expect(defender.runtime.life).toBe(50);
    expect(defender.runtime.dizzyPoints).toBe(70);
    expect(defender.runtime.guardStun).toBe(0);
    expect(defender.runtime.guardSlideTime).toBe(0);
    expect(defender.runtime.guardControlTime).toBe(0);
    expect(defender.runtime.guardSlideTimeRemaining).toBeUndefined();
    expect(defender.runtime.guardControlTimeRemaining).toBeUndefined();
    expect(defender.runtime.guarding).toBe(false);
    expect(defender.runtime.receivedHitSequence).toBe(5);
    expect(defender.runtime.spritePriority).toBe(0);
    expect(defender.runtime.hitDefSpritePriority).toMatchObject({
      profile: "mugen-1.1",
      role: "p2",
      contactKind: "hit",
      previousValue: 7,
      value: 0,
      source: "mugen-1.1-default",
      supported: true,
    });
    expect(defender.runtime.vel).toEqual({ x: -4, y: -2 });
    expect(defender.runtime.pos).toEqual({ x: 24, y: -34 });
    expect(defender.runtime.hitVelocity).toEqual({ x: -4, y: -2 });
    expect(defender.runtime.hitVars).toEqual({
      damage: 30,
      hitDamage: 30,
      guardDamage: 0,
      sourceDizzyPoints: 20,
      hitId: 77,
      chainId: 43,
      hitCount: 3,
      hitOffset: { x: 16, y: -24 },
      animType: 3,
      groundAnimType: 3,
      airAnimType: 3,
      fallAnimType: 3,
      groundType: 2,
      airType: 4,
      yAccel: 0.62,
      isBound: false,
      hitShakeTime: 6,
      hitTime: 13,
      slideTime: 11,
      kill: true,
      sourceTeamSide: 1,
      sourcePriority: 4,
      frame: true,
    });
    expect(defender.runtime.hitFall).toMatchObject({
      falling: true,
      damage: 7,
      downBounce: false,
      defenceUp: 50,
      kill: false,
      recover: true,
      recoverTime: 20,
      downRecover: true,
      velocity: { x: 5, y: -7 },
    });
    expect(transitions).toEqual(["state-transition", "default-gethit"]);
    expect(defender.removedExplodsOnGetHit).toBe(1);
    expect(attacker.contact).toMatchObject({ moveContactState: 210, moveHitState: 210, moveHitTime: 0 });
    expect(contactWorld.calls).toEqual(["move:hit:210:p2", "received:5000:30"]);
    expect(runtimeMoveContactValue(attacker.contact, 210, "hit")).toBe(0);
    expect(runtimeMoveHitCountValue(attacker.contact, 210, false)).toBe(3);
    expect(runtimeReceivedDamageValue(defender.contact, 5000)).toBe(30);
    expect(runtimeReceivedHitsValue(defender.contact, 5000)).toBe(3);
    expect(runtimeHitVar(defender.runtime, "slidetime")).toBe(11);
  });

  it("requests the dizzy transition only when a direct hit crosses the resource floor", () => {
    const world = new RuntimeDirectCombatWorld(new RuntimeContactMemoryWorld());
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { dizzyPoints: 20, dizzyPointsMax: 20 });
    const transitions: string[] = [];

    world.applyResolvedHit(attacker, defender, move(), {
      kind: "hit",
      damage: 0,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
      dizzyPoints: -20,
    }, hooks({
      applyDizzyState: (target, moveArg) => transitions.push(`${target.id}:${moveArg.actionId}`),
    }));

    world.applyResolvedHit(attacker, defender, move(), {
      kind: "hit",
      damage: 0,
      kill: true,
      pause: 1,
      stun: 1,
      push: 0,
      powerGain: 0,
      dizzyPoints: -20,
    }, hooks({
      applyDizzyState: () => transitions.push("unexpected"),
    }));

    expect(defender.runtime.dizzyPoints).toBe(0);
    expect(transitions).toEqual(["p2:200"]);
  });

  it("applies guarded cornerpush to the attacker at stage bounds", () => {
    const world = new RuntimeDirectCombatWorld(new RuntimeContactMemoryWorld());
    const attacker = actor("p1", "Attacker", { facing: 1, pos: { x: 220, y: 0 }, vel: { x: 0, y: 0 } });
    const defender = actor("p2", "Defender", {
      facing: -1,
      pos: { x: 286, y: 0 },
      vel: { x: 0, y: 0 },
      bodyWidth: { front: 39, back: 39 },
    });

    world.applyResolvedHit(attacker, defender, move(), {
      kind: "guard",
      damage: 0,
      kill: true,
      pause: 1,
      stun: 2,
      push: 8,
      cornerPush: 6,
      powerGain: 0,
    }, hooks(), { stageBounds: { left: -320, right: 320 } });

    expect(defender.runtime.vel.x).toBe(8);
    expect(attacker.runtime.vel.x).toBe(-6);
  });

  it("applies authored down.velocity X in attacker-relative coordinates", () => {
    const world = new RuntimeDirectCombatWorld(new RuntimeContactMemoryWorld());
    const attacker = actor("p1", "Attacker", { facing: 1 });
    const defender = actor("p2", "Defender", {
      stateType: "L",
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    });

    world.applyResolvedHit(attacker, defender, move({ downVelocityX: 3 }), {
      kind: "hit",
      damage: 0,
      kill: true,
      pause: 1,
      stun: 20,
      push: 8,
      hitVelocityX: 3,
      hitVelocityZ: 2.25,
      powerGain: 0,
    }, hooks());

    expect(defender.runtime.vel.x).toBe(-3);
    expect(defender.runtime.hitVelocity?.x).toBe(-3);
    expect(defender.runtime.hitVelocity?.z).toBe(2.25);
    expect(defender.runtime.combatDepth?.velocity).toBe(2.25);
  });
});

type ActorOverrides = Partial<CharacterRuntimeState> &
  Partial<Pick<RuntimeDirectCombatActor, "currentMove" | "moveTick" | "hasHit" | "hitPause" | "hitStun" | "hitDefTargets" | "pendingHitDefTargets" | "playerId" | "playerNo" | "rootId" | "definition">>;

function actor(id: string, label: string, overrides: ActorOverrides = {}): RuntimeDirectCombatActor & { removedExplodsOnGetHit: number } {
  const state = runtimeState(overrides);
  let removedExplodsOnGetHit = 0;
  return {
    id,
    playerId: overrides.playerId,
    playerNo: overrides.playerNo,
    rootId: overrides.rootId,
    label,
    definition: overrides.definition ?? { constants: {} },
    runtime: state,
    currentMove: overrides.currentMove,
    moveTick: overrides.moveTick ?? 0,
    hitStun: overrides.hitStun ?? 0,
    hitPause: overrides.hitPause ?? 0,
    hasHit: overrides.hasHit ?? false,
    hitDefTargets: overrides.hitDefTargets,
    pendingHitDefTargets: overrides.pendingHitDefTargets,
    contact: createRuntimeContactMemory(),
    get removedExplodsOnGetHit() {
      return removedExplodsOnGetHit;
    },
    effectActorWorld: {
      removeExplodsOnGetHit: () => {
        removedExplodsOnGetHit += 1;
      },
    },
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState>): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 100,
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

function move(overrides: Partial<DemoMove> = {}): DemoMove {
  return {
    actionId: 200,
    startup: 0,
    activeStart: 0,
    activeEnd: 3,
    recovery: 4,
    damage: 30,
    hitPause: 6,
    hitStun: 12,
    push: 5,
    hitbox: { x1: 0, y1: -40, x2: 40, y2: -10 },
    ...overrides,
  };
}

function hooks(overrides: Partial<RuntimeDirectCombatHooks> = {}): RuntimeDirectCombatHooks {
  return {
    applyGuardHit: () => undefined,
    applyHitStateTransitions: () => undefined,
    applyDefaultGetHit: () => undefined,
    ...overrides,
  };
}

function priorityHooks(overrides: Partial<RuntimeDirectPriorityHooks> = {}): RuntimeDirectPriorityHooks {
  return {
    isMoveActive: () => true,
    worldBox: (state, source) => ({
      x1: state.pos.x + source.x1,
      y1: state.pos.y + source.y1,
      x2: state.pos.x + source.x2,
      y2: state.pos.y + source.y2,
    }),
    boxesIntersect: (left, right) =>
      left.x1 <= right.x2 && left.x2 >= right.x1 && left.y1 <= right.y2 && left.y2 >= right.y1,
    ...overrides,
  };
}

class RecordingContactWorld extends RuntimeContactMemoryWorld {
  readonly calls: string[] = [];

  override markMoveContact(
    memory: RuntimeContactMemory,
    stateNo: number,
    kind: Extract<RuntimeContactKind, "hit" | "guard">,
    targetActorId?: string,
  ): void {
    this.calls.push(`move:${kind}:${stateNo}:${targetActorId ?? "none"}`);
    super.markMoveContact(memory, stateNo, kind, targetActorId);
  }

  override markReceivedDamage(memory: RuntimeContactMemory, stateNo: number, damage: number): void {
    this.calls.push(`received:${stateNo}:${damage}`);
    super.markReceivedDamage(memory, stateNo, damage);
  }
}

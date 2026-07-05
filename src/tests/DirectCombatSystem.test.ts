import { describe, expect, it } from "vitest";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import {
  createRuntimeContactMemory,
  RuntimeContactMemoryWorld,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
  runtimeReceivedDamageValue,
  type RuntimeContactKind,
  type RuntimeContactMemory,
} from "../mugen/runtime/ContactMemorySystem";
import {
  RuntimeDirectCombatWorld,
  type RuntimeDirectCombatActor,
  type RuntimeDirectCombatHooks,
  type RuntimeDirectPriorityHooks,
} from "../mugen/runtime/DirectCombatSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

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

  it("resolves bounded equal-priority direct HitDef trades", () => {
    const world = new RuntimeDirectCombatWorld();
    const left = actor("p1", "P1", { currentMove: move({ priority: 4 }), moveTick: 1 });
    const right = actor("p2", "P2", { currentMove: move({ priority: 4 }), moveTick: 1 });

    const outcome = world.resolvePriorityClash(left, right, priorityHooks());

    expect(outcome).toEqual({
      kind: "trade",
      message: "HitDef priority clash: P1 priority 4 traded with P2 priority 4",
    });
    expect(left.hasHit).toBe(true);
    expect(right.hasHit).toBe(true);
  });

  it("skips priority clashes for inactive, consumed, reversal, or separated attacks", () => {
    const world = new RuntimeDirectCombatWorld();
    expect(world.resolvePriorityClash(
      actor("p1", "P1", { currentMove: move({ priority: 6 }), hasHit: true }),
      actor("p2", "P2", { currentMove: move({ priority: 3 }) }),
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
    const attacker = actor("p1", "Attacker", { power: 18, powerMax: 24, facing: 1, stateNo: 200 });
    const defender = actor("p2", "Defender", {
      life: 8,
      currentMove: move(),
      moveTick: 9,
      hasHit: true,
      guardStun: 99,
      guarding: false,
      stateNo: 130,
    });
    let guardHookCount = 0;
    const guardMove = move({ kill: true, guardKill: false });

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
    }, hooks({ applyGuardHit: () => { guardHookCount += 1; } }));

    expect(outcome).toEqual({ kind: "guard", damage: 11, message: "Defender guarded Attacker for 11" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.hitPause).toBe(4);
    expect(attacker.runtime.power).toBe(24);
    expect(defender.hitPause).toBe(4);
    expect(defender.currentMove).toBeUndefined();
    expect(defender.moveTick).toBe(0);
    expect(defender.hasHit).toBe(false);
    expect(defender.runtime.life).toBe(1);
    expect(defender.runtime.guardStun).toBe(7);
    expect(defender.runtime.guardSlideTime).toBe(5);
    expect(defender.runtime.guardControlTime).toBe(6);
    expect(defender.runtime.guarding).toBe(true);
    expect(defender.runtime.ctrl).toBe(false);
    expect(defender.runtime.vel).toEqual({ x: 3, y: -1 });
    expect(defender.runtime.hitVelocity).toEqual({ x: 3, y: -1 });
    expect(defender.runtime.hitVars).toEqual({
      damage: 11,
      animType: 0,
      groundType: 1,
      airType: 1,
      isBound: false,
      hitShakeTime: 4,
      hitTime: 7,
      guarded: true,
      kill: false,
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

  it("applies bounded hit results, hitFall metadata, and received damage", () => {
    const contactWorld = new RecordingContactWorld();
    const world = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "Attacker", { power: 20, facing: -1, stateNo: 210, pos: { x: 40, y: -10 } });
    const defender = actor("p2", "Defender", {
      life: 80,
      currentMove: move(),
      guardStun: 9,
      guardSlideTime: 4,
      guardControlTime: 6,
      guarding: true,
      stateNo: 5000,
    });
    const transitions: string[] = [];
    const combatMove = move({
      guardKill: false,
      hitVars: { hitId: 77, chainId: 43, hitCount: 3, hitOffset: { x: 16, y: -24 }, animType: 3, groundType: 2, airType: 4, yAccel: 0.62 },
      fall: {
        enabled: true,
        damage: 7,
        defenceUp: 50,
        kill: false,
        recover: true,
        recoverTime: 20,
        velocity: { x: 5, y: -7 },
      },
    });

    const outcome = world.applyResolvedHit(attacker, defender, combatMove, {
      kind: "hit",
      damage: 30,
      kill: true,
      pause: 6,
      stun: 13,
      push: 4,
      hitVelocityY: -2,
      powerGain: 35,
    }, hooks({
      applyHitStateTransitions: () => transitions.push("state-transition"),
      applyDefaultGetHit: () => transitions.push("default-gethit"),
    }));

    expect(outcome).toEqual({ kind: "hit", damage: 30, message: "Attacker hit Defender for 30" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.hitPause).toBe(6);
    expect(attacker.runtime.power).toBe(55);
    expect(defender.hitPause).toBe(6);
    expect(defender.hitStun).toBe(13);
    expect(defender.runtime.life).toBe(50);
    expect(defender.runtime.guardStun).toBe(0);
    expect(defender.runtime.guardSlideTime).toBe(0);
    expect(defender.runtime.guardControlTime).toBe(0);
    expect(defender.runtime.guarding).toBe(false);
    expect(defender.runtime.vel).toEqual({ x: -4, y: -2 });
    expect(defender.runtime.pos).toEqual({ x: 24, y: -34 });
    expect(defender.runtime.hitVelocity).toEqual({ x: -4, y: -2 });
    expect(defender.runtime.hitVars).toEqual({
      damage: 30,
      hitId: 77,
      chainId: 43,
      hitCount: 3,
      hitOffset: { x: 16, y: -24 },
      animType: 3,
      groundType: 2,
      airType: 4,
      yAccel: 0.62,
      isBound: false,
      hitShakeTime: 6,
      hitTime: 13,
      kill: true,
    });
    expect(defender.runtime.hitFall).toMatchObject({
      falling: true,
      damage: 7,
      defenceUp: 50,
      kill: false,
      recover: true,
      recoverTime: 20,
      downRecover: true,
      velocity: { x: -5, y: -7 },
    });
    expect(transitions).toEqual(["state-transition", "default-gethit"]);
    expect(defender.removedExplodsOnGetHit).toBe(1);
    expect(attacker.contact).toMatchObject({ moveContactState: 210, moveHitState: 210, moveHitTime: 0 });
    expect(contactWorld.calls).toEqual(["move:hit:210:p2", "received:5000:30"]);
    expect(runtimeMoveContactValue(attacker.contact, 210, "hit")).toBe(0);
    expect(runtimeMoveHitCountValue(attacker.contact, 210, false)).toBe(1);
    expect(runtimeReceivedDamageValue(defender.contact, 5000)).toBe(30);
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
});

type ActorOverrides = Partial<CharacterRuntimeState> &
  Partial<Pick<RuntimeDirectCombatActor, "currentMove" | "moveTick" | "hasHit" | "hitPause" | "hitStun">>;

function actor(id: string, label: string, overrides: ActorOverrides = {}): RuntimeDirectCombatActor & { removedExplodsOnGetHit: number } {
  const state = runtimeState(overrides);
  let removedExplodsOnGetHit = 0;
  return {
    id,
    label,
    definition: { constants: {} },
    runtime: state,
    currentMove: overrides.currentMove,
    moveTick: overrides.moveTick ?? 0,
    hitStun: overrides.hitStun ?? 0,
    hitPause: overrides.hitPause ?? 0,
    hasHit: overrides.hasHit ?? false,
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

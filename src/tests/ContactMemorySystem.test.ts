import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import {
  advanceRuntimeContactTimers,
  applyRuntimeHitAdd,
  createRuntimeContactMemory,
  createRuntimeContactMemoryWithPersistedHitCount,
  createRuntimeContactMemoryWithPersistedMoveHit,
  hasRuntimeProjectileContact,
  markRuntimeMoveContact,
  markRuntimeProjectileContact,
  markRuntimeReceivedDamage,
  markRuntimeMoveReversed,
  resetRuntimeMoveContact,
  RuntimeContactControllerDispatchWorld,
  RuntimeContactMemoryWorld,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
  runtimeMoveReversedValue,
  markRuntimeProjectileCancel,
  runtimeProjectileCancelTime,
  runtimeProjectileContactTime,
  runtimeReceivedDamageValue,
  runtimeReceivedHitsValue,
} from "../mugen/runtime/ContactMemorySystem";

describe("ContactMemorySystem", () => {
  it("tracks direct hit counts and keeps HitAdd separate from uniqueness", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeMoveContact(memory, 200, "hit", "p2");
    markRuntimeMoveContact(memory, 200, "hit", "p2");
    applyRuntimeHitAdd(memory, 200, 2);

    expect(runtimeMoveHitCountValue(memory, 200, false)).toBe(4);
    expect(runtimeMoveHitCountValue(memory, 200, true)).toBe(1);
    expect(runtimeMoveContactValue(memory, 200, "hit")).toBe(0);

    advanceRuntimeContactTimers(memory);

    expect(runtimeMoveContactValue(memory, 200, "contact")).toBe(1);
    expect(runtimeMoveContactValue(memory, 200, "hit")).toBe(1);
  });

  it("resets only direct move-contact memory", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeMoveContact(memory, 200, "hit", "p2");
    markRuntimeProjectileContact(memory, 200, 77, "hit");
    resetRuntimeMoveContact(memory);

    expect(runtimeMoveHitCountValue(memory, 200, false)).toBe(0);
    expect(hasRuntimeProjectileContact(memory, 200, "hit", 77)).toBe(true);
  });

  it("tracks projectile contact ids and timers", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeProjectileContact(memory, 200, 77, "guard");
    advanceRuntimeContactTimers(memory);
    advanceRuntimeContactTimers(memory);

    expect(hasRuntimeProjectileContact(memory, 200, "guard", 77)).toBe(true);
    expect(hasRuntimeProjectileContact(memory, 200, "guard", 99)).toBe(false);
    expect(runtimeProjectileContactTime(memory, 200, "guard", 77)).toBe(2);
    expect(runtimeProjectileContactTime(memory, 200, "guard", 99)).toBe(-1);
    expect(runtimeMoveContactValue(memory, 200, "guard")).toBe(2);
    expect(runtimeMoveHitCountValue(memory, 200, false)).toBe(0);
  });

  it("feeds projectile hits into move hit counts with unique targets", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeProjectileContact(memory, 200, 77, "hit", "p2");
    markRuntimeProjectileContact(memory, 200, 77, "hit", "p2");
    markRuntimeProjectileContact(memory, 200, 77, "hit", "p3");

    expect(hasRuntimeProjectileContact(memory, 200, "hit", 77)).toBe(true);
    expect(runtimeMoveContactValue(memory, 200, "hit")).toBe(0);
    expect(runtimeMoveHitCountValue(memory, 200, false)).toBe(3);
    expect(runtimeMoveHitCountValue(memory, 200, true)).toBe(2);
  });

  it("persists only hit counts into a new state for hitcountpersist", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeProjectileContact(memory, 200, 77, "hit", "p2");
    advanceRuntimeContactTimers(memory);

    const persisted = createRuntimeContactMemoryWithPersistedHitCount(memory, 342);

    expect(runtimeMoveHitCountValue(persisted, 342, false)).toBe(1);
    expect(runtimeMoveHitCountValue(persisted, 342, true)).toBe(1);
    expect(runtimeMoveContactValue(persisted, 342, "hit")).toBe(0);
    expect(runtimeMoveContactValue(persisted, 342, "contact")).toBe(0);
    expect(hasRuntimeProjectileContact(persisted, 342, "hit", 77)).toBe(false);
  });

  it("persists only Move* trigger memory into a new state for movehitpersist", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeProjectileContact(memory, 200, 77, "hit", "p2");
    markRuntimeMoveReversed(memory, 200);
    advanceRuntimeContactTimers(memory);

    const persisted = createRuntimeContactMemoryWithPersistedMoveHit(memory, 344);

    expect(runtimeMoveContactValue(persisted, 344, "contact")).toBe(1);
    expect(runtimeMoveContactValue(persisted, 344, "hit")).toBe(1);
    expect(runtimeMoveReversedValue(persisted, 344)).toBe(1);
    expect(runtimeMoveHitCountValue(persisted, 344, false)).toBe(0);
    expect(runtimeMoveHitCountValue(persisted, 344, true)).toBe(0);
    expect(hasRuntimeProjectileContact(persisted, 344, "hit", 77)).toBe(false);
  });

  it("tracks projectile cancel ids and timers separately from contact", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeProjectileContact(memory, 200, 77, "hit");
    markRuntimeProjectileCancel(memory, 200, 88);
    advanceRuntimeContactTimers(memory);

    expect(runtimeProjectileContactTime(memory, 200, "hit", 77)).toBe(1);
    expect(runtimeProjectileCancelTime(memory, 200, 88)).toBe(1);
    expect(runtimeProjectileCancelTime(memory, 200, 77)).toBe(-1);
    expect(runtimeProjectileCancelTime(memory, 200)).toBe(1);
    expect(runtimeProjectileCancelTime(memory, 201, 88)).toBe(-1);
  });

  it("stores bounded received damage and hit counts per state", () => {
    const memory = createRuntimeContactMemory();

    markRuntimeReceivedDamage(memory, 5000, 30.6);
    markRuntimeReceivedDamage(memory, 5000, -5);

    expect(runtimeReceivedDamageValue(memory, 5000)).toBe(0);
    expect(runtimeReceivedHitsValue(memory, 5000)).toBe(2);
    expect(runtimeReceivedDamageValue(memory, 5001)).toBe(0);
    expect(runtimeReceivedHitsValue(memory, 5001)).toBe(0);
  });

  it("wraps contact memory mutation and readback behind RuntimeContactMemoryWorld", () => {
    const world = new RuntimeContactMemoryWorld();
    const memory = world.create();

    world.markMoveContact(memory, 200, "hit", "p2");
    world.applyHitAdd(memory, 200, 2);
    world.markMoveReversed(memory, 200);
    world.markReceivedDamage(memory, 5000, 31);
    world.markProjectileContact(memory, 200, 77, "guard");
    world.markProjectileCancel(memory, 200, 88);
    world.advance(memory);

    expect(world.moveContactValue(memory, 200, "hit")).toBe(1);
    expect(world.moveHitCountValue(memory, 200, false)).toBe(3);
    expect(world.moveHitCountValue(memory, 200, true)).toBe(1);
    expect(world.moveReversedValue(memory, 200)).toBe(1);
    expect(world.receivedDamageValue(memory, 5000)).toBe(31);
    expect(world.receivedHitsValue(memory, 5000)).toBe(1);
    expect(world.hasProjectileContact(memory, 200, "guard", 77)).toBe(true);
    expect(world.projectileContactTime(memory, 200, "guard", 77)).toBe(1);
    expect(world.projectileCancelTime(memory, 200, 88)).toBe(1);

    world.resetMoveContact(memory);

    expect(world.moveHitCountValue(memory, 200, false)).toBe(0);
    expect(world.hasProjectileContact(memory, 200, "guard", 77)).toBe(true);
  });

  it("wraps hitcountpersist count cloning behind RuntimeContactMemoryWorld", () => {
    const world = new RuntimeContactMemoryWorld();
    const memory = world.create();

    world.markMoveContact(memory, 200, "hit", "p2");

    const persisted = world.createWithPersistedHitCount(memory, 342);

    expect(world.moveHitCountValue(persisted, 342, false)).toBe(1);
    expect(world.moveContactValue(persisted, 342, "hit")).toBe(0);
  });

  it("wraps combined StateDef contact persistence behind RuntimeContactMemoryWorld", () => {
    const world = new RuntimeContactMemoryWorld();
    const memory = world.create();

    world.markMoveContact(memory, 200, "hit", "p2");
    world.advance(memory);

    const persisted = world.createWithStatePersistence(memory, 344, { moveHit: true, hitCount: true });

    expect(world.moveContactValue(persisted, 344, "hit")).toBe(1);
    expect(world.moveHitCountValue(persisted, 344, false)).toBe(1);
  });

  it("dispatches active HitAdd controllers with telemetry hooks", () => {
    const world = new RuntimeContactControllerDispatchWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const actor = { contact: contactWorld.create(), runtime: { stateNo: 200 } };
    const ir = compileControllerIr(controller("HitAdd", { value: "2" }));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      contactWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(contactWorld.moveHitCountValue(actor.contact, 200, false)).toBe(2);
    expect(recordedControllers).toEqual(["HitAdd"]);
    expect(recordedOperations).toEqual(["contact:hitadd"]);
    expect(result).toEqual({
      applied: true,
      controllerType: "hitadd",
      recordedController: true,
      recordedOperation: true,
    });
  });

  it("dispatches active MoveHitReset controllers with telemetry hooks", () => {
    const world = new RuntimeContactControllerDispatchWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const actor = { contact: contactWorld.create(), runtime: { stateNo: 200 } };
    contactWorld.markMoveContact(actor.contact, 200, "hit", "p2");
    const ir = compileControllerIr(controller("MoveHitReset", {}));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      contactWorld,
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(contactWorld.moveHitCountValue(actor.contact, 200, false)).toBe(0);
    expect(recordedOperations).toEqual(["contact:movehitreset"]);
    expect(result).toEqual({
      applied: true,
      controllerType: "movehitreset",
      recordedController: false,
      recordedOperation: true,
    });
  });
});

function controller(type: string, params: Record<string, string> = {}) {
  return {
    stateId: 200,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

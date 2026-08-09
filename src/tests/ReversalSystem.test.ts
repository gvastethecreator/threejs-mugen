import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { CollisionBox } from "../mugen/model/CollisionBox";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  createRuntimeContactMemory,
  RuntimeContactMemoryWorld,
  runtimeMoveReversedValue,
  runtimeReceivedDamageValue,
  runtimeReceivedHitsValue,
  type RuntimeContactMemory,
} from "../mugen/runtime/ContactMemorySystem";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import {
  RuntimeReversalControllerDispatchWorld,
  RuntimeReversalWorld,
  type RuntimeReversalActor,
  type RuntimeReversalHooks,
} from "../mugen/runtime/ReversalSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("ReversalSystem", () => {
  it("dispatches active ReversalDef controllers with telemetry hooks", () => {
    const world = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const fighter = actor("p1", "Reverser", { stateNo: 300 });
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];
    const ir = compileControllerIr(controller("ReversalDef", {
      "reversal.attr": "SA,AA",
      attr: "S,SP",
      guardflag: "A",
      pausetime: "5",
      numhits: "3",
      p1stateno: "777",
      p2stateno: "778",
      p2getp1state: "0",
      p2facing: "-1",
      id: "9",
      "attack.depth": "6",
      unhittabletime: "2,9",
    }));

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      hitbox: { x1: 1, y1: -40, x2: 32, y2: -8 },
      reversalWorld: world,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result).toMatchObject({
      activated: true,
      recordedController: true,
      recordedOperation: true,
    });
    expect(result.operation).toMatchObject({
      kind: "reversaldef",
      attr: "SA,AA",
      hitDefAttr: "S,SP",
      guardFlag: "A",
      hitPause: 5,
      hitCount: 3,
      p1StateNo: 777,
      p2StateNo: 778,
      p2GetP1State: false,
      p2Facing: -1,
      targetId: 9,
      attackDepth: [6, 6],
      unhittableTime: [2, 9],
    });
    expect(fighter.currentMove).toMatchObject({
      isReversal: true,
      reversalAttr: "SA,AA",
      attr: "S,SP",
      guardFlag: "A",
      hitPause: 5,
      hitVars: { hitCount: 3 },
      p1StateNo: 777,
      p2StateNo: 778,
      p2GetP1State: false,
      p2Facing: -1,
      targetId: 9,
      attackDepth: [6, 6],
      unhittableTime: [2, 9],
    });
    expect(recordedControllers).toEqual(["ReversalDef"]);
    expect(recordedOperations).toEqual(["reversaldef"]);
    expect(fighter.runtime.reversal?.attackDepth).toEqual([6, 6]);
    expect(fighter.runtime.reversal?.unhittableTime).toEqual([2, 9]);
    expect(fighter.runtime.reversal).toMatchObject({
      hitDefAttr: "S,SP",
      guardFlag: "A",
      hitCount: 3,
      p2GetP1State: false,
      p2Facing: -1,
    });
  });

  it("derives omitted ReversalDef receiver unhittabletime from attacker pausetime", () => {
    const world = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const reverser = actor("p2", "Reverser", { stateNo: 300, unhittableTime: 4 });
    const attacker = actor("p1", "Attacker", { currentMove: move(), currentMoveLabel: "Punch" });
    const ir = compileControllerIr(controller("ReversalDef", {
      "reversal.attr": "S,NA",
      attr: "S,SP",
      pausetime: "5,2",
    }));

    dispatchWorld.apply({ actor: reverser, controller: ir, hitbox: box(), reversalWorld: world });
    expect(reverser.currentMove?.unhittableTime).toEqual([-1, 6]);

    world.apply(reverser, attacker, reverser.currentMove!, hooks());
    expect(reverser.runtime.unhittableTime).toBe(4);
    expect(attacker.runtime.unhittableTime).toBe(6);
  });

  it("mutates an active ReversalDef in place without clearing contact state", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const fighter = actor("p1", "Reverser", { stateNo: 300 });
    reversalWorld.activate(fighter, {
      attr: "S,SP",
      hitbox: { x1: 1, y1: -40, x2: 32, y2: -8 },
      hitPause: 3,
      p1StateNo: 777,
      p2StateNo: 779,
      targetId: 9,
      attackDepth: [1, 2],
    });
    const activeMove = fighter.currentMove;
    const activeReversal = fighter.runtime.reversal;
    fighter.moveTick = 6;
    fighter.hasHit = true;
    fighter.hitDefTargets = ["p2"];
    fighter.pendingHitDefTargets = ["p3"];
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.modify({
      actor: fighter,
      controller: compileControllerIr(controller("ModifyReversalDef", {
        "reversal.attr": "S,NA",
        attr: "C,HP",
        guardflag: "H",
        pausetime: "7,11",
        numhits: "4",
        p1stateno: "778",
        p2stateno: "780",
        p2facing: "1",
        id: "92",
        "attack.depth": "4,8",
        redirectid: "57",
      })),
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result).toMatchObject({
      modified: true,
      operation: {
        kind: "modifyreversaldef",
        reversalAttr: "S,NA",
        hitDefAttr: "C,HP",
        guardFlag: "H",
        hitPause: 7,
        hitCount: 4,
        p1StateNo: 778,
        p2StateNo: 780,
        targetId: 92,
        attackDepth: [4, 8],
      },
    });
    expect(fighter.currentMove).toBe(activeMove);
    expect(fighter.runtime.reversal).toBe(activeReversal);
    expect(fighter.currentMove).toMatchObject({
      isReversal: true,
      reversalAttr: "S,NA",
      attr: "C,HP",
      guardFlag: "H",
      hitPause: 7,
      hitVars: { hitCount: 4 },
      p1StateNo: 778,
      p2StateNo: 780,
      targetId: 92,
      attackDepth: [4, 8],
    });
    expect(fighter.runtime.reversal).toMatchObject({
      attr: "S,NA",
      hitDefAttr: "C,HP",
      guardFlag: "H",
      hitPause: 7,
      hitCount: 4,
      p1StateNo: 778,
      p2StateNo: 780,
      p2Facing: 1,
      attackDepth: [4, 8],
    });
    expect(fighter.currentMove?.attackDepth).not.toBe(fighter.runtime.reversal?.attackDepth);
    expect(fighter.moveTick).toBe(6);
    expect(fighter.hasHit).toBe(true);
    expect(fighter.hitDefTargets).toEqual(["p2"]);
    expect(fighter.pendingHitDefTargets).toEqual(["p3"]);
    expect(recordedControllers).toEqual(["ModifyReversalDef"]);
    expect(recordedOperations).toEqual(["modifyreversaldef"]);

    const attacker = actor("p2", "Attacker", { stateNo: 200, currentMove: move(), currentMoveLabel: "Punch" });
    reversalWorld.apply(fighter, attacker, fighter.currentMove!, hooks());

    expect(runtimeReceivedDamageValue(attacker.contact, 200)).toBe(0);
    expect(runtimeReceivedHitsValue(attacker.contact, 200)).toBe(4);
  });

  it("applies static ReversalDef sprite priorities after a ModifyReversalDef mutation", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const reverser = actor("p2", "Reverser", { spritePriority: 1 });
    const attacker = actor("p1", "Attacker", { spritePriority: 2, currentMove: move(), currentMoveLabel: "Punch" });
    reverser.definition = { constants: {}, hitDefPriorityProfile: "mugen-1.1" };

    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: box(),
      hitPause: 3,
      p1SpritePriority: 4,
      p2SpritePriority: -3,
    });

    const modified = dispatchWorld.modify({
      actor: reverser,
      controller: compileControllerIr(controller("ModifyReversalDef", {
        p1sprpriority: "5",
        p2sprpriority: "-4",
        redirectid: "57",
      })),
    });

    expect(modified).toMatchObject({
      modified: true,
      operation: { kind: "modifyreversaldef", p1SpritePriority: 5, p2SpritePriority: -4 },
    });
    expect(reverser.currentMove).toMatchObject({ p1SpritePriority: 5, p2SpritePriority: -4 });
    expect(reverser.runtime.reversal).toMatchObject({ p1SpritePriority: 5, p2SpritePriority: -4 });

    reversalWorld.apply(reverser, attacker, reverser.currentMove!, hooks());

    expect(reverser.runtime).toMatchObject({
      spritePriority: 5,
      hitDefSpritePriority: {
        profile: "mugen-1.1",
        role: "p1",
        contactKind: "hit",
        previousValue: 1,
        source: "authored",
        supported: true,
      },
    });
    expect(attacker.runtime).toMatchObject({
      spritePriority: -4,
      hitDefSpritePriority: {
        profile: "mugen-1.1",
        role: "p2",
        contactKind: "hit",
        previousValue: 2,
        source: "authored",
        supported: true,
      },
    });
  });

  it("mutates static ReversalDef missonoverride without replacing its active state", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const reverser = actor("p2", "Reverser");
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: box(),
      hitPause: 3,
      p1StateNo: 777,
      missOnOverride: true,
    });
    const activeMove = reverser.currentMove;
    const activeReversal = reverser.runtime.reversal;

    const modified = dispatchWorld.modify({
      actor: reverser,
      controller: compileControllerIr(controller("ModifyReversalDef", {
        missonoverride: "0",
        redirectid: "57",
      })),
    });

    expect(modified).toMatchObject({
      modified: true,
      operation: { kind: "modifyreversaldef", missOnOverride: false },
    });
    expect(reverser.currentMove).toBe(activeMove);
    expect(reverser.runtime.reversal).toBe(activeReversal);
    expect(reverser.currentMove).toMatchObject({ p1StateNo: 777, missOnOverride: false });
    expect(reverser.runtime.reversal).toMatchObject({ p1StateNo: 777, missOnOverride: false });
  });

  it("blocks ModifyReversalDef without an active reversal or typed operation", () => {
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const fighter = actor("p1", "Reverser");
    const operation = compileControllerIr(controller("ModifyReversalDef", { "reversal.attr": "S,NA", redirectid: "57" }));
    const unsupported = compileControllerIr(controller("ModifyReversalDef", { "reversal.attr": "S,NA" }));

    expect(dispatchWorld.modify({ actor: fighter, controller: operation })).toMatchObject({
      modified: false,
      reason: "missing-active-reversal",
    });
    expect(dispatchWorld.modify({ actor: fighter, controller: unsupported })).toMatchObject({
      modified: false,
      reason: "unsupported-operation",
    });
  });

  it("modifies p2getp1state in place and sends the target through its own state route", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const reverser = actor("p2", "Reverser", { stateNo: 300 });
    const attacker = actor("p1", "Attacker", { stateNo: 200, currentMove: move(), currentMoveLabel: "Punch" });
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: box(),
      hitPause: 3,
      p1StateNo: 777,
      p2StateNo: 888,
    });
    const activeMove = reverser.currentMove;
    const activeReversal = reverser.runtime.reversal;

    const result = dispatchWorld.modify({
      actor: reverser,
      controller: compileControllerIr(controller("ModifyReversalDef", { p2getp1state: "0", redirectid: "57" })),
    });

    expect(result).toMatchObject({
      modified: true,
      operation: { kind: "modifyreversaldef", p2GetP1State: false },
    });
    expect(reverser.currentMove).toBe(activeMove);
    expect(reverser.runtime.reversal).toBe(activeReversal);
    expect(reverser.currentMove).toMatchObject({ p2StateNo: 888, p2GetP1State: false });
    expect(reverser.runtime.reversal).toMatchObject({ p2StateNo: 888, p2GetP1State: false });

    const calls: string[] = [];
    reversalWorld.apply(reverser, attacker, reverser.currentMove!, hooks({
      enterTargetHitState: (_target, _owner, stateNo, getP1State) => calls.push(`${stateNo}:${getP1State}`),
    }));

    expect(calls).toEqual(["888:false"]);
  });

  it("applies p2facing to the reversed attacker and leaves zero unchanged", () => {
    for (const [p2Facing, initialFacing, expectedFacing] of [
      [-3, 1, -1],
      [2, -1, 1],
      [0, 1, 1],
    ] as const) {
      const reversalWorld = new RuntimeReversalWorld();
      const reverser = actor("p2", "Reverser", { facing: -1 });
      const attacker = actor("p1", "Attacker", { facing: initialFacing, currentMove: move(), currentMoveLabel: "Punch" });
      reversalWorld.activate(reverser, {
        attr: "S,NA",
        hitbox: box(),
        hitPause: 3,
        p1StateNo: 777,
        p2Facing,
      });

      reversalWorld.apply(reverser, attacker, reverser.currentMove!, hooks());

      expect(attacker.runtime.facing).toBe(expectedFacing);
    }
  });

  it("uses the reverser facing from before its p1 state entry", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const reverser = actor("p2", "Reverser", { facing: -1 });
    const attacker = actor("p1", "Attacker", { facing: 1, currentMove: move(), currentMoveLabel: "Punch" });
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: box(),
      hitPause: 3,
      p1StateNo: 777,
      p2Facing: -1,
    });

    reversalWorld.apply(reverser, attacker, reverser.currentMove!, hooks({
      enterState: (target) => {
        target.runtime.facing = 1;
      },
    }));

    expect(reverser.runtime.facing).toBe(1);
    expect(attacker.runtime.facing).toBe(-1);
  });

  it("uses one received hit for a ReversalDef without numhits", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const reverser = actor("p2", "Reverser");
    const attacker = actor("p1", "Attacker", { stateNo: 200, currentMove: move(), currentMoveLabel: "Punch" });
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: box(),
      hitPause: 3,
      p1StateNo: 777,
    });

    reversalWorld.apply(reverser, attacker, reverser.currentMove!, hooks());

    expect(reverser.currentMove?.hitVars).toEqual({ hitCount: 1 });
    expect(runtimeReceivedDamageValue(attacker.contact, 200)).toBe(0);
    expect(runtimeReceivedHitsValue(attacker.contact, 200)).toBe(1);
  });

  it("modifies reversal.guardflag in place and filters matching guardable attacks", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const reverser = actor("p2", "Reverser");
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      reversalGuardFlag: "A",
      hitbox: box(),
      hitPause: 3,
    });
    const activeMove = reverser.currentMove;
    const activeReversal = reverser.runtime.reversal;
    const initialHigh = move({ attr: "S,NA", guardFlag: "H", hitbox: box() });

    expect(reversalWorld.findActive(reverser, initialHigh, initialHigh.hitbox, findHooks())).toBeUndefined();

    const result = dispatchWorld.modify({
      actor: reverser,
      controller: compileControllerIr(controller("ModifyReversalDef", { "reversal.guardflag": "H", redirectid: "57" })),
    });

    expect(result).toMatchObject({
      modified: true,
      operation: { kind: "modifyreversaldef", reversalGuardFlag: "H" },
    });
    expect(reverser.currentMove).toBe(activeMove);
    expect(reverser.runtime.reversal).toBe(activeReversal);
    expect(reverser.currentMove).toMatchObject({ reversalGuardFlag: "H" });
    expect(reverser.runtime.reversal).toMatchObject({ reversalGuardFlag: "H" });

    const high = move({ attr: "S,NA", guardFlag: "H", hitbox: box() });
    const middle = move({ attr: "S,NA", guardFlag: "M", hitbox: box() });
    const air = move({ attr: "S,NA", guardFlag: "A", hitbox: box() });

    expect(reversalWorld.findActive(reverser, high, high.hitbox, findHooks())).toBe(activeMove);
    expect(reversalWorld.findActive(reverser, middle, middle.hitbox, findHooks())).toBe(activeMove);
    expect(reversalWorld.findActive(reverser, air, air.hitbox, findHooks())).toBeUndefined();
    expect(reversalWorld.findActive(reverser, high, high.hitbox, findHooks(), { incomingUnguardable: true })).toBeUndefined();
  });

  it("modifies reversal.guardflag.not in place and bypasses it for unguardable attacks", () => {
    const reversalWorld = new RuntimeReversalWorld();
    const dispatchWorld = new RuntimeReversalControllerDispatchWorld();
    const reverser = actor("p2", "Reverser");
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      reversalGuardFlagNot: "H",
      hitbox: box(),
      hitPause: 3,
    });
    const activeMove = reverser.currentMove;
    const activeReversal = reverser.runtime.reversal;
    const initialHigh = move({ attr: "S,NA", guardFlag: "H", hitbox: box() });

    expect(reversalWorld.findActive(reverser, initialHigh, initialHigh.hitbox, findHooks())).toBeUndefined();

    const result = dispatchWorld.modify({
      actor: reverser,
      controller: compileControllerIr(controller("ModifyReversalDef", { "reversal.guardflag.not": "M", redirectid: "57" })),
    });

    expect(result).toMatchObject({
      modified: true,
      operation: { kind: "modifyreversaldef", reversalGuardFlagNot: "M" },
    });
    expect(reverser.currentMove).toBe(activeMove);
    expect(reverser.runtime.reversal).toBe(activeReversal);
    expect(reverser.currentMove).toMatchObject({ reversalGuardFlagNot: "M" });
    expect(reverser.runtime.reversal).toMatchObject({ reversalGuardFlagNot: "M" });

    const high = move({ attr: "S,NA", guardFlag: "H", hitbox: box() });
    const air = move({ attr: "S,NA", guardFlag: "A", hitbox: box() });

    expect(reversalWorld.findActive(reverser, high, high.hitbox, findHooks())).toBeUndefined();
    expect(reversalWorld.findActive(reverser, air, air.hitbox, findHooks())).toBe(activeMove);
    expect(reversalWorld.findActive(reverser, high, high.hitbox, findHooks(), { incomingUnguardable: true })).toBe(activeMove);
  });

  it("activates and clears bounded ReversalDef runtime state", () => {
    const world = new RuntimeReversalWorld();
    const fighter = actor("p1", "Reverser", { stateNo: 300 });
    fighter.hitDefTargets = ["p2"];
    fighter.pendingHitDefTargets = ["p4"];

    const activated = world.activate(fighter, {
      attr: "SA,AA",
      hitbox: { x1: 1, y1: -40, x2: 32, y2: -8 },
      label: "Counter",
      hitPause: 3,
      p1StateNo: 777,
      p2StateNo: 778,
      targetId: 9,
    });

    expect(activated).toBe(true);
    expect(fighter.hitDefTargets).toEqual([]);
    expect(fighter.pendingHitDefTargets).toEqual([]);
    expect(fighter.currentMove).toMatchObject({
      actionId: 300,
      isReversal: true,
      reversalAttr: "SA,AA",
      p1StateNo: 777,
      p2StateNo: 778,
      targetId: 9,
      hitPause: 3,
      hitbox: { x1: 1, y1: -40, x2: 32, y2: -8 },
    });
    expect(fighter.currentMoveLabel).toBe("Counter");
    expect(fighter.runtime.reversal).toEqual({ attr: "SA,AA", hitPause: 3, p1StateNo: 777, p2StateNo: 778 });

    expect(world.activate(fighter, { attr: "", hitPause: 0 })).toBe(false);
    expect(fighter.currentMove).toBeUndefined();
    expect(fighter.currentMoveLabel).toBeUndefined();
    expect(fighter.moveTick).toBe(0);
    expect(fighter.hasHit).toBe(false);
    expect(fighter.runtime.reversal).toBeUndefined();
  });

  it("finds active reversals only when active attr and boxes match", () => {
    const world = new RuntimeReversalWorld();
    const defender = actor("p2", "Defender", { pos: { x: 10, y: 0 } });
    const incoming = move({ attr: "SA,AA", hitbox: { x1: 10, y1: -20, x2: 20, y2: -5 } });
    world.activate(defender, {
      attr: "SA,AA",
      hitbox: { x1: 0, y1: -22, x2: 18, y2: -4 },
      hitPause: 4,
    });

    expect(world.findActive(defender, incoming, incoming.hitbox, findHooks())?.reversalAttr).toBe("SA,AA");
    expect(world.findActive(defender, move({ attr: "S,NA" }), incoming.hitbox, findHooks())).toBeUndefined();
    expect(world.findActive(defender, incoming, { x1: 200, y1: -20, x2: 220, y2: -5 }, findHooks())).toBeUndefined();
    expect(world.findActive(defender, incoming, incoming.hitbox, findHooks({ isMoveActive: () => false }))).toBeUndefined();
  });

  it("accepts any resolved world attack box for ReversalDef contact", () => {
    const world = new RuntimeReversalWorld();
    const defender = actor("p2", "Defender", { pos: { x: 10, y: 0 } });
    const incoming = move({ attr: "SA,AA", hitbox: { x1: 200, y1: -20, x2: 220, y2: -5 } });
    world.activate(defender, {
      attr: "SA,AA",
      hitbox: { x1: 0, y1: -22, x2: 18, y2: -4 },
      hitPause: 4,
    });

    expect(world.findActive(defender, incoming, [incoming.hitbox, { x1: 10, y1: -20, x2: 20, y2: -5 }], findHooks()))
      .toMatchObject({ isReversal: true, reversalAttr: "SA,AA" });
  });

  it("does not let canDefenderBeHit short-circuit ReversalDef detection", () => {
    const world = new RuntimeReversalWorld();
    const defender = actor("p2", "Defender", { pos: { x: 18, y: 0 } });
    const incoming = move({ attr: "SA,AA", hitbox: { x1: 10, y1: -20, x2: 20, y2: -5 } });
    world.activate(defender, {
      attr: "SA,AA",
      hitbox: { x1: 0, y1: -22, x2: 18, y2: -4 },
      hitPause: 4,
    });

    expect(world.findActive(defender, incoming, incoming.hitbox, findHooks({ canDefenderBeHit: () => false }))?.reversalAttr).toBe("SA,AA");
    const reversal = world.findActive(defender, incoming, incoming.hitbox, findHooks());
    expect(reversal?.reversalAttr).toBe("SA,AA");
  });

  it("applies bounded reversal result and delegates state routing through hooks", () => {
    const contactWorld = new RecordingContactWorld();
    const world = new RuntimeReversalWorld(contactWorld);
    const reverser = actor("p2", "Reverser", { power: 2990, powerMax: 3000, stateNo: 300, unhittableTime: 5 });
    const attacker = actor("p1", "Attacker", {
      stateNo: 200,
      currentMove: move(),
      currentMoveLabel: "Punch",
      moveTick: 4,
      hitStun: 9,
      guardStun: 7,
      guardSlideTime: 3,
      guardControlTime: 5,
      guarding: true,
    });
    const reversal = move({
      isReversal: true,
      reversalAttr: "SA,AA",
      hitPause: 6,
      p1StateNo: 777,
      p2StateNo: 778,
      targetId: 4,
      unhittableTime: [2, 11],
    });
    const calls: string[] = [];

    const result = world.apply(reverser, attacker, reversal, hooks({
      rememberTarget: (_source, _target, targetId) => calls.push(`target:${targetId}`),
      enterState: (_target, stateNo) => calls.push(`p1:${stateNo}`),
      enterTargetHitState: (_target, _owner, stateNo, getP1State) => calls.push(`p2:${stateNo}:${getP1State}`),
    }));

    expect(result.message).toBe("Reverser reversed Attacker p1->777 p2->778");
    expect(reverser.hasHit).toBe(true);
    expect(attacker.hasHit).toBe(true);
    expect(reverser.hitPause).toBe(6);
    expect(attacker.hitPause).toBe(6);
    expect(attacker.hitStun).toBe(0);
    expect(attacker.currentMove).toBeUndefined();
    expect(attacker.currentMoveLabel).toBeUndefined();
    expect(attacker.moveTick).toBe(0);
    expect(attacker.runtime.guardStun).toBe(0);
    expect(attacker.runtime.guardSlideTime).toBe(0);
    expect(attacker.runtime.guardControlTime).toBe(0);
    expect(attacker.runtime.guarding).toBe(false);
    expect(attacker.runtime.moveType).toBe("H");
    expect(attacker.runtime.hitTmp).toBe(-1);
    expect(attacker.runtime.unhittableTime).toBe(11);
    expect(reverser.runtime.unhittableTime).toBe(2);
    expect(attacker.removedExplodsOnGetHit).toBe(1);
    expect(reverser.runtime.power).toBe(3000);
    expect(contactWorld.calls).toEqual(["reversed:200"]);
    expect(runtimeMoveReversedValue(attacker.contact, 200)).toBe(0);
    expect(calls).toEqual(["target:4", "p1:777", "p2:778:true"]);
  });

  it("clears active reversal when p1 state cannot be entered", () => {
    const world = new RuntimeReversalWorld();
    const reverser = actor("p2", "Reverser");
    const attacker = actor("p1", "Attacker");
    world.activate(reverser, { attr: "SA,AA", hitbox: box(), hitPause: 0, p1StateNo: 777 });

    world.apply(reverser, attacker, move({ isReversal: true, reversalAttr: "SA,AA", p1StateNo: 777 }), hooks({
      canEnterState: () => false,
    }));

    expect(reverser.currentMove).toBeUndefined();
    expect(reverser.runtime.reversal).toBeUndefined();
    expect(reverser.hasHit).toBe(true);
  });
});

type ActorOverrides = Partial<CharacterRuntimeState> &
  Partial<Pick<RuntimeReversalActor, "currentMove" | "currentMoveLabel" | "moveTick" | "hasHit" | "hitPause" | "hitStun">>;

function actor(id: string, label: string, overrides: ActorOverrides = {}): RuntimeReversalActor & { removedExplodsOnGetHit: number } {
  let removedExplodsOnGetHit = 0;
  return {
    id,
    label,
    definition: { constants: {} },
    runtime: runtimeState(overrides),
    currentMove: overrides.currentMove,
    currentMoveLabel: overrides.currentMoveLabel,
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

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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
    attr: "SA,AA",
    hitPause: 4,
    hitStun: 12,
    push: 5,
    hitbox: box(),
    ...overrides,
  };
}

function box(): CollisionBox {
  return { x1: 0, y1: -40, x2: 40, y2: -10 };
}

function findHooks(
  overrides: Partial<Pick<RuntimeReversalHooks, "isMoveActive" | "worldBox" | "boxesIntersect" | "attrMatches" | "canDefenderBeHit">> =
    {},
) {
  return {
    isMoveActive: () => true,
    worldBox: (state: CharacterRuntimeState, source: CollisionBox) => ({
      x1: state.pos.x + source.x1,
      y1: state.pos.y + source.y1,
      x2: state.pos.x + source.x2,
      y2: state.pos.y + source.y2,
    }),
    boxesIntersect: (left: CollisionBox, right: CollisionBox) =>
      left.x1 <= right.x2 && left.x2 >= right.x1 && left.y1 <= right.y2 && left.y2 >= right.y1,
    attrMatches: (reversalAttr: string, incomingAttr: string) => reversalAttr === incomingAttr,
    ...overrides,
  };
}

function hooks(overrides: Partial<RuntimeReversalHooks> = {}): RuntimeReversalHooks {
  return {
    ...findHooks(),
    rememberTarget: () => undefined,
    canEnterState: () => true,
    enterState: () => undefined,
    enterTargetHitState: () => undefined,
    ...overrides,
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 300,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 300, ${type}]`,
  };
}

class RecordingContactWorld extends RuntimeContactMemoryWorld {
  readonly calls: string[] = [];

  override markMoveReversed(memory: RuntimeContactMemory, stateNo: number): void {
    this.calls.push(`reversed:${stateNo}`);
    super.markMoveReversed(memory, stateNo);
  }
}

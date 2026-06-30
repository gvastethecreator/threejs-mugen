import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { CollisionBox } from "../mugen/model/CollisionBox";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  createRuntimeContactMemory,
  RuntimeContactMemoryWorld,
  runtimeMoveReversedValue,
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
      pausetime: "5",
      p1stateno: "777",
      p2stateno: "778",
      id: "9",
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
      hitPause: 5,
      p1StateNo: 777,
      p2StateNo: 778,
      targetId: 9,
    });
    expect(fighter.currentMove).toMatchObject({
      isReversal: true,
      reversalAttr: "SA,AA",
      hitPause: 5,
      p1StateNo: 777,
      p2StateNo: 778,
      targetId: 9,
    });
    expect(recordedControllers).toEqual(["ReversalDef"]);
    expect(recordedOperations).toEqual(["reversaldef"]);
  });

  it("activates and clears bounded ReversalDef runtime state", () => {
    const world = new RuntimeReversalWorld();
    const fighter = actor("p1", "Reverser", { stateNo: 300 });

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

  it("applies bounded reversal result and delegates state routing through hooks", () => {
    const contactWorld = new RecordingContactWorld();
    const world = new RuntimeReversalWorld(contactWorld);
    const reverser = actor("p2", "Reverser", { power: 2990, powerMax: 3000, stateNo: 300 });
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
    const reversal = move({ isReversal: true, reversalAttr: "SA,AA", hitPause: 6, p1StateNo: 777, p2StateNo: 778, targetId: 4 });
    const calls: string[] = [];

    const result = world.apply(reverser, attacker, reversal, hooks({
      rememberTarget: (_source, _target, targetId) => calls.push(`target:${targetId}`),
      enterState: (_target, stateNo) => calls.push(`p1:${stateNo}`),
      enterTargetHitState: (_target, _owner, stateNo) => calls.push(`p2:${stateNo}`),
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
    expect(attacker.removedExplodsOnGetHit).toBe(1);
    expect(reverser.runtime.power).toBe(3000);
    expect(contactWorld.calls).toEqual(["reversed:200"]);
    expect(runtimeMoveReversedValue(attacker.contact, 200)).toBe(0);
    expect(calls).toEqual(["target:4", "p1:777", "p2:778"]);
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

function findHooks(overrides: Partial<Pick<RuntimeReversalHooks, "isMoveActive" | "worldBox" | "boxesIntersect" | "attrMatches">> = {}) {
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

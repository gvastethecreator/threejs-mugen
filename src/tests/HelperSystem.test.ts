import { describe, expect, it } from "vitest";
import type { ControllerIr, StateProgramIr } from "../mugen/compiler/RuntimeIr";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import type { HelperControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import {
  advanceRuntimeHelpers,
  createRuntimeHelper,
  runtimeHelpersToSnapshots,
  type RuntimeHelper,
} from "../mugen/runtime/HelperSystem";
import {
  createRuntimeContactMemory,
  markRuntimeMoveContact,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
} from "../mugen/runtime/ContactMemorySystem";

const stage: Pick<MugenStageDefinition, "bounds"> = {
  bounds: {
    left: -160,
    right: 160,
  },
};

const action: MugenAnimationAction = {
  id: 6100,
  loopStart: 0,
  rawLines: [],
  frames: [
    {
      spriteGroup: 6100,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 2,
      clsn1: [{ x1: 1, y1: 2, x2: 3, y2: 4 }],
      clsn2: [{ x1: -4, y1: -3, x2: 4, y2: 5 }],
      raw: "6100,0,0,0,2",
      line: 1,
    },
    {
      spriteGroup: 6100,
      spriteIndex: 1,
      offsetX: 2,
      offsetY: -1,
      duration: 1,
      clsn1: [],
      clsn2: [],
      raw: "6100,1,2,-1,1",
      line: 2,
    },
  ],
};

function controller(params: Record<string, string>): MugenStateController {
  return {
    stateId: 6000,
    type: "Helper",
    params,
    triggers: [],
    line: 1,
    rawHeader: "[State 6000, Helper]",
  };
}

function stateDef(id: number, overrides: Partial<MugenStateDef> = {}): MugenStateDef {
  return {
    id,
    type: "S",
    moveType: "I",
    physics: "N",
    anim: 6100,
    line: 1,
    controllers: [],
    rawParams: {},
    ...overrides,
  };
}

function controllerIr(stateId: number, type: string, params: Record<string, string> = {}): ControllerIr {
  const source: MugenStateController = {
    stateId,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State ${stateId}, ${type}]`,
  };
  return {
    source,
    stateId,
    type,
    normalizedType: type.toLowerCase(),
    supportLevel: "executable",
    triggers: [],
    params,
    line: 1,
    unsupportedFeatures: [],
  };
}

function stateProgram(source: MugenStateDef, controllers: ControllerIr[] = []): StateProgramIr {
  return {
    source,
    id: source.id,
    supportLevel: "executable",
    controllers,
    compiledControllers: controllers.length,
  };
}

function activeMove(overrides: Partial<DemoMove> = {}): DemoMove {
  return {
    actionId: 1200,
    startup: 0,
    activeStart: 0,
    activeEnd: 8,
    recovery: 20,
    damage: 33,
    priority: 4,
    requiresHitDef: false,
    hitPause: 3,
    hitStun: 8,
    push: 2,
    hitbox: { x1: 10, y1: -45, x2: 36, y2: -18 },
    ...overrides,
  };
}

function helper(overrides: Partial<RuntimeHelper> = {}): RuntimeHelper {
  return {
    serialId: "p1-helper-0",
    helperId: 200,
    name: "Burst",
    actorKind: "helper",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action,
    stateNo: 6000,
    animNo: 6100,
    moveTick: 0,
    hasHit: false,
    firedHitDefs: new Set(),
    contact: createRuntimeContactMemory(),
    targets: [],
    targetBindings: [],
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    facing: 1,
    ctrl: false,
    stateType: "S",
    moveType: "I",
    physics: "N",
    lifeMax: 1000,
    life: 1000,
    powerMax: 3000,
    power: 0,
    vars: Array.from({ length: 60 }, () => 0),
    sysvars: [],
    fvars: Array.from({ length: 40 }, () => 0),
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    stateTime: 0,
    removeTime: 10,
    ignoreHitPause: false,
    pauseMoveTime: 0,
    superMoveTime: 0,
    spritePriority: 3,
    soundEvents: [],
    hitEffectEvents: [],
    ...overrides,
  };
}

describe("HelperSystem", () => {
  it("creates a bounded visual helper from controller params", () => {
    const created = createRuntimeHelper({
      serialId: "p1-helper-1",
      controller: controller({
        id: "440",
        name: '"spark helper"',
        facing: "-1",
        velset: "2,-1",
        "size.xscale": "1.5",
        "size.yscale": "0.75",
        ignorehitpause: "1",
        pausemovetime: "2",
        supermovetime: "3",
        removetime: "9999",
        sprpriority: "25",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 24, y: -12 },
      fallbackFacing: 1,
    });

    expect(created).toMatchObject({
      serialId: "p1-helper-1",
      helperId: 440,
      name: "spark helper",
      actorKind: "helper",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 24, y: -12 },
      vel: { x: 2, y: -1 },
      scale: { x: 1.5, y: 0.75 },
      ignoreHitPause: true,
      pauseMoveTime: 2,
      superMoveTime: 3,
      facing: -1,
      removeTime: 1200,
      spritePriority: 10,
    });
  });

  it("prefers typed helper operations over raw controller params", () => {
    const operation: HelperControllerOp = {
      kind: "helper",
      helperId: 91,
      name: "Typed Buddy",
      stateNo: 6101,
      animNo: 6102,
      pos: [12, -4],
      velocity: [3, -2],
      scale: [2, 0.5],
      ignoreHitPause: true,
      pauseMoveTime: 4,
      superMoveTime: 5,
      postype: "p1",
      facing: 1,
      removeTime: 25,
      spritePriority: 6,
    };
    const created = createRuntimeHelper({
      serialId: "p1-helper-typed",
      controller: controller({
        id: "440",
        name: '"raw buddy"',
        facing: "-1",
        removetime: "9999",
        sprpriority: "-5",
      }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      stateNo: operation.stateNo,
      animNo: operation.animNo ?? 6100,
      pos: { x: 12, y: -4 },
      fallbackFacing: -1,
    });

    expect(created).toMatchObject({
      helperId: 91,
      name: "Typed Buddy",
      stateNo: 6101,
      animNo: 6102,
      vel: { x: 3, y: -2 },
      scale: { x: 2, y: 0.5 },
      ignoreHitPause: true,
      pauseMoveTime: 4,
      superMoveTime: 5,
      facing: 1,
      removeTime: 25,
      spritePriority: 6,
    });
  });

  it("advances animation frames and removes expired or out-of-bounds helpers", () => {
    const active = helper({ serialId: "active", removeTime: 8 });
    const expired = helper({ serialId: "expired", age: 4, removeTime: 5 });
    const outside = helper({ serialId: "outside", pos: { x: 999, y: 0 } });

    const remaining = advanceRuntimeHelpers([active, expired, outside], stage);
    expect(remaining.map((entry) => entry.serialId)).toEqual(["active"]);
    expect(active.age).toBe(1);
    expect(active.pos).toEqual({ x: 0, y: 0 });
    expect(active.frameIndex).toBe(0);

    active.vel = { x: 2, y: -1 };
    advanceRuntimeHelpers([active], stage);
    expect(active.pos).toEqual({ x: 2, y: -1 });
    expect(active.frameIndex).toBe(1);

    advanceRuntimeHelpers([active], stage);
    expect(active.frameIndex).toBe(0);
  });

  it("honors bounded helper pause movement flags", () => {
    const frozen = helper({ serialId: "frozen", vel: { x: 3, y: 0 } });
    const hitPauseImmune = helper({ serialId: "hitpause-immune", vel: { x: 4, y: 0 }, ignoreHitPause: true });
    const pauseMover = helper({ serialId: "pause-mover", vel: { x: 5, y: 0 }, pauseMoveTime: 2 });
    const superMover = helper({ serialId: "super-mover", vel: { x: 6, y: 0 }, superMoveTime: 2 });

    advanceRuntimeHelpers([frozen, hitPauseImmune, pauseMover, superMover], stage, { pauseKind: "hitpause" });
    expect(frozen).toMatchObject({ age: 0, pos: { x: 0, y: 0 } });
    expect(hitPauseImmune).toMatchObject({ age: 1, pos: { x: 4, y: 0 } });
    expect(pauseMover).toMatchObject({ age: 0, pos: { x: 0, y: 0 }, pauseMoveTime: 2 });

    advanceRuntimeHelpers([frozen, pauseMover, superMover], stage, { pauseKind: "Pause" });
    advanceRuntimeHelpers([frozen, pauseMover, superMover], stage, { pauseKind: "Pause" });
    advanceRuntimeHelpers([frozen, pauseMover, superMover], stage, { pauseKind: "Pause" });
    expect(pauseMover).toMatchObject({ age: 2, pos: { x: 10, y: 0 }, pauseMoveTime: 0 });
    expect(superMover).toMatchObject({ age: 0, pos: { x: 0, y: 0 }, superMoveTime: 2 });

    advanceRuntimeHelpers([frozen, superMover], stage, { pauseKind: "SuperPause" });
    advanceRuntimeHelpers([frozen, superMover], stage, { pauseKind: "SuperPause" });
    advanceRuntimeHelpers([frozen, superMover], stage, { pauseKind: "SuperPause" });
    expect(superMover).toMatchObject({ age: 2, pos: { x: 12, y: 0 }, superMoveTime: 0 });
    expect(frozen).toMatchObject({ age: 0, pos: { x: 0, y: 0 } });
  });

  it("preserves active helper HitDef moves when destination state declares hitdefpersist", () => {
    const active = helper({
      stateNo: 1200,
      currentMove: activeMove(),
      currentMoveLabel: "HitDef",
      moveTick: 3,
      hasHit: false,
      firedHitDefs: new Set(["1200:1:0"]),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1224" })]),
          stateProgram(stateDef(1224, { moveType: "A", hitDefPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1224);
    expect(active.currentMove).toMatchObject({ actionId: 1200, damage: 33 });
    expect(active.currentMoveLabel).toBe("HitDef");
    expect(active.moveTick).toBe(4);
    expect(active.firedHitDefs.size).toBe(0);
    expect(active.moveType).toBe("A");
  });

  it("clears active helper reversal moves even when destination state declares hitdefpersist", () => {
    const active = helper({
      stateNo: 1200,
      currentMove: activeMove({ isReversal: true }),
      currentMoveLabel: "ReversalDef",
      moveTick: 3,
      firedHitDefs: new Set(["1200:1:0"]),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1224" })]),
          stateProgram(stateDef(1224, { moveType: "A", hitDefPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1224);
    expect(active.currentMove).toBeUndefined();
    expect(active.currentMoveLabel).toBeUndefined();
    expect(active.moveTick).toBe(0);
    expect(active.firedHitDefs.size).toBe(0);
  });

  it("preserves helper-local hit counters when destination state declares hitcountpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "hit", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1226" })]),
          stateProgram(stateDef(1226, { moveType: "A", hitCountPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1226);
    expect(runtimeMoveHitCountValue(active.contact, 1226, false)).toBe(1);
    expect(runtimeMoveHitCountValue(active.contact, 1226, true)).toBe(1);
    expect(runtimeMoveContactValue(active.contact, 1226, "hit")).toBe(0);
  });

  it("resets helper-local hit counters when destination state omits hitcountpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "hit", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1226" })]),
          stateProgram(stateDef(1226, { moveType: "A" })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1226);
    expect(runtimeMoveHitCountValue(active.contact, 1226, false)).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1226, true)).toBe(0);
  });

  it("projects helpers into effect actor snapshots with cloned collision boxes", () => {
    const [snapshot] = runtimeHelpersToSnapshots([helper({ frameIndex: 0, scale: { x: 2, y: 0.5 } })], 100);

    expect(snapshot).toMatchObject({
      id: "p1-helper-0",
      label: "Helper Burst",
      actorKind: "helper",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      source: "effect",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      runtime: {
        pos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 },
        facing: 1,
        spritePriority: 3,
        stateNo: 6000,
        animNo: 6100,
        frameIndex: 0,
        ctrl: false,
        stateType: "S",
        moveType: "I",
        physics: "N",
        renderScale: { x: 2, y: 0.5 },
      },
      effect: {
        kind: "helper",
          scale: { x: 2, y: 0.5 },
          ignoreHitPause: false,
          pauseMoveTime: 0,
          superMoveTime: 0,
        },
      clsn1: [{ x1: 1, y1: 2, x2: 3, y2: 4 }],
      clsn2: [{ x1: -4, y1: -3, x2: 4, y2: 5 }],
    });

    expect(snapshot?.clsn1[0]).not.toBe(action.frames[0]?.clsn1[0]);
    expect(snapshot?.clsn2[0]).not.toBe(action.frames[0]?.clsn2[0]);
  });
});

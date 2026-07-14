import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeHitDefControllerDispatchWorld,
  type RuntimeHitDefControllerDispatchActor,
} from "../mugen/runtime/HitDefSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHitDefControllerDispatchWorld", () => {
  it("activates a typed HitDef payload with raw fallbacks and frame hitbox handoff", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.hitDefTargets = ["p2"];
    actor.pendingHitDefTargets = ["p4"];
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "S,NA",
        damage: "30,5",
        guardpoints: "-12",
        priority: "5, Dodge",
        pausetime: "12,8",
        p1sprpriority: "3",
        p2sprpriority: "-2",
        "attack.depth": "5,8",
        "ground.hittime": "15",
        "ground.velocity": "-4,-3",
        guardflag: "MA",
        "guard.pausetime": "6,6",
        "guard.hittime": "9",
        "guard.velocity": "-2,0",
        "airguard.velocity": "-6,-2",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        sparkno: "S7000",
        "guard.sparkno": "F7004",
        sparkxy: "12,-40",
        p1stateno: "210",
        p2stateno: "5000",
        p2getp1state: "0",
        missonoverride: "0",
        fall: "1",
        "fall.damage": "7",
        "fall.yvelocity": "-4.5",
        "fall.recover": "1",
        "fall.recovertime": "20",
      }),
    );
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result.activated).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.recordedController).toBe(true);
    expect(result.recordedOperation).toBe(true);
    expect(result.operation?.kind).toBe("hitdef");
    expect(recordedControllers).toEqual(["HitDef"]);
    expect(recordedOperations).toEqual(["hitdef"]);
    expect(actor.firedHitDefs.has(result.key)).toBe(true);

    expect(actor.currentMoveLabel).toBe("HitDef");
    expect(actor.runtime.ctrl).toBe(false);
    expect(actor.runtime.moveType).toBe("A");
    expect(actor.runtime.reversal).toBeUndefined();
    expect(actor.hasHit).toBe(false);
    expect(actor.hitDefTargets).toEqual([]);
    expect(actor.pendingHitDefTargets).toEqual([]);
    expect(actor.currentMove).toMatchObject({
      actionId: 200,
      activeStart: 3,
      activeEnd: 6,
      recovery: 18,
      damage: 30,
      priority: 5,
      priorityType: "dodge",
      guardDamage: 5,
      guardPoints: -12,
      hitPause: 12,
      hitStun: 15,
      p1SpritePriority: 3,
      p2SpritePriority: -2,
      attackDepth: [5, 8],
      push: 4,
      hitVelocityY: -3,
      guardFlag: "MA",
      guardPause: 6,
      guardStun: 9,
      guardPush: 2,
      guardVelocityY: 0,
      airGuardPush: 6,
      airGuardVelocityY: -2,
      cornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      hitSpark: "S7000",
      guardSpark: "F7004",
      sparkXy: [12, -40],
      p1StateNo: 210,
      p2StateNo: 5000,
      p2GetP1State: false,
      missOnOverride: false,
      fall: {
        enabled: true,
        damage: 7,
        velocity: { y: -4.5 },
        recover: true,
        recoverTime: 20,
      },
      hitbox: { x1: 10, y1: -50, x2: 45, y2: -20 },
    });
  });

  it("defaults missing HitDef id to target id 0", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(controller("HitDef", { damage: "30" }));

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.targetId).toBe(0);
  });

  it("defaults each omitted HitDef priority to 4 Hit instead of inheriting the previous move", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.currentMove = {
      actionId: 199,
      startup: 0,
      activeStart: 0,
      activeEnd: 4,
      recovery: 8,
      damage: 20,
      hitPause: 4,
      hitStun: 8,
      push: 2,
      priority: 7,
      priorityType: "dodge",
      attackDepth: [12, 15],
      hitbox: { x1: 0, y1: -30, x2: 30, y2: 0 },
    };
    actor.runtime.combatDepth = { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] };

    world.apply({ actor, controller: compileControllerIr(controller("HitDef", { damage: "30" })), frame: activeFrame() });

    expect(actor.currentMove).toMatchObject({ priority: 4, priorityType: "hit", attackDepth: [4, 4] });
  });

  it("derives missing airguard.velocity from air.velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "A",
        "ground.velocity": "-3",
        "air.velocity": "-6,-8",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardDamage: 3,
      guardFlag: "A",
      airGuardPush: 9,
      airGuardVelocityY: -4,
    });
  });

  it("derives missing guard.velocity from ground.velocity x", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.velocity": "-6,-2",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardDamage: 3,
      guardFlag: "MA",
      guardPush: 6,
    });
    expect(actor.currentMove?.guardVelocityY).toBeUndefined();
  });

  it("derives missing guard timing from ground hittime", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.hittime": "15",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardStun: 15,
      guardSlideTime: 15,
      guardControlTime: 15,
    });
  });

  it("derives missing guard slide and control timing from guard hittime", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.hittime": "15",
        "guard.hittime": "9",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardStun: 9,
      guardSlideTime: 9,
      guardControlTime: 9,
    });
  });

  it("derives missing guard control timing from guard slidetime", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.hittime": "15",
        "guard.slidetime": "6",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardStun: 15,
      guardSlideTime: 6,
      guardControlTime: 6,
    });
  });

  it("derives official cornerpush defaults from guard velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "S,NA",
        guardflag: "MA",
        "ground.velocity": "-10",
        "guard.velocity": "-4",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.cornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.airCornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.downCornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.guardCornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.airGuardCornerPush).toBeCloseTo(5.2);
  });

  it("uses zero ground cornerpush default for aerial HitDef attr", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "A,NA",
        guardflag: "A",
        "guard.velocity": "-4",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.cornerPush).toBe(0);
    expect(actor.currentMove?.guardCornerPush).toBe(0);
    expect(actor.currentMove?.airGuardCornerPush).toBe(0);
  });

  it("deduplicates repeated HitDef dispatches for the same state line and frame", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(controller("HitDef", { damage: "30" }));
    const frame = activeFrame();
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const first = world.apply({
      actor,
      controller: ir,
      frame,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });
    const second = world.apply({
      actor,
      controller: ir,
      frame,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(first.activated).toBe(true);
    expect(second).toEqual({
      activated: false,
      duplicate: true,
      key: first.key,
      recordedController: false,
      recordedOperation: false,
    });
    expect(recordedControllers).toEqual(["HitDef"]);
    expect(recordedOperations).toEqual(["hitdef"]);
  });
});

function activeFrame(): MugenAnimationFrame {
  return {
    spriteGroup: 200,
    spriteIndex: 0,
    offsetX: 0,
    offsetY: 0,
    duration: 4,
    clsn1: [{ x1: 10, y1: -50, x2: 45, y2: -20 }],
    clsn2: [],
    raw: "200,0,0,0,4",
    line: 1,
  };
}

function hitDefActor(): RuntimeHitDefControllerDispatchActor {
  return {
    runtime: runtimeState(),
    moveTick: 3,
    frameElapsed: 1,
    hasHit: true,
    firedHitDefs: new Set(),
  };
}

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
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
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    name: type,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

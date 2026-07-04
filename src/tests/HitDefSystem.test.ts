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
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "S,NA",
        damage: "30,5",
        pausetime: "12,8",
        "ground.hittime": "15",
        "ground.velocity": "-4,-3",
        guardflag: "MA",
        "guard.pausetime": "6,6",
        "guard.hittime": "9",
        "guard.velocity": "-2,0",
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
    expect(actor.currentMove).toMatchObject({
      actionId: 200,
      activeStart: 3,
      activeEnd: 6,
      recovery: 18,
      damage: 30,
      guardDamage: 5,
      hitPause: 12,
      hitStun: 15,
      push: 4,
      hitVelocityY: -3,
      guardFlag: "MA",
      guardPause: 6,
      guardStun: 9,
      guardPush: 2,
      guardVelocityY: 0,
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

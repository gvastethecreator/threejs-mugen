import { describe, expect, it } from "vitest";
import type { ControllerOp } from "../mugen/compiler/ControllerOps";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { RuntimeHelper } from "../mugen/runtime/HelperSystem";
import { RuntimeHelperTelemetryWorld, type RuntimeHelperTelemetryOwner } from "../mugen/runtime/RuntimeHelperTelemetrySystem";

describe("RuntimeHelperTelemetryWorld", () => {
  it("records helper projectile controllers and typed operations against helper state", () => {
    const world = new RuntimeHelperTelemetryWorld();
    const owner = ownerState(200);
    const source = controllerSource("Projectile");
    const operation = projectileOperation();
    const records: string[] = [];

    world.attachProjectileTelemetry([owner], {
      recordController: (recordOwner, controller, context) =>
        records.push(`${recordOwner.runtime.stateNo}:${controller.type}:${context.stateNo}`),
      recordOperation: (_recordOwner, recordOperation, context) => records.push(`${recordOperation.kind}:${context.stateNo}`),
    });

    owner.onHelperController?.(helperState(1200), controllerIr(source, operation));
    owner.onHelperOperation?.(helperState(1200), operation);

    expect(records).toEqual(["200:Projectile:1200", "projectile:1200"]);
  });

  it("uses owner state when helper has no current state", () => {
    const world = new RuntimeHelperTelemetryWorld();
    const owner = ownerState(300);
    const states: number[] = [];

    world.attachProjectileTelemetry([owner], {
      recordController: (_owner, _controller, context) => states.push(context.stateNo),
      recordOperation: (_owner, _operation, context) => states.push(context.stateNo),
    });

    owner.onHelperController?.(helperState(undefined), controllerIr(controllerSource("Projectile"), projectileOperation()));
    owner.onHelperOperation?.(helperState(undefined), projectileOperation());

    expect(states).toEqual([300, 300]);
  });

  it("ignores non-projectile helper telemetry and replaces stale handlers", () => {
    const world = new RuntimeHelperTelemetryWorld();
    const owner = ownerState(400);
    const records: string[] = [];
    owner.onHelperController = () => records.push("stale-controller");
    owner.onHelperOperation = () => records.push("stale-operation");

    world.attachProjectileTelemetry([owner], {
      recordController: (_owner, controller) => records.push(controller.type),
      recordOperation: (_owner, operation) => records.push(operation.kind),
    });

    owner.onHelperController?.(helperState(1201), controllerIr(controllerSource("Helper"), helperOperation()));
    owner.onHelperOperation?.(helperState(1201), helperOperation());
    owner.onHelperController?.(helperState(1201), controllerIr(controllerSource("Projectile"), projectileOperation()));

    expect(records).toEqual(["Projectile"]);
  });
});

function ownerState(stateNo: number): RuntimeHelperTelemetryOwner {
  return { runtime: { stateNo } };
}

function helperState(stateNo: number | undefined): RuntimeHelper {
  return {
    serialId: "helper-0",
    actorKind: "helper",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "p1",
    spriteOwnerLabel: "P1",
    action: { id: 0, frames: [], rawLines: [] },
    stateNo,
    animNo: 0,
    moveTick: 0,
    hasHit: false,
    firedHitDefs: new Set(),
    contact: {},
    targets: [],
    targetBindings: [],
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    facing: 1,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    lifeMax: 1000,
    life: 1000,
    powerMax: 3000,
    power: 0,
    vars: [],
    sysvars: [],
    fvars: [],
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    stateTime: 0,
    removeTime: -1,
    ignoreHitPause: false,
    pauseMoveTime: 0,
    superMoveTime: 0,
    spritePriority: 3,
    soundEvents: [],
    hitEffectEvents: [],
  };
}

function controllerSource(type: string): MugenStateController {
  return { stateId: 1200, type, triggers: [], params: {}, line: 1, rawHeader: `[State 1200, ${type}]` };
}

function controllerIr(source: MugenStateController, operation: ControllerOp): ControllerIr {
  return {
    source,
    stateId: source.stateId,
    type: source.type,
    normalizedType: source.type.toLowerCase(),
    supportLevel: "partial",
    triggers: [],
    params: {},
    operation,
    line: 1,
    unsupportedFeatures: [],
  };
}

function projectileOperation(): ControllerOp {
  return { kind: "projectile" } as ControllerOp;
}

function helperOperation(): ControllerOp {
  return { kind: "helper" } as ControllerOp;
}

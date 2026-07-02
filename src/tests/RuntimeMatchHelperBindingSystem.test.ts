import { describe, expect, it } from "vitest";
import type { ControllerOp } from "../mugen/compiler/ControllerOps";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { RuntimeHelper } from "../mugen/runtime/HelperSystem";
import {
  RuntimeMatchHelperBindingWorld,
  type RuntimeMatchHelperBindingOwner,
} from "../mugen/runtime/RuntimeMatchHelperBindingSystem";
import type { RuntimeTargetWorldActor } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeMatchHelperBindingWorld", () => {
  it("binds helper target-state routing and projectile telemetry for the current match owners", () => {
    const world = new RuntimeMatchHelperBindingWorld();
    const p1 = owner("p1", 200);
    const p2 = owner("p2", 300);
    const records: string[] = [];
    p1.enterHelperTargetState = () => records.push("stale-target");
    p1.onHelperController = () => records.push("stale-controller");
    p1.onHelperOperation = () => records.push("stale-operation");

    world.attach({
      owners: [p1, p2],
      enterTargetState: (routeOwner, helper, target, stateId) =>
        records.push(`target:${routeOwner.id}:${helper.ownerId}:${target.id}:${stateId}`),
      telemetryRecorder: {
        recordController: (recordOwner, controller, context) =>
          records.push(`controller:${recordOwner.id}:${controller.type}:${context.stateNo}`),
        recordOperation: (recordOwner, operation, context) =>
          records.push(`operation:${recordOwner.id}:${operation.kind}:${context.stateNo}`),
      },
    });

    p1.enterHelperTargetState?.(helper("p1", 1200), target("p2"), 888);
    p2.enterHelperTargetState?.(helper("p2", undefined), target("p1"), 889);
    p1.onHelperController?.(helper("p1", 1200), controllerIr(controller("Projectile"), projectileOperation()));
    p1.onHelperOperation?.(helper("p1", undefined), projectileOperation());
    p1.onHelperController?.(helper("p1", 1200), controllerIr(controller("Helper"), helperOperation()));
    p1.onHelperOperation?.(helper("p1", 1200), helperOperation());

    expect(records).toEqual([
      "target:p1:p1:p2:888",
      "target:p2:p2:p1:889",
      "controller:p1:Projectile:1200",
      "operation:p1:projectile:200",
    ]);
  });
});

function owner(id: string, stateNo: number): RuntimeMatchHelperBindingOwner {
  return {
    id,
    runtime: { stateNo },
  };
}

function helper(ownerId: string, stateNo: number | undefined): RuntimeHelper {
  return {
    ownerId,
    stateNo,
  } as RuntimeHelper;
}

function target(id: string): RuntimeTargetWorldActor {
  return {
    id,
    runtime: runtimeState(),
    targets: [],
    targetBindings: [],
  };
}

function runtimeState(): CharacterRuntimeState {
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
  };
}

function controller(type: string): MugenStateController {
  return {
    stateId: 1200,
    type,
    triggers: [],
    params: {},
    line: 1,
    rawHeader: `[State 1200, ${type}]`,
  };
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

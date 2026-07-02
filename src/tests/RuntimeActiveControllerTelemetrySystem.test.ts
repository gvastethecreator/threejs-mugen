import { describe, expect, it } from "vitest";
import type { ControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { RuntimeCompatibilityTelemetryActor } from "../mugen/runtime/RuntimeCompatibilityTelemetrySystem";
import { RuntimeActiveControllerTelemetryWorld } from "../mugen/runtime/RuntimeActiveControllerTelemetrySystem";

describe("RuntimeActiveControllerTelemetryWorld", () => {
  it("forwards active controller and operation telemetry through one hook set", () => {
    const calls: string[] = [];
    const actor = { id: "p1" } as RuntimeCompatibilityTelemetryActor;
    const controller = { type: "VelSet" } as MugenStateController;
    const operation = { kind: "kinematic", controllerType: "velset", x: 3 } satisfies ControllerOp;
    const hooks = new RuntimeActiveControllerTelemetryWorld().create({
      recordController: (target, recordedController) =>
        calls.push(`controller:${target.id}:${recordedController.type}`),
      recordOperation: (target, recordedOperation) =>
        calls.push(`operation:${target.id}:${recordedOperation.kind}`),
    });

    hooks.recordController(actor, controller);
    hooks.recordOperation(actor, operation);

    expect(calls).toEqual(["controller:p1:VelSet", "operation:p1:kinematic"]);
  });
});

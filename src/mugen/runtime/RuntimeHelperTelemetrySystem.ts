import type { ControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import type { RuntimeHelper } from "./HelperSystem";

export type RuntimeHelperTelemetryOwner = {
  runtime: { stateNo: number };
  onHelperController?: (helper: RuntimeHelper, controller: ControllerIr) => void;
  onHelperOperation?: (helper: RuntimeHelper, operation: ControllerOp) => void;
};

export type RuntimeHelperTelemetryContext = {
  stateNo: number;
};

export type RuntimeHelperTelemetryRecorder<TOwner extends RuntimeHelperTelemetryOwner> = {
  recordController: (owner: TOwner, controller: MugenStateController, context: RuntimeHelperTelemetryContext) => void;
  recordOperation: (owner: TOwner, operation: ControllerOp, context: RuntimeHelperTelemetryContext) => void;
};

export class RuntimeHelperTelemetryWorld {
  attachControllerTelemetry<TOwner extends RuntimeHelperTelemetryOwner>(
    owners: TOwner[],
    recorder: RuntimeHelperTelemetryRecorder<TOwner>,
  ): void {
    for (const owner of owners) {
      owner.onHelperController = (helper, controller) => {
        if (!recordsHelperController(controller)) {
          return;
        }
        recorder.recordController(owner, controller.source, { stateNo: helper.stateNo ?? owner.runtime.stateNo });
      };
      owner.onHelperOperation = (helper, operation) => {
        if (!recordsHelperOperation(operation)) {
          return;
        }
        recorder.recordOperation(owner, operation, { stateNo: helper.stateNo ?? owner.runtime.stateNo });
      };
    }
  }

  attachProjectileTelemetry<TOwner extends RuntimeHelperTelemetryOwner>(
    owners: TOwner[],
    recorder: RuntimeHelperTelemetryRecorder<TOwner>,
  ): void {
    this.attachControllerTelemetry(owners, recorder);
  }
}

const helperKinematicControllers = new Set(["velset", "veladd", "velmul", "posset", "posadd", "gravity", "hitvelset"]);
const helperResourceControllers = new Set(["ctrlset", "lifeadd", "lifeset", "redlifeadd", "redlifeset", "poweradd", "powerset"]);

function recordsHelperController(controller: ControllerIr): boolean {
  return (
    controller.operation?.kind === "projectile" ||
    controller.operation?.kind === "pause" ||
    controller.operation?.kind === "team-standby" ||
    helperKinematicControllers.has(controller.normalizedType) ||
    helperResourceControllers.has(controller.normalizedType)
  );
}

function recordsHelperOperation(operation: ControllerOp): boolean {
  return operation.kind === "projectile" ||
    operation.kind === "kinematic" ||
    operation.kind === "pause" ||
    operation.kind === "team-standby" ||
    operation.kind === "resource";
}

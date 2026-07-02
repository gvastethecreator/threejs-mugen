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
  attachProjectileTelemetry<TOwner extends RuntimeHelperTelemetryOwner>(
    owners: TOwner[],
    recorder: RuntimeHelperTelemetryRecorder<TOwner>,
  ): void {
    for (const owner of owners) {
      owner.onHelperController = (helper, controller) => {
        if (controller.operation?.kind !== "projectile") {
          return;
        }
        recorder.recordController(owner, controller.source, { stateNo: helper.stateNo ?? owner.runtime.stateNo });
      };
      owner.onHelperOperation = (helper, operation) => {
        if (operation.kind !== "projectile") {
          return;
        }
        recorder.recordOperation(owner, operation, { stateNo: helper.stateNo ?? owner.runtime.stateNo });
      };
    }
  }
}

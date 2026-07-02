import type { ControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import type { RuntimeCompatibilityTelemetryActor } from "./RuntimeCompatibilityTelemetrySystem";

export type RuntimeActiveControllerTelemetryInput<TActor extends RuntimeCompatibilityTelemetryActor> = {
  recordController: (actor: TActor, controller: MugenStateController) => void;
  recordOperation: (actor: TActor, operation: ControllerOp) => void;
};

export type RuntimeActiveControllerTelemetryHooks<TActor extends RuntimeCompatibilityTelemetryActor> = {
  recordController: (actor: TActor, controller: MugenStateController) => void;
  recordOperation: (actor: TActor, operation: ControllerOp) => void;
};

export class RuntimeActiveControllerTelemetryWorld {
  create<TActor extends RuntimeCompatibilityTelemetryActor>(
    input: RuntimeActiveControllerTelemetryInput<TActor>,
  ): RuntimeActiveControllerTelemetryHooks<TActor> {
    return {
      recordController: (actor, controller) => input.recordController(actor, controller),
      recordOperation: (actor, operation) => input.recordOperation(actor, operation),
    };
  }
}

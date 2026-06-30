import type { ControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { executeControllerIr, type RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeControllerDispatchActor = {
  runtime: CharacterRuntimeState;
};

export type RuntimeControllerDispatchHooks<TActor extends RuntimeControllerDispatchActor> = {
  context?: RuntimeControllerEvaluationContext;
  executeController?: (
    controller: ControllerIr,
    runtime: CharacterRuntimeState,
    reportUnsupported: (controller: string) => void,
    context: RuntimeControllerEvaluationContext,
  ) => CharacterRuntimeState;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: ControllerOp) => void;
  reportUnsupported?: (controller: string) => void;
};

export type RuntimeControllerDispatchResult = {
  unsupported: string[];
  recordedController: boolean;
  recordedOperation: boolean;
};

export class RuntimeControllerDispatchWorld {
  apply<TActor extends RuntimeControllerDispatchActor>(
    actor: TActor,
    controller: ControllerIr,
    hooks: RuntimeControllerDispatchHooks<TActor> = {},
  ): RuntimeControllerDispatchResult {
    const unsupported: string[] = [];
    const context = hooks.context ?? {};
    const reportUnsupported = (name: string): void => {
      unsupported.push(name);
      hooks.reportUnsupported?.(name);
    };

    hooks.recordController?.(actor, controller.source);
    actor.runtime = (hooks.executeController ?? executeControllerIr)(controller, actor.runtime, reportUnsupported, context);

    if (controller.operation) {
      hooks.recordOperation?.(actor, controller.operation);
    }

    return {
      unsupported,
      recordedController: Boolean(hooks.recordController),
      recordedOperation: Boolean(controller.operation && hooks.recordOperation),
    };
  }
}

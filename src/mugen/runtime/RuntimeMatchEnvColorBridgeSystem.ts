import type { EnvColorControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import type { RuntimeEnvColorWorld } from "./EnvColorSystem";
import type { RuntimeEnvColorEvent } from "./types";

export type RuntimeMatchEnvColorBridgeWorldInput = {
  controller: MugenStateController;
  operation?: EnvColorControllerOp;
  runtimeTick: number;
  envColorWorld: Pick<RuntimeEnvColorWorld, "emitController">;
};

export class RuntimeMatchEnvColorBridgeWorld {
  apply(input: RuntimeMatchEnvColorBridgeWorldInput): RuntimeEnvColorEvent | undefined {
    return input.envColorWorld.emitController(input.controller, input.runtimeTick, input.operation);
  }
}

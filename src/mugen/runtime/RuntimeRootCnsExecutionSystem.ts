import {
  RuntimeActiveControllerRunWorld,
  type RuntimeActiveControllerRunActor,
  type RuntimeActiveControllerRunInput,
} from "./RuntimeActiveControllerRunSystem";
import type { RuntimeActiveControllerCapabilities } from "./RuntimeActiveControllerDispatchSystem";
import type { RuntimeActiveControllerScanResult } from "./RuntimeActiveControllerScanSystem";

export type RuntimeRootCnsParticipation = "playable" | "standby";

export const PLAYABLE_ROOT_CNS_CAPABILITIES: RuntimeActiveControllerCapabilities = {
  state: true,
  runtimeControllers: "all",
  sideEffects: "all",
  unsupported: true,
};

export const STANDBY_ROOT_CNS_CAPABILITIES: RuntimeActiveControllerCapabilities = {
  state: true,
  runtimeControllers: ["ctrlset", "statetypeset", "turn", "varset", "varadd", "varrandom", "varrangeset", "null"],
  sideEffects: [],
  unsupported: true,
};

export class RuntimeRootCnsExecutionWorld {
  constructor(private readonly controllerRunWorld = new RuntimeActiveControllerRunWorld()) {}

  execute<TActor extends RuntimeActiveControllerRunActor<TActor>>(
    input: RuntimeActiveControllerRunInput<TActor>,
    participation: RuntimeRootCnsParticipation,
  ): RuntimeActiveControllerScanResult<TActor> {
    return this.controllerRunWorld.run({
      ...input,
      capabilities: participation === "playable" ? PLAYABLE_ROOT_CNS_CAPABILITIES : STANDBY_ROOT_CNS_CAPABILITIES,
    });
  }
}

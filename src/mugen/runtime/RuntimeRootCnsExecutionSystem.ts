import {
  RuntimeActiveControllerRunWorld,
  type RuntimeActiveControllerRunActor,
  type RuntimeActiveControllerRunInput,
} from "./RuntimeActiveControllerRunSystem";
import type { RuntimeActiveControllerCapabilities } from "./RuntimeActiveControllerDispatchSystem";
import type { RuntimeActiveControllerScanResult } from "./RuntimeActiveControllerScanSystem";

export type RuntimeRootCnsParticipation = "playable" | "active-motion" | "standby";

export const PLAYABLE_ROOT_CNS_CAPABILITIES: RuntimeActiveControllerCapabilities = {
  state: true,
  runtimeControllers: "all",
  sideEffects: "all",
  unsupported: true,
};

export const STANDBY_ROOT_CNS_CAPABILITIES: RuntimeActiveControllerCapabilities = {
  state: true,
  runtimeControllers: ["ctrlset", "statetypeset", "turn", "tagin", "tagout", "varset", "varadd", "varrandom", "varrangeset", "null"],
  sideEffects: [],
  unsupported: true,
};

export const ACTIVE_MOTION_ROOT_CNS_CAPABILITIES: RuntimeActiveControllerCapabilities = {
  ...STANDBY_ROOT_CNS_CAPABILITIES,
  runtimeControllers: [
    ...STANDBY_ROOT_CNS_CAPABILITIES.runtimeControllers,
    "gravity",
    "velset",
    "veladd",
    "velmul",
    "hitvelset",
    "posset",
    "posadd",
  ],
};

export class RuntimeRootCnsExecutionWorld {
  constructor(private readonly controllerRunWorld = new RuntimeActiveControllerRunWorld()) {}

  execute<TActor extends RuntimeActiveControllerRunActor<TActor>>(
    input: RuntimeActiveControllerRunInput<TActor>,
    participation: RuntimeRootCnsParticipation,
  ): RuntimeActiveControllerScanResult<TActor> {
    return this.controllerRunWorld.run({
      ...input,
      capabilities:
        participation === "playable"
          ? PLAYABLE_ROOT_CNS_CAPABILITIES
          : participation === "active-motion"
            ? ACTIVE_MOTION_ROOT_CNS_CAPABILITIES
            : STANDBY_ROOT_CNS_CAPABILITIES,
    });
  }
}

import type { EnvShakeControllerOp, FallEnvShakeControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import {
  RuntimeEnvShakeControllerDispatchWorld,
  type RuntimeEnvShakeControllerDispatchResult,
  type RuntimeEnvShakeResolver,
  type RuntimeEnvShakeWorld,
  type RuntimeEnvShakeWorldActor,
  RuntimeFallEnvShakeControllerDispatchWorld,
  type RuntimeFallEnvShakeControllerDispatchResult,
} from "./EnvShakeSystem";

export type RuntimeMatchEnvShakeControllerBridgeInput<TActor extends RuntimeEnvShakeWorldActor> = {
  actor: TActor;
  controller: ControllerIr;
  runtimeTick: number;
  envShakeWorld: RuntimeEnvShakeWorld;
  resolveEnvShake?: RuntimeEnvShakeResolver;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: EnvShakeControllerOp) => void;
};

export type RuntimeMatchFallEnvShakeControllerBridgeInput<TActor extends RuntimeEnvShakeWorldActor> = {
  actor: TActor;
  controller: ControllerIr;
  runtimeTick: number;
  envShakeWorld: RuntimeEnvShakeWorld;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: FallEnvShakeControllerOp) => void;
};

export class RuntimeMatchEnvShakeBridgeWorld {
  constructor(
    private readonly envShakeControllerDispatchWorld = new RuntimeEnvShakeControllerDispatchWorld(),
    private readonly fallEnvShakeControllerDispatchWorld = new RuntimeFallEnvShakeControllerDispatchWorld(),
  ) {}

  applyController<TActor extends RuntimeEnvShakeWorldActor>(
    input: RuntimeMatchEnvShakeControllerBridgeInput<TActor>,
  ): RuntimeEnvShakeControllerDispatchResult {
    return this.envShakeControllerDispatchWorld.apply(input);
  }

  applyFallController<TActor extends RuntimeEnvShakeWorldActor>(
    input: RuntimeMatchFallEnvShakeControllerBridgeInput<TActor>,
  ): RuntimeFallEnvShakeControllerDispatchResult {
    return this.fallEnvShakeControllerDispatchWorld.apply(input);
  }
}

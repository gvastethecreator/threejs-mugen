import type { ControllerIr } from "../compiler/RuntimeIr";
import {
  RuntimeActiveControllerDispatchWorld,
  type RuntimeActiveControllerDispatchHooks,
  type RuntimeActiveControllerCapabilities,
} from "./RuntimeActiveControllerDispatchSystem";
import {
  RuntimeActiveControllerScanWorld,
  type RuntimeActiveControllerScanActor,
  type RuntimeActiveControllerScanResult,
} from "./RuntimeActiveControllerScanSystem";
import type {
  RuntimeActiveStateDispatchActor,
  RuntimeActiveStateDispatchHooks,
} from "./RuntimeActiveStateDispatchSystem";
import type { RuntimeActiveSideEffectDispatchHooks } from "./RuntimeActiveSideEffectDispatchSystem";
import type { StateProgramDispatch } from "./StateProgramExecutor";

export type RuntimeActiveControllerRunActor<TSelf> = RuntimeActiveControllerScanActor<TSelf> &
  RuntimeActiveStateDispatchActor;

export type RuntimeActiveControllerRunInput<TActor extends RuntimeActiveControllerRunActor<TActor>> = {
  actor: TActor;
  opponent: TActor;
  tick: number;
  stateNo?: number;
  stateOwner?: TActor;
  onlyIgnoreHitPause?: boolean;
  controllerIgnoresHitPause: (controller: ControllerIr) => boolean;
  triggersPass: (controller: ControllerIr, actor: TActor, opponent: TActor, owner: TActor, tick: number) => boolean;
  dispatchController: (controller: ControllerIr) => StateProgramDispatch;
  stateHooks: RuntimeActiveStateDispatchHooks<TActor>;
  sideEffectHooks: RuntimeActiveSideEffectDispatchHooks<TActor>;
  hooks?: RuntimeActiveControllerDispatchHooks<TActor>;
  capabilities?: RuntimeActiveControllerCapabilities;
  onBlocked?: (controller: ControllerIr, route: string) => void;
};

export class RuntimeActiveControllerRunWorld {
  constructor(
    private readonly scanWorld = new RuntimeActiveControllerScanWorld(),
    private readonly dispatchWorld = new RuntimeActiveControllerDispatchWorld(),
  ) {}

  run<TActor extends RuntimeActiveControllerRunActor<TActor>>(
    input: RuntimeActiveControllerRunInput<TActor>,
  ): RuntimeActiveControllerScanResult<TActor> {
    return this.scanWorld.run({
      actor: input.actor,
      opponent: input.opponent,
      tick: input.tick,
      stateNo: input.stateNo,
      stateOwner: input.stateOwner,
      onlyIgnoreHitPause: input.onlyIgnoreHitPause,
      controllerIgnoresHitPause: input.controllerIgnoresHitPause,
      triggersPass: input.triggersPass,
      executeController: ({ controller, owner }) => {
        const dispatch = input.dispatchController(controller);
        const result = this.dispatchWorld.apply({
          dispatch,
          actor: input.actor,
          opponent: input.opponent,
          owner,
          tick: input.tick,
          stateHooks: input.stateHooks,
          sideEffectHooks: input.sideEffectHooks,
          hooks: input.hooks,
          capabilities: input.capabilities,
        });
        if (result.route === "blocked") {
          input.onBlocked?.(controller, result.blockedRoute);
          return "blocked";
        }
        return result.stop ? "stop" : "continue";
      },
    });
  }
}

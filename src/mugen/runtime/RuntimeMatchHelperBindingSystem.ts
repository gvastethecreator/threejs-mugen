import type { RuntimeHelper } from "./HelperSystem";
import {
  RuntimeHelperTargetStateWorld,
  type RuntimeHelperTargetStateBindingOwner,
} from "./RuntimeHelperTargetStateSystem";
import {
  RuntimeHelperTelemetryWorld,
  type RuntimeHelperTelemetryOwner,
  type RuntimeHelperTelemetryRecorder,
} from "./RuntimeHelperTelemetrySystem";
import type { RuntimeTargetWorldActor } from "./TargetSystem";

export type RuntimeMatchHelperBindingOwner = RuntimeHelperTargetStateBindingOwner & RuntimeHelperTelemetryOwner;

export type RuntimeMatchHelperTargetStateRoute<TOwner extends RuntimeMatchHelperBindingOwner> = (
  owner: TOwner,
  helper: RuntimeHelper,
  target: RuntimeTargetWorldActor,
  stateId: number,
) => void;

export type RuntimeMatchHelperBindingInput<TOwner extends RuntimeMatchHelperBindingOwner> = {
  owners: readonly TOwner[];
  enterTargetState: RuntimeMatchHelperTargetStateRoute<TOwner>;
  telemetryRecorder: RuntimeHelperTelemetryRecorder<TOwner>;
};

export class RuntimeMatchHelperBindingWorld {
  constructor(
    private readonly targetStateWorld = new RuntimeHelperTargetStateWorld(),
    private readonly telemetryWorld = new RuntimeHelperTelemetryWorld(),
  ) {}

  attach<TOwner extends RuntimeMatchHelperBindingOwner>(input: RuntimeMatchHelperBindingInput<TOwner>): void {
    const owners = [...input.owners];
    this.targetStateWorld.attachOwnerHandlers(owners, input.enterTargetState);
    this.telemetryWorld.attachProjectileTelemetry(owners, input.telemetryRecorder);
  }
}

import type { RuntimeHelper, RuntimeHelperAdvanceOptions } from "./HelperSystem";
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

export type RuntimeMatchHelperBindingOwner = RuntimeHelperTargetStateBindingOwner &
  RuntimeHelperTelemetryOwner & {
    onHelperTeamStandby?: RuntimeHelperAdvanceOptions["onTeamStandby"];
  };

export type RuntimeMatchHelperTargetStateRoute<TOwner extends RuntimeMatchHelperBindingOwner> = (
  owner: TOwner,
  helper: RuntimeHelper,
  target: RuntimeTargetWorldActor,
  stateId: number,
) => void;

export type RuntimeMatchHelperTeamStandbyRoute<TOwner extends RuntimeMatchHelperBindingOwner> = (
  owner: TOwner,
  ...args: Parameters<NonNullable<RuntimeHelperAdvanceOptions["onTeamStandby"]>>
) => ReturnType<NonNullable<RuntimeHelperAdvanceOptions["onTeamStandby"]>>;

export type RuntimeMatchHelperBindingInput<TOwner extends RuntimeMatchHelperBindingOwner> = {
  owners: readonly TOwner[];
  enterTargetState: RuntimeMatchHelperTargetStateRoute<TOwner>;
  applyTeamStandby: RuntimeMatchHelperTeamStandbyRoute<TOwner>;
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
    for (const owner of owners) {
      owner.onHelperTeamStandby = (helper, operation) => input.applyTeamStandby(owner, helper, operation);
    }
    this.telemetryWorld.attachControllerTelemetry(owners, input.telemetryRecorder);
  }
}

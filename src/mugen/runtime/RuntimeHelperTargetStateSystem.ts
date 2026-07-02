import type { RuntimeHelper } from "./HelperSystem";
import type { RuntimeTargetWorldActor } from "./TargetSystem";

export type RuntimeHelperTargetStateOwner = {
  id: string;
};

export type RuntimeHelperTargetStateHooks<
  TOwner extends RuntimeHelperTargetStateOwner,
  TTarget extends RuntimeTargetWorldActor,
> = {
  resolveTarget: (targetActor: RuntimeTargetWorldActor) => TTarget | undefined;
  canEnterState: (target: TTarget, stateId: number, owner: TOwner) => boolean;
  enterState: (target: TTarget, stateId: number, options: { stateOwner: TOwner }) => void;
};

export type RuntimeHelperTargetStateInput<
  TOwner extends RuntimeHelperTargetStateOwner,
  TTarget extends RuntimeTargetWorldActor,
> = {
  owner: TOwner;
  helper: RuntimeHelper;
  targetActor: RuntimeTargetWorldActor;
  stateId: number;
  hooks: RuntimeHelperTargetStateHooks<TOwner, TTarget>;
};

export type RuntimeHelperTargetStateResult<TTarget extends RuntimeTargetWorldActor> =
  | { entered: true; target: TTarget; stateId: number }
  | { entered: false; reason: "owner-mismatch" | "missing-target" | "unavailable-state" };

export type RuntimeHelperTargetStateHandler = (
  helper: RuntimeHelper,
  target: RuntimeTargetWorldActor,
  stateId: number,
) => void;

export type RuntimeHelperTargetStateBindingOwner = RuntimeHelperTargetStateOwner & {
  enterHelperTargetState?: RuntimeHelperTargetStateHandler;
};

export class RuntimeHelperTargetStateWorld {
  enter<TOwner extends RuntimeHelperTargetStateOwner, TTarget extends RuntimeTargetWorldActor>(
    input: RuntimeHelperTargetStateInput<TOwner, TTarget>,
  ): RuntimeHelperTargetStateResult<TTarget> {
    if (input.helper.ownerId !== input.owner.id) {
      return { entered: false, reason: "owner-mismatch" };
    }

    const target = input.hooks.resolveTarget(input.targetActor);
    if (!target) {
      return { entered: false, reason: "missing-target" };
    }

    if (!input.hooks.canEnterState(target, input.stateId, input.owner)) {
      return { entered: false, reason: "unavailable-state" };
    }

    input.hooks.enterState(target, input.stateId, { stateOwner: input.owner });
    return { entered: true, target, stateId: input.stateId };
  }

  attachOwnerHandlers<TOwner extends RuntimeHelperTargetStateBindingOwner>(
    owners: TOwner[],
    enter: (owner: TOwner, helper: RuntimeHelper, target: RuntimeTargetWorldActor, stateId: number) => void,
  ): void {
    for (const owner of owners) {
      owner.enterHelperTargetState = (helper, target, stateId) => enter(owner, helper, target, stateId);
    }
  }
}

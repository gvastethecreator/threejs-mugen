import type { RuntimeTargetWorldActor } from "./TargetSystem";

export type RuntimeTargetStateEntryActor = {
  stateOwner?: RuntimeTargetStateEntryActor;
};

export type RuntimeTargetStateEntryHooks<TActor extends RuntimeTargetStateEntryActor, TTarget extends RuntimeTargetWorldActor> = {
  canEnterState: (target: TTarget, stateId: number, stateOwner: TActor) => boolean;
  enterState: (target: TTarget, stateId: number, options: { stateOwner: TActor }) => void;
};

export type RuntimeTargetStateEntryInput<
  TActor extends RuntimeTargetStateEntryActor,
  TTarget extends RuntimeTargetWorldActor,
> = {
  actor: TActor;
  target: TTarget;
  stateId: number;
  hooks: RuntimeTargetStateEntryHooks<TActor, TTarget>;
};

export type RuntimeTargetStateEntryResult<TActor extends RuntimeTargetStateEntryActor, TTarget extends RuntimeTargetWorldActor> =
  | { entered: true; target: TTarget; stateId: number; stateOwner: TActor }
  | { entered: false; reason: "unavailable-state"; stateOwner: TActor };

export class RuntimeTargetStateEntryWorld {
  enter<TActor extends RuntimeTargetStateEntryActor, TTarget extends RuntimeTargetWorldActor>(
    input: RuntimeTargetStateEntryInput<TActor, TTarget>,
  ): RuntimeTargetStateEntryResult<TActor, TTarget> {
    const stateOwner = (input.actor.stateOwner ?? input.actor) as TActor;
    if (!input.hooks.canEnterState(input.target, input.stateId, stateOwner)) {
      return { entered: false, reason: "unavailable-state", stateOwner };
    }

    input.hooks.enterState(input.target, input.stateId, { stateOwner });
    return { entered: true, target: input.target, stateId: input.stateId, stateOwner };
  }
}

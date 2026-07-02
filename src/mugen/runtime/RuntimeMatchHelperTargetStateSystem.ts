import type { RuntimeHelper } from "./HelperSystem";
import {
  RuntimeHelperTargetStateWorld,
  type RuntimeHelperTargetStateOwner,
  type RuntimeHelperTargetStateResult,
} from "./RuntimeHelperTargetStateSystem";
import type { RuntimeTargetWorldActor } from "./TargetSystem";

export type RuntimeMatchHelperTargetStateActor = RuntimeHelperTargetStateOwner & RuntimeTargetWorldActor;

export type RuntimeMatchHelperTargetStateInput<TActor extends RuntimeMatchHelperTargetStateActor> = {
  owner: TActor;
  helper: RuntimeHelper;
  targetActor: RuntimeTargetWorldActor;
  stateId: number;
  actors: readonly TActor[];
  canEnterState: (target: TActor, stateId: number, owner: TActor) => boolean;
  enterState: (target: TActor, stateId: number, options: { stateOwner: TActor }) => void;
};

export class RuntimeMatchHelperTargetStateWorld {
  constructor(private readonly targetStateWorld = new RuntimeHelperTargetStateWorld()) {}

  enter<TActor extends RuntimeMatchHelperTargetStateActor>(
    input: RuntimeMatchHelperTargetStateInput<TActor>,
  ): RuntimeHelperTargetStateResult<TActor> {
    return this.targetStateWorld.enter({
      owner: input.owner,
      helper: input.helper,
      targetActor: input.targetActor,
      stateId: input.stateId,
      hooks: {
        resolveTarget: (candidate) => input.actors.find((actor) => actor.id === candidate.id),
        canEnterState: input.canEnterState,
        enterState: input.enterState,
      },
    });
  }
}

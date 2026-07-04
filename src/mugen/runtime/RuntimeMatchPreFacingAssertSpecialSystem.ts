import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStageDefinition } from "../model/MugenStage";
import {
  type RuntimeAssertSpecialActor,
  type RuntimeAssertSpecialApplyResult,
  type RuntimeAssertSpecialWorld,
} from "./RuntimeAssertSpecialSystem";
import {
  type RuntimeControllerDispatchActor,
  type RuntimeControllerDispatchWorld,
} from "./RuntimeControllerDispatchSystem";
import {
  RuntimeControllerEvaluationContextWorld,
} from "./RuntimeControllerEvaluationContextSystem";

export type RuntimeMatchPreFacingAssertSpecialActor = RuntimeAssertSpecialActor & RuntimeControllerDispatchActor;

export type RuntimeMatchPreFacingAssertSpecialInput<TActor extends RuntimeMatchPreFacingAssertSpecialActor> = {
  actor: TActor;
  opponent: TActor;
  tick: number;
  stageBounds?: MugenStageDefinition["bounds"];
  assertSpecialWorld: Pick<RuntimeAssertSpecialWorld, "applyPreFacing">;
  controllerDispatchWorld: Pick<RuntimeControllerDispatchWorld, "apply">;
  triggersPass: (
    controller: ControllerIr,
    actor: TActor,
    opponent: TActor,
    owner: TActor,
    tick: number,
    stageBounds?: MugenStageDefinition["bounds"],
  ) => boolean;
  getConst: (owner: TActor, name: string) => number | undefined;
  nextRandom: (actor: TActor) => number;
};

export class RuntimeMatchPreFacingAssertSpecialWorld {
  constructor(private readonly contextWorld = new RuntimeControllerEvaluationContextWorld()) {}

  apply<TActor extends RuntimeMatchPreFacingAssertSpecialActor>(
    input: RuntimeMatchPreFacingAssertSpecialInput<TActor>,
  ): RuntimeAssertSpecialApplyResult {
    return input.assertSpecialWorld.applyPreFacing({
      actor: input.actor,
      opponent: input.opponent,
      tick: input.tick,
      triggersPass: (controller, actor, opponent, owner, tick) =>
        input.triggersPass(controller, actor, opponent, owner, tick, input.stageBounds),
      executeController: (controller, actor, owner, tick) => {
        input.controllerDispatchWorld.apply(actor, controller, {
          context: this.contextWorld.create({
            actor,
            owner,
            opponent: input.opponent,
            root: actor,
            stageBounds: input.stageBounds,
            tick,
            getConst: input.getConst,
            nextRandom: input.nextRandom,
          }),
        });
        return actor.runtime;
      },
    });
  }
}

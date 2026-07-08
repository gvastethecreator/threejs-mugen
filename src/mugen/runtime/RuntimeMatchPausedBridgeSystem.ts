import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import type { RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import {
  type RuntimePausedMatchAdvanceResult,
  type RuntimePausedMatchRuntimeActor,
  type RuntimePausedMatchRuntimeWorldInput,
  type RuntimePausedMatchWorld,
  type RuntimePauseWorld,
} from "./PauseSystem";

export type RuntimeMatchPausedBridgeActor = RuntimePausedMatchRuntimeActor & {
  commandBuffer: {
    push(tick: number, input: Set<string>, options?: { hitPause?: boolean }): void;
  };
};

export type RuntimeMatchPausedBridgeInput<TActor extends RuntimeMatchPausedBridgeActor> = {
  pausedMatchWorld: Pick<RuntimePausedMatchWorld, "advanceRuntime">;
  pauseWorld: Pick<RuntimePauseWorld, "current" | "canActorMove" | "tick">;
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
  p2Controlled: boolean;
  stage: Pick<MugenStageDefinition, "bounds">;
  gameSpace?: ExpressionGameSpace;
  tick: number;
  actorConstraintWorld: Pick<RuntimeActorConstraintWorld, "clampToStage">;
  effectLifecycleWorld: Pick<
    RuntimeEffectLifecycleWorld,
    "advanceActive" | "advancePresentation" | "advancePausedPresentation"
  >;
  handlePlayerInput: (actor: TActor, input: Set<string>, opponent: TActor) => void;
  handleAi: (actor: TActor, opponent: TActor) => void;
  advanceFighter: (actor: TActor, opponent: TActor) => void;
};

export class RuntimeMatchPausedBridgeWorld {
  advanceRuntime<TActor extends RuntimeMatchPausedBridgeActor>(
    input: RuntimeMatchPausedBridgeInput<TActor>,
  ): RuntimePausedMatchAdvanceResult {
    const pausedInput: RuntimePausedMatchRuntimeWorldInput<TActor> = {
      p1: input.p1,
      p2: input.p2,
      p1Input: input.p1Input,
      p2Input: input.p2Input,
      p2Controlled: input.p2Controlled,
      stage: input.stage,
      gameSpace: input.gameSpace,
      stageTime: input.tick,
      runtimeTick: input.tick,
      actorConstraintWorld: input.actorConstraintWorld,
      effectLifecycleWorld: input.effectLifecycleWorld,
      currentPause: () => input.pauseWorld.current(),
      canActorMove: (actorId) => input.pauseWorld.canActorMove(actorId),
      pushCommandBuffer: (actor, actorInput) => actor.commandBuffer.push(input.tick, actorInput, { hitPause: true }),
      handlePlayerInput: input.handlePlayerInput,
      handleAi: input.handleAi,
      advanceFighter: input.advanceFighter,
      tickPause: () => input.pauseWorld.tick(),
    };

    return input.pausedMatchWorld.advanceRuntime(pausedInput);
  }
}

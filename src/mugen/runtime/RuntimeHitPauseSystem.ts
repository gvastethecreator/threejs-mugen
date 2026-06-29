import type { MugenStageDefinition } from "../model/MugenStage";
import type { CommandBuffer } from "./CommandBuffer";
import type { RuntimeEffectLifecycleActor, RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";

export type RuntimeHitPauseActor = {
  hitPause: number;
};

export type RuntimeHitPauseWorldInput<TActor extends RuntimeHitPauseActor> = {
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
  pushCommandBuffer: (actor: TActor, input: Set<string>) => void;
  runIgnoredControllers: (actor: TActor, opponent: TActor) => void;
  advancePausedPresentation: (actor: TActor) => void;
};

export type RuntimeHitPauseRuntimeActor = RuntimeHitPauseActor &
  RuntimeEffectLifecycleActor & {
    commandBuffer: Pick<CommandBuffer, "push">;
  };

export type RuntimeHitPauseRuntimeWorldInput<TActor extends RuntimeHitPauseRuntimeActor> = {
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
  tick: number;
  stage: Pick<MugenStageDefinition, "bounds">;
  effectLifecycleWorld: Pick<RuntimeEffectLifecycleWorld, "advancePausedPresentation">;
  runIgnoredControllers: (actor: TActor, opponent: TActor) => void;
};

export type RuntimeHitPauseAdvanceResult = {
  paused: boolean;
  globalPause: number;
  p1Remaining: number;
  p2Remaining: number;
};

export class RuntimeHitPauseWorld {
  advance<TActor extends RuntimeHitPauseActor>(input: RuntimeHitPauseWorldInput<TActor>): RuntimeHitPauseAdvanceResult {
    const globalPause = Math.max(input.p1.hitPause, input.p2.hitPause);
    if (globalPause <= 0) {
      return {
        paused: false,
        globalPause: 0,
        p1Remaining: input.p1.hitPause,
        p2Remaining: input.p2.hitPause,
      };
    }

    input.pushCommandBuffer(input.p1, input.p1Input);
    input.pushCommandBuffer(input.p2, input.p2Input);
    input.runIgnoredControllers(input.p1, input.p2);
    input.runIgnoredControllers(input.p2, input.p1);
    input.advancePausedPresentation(input.p1);
    input.advancePausedPresentation(input.p2);
    input.p1.hitPause = Math.max(0, input.p1.hitPause - 1);
    input.p2.hitPause = Math.max(0, input.p2.hitPause - 1);

    return {
      paused: true,
      globalPause,
      p1Remaining: input.p1.hitPause,
      p2Remaining: input.p2.hitPause,
    };
  }

  advanceRuntime<TActor extends RuntimeHitPauseRuntimeActor>(
    input: RuntimeHitPauseRuntimeWorldInput<TActor>,
  ): RuntimeHitPauseAdvanceResult {
    return this.advance({
      p1: input.p1,
      p2: input.p2,
      p1Input: input.p1Input,
      p2Input: input.p2Input,
      pushCommandBuffer: (actor, actorInput) => actor.commandBuffer.push(input.tick, actorInput, { hitPause: true }),
      runIgnoredControllers: input.runIgnoredControllers,
      advancePausedPresentation: (actor) => input.effectLifecycleWorld.advancePausedPresentation(actor, "hitpause", input.stage),
    });
  }
}

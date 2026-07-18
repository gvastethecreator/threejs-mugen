import type { MugenStageDefinition } from "../model/MugenStage";
import type { CommandBuffer } from "./CommandBuffer";
import type {
  RuntimeEffectLifecycleActor,
  RuntimeEffectLifecycleAdvanceOptions,
  RuntimeEffectLifecycleWorld,
} from "./EffectLifecycleSystem";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import { RuntimeMatchOpponentContextWorld } from "./RuntimeMatchOpponentContextSystem";

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
  gameSpace?: ExpressionGameSpace;
  stageTime?: number;
  runtimeTick?: number;
  effectLifecycleWorld: Pick<RuntimeEffectLifecycleWorld, "advancePausedPresentation">;
  resolveHelperTargetRedirect?: RuntimeEffectLifecycleAdvanceOptions["resolveTargetRedirect"];
  resolveHelperResourceRedirect?: RuntimeEffectLifecycleAdvanceOptions["resolveResourceRedirect"];
  onHelperTargetRedirectBlocked?: RuntimeEffectLifecycleAdvanceOptions["onTargetRedirectBlocked"];
  onHelperResourceRedirectBlocked?: RuntimeEffectLifecycleAdvanceOptions["onResourceRedirectBlocked"];
  onHelperRedirectedController?: RuntimeEffectLifecycleAdvanceOptions["onRedirectedController"];
  onHelperRedirectedOperation?: RuntimeEffectLifecycleAdvanceOptions["onRedirectedOperation"];
  onHelperRedirectedTargetDispatch?: RuntimeEffectLifecycleAdvanceOptions["onRedirectedTargetDispatch"];
  enterHelperRedirectedTargetState?: RuntimeEffectLifecycleAdvanceOptions["enterRedirectedTargetState"];
  runIgnoredControllers: (actor: TActor, opponent: TActor) => void;
};

export type RuntimeHitPauseAdvanceResult = {
  paused: boolean;
  globalPause: number;
  p1Remaining: number;
  p2Remaining: number;
};

export class RuntimeHitPauseWorld {
  private readonly opponentContextWorld = new RuntimeMatchOpponentContextWorld();

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
    const pair = { p1: input.p1, p2: input.p2 };

    return this.advance({
      p1: input.p1,
      p2: input.p2,
      p1Input: input.p1Input,
      p2Input: input.p2Input,
      pushCommandBuffer: (actor, actorInput) => actor.commandBuffer.push(input.tick, actorInput, { hitPause: true }),
      runIgnoredControllers: input.runIgnoredControllers,
      advancePausedPresentation: (actor) => {
        const context = this.opponentContextWorld.forActor(pair, actor);
        if (!context) {
          return;
        }
        input.effectLifecycleWorld.advancePausedPresentation(actor, "hitpause", input.stage, context.opponent, {
          gameSpace: input.gameSpace,
          stageTime: input.stageTime ?? input.tick,
          runtimeTick: input.runtimeTick ?? input.tick,
          commandInput: actor === input.p1 ? input.p1Input : input.p2Input,
          opponents: context.opponents,
          resolveTargetRedirect: input.resolveHelperTargetRedirect,
          resolveResourceRedirect: input.resolveHelperResourceRedirect,
          onTargetRedirectBlocked: input.onHelperTargetRedirectBlocked,
          onResourceRedirectBlocked: input.onHelperResourceRedirectBlocked,
          onRedirectedController: input.onHelperRedirectedController,
          onRedirectedOperation: input.onHelperRedirectedOperation,
          onRedirectedTargetDispatch: input.onHelperRedirectedTargetDispatch,
          enterRedirectedTargetState: input.enterHelperRedirectedTargetState,
        });
      },
    });
  }
}

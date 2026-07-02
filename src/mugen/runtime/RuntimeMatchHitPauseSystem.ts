import type {
  RuntimeHitPauseAdvanceResult,
  RuntimeHitPauseRuntimeActor,
  RuntimeHitPauseRuntimeWorldInput,
} from "./RuntimeHitPauseSystem";

export type RuntimeMatchHitPauseDelegate<TActor extends RuntimeHitPauseRuntimeActor> = {
  advanceRuntime(input: RuntimeHitPauseRuntimeWorldInput<TActor>): RuntimeHitPauseAdvanceResult;
};

export type RuntimeMatchHitPauseInput<TActor extends RuntimeHitPauseRuntimeActor> =
  RuntimeHitPauseRuntimeWorldInput<TActor> & {
    hitPauseWorld: RuntimeMatchHitPauseDelegate<TActor>;
  };

export class RuntimeMatchHitPauseWorld {
  advanceRuntime<TActor extends RuntimeHitPauseRuntimeActor>(
    input: RuntimeMatchHitPauseInput<TActor>,
  ): RuntimeHitPauseAdvanceResult {
    const { hitPauseWorld, ...hitPauseInput } = input;
    return hitPauseWorld.advanceRuntime(hitPauseInput);
  }
}

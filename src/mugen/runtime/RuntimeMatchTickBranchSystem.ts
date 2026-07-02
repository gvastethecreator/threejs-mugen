export type RuntimeMatchTickBranch = "hitpause" | "pause" | "active";

export type RuntimeMatchTickBranchInput<THitPause = void, TPaused = void, TActive = void> = {
  advanceHitPause: () => { paused: boolean; result: THitPause };
  isMatchPaused: () => boolean;
  advancePaused: () => TPaused;
  advanceActive: () => TActive;
};

export type RuntimeMatchTickBranchResult<THitPause = void, TPaused = void, TActive = void> =
  | { branch: "hitpause"; result: THitPause }
  | { branch: "pause"; result: TPaused }
  | { branch: "active"; result: TActive };

export class RuntimeMatchTickBranchWorld {
  advance<THitPause = void, TPaused = void, TActive = void>(
    input: RuntimeMatchTickBranchInput<THitPause, TPaused, TActive>,
  ): RuntimeMatchTickBranchResult<THitPause, TPaused, TActive> {
    const hitPause = input.advanceHitPause();
    if (hitPause.paused) {
      return { branch: "hitpause", result: hitPause.result };
    }

    if (input.isMatchPaused()) {
      return { branch: "pause", result: input.advancePaused() };
    }

    return { branch: "active", result: input.advanceActive() };
  }
}

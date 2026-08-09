import {
  RuntimeGlobalAssertSpecialWorld,
  type RuntimeGlobalAssertSpecialActor,
  type RuntimeGlobalAssertSpecialSnapshot,
} from "./RuntimeGlobalAssertSpecialSystem";

export const RUNTIME_PAUSE_GLOBAL_ASSERT_SPECIAL_SCHEMA =
  "mugen-web-sandbox/runtime-pause-global-assert-special/v0";

export type RuntimePauseAssertSpecialPhase = "pause-entry" | "pause-tick";

export type RuntimePauseGlobalAssertSpecialSnapshot = Omit<RuntimeGlobalAssertSpecialSnapshot, "schema"> & {
  schema: typeof RUNTIME_PAUSE_GLOBAL_ASSERT_SPECIAL_SCHEMA;
  pauseType: "Pause" | "SuperPause";
  phase: RuntimePauseAssertSpecialPhase;
};

export type RuntimePauseGlobalAssertSpecialInput = {
  actors: readonly RuntimeGlobalAssertSpecialActor[];
  tick?: number;
  pauseType: "Pause" | "SuperPause";
  phase: RuntimePauseAssertSpecialPhase;
};

export type RuntimePauseGlobalAssertSpecialPolicy = {
  freezeFightTimer: boolean;
  freezePauseTimer: false;
  suppressKoSound: boolean;
  skipRoundDisplay: boolean;
  skipFightDisplay: boolean;
};

/**
 * Samples global AssertSpecial at an explicit pause boundary. The reducer is
 * deliberately stateless: flags asserted on the previous tick cannot leak
 * into a new pause sample.
 */
export class RuntimePauseGlobalAssertSpecialWorld {
  private readonly globalWorld = new RuntimeGlobalAssertSpecialWorld();

  snapshot(input: RuntimePauseGlobalAssertSpecialInput): RuntimePauseGlobalAssertSpecialSnapshot {
    const snapshot = this.globalWorld.snapshot({ actors: input.actors, tick: input.tick });
    return {
      ...snapshot,
      schema: RUNTIME_PAUSE_GLOBAL_ASSERT_SPECIAL_SCHEMA,
      pauseType: input.pauseType,
      phase: input.phase,
    };
  }

  policy(snapshot: RuntimePauseGlobalAssertSpecialSnapshot): RuntimePauseGlobalAssertSpecialPolicy {
    return {
      freezeFightTimer: snapshot.timerFreeze,
      freezePauseTimer: false,
      suppressKoSound: snapshot.noKoSound,
      skipRoundDisplay: snapshot.skipRoundDisplay,
      skipFightDisplay: snapshot.skipFightDisplay,
    };
  }
}

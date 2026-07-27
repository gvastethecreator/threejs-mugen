import type { CharacterRuntimeState, RuntimeActTmp } from "./types";

export type RuntimeActTmpActor = Partial<Pick<CharacterRuntimeState, "actTmp">>;

export type RuntimeActTmpFinishOptions = {
  matchPaused: boolean;
  hitPaused: boolean;
};

/** Materializes the source actionPrepare/actionRun signal for root timing. */
export class RuntimeActTmpWorld {
  prepare(actor: RuntimeActTmpActor, matchPaused: boolean): RuntimeActTmp {
    actor.actTmp = matchPaused ? -2 : 0;
    return actor.actTmp;
  }

  finish(actor: RuntimeActTmpActor, options: RuntimeActTmpFinishOptions): RuntimeActTmp {
    const prepared = actor.actTmp ?? (options.matchPaused ? -2 : 0);
    const next = prepared
      + (options.matchPaused || options.hitPaused ? 0 : 1)
      - (options.hitPaused ? 1 : 0);
    actor.actTmp = next as RuntimeActTmp;
    return actor.actTmp;
  }
}

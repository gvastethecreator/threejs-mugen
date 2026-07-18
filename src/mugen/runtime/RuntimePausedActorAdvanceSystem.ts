import {
  RuntimeActorRunOrderWorld,
  type RuntimeActorRunOrderCandidate,
  type RuntimeActorRunOrderResult,
} from "./RuntimeActorRunOrderSystem";
import type { RuntimeMatchPause } from "./PauseSystem";

export type RuntimePausedActorAdvanceInput<TRoot, THelper> = {
  pause: RuntimeMatchPause;
  runOrder: RuntimeActorRunOrderResult<TRoot, THelper>;
  canAdvanceRoot: (root: TRoot) => boolean;
  advancePauseImmuneRoot?: (root: TRoot) => void;
  advanceRoot: (root: TRoot) => void;
  consumeRootMoveTime: (root: TRoot) => void;
  canAdvanceHelper: (helper: THelper, pauseType: RuntimeMatchPause["type"]) => boolean;
  advanceHelper: (helper: THelper, pauseType: RuntimeMatchPause["type"]) => void;
  discoverHelpers: () => RuntimeActorRunOrderCandidate<TRoot, THelper>[];
  currentPause: () => RuntimeMatchPause | undefined;
  finalizePresentation: (movedRoots: readonly TRoot[]) => void;
  tickPause: () => RuntimeMatchPause | undefined;
};

export type RuntimePausedActorAdvanceResult<TRoot> = {
  movedRoots: TRoot[];
  movedHelpers: number;
  interrupted: boolean;
  ticked: boolean;
};

export class RuntimePausedActorAdvanceWorld {
  constructor(private readonly runOrderWorld = new RuntimeActorRunOrderWorld()) {}

  advance<TRoot, THelper>(input: RuntimePausedActorAdvanceInput<TRoot, THelper>): RuntimePausedActorAdvanceResult<TRoot> {
    const movedRoots: TRoot[] = [];
    let movedHelpers = 0;
    const seen = new Set(input.runOrder.entries.map((entry) => entry.key));

    for (let index = 0; index < input.runOrder.entries.length; index += 1) {
      const entry = input.runOrder.entries[index]!;
      if (entry.kind === "root") {
        if (input.canAdvanceRoot(entry.value)) {
          input.advanceRoot(entry.value);
          input.consumeRootMoveTime(entry.value);
          movedRoots.push(entry.value);
        } else {
          input.advancePauseImmuneRoot?.(entry.value);
        }
      } else if (input.canAdvanceHelper(entry.value, input.pause.type)) {
        input.advanceHelper(entry.value, input.pause.type);
        movedHelpers += 1;
      }

      if (input.currentPause() !== input.pause) {
        return { movedRoots, movedHelpers, interrupted: true, ticked: false };
      }

      const appended = input.discoverHelpers().filter((candidate) => !seen.has(candidate.key));
      for (const candidate of appended) seen.add(candidate.key);
      this.runOrderWorld.append(input.runOrder, appended);
    }

    input.finalizePresentation(movedRoots);
    input.tickPause();
    return { movedRoots, movedHelpers, interrupted: false, ticked: true };
  }
}

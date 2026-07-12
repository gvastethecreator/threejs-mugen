import {
  RuntimeActorRunOrderWorld,
  type RuntimeActorRunOrderCandidate,
  type RuntimeActorRunOrderResult,
} from "./RuntimeActorRunOrderSystem";
import type { RuntimeRootAdvancePhase } from "./RuntimeRootAdvancePhaseSystem";

export type RuntimeMatchActorAdvanceInput<TRoot, THelper> = {
  runOrder: RuntimeActorRunOrderResult<TRoot, THelper>;
  opponentOf: (root: TRoot) => TRoot;
  applyAutoGuardStart: (defender: TRoot, attacker: TRoot, checkpoint: "pre" | "post") => void;
  participationOf: (root: TRoot) => RuntimeRootAdvancePhase;
  advanceRoot: (root: TRoot, opponent: TRoot, participation: RuntimeRootAdvancePhase) => void;
  advanceHelper: (helper: THelper) => void;
  discoverHelpers: () => RuntimeActorRunOrderCandidate<TRoot, THelper>[];
};

export class RuntimeMatchActorAdvanceWorld {
  constructor(private readonly runOrderWorld = new RuntimeActorRunOrderWorld()) {}

  advance<TRoot, THelper>(input: RuntimeMatchActorAdvanceInput<TRoot, THelper>): RuntimeActorRunOrderResult<TRoot, THelper> {
    const seen = new Set(input.runOrder.entries.map((entry) => entry.key));
    for (const entry of input.runOrder.entries) {
      if (entry.kind === "root") {
        if (input.participationOf(entry.value) === "playable") {
          input.applyAutoGuardStart(entry.value, input.opponentOf(entry.value), "pre");
        }
      }
    }

    for (let index = 0; index < input.runOrder.entries.length; index += 1) {
      const entry = input.runOrder.entries[index]!;
      if (entry.kind === "root") {
        const opponent = input.opponentOf(entry.value);
        const participation = input.participationOf(entry.value);
        input.advanceRoot(entry.value, opponent, participation);
        if (participation === "playable") {
          input.applyAutoGuardStart(entry.value, opponent, "post");
        }
      } else {
        input.advanceHelper(entry.value);
      }

      const appended = input.discoverHelpers().filter((candidate) => !seen.has(candidate.key));
      for (const candidate of appended) seen.add(candidate.key);
      this.runOrderWorld.append(input.runOrder, appended);
    }
    return input.runOrder;
  }
}

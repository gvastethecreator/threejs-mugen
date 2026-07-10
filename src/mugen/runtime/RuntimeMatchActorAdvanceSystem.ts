import {
  RuntimeActorRunOrderWorld,
  type RuntimeActorRunOrderCandidate,
  type RuntimeActorRunOrderResult,
} from "./RuntimeActorRunOrderSystem";

export type RuntimeMatchActorAdvanceInput<TRoot, THelper> = {
  runOrder: RuntimeActorRunOrderResult<TRoot, THelper>;
  opponentOf: (root: TRoot) => TRoot;
  applyAutoGuardStart: (defender: TRoot, attacker: TRoot, checkpoint: "pre" | "post") => void;
  advanceRoot: (root: TRoot, opponent: TRoot) => void;
  advanceHelper: (helper: THelper) => void;
  discoverHelpers: () => RuntimeActorRunOrderCandidate<TRoot, THelper>[];
};

export class RuntimeMatchActorAdvanceWorld {
  constructor(private readonly runOrderWorld = new RuntimeActorRunOrderWorld()) {}

  advance<TRoot, THelper>(input: RuntimeMatchActorAdvanceInput<TRoot, THelper>): RuntimeActorRunOrderResult<TRoot, THelper> {
    const seen = new Set(input.runOrder.entries.map((entry) => entry.key));
    for (const entry of input.runOrder.entries) {
      if (entry.kind === "root") {
        input.applyAutoGuardStart(entry.value, input.opponentOf(entry.value), "pre");
      }
    }

    for (let index = 0; index < input.runOrder.entries.length; index += 1) {
      const entry = input.runOrder.entries[index]!;
      if (entry.kind === "root") {
        const opponent = input.opponentOf(entry.value);
        input.advanceRoot(entry.value, opponent);
        input.applyAutoGuardStart(entry.value, opponent, "post");
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

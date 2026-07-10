import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { RuntimeAssertSpecial } from "./types";

type RuntimeActorRunOrderCandidateBase<TValue> = {
  key: string;
  runOrderId: number;
  moveType: "I" | "A" | "H";
  assertSpecial?: RuntimeAssertSpecial;
  value: TValue;
  stamp: (runOrder: number | undefined) => void;
};

export type RuntimeRootRunOrderCandidate<TRoot> = RuntimeActorRunOrderCandidateBase<TRoot> & {
  kind: "root";
};

export type RuntimeHelperRunOrderCandidate<THelper> = RuntimeActorRunOrderCandidateBase<THelper> & {
  kind: "helper";
};

export type RuntimeActorRunOrderCandidate<TRoot, THelper> =
  | RuntimeRootRunOrderCandidate<TRoot>
  | RuntimeHelperRunOrderCandidate<THelper>;

export type RuntimeActorRunOrderResult<TRoot, THelper> = {
  profile: RuntimeCompatibilityProfile;
  supported: boolean;
  entries: RuntimeActorRunOrderCandidate<TRoot, THelper>[];
};

export class RuntimeActorRunOrderWorld {
  order<TRoot, THelper>(
    profile: RuntimeCompatibilityProfile,
    candidates: readonly RuntimeActorRunOrderCandidate<TRoot, THelper>[],
  ): RuntimeActorRunOrderResult<TRoot, THelper> {
    const entries = [...candidates];
    if (profile === "ikemen-go") {
      entries.sort((left, right) => actorPriority(right) - actorPriority(left) || left.runOrderId - right.runOrderId);
    }
    const result = { profile, supported: profile === "ikemen-go", entries };
    this.stamp(result);
    return result;
  }

  append<TRoot, THelper>(
    result: RuntimeActorRunOrderResult<TRoot, THelper>,
    candidates: readonly RuntimeActorRunOrderCandidate<TRoot, THelper>[],
  ): void {
    for (const candidate of [...candidates].sort((left, right) => left.runOrderId - right.runOrderId)) {
      result.entries.push(candidate);
      candidate.stamp(result.supported ? result.entries.length : undefined);
    }
  }

  private stamp<TRoot, THelper>(result: RuntimeActorRunOrderResult<TRoot, THelper>): void {
    for (const [index, candidate] of result.entries.entries()) {
      candidate.stamp(result.supported ? index + 1 : undefined);
    }
  }
}

function actorPriority(candidate: RuntimeActorRunOrderCandidate<unknown, unknown>): number {
  const runFirst = candidate.assertSpecial?.runFirst === true;
  const runLast = candidate.assertSpecial?.runLast === true;
  if (runFirst && !runLast) return 100;
  if (runLast && !runFirst) return -100;
  if (candidate.moveType === "A") return 5;
  if (candidate.kind === "root") return candidate.moveType === "I" ? 4 : 3;
  return candidate.moveType === "I" ? 2 : 1;
}

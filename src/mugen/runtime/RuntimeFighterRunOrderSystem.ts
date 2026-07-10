import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { CharacterRuntimeState } from "./types";

export type RuntimeRootRunOrderActor = {
  id: string;
  runtime: Pick<CharacterRuntimeState, "moveType" | "assertSpecial" | "runOrder">;
};

export type RuntimeRootRunOrderEntry<TActor> = {
  actor: TActor;
  priority: number;
};

export type RuntimeRootRunOrderResult<TActor> = {
  profile: RuntimeCompatibilityProfile;
  policy: "ikemen-go-root" | "preserve-input";
  supported: boolean;
  entries: readonly [RuntimeRootRunOrderEntry<TActor>, RuntimeRootRunOrderEntry<TActor>];
};

export class RuntimeFighterRunOrderWorld {
  orderPair<TActor extends RuntimeRootRunOrderActor>(
    profile: RuntimeCompatibilityProfile,
    p1: TActor,
    p2: TActor,
  ): RuntimeRootRunOrderResult<TActor> {
    if (profile !== "ikemen-go") {
      return {
        profile,
        policy: "preserve-input",
        supported: false,
        entries: [entry(p1, 0), entry(p2, 0)],
      };
    }

    const entries: [RuntimeRootRunOrderEntry<TActor>, RuntimeRootRunOrderEntry<TActor>] = [
      entry(p1, ikemenRootPriority(p1.runtime)),
      entry(p2, ikemenRootPriority(p2.runtime)),
    ];
    entries.sort((left, right) => right.priority - left.priority || compareRuntimeIds(left.actor.id, right.actor.id));
    return { profile, policy: "ikemen-go-root", supported: true, entries };
  }

  stamp<TActor extends RuntimeRootRunOrderActor>(result: RuntimeRootRunOrderResult<TActor>): RuntimeRootRunOrderResult<TActor> {
    for (const [index, { actor }] of result.entries.entries()) {
      actor.runtime.runOrder = result.supported ? index + 1 : undefined;
    }
    return result;
  }
}

function compareRuntimeIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function entry<TActor>(actor: TActor, priority: number): RuntimeRootRunOrderEntry<TActor> {
  return { actor, priority };
}

function ikemenRootPriority(runtime: Pick<CharacterRuntimeState, "moveType" | "assertSpecial">): number {
  const runFirst = runtime.assertSpecial?.runFirst === true;
  const runLast = runtime.assertSpecial?.runLast === true;
  if (runFirst && !runLast) {
    return 100;
  }
  if (runLast && !runFirst) {
    return -100;
  }
  if (runtime.moveType === "A") {
    return 5;
  }
  if (runtime.moveType === "I") {
    return 4;
  }
  return 3;
}

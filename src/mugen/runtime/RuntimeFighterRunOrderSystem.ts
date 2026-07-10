import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { CharacterRuntimeState } from "./types";

export type RuntimeRootRunOrderActor = {
  id: string;
  runtime: Pick<CharacterRuntimeState, "moveType">;
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
      entry(p1, ikemenRootPriority(p1.runtime.moveType)),
      entry(p2, ikemenRootPriority(p2.runtime.moveType)),
    ];
    entries.sort((left, right) => right.priority - left.priority || compareRuntimeIds(left.actor.id, right.actor.id));
    return { profile, policy: "ikemen-go-root", supported: true, entries };
  }
}

function compareRuntimeIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function entry<TActor>(actor: TActor, priority: number): RuntimeRootRunOrderEntry<TActor> {
  return { actor, priority };
}

function ikemenRootPriority(moveType: CharacterRuntimeState["moveType"]): number {
  if (moveType === "A") {
    return 5;
  }
  if (moveType === "I") {
    return 4;
  }
  return 3;
}

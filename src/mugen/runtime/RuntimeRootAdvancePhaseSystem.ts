import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { RuntimeTagTeamMode } from "./RuntimeTagTeamOrderSystem";
import { runtimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTeamState } from "./types";

export type RuntimeRootAdvancePhase = "playable" | "active-motion" | "bounded-standby";

export type RuntimeRootAdvancePhaseActor = {
  id: string;
  runtime: {
    teamState?: RuntimeTeamState;
  };
};

export type RuntimeRootAdvancePhaseEntry<TActor extends RuntimeRootAdvancePhaseActor> = {
  actor: TActor;
  actorId: string;
  phase: RuntimeRootAdvancePhase;
};

export type RuntimeRootAdvancePhaseSnapshot<TActor extends RuntimeRootAdvancePhaseActor> = {
  entries: readonly RuntimeRootAdvancePhaseEntry<TActor>[];
  phaseOf(actor: TActor): RuntimeRootAdvancePhase;
};

export type RuntimeRootAdvancePhaseInput<TActor extends RuntimeRootAdvancePhaseActor> = {
  runtimeProfile: RuntimeCompatibilityProfile;
  teamMode: RuntimeTagTeamMode;
  roots: readonly TActor[];
  playableRoots: readonly [TActor, TActor];
};

export class RuntimeRootAdvancePhaseWorld {
  snapshot<TActor extends RuntimeRootAdvancePhaseActor>(
    input: RuntimeRootAdvancePhaseInput<TActor>,
  ): RuntimeRootAdvancePhaseSnapshot<TActor> {
    assertRoots(input.roots, input.playableRoots);
    const playableRoots = new Set<TActor>(input.playableRoots);
    const tagMode = input.runtimeProfile === "ikemen-go" && input.teamMode === "tag";
    const entries = input.roots.map((actor): RuntimeRootAdvancePhaseEntry<TActor> => Object.freeze({
      actor,
      actorId: actor.id,
      phase: phaseFor(actor, playableRoots.has(actor), tagMode),
    }));
    const phaseByActor = new Map(entries.map(({ actor, phase }) => [actor, phase]));
    return Object.freeze({
      entries: Object.freeze(entries),
      phaseOf: (actor: TActor) => {
        const phase = phaseByActor.get(actor);
        if (!phase) throw new Error(`Unknown root advance actor ${actor.id}`);
        return phase;
      },
    });
  }
}

function phaseFor(
  actor: RuntimeRootAdvancePhaseActor,
  pairOwned: boolean,
  tagMode: boolean,
): RuntimeRootAdvancePhase {
  if (!tagMode) return pairOwned ? "playable" : "bounded-standby";
  const teamState = actor.runtime.teamState;
  if (!teamState || teamState.disabled || !teamState.playerType || teamState.standby || teamState.overKo) {
    return "bounded-standby";
  }
  if (runtimeTeamSide(actor) === undefined) return "bounded-standby";
  return pairOwned ? "playable" : "active-motion";
}

function assertRoots<TActor extends RuntimeRootAdvancePhaseActor>(
  roots: readonly TActor[],
  playableRoots: readonly [TActor, TActor],
): void {
  const rootSet = new Set<TActor>();
  const ids = new Set<string>();
  for (const root of roots) {
    if (rootSet.has(root)) throw new Error(`Duplicate root advance actor object ${root.id}`);
    if (ids.has(root.id)) throw new Error(`Duplicate root advance actor id ${root.id}`);
    rootSet.add(root);
    ids.add(root.id);
  }
  if (playableRoots[0] === playableRoots[1] || playableRoots.some((root) => !rootSet.has(root))) {
    throw new Error("Root advance playable pair must contain two distinct registered roots");
  }
}

import {
  runtimeTeamActorIsActive,
  runtimeTeamSide,
  type RuntimeTeamSide,
  type RuntimeTeamTopologyActor,
} from "./RuntimeTeamTopologySystem";

export type RuntimeRootSelectionEntry = {
  actorId: string;
  side: RuntimeTeamSide;
  partnerIds: string[];
  enemyIds: string[];
  p2CandidateIds: string[];
};

export type RuntimeRootSelectionDiagnostic = {
  schema: "RuntimeRootSelection/v0";
  entries: RuntimeRootSelectionEntry[];
};

export class RuntimeRootSelectionWorld {
  diagnostic<TActor extends RuntimeTeamTopologyActor>(actors: readonly TActor[]): RuntimeRootSelectionDiagnostic {
    const roots = actors.filter((actor) => actor.rootId === undefined);
    return {
      schema: "RuntimeRootSelection/v0",
      entries: roots.flatMap((actor) => {
        const side = runtimeTeamSide(actor);
        if (side === undefined) {
          return [];
        }
        const opposingActiveRoots = roots.filter(
          (candidate) => runtimeTeamSide(candidate) !== side && runtimeTeamActorIsActive(candidate),
        );
        return [{
          actorId: actor.id,
          side,
          partnerIds: roots
            .filter((candidate) => candidate.id !== actor.id && runtimeTeamSide(candidate) === side)
            .map((candidate) => candidate.id),
          enemyIds: opposingActiveRoots.map((candidate) => candidate.id),
          p2CandidateIds: opposingActiveRoots
            .filter((candidate) => (candidate.playerType ?? true) && candidate.overKo !== true)
            .map((candidate) => candidate.id),
        }];
      }),
    };
  }
}

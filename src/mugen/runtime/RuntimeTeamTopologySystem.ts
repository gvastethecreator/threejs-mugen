export type RuntimeTeamSide = 1 | 2;

export type RuntimeTeamTopologyActor = {
  id: string;
  rootId?: string;
  disabled?: boolean;
  standby?: boolean;
  overKo?: boolean;
  playerType?: boolean;
};

export type RuntimeTeamRosterDiagnosticEntry = {
  id: string;
  rootId?: string;
  side: RuntimeTeamSide | null;
  kind: "root" | "helper";
  disabled: boolean;
  standby: boolean;
  overKo: boolean;
  playerType: boolean;
  enemyBaseEligible: boolean;
  enemyNearCandidate: boolean;
  p2Candidate: boolean;
};

export type RuntimeTeamRosterDiagnostic = {
  schema: "RuntimeTeamRoster/v0";
  characters: readonly RuntimeTeamRosterDiagnosticEntry[];
};

export type RuntimeTeamTopology<TActor extends RuntimeTeamTopologyActor> = {
  characters: readonly TActor[];
  sideFor(actor: TActor): RuntimeTeamSide | undefined;
  charactersFor(side: RuntimeTeamSide): readonly TActor[];
  opposingCharactersFor(actor: TActor): readonly TActor[];
  enemyNearCandidatesFor(actor: TActor): readonly TActor[];
  p2CandidatesFor(actor: TActor): readonly TActor[];
  diagnostic(): RuntimeTeamRosterDiagnostic;
};

export class RuntimeTeamTopologyWorld {
  create<TActor extends RuntimeTeamTopologyActor>(
    characters: readonly TActor[],
  ): RuntimeTeamTopology<TActor> {
    const roster = [...characters];
    return {
      characters: roster,
      sideFor: runtimeTeamSide,
      charactersFor: (side) => roster.filter((actor) => runtimeTeamSide(actor) === side),
      opposingCharactersFor: (actor) => {
        const side = runtimeTeamSide(actor);
        return side === undefined
          ? []
          : roster.filter((candidate) => {
              const candidateSide = runtimeTeamSide(candidate);
              return candidateSide !== undefined && candidateSide !== side;
            });
      },
      enemyNearCandidatesFor: (actor) => opposingActiveCharacters(roster, actor)
        .filter((candidate) => candidate.rootId === undefined && runtimeTeamActorPlayerType(candidate)),
      p2CandidatesFor: (actor) => opposingActiveCharacters(roster, actor)
        .filter((candidate) => runtimeTeamActorPlayerType(candidate) && !candidate.overKo),
      diagnostic: () => ({
        schema: "RuntimeTeamRoster/v0",
        characters: roster.map((actor) => ({
          id: actor.id,
          ...(actor.rootId !== undefined ? { rootId: actor.rootId } : {}),
          side: runtimeTeamSide(actor) ?? null,
          kind: actor.rootId === undefined ? "root" : "helper",
          disabled: actor.disabled === true,
          standby: actor.standby === true,
          overKo: actor.overKo === true,
          playerType: runtimeTeamActorPlayerType(actor),
          enemyBaseEligible: runtimeTeamActorIsActive(actor),
          enemyNearCandidate: runtimeTeamActorIsActive(actor)
            && actor.rootId === undefined
            && runtimeTeamActorPlayerType(actor),
          p2Candidate: runtimeTeamActorIsActive(actor)
            && runtimeTeamActorPlayerType(actor)
            && actor.overKo !== true,
        })),
      }),
    };
  }
}

export function runtimeTeamActorIsActive(actor: RuntimeTeamTopologyActor): boolean {
  return runtimeTeamSide(actor) !== undefined && actor.disabled !== true && actor.standby !== true;
}

function runtimeTeamActorPlayerType(actor: RuntimeTeamTopologyActor): boolean {
  return actor.playerType ?? actor.rootId === undefined;
}

function opposingActiveCharacters<TActor extends RuntimeTeamTopologyActor>(
  roster: readonly TActor[],
  actor: TActor,
): readonly TActor[] {
  const side = runtimeTeamSide(actor);
  return side === undefined
    ? []
    : roster.filter((candidate) => runtimeTeamSide(candidate) !== side && runtimeTeamActorIsActive(candidate));
}

export function runtimeTeamSide(actor: RuntimeTeamTopologyActor): RuntimeTeamSide | undefined {
  return runtimeTeamSideFromId(actor.rootId ?? actor.id);
}

export function runtimeTeamSideFromId(id: string): RuntimeTeamSide | undefined {
  const match = /^p(\d+)(?:-|$)/i.exec(id.trim());
  if (!match) {
    return undefined;
  }
  const playerNumber = Number(match[1]);
  if (!Number.isSafeInteger(playerNumber) || playerNumber < 1 || playerNumber > 8) {
    return undefined;
  }
  return playerNumber % 2 === 1 ? 1 : 2;
}

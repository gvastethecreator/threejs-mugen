export type RuntimeTeamSide = 1 | 2;

export type RuntimeTeamTopologyActor = {
  id: string;
  rootId?: string;
};

export type RuntimeTeamTopology<TActor extends RuntimeTeamTopologyActor> = {
  characters: readonly TActor[];
  sideFor(actor: TActor): RuntimeTeamSide | undefined;
  charactersFor(side: RuntimeTeamSide): readonly TActor[];
  opposingCharactersFor(actor: TActor): readonly TActor[];
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
    };
  }
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

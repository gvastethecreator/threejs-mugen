export type RuntimeMatchActorRosterActor = {
  id: string;
};

export type RuntimeMatchActorRosterPair<TActor extends RuntimeMatchActorRosterActor> = {
  p1: TActor;
  p2: TActor;
};

export type RuntimeMatchActorRoster<TActor extends RuntimeMatchActorRosterActor> = {
  actors: readonly [TActor, TActor];
  effectStoreOwners: { p1: string; p2: string };
  findById(id: string): TActor | undefined;
  opponentsFor(actor: TActor): readonly TActor[];
};

export class RuntimeMatchActorRosterWorld {
  create<TActor extends RuntimeMatchActorRosterActor>(
    pair: RuntimeMatchActorRosterPair<TActor>,
  ): RuntimeMatchActorRoster<TActor> {
    const actors = [pair.p1, pair.p2] as const;
    return {
      actors,
      effectStoreOwners: { p1: pair.p1.id, p2: pair.p2.id },
      findById: (id) => actors.find((actor) => actor.id === id),
      opponentsFor: (actor) => {
        if (actor === pair.p1) {
          return [pair.p2];
        }
        if (actor === pair.p2) {
          return [pair.p1];
        }
        return [];
      },
    };
  }
}

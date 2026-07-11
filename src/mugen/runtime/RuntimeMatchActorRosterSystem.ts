import {
  RuntimeTeamTopologyWorld,
  type RuntimeTeamRosterDiagnostic,
  type RuntimeTeamTopology,
  type RuntimeTeamTopologyActor,
} from "./RuntimeTeamTopologySystem";

export type RuntimeMatchActorRosterActor = {
  id: string;
};

export type RuntimeMatchCharacterRegistry<TActor extends RuntimeTeamTopologyActor> = {
  characters: readonly TActor[];
  topology: RuntimeTeamTopology<TActor>;
  findById(id: string): TActor | undefined;
  diagnostic(): RuntimeTeamRosterDiagnostic;
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
  private readonly teamTopologyWorld = new RuntimeTeamTopologyWorld();

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

  createCharacterRegistry<TActor extends RuntimeTeamTopologyActor>(
    characters: readonly TActor[],
  ): RuntimeMatchCharacterRegistry<TActor> {
    const entries = Object.freeze([...characters]);
    const byId = new Map<string, TActor>();
    for (const actor of entries) {
      if (byId.has(actor.id)) {
        throw new Error(`Duplicate runtime character id: ${actor.id}`);
      }
      byId.set(actor.id, actor);
    }
    const topology = this.teamTopologyWorld.create(entries);
    return {
      characters: entries,
      topology,
      findById: (id) => byId.get(id),
      diagnostic: () => topology.diagnostic(),
    };
  }
}

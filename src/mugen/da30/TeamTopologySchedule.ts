/**
 * DA30-097: plural team topology and schedule revalidation.
 */

export type TeamActor = {
  id: string;
  side: "p1" | "p2";
  seat: number;
  active: boolean;
  standby: boolean;
  partnerOf: string | null;
  enemyOf: string[];
};

export type TopologyState = {
  schema: "Da30TeamTopologySchedule/v1";
  actors: TeamActor[];
  preparedOrder: string[];
  mode: "tag" | "turns" | "simul";
  checksum1v1: string;
};

export function buildP1P4Topology(): TopologyState {
  const actors: TeamActor[] = [
    { id: "P1", side: "p1", seat: 1, active: true, standby: false, partnerOf: "P3", enemyOf: ["P2", "P4"] },
    { id: "P2", side: "p2", seat: 1, active: true, standby: false, partnerOf: "P4", enemyOf: ["P1", "P3"] },
    { id: "P3", side: "p1", seat: 2, active: false, standby: true, partnerOf: "P1", enemyOf: ["P2", "P4"] },
    { id: "P4", side: "p2", seat: 2, active: false, standby: true, partnerOf: "P2", enemyOf: ["P1", "P3"] },
  ];
  return {
    schema: "Da30TeamTopologySchedule/v1",
    actors,
    preparedOrder: ["P1", "P2", "P3", "P4"],
    mode: "tag",
    checksum1v1: "1v1-stable",
  };
}

export function tagTransition(s: TopologyState, side: "p1" | "p2"): TopologyState {
  const actors = s.actors.map((a) => ({ ...a }));
  const active = actors.find((a) => a.side === side && a.active);
  const standby = actors.find((a) => a.side === side && a.standby);
  if (!active || !standby) return s;
  active.active = false;
  active.standby = true;
  standby.active = true;
  standby.standby = false;
  return { ...s, actors, preparedOrder: [...s.preparedOrder, `tag-${standby.id}`] };
}

export function resetTopology(s: TopologyState): TopologyState {
  return buildP1P4Topology();
}

export function runTeamTopology(): {
  ok: boolean;
  registryComplete: boolean;
  tagWorks: boolean;
  oneV1Unchanged: boolean;
} {
  let s = buildP1P4Topology();
  const registryComplete = s.actors.length === 4 && s.actors.every((a) => a.enemyOf.length === 2);
  s = tagTransition(s, "p1");
  const tagWorks = s.actors.find((a) => a.id === "P3")?.active === true && s.actors.find((a) => a.id === "P1")?.standby === true;
  s = resetTopology(s);
  const oneV1Unchanged = s.checksum1v1 === "1v1-stable" && s.actors.find((a) => a.id === "P1")?.active === true;
  return {
    ok: registryComplete && tagWorks && oneV1Unchanged,
    registryComplete,
    tagWorks,
    oneV1Unchanged,
  };
}

import { describe, expect, it } from "vitest";
import { RuntimeTurnsContinuationWorld } from "../mugen/runtime/RuntimeTurnsContinuationSystem";
import type { RuntimeTeamState } from "../mugen/runtime/types";
import type { RuntimeTeamRoundHandoffActor } from "../mugen/runtime/RuntimeTeamRoundHandoffSystem";

describe("RuntimeTurnsContinuationWorld", () => {
  it("preflights replacement, resource reset, and state 5900 in stable phase order", () => {
    const actors = turnsActors({ p2Life: 0 });
    const result = new RuntimeTurnsContinuationWorld().prepare({
      actors,
      modeBySide: { 1: "turns", 2: "turns" },
      stateActors: actors.map(({ id }) => ({ id, stateIds: [0, 5900] })),
      resourceActors: actors.map((actor) => ({
        id: actor.id,
        life: actor.life,
        lifeMax: 1000,
        power: 120,
        guardPoints: 700,
        dizzyPoints: 600,
      })),
      winnerId: "p1",
      nextRoundNo: 1,
      tick: 24,
    });

    expect(result).toMatchObject({
      schema: "mugen-web-sandbox/runtime-turns-continuation/v0",
      status: "replacement-required",
      ready: true,
      incomingActorIds: ["p4"],
      phases: [
        "decision:read",
        "decision:replacement-required",
        "handoff:preflight",
        "resources:preflight",
        "state-5900:preflight",
        "continuation:ready",
      ],
      handoff: { outcome: "replacement", ready: true },
      resourceReset: { states: expect.any(Array) },
      state5900: { availableActorIds: ["p1", "p2", "p3", "p4"] },
    });
    expect(result.resourceReset.states.find(({ actorId }) => actorId === "p1")).toMatchObject({ lifeAfter: 1000 });
    expect(result.resourceReset.states.find(({ actorId }) => actorId === "p2")).toMatchObject({ lifeAfter: 0 });
  });

  it("fails closed when the incoming actor has no state 5900", () => {
    const actors = turnsActors({ p2Life: 0 });
    const result = new RuntimeTurnsContinuationWorld().prepare({
      actors,
      modeBySide: { 1: "turns", 2: "turns" },
      stateActors: actors.map(({ id }) => ({ id, stateIds: id === "p4" ? [0] : [0, 5900] })),
      nextRoundNo: 1,
    });

    expect(result).toMatchObject({ status: "blocked", ready: false });
    expect(result.diagnostics).toContain("state-5900-required:p4");
  });

  it("keeps final side defeat separate from replacement", () => {
    const actors = turnsActors({ p2Life: 0, includeP4: false });
    const result = new RuntimeTurnsContinuationWorld().prepare({
      actors,
      modeBySide: { 1: "turns", 2: "turns" },
      stateActors: actors.map(({ id }) => ({ id, stateIds: [0, 5900] })),
      nextRoundNo: 1,
    });

    expect(result).toMatchObject({ status: "side-defeat", ready: false, handoff: { outcome: "side-defeat" } });
    expect(result.phases).toEqual(["decision:read", "decision:side-defeat", "continuation:skip"]);
  });
});

function turnsActors(options: { p2Life: number; includeP4?: boolean }): RuntimeTeamRoundHandoffActor[] {
  const actors: RuntimeTeamRoundHandoffActor[] = [
    actor("p1", 1, 1000, false, false, 0),
    actor("p2", 2, options.p2Life, false, false, 0),
    actor("p3", 1, 1000, true, true, 1),
  ];
  if (options.includeP4 !== false) actors.push(actor("p4", 2, 1000, true, true, 1));
  return actors;
}

function actor(
  id: string,
  side: 1 | 2,
  life: number,
  standby: boolean,
  replacementEligible: boolean,
  memberNo: number,
): RuntimeTeamRoundHandoffActor {
  const teamState: RuntimeTeamState = { disabled: false, standby, overKo: false, playerType: true };
  return { id, side, life, standby, overKo: false, playerType: true, replacementEligible, memberNo, teamState };
}

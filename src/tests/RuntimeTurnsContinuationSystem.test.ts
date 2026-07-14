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
      recoveryTimeTicks: 300,
      nextRoundNo: 1,
      tick: 24,
    });

    expect(result).toMatchObject({
      schema: "mugen-web-sandbox/runtime-turns-continuation/v0",
      status: "replacement-required",
      ready: true,
      incomingActorIds: ["p4"],
      roster: {
        schema: "mugen-web-sandbox/runtime-turns-roster/v0",
        sides: [
          {
            side: 1,
            actorIds: ["p1", "p3"],
            activeActorIds: ["p1"],
            standbyActorIds: ["p3"],
            replacementCandidateIds: ["p3"],
            remainingCandidateIds: [],
            nextIncomingActorId: "p3",
          },
          {
            side: 2,
            actorIds: ["p2", "p4"],
            activeActorIds: ["p2"],
            standbyActorIds: ["p4"],
            replacementCandidateIds: ["p4"],
            remainingCandidateIds: [],
            nextIncomingActorId: "p4",
          },
        ],
      },
      recovery: { timeTicks: 300, states: expect.any(Array) },
      phases: [
        "decision:read",
        "decision:replacement-required",
        "handoff:preflight",
        "recovery:preflight",
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

  it("applies official winner recovery before the second ordered Turns entrant", () => {
    const actors = turnsActors({ p2Life: 0, includeP4: true, includeP6: true, p1Life: 400 });
    const world = new RuntimeTurnsContinuationWorld();
    const first = world.prepare({
      actors,
      modeBySide: { 1: "turns", 2: "turns" },
      stateActors: actors.map(({ id }) => ({ id, stateIds: [0, 5900] })),
      resourceActors: actors.map((actor) => ({
        id: actor.id,
        life: actor.life,
        lifeMax: 1000,
        power: 0,
        guardPoints: 0,
        dizzyPoints: 0,
      })),
      winnerId: "p1",
      recoveryTimeTicks: 300,
      nextRoundNo: 1,
    });

    expect(first).toMatchObject({
      status: "replacement-required",
      incomingActorIds: ["p4"],
    });
    expect(first.recovery).toMatchObject({ winnerId: "p1", timeTicks: 300 });
    expect(first.recovery.states.find(({ actorId }) => actorId === "p1")).toEqual({
      actorId: "p1",
      lifeBefore: 400,
      lifeAfter: 416,
      recoveryAmount: 16,
      eligible: true,
    });
    expect(first.resourceReset.states.find(({ actorId }) => actorId === "p1")).toMatchObject({ lifeBefore: 416, lifeAfter: 416 });
    expect(first.roster.sides[0]).toMatchObject({ replacementCandidateIds: ["p3", "p5"], remainingCandidateIds: ["p5"] });
    expect(first.roster.sides[1]).toMatchObject({ replacementCandidateIds: ["p4", "p6"], remainingCandidateIds: ["p6"], nextIncomingActorId: "p4" });

    const afterFirstReplacement = actors.map((actor) => {
      if (actor.id === "p2") return { ...actor, standby: true, overKo: true, teamState: { ...actor.teamState, standby: true, overKo: true } };
      if (actor.id === "p4") return { ...actor, life: 0, standby: false, overKo: false, replacementEligible: false, teamState: { ...actor.teamState, standby: false, overKo: false } };
      return actor;
    });
    const second = world.prepare({
      actors: afterFirstReplacement,
      modeBySide: { 1: "turns", 2: "turns" },
      stateActors: afterFirstReplacement.map(({ id }) => ({ id, stateIds: [0, 5900] })),
      winnerId: "p1",
      recoveryTimeTicks: 0,
      nextRoundNo: 1,
    });

    expect(second).toMatchObject({
      status: "replacement-required",
      incomingActorIds: ["p6"],
      roster: {
        sides: [
          expect.anything(),
          expect.objectContaining({
            activeActorIds: ["p4"],
            defeatedActorIds: ["p2", "p4"],
            replacementCandidateIds: ["p6"],
            remainingCandidateIds: [],
            nextIncomingActorId: "p6",
          }),
        ],
      },
    });
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

function turnsActors(options: { p2Life: number; includeP4?: boolean; includeP6?: boolean; p1Life?: number }): RuntimeTeamRoundHandoffActor[] {
  const actors: RuntimeTeamRoundHandoffActor[] = [
    actor("p1", 1, options.p1Life ?? 1000, false, false, 0),
    actor("p2", 2, options.p2Life, false, false, 0),
    actor("p3", 1, 1000, true, true, 1),
  ];
  if (options.includeP4 !== false) actors.push(actor("p4", 2, 1000, true, true, 1));
  if (options.includeP6 === true) actors.push(actor("p5", 1, 1000, true, true, 2), actor("p6", 2, 1000, true, true, 2));
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

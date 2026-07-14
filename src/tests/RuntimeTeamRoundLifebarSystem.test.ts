import { describe, expect, it } from "vitest";
import {
  RuntimeTeamRoundLifebarWorld,
  type RuntimeTeamRoundLifebarActor,
} from "../mugen/runtime/RuntimeTeamRoundLifebarSystem";

const activeTeamState = {
  disabled: false,
  standby: false,
  overKo: false,
  playerType: true,
};

describe("RuntimeTeamRoundLifebarWorld", () => {
  it("orders leader and member slots while preserving active, standby, and KO states", () => {
    const actors: RuntimeTeamRoundLifebarActor[] = [
      { id: "p3", label: "Reserve", side: 1, memberNo: 1, life: 750, lifeMax: 1500, teamState: { ...activeTeamState, standby: true } },
      { id: "p2", label: "KO", side: 2, memberNo: 0, life: 0, lifeMax: 2000, teamState: { ...activeTeamState, overKo: true } },
      { id: "p1", label: "Leader", side: 1, memberNo: 0, life: 500, lifeMax: 1000, teamState: activeTeamState },
    ];

    const diagnostic = new RuntimeTeamRoundLifebarWorld().snapshot({
      actors,
      mode: "turns",
      visible: true,
      tick: 12.4,
    });

    expect(diagnostic).toMatchObject({
      schema: "mugen-web-sandbox/runtime-team-round-lifebar/v0",
      tick: 12,
      mode: "turns",
      visible: true,
      diagnostics: [],
      sides: [
        {
          side: 1,
          leaderId: "p1",
          activeActorIds: ["p1"],
          slots: [
            { slot: 0, actorId: "p1", role: "leader", status: "active", life: 500, lifeMax: 1000, ratio: 0.5 },
            { slot: 1, actorId: "p3", role: "member", status: "standby", life: 750, lifeMax: 1500, ratio: 0.5 },
          ],
        },
        {
          side: 2,
          leaderId: "p2",
          activeActorIds: [],
          slots: [{ slot: 0, actorId: "p2", role: "leader", status: "ko", life: 0, lifeMax: 2000, ratio: 0 }],
        },
      ],
    });
  });

  it("normalizes invalid values without leaking NaN into UI or traces", () => {
    const diagnostic = new RuntimeTeamRoundLifebarWorld().snapshot({
      actors: [
        { id: "bad", label: "Bad", side: 1, life: Number.NaN, lifeMax: 0, teamState: activeTeamState },
        { id: "disabled", label: "Disabled", side: 2, life: 500, lifeMax: 1000, teamState: { ...activeTeamState, disabled: true } },
      ],
      mode: "tag",
      visible: false,
    });

    expect(diagnostic.diagnostics).toEqual(["invalid-life-max:bad", "invalid-life:bad"]);
    expect(diagnostic.visible).toBe(false);
    expect(diagnostic.sides[0]?.slots[0]).toMatchObject({ status: "active", life: 0, lifeMax: 0, ratio: 0 });
    expect(diagnostic.sides[1]?.slots[0]).toMatchObject({ status: "disabled", ratio: 0.5 });
  });
});

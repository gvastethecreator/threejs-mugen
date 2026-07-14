import { describe, expect, it } from "vitest";
import { RuntimeTeamResourceBankWorld } from "../mugen/runtime/RuntimeTeamResourceBankSystem";
import type { RuntimeTeamState } from "../mugen/runtime/types";

const activeTeamState: RuntimeTeamState = {
  disabled: false,
  standby: false,
  overKo: false,
  playerType: true,
};

describe("RuntimeTeamResourceBankWorld", () => {
  it("keeps non-shared life and power ownership root-local in stable team order", () => {
    const diagnostic = new RuntimeTeamResourceBankWorld().snapshot({
      mode: "tag",
      lifeShare: false,
      powerShare: false,
      tick: 12,
      actors: [
        { id: "p3", side: 1, memberNo: 1, life: 900, power: 100, teamState: { ...activeTeamState, standby: true } },
        { id: "p2", side: 2, memberNo: 0, life: 1000, power: 200, teamState: activeTeamState },
        { id: "p1", side: 1, memberNo: 0, life: 800, power: 300, teamState: activeTeamState },
      ],
    });

    expect(diagnostic).toMatchObject({
      schema: "mugen-web-sandbox/runtime-team-resource-bank/v0",
      tick: 12,
      mode: "tag",
      sharing: { life: false, power: false },
      actors: [
        {
          actorId: "p1",
          life: { bankId: "p1:life", resourceOwnerId: "p1", shared: false },
          power: { bankId: "p1:power", resourceOwnerId: "p1", shared: false },
        },
        {
          actorId: "p3",
          life: { bankId: "p3:life", resourceOwnerId: "p3", shared: false },
          power: { bankId: "p3:power", resourceOwnerId: "p3", shared: false },
        },
        { actorId: "p2", side: 2 },
      ],
      diagnostics: [],
    });
    expect(diagnostic.banks.map((bank) => bank.bankId)).toEqual([
      "p1:life",
      "p3:life",
      "p1:power",
      "p3:power",
      "p2:life",
      "p2:power",
    ]);
  });

  it("gates life and power sharing independently onto explicit side owners", () => {
    const diagnostic = new RuntimeTeamResourceBankWorld().snapshot({
      mode: "turns",
      lifeShare: true,
      powerShare: false,
      actors: [
        { id: "p1", side: 1, memberNo: 0, life: 1000, power: 300, teamState: { ...activeTeamState, standby: true } },
        { id: "p3", side: 1, memberNo: 1, life: 900, power: 500, teamState: activeTeamState },
        { id: "p2", side: 2, memberNo: 0, life: 1000, power: 0, teamState: activeTeamState },
      ],
    });

    expect(diagnostic.actors.find((actor) => actor.actorId === "p1")).toMatchObject({
      life: { bankId: "team:1:life", resourceOwnerId: "team:1", shared: true, representativeActorId: "p1" },
      power: { bankId: "p1:power", resourceOwnerId: "p1", shared: false },
    });
    expect(diagnostic.actors.find((actor) => actor.actorId === "p3")).toMatchObject({
      life: { bankId: "team:1:life", resourceOwnerId: "team:1", shared: true, representativeActorId: "p1" },
      power: { bankId: "p3:power", resourceOwnerId: "p3", shared: false },
    });
    expect(diagnostic.banks.find((bank) => bank.bankId === "team:1:life")).toMatchObject({
      actorIds: ["p1", "p3"],
      resourceOwnerId: "team:1",
      representativeActorId: "p1",
    });
  });

  it("keeps the owner stable when Tag changes active and standby roots", () => {
    const world = new RuntimeTeamResourceBankWorld();
    const actors = [
      { id: "p1", side: 1 as const, memberNo: 0, life: 0, power: 100, teamState: { ...activeTeamState, standby: true, overKo: true } },
      { id: "p3", side: 1 as const, memberNo: 1, life: 1000, power: 200, teamState: activeTeamState },
    ];
    const diagnostic = world.snapshot({ mode: "tag", lifeShare: true, powerShare: true, actors });

    expect(diagnostic.actors).toEqual([
      expect.objectContaining({
        actorId: "p1",
        life: expect.objectContaining({ resourceOwnerId: "team:1" }),
        power: expect.objectContaining({ resourceOwnerId: "team:1" }),
      }),
      expect.objectContaining({
        actorId: "p3",
        life: expect.objectContaining({ resourceOwnerId: "team:1" }),
        power: expect.objectContaining({ resourceOwnerId: "team:1" }),
      }),
    ]);
    expect(diagnostic.banks.filter((bank) => bank.side === 1).map((bank) => bank.actorIds)).toEqual([["p1", "p3"], ["p1", "p3"]]);
  });

  it("reports duplicate and invalid actor ids deterministically", () => {
    const diagnostic = new RuntimeTeamResourceBankWorld().snapshot({
      mode: "tag",
      lifeShare: false,
      powerShare: false,
      actors: [
        { id: "p1", side: 1, life: 1000, power: 0, teamState: activeTeamState },
        { id: " p1 ", side: 1, life: 1000, power: 0, teamState: activeTeamState },
        { id: "", side: 2, life: 1000, power: 0, teamState: activeTeamState },
      ],
    });

    expect(diagnostic.actors.map((actor) => actor.actorId)).toEqual(["p1"]);
    expect(diagnostic.diagnostics).toEqual(["duplicate-actor:p1", "invalid-actor-id"]);
  });
});

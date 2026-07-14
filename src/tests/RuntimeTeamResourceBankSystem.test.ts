import { describe, expect, it } from "vitest";
import {
  RuntimeTeamResourceBankRuntime,
  RuntimeTeamResourceBankWorld,
  type RuntimeTeamResourceBankRuntimeActor,
} from "../mugen/runtime/RuntimeTeamResourceBankSystem";
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
      schema: "mugen-web-sandbox/runtime-team-resource-bank/v1",
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

  it("reconciles shared power deltas into one side bank and mirrors standby roots", () => {
    const actors = teamRuntimeActors();
    const world = new RuntimeTeamResourceBankRuntime();
    world.reset(runtimeInput(actors, { powerShare: true }));

    actors[0]!.runtime.power = 350;
    const result = world.reconcile(runtimeInput(actors, { powerShare: true, tick: 4 }));

    expect(result.changes).toEqual([
      expect.objectContaining({
        bankId: "team:1:power",
        resourceOwnerId: "team:1",
        shared: true,
        actorIds: ["p1", "p3"],
        delta: 350,
        value: 350,
        max: 3000,
      }),
    ]);
    expect(actors.map((actor) => actor.runtime.power)).toEqual([350, 350, 0, 0]);
  });

  it("keeps non-shared power root-local while reporting its own bank delta", () => {
    const actors = teamRuntimeActors();
    const world = new RuntimeTeamResourceBankRuntime();
    world.reset(runtimeInput(actors));

    actors[0]!.runtime.power = 350;
    const result = world.reconcile(runtimeInput(actors, { tick: 4 }));

    expect(result.changes).toEqual([
      expect.objectContaining({ bankId: "p1:power", resourceOwnerId: "p1", shared: false, delta: 350, value: 350 }),
    ]);
    expect(actors.map((actor) => actor.runtime.power)).toEqual([350, 0, 0, 0]);
  });

  it("reconciles shared life damage without transferring power policy", () => {
    const actors = teamRuntimeActors();
    const world = new RuntimeTeamResourceBankRuntime();
    world.reset(runtimeInput(actors, { lifeShare: true, powerShare: false }));

    actors[0]!.runtime.life = 800;
    actors[0]!.runtime.power = 200;
    const result = world.reconcile(runtimeInput(actors, { lifeShare: true, powerShare: false, tick: 8 }));

    expect(result.changes).toEqual([
      expect.objectContaining({ bankId: "team:1:life", resourceOwnerId: "team:1", shared: true, delta: -200, value: 800 }),
      expect.objectContaining({ bankId: "p1:power", resourceOwnerId: "p1", shared: false, delta: 200, value: 200 }),
    ]);
    expect(actors[1]!.runtime.life).toBe(800);
    expect(actors[1]!.runtime.power).toBe(0);
  });

  it("keeps side owner stable across Tag standby swap and rebinds after reset", () => {
    const actors = teamRuntimeActors();
    const world = new RuntimeTeamResourceBankRuntime();
    world.reset(runtimeInput(actors, { lifeShare: true, powerShare: true }));
    actors[0]!.runtime.power = 400;
    world.reconcile(runtimeInput(actors, { lifeShare: true, powerShare: true, tick: 3 }));

    actors[0]!.teamState.standby = true;
    actors[1]!.teamState.standby = false;
    const afterSwap = world.reconcile(runtimeInput(actors, { lifeShare: true, powerShare: true, tick: 4 }));
    expect(afterSwap.changes).toEqual([]);
    expect(actors[0]!.runtime.power).toBe(400);
    expect(actors[1]!.runtime.power).toBe(400);

    actors[0]!.runtime.power = 0;
    actors[1]!.runtime.power = 0;
    world.reset(runtimeInput(actors, { lifeShare: true, powerShare: true, tick: 5 }));
    const rebound = new RuntimeTeamResourceBankWorld().snapshot({
      ...runtimeInput(actors, { lifeShare: true, powerShare: true, tick: 5 }),
      actors: actors.map(({ runtime, ...actor }) => ({
        ...actor,
        life: runtime.life,
        lifeMax: runtime.lifeMax,
        power: runtime.power,
        powerMax: runtime.powerMax,
      })),
    });
    expect(rebound.banks.find((bank) => bank.bankId === "team:1:power")).toMatchObject({
      resourceOwnerId: "team:1",
      actorIds: ["p1", "p3"],
      value: 0,
    });
  });
});

function teamRuntimeActors(): RuntimeTeamResourceBankRuntimeActor[] {
  return [
    runtimeActor("p1", 1, 0),
    runtimeActor("p3", 1, 1),
    runtimeActor("p2", 2, 0),
    runtimeActor("p4", 2, 1),
  ];
}

function runtimeActor(
  id: string,
  side: 1 | 2,
  memberNo: number,
): RuntimeTeamResourceBankRuntimeActor {
  return {
    id,
    side,
    memberNo,
    life: 1000,
    lifeMax: 1000,
    power: 0,
    powerMax: 3000,
    teamState: { ...activeTeamState, standby: memberNo > 0 },
    runtime: {
      life: 1000,
      lifeMax: 1000,
      power: 0,
      powerMax: 3000,
    },
  };
}

function runtimeInput(
  actors: readonly RuntimeTeamResourceBankRuntimeActor[],
  overrides: Partial<{
    lifeShare: boolean;
    powerShare: boolean;
    tick?: number;
  }> = {},
) {
  return {
    actors,
    mode: "tag" as const,
    lifeShare: overrides.lifeShare ?? false,
    powerShare: overrides.powerShare ?? false,
    tick: overrides.tick,
  };
}

import {
  RuntimeRedLifeShareRuntime,
  RuntimeRedLifeShareWorld,
  type RuntimeRedLifeShareRuntimeActor,
} from "../mugen/runtime/RuntimeRedLifeShareSystem";
import { describe, expect, it } from "vitest";

describe("RuntimeRedLifeShareSystem", () => {
  it("mirrors mutated root red life through the shared side bank", () => {
    const actors = [
      redLifeActor("p1", 1, 1000, 0),
      redLifeActor("p3", 1, 1000, 0),
      redLifeActor("p2", 2, 1000, 0),
    ];
    const runtime = new RuntimeRedLifeShareRuntime();

    runtime.reset({ actors, mode: "tag", lifeShare: true, tick: 0 });
    actors[0]!.life = 750;
    actors[0]!.runtime.life = 750;
    actors[0]!.runtime.redLife = 800;
    actors[1]!.life = 750;
    actors[1]!.runtime.life = 750;

    const result = runtime.reconcile({ actors, mode: "tag", lifeShare: true, tick: 1 });

    expect(result.changes).toEqual([
      expect.objectContaining({
        resourceOwnerId: "team:1",
        shared: true,
        actorIds: ["p1", "p3"],
        delta: 800,
        value: 800,
        min: 750,
        max: 1000,
      }),
    ]);
    expect(actors[0]!.runtime.redLife).toBe(800);
    expect(actors[1]!.runtime.redLife).toBe(800);
  });

  it("keeps root red life local when LifeShare is disabled", () => {
    const actors = [
      redLifeActor("p1", 1, 1000, 0),
      redLifeActor("p3", 1, 1000, 0),
    ];
    const runtime = new RuntimeRedLifeShareRuntime();

    runtime.reset({ actors, mode: "tag", lifeShare: false, tick: 0 });
    actors[0]!.life = 750;
    actors[0]!.runtime.life = 750;
    actors[0]!.runtime.redLife = 800;

    runtime.reconcile({ actors, mode: "tag", lifeShare: false, tick: 1 });

    expect(actors[0]!.runtime.redLife).toBe(800);
    expect(actors[1]!.runtime.redLife).toBe(0);
  });

  it("preserves zero as the no-red-life sentinel and forces KO sides to zero", () => {
    const actors = [
      redLifeActor("p1", 1, 0, 900),
      redLifeActor("p3", 1, 1000, 900),
    ];
    const runtime = new RuntimeRedLifeShareRuntime();

    runtime.reset({ actors, mode: "tag", lifeShare: true, tick: 0 });

    expect(actors[0]!.runtime.redLife).toBe(0);
    expect(actors[1]!.runtime.redLife).toBe(0);
  });

  it("uses actor-local banks in single mode even when the flag is enabled", () => {
    const diagnostic = new RuntimeRedLifeShareWorld().snapshot({
      actors: [redLifeActor("p1", 1, 1000, 0), redLifeActor("p3", 1, 1000, 0)],
      mode: "single",
      lifeShare: true,
      tick: 4,
    });

    expect(diagnostic.sharing).toBe(false);
    expect(diagnostic.banks.map((bank) => bank.bankId)).toEqual(["p1:red-life", "p3:red-life"]);
    expect(diagnostic.diagnostics).toEqual([]);
  });
});

function redLifeActor(
  id: string,
  side: 1 | 2,
  life: number,
  redLife: number,
): RuntimeRedLifeShareRuntimeActor {
  return {
    id,
    side,
    life,
    lifeMax: 1000,
    redLife,
    teamState: {
      disabled: false,
      standby: id !== "p1" && id !== "p2",
      overKo: false,
      playerType: true,
    },
    runtime: {
      life,
      lifeMax: 1000,
      redLife,
    },
  };
}

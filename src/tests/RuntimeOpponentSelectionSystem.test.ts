import { describe, expect, it } from "vitest";
import {
  RuntimeOpponentSelectionWorld,
  runtimeOpponentBodyDistanceX,
  type RuntimeOpponentSelectionActor,
} from "../mugen/runtime/RuntimeOpponentSelectionSystem";

describe("RuntimeOpponentSelectionWorld", () => {
  it("orders explicit opponent rosters by bounded nearest horizontal body distance", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0);
    const far = opponent("far", 160);
    const near = opponent("near", 80);
    const tiedFirst = opponent("tie-a", -80);
    const tiedSecond = opponent("tie-b", -80);

    expect(world.orderByNearest(actor, [far, near, tiedFirst, tiedSecond]).map((entry) => entry.id)).toEqual([
      "near",
      "tie-a",
      "tie-b",
      "far",
    ]);
  });

  it("keeps non-finite positions sorted after finite candidates with stable ties", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0);
    const finite = opponent("finite", 64);
    const missingA = opponent("missing-a", Number.NaN);
    const missingB = opponent("missing-b", Number.POSITIVE_INFINITY);

    expect(runtimeOpponentBodyDistanceX(actor, finite)).toBe(16);
    expect(runtimeOpponentBodyDistanceX(actor, missingA)).toBe(Number.POSITIVE_INFINITY);
    expect(world.orderByNearest(actor, [missingA, finite, missingB]).map((entry) => entry.id)).toEqual([
      "finite",
      "missing-a",
      "missing-b",
    ]);
  });

  it("orders raw runtime states for helper-local opponent lists", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = runtimeState(0);
    const far = runtimeState(160);
    const near = runtimeState(80);
    const tied = runtimeState(-80);

    expect(world.orderRuntimeStatesByNearest(actor, [far, near, tied])).toEqual([near, tied, far]);
    expect(runtimeOpponentBodyDistanceX(actor, near)).toBe(32);
  });

  it("builds id-bearing opponent rosters in nearest order without cloning states", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0);
    const far = opponent("p2-far", 160);
    const near = opponent("p2-near", 80);
    const tied = opponent("p2-tie", -80);

    const roster = world.buildOpponentRoster(actor, [far, near, tied]);

    expect(roster.map((entry) => entry.id)).toEqual(["p2-near", "p2-tie", "p2-far"]);
    expect(roster.map((entry) => entry.state)).toEqual([near.runtime, tied.runtime, far.runtime]);
  });
});

type TestOpponent = RuntimeOpponentSelectionActor & { id: string };

function opponent(id: string, x: number): TestOpponent {
  return { id, runtime: { pos: { x, y: 0 } } };
}

function runtimeState(x: number): RuntimeOpponentSelectionActor["runtime"] {
  return { pos: { x, y: 0 } };
}

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

  it("selects the nearest candidate without changing the stable roster order", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0);
    const far = opponent("p3", 160);
    const near = opponent("p5", 80);

    expect(world.selectNearest(actor, [far, near])?.id).toBe("p5");
    expect(world.orderByNearest(actor, [far, near]).map((entry) => entry.id)).toEqual(["p5", "p3"]);
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

  it("orders P2 candidates with facing-aware behind penalty instead of legacy body distance", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0, { facing: 1 });
    const behind = opponent("p4", -5);
    const front = opponent("p2", 34);

    expect(world.orderP2ByNearest(actor, [behind, front]).map((entry) => entry.id)).toEqual(["p2", "p4"]);
    expect(world.selectP2Nearest(actor, [behind, front])?.id).toBe("p2");
  });

  it("applies the source-shaped Z weighting and treats invalid depth as the neutral plane", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0, { facing: 1, combatDepth: { position: 0 } });
    const xNear = opponent("x-near", 30, { combatDepth: { position: 0 } });
    const zNear = opponent("z-near", 0, { combatDepth: { position: 3 } });

    expect(world.orderP2ByNearest(actor, [zNear, xNear], { zEnabled: true }).map((entry) => entry.id)).toEqual([
      "x-near",
      "z-near",
    ]);
    expect(
      world.p2Distance(actor, opponent("invalid-z", 10, { combatDepth: { position: Number.NaN } }), { zEnabled: true }),
    ).toBe(10);
  });

  it("uses deterministic identity ties and invalidates the separate P2 cache when positions change", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0, { facing: 1 });
    const higherPlayerNo = opponent("same-a", 35);
    const lowerPlayerNo = opponent("same-b", -5);
    higherPlayerNo.playerNo = 5;
    lowerPlayerNo.playerNo = 3;

    expect(world.orderP2ByNearest(actor, [higherPlayerNo, lowerPlayerNo]).map((entry) => entry.id)).toEqual([
      "same-b",
      "same-a",
    ]);

    const near = opponent("near", 80);
    const far = opponent("far", 160);
    expect(world.selectP2Nearest(actor, [far, near])?.id).toBe("near");
    const replacement = opponent("near", 80);
    expect(world.selectP2Nearest(actor, [far, replacement])).toBe(replacement);
    near.runtime.pos.x = 260;
    expect(world.selectP2Nearest(actor, [far, near])?.id).toBe("far");
  });

  it("keeps legacy EnemyNear ordering horizontal and stable even when P2 policy sees orientation and depth", () => {
    const world = new RuntimeOpponentSelectionWorld();
    const actor = opponent("p1", 0, { facing: -1, combatDepth: { position: 0 } });
    const left = opponent("left", -80, { combatDepth: { position: 8 } });
    const right = opponent("right", 80, { combatDepth: { position: 0 } });

    expect(world.orderByNearest(actor, [right, left]).map((entry) => entry.id)).toEqual(["right", "left"]);
  });
});

type TestOpponent = RuntimeOpponentSelectionActor & { id: string };

function opponent(
  id: string,
  x: number,
  runtime: Partial<RuntimeOpponentSelectionActor["runtime"]> = {},
): TestOpponent {
  return { id, runtime: { pos: { x, y: 0 }, ...runtime } };
}

function runtimeState(x: number): RuntimeOpponentSelectionActor["runtime"] {
  return { pos: { x, y: 0 } };
}

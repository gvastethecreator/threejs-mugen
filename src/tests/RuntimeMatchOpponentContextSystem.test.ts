import { describe, expect, it } from "vitest";
import { RuntimeMatchOpponentContextWorld } from "../mugen/runtime/RuntimeMatchOpponentContextSystem";

describe("RuntimeMatchOpponentContextWorld", () => {
  it("resolves mirrored one-on-one opponent contexts", () => {
    const world = new RuntimeMatchOpponentContextWorld();
    const p1 = { id: "p1" };
    const p2 = { id: "p2" };
    const pair = { p1, p2 };

    expect(world.forActor(pair, p1)).toEqual({ opponent: p2, opponents: [p2] });
    expect(world.forActor(pair, p2)).toEqual({ opponent: p1, opponents: [p1] });
    expect(world.opponentFor(pair, p1)).toBe(p2);
    expect(world.opponentsFor(pair, p2)).toEqual([p1]);
  });

  it("fails closed for actors outside the current pair", () => {
    const world = new RuntimeMatchOpponentContextWorld();
    const p1 = { id: "p1" };
    const p2 = { id: "p2" };
    const helper = { id: "helper" };
    const pair = { p1, p2 };

    expect(world.forActor(pair, helper)).toBeUndefined();
    expect(world.opponentFor(pair, helper)).toBeUndefined();
    expect(world.opponentsFor(pair, helper)).toEqual([]);
  });
});

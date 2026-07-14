import { describe, expect, it } from "vitest";
import { RuntimeRoundContextWorld } from "../mugen/runtime/RuntimeRoundContextSystem";

describe("RuntimeRoundContextWorld", () => {
  it("keeps global and per-actor round history across sequential transitions", () => {
    const world = new RuntimeRoundContextWorld();

    expect(world.reset([{ id: "p1" }, { id: "p2" }])).toMatchObject({
      roundNo: 1,
      roundsExisted: 0,
      actors: [
        { actorId: "p1", roundNo: 1, roundsExisted: 0, joinedRoundNo: 1 },
        { actorId: "p2", roundNo: 1, roundsExisted: 0, joinedRoundNo: 1 },
      ],
    });

    const second = world.prepareNextRound(2, [{ id: "p1" }, { id: "p2" }]);
    expect(second).toMatchObject({
      applied: true,
      snapshot: { roundNo: 2, roundsExisted: 1 },
    });
    expect(world.commit(second).actors).toEqual([
      { actorId: "p1", roundNo: 2, roundsExisted: 1, joinedRoundNo: 1 },
      { actorId: "p2", roundNo: 2, roundsExisted: 1, joinedRoundNo: 1 },
    ]);

    const third = world.prepareNextRound(3, [{ id: "p1" }, { id: "p2" }, { id: "p3" }]);
    expect(third.snapshot.actors.find(({ actorId }) => actorId === "p3")).toEqual({
      actorId: "p3",
      roundNo: 3,
      roundsExisted: 0,
      joinedRoundNo: 3,
    });
    expect(world.commit(third).actors).toEqual([
      { actorId: "p1", roundNo: 3, roundsExisted: 2, joinedRoundNo: 1 },
      { actorId: "p2", roundNo: 3, roundsExisted: 2, joinedRoundNo: 1 },
      { actorId: "p3", roundNo: 3, roundsExisted: 0, joinedRoundNo: 3 },
    ]);
  });

  it("fails closed for non-sequential or malformed transitions", () => {
    const world = new RuntimeRoundContextWorld();
    world.reset([{ id: "p1" }]);

    expect(world.prepareNextRound(3, [{ id: "p1" }])).toMatchObject({
      applied: false,
      diagnostics: ["non-sequential-round:3"],
      snapshot: { roundNo: 1, roundsExisted: 0 },
    });
    expect(world.prepareNextRound(2, [{ id: "p1" }, { id: "p1" }, { id: "" }])).toMatchObject({
      applied: false,
      diagnostics: ["duplicate-actor:p1", "invalid-actor-id"],
    });
  });

  it("marks a terminal snapshot without mutating the round counter", () => {
    const world = new RuntimeRoundContextWorld();
    world.reset([{ id: "p1" }]);
    const transition = world.prepareNextRound(2, [{ id: "p1" }]);
    world.commit(transition);

    expect(world.snapshot(true, ["match-over"])).toMatchObject({
      roundNo: 2,
      roundsExisted: 1,
      matchOver: true,
      diagnostics: ["match-over"],
    });
    expect(world.snapshot().matchOver).toBe(false);
  });
});

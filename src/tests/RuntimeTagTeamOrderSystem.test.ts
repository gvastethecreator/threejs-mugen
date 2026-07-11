import { describe, expect, it } from "vitest";
import { RuntimeTagTeamOrderWorld } from "../mugen/runtime/RuntimeTagTeamOrderSystem";

const roots = ["p5", "p2", "p1", "p4", "p3", "p6"].map((id) => ({ id, playerType: true }));

describe("RuntimeTagTeamOrderWorld", () => {
  it("creates stable side-local Tag order only for explicit Tag mode", () => {
    const world = new RuntimeTagTeamOrderWorld();
    expect(world.create(roots, "single")).toBeUndefined();
    expect(world.create(roots, "tag")?.diagnostic()).toEqual({
      schema: "RuntimeTagTeamOrder/v0",
      sides: [
        { side: 1, stableRootIds: ["p1", "p3", "p5"], memberOrderIds: ["p1", "p3", "p5"], leaderId: "p1" },
        { side: 2, stableRootIds: ["p2", "p4", "p6"], memberOrderIds: ["p2", "p4", "p6"], leaderId: "p2" },
      ],
    });
  });

  it("swaps mutable member positions without changing stable root slots", () => {
    const order = new RuntimeTagTeamOrderWorld().create(roots, "tag")!;
    order.swapMember(1, "p1", 3);
    expect(order.diagnostic().sides[0]).toEqual({
      side: 1,
      stableRootIds: ["p1", "p3", "p5"],
      memberOrderIds: ["p5", "p3", "p1"],
      leaderId: "p1",
    });
    const leaked = order.diagnostic();
    leaked.sides[0]!.memberOrderIds.reverse();
    expect(order.diagnostic().sides[0]?.memberOrderIds).toEqual(["p5", "p3", "p1"]);
  });

  it("rotates a stable leader id and sinks dead non-leaders", () => {
    const order = new RuntimeTagTeamOrderWorld().create(roots, "tag")!;
    order.rotateLeader(1, "p3", (id) => id !== "p5");
    expect(order.diagnostic().sides[0]?.memberOrderIds).toEqual(["p3", "p1", "p5"]);
    expect(order.diagnostic().sides[0]?.leaderId).toBe("p3");
  });

  it("rejects invalid mutations atomically and restores deterministic reset order", () => {
    const order = new RuntimeTagTeamOrderWorld().create(roots, "tag")!;
    const before = order.diagnostic();
    expect(() => order.swapMember(1, "p1", 4)).toThrow("Invalid Tag member position 4");
    expect(() => order.rotateLeader(1, "p2")).toThrow("Unknown Tag leader p2 on side 1");
    expect(order.diagnostic()).toEqual(before);
    order.swapMember(1, "p1", 2);
    order.reset();
    expect(order.diagnostic()).toEqual(before);
  });

  it("rejects duplicate, helper, and incomplete-side topology", () => {
    const world = new RuntimeTagTeamOrderWorld();
    expect(() => world.create([{ id: "p1" }, { id: "p1" }, { id: "p2" }], "tag")).toThrow("Duplicate Tag root p1");
    expect(() => world.create([{ id: "p1" }, { id: "p2" }, { id: "p1-helper", rootId: "p1" }], "tag")).toThrow(
      "is not a player root",
    );
    expect(() => world.create([{ id: "p1" }], "tag")).toThrow("requires a root on side 2");
  });
});

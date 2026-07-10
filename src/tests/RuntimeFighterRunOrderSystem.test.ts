import { describe, expect, it } from "vitest";
import { RuntimeFighterRunOrderWorld } from "../mugen/runtime/RuntimeFighterRunOrderSystem";

describe("RuntimeFighterRunOrderWorld", () => {
  it("orders IKEMEN roots by attacking, idle, remaining, then lower id", () => {
    const world = new RuntimeFighterRunOrderWorld();

    expect(ids(world.orderPair("ikemen-go", actor("p1", "I"), actor("p2", "A")))).toEqual(["p2", "p1"]);
    expect(ids(world.orderPair("ikemen-go", actor("p1", "H"), actor("p2", "I")))).toEqual(["p2", "p1"]);
    expect(ids(world.orderPair("ikemen-go", actor("p2", "A"), actor("p1", "A")))).toEqual(["p1", "p2"]);
  });

  it.each(["mugen-1.1", "unknown"] as const)("preserves input order for unsupported %s scheduling", (profile) => {
    const result = new RuntimeFighterRunOrderWorld().orderPair(profile, actor("p2", "H"), actor("p1", "A"));

    expect(ids(result)).toEqual(["p2", "p1"]);
    expect(result).toMatchObject({ profile, policy: "preserve-input", supported: false });
  });
});

function ids(result: ReturnType<RuntimeFighterRunOrderWorld["orderPair"]>): string[] {
  return result.entries.map(({ actor: value }) => value.id);
}

function actor(id: string, moveType: "I" | "A" | "H") {
  return { id, runtime: { moveType } };
}

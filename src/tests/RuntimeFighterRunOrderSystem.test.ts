import { describe, expect, it } from "vitest";
import { RuntimeFighterRunOrderWorld } from "../mugen/runtime/RuntimeFighterRunOrderSystem";

describe("RuntimeFighterRunOrderWorld", () => {
  it("orders IKEMEN roots by attacking, idle, remaining, then lower id", () => {
    const world = new RuntimeFighterRunOrderWorld();

    expect(ids(world.orderPair("ikemen-go", actor("p1", "I"), actor("p2", "A")))).toEqual(["p2", "p1"]);
    expect(ids(world.orderPair("ikemen-go", actor("p1", "H"), actor("p2", "I")))).toEqual(["p2", "p1"]);
    expect(ids(world.orderPair("ikemen-go", actor("p2", "A"), actor("p1", "A")))).toEqual(["p1", "p2"]);
  });

  it("applies IKEMEN RunFirst and RunLast overrides while neutralizing conflicting flags", () => {
    const world = new RuntimeFighterRunOrderWorld();

    expect(ids(world.orderPair("ikemen-go", actor("p1", "A"), actor("p2", "H", { runFirst: true })))).toEqual(["p2", "p1"]);
    expect(ids(world.orderPair("ikemen-go", actor("p1", "I"), actor("p2", "A", { runLast: true })))).toEqual(["p1", "p2"]);
    expect(ids(world.orderPair("ikemen-go", actor("p2", "A", { runFirst: true, runLast: true }), actor("p1", "A")))).toEqual([
      "p1",
      "p2",
    ]);
  });

  it.each(["mugen-1.1", "unknown"] as const)("preserves input order for unsupported %s scheduling", (profile) => {
    const result = new RuntimeFighterRunOrderWorld().orderPair(profile, actor("p2", "H"), actor("p1", "A"));

    expect(ids(result)).toEqual(["p2", "p1"]);
    expect(result).toMatchObject({ profile, policy: "preserve-input", supported: false });
  });

  it("stamps one-based IKEMEN root indices and clears unsupported profile values", () => {
    const world = new RuntimeFighterRunOrderWorld();
    const p1 = actor("p1", "I");
    const p2 = actor("p2", "A");

    world.stamp(world.orderPair("ikemen-go", p1, p2));
    expect([p1.runtime.runOrder, p2.runtime.runOrder]).toEqual([2, 1]);

    world.stamp(world.orderPair("unknown", p1, p2));
    expect([p1.runtime.runOrder, p2.runtime.runOrder]).toEqual([undefined, undefined]);
  });
});

function ids(result: ReturnType<RuntimeFighterRunOrderWorld["orderPair"]>): string[] {
  return result.entries.map(({ actor: value }) => value.id);
}

function actor(id: string, moveType: "I" | "A" | "H", overrides: { runFirst?: boolean; runLast?: boolean } = {}) {
  const assertSpecial = Object.values(overrides).some(Boolean)
    ? { flags: [], globalFlags: [], ...overrides }
    : undefined;
  return { id, runtime: { moveType, assertSpecial, runOrder: undefined as number | undefined } };
}

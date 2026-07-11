import { describe, expect, it } from "vitest";
import { RuntimeMatchActorRosterWorld } from "../mugen/runtime/RuntimeMatchActorRosterSystem";

describe("RuntimeMatchActorRosterWorld", () => {
  it("owns current one-on-one actor order and effect-store owner ids", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const roster = new RuntimeMatchActorRosterWorld().create({ p1, p2 });

    expect(roster.actors).toEqual([p1, p2]);
    expect(roster.actors[0]).toBe(p1);
    expect(roster.actors[1]).toBe(p2);
    expect(roster.effectStoreOwners).toEqual({ p1: "p1", p2: "p2" });
  });

  it("resolves actors by id and fails closed for unknown ids", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const roster = new RuntimeMatchActorRosterWorld().create({ p1, p2 });

    expect(roster.findById("p1")).toBe(p1);
    expect(roster.findById("p2")).toBe(p2);
    expect(roster.findById("p3")).toBeUndefined();
  });

  it("projects mirrored one-on-one opponents without inventing unknown opponents", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const helper = actor("p1-helper-0");
    const externalP1LikeActor = actor("p1");
    const roster = new RuntimeMatchActorRosterWorld().create({ p1, p2 });

    expect(roster.opponentsFor(p1)).toEqual([p2]);
    expect(roster.opponentsFor(p2)).toEqual([p1]);
    expect(roster.opponentsFor(helper)).toEqual([]);
    expect(roster.opponentsFor(externalP1LikeActor)).toEqual([]);
  });

  it("builds a public multi-root character registry without changing the pair roster", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = { id: "p3", standby: true };
    const p4 = actor("p4");
    const helper = { id: "p3-helper-0", rootId: "p3", playerType: false };
    const world = new RuntimeMatchActorRosterWorld();
    const pair = world.create({ p1, p2 });
    const registry = world.createCharacterRegistry([p1, p2, p3, p4, helper]);

    expect(pair.actors).toEqual([p1, p2]);
    expect(registry.characters).toEqual([p1, p2, p3, p4, helper]);
    expect(registry.findById("p3")).toBe(p3);
    expect(registry.topology.charactersFor(1)).toEqual([p1, p3, helper]);
    expect(registry.diagnostic().characters.map((entry) => [entry.id, entry.side, entry.enemyBaseEligible])).toEqual([
      ["p1", 1, true],
      ["p2", 2, true],
      ["p3", 1, false],
      ["p4", 2, true],
      ["p3-helper-0", 1, true],
    ]);
  });

  it("rejects duplicate character ids before publishing a registry", () => {
    const world = new RuntimeMatchActorRosterWorld();
    expect(() => world.createCharacterRegistry([actor("p1"), actor("p1")])).toThrow(
      "Duplicate runtime character id: p1",
    );
  });

  it("freezes published character and topology arrays so registry views cannot diverge", () => {
    const registry = new RuntimeMatchActorRosterWorld().createCharacterRegistry([actor("p1"), actor("p2")]);

    expect(Object.isFrozen(registry.characters)).toBe(true);
    expect(Object.isFrozen(registry.topology.characters)).toBe(true);
    expect(() => (registry.characters as { id: string }[]).push(actor("p3"))).toThrow();
    expect(registry.findById("p3")).toBeUndefined();
    expect(registry.diagnostic().characters.map((entry) => entry.id)).toEqual(["p1", "p2"]);
  });
});

function actor(id: string): { id: string } {
  return { id };
}

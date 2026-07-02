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
});

function actor(id: string): { id: string } {
  return { id };
}

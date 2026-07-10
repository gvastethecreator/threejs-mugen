import { describe, expect, it } from "vitest";
import {
  RuntimeActorRunOrderWorld,
  type RuntimeActorRunOrderCandidate,
} from "../mugen/runtime/RuntimeActorRunOrderSystem";

type Actor = { id: string; runOrder?: number };

describe("RuntimeActorRunOrderWorld", () => {
  it("orders IKEMEN roots and helpers by source priority, then stable actor id", () => {
    const entries = new RuntimeActorRunOrderWorld().order("ikemen-go", [
      candidate("helper-idle", "helper", 3, "I"),
      candidate("root-idle", "root", 1, "I"),
      candidate("helper-attack", "helper", 4, "A"),
      candidate("root-attack", "root", 2, "A"),
      candidate("helper-hit", "helper", 5, "H"),
    ]).entries;

    expect(entries.map((entry) => entry.value.id)).toEqual([
      "root-attack",
      "helper-attack",
      "root-idle",
      "helper-idle",
      "helper-hit",
    ]);
    expect(entries.map((entry) => entry.value.runOrder)).toEqual([1, 2, 3, 4, 5]);
  });

  it("applies exclusive RunFirst and RunLast flags to helpers", () => {
    const entries = new RuntimeActorRunOrderWorld().order("ikemen-go", [
      candidate("root", "root", 1, "A"),
      candidate("last", "helper", 3, "A", { runLast: true }),
      candidate("first", "helper", 4, "H", { runFirst: true }),
      candidate("conflict", "helper", 5, "A", { runFirst: true, runLast: true }),
    ]).entries;

    expect(entries.map((entry) => entry.value.id)).toEqual(["first", "root", "conflict", "last"]);
  });

  it("appends helpers created during action at the end of the same tick", () => {
    const world = new RuntimeActorRunOrderWorld();
    const result = world.order("ikemen-go", [candidate("root", "root", 1, "I")]);
    const appended = candidate("new-helper", "helper", 3, "A", { runFirst: true });

    world.append(result, [appended]);

    expect(result.entries.map((entry) => entry.value.id)).toEqual(["root", "new-helper"]);
    expect(appended.value.runOrder).toBe(2);
  });

  it.each(["mugen-1.1", "unknown"] as const)("preserves input and clears RunOrder for %s", (profile) => {
    const first = candidate("helper", "helper", 3, "A");
    const second = candidate("root", "root", 1, "I");
    first.value.runOrder = 9;
    second.value.runOrder = 8;

    const result = new RuntimeActorRunOrderWorld().order(profile, [first, second]);

    expect(result.entries.map((entry) => entry.value.id)).toEqual(["helper", "root"]);
    expect([first.value.runOrder, second.value.runOrder]).toEqual([undefined, undefined]);
  });
});

function candidate(
  id: string,
  kind: "root" | "helper",
  runOrderId: number,
  moveType: "I" | "A" | "H",
  flags: { runFirst?: boolean; runLast?: boolean } = {},
): RuntimeActorRunOrderCandidate<Actor, Actor> {
  const value: Actor = { id };
  const assertSpecial = Object.values(flags).some(Boolean) ? { flags: [], globalFlags: [], ...flags } : undefined;
  return { kind, key: `${kind}:${id}`, runOrderId, moveType, assertSpecial, value, stamp: (order) => (value.runOrder = order) };
}

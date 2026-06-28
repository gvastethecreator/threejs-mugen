import { describe, expect, it } from "vitest";
import {
  createStatelessLifecycle,
  MatchWorldLifecycleTracker,
  type MatchWorldLifecycleActorInput,
} from "../mugen/runtime/MatchWorldLifecycleSystem";

describe("MatchWorldLifecycleSystem", () => {
  it("tracks spawn, active, and removal transitions without match runtime coupling", () => {
    const tracker = new MatchWorldLifecycleTracker();

    const first = tracker.update(0, [actor("p1"), actor("p2")]);
    expect(first.spawnedThisTick).toEqual(["p1", "p2"]);
    expect(first.eventsThisTick.map((event) => event.type)).toEqual(["spawn", "spawn"]);
    expect(first.records.find((record) => record.id === "p1")).toMatchObject({ status: "spawned", ageTicks: 0 });

    const second = tracker.update(3, [actor("p1"), actor("p2"), actor("p1-helper-0", "helper", "effect")]);
    expect(second.spawnedThisTick).toEqual(["p1-helper-0"]);
    expect(second.records.find((record) => record.id === "p1")).toMatchObject({ status: "active", ageTicks: 3 });
    expect(second.records.find((record) => record.id === "p1-helper-0")).toMatchObject({ status: "spawned", ageTicks: 0 });

    const third = tracker.update(5, [actor("p1"), actor("p2")]);
    expect(third.removedThisTick).toEqual(["p1-helper-0"]);
    expect(third.removed).toEqual(["p1-helper-0"]);
    expect(third.records.find((record) => record.id === "p1-helper-0")).toMatchObject({ status: "removed", ageTicks: 2 });
    expect(third.recentEvents.length).toBeGreaterThanOrEqual(7);
  });

  it("creates stateless lifecycle snapshots for synthetic registries", () => {
    const lifecycle = createStatelessLifecycle(12, [actor("p1"), actor("p1-projectile-0", "projectile", "effect")]);

    expect(lifecycle.spawnedThisTick).toEqual([]);
    expect(lifecycle.live).toEqual(["p1", "p1-projectile-0"]);
    expect(lifecycle.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "active", id: "p1", tick: 12 }),
        expect.objectContaining({ type: "active", id: "p1-projectile-0", kind: "projectile", layer: "effect" }),
      ]),
    );
  });
});

function actor(
  id: string,
  kind: MatchWorldLifecycleActorInput["kind"] = "player",
  layer: MatchWorldLifecycleActorInput["layer"] = "actor",
): MatchWorldLifecycleActorInput {
  return {
    id,
    label: id,
    kind,
    layer,
    ownerId: id.startsWith("p2") ? "p2" : "p1",
    rootId: id.startsWith("p2") ? "p2" : "p1",
    parentId: id.startsWith("p2") ? "p2" : "p1",
  };
}

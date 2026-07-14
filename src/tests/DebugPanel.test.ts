import { describe, expect, it } from "vitest";
import { renderDebugPanel } from "../app/DebugPanel";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { buildMatchWorldActorRegistry, MatchWorld } from "../mugen/runtime/MatchWorld";

describe("DebugPanel", () => {
  it("renders the MatchWorld actor registry in runtime mode", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: trainingStage });
    const html = renderDebugPanel(undefined, world.getSnapshot(), "match", [], [], world.getActorRegistry());

    expect(html).toContain("Actor Registry");
    expect(html).toContain("data-actor-id=\"p1\"");
    expect(html).toContain("data-actor-id=\"p2\"");
    expect(html).toContain("owner");
    expect(html).toContain("root");
    expect(html).toContain("parent");
  });

  it("renders target ownership links from the actor registry", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: trainingStage });
    const snapshot = world.getSnapshot();
    const registry = buildMatchWorldActorRegistry({
      ...snapshot,
      actors: [
        {
          ...snapshot.actors[0]!,
          runtime: {
            ...snapshot.actors[0]!.runtime,
            targetCount: 1,
            targetRefs: [{ actorId: "p2", targetId: 77, age: 2 }],
            targetBindings: [{ actorId: "p2", targetId: 77, remaining: 6, offset: { x: 12, y: -4 } }],
          },
        },
        snapshot.actors[1]!,
      ],
    });
    const html = renderDebugPanel(undefined, snapshot, "match", [], [], registry);

    expect(html).toContain("p1 -> p2");
    expect(html).toContain("target 77 / age 2f bind 6f @ 12,-4");
  });

  it("renders team lifebar slots with leader and standby state", () => {
    const world = new MatchWorld({
      runtimeProfile: "ikemen-go",
      teamMode: "turns",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });
    const html = renderDebugPanel(undefined, world.getSnapshot(), "match", [], [], world.getActorRegistry());

    expect(html).toContain("data-team-side=\"1\"");
    expect(html).toContain("leader / active");
    expect(html).toContain("member / standby");
    expect(html).toContain("p3 / 1000/1000");
  });
});

import { describe, expect, it } from "vitest";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { MatchWorld } from "../mugen/runtime/MatchWorld";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";

describe("team round handoff runtime boundary", () => {
  it("publishes Turns facts from PlayableMatchRuntime without widening the pair snapshot", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "turns",
      reserveFighters: [demoFighters[0]!],
    });
    const before = runtime.getSnapshot();
    const decision = runtime.getTeamRoundDecision();

    expect(decision).toMatchObject({
      outcome: "ongoing",
      sides: [
        { side: 1, mode: "turns", actorIds: ["p1", "p3"], replacementCandidateIds: ["p3"] },
        { side: 2, mode: "turns", actorIds: ["p2"], replacementCandidateIds: [] },
      ],
    });
    expect(runtime.applyTeamRoundHandoff()).toMatchObject({ outcome: "no-op", applied: false, changes: [] });
    expect(runtime.getSnapshot().actors.map((actor) => actor.id)).toEqual(before.actors.map((actor) => actor.id));
  });

  it("refreshes MatchWorld actor ownership after the explicit handoff boundary", () => {
    const world = new MatchWorld({
      runtimeProfile: "ikemen-go",
      teamMode: "turns",
      reserveFighters: [demoFighters[0]!],
    });

    expect(world.getTeamRoundDecision().sides[0]).toMatchObject({ mode: "turns", actorIds: ["p1", "p3"] });
    expect(world.applyTeamRoundHandoff()).toMatchObject({ outcome: "no-op", applied: false });
    expect(world.getActorRegistry().teamSides[1]).toEqual(["p1", "p3"]);
  });
});

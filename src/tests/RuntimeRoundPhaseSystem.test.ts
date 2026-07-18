import { describe, expect, it } from "vitest";
import { RuntimeRoundPhaseWorld } from "../mugen/runtime/RuntimeRoundPhaseSystem";

describe("RuntimeRoundPhaseWorld", () => {
  it("walks the explicit pre-intro, intro, and fight phases", () => {
    const world = new RuntimeRoundPhaseWorld("mugen-1.1", 0);

    expect(world.snapshot()).toMatchObject({ profile: "mugen-1.1", phase: 0, name: "pre-intro" });
    expect(world.transition("intro")).toMatchObject({ applied: true, from: 0, to: 1 });
    expect(world.transition("fight")).toMatchObject({ applied: true, from: 1, to: 2 });
    expect(world.snapshot()).toMatchObject({ phase: 2, name: "fight" });
  });

  it("requires named lifecycle events for the close phases", () => {
    const world = new RuntimeRoundPhaseWorld("ikemen-go");

    expect(world.transition("round-finished")).toMatchObject({ applied: true, from: 2, to: 3 });
    expect(world.transition("round-over")).toMatchObject({ applied: true, from: 3, to: 4 });
    expect(world.snapshot()).toMatchObject({ phase: 4, name: "over" });
  });

  it("rejects impossible transitions without mutating the phase", () => {
    const world = new RuntimeRoundPhaseWorld();

    const result = world.transition("round-over");

    expect(result).toMatchObject({
      applied: false,
      from: 2,
      to: 2,
      diagnostics: ["invalid-phase-transition:2:round-over"],
    });
    expect(world.currentPhase).toBe(2);
  });

  it("resets every phase to the compatibility-preserving fight entry", () => {
    const world = new RuntimeRoundPhaseWorld("unknown", 4);

    expect(world.transition("reset")).toMatchObject({ applied: true, from: 4, to: 2 });
    expect(world.currentPhase).toBe(2);
  });
});

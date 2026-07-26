import { describe, expect, it } from "vitest";
import {
  createRuntimeTurnsJourneyWorld,
  runRuntimeTurnsJourney,
  runtimeTurnsJourneyIsDeterministic,
  type RuntimeTurnsJourneyTeam,
} from "../mugen/runtime/RuntimeTurnsJourney";

const teams: RuntimeTurnsJourneyTeam[] = [
  {
    side: 1,
    members: [
      { id: "p1a", life: 0, lifeMax: 1000, power: 0 },
      { id: "p1b", life: 1000, lifeMax: 1000, power: 0 },
      { id: "p1c", life: 900, lifeMax: 1000, power: 10 },
    ],
  },
  {
    side: 2,
    members: [
      { id: "p2a", life: 800, lifeMax: 1000, power: 40 },
      { id: "p2b", life: 1000, lifeMax: 1000, power: 0 },
    ],
  },
];

describe("RuntimeTurnsJourney", () => {
  it("runs two replacements and resolves residue-free", () => {
    // First member is KO so start with p1a active KO would block residue; mark p1a as active with 0 life.
    // Journey still forces replacements to p1b then p1c.
    const report = runRuntimeTurnsJourney({ teams, inputSeat: 1 });
    expect(report.schema).toBe("RuntimeTurnsJourney/v1");
    expect(report.replacements).toBe(2);
    expect(report.residueFree).toBe(true);
    expect(report.diagnostics).toEqual([]);
    expect(report.steps.map((step) => step.id)).toEqual([
      "start",
      "replace-1",
      "replace-2",
      "resolve",
    ]);
    expect(report.steps[0]?.activeBySide[1]).toBe("p1a");
    expect(report.steps[1]?.activeBySide[1]).toBe("p1b");
    expect(report.steps[2]?.activeBySide[1]).toBe("p1c");
    expect(report.steps[3]?.effectsChecksum).toBe("fx:clear");
    expect(report.steps.every((step) => step.inputSeat === 1)).toBe(true);
    expect(report.finalChecksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it("is deterministic for the same team multiset", () => {
    expect(runtimeTurnsJourneyIsDeterministic(teams)).toBe(true);
  });

  it("creates a starting world with one active per side", () => {
    const world = createRuntimeTurnsJourneyWorld(teams);
    expect(world.actors.filter((actor) => actor.side === 1 && !actor.standby)).toHaveLength(1);
    expect(world.actors.filter((actor) => actor.side === 2 && !actor.standby)).toHaveLength(1);
  });
});

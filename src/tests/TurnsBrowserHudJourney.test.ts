import { describe, expect, it } from "vitest";
import {
  createTurnsCapableDemoRoster,
  projectTurnsBrowserHud,
  runTurnsBrowserHudJourney,
  withTurnsHandoffSupport,
} from "../mugen/runtime/TurnsBrowserHudJourney";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";

describe("TurnsBrowserHudJourney", () => {
  it("projects team lifebar and continuation into HUD facts", () => {
    const roster = createTurnsCapableDemoRoster();
    const runtime = new PlayableMatchRuntime(roster.p1, roster.p2, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "turns",
      reserveFighters: roster.reserves,
    });
    const hud = projectTurnsBrowserHud(runtime.getSnapshot());
    expect(hud.sides).toHaveLength(2);
    expect(hud.sides[0]?.slotCount).toBeGreaterThanOrEqual(1);
    expect(hud.activeBySide[1].length).toBe(1);
    expect(hud.activeBySide[2].length).toBe(1);
  });

  it("runs KO → handoff → stable fight with HUD checksum", () => {
    const report = runTurnsBrowserHudJourney();
    expect(report.schema).toBe("TurnsBrowserHudJourney/v1");
    expect(report.steps.map((step) => step.id)).toEqual(
      expect.arrayContaining(["start", "after-ko", "after-handoff", "stable-fight"]),
    );
    expect(report.replacementsObserved).toBeGreaterThanOrEqual(1);
    const handoff = report.steps.find((step) => step.id === "after-handoff");
    expect(handoff?.hud.continuationApplied).toBe(true);
    expect(handoff?.hud.incomingActorIds.length).toBeGreaterThan(0);
    expect(report.unitJourney.residueFree).toBe(true);
    expect(report.hudChecksum).toMatch(/^[0-9a-f]{8}$/);
    expect(report.diagnostics.filter((d) => d.includes("handoff-not-observed"))).toEqual([]);
  });

  it("injects StateDef 5900 for turns handoff support", () => {
    const base = demoFighters[0]!;
    const patched = withTurnsHandoffSupport(base);
    expect(patched.states?.some((state) => state.id === 5900)).toBe(true);
    expect(patched.animations.has(5900)).toBe(true);
  });
});

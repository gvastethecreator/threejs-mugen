import { describe, expect, it } from "vitest";
import { withZssExecutionTelemetry } from "../mugen/compatibility/CompatibilityReport";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST,
  createIkemenZssHitPauseFixtureVfs,
  createMugenProfileZssHitPauseFixtureVfs,
} from "../mugen/runtime/IkemenZssLiveFixture";
import { createIkemenZssHitPauseTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("IKEMEN ZSS hit-pause wrapper fixture", () => {
  it("merges the CNS -2 baseline with parsed ZSS controllers in declared source order", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.entry,
      createIkemenZssHitPauseFixtureVfs(),
    );

    expect(character.files.states).toEqual([
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.cnsStatePath,
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.rootStatePath,
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath,
    ]);
    expect(character.states.find((state) => state.id === -2)?.controllers.map((controller) => controller.source?.path)).toEqual([
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.rootStatePath,
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath,
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath,
    ]);
    expect(character.states.find((state) => state.id === -2)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "velSet",
          params: expect.objectContaining({ ignorehitpause: "1" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath }),
        }),
        expect.objectContaining({
          type: "posAdd",
          params: expect.not.objectContaining({ ignorehitpause: "1" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    expect(character.compatibility.zss).toMatchObject({
      recognized: [IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath],
      compiled: { sourcePaths: [IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath] },
      blocked: { count: 0 },
    });
  });

  it("retains the located M.U.G.E.N profile rejection for the same ZSS source", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.entry,
      createMugenProfileZssHitPauseFixtureVfs(),
    );

    expect(character.states.find((state) => state.id === 200)).toBeDefined();
    expect(character.states.find((state) => state.id === 0)).toBeUndefined();
    expect(character.compatibility.unsupported).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          format: "zss",
          feature: "ZSS state source requires Ikemen profile",
          location: expect.stringMatching(/journey\.def:\d+$/),
        }),
      ]),
    );
  });

  it("runs only the parsed ZSS ignoreHitPause controller during the real CNS hit pause", async () => {
    const artifact = await createIkemenZssHitPauseTraceArtifact({ generatedAt: "2026-07-30T00:00:00.000Z" });

    expect(artifact.status).toBe("passed");
    expect(artifact.trace.frames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tickSchedule: expect.objectContaining({ branch: "hitpause" }) }),
      ]),
    );
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const wrappedEvent = p1Events.find(
      (event) => event.controller === "velSet" && event.stateSource?.path === IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath,
    );
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stateNo: 200,
          controller: "HitDef",
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.cnsStatePath }),
        }),
        expect.objectContaining({
          stateNo: 200,
          tick: 2,
          controller: "velSet",
          line: 7,
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          controller: "posAdd",
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    expect(artifact.trace.frames.find((frame) => frame.tick === wrappedEvent?.tick)?.tickSchedule?.branch).toBe("hitpause");

    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST.entry,
      createIkemenZssHitPauseFixtureVfs(),
    );
    const report = withZssExecutionTelemetry(character.compatibility, p1Events);
    // Runtime telemetry stamps the active fighter state (200) while the
    // source-located controller itself is defined in the merged ZSS StateDef -2.
    expect(report.zss?.executed.stateIds).toEqual([0, 200]);
    expect(report.zss?.executed.controllers).toBeGreaterThan(0);
  });
});

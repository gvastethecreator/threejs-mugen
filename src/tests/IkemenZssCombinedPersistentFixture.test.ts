import { describe, expect, it } from "vitest";
import { withZssExecutionTelemetry } from "../mugen/compatibility/CompatibilityReport";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST,
  createIkemenZssCombinedPersistentFixtureVfs,
  createMugenProfileZssCombinedPersistentFixtureVfs,
} from "../mugen/runtime/IkemenZssLiveFixture";
import { createIkemenZssCombinedPersistentTraceArtifact } from "../mugen/runtime/RuntimeTraceGatePresets";

describe("IKEMEN ZSS combined persistent wrapper fixture", () => {
  it("keeps the parsed wrapper source-located after the CNS pause origin", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.entry,
      createIkemenZssCombinedPersistentFixtureVfs(),
    );

    expect(character.files.states).toEqual([
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.cnsStatePath,
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.rootStatePath,
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath,
    ]);
    expect(character.states.find((state) => state.id === -2)?.controllers.map((controller) => controller.source?.path)).toEqual([
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.rootStatePath,
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath,
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath,
    ]);
    expect(character.states.find((state) => state.id === -2)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "velSet",
          params: expect.objectContaining({ ignorehitpause: "1", persistent: "2" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath }),
        }),
        expect.objectContaining({
          type: "posAdd",
          params: expect.not.objectContaining({ ignorehitpause: "1" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    expect(character.compatibility.zss).toMatchObject({
      recognized: [IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath],
      compiled: { sourcePaths: [IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath] },
      blocked: { count: 0 },
    });
  });

  it("retains the located M.U.G.E.N profile rejection while CNS states remain available", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.entry,
      createMugenProfileZssCombinedPersistentFixtureVfs(),
    );

    expect(character.states.find((state) => state.id === 200)).toBeDefined();
    expect(character.states.find((state) => state.id === 201)).toBeDefined();
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

  it("runs on pause ticks 2 and 4, skips tick 3, and resets on state entry", async () => {
    const artifact = await createIkemenZssCombinedPersistentTraceArtifact({
      generatedAt: "2026-07-30T00:00:00.000Z",
    });

    expect(artifact.status).toBe("passed");
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const zssVelSetEvents = p1Events.filter(
      (event) => event.controller === "velSet" &&
        event.stateSource?.path === IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath,
    );
    expect(zssVelSetEvents.map((event) => event.tick)).toEqual([2, 4, 5]);
    expect(p1Events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tick: 1,
          stateNo: 200,
          controller: "HitDef",
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.cnsStatePath }),
        }),
        expect.objectContaining({
          tick: 4,
          stateNo: 200,
          controller: "ChangeState",
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.cnsStatePath }),
        }),
      ]),
    );
    expect(p1Events).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          controller: "posAdd",
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath }),
        }),
        expect.objectContaining({
          tick: 3,
          controller: "velSet",
          stateSource: expect.objectContaining({ path: IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    for (const event of zssVelSetEvents) {
      expect(artifact.trace.frames.find((frame) => frame.tick === event.tick)?.tickSchedule?.branch).toBe("hitpause");
    }

    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST.entry,
      createIkemenZssCombinedPersistentFixtureVfs(),
    );
    const report = withZssExecutionTelemetry(character.compatibility, p1Events);
    // Telemetry records the active state (0, 200, 201), not source StateDef -2.
    expect(report.zss?.executed.stateIds).toEqual([0, 200, 201]);
    expect(report.zss?.executed.controllers).toBeGreaterThan(0);
  });
});

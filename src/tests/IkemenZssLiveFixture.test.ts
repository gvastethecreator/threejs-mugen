import { describe, expect, it } from "vitest";
import { withZssExecutionTelemetry } from "../mugen/compatibility/CompatibilityReport";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import {
  IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST,
  createIkemenZssLiveFixtureVfs,
  createIkemenZssMalformedFixtureVfs,
  createMugenProfileZssFixtureVfs,
} from "../mugen/runtime/IkemenZssLiveFixture";
import {
  createIkemenZssFallbackTraceArtifact,
  createIkemenZssLiveTraceArtifact,
} from "../mugen/runtime/RuntimeTraceGatePresets";

describe("IKEMEN ZSS live fixture", () => {
  it("loads direct ZSS alongside CNS in declared source order", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );

    expect(character.files.states).toEqual([
      "chars/mugen-lite-journey/ordered.cns",
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath,
    ]);
    expect(character.states.find((state) => state.id === -2)?.controllers.map((controller) => controller.source?.path)).toEqual([
      "chars/mugen-lite-journey/ordered.cns",
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath,
    ]);
    expect(character.states.find((state) => state.id === 100)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "velSet",
          params: expect.objectContaining({ ignorehitpause: "1", persistent: "2" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    expect(character.runtimeProgram?.states.map((state) => state.id)).toEqual(expect.arrayContaining([0, 100, 101]));
    expect(character.compatibility.zss).toMatchObject({
      recognized: [IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath],
      compiled: {
        sourcePaths: [IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath],
        stateIds: [-2, 0, 100, 101],
        controllers: 7,
      },
      executed: { stateIds: [], controllers: 0 },
      blocked: { count: 0 },
    });
  });

  it("uses .cns.zss only when the original CNS reference is absent", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs("fallback"),
    );

    expect(character.files.commonStates).toEqual([IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath]);
    expect(character.states.find((state) => state.id === 100)?.controllers[0]?.source?.path).toBe(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath,
    );
    expect(character.files.missing).not.toContain("live.cns");
    expect(character.compatibility.zss?.compiled.sourcePaths).toEqual([IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath]);
  });

  it("rejects ZSS state sources for a M.U.G.E.N profile with a DEF location", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createMugenProfileZssFixtureVfs(),
    );

    expect(character.states.find((state) => state.id === 0)).toBeUndefined();
    expect(character.compatibility.unsupported).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          format: "zss",
          feature: "ZSS state source requires Ikemen profile",
          location: "chars/mugen-lite-journey/journey.def:11",
        }),
      ]),
    );
    expect(character.compatibility.zss).toMatchObject({
      compiled: { sourcePaths: [], stateIds: [], controllers: 0 },
      blocked: { count: 1, features: ["ZSS state source requires Ikemen profile"] },
    });
  });

  it("fails malformed ZSS sources closed before their controllers can join the runtime", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssMalformedFixtureVfs(),
    );

    expect(character.states.find((state) => state.id === 0)).toBeUndefined();
    expect(character.runtimeProgram?.states.some((state) => state.id === 0)).toBe(false);
    expect(character.compatibility.unsupported).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ format: "zss", feature: "ZSS grammar source", location: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }),
      ]),
    );
    expect(character.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ format: "zss", severity: "error", file: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath, line: 2 }),
      ]),
    );
    expect(character.compatibility.zss).toMatchObject({
      compiled: { sourcePaths: [], stateIds: [], controllers: 0 },
      blocked: { count: 1, features: ["ZSS grammar source"] },
    });
  });

  it("executes the direct ZSS source through the ZIP loader and real match runtime", async () => {
    const artifact = await createIkemenZssLiveTraceArtifact({ generatedAt: "2026-07-30T00:00:00.000Z" });

    expect(artifact.status).toBe("passed");
    expect(artifact.gates[0]?.evidence.controllerEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stateNo: 0, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 100, controller: "velSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
      ]),
    );

    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const report = withZssExecutionTelemetry(character.compatibility, p1Events);

    expect(character.compatibility.zss?.executed).toEqual({ stateIds: [], controllers: 0 });
    expect(report.zss?.executed).toEqual({ stateIds: [0, 100, 101], controllers: 16 });
  });

  it("executes the .cns.zss fallback through the ZIP loader and real match runtime", async () => {
    const artifact = await createIkemenZssFallbackTraceArtifact({ generatedAt: "2026-07-30T00:00:00.000Z" });

    expect(artifact.status).toBe("passed");
    expect(artifact.gates[0]?.evidence.controllerEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stateNo: 0, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 100, controller: "velSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
      ]),
    );
  });
});

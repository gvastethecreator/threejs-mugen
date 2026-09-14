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
import { dispatchStateProgramController } from "../mugen/runtime/StateProgramExecutor";

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
    expect(character.runtimeProgram?.states.map((state) => state.id)).toEqual(expect.arrayContaining([0, 100, 101, 102, 104, 105]));
    expect(character.states.find((state) => state.id === 105)?.controllers.map((controller) => controller.type)).toEqual([
      "parentVarAdd",
      "destroySelf",
    ]);
    expect(dispatchStateProgramController(
      character.runtimeProgram?.states.find((state) => state.id === 105)?.controllers.find((controller) => controller.normalizedType === "parentvaradd")!,
    )).toMatchObject({ kind: "runtime-controller" });
    expect(dispatchStateProgramController(
      character.runtimeProgram?.states.find((state) => state.id === 105)?.controllers.find((controller) => controller.normalizedType === "destroyself")!,
    )).toMatchObject({ kind: "runtime-controller" });
    expect(character.states.find((state) => state.id === 101)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "changeAnim",
          params: expect.objectContaining({ value: "200" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }),
        }),
        expect.objectContaining({
          type: "changeAnim2",
          params: expect.objectContaining({ value: "200" }),
          source: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }),
        }),
      ]),
    );
    const state101 = character.runtimeProgram?.states.find((state) => state.id === 101)?.controllers ?? [];
    expect(dispatchStateProgramController(state101.find((controller) => controller.normalizedType === "changeanim")!)).toMatchObject({
      kind: "change-anim",
      animationSource: "self",
      actionId: 200,
    });
    expect(dispatchStateProgramController(state101.find((controller) => controller.normalizedType === "changeanim2")!)).toMatchObject({
      kind: "change-anim",
      animationSource: "state-owner",
      actionId: 200,
    });
    expect(character.states.find((state) => state.id === 102)?.controllers.map((controller) => controller.type)).toEqual([
      "velAdd",
      "velMul",
      "posSet",
      "ctrlSet",
      "stateTypeSet",
      "varSet",
      "varAdd",
      "varSet",
      "removeExplod",
      "stopSnd",
      "posAdd",
      "velSet",
      "changeState",
    ]);
    expect(character.states.find((state) => state.id === 102)?.controllers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "posSet", params: expect.objectContaining({ x: "12.5" }) }),
        expect.objectContaining({ type: "ctrlSet", params: expect.objectContaining({ value: "0" }) }),
        expect.objectContaining({ type: "varSet", params: expect.objectContaining({ v: "0", value: "3" }) }),
        expect.objectContaining({ type: "varAdd", params: expect.objectContaining({ v: "0", value: "2" }) }),
        expect.objectContaining({ type: "varSet", params: expect.objectContaining({ fv: "1", value: "0.5" }) }),
      ]),
    );
    expect(character.compatibility.zss).toMatchObject({
      recognized: [IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath],
      compiled: {
        sourcePaths: [IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath],
        stateIds: [-2, 0, 100, 101, 102, 104, 105],
        controllers: 33,
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
        expect.objectContaining({ stateNo: 0, controller: "projectile", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 0, controller: "helper", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 0, controller: "explod", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 0, controller: "playSnd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "removeExplod", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "stopSnd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 100, controller: "velSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "changeAnim", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "changeAnim2", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "velAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "velMul", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "posSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "ctrlSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "stateTypeSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "varSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "varAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
        expect.objectContaining({ stateNo: 104, controller: "hitDef", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath }) }),
      ]),
    );
    expect(artifact.gates[0]?.evidence.eventCategories).toEqual(expect.arrayContaining(["hit"]));
    expect(artifact.gates[0]?.evidence.executedStates).toEqual(expect.arrayContaining([104]));

    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );
    const p1Events = artifact.gates[0]?.evidence.controllerEvents.filter((event) => event.actorId === "p1") ?? [];
    const report = withZssExecutionTelemetry(character.compatibility, p1Events);

    expect(character.compatibility.zss?.executed).toEqual({ stateIds: [], controllers: 0 });
    expect(report.zss?.executed.stateIds).toEqual(expect.arrayContaining([0, 100, 101, 102, 104]));
  });

  it("executes the .cns.zss fallback through the ZIP loader and real match runtime", async () => {
    const artifact = await createIkemenZssFallbackTraceArtifact({ generatedAt: "2026-07-30T00:00:00.000Z" });

    expect(artifact.status).toBe("passed");
    expect(artifact.gates[0]?.evidence.controllerEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stateNo: 0, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 100, controller: "velSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "posAdd", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "changeAnim", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 101, controller: "changeAnim2", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
        expect.objectContaining({ stateNo: 102, controller: "posSet", stateSource: expect.objectContaining({ path: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.fallbackStatePath }) }),
      ]),
    );
  });
});

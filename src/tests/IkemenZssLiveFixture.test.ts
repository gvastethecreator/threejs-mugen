import { describe, expect, it } from "vitest";
import { withZssExecutionTelemetry } from "../mugen/compatibility/CompatibilityReport";
import { createStageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { parseStageDef, stageDefToRuntime } from "../mugen/parsers/StageDefParser";
import {
  IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST,
  createIkemenZssDuelFixtureVfs,
  createIkemenZssLiveFixtureVfs,
  createIkemenZssMalformedFixtureVfs,
  createIkemenZssMalformedExpressionFixtureVfs,
  createIkemenZssMalformedGrantedFixtureVfs,
  createMugenProfileZssFixtureVfs,
} from "../mugen/runtime/IkemenZssLiveFixture";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
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
      "changeAnim2",
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
        controllers: 34,
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

  it("fails a granted ChangeAnim plus malformed Projectile closed, then a fresh valid load is not stale", async () => {
    const loader = new MugenCharacterLoader();
    const blocked = await loader.load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssMalformedGrantedFixtureVfs(),
    );

    expect(blocked.states.find((state) => state.id === 0)).toBeUndefined();
    expect(blocked.runtimeProgram?.states.some((state) => state.id === 0)).toBe(false);
    expect(blocked.compatibility.zss).toMatchObject({
      compiled: { sourcePaths: [], stateIds: [], controllers: 0 },
      blocked: { count: 1, features: ["ZSS grammar source"] },
    });
    expect(blocked.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          format: "zss",
          severity: "error",
          file: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath,
          message: expect.stringContaining("invalid parameter list"),
        }),
      ]),
    );

    const valid = await loader.load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );
    expect(valid.states.find((state) => state.id === 0)).toBeDefined();
    expect(valid.compatibility.zss?.compiled.controllers).toBeGreaterThan(0);
    expect(valid.compatibility.zss?.blocked.count).toBe(0);
  });

  it("fails ChangeAnim plus Projectile Sin() arity closed, then a fresh valid load is not stale", async () => {
    const loader = new MugenCharacterLoader();
    const blocked = await loader.load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssMalformedExpressionFixtureVfs(),
    );

    expect(blocked.states.find((state) => state.id === 0)).toBeUndefined();
    expect(blocked.runtimeProgram?.states.some((state) => state.id === 0)).toBe(false);
    expect(blocked.compatibility.zss).toMatchObject({
      compiled: { sourcePaths: [], stateIds: [], controllers: 0 },
      blocked: { count: 1, features: ["ZSS grammar source"] },
    });
    expect(blocked.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          format: "zss",
          severity: "error",
          file: IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.directStatePath,
          message: "Admitted ZSS expression is invalid; the source contributes no states",
        }),
      ]),
    );

    const valid = await loader.load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );
    expect(valid.states.find((state) => state.id === 0)).toBeDefined();
    expect(valid.compatibility.zss?.compiled.controllers).toBeGreaterThan(0);
    expect(valid.compatibility.zss?.blocked.count).toBe(0);
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

  it("proves ZSS projectile contact, helper parent writes, borrowed anim, explod and sound at consumers", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );
    const p1 = createImportedFighterDefinition(character);
    if (!p1) throw new Error("IKEMEN ZSS fixture did not produce a runtime fighter");
    expect(p1.animations.has(930)).toBe(true);
    const effectActorWorld = new RuntimeEffectActorWorld();
    const runtime = new PlayableMatchRuntime(p1, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      effectActorWorld,
    });
    const observed = {
      explod: 0,
      helperAnim: 0,
      parentVar: 0,
      playSnd: false,
      stopSnd: false,
    };
    let live = runtime.getSnapshot();
    for (let tick = 0; tick < 24; tick += 1) {
      live = runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
      observed.explod = Math.max(observed.explod, effectActorWorld.countExplods("p1"));
      for (const helper of effectActorWorld.helpers("p1")) {
        observed.helperAnim = Math.max(observed.helperAnim, helper.animNo);
      }
      observed.parentVar = Math.max(observed.parentVar, live.actors[0]?.runtime.vars[3] ?? 0);
      const sounds = live.actors.find((actor) => actor.id === "p1")?.soundEvents ?? [];
      if (sounds.some((event) => event.type === "PlaySnd" && event.channel === 2)) {
        observed.playSnd = true;
      }
      if (sounds.some((event) => event.type === "StopSnd" && event.channel === 2)) {
        observed.stopSnd = true;
      }
    }
    const p1Session = live.compatibilitySession?.actors.find((actor) => actor.actorId === "p1");
    const p2 = live.actors.find((actor) => actor.id === "p2");
    expect(p1Session?.executedControllers).toMatchObject({
      helper: expect.any(Number),
      projectile: expect.any(Number),
      explod: expect.any(Number),
      playSnd: expect.any(Number),
      stopSnd: expect.any(Number),
      removeExplod: expect.any(Number),
    });
    expect(p1Session?.executedStates).toEqual(expect.arrayContaining([100, 104, 105]));
    expect(observed.explod).toBeGreaterThan(0);
    expect(observed.helperAnim).toBe(930);
    expect(observed.parentVar).toBeGreaterThan(0);
    expect(observed.playSnd).toBe(true);
    expect(observed.stopSnd).toBe(true);
    expect(effectActorWorld.countExplods("p1")).toBe(0);
    expect(effectActorWorld.helpers("p1")).toEqual([]);
    expect(p2?.runtime.life).toBeLessThan(1000);
    expect(live.logs).toEqual(expect.arrayContaining([expect.stringMatching(/projectile hit/i)]));
    runtime.dispatch({ type: "reset" });
    const reset = runtime.getSnapshot();
    expect(reset.effects ?? []).toEqual([]);
    expect(effectActorWorld.helpers("p1")).toEqual([]);
    expect(effectActorWorld.countExplods("p1")).toBe(0);
  });

  it("finishes an imported ZSS duel through contact, recovery, settled round and reset twice", async () => {
    const first = await observeImportedZssDuel();
    const second = await observeImportedZssDuel();
    expect(first).toEqual(second);
    expect(first.executedStates).toEqual(expect.arrayContaining([100, 104, 105]));
    expect(first.projectileHit).toBe(true);
    expect(first.hitDefContact).toBe(true);
    expect(first.p2MinLife).toBe(0);
    expect(first.helperMax).toBeGreaterThan(0);
    expect(first.explodMax).toBeGreaterThan(0);
    expect(first.recoveryState).toBeGreaterThan(0);
    expect(first.round).toMatchObject({ state: "ko", roundPhase: 4, winner: "IKEMEN ZSS Live" });
    expect(first.layerCount).toBe(9);
    expect(first.resetEffects).toBe(0);
    expect(first.resetHelpers).toBe(0);
    expect(first.resetExplods).toBe(0);
    expect(first.resetProjectiles).toBe(0);
    expect(first.resetLayers).toBe(9);
  });

  it("runs one imported ZSS duel on a nine-layer stage and clears effects on reset", async () => {
    const character = await new MugenCharacterLoader().load(
      IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
      createIkemenZssLiveFixtureVfs(),
    );
    const p1 = createImportedFighterDefinition(character);
    if (!p1) throw new Error("IKEMEN ZSS fixture did not produce a runtime fighter");
    const extraLayers = Array.from({ length: 6 }, (_, index) => `
[BG Extra ${index}]
type = normal
id = ${index + 10}
spriteno = 0,0
start = 0,${index * 8}
`).join("\n");
    const definition = parseStageDef(`
[StageInfo]
zoffset = 200
zoffsetlink = 4
localcoord = 320,240
[BGDef]
spr = stage.sff
[BG Sky]
type = normal
spriteno = 0,0
[BG Floor]
type = parallax
id = 4
spriteno = 0,0
width = 200,80
sin.y = 10,8,0
[BG Dummy]
type = dummy
spriteno = 0,0
${extraLayers}
`, "stages/integrated.def");
    const stage = stageDefToRuntime(definition, "integrated-duel");
    const report = createStageCompatibilityReport({
      sourceName: "integrated-duel.zip",
      defPath: "stages/integrated.def",
      definition,
      stage,
      files: { def: "stages/integrated.def", sprite: "stages/stage.sff", missing: [] },
      diagnostics: [],
    });
    const effectActorWorld = new RuntimeEffectActorWorld();
    const runtime = new PlayableMatchRuntime(p1, demoFighters[1]!, stage, {
      runtimeProfile: "ikemen-go",
      effectActorWorld,
    });
    const observed = {
      helpers: 0,
      explods: 0,
      helperKind: false,
    };
    let live = runtime.getSnapshot();
    for (let tick = 0; tick < 16; tick += 1) {
      live = runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
      observed.helpers = Math.max(observed.helpers, effectActorWorld.helpers("p1").length);
      observed.explods = Math.max(observed.explods, effectActorWorld.countExplods("p1"));
      if ((live.effects ?? []).some((effect) => effect.actorKind === "helper")) {
        observed.helperKind = true;
      }
    }
    const p1Session = live.compatibilitySession?.actors.find((actor) => actor.actorId === "p1");
    const p1Store = runtime.getEffectActorStores().find((store) => store.ownerId === "p1");
    const p2 = live.actors.find((actor) => actor.id === "p2");
    expect(live.stage.layers).toHaveLength(9);
    expect(p1Session?.executedStates).toEqual(expect.arrayContaining([100, 104, 105]));
    expect(p1Session?.executedControllers).toMatchObject({
      helper: expect.any(Number),
      projectile: expect.any(Number),
      explod: expect.any(Number),
      hitDef: expect.any(Number),
    });
    expect(observed.helpers).toBeGreaterThan(0);
    expect(observed.explods).toBeGreaterThan(0);
    expect(observed.helperKind).toBe(true);
    expect(p1Store?.nextSerials.projectile).toBeGreaterThan(0);
    expect(runtime.getHitDefContactMemory().actors.find((actor) => actor.actorId === "p1")?.committed).toContain("p2");
    expect(p2?.runtime.life).toBeLessThan(1000);
    expect(live.logs).toEqual(expect.arrayContaining([expect.stringMatching(/projectile hit/i)]));
    expect(live.round?.state).toBe("fight");
    expect(report.backgrounds.total).toBe(9);
    expect(report.backgrounds.layers.find((layer) => layer.type === "parallax")).toMatchObject({
      parallaxWidth: { top: 200, bottom: 80 },
    });
    expect(report.backgrounds.layers.find((layer) => layer.type === "dummy")).toMatchObject({
      projected: false,
      unsupported: ["type:dummy"],
    });
    expect(report.audio.playbackObserved).toBe(false);
    runtime.dispatch({ type: "reset" });
    const reset = runtime.getSnapshot();
    expect(reset.effects ?? []).toEqual([]);
    expect(effectActorWorld.helpers("p1")).toEqual([]);
    expect(effectActorWorld.projectiles("p1")).toEqual([]);
    expect(effectActorWorld.countExplods("p1")).toBe(0);
    expect(reset.stage.bgPalFx).toBeUndefined();
    expect(reset.actors[0]?.runtime.pos.y).toBe(0);
  });
});

async function observeImportedZssDuel() {
  const character = await new MugenCharacterLoader().load(
    IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST.entry,
    createIkemenZssDuelFixtureVfs(),
  );
  const p1 = createImportedFighterDefinition(character);
  if (!p1) throw new Error("IKEMEN ZSS duel fixture did not produce a runtime fighter");
  const extraLayers = Array.from({ length: 6 }, (_, index) => `
[BG Extra ${index}]
type = normal
id = ${index + 10}
spriteno = 0,0
start = 0,${index * 8}
`).join("\n");
  const stage = stageDefToRuntime(
    parseStageDef(`
[StageInfo]
zoffset = 200
zoffsetlink = 4
localcoord = 320,240
[PlayerInfo]
p1startx = -20
p2startx = 35
[BGDef]
spr = stage.sff
[BG Sky]
type = normal
spriteno = 0,0
[BG Floor]
type = parallax
id = 4
spriteno = 0,0
width = 200,80
[BG Dummy]
type = dummy
spriteno = 0,0
${extraLayers}
`, "stages/imported-duel.def"),
    "imported-duel",
  );
  const effectActorWorld = new RuntimeEffectActorWorld();
  const runtime = new PlayableMatchRuntime(p1, demoFighters[1]!, stage, {
    runtimeProfile: "ikemen-go",
    effectActorWorld,
    roundTiming: { overHitTimeFrames: 1, postKoPhase4StartFrames: 4, winPoseFrames: 2, postKoFrames: 8 },
  });
  const observed = {
    helperMax: 0,
    explodMax: 0,
    p2MinLife: 1000,
    recoveryState: 0,
    projectileHit: false,
    hitDefContact: false,
  };
  let live = runtime.getSnapshot();
  for (let tick = 0; tick < 320; tick += 1) {
    live = runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
    observed.helperMax = Math.max(observed.helperMax, effectActorWorld.helpers("p1").length);
    observed.explodMax = Math.max(observed.explodMax, effectActorWorld.countExplods("p1"));
    const p2Life = live.actors.find((actor) => actor.id === "p2")?.runtime.life ?? 1000;
    observed.p2MinLife = Math.min(observed.p2MinLife, p2Life);
    const p2 = live.actors.find((actor) => actor.id === "p2");
    if (p2Life < 1000 && (p2?.runtime.stateNo || p2?.runtime.animNo)) {
      observed.recoveryState = p2?.runtime.stateNo || p2?.runtime.animNo || 0;
    }
    if ((live.logs ?? []).some((line) => /projectile hit/i.test(line))) {
      observed.projectileHit = true;
    }
    if (runtime.getHitDefContactMemory().actors.find((actor) => actor.actorId === "p1")?.committed.includes("p2")) {
      observed.hitDefContact = true;
    }
    if (live.round?.state === "ko" && live.round.roundPhase === 4) {
      break;
    }
  }
  const p1Session = live.compatibilitySession?.actors.find((actor) => actor.actorId === "p1");
  runtime.dispatch({ type: "reset" });
  const reset = runtime.getSnapshot();
  return {
    executedStates: [...(p1Session?.executedStates ?? [])].sort((left, right) => left - right),
    helperMax: observed.helperMax,
    explodMax: observed.explodMax,
    p2MinLife: observed.p2MinLife,
    recoveryState: observed.recoveryState,
    projectileHit: observed.projectileHit,
    hitDefContact: observed.hitDefContact,
    round: {
      state: live.round?.state,
      roundPhase: live.round?.roundPhase,
      winner: live.round?.winner,
    },
    tick: live.tick,
    layerCount: live.stage.layers.length,
    resetEffects: (reset.effects ?? []).length,
    resetHelpers: effectActorWorld.helpers("p1").length,
    resetExplods: effectActorWorld.countExplods("p1"),
    resetProjectiles: effectActorWorld.projectiles("p1").length,
    resetLayers: reset.stage.layers.length,
  };
}

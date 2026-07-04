# Architecture review - mugen-web-sandbox

Date: 2026-07-02

## Summary

- Runtime Mode has many named worlds with real tests, but `PlayableMatchRuntime` still owns broad adapter wiring, controller telemetry, actor roster choices, and helper/effect/target glue.
- Studio Mode has a real Evidence/Build Trust Chain concept, but the implementation lives inside `App.ts`, so product rules, export readiness, row actions, and render code share one very large module.
- `RuntimeTrace` and compatibility gate truth are evidence-first, but gate metadata, runner behavior, checksums, tests, and roadmap summaries still require manual synchronization.
- Shared module contracts are guarded by tests and import-rule automation, but `src/engine/ModuleContracts.ts` is still closer to a registry than a deep module that other modules can use for build and QA decisions.

This review is docs-only. It creates no compatibility claim, score movement, runtime behavior change, or visual change.

## Recommendations

### 1. Deepen the Studio Trust Chain module

**Recommendation strength**: Strong

**Files**

- `src/app/App.ts`
- `src/app/StudioModel.ts`
- `src/app/StudioEvidenceStorage.ts`
- `scripts/qa_smoke.cjs`
- `docs/INTERFACE_SYSTEM.md`
- `docs/ENGINE_STUDIO_ROADMAP.md`
- `.scratch/roadmap/issues/02-studio-evidence-workflow.md`

**Problem**

The Studio Evidence/Build Trust Chain module is shallow inside `App.ts`: Build readiness, trust rows, freshness, target selection, blockers, and row action routing are private UI implementation details. The next S1 work asks for package-file and source-file drilldowns, which will add more row-specific logic unless the seam is deepened first.

**Solution**

Move Trust Chain derivation into a pure Studio module. `App.ts` should provide the current project, runtime, evidence, build, trace, and package state, then render rows and dispatch actions as a DOM adapter.

**Benefits**

- locality: Trust Chain row rules, stale/current calculations, blockers, and next actions concentrate in one module.
- leverage: Build, Evidence, the QA bridge, smoke checks, and package export can exercise the same interface.
- tests: focused tests can cover row states and target selection without launching the full Studio surface.

**Before / After**

Before: Evidence, Build, the QA bridge, and export readiness all call private `App.ts` methods that know row ids and product rules.

After: Trust Chain rules live behind one Studio module. The DOM adapter renders the returned rows and performs the selected action.

**Dependencies / sequencing**

- Do this before package-file and source-file drilldowns.
- This can run as the first S1 slice without touching runtime behavior.

**Documentation follow-ups**

- Update `docs/INTERFACE_SYSTEM.md` with the Trust Chain module as the Evidence/Build seam.
- Update `docs/ENGINE_STUDIO_ROADMAP.md` and `.scratch/roadmap/issues/02-studio-evidence-workflow.md` if the accepted S1 execution plan changes.
- No ADR unless the project manifest or export schema changes.

### 2. Deepen the Project Bundle module

**Recommendation strength**: Strong

**Files**

- `src/app/App.ts`
- `src/app/ProjectCompiler.ts`
- `src/app/StudioModel.ts`
- `src/app/StudioEvidenceStorage.ts`
- `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`
- `docs/QA_AND_ACCEPTANCE_GATES.md`

**Problem**

Project package export has low locality: ZIP layout, package manifest construction, evidence inclusion, source-runtime maps, browser-fetchable asset candidates, VFS/fetch handling, checksum diagnostics, and Build readiness snapshotting all live in `App.ts`. The module interface is nearly as complex as the implementation because callers must understand UI state and package semantics together.

**Solution**

Move package layout, export manifest construction, asset candidate selection, diagnostics, and evidence packaging into a Project Bundle module. Keep `JSZip`, browser fetch, local VFS, and download behavior as adapters at the seam.

**Benefits**

- locality: package truth, missing-source behavior, and diagnostics concentrate outside the UI module.
- leverage: Studio Build, package export, and future source-file drilldowns can use one implementation.
- tests: bundle manifest, included files, missing assets, diagnostics, and evidence snapshots can be covered without browser interaction.

**Before / After**

Before: `App.ts` builds the package, decides which files matter, records diagnostics, writes the bundle, and updates UI state.

After: a Project Bundle module derives the package plan and manifest. `App.ts` supplies browser adapters and reports the result.

**Dependencies / sequencing**

- Do this after Recommendation 1 so package readiness can reuse the Trust Chain module.
- Do this before deeper package-file and source-file drilldowns.

**Documentation follow-ups**

- Update `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md` if package ownership wording changes.
- Update `docs/ENGINE_STUDIO_ROADMAP.md` and `docs/QA_AND_ACCEPTANCE_GATES.md` if the accepted package evidence gates change.
- Consider an ADR only if `export-bundle/v0` changes shape.

### 3. Deepen the active controller runtime dispatch adapter

**Recommendation strength**: Strong

**Files**

- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/mugen/runtime/RuntimeActiveControllerDispatchSystem.ts`
- `src/mugen/runtime/RuntimeActiveSideEffectDispatchSystem.ts`
- `src/mugen/runtime/RuntimeCompatibilityTelemetrySystem.ts`
- `src/mugen/runtime/StateControllerExecutor.ts`
- `docs/ENGINE_PORT_ARCHITECTURE.md`
- `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

**Problem**

`ControllerOp` execution has useful typed modules, but the active runtime dispatch adapter is still shallow. `PlayableMatchRuntime` repeats telemetry callbacks, side-effect world wiring, target-state hooks, pause/audio/env/effect/contact routing, and fallback controller execution in one long implementation. The interface callers must understand is close to the implementation itself.

**Solution**

Deepen the active controller runtime dispatch adapter so telemetry routing, side-effect dispatch wiring, and fallback runtime-controller handoff live in one module. Existing specialized worlds should remain implementation seams where they already have tests and real variation.

**Benefits**

- locality: `ControllerOp` evidence bugs, missing telemetry, and side-effect wiring mistakes concentrate in one module.
- leverage: new controller families can cross one seam instead of adding another branch in `PlayableMatchRuntime`.
- tests: focused dispatch tests can prove controller order and telemetry without reconstructing the whole match loop.

**Before / After**

Before: `PlayableMatchRuntime` scans controllers, evaluates triggers, dispatches state changes, records telemetry, wires every side-effect world, and falls back to runtime-controller execution.

After: `PlayableMatchRuntime` keeps tick ownership, but active controller dispatch crosses one deeper adapter that owns controller-route implementation details.

**Dependencies / sequencing**

- Do this before expanding another broad controller family.
- Do this before Recommendation 5, because a deeper active-match module should not absorb the current dispatch wiring.

**Documentation follow-ups**

- Update `docs/ENGINE_PORT_ARCHITECTURE.md`, `docs/WORKPLAN.md`, and `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`.
- Add `claim allowed` / `claim blocked` wording if tests or traces prove the move.
- No score movement from extraction alone.

### 4. Deepen match actor roster ownership

**Recommendation strength**: Strong

**Files**

- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/mugen/runtime/RuntimeMatchHelperTargetStateSystem.ts`
- `src/mugen/runtime/RuntimeHelperTargetStateSystem.ts`
- `src/mugen/runtime/RuntimeMatchPostFighterSystem.ts`
- `src/mugen/runtime/MatchInteractionSystem.ts`
- `src/mugen/runtime/RuntimeOpponentSelectionSystem.ts`
- `src/mugen/runtime/TargetSystem.ts`
- `docs/TICK_ORDER_CONTRACT.md`

**Problem**

Match actor roster knowledge is still mostly 1v1 and spread across seams: `[p1, p2]`, `opponentFor`, candidate target arrays, helper target entry hooks, lifecycle opponent lists, and helper/effect/combat lookups are repeated. That keeps helper/effect/target work shallow because each module must rediscover who can see or mutate whom.

**Solution**

Deepen a match actor roster module that owns current actors, opponent lists, target candidates, and match-owned state-entry adapters. Keep current 1v1 behavior as the first adapter and keep teams/simul, multi-target, and full helper VM parity explicitly blocked.

**Benefits**

- locality: helper/effect/target lookup policy moves to one implementation.
- leverage: future helper, projectile, target, and team work can cross one roster seam.
- tests: current 1v1 target and opponent selection can be tested without duplicating actor-array setup in every module.

**Before / After**

Before: helper target entry, effect lifecycle, match interaction, and target controller paths each materialize their own actor view.

After: those modules ask one roster module for the current bounded actor view and state-entry adapter.

**Dependencies / sequencing**

- Do this before deeper helper-owned combat/effect ordering.
- Pair it with Recommendation 3 when the next R2 slice touches active controller dispatch and helper/effect/target routing together.

**Documentation follow-ups**

- Update `docs/ENGINE_PORT_ARCHITECTURE.md`, `docs/TICK_ORDER_CONTRACT.md`, and `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`.
- Add blocked wording for teams/simul, multi-target helper ownership, and exact helper VM parity.

### 5. Deepen the active match phase module

**Recommendation strength**: Worth exploring

**Files**

- `src/mugen/runtime/RuntimeMatchActiveSystem.ts`
- `src/mugen/runtime/RuntimeMatchPostFighterSystem.ts`
- `src/mugen/runtime/RuntimeMatchCombatBridgeSystem.ts`
- `src/mugen/runtime/RuntimeMatchFighterAdvanceSystem.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/tests/RuntimeMatchActiveSystem.test.ts`

**Problem**

`RuntimeMatchActiveWorld` is currently an ordered callback module. Its interface is almost the same size as its implementation: callers pass callbacks for timer, command buffers, input, fighter advance, post-fighter work, and round finish. The deletion test says the current module is shallow because deleting it mostly moves the same calls back to `PlayableMatchRuntime`.

**Solution**

After Recommendations 3 and 4, deepen the active match phase module so normal active-match ordering sits behind one seam and specialized worlds become implementation details where they do not need to vary.

**Benefits**

- locality: active tick-order changes concentrate in one module.
- leverage: tests cross the active-match seam instead of mocking every ordered callback.
- tests: helper/effect/combat ordering can be covered at the active phase without requiring a full browser or Studio setup.

**Before / After**

Before: the active phase module says "call these six closures in order."

After: the active phase module owns the bounded active-match route and uses internal seams for fighter advance, controller dispatch, roster, combat, and round finish.

**Dependencies / sequencing**

- Do not start here first. It becomes useful after controller dispatch and roster ownership are deeper.
- Keep trace checksums stable unless behavior intentionally changes.

**Documentation follow-ups**

- Update `docs/ENGINE_PORT_ARCHITECTURE.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, and `docs/WORKPLAN.md` if accepted.
- No parity claim from this extraction without focused tests or trace evidence.

### 6. Deepen the RuntimeTrace gate catalog

**Recommendation strength**: Strong

**Files**

- `src/mugen/runtime/RuntimeTraceGatePresets.ts`
- `src/mugen/runtime/RuntimeTrace.ts`
- `src/mugen/runtime/RuntimeTraceArtifact.ts`
- `scripts/qa_traces.cjs`
- `src/tests/RuntimeTraceGatePresets.test.ts`
- `docs/ROADMAP_EXECUTION_BOARD.md`
- `docs/ROADMAP_PACKAGE_MILESTONES.md`
- `docs/NEXT_BUILD_ROADMAP.md`
- `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

**Problem**

Compatibility gate truth is spread across preset factories, the QA trace runner, tests, artifacts, and roadmap prose. `RuntimeTraceGatePresets.ts` is very large, and the current worktree already has local changes in trace runner/preset/test files. That makes the interface shallow for future agents: to change one gate, a maintainer must understand runner behavior, preset construction, docs summaries, checksum expectations, and claim wording separately.

**Solution**

Deepen a RuntimeTrace gate catalog module that owns gate metadata, required/optional status, runner-facing preset selection, and documentation summaries. The trace runner should become an adapter at the seam, and roadmap docs should consume or mirror the catalog with less manual duplication.

**Benefits**

- locality: gate ids, required status, claim allowed/blocked summaries, and runner selection concentrate in one module.
- leverage: tests, `pnpm qa:trace`, Studio Evidence, and roadmap docs can rely on the same gate catalog.
- tests: catalog tests can catch drift before a long trace run or manual docs reconciliation.

**Before / After**

Before: changing a compatibility gate requires edits across preset construction, runner logic, tests, and several docs.

After: the catalog is the source module for gate selection and summaries; runner, tests, and docs become adapters or mirrors.

**Dependencies / sequencing**

- Coordinate with the existing dirty trace files before implementation.
- Start with cataloging current behavior only; do not change trace semantics in the same cut.

**Documentation follow-ups**

- Update `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, and `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`.
- Consider an ADR only if the catalog becomes a new durable source of truth for compatibility gates.

## Suggested execution order

1. Studio Trust Chain module - first S1 prefactor; it makes Evidence/Build drilldowns and QA bridge checks easier without touching runtime behavior.
2. Project Bundle module - second S1 prefactor; it keeps package-file/source-file drilldowns from growing inside `App.ts`.
3. RuntimeTrace gate catalog - first R1 control prefactor when the current trace-gate files are ready to be reconciled; behavior should stay unchanged.
4. Active controller runtime dispatch adapter - first R2 runtime prefactor; it removes repeated controller telemetry and side-effect wiring from `PlayableMatchRuntime`.
5. Match actor roster ownership - next R2 prefactor; it prepares helper/effect/target ownership without claiming teams/simul parity.
6. Active match phase module - later R2 deepening; it should wait until controller dispatch and roster ownership are no longer shallow.

The S1 and R1/R2 tracks can move independently after this review is accepted. If one agent must do the whole batch, keep the order above so each later module gets a smaller interface and a more local implementation.

## Documentation fan-out

- `CONTEXT.md`: no new vocabulary is required yet; add terms only if accepted implementation names a new product or runtime concept.
- `docs/adr/`: add an ADR only if the RuntimeTrace gate catalog or Project Bundle module becomes a durable source of truth or changes a versioned export schema.
- `docs/architecture/WORKPLAN.md`: create or update after recommendations are accepted, with one section per accepted recommendation.
- Existing tracker docs: update `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` for R1/R2 work and `.scratch/roadmap/issues/02-studio-evidence-workflow.md` for S1 work.

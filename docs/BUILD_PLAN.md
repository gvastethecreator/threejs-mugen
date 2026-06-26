# Construction Master Plan

This plan turns the current sandbox into a staged construction program for three connected products:

1. A progressive MUGEN / IKEMEN-GO compatibility port on TypeScript + Three.js.
2. A creator studio for importing, generating, inspecting, editing, playtesting, and exporting projects.
3. A modular browser game engine foundation that can later host platformer, beat-em-up, arena, or custom modules without copying MUGEN-specific assumptions everywhere.

The plan intentionally keeps the fighting/MUGEN module as the first hard proof. If that module becomes deterministic, inspectable, and honestly reported, the studio and future modules can reuse trustworthy contracts instead of growing around unstable shortcuts.

For the active execution order across all horizons, use `docs/FULL_BUILD_PROGRAM.md` and `docs/CONSTRUCTION_PROGRAM.md`. This document explains the master plan; the full build program turns the broader product horizon into operating lanes, and the construction program keeps the immediate gated work in order.

## Source Baseline

The current architecture should keep following official and primary-source references:

- Elecbyte's MUGEN docs define the legacy file model: DEF, AIR, CMD, CNS, SFF, SND, palettes, stages, state controllers, and expressions.
- Elecbyte describes CNS as both player constants and the state/controller system that gives a character its actual functionality. That makes CNS compilation and controller execution the core compatibility problem, not a side parser.
- Ikemen GO is the strongest public successor reference because it targets MUGEN 1.1 Beta compatibility, supports MUGEN resources, and extends the ecosystem with Lua, ZSS, netplay, and later presentation/stage features.
- Ikemen GO should guide architecture and behavior triage, but this project remains TypeScript-native, browser-local, and Three.js-rendered.

## Product Shape

```txt
Creator Studio
  Project dashboard
  Asset library
  Character studio
  Stage studio
  Module studio
  Build/export center
  Runtime debugger
  QA evidence browser

Engine Core
  Project manifests
  Asset records
  Input actions
  Deterministic tick loop
  Snapshot contract
  Debug event bus
  QA bridge

Modules
  MUGEN / IKEMEN fighting module
  Platformer module
  Beat-em-up / arena module
  Custom sprite module

Adapters
  Three.js renderer
  Web Audio
  DOM UI/debug shell
  Browser-local storage and ZIP/folder import
```

The engine core owns contracts. Genre modules own simulation. Three.js owns presentation. Studio owns authoring and orchestration.

## Construction Tracks

### Track A: Compatibility Engine

Goal: make imported MUGEN/IKEMEN content playable by layers, with reports that separate parsed, decoded, compiled, executed partial, executed parity, and unsupported behavior.

Major work:

- Introduce typed compiler IR for CMD, expressions/triggers, and CNS controllers.
- Move broad runtime behavior out of raw string evaluation and into typed runtime systems.
- Expand real KFM compatibility before chasing many third-party characters.
- Keep SFF/SND/stage decoders resilient and progressively broader.
- Add compatibility profiles: `mugen-1.0`, `mugen-1.1`, `ikemen-go-scan`.

Acceptance:

- Official KFM can route at least idle/walk/crouch/jump/basic attacks/special input through real CMD + CNS data.
- Compatibility JSON explains every unsupported trigger/controller/file feature by count and location where possible.
- Parser coverage never implies runtime parity.

### Track B: Playable Runtime

Goal: keep the app playable at all times with native generated fighters and real imported characters where supported.

Major work:

- Keep Runtime Mode first-load playable with three local atlas-backed fighters and at least one native stage.
- Harden round flow, HUD, camera, hit pause, stun, guard, pushback, hitstop, power, and KO/time-over.
- Convert helpers, projectiles, explods, afterimages, and sounds into first-class runtime actors/events instead of debug-only side effects.
- Separate match world systems: command, state, physics, combat, pause, camera, audio, effects.

Acceptance:

- Local generated roster remains a stable fallback even when imported assets fail.
- Imported KFM and CodeFuMan have browser QA evidence for at least one routed attack each.
- Debug UI can explain current state, animation, command, hit, guard, target, helper/projectile/effect state.

### Track C: Creator Studio

Goal: turn the sandbox into a project workspace, not just a set of modes.

Major work:

- Make `project.json` the editor-facing source of truth.
- Keep `runtime-manifest/v0` as the compiled runtime contract.
- Add project dashboard, asset library, character studio, stage studio, module studio, build/export center, and runtime trace browser.
- Persist projects locally using browser storage first, then support folder/ZIP workspace import/export.
- Keep imported, generated, authored, converted, and runtime assets separated by provenance.

Acceptance:

- A project can be created, reopened, saved locally, compiled, playtested, and exported with diagnostics.
- Character Studio can preview AIR/action/collision data for imported and generated characters.
- Stage Studio can preview floor, bounds, starts, zoffset, BG layers, and unsupported stage features.
- Build Center shows exactly what will run, what is missing, and what was only partially supported.

### Track D: Asset Generation Pipeline

Goal: make original characters and stages usable as test assets and future authoring output.

Major work:

- Treat imagegen output as source material, not final runtime data.
- Use `sprite-atlas-builder` as the normalization, atlas, manifest, and motion-QA layer.
- Generate fresh sprite rows when motion/scale/pose is wrong; avoid "fixing" bad generated art only by cutting it differently.
- Keep contact sheets, GIF previews, browser screenshots, and motion-variation reports with the generated assets.
- Add a MUGEN-lite export path for generated characters: DEF/AIR/CMD/CNS-compatible templates plus atlas/runtime manifests.

Acceptance:

- Every generated fighter has idle, walk, crouch, jump, punch, kick, and hitstun rows with stable baseline/scale.
- Walk cycles show alternating legs and read as walking, not running.
- Crouch/jump frames do not inflate relative to idle.
- Runtime badge reports atlas QA honestly.

### Track E: Modular Engine Expansion

Goal: prove the engine can move beyond fighting games after the MUGEN/fighting MVP stabilizes.

Major work:

- Extract reusable core contracts from the fighting module only after they are proven by the MUGEN MVP.
- Add a platformer module vertical slice: tile/level model, platform physics, camera follow, collectible/hazard/enemy basics.
- Reuse the same project manifest, asset records, input actions, Three.js adapter, Web Audio adapter, debug bus, QA bridge, and Build Center.
- Keep platformer simulation independent from CNS, HitDef, rounds, helpers, and MUGEN command routing.

Acceptance:

- Platformer module can run a tiny authored level from a project manifest.
- Module Studio can switch between fighting and platformer configuration without changing renderer code.
- Shared core remains free of MUGEN-only runtime assumptions.

### Track F: QA, Fixtures, And Evidence

Goal: make progress hard to fake.

Major work:

- Keep official/external fixtures local under `.scratch/` and out of the repository.
- Maintain a fixture matrix: official KFM, KFM720, CodeFuMan, SF3 Ryu stress fixture, native generated roster, native stage, imported stage.
- Save machine-readable diagnostics and screenshots for every broad compatibility/frontend/rendering pass.
- Use the standard end-of-round checks: `pnpm test`, `pnpm typecheck`, `pnpm build`.

Acceptance:

- Every milestone has a QA folder with screenshots, diagnostics, and notes.
- Frontend/rendering changes are visually verified before being called done.
- Docs name residual risk and unsupported features plainly.

## Build Sequence

### Phase 0: Baseline Control

Purpose: keep the current playable app stable while planning expands.

Deliverables:

- One master construction plan.
- Current-state docs linked from README.
- QA evidence path for Studio, Runtime, Inspector, and generated roster.
- No claims of full MUGEN/IKEMEN compatibility.

Exit gate:

- README links the plan and acceptance gates.
- Existing Runtime/Inspector/Studio flows remain executable.

### Phase 1: Compiler Foundation

Purpose: stop growing runtime compatibility through ad hoc string parsing.

Deliverables:

- `src/mugen/compiler/RuntimeIr.ts`.
- `CommandCompiler`.
- `ExpressionCompiler`.
- `StateControllerCompiler`.
- `CompileReport`.
- UI/report fields for compiled vs recognized vs unsupported features.

Exit gate:

- Existing tests still pass.
- State Browser can show compiled operations separately from parsed controllers.
- Runtime can execute at least the current supported controller subset through IR for a known fixture.

### Phase 2: KFM Official Fixture Route Gate

Purpose: make one official character meaningfully playable through imported data.

Deliverables:

- Official KFM fixture QA script and docs.
- CMD `[State -1]` routing for common attacks and one special.
- Broader `HitDef`, guard, hit pause, hit stun, target memory, fall metadata, and get-hit flow.
- Sound event evidence for `PlaySnd` where SND payloads are decodable.

Exit gate:

- KFM can stand, walk, crouch, jump, perform at least one normal and one special, hit/guard the dummy, and export a session report.
- Browser QA proves sprites, boxes, states, commands, HUD, and debug panels.

### Phase 3: Actor Ownership Systems

Purpose: replace two-actor shortcuts with MUGEN-like runtime entities.

Deliverables:

- `MatchWorld`.
- `PlayerRuntime`, `HelperRuntime`, `ProjectileRuntime`, `ExplodRuntime`.
- `TargetSystem` beyond the current extracted partial target-memory and target-binding lifecycle subset.
- `PauseSystem` beyond the current extracted partial freeze/movetime/darken/poweradd subset.
- `AudioEventSystem` beyond the current extracted partial PlaySnd/StopSnd event telemetry.
- `EnvShakeSystem` beyond the current extracted partial EnvShake/FallEnvShake camera snapshot subset.
- `SpriteEffectSystem` beyond the current extracted partial SprPriority/PalFX/AfterImage snapshot subset.
- `ExplodSystem` beyond the current extracted partial non-colliding Explod actor lifecycle subset.
- `HelperSystem` beyond the current extracted partial visual Helper actor lifecycle subset.
- `ProjectileSystem` beyond the current extracted partial colliding Projectile actor lifecycle subset.
- `CombatResolver` beyond the current extracted partial contact/eligibility/override/guard/damage-result helper subset.
- Owner/root/parent metadata in snapshots.

Exit gate:

- Helpers/projectiles/explods can be inspected as first-class actors.
- Hit/guard/projectile/helper interactions report ownership and reason for result.

### Phase 4: Stage And Presentation Parity

Purpose: make imported stages and presentation effects more faithful.

Deliverables:

- Stage BG layer IR.
- Better `start`, `delta`, `tile`, `velocity`, `window`, `mask`, `layerno`, `trans`.
- BGCtrl first pass.
- Shadows/reflections/zoom/camera rules.
- FightFX/common effects plan.
- Web Audio channel model beyond the current snapshot-event adapter.

Exit gate:

- Imported stage reports separate parsed, rendered, animated, unsupported, and fallback layers.
- Stage camera/floor behavior is testable without visual guesswork.

### Phase 5: Studio MVP

Purpose: turn current Studio mode into a usable local project workspace.

Deliverables:

- Project Dashboard.
- Asset Library.
- Character Studio.
- Stage Studio.
- Runtime Debug Studio.
- Module Studio.
- Build Center.
- Local workspace import/export ZIP.
- Project-scoped reports under `build/reports`.

Exit gate:

- User can create/open/save/compile/playtest/export a local project without editing source files.
- Imported/generated/authored assets show provenance and validation state.

### Phase 6: Generated Character Authoring

Purpose: make original generated characters a real authoring pipeline.

Deliverables:

- Character concept brief model.
- Imagegen source capture.
- Sprite row regeneration workflow.
- Atlas normalization and QA report ingestion.
- Collision/action authoring surface.
- MUGEN-lite generated package export.

Exit gate:

- A new generated fighter can be created, visually reviewed, atlas-normalized, collision-authored, and played in Runtime Mode.

### Phase 7: IKEMEN Compatibility Profile

Purpose: avoid mixing MUGEN parity and IKEMEN extensions.

Deliverables:

- `ikemen-go-scan` profile.
- IKEMEN feature scanner for ZSS, Lua, extended stage/system features.
- Explicit unsupported-extension report sections.
- Research notes for rollback/netplay and 3D/model stages, without implementing them as MVP blockers.

Exit gate:

- IKEMEN-only content is classified clearly instead of failing as mysterious MUGEN data.

### Phase 8: Platformer Module Vertical Slice

Purpose: prove modular-engine direction after fighting contracts are stable.

Deliverables:

- Platformer project template.
- Level/tile asset model.
- Platformer runtime module.
- Shared Three.js rendering through snapshots.
- Platformer editor surface in Module Studio.

Exit gate:

- A tiny platformer scene runs from the same project/build system while sharing core contracts and avoiding MUGEN runtime dependencies.

## Interface Construction Plan

The UI should feel like a developer/game-creator workbench: dense, legible, fast to scan, and built around the active playtest/preview instead of marketing-style pages.

Screens to build:

| Surface | First Useful Version | Later Version |
| --- | --- | --- |
| Project Dashboard | Recent projects, templates, status badges, open/playtest actions | Search, tags, thumbnails, project health timeline |
| Asset Library | Character/stage/audio/effect table with provenance, source/runtime mapping, dependency graph, playtest-entry replacement, and validation | Batch import, diff, missing references, source replacement |
| Character Studio | AIR preview, timeline, Clsn boxes, action list, runtime state | Collision editing, command/state graph, generated sprite replacement |
| Stage Studio | Floor/bounds/start/zoffset/BG preview | BGCtrl timeline, parallax debugger, camera/zoom authoring |
| Runtime Debug Studio | Entities, commands, states, vars, hits, pauses, effects | Deterministic trace scrubber and breakpoint-like watches |
| Module Studio | Active/planned/missing modules and settings | Module SDK docs, custom module registration |
| Build Center | Project manifest, runtime manifest, reports, warnings, `export-bundle/v0` ZIP with browser-fetchable local assets, current-session imported source files, and checksums | Persisted source-package reassociation, fixture QA matrix, release checklist |

UI acceptance for each screen:

- The primary preview/playtest stays visible.
- Controls are compact and action-oriented.
- Unsupported/partial status is visible near the affected feature.
- Long reports are filterable, not just dumped into a scroll wall.
- Browser QA captures desktop and mobile/narrow states for any frontend change.

## Decision Order

When two good tasks compete, choose in this order:

1. Protect playable Runtime Mode.
2. Improve imported KFM/fixture compatibility.
3. Add compiler/runtime contracts that reduce future debt.
4. Improve debug/compatibility visibility.
5. Build Studio surfaces that expose already-real engine data.
6. Expand generated assets only with QA.
7. Start new genre modules only after shared contracts are proven.

## Explicit Non-Goals Until Later

- Full IKEMEN-GO parity.
- ZSS or Lua execution.
- Rollback/netplay.
- Full screenpack/motif engine.
- Full custom states/throws parity.
- Full stage BGCtrl/model-stage parity.
- Platformer production tooling before the fighting/MUGEN MVP is trustworthy.

These are future horizons, not blockers for the first usable private MVP.

## Definition Of Done For Any Milestone

A milestone is not done until it has:

- Code or docs implementing the promised scope.
- Compatibility labels at the right level: parsed, decoded, recognized, compiled, executed partial, executed parity, unsupported, or unknown.
- Unit tests for parser/compiler/runtime logic when code changes.
- Browser visual QA when UI, renderer, runtime visibility, or asset rendering changes.
- Updated docs naming remaining gaps.
- No commercial or third-party character assets committed to the repository.

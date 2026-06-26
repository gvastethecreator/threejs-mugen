# Construction Program

This document is the execution plan for turning `mugen-web-sandbox` into a usable, expandable Three.js game-engine foundation that starts with MUGEN / IKEMEN-GO compatibility and later grows into a creator studio plus other game modules. The broader operating map across engine, Studio, generated assets, QA evidence, and future modules lives in `docs/FULL_BUILD_PROGRAM.md`; the concrete backlog for implementation rounds lives in `docs/BUILD_EXECUTION_BACKLOG.md`.

It does not replace `docs/BUILD_PLAN.md`; it turns that plan into a build order with concrete gates.

## Product Promise

The project should become:

1. A playable local fighting runtime in Three.js.
2. A progressive MUGEN / IKEMEN-GO compatibility engine with honest coverage labels.
3. A creator studio for importing, generating, editing, inspecting, playtesting, and exporting projects.
4. A modular browser engine foundation that can later host platformer, beat-em-up, arena, or custom sprite games.

The first usable proof remains the fighting/MUGEN module. Other genres come after its contracts are stable.

## Non-Negotiable Rules

- Runtime first: the app must stay playable on first load.
- Imported compatibility must be labeled precisely: `Parsed`, `Decoded`, `Recognized`, `Compiled`, `Executed Partial`, `Executed Parity`, `Unsupported`, or `Unknown`.
- `src/mugen/*` stays renderer-independent. Three.js, Web Audio, and DOM code live in adapter layers.
- `project.json` is editor/source-preserving data. `runtime-manifest/v0` is compiled runtime data.
- Generated art is not accepted until it passes atlas normalization, visual review, and motion/scale QA.
- No third-party/commercial character assets are committed to the repo.
- Frontend, renderer, runtime-visual, or asset-rendering work closes with browser visual QA.

## Build Horizons

```txt
H0: Baseline playable sandbox
H1: MUGEN compatibility core
H2: Real actor/runtime ownership
H3: Presentation, stage, and audio parity
H4: Creator Studio MVP
H5: Generated character authoring
H6: IKEMEN compatibility profile
H7: Modular engine expansion
```

Each horizon must produce code or docs, tests where logic changes, visual QA where visible behavior changes, and updated compatibility notes.

## H0: Baseline Playable Sandbox

Goal: keep the current app stable while larger architecture work continues.

Must keep working:

- Runtime Mode opens directly into a playable match.
- Three local atlas-backed fighters remain selectable.
- At least one native stage renders.
- Keyboard/touch input, HUD, boxes, pause/step/speed/reset, KO/time-over, and debug panels work.
- Inspector loads local ZIP/folder fixtures without crashing.
- Studio Workbench/Assets/Inspector/Debug/Evidence/Modules/Build routes remain URL-addressable.

Acceptance:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- Browser screenshot of Runtime Mode.
- Smoke diagnostics from `window.__MUGEN_WEB_SANDBOX__`.

## H1: MUGEN Compatibility Core

Goal: make real MUGEN data drive runtime behavior through typed contracts instead of ad hoc raw-string execution.

Build order:

1. Finish typed compiler IR for commands, trigger expressions, and controllers.
2. Move current raw-param controller behavior into small runtime systems.
3. Make compatibility reports derive from compiler/runtime session data.
4. Expand official KFM playability before chasing broad third-party coverage.
5. Preserve raw parser diagnostics and source locations for every skipped feature.

Primary fixtures:

- Official KFM.
- KFM720.
- CodeFuMan.
- SF3 Ryu demo as parser/report stress fixture.

Acceptance:

- KFM can stand, walk, crouch, jump, perform at least one normal and one special through real CMD `[State -1]` routing.
- A simplified `HitDef` can connect or guard and update session telemetry.
- Report export separates parsed, decoded, recognized, compiled, routable, executed, partial, and unsupported features.
- Browser QA proves sprites, boxes, commands, state numbers, HUD, and compatibility panels.

Do not build yet:

- ZSS/Lua execution.
- Rollback/netplay.
- Full screenpack/motif parity.
- Full custom-state/throw parity.

## H2: Real Actor And Runtime Ownership

Goal: replace the current two-actor shortcuts with MUGEN-like world ownership.

Build order:

1. Introduce `MatchWorld` as the integration boundary.
2. Split players, helpers, projectiles, explods, targets, pause, combat, camera, and audio events into systems.
3. Promote helpers/projectiles/explods from side effects into inspectable actors.
4. Add parent/root/owner metadata to snapshots and compatibility session reports.
5. Route hit/guard/projectile/helper decisions through a `CombatResolver`.

Near-term systems:

- `PauseSystem`
- `AudioEventSystem`
- `EnvShakeSystem`
- `SpriteEffectSystem`
- `ExplodSystem`
- `HelperSystem`
- `ProjectileSystem`
- `TargetSystem`
- `CombatResolver`

Acceptance:

- Helpers, projectiles, and explods appear as first-class debug entities.
- The runtime can explain why a hit connected, guarded, whiffed, was overridden, or was rejected.
- Ownership metadata survives attacker-owned custom-state paths and `SelfState` returns for supported cases.

Do not build yet:

- Full helper VM with all redirects.
- Full projectile-vs-projectile priority/trade/cancel parity.
- Full throw/custom-state parity.

## H3: Presentation, Stage, And Audio Parity

Goal: make stage/render/audio behavior testable and closer to MUGEN/IKEMEN without moving engine logic into Three.js.

Build order:

1. Compile stage BG definitions into a renderer-independent Stage BG IR.
2. Improve bounds, floor, zoffset, start positions, tiling, delta/parallax, velocity, mask/window, and layer rules.
3. Add first BGCtrl support as a parsed/compiled/rendered/unsupported report.
4. Expand audio from snapshot events into a channel model.
5. Add FightFX/common effect resolution plan before relying on hardcoded animation fallbacks.

Acceptance:

- Imported stage reports separate parsed, rendered, animated, fallback, and unsupported layers.
- Stage camera/floor/parallax behavior has unit tests for projection math plus browser screenshots.
- Audio diagnostics show channel, group/index, source actor, and stop behavior for supported cases.

Do not build yet:

- Full IKEMEN 3D/model stages.
- Exact motif/screenpack rendering.
- Complex global presentation scripting.

## H4: Creator Studio MVP

Goal: turn the app into a local project workspace without hiding engine limitations.

UI surfaces:

- Project Dashboard.
- Asset Library.
- Character Studio.
- Stage Studio.
- Runtime Debug Studio.
- Module Studio.
- Build Center.
- QA / Evidence Browser.

Build order:

1. Make `project.json` the editable source of truth.
2. Keep `runtime-manifest/v0` as the compiled playtest/export artifact.
3. Add Asset Library as a dense table of characters, stages, audio, effects, provenance, and validation states.
4. Build Character Studio around existing AIR/state/command/collision inspection.
5. Build Stage Studio around existing stage preview, bounds, starts, floor, zoffset, BG layers, and reports.
6. Build Build Center around manifest compile, warnings, report export, and package export.
7. Add local workspace import/export ZIP.

Acceptance:

- A project can be created, opened, saved locally, compiled, playtested, and exported without editing source files.
- Imported, generated, authored, converted, and runtime assets show provenance.
- Reports are filterable by compatibility level and linked to affected assets/features.
- The central playtest/preview remains visible in the primary workflow.

Do not build yet:

- A complex database-backed editor.
- Advanced timeline/collision editing before preview and provenance are stable.
- Platformer editor tools.

## H5: Generated Character Authoring

Goal: make original generated fighters real runtime assets, not fragile image experiments.

Build order:

1. Add a character concept brief model.
2. Capture imagegen source prompts and generated-sheet provenance.
3. Use `sprite-atlas-builder` for atlas normalization and manifest generation.
4. Regenerate bad motion rows as new art; do not pretend cropping fixes bad animation.
5. Add scale/baseline checks for crouch, jump, hitstun, and attacks.
6. Add Character Studio collision/action authoring for generated assets.
7. Export MUGEN-lite DEF/AIR/CMD/CNS templates plus runtime atlas manifests.

Acceptance:

- A new generated fighter has idle, walk, crouch, jump, punch, kick, and hitstun rows.
- Walk reads as walking, with alternating legs and stable cadence.
- Crouch/jump do not inflate relative to idle.
- Runtime badges show atlas QA status honestly.
- Contact sheets, GIFs, browser screenshots, and motion reports are preserved.

## H6: IKEMEN Compatibility Profile

Goal: classify IKEMEN features without mixing them into MUGEN parity.

Build order:

1. Add `ikemen-go-scan` profile detection/reporting.
2. Scan for IKEMEN-only config, ZSS, Lua, extended stage/system features, and profile-specific params.
3. Add report sections for unsupported IKEMEN extensions.
4. Research source behavior before implementing any extension.

Acceptance:

- IKEMEN-only content is classified clearly instead of failing as mysterious MUGEN data.
- MUGEN 1.0, MUGEN 1.1, and IKEMEN-compatible reports remain separate.

Do not build yet:

- ZSS VM.
- Lua mode scripting.
- Rollback/netplay.

## H7: Modular Engine Expansion

Goal: prove the engine can support another game genre after the fighting module is trustworthy.

First module: platformer vertical slice.

Build order:

1. Extract reusable core only after fighting runtime contracts are proven.
2. Define shared module contracts: input actions, asset records, tick loop, snapshots, debug bus, QA bridge, render/audio adapters.
3. Add a platformer project template.
4. Implement level/tile model, platform physics, camera follow, collectible/hazard/enemy basics.
5. Expose platformer configuration through Module Studio.

Acceptance:

- A tiny platformer scene runs from the same project/build system.
- The Three.js adapter consumes snapshots without knowing platformer rules.
- MUGEN-only concepts such as CNS, HitDef, rounds, helpers, and command routing stay out of shared core.

## Interface Program

The interface should feel like a developer/game-creator workbench: dense, inspectable, and fast to scan.

Priority order:

1. Runtime / Playtest.
2. Inspector.
3. Compatibility / Evidence Browser.
4. Asset Library.
5. Character Studio.
6. Stage Studio.
7. Build Center.
8. Module Studio.
9. Project Dashboard polish.

Design rules:

- Keep the active preview/playtest central.
- Avoid marketing/landing-page composition.
- Prefer compact controls, tabs, tables, filters, badges, and explicit warnings.
- Show unsupported/partial state next to the affected feature.
- Long reports must be filterable.
- URL-backed navigation remains important for QA and repeatable bug reports.

## Active Backlog Order

When choosing the next implementation round, use this queue:

1. Finish extracted runtime systems currently in progress.
2. Reduce `PlayableMatchRuntime` raw controller side-effect paths.
3. Improve KFM imported-runtime playability and visual QA.
4. Promote helpers/projectiles/explods/targets to inspectable world actors.
5. Add Compatibility/Evidence Browser filtering.
6. Build Asset Library and Build Center around real `StudioModel` data.
7. Add Character Studio preview tools before editing tools.
8. Add Stage Studio preview/report tools before BGCtrl authoring.
9. Integrate generated-character authoring only through imagegen + sprite-atlas-builder + QA.
10. Start platformer only after shared contracts have survived the fighting MVP.

## Definition Of Usable

The project is usable when a developer can:

1. Run `pnpm install` and `pnpm dev`.
2. Play a local match immediately.
3. Load a real MUGEN character package.
4. Render decoded sprites or see a clear rendering failure reason.
5. Inspect animations, states, commands, hitboxes, hurtboxes, runtime state, and unsupported features.
6. Export a compatibility report that points to the next engine task.
7. Create or reopen a Studio project, compile it, playtest it, and export its reports without editing source files.

## Review Consensus

Two review lenses should keep guiding the program:

- Runtime architecture lens: do not grow controller parity inside a monolithic match loop.
- Product/UX lens: do not build Studio screens that imply maturity the engine has not earned.

That is the practical balance: a larger horizon, but built through small gates that are hard to fake.

# Full Build Program

This is the operating plan for building every agreed direction without losing the playable prototype:

1. A progressive MUGEN / IKEMEN-GO compatibility port in TypeScript and Three.js.
2. A local Creator Studio for importing, generating, inspecting, editing, playtesting, and exporting projects.
3. A generated-asset pipeline for original fighters and stages using image generation plus atlas QA.
4. A modular browser game-engine foundation that can later support platformers, beat-em-ups, arena games, and custom sprite projects.

The plan is intentionally staged. The project should get more capable through gates that are hard to fake: runtime behavior, debug evidence, compatibility labels, tests, and browser screenshots.

For the actionable execution backlog that sequences these lanes into concrete campaigns, usable-MVP gates, dependencies, blockers, and first implementation rounds, use `docs/BUILD_EXECUTION_BACKLOG.md`. For the practical wave map that connects each approved idea to dependencies, evidence gates, anti-claims, and the next rounds, use `docs/CONSTRUCTION_WAVES.md`.

## Reference Baseline

Primary references should stay close to the architecture:

- Elecbyte MUGEN docs for DEF, AIR, CMD, CNS, state controllers, SFF, SND, and stage semantics.
- Ikemen GO docs/source for modern successor behavior, MUGEN 1.1 compatibility expectations, Lua/ZSS boundaries, netplay, and extended presentation features.
- Current repo contracts: `project.json`, `runtime-manifest/v0`, compiler IR, runtime snapshots, Three.js render adapter, Web Audio adapter, and DOM QA bridge.

Ikemen GO is a reference engine, not a porting shortcut. This project remains browser-local, TypeScript-native, renderer-independent in `src/mugen/*`, and Three.js-backed at the adapter layer.

## Build Lanes

Each lane should land in small, playable increments. The campaign board in `docs/BUILD_EXECUTION_BACKLOG.md` is the source of truth for what is active now, what each lane unlocks, and what must stay out of scope until the runtime is more trustworthy.

### Lane A: Compatibility Engine

Goal: real MUGEN data drives runtime behavior through progressively compiled contracts.

Owns:

- Package loading and virtual file resolution.
- DEF/AIR/CMD/CNS/ST/SFF/ACT/SND/stage parsers.
- MUGEN 1.0, MUGEN 1.1, and IKEMEN-compatible profiles.
- Command, expression, trigger, and controller IR.
- Compatibility reports with source locations and support levels.

Gate:

- Official KFM routes idle, walk, crouch, jump, one normal, and one special through real CMD + CNS data, with exported evidence.

### Lane B: Playable Runtime

Goal: the app always opens into a playable match while compatibility work grows.

Owns:

- Match loop, input, CPU dummy, HUD, round flow, pause/step/reset/speed.
- Actor state, physics, combat, guard, hit pause, hit stun, power, life, KO/time-over.
- Helpers, projectiles, explods, targets, pause, audio, env shake, sprite effects, and combat as inspectable systems.
- Runtime session telemetry and explainable hit/guard/whiff/override results.

Gate:

- Native generated roster remains playable, and imported KFM/CodeFuMan can execute at least one routed attack in browser QA.

### Lane C: Creator Studio

Goal: turn the sandbox into a local project workspace.

Owns:

- Project Dashboard.
- Asset Library.
- Character Studio.
- Stage Studio.
- Runtime Debug Studio.
- Module Studio.
- Build Center.
- QA / Evidence Browser.

Gate:

- A user can create/open/save/compile/playtest/export a project locally, and every asset shows provenance plus validation status.

### Lane D: Asset Generation Pipeline

Goal: original generated characters and stages become reliable runtime assets, not fragile one-off images.

Owns:

- Character concept briefs.
- Image generation prompts and provenance.
- Sprite sheet regeneration when motion/scale/pose is wrong.
- `sprite-atlas-builder` normalization, manifest generation, contact sheets, GIFs, and motion/scale QA.
- Collision/action authoring for generated assets.
- MUGEN-lite export templates and runtime atlas manifests.

Gate:

- A generated fighter has idle, walk, crouch, jump, punch, kick, hitstun, stable baseline/scale, walking leg alternation, collision boxes, and browser playtest evidence.

### Lane E: Presentation And Stage Parity

Goal: imported stages, effects, audio, camera, and presentation become testable systems.

Owns:

- Stage BG IR.
- Bounds, floor, zoffset, start positions, delta/parallax, tiling, velocity, masks, windows, and layers.
- BGCtrl first pass.
- FightFX/common effect resolution.
- Web Audio channel model and sound diagnostics.

Gate:

- Imported stage reports separate parsed, rendered, animated, fallback, and unsupported layers; camera/floor/projection has unit and visual evidence.

### Lane F: Modular Engine Expansion

Goal: prove the engine can host another genre after the fighting module is trustworthy.

Owns:

- Shared module contracts: input actions, asset records, tick loop, snapshots, debug bus, QA bridge, render/audio adapters.
- Platformer vertical slice: level/tile model, physics, camera follow, collectible/hazard/enemy basics.
- Module Studio configuration for non-fighting modules.

Gate:

- A tiny platformer scene runs from the same project/build system without importing MUGEN-only CNS, HitDef, round, helper, or command-routing concepts into shared core.

## Dependency Map

```txt
Playable Runtime Baseline
  -> Compiler IR and compatibility reports
  -> Deterministic trace and replay evidence
  -> KFM playability gate
  -> Actor ownership systems
  -> Stage/audio/presentation parity
  -> Creator Studio MVP
  -> Generated character authoring
  -> IKEMEN compatibility profile
  -> Modular platformer slice
```

Parallel work is allowed only when contracts are clear:

- UI polish can proceed while runtime systems extract, but it should expose real data only.
- Asset generation can proceed while KFM compatibility grows, but generated assets must be labeled native/generated, not imported MUGEN support.
- Stage Studio can start with preview/reporting before BGCtrl editing exists.
- Platformer planning can proceed, but implementation waits until shared contracts survive the fighting MVP.

## Architecture Review Consensus

Two review lenses should govern the next rounds:

- Runtime lens: `PlayableMatchRuntime` is still the bottleneck. New parity work should move behind typed systems, `MatchWorld`, `ControllerOp`-style controller operations, or deterministic trace seams instead of adding more raw controller behavior to the monolith.
- Product lens: the Studio should reveal real project/runtime/asset truth before becoming a full editor. Preview, Asset Library, Build Center, and Evidence Browser come before advanced editing or multi-genre promises.

The shared verdict is direct: before "complete engine plus modular Creator Studio," the project needs a typed, traceable match world. That gives every later Studio, generated-asset, IKEMEN, and platformer feature something solid to stand on.

The 2026-06-25 review added three tighter constraints:

- Studio public IA should collapse toward `Playable Runtime` and `Creator Studio`; standalone Inspector remains transitional until Character/Stage Studio absorbs it.
- Build/export state must include source-package truth: `linked` when the ZIP/folder is mounted in the current session, `missing` after reopening only a manifest.
- Modular engine work should emerge by extraction after fighting contracts are proven. Do not introduce a generic SDK, ECS, or platformer runtime until MUGEN-specific concepts stop leaking into render/audio/debug contracts.

The latest review pass sharpened that into four implementation checks:

- Treat `MatchWorld` as unfinished until actor/effect lifecycle and ownership move behind it, not only through derived snapshots.
- Treat synthetic imported traces as plumbing gates. Fixture support claims need official fixture artifacts.
- Treat Studio screens as views over project/evidence truth; no `ok` state without linked evidence and no `blocked` state without next action.
- Treat generated fighters as native authored assets with their own QA chain, never as imported MUGEN compatibility proof.

## Critical Risk Gates

| Risk | Gate |
| --- | --- |
| Tick order drift | Deterministic replay trace with input script, states, controllers, hit/guard reasons, and final snapshot. |
| Raw controller leakage | New controller execution goes through typed IR or a documented `ControllerOp`; raw `controller.source` paths shrink each milestone. |
| Custom-state ownership | Fixture proves `p2stateno`, `p2getp1state`, owner-backed `ChangeAnim2`, `SelfState`, and ownership cleanup. |
| Actor ownership confusion | Players, helpers, projectiles, explods, and targets have actor ids plus owner/root/parent metadata in snapshots. |
| Report inflation | Parsed, decoded, recognized, compiled, routable, executed partial, executed parity, unsupported, and unknown remain separate. |
| Studio false confidence | Editors cannot persist a change unless `project.json -> runtime-manifest/v0 -> playtest/export` can prove or warn about it. |
| Asset/model coupling | MUGEN decode/model layers move toward renderer-independent pixel data; DOM canvas/texture materialization belongs in adapters. |
| Frontend/runtime visual regression | Browser visual QA remains mandatory for UI, renderer, runtime snapshot, stage, and asset-rendering changes. |

## Release Milestones

### M0: Stabilize The Current Playable Workbench

Scope:

- Keep Runtime, Inspector, and Studio URL modes working.
- Finish in-progress runtime system extractions.
- Keep docs honest and linked.
- Keep the standard QA path repeatable.

Done:

- `pnpm test`, `pnpm typecheck`, `pnpm build`.
- Runtime screenshot and smoke diagnostics.
- Docs name current partial systems and next cuts.

### M1: Runtime Trace And Compiler Hardening

Scope:

- Add deterministic replay trace capture for input, state changes, controller execution, combat decisions, and final snapshots.
- Introduce typed controller operations for the next side-effect families instead of growing raw `MugenStateController` execution.
- Make `CombatResolver` produce reason data that can feed reports and the debug UI.

Current status:

- `RuntimeTrace` now provides the first renderer-independent replay trace harness for scripted inputs, frame summaries, combat/runtime log events, final snapshots, and deterministic checksums.
- `evaluateRuntimeTraceGate` now converts runtime traces into explicit pass/fail evidence for actor source/kind, effect kind, routed states, executed states, executed controllers, executed typed operations, active commands, event categories, combat reasons, final actor state/control/life requirements, and simple final hit-fall metadata. This covers native traces, synthetic imported CMD/CNS traces, synthetic `ReversalDef` and `AttackMulSet`/`DefenceMulSet` operation gates, a synthetic `fall.*` metadata gate, a synthetic attacker-owned custom get-hit controller-flow gate, and optional local KFM fixture traces for `x -> 200`, target partial hitstun, `x -> 200 -> idle/control`, held-back guard, plus `D, DF, F, x -> 1000` when `.scratch/fixtures/kfm-official.zip` is available.
- `RuntimeTraceArtifact` now provides the first versioned JSON export envelope, `runtime-trace-artifact/v0`, for trace checksums, final actors/effects, script frames, events, and gate results.
- Studio Build can now export and preview a smoke `runtime-trace-artifact/v0` for the selected P1/P2/stage setup.
- Studio Evidence can now aggregate gate, asset, trace, compile, compatibility, and diagnostic records with all/attention/category filters, keep a bounded in-session trace artifact history, and expose that aggregate to QA automation as `window.__MUGEN_WEB_SANDBOX__.studioEvidence`.
- M1 is not complete yet: typed side-effect operations, richer combat reason payloads, replay-style trace diffing beyond the current persisted evidence/comparison/frame-scrubber cuts, CLI artifact export entrypoints, and broader imported fixture trace scripts still need to replace more raw runtime paths.

Done:

- A scripted match replay can be run, inspected, and compared without relying only on screenshots.
- New runtime compatibility work has a typed path or an explicit temporary raw-path debt note.

### M2: Official KFM Compatibility Gate

Scope:

- Improve CMD `[State -1]` routing.
- Expand expression and trigger compiler coverage.
- Execute a larger controller subset through typed IR.
- Improve HitDef, guard, hit velocity, target memory, and get-hit flow.

Done:

- Official KFM can stand, walk, crouch, jump, use one normal and one special through real data.
- Exported report separates parsed, decoded, compiled, routed, executed partial, and unsupported features.

### M3: MatchWorld And Actor Ownership

Scope:

- Introduce `MatchWorld` first as a behavior-preserving facade over the current tick.
- Promote players, helpers, projectiles, explods, targets, pause, combat, camera, and audio into systems.
- Preserve owner/root/parent metadata.

Current status:

- `MatchWorld` now exists as the public app/runtime facade and preserves current `PlayableMatchRuntime` behavior by delegation.
- `ActorSnapshot` now exposes `actorKind`, `ownerId`, `rootId`, and `parentId` for players, helpers, projectiles, and explods. Sprite ownership remains separate through `spriteOwnerId` so custom-state rendering can borrow owner animations without rewriting logical actor ownership.
- `RuntimeEffectActorWorld` now wraps the helper/projectile/explod store boundary for spawn, active-effect advance, presentation-effect advance, removal, snapshots, summaries, and reset while `MatchWorld` owns and injects it.
- M3 is not complete yet: effect tick/combat decisions, target ownership snapshots, helper-owned execution, and typed world-system ownership still need to move behind the facade.

Done:

- Debug UI shows first-class helper/projectile/explod/target actors.
- Combat reports why an interaction hit, guarded, whiffed, was overridden, or was rejected.

### M4: Stage, Camera, Audio, And Presentation

Scope:

- Compile stage layers into a renderer-independent IR.
- Add better parallax, tiling, layer, and BGCtrl coverage.
- Add audio channel model.
- Add FightFX/common effect resolution plan.

Done:

- Imported stage visual behavior has diagnostics, screenshots, and unsupported feature counts.

### M5: Creator Studio MVP

Scope:

- Project Dashboard.
- Asset Library.
- Character Studio preview.
- Stage Studio preview.
- Runtime Debug Studio.
- Module Studio.
- Build Center.
- Local project ZIP import/export.

Done:

- A project can be created, reopened, saved locally, compiled, playtested, and exported without editing source files.

### M6: Generated Character Authoring

Scope:

- Character concept brief model.
- Image generation provenance.
- Sprite atlas normalization and QA ingestion.
- Collision/action authoring.
- Runtime roster integration.
- MUGEN-lite package export.

Done:

- A newly generated fighter is playable, has QA artifacts, and shows atlas/motion status in the UI.

### M7: IKEMEN Compatibility Profile

Scope:

- Add profile scanner/reporting for IKEMEN-only features.
- Classify ZSS, Lua, extended stage/system features, and IKEMEN config.
- Research before implementing extensions.

Done:

- IKEMEN-only content is reported clearly instead of being confused with broken MUGEN parsing.

### M8: Platformer Module Slice

Scope:

- Add a platformer project template.
- Reuse shared project, asset, input, render, audio, debug, and QA contracts.
- Implement a small tile/level runtime and editor preview.

Done:

- A tiny platformer scene runs from `runtime-manifest/v0`-style project data through the same Three.js adapter.

## Studio Surface Construction

Build Studio surfaces in this order:

1. Runtime Workbench: central playtest, selected assets, warnings, and session evidence.
2. Asset Library: dense asset browser with provenance, validation state, and missing references.
3. Character Studio Preview: AIR timeline, frame inspector, sprite source, axis, Clsn1/Clsn2, command/state summary.
4. Stage Studio Preview: floor, bounds, starts, zoffset, layer list, stage report, camera preview.
5. Build Center: project manifest, runtime manifest, warnings, export package, report export.
6. Runtime Debug Studio: entity tree, command buffer, state/controller trace, target/projectile/helper/effect lists.
7. Module Studio: active/planned/missing modules, settings, module SDK notes.
8. Authoring Tools: collision editing, action editing, generated sprite replacement, stage layer editing.

Do not mix these into one giant debug page. The center preview/playtest should stay visible for workbench-style flows; long reports should move into filterable tables or evidence views.

## Studio IA Map

The Studio should be organized around the user's job, not internal engine folders.

| Surface | User Question | Current Surface | Future Route | First Useful Version |
| --- | --- | --- | --- | --- |
| Project Dashboard | What project am I working on, and can I play it? | `studio=workbench` | `studio=project` | Recent projects, templates, active entry, project health, playtest launch. |
| Asset Library | What assets are in this project, where did they come from, and are they valid? | Workbench asset summary | `studio=assets` | Dense table with type/source/status/report filters. |
| Character Studio | Can I inspect or fix this fighter? | `studio=inspector` for AIR preview | `studio=character` | AIR actions, frame timeline, sprite source, axis, Clsn1/Clsn2, command/state summary. |
| Stage Studio | Can I inspect or fix this stage? | Runtime/stage report panels | `studio=stage` | Floor, bounds, starts, zoffset, camera, layer list, stage report. |
| Runtime Debug Studio | Why did the match behave this way? | Runtime Debugger / Combat Debugger | `studio=runtime-debug` | Entity tree, state/controller trace, commands, targets, helpers, projectiles, explods, pause/effect/audio events. |
| QA / Evidence Browser | What proof do we have, and what is still unsupported? | Build surface/report export | `studio=evidence` | Compatibility filters by asset, feature, level, fixture, and runtime session. |
| Build Center | What will ship or run? | `studio=build` | `studio=build` | `project.json`, `runtime-manifest/v0`, warnings, report export, package export. |
| Module Studio | What engine modules are active or planned? | `studio=modules` | `studio=modules` | Active/planned/missing modules and module contract notes. |

Do not blend these jobs:

- Project management is not build output.
- Asset inventory is not character/stage editing.
- Runtime debug is not authoring flow.
- MUGEN import compatibility is not generated/original authoring.
- Generated source art is not an accepted runtime asset until atlas and motion/scale QA pass.
- Module architecture is not a promise that every future genre is already buildable.

## Studio Flow Scripts

These flows are product acceptance tests for the Studio:

1. Create a project: open Studio, choose a fighting template, see active roster/stage, save locally, reopen it.
2. Import a character: load ZIP/folder, resolve DEF files, inspect assets, see compatibility levels, add it to a project roster.
3. Review collisions: open Character Studio, choose an AIR action, scrub frames, inspect sprite, axis, Clsn1, Clsn2, and parser warnings.
4. Preview a stage: open Stage Studio, inspect floor/bounds/starts/zoffset/layers, see unsupported BG features near the layer list.
5. Build and export: compile `project.json` into `runtime-manifest/v0`, review warnings, export reports and package data.

## First Ten Implementation Cuts

Use this queue when choosing the next coding rounds:

1. Extend `CombatResolver` beyond helper math into structured reason payloads.
2. Add richer combat session reasons: hit, guard, whiff, rejected by HitBy/NotHitBy, redirected by HitOverride, reversed.
3. Expand the current `RuntimeTrace` harness from native replay checks into KFM/imported fixture replay checks with state/controller logs.
4. Move one tick-order section at a time behind `MatchWorld` without changing trace checksums.
5. Continue `ControllerOp`-style typed operations for critical side effects. First `HitDef`, `Target*`, `Pause`/`SuperPause`, `Projectile`, `Helper`, `Explod`, `HitFall*`, `FallEnvShake`, `ReversalDef`, `AttackMulSet`/`DefenceMulSet`, defender-owned default Common1-style state `5000` entry, stand get-hit `5000 -> 5001 -> 0`, bounded stand/crouch guard-hit `150 -> 151` and `152 -> 153`, required synthetic fall `5000 -> 5030 -> 5050`, required synthetic bounded recovery `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, required synthetic recovery input `5050 -> 5210 -> 0`, optional official KFM ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, optional official KFM lie-down/get-up completion `5110 -> 5120 -> 0`, optional official KFM air recovery-input completion `5050 -> 5210 -> 52 -> 0`, and optional official KFM ground recovery-input completion `5050 -> 5200 -> 5201 -> 52 -> 0` cuts exist; next candidates are deeper helper/projectile/explod lifecycle ownership, exact recovery thresholds/velocities, exact tick-order parity, exact guard-rule parity, broader recovery parity, or the next high-value raw controller family.
6. Expand the new actor identity metadata into a real actor registry behind `MatchWorld`, including targets, helper-owned execution, and parent/root relationships beyond visual effect snapshots.
7. Improve official KFM `[State -1]` command routing and one special input gate.
8. Add Compatibility / Evidence Browser filters to the UI.
9. Build Asset Library and Build Center over persisted asset records before advanced editors.
10. Build Character Studio and Stage Studio preview surfaces around existing AIR/action/collision/stage data.

## Evidence Gates

Every milestone closes with:

- Unit tests for parser/compiler/runtime logic changed in that round.
- `pnpm test`.
- `pnpm typecheck`.
- `pnpm build`.
- Browser visual QA for frontend, renderer, runtime snapshot, stage, or asset-rendering changes.
- Saved diagnostics under `.scratch/qa/<feature>/` when practical.
- Docs updated with current support level and residual gaps.

## Product Guardrails

- Runtime first: the app must remain playable on first load.
- Preview and evidence before editing: Studio tools should first reveal real state, then author it.
- Asset provenance always visible: imported, generated, authored, converted, and runtime outputs are different things.
- Generated sprites must be regenerated when pose/motion/scale is wrong; atlas slicing cannot rescue bad source motion.
- No unsupported feature disappears silently.
- No MUGEN-only concepts leak into shared engine core.

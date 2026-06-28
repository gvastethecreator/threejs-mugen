# Horizon Implementation Blueprint

This is the construction blueprint for all approved ideas: the MUGEN / IKEMEN-GO compatibility port, the playable Three.js sandbox, the Creator Studio, generated fighters/stages, IKEMEN profile work, and later non-fighting modules such as a platformer.

It does not replace `WORKPLAN.md`, `CONSTRUCTION_WAVES.md`, or `BUILD_EXECUTION_BACKLOG.md`. It is the cross-cutting orchestration map: what gets built, what it depends on, what proves it, and what remains blocked until earlier gates are real.

## Product Brief Lock

Build a local private game-creation workbench with two public modes:

| Mode | Purpose | First real proof |
| --- | --- | --- |
| Playable Runtime | Keep the project playable while engine compatibility grows. | A match opens with local fighters, a stage, controls, HUD, hitboxes, debug data, and smoke screenshots. |
| Creator Studio | Import, inspect, generate, validate, playtest, debug, build, and export local projects. | A project can be saved, reopened, compiled to `runtime-manifest/v0`, playtested, and exported with evidence. |

The current standalone Inspector remains useful during the transition, but its destination is `Creator Studio -> Character Studio / Data Inspector`.

Interface register: dense developer/game-creator workbench. No landing-page treatment, no decorative hero, no green badge without linked evidence.

## Current Code Anchors

The plan must build from real seams already present in the repo:

| Area | Current anchor | Role in the blueprint |
| --- | --- | --- |
| Studio source truth | `src/app/StudioModel.ts` | First `project.json` shape, asset records, gates, source packages, modules. |
| Runtime build truth | `src/app/ProjectCompiler.ts` | `runtime-manifest/v0`, active/planned/missing module classification. |
| Runtime boundary | `src/mugen/runtime/MatchWorld.ts` | Public runtime facade and actor registry path. Must become real lifecycle ownership over time. |
| Evidence harness | `src/mugen/runtime/RuntimeTrace.ts` | Deterministic trace, gate evidence, combat reasons, final actors, checksums. |
| Controller IR path | `src/mugen/compiler/ControllerOps.ts` | Typed controller-operation migration path away from raw CNS controller execution. |
| App shell | `src/app/App.ts`, `src/app/DebugPanel.ts` | Current Runtime, Inspector, Studio, QA bridge, and debug surfaces. |
| Asset pipeline | `scripts/build_character_from_imagegen_sheet.py`, `scripts/create_runtime_atlas_frames.py`, `public/characters/*` | Generated fighter normalization, atlas creation, and local roster proof. |
| QA gates | `scripts/qa_smoke.cjs`, `scripts/qa_traces.cjs` | Browser and trace closeout for visible/runtime changes. |

## Architecture Pressure Points

These are not failures; they are the places where the next construction rounds should deliberately reduce risk.

| Pressure point | Current truth | Construction response |
| --- | --- | --- |
| `MatchWorld` is still partly facade | It delegates to `PlayableMatchRuntime`, derives registry facts from snapshots, and now owns a `RuntimeEffectActorWorld` boundary for helper/projectile/explod stores plus active/presentation effect advance passes. | Move projectile combat cleanup, exact effect pause/tick ordering, target ownership snapshots, and more lifecycle decisions behind `MatchWorld` one slice at a time. |
| `PlayableMatchRuntime` is the integration hotspot | It still owns too much scheduler, input, physics, combat, controller execution, effect lifecycle, and round logic. | New behavior must prefer typed systems, `ControllerOp`, or world-owned services; raw additions need a follow-up extraction note. |
| `MugenSnapshot` is not the future generic snapshot | It is correct for the fighting module but contains MUGEN-specific state and actor assumptions. | Extract a later `GameSnapshot` only after fighting contracts prove which fields are actually shared. |
| `src/mugen` still exposes browser canvas/ImageBitmap in sprite paths | This blocks clean worker/CLI/test usage for deeper SFF and asset tooling. | Introduce renderer-independent pixel/palette records before expanding SFF parity. |
| `App.ts` is a transitional shell | It mixes Studio rendering, runtime orchestration, export, load/relink, package, and QA bridge concerns. | Extract Studio surfaces and orchestration around existing data contracts instead of a broad rewrite. |
| Synthetic traces can look stronger than they are | They prove plumbing and regressions, not official character parity. | Fixture claims need optional official/external artifacts; missing optional fixture means skipped, not passed. |
| Studio statuses are too light | Current records mostly expose `status`, `detail`, and `tags`. | Add evidence id, affected item, impact, severity, next action, and stale/missing-source state before richer editing. |
| Generated asset manifests are not provenance-complete | Current character assets have manifests and QA files, but no formal identity anchor or full source/runtime provenance contract. | Treat missing provenance, identity anchor, motion signoff, collision authoring, or playable trace as `warn`/`blocked`, not `ok`. |
| Stage assets lack the same QA rigor as characters | A generated stage image proves a visual asset, not floor/camera/layer/runtime correctness. | Add stage concept/provenance, layer report, camera/floor/bounds QA, screenshot evidence, and rendered/fallback/unsupported classification. |

## The Construction Spine

Every workstream attaches to this order:

```txt
Playable baseline
  -> deterministic trace evidence
  -> typed controller operations / runtime IR
  -> MatchWorld lifecycle ownership
  -> official KFM/Common1 compatibility gates
  -> stage/audio/presentation IR
  -> evidence-first Creator Studio MVP
  -> generated asset authoring
  -> IKEMEN profile scanner
  -> shared module contracts
  -> first platformer slice
```

Work may run in parallel only when it reads real data from earlier seams. It must not invent maturity the engine cannot prove.

## Normative Execution Contracts

The broad construction docs describe the horizon. These contracts constrain implementation details so every slice can be built without drifting into false claims:

| Contract | Owns |
| --- | --- |
| `COMPATIBILITY_PROFILES.md` | Profile split for native runtime, MUGEN 1.0/1.1, IKEMEN scan-only work, and future modules. |
| `CONTROLLER_SUPPORT_REGISTRY.md` | Controller support levels, typed operation evidence, ignored/unsupported params, and partial wording. |
| `TICK_ORDER_CONTRACT.md` | Frame order for input, command routing, controllers, pause, physics, combat, get-hit, animation, effects, and snapshots. |
| `FIXTURE_GOLDENS.md` | Required synthetic artifacts, optional official fixture artifacts, checksums, and update discipline. |
| `STAGE_COMPATIBILITY_MATRIX.md` | Imported stage parsing, modeling, rendering, fallback, unsupported features, and Stage Studio gates. |
| `GENERATED_ASSET_QA_CONTRACT.md` | Imagegen/sprite-atlas-builder provenance, regeneration rules, motion/scale/baseline QA, and collision/action requirements. |
| `MODULE_BOUNDARY_CONTRACT.md` | Shared-core vs fighting-module vs future-platformer boundaries and anti-leakage checks. |

When a future task touches one of these areas, update the relevant contract before claiming the slice is done.

## Accepted Ideas And Build Packages

| Idea | Build package | First implementation cut | Acceptance evidence | Blocked claim |
| --- | --- | --- | --- | --- |
| Fuller MUGEN runtime | Runtime Spine | Move more behavior through `ControllerOp`, trace gates, and systems. | `pnpm qa:trace` artifacts with executed operations and final actor evidence. | "Full MUGEN compatible." |
| Official KFM as template/gate | Fixture Compatibility | Complete official Common1 get-up/recovery after current `5110` lie-down proof. | Optional official KFM trace naming `5000 -> ... -> 5120 -> 0` when fixture exists. | "KFM works" without official fixture artifact. |
| IKEMEN-GO reference | IKEMEN Profile | Scanner/reporting for IKEMEN-only ZSS, Lua, config, stage/system features. | Report separates MUGEN 1.0, MUGEN 1.1, and IKEMEN-only recognized unsupported features. | ZSS/Lua/rollback/netplay execution. |
| Creator Studio | Studio MVP | Evidence Browser persistence, Asset Library repair/relink, Build Center truth, Character/Stage previews. | Save -> compile -> playtest -> evidence -> export loop. | Advanced editing without proof loop. |
| Generated characters with imagegen | Generated Authoring | Prompt/provenance records, atlas QA ingestion, collision/action authoring. | Contact sheet/GIF, scale/motion report, browser screenshot, trace where playable. | Cropping bad art and calling it fixed. |
| Better sprite atlas quality | Asset QA | Regenerate bad walk/crouch/jump source rows, then normalize and validate. | Walk alternates legs; crouch/jump keep idle scale and baseline. | Green atlas badge without QA report. |
| Scenario/stage support | Presentation IR | Stage BG IR plus camera/floor/layer/audio diagnostics. | Screenshot and report classify rendered/fallback/unsupported layers. | "Stage supported" when layers silently disappear. |
| Modular engine future | Shared Modules | Extract shared project/input/assets/tick/snapshot/render/audio/debug/build/QA contracts after fighting gates. | Shared core imports no CNS, HitDef, round, helper, target, or command-routing concepts. | Generic SDK before fighting seams prove it. |
| Platformer horizon | Platformer Slice | Tiny project template and runtime after shared contracts are clean. | Platformer runs from project/build data through same Three.js/audio/debug/QA adapters. | Production platformer tooling now. |

## Workstream Plans

### WS1: Runtime Spine

Goal: make the match engine deterministic, inspectable, and less monolithic.

Build:

1. Keep `RuntimeTrace` artifacts stable for native, synthetic imported, and optional official fixtures.
2. Expand typed `ControllerOp` payloads for high-value controller families.
3. Move helper/projectile/explod/target/effect lifecycle ownership toward `MatchWorld`.
4. Add richer combat reason payloads for hit, guard, whiff, reject, override, reversal, and projectile interaction.
5. Keep raw `controller.source` paths visible as transition debt, not hidden support.

Gate:

- Runtime behavior changes require focused tests plus `pnpm qa:trace`.
- Trace checksum drift must be intentional and documented.

### WS2: Fixture Compatibility

Goal: prove partial imported compatibility through real characters instead of parser counts.

Build:

1. Make optional fixture absence explicit: skipped is not passed.
2. Tighten official KFM/Common1 recovery after the current synthetic `5050 -> 5210 -> 0` recovery-input branch, synthetic ground-recovery selection/velocity gate, plus optional official `5110 -> 5120 -> 0`, `5050 -> 5210 -> 52 -> 0`, and `5050 -> 5200 -> 5201 -> 52 -> 0` fixture gates by adding exact threshold tables/velocity math and exact tick-order checks.
3. Improve exact guard behavior beyond held-back guard plus bounded guard-hit routing.
4. Add KFM720 localcoord/scale and CodeFuMan SFF v1/PCX stress gates.
5. Keep SF3 Ryu-style third-party packages as parser/report stress until a targeted runtime slice exists.

Gate:

- A fixture claim must name the artifact, executed states/controllers, support level, and remaining gaps.
- Synthetic traces prove plumbing only; they do not prove fixture parity.

### WS3: Stage, Audio, And Presentation

Goal: make presentation testable without moving game logic into Three.js.

Build:

1. Compile parsed stage BG data into a renderer-independent Stage BG IR.
2. Add camera, floor, bounds, zoffset, localcoord, and player start diagnostics.
3. Classify delta, parallax, tiling, velocity, window, mask, layer, and BGCtrl features.
4. Expand SND/Web Audio into source actor, channel, group/index, decode, play, and stop records.
5. Add FightFX/common effect lookup before relying on hardcoded fallback effects.

Gate:

- Imported stage/audio reports must distinguish rendered/decoded, animated, fallback, partial, unsupported, and missing.
- Visible presentation changes require browser visual QA.

### WS4: Creator Studio MVP

Goal: make the app a local project workspace without lying about engine readiness.

Build surfaces in this order:

1. Studio status contract: each gate/asset/build row has status, severity, evidence id, affected item, impact, next action, and stale/missing-source state.
2. Evidence Browser: persisted traces, filters, comparison, stale-source warnings, affected asset links.
3. Asset Library: provenance, source/runtime map, dependency graph, relink/replace/regenerate actions.
4. Build Center: one readiness authority, source-package truth, export package, checksums, blocked/exportable state.
5. Runtime Debug Studio: selectable actors, commands, states, controllers, targets, helpers, projectiles, explods, pause/audio/effects.
6. Character Studio Preview: DEF/AIR/SFF/CMD/CNS/SND summary, AIR timeline, sprite/frame/axis, Clsn1/Clsn2, related evidence.
7. Stage Studio Preview: stage report, floor, bounds, starts, zoffset, camera, layers, unsupported features.
8. Project Dashboard: templates, recent projects, health, playtest entry, only after the project loop is coherent.

Gate:

- Every status (`ok`, `partial`, `warn`, `blocked`, `unsupported`) must point to evidence, affected item, impact, and next action.
- Build/export cannot be `ok` when source packages, checksums, QA records, collision authoring, or playable traces are missing for required outputs.
- Visible Studio work requires browser visual QA before closure.

### WS5: Generated Asset Authoring

Goal: make original generated fighters/stages repeatable project assets.

Pipeline contract:

```txt
concept brief
  -> identity anchor
  -> imagegen source rows / sheets
  -> extraction / matte / alpha checks
  -> atlas composition
  -> visual curation and signoff
  -> motion / scale / baseline QA
  -> collision / action authoring
  -> Studio ingestion
  -> runtime trace and browser screenshot
```

Build:

1. Add concept brief records for generated characters and stages.
2. Store identity anchors, imagegen prompts, source rows/sheets, output paths, tool versions, and checksums.
3. Regenerate bad source rows when walk, pose, baseline, or scale is wrong.
4. Normalize through `sprite-atlas-builder` and store atlas manifests/checksums.
5. Ingest contact sheets, GIFs, scale checks, baseline checks, pose profiles, and motion reports for more than `walk-forward`.
6. Add Character Studio collision/action authoring placeholders tied to atlas frames.
7. Add Stage Studio concept/provenance, floor, bounds, camera, layer, and screenshot QA for generated stages.
8. Export runtime atlas manifests and MUGEN-lite DEF/AIR/CMD/CNS templates.

Gate:

- One generated fighter must have idle, walk, crouch, jump, punch, kick, hitstun, stable baseline, stable scale, collision boxes, browser screenshot, and trace where playable.
- The `ok` path requires no open visual/motion warnings unless there is explicit visual signoff linked to the asset.
- Generated assets are native/authored proof, never imported MUGEN compatibility proof.

### WS6: IKEMEN Profile Scanner

Goal: classify IKEMEN content before execution.

Build:

1. Add a profile layer: `mugen-1.0`, `mugen-1.1`, `ikemen-go-scan`.
2. Detect ZSS, Lua, IKEMEN config, extended triggers/controllers, stage/system/motif features.
3. Report recognized unsupported vs. unknown features separately.
4. Link research notes to exact Ikemen-GO docs/source before implementing any extension.

Gate:

- IKEMEN-only content is counted and explained without being called broken MUGEN.
- ZSS/Lua/rollback/netplay stay blocked.

### WS7: Modular Engine And Platformer Slice

Goal: prove the engine can host another genre only after the fighting module earns clean contracts.

Build:

1. Extract shared contracts for project, asset, input, tick, snapshot, render, audio, debug, build, and QA.
2. Add module descriptors and settings schemas.
3. Keep Module Studio read-only until one non-fighting module runs.
4. Add a tiny platformer template with level/tile data, platform collision, camera follow, collectible, hazard, and one enemy.
5. Ensure the Three.js adapter consumes snapshots without knowing whether the module is fighting or platformer.

Gate:

- Shared core must not import CNS, HitDef, round, helper, target, or MUGEN command-routing concepts.
- Platformer smoke cannot break fighting smoke/trace.

## Studio Visual Planning

Before a major Studio UI rebuild, generate or sketch three visual directions and choose one. These are planning contracts, not shipped UI by themselves.

| Direction | Use for | Must preserve |
| --- | --- | --- |
| Command Center / Evidence-First | Global Studio shell, Build, Evidence, Runtime Debug. | Central playtest/preview, left navigation, right inspector, bottom trace/log strip. |
| Asset Repair Workbench | Assets, Build blockers, source relink, generated regeneration. | Dense asset browser, selected detail, dependency/source map, QA status, repair actions. |
| Character Authoring Timeline | Character Studio and generated fighter authoring. | AIR/action timeline, sprite preview, axis/Clsn overlays, CMD/CNS evidence, atlas QA/provenance. |

Recommended blend: Concept 1 as the global shell, Concept 2 for Assets/Build/Evidence flows, Concept 3 for Character Studio. Module Studio stays restrained and read-only until a non-fighting slice exists.

## Construction Milestones For The Full Approach

This milestone map is the build plan for all accepted ideas. It keeps the playable fighting sandbox as the regression anchor while the Studio, generated assets, IKEMEN scanner, and later module system grow around the same evidence chain.

| Milestone | Build | Must ship | Depends on | Acceptance gate |
| --- | --- | --- | --- | --- |
| M0 | Baseline playable lock | Three.js match, at least three local fighters, one stage, controls, HUD, debug overlay, smoke route, trace route. | Current project state. | App opens directly into a playable match; smoke and trace artifacts can be produced. |
| M1 | Runtime evidence kernel | RuntimeTrace artifacts with script frames, checksums, gate requirements, actor/effect identity, lifecycle events, target links, combat reasons, and final snapshots. | M0. | A failed gate names exact missing evidence; a passing gate can be inspected in Studio and JSON. |
| M2 | Typed MUGEN compatibility spine | CMD/CNS compiler IR, typed ControllerOp migration, support registry, bounded raw-controller debt, KFM/Common1 fixture gates. | M1. | Claims are fixture-backed: parsed, compiled, routed, executed partial, unsupported, and unknown are separate. |
| M3 | MatchWorld ownership | World-owned helper/projectile/explod/target/effect lifecycle slices, tick-order evidence, no hidden side effects in renderer/UI. | M1-M2. | Debug Studio and trace artifacts show owner/root/parent/lifecycle facts; checksum drift is intentional or absent. |
| M4 | Stage, audio, and presentation IR | Stage BG IR, floor/camera/bounds/zoffset diagnostics, SND/Web Audio event records, FightFX/common-effect lookup plan. | M1-M3. | Reports classify rendered, decoded, animated, fallback, partial, unsupported, and missing without silent failure. |
| M5 | Creator Studio MVP | Project manifest, Asset Library, Evidence Browser, Build Center, Runtime Debug, Character Preview, Stage Preview, export bundle. | M1-M4. | Save -> compile -> playtest -> evidence -> export is possible; every status has evidence, impact, and next action. |
| M6 | Generated authoring pipeline | Imagegen/source provenance, identity anchors, sprite-atlas QA, motion/scale/baseline reports, collision/action authoring, playable generated fighter trace. | M5. | Bad source motion is regenerated, not cropped; generated assets are native/authored proof, not imported compatibility proof. |
| M7 | IKEMEN profile scanner | `ikemen-go-scan` profile, ZSS/Lua/config/stage/system feature detection, recognized-unsupported and unknown reports. | M2 plus report model from M5. | IKEMEN-only content is visible and counted without claiming execution support. |
| M8 | Shared module contracts and first platformer slice | Generic project/input/asset/tick/snapshot/render/audio/debug/build/QA contracts, module descriptors, tiny platformer scene. | M5-M7 plus import-boundary proof. | Shared core imports no CNS, CMD, HitDef, Common1, round, helper, target, or MUGEN command-routing concepts. |

The milestones are intentionally sequential for claims, not for all work. Research, UI sketches, or scanner/report-only work can run early when they read current truth and keep blocked labels. Runtime execution, editing, export, and module claims cannot jump their dependency gate.

### Parallel Lanes

Work can run in parallel only under these limits:

| Lane | Can move early | Must wait |
| --- | --- | --- |
| Product/UI planning | Studio sketches, IA, panel contracts, evidence-first layout choices. | A large UI rewrite waits until it binds to real project/runtime/evidence data. |
| Generated assets | Concept briefs, identity anchors, source regeneration experiments, atlas QA experiments. | Green Studio asset status waits for provenance, QA, collisions, and playable evidence. |
| IKEMEN research | Source notes, feature inventory, scanner schema, unsupported labels. | ZSS/Lua/netplay/runtime execution waits for the MUGEN spine. |
| Modular engine | Boundary notes, import-leak checks, candidate shared interfaces. | Platformer runtime waits for Studio/Build/Evidence and fighting regression gates. |
| Fixtures | Optional official/external fixture packaging and skipped-state reporting. | Compatibility claims wait for actual local fixture artifacts. |

### Milestone Scheduling

The practical build order should be:

1. Close one runtime/evidence cut at a time until M1-M3 are dependable.
2. Move Studio from diagnostic tabs into a trust workflow while M4 presentation diagnostics become real.
3. Use Studio Build and Evidence as the authority before adding generated authoring actions.
4. Add IKEMEN scanner work as report-only once profile labels and unsupported feature records are stable.
5. Extract shared contracts only after the fighting module can prove what is truly generic.
6. Build the first platformer as a contract proof, not as a second full game engine.

If a task cannot name its artifact, screenshot, trace, fixture, report, or import-boundary check, it is not ready for implementation.

## First Twelve Implementation Rounds

This is the immediate sequence for building all ideas without losing control:

1. Tighten official KFM/Common1 recovery with exact threshold tables/velocity math and exact tick-order evidence after the current synthetic `5050 -> 5210 -> 0` recovery-input branch, synthetic ground-recovery selection/velocity gate, plus optional official `5110 -> 5120 -> 0`, `5050 -> 5210 -> 52 -> 0`, and `5050 -> 5200 -> 5201 -> 52 -> 0` fixture gates.
2. Deepen `MatchWorld` lifecycle ownership for helper/projectile/explod/target/effect actors.
3. Improve exact guard-rule parity and trace evidence.
4. Harden the Studio status model so gates/assets/build rows expose evidence, affected item, impact, severity, next action, and stale/missing-source state.
5. Persist Studio Evidence history and add artifact comparison/stale-source warnings.
6. Expand source-package relink with persistent source metadata where browser APIs allow it.
7. Add generated asset provenance records, identity anchors, atlas QA ingestion, and collision/action authoring placeholders.
8. Add Character Studio Preview over current imported/generated character data.
9. Add Stage Studio Preview over current stage reports and stage BG diagnostics.
10. Build a first IKEMEN profile scanner/report section.
11. Define shared module contracts from proven fighting seams.
12. Start a tiny platformer template only after shared contracts pass import-boundary review.

## Definition Of Done

| Task type | Minimum closeout |
| --- | --- |
| Parser/compiler | Focused unit tests, `pnpm test`, support docs if labels changed. |
| Runtime/controller/combat/tick | Focused tests, `pnpm qa:trace`, artifact inspection, docs. |
| Type/API/build/package | `pnpm typecheck`, `pnpm build`, schema/package docs. |
| UI/renderer/stage/sprite/debug | Browser visual QA, preferably `pnpm qa:smoke`, screenshots and diagnostics. |
| Studio data surface | QA bridge fields, linked evidence, save/reopen behavior when persistent. |
| Generated assets | Prompt/provenance, atlas QA, contact sheet/GIF, visual QA, trace when playable. |
| IKEMEN scanner | Fixture/report tests, unsupported/unknown labels, source references. |
| Modular engine | Import-boundary proof, fighting regression, platformer smoke when implemented. |

## Explicit Anti-Claims

Do not say these until the matching gate exists:

- Full MUGEN compatible.
- IKEMEN supported when only scanning exists.
- KFM works when only synthetic traces pass.
- Generated fighter fixed when source art was cropped instead of regenerated.
- Stage supported when layers silently fallback or disappear.
- Exportable when source packages are missing or checksums are absent.
- Modular engine done before a non-fighting scene runs through shared contracts.

## Planning Decision

Build everything, but through one evidence chain:

```txt
runtime truth -> project truth -> asset truth -> evidence truth -> authoring -> export -> modules
```

That keeps the project ambitious without turning it into disconnected demos.

# Master Construction Plan

This is the single planning map for building every agreed direction without turning the project into several disconnected prototypes.

For the approved scope lock, see `APPROVED_HORIZON_PLAN.md`. For the current execution ledger, use `WORKPLAN.md`. For the practical wave-by-wave construction map, use `CONSTRUCTION_WAVES.md`. For architectural decisions that constrain implementation, use `ARCHITECTURE_DECISIONS.md`. This document remains the deeper release train and workstream map.

The project horizon is broad:

1. A progressive MUGEN / IKEMEN-GO compatibility port in TypeScript.
2. A playable Three.js fighting runtime that stays usable at every step.
3. A local Creator Studio for projects, assets, evidence, preview, build, and export.
4. A generated-asset pipeline using image generation plus sprite-atlas QA.
5. A modular browser game-engine foundation that can later host platformers, beat-em-ups, arena games, and custom sprite projects.

The construction order is deliberately narrower:

```txt
Playable runtime
  -> deterministic trace evidence
  -> typed controller operations
  -> MatchWorld actor ownership
  -> official KFM compatibility gate
  -> stage/audio/presentation parity
  -> evidence-first Creator Studio MVP
  -> generated authoring pipeline
  -> IKEMEN profile scanner
  -> modular engine slice
```

The central rule is simple: every new claim must be backed by runtime behavior, exported evidence, tests, and browser screenshots when visible behavior changes.

## Construction Release Train

This is the delivery plan for building every idea in one ordered program. The names are milestones, not release promises; each one must keep the app playable and leave evidence behind.

| Milestone | Build | Depends on | Acceptance gate |
| --- | --- | --- | --- |
| M0: Baseline lock | Keep Runtime, Inspector, Studio, generated roster, Rooftop Dojo, browser loader, and smoke/trace commands stable. | Current app. | Default match opens, Studio routes load, inspector upload still works, standard QA passes. |
| M1: Evidence kernel | RuntimeTrace, trace artifacts, combat reasons, typed-operation evidence, Studio Evidence ingestion. | Stable playable runtime. | A scripted match can prove routed commands, controller execution, combat result, final actors, and checksum. |
| M2: Compatibility compiler path | Command/trigger/controller IR, source locations, support labels, typed `ControllerOp` execution for high-value side effects. | M1. | Reports separate parsed, decoded, recognized, compiled, routable, executed partial, parity, unsupported, and unknown. |
| M3: MatchWorld ownership | Actor registry, owner/root/parent metadata, target/effect relationships, migration of helpers/projectiles/explods/targets behind world systems. | M1 and M2. | Runtime debug can show an actor tree; unchanged scripts keep deterministic checksums. |
| M4: Official fixture gate | Official KFM/KFM720, CodeFuMan, and SF3 Ryu stress matrix; KFM one normal, one special, hit/guard/get-hit/stand-progress/state-exit evidence. | M2 and M3. | KFM can perform the supported route from real CMD/CNS data and export proof of what ran vs. what is partial. |
| M5: Stage/audio/presentation parity | Stage BG IR, camera/floor/bounds/parallax/tiling layers, first BGCtrl classification, Web Audio channel diagnostics, FightFX/common effect plan. | M3. | Imported stage/audio reports show parsed/rendered/fallback/unsupported details with screenshots. |
| M6: Creator Studio MVP | Project Dashboard, Asset Library, Evidence Browser, Build Center, Character Preview, Stage Preview, Runtime Debug Studio. | M1 through M5 data contracts. | A project can be created/saved/reopened/compiled/playtested/exported locally with provenance and warnings. |
| M7: Generated authoring | Character briefs, imagegen provenance, sprite-atlas-builder normalization, motion/scale QA, collision/action authoring, MUGEN-lite/runtime export. | M6 project/assets surfaces. | One generated fighter is regenerated, validated, collision-authored, and playable without hiding bad art. |
| M8: IKEMEN profile scanner | Detect IKEMEN-only files/features, ZSS/Lua/config/stage/system extensions, separate profile reporting. | M2 reports and M4 fixture discipline. | IKEMEN content is classified separately from MUGEN 1.0/1.1 and never fails silently. |
| M9: Shared module contracts | Input action model, asset records, tick loop, snapshots, debug bus, QA bridge, render/audio adapters, module compile/runtime/editor hooks. | M6 and stable fighting contracts. | Shared core has no CNS/HitDef/round/helper leakage. |
| M10: Platformer vertical slice | Tiny platformer template, tile/level model, platform collision, camera follow, collectible, hazard, simple enemy, Module Studio preview. | M9. | A platformer runs from project/build data through the same Three.js/audio/debug/QA adapters. |

Each milestone closes with:

- logic validation: `pnpm test`, `pnpm typecheck`, `pnpm build`
- runtime evidence: `pnpm qa:trace` when runtime behavior changed
- visual evidence: browser or Playwright screenshots when UI, renderer, stage, sprite, or runtime presentation changed
- documentation sync: supported features, current status, and backlog labels updated before calling the milestone done

## Immediate Build Slices

The next practical construction order is:

1. Continue `MatchWorld` actor/effect ownership without checksum drift. First Target* extraction into `TargetSystem` exists, and `RuntimeEffectActorWorld` now wraps helper/projectile/explod stores behind a world-style contract; next ownership work should move effect tick/combat decisions and richer target snapshots through `MatchWorld`.
2. Done first cut: surface the actor registry in the Runtime Debugger and QA bridge.
3. Done first cut: add a Studio `Debug` surface for live `MatchWorld` actor registry, ownership index, and runtime snapshot facts. Next: selectable actor detail, filters, and trace/controller links.
4. Expand trace artifacts with richer reason and operation payloads so Studio Evidence can filter by controller family, actor owner, and combat result.
5. Add persisted Studio Evidence history and artifact comparison before adding advanced editors.
6. Build the Asset Library table over existing `StudioModel` records: character, stage, audio, effect, provenance, status, reports, and blocked warnings.
7. Build Build Center status around what runs, what is partial, what is blocked, and which exports are allowed.
8. Expand official KFM gates beyond the current hit/guard/partial guard-hit/partial-hitstun/fall-metadata/custom-get-hit/default get-hit/fall/bounce/lie-down/get-up/air-recovery-input/ground-recovery-input/state-exit cuts, bounded synthetic recovery-input branch, bounded synthetic actor-frame tick-order branch, bounded synthetic air-recovery velocity branch, and bounded synthetic ground-recovery selection/velocity branch into exact controller/VM tick-order parity, exact threshold tables/velocity math, broader recovery parity, and exact guard-rule evidence.
9. Add Stage Studio preview over current stage reports and then stage BG IR.
10. Add generated-fighter authoring records once Studio can display provenance and QA truth.
11. Add IKEMEN profile scanning after reports can keep MUGEN and IKEMEN claims separate.

## Current Position

The project is not starting from scratch. The current baseline already includes:

- Vite, TypeScript, Three.js, parser, runtime, and Studio foundations.
- Three generated local fighters and Rooftop Dojo as the native playable baseline.
- MUGEN package loading, DEF/AIR/CMD/CNS/SFF/SND/stage parser coverage at partial levels.
- Imported runtime routes for KFM-style fixtures.
- Runtime controller execution for a growing partial CNS subset.
- `MatchWorld` as an app-facing facade over `PlayableMatchRuntime`, with first actor registry/lifecycle evidence and a `RuntimeEffectActorWorld` boundary for helper/projectile/explod stores.
- Runtime trace artifacts and repeatable QA commands.
- A first Studio shell with Workbench, Assets, Inspector, Debug, Evidence, Modules, and Build surfaces.

The main gap is not ambition. The gap is consolidation: runtime behavior, compatibility labels, Studio surfaces, generated assets, and future modules must be built through one evidence chain instead of separate demos.

## Planning Consensus

Architecture/runtime review and product/UX review converge on the same direction:

- Do not grow a larger UI shell before the runtime can prove what it executes.
- Do not describe parser or decoder coverage as runtime compatibility.
- Do not let `PlayableMatchRuntime` absorb more raw controller behavior; move behavior into typed IR, controller operations, and world systems.
- Keep `src/mugen/*` renderer-independent; Three.js, Web Audio, and DOM remain adapters.
- Treat Studio as a workbench for playtest, evidence, assets, build, and preview first. Editing comes after those surfaces tell the truth.
- Keep modular engine work planned, but do not implement a platformer slice until the fighting runtime proves the shared contracts.
- Use `Playable Runtime` and `Creator Studio` as the eventual public product modes. The current standalone Inspector is transitional and should be absorbed into Character/Stage Studio.
- Build modularity by extraction from proven contracts. Avoid a generic SDK, ECS, or multi-genre runtime before KFM/runtime evidence forces the right boundaries.

The 2026-06-25 construction refresh accepts the full horizon but locks the truth labels:

- Near-term compatibility is partial MUGEN fixture support, not full MUGEN/IKEMEN parity.
- IKEMEN work begins as scanning/profile/reporting only.
- Studio work is evidence-first: Assets, Evidence, Build, Character/Stage Preview, Runtime Debug, then authoring.
- Generated assets are native/authored pipeline assets and never imported-compatibility proof.
- Platformer/module work waits until shared contracts are extracted from a trustworthy fighting runtime.

The latest subagent review adds these operating checks:

- Runtime review: `MatchWorld` must become a real lifecycle and ownership boundary, not only a derived registry over `PlayableMatchRuntime`.
- QA review: synthetic traces prove plumbing; official fixture traces are required for fixture-compatibility claims.
- Product/UX review: the Studio object model is `Project -> assets/sourcePackages/modules/entry/compatibility/evidence/buildOutputs`; screens are views into that object.
- Design review: the Studio register is a dense product workbench. No detached reports, no green badges without linked evidence.
- Modular review: shared core appears by extraction after fighting seams hold; platformer implementation waits for import-boundary proof.

## Workstream Order

### WS0: Baseline Control

Purpose: keep the local app playable while the bigger engine forms.

Build:

- Keep Runtime, Inspector, and Studio URL modes working.
- Keep Nova Boxer, Mira Volt, Rook Apprentice, and Rooftop Dojo playable.
- Keep `pnpm qa:smoke` as the repeatable browser gate.
- Keep docs honest about partial MUGEN and IKEMEN support.

Done when:

- Default match opens and plays.
- Inspector still loads local ZIP/folder packages without crashing.
- Studio Build and Evidence still expose project, runtime manifest, trace, and diagnostics.

### WS1: Runtime Trace And Combat Evidence

Purpose: make match behavior replayable and explainable before changing more controller semantics.

Build:

- Extend trace artifacts with structured combat reasons: `hit`, `guard`, `whiff`, `reject`, `override`, and `reversal`.
- Add gate failures that say exactly what evidence is missing.
- Export native, synthetic imported, and optional KFM traces through `pnpm qa:trace`.
- Feed the same trace artifacts into Studio Evidence.

Done when:

- A script can prove which frame routed a command, executed a controller, produced a hit/guard/whiff/reject, and ended in a deterministic final snapshot.
- Failed gates are specific enough to become implementation tasks.

### WS2: Typed Controller Operations

Purpose: reduce raw CNS controller execution and make compatibility levels honest.

Build:

- Move critical side effects into typed controller operations, starting with `HitDef`.
- Keep expanding typed operation coverage after the first `HitDef`, `Target*`, and `Pause`/`SuperPause` cuts.
- Expand compiler reports to separate recognized, compiled, executable, partial, no-op, unsupported, and invalid features.
- Keep raw `controller.source` paths only as documented transitional debt.

Done when:

- New runtime controller behavior enters through compiler/runtime contracts.
- Compatibility reports can say what parsed, compiled, routed, and actually executed.

### WS3: MatchWorld Actor Ownership

Purpose: make the runtime own actors, effects, and relationships instead of hiding them in the match loop.

Build:

- Introduce a real actor registry behind `MatchWorld`.
- Promote players, helpers, projectiles, explods, targets, pause, audio, and effects into inspectable world data.
- Preserve `actorKind`, `ownerId`, `rootId`, `parentId`, `stateOwner`, and `spriteOwner`.
- Move one side-effect family at a time behind world systems without checksum drift.

Done when:

- Runtime Debug Studio can show the actor tree and ownership.
- Combat evidence can name attacker, defender, owner, source controller, and result reason.

### WS4: Official KFM Compatibility Gate

Purpose: make one official character meaningfully playable through real data before broad claims.

Build:

- Improve `[State -1]` routing for official KFM.
- Expand trigger expression support needed by KFM/Common1.
- Route stand light punch and one special through real CMD/CNS.
- Improve hit, guard, state exit, get-hit, target memory, and recovery evidence.

Done when:

- KFM stands, walks, crouches, jumps, performs one normal, performs one special, and can hit or guard a dummy through imported data.
- Evidence distinguishes parsed, decoded, compiled, routed, executed partial, unsupported, and unknown.

### WS5: Stage, Camera, Audio, And Presentation

Purpose: make presentation behavior measurable without moving logic into Three.js.

Build:

- Compile stage BG definitions into renderer-independent IR.
- Expand floor, bounds, zoffset, starts, parallax, tiling, masks, windows, velocity, and layer rules.
- Add first BGCtrl classification.
- Expand SND/Web Audio into channel diagnostics.
- Plan FightFX/common effect resolution before relying on hardcoded fallbacks.

Done when:

- Imported stage reports separate parsed, rendered, animated, fallback, and unsupported layers.
- Stage and audio diagnostics explain missing or partial behavior.

### WS6: Evidence-First Creator Studio MVP

Purpose: turn the sandbox into a local project workbench without pretending the engine is finished.

Build surfaces in this order:

1. Runtime Workbench / Playtest.
2. Evidence Browser with real filters.
3. Asset Library with provenance and validation states.
4. Build Center with project/runtime manifests, warnings, trace/report export, and blocked export states.
5. Character Studio Preview for AIR, frame timeline, sprite source, axis, Clsn1/Clsn2, command/state summary.
6. Stage Studio Preview for floor, bounds, starts, zoffset, camera, layers, and stage report.
7. Runtime Debug Studio for actors, commands, states, controllers, targets, helpers, projectiles, explods, pause, audio, and effects.
8. Module Studio as read-only module status and future SDK notes.

Done when:

- A user can create, save, reopen, compile, playtest, and export a local project.
- Every asset shows provenance: `mugen-import`, `ikemen-import`, `generated`, `authored`, `converted`, or `runtime`.
- Reports are filterable and linked to the affected asset, fixture, feature, trace, or session.

### WS7: Generated Asset Authoring

Purpose: make original generated fighters and stages repeatable runtime assets.

Build:

- Add character concept brief records.
- Store image generation prompts, source art, and provenance.
- Use `sprite-atlas-builder` for atlas normalization and manifests.
- Regenerate bad source sprites when walking, crouch, jump, scale, or pose are wrong.
- Add motion, scale, baseline, contact sheet, and GIF QA.
- Add collision/action authoring in Character Studio.
- Export generated MUGEN-lite DEF/AIR/CMD/CNS templates plus runtime atlas manifests.

Done when:

- One generated fighter can be created, normalized, visually reviewed, collision-authored, and played.
- Walk reads as walking with alternating legs.
- Crouch and jump do not inflate relative to idle.
- Studio badges show atlas QA status honestly.

### WS8: IKEMEN Profile Scanner

Purpose: classify IKEMEN content without mixing it into MUGEN support claims.

Build:

- Add `ikemen-go-scan` profile detection.
- Scan for ZSS, Lua, IKEMEN-only config, extended stage/system features, and profile-specific params.
- Report unsupported IKEMEN sections clearly.
- Research source behavior before implementing any IKEMEN extension.

Done when:

- IKEMEN-only content is counted and reported instead of failing as mysterious MUGEN data.
- MUGEN 1.0, MUGEN 1.1, and IKEMEN-compatible support remain separate.

### WS9: Modular Engine Slice

Purpose: prove the engine can host another genre after the fighting module is trustworthy.

Build:

- Define shared contracts for input actions, asset records, tick loop, snapshots, debug bus, QA bridge, render adapter, and audio adapter.
- Add a platformer project template.
- Implement a tiny platformer runtime with level/tile model, platform collision, camera follow, collectible, hazard, and simple enemy.
- Expose it through Module Studio.

Done when:

- A platformer scene runs from project/build data.
- Three.js consumes snapshots without knowing platformer rules.
- Shared core does not depend on CNS, HitDef, rounds, helpers, or MUGEN command routing.

## Studio IA Plan

The long-term product IA should expose two public modes: `Playable Runtime` and `Creator Studio`. The current standalone `Inspector Mode` remains useful during the transition, but the destination is to absorb it into Studio as `Character Studio / Data Inspector` so users do not have to choose between two inspection surfaces.

The Studio should be organized around jobs, not internal folders:

```txt
Project
  -> Playtest
  -> Assets
  -> Evidence
  -> Build
  -> Character Preview
  -> Stage Preview
  -> Runtime Debug
  -> Modules
```

Recommended shell:

- Top bar: active project, project type, build status, Playtest, Save, Export.
- Left rail: Project, Assets, Character, Stage, Runtime Debug, Evidence, Build, Modules.
- Center viewport: match playtest, AIR preview, stage preview, or trace playback.
- Right inspector: selected asset, frame, layer, actor, warning, or module details.
- Bottom strip: timeline, trace scrubber, logs, commands, warnings, and recent events.

Important UX rules:

- Keep the preview/playtest central.
- Use dense tables, filters, badges, and explicit warnings.
- Never hide unsupported or partial state.
- Do not make Module Studio look like multi-genre support is already shipped.
- Every warning should identify the affected asset/system, impact, evidence, and next action.
- No green status badge should exist without linked evidence or a named acceptance gate.
- Build/export status should distinguish runnable, partial, blocked, and exportable.

## Architecture Guardrails

The next construction rounds must actively prevent these failure modes:

- `PlayableMatchRuntime` becoming an accidental VM. New controller behavior should move through typed IR, `ControllerOp`, or small runtime systems.
- Two semantics running forever in parallel. Raw `controller.source` paths are allowed only as transitional debt with a test and compatibility-report note.
- Tick order becoming undocumented behavior. Any scheduler or combat-order change needs a deterministic trace gate.
- Parser coverage inflating runtime support. Reports must keep parsed/decoded/recognized/compiled/routable/executed/partial/parity/unsupported/unknown separate.
- Stage, audio, palette, and FightFX behavior living only in Three.js adapters. Those must become runtime facts before richer presentation.
- Modular engine contracts leaking CNS, HitDef, rounds, helpers, or command routing before the fighting module is proven.
- Do not use green badges unless the matching QA evidence exists.

## First Construction Cuts

This is the immediate implementation sequence:

1. Done first cut: add typed `Projectile` `ControllerOp` execution and required trace evidence.
2. Done second cut: add typed `Helper` `ControllerOp` execution and required trace evidence.
3. Done third cut: add typed `Explod` / `RemoveExplod` `ControllerOp` execution and required trace evidence for bounded visual effect actors.
4. Done fourth cut: add typed `HitFall*` and `FallEnvShake` operation evidence to the required attacker-owned common get-hit trace.
5. Done fifth cut: add defender-owned default Common1-style get-hit entry so a `HitDef` without `p2stateno` can route imported defenders into known state `5000`, including required synthetic and optional official KFM trace evidence.
6. Done sixth cut: add `HitShakeOver` and `HitOver` trigger support plus required/optional trace gates proving defender-owned stand get-hit progression `5000 -> 5001 -> 0`.
7. Done seventh cut: add bounded `GetHitVar(yaccel)`, required synthetic default fall `5000 -> 5030 -> 5050`, required synthetic bounded recovery `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, optional official KFM fall/ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, and optional official KFM lie-down/get-up `5110 -> 5120 -> 0` trace evidence.
8. Extend `RuntimeTraceArtifact` gates for richer hit/guard/whiff/reject/override/reversal reasons, controller-operation payloads, and fixture-vs-synthetic source labels.
9. Expand official KFM trace gates beyond `x -> 200`, QCF, guard, partial stand/crouch guard-hit `150 -> 151` and `152 -> 153`, partial hitstun, default state `5000`, stand get-hit progression, fall/ground-impact/bounce/lie-down/get-up entry, air recovery-input, ground recovery-input, custom get-hit controller-flow, bounded synthetic recovery, bounded synthetic recovery input, bounded synthetic actor-frame tick-order, bounded synthetic air-recovery velocity, bounded synthetic ground-recovery selection/velocity, and state-exit into exact controller/VM tick-order parity, exact threshold tables/velocity math, broader recovery parity, and exact guard-rule evidence.
10. Add selectable actor detail, filters, and trace/controller links to Runtime Debug Studio.
11. Expand Evidence Browser persistence, comparison, and stale/missing-source warnings.
12. Expand visible source-package relink with persistent browser handles/IndexedDB storage where safe.
13. Plan Studio visual direction with three focused workbench concepts before a major interface rebuild; selected implementation must bind to live data and pass browser visual QA.
14. Build Character Studio Preview over current AIR/CMD/CNS/SFF data, linked back to evidence and active runtime state.
14. Build Stage Studio Preview over current stage reports.
15. Add generated-fighter authoring records and QA ingestion only where sprite-atlas-builder/imagegen provenance exists.
16. Add IKEMEN profile scanning after MUGEN/IKEMEN claims can stay separate in reports.

## Release Gates

Each construction round must close with the right evidence level:

- Parser/compiler/runtime logic changed: focused unit tests plus `pnpm test`.
- Type or API contracts changed: `pnpm typecheck`.
- Build/runtime packaging changed: `pnpm build`.
- Runtime trace, controller, combat, actor ownership, or tick order changed: `pnpm qa:trace`.
- Frontend, renderer, runtime visual, stage, debug panel, or asset rendering changed: browser visual QA, preferably `pnpm qa:smoke`.
- Docs updated when support level, limitations, or workflow changes.

Preferred artifact shape:

```txt
.scratch/qa/<feature>/
  diagnostics.json
  runtime.png
  studio.png
  inspector.png
  trace-artifact.json
  notes.md
```

## Non-Goals Until Later

Do not spend implementation rounds on these until the prerequisite gates pass:

- Full IKEMEN-GO parity.
- ZSS execution.
- Lua execution.
- Rollback/netplay.
- Full screenpack/motif engine.
- Full custom states and throws.
- Full helper VM.
- Full BGCtrl/model-stage parity.
- Production platformer or beat-em-up tooling.
- Large folder reshuffles that do not reduce runtime risk.

These remain future horizons, not blockers for the private usable MVP.

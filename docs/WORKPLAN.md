# Workplan

This is the operating ledger for building the whole approved direction without losing the playable prototype. It is intentionally narrower than the vision docs: if a task is not here, it is either already done, blocked by a gate, or belongs in a later planning update.

Authoritative horizon docs:

- `APPROVED_HORIZON_PLAN.md`: scope contract and milestone order.
- `HORIZON_IMPLEMENTATION_BLUEPRINT.md`: cross-cutting orchestration blueprint for building every accepted idea through one evidence chain.
- `MASTER_CONSTRUCTION_PLAN.md`: broad release train.
- `CONSTRUCTION_WAVES.md`: practical wave plan with build packages, dependencies, acceptance gates, anti-claims, and next rounds.
- `WORKPLAN.md`: current execution ledger.
- `ARCHITECTURE_DECISIONS.md`: decisions that constrain implementation.
- `COMPATIBILITY_PROFILES.md`: normative profile split for native runtime, MUGEN 1.0/1.1, IKEMEN scan-only, and future modules.
- `CONTROLLER_SUPPORT_REGISTRY.md`: controller support levels, typed-operation expectations, evidence, and partial-support wording.
- `TICK_ORDER_CONTRACT.md`: frame/tick order contract and trace requirements for behavior changes.
- `FIXTURE_GOLDENS.md`: required/optional fixture artifacts, golden update rules, and claim map.
- `STAGE_COMPATIBILITY_MATRIX.md`: imported stage feature levels and Stage Studio gates.
- `GENERATED_ASSET_QA_CONTRACT.md`: generated asset provenance, motion/scale/baseline QA, and regeneration rules.
- `MODULE_BOUNDARY_CONTRACT.md`: shared-core, fighting-module, and future-module boundaries.

## Current Build Rule

Do not add more product surface area unless it carries real runtime, asset, build, or evidence data. The spine stays:

```txt
RuntimeTrace
  -> ControllerOp / Runtime IR
  -> MatchWorld ownership
  -> KFM/Common1 gates
  -> stage/audio/presentation IR
  -> evidence-first Creator Studio
  -> generated authoring
  -> IKEMEN scanner
  -> shared module contracts
  -> first platformer slice
```

Construction lock for the expanded horizon:

- Build all approved ideas, but only call a slice real when it has executable evidence.
- Near-term wording is **partial MUGEN compatibility with fixture gates** plus **IKEMEN profile scanning**, not full IKEMEN execution.
- The normative compatibility sentence is **partial MUGEN 1.1 fixture-backed runtime, native generated roster, IKEMEN scanner only**.
- Studio work is allowed when it reveals real assets, traces, reports, build status, or runtime state.
- Generated assets are native/authored pipeline proof and must never inflate imported MUGEN compatibility.
- Modular-engine work remains planned until fighting runtime contracts are clean enough to extract.

## 2026-06-25 Construction Consensus

The latest architecture, product, and modularity review accepts the full horizon, but only as an ordered construction program:

| Track | Build Now | Parallel Work Allowed | Blocked Until | Acceptance |
| --- | --- | --- | --- | --- |
| Runtime spine | `RuntimeTrace -> ControllerOp -> MatchWorld` ownership, with `PlayableMatchRuntime` shrinking over time. | Narrow controller/system cuts that add trace evidence and do not hide raw-controller debt. | Broad CNS semantics that bypass typed operations or world systems. | Stable trace checksums or documented intentional drift; missing evidence fails loudly. |
| Fixture compatibility | Official KFM/Common1 gates for command routing, hit/guard, get-hit, fall/recovery, state exit, and guard rules. | Synthetic regression traces and optional fixture packaging. | Claims like "KFM works" or "MUGEN compatible" without an actual fixture artifact. | Each claim names fixture, state chain, controllers, support level, checksum, and remaining gaps. |
| Creator Studio | Actionable status contract, Evidence persistence, Build authority, Asset repair flow, Character/Stage previews. | UI planning and diagnostic surfaces that bind to current project/runtime/evidence data. | Advanced editors that cannot save, compile, playtest, export, or explain blocked state. | Every `ok`, `partial`, `warn`, `blocked`, and `unsupported` state has affected item, impact, evidence, and next action. |
| Generated assets | Prompt/source provenance, regenerated source sheets when motion/scale is bad, atlas QA, collisions, playtest evidence. | New original fighters/stages as native generated assets. | Treating generated assets as imported MUGEN compatibility or fixing bad source motion by cropping. | Prompt -> source -> atlas -> QA -> collisions -> runtime trace is visible in Studio. |
| IKEMEN profile | Scanner/reporting for IKEMEN-only files, ZSS, Lua, config, stage/system features. | Source research and report schema work. | ZSS/Lua execution, rollback, netplay, or IKEMEN-specific runtime behavior. | IKEMEN-only content is recognized as scanner/report evidence, not runtime support. |
| Shared core | Identify candidate contracts only after the fighting seams prove them: project, assets, input, tick, snapshots, render/audio/debug/build/QA. | Read-only Module Studio status and import-boundary notes. | A platformer runtime or generic SDK. | Shared code contains no CNS, CMD, HitDef, Common1, rounds, helpers, targets, or MUGEN command routing. |
| Platformer slice | Planning only. | Tiny design notes tied to future shared contracts. | `MatchWorld`, Build, Evidence, and import-boundary gates pass. | A later scene runs from project/build data while fighting smoke/trace still pass. |

This means the immediate construction order is:

```txt
1. Runtime spine and fixture evidence
2. Studio actionable truth and persisted evidence
3. Character/Stage diagnostic previews
4. Generated authoring records and QA ingestion
5. IKEMEN scanner/profile reporting
6. Shared module contract extraction
7. Tiny platformer slice
```

The Studio object model for this plan is:

```txt
Project
  -> assets/sourcePackages/modules/entry
  -> compatibility/evidence/buildOutputs
```

`Build` is the authority for runnable/partial/blocked/exportable truth. `Assets`, `Evidence`, `Character`, `Stage`, and `Debug` link back to that truth rather than inventing separate status language.

## Construction Review Addendum

The architecture/product/modularity review for the expanded approach agrees on this build sequence:

```txt
MatchWorld ownership real
  -> KFM/Common1 tick-order and guard gates
  -> Studio Build/Evidence/Assets as the trust chain
  -> Character/Stage previews as diagnostics
  -> generated authoring provenance and QA ingestion
  -> IKEMEN scanner/profile reports
  -> shared Studio/Build/Evidence contracts
  -> snapshot/render/audio/debug interfaces
  -> module descriptor catalog and import-boundary gate
  -> tiny platformer proof slice
```

Rules added by the review:

- Every runtime/CNS/CMD task must close with `claim allowed` and `claim blocked` language, plus the artifact or fixture that can falsify it.
- Official fixtures may stay optional for local/CI availability, but skipped official fixtures block official compatibility claims.
- Negative fixtures are first-class: missing `common1.cns`, malformed DEF paths, unknown controllers/triggers, unsupported SFF/SND data, and IKEMEN-only ZSS/Lua/config must report `unsupported` or `unknown` without crashing or creating green status.
- Studio surfaces must be designed as a trust workflow, not equal tabs: `Project / Workbench -> Assets -> Evidence -> Build`, with `Character`, `Stage`, and `Debug` as contextual tools. `Build` owns runnable/partial/blocked/exportable truth.
- Generated assets must preserve prompt/source/atlas/QA/collision/trace provenance. Bad source walk, crouch, jump, or scale means regenerate source art, not crop or slice around the issue.
- Shared-core extraction starts with stable Studio/Build/Evidence contracts and later generic snapshot/render/audio/debug interfaces. Do not promote `src/game`, `MugenSnapshot`, or fighting renderer/audio types to shared core until import-boundary checks pass.
- The first platformer is a contract proof only: level/tile model, player, simple platform collision, camera, collectible, hazard, one enemy, snapshot, Studio playtest route, and QA smoke. It remains blocked until fighting smoke/trace still pass.

## Current Execution Authority

This table is the tie-breaker when older roadmap docs repeat similar queues. Build from top to bottom unless a newer round explicitly documents why it is taking a parallel evidence-only slice. A row is not "done" because code exists; it is done when the acceptance artifact, closeout, allowed claim, and blocked claim language all line up.

| Order | Build | Code Anchors | Acceptance Artifact | Required Closeout | Claim Allowed | Still Blocked |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Deepen `MatchWorld` lifecycle ownership for helpers/projectiles/explods/targets/effects. | `src/mugen/runtime/MatchWorld.ts`, `PlayableMatchRuntime`, `ProjectileSystem`, `HelperSystem`, `ExplodSystem`, `TargetSystem`, `RuntimeTrace`. | Trace artifacts and Debug Studio show actor/effect `ownerId`, `rootId`, `parentId`, lifecycle, and stable final snapshots. | Focused tests, `pnpm qa:trace`, docs if checksum drift is intentional. | `MatchWorld` owns a named lifecycle slice. | Generic ECS, broad SDK, full helper VM, or hidden raw-runtime side effects. |
| 2 | Tighten KFM/Common1 route evidence beyond the bounded official air/ground recovery-input routes: exact tick order, thresholds/velocities, and broader official fixture gaps. | CMD/CNS compiler, expression/trigger evaluator, state controller executor, common get-hit/fall tests, trace gates. | Required synthetic plus optional official KFM artifacts name executed states/controllers/typed ops, checksums, support level, and remaining gaps. | Focused tests, `pnpm qa:trace`, artifact inspection. | `mugen-1.1 executed partial for this fixture route`. | `KFM works`, full MUGEN parity, or optional fixture skipped as pass. |
| 3 | Tighten exact guard-rule evidence. | `CombatResolver`, guard-state routing, `InGuardDist`, `CommandBuffer`, Common1 guard traces. | Trace proves guard start/end/proximity/air/support where implemented, plus damage, stun, push, state route, and unsupported guard effects. | Focused tests, `pnpm qa:trace`, support docs. | `guard route executed partial with named gaps`. | Exact guard parity without oracle/comparison evidence. |
| 4 | Promote Studio Evidence into replay-style trace review. | `RuntimeTraceArtifact`, Studio Evidence UI, evidence storage, QA bridge, smoke script. | Persisted/current trace diff shows frame, event, gate, actor/effect, and checksum deltas with affected asset/controller links. | `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm qa:smoke`, visual QA. | Evidence Browser compares trace artifacts and links next actions. | Rollback/netplay/replay VM claims. |
| 5 | Add source relink/regenerate repair affordances. | Studio Assets, Build Center, project manifest, source-package metadata, export bundle. | Missing/stale source packages show affected assets, impact, relink/regenerate action, build invalidation, and recompile state. | `pnpm qa:smoke`, visual QA, docs. | Studio can explain and start repair for project assets. | Advanced editing without save -> compile -> playtest -> export. |
| 6 | Build Character Studio Preview and retire Inspector only after parity of visible function. | DEF/AIR/SFF/CMD/CNS models, `CharacterRenderer`, collision overlays, Studio Character surface. | Selected character shows files, action timeline, frame/sprite/axis, Clsn1/Clsn2, commands, states, related evidence, and warnings. | Browser visual QA desktop/narrow, smoke coverage, parser tests if model behavior changes. | Character Preview is diagnostic and project-aware. | Full character editor or generated authoring UI with unproven edits. |
| 7 | Build Stage Studio Preview and stage/audio/presentation IR. | Stage parser/model/render, camera/floor/bounds, SND/audio diagnostics, Studio Stage surface. | Stage preview/report classifies layers/audio/controllers as rendered, animated, bounded, fallback, unsupported, missing, or decoded. | Focused tests where available, `pnpm qa:smoke`, visual QA. | Stage Preview diagnoses imported/native stage behavior. | Exact BGCtrl parity, motif, screenpack, model-stage parity. |
| 8 | Add generated asset authoring records and QA ingestion. | Studio Assets, generated fighter manifests, imagegen provenance records, `sprite-atlas-builder` reports. | Prompt/source -> atlas -> contact sheet/GIF -> motion/scale QA -> collisions -> runtime trace is visible in Studio. | Asset QA scripts, browser visual QA, trace when playable. | Generated/native asset pipeline proof. | Generated asset counted as imported MUGEN compatibility, or cropped bad motion marked fixed. |
| 9 | Add IKEMEN profile scanner/reporting. | Compatibility profiles, loader/report scanners, unsupported feature tracker. | ZSS, Lua, IKEMEN config, extended controllers/triggers/stage/system features are counted as recognized/unsupported/unknown. | Scanner tests, report fixture, docs. | `ikemen-go-scan recognized unsupported`. | ZSS/Lua execution, IKEMEN runtime behavior, rollback/netplay. |
| 10 | Extract shared module contracts, then build the tiny platformer slice. | Project, asset, input, tick, snapshot, render, audio, debug, build, QA contracts. | Shared core imports no CNS/HitDef/round/helper/projectile/explod/target/MUGEN/IKEMEN command concepts; a platformer scene later runs from project/build data. | Import-boundary check, fighting regressions, platformer smoke when implemented. | Modular engine extraction candidate, then one proven non-fighting slice. | Production multi-genre tooling before the fighting contracts hold; promoting `src/game` or `MugenSnapshot` to shared core. |

## Four-To-Six Week Execution Program

This is the practical construction slice for the approved horizon. It keeps the match playable every week while building toward the full MUGEN/IKEMEN-inspired Three.js engine, Creator Studio, generated asset pipeline, and later modular engine.

The three review lenses agree on the same priority:

- Runtime strictness: `MatchWorld` must own real lifecycle behavior, not only derive readable evidence from `PlayableMatchRuntime`.
- Product/UX: Creator Studio must behave as a trust workflow, not a flat tab list. `Build` is the authority and `Evidence` is the proof.
- Pragmatic delivery: every week must improve runtime evidence, Studio evidence, Build truth, or playable match behavior.

| Week | Build | Acceptance Gate | Claim Allowed | Claim Blocked |
| --- | --- | --- | --- | --- |
| 1 | Deepen one real `MatchWorld` ownership slice: projectile lifecycle, effect pause ordering, or target semantics. | Trace checksums stay stable or intentional drift is documented; Debug Studio and trace artifacts show owner/root/parent facts for the affected slice. | `MatchWorld` owns this named lifecycle slice. | Generic ECS, broad SDK, full helper VM, or hidden raw side effects. |
| 2 | Tighten KFM/Common1 recovery precision on existing get-hit/fall chains. | Required synthetic and optional official KFM artifacts prove executed states/controllers/typed operations and name remaining gaps. | `mugen-1.1 executed partial for this fixture route`. | `KFM works`, full MUGEN parity, or skipped optional fixture counted as pass. |
| 3 | Tighten guard-rule evidence for start/end/proximity and stand/crouch guard-hit. | Trace proves guard reason, damage/stun/push, state/anim route where supported, plus unsupported guard effects. | `guard route executed partial with named gaps`. | Exact guard parity, air guard, sparks/sounds, or IKEMEN guard parity without oracle evidence. |
| 4 | Promote Studio Evidence into the main truth board. | Persisted/current trace diff shows frame, event, gate, actor/effect, checksum, affected asset/controller, stale/missing-source state, and next action. | Evidence Browser can compare trace artifacts and point to the next action. | Rollback, netplay, replay VM, or green evidence without links. |
| 5 | Add source relink/regenerate and build invalidation affordances. | Missing/stale source packages show affected assets, impact, relink/regenerate action, invalidated build state, and recompile path. | Studio can explain and start repair for project assets. | Advanced editing without save -> compile -> playtest -> evidence -> export. |
| 6 | Build Character Studio Preview as a diagnostic surface. | Selected character shows DEF files, AIR timeline, sprite source, axis, Clsn1/Clsn2, CMD routes, CNS states, related evidence, and warnings with desktop/narrow visual QA. | Character Preview is project-aware and diagnostic. | Full character editor, generated authoring editor, or Inspector retirement before parity of visible function. |

If a week cannot close one of these gates, reduce the slice instead of expanding scope. A week that only adds UI or docs without improving a falsifiable runtime/studio/build/evidence fact does not advance the approved horizon.

Stage Studio Preview follows the Character Preview unless the runtime/stage workstream becomes the higher risk first. Generated authoring begins after Studio Evidence/Assets/Build can show prompt/source -> atlas -> QA -> collision/action -> runtime trace without hiding warnings. IKEMEN scanner work can run in parallel as report-only, but ZSS/Lua/rollback/netplay remain blocked. Shared module extraction and the first platformer slice stay blocked until fighting smoke/trace and import-boundary checks pass.

## Status Ledger

| Workstream | Status | Current Proof | Next Gate |
| --- | --- | --- | --- |
| Runtime trace evidence | Active, usable first cut | `pnpm qa:trace` required native, synthetic imported, Target*, SuperPause, SuperPause+Projectile advance/freeze, Projectile hit, Projectile guard, Projectile clash, Helper, Explod, fall metadata, custom get-hit, default Common1 get-hit, default Common1 `HitShakeOver`/`HitOver` progression, default Common1 fall branch, bounded synthetic fall recovery chain, bounded synthetic recovery-input branch, optional official KFM air recovery-input branch, optional official KFM ground recovery-input branch, and state-exit artifacts. Trace gates can now require `targetLinks`, `MatchWorld` lifecycle events, effect-store evidence, runtime event substrings, `matchPause` snapshot evidence, and match-pause actor/effect advance/freeze evidence; the synthetic recovery-input artifact proves `CanRecover` after `fall.recovertime` plus `command = "recovery"` can route `5050 -> 5210 -> 0`, optional `kfm-official-default-fall-recovery-input` proves real KFM Common1 can route `5050 -> 5210 -> 52 -> 0` with checksum `e9a28c13`, and optional `kfm-official-default-fall-ground-recovery` proves real KFM Common1 can route `5050 -> 5200 -> 5201 -> 52 -> 0` with checksum `7894f132`, while Target* and Projectile artifacts prove typed operation evidence plus world-visible target ownership/binding, target-memory evidence, projectile spawn/remove lifecycle evidence, producer-store evidence, a bounded held-back projectile guard path, and a bounded `projpriority` projectile-vs-projectile trade/cancel path where relevant, SuperPause proves typed pause operation plus freeze/darken/movetime snapshot evidence and opponent freeze, the SuperPause+Projectile trace proves a bounded `p1` projectile effect actor advances during source `movetime` and then remains frozen afterward, while Helper/Explod artifacts require spawn/active lifecycle plus producer-store evidence. Studio Evidence now persists local trace artifacts, compares persisted checksums/frame/event/gate deltas against the current trace, renders metric/gate diff review, exposes a frame checksum/event scrubber, and shows per-frame `world` deltas for live/effect/target/lifecycle facts when the artifact includes `RuntimeTraceArtifact.world`. | Full replay-style trace scrubber, richer reason payloads, multi-artifact diff review, and release evidence bundles. |
| ControllerOp / IR | Active, partial | `HitDef`, `Target*`, `Pause`/`SuperPause`, `Projectile`, `Helper`, `Explod`, `HitFall*`, and `FallEnvShake` have typed operation evidence; many controllers still execute from raw params. | Next controller family or system boundary must shrink raw controller paths without overstating parity. |
| MatchWorld ownership | Active, early | `MatchWorld` facade plus actor registry/lifecycle metadata, per-tick lifecycle events, `targetLinks` from runtime target memory/bindings, and a `RuntimeEffectActorWorld` boundary for `Explod`/`Helper`/`Projectile` stores exposed to Debug Studio, QA bridge, and `RuntimeTraceArtifact` frame summaries; Target* side-effect application has moved out of the main controller loop into `TargetSystem`; `ProjectileSystem`/`HelperSystem`/`ExplodSystem` consume typed operations; `EffectActorSystem` owns mutable per-fighter stores behind active/presentation world passes; `ProjectileCombatSystem` now owns the bounded projectile contact/reject/override/hit-or-guard/removal loop plus bounded `projpriority` projectile-vs-projectile clash through `RuntimeEffectActorWorld`. | Move exact projectile priority classes/cancel animations/remove animations, effect pause/combat ordering, and exact target semantics behind `MatchWorld` with no behavior checksum drift. |
| KFM/Common1 compatibility | Active, partial | Optional KFM `x`, `QCF_x`, guard, auto guard-start/end, hitstun, default defender-owned Common1 `5000`, defender-owned stand `5000 -> 5001 -> 0`, defender-owned fall/ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, defender-owned lie-down/get-up recovery `5110 -> 5120 -> 0`, defender-owned air recovery-input `5050 -> 5210 -> 52 -> 0`, defender-owned ground recovery-input `5050 -> 5200 -> 5201 -> 52 -> 0`, and state-exit gates; synthetic custom get-hit controller-flow, bounded stand/crouch guard-hit `150 -> 151` / `152 -> 153` with runtime-backed `GetHitVar(slidetime)` / `GetHitVar(ctrltime)` when guard params exist, bounded auto guard route `120 -> 130 -> 140 -> 0`, bounded synthetic `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0` recovery-chain gate, and bounded synthetic recovery-input route `5050 -> 5210 -> 0`. | Exact tick-order parity, exact ground/air recovery thresholds/velocities, broader recovery parity beyond the bounded routes, and exact guard proximity/air/effect/timing work. |
| Stage/audio/presentation IR | Active, early | Stage DEF/SFF parsing, static/action BG rendering, bounded recognized-type BGCtrl execution, partial SND/Web Audio event path, per-layer Stage BG IR in `StageCompatibilityReport`, bounded/unsupported BGCtrl reporting, and a URL-addressable Studio `Stage` surface for floor/bounds/zoffset/starts/camera/layer/controller diagnostics. | Richer camera/layer visual QA, exact BGCtrl timing/parity, exact parallax/window/mask/trans support tiers. |
| Creator Studio | Active, evidence-first | Workbench, Assets, Inspector, Debug, Evidence, Modules, Build surfaces read current runtime/project data. Asset/gate records now have first actionable status fields: severity, impact, evidence ids, blockers, exportability, and next action; selected asset panels, Build readiness, Evidence summary, `project.json`, `.studioAssets`, `.studioEvidence`, and `pnpm qa:smoke` expose/check them. Trace artifacts exported from Studio are persisted into bounded browser-local evidence history with project entry/source-package metadata, stale/current status, current trace comparison, a first visible metric/gate diff review, and a frame scrubber with per-frame actor/effect/input/event deltas plus world deltas. Current UI shell polish adds live workspace status, clearer mode selection, viewport skip link, resilient badges, collapsible heavy debug panels, a Studio focus hero/rail for current decision, gates, assets, traces, and build state, Debug-to-Inspector exact CNS state/controller deep-links, Debug-to-Inspector command-buffer/CMD Browser deep-links, URL-backed Runtime Debug lenses for targets/effects/pause/audio, first trace-world evidence rows that jump back to the Evidence scrubber, and manual source-package relink from Build Center so Runtime/Studio remain usable on desktop and narrow screens. | Full replay-style trace scrubber, persistent source handles, regenerate actions, Character/Stage previews tied to selected assets and evidence, deeper helper/projectile/explod Debug drilldowns, and true editing workflows beyond shell/readability polish. |
| Generated authoring | Planned, external first cut | Local generated roster and atlas QA exist; provenance shown as generated/native, not MUGEN compatibility. | Studio asset records for prompts, atlas QA, collision/action authoring, replacement flow. |
| IKEMEN profile | Active, report-only first cut | `IkemenFeatureScanner` adds `CompatibilityReport.profiles.ikemen`, exported JSON, DebugPanel, Studio Evidence, and unsupported-feature entries for ZSS files/references/controller syntax, Lua files/hooks including `hook.*`, IKEMEN config JSON, screenpack/select signals, `IkemenVersion`, selected IKEMEN-only controllers/triggers/`AssertSpecial` flags, model-stage assets, and named 3D/Z stage params. | Broader fixture corpus for IKEMEN-only config/stage/system files, more source-mapped trigger/controller classification, and no execution until runtime gates exist. |
| Modular engine | Blocked by fighting contracts | Module Studio is read-only/planned; `projectType` is currently `mugen-port`. | Shared contracts extracted without CNS/CMD/HitDef/Common1/round/helper/projectile/explod/target/MUGEN/IKEMEN leakage and verified by an import-boundary gate. |
| Platformer slice | Blocked | Documented horizon only. | Tiny platformer runs from `runtime-manifest/v0` after shared contracts hold. |

## Next Five Required Cuts

These are the current mandatory cuts before the plan expands into larger Studio editing or non-fighting module work:

| Order | Cut | Why It Comes Next | Gate |
| --- | --- | --- | --- |
| 1 | `MatchWorld` lifecycle ownership | `MatchWorld` must become more than a derived facade before helpers/projectiles/explods/targets can be trusted by Studio or future modules. | Existing trace checksums stay stable, or intentional drift is documented with a new artifact. |
| 2 | KFM/Common1 recovery precision and exact tick order | The current gates now prove stand get-hit, fall/ground-impact, a synthetic bounce/lie-down/get-up chain, a synthetic recovery-input branch through `5050 -> 5210 -> 0`, optional official KFM lie-down/get-up completion through `5110 -> 5120 -> 0`, optional official KFM air recovery-input completion through `5050 -> 5210 -> 52 -> 0`, and optional official KFM ground recovery-input completion through `5050 -> 5200 -> 5201 -> 52 -> 0`, but not exact tick order or exact recovery thresholds/velocities. | Required synthetic and optional official KFM artifacts continue to prove the executed state/controller chain while new cuts reduce residual gaps. |
| 3 | Exact guard-rule parity cut | Current guard behavior now includes held-back guard, bounded `InGuardDist` trigger plumbing, bounded automatic guard-start/end through Common1-style `120 -> 130 -> 140 -> 0`, bounded authored guard-hit routing, and parsed `guard.slidetime` / `guard.ctrltime` flowing through `GetHitVar` when present, but still lacks exact proximity, air, spark/sound, effect, and guard-end timing parity. | Trace proves guard event, damage/stun/push, state/anim route where supported, and unsupported guard details. |
| 4 | Studio actionable status contract | First cut done: generated/imported asset records, gates, evidence records, Build readiness, selected asset UI, `project.json`, and QA bridge now carry/display severity, impact, evidence ids, blockers, exportability, and next action. Source-package relink now has a first explicit Build Center affordance. | Next cut should persist those records across sessions, compare evidence, add persistent source handles, and turn regenerate actions into explicit affordances. |
| 5 | Evidence persistence and comparison | Second persistence/comparison/review/scrubber cut done: exported trace artifacts are stored in browser-local evidence history with project id, entry, source packages, checksum, stale/current status, QA bridge exposure, current-vs-persisted checksum/frame/event/gate deltas, a visible Trace Comparison Review, and a Trace Frame Scrubber with per-frame actor/effect/input/event deltas plus World Delta rows. | Next cut should add replay-style multi-frame diff views across multiple artifacts, persist more record kinds, and add regenerate plus persistent-source actions from stale/missing-source states. |

## Current Active Cuts

1. **Stabilize custom get-hit evidence**
   - Owner: Runtime / QA.
   - Build: keep `synthetic-imported-common-gethit` required in `pnpm qa:trace`.
   - Done: trace proves `p2stateno`, attacker-owned state execution, typed `HitFallVel`, `HitFallDamage`, `HitFallSet`, `FallEnvShake` evidence, final `hitFall`, and no false full-parity claim.

2. **Move one side-effect family behind a runtime system**
   - Owner: Runtime architecture.
   - Current cut: Target* controller side effects now apply through `TargetSystem` while state-entry validation remains a match-runtime callback.
   - Current cut: Projectile, Helper, and Explod now compile into typed operation data and their systems consume it while preserving bounded effect-actor lifecycle.
   - Current cut: `EffectActorSystem` now owns per-fighter effect actor serials, bounded stores, advance/removal mutation, hit-removal pruning, snapshot handoff, and read-only store summaries for Explod/Helper/Projectile actors, so `PlayableMatchRuntime` no longer mutates three independent effect arrays directly.
   - Current cut: `RuntimeEffectActorWorld` now wraps those stores behind a world-style contract for spawn, active-effect advance, presentation-effect advance, removal, snapshots, summaries, and reset while preserving external store identity for tests and future Studio/QA inspection.
   - Current cut: `FighterMatchState` no longer retains the raw effect actor store; the match integration runtime reaches helpers/projectiles/explods through `RuntimeEffectActorWorld`.
   - Current cut: `MatchWorld` now creates and owns `RuntimeEffectActorWorld`, injects it into `PlayableMatchRuntime`, consumes its summaries as actor-registry `effectStores`, and `RuntimeTraceArtifact` preserves `world.effectStores` without changing behavior checksums.
   - Current cut: `MatchWorld` now tracks lightweight spawned/active/removed lifecycle metadata and per-tick lifecycle events for player/effect actors, exposes them through Debug Studio and the QA bridge, and `RuntimeTraceArtifact` frame summaries preserve `world.lifecycle` plus `world.eventsThisTick` without changing behavior checksums.
   - Current cut: `ProjectileCombatSystem` now owns the bounded projectile contact/reject/override/hit-or-guard/removal loop and is reached through `RuntimeEffectActorWorld`; Projectile controllers now carry typed guard params and bounded `projpriority`, the required `synthetic-imported-projectile-guard` trace proves a held-back projectile block through the shared partial hit/guard resolver, and `synthetic-imported-projectile-clash` proves equal-priority projectile trade/removal through runtime event evidence, while exact priority classes/cancel/remove animations/full guard effects/pause parity remains unsupported.
   - Current cut: `ActorSnapshot.runtime.targetRefs`/`targetBindings` and `MatchWorld.targetLinks` now expose recent target memory and active target binds to Debug Studio and trace `world` evidence without changing behavior checksums.
   - Current cut: `RuntimeTraceGate.requiredTargetLinks` now makes world-visible target ownership/binding evidence a required gate condition for the synthetic imported Target* route and target-memory evidence a required gate condition for the synthetic imported Projectile route.
   - Current cut: `RuntimeTraceGate.requiredWorldLifecycleEvents` now makes `MatchWorld` lifecycle evidence a required gate condition; the synthetic imported Projectile route requires both projectile spawn and remove events with owner/root/parent metadata, while Helper and Explod routes require spawn/active events for their bounded visual effect actors.
   - Current cut: `RuntimeTraceGate.requiredEffectStores` now makes `RuntimeEffectActorWorld` producer-store evidence a required gate condition for the synthetic imported Projectile, Helper, and Explod routes.
   - Current cut: `RuntimeTraceGate.requiredMatchPauses`, `requiredMatchPauseAdvances`, and `requiredMatchPauseFreezes` now make match-freeze snapshot, source-movetime advance, and frozen actor/effect evidence required gate conditions for synthetic imported SuperPause routes, including source actor/state, darken, remaining frames, source `movetime`, P2 freeze, and a bounded `Projectile + SuperPause` route where the `p1` projectile effect actor advances during source `movetime` and then remains frozen afterward; runtime tests also assert source animation advances during `movetime` while the opponent remains frozen.
   - Claim allowed: `synthetic-imported-projectile-guard.json` proves bounded Projectile guard resolution with typed guard params, target-link evidence, and guard event/combat-reason evidence; `synthetic-imported-projectile-clash.json` proves bounded equal-priority projectile-vs-projectile trade/removal with runtime event evidence; `synthetic-imported-superpause-projectile-freeze.json` proves bounded projectile effect actor source-movetime advance plus freeze evidence during the current partial SuperPause path.
   - Still blocked: exact projectile/helper/explod pause parity, helper VM pause behavior, exact projectile priority classes/cancel animations/remove animations/full guard effects, sound/spark/super-background timing, and full MUGEN/IKEMEN pause layering.
   - Next candidate: move exact projectile parity beyond the bounded clash subset, richer effect pause ordering, and exact target semantics behind `MatchWorld`, or real KFM/Common1 get-hit/fall gating, whichever can move without broad combat drift.
   - Done: old and new traces keep matching checksums unless the behavior change is intentional and documented; the next cut should promote exact effect combat/pause decisions, not only store access, through `MatchWorld`.

3. **Typed ControllerOp expansion**
   - Owner: Compiler/runtime.
   - Current cut: `Pause`/`SuperPause` now compile into typed `pause:*` operations and the required synthetic `SuperPause` trace gate also requires `matchPause` snapshot evidence; `Projectile`, `Helper`, `Explod`, `HitFall*`, and `FallEnvShake` now compile into typed operation evidence and have required synthetic trace coverage.
   - Later candidate families: deeper effect lifecycle ownership, richer get-hit/fall state flow, or the next high-value raw controller family.
   - Done: reports distinguish parsed, recognized, compiled, executed partial, unsupported, and unknown; trace gates require `executedOperations`.

4. **KFM/Common1 get-hit and fall gate**
   - Owner: Compatibility runtime.
   - Current cut: optional `kfm-official-default-gethit` proves official KFM as defender enters real Common1 state `5000` from a HitDef without `p2stateno`; optional `kfm-official-default-gethit-progression` proves real KFM stand get-hit progression `5000 -> 5001 -> 0` through `HitShakeOver` and `HitOver`; required `synthetic-imported-default-guard-state` and `synthetic-imported-crouch-guard-state` prove bounded guard-hit `150 -> 151` and `152 -> 153`; required `synthetic-imported-default-fall-gethit` proves a portable default fall branch into `5030`/`5050`; required `synthetic-imported-default-fall-recovery` proves a bounded recovery chain through `5100 -> 5101 -> 5110 -> 5120 -> 0`; required `synthetic-imported-default-fall-recovery-input` proves a bounded `CanRecover` plus `command = "recovery"` route through `5050 -> 5210 -> 0`; optional `kfm-official-default-crouch-guard-state` proves the official KFM Common1 crouch branch reaches `153`; optional `kfm-official-default-fall-gethit` proves real KFM reaches ground-impact `5100`, bounce-entry `5101`, and lie-down `5110`; optional `kfm-official-default-fall-recovery` proves real KFM continues through `5110 -> 5120 -> 0` with `HitFallSet` and final control; optional `kfm-official-default-fall-recovery-input` proves real KFM can route `5050 -> 5210 -> 52 -> 0` through `CanRecover` plus `command = "recovery"`; optional `kfm-official-default-fall-ground-recovery` proves real KFM can route `5050 -> 5200 -> 5201 -> 52 -> 0` through the same recovery command near ground.
   - Next: exact guard-rule parity items beyond the bounded auto guard-start/end bridge, exact recovery thresholds/velocities, broader recovery parity beyond the bounded air/ground routes, and exact tick-order parity cuts.

5. **Guard-rule improvement**
   - Owner: Combat/runtime.
   - Build: extend current held-back/down-back guard result, bounded `InGuardDist`, bounded automatic `120 -> 130 -> 140 -> 0` guard-start/end, bounded stand/crouch guard-hit routing, and parsed guard slide/control timing into exact proximity/air behavior, guard effects, and broader crouch parity.
   - Current cut: `AssertSpecial` guard-affecting flags now participate in the bounded hit/guard resolver: defender-side `NoStandGuard`/`NoCrouchGuard`/`NoAirGuard` can deny guard by state type, attacker-side `Unguardable` forces hit evidence in the partial resolver, and `synthetic-imported-assertspecial-unguardable` is a required trace gate.
   - Done: trace proves guard event, guard damage/stun/push, state/anim route where supported, simple `guard.slidetime` / `guard.ctrltime` evidence when present, attacker-side `Unguardable` hit-through-guard evidence, and explicit unsupported gaps.

6. **Evidence Browser persistence**
   - Owner: Studio / QA.
   - Build: save recent trace artifacts and evidence records to browser-local project state, then compare persisted trace artifacts with the current exported trace.
   - Done: reopening Studio shows prior artifacts with checksums, stale/missing-source warnings, and a first same/different/missing-current comparison row.

7. **Character Studio preview**
   - Owner: Studio / compatibility.
   - Build: absorb the transitional Inspector into Studio selection flow.
   - Done: selected character shows DEF files, AIR timeline, sprite source, axis, Clsn1/Clsn2, CMD routes, CNS states, and related trace/report evidence.

8. **Stage Studio preview**
   - Owner: Studio / renderer.
   - Build: stage report, bounds, floor, zoffset, starts, camera, BG layers, parallax/tiling, unsupported features.
   - Done: imported and native stages can be inspected visually and through report records; imported BG layers now have per-layer rendered/animated/fallback/missing/unsupported evidence, bounded/unsupported BGCtrl rows, and Studio has a dedicated `Stage` surface for selected stage facts, available stage switching, BG layer status, BG controller diagnostics, file coverage, layer fallbacks, and unsupported stage features.

9. **Generated asset authoring records**
   - Owner: Assets / Studio.
   - Build: prompt/source records, atlas QA records, contact sheet/GIF paths, collision/action authoring placeholders.
   - Done: generated fighter validity is traceable from source prompt to runtime manifest and QA report.

10. **Studio visual planning pass**
    - Owner: Product / Studio.
    - Build: generate or sketch three distinct Creator Studio layout directions before a large UI rewrite; selected direction must preserve central playtest/preview, dense evidence tables, warnings, and contextual inspector.
    - Done: chosen direction is implemented only after binding to real project/runtime/evidence data and passing browser visual QA.

11. **IKEMEN profile scanner**
   - Owner: Compatibility.
   - Current cut: scanner/reporting first cut detects ZSS files/references/controller syntax, Lua files/hooks including `hook.*`, IKEMEN config JSON, screenpack/select signals, `IkemenVersion`, selected IKEMEN-only controllers/triggers/`AssertSpecial` flags, model-stage assets, and named 3D/Z stage params. Results flow into `CompatibilityReport.profiles.ikemen`, unsupported features, exported compatibility JSON, DebugPanel, and Studio Evidence.
   - Done: reports separate MUGEN 1.0, MUGEN 1.1, and IKEMEN-only scanner claims without attempting IKEMEN execution.
   - Next: add a broader fixture corpus for IKEMEN-only system/stage packages, keep mapping the official source trigger/controller tables, and keep ZSS/Lua execution blocked.

12. **App and runtime extraction plan**
    - Owner: Architecture.
    - Build: extract `App.ts` Studio surface renderers and `PlayableMatchRuntime.ts` systems without broad rewrites.
    - Done: each extraction has no behavior drift, or drift is captured by trace/smoke evidence.

13. **Shared module contract draft**
    - Owner: Architecture / Studio.
    - Build: define input, asset, snapshot, render, audio, debug, build, and QA contracts after fighting seams are proven.
    - Done: contract draft explicitly forbids CNS, HitDef, round, helper, and MUGEN command routing in shared core.

## Definition Of Done By Task Type

| Task Type | Required Closeout |
| --- | --- |
| Parser/compiler | Focused tests plus `pnpm test`; docs update if support level changes. |
| Runtime/controller/combat/tick order | Focused tests, `pnpm qa:trace`, final artifact inspection, support-level docs. |
| Type/API/build package | `pnpm typecheck`, `pnpm build`, package/schema docs. |
| UI/renderer/stage/sprite/debug panel | Browser visual QA, preferably `pnpm qa:smoke`, plus diagnostics/screenshots. |
| Studio data surface | QA bridge fields, evidence links, local save/reopen behavior when persistent. |
| Generated assets | Source prompt/provenance, atlas QA, contact sheets/GIFs, browser screenshot, trace where playable. |

Every closeout should add the short claim pair:

```txt
Claim allowed: ...
Claim blocked: ...
```

For compatibility work, the claim pair must name the fixture or trace artifact. For UI/Studio work, it must name the browser evidence or QA bridge field. For generated assets, it must name the source/atlas/QA/trace provenance.

## Parallel Work Policy

Allowed in parallel:

- Asset Library, Evidence Browser, Build Center, and Debug Studio improvements that read existing runtime/project data.
- Generated asset experiments that remain labeled generated/native and do not count as imported MUGEN compatibility.
- Stage Studio preview/reporting before BGCtrl editing.
- IKEMEN scanning/reporting before IKEMEN execution.

Blocked until gates pass:

- Executing ZSS/Lua.
- Rollback/netplay.
- Full screenpack/motif parity.
- Production platformer/beat-em-up module work.
- Advanced Studio editing that cannot save, compile, playtest, and report evidence.

## Fixture Matrix

| Fixture | Role | Required Next Evidence |
| --- | --- | --- |
| Native generated roster | Always-playable baseline. | Runtime smoke, atlas QA badges, hit/whiff trace. |
| Official KFM | Main compatibility gate. | Required when fixture exists: normal, special, guard, hitstun, state exit, Common1 get-hit/fall. |
| KFM720 | Localcoord/scale stress. | Inspector/runtime scale sanity and compatibility report. |
| CodeFuMan | SFF v1/PCX stress. | Imported sprite decode plus one routed attack. |
| SF3 Ryu demo | Parser/report stress. | Parse/report without crash; runtime playability not required yet. |
| Imported stage | Presentation gate. | Stage report plus visual rendered/fallback/unsupported layer evidence. |

## Current Non-Goals

- Full MUGEN/IKEMEN parity claim.
- IKEMEN execution.
- Generic engine SDK implementation.
- New game genre runtime.
- Sprite fixes by cropping bad generated motion.
- Green status badges without linked evidence.

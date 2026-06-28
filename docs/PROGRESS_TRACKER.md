# Progress Tracker

Last updated: 2026-06-28

This document is the compact truth board for progress. It does not replace detailed docs; it points to the evidence that keeps claims honest.

## Progress Control System

Use these files together:

| File | Role |
| --- | --- |
| `CONTEXT.md` | Fast project/domain map for future agents. |
| `AGENTS.md` | Working rules, verification baseline, skill setup. |
| `docs/ROADMAP_NAVIGATION.md` | Fast route map for docs ownership, package lanes, score evidence, setup-project profile, and anti-drift rules. |
| `docs/ROADMAP_PROGRESS_SYSTEM.md` | Source-of-truth order, package lifecycle, horizon ladder, update matrix, and closeout template. |
| `docs/ROADMAP_PACKAGE_MILESTONES.md` | Compact active package ladder, milestone exits, next recommended slice, and package closeout ownership. |
| `docs/ROADMAP_CONTINUITY_GUIDE.md` | Continuity rules, next useful gates, documentation update matrix, and closeout template for long-running work. |
| `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` | Task-type checklist for runtime, renderer, Studio, generated assets, IKEMEN scanner, modular boundaries, docs-only setup, and score movement. |
| `docs/ROADMAP_RELEASE_TARGETS.md` | Release-train targets, usable milestones, and score-movement rules. |
| `docs/ROADMAP_EXECUTION_BOARD.md` | Current implementation queue, package acceptance, and handoff checklist. |
| `docs/PORT_COMPLETION_SCORECARD.md` | Authoritative 0-100 scorecard for playable sandbox, MUGEN, IKEMEN, Studio, and modular engine horizons. |
| `docs/WORKPLAN.md` | Current execution authority. |
| `docs/BUILD_EXECUTION_BACKLOG.md` | Detailed history and backlog ledger. |
| `.scratch/roadmap/PRD.md` | Local roadmap-tracking PRD. |
| `.scratch/roadmap/issues/` | Small actionable issue slices for runtime, Studio, assets, IKEMEN, and modular-engine tracks. |

Rule: this tracker stays short. Update score changes in `docs/PORT_COMPLETION_SCORECARD.md`, add detailed implementation history to `docs/BUILD_EXECUTION_BACKLOG.md`, and use `.scratch/roadmap/issues/` for next-slice planning.

## Current Score

| Horizon | Score | Meaning |
| --- | ---: | --- |
| Playable private sandbox | 65 / 100 | Local match is playable with generated/native fighters, imported KFM route, stages, debug panels, and Studio workflow. |
| Practical MUGEN compatibility by layers | 35 / 100 | DEF/AIR/CMD/CNS/SFF/SND pieces exist, many controllers/triggers have bounded gates, but broad character compatibility remains partial. |
| MUGEN 1.0/1.1 MVP port | 20 / 100 | Infrastructure is in place for KFM/Common1-style authored routes, but exact VM/combat/helper/screenpack parity is still open. |
| Full MUGEN/Ikemen-GO port | 10-12 / 100 | Foundation exists. Full VM parity, helpers, redirects, teams, lifebars/screenpacks, Lua/ZSS, exact tick order, rollback/netplay, and broad fixture matrix remain future work. |

Docs/setup work in this round does not change scores. It improves project-control continuity only.

## Immediate Execution Order

| Slot | Cut | Done when |
| --- | --- | --- |
| 1 | R1 runtime compatibility gate | Default next slice: required `HitBy` mismatch-reject trace, unless already closed by newer code. |
| 2 | R2 MatchWorld ownership | One mutable behavior moves behind a named system with focused coverage and no hidden checksum drift. |
| 3 | S1 Studio trust chain | Evidence and Build show one shared truthful status/next action, visually verified. |
| 4 | A1 generated asset QA/provenance | One generated/native fighter or asset record links source prompt, sheet, atlas, QA, collisions, and playtest result. |
| 5 | I1 IKEMEN scanner | One more IKEMEN-only signal is classified by tests as recognized, unsupported, or unknown. |
| 6 | M1 shared boundary | One shared contract is proven free of fighting/MUGEN leakage. |

Docs/setup work is Slot 0: keep future agents aligned, then return to Slot 1 unless the user changes priority. Use `docs/ROADMAP_PACKAGE_MILESTONES.md` to choose the exact package.

## Evidence Snapshot

| Area | Current Proof | Still Weak |
| --- | --- | --- |
| Runtime | `pnpm qa:trace` required artifacts, native/generated roster, imported KFM optional fixtures. Latest runtime aggregate: 154/154 artifacts passed, 136 required and 18 optional. Latest new required oracle: `synthetic-imported-hitby-reject.json` checksum `65185fd1`, proving bounded static `HitBy value = S,NT` mismatch rejection of `HitDef attr = S,NA` through typed `eligibility:hitby`, reject telemetry, no accepted hit, and final P2 life `1000`. | Exact controller/VM tick order inside frames, helpers as real VM actors, persistent controllers, exact hit-eligibility attr grammar/slot priority, broad hitpause side-effect ordering, custom states/throws, teams, full guard/fall/recovery semantics and exact FightFX/sound timing. |
| Three.js rendering | `pnpm qa:smoke` screenshots and canvas checks, including active desktop/mobile diagnostics for `HitSparkRenderer` resolving `S`-prefixed player AIR spark frames into sprites when available, plus bounded common/FightFX system lookup-frame and package-frame handoff unit/runtime coverage with 180-frame fallback geometry when AIR/sprite lookup fails. | Pixel-perfect MUGEN render parity, real fight.def/FightFX/common AIR/SFF loading, decoded system-SFF provider registration, full spark animation timing, palette application, screenpack/lifebar parity. |
| Parsers/loaders | DEF/AIR/CMD/CNS/SFF/SND parsers with reports. | SFF v2 edge formats, full CNS expression language, all controller params, broader corpus. |
| Studio | Workbench, Assets, Evidence, Debug, Modules, Build surfaces. | True editing workflows, regenerate/relink automation, multi-artifact trace diff depth. |
| IKEMEN | Scanner-only profile for ZSS/Lua/config/screenpack/model-stage signals. | No ZSS/Lua execution, no rollback/netplay, no IKEMEN runtime extensions. |
| Modular engine | Shared contracts and boundary tests. | Platformer proof slice blocked until fighting contracts stay stable. |
| Project control | `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/agents/*`, `docs/adr/0001-roadmap-control-and-local-issues.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, and `.scratch/roadmap/*` define setup, issue tracking, skill routing, release targets, next concrete gates, score evidence, and closeout. | Must keep docs synchronized after every score/support/queue change. |

## Next Required Cuts

0. **Hit-eligibility required trace gate**
   - Current proof added: required `synthetic-imported-hitby-reject.json` checksum `65185fd1` rejects `HitBy value = S,NT` against `HitDef attr = S,NA`.
   - The gate requires typed `eligibility:hitby` evidence, reject event/combat-reason telemetry, and final P2 life `1000`, while focused preset coverage asserts no accepted hit event.
   - This complements `synthetic-imported-hitby-allow.json` and `synthetic-imported-reject.json` without claiming exact attr grammar or slot priority.

1. **MatchWorld ownership**
   - Move more lifecycle/combat/pause/target behavior behind named systems.
   - Keep trace checksum drift intentional and documented.
   - Current proof added: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish state, winner/message snapshot wording, and reset behavior with focused unit coverage. This is sandbox round-state ownership, not MUGEN/IKEMEN round/lifebar/team/screenpack parity.
   - Current proof added: required `synthetic-imported-round-ko.json` checksum `bfd5f073` gates `RoundSnapshot` KO/winner/message/timer evidence through `RuntimeTraceGate.requiredRoundFrames`, plus final P2 life `0`. This proves trace visibility for bounded sandbox KO state, not exact MUGEN/IKEMEN round flow.
   - Current proof added: required `synthetic-imported-round-timeover.json` checksum `7d9f7907` gates `RoundSnapshot` `timeover` draw/winner/message/timer evidence with a short `roundTimerFrames` fixture. This proves bounded time-over trace visibility, not exact timer or round-transition parity.
   - Current proof added: `RuntimeTargetWorld.snapshotRuntimeState` now owns cloned target-memory snapshots consumed by `MatchWorld` actor records. Focused tests prove target refs, TargetBind bindings, `BindToTarget`, and DebugPanel registry rendering remain stable. This is ownership cleanup, not broader target redirect/team/helper parity.
   - Current proof added: `RuntimePauseWorld` now owns current match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset. Focused tests prove the boundary and existing trace gates still cover bounded `Pause`/`SuperPause` evidence. This is ownership cleanup, not exact pause-layering parity.
   - Current proof added: `RuntimeEnvShakeWorld` now owns bounded EnvShake/FallEnvShake event insertion and deterministic multi-actor camera-shake projection. Focused tests prove the boundary while preserving existing actor event histories for renderer/debug/trace consumers. This is ownership cleanup, not exact EnvShake waveform or pause/stage/layer parity.
   - Current proof added: `RuntimeAudioWorld` now owns bounded `PlaySnd`/`StopSnd` event insertion. Focused tests prove the boundary while preserving existing actor sound-event histories for Web Audio/debug/trace consumers. This is ownership cleanup, not exact sound timing/mixing/channel parity.
   - Current proof added: `RuntimeEnvColorWorld` now owns bounded `EnvColor` event history, stage-flash projection, and reset. Focused tests prove the boundary while preserving existing stage-frame color/opacity trace behavior. This is ownership cleanup, not exact blend/layer/window/pause parity.
   - Current proof added: `RuntimeSpriteEffectWorld` now owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking. Focused tests prove the boundary while preserving existing actor presentation telemetry. This is ownership cleanup, not exact draw-order, trail, palette, or renderer parity.
   - Current proof added: `RuntimeActorConstraintWorld` now owns bounded `Width`, one-frame `PlayerPush`/`PosFreeze`/`ScreenBound` constraint reset/projection, stage clamping, and body-push separation. Focused tests prove the boundary while preserving existing actor body/bounds telemetry. This is ownership cleanup, not exact player/edge collision, team/helper push, or screen/camera parity.
   - Current proof added: `RuntimeDirectCombatWorld` now owns bounded direct hit/guard result mutation plus same-tick direct `HitDef` priority win/trade mutation: life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup. Focused tests prove the boundary while preserving existing direct HitDef telemetry. This is ownership cleanup, not exact priority classes, throws, multi-hit, helper/team/redirect, or tick-order parity.
   - Current proof added: `RuntimeHitOverrideWorld` now owns bounded HitOverride slot ticking and redirect mutation for direct and projectile combat paths. Focused tests prove the boundary while preserving existing HitOverride telemetry. This is ownership cleanup, not exact slot priority, attr grammar, helper/custom-state redirect breadth, or edge timing parity.
   - Current proof added: `RuntimeReversalWorld` now owns bounded ReversalDef activation, active counter detection, and counter-result mutation for direct HitDef contact paths. Focused tests prove the boundary while preserving existing ReversalDef telemetry. This is ownership cleanup, not exact priority, guard/projectile/helper/custom-state breadth, attr grammar, trigger lifetime, or tick-order parity.
   - Current proof added: `RuntimeProjectileCombatWorld` now owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation plus projectile clash trade/cancel/decrement mutation consumed by `RuntimeEffectActorWorld`. Focused tests prove the boundary while preserving existing projectile telemetry. This is ownership cleanup, not exact priority classes, multi-targets, helper-owned projectiles, terminal timing, guard effects, or tick-order parity.
   - Current proof added: `RuntimeEffectSpawnWorld` now owns bounded Explod/Helper/Projectile spawn resolution, RemoveExplod dispatch, ModifyProjectile dispatch, and ModifyExplod dispatch before those calls reach `RuntimeEffectActorWorld`. Focused tests prove the boundary while preserving existing effect actor telemetry. `synthetic-imported-modifyexplod.json` checksum `bca75991` proves bounded live owner-side Explod mutation through typed operation evidence. This is ownership cleanup plus one bounded controller cut, not exact effect lifecycle, helper VM, parent/root/redirect, FightFX, or spawn timing parity.
   - Current proof added: `RuntimeEffectLifecycleWorld` now owns bounded active-effect tick, presentation tick, paused presentation tick, effect snapshot grouping, and shared get-hit cleanup orchestration for the current effect actor families. Focused tests prove the boundary while preserving existing effect telemetry. This is ownership cleanup, not helper VM lifecycle, exact effect pause/combat ordering, exact remove-trigger timing, parent/root/redirect parity, or full effect lifecycle parity.

2. **KFM/Common1 precision**
   - Tighten guard/fall/recovery timing and velocity semantics.
   - Current proof added: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` observes imported defender actor-frame `5050` while `hitFall.recoverTime` is positive and later actor-frame `5210` with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
   - Current proof added: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates summarized actor-frame order where `5050` countdown evidence must precede `5210` recovery evidence, plus a bounded named controller/operation sequence requiring `5050` `VelAdd` `Gravity` before `ChangeState` `Recovery Input`, then `5210` `VelSet`, `kinematic:velset`, `HitFallSet`, `hitfall:hitfallset`, and `ChangeState`.
   - Current proof added: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
   - Current proof added: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground recovery selection through `5050 -> 5200 -> 5201 -> 52 -> 0`, including `SelfState`, `VelSet`, `PosSet`, actor-frame velocity telemetry for synthetic ground-recovery constants, and ordered named controller/typed-operation evidence from `5050` gravity/recovery input through `5200` self-land, `5201` safety/land, and `52` control restore.
   - Current proof added: required `synthetic-imported-default-fall-recovery-too-early.json` checksum `050e7e3c` detects `command = "recovery"` while `fall.recovertime` is still positive, forbids `5210`, and keeps the defender in `5050`.
   - Current optional fixture proof added: `kfm-official-default-fall-recovery-too-early.json` checksum `878b10b5` confirms real KFM/Common1 rejects the same early recovery window locally.
   - Current optional fixture proof added: `kfm-official-default-fall-recovery-threshold.json` checksum `891d0f6d` confirms real KFM/Common1 exposes ordered state-frame threshold evidence: `5050` while `hitFall.recoverTime` is still positive, before `5200` with `recoverTime = 0` and ground recovery branch `5200 -> 5201 -> 52 -> 0` after `command = "recovery"` is accepted near the ground.
   - Current optional fixture proof added: `kfm-official-default-fall-ground-recovery.json` checksum `dd48f0b8` now requires bounded real KFM controller/typed-operation order through `5050` gravity/recovery input, `5200` self-land, and `52` landing operations.
   - Current guard proof added: required `synthetic-imported-default-guard-state.json` checksum `016938a1`, `synthetic-imported-crouch-guard-state.json` checksum `6c4321af`, `synthetic-imported-diagonal-crouch-guard-state.json` checksum `1dd33fb5`, and `synthetic-imported-air-guard-state.json` checksum `ce9cc9ba` now gate ordered named controller/typed-operation evidence for bounded stand, crouch, atomic-`DB`, and air guard-hit routes, including `kinematic:hitvelset` and `resource:ctrlset`.
   - Current auto guard proof added: required `synthetic-imported-auto-guard-start.json` checksum `0c734290` now gates actor-frame order `120` before `130`, and required `synthetic-imported-auto-guard-end.json` checksum `d1dc0aa3` gates `120 -> 130 -> 140` plus final `0`/control. This is bounded state-order evidence, not exact proximity guard or full guard-end parity.
   - Current HitDef-effect proof added: required `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6` proves bounded `HitDef guardsound = S6,0` event telemetry as an attacker-side `PlaySnd`, required `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124` proves bounded `sparkno = S7001` plus `sparkxy = 10,-72` event telemetry as an attacker-side hit `HitSpark`, and required `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a` proves bounded `guard.sparkno = S7000` plus `sparkxy = 12,-64` event telemetry as an attacker-side guard `HitSpark` after imported direct-hit routes. `HitSparkRenderer` now treats `S` refs as player AIR actions, resolves a first frame to sprite texture when possible, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace when no package frame exists, and `pnpm qa:smoke` gates active desktop/mobile sparks plus player-source resolved-sprite diagnostics on the native route. This is not exact SND/channel/timing/mixing, real fight.def/FightFX/common AIR/SFF loading, decoded system-SFF provider registration, render binding/layering/spark parity.
   - Current optional KFM guard proof added: `kfm-official-default-guard-state.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`, and `kfm-official-default-air-guard-state.json` checksum `f4378971` now gate real KFM/Common1 guard-hit controller/operation order plus actor-frame state/physics/body telemetry for stand, crouch, and air routes when the private fixture exists; `kfm-official-auto-guard-start.json` checksum `ad493cde` and `kfm-official-auto-guard-end.json` checksum `ee962d04` now gate real KFM auto guard-start/end controller/typed-operation order through `120 -> 130 -> 140 -> 0`.
   - Optional official fixture gates cannot become public compatibility claims unless fixture is present and passing.

3. **Compatibility trace coverage**
   - Add missing required traces for controller families currently covered only by unit/runtime tests.
   - Current proof added: dedicated `synthetic-imported-hitby-allow.json` checksum `c75d5c7d` for bounded `HitBy` allow-list acceptance through typed `eligibility:hitby`, `synthetic-imported-hitby-reject.json` checksum `65185fd1` for bounded `HitBy` allow-list mismatch rejection through typed `eligibility:hitby`, `synthetic-imported-reject.json` checksum `5aca7dc0` for `NotHitBy` deny-list rejection through typed `eligibility:nothitby`, `synthetic-imported-assertspecial-guarddeny.json`, `synthetic-imported-assertspecial-crouch-guarddeny.json`, `synthetic-imported-assertspecial-air-guarddeny.json`, and `synthetic-imported-assertspecial-lifetime.json` trace artifacts for bounded defender-side `NoStandGuard` / `NoCrouchGuard` / `NoAirGuard` hit-over-guard evidence plus one-frame `NoStandGuard` expiry evidence, `synthetic-imported-animation.json` for bounded `ChangeAnim` / partial `ChangeAnim2` active AIR retargeting evidence, `synthetic-imported-control.json` for typed `CtrlSet` / `resource:ctrlset` control-restore evidence, `synthetic-imported-kinematic.json` for typed `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd` position/velocity evidence, `synthetic-imported-gravity.json` for typed `Gravity` / `kinematic:gravity` vertical velocity evidence, `synthetic-imported-envshake.json` for partial `EnvShake` runtime event evidence, `synthetic-imported-sound.json` for partial `PlaySnd` / `StopSnd`, `synthetic-imported-noop.json` for `Null` / browser no-op `ForceFeedback` execution visibility, plus `synthetic-imported-resource.json` for typed `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet` and `synthetic-imported-variable.json` for `VarSet` / `VarAdd` / `VarRangeSet`.

4. **Studio trust workflow**
   - Improve Evidence/Build as the authority for current state, stale inputs, blocked exports, and next actions.

5. **Roadmap hygiene**
   - Use `docs/ROADMAP_NAVIGATION.md` as the first fast map for ownership, lanes, score evidence, setup-project profile, and anti-drift rules.
   - Use `docs/ROADMAP_PROGRESS_SYSTEM.md` to decide which doc owns each fact.
   - Use `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` to decide closeout gates for the current work type.
   - Use `docs/ROADMAP_RELEASE_TARGETS.md` to keep release trains and usable milestones aligned with scores.
   - Use `docs/ROADMAP_EXECUTION_BOARD.md` as the first queue/handoff map.
   - Keep `docs/BUILD_EXECUTION_BACKLOG.md` append-only enough to preserve history.
   - Keep `docs/WORKPLAN.md` as execution authority.
   - Keep this tracker short and updated after meaningful milestones.

## Active Queue Snapshot

| Package | Linked issue | Next proof |
| --- | --- | --- |
| R1 KFM/Common1 recovery precision | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` | Next proof should move beyond synthetic threshold, optional ordered KFM threshold oracle, summarized actor-frame tick order, bounded named controller/operation order, bounded air/ground velocity telemetry, optional KFM auto guard-start/end order, optional KFM guard-hit frame physics, required guard sound plus hit/guard spark telemetry, and smoke-gated player AIR plus bounded common/FightFX system/package-frame spark metadata into deeper VM loop order, real fight.def/FightFX/common AIR/SFF loading with provider registration/binding/layering/timing, or broader Common1 parity. |
| R2 MatchWorld ownership | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` | Continue after round/target/pause/env-shake/audio/envcolor/sprite-effect/actor-constraint/direct-combat/direct-priority/hitoverride/reversal/projectile-combat/effect-spawn/effect-lifecycle ownership; next proof should target helper VM boundaries, combat/effect ordering, deeper presentation semantics, target ownership, or exact checksum-stable ownership. |
| S1 Studio Evidence/Build trust | `.scratch/roadmap/issues/02-studio-evidence-workflow.md` | Shared status contract plus visual QA. |
| A1 Generated asset provenance/QA | `.scratch/roadmap/issues/03-generated-assets-pipeline.md` | Prompt/source/atlas/QA/collision/playtest record with failing motion/scale states visible. |
| I1 IKEMEN scanner/reference | `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` | Scanner-only findings backed by tests and docs. |
| M1 Shared contract readiness | `.scratch/roadmap/issues/05-modular-engine-boundaries.md` | One shared contract candidate proven free of fighting-specific leakage. |

## Closeout Contract

Every compatibility milestone should leave:

- focused code/test changes
- docs update with claim allowed / claim blocked
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm qa:trace` for runtime/compat changes
- `pnpm qa:smoke` plus visual inspection for frontend/render changes

## Not Done

- Full MUGEN VM
- Full Ikemen-GO runtime
- ZSS/Lua execution
- Full helper VM
- Full screenpack/lifebar engine
- Full teams/simul/tag/turns
- Rollback/netplay
- Exact palette/render parity
- Broad public fixture corpus

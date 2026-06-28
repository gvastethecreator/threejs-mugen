# Roadmap Execution Board

Last updated: 2026-06-28

This is the short operating board for choosing the next slice without re-reading every roadmap file. It does not replace `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/WORKPLAN.md`, `docs/PORT_COMPLETION_SCORECARD.md`, or `docs/BUILD_EXECUTION_BACKLOG.md`; it points at the exact next packages and the docs that must change when progress moves.

## Read Order

Use this order before starting broad work:

1. `CONTEXT.md`
2. `AGENTS.md`
3. `docs/ROADMAP_PROGRESS_SYSTEM.md`
4. `docs/ROADMAP_RELEASE_TARGETS.md`
5. `docs/ROADMAP_EXECUTION_BOARD.md`
6. `docs/PROGRESS_TRACKER.md`
7. `docs/WORKPLAN.md`
8. Relevant `.scratch/roadmap/issues/<NN>-*.md`

Use `docs/PORT_COMPLETION_SCORECARD.md` when answering "how far are we?" or changing scores.

## Release Target Now

Current release target: **MUGEN-lite playable MVP**.

This means the default native/generated match stays playable while an imported KFM/Common1-style package gains more fixture-backed routes. The next score-moving work must produce runtime trace, focused test, visual QA, fixture, or build/export evidence. This docs/setup pass improves R0 project control only and does not move scores.

## Current Position

| Track | Current status | Next package | Blocked claim |
| --- | --- | --- | --- |
| Playable sandbox | Playable native/generated match with Three.js, HUD, stage, debug, smoke evidence. | Keep stable while compatibility and Studio move. | Does not prove imported MUGEN parity. |
| MUGEN runtime | Partial imported runtime with many typed controller/trigger trace gates. | KFM/Common1 recovery, guard, tick-order, and MatchWorld ownership cuts. | Full CNS VM, helpers, custom states, teams, screenpacks. |
| IKEMEN | Scanner/reporting only for ZSS/Lua/config/screenpack/model-stage signals. | Expand scanner references and unsupported reporting. | No ZSS/Lua execution, rollback, netplay, IKEMEN runtime semantics. |
| Studio | Workbench, Assets, Evidence, Build, Debug, Character/Stage surfaces exist. | Make Build/Evidence the single trust chain for next actions and stale/blocking state. | Full editor, asset DB, production export. |
| Generated assets | Native/generated fighters and stages are playable evidence for authoring pipeline. | Provenance plus motion/scale/baseline QA ingestion. | Imported compatibility credit. |
| Modular engine | Boundary docs exist, platformer slice intentionally delayed. | Extract only contracts proven by fighting runtime and Studio evidence. | Production multi-genre engine. |

See `docs/ROADMAP_RELEASE_TARGETS.md` for the release-train ladder and score-movement rules.

## Active Implementation Queue

### R1 - KFM/Common1 Recovery Precision

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` observes imported defender actor-frame `5050` with positive `hitFall.recoverTime`, then `5210` with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
- Current proof: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates summarized actor-frame order where `5050` with positive recover time appears before `5210` recovery evidence, and now also gates a bounded named controller/operation sequence from `5050` `VelAdd` `Gravity` before recovery `ChangeState` into `5210` `VelSet` / `kinematic:velset` / `HitFallSet` / `hitfall:hitfallset` / `ChangeState`.
- Current proof: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
- Current proof: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground selection through `5050 -> 5200 -> 5201 -> 52 -> 0`, with `SelfState`, `VelSet`, `PosSet`, and actor-frame velocity telemetry for synthetic ground-recovery constants.
- Current guard proof: required `synthetic-imported-default-guard-state.json` checksum `016938a1`, `synthetic-imported-crouch-guard-state.json` checksum `6c4321af`, `synthetic-imported-diagonal-crouch-guard-state.json` checksum `1dd33fb5`, and `synthetic-imported-air-guard-state.json` checksum `ce9cc9ba` gate bounded stand/crouch/atomic-`DB`/air guard-hit controller/operation routes through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`; air also gates `VelAdd` gravity evidence.
- Current optional fixture proof: `kfm-official-default-fall-recovery-threshold.json` checksum `891d0f6d` confirms real KFM/Common1 reaches state `5050` while `hitFall.recoverTime` is still positive, then accepts recovery into the ground branch `5200 -> 5201 -> 52 -> 0` when the private fixture is present; the gate now also requires ordered actor-frame evidence where the positive `5050` observation precedes `5200` with `recoverTime = 0`.
- Build next recovery proof not already covered by threshold/actor-frame tick-order/named controller-operation order/early-reject/positive/air-velocity/ground-selection/official ordered-threshold routes: broader recovery parity, deeper VM tick-order coverage, or guard/Common1 confirmation.

Acceptance:

- Focused tests or `pnpm qa:trace` required artifact.
- Claim allowed names artifact and route.
- Claim blocked keeps exact tick-order, full recovery parity, and broad character claims out of scope.

### R2 - MatchWorld Ownership Deepening

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish state, winner/message projection, and reset semantics, with focused unit coverage and unchanged `pnpm qa:trace` aggregate behavior.
- Current proof: required `synthetic-imported-round-ko.json` checksum `bfd5f073` and `synthetic-imported-round-timeover.json` checksum `7d9f7907` use `RuntimeTraceGate.requiredRoundFrames` to gate bounded `RoundSnapshot` KO and time-over/draw evidence. Current trace aggregate: 146/146 artifacts passed, 128 required and 18 optional.
- Current proof: `RuntimeTargetWorld.snapshotRuntimeState` owns cloned target-memory snapshots consumed by `MatchWorld` actor records, with focused tests proving target refs, TargetBind bindings, and `BindToTarget` registry evidence remain stable.
- Current proof: `RuntimePauseWorld` owns current match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset while preserving existing `Pause`/`SuperPause` trace behavior.
- Current proof: `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic multi-actor camera-shake projection consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeAudioWorld` owns bounded `PlaySnd`/`StopSnd` event insertion consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking consumed by `PlayableMatchRuntime`, with focused `SpriteEffectSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeActorConstraintWorld` owns bounded `Width`, per-frame `PlayerPush`/`PosFreeze`/`ScreenBound` constraint reset/projection, stage clamping, and body-push separation consumed by `PlayableMatchRuntime`, with focused `ActorConstraintSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeDirectCombatWorld` owns bounded direct hit/guard result mutation consumed by `PlayableMatchRuntime`, including same-tick direct `HitDef` priority win/trade mutation, life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup, with focused `DirectCombatSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and redirect mutation consumed by direct and projectile combat paths, with focused `HitOverrideSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeReversalWorld` owns bounded ReversalDef activation, active counter detection, and counter-result mutation consumed by direct HitDef contact paths, with focused `ReversalSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeProjectileCombatWorld` owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation plus projectile clash trade/cancel/decrement mutation consumed by `RuntimeEffectActorWorld`, with focused `ProjectileCombatSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectSpawnWorld` owns bounded Explod/Helper/Projectile spawn resolution, RemoveExplod dispatch, and ModifyProjectile dispatch consumed by `PlayableMatchRuntime`, with focused `EffectSpawnSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectLifecycleWorld` owns bounded active-effect tick, presentation tick, paused presentation tick, effect snapshot grouping, and shared get-hit cleanup orchestration consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, `RuntimeHitOverrideWorld`, and `RuntimeReversalWorld`, with focused `EffectLifecycleSystem` coverage and unchanged trace behavior expected.
- Move one mutable runtime area behind a named world/system boundary without changing behavior: deeper helper/projectile/explod VM lifecycle, combat/effect ordering, target links, deeper audio semantics, or deeper presentation ownership.
- Gate ownership through existing trace fields where possible rather than adding new UI.

Acceptance:

- Existing checksums either stay stable or drift is intentional and documented.
- Focused unit tests cover boundary contract.
- No new compatibility claim unless trace proves behavior.

### S1 - Studio Evidence/Build Trust Chain

Issue: `.scratch/roadmap/issues/02-studio-evidence-workflow.md`

Build next:

- Make Evidence and Build read the same status contract for stale, missing, partial, blocked, unsupported, and exportable state.
- Surface one primary next action per blocked item.
- Link rows to trace/report/runtime data already produced by the app.

Acceptance:

- Browser visual QA with `pnpm qa:smoke`.
- Screenshot/diagnostic inspection confirms no decorative green status.
- Docs update `docs/INTERFACE_SYSTEM.md` and this board if workflow meaning changes.

### A1 - Generated Asset Provenance And QA

Issue: `.scratch/roadmap/issues/03-generated-assets-pipeline.md`

Build next:

- Store source prompt, source image/sheet path, atlas manifest, contact sheet/GIF, collision/action data, and QA report links in one record.
- Add motion/scale/baseline QA status that can fail generated walk/crouch/jump frames.

Acceptance:

- Bad locomotion requires source regeneration, not atlas cropping.
- Studio shows QA state and next action.
- Generated/native assets remain separate from imported MUGEN compatibility scores.

### I1 - IKEMEN Reference Expansion

Issue: `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md`

Build next:

- Map more Ikemen-GO source/docs signals into scanner-only findings.
- Keep every finding classified as recognized, unsupported, or unknown unless runtime execution is gated.

Acceptance:

- Scanner tests prove the new signals.
- Docs keep MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and IKEMEN runtime future work separate.

### M1 - Shared Contract Readiness

Issue: `.scratch/roadmap/issues/05-modular-engine-boundaries.md`

Build next:

- Identify one shared contract candidate from project, asset, input, tick, snapshot, render, audio, debug, build, or QA.
- Prove it is not importing CNS, CMD, HitDef, rounds, helpers, targets, or MUGEN command routing.

Acceptance:

- Docs or boundary tests show what is shared vs fighting-specific.
- No platformer runtime begins until fighting smoke/trace gates remain stable.

## Progress Update Rules

Update these files when a package moves:

| Change type | Required docs |
| --- | --- |
| Support level or compatibility behavior | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant issue. |
| Score or answer to "0 to 100" changes | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, this board. |
| Release target or usable-milestone wording changes | `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/PROGRESS_TRACKER.md`, this board. |
| Studio workflow meaning changes | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue. |
| Generated asset pipeline changes | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue. |
| Modular boundary moves | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue. |

## Agent Handoff Contract

Before closing a round:

- State exact files changed.
- State checks run.
- State why `pnpm qa:trace` or `pnpm qa:smoke` was or was not required.
- Do not mark an issue done unless evidence exists and docs name the blocked scope.
- Do not raise scores from docs-only changes.

Use `docs/ROADMAP_PROGRESS_SYSTEM.md` for package lifecycle, update matrix, and the closeout template when a slice touches more than one doc family.

## Current Anti-Claims

- No full MUGEN/IKEMEN parity.
- No ZSS/Lua execution.
- No rollback/netplay.
- No full helper/custom-state/throw VM.
- No full screenpack/lifebar engine.
- No public bundled commercial/third-party characters.
- No platformer/module runtime until fighting contracts stabilize.

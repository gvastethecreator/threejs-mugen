# Roadmap Execution Board

Last updated: 2026-06-28

This is the short operating board for choosing the next slice without re-reading every roadmap file. It does not replace `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/WORKPLAN.md`, `docs/PORT_COMPLETION_SCORECARD.md`, or `docs/BUILD_EXECUTION_BACKLOG.md`; it points at the exact next packages and the docs that must change when progress moves.

Use `docs/ROADMAP_CONTINUITY_GUIDE.md` when turning this board into a next implementation cut or when resuming after a long pause.

## Read Order

Use this order before starting broad work:

1. `CONTEXT.md`
2. `AGENTS.md`
3. `docs/ROADMAP_PROGRESS_SYSTEM.md`
4. `docs/ROADMAP_RELEASE_TARGETS.md`
5. `docs/ROADMAP_EXECUTION_BOARD.md`
6. `docs/ROADMAP_CONTINUITY_GUIDE.md`
7. `docs/PROGRESS_TRACKER.md`
8. `docs/WORKPLAN.md`
9. Relevant `.scratch/roadmap/issues/<NN>-*.md`

Use `docs/PORT_COMPLETION_SCORECARD.md` when answering "how far are we?" or changing scores.

## Release Target Now

Current release target: **MUGEN-lite playable MVP**.

This means the default native/generated match stays playable while an imported KFM/Common1-style package gains more fixture-backed routes. The next score-moving work must produce runtime trace, focused test, visual QA, fixture, or build/export evidence. This docs/setup pass improves R0 project control only and does not move scores.

## Operating Snapshot

| Priority | Workstream | Next shippable proof | Evidence gate | Score effect |
| --- | --- | --- | --- | --- |
| P0 | Project control | Keep setup-project, local issues, AGENTS, and roadmap routing synchronized. | `pnpm test`, `pnpm typecheck`, `pnpm build` for docs-only closeout. | No score movement. |
| P1 | R1 runtime compatibility | One bounded Common1/controller/trigger behavior with trace or focused test. | `pnpm qa:trace` plus normal gates when runtime semantics change. | Possible MUGEN-lite movement only if scorecard evidence threshold is met. |
| P1 | R2 MatchWorld ownership | One mutable runtime behavior moved behind named world/system boundary. | Focused system tests; trace stable or intentionally documented. | Usually architecture debt reduction, not score movement by itself. |
| P2 | S1 Studio trust chain | Evidence and Build consume one shared status/next-action contract. | `pnpm qa:smoke` plus visual inspection. | Possible Studio movement only with real bound evidence data. |
| P2 | A1 generated assets | One provenance record links prompt/source/atlas/QA/collision/playtest. | Asset QA proof; visual QA if visible. | Generated/native confidence only, never imported MUGEN compatibility. |
| P3 | I1 IKEMEN scanner | One new recognized/unsupported/unknown IKEMEN signal. | Focused scanner tests and blocked runtime wording. | Scanner-only movement, no IKEMEN execution claim. |
| P3 | M1 modular boundary | One shared contract proven free of fighting-specific leakage. | `pnpm check:boundaries` or equivalent contract test. | Modular readiness only. |

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

## Next Concrete Gates

These are ordered candidates, not new score claims:

1. R1: move one Common1 recovery/guard tick-order slice from summarized evidence toward exact controller-loop ordering.
2. R1: promote one more optional official KFM guard/fall/recovery route into a stricter local oracle when the private fixture exists.
3. R1 presentation: deepen FightFX/common spark presentation beyond first-pass package `fight.def`/AIR/SFF loading, decoded system-SFF provider registration, bounded AIR-duration frame advance, and bounded AIR/SFF axis binding: exact layering, scale, palette, and motif/screenpack ownership remain open.
4. R2: deepen one `MatchWorld` ownership boundary around target links, effect ordering, helper lifecycle, or presentation effects without behavior drift.
5. R2: add trace evidence for effect/combat ordering if ownership changes can affect checksums.
6. S1: make Studio Evidence and Build read one shared status/next-action contract.
7. S1: add visual QA for any Studio workflow reshaping, using real evidence rows and blocked actions.
8. A1: store generated asset prompt/source/atlas/contact-sheet/QA/collision/playtest provenance as one record.
9. A1: surface motion/scale/baseline QA failures so bad sprites trigger regeneration, not cropping.
10. I1: expand scanner-only Ikemen-GO references from source/docs into recognized/unsupported/unknown findings with tests.
11. M1: prove one shared project/asset/input/snapshot/debug/build contract has no fighting-specific leakage.
12. R3 later: add another private fixture corpus package only as local evidence; no bundled third-party assets.

## Active Implementation Queue

### R1 - KFM/Common1 Recovery Precision

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` observes imported defender actor-frame `5050` with positive `hitFall.recoverTime`, then `5210` with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
- Current proof: required `synthetic-imported-common-gethit.json` checksum `713e49b7` now gates bounded P2 FallEnvShake runtime event telemetry for state `5100` plus ordered custom get-hit controller/typed-operation evidence through `HitFallVel -> HitFallDamage -> HitFallSet -> FallEnvShake`.
- Current proof: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates summarized actor-frame order where `5050` with positive recover time appears before `5210` recovery evidence, and now also gates a bounded named controller/operation sequence from `5050` `VelAdd` `Gravity` before recovery `ChangeState` into `5210` `VelSet` / `kinematic:velset` / `HitFallSet` / `hitfall:hitfallset` / `ChangeState`.
- Current proof: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
- Current proof: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground selection through `5050 -> 5200 -> 5201 -> 52 -> 0`, with `SelfState`, `VelSet`, `PosSet`, actor-frame velocity telemetry for synthetic ground-recovery constants, and ordered named controller/typed-operation evidence from `5050` gravity/recovery input through `5200` self-land, `5201` safety/land, and `52` control restore.
- Current visual-effect proof: required `synthetic-imported-modifyexplod.json` checksum `bca75991` gates bounded typed `ModifyExplod` operation evidence and live owner-side visual Explod mutation for static velocity, acceleration, scale, remove time, sprite priority, remove-on-get-hit, and pause-budget telemetry through `RuntimeEffectSpawnWorld` / `RuntimeEffectActorWorld`. Dynamic params, position rebinding, helper-owned Explods, FightFX/common routing, remove-trigger parity, exact tick order, and full Explod lifecycle parity remain blocked.
- Current trigger proof: focused compiler/evaluator/runtime-controller tests cover bounded `HitPauseTime` expression support against the current actor hitpause counter, and required `synthetic-imported-hitpausetime-ignorehitpause.json` checksum `a3a78bb8` proves an imported active-state `ChangeState` with `ignorehitpause = 1` can branch on `HitPauseTime > 0` into state `220` during global hitpause while P1 records `HitPause:player` advance and P2 records player freeze. Persistent controller semantics, helper-owned controller execution, broad side-effect ordering, and exact hitpause tick-order parity remain blocked.
- Current guard proof: required `synthetic-imported-default-guard-state.json` checksum `016938a1`, `synthetic-imported-crouch-guard-state.json` checksum `6c4321af`, `synthetic-imported-diagonal-crouch-guard-state.json` checksum `1dd33fb5`, and `synthetic-imported-air-guard-state.json` checksum `ce9cc9ba` gate bounded stand/crouch/atomic-`DB`/air guard-hit controller/operation routes through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`; air also gates `VelAdd` gravity evidence.
- Current auto guard proof: required `synthetic-imported-auto-guard-start.json` checksum `0c734290` now gates ordered actor-frame evidence for `120` before `130`, and required `synthetic-imported-auto-guard-end.json` checksum `d1dc0aa3` gates `120 -> 130 -> 140` plus final idle/control evidence. This is minimum bounded guard-start/end state-order evidence, not exact proximity guard, guard-end timing, controller-loop parity, or full guard VM parity.
- Current AssertSpecial proof: required `synthetic-imported-assertspecial-noko.json` checksum `9dd76f9b` now gates bounded P2 state `0` `Passive AssertSpecial` before P1 state `200` lethal `HitDef`, plus final P2 life `1`; this is minimum NoKO flag-before-hit evidence only, not exact round/no-KO parity.
- Current AssertSpecial guard-deny proof: required `synthetic-imported-assertspecial-guarddeny.json` checksum `f636748d`, `synthetic-imported-assertspecial-crouch-guarddeny.json` checksum `e47a0cb1`, and `synthetic-imported-assertspecial-air-guarddeny.json` checksum `62179385` now gate defender-side `AssertSpecial` before attacker-side guardable `HitDef` for stand/crouch/air denial routes; this is minimum flag-before-hit evidence only, not exact guard-rule parity.
- Current HitDef-effect proof: required `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6` gates bounded `HitDef guardsound = S6,0` into attacker-side `PlaySnd` telemetry, required `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124` gates bounded `sparkno = S7001` plus `sparkxy = 10,-72` into attacker-side hit `HitSpark` telemetry, and required `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a` gates bounded `guard.sparkno = S7000` plus `sparkxy = 12,-64` into attacker-side guard `HitSpark` telemetry after imported direct-hit routes. `HitSparkRenderer` now treats `S` refs as player AIR action ids, resolves local player AIR frames into sprite textures when available, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace when no package frame exists, draws bounded fallback geometry when AIR/sprite lookup fails, and `pnpm qa:smoke` warms the renderer, resets the round, drives native contact, and checks active desktop/mobile sparks plus player-source resolved-sprite diagnostics. `MugenCharacterLoader` now discovers optional `data/fight.def`, resolves `fightfx.air` / `fightfx.sff`, parses those AIR actions as both `common` and `fightfx` hit-spark libraries, decodes the system SFF when possible, `createImportedFighterDefinition` carries those package-backed libraries into the runtime fighter definition, `App` registers decoded system SFF sprites through a global hit-spark provider route, focused renderer coverage proves package-backed `common`/`fightfx` frames resolve through that global provider route without player-owner context, package-backed frame lists advance by AIR frame duration, resolved spark sprite meshes bind around the `sparkxy` anchor using AIR frame offsets plus SFF axes with facing applied, and QA diagnostics expose selected frame/sprite-axis/local-position metadata for inspection. This is first-pass package asset discovery/handoff/provider/lookup/timed-frame/axis-binding evidence, not exact channel/timing/mixing, layering, scale, palette, motif ownership, or full system-effect parity.
- Current optional fixture guard proof: `kfm-official-default-guard-state.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`, and `kfm-official-default-air-guard-state.json` checksum `f4378971` now require ordered controller/typed-operation evidence plus actor-frame state/physics/body telemetry for real KFM/Common1 stand `150 -> 151`, crouch `152 -> 153`, and air `154 -> 155 -> 52` guard-hit routes when the private fixture exists; air also requires bounded velocity/landing frame telemetry. `kfm-official-auto-guard-start.json` checksum `ad493cde` and `kfm-official-auto-guard-end.json` checksum `ee962d04` now also require ordered real KFM auto guard-start/end evidence through `120 -> 130 -> 140 -> 0`, including `StateTypeSet`/`metadata:statetypeset` and return-to-idle `VelSet` evidence.
- Current optional fixture proof: `kfm-official-default-fall-recovery-threshold.json` checksum `891d0f6d` confirms real KFM/Common1 reaches state `5050` while `hitFall.recoverTime` is still positive, then accepts recovery into the ground branch `5200 -> 5201 -> 52 -> 0` when the private fixture is present; the gate now also requires ordered actor-frame evidence where the positive `5050` observation precedes `5200` with `recoverTime = 0`. `kfm-official-default-fall-ground-recovery.json` checksum `dd48f0b8` now also requires bounded official KFM controller/typed-operation order through `5050` `VelAdd`/`ChangeState`, `5200` `VelAdd`/`SelfState`, and `52` landing `VelSet`/`PosSet`/`kinematic:*`/`ChangeState` evidence.
- Build next recovery/guard proof not already covered by threshold/actor-frame tick-order/named controller-operation order/early-reject/positive/air-velocity/ground-selection/official ordered-threshold/official auto guard-start-end/official guard-hit frame-physics/required guard sound plus hit/guard spark telemetry/player-AIR, bounded common/FightFX system render/source-metadata routes, package-frame handoff tests, first-pass real fight.def/FightFX/common AIR/SFF loading/provider registration tests, renderer global-provider lookup tests, AIR-duration frame advance tests, bounded AIR/SFF axis binding, and frame/axis QA diagnostics: broader recovery parity, deeper VM tick-order coverage, exact FightFX/common layering/scale/palette, or broader guard-effect parity.

Acceptance:

- Focused tests or `pnpm qa:trace` required artifact.
- Claim allowed names artifact and route.
- Claim blocked keeps exact tick-order, full recovery parity, and broad character claims out of scope.

### R2 - MatchWorld Ownership Deepening

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish state, winner/message projection, and reset semantics, with focused unit coverage and unchanged `pnpm qa:trace` aggregate behavior.
- Current proof: required `synthetic-imported-round-ko.json` checksum `bfd5f073` and `synthetic-imported-round-timeover.json` checksum `7d9f7907` use `RuntimeTraceGate.requiredRoundFrames` to gate bounded `RoundSnapshot` KO and time-over/draw evidence.
- Current proof: required `synthetic-imported-noop.json` checksum `57c74c93` gates imported `Null` and browser no-op `ForceFeedback` controller execution visibility before a simple `HitDef` route. Current trace aggregate: 152/152 artifacts passed, 134 required and 18 optional.
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
- Current proof: `RuntimeMatchInteractionWorld` owns bounded post-fighter interaction ordering for target-memory aging, active-effect advance, projectile clash, body separation, target bindings, direct priority/direct combat, projectile combat, stage clamp, and presentation-effect advance, with focused `MatchInteractionSystem` order coverage and unchanged trace behavior expected.
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

- Current proof: `IkemenFeatureScanner` recognizes IKEMEN-GO data ZSS presentation/system controllers `LifeBarAction`, `GameMakeAnim`, `Text`, and `RedLifeSet` as scanner-only unsupported findings, with focused scanner coverage.
- Map more Ikemen-GO source/docs signals into scanner-only findings.
- Keep every finding classified as recognized, unsupported, or unknown unless runtime execution is gated.

Acceptance:

- Scanner tests prove the new signals.
- Docs keep MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and IKEMEN runtime future work separate.

### M1 - Shared Contract Readiness

Issue: `.scratch/roadmap/issues/05-modular-engine-boundaries.md`

Build next:

- Current proof: `pnpm check:boundaries` runs `scripts/check_boundaries.cjs` and guards future `src/core/**`, future platformer module paths, and `src/engine/**` shared contracts against fighting/MUGEN leakage outside explicit boundary registries; `runtime-manifest/v0` also exports this proof command as `contracts.verificationCommands.boundary`.
- Identify one shared contract candidate from project, asset, input, tick, snapshot, render, audio, debug, build, or QA.
- Prove it is not importing CNS, CMD, HitDef, rounds, helpers, targets, or MUGEN command routing.

Acceptance:

- Docs or boundary tests show what is shared vs fighting-specific.
- `pnpm check:boundaries` passes for any shared/module boundary move.
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

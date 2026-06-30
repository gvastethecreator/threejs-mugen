# Next Build Roadmap

Last updated: 2026-06-30

This is the tactical roadmap for the next autonomous build rounds. It sits below the scorecard and above the local issue files:

- `docs/PORT_COMPLETION_SCORECARD.md` owns 0-100 status.
- `docs/ROADMAP_EXECUTION_BOARD.md` owns the current queue.
- `.scratch/roadmap/issues/` owns agent-sized slices.
- This file explains which slices should happen next, why they matter, and what evidence closes them.

Docs-only changes here do not move scores.

## Current Checkpoint

Latest project-control truth:

```txt
G1 setup-project refresh
  -> AGENTS.md and docs/agents/* are the active setup-project profile
  -> local markdown issues, canonical labels, and single-context docs remain the defaults
  -> roadmap health checks now tell future agents how to avoid duplicate closed gates
  -> lane checkpoint taxonomy prevents latest UI/docs work from replacing latest runtime evidence
  -> no score movement; return to R1/R2 evidence-producing work next
```

Latest Studio/UI truth:

```txt
S1 Studio CSS module split and shadow prune
  -> src/styles/studio.css is the single Studio CSS entrypoint, delegating to base/legacy/editor/runtime/desktop/shell/command/workflows category modules
  -> pnpm fix:css now removes exact duplicate rules plus fully shadowed same-selector and cross-file rules
  -> active command shell ownership lives in src/styles/command/studio-command-shell.css, studio-command-pipeline.css, studio-command-playfield.css, and studio-command-console.css
  -> qa:css reports 538,290 bytes, 2,379 rules, 0 duplicate selector keys / 0 instances, 0 exact duplicate rules, 124 repeated declaration groups, 108 cross-file overlaps, 0 selectors shared with src/style.css, 0 fully shadowed legacy style.css rules, and 0 fully shadowed cross-file rules
  -> qa:css:budget now freezes current debt ceilings for CSS cleanup/review rounds: 538,290 bytes, 2,379 rules, 124 repeated declaration groups, 108 cross-file overlaps, and zero exact/shadowed/src-style overlap regressions
  -> latest narrow cleanup moved Build/Evidence right-rail header chrome into shared Studio primitive selectors and removed local duplicate Assets action icon/primary rules
  -> prior narrow cleanup grouped legacy Studio truncation/text-wrap/grid/align/text rows into shared CSS atoms and passed CSS budget checks; visual smoke remains required for broader UI changes
  -> requires qa:smoke and visual inspection; product-surface hygiene only
S1 Studio command chrome label/grid follow-up
  -> compact command rail compile-project action now says Build
  -> utility action cells keep fixed desktop tracks and visible truncated labels instead of icon-only buttons
  -> Workbench Project Health now shows text Readiness state beside the score
  -> app shell and remaining legacy Studio cascade moved out of src/style.css into app-shell, studio-legacy-surfaces, studio-editor-cascade, studio-ui-hardening, and studio-desktop-authority modules
  -> qa:css reports 2,622 rules, 83 duplicate selector keys / 184 instances, 0 exact duplicate rules, 198 repeated declaration groups, 79 cross-file overlaps, 0 selectors shared with src/style.css, and 0 fully shadowed legacy style.css rules
  -> requires qa:smoke and visual inspection; product-surface hygiene only
S1 Studio command-center CSS overlap prune
  -> legacy src/style.css no longer carries command-center desktop overrides for chrome, compact tabs, stage, console, round HUD, and mission-node fragments
  -> active ownership now lives in split studio-command-shell/pipeline/playfield/console modules
  -> mission rows and compact Studio tabs expose textual status instead of color-only dots
  -> dead tab-dot CSS was pruned after the compact navigator switched to tab-state badges
  -> qa:css reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 216 repeated declaration groups, 40 cross-file overlaps, 16 selectors shared with src/style.css, 3 command-center selectors still shared with legacy src/style.css, and 0 fully shadowed legacy style.css rules
  -> product-surface hygiene only; deeper shared shell/foundation primitives remain open
S1 Studio CSS cascade prune
  -> obsolete legacy Evidence/Release Desk blocks removed from src/style.css
  -> src/styles/command/studio-command-palette.css, src/styles/workflows/studio-stage.css, and src/styles/workflows/studio-inspector.css now own their desktop surfaces after the shared Studio modules
  -> fully overridden same-selector rules and old global Module ledger repair block pruned from legacy style.css
  -> src/styles/workflows/studio-system-ledgers.css owns two-line Module rows and 40px system actions
  -> qa:css reads CSS in src/main.ts import order and reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 216 repeated declaration groups, 40 cross-file overlaps, 16 selectors shared with src/style.css, and 0 fully shadowed legacy style.css rules
  -> qa:smoke plus screenshots inspected Workbench, Modules, Modules contracts, and Runtime with no horizontal overflow or broken module rows
  -> product-surface hygiene only; deeper shared primitives and token cleanup remain open
S1 Studio trust/system-ledger CSS extraction
  -> Build/Evidence ownership lives in src/styles/workflows/studio-trust-ledgers.css
  -> Modules/Debug ownership lives in src/styles/workflows/studio-system-ledgers.css
  -> previous qa:css baseline reported 4,035 rules, 372 duplicate selector keys, and 0 exact duplicate rules
  -> qa:smoke plus screenshots inspected studio-modules, studio-debug, studio-build, and studio-evidence
  -> product-surface hygiene only; it does not change the next runtime/port slice
S1 Studio chrome CSS containment
  -> duplicate desktop command-chrome correction block removed and merged into the main desktop command-desk block
  -> qa:smoke confirms Workbench desktop/tablet have no horizontal overflow and Build/Compile action remains executable
  -> static detector still reports repeated P2/P3 interface patterns, so deeper CSS primitive extraction remains open
  -> does not change the next runtime/port slice
S1 Studio command inspector readability and smoke stability
  -> compact Studio command/readability pass closed with qa:smoke, screenshots, tests, typecheck, build, and diff-check
  -> keeps Studio more usable for future workbench/build/evidence flows
  -> does not change the next runtime/port slice
```

Latest implementation truth:

```txt
R1 official-style recovery trace promotion
  -> synthetic-imported-default-fall-official-recovery-threshold.json checksum 86804271 is now a required qa:trace artifact
  -> synthetic-imported-default-fall-official-recovery-too-early.json checksum ef945ff5 is now a required qa:trace artifact
  -> current qa:trace aggregate is 180/180 artifacts, 160 required and 20 optional
  -> this narrows Common1 recovery threshold/rejection evidence only; no exact fall.recovertime tables, velocity math, controller-loop tick order, public KFM support, score movement, or full parity claim
R2 RuntimeTargetWorld candidate-resolution ownership
  -> RuntimeTargetWorld.resolveCandidates now owns bounded target-candidate filtering from live target memory
  -> Target* / BindToTarget controller application and active TargetBind / BindToTarget position application pass through that filter before mutation
  -> PlayableMatchRuntime still owns trigger ordering, state validation, the concrete actor roster, helper/projectile actor materialization, and combat context
  -> focused TargetSystem coverage proves actor-id and target-id filtering plus mutation only against remembered targets
  -> no helper/projectile target ownership, exact team/multi-target selection, exact target lifetime, throw binding, exact bind tick order, visual parity, or score movement claim
R2 RuntimeExpressionContextWorld ownership extraction
  -> RuntimeExpressionContextWorld now owns bounded active runtime ExpressionContext creation for imported triggers and dynamic controller-param fallback
  -> PlayableMatchRuntime delegates target redirects, contact/projectile/effect count reads, command/const/state/anim/hitvar reads, HitDefAttr, HitPauseTime/HitOver/HitShakeOver, InGuardDist, random/stage/time wiring to that world
  -> PlayableMatchRuntime still owns trigger grouping/order, active-state dispatch, next-random source, animation timing callbacks, and exact VM timing
  -> focused RuntimeExpressionContextSystem coverage proves numeric reads, Target redirect, compiled trigger evaluation, const/state/HitVar helpers, and shared context creation
  -> no full expression language parity, composite HitDefAttr parity, helper/team/redirect mutation, exact VM timing, visual parity, or score movement claim
R2 RuntimeStateTransitionControllerWorld ownership extraction
  -> RuntimeStateTransitionControllerWorld now owns bounded passive ChangeState/SelfState setup in the basic StateControllerExecutor path
  -> StateControllerExecutor delegates raw-param value/stateno expression fallback, previous-state metadata writes, frame/time reset, optional ctrl, and missing-value reporting to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> RuntimeStateEntryWorld and PlayableMatchRuntime still own active-state entry, concrete state/action lookup, custom-state owner selection, and controller tick order
  -> focused StateTransitionControllerSystem coverage proves expression fallback, metadata writes, reset, ctrl, missing-value no-op/reporting, unchanged-state timing reset, and executor routing
  -> no exact ChangeState/SelfState tick-order parity, persistent controller semantics, redirects/helper/team ownership, full custom-state breadth, state-entry VM parity, or score movement claim
R2 RuntimeAnimationControllerWorld ownership extraction
  -> RuntimeAnimationControllerWorld now owns bounded passive ChangeAnim/ChangeAnim2 setup in the basic StateControllerExecutor path
  -> StateControllerExecutor delegates raw-param animation retargeting, self/state-owner source marking, reset, and bounded elem/elemtime seeding to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> PlayableMatchRuntime still owns active-state action lookup, state-owner action selection, and controller tick order
  -> focused AnimationControllerSystem coverage proves expression fallback, known-AIR elem/elemtime seeding, clamped/fallback element behavior, missing-value no-op, and executor routing
  -> no missing-action fallback, full active-state elem/elemtime parity, redirects/helper/team ownership, full state-owner namespace behavior, exact animation-source parity, or score movement claim
R2 RuntimeKinematicControllerWorld ownership extraction
  -> RuntimeKinematicControllerWorld now owns bounded passive VelSet/VelAdd/VelMul/HitVelSet/PosSet/PosAdd/Gravity setup
  -> StateControllerExecutor delegates typed kinematic:* operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> RuntimeKinematicsWorld still owns per-frame actor integration, sandbox gravity, ground snap, and landing hooks
  -> focused KinematicControllerSystem coverage proves typed setup, raw expression fallback, default-axis behavior, hit-velocity flags, gravity defaults, and executor routing
  -> no exact MUGEN/IKEMEN physics, velocity tick order, yaccel constants, helper/team/redirect ownership, full kinematic VM parity, or score movement claim
R2 RuntimeBoundsControllerWorld ownership extraction
  -> RuntimeBoundsControllerWorld now owns bounded passive PlayerPush/PosFreeze/ScreenBound setup
  -> StateControllerExecutor delegates typed collision:playerpush/bounds:* operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> RuntimeActorConstraintWorld still owns one-frame reset/projection, stage clamp, and body-push separation
  -> focused BoundsControllerSystem coverage proves typed setup, raw defaults, raw expression fallback, and executor routing
  -> no exact player/edge collision, team/helper push behavior, screen-edge/camera parity, PosFreeze tick order, full constraint VM parity, or score movement claim
R2 RuntimeHitFallControllerWorld ownership extraction
  -> RuntimeHitFallControllerWorld now owns bounded passive HitFallVel/HitFallDamage/HitFallSet mutation
  -> StateControllerExecutor delegates typed hitfall operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> focused HitFallControllerSystem coverage proves typed setup, raw expression fallback, stored fall velocity, fall.defence_up scaling, and nonlethal fall damage
  -> no exact Common1 controller-loop order, helper/team/redirect ownership, exact recovery thresholds/velocity math, full fall/get-hit parity, or score movement claim
R2 RuntimeStateTypeWorld ownership extraction
  -> RuntimeStateTypeWorld now owns bounded passive StateTypeSet stateType/moveType/physics setup
  -> StateControllerExecutor delegates typed metadata operations and raw-param fallback mutations to the world
  -> executor still owns controller routing and broad runtime-controller execution
  -> focused StateTypeSystem coverage proves typed setup, raw case-normalized fallback, and invalid raw no-op behavior
  -> no dynamic metadata expressions, helper/team/redirect ownership, exact physics/tick-order interactions, full StateTypeSet parity, or score movement claim
R2 RuntimeDamageScaleWorld ownership extraction
  -> RuntimeDamageScaleWorld now owns bounded passive AttackMulSet/DefenceMulSet multiplier setup
  -> StateControllerExecutor delegates typed damage-scale operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> focused DamageScaleSystem coverage proves typed setup, raw expression fallback, clamp behavior, and no-value no-op behavior
  -> no exact scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, full damage-scale parity, or score movement claim
R2 RuntimeHitDefenseWorld ownership extraction
  -> RuntimeHitDefenseWorld now owns bounded passive HitBy/NotHitBy/HitOverride slot setup/removal
  -> StateControllerExecutor delegates typed eligibility/hitoverride operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> focused HitDefenseSystem coverage proves typed and raw setup/removal semantics
  -> no exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, full defensive-slot parity, or score movement claim
R2 RuntimeHitDefControllerDispatchWorld ownership extraction
  -> RuntimeHitDefControllerDispatchWorld now owns bounded active-state HitDef activation dispatch into the current attack payload
  -> PlayableMatchRuntime delegates controller telemetry, typed hitdef operation selection, raw fallback attack params, fired-HitDef dedupe, current-frame Clsn1 hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry
  -> match runtime still owns trigger filtering, active-state order, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, and target/reversal consequences
  -> focused HitDefSystem coverage proves activation payloads and duplicate suppression through the dispatch boundary
  -> no exact HitDef trigger lifetime, contact ordering, multi-hit windows, helper/projectile/custom-state ownership, broad attr grammar, full HitDef VM parity, or score movement claim
R2 RuntimeReversalControllerDispatchWorld ownership extraction
  -> RuntimeReversalControllerDispatchWorld now owns bounded active-state ReversalDef dispatch into RuntimeReversalWorld
  -> PlayableMatchRuntime delegates controller telemetry, typed reversaldef operation selection, raw fallback activation payload, activation handoff, and operation telemetry
  -> match runtime still owns trigger filtering, active-state order, current-frame hitbox lookup, and later counter-result state routing
  -> focused ReversalSystem coverage proves controller/op telemetry plus activation through the dispatch boundary
  -> no exact ReversalDef priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, full ReversalDef VM parity, or score movement claim
R2 RuntimeEffectSpawnControllerDispatchWorld ownership extraction
  -> RuntimeEffectSpawnControllerDispatchWorld now owns bounded active-state Explod/RemoveExplod/ModifyExplod/Helper/Projectile/ModifyProjectile dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed effect operation selection, spawn/count mutation handoff, and success-gated operation telemetry through RuntimeEffectSpawnWorld
  -> match runtime still owns trigger filtering, active-state order, actor/opponent context, effect actor world ownership, and exact spawn/combat ordering
  -> focused EffectSpawnSystem coverage proves successful Explod telemetry/mutation and failed ModifyExplod no-operation gating through the dispatch boundary
  -> no exact effect spawn tick order, helper-owned effect namespaces, dynamic effect params, helper-owned projectile combat/contact/target memory, full effect/helper/projectile VM parity, or score movement claim
R2 RuntimeFallEnvShakeControllerDispatchWorld ownership extraction
  -> RuntimeFallEnvShakeControllerDispatchWorld now owns bounded active-state FallEnvShake side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed fallenvshake operation selection, fall-shake event handoff, hitFall.envShake cleanup, and operation telemetry through RuntimeEnvShakeWorld
  -> match runtime still owns trigger filtering, active-state order, actor/world ownership, and upstream HitDef fall metadata
  -> focused EnvShakeSystem coverage proves FallEnvShake telemetry/mutation through the dispatch boundary
  -> no exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, or score movement claim
R2 RuntimeActorConstraintControllerDispatchWorld ownership extraction
  -> RuntimeActorConstraintControllerDispatchWorld now owns bounded active-state Width side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed collision:width operation selection, operation telemetry, and body-width mutation handoff through RuntimeActorConstraintWorld
  -> match runtime still owns trigger filtering, active-state order, per-frame constraint reset, stage clamp, and body-push ordering
  -> focused ActorConstraintSystem coverage proves Width telemetry/mutation through the dispatch boundary
  -> no exact player/edge collision, team/helper push behavior, screen-edge/camera parity, Width edge semantics, full constraint VM parity, or score movement claim
R2 RuntimePauseControllerDispatchWorld ownership extraction
  -> RuntimePauseControllerDispatchWorld now owns bounded active-state Pause/SuperPause side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed pause operation selection, apply-controller callback handoff, and operation telemetry through the dispatch boundary
  -> match runtime still owns trigger filtering, active-state order, RuntimePauseWorld mutation, power/log application, paused-match progression, and hitpause ignored routing
  -> focused PauseSystem coverage proves SuperPause telemetry/application through the dispatch boundary
  -> no exact pause layering, super background/sound/spark timing, helper/redirect ownership, full pause VM parity, or score movement claim
R2 RuntimeEnvShakeControllerDispatchWorld ownership extraction
  -> RuntimeEnvShakeControllerDispatchWorld now owns bounded active-state EnvShake side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed envshake operation selection, operation telemetry, and EnvShake event handoff through RuntimeEnvShakeWorld
  -> match runtime still owns trigger filtering, active-state order, actor/world ownership, and FallEnvShake routing
  -> focused EnvShakeSystem coverage proves EnvShake telemetry/mutation through the dispatch boundary
  -> no exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, or score movement claim
R2 RuntimeEnvColorControllerDispatchWorld ownership extraction
  -> RuntimeEnvColorControllerDispatchWorld now owns bounded active-state EnvColor side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed envcolor operation selection, operation telemetry, and EnvColor event handoff through RuntimeEnvColorWorld
  -> match runtime still owns trigger filtering, active-state order, stage-world ownership, and pause/hitpause callback routing
  -> focused EnvColorSystem coverage proves EnvColor telemetry/mutation through the dispatch boundary
  -> no exact blend math, layer/window ordering, pause timing, renderer parity, full presentation parity, or score movement claim
R2 RuntimeAudioControllerDispatchWorld ownership extraction
  -> RuntimeAudioControllerDispatchWorld now owns bounded active-state audio side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed audio operation selection, operation telemetry, and PlaySnd/StopSnd event handoff through RuntimeAudioWorld
  -> match runtime still owns trigger filtering, active-state order, hit/contact timing, and actor context
  -> focused AudioEventSystem coverage proves PlaySnd telemetry/mutation through the dispatch boundary
  -> no exact SND playback, channel priority, mixing, FightFX/common fallback, full audio parity, or score movement claim
R2 RuntimeContactControllerDispatchWorld ownership extraction
  -> RuntimeContactControllerDispatchWorld now owns bounded active-state contact-memory side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed contact operation selection, operation telemetry, HitAdd mutation, and MoveHitReset reset handoff through RuntimeContactMemoryWorld
  -> match runtime still owns trigger filtering, active-state order, and direct/projectile contact creation
  -> focused ContactMemorySystem coverage proves HitAdd telemetry/mutation and MoveHitReset reset telemetry through the dispatch boundary
  -> no exact combo lifetime, helper/projectile contact ownership, guard-count parity, full CNS VM parity, or score movement claim
R2 RuntimeTargetControllerDispatchWorld ownership extraction
  -> RuntimeTargetControllerDispatchWorld now owns bounded active-state Target / BindToTarget side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed target/bindtotarget operation selection, operation telemetry, and RuntimeTargetWorld mutation handoff
  -> match runtime still supplies damage scaling, TargetState entry validation, target constants, candidate selection, trigger filtering, and active-state order
  -> focused TargetSystem coverage proves TargetLifeAdd telemetry/mutation and BindToTarget anchor/position telemetry through the dispatch boundary
  -> no helper/projectile target ownership, exact multi-target semantics, throw binding, full CNS VM parity, or score movement claim
R2 RuntimeSpriteEffectControllerWorld ownership extraction
  -> RuntimeSpriteEffectControllerWorld now owns bounded active-state sprite-effect side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed sprite-effect operation selection, operation telemetry, and mutation handoff for SprPriority, PalFX, AfterImage, AfterImageTime, and Angle*
  -> RuntimeSpriteEffectWorld remains the mutation/ticking owner for actor presentation state
  -> focused SpriteEffectSystem coverage proves PalFX telemetry/mutation and AfterImage sampling through the dispatch boundary
  -> no exact visual tick order, helper/redirect ownership, renderer parity, full CNS VM parity, or score movement claim
R2 RuntimeStateEntrySetupWorld ownership extraction
  -> RuntimeStateEntrySetupWorld now owns bounded imported State -1 setup-controller selection before command routing
  -> PlayableMatchRuntime delegates imported-only guard, ChangeState bypass, trigger gating, setup-controller classification, and execution handoff through the named world
  -> concrete mutation still routes through RuntimeControllerDispatchWorld so context, telemetry, and unsupported reporting stay centralized
  -> focused RuntimeStateEntrySetupSystem coverage proves imported setup execution, non-imported skip, trigger failure, and non-setup filtering
  -> no exact State -1 ordering, persistent semantics, redirect/helper/team scopes, full CNS VM parity, or score movement claim
R2 RuntimeControllerDispatchWorld ownership extraction
  -> RuntimeControllerDispatchWorld now owns bounded runtime-controller execution dispatch for active imported state controllers, State -1 setup controllers, and pre-facing AssertSpecial application
  -> PlayableMatchRuntime delegates runtime replacement, evaluation context handoff, controller telemetry, typed-operation telemetry, and unsupported reporting through the named world
  -> focused RuntimeControllerDispatchSystem coverage proves runtime mutation, telemetry hook behavior, dynamic HitPauseTime context, and unsupported reporting
  -> no exact CNS controller-loop order, persistent controller semantics, side-effect VM parity, helper/team/redirect execution, or score claim
R2 RuntimeResourceWorld ownership extraction
  -> RuntimeResourceWorld now owns bounded life/power/control/variable mutation inside RuntimeResourceSystem
  -> exported helper functions delegate through that world, preserving existing call sites and semantics
  -> focused RuntimeResourceSystem coverage proves direct world mutation for life, power, ctrl, and vars
  -> no exact CNS resource timing, helper/team/redirect ownership, round/KO flow, full resource parity, or score claim
R1 resource actor-frame evidence gate
  -> RuntimeTraceGate.requiredActorFrames can require observed life/power ranges
  -> required synthetic-imported-resource.json checksum 7bbcb2e4 now proves imported P1 state/action 289 exposes life 750 and power 900 in actor-frame evidence after typed resource:lifeadd/resource:lifeset/resource:poweradd/resource:powerset route through Life/Power triggers
  -> focused RuntimeTraceArtifact and RuntimeTraceGatePresets coverage proves the fields and preset
  -> no exact resource scaling, helper/team/redirect resource ownership, round/KO flow, dynamic lowering, full controller VM parity, or score movement claim
R1 bounded Common1 recovery timer actor-frame gates
  -> RuntimeTraceGate.requiredActorFrames can require observed hitFall.downRecoverTime ranges plus first-to-last drop
  -> required synthetic-imported-default-fall-recovery.json checksum d83797d9 now proves imported P2 5110 has bounded hitFall.downRecoverTime countdown-range and first-to-last-drop evidence before the existing 5110 -> 5120 get-up order
  -> RuntimeTraceGate.requiredActorFrames can now also require observed hitFall.recoverTime first-to-last drop
  -> required synthetic-imported-default-fall-recovery-threshold.json checksum 7bb15a5f and synthetic-imported-default-fall-recovery-tick-order.json checksum e2691aab now prove imported P2 5050 drops from first recoverTime 1 to last recoverTime 0 before 5210 recovery
  -> focused RuntimeTraceArtifact and RuntimeTraceGatePresets coverage proves the field and preset
  -> no exact down.recovertime/fall.recovertime tables, exact Common1 controller-loop timing, animation timing, velocity math, recovery-input branching, public bundled KFM support, full fall-recovery parity, or score movement claim
R2 bounded helper-local Projectile gate
  -> HelperSystem can dispatch bounded helper-local Projectile through RuntimeEffectActorWorld for current visual Helpers
  -> required synthetic-imported-helper-projectile.json checksum 893f9427 proves a visual Helper routes from 1200 to 1212 / anim 932 while spawning owner-side projectile anim 943 with parentId p1-helper-0
  -> pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no helper-owned projectile combat/contact presentation, helper-owned target memory, exact helper projectile namespace scopes, indexed/team/helper-owned redirects, helper-owned HitDef, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score movement claim
R2 bounded helper-local NumHelper gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> HelperSystem can evaluate bounded helper-local NumHelper(id) through RuntimeEffectActorWorld for current visual Helpers against owner-side visual Helper actors in the same effect store
  -> required synthetic-imported-helper-numhelper.json checksum 4e32e951 proves a visual Helper routes from 1200 to 1211 / anim 931 through NumHelper(42) > 0
  -> no exact helper effect-count/ownership parity, indexed/team/helper-owned redirects, helper-owned HitDef, helper-owned Projectile, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score movement claim
R2 bounded helper-local NumExplod gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> HelperSystem can evaluate bounded helper-local NumExplod(id) through RuntimeEffectActorWorld for current visual Helpers after helper-local static Explod spawn
  -> required synthetic-imported-helper-numexplod.json checksum 4328278a proves a visual Helper routes from 1200 to 1210 / anim 930 after spawning owner-side Explod anim 942 and counting that helper-parented Explod by static id
  -> no exact helper effect-count parity, helper-owned HitDef, helper-owned Projectile, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score movement claim
R2 bounded helper-local ModifyExplod gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> HelperSystem can dispatch bounded helper-local static ModifyExplod mutation through RuntimeEffectActorWorld for current visual Helpers after helper-local static Explod spawn
  -> required synthetic-imported-helper-modifyexplod.json checksum 0749041c proves a visual Helper routes through 1200 -> 1208 -> 1209 / anims 928 and 929, spawns owner-side Explod anim 941, and mutates that helper-parented Explod by static id with velocity/scale/priority/pause/remove payload evidence
  -> no helper-owned HitDef, helper-owned Projectile, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score movement claim
R2 bounded helper-local RemoveExplod gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> required synthetic-imported-helper-removeexplod.json checksum ff8658a2 proves a visual Helper routes through 1200 -> 1206 -> 1207 / anims 926 and 927, spawns owner-side Explod anim 940, and removes it with parentId p1-helper-0 lifecycle/payload evidence
R2 bounded helper-local BindToRoot gate
  -> required synthetic-imported-helper-bindtoroot.json checksum bf72306c proves a visual Helper can bind to supplied root runtime state and route from state 1200 to 1204 / anim 924 with actor-frame position plus root ownerBind target/offset payload evidence
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no player-state BindToParent / BindToRoot, nested ancestry where root differs from parent, dynamic bind params, team/keyctrl ownership, helper-owned combat/effects/projectiles, exact binding tick order, full helper binding parity, or score movement claim
R2 bounded helper-local BindToParent gate
  -> HelperSystem compiles and executes bounded helper-local static BindToParent / BindToRoot owner binding for current visual Helper actors when RuntimeEffectLifecycleWorld supplies owner/root runtime state
  -> required synthetic-imported-helper-bindtoparent.json checksum f9922c0e proves a visual Helper can bind to its owner and route from state 1200 to 1203 / anim 923 with actor-frame position plus parent ownerBind target/offset payload evidence
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no player-state BindToParent / BindToRoot, dynamic bind params, nested helper ancestry, team/keyctrl ownership, helper-owned combat/effects/projectiles, exact binding tick order, full helper binding parity, or score movement claim
R2 bounded helper-local EnemyNear gate
  -> HelperSystem expression contexts now receive current two-player opponent runtime state through RuntimeEffectLifecycleWorld during normal, pause, and hitpause presentation paths
  -> required synthetic-imported-helper-enemynear.json checksum 35498955 proves a visual Helper can route from state 1200 to 1202 / anim 922 through helper-local EnemyNear, StateNo and EnemyNear, Life reads
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no EnemyNear(index), teams/simul/turns, helper-owned opponents, keyctrl, nested helper ancestry, helper-owned combat/effects/projectiles, exact opponent selection, exact helper tick order, full helper redirect parity, or score movement claim
R1 bounded dynamic Target redirect trigger gate
  -> ExpressionCompiler and ExpressionEvaluator classify bounded Target, ... and static Target(id), ... trigger redirects as executable in the current two-player target-memory context
  -> PlayableMatchRuntime resolves Target(id) from RuntimeTargetWorld target memory for active-state and State -1 trigger evaluation
  -> required synthetic-imported-target-dynamic-redirect.json checksum 9985b62a proves direct HitDef target id 77 plus owner-local var(0) = 77 can feed Target(var(0)), Life and branch P1 state 200 -> 287; previous synthetic-imported-target-redirect.json checksum 89580963 keeps the static Target(77), Life route gated
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no helper/projectile targets, unsupported or negative target-id expressions, mutation through redirects, teams, multi-target selection, exact target lifetime/tick order, full target redirect parity, or score movement claim
R1 bounded identity-trigger gate
  -> ExpressionCompiler and ExpressionEvaluator classify Name/P1Name/P2Name/AuthorName as executable in the current two-actor runtime context
  -> PlayableMatchRuntime passes fighter display name plus author metadata into active-state, State -1, setup, and dynamic dispatch trigger evaluation
  -> EnemyNear redirect contexts now swap identity metadata as well as actor state, including composite expressions
  -> required synthetic-imported-identity.json checksum c9be5cf1 proves the route into state 276
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no team/simul/helper/player-indexed identity selection, parent/root/target identity redirects, exact string edge parity, or score movement claim
R2 bounded helper-local IsHelper gate
  -> ExpressionCompiler and ExpressionEvaluator classify IsHelper and IsHelper(id) as executable in helper-local contexts
  -> HelperSystem passes helper identity into visual Helper actor trigger evaluation
  -> required synthetic-imported-helper-ishelper.json checksum 37877602 proves helper state 1200 branches to 1201 / anim 921
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no full helper VM, helper-owned combat, parent/root mutation, nested helper ancestry, team ownership, exact tick order, or score movement claim
R2 RuntimeStateClockWorld ownership
  -> RuntimeStateClockWorld owns bounded Time/stateElapsed mutation for active-frame advance and changed-state elapsed reset
  -> PlayableMatchRuntime delegates the inline stateElapsed += 1 and stateElapsed = -1 paths through that boundary
  -> focused RuntimeStateClockSystem tests prove advance, reset, and no-op transition behavior while preserving the -1 -> 0 first-frame convention
  -> no exact CNS Time tick-order parity, persistent-controller timing parity, pause/hitpause timing changes, helper/team/redirect state clocks, or score movement claim
R2 RuntimeStateMetadataWorld ownership
  -> RuntimeStateMetadataWorld owns bounded previous-state transition metadata writes for prevStateNo, prevAnimNo, prevStateType, and prevMoveType
  -> PlayableMatchRuntime delegates state-number changes through that boundary, preserving current StateDef-derived type/move-type capture
  -> StateControllerExecutor ChangeState / SelfState output uses the same helper for the basic runtime-only executor path
  -> focused RuntimeStateMetadataSystem, RuntimeCnsSubset, and PlayableMatchRuntime Prev-trigger tests prove changed-state capture and unchanged-state no-op behavior
  -> no exact state-entry tick order, redirects/helper/team previous-state ownership, persistent controller semantics, full ChangeState/SelfState parity, or score movement claim
R1 Common1 too-early recovery-input positive-window gate
  -> RuntimeTraceGate.requiredActorFrames can require observed hitFall.recoverTime minimum-positive windows
  -> required synthetic-imported-default-fall-recovery-too-early.json checksum 050e7e3c and optional kfm-official-default-fall-recovery-too-early.json checksum d2edbde4 now require P2 5050 actor-frame evidence with min recoverTime >= 1, first-to-last drop >= 1, and at least 2 summarized frames while recovery command is active and recovery states stay forbidden
  -> focused RuntimeTraceArtifact and RuntimeTraceGatePresets coverage proves the field and presets
  -> no exact fall.recovertime tables, exact controller-loop tick order, velocity math, public bundled KFM support, full Common1 recovery parity, or score movement claim
R1 optional KFM recovery-threshold drop gate
  -> optional kfm-official-default-fall-recovery-threshold.json checksum bf7b058a now requires real KFM P2 state 5050 actor-frame evidence with positive hitFall.recoverTime, first-to-last recoverTime drop >= 1, and at least 2 summarized frames before 5200 with recoverTime 0
  -> focused RuntimeTraceGatePresets coverage proves the official-style preset requirement
  -> no exact fall.recovertime tables, exact controller-loop tick order, velocity math, public bundled KFM support, full Common1 recovery parity, or score movement claim
R2 RuntimeStateEntryWorld ownership
  -> RuntimeStateEntryWorld owns bounded state-entry mutation for availability lookup, state-number metadata, changed-state elapsed reset, owner-backed custom-state assignment/clearing, stale move/contact reset, StateDef metadata/control/velocity application, and self/state-owner animation handoff
  -> PlayableMatchRuntime delegates concrete state entry while still supplying compatibility telemetry, contact reset, and action-change callbacks
  -> focused RuntimeStateEntrySystem tests prove normal state entry, owner-backed custom states, owner-derived previous-state metadata, and metadata normalization
  -> no exact CNS ChangeState/SelfState tick order, persistent-controller timing, helper/team/root redirects, full state-entry parity, or score movement claim
R2 TargetSystem stale binding pruning
  -> TargetSystem now drops TargetBind binding records during target-memory advance when the bound actor id / target id no longer survives expiry
  -> the same live-target binding check is shared by target-memory advance, TargetDrop, active TargetBind, and active BindToTarget application
  -> focused TargetSystem tests prove infinite-duration bindings survive only while matching target memory is live
  -> no exact bind/drop tick order, helper/team/multi-target ownership, throws/custom-state binding, full target parity, or score movement claim
R2 TargetSystem active binding lifetime guard
  -> TargetSystem now requires matching live target memory before active TargetBind or BindToTarget position application moves actors
  -> focused TargetSystem tests prove active binding success plus stale-binding no-mutation behavior
  -> no helper/team/multi-target ownership, exact bind/drop tick order, throws/custom-state binding parity, or score movement claim
R2 TargetSystem BindToTarget anchor ownership
  -> TargetSystem owns bounded BindToTarget postype anchor resolution previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime now supplies only character constants; resolveRuntimeTargetAnchor owns Foot/Mid/Head MUGEN size constant lookup
  -> focused TargetSystem tests prove constant-backed anchor math and existing BindToTarget placement
  -> no exact bind tick order, helper/team/multi-target ownership, throws/custom-state binding, full target parity, or score movement claim
R2 RuntimeContactPresentationWorld ownership
  -> RuntimeContactPresentationWorld owns bounded direct HitDef and Projectile contact presentation package emission previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates shared contactId/contactTick/contactKind metadata creation plus attacker-side HitDef/Projectile PlaySnd and HitSpark telemetry through that boundary
  -> focused RuntimeContactPresentationSystem tests prove direct hit package metadata and projectile guard package metadata are shared across sound/spark events while preserving hit-spark asset-frame handoff
  -> no exact intra-tick audio/spark ordering, SND playback/mixing/channel priority, exact FightFX/common lookup/binding/layering/timing/scale/palette, helper-owned contact presentation, multi-target presentation, or score movement claim
R2 RuntimeGuardDistanceWorld ownership
  -> RuntimeGuardDistanceWorld owns bounded InGuardDist/auto-guard proximity checks previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current move presence, spent-hit rejection, pre-active guard-distance window, guardflag/AssertSpecial/unguardable checks, hurtbox fallback handoff, and authored/default guard.dist checks through that boundary
  -> focused RuntimeGuardDistanceSystem tests prove the pre-active window, missing/spent/out-of-window rejects, guardflag and AssertSpecial rejects, unguardable attacks, and authored guard.dist thresholds
  -> no exact proximity guard parity, guard-end timing, guard effects, air-guard landing, broad Common1 controller-loop parity, or score movement claim
R2 RuntimeAnimationWorld ownership
  -> RuntimeAnimationWorld owns bounded actor animation advancement and timing helpers previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current animTime/frameIndex/frameElapsed advancement, final-frame hold, loopStart completion, invalid-duration clamping, AnimTime/AnimElemTime helper math, and current HitDef active-window duration math through that boundary
  -> focused RuntimeAnimationSystem tests prove empty actions, authored durations, frame changes, loop completion, final-frame hold, invalid-duration clamping, and timing helpers
  -> no exact AIR negative-duration semantics, elem/elemtime parity, state-owner namespace behavior, controller tick-order parity, or score movement claim
R2 RuntimeKinematicsWorld ownership
  -> RuntimeKinematicsWorld owns bounded actor position integration, sandbox gravity, ground snap, and landing idle-action request previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current pos/vel advance, airborne gravity, imported hit-state ground-snap preservation, and no-current-move landing idle callback through that boundary
  -> focused RuntimeKinematicsSystem tests prove grounded movement, airborne gravity, landing snap/idle, active-move landing, and imported preserve behavior
  -> no exact MUGEN physics, yaccel constants, landing timing, air recovery parity, helper physics ownership, or score movement claim
R2 RuntimeInputControlWorld ownership
  -> RuntimeInputControlWorld owns bounded local player and simple AI control intent previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates crouch, jump, walk, idle, air drift, NoWalk suppression, AI chase, AI attack cooldown, and local punch/kick intent through that boundary
  -> focused RuntimeInputControlSystem tests prove blocked input, state-entry precedence, movement branches, NoWalk/air drift, and simple AI chase/attack routes
  -> no new input semantics, exact command timing, exact AI behavior parity, full MUGEN/IKEMEN control routing, or score movement claim
R2 RuntimeMoveLifecycleWorld ownership
  -> RuntimeMoveLifecycleWorld owns bounded active move lifecycle mutation previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current move tick, non-reversal attack moveType/velocity lock, completed move cleanup, reversal cleanup, and idle/control restoration callbacks through that boundary
  -> focused RuntimeMoveLifecycleSystem tests prove no-op, active non-reversal move, completed non-reversal move, and completed reversal routes
  -> no new move semantics, exact input/cancel timing, exact MUGEN/IKEMEN active-move lifecycle parity, or score movement claim
R2 helper-local micro-VM ownership
  -> HelperSystem runs a bounded helper-local micro-VM for current visual Helper actors spawned with owner runtime-program data
  -> RuntimeEffectSpawnWorld passes owner runtimeProgram and animation maps into HelperSystem
  -> focused EffectActorSystem tests prove Time-triggered VelSet, ChangeAnim, ChangeState, DestroySelf removal, helper-local CtrlSet/StateTypeSet, helper-local VarSet/VarAdd/VarRandom/VarRangeSet trigger branches, and helper-local PlaySnd/StopSnd sound-event telemetry on helper actors
  -> focused EffectSpawnSystem tests prove the handoff
  -> helper-local resources now include bounded LifeAdd/LifeSet/PowerAdd/PowerSet state and trigger evidence in focused tests
  -> helper-local redirects now include bounded Parent/Root read-only trigger/value evaluation against owner runtime state plus bounded EnemyNear read-only trigger/value evaluation against current opponent state, with focused EffectActorSystem and trace coverage
  -> helper-local static owner binding now includes bounded BindToParent / BindToRoot unit coverage and required BindToParent plus BindToRoot trace coverage with ownerBind target/offset payload requirements
  -> no indexed redirects, EnemyNear(index), player-state BindToParent/BindToRoot, dynamic bind params, team/keyctrl ownership, exact helper resource scopes, helper-owned opponents, helper fvar/sysvar VarRandom, exact random stream parity, exact helper-local sound timing/channel/redirect ownership, helper visual effects, helper-owned HitDefs/Projectiles/Explods, helper combat, nested helper ancestry, exact tick-order/pause parity, full custom-state helper lifecycle, or score movement claim
R2 visual-helper removal ownership
  -> HelperSystem removes current visual helper actors by helper id, runtime serial, or owner-wide clear
  -> RuntimeEffectActorWorld owns the p1/p2-isolated store mutation and reports removed counts
  -> RuntimeEffectSpawnWorld exposes the same handoff for future controller dispatch
  -> focused EffectActorSystem and EffectSpawnSystem tests prove the boundary
  -> no redirects, parent/root/team ownership, helper-owned HitDefs/Projectiles, exact lifecycle tick-order parity, or score movement claim
R1 required combined hit/guard-effect contact-package trace strengthening
  -> synthetic-imported-hitdef-hit-effect-package.json checksum 46aa5ce1
  -> synthetic-imported-hitdef-common-guard-spark.json checksum 7650a09c
  -> synthetic-imported-hitdef-fightfx-guard-spark.json checksum 32f3e92d
  -> synthetic-imported-hitdef-guard-effect-package.json checksum 1c3167b7
  -> required traces prove bounded direct/guarded HitDef contact, attacker-side PlaySnd/HitSpark telemetry, source-frame plus multi-frame AIR metadata for unprefixed common/default and F-prefixed FightFX refs, plus combined hitsound S5,0 + FightFX sparkno F7002 and guardsound S6,0 + FightFX guard.sparkno F7004 package routes with shared non-empty contactId/contactTick/contactKind metadata
  -> gates require at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer/audio handoff
  -> current aggregate after the helper-local Projectile gate is 178/178 artifacts, 158 required and 20 optional
  -> no exact intra-tick sound/spark ordering, SND playback, renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, hit/guard-effect parity, or score movement claim
R2 RuntimeHitPauseWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete hitpause bridge for command buffering and paused presentation
  -> PlayableMatchRuntime delegates those hitpause side effects through RuntimeHitPauseWorld instead of local callback glue
  -> focused RuntimeHitPauseSystem tests prove current tick/input buffering with hitPause: true and RuntimeEffectLifecycleWorld paused presentation using pause kind hitpause
  -> no new hitpause semantics, helper-owned hitpause execution, broad side-effect ordering during hitpause, exact first-frame decrement order, exact hitpause parity, or score movement claim
R2 RuntimePausedMatchWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete paused-match bridge for source-movetime target-memory aging, active-effect advance, presentation-effect advance, active target binding, stage clamp, and frozen-actor paused presentation
  -> PlayableMatchRuntime delegates those paused interaction side effects through RuntimePausedMatchWorld instead of local callback glue
  -> focused PauseSystem tests prove actor-local targetWorld, effectLifecycleWorld, and RuntimeActorConstraintWorld wiring
  -> pnpm qa:trace stays stable at 163/163; no new pause semantics, helper VM during pause, exact pause layering, exact paused effect tick order, parent/root/team redirects, or score movement claim
R2 RuntimeMatchInteractionWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete normal-loop bridge for target-memory aging, active-effect advance, projectile clash, body separation, active target binding, stage clamp, and presentation-effect advance
  -> PlayableMatchRuntime delegates those interaction side effects through RuntimeMatchInteractionWorld instead of local callback glue
  -> focused MatchInteractionSystem tests prove actor-local targetWorld, effectLifecycleWorld, effectActorWorld.resolveProjectileClashes(...), and RuntimeActorConstraintWorld wiring
  -> pnpm qa:trace stays stable at 163/163; no helper VM execution, new target/projectile/effect semantics, exact post-fighter tick-order, pause-specific bridge ownership, parent/root/team redirects, or score movement claim
R2 RuntimeResourceSystem resource-edge ownership
  -> authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control writes moved behind RuntimeResourceSystem helpers
  -> PlayableMatchRuntime pause power deltas, state-entry/control writes, direct/projectile combat power/control mutation, TargetLifeAdd/TargetPowerAdd, and ReversalDef power gain now use that boundary
  -> focused RuntimeResourceSystem, DirectCombatSystem, ProjectileCombatSystem, TargetSystem, ReversalSystem, and PlayableMatchRuntime tests preserve current behavior
  -> no new runtime feature, exact CNS resource tick-order, helper/team/redirect ownership, target/projectile parity, or score movement claim
R2 RuntimeSnapshotWorld effect snapshot aggregation
  -> final Explod/Helper/Projectile effect snapshot aggregation moved out of PlayableMatchRuntime into RuntimeSnapshotWorld
  -> focused RuntimeSnapshotSystem test covers stable p1/p2 effect ordering and clone isolation
  -> no exact effect VM semantics, renderer parity, compatibility-session ownership, or score movement claim
R1 required Common1 fall get-hit entry trace strengthening
  -> synthetic-imported-default-fall-gethit.json checksum 6af73a91
  -> required trace now gates ordered P2 5000 ChangeState before 5030 VelAdd / HitVelSet / kinematic:hitvelset / ChangeState before 5050 VelAdd / ChangeState plus actor-frame 5000 -> 5030 -> 5050
  -> optional kfm-official-default-fall-gethit.json checksum 0b3ece0c now requires bounded official KFM 5000/5030/5050/5100/5101/5110 controller/typed-operation order and actor-frame order when the private fixture exists
  -> no exact Common1 controller-loop tick order, fall/bounce/liedown velocity math, recovery branching, guard-state parity, public bundled KFM, or full fall get-hit parity claim
R1 required Common1 lie-down/get-up recovery trace strengthening
  -> synthetic-imported-default-fall-recovery.json checksum d83797d9
  -> required trace now gates ordered P2 5110 ChangeState before 5120 VelSet / HitFallSet / ChangeState plus actor-frame 5110 -> 5120 and bounded hitFall.downRecoverTime countdown-range / first-to-last-drop evidence in 5110
  -> optional kfm-official-default-fall-recovery.json checksum b1c6456a now requires bounded official KFM 5110/5120 controller/typed-operation order when the private fixture exists
  -> no exact Common1 controller-loop tick order, threshold/down-recovery table, velocity math, recovery-input branching, public bundled KFM, or full fall recovery parity claim
R1 required Common1 stand get-hit progression trace strengthening
  -> synthetic-imported-default-gethit-progression.json checksum ef2a67f8
  -> required trace now gates ordered P2 5000 ChangeState before 5001 ChangeState plus actor-frame 5000 -> 5001 and final idle/control
  -> no exact HitShakeOver/HitOver tick timing, fall/bounce/liedown/recovery parity, helper/custom-state breadth, or score movement claim
R1 required common/FightFX HitSpark asset-frame trace strengthening
  -> synthetic-imported-hitdef-common-spark.json checksum 5ea054d7
  -> synthetic-imported-hitdef-fightfx-spark.json checksum 11537b56
  -> required traces prove bounded source-frame plus multi-frame AIR metadata for unprefixed common/default and F-prefixed FightFX hit spark refs
  -> gates require at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer handoff
  -> no exact renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, or score movement claim
R1 optional KFM x HitDef presentation trace strengthening
  -> kfm-official-x-hit-sound.json checksum bd153db9
  -> kfm-official-x-hit-spark.json checksum bd153db9
  -> optional private fixture gates prove real KFM x -> 200 emits bounded hitsound S5,0 and sparkno 0 telemetry after contact
  -> no public bundled KFM asset, SND decode/playback, exact FightFX/common lookup, exact render/audio timing, or score movement claim
R1 synthetic TargetLifeAdd NoKO trace strengthening
  -> synthetic-imported-target-noko.json checksum 321a1eba
  -> required trace gates defender-side AssertSpecial NoKO before HitDef and lethal TargetLifeAdd
  -> evidence includes target link id 77 and final P2 life 1
  -> proves bounded target-controller NoKO clamp only; no exact NoKO lifetime, helpers, teams, multi-target, round-flow, or target parity claim
R1 synthetic Target* side-effect trace strengthening
  -> synthetic-imported-target.json checksum f5a16dc9
  -> required trace now gates TargetLifeAdd/TargetPowerAdd/TargetVel*/TargetFacing/TargetBind/BindToTarget/TargetDrop typed ops
  -> evidence includes target links, P2 facing/velocity frame telemetry, final P1 targetCount 0, final P2 life 943 and power 40
  -> proves bounded two-actor Target* side effects only; no full redirects, helpers, teams, multi-target, or exact target lifetime parity
R2 RuntimeSnapshotWorld player actor projection
  -> player actor snapshot projection moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover metadata, runtime/event cloning, target refs/bindings, active/frame collision boxes, missing-frame fallback hurtbox, and sprite-owner state-owner metadata
  -> pnpm qa:trace stays stable
  -> proves named player actor snapshot ownership only
R2 RuntimeCompatibilityTelemetryWorld ownership extraction
  -> imported compatibility telemetry/session projection moved out of PlayableMatchRuntime
  -> focused RuntimeCompatibilityTelemetrySystem tests cover imported/owner-backed filtering, state-entry/session projection, event caps, active commands, and operation key stability
  -> pnpm qa:trace stays stable
  -> proves named compatibility telemetry ownership only
R2 RuntimeSnapshotWorld ownership extraction
  -> stage/camera snapshot projection moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover ScreenBound camera exclusion/fallback and EnvShake/EnvColor handoff
  -> pnpm qa:trace stays stable at 156/156 artifacts
  -> proves named stage/camera snapshot ownership only
R2 RuntimeAssertSpecialWorld ownership extraction
  -> imported pre-facing AssertSpecial mini-pass moved out of PlayableMatchRuntime
  -> focused RuntimeAssertSpecialSystem tests cover imported active state, owner-backed state owner, trigger filtering, and non-imported skip behavior
  -> proves named pre-facing AssertSpecial ownership only
R2 RuntimeHitPauseWorld ownership extraction
  -> global hitpause mini-loop ordering moved out of PlayableMatchRuntime
  -> focused RuntimeHitPauseSystem tests cover command buffering, ignorehitpause dispatch, presentation, countdown, and no-op behavior
  -> proves named hitpause ordering ownership only
R2 RuntimePausedMatchWorld ownership extraction
  -> regular Pause/SuperPause paused-match ordering moved out of PlayableMatchRuntime
  -> focused PauseSystem tests cover source movetime, frozen-actor presentation, replaced-pause interruption, and countdown ticking
  -> proves named paused-match ordering ownership only
R2 RuntimeStunWorld presentation ownership extraction
  -> hitstun/guardstun advance plus hitstun action requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration moved out of PlayableMatchRuntime
  -> focused RuntimeStunSystem tests cover the boundary
  -> proves named stun ownership only
R2 RuntimeStateAvailabilityWorld ownership extraction
  -> state/action availability lookup moved out of PlayableMatchRuntime
  -> focused StateAvailabilitySystem tests cover compiled state precedence, parsed states, animation fallback, owner-backed lookup, and missing-state rejection
  -> proves named state availability ownership only
R2 RuntimeHitStateTransitionWorld ownership extraction
  -> direct-hit and ReversalDef p1/p2 state transition routing moved out of PlayableMatchRuntime
  -> focused HitStateTransitionSystem tests cover attacker-owned p1stateno, attacker-owned p2stateno, target-owned p2getp1state = 0, and missing-state no-op behavior
  -> proves named hit-state transition ownership only
R2 RuntimeGetHitStateWorld ownership extraction
  -> default stand/crouch/air get-hit state selection moved out of PlayableMatchRuntime
  -> focused GetHitStateSystem tests cover 5000, 5010 -> 5000, 5020 -> 5000, and missing-state no-op behavior
  -> proves named default get-hit selection ownership only
R2 HitSparkAssetSystem ownership extraction
  -> player/common/FightFX spark asset-frame lookup moved out of PlayableMatchRuntime
  -> focused HitSparkAssetSystem tests cover prefix, state-owner, library, and missing refs
  -> proves named presentation lookup ownership only
R2 RuntimeRecoverySystem ownership extraction
  -> hit fall recovery timers, Common1 liedown recovery, and imported ground-recovery landing moved out of PlayableMatchRuntime
  -> focused RuntimeRecoverySystem tests cover countdown, default liedown time, and state-transition hooks
  -> proves named recovery ownership only
R2 BindToTarget target-system ownership extraction
  -> target lookup, raw postype parsing, duration binding, and facing-aware position application moved into RuntimeTargetWorld
  -> focused TargetSystem tests cover raw Head anchors, typed ops, and miss/no-mutation behavior
  -> proves named target-binding ownership only
R2 target binding position ownership extraction
  -> active TargetBind and BindToTarget per-frame position application moved into RuntimeTargetWorld
  -> focused TargetSystem tests cover owner-to-target binding, target-to-owner binding, and missing-target no-op behavior
  -> proves named active binding ownership only
R2 RuntimeHitEligibilityWorld ownership extraction
  -> HitBy/NotHitBy slot ticking and per-frame AssertSpecial/render-opacity reset moved out of PlayableMatchRuntime
  -> focused RuntimeHitEligibilitySystem tests cover finite/infinite slots, expiry cleanup, and frame-flag reset
  -> proves named hit-eligibility lifetime ownership only
R2 RuntimeOrientationWorld ownership extraction
  -> auto-facing and Turn facing flips moved into OrientationSystem
  -> focused RuntimeOrientationSystem tests cover opponent-facing, NoAutoTurn preservation, and Turn
  -> proves named orientation ownership only
R2 RuntimeGuardWorld ownership extraction
  -> guard-hit state selection and auto guard-start eligibility/mutation moved into GuardSystem
  -> focused GuardSystem tests cover state fallback, guard-state/current-move/pause/stun rejection, and start mutation
  -> proves named guard ownership only
```

Latest IKEMEN scanner truth:

```txt
I1 text-system scanner expansion
  -> IkemenFeatureScanner recognizes RemoveText and NumText as report-only IKEMEN text-system signals
  -> focused scanner test coverage proves recognized/unsupported classification
  -> no ZSS/Lua/text rendering/runtime execution claim
```

Do not reselect `Target*` final side-effect trace strengthening, `HitBy`, target-owned custom-state, default stand get-hit progression controller/frame order, guard-hit actor-frame telemetry, auto guard-start/end controller-order, optional KFM recovery-threshold drop gate, Common1 too-early recovery-input positive-window gate, official-style synthetic recovery threshold / too-early promotion, resource actor-frame evidence, debug clipboard no-ops, `MakeDust`, no-op `DestroySelf`, visual-helper removal ownership, helper-local micro-VM ownership including helper-local sound-event telemetry and bounded parent/root/opponent read-only redirects, `VarRandom`, common/FightFX HitSpark source-frame plus multi-frame trace metadata, `RuntimeContactPresentationWorld`, `RuntimeCombatResolutionWorld`, `RuntimeContactMemoryWorld`, `RuntimeRandomSystem`, `RuntimeResourceWorld`, `RuntimeControllerDispatchWorld`, `RuntimeExpressionContextWorld`, `RuntimeTargetWorld.resolveCandidates`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `RuntimeGuardDistanceWorld`, `RuntimeAnimationWorld`, `RuntimeKinematicsWorld`, `RuntimeStateTransitionControllerWorld`, `RuntimeAnimationControllerWorld`, `RuntimeKinematicControllerWorld`, `RuntimeInputControlWorld`, `RuntimeMoveLifecycleWorld`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld` ownership, `RuntimeBoundsControllerWorld` ownership, `RuntimeHitFallControllerWorld` ownership, `RuntimeStateTypeWorld` ownership, `RuntimeDamageScaleWorld` ownership, `RuntimeHitDefenseWorld` ownership, `RuntimeAssertSpecialWorld` ownership, `RuntimeSnapshotWorld` stage/camera ownership, `RuntimeSnapshotWorld` player actor/effect snapshot projection, `RuntimeCompatibilityTelemetryWorld` ownership, `RuntimeOrientationWorld` ownership, `RuntimeGuardWorld` ownership, `RuntimeGetHitStateWorld` ownership, `RuntimeHitStateTransitionWorld` ownership, `RuntimeStateAvailabilityWorld` ownership, `RuntimeStateEntryWorld` ownership, `RuntimeStunWorld` ownership, `RuntimePausedMatchWorld` ownership, or `RuntimeHitPauseWorld` ownership as fresh next work. They are already closed gates.

## Next 10 Build Slices

| Order | Lane | Slice | Evidence | Score impact |
| ---: | --- | --- | --- | --- |
| 1 | R1 runtime | Deepen Common1 recovery/guard loop precision beyond current frame/order summaries. | Required trace or official KFM optional fixture gate. | Possible MUGEN-lite movement only if scorecard threshold is met. |
| 2 | R1 presentation | Improve FightFX/common spark/dust/sound presentation evidence after current package-frame handoff and source-frame plus multi-frame trace metadata. | `pnpm qa:trace` if telemetry changes; `pnpm qa:smoke` plus screenshots if visible. | Possible playable/visual confidence, not full screenpack parity. |
| 3 | R2 ownership | Move helper-owned combat/effect/target ordering or deeper helper/effect lifecycle into a tighter named world boundary. | Focused world tests; stable or documented trace checksum behavior. | Debt reduction; score movement only with behavior evidence. |
| 4 | S1 Studio | Build one shared Evidence/Build status contract for stale, blocked, missing, partial, unsupported, and exportable states. | `pnpm qa:smoke` plus visual inspection using real rows. | Possible Studio score movement. |
| 5 | A1 assets | Store generated asset source prompt, sheet, atlas, QA, collision, and playtest provenance as one record. | Asset QA record; visual QA if shown. | Generated/native pipeline confidence only. |
| 6 | I1 IKEMEN | Add one scanner-only IKEMEN signal family from source/docs, classified recognized/unsupported/unknown. | Focused scanner tests. | Scanner-only movement, no IKEMEN execution claim. |
| 7 | M1 modular | Prove one shared project/asset/input/snapshot/debug/build contract has no fighting-specific leakage. | `pnpm check:boundaries` or focused boundary test. | Modular readiness only. |
| 8 | R1 fixtures | Add or tighten private official KFM fixture proof for a route already covered synthetically. | Optional fixture artifact when local fixture exists. | Compatibility confidence, no public asset claim. |
| 9 | Runtime corpus | Add another private character/stage corpus package as local evidence only. | Local fixture report; no committed third-party assets. | Broad compatibility evidence only when reproducible locally. |
| 10 | R2 trace order | Add trace evidence for effect/combat ordering if the next ownership boundary can affect checksums. | Required trace or documented stable checksum behavior. | Debt reduction unless behavior evidence moves score. |

## R1 Runtime Compatibility Plan

Goal: imported MUGEN-style packages execute more KFM/Common1-authored routes without crashing and with visible unsupported gaps.

Build sequence:

1. Tighten one Common1 guard/fall/recovery route with controller order, actor frame, velocity, and blocked-claim evidence.
2. Promote one parser-only or no-crash controller only when semantics are small enough to type or safely no-op.
3. Add required trace gates before broad claims.
4. Mirror synthetic gates with private KFM fixture gates when local fixtures exist.
5. Keep helpers, custom states, throws, teams, and screenpacks as explicit blocked scope until separate gates exist.

Done evidence:

- Required `pnpm qa:trace` artifact or focused runtime tests.
- Updated `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/WORKPLAN.md`, and `docs/BUILD_EXECUTION_BACKLOG.md`.
- Relevant `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` updated with claim allowed / claim blocked.

## R2 Runtime Ownership Plan

Goal: mutable match behavior moves behind named systems so future ports can replace or expand them without rewriting the whole loop.

Build sequence:

1. Keep `RuntimeContactPresentationWorld`, `RuntimeRandomSystem`, `RuntimeControllerDispatchWorld`, `RuntimeExpressionContextWorld`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `RuntimeGuardDistanceWorld`, `RuntimeAnimationWorld`, `RuntimeKinematicsWorld`, `RuntimeStateTransitionControllerWorld`, `RuntimeAnimationControllerWorld`, `RuntimeKinematicControllerWorld`, `RuntimeInputControlWorld`, `RuntimeMoveLifecycleWorld`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld`, `RuntimeAssertSpecialWorld`, `RuntimeSnapshotWorld`, `RuntimeCompatibilityTelemetryWorld`, `RuntimeOrientationWorld`, `RuntimeGuardWorld`, `RuntimeGetHitStateWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeStateEntryWorld`, `RuntimeStunWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` stable after extraction, including the player actor and effect snapshot projection methods on `RuntimeSnapshotWorld`.
2. Deepen helper/effect/combat ownership after current contact/recovery/target-binding/hit-eligibility ownership cuts.
3. Keep checksum drift stable unless the behavior intentionally changes.
4. Prefer tests around ownership boundaries before adding new runtime features.

Done evidence:

- Focused unit/system tests.
- Stable `pnpm qa:trace` when behavior should not change.
- `docs/ENGINE_PORT_ARCHITECTURE.md`, `docs/WORKPLAN.md`, and backlog updated.

## S1 Studio Trust Plan

Goal: Studio becomes a real workbench, not a decorative dashboard.

Build sequence:

1. Define one shared status contract consumed by Evidence and Build.
2. Give every blocked/stale/partial/exportable row one primary next action.
3. Link rows to trace/report/runtime/project evidence.
4. Keep visible states honest: no fake green exports.

Done evidence:

- `pnpm qa:smoke`.
- Visual inspection on desktop and mobile when layout changes.
- `docs/ENGINE_STUDIO_ROADMAP.md` and `docs/INTERFACE_SYSTEM.md` updated.

## A1 Generated Asset Plan

Goal: generated/native fighters are usable test subjects and future authoring assets without being counted as imported MUGEN compatibility.

Build sequence:

1. Store prompt/source image/sheet path, atlas manifest, contact sheet/GIF, collision/action data, and QA report as one provenance record.
2. Surface motion, scale, baseline, and contact-box QA failures.
3. Regenerate bad source sprites; do not disguise broken motion by atlas cropping.

Done evidence:

- QA record under `.scratch/qa/` or generated asset metadata.
- Visual QA if the asset appears in runtime or Studio.
- Generated/native status separated from imported compatibility in docs.

## I1 IKEMEN Scanner Plan

Goal: Ikemen-GO source/docs knowledge improves reporting before runtime execution exists.

Build sequence:

1. Add one recognized unsupported signal family at a time.
2. Keep ZSS/Lua/rollback/netplay as scanner-only until execution gates exist.
3. Document every scanner finding as recognized, unsupported, or unknown.

Done evidence:

- Focused scanner tests.
- `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, and `docs/MUGEN_COMPATIBILITY_PLAN.md` updated.

## M1 Modular Engine Plan

Goal: extract only contracts proven useful by fighting runtime and Studio evidence.

Build sequence:

1. Choose one shared contract candidate: project, asset, input, tick, snapshot, render, audio, debug, or build.
2. Prove it does not import CNS, CMD, HitDef, Common1, helpers, rounds, teams, or MUGEN command routing.
3. Delay platformer runtime work until fighting smoke/trace gates stay stable.

Done evidence:

- `pnpm check:boundaries` or focused boundary test.
- `docs/MODULE_BOUNDARY_CONTRACT.md` updated.

## Selection Rule

When continuing autonomously:

1. If current work is docs/setup only, close it with no score movement and return to R1 or R2.
2. If runtime behavior changed, require `pnpm qa:trace`.
3. If frontend/render/Studio changed, require `pnpm qa:smoke` plus visual inspection.
4. If a fixture is private/local, keep it out of the repo and report it as optional evidence.
5. If a slice cannot produce evidence in one round, split it until it can.

## Claim Guard

Allowed after this roadmap pass:

- Future agents have a clearer next-slice order and evidence map.
- `setup-project` remains local markdown issues, canonical triage labels, and single-context docs.

Blocked after this roadmap pass:

- No runtime compatibility score movement.
- No new imported character support.
- No new IKEMEN execution.
- No new Studio workflow implementation.
- No modular-engine extraction beyond documented plan.

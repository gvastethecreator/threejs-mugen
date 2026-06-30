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
  -> helper-local redirects now include bounded Parent/Root read-only trigger/value evaluation against owner runtime state as leading expressions and as operands inside composite arithmetic/boolean/IfElse expressions, with focused EffectActorSystem, RuntimeCnsSubset, and compiler trigger classification coverage
  -> no indexed redirects, EnemyNear(index), team/keyctrl ownership, exact helper resource scopes, helper fvar/sysvar VarRandom, exact random stream parity, exact helper-local sound timing/channel/redirect ownership, helper visual effects, helper-owned HitDefs/Projectiles/Explods, helper combat, nested helper ancestry, exact tick-order/pause parity, full custom-state helper lifecycle, or score movement claim
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
  -> pnpm qa:trace now passes 165/165 artifacts, 145 required and 20 optional
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
  -> optional kfm-official-default-fall-gethit.json checksum 813ff55d now requires bounded official KFM 5000/5030/5050/5100/5101/5110 controller/typed-operation order and actor-frame order when the private fixture exists
  -> no exact Common1 controller-loop tick order, fall/bounce/liedown velocity math, recovery branching, guard-state parity, public bundled KFM, or full fall get-hit parity claim
R1 required Common1 lie-down/get-up recovery trace strengthening
  -> synthetic-imported-default-fall-recovery.json checksum d83797d9
  -> required trace now gates ordered P2 5110 ChangeState before 5120 VelSet / HitFallSet / ChangeState plus actor-frame 5110 -> 5120
  -> optional kfm-official-default-fall-recovery.json checksum 978b8343 now requires bounded official KFM 5110/5120 controller/typed-operation order when the private fixture exists
  -> no exact Common1 controller-loop tick order, threshold table, velocity math, recovery-input branching, public bundled KFM, or full fall recovery parity claim
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
  -> kfm-official-x-hit-sound.json checksum 9668e88a
  -> kfm-official-x-hit-spark.json checksum 9668e88a
  -> optional private fixture gates prove real KFM x -> 200 emits bounded hitsound S5,0 and sparkno 0 telemetry after contact
  -> no public bundled KFM asset, SND decode/playback, exact FightFX/common lookup, exact render/audio timing, or score movement claim
R1 synthetic TargetLifeAdd NoKO trace strengthening
  -> synthetic-imported-target-noko.json checksum 28ac8636
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

Do not reselect `Target*` final side-effect trace strengthening, `HitBy`, target-owned custom-state, default stand get-hit progression controller/frame order, guard-hit actor-frame telemetry, auto guard-start/end controller-order, debug clipboard no-ops, `MakeDust`, no-op `DestroySelf`, visual-helper removal ownership, helper-local micro-VM ownership including helper-local sound-event telemetry and bounded parent/root read-only redirects, `VarRandom`, common/FightFX HitSpark source-frame plus multi-frame trace metadata, `RuntimeContactPresentationWorld`, `RuntimeContactMemoryWorld`, `RuntimeRandomSystem`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `RuntimeGuardDistanceWorld`, `RuntimeAnimationWorld`, `RuntimeKinematicsWorld`, `RuntimeInputControlWorld`, `RuntimeMoveLifecycleWorld`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld` ownership, `RuntimeAssertSpecialWorld` ownership, `RuntimeSnapshotWorld` stage/camera ownership, `RuntimeSnapshotWorld` player actor/effect snapshot projection, `RuntimeCompatibilityTelemetryWorld` ownership, `RuntimeOrientationWorld` ownership, `RuntimeGuardWorld` ownership, `RuntimeGetHitStateWorld` ownership, `RuntimeHitStateTransitionWorld` ownership, `RuntimeStateAvailabilityWorld` ownership, `RuntimeStunWorld` ownership, `RuntimePausedMatchWorld` ownership, or `RuntimeHitPauseWorld` ownership as fresh next work. They are already closed gates.

## Next 10 Build Slices

| Order | Lane | Slice | Evidence | Score impact |
| ---: | --- | --- | --- | --- |
| 1 | R1 runtime | Deepen Common1 recovery/guard loop precision beyond current frame/order summaries. | Required trace or official KFM optional fixture gate. | Possible MUGEN-lite movement only if scorecard threshold is met. |
| 2 | R1 presentation | Improve FightFX/common spark/dust/sound presentation evidence after current package-frame handoff and source-frame plus multi-frame trace metadata. | `pnpm qa:trace` if telemetry changes; `pnpm qa:smoke` plus screenshots if visible. | Possible playable/visual confidence, not full screenpack parity. |
| 3 | R2 ownership | Move helper/effect/target ordering into a tighter named world boundary. | Focused world tests; stable or documented trace checksum behavior. | Debt reduction; score movement only with behavior evidence. |
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

1. Keep `RuntimeContactPresentationWorld`, `RuntimeRandomSystem`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `RuntimeGuardDistanceWorld`, `RuntimeAnimationWorld`, `RuntimeKinematicsWorld`, `RuntimeInputControlWorld`, `RuntimeMoveLifecycleWorld`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld`, `RuntimeAssertSpecialWorld`, `RuntimeSnapshotWorld`, `RuntimeCompatibilityTelemetryWorld`, `RuntimeOrientationWorld`, `RuntimeGuardWorld`, `RuntimeGetHitStateWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeStunWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` stable after extraction, including the player actor and effect snapshot projection methods on `RuntimeSnapshotWorld`.
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

# Roadmap Package Milestones

Last updated: 2026-06-30

This file is the compact package ladder between the scorecard and the local issues. It answers which package is active, what proof moves it, what is blocked, and what the next agent should build first.

Docs-only changes here do not move scores. Scores move only through trace, test, fixture, visual QA, or build/export evidence.

## Active Package Ladder

| Package | Status | Next proof | Required evidence | Blocked claim |
| --- | --- | --- | --- | --- |
| G1 Roadmap control | Active control layer | Keep setup-project, AGENTS, local issues, and roadmap docs synchronized. | `pnpm test`, `pnpm typecheck`, `pnpm build` for docs-only closeout. | Any runtime, Studio, IKEMEN, or modular compatibility score movement. |
| R1 Runtime compatibility | Active score-moving lane | Add one bounded imported runtime oracle or deepen one Common1/FightFX route. | Required `pnpm qa:trace` artifact or focused runtime test. | Full CNS VM, exact tick-order parity, helpers/custom states/teams, screenpacks. |
| R2 Runtime ownership | Active debt-reduction lane | Move one mutable behavior behind a named world/system boundary with stable traces. | Focused system tests; trace stability or documented checksum drift. | Claiming parity from extraction alone. |
| S1 Studio trust chain | Active product lane | Evidence and Build consume one shared status and next-action contract. | `pnpm qa:smoke` plus visual inspection using real evidence rows. | Decorative dashboard states, fake green exports, editing workflows without persistence. |
| A1 Generated assets | Planned/active support lane | Store prompt/source/atlas/QA/collision/playtest provenance as one record. | Asset QA record plus visual QA when shown in runtime or Studio. | Imported MUGEN compatibility credit. |
| I1 IKEMEN scanner | Active scanner-only lane | Classify one more Ikemen-GO signal as recognized, unsupported, or unknown. | Focused scanner tests and blocked runtime wording. | ZSS/Lua/runtime execution, rollback, netplay, IKEMEN system parity. |
| M1 Modular boundary | Guarded architecture lane | Prove one shared contract has no fighting-specific leakage. | `pnpm check:boundaries` or focused boundary tests. | Platformer/runtime SDK claims before fighting contracts stay stable. |

## Milestone Exit Gates

| Milestone | Meaning | Exit gate |
| --- | --- | --- |
| M0 Project control | Agents can resume without re-discovering tracker, docs, scores, or gates. | `AGENTS.md`, `docs/agents/*`, ADR, roadmap docs, and local issues agree. |
| M1 Playable private sandbox | Generated/native match remains usable while compatibility grows. | Browser smoke, visual inspection, stable controls/HUD/stage/debug. |
| M2 Imported MUGEN-lite MVP | One KFM/Common1-style imported package can run core routes with honest gaps. | Required traces for idle/walk/crouch/jump/attack/guard/get-hit/fall/recovery-style routes, plus compatibility report. |
| M3 Broader MUGEN subset | Multiple local characters/stages load partially without hardcoded patches. | Fixture corpus results, unsupported features reported, app does not crash on missing support. |
| M4 Studio working loop | Studio can inspect, explain, repair, playtest, and export local projects. | Evidence and Build share status contract; source/provenance and export blockers are actionable. |
| M5 IKEMEN scanner-plus | IKEMEN-only assets are recognized and reported without runtime overclaim. | Source-mapped scanner tests for ZSS/Lua/config/screenpack/stage/system signals. |
| M6 Modular engine seed | Shared contracts can support future non-fighting projects. | Boundary tests prove shared packages do not import MUGEN/CNS/CMD/HitDef/Common1 runtime concepts. |

## Next Recommended Slice

Latest project-control checkpoint:

```txt
G1 setup-project refresh
  -> AGENTS.md and docs/agents/* confirm local markdown issues, canonical labels, single-context docs
  -> roadmap navigation/progress/checklist docs include G1 health checks and decision routing
  -> lane checkpoint taxonomy separates latest overall, runtime, Studio/UI, asset, scanner, modular, and G1 control truth
  -> .scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md remains the setup/project-control ledger
  -> docs-only control work; no runtime, Studio, IKEMEN, modular, or score claim
```

Latest Studio/UI checkpoint:

```txt
S1 Studio CSS module split and shadow prune
  -> src/styles/studio.css is the single Studio CSS entrypoint, delegating to base/legacy/editor/runtime/desktop/shell/command/workflows category modules
  -> pnpm fix:css now removes exact duplicate rules plus fully shadowed same-selector and cross-file rules
  -> active command shell ownership lives in src/styles/command/studio-command-shell.css, studio-command-pipeline.css, studio-command-playfield.css, and studio-command-console.css
  -> pnpm qa:css reports 536,051 bytes, 2,364 rules, 0 duplicate selector keys / 0 instances, 0 exact duplicate rules, 119 repeated declaration groups, 108 cross-file overlaps, 0 selectors shared with src/style.css, 0 fully shadowed legacy style.css rules, and 0 fully shadowed cross-file rules
  -> pnpm qa:css:budget now freezes current debt ceilings for CSS cleanup/review rounds: 536,051 bytes, 2,364 rules, 119 repeated declaration groups, 108 cross-file overlaps, and zero exact/shadowed/src-style overlap regressions
  -> latest narrow cleanup splits base tokens/elements/accessibility out of src/style.css, removes unused root custom properties, centralizes reduced-motion handling in base accessibility, keeps src/styles/studio.css from reimporting base, groups Build/Evidence right-rail headers into shared Studio primitive selectors, removes local duplicate Assets action icon/primary rules, groups legacy Studio truncation/text-wrap/grid/align/text rows, groups desktop workbench/list/engine-contract/drawer/build-runway/shell/chrome/stage/status truncation and left-pane kicker/eyebrow styling, absorbs redundant shell/header/status/summary overrides into base/surface owners, removes redundant responsive shell rules, prunes one redundant base Studio workspace-header override, and removes unused structural Build/Evidence list, old asset focus/flow, trace scrubber, stat-card, and build-export-console hooks; the broader repeated declaration groups stay queued for shared primitive extraction
  -> requires qa:smoke and visual inspection; product-surface hygiene only, no new Studio workflow or score claim
S1 Studio command chrome label/grid follow-up
  -> compile-project action now reads Build in the compact command rail
  -> desktop utility buttons keep visible truncated labels inside fixed grid tracks instead of becoming icon-only
  -> Workbench Project Health now exposes a text Readiness band beside the numeric score
  -> app shell and remaining legacy Studio cascade moved out of src/style.css into app-shell, studio-legacy-surfaces, studio-editor-cascade, studio-ui-hardening, and studio-desktop-authority modules
  -> qa:css reports 2,622 rules, 83 duplicate selector keys / 184 instances, 0 exact duplicate rules, 198 repeated declaration groups, 79 cross-file overlaps, 0 selectors shared with src/style.css, and 0 fully shadowed legacy style.css rules
  -> visual QA required because this is visible chrome; no new Studio workflow or score claim
S1 Studio command-center CSS overlap prune
  -> command-center desktop overrides for chrome, compact tabs, stage, console, round HUD, and mission-node fragments pruned from legacy src/style.css
  -> active ownership now lives in split studio-command-shell/pipeline/playfield/console modules
  -> mission rows and compact Studio tabs expose textual status instead of color-only dots
  -> dead tab-dot CSS was pruned after the compact navigator switched to tab-state badges
  -> pnpm qa:css reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 40 cross-file overlaps, 16 selectors shared with src/style.css, 3 command-center selectors still shared with legacy src/style.css, and 0 legacy style.css rules fully shadowed by later imports
  -> no new Studio workflow or score claim
S1 Studio CSS cascade prune
  -> obsolete legacy Evidence/Release Desk blocks removed from src/style.css
  -> Command Palette, Stage, and Inspector desktop density now live in src/styles/command/studio-command-palette.css, src/styles/workflows/studio-stage.css, and src/styles/workflows/studio-inspector.css
  -> fully overridden module-covered rules plus old global Module ledger repair block pruned from legacy style.css
  -> src/styles/workflows/studio-system-ledgers.css owns two-line Module rows and 40px system actions
  -> pnpm qa:css reads CSS in src/main.ts import order and reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 40 cross-file overlaps, 16 selectors shared with src/style.css, and 0 legacy style.css rules fully shadowed by later imports
  -> pnpm qa:smoke plus screenshot inspection covered Workbench, Modules, Modules contracts, and Runtime with no horizontal overflow or broken module rows
  -> no new Studio workflow or score claim
S1 Studio command inspector readability and smoke stability
  -> dense Studio command surfaces, Build/Evidence route copy, stage toolbar, and replacement rows were tightened
  -> pnpm qa:smoke plus screenshot inspection proved the visible surfaces after that pass
  -> product/UI evidence only; it does not replace the latest runtime checkpoint or change the next runtime slice
```

Latest implementation checkpoint:

```txt
R2 bounded helper-local NumHelper gate
  -> HelperSystem can evaluate bounded helper-local NumHelper(id) through RuntimeEffectActorWorld for current visual Helpers against owner-side visual Helper actors in the same effect store
  -> required synthetic-imported-helper-numhelper.json checksum 4e32e951 proves a visual Helper routes from 1200 to 1211 / anim 931 through NumHelper(42) > 0
  -> pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no exact helper effect-count/ownership parity, indexed/team/helper-owned redirects, helper-owned HitDef, helper-owned Projectile, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local NumExplod gate
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> HelperSystem can evaluate bounded helper-local NumExplod(id) through RuntimeEffectActorWorld for current visual Helpers after helper-local static Explod spawn
  -> required synthetic-imported-helper-numexplod.json checksum 4328278a proves a visual Helper routes from 1200 to 1210 / anim 930 after spawning owner-side Explod anim 942 and counting that helper-parented Explod by static id
  -> no exact helper effect-count parity, helper-owned HitDef, helper-owned Projectile, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local ModifyExplod gate
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> HelperSystem can dispatch bounded helper-local static ModifyExplod mutation through RuntimeEffectActorWorld for current visual Helpers after helper-local static Explod spawn
  -> required synthetic-imported-helper-modifyexplod.json checksum 0749041c proves a visual Helper routes through 1200 -> 1208 -> 1209 / anims 928 and 929, spawns owner-side Explod anim 941, and mutates that helper-parented Explod by static id with velocity/scale/priority/pause/remove payload evidence
  -> no helper-owned HitDef, helper-owned Projectile, helper combat/contact presentation, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local RemoveExplod gate
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> required synthetic-imported-helper-removeexplod.json checksum ff8658a2 proves a visual Helper routes through 1200 -> 1206 -> 1207 / anims 926 and 927, spawns owner-side Explod anim 940, and removes it with parentId p1-helper-0 lifecycle/payload evidence
R2 bounded helper-local BindToRoot gate
  -> required synthetic-imported-helper-bindtoroot.json checksum bf72306c proves a visual Helper can bind to supplied root runtime state and route from state 1200 to 1204 / anim 924 with actor-frame position plus root ownerBind target/offset payload evidence
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no player-state BindToParent / BindToRoot, nested ancestry where root differs from parent, dynamic bind params, team/keyctrl ownership, helper-owned combat/effects/projectiles, exact binding tick order, full helper binding parity, or score claim
R2 bounded helper-local BindToParent gate
  -> HelperSystem compiles and executes bounded helper-local static BindToParent / BindToRoot owner binding for current visual Helper actors when RuntimeEffectLifecycleWorld supplies owner/root runtime state
  -> required synthetic-imported-helper-bindtoparent.json checksum f9922c0e proves a visual Helper can bind to its owner and route from state 1200 to 1203 / anim 923 with actor-frame position plus parent ownerBind target/offset payload evidence
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no player-state BindToParent / BindToRoot, dynamic bind params, nested helper ancestry, team/keyctrl ownership, helper-owned combat/effects/projectiles, exact binding tick order, full helper binding parity, or score claim
R2 bounded helper-local EnemyNear gate
  -> HelperSystem expression contexts now receive current two-player opponent runtime state through RuntimeEffectLifecycleWorld during normal, pause, and hitpause presentation paths
  -> required synthetic-imported-helper-enemynear.json checksum 35498955 proves a visual Helper can route from state 1200 to 1202 / anim 922 through helper-local EnemyNear, StateNo and EnemyNear, Life reads
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no EnemyNear(index), teams/simul/turns, helper-owned opponents, keyctrl, nested helper ancestry, helper-owned combat/effects/projectiles, exact opponent selection, exact helper tick order, full helper redirect parity, or score claim
R1 bounded dynamic Target redirect trigger gate
  -> ExpressionCompiler and ExpressionEvaluator classify bounded Target, ... and static Target(id), ... trigger redirects as executable in the current two-player target-memory context
  -> PlayableMatchRuntime resolves Target(id) from RuntimeTargetWorld target memory for active-state and State -1 trigger evaluation
  -> required synthetic-imported-target-dynamic-redirect.json checksum 9985b62a proves direct HitDef target id 77 plus owner-local var(0) = 77 can feed Target(var(0)), Life and branch P1 state 200 -> 287; previous synthetic-imported-target-redirect.json checksum 89580963 keeps the static Target(77), Life route gated
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no helper/projectile targets, unsupported or negative target-id expressions, mutation through redirects, teams, multi-target selection, exact target lifetime/tick order, full target redirect parity, or score movement claim
R1 bounded identity-trigger gate
  -> ExpressionCompiler and ExpressionEvaluator classify Name/P1Name/P2Name/AuthorName as executable in the current two-actor runtime context
  -> PlayableMatchRuntime passes fighter display name plus author metadata into active-state, State -1, setup, and dynamic dispatch trigger evaluation
  -> EnemyNear redirect contexts now swap identity metadata as well as actor state, including composite expressions
  -> required synthetic-imported-identity.json checksum c9be5cf1 proves the route into state 276
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no team/simul/helper/player-indexed identity selection, parent/root/target identity redirects, exact string edge parity, or score claim
R2 bounded helper-local IsHelper gate
  -> ExpressionCompiler and ExpressionEvaluator classify IsHelper and IsHelper(id) as executable in helper-local contexts
  -> HelperSystem passes helper identity into visual Helper actor trigger evaluation
  -> required synthetic-imported-helper-ishelper.json checksum 37877602 proves helper state 1200 branches to 1201 / anim 921
  -> superseded by helper-local NumHelper gate; pnpm qa:trace now passes 177/177 artifacts, 157 required and 20 optional
  -> no full helper VM, helper-owned combat, parent/root mutation, nested helper ancestry, team ownership, exact tick order, or score claim
R2 RuntimeStateClockWorld ownership
  -> RuntimeStateClockWorld owns bounded Time/stateElapsed mutation for active-frame advance and changed-state elapsed reset
  -> PlayableMatchRuntime delegates the inline stateElapsed += 1 and stateElapsed = -1 paths through that boundary
  -> focused RuntimeStateClockSystem tests prove advance, reset, and no-op transition behavior while preserving the -1 -> 0 first-frame convention
  -> no exact CNS Time tick-order parity, persistent-controller timing parity, pause/hitpause timing changes, helper/team/redirect state clocks, or score claim
R2 RuntimeStateMetadataWorld ownership
  -> RuntimeStateMetadataWorld owns bounded previous-state transition metadata writes for prevStateNo, prevAnimNo, prevStateType, and prevMoveType
  -> PlayableMatchRuntime delegates state-number changes through that boundary, preserving current StateDef-derived type/move-type capture
  -> StateControllerExecutor ChangeState / SelfState output uses the same helper for the basic runtime-only executor path
  -> focused RuntimeStateMetadataSystem, RuntimeCnsSubset, and PlayableMatchRuntime Prev-trigger tests prove changed-state capture and unchanged-state no-op behavior
  -> no exact state-entry tick order, redirects/helper/team previous-state ownership, persistent controller semantics, full ChangeState/SelfState parity, or score claim
R2 TargetSystem stale binding pruning
  -> TargetSystem drops TargetBind binding records during target-memory advance when the bound actor id / target id no longer survives expiry
  -> the same live-target binding check is shared by target-memory advance, TargetDrop, active TargetBind, and active BindToTarget application
  -> focused TargetSystem tests prove infinite-duration bindings survive only while matching target memory is live
  -> no exact bind/drop tick order, helper/team/multi-target ownership, throws/custom-state binding, full target parity, or score movement claim
R2 TargetSystem active binding lifetime guard
  -> TargetSystem requires matching live target memory before active TargetBind or BindToTarget position application moves actors
  -> stale binding records now fail closed after target memory is dropped or expired
  -> focused TargetSystem tests prove active binding success plus stale-binding no-mutation behavior
  -> no helper/team/multi-target ownership, exact bind/drop tick order, throws/custom-state binding parity, target parity, or score movement claim
R2 TargetSystem BindToTarget anchor ownership
  -> TargetSystem owns bounded BindToTarget postype anchor resolution previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime supplies only character constants; resolveRuntimeTargetAnchor owns Foot/Mid/Head size-constant lookup
  -> focused TargetSystem tests prove constant-backed anchor math and existing BindToTarget placement
  -> no exact bind tick order, helper/team/multi-target ownership, throws/custom-state binding, target parity, or score movement claim
R2 RuntimeContactPresentationWorld ownership
  -> RuntimeContactPresentationWorld owns bounded direct HitDef and Projectile contact presentation package emission previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates shared contactId/contactTick/contactKind metadata creation plus attacker-side HitDef/Projectile sound and HitSpark telemetry through that boundary
  -> focused RuntimeContactPresentationSystem tests prove direct hit package metadata and projectile guard package metadata are shared across PlaySnd and HitSpark events while preserving hit-spark asset-frame handoff
  -> no exact intra-tick audio/spark ordering, SND playback/mixing/channel priority, exact FightFX/common lookup/binding/layering/timing/scale/palette, helper-owned contact presentation, multi-target presentation, or score claim
R2 RuntimeGuardDistanceWorld ownership
  -> RuntimeGuardDistanceWorld owns bounded InGuardDist/auto-guard proximity checks previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current move presence, spent-hit rejection, pre-active guard-distance window, guardflag/AssertSpecial/unguardable checks, hurtbox fallback handoff, and authored/default guard.dist checks through that boundary
  -> focused RuntimeGuardDistanceSystem tests prove the pre-active window, missing/spent/out-of-window rejects, guardflag and AssertSpecial rejects, unguardable attacks, and authored guard.dist thresholds
  -> no exact proximity guard parity, guard-end timing, guard effects, air-guard landing, broad Common1 controller-loop parity, or score claim
R2 RuntimeAnimationWorld ownership
  -> RuntimeAnimationWorld owns bounded actor animation advancement and timing helpers previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current animTime/frameIndex/frameElapsed advancement, final-frame hold, loopStart completion, invalid-duration clamping, AnimTime/AnimElemTime helper math, and current HitDef active-window duration math through that boundary
  -> focused RuntimeAnimationSystem tests prove empty actions, authored durations, frame changes, loop completion, final-frame hold, invalid-duration clamping, and timing helpers
  -> no exact AIR negative-duration semantics, elem/elemtime parity, state-owner namespace behavior, controller tick-order parity, or score claim
R2 RuntimeKinematicsWorld ownership
  -> RuntimeKinematicsWorld owns bounded actor position integration, sandbox gravity, ground snap, and landing idle-action request previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current pos/vel advance, airborne gravity, imported hit-state ground-snap preservation, and no-current-move landing idle callback through that boundary
  -> focused RuntimeKinematicsSystem tests prove grounded movement, airborne gravity, landing snap/idle, active-move landing, and imported preserve behavior
  -> no exact MUGEN physics, yaccel constants, landing timing, air recovery parity, helper physics ownership, or score claim
R2 RuntimeInputControlWorld ownership
  -> RuntimeInputControlWorld owns bounded local player and simple AI control intent previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates crouch, jump, walk, idle, air drift, NoWalk suppression, AI chase, AI attack cooldown, and local punch/kick intent through that boundary
  -> focused RuntimeInputControlSystem tests prove blocked input, state-entry precedence, movement branches, NoWalk/air drift, and simple AI chase/attack routes
  -> no new input semantics, exact command timing, exact AI behavior parity, full MUGEN/IKEMEN control routing, or score claim
R2 RuntimeMoveLifecycleWorld ownership
  -> RuntimeMoveLifecycleWorld owns bounded active move lifecycle mutation previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current move tick, non-reversal attack moveType/velocity lock, completed move cleanup, reversal cleanup, and idle/control restoration callbacks through that boundary
  -> focused RuntimeMoveLifecycleSystem tests prove no-op, active non-reversal move, completed non-reversal move, and completed reversal routes
  -> no new move semantics, exact input/cancel timing, exact MUGEN/IKEMEN active-move lifecycle parity, or score claim
R2 helper-local micro-VM ownership
  -> HelperSystem runs a bounded helper-local micro-VM for current visual Helper actors spawned with owner runtime-program data
  -> RuntimeEffectSpawnWorld passes owner runtimeProgram and animation maps into HelperSystem
  -> focused EffectActorSystem tests prove Time-triggered VelSet, ChangeAnim, ChangeState, DestroySelf removal, helper-local CtrlSet/StateTypeSet, helper-local VarSet/VarAdd/VarRandom/VarRangeSet trigger branches, and helper-local PlaySnd/StopSnd sound-event telemetry on helper actors
  -> focused EffectSpawnSystem tests prove the handoff
  -> helper-local resources now include bounded LifeAdd/LifeSet/PowerAdd/PowerSet state and trigger evidence in focused tests
  -> helper-local redirects now include bounded Parent/Root read-only trigger/value evaluation against owner runtime state plus bounded EnemyNear read-only trigger/value evaluation against current opponent state, with focused EffectActorSystem and trace coverage
  -> helper-local static owner binding now includes bounded BindToParent / BindToRoot unit coverage and required BindToParent plus BindToRoot trace coverage with ownerBind target/offset payload requirements
  -> no indexed redirects, EnemyNear(index), player-state BindToParent/BindToRoot, dynamic bind params, team/keyctrl ownership, exact helper resource scopes, helper-owned opponents, helper fvar/sysvar VarRandom, exact random stream parity, exact helper-local sound timing/channel/redirect ownership, helper visual effects, helper-owned HitDefs/Projectiles/Explods, helper combat, nested helper ancestry, exact tick-order/pause parity, full custom-state helper lifecycle, or score claim
R2 visual-helper removal ownership
  -> HelperSystem removes current visual helper actors by helper id, runtime serial, or owner-wide clear
  -> RuntimeEffectActorWorld owns p1/p2-isolated store mutation and removed-count reporting
  -> RuntimeEffectSpawnWorld exposes the same handoff for future controller dispatch
  -> focused EffectActorSystem and EffectSpawnSystem tests prove the boundary
  -> no redirects, parent/root/team ownership, helper-owned HitDefs/Projectiles, exact lifecycle tick-order parity, or score claim
R1 required combined hit/guard-effect contact-package trace strengthening
  -> synthetic-imported-hitdef-common-guard-spark.json checksum 7650a09c gates unprefixed common/default source-frame plus multi-frame AIR metadata for guard.sparkno 7003
  -> synthetic-imported-hitdef-fightfx-guard-spark.json checksum 32f3e92d gates F-prefixed FightFX source-frame plus multi-frame AIR metadata for guard.sparkno F7004
  -> synthetic-imported-hitdef-hit-effect-package.json checksum 46aa5ce1 gates one direct HitDef hit contact with hitsound S5,0 telemetry plus FightFX sparkno F7002 source-frame and multi-frame AIR metadata sharing one contact package
  -> synthetic-imported-hitdef-guard-effect-package.json checksum 1c3167b7 gates one guarded direct HitDef contact with guardsound S6,0 telemetry plus FightFX guard.sparkno F7004 source-frame and multi-frame AIR metadata sharing one contact package
  -> required package traces require direct/guarded HitDef contact, attacker-side PlaySnd/HitSpark telemetry, shared non-empty contactId/contactTick/contactKind metadata, at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer/audio handoff
  -> current aggregate after the helper-local NumHelper gate is 177/177 artifacts, 157 required and 20 optional
  -> required trace evidence only; no exact intra-tick sound/spark ordering, SND playback, renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, hit/guard-effect parity, or full spark parity claim
R2 RuntimeHitPauseWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete hitpause bridge for command buffering and paused presentation
  -> PlayableMatchRuntime delegates those hitpause side effects through RuntimeHitPauseWorld instead of local callback glue
  -> focused RuntimeHitPauseSystem tests prove current tick/input buffering with hitPause: true and RuntimeEffectLifecycleWorld paused presentation using pause kind hitpause
  -> no new hitpause semantics, helper-owned hitpause execution, broad side-effect ordering during hitpause, exact first-frame decrement order, exact hitpause parity, or score claim
R2 RuntimePausedMatchWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete paused-match bridge for source-movetime target-memory aging, active-effect advance, presentation-effect advance, active target binding, stage clamp, and frozen-actor paused presentation
  -> PlayableMatchRuntime delegates those paused interaction side effects through RuntimePausedMatchWorld instead of local callback glue
  -> focused PauseSystem tests prove actor-local targetWorld, effectLifecycleWorld, and RuntimeActorConstraintWorld wiring
  -> pnpm qa:trace stays stable at 163/163; no new pause semantics, helper VM during pause, exact pause layering, exact paused effect tick order, parent/root/team redirects, or score claim
R2 RuntimeMatchInteractionWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete normal-loop bridge for target-memory aging, active-effect advance, projectile clash, body separation, active target binding, stage clamp, and presentation-effect advance
  -> PlayableMatchRuntime delegates those interaction side effects through RuntimeMatchInteractionWorld instead of local callback glue
  -> focused MatchInteractionSystem tests prove actor-local targetWorld, effectLifecycleWorld, effectActorWorld.resolveProjectileClashes(...), and RuntimeActorConstraintWorld wiring
  -> pnpm qa:trace stays stable at 163/163; no helper VM execution, new target/projectile/effect semantics, exact post-fighter tick-order, pause-specific bridge ownership, parent/root/team redirects, or score claim
R2 RuntimeResourceSystem resource-edge ownership
  -> authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control writes now live in RuntimeResourceSystem
  -> PlayableMatchRuntime, RuntimeDirectCombatWorld, RuntimeProjectileCombatWorld, RuntimeReversalWorld, and RuntimeTargetWorld use the shared boundary instead of local max helpers or inline writes
  -> focused RuntimeResourceSystem, DirectCombatSystem, ProjectileCombatSystem, TargetSystem, ReversalSystem, and PlayableMatchRuntime tests preserve current bounded semantics
  -> no new controller semantics, exact CNS timing, helper/team/redirect ownership, target/projectile parity, or score claim
R2 RuntimeSnapshotWorld effect snapshot aggregation
  -> final Explod/Helper/Projectile effect snapshot aggregation moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover stable p1/p2 effect ordering and clone isolation
  -> no effect VM semantics, exact tick order, renderer parity, compatibility-session ownership, or score claim
R1 required Common1 fall get-hit entry trace strengthening
  -> synthetic-imported-default-fall-gethit.json checksum 6af73a91 now gates ordered 5000 -> 5030 -> 5050 controller/frame evidence
  -> optional kfm-official-default-fall-gethit.json checksum 0b3ece0c applies bounded official KFM 5000/5030/5050/5100/5101/5110 controller/typed-operation and actor-frame order when the private fixture exists
  -> no exact fall/bounce/liedown tick order, velocity math, recovery branching, guard-state parity, public bundled KFM, or full fall get-hit parity claim
R1 required Common1 lie-down/get-up recovery trace strengthening
  -> synthetic-imported-default-fall-recovery.json checksum d83797d9 gates ordered 5110 -> 5120 controller/frame evidence
  -> optional kfm-official-default-fall-recovery.json checksum b1c6456a applies bounded official KFM 5110/5120 controller/typed-operation and actor-frame order when the private fixture exists
  -> no exact controller-loop tick order, threshold table, velocity math, recovery-input branching, or full fall recovery parity claim
R1 required Common1 stand get-hit progression trace strengthening
  -> synthetic-imported-default-gethit-progression.json checksum ef2a67f8 gates ordered 5000 ChangeState before 5001 ChangeState
  -> actor-frame evidence now requires imported P2 5000 before 5001, with final idle/control evidence
  -> no exact HitShakeOver/HitOver timing, fall/bounce/liedown/recovery, helper/custom-state breadth, or full Common1 VM claim
R1 required common/FightFX HitSpark asset-frame trace strengthening
  -> synthetic-imported-hitdef-common-spark.json checksum 5ea054d7 gates unprefixed common/default source-frame plus multi-frame AIR metadata for sparkno 7001
  -> synthetic-imported-hitdef-fightfx-spark.json checksum 11537b56 gates F-prefixed FightFX source-frame plus multi-frame AIR metadata for sparkno F7002
  -> required traces now require at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer handoff
  -> required trace evidence only; no exact renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, or full spark parity claim
R1 optional KFM x HitDef presentation trace strengthening
  -> kfm-official-x-hit-sound.json checksum bd153db9 gates bounded real KFM x hitsound S5,0 telemetry
  -> kfm-official-x-hit-spark.json checksum bd153db9 gates bounded real KFM x sparkno 0 telemetry
  -> optional private fixture evidence only; no public asset, exact SND playback, exact FightFX/common rendering, or score claim
R1 synthetic TargetLifeAdd NoKO trace strengthening
  -> synthetic-imported-target-noko.json checksum 321a1eba gates ordered P2 AssertSpecial NoKO -> P1 HitDef -> P1 TargetLifeAdd evidence
  -> trace evidence includes target link id 77 and final P2 life 1 after lethal target-controller damage
  -> no exact NoKO lifetime, helpers/root/parent, teams, multi-target lifetime, round flow, exact target timing, or target parity claim
R1 synthetic Target* side-effect trace strengthening
  -> synthetic-imported-target.json checksum f5a16dc9 now gates TargetLifeAdd/TargetPowerAdd/TargetVel*/TargetFacing/TargetBind/BindToTarget/TargetDrop typed ops
  -> trace evidence includes target links, P2 facing/velocity actor-frame telemetry, final P1 targetCount 0, final P2 life 943 and power 40
  -> no full target redirects, helpers/root/parent, teams, multi-target lifetime, exact bind/drop tick-order, or target parity claim
R2 RuntimeSnapshotWorld player actor projection
  -> player actor snapshot projection moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover actor metadata, runtime/event cloning, target refs/bindings, active/frame collision boxes, missing-frame fallback hurtbox, and state-owner sprite metadata
  -> pnpm qa:trace stays stable; no target semantics, effect snapshot, compatibility session, renderer, motif/screenpack, or full snapshot parity claim
R2 RuntimeCompatibilityTelemetryWorld ownership extraction
  -> imported compatibility telemetry/session projection moved out of PlayableMatchRuntime
  -> focused RuntimeCompatibilityTelemetrySystem tests cover imported/owner-backed filtering, session projection, controller-event caps, and operation key stability
  -> pnpm qa:trace stays stable; no new controller semantics, CNS VM timing, or parity claim
R2 RuntimeSnapshotWorld ownership extraction
  -> stage/camera snapshot projection moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover ScreenBound camera exclusion/fallback and EnvShake/EnvColor handoff
  -> pnpm qa:trace stays stable at 156/156 artifacts; no renderer, screenpack, target semantics, effect snapshot, compatibility session, or camera parity claim
R2 RuntimeAssertSpecialWorld ownership extraction
  -> imported pre-facing AssertSpecial lookup/filter/trigger/application moved out of PlayableMatchRuntime
  -> focused RuntimeAssertSpecialSystem tests cover imported current-state, owner-backed custom-state, trigger filtering, and non-imported skip behavior
  -> trace behavior expected unchanged; no new parity or score claim
R2 RuntimeHitPauseWorld ownership extraction
  -> global hitpause command buffering, ignorehitpause controller dispatch, paused presentation, and countdown moved out of PlayableMatchRuntime
  -> focused RuntimeHitPauseSystem tests cover ordering and no-op behavior outside hitpause
  -> trace behavior expected unchanged; no new parity or score claim
R2 RuntimePausedMatchWorld ownership extraction
  -> regular Pause/SuperPause paused-match ordering moved out of PlayableMatchRuntime
  -> focused PauseSystem tests cover source movetime ordering, frozen actor presentation, pause replacement interruption, and pause countdown ticking
  -> trace behavior expected unchanged; no new parity or score claim
R2 RuntimeStunWorld presentation ownership extraction
  -> hitstun/guardstun advance plus presentation/recovery glue moved out of PlayableMatchRuntime
  -> focused RuntimeStunSystem tests cover guard+hit callback behavior, imported hit-state preservation, current-move guardrails, and state-owner presentation suppression
  -> trace behavior unchanged; no new parity or score claim
R2 RuntimeStateAvailabilityWorld ownership extraction
  -> state/action availability lookup moved out of PlayableMatchRuntime
  -> focused StateAvailabilitySystem tests cover compiled state precedence, parsed states, animation fallback, owner-backed lookup, and missing-state rejection
  -> trace behavior unchanged; no new parity or score claim
R2 RuntimeHitStateTransitionWorld ownership extraction
  -> direct-hit and ReversalDef p1/p2 state transition routing moved out of PlayableMatchRuntime
  -> focused HitStateTransitionSystem tests cover attacker-owned, target-owned, and unavailable-state behavior
  -> trace behavior unchanged; no new parity or score claim
R2 RuntimeGetHitStateWorld ownership extraction
  -> default stand/crouch/air get-hit state selection moved out of PlayableMatchRuntime
  -> focused GetHitStateSystem tests cover 5000, 5010 -> 5000, 5020 -> 5000, and missing-state no-op behavior
  -> trace behavior unchanged; no new parity or score claim
R2 HitSparkAssetSystem ownership extraction
  -> player/common/FightFX spark asset-frame lookup named after package-frame handoff
  -> focused HitSparkAssetSystem tests cover source routing and lookup behavior
  -> renderer behavior unchanged; no new parity or score claim
R2 RuntimeRecoverySystem ownership extraction
  -> fall.recovertime, Common1 liedown recovery, and imported ground-recovery landing moved out of PlayableMatchRuntime
  -> focused RuntimeRecoverySystem tests cover timer/default/transition behavior
  -> behavior unchanged; no new parity or score claim
R2 BindToTarget target-system ownership extraction
  -> target lookup, postype/offset binding, duration, position application, and op reporting moved into RuntimeTargetWorld
  -> focused TargetSystem tests cover raw Head anchors, typed ops, and miss/no-mutation behavior
  -> behavior unchanged; no new parity or score claim
R2 active target-binding position ownership extraction
  -> per-frame TargetBind target-position and BindToTarget owner-position mutation moved into RuntimeTargetWorld
  -> focused TargetSystem tests cover both binding directions and missing-target no-op behavior
  -> behavior unchanged; no new parity or score claim
R2 RuntimeHitEligibilityWorld ownership extraction
  -> HitBy/NotHitBy slot ticking and AssertSpecial/render-opacity frame reset moved out of PlayableMatchRuntime
  -> focused RuntimeHitEligibilitySystem tests cover finite/infinite slots and reset behavior
  -> behavior unchanged; no new parity or score claim
R2 RuntimeOrientationWorld ownership extraction
  -> auto-facing and Turn facing flips moved into OrientationSystem
  -> focused RuntimeOrientationSystem tests cover opponent-facing, NoAutoTurn preservation, and Turn
  -> behavior unchanged; no new parity or score claim
R2 RuntimeGuardWorld ownership extraction
  -> guard-hit state selection and auto guard-start eligibility/mutation moved into GuardSystem
  -> focused GuardSystem tests cover state selection, guard-state rejection, pause/stun/current-move rejection, and start mutation
  -> behavior unchanged; no new parity or score claim
```

Default next implementation slice after docs/setup work:

```txt
R1 Common1/FightFX precision
  -> move one guard/fall/recovery or FightFX/common route beyond current bounded source-frame plus multi-frame AIR evidence
  -> prefer deeper VM loop order, broader fixture-backed confirmation, or exact visible package presentation evidence
```

Alternate next slice: R2 `MatchWorld` ownership around deeper helper VM boundaries, target ownership, presentation effects, or combat/effect ordering if it can preserve trace behavior. See `docs/NEXT_BUILD_ROADMAP.md` for the next-10-slices queue.

## Slice Selection Guardrails

Before starting work, check the latest numbered entry in `docs/BUILD_EXECUTION_BACKLOG.md`, this section, and the linked `.scratch/roadmap/issues/` file. Do not rebuild a gate that is already listed as closed.

Current closed gates that must not be reselected as "next":

- `synthetic-imported-hitby-allow.json`
- `synthetic-imported-hitby-reject.json`
- `synthetic-imported-hitdef-hit-sound.json`
- `synthetic-imported-hitdef-common-spark.json`
- `synthetic-imported-hitdef-fightfx-spark.json`
- `synthetic-imported-hitdef-common-guard-spark.json`
- `synthetic-imported-hitdef-fightfx-guard-spark.json`
- `synthetic-imported-default-gethit-progression.json` controller/frame order
- `synthetic-imported-target.json` final Target* side-effect evidence
- `synthetic-imported-target-noko.json` TargetLifeAdd defender-side NoKO evidence
- `synthetic-imported-target-owned-custom-state.json`
- `synthetic-imported-default-guard-state.json` actor-frame telemetry
- `synthetic-imported-crouch-guard-state.json` actor-frame telemetry
- `synthetic-imported-diagonal-crouch-guard-state.json` actor-frame telemetry
- `synthetic-imported-air-guard-state.json` actor-frame telemetry
- `synthetic-imported-auto-guard-start.json` controller-order evidence
- `synthetic-imported-auto-guard-end.json` controller-order evidence
- `synthetic-imported-noop.json` debug clipboard plus `MakeDust` / `DestroySelf` no-op coverage
- `synthetic-imported-variable.json` `VarRandom` variable compatibility
- `RuntimeContactMemoryWorld` direct/projectile contact-memory ownership extraction
- `RuntimeRandomSystem` deterministic random ownership extraction
- `HitSparkAssetSystem` player/common/FightFX spark asset-frame lookup extraction
- `RuntimeRecoverySystem` fall/down-recovery ownership extraction
- `BindToTarget` target-system ownership extraction
- active target-binding position ownership extraction
- `RuntimeHitEligibilityWorld` ownership extraction
- `RuntimeOrientationWorld` ownership extraction
- `RuntimeGuardWorld` ownership extraction
- `RuntimeGetHitStateWorld` ownership extraction
- `RuntimeHitStateTransitionWorld` ownership extraction
- `RuntimeStateAvailabilityWorld` ownership extraction
- `RuntimeStunWorld` ownership extraction
- `RuntimePausedMatchWorld` ownership extraction
- `RuntimeHitPauseWorld` ownership extraction
- `RuntimeMoveLifecycleWorld` ownership extraction
- `RuntimeInputControlWorld` ownership extraction
- `RuntimeAnimationWorld` ownership extraction
- `RuntimeContactPresentationWorld` ownership extraction
- `RuntimeGuardDistanceWorld` ownership extraction
- `RuntimeKinematicsWorld` ownership extraction
- visual-helper removal ownership
- helper-local micro-VM ownership, including helper-local sound-event telemetry and bounded parent/root/opponent read-only redirects
- `RuntimeAssertSpecialWorld` ownership extraction
- `RuntimeSnapshotWorld` ownership extraction
- `RuntimeSnapshotWorld` player actor projection
- `RuntimeCompatibilityTelemetryWorld` ownership extraction

After docs-only/setup work, return to one of these evidence-producing cuts:

1. R1 Common1 recovery/guard controller-loop precision.
2. R1 FightFX/common presentation proof beyond current package-frame handoff and source-frame plus multi-frame trace metadata.
3. R2 `MatchWorld` ownership around deeper helper parent/root/redirect boundaries, helper-owned combat/contact, helper-bound effect mutation/timing, effect/combat ordering, deeper target ownership, or the next non-`RuntimeContactPresentationWorld` mutable boundary with stable or documented trace behavior.

## Package Closeout Contract

Every package closeout must include:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

If the work is visible, add `pnpm qa:smoke` plus visual inspection. If the work changes runtime compatibility, add `pnpm qa:trace`. If it is docs-only, state `No score movement`.

## Update Map

| Package | Must update when moved |
| --- | --- |
| G1 | `AGENTS.md`, `docs/agents/*`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |
| R1 | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| R2 | `docs/ENGINE_PORT_ARCHITECTURE.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| S1 | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, `.scratch/roadmap/issues/02-studio-evidence-workflow.md` |
| A1 | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, `.scratch/roadmap/issues/03-generated-assets-pipeline.md` |
| I1 | `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, `docs/MUGEN_COMPATIBILITY_PLAN.md`, `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` |
| M1 | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, `docs/ENGINE_PORT_ARCHITECTURE.md`, `.scratch/roadmap/issues/05-modular-engine-boundaries.md` |

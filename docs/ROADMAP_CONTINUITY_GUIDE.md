# Roadmap Continuity Guide

Last updated: 2026-06-29

This guide exists so the project can keep moving without losing the thread. It does not replace the scorecard, execution board, or workplan. It explains how to continue the port in a way that produces usable software instead of scattered experiments.

## Current Horizon

The active horizon is:

```txt
MUGEN-lite playable MVP
  -> official/local KFM-style package runs common authored routes
  -> native/generated roster remains playable
  -> unsupported features are visible, classified, and non-crashing
  -> Studio can show what is loaded, stale, blocked, exportable, and proven
  -> every compatibility claim has a test, trace, fixture, screenshot, or build artifact
```

The project is not currently trying to claim full MUGEN or IKEMEN parity. It is building the engine shape that can eventually reach those horizons.

## Continuity Rules

1. Preserve the playable sandbox.
2. Prefer one score-moving gate over broad unfinished work.
3. Treat scanner support, parser support, runtime execution, and visual parity as separate claims.
4. Keep generated/native fighters separate from imported MUGEN compatibility.
5. Do not move scores from docs-only work.
6. Every runtime compatibility cut must name what is still blocked.
7. Every frontend/render cut must close with visual QA.
8. Every broad planning pass must leave a smaller next implementation slice.

## Workstream Ladder

| Order | Workstream | Goal | Evidence that counts |
| --- | --- | --- | --- |
| 1 | R1 Runtime compatibility | More KFM/Common1-style authored routes execute. | `pnpm qa:trace`, focused runtime tests, optional KFM fixture gates. |
| 2 | R2 MatchWorld ownership | Mutable runtime behavior moves behind named systems. | Focused system tests, stable or documented trace checksums. |
| 3 | S1 Studio trust chain | Evidence and Build agree on status and next action. | `pnpm qa:smoke`, screenshots, real evidence rows. |
| 4 | A1 Generated assets | Prompt/source/atlas/QA/playtest/collision records stay linked. | Asset QA records, Studio surfacing, visual smoke if UI changes. |
| 5 | I1 IKEMEN scanner | More IKEMEN source/docs signals are recognized and classified. | Scanner tests and blocked runtime wording. |
| 6 | M1 Modular engine | Shared contracts prove no fighting-specific leakage. | `pnpm check:boundaries`, contract tests, docs. |

## Next Useful Runtime Gates

These are good next implementation slices because they can be proven without pretending to finish the full VM:

- Add one missing Common1 guard/fall/recovery oracle that records exact controller/operation order.
- Promote one currently parser-only or scanner-only controller into a typed no-crash runtime operation when semantics are simple.
- Deepen `MatchWorld` ownership around helper lifecycle, target ownership, or presentation effects.
- Add one trace gate for a controller family that currently has only unit-level proof.
- Improve FightFX/common presentation only if the result can be seen in smoke diagnostics or trace metadata.

Avoid starting full helper VM, full ZSS/Lua, rollback, teams, or screenpack parity until the smaller routes above stay green.

The compact package ladder lives in `docs/ROADMAP_PACKAGE_MILESTONES.md`; the tactical next-10-slices queue lives in `docs/NEXT_BUILD_ROADMAP.md`. After docs/setup work, return to both before choosing code.

Latest closed R2 ownership checkpoint: `RuntimeMatchPresentationSnapshotWorld` owns bounded match presentation snapshot input construction outside `PlayableMatchRuntime`, with focused coverage proving camera shake, stage flash, effect-group forwarding, and P1/P2 ordering through one seam before `RuntimeSnapshotWorld.match()`. This is ownership cleanup only; no exact stage/motif camera logic, effect lifecycle semantics, renderer/audio parity, visual/debug UI parity, score movement, or full match snapshot parity claim.

Latest closed R1 presentation checkpoint: `synthetic-imported-envcolor-under.json` checksum `0a7b5c96` is required in `pnpm qa:trace` and proves bounded imported `EnvColor value = 16,96,255`, `time = 12`, and `under = 1` lower into typed `envcolor` operation evidence and reach stage-frame flash telemetry. The previous `synthetic-imported-envcolor.json` checksum `956b0f4b` remains the `under = 0` route. Current trace aggregate is 281/281 artifacts, 256 required and 25 optional. This is stage-flash layer-flag evidence only; no exact blend math, layer/window ordering, pause timing, renderer parity, visual parity, score movement, or full presentation parity claim.

Previous closed R2 ownership checkpoint: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`, with focused coverage proving controller and operation forwarding through one shared hook set for active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch. This is ownership cleanup only; no exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, score movement, or full CNS VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchCombatStateHooksWorld` owns bounded combat state-hook adapter construction outside `PlayableMatchRuntime`, with focused coverage proving direct/projectile combat hooks preserve state-owner availability/entry options and helper combat hooks keep self-owned availability checks while forwarding entry options. This is ownership cleanup only; no helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, visual/audio parity, score movement, or full combat/helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchOpponentContextWorld` owns bounded current 1v1 match-opponent context construction for active/pause/hitpause lifecycle bridges outside `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`, with focused coverage for mirrored P1/P2 contexts and unknown-actor fail-closed behavior. This is ownership cleanup only; no real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, or full match/helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeEffectHelperContextWorld` owns bounded visual Helper lifecycle context construction outside `RuntimeEffectLifecycleWorld`, with focused coverage for nearest-order explicit opponent roster construction, explicit roster preservation, target-candidate and helper hook forwarding, and incomplete-owner fail-closed behavior. This is ownership cleanup only; no real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, or full Helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchHelperProjectileTargetWorld` owns bounded match-level helper-parented Projectile target-memory bridge wiring outside `PlayableMatchRuntime`, with focused coverage for forwarding owner, defender, projectile, and `RuntimeTargetWorld` plus owner-projectile fail-closed behavior. This is ownership cleanup only; no helper-owned Projectile contact timing, helper-owned custom-state table breadth, teams/simul actor registry, multi-target helper ownership, exact target lifetime, visual/audio parity, score movement, or full Helper/Projectile VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchHelperBindingWorld` owns bounded match-level helper callback wiring outside `PlayableMatchRuntime`, with focused coverage for owner-specific helper `TargetState` route forwarding, stale handler replacement, helper-state/owner-state Projectile telemetry attribution, and non-Projectile telemetry ignore behavior. This is ownership cleanup only; no helper custom-state table breadth, throws, teams/simul actor registry, multi-target helper ownership, exact helper TargetState/projectile timing, broad helper telemetry semantics, visual/audio parity, score movement, or full Helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchHelperTargetStateWorld` owns bounded match-roster target resolution for helper-owned `TargetState` entry outside `PlayableMatchRuntime`, with focused coverage for roster-backed target resolution, stale target payload isolation, missing-target no-op behavior, and owner-mismatch fail-closed behavior. This is ownership cleanup only; no helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState timing, visual/audio parity, score movement, or full Helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchPostFighterWorld` owns bounded normal active-match post-fighter bridge wiring outside `PlayableMatchRuntime`, with focused coverage for target memory, effect lifecycle, projectile clash, actor constraints, target bindings, direct/projectile/helper combat, clamps, and presentation effect forwarding after resolver construction. This is ownership cleanup only; no exact MUGEN/IKEMEN post-fighter tick order, combat priority parity, projectile/helper contact timing, helper/team/redirect ownership, target lifetime parity, visual/audio parity, score movement, or full match VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchInputControlWorld` owns bounded normal active-match P1/P2-controlled/simple-AI input dispatch outside `PlayableMatchRuntime`, with focused coverage for P1-before-controlled-P2 ordering, mirrored opponent arguments, and P1-before-AI fallback ordering. This is ownership cleanup only; no exact MUGEN/IKEMEN input priority, command timing, input-conflict resolution, pause/hitpause command parity, helper/team/redirect command ownership, AI parity, visual/audio parity, score movement, or full input VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchRoundWorld` owns bounded active-match round timer delegation plus finish side effects outside `PlayableMatchRuntime`, with focused coverage for timer delegation, finish stop/log mutation, and no-finish no-op behavior. This is ownership cleanup only; no exact round-flow timing, intros/winposes, KO slowdown, continue flow, teams/simul/turns, lifebar/screenpack behavior, visual/audio parity, score movement, or full round VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchFighterAdvanceWorld` owns bounded active 1v1 fighter-advance orchestration outside `PlayableMatchRuntime`, with focused coverage for normal P1/P2 ordering and pause-after-P1 skip behavior. This is ownership cleanup only; no exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, score movement, or full match VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchPauseControllerWorld` owns bounded Pause/SuperPause controller result side effects outside `PlayableMatchRuntime`, with focused coverage for tick/controller/op forwarding, power-delta handoff, log emission, and zero-length no-side-effect behavior. This is ownership cleanup only; no exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, or full pause VM claim.

Previous R2 ownership checkpoint: `RuntimeMatchCombatBridgeWorld` owns bounded priority/direct/projectile/helper combat resolver construction outside `PlayableMatchRuntime`, with focused coverage for route wiring, hurtbox forwarding, projectile target-memory callback forwarding, and log forwarding. This is ownership cleanup only; no exact combat priority, helper-owned contact timing, projectile hit/cancel timing, teams/simul/multi-target breadth, visual/audio parity, score movement, or full combat VM claim.

Previous closed trace checkpoint: `synthetic-imported-helper-projcanceltime-id.json` checksum `fc412176` proves bounded helper-local `ProjCancelTime(8868)` routing after a matching helper-parented owner-side Projectile is canceled by an opposing Projectile clash, then routes the Helper from state/action `1268` into `1269` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `1008`, helper/projectile lifecycle, effect-store, and payload evidence; `pnpm qa:trace` was 251/251 artifacts, 231 required and 20 optional at that checkpoint.

Previous closed implementation checkpoint: `synthetic-imported-helper-projcanceltime-any.json` checksum `f7e7fa01` proves bounded helper-local `ProjCancelTime(0)` routing after a helper-parented owner-side Projectile is canceled by an opposing Projectile clash, then routes the Helper from state/action `1266` into `1267` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `998`, helper/projectile lifecycle, effect-store, and payload evidence.

Previous closed implementation checkpoint: `synthetic-imported-projectile-canceltime.json` checksum `64e8dec4` proves bounded owner-state `ProjCancelTime(77)` routing after that owner's player-owned Projectile is canceled by an opposing Projectile clash, then routes P2 into state/action `283` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback, projectile lifecycle, effect-store, and payload evidence.

Previous closed implementation checkpoint: `synthetic-imported-helper-projguardedtime-any.json` checksum `bd64e9db` and `synthetic-imported-helper-projcontacttime-any.json` checksum `5c6a4e11` prove bounded helper-local `ProjGuardedTime(0)` and `ProjContactTime(0)` any-projectile routing after helper-parented Projectile guard/contact markers, then route the Helper into state/actions `1263` and `1265` with guard event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence.

Previous closed implementation checkpoint: `synthetic-imported-helper-projhittime-any.json` checksum `bca9f47b` proves bounded helper-local `ProjHitTime(0)` any-projectile hit-time routing after a helper-parented Projectile hit, then routes the Helper into state/action `1261` with hit event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence.

Previous closed Projectile hit-time checkpoint: `synthetic-imported-projectile-hittime-any.json` checksum `47c1cf7f` proves bounded owner-state `ProjHitTime(0)` any-projectile hit-time routing after a player-owned Projectile hit, then routes P1 into state/action `282` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence.

Previous closed Projectile contact-time checkpoint: `synthetic-imported-projectile-contacttime-any.json` checksum `f1751155` remains required and proves bounded owner-state `ProjContactTime(0)` any-projectile contact-time routing after a player-owned Projectile contact, then routes P1 into state/action `281` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence.

Previous closed Projectile guarded-time checkpoint: `synthetic-imported-projectile-guardedtime-any.json` checksum `c8473340` remains required and proves bounded owner-state `ProjGuardedTime(0)` any-projectile guard-time routing after a player-owned Projectile guard, then routes P1 into state/action `279` with guard event/reason, Projectile lifecycle, effect-store, and target-link evidence.

Previous closed target-memory checkpoint: `synthetic-imported-hitdef-projectile-target-mix.json` checksum `e98d4857` remains required and proves bounded owner-local target memory can retain separate direct `HitDef` id `77` and player-owned `Projectile` id `78` in one active state, then route P1 through `NumTarget(77)`, `Target(77), Life`, `NumTarget(78)`, and `Target(78), Life` into state/action `278`.

Previous R1 trigger checkpoints include `synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3c3f2e25`, `synthetic-imported-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3fcf1421`, `synthetic-imported-gethitvar-air-guard-hitshaketime.json` checksum `703e9328`, `synthetic-imported-gethitvar-crouch-guard-hitshaketime.json` checksum `b31d1dac`, `synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime.json` checksum `64a1a8bd`, `synthetic-imported-projectile-gethitvar-guard-hitshaketime.json` checksum `724f66d6`, `synthetic-imported-gethitvar-guard-hitshaketime.json` checksum `31d76de9`, `synthetic-imported-gethitvar-hitshaketime.json` checksum `655107b9`, `synthetic-imported-gethitvar-hittime.json` checksum `a11beef0`, `synthetic-imported-gethitvar-guard-timing.json` checksum `cf92c669`, `synthetic-imported-gethitvar-down-recover.json` checksum `b8a7aef0`, `synthetic-imported-gethitvar-fall-envshake.json` checksum `6364632a`, `synthetic-imported-gethitvar-fall-metadata.json` checksum `474fa734`, `synthetic-imported-teamside.json` checksum `f55695b7`, `synthetic-imported-helper-projectile-gethitvar-guarded.json` checksum `2b413bd7`, `synthetic-imported-projectile-gethitvar-guarded.json` checksum `a0104472`, `synthetic-imported-gethitvar-guarded.json` checksum `7c36defb`, `synthetic-imported-gethitvar-fall-recover.json` checksum `259b300f`, `synthetic-imported-animelemtime.json` checksum `2036557d`, `synthetic-imported-animtime.json` checksum `9e42b546`, and `synthetic-imported-selfanimexist.json` checksum `99930032`. Previous R2 checkpoint: `RuntimeFighterStateWorld` owns bounded fighter runtime-state construction while `PlayableMatchRuntime` still owns stage starts, actor ids, definitions, and injected match worlds.

Do not reselect the EnvColor under-layer gate, Projectile cancel-time gate, helper Projectile guard/contact-time any gates, helper Projectile hit-time any gate, Projectile guarded-time any gate, HitDef plus Projectile target-memory mix gate, helper Projectile air guard hitshaketime GetHitVar gate, player Projectile air guard hitshaketime GetHitVar gate, air guard hitshaketime GetHitVar gate, crouch guard hitshaketime GetHitVar gate, helper Projectile guard hitshaketime GetHitVar gate, player Projectile guard hitshaketime GetHitVar gate, direct guard hitshaketime GetHitVar gate, normal hitshaketime GetHitVar gate, normal hittime GetHitVar gate, guard timing GetHitVar gate, down-recover GetHitVar gate, fall env-shake GetHitVar gate, fall metadata GetHitVar gate, TeamSide gate, helper Projectile guarded GetHitVar gate, player Projectile guarded GetHitVar gate, direct guarded GetHitVar gate, fall-recover GetHitVar gate, full-chain fall recovery gate, AnimElemTime, AnimTime, SelfAnimExist, SelfStateNoExist, EnemyNear index, identity, fighter-state factory ownership, match reset ownership, `VarRandom`, `MakeDust`, `RuntimeHelperTargetStateWorld` handler binding, `RuntimeMatchHelperBindingWorld`, `RuntimeEffectHelperContextWorld`, `RuntimeMatchPresentationSnapshotWorld`, `RuntimeActiveControllerTelemetryWorld`, `RuntimeMatchCombatStateHooksWorld`, `RuntimeContactMemoryWorld`, `RuntimeRandomSystem`, `RuntimeExpressionContextWorld`, `RuntimeFrameWorld`, `RuntimeAfterImageSampleWorld`, `RuntimeControllerEvaluationContextWorld`, `RuntimeDispatchEvaluationWorld`, `RuntimeTriggerEvaluationWorld`, `RuntimeTriggerGateWorld`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld`, `RuntimeStateTransitionControllerWorld`, `RuntimeAnimationControllerWorld`, `RuntimeKinematicControllerWorld`, `RuntimeBoundsControllerWorld`, `RuntimeHitFallControllerWorld`, `RuntimeStateTypeWorld`, `RuntimeDamageScaleWorld`, `RuntimeHitDefenseWorld`, `RuntimeAssertSpecialWorld`, `RuntimeSnapshotWorld` stage/camera ownership, `RuntimeSnapshotWorld` player actor projection, `RuntimeCompatibilityTelemetryWorld`, `RuntimeOrientationWorld`, `RuntimeGuardWorld`, `RuntimeGetHitStateWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeStunWorld`, `RuntimeStateEntryWorld`, `RuntimeResourceWorld`, `RuntimeControllerDispatchWorld`, `RuntimeStateEntrySetupWorld`, `RuntimeSpriteEffectControllerWorld`, `RuntimeTargetControllerDispatchWorld`, `RuntimeContactControllerDispatchWorld`, `RuntimeAudioControllerDispatchWorld`, `RuntimeEnvColorControllerDispatchWorld`, `RuntimeEnvShakeControllerDispatchWorld`, `RuntimePauseControllerDispatchWorld`, `RuntimeActorConstraintControllerDispatchWorld`, `RuntimeFallEnvShakeControllerDispatchWorld`, `RuntimeEffectSpawnControllerDispatchWorld`, `RuntimeReversalControllerDispatchWorld`, `RuntimeHitDefControllerDispatchWorld`, `RuntimeMatchFighterAdvanceWorld`, `RuntimeMatchPauseControllerWorld`, `RuntimeMatchCombatBridgeWorld`, `RuntimeMatchRoundWorld`, `RuntimeMatchInputControlWorld`, or `RuntimeMatchPostFighterWorld` ownership as the next cut; continue into R1 guard/FightFX/Common1 precision or a deeper R2 helper/effect/combat ownership seam.

## Next Useful Studio Gates

Studio should become a production workbench, not a static dashboard. Good next slices:

- One shared status contract consumed by Evidence and Build.
- One primary next action for each blocked/stale/missing/exportable row.
- Trace comparison rows that link to frame or actor evidence.
- Asset provenance record that joins source prompt, image sheet, atlas manifest, QA report, collision data, and playtest entry.
- Export readiness that refuses decorative success states when sources are missing.

## Documentation Update Matrix

Use this table when closing a slice:

| Slice type | Must update |
| --- | --- |
| Runtime support or controller semantics | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant `.scratch/roadmap/issues/` file. |
| Trace or fixture claim | `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/FIXTURE_GOLDENS.md` if golden policy changes, relevant issue. |
| Score change | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, `docs/ROADMAP_EXECUTION_BOARD.md`. |
| Studio workflow | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue. |
| Generated asset pipeline | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue. |
| IKEMEN scanner | `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, `docs/SUPPORTED_FEATURES.md`, relevant issue. |
| Modular boundary | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue. |
| Docs/setup only | `AGENTS.md`, `docs/agents/*`, `docs/ROADMAP_NAVIGATION.md`, `docs/PROGRESS_TRACKER.md` if the navigation model changes. |

## Closeout Template

Use this exact shape for meaningful progress:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

For docs-only work, say `No score movement`.

## Stop Conditions

Pause and ask the user only when:

- a fixture or asset is required and cannot be generated or downloaded safely,
- a product decision changes the horizon or public/private boundary,
- a third-party asset would need to be committed to the repo,
- the same blocker repeats across multiple attempts and no smaller route remains.

Otherwise keep making small, verified progress.

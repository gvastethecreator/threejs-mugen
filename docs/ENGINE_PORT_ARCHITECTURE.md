# Engine Port Architecture

This document describes the intended architecture for growing the current sandbox into a progressive MUGEN/IKEMEN-GO browser port. The broader studio and modular-engine direction is documented in `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`.

## Architectural Shape

```txt
Local ZIP / folder
  -> Virtual file system
  -> Resource discovery and path resolution
  -> Parsers
  -> Normalized immutable models
  -> Optional compiler IR
  -> Deterministic match runtime
  -> Runtime snapshots
  -> Three.js / Web Audio / DOM adapters
  -> Debug UI and compatibility reports
```

The important rule: MUGEN data and runtime behavior must stay renderer-independent. Three.js is the presentation adapter, not the engine.

The future creator studio adds a layer above this engine flow:

```txt
Creator Studio Project
  -> Asset Library
  -> Character / Stage / Module editors
  -> Playtest launcher
  -> Engine module runtime
```

The studio owns authoring and project management. The engine owns deterministic runtime behavior.

## Main Subsystems

### Package Layer

Owns:

- ZIP/folder loading.
- Case-insensitive virtual paths.
- DEF/stage discovery.
- Character/stage/package source metadata.

This layer should tolerate unusual layouts and report ambiguity instead of failing early.

### Parser Layer

Owns:

- DEF, AIR, CMD, CNS/ST, SFF, ACT, SND, stage DEF.
- Raw section preservation.
- Diagnostics and source locations.
- Syntax tolerance for legacy files.

Parser output must be immutable and should not depend on runtime objects.

### Model Layer

Owns normalized data:

- `MugenCharacter`.
- `MugenAnimationAction`.
- `MugenSprite`.
- `MugenStateDef`.
- `MugenCommand`.
- `MugenStageDefinition`.
- `CompatibilityReport`.

Models should describe what was found, not what can execute.

### Compiler Layer

This is now the active architectural layer. It converts parsed legacy data into runtime-friendly IR before broader runtime migration:

```txt
CMD commands -> CommandIr
CNS triggers -> ExpressionIr / TriggerIr
State controllers -> ControllerIr
StateDef graphs -> RuntimeStateProgram
```

The first compiler cut lives under `src/mugen/compiler/` and currently produces:

- `CommandIr` from parsed `.cmd` command tokens.
- `ExpressionIr` from trigger expressions, including normalized axis/range syntax and unsupported trigger feature lists.
- `ControllerIr` from CNS/CMD state controllers with a single support registry for partial/no-op/unsupported controllers.
- `RuntimeProgramIr` and `CompileReport` summarizing commands, states, controllers, triggers, and static State -1 routable targets.

The compiler classifies each piece as:

- executable
- executable with partial params
- no-op
- recognized but not executable
- unsupported
- invalid

`CommandBuffer` consumes the shared command-step compiler. `MugenCharacterLoader` builds one cached `RuntimeProgramIr` per imported character, stores it on the model, passes it to compatibility reporting, and imports it into `PlayableMatchRuntime`; definitions without a cached program compile once when `FighterMatchState` is constructed. `StateControllerExecutor` keeps a native `executeControllerIr` path plus the legacy parsed-controller wrapper. `StateProgramExecutor` classifies compiled controllers into change-state, change-anim, shared runtime-controller, side-effect, or unsupported dispatches. `RuntimeActiveControllerScanWorld` owns active-state scan/owner selection/trigger pass iteration, and `RuntimeActiveControllerDispatchWorld` owns the bounded active-controller route order after a controller passes: `RuntimeActiveStateDispatchWorld` first handles `ChangeState` / `SelfState` and `ChangeAnim` / `ChangeAnim2`, shared runtime controllers route through `RuntimeControllerDispatchWorld`, `RuntimeActiveSideEffectDispatchWorld` groups current active side effects before existing controller worlds consume them, and unsupported dispatches stay fail-soft/reportable. `RuntimeFighterAdvanceHookSetWorld` now owns the bounded hook-set construction for each fighter advance, and `RuntimeFighterAdvanceWorld` owns the bounded per-fighter advance order around those dispatch systems: sprite-effect tick, hit eligibility, HitOverride, contact timers, render-angle reset, state clock, frame constraints, recovery timers, stun, move lifecycle, kinematics, animation, active controller execution, recovery landing, lie-down recovery, and frozen-position preservation happen through named boundaries. `PlayableMatchRuntime` still supplies concrete state-entry/action callbacks, world instances, frame lookup, target hooks, telemetry callbacks, stage/tick context, and active-loop order. This dispatch/advance spine is ownership cleanup only; exact CNS VM timing, persistent controllers, helper/team/redirect scopes, side-effect ordering parity, full player tick-order parity, and broad MUGEN/IKEMEN runtime parity remain blocked.

Current typed operation coverage includes bounded static `hitfall:*`, `kinematic:*`, `collision:*`, `bounds:*`, `metadata:*`, `orientation:*`, `sprite-effect:*`, `envcolor`, `audio:*`, `resource:*`, `variable:*`, `eligibility:*`, `hitoverride`, `reversaldef`, `hitdef`, `pause:*`, `target:*`, effect-spawn, contact, and `damage-scale:*` families, with raw expression fallback retained where params are dynamic or unsupported. The active sprite-effect boundary now has bounded dynamic fallback resolvers for `SprPriority`, `PalFX`, `RemapPal`, `Trans alpha`, `AfterImage`, `AfterImageTime`, and `Angle value/scale` params before mutation reaches `RuntimeSpriteEffectWorld`; `RuntimeEnvColorWorld` and `RuntimeEnvShakeWorld` accept bounded dynamic fallback resolvers for their dynamic presentation params, `RuntimeActorConstraintWorld` accepts bounded dynamic `Width player/value` resolvers for body-width telemetry when no typed op exists, `RuntimeBoundsControllerWorld` accepts bounded dynamic `PlayerPush value` resolvers for body-push telemetry when no typed op exists, and `RuntimeAudioControllerDispatchWorld` accepts bounded dynamic audio numeric resolvers for `PlaySnd` / `SndPan` / `StopSnd` event telemetry when no typed audio op exists. `PauseSystem`, `RuntimeAudioWorld`, `RuntimeHitEffectWorld`, `RuntimeContactPresentationWorld`, `RuntimeEnvShakeWorld`, `RuntimeEnvColorWorld`, `SpriteEffectSystem`, `ExplodSystem`, `HelperSystem`, `ProjectileSystem`, `RuntimeProjectileCombatWorld`, `EffectActorSystem`, `TargetSystem`, and `CombatResolver` own the current partial semantic boundaries below that dispatch layer. `RuntimeTraceGate` records actor/effect/stage evidence without renderer coupling. This is still a partial compatibility layer, not exact playback, FightFX/common layering, helper VM parity, target/team semantics, screenpack ownership, or full CNS parity.


`RuntimeCombatResolutionWorld` owns the bounded active direct/projectile contact orchestration that used to live as private `PlayableMatchRuntime` helpers: direct move eligibility, direct priority callback use, reversal checks, HitBy/NotHitBy reject logging, HitOverride redirect hooks, target-memory remembering, direct hit/guard result handoff, projectile-combat callback wiring, received-damage/contact memory routing, and contact presentation emission through `RuntimeContactPresentationWorld`. `PlayableMatchRuntime` still supplies runtime tick, current-frame hurtboxes, concrete state-entry hooks, trigger/controller order, active effect stores, and actor roster, so this is ownership cleanup rather than exact direct/projectile tick-order parity, helper-owned combat, projectile target ownership, multi-target/team behavior, or full MUGEN/IKEMEN combat VM parity.

`RuntimeHelperCombatWorld` owns the bounded helper-owned direct `HitDef` contact loop that still lived inline in `PlayableMatchRuntime`: owner-side helper iteration, helper direct-combat actor projection, active-window checks, current hurtbox/default-hurtbox contact tests, `HitBy`/`NotHitBy` rejection logging, direct hit/guard handoff through `RuntimeDirectCombatWorld`, imported default get-hit/guard-state hooks, helper target-memory remembering, contact presentation emission, and helper runtime-state sync. `PlayableMatchRuntime` still supplies runtime tick, current hurtboxes, state-entry validation, the effect actor store, target world, and broader helper/projectile/effect ordering, so this is ownership cleanup rather than exact helper hitpause/tick order, multi-target/team helper combat, helper-owned custom-state tables, or full Helper VM parity.

`RuntimeHelperProjectileTargetWorld` owns the bounded helper-parented Projectile target-memory mirror: owner-parented Projectile contacts are ignored, helper-parented Projectile contacts find the current parent Helper by runtime serial, and successful contacts write the same target id into helper-local target memory through `TargetSystem`.

`RuntimeMatchHelperProjectileTargetWorld` owns the match-level bridge into that lower helper target-memory mirror. `PlayableMatchRuntime` now forwards the concrete owner/defender/projectile tuple plus `RuntimeTargetWorld` through this named seam from normal post-fighter combat, while still owning broader combat/effect ordering. This is ownership cleanup rather than exact helper Projectile contact timing, target lifetime, helper-owned custom-state tables, teams, multi-target selection, or full Helper/Projectile parity.

`RuntimeMatchPresentationSnapshotWorld` owns the bounded match presentation snapshot input construction that used to live inline in `PlayableMatchRuntime.getSnapshot()`: camera shake, stage flash, and P1/P2 effect snapshot groups are now gathered through one seam before `RuntimeSnapshotWorld.match()` assembles the renderer-independent snapshot. `RuntimeSnapshotWorld` still owns final stage/player/effect/envelope projection. This is ownership cleanup rather than exact stage/motif camera logic, effect lifecycle semantics, renderer/audio parity, visual/debug UI parity, score movement, or full match snapshot parity.

`RuntimeActiveControllerTelemetryWorld` owns the bounded active-controller telemetry hook construction that used to be repeated as inline closures in `PlayableMatchRuntime`: active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch now share one controller/operation recorder hook set before forwarding into `RuntimeCompatibilityTelemetryWorld`. `RuntimeCompatibilityTelemetryWorld` still owns imported-only filtering, event keys, counts, event retention, and session projection. This is ownership cleanup rather than exact telemetry event semantics, helper/team/redirect telemetry breadth, visual/debug UI parity, score movement, or full CNS VM parity.

`RuntimeMatchCombatStateHooksWorld` owns the bounded combat state-hook adapter that used to live as inline closures in `PlayableMatchRuntime`: direct/projectile combat hooks preserve state-owner availability checks and entry options for custom-state routes, while helper combat hooks use self-owned availability checks and still forward entry options into state entry. `PlayableMatchRuntime` now creates both hook sets through this seam before `RuntimeMatchCombatBridgeWorld` routes them into direct/projectile/helper combat. This is ownership cleanup rather than helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, or full combat/helper VM parity.

`RuntimeMatchActorRosterWorld` owns the bounded current P1/P2 actor roster projection for `PlayableMatchRuntime`: helper-owned `TargetState` actor lookup, imported compatibility session projection, and effect-store owner summaries now consume one named roster boundary instead of rebuilding raw `[p1, p2]` lists and owner-id maps at each call site. The roster preserves live actor references, keeps P1/P2 order stable, provides fail-closed id lookup/opponent projection for actors outside the current pair, and remains strictly a current one-on-one seam. This is ownership cleanup rather than real teams/simul roster ownership, helper-owned actor discovery, dynamic roster mutation, richer identity metadata, exact VM scheduling, or full match actor registry parity.

`RuntimeMatchOpponentContextWorld` owns the bounded current 1v1 match-opponent context source for active, pause, and hitpause lifecycle bridges: P1/P2 map into the direct opponent plus singleton lifecycle `opponents` list, and actors outside the current pair fail closed. `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` use this seam before calling `RuntimeEffectLifecycleWorld`, so the concrete pair wiring is no longer duplicated in each match branch. This is ownership cleanup rather than real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact lifecycle/pause/combat ordering, or full match/helper VM parity.

`RuntimeEffectHelperContextWorld` owns the bounded helper advance context construction previously embedded inside `RuntimeEffectLifecycleWorld`: it validates complete owner runtime state, projects parent/root state, preserves current opponent id/state fallback, converts explicit lifecycle opponent lists into nearest-order helper `opponentRoster` entries, honors explicit roster overrides, forwards target candidates, and attaches helper `TargetState` / telemetry hooks. `RuntimeEffectLifecycleWorld` still owns active/presentation lifecycle calls and effect actor handoff, while this new context seam isolates the helper read-context data that future teams/simul or helper-owned opponent discovery will need. This is ownership cleanup rather than real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, or full Helper VM parity.

`RuntimeHelperTelemetryWorld` owns the bounded helper-local Projectile telemetry binding that still lived inline in `PlayableMatchRuntime`: match actors receive `onHelperController` / `onHelperOperation` handlers through one named boundary, only helper-local `Projectile` controller/operation events are forwarded into compatibility telemetry, and helper state numbers are preferred over owner state numbers with owner-state fallback when helper state is unavailable. `PlayableMatchRuntime` still supplies the concrete telemetry recorder and owner list, so this is ownership cleanup rather than exact helper Projectile tick timing, broader helper telemetry semantics, teams/simul helper ownership, or full Helper VM parity.

`RuntimeMatchTickInputWorld` owns the bounded normal-match input/tick stamping that still lived inline in `PlayableMatchRuntime`: per-frame actor `compatibilityTick`, cloned `currentInput`, and non-hitpause command-buffer samples now flow through one named boundary. Hitpause and regular pause command buffering remain owned by `RuntimeHitPauseWorld` / `RuntimePausedMatchWorld`, so this is ownership cleanup rather than exact command timing, pause/hitpause buffering parity, helper/team/redirect command ownership, or full input VM parity.

`RuntimeHelperTargetStateWorld` owns the bounded helper-owned `TargetState` state-entry adapter and its match-actor handler binding. Helper/owner identity is checked before target lookup, missing targets fail closed, unavailable target states fail closed, successful entries route the target into owner-backed state data through explicit state-entry hooks, and constructor/reset callback attach/re-attach now goes through the same world. `PlayableMatchRuntime` still supplies the concrete target lookup, state availability, state entry implementation, and broader helper/effect/controller ordering, so this is ownership cleanup rather than helper-owned custom state table parity, throws, teams, multi-target selection, or full helper TargetState parity.

`RuntimeMatchResetWorld` owns the bounded match reset orchestration that still lived inline in `PlayableMatchRuntime`: round timer reset, pause reset, EnvColor reset, effect actor store reset, in-place P1/P2 recreation, helper TargetState handler reattachment, and reset logging. `PlayableMatchRuntime` still supplies concrete fighter construction, stage start positions, injected worlds, and field assignment, so this is ownership cleanup rather than exact round-flow parity, continue/round intro semantics, helper/custom-state reset breadth, screenpack/lifebar reset behavior, or full match lifecycle parity.

`RuntimeFighterStateWorld` owns bounded fighter runtime-state construction for playable match actors: resource maxima and damage multipliers from constants, initial runtime/action/control/resource state, command buffers, contact memory, telemetry buckets, injected world references, deterministic RNG seed, and lazy runtime-program compilation now live outside `PlayableMatchRuntime`. `PlayableMatchRuntime` still supplies stage starts, actor ids, definitions, and injected match worlds, so this is ownership cleanup rather than exact player lifecycle parity, helper/custom-state clone breadth, team/simul roster ownership, intro/round lifecycle, or full actor registry parity.

`RuntimeMatchEnvColorBridgeWorld` owns the bounded match-level EnvColor bridge used by active, pause, and hitpause ignored-controller paths. It forwards controller source, optional typed `envcolor` operation data, optional dynamic resolver, runtime tick, and `RuntimeEnvColorWorld` emission through one named boundary. `PlayableMatchRuntime` still owns trigger filtering, active/pause/hitpause loop ordering, stage-world lifetime, and broader presentation timing, so this is ownership cleanup rather than exact EnvColor blend, layer/window, pause timing, renderer, or screenpack parity.

`RuntimeTargetStateEntryWorld` owns the bounded active-state `TargetState` state-entry adapter that still lived inline in `PlayableMatchRuntime`: the controller actor's current `stateOwner` is preserved when present, the controller actor becomes the owner otherwise, unavailable target states fail closed, and successful entries route the target into owner-backed state data through explicit hooks. `RuntimeTargetControllerDispatchWorld` still owns Target-controller dispatch and `RuntimeTargetWorld` still owns target-memory/candidate filtering, while `PlayableMatchRuntime` supplies concrete state availability and entry mutation, so this is ownership cleanup rather than exact TargetState tick order, throws, helper/team/multi-target target state selection, or full custom-state parity.

`RuntimeExpressionContextWorld` owns the bounded active runtime expression/trigger read context that used to be duplicated inside `PlayableMatchRuntime`: target redirects, contact/projectile reads, direct hit-count/readback, received-damage/readback, effect actor counts, command lookups, const/state/anim/hitvar reads, `HitDefAttr`, hitpause/hitover reads, and `InGuardDist` wiring. `RuntimeActiveExpressionContextWorld` now owns the active-match factory seam that supplies stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and `InGuardDist` into that read model before dynamic controller-param fallback or trigger evaluation. `RuntimeExpressionContextWorld` also accepts an optional explicit opponent roster so `EnemyNear(index)` / `EnemyNear(var(n))` and `NumEnemy` can read through a caller-supplied list before falling back to the current two-actor opponent; supplied rosters are sorted through `RuntimeOpponentSelectionWorld` before redirects resolve. `RuntimeOpponentSelectionWorld` can build id-bearing roster entries in nearest order without cloning runtime states, `RuntimeMatchOpponentContextWorld` owns the current concrete 1v1 lifecycle opponent source, and `RuntimeEffectLifecycleWorld` accepts that explicit lifecycle `opponents` list before `RuntimeEffectHelperContextWorld` turns it into helper-local `opponentRoster` entries through the nearest-order builder. `HelperSystem` reuses the same opponent-selection boundary for caller-supplied helper-local `opponentStates`, and can accept richer helper-local `opponentRoster` entries with id plus runtime state so non-current indexed entries can resolve bounded `TeamSide` after sorting. `RuntimeOpponentSelectionWorld` owns the current bounded horizontal body-distance scorer, stable tie handling, finite-before-nonfinite ordering, raw runtime-state list ordering, metadata-preserving roster construction, and metadata-preserving roster ordering. `PlayableMatchRuntime` still supplies actor/opponent/owner inputs, concrete controller dispatch, and exact loop timing, so this is read-model/opponent-selection/lifecycle/factory ownership cleanup rather than full expression language, exact VM timing, deterministic MUGEN/IKEMEN RNG stream parity, exact `InGuardDist` parity, real teams/simul roster ownership, automatic multi-opponent match roster discovery, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, or full teams/simul ordering parity.

`RuntimeDispatchEvaluationWorld` owns the bounded dynamic dispatch-param fallback between compiled `ControllerIr` dispatch data and the shared runtime expression read model: compiled numeric/Boolean values win, dynamic fallback expressions request a concrete context from `RuntimeExpressionContextWorld`, optional opponent rosters are forwarded into that context factory, numeric results are finite/truncated, and Boolean params derive from numeric truthiness. `PlayableMatchRuntime` still supplies actor/opponent/owner selection, random/time callbacks, animation timing callbacks, `InGuardDist`, concrete controller side effects, and exact VM timing, so this is ownership cleanup rather than full dynamic-param, helper/team redirect, or controller-loop parity.

`RuntimeControllerEvaluationContextWorld` owns the bounded `StateControllerExecutor` context shape used by active runtime-controller dispatch: owner const reads, actor hitpause reads, actor random callbacks, and stage-time forwarding now flow through a named context factory before `RuntimeControllerDispatchWorld` invokes passive controller execution. `PlayableMatchRuntime` still owns actor/owner selection, deterministic random state, concrete const lookup, dispatch order, and exact VM timing, so this is ownership cleanup rather than full passive-controller, helper/team redirect, or random-stream parity.

`RuntimeAfterImageSampleWorld` owns bounded `AfterImage` sample projection from actor runtime state plus the current AIR frame: cloned position, facing, self/state-owner sprite owner metadata, and sprite group/index/offset are produced outside `PlayableMatchRuntime` before `RuntimeSpriteEffectWorld` captures the sample. `PlayableMatchRuntime` still owns current-frame lookup, controller order, hitpause selection, and broader render projection, so this is ownership cleanup rather than exact ghost-trail cadence, blend/material, helper/redirect presentation, or renderer parity.

`RuntimeFrameWorld` owns bounded current AIR frame lookup and collision-box projection for both `PlayableMatchRuntime` and `RuntimeSnapshotWorld`: frame lookup, cloned frame hitboxes/hurtboxes, active move hitbox projection, and missing-frame default hurtboxes now live in one renderer-independent boundary. `PlayableMatchRuntime` still owns controller/combat order, guard-distance policy, ReversalDef frame-Clsn1 handoff, and exact VM timing, so this is ownership cleanup rather than exact collision priority, guard-distance thresholds, rotated/scaled boxes, helper/team/redirect collision ownership, or renderer parity.

`RuntimeTriggerEvaluationWorld` owns bounded single-trigger evaluation after the read model has been selected: it receives actor/opponent/opponent-roster/owner/tick plus a context factory, evaluates the compiled normalized `TriggerIr` expression, and projects the raw value into a Boolean pass/fail result. `RuntimeExpressionContextWorld` still owns the concrete `ExpressionContext`, and `PlayableMatchRuntime` still supplies random, animation timing, `InGuardDist`, dispatch, and VM integration timing.

`RuntimeTriggerGateWorld` owns the bounded CNS trigger grouping/order pass that used to be inline in `PlayableMatchRuntime`: `triggerall` entries are evaluated as an AND precondition, numbered `triggerN` groups are evaluated as OR groups in source order, groups short-circuit on failure/pass, and controllers with no numbered groups pass after `triggerall`. `PlayableMatchRuntime` now wires grouped triggers through `RuntimeTriggerEvaluationWorld` and `RuntimeExpressionContextWorld`, while still supplying concrete actor/opponent/owner context, random/time/animation callbacks, `InGuardDist`, and concrete dispatch. This is ownership cleanup, not full expression language parity, persistent-controller timing, helper/team/redirect trigger scopes, or exact CNS trigger tick-order parity.

`RuntimeStateTransitionControllerWorld` owns bounded passive `ChangeState` / `SelfState` controller setup that used to live inline in `StateControllerExecutor`: `value` / `stateno` expression resolution, previous-state metadata through `RuntimeStateMetadataSystem`, frame/time reset, optional `ctrl`, and missing-value reporting. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, while `RuntimeStateEntryWorld` and `PlayableMatchRuntime` still own active-state dispatch, concrete state/action lookup, custom-state owner selection, and exact tick order. This is ownership cleanup with a bounded executor fallback, not exact ChangeState/SelfState tick-order parity, persistent controller semantics, redirects/helper/team ownership, full custom-state breadth, or exact MUGEN/IKEMEN state-entry VM parity.

`RuntimeAnimationControllerWorld` owns bounded passive `ChangeAnim` / `ChangeAnim2` controller setup that used to live inline in `StateControllerExecutor`: `value` / `anim` expression resolution, self vs state-owner animation-source marking, frame/time reset, and optional `elem` / `elemtime` seeding when an AIR action resolver is supplied. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, while `PlayableMatchRuntime` still owns active-state dispatch, concrete action lookup, state-owner selection, and exact tick order. This is ownership cleanup with a bounded executor fallback, not missing-action fallback parity, redirects/helper/team ownership, full state-owner namespace behavior, or exact MUGEN/IKEMEN animation-controller VM parity.

`RuntimeKinematicControllerWorld` owns bounded passive movement/position controller setup that used to live inline in `StateControllerExecutor`: `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, and `Gravity` mutations from typed `kinematic:*` operations or raw controller params. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, while `RuntimeKinematicsWorld` still owns per-frame actor integration, sandbox gravity, ground snap, and landing hooks. This is ownership cleanup, not exact MUGEN/IKEMEN physics, velocity tick order, `yaccel` constants, helper/team/redirect ownership, or full kinematic VM parity.

`RuntimeBoundsControllerWorld` owns bounded passive actor-bounds controller setup that used to live inline in `StateControllerExecutor`: `PlayerPush`, `PosFreeze`, and `ScreenBound` mutations from typed `collision:playerpush` / `bounds:*` operations or raw controller params. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, while `RuntimeActorConstraintWorld` still owns per-frame reset/projection, stage clamp, and body-push separation. This is ownership cleanup, not exact player/edge collision, team/helper push behavior, screen-edge/camera parity, PosFreeze tick order, or full MUGEN/IKEMEN constraint parity.

`RuntimeHitFallControllerWorld` owns bounded passive get-hit/fall controller setup that used to live inline in `StateControllerExecutor`: `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutations from typed `hitfall:*` operations or raw controller params. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, so this is ownership cleanup, not exact Common1 controller-loop order, helper/team/redirect ownership, exact recovery thresholds/velocity math, or full MUGEN/IKEMEN fall parity.

`RuntimeStateTypeWorld` owns bounded passive StateTypeSet metadata setup that used to live as private `StateControllerExecutor` helpers: `stateType`, `moveType`, and `physics` writes from typed `metadata:statetypeset` operations or raw controller params. `StateControllerExecutor` still owns controller routing and broad runtime-controller execution, so this is ownership cleanup, not dynamic metadata expression support, helper/team/redirect ownership, exact physics/tick-order interactions, or full StateTypeSet parity.

`RuntimeDamageScaleWorld` owns bounded passive damage-scale setup that used to live inline in `StateControllerExecutor`: `AttackMulSet` and `DefenceMulSet` multiplier writes from typed `damage-scale:*` operations or raw controller params. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, so this is ownership cleanup, not exact MUGEN/IKEMEN scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, or full damage-scale parity.

`RuntimeHitDefenseWorld` owns bounded passive defensive-slot setup that used to live as private `StateControllerExecutor` helpers: `HitBy`, `NotHitBy`, and `HitOverride` slot installation/removal from typed `eligibility:*` / `hitoverride` operations or raw controller params. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution, so this is ownership cleanup, not exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, or full HitBy/NotHitBy/HitOverride parity.

`RuntimeHitDefControllerDispatchWorld` owns the bounded active-state HitDef activation dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `hitdef` operation selection, raw fallback attack params, fired-HitDef dedupe by state/line/frame, current AIR frame `Clsn1` hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry. `PlayableMatchRuntime` still owns trigger filtering, active-state order, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, target/reversal consequences, and broader HitDef VM ordering, so this is ownership cleanup, not exact HitDef parity.

`VarRandom` now compiles into typed `variable:varrandom` operation evidence and runs through the same runtime-controller dispatch as `VarSet`, `VarAdd`, and `VarRangeSet`. `RuntimeRandomSystem` owns deterministic per-actor seed creation, LCG advance, controller-safe unit clamping, and fallback random-unit derivation for trace-stable controller/trigger expression evaluation. `PlayableMatchRuntime` stores the current seed on each actor and delegates advance to that system. This is not exact MUGEN random stream parity and does not solve helper/parent/root variable scopes.

`RuntimePausedMatchWorld` owns the bounded regular `Pause` / `SuperPause` mini-loop that used to live inline in `PlayableMatchRuntime`: hitpause-style command buffering during match pause, source-actor `movetime` checks, player/AI source advancement, active effect/presentation effect advancement for the moving source, target binding application, stage clamp, frozen-actor paused-presentation ticking, explicit one-opponent lifecycle list forwarding, pause replacement interruption, and pause countdown ticking. `RuntimePauseWorld` still owns the current pause state/controller application/snapshot; `RuntimePausedMatchWorld` owns the per-tick paused-match ordering around that state. This is ownership cleanup for the current sandbox pause route, not exact super backgrounds, pause layering, helper VM pause behavior, teams/simul roster ownership, rollback timing, or MUGEN/IKEMEN pause parity.

`RuntimeHitPauseWorld` owns the bounded global hitpause mini-loop that used to live inline in `PlayableMatchRuntime`: hitpause command buffering, `ignorehitpause` active-state controller dispatch for both actors, paused presentation advancement with an explicit one-opponent lifecycle list, and per-actor hitpause countdown. `PlayableMatchRuntime` still supplies controller execution callbacks and presentation hooks, so this is current-order ownership cleanup, not exact persistent controller execution, helper-owned hitpause, broad side-effect ordering, teams/simul roster ownership, or MUGEN/IKEMEN hitpause tick parity.

`RuntimeMatchFighterAdvanceWorld` owns the bounded active 1v1 fighter-advance orchestration that used to live inline in `PlayableMatchRuntime`: P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start now route through one named boundary. `RuntimeFighterAdvanceHookSetWorld` owns per-fighter hook-set construction before `RuntimeFighterAdvanceWorld` executes, `RuntimeFighterAdvanceWorld` still owns per-fighter internals, and `PlayableMatchRuntime` still supplies concrete worlds, callbacks, pause state, and match-loop context, so this is ownership cleanup rather than exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, or full match VM parity.

`RuntimeMatchPauseControllerWorld` owns the bounded Pause/SuperPause controller result side effects that used to live inline in `PlayableMatchRuntime.applyMatchPauseController`: `RuntimePauseWorld.applyController` still creates and stores current pause state, while the match-level boundary applies SuperPause power deltas through an injected resource hook and emits the existing pause log line. `PlayableMatchRuntime` still supplies concrete resource/log hooks, active controller order, paused-match progression, and hitpause ignored routing, so this is ownership cleanup rather than exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, or full pause VM parity.

`RuntimeMoveLifecycleWorld` owns the bounded active-move lifecycle mutation that used to live inline in `PlayableMatchRuntime`: current move tick increment, non-reversal attack `moveType` and horizontal velocity lock, completed move cleanup, reversal cleanup, and non-reversal idle/control restoration through injected callbacks. `PlayableMatchRuntime` still owns concrete state/action entry and input dispatch, so this is current-behavior ownership cleanup, not new cancel semantics, exact input timing, or MUGEN/IKEMEN active-move lifecycle parity.

`RuntimeMoveStartWorld` owns the bounded state-move startup mutation that used to live inline in `PlayableMatchRuntime`: selected current move and label, move tick reset, hit/reversal cleanup, attack `moveType`, control handoff, and authored action state-entry handoff through injected callbacks. `PlayableMatchRuntime` still supplies the concrete control mutation, state-entry implementation, input route, and State -1 route timing, so this is ownership cleanup rather than exact command timing, cancel windows, helper/team/redirect move startup, or full move VM parity.

`RuntimeMatchCombatBridgeWorld` owns the bounded combat resolver construction that used to live inline in `PlayableMatchRuntime` immediately before `RuntimeMatchInteractionWorld.advanceRuntime`: priority clash, direct combat, projectile combat, and helper combat callbacks are created through one named bridge. `PlayableMatchRuntime` still supplies concrete combat worlds, state hooks, hurtbox lookup, projectile target-memory callback, and logging, so this is ownership cleanup rather than exact priority, helper-owned contact timing, projectile timing, teams/simul, multi-target breadth, or full combat VM parity.

`RuntimeInputControlWorld` owns the bounded local player and simple AI control intent that used to live inline in `PlayableMatchRuntime`: input blocking gates, State -1 setup/entry precedence, local punch/kick intent, crouch/jump/walk/idle mutation, airborne drift, `AssertSpecial NoWalk` suppression, simple AI chase, and AI attack cooldown. `PlayableMatchRuntime` still supplies state-entry, action-change, state-number, and move-start hooks, so this is current sandbox control ownership cleanup, not exact command timing, real MUGEN AI, AILevel, ctrl edge parity, or full MUGEN/IKEMEN input routing.

`RuntimeKinematicsWorld` owns the bounded actor position integration that used to live inline in `PlayableMatchRuntime`: horizontal/vertical position advance, current sandbox airborne gravity, ground snap, imported hit-state ground-snap preservation, and landing idle-action requests through injected callbacks. `PlayableMatchRuntime` still owns authored kinematic controller execution, Common1 recovery hooks, stage constraints, and concrete state/action entry, so this is current-behavior ownership cleanup, not exact `yaccel` constants, landing timing, air-recovery parity, helper physics ownership, or full MUGEN/IKEMEN physics parity.

`RuntimeAnimationWorld` owns the bounded actor animation advancement and action retargeting that used to live inline in `PlayableMatchRuntime`: `animTime`, `frameIndex`, `frameElapsed`, completion, final-frame hold, `loopStart`, shared duration/timing helpers used by `AnimTime`, `AnimElemTime`, and the current `HitDef` active-window calculation, plus active action lookup/reset and bounded `elem` / `elemtime` seeding for known AIR actions. `PlayableMatchRuntime` still owns active-state `ChangeAnim` / `ChangeAnim2` controller dispatch, state-owner selection, concrete state/action entry, and controller ordering, while `RuntimeAnimationControllerWorld` owns the basic executor-side controller mutation. This is current-behavior ownership cleanup, not exact AIR negative-duration semantics, missing-action fallback parity, full `elem` / `elemtime` parity, helper/team redirect namespaces, or full MUGEN/IKEMEN animation VM parity.

`RuntimeStateMetadataWorld` owns the bounded previous-state transition metadata writes that used to live inline in `PlayableMatchRuntime`: `prevStateNo`, `prevAnimNo`, `prevStateType`, and `prevMoveType`. Match-runtime state entry supplies the current StateDef-derived state and move type, and the basic `StateControllerExecutor` `ChangeState` / `SelfState` path uses the same helper when producing runtime-only executor output. This is current-behavior ownership cleanup for `PrevStateNo`, `PrevAnim`, `PrevStateType`, and `PrevMoveType`, not exact state-entry tick order, redirects/helper/team previous-state ownership, persistent controller semantics, or full MUGEN/IKEMEN previous-state parity.

`RuntimeStateClockWorld` owns the bounded state elapsed clock mutation that used to live inline in `PlayableMatchRuntime`: active-frame `stateElapsed` advance and changed-state elapsed reset. `PlayableMatchRuntime` still owns controller ordering and the exact point where the active frame begins, so this is current-behavior ownership cleanup for bounded `Time` trigger data, not exact CNS `Time` tick-order parity, persistent-controller timing parity, pause/hitpause timing changes, helper/team/redirect state clocks, or full MUGEN/IKEMEN timing parity.

`RuntimeAssertSpecialWorld` owns the bounded pre-facing `AssertSpecial` pass that used to live inline in `PlayableMatchRuntime`: imported active-state lookup, owner-backed state lookup, `AssertSpecial` controller filtering, trigger gating, and controller application before automatic facing. `PlayableMatchRuntime` still supplies trigger evaluation, constants, random, and controller execution context, so this is current-order ownership cleanup, not exact persistence layering, global/team/helper ownership, pause interaction, or full MUGEN/IKEMEN `AssertSpecial` parity.

`RuntimeSnapshotWorld` owns the bounded stage/camera, player-actor, and final effect snapshot projection that used to live inline in `PlayableMatchRuntime`: camera center selection honors `ScreenBound` `moveCameraX = 0`, falls back to all actors when every actor disables camera following, applies stage camera offsets, carries current EnvShake camera shake plus EnvColor stage-flash data into `StageSnapshot`, projects player actor identity/source/sprite-owner metadata, clones runtime state, attaches target refs/bindings, chooses active move or AIR-frame collision boxes, applies the current fallback hurtbox, clones sound, hit-effect, and env-shake event histories, then aggregates cloned Explod/Helper/Projectile snapshots in stable owner/kind order. Compatibility sessions, full stage controller timing, motif/screenpack camera logic, target semantics, effect VM semantics, renderer parity, and full MUGEN/IKEMEN snapshot parity remain outside this cut.

`RuntimeCompatibilityTelemetryWorld` owns the imported-compatibility telemetry/session projection that used to live inline in `PlayableMatchRuntime`: imported actor detection including owner-backed imported state owners, executed-state bookkeeping, routed State -1 entries, controller counts, typed-operation count keys, bounded controller-event history, active-command projection, command-history handoff, and `compatibilitySession` snapshot construction. This is ownership cleanup for existing debug/trace/session data, not new controller semantics, exact CNS VM timing, or MUGEN/IKEMEN parity.

`RuntimeEffectSpawnWorld` owns the bounded spawn/mutation bridge into the effect actor world: Explod action/position/bind/default duration resolution, Helper state/action resolution including state-owner sprite/action lookup, owner runtime-program/animation handoff for the helper-local micro-VM, visual-helper removal handoff, Projectile action/offset/terminal-action resolution, RemoveExplod dispatch, and ModifyProjectile dispatch. `RuntimeEffectSpawnControllerDispatchWorld` owns the active-state CNS dispatch layer above it: controller telemetry, typed `explod` / `removeexplod` / `modifyexplod` / `helper` / `projectile` / `modifyprojectile` operation selection, spawn/count mutation handoff, and success-gated operation telemetry. `PlayableMatchRuntime` still owns trigger filtering, active-state order, actor/opponent context, effect actor world ownership, and exact spawn/combat ordering, so this is ownership cleanup rather than exact effect spawn timing, full helper VM parity, helper-owned projectile combat/contact/target memory, parent/root redirect, or FightFX/Common animation parity.

`RuntimeReversalControllerDispatchWorld` owns the bounded active-state ReversalDef controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `reversaldef` operation selection, raw fallback activation payload, operation telemetry, and activation handoff into `RuntimeReversalWorld`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, current-frame hitbox lookup, and later counter-result state routing through `RuntimeReversalWorld`, so this is ownership cleanup for current ReversalDef activation, not exact priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, or full ReversalDef parity.

`RuntimeEffectLifecycleWorld` now owns the bounded lifecycle orchestration that happens after those effect actors exist: active-effect ticks, presentation ticks, paused presentation ticks, effect snapshot grouping, shared get-hit cleanup, and helper-context handoff for `stageBounds`, `stageTime`, and `runtimeTick`. `RuntimeMatchOpponentContextWorld` owns the concrete 1v1 match/pause/hitpause source for direct opponent plus explicit singleton lifecycle list, and `RuntimeEffectHelperContextWorld` owns complete-owner validation, parent/root/opponent projection, explicit lifecycle opponent-list conversion into helper-local `opponentRoster` data, explicit roster override handling, target candidate forwarding, and helper hook forwarding for those lifecycle passes. `PlayableMatchRuntime`, `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` pass current tick context through that boundary so helper-local `GameTime` / edge-distance reads and helper-local sound telemetry do not fall back to helper age when lifecycle context exists. Direct combat, HitOverride, and Reversal share the same effect get-hit cleanup helper. This is current-behavior ownership, not exact helper VM lifecycle, real teams/simul roster ownership, automatic multi-opponent match roster discovery, pause/combat ordering, advanced remove-trigger timing, parent/root/redirect parity, exact helper-local clock parity, or full MUGEN/IKEMEN effect lifecycle parity.

`RuntimeEffectActorAdvanceWorld` owns the bounded low-level effect-actor advance order inside `RuntimeEffectActorWorld`: active-effect passes tick Helpers before Projectiles, paused presentation ticks Helpers before Explods, and normal presentation ticks Explods without helper execution. The match and lifecycle worlds still own when active or paused presentation passes happen; this boundary isolates the store-local order so future helper/projectile/explod lifecycle work has one tested seam. This is current-behavior ownership, not exact helper pause/combat ordering, projectile lifetime parity, remove-trigger timing, teams/simul roster ownership, visual/audio parity, or full Helper/Projectile VM parity.

`RuntimeMatchInteractionWorld` owns the bounded post-fighter interaction order after both actors have run controller logic: target-memory aging, active-effect advance through `RuntimeMatchOpponentContextWorld`, projectile clash, body separation, target bindings, direct priority/direct combat, projectile combat, stage clamp, and presentation-effect advance. `PlayableMatchRuntime` still supplies concrete fighting callbacks and MUGEN-specific data, so this is an ownership seam for ordering and testability, not a new shared-core API or a claim of exact MUGEN/IKEMEN tick-order or teams/simul roster parity.

`synthetic-imported-hitadd.json` adds the current contact-memory controller contract: static `HitAdd value` compiles into `contact:hitadd`, `PlayableMatchRuntime` applies it only to bounded current-state direct `HitCount` telemetry, and `UniqHitCount` remains target uniqueness. This keeps combo/count approximation explicit instead of folding it into hidden combat math.

`RuntimeContactMemoryWorld` now owns the bounded contact-memory data structure and mutations behind those direct/projectile trigger cuts: direct `MoveContact`/`MoveHit`/`MoveGuarded`, direct `HitCount`/`UniqHitCount`, `HitAdd`, `MoveReversed`, defender-local `ReceivedDamage`/`ReceivedHits`, and projectile contact/time markers. `PlayableMatchRuntime` injects that world into fighter state and uses it as the actor/state-number glue; `RuntimeDirectCombatWorld` and `RuntimeReversalWorld` use the same boundary for direct hit/guard, received-damage, and reversal marker mutations. This is ownership cleanup, not exact contact/combo lifetime parity. `RuntimeResourceWorld` is the named resource boundary inside `RuntimeResourceSystem`; it owns bounded resource and variable writes used by `StateControllerExecutor`: `CtrlSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`, `VarSet`, `VarAdd`, partial `VarRandom`, and `VarRangeSet`, including sysvar assignment support for set/add. It also owns authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control-flag writes consumed by the playable match loop, direct combat, projectile combat, target controllers, and reversals, while existing helper functions delegate to that world for backward-compatible call sites. `StateControllerExecutor` still resolves params and expressions, while `RuntimeRandomSystem` owns deterministic sandbox-side random units and dynamic fallback salt for `VarRandom`, so this does not claim exact resource/variable scope, exact MUGEN random stream, helper/team/parent/root redirects, exact target/projectile resource parity, or full CNS VM parity. `TargetSystem` also owns bounded `BindToTarget` `postype` anchor resolution for `Foot` / `Mid` / `Head`, reading `size.mid.pos*` and `size.head.pos*` through an injected constant resolver so match runtime no longer carries those MUGEN anchor rules inline; the same system now prunes stale `TargetBind` binding records when target-memory expiry removes the bound target. `HitSparkAssetSystem` now owns bounded HitDef spark asset-frame resolution from `S` player AIR refs, unprefixed common refs, and `F` FightFX refs before `RuntimeHitEffectWorld` records the event; this is presentation ownership cleanup, not exact FightFX/common visual parity.

`RuntimeStunWorld` owns the bounded hitstun/guardstun update used by the playable match loop: input-lock checks, guardstun decay, guarding flag maintenance, hit/guard horizontal friction, hitstun decay, hitstun presentation-action requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration. `PlayableMatchRuntime` still supplies the concrete action-change callback and imported-state predicate, so this is a system boundary for current behavior, not exact MUGEN/IKEMEN hitpause, guard recovery, helper/custom-state stun ownership, or Common1 tick-order parity.

`RuntimeRecoverySystem` owns the bounded recovery timers and state-transition hooks that used to live inline in `PlayableMatchRuntime`: `fall.recovertime` countdown, Common1 liedown `data.liedown.time` defaulting/decrement, and imported `5201 -> 52` ground-recovery landing. `PlayableMatchRuntime` still validates and enters states through callbacks, so this is ownership cleanup for current behavior, not exact Common1 threshold/tick-order parity.

`RuntimeGetHitStateWorld` owns the bounded default get-hit state selection that used to live inline in `PlayableMatchRuntime`: stand routes prefer `5000`, crouch routes prefer `5010 -> 5000`, and air routes prefer `5020 -> 5000` when those states exist. Direct combat and projectile combat still ask `PlayableMatchRuntime` to validate and enter states, and custom `p2stateno` routing remains separate. This is ownership cleanup for current imported default get-hit behavior, not exact Common1 animation selection, helper/team/redirect ownership, projectile-specific parity, or full get-hit VM parity.

`RuntimeHitStateTransitionWorld` owns the bounded direct-hit and ReversalDef state-transition ownership that also used to live inline in `PlayableMatchRuntime`: `p2stateno` can enter an attacker-owned custom state by default, `p2getp1state = 0` clears the custom owner and enters target-owned data, and `p1stateno` routes the attacker when the requested state exists. State validation and concrete state entry still remain injected hooks, so this is ownership cleanup for current two-actor state routing, not exact throws, helper/root/parent redirects, team ownership, custom-state VM tick order, or full MUGEN/IKEMEN custom-state parity.

`RuntimeStateAvailabilityWorld` owns the bounded state/action availability lookup that used to live inline in `PlayableMatchRuntime`: compiled runtime-program states win over parsed definition states, parsed states can be entered when present, and animation-only actions remain accepted as the current fallback. This boundary is used by current get-hit, guard, custom-state, target, recovery, HitOverride, and ReversalDef routes. It is not state-entry mutation, exact redirect/helper/root/parent/team lookup parity, IKEMEN state lookup extensions, or full CNS VM state ownership.

`RuntimeStateEntryWorld` owns the bounded state-entry mutation that used to live inline in `PlayableMatchRuntime`: state/action availability lookup, `stateNo` transition metadata, changed-state elapsed reset, owner-backed custom-state assignment/clearing, stale current-move cancellation, `firedHitDefs` reset, contact-memory reset callback, StateDef `type` / `movetype` / `physics` / `ctrl` / `velset` application, and `ChangeAnim` handoff for self or state-owner animations. `PlayableMatchRuntime` still supplies compatibility telemetry, contact reset, and concrete action-change callbacks, so this is ownership cleanup for current entry behavior, not exact CNS `ChangeState` / `SelfState` tick order, persistent controller timing, helper/team/root redirects, or full MUGEN/IKEMEN state-entry parity.

`RuntimeStateEntrySetupWorld` owns the bounded imported State -1 setup-controller selection that used to live inline in `PlayableMatchRuntime`: imported-only guard, state-entry scanning, `ChangeState` bypass before command routing, trigger gating, setup-controller classification, and execution handoff. `PlayableMatchRuntime` still supplies trigger evaluation, random/stage-time context, and concrete controller dispatch through `RuntimeControllerDispatchWorld`, so this is ownership cleanup for current State -1 setup behavior, not exact State -1 ordering, persistent controller timing, redirect/helper/team scopes, or full CNS VM parity.

`RuntimeStateEntryRouteWorld` owns the bounded State -1 `ChangeState` routing scan that used to live inline in `PlayableMatchRuntime`: state-entry iteration, non-`ChangeState` filtering, trigger gating, dynamic state-id resolution handoff, route telemetry, authored state-move selection, and raw state-entry fallback. `PlayableMatchRuntime` still supplies trigger evaluation, expression resolution, concrete `startMove` / `enterState` mutation, and exact tick order, so this is ownership cleanup for current command-to-state routing rather than exact State -1 VM parity, helper/team/redirect command ownership, persistent controller semantics, or full MUGEN/IKEMEN state-entry behavior.

`RuntimeActiveControllerScanWorld` owns the bounded active-state controller scan that used to sit at the top of `PlayableMatchRuntime.runActiveStateControllers`: state-owner selection, imported/owner-backed guard, current state-program lookup, `ignorehitpause` filtering, trigger gating, controller iteration, and stop/continue flow after a state-changing controller. `PlayableMatchRuntime` still supplies trigger evaluation, controller classification, concrete controller side effects, and mutation ordering, so this is ownership cleanup for the active controller loop rather than exact CNS VM tick order, persistent controller semantics, helper/team/redirect controller scopes, or full MUGEN/IKEMEN controller-loop parity.

`RuntimeActiveControllerHookSetWorld` owns the bounded hook-set construction consumed by active-controller run dispatch. The match runtime still supplies concrete state mutation, target/combat/presentation/audio worlds, stage bounds, tick, telemetry, and callback closures, but state hooks, side-effect hooks, and fallback runtime-controller hooks are now grouped through one typed boundary before `RuntimeActiveControllerRunWorld` executes. This is ownership cleanup only; it does not add controller semantics, exact hook ordering parity, helper/team/redirect scopes, unsupported-controller breadth, visual/audio parity, or full CNS VM parity.

`RuntimeAutoGuardStartWorld` owns the bounded imported auto guard-start orchestration that used to sit inline in `PlayableMatchRuntime`: imported-defender filtering, current input/current move/hitpause/hitstun eligibility handoff to `RuntimeGuardWorld`, `InGuardDist` callback gating, guard-start state selection/availability, clear-state-owner entry, and guard-start runtime mutation. `RuntimeGuardWorld` still owns guard rule primitives, while `PlayableMatchRuntime` supplies `InGuardDist`, concrete state availability/entry, and broader combat/guard timing. This is ownership cleanup, not exact proximity-guard timing, guard-end/effects/audio, helper/team/redirect guard ownership, visual parity, or full guard VM parity.

`RuntimeSpriteEffectControllerWorld` owns the bounded active-state sprite-effect controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `sprite-effect:*` operation extraction, operation telemetry, dynamic `SprPriority` / `PalFX` / `RemapPal` / `Trans alpha` / `AfterImage` / `AfterImageTime` / `Angle value/scale` resolver handoff, and mutation handoff into `RuntimeSpriteEffectWorld` for `SprPriority`, `PalFX`, `RemapPal`, `AfterImage`, `AfterImageTime`, `Trans`, and `AngleSet` / `AngleAdd` / `AngleMul` / `AngleDraw`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, hitpause selection, expression-context construction, and render projection, so this is ownership cleanup for current sprite-effect side effects, not exact visual timing, helper/redirect ownership, renderer parity, exact Trans alpha math, exact Angle pivot/scale/draw-order parity, or full CNS VM parity.

`RuntimeTargetControllerDispatchWorld` owns the bounded active-state Target / BindToTarget controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `target:*` / `bindtotarget` operation selection, operation telemetry, damage-scaling callback handoff, TargetState state-entry callback handoff, and target-constant callback handoff into `RuntimeTargetWorld`. `RuntimeTargetWorld.resolveCandidates` now owns the live target-memory filter before Target* / BindToTarget controller application and active target-binding position application; `RuntimeTargetStateEntryWorld` owns the bounded `TargetState` owner-resolution / availability / owner-backed entry adapter; `PlayableMatchRuntime` still owns trigger filtering, active-state order, concrete state-entry mutation, the currently materialized opponent actor list, and combat context. This is ownership cleanup for current two-actor target side effects, not helper/projectile target ownership, exact multi-target/team selection, or full CNS VM parity.

`RuntimeContactControllerDispatchWorld` owns the bounded active-state contact-memory controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `contact:*` operation selection, operation telemetry, `HitAdd` mutation, and `MoveHitReset` direct contact reset through `RuntimeContactMemoryWorld`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, and direct/projectile contact creation, so this is ownership cleanup for current contact counters, not exact combo lifetime, helper/projectile contact ownership, guard-count parity, or full CNS VM parity.

`RuntimeAudioControllerDispatchWorld` owns the bounded active-state audio controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `audio:*` operation selection for static params, dynamic numeric raw fallback for expression-backed params, operation telemetry, and `PlaySnd` / `SndPan` / `StopSnd` event handoff into `RuntimeAudioWorld`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, hit/contact timing, and actor context, so this is ownership cleanup for current sound-event telemetry, not exact SND playback, channel priority, mixing, FightFX/common fallback, exact panning, or full audio parity.

`RuntimeEnvColorControllerDispatchWorld` owns the bounded active-state EnvColor controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `envcolor` operation selection, dynamic raw-param resolver handoff, operation telemetry, and event handoff into `RuntimeEnvColorWorld`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, stage-world ownership, and pause/hitpause callback routing, so this is ownership cleanup for current stage-flash telemetry, not exact blend math, layer/window ordering, pause timing, renderer parity, dynamic typed lowering, or full presentation parity.

`RuntimeEnvShakeControllerDispatchWorld` owns the bounded active-state EnvShake controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `envshake` operation selection, operation telemetry, and event handoff into `RuntimeEnvShakeWorld`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, actor/world ownership, and FallEnvShake routing, so this is ownership cleanup for current camera-shake telemetry, not exact waveform, pause/stage/layer interaction, helper/redirect ownership, or full presentation parity.

`RuntimeFallEnvShakeControllerDispatchWorld` owns the bounded active-state FallEnvShake controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `fallenvshake` operation selection, fall-shake event handoff into `RuntimeEnvShakeWorld`, consumed `hitFall.envShake` cleanup, and operation telemetry after a real event. `PlayableMatchRuntime` still owns trigger filtering, active-state order, actor/world ownership, and upstream HitDef fall metadata, so this is ownership cleanup for current fall-shake telemetry/mutation, not exact waveform, pause/stage/layer interaction, helper/redirect ownership, or full presentation parity.

`RuntimePauseControllerDispatchWorld` owns the bounded active-state Pause/SuperPause controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `pause` operation selection, apply-controller callback handoff, and operation telemetry after a real pause result. `RuntimeMatchPauseControllerWorld` owns the current pause result side effects after dispatch, while `PlayableMatchRuntime` still owns trigger filtering, active-state order, paused-match progression, and hitpause ignored routing, so this is ownership cleanup for current pause telemetry/application, not exact pause layering, super background/sound/spark timing, helper/redirect ownership, or full pause VM parity.

`RuntimeActorConstraintControllerDispatchWorld` owns the bounded active-state Width controller dispatch that used to live inline in `PlayableMatchRuntime`: controller telemetry, typed `collision:width` operation selection, dynamic raw-param resolver handoff for `player`/`value`, operation telemetry for typed operations, and body-width mutation handoff into `RuntimeActorConstraintWorld`. `PlayableMatchRuntime` still owns trigger filtering, active-state order, per-frame constraint reset, stage clamp, and body-push ordering, so this is ownership cleanup for current Width telemetry/mutation, not exact player/edge collision, team/helper push behavior, screen-edge/camera parity, Width edge semantics, dynamic typed lowering, or full constraint VM parity. Passive `PlayerPush`/`PosFreeze`/`ScreenBound` setup now routes through `RuntimeBoundsControllerWorld`.

`RuntimeResourceWorld` owns the bounded resource/control/variable mutation helpers that used to be free functions only: authored life/power max resolution, life and power clamping, `CtrlSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`, and variable/range assignment. The existing exported helper functions still delegate to this world, so current match, direct-combat, projectile-combat, target, reversal, and controller-executor call sites preserve behavior while the resource boundary becomes testable and replaceable. This is ownership cleanup only; exact CNS resource timing, helper/team/redirect scopes, round/KO flow, and full MUGEN/IKEMEN resource parity remain blocked.

`RuntimeControllerDispatchWorld` owns the bounded runtime-controller execution bridge that active imported states, State -1 setup controllers, and pre-facing `AssertSpecial` now share before falling through to `StateControllerExecutor`. It centralizes runtime-state replacement, evaluation context handoff (`Const`, `HitPauseTime`, random, stage time), optional controller/operation telemetry hooks, and unsupported-controller reporting. `PlayableMatchRuntime` still owns trigger filtering, `ChangeState` / `ChangeAnim`, side-effect controller dispatch, and exact ordering, so this is a dispatch ownership seam rather than new CNS VM parity.

`RuntimeRoundSystem` owns the current bounded round timer, KO/time-over finish decision, winner selection, reset, and `RoundSnapshot` message/timer projection used by `PlayableMatchRuntime`. `RuntimeTraceGate.requiredRoundFrames` now lets required artifacts gate that snapshot evidence by round state, winner, message, frame count, and observed timer range; `synthetic-imported-round-ko.json` proves the bounded KO snapshot route after a lethal imported `HitDef`, and `synthetic-imported-round-timeover.json` proves a bounded time-over/draw route through a short `roundTimerFrames` fixture. The match loop still decides when combat/resources change life and when playback stops, so this is ownership cleanup plus evidence coverage for current sandbox round state, not MUGEN/IKEMEN round, lifebar, team, simul/tag, intro, winpose, or screenpack parity.

`MatchWorldLifecycleSystem` owns the actor/effect lifecycle tracker used by `MatchWorld`: spawn/active/remove classification, first/last seen ticks, actor age, live/removed lists, and bounded recent-event history. `MatchWorld` still builds the registry from snapshots and stores, so this is lifecycle evidence ownership, not full actor simulation ownership.

`synthetic-imported-superpause-effect-freeze.json` extends that pause evidence to visual Helper/Explod actors with bounded source-movetime advance plus later freeze checks; it is still evidence for visual effect actors, not Helper VM execution, Explod binding/removal parity, or exact MUGEN/IKEMEN pause layering.

`synthetic-imported-projectile-motion.json` and `synthetic-imported-projectile-velmul.json` add the current Projectile visual-motion contract: compiled/raw `accel` and `velmul` are stored on projectile actors and applied during presentation advance, and compiled/raw `projscale` reaches effect payload plus `renderScale` snapshots for Three.js projection. This keeps bounded projectile motion/scale in `ProjectileSystem` / `RuntimeEffectActorWorld`; exact `velmul` tick-order parity, scaled collision parity, and contact/removal tick parity remain outside this cut.

`synthetic-imported-explod-ignorehitpause.json`, `synthetic-imported-explod-pausemovetime.json`, and `synthetic-imported-explod-supermovetime.json` add the first Explod-owned pause-budget contracts: compiled/raw `ignorehitpause`, `pausemovetime`, and `supermovetime` are stored on visual Explod actors, hitpause/pause presentation passes can advance those actors through the matching budget/flag, and sibling Explods without those params remain frozen. This keeps pause-budget logic in `ExplodSystem` / `RuntimeEffectActorWorld` instead of teaching Three.js or generic presentation code about CNS params.

`synthetic-imported-explod-removeongethit.json` adds the current Explod hit-pruning contract: compiled/raw `removeongethit` is stored on the visual Explod actor, `RuntimeEffectActorWorld` owns the owner-side prune mutation, and the shared get-hit marker calls that contract. This keeps hit-triggered effect cleanup behind the effect actor world instead of scattering per-controller removal logic through the match loop.

`synthetic-imported-explod-removeonprojectilehit.json` extends that same contract into projectile combat: `ProjectileCombatSystem` exposes a get-hit callback rather than mutating only `moveType`, and `PlayableMatchRuntime` routes that callback through the same effect-world pruning path used by direct hits. This keeps projectile hit semantics aligned with direct hit cleanup without moving Explod ownership into the projectile subsystem.

`synthetic-imported-explod-removeonprojectileguard.json` verifies the same path for projectile guard resolution. The projectile system still owns contact/removal; the match runtime owns the semantic transition into the defender's get-hit/guard state and therefore the effect cleanup hook.

### Runtime World

The runtime should eventually be split into smaller world systems:

```txt
MatchWorld
  PlayerRuntime[]
  HelperRuntime[]
  ProjectileRuntime[]
  ExplodRuntime[]
  StageRuntime
  CameraRuntime
  AudioEventQueue
  EnvShakeSystem
  RuntimeHitEffectWorld
  RuntimeEnvColorWorld
  RuntimeSpriteEffectWorld
  RuntimeSpriteEffectControllerWorld
  RuntimeContactControllerDispatchWorld
  RuntimeAudioControllerDispatchWorld
  RuntimeEnvColorControllerDispatchWorld
  RuntimeEnvShakeControllerDispatchWorld
  RuntimeFallEnvShakeControllerDispatchWorld
  RuntimeHitFallControllerWorld
  RuntimeStateTypeWorld
  RuntimeDamageScaleWorld
  RuntimeHitDefenseWorld
  RuntimeHitDefControllerDispatchWorld
  RuntimeReversalControllerDispatchWorld
  RuntimePauseControllerDispatchWorld
  RuntimeActorConstraintControllerDispatchWorld
  RuntimeEffectSpawnControllerDispatchWorld
  RuntimeActorConstraintWorld
  RuntimeDirectCombatWorld
  RuntimeHitOverrideWorld
  RuntimeReversalWorld
  SpriteEffectSystem
  EffectActorSystem
  ExplodSystem
  HelperSystem
  ProjectileSystem
  ProjectileCombatSystem
  EffectSpawnSystem
  EffectLifecycleSystem
  TargetSystem
  RuntimeTargetControllerDispatchWorld
  CombatResolver
  RuntimeGuardWorld
  PauseSystem
  RuntimeRecoverySystem
  RuntimeGetHitStateWorld
  RuntimeHitStateTransitionWorld
  RuntimeStateAvailabilityWorld
  RuntimeHitEligibilityWorld
  RuntimeAssertSpecialWorld
  RuntimeOrientationWorld
  RuntimeStunWorld
  RuntimeInputControlWorld
  RuntimeMoveStartWorld
  RuntimeMatchFighterAdvanceWorld
  RuntimeMatchPauseControllerWorld
  RuntimeMatchCombatBridgeWorld
  RuntimeMoveLifecycleWorld
  RuntimeStateClockWorld
  RuntimeStateMetadataWorld
  RuntimeStateEntryWorld
  RuntimeStateEntrySetupWorld
  RuntimeResourceWorld
  RuntimeControllerDispatchWorld
  RuntimeExpressionContextWorld
  RuntimePausedMatchWorld
  RuntimeHitPauseWorld
  RuntimeContactPresentationWorld
  RuntimeHelperCombatWorld
  RuntimeSnapshotWorld
  RuntimeCompatibilityTelemetryWorld
  RuntimeRoundSystem
  CommandSystem
```

`MatchWorld` now exists as the public match boundary and delegates to `PlayableMatchRuntime` for behavior preservation. Current `PlayableMatchRuntime` is still allowed to be the integration point behind that facade, but new broad behavior should move toward typed subsystems behind `MatchWorld`.

The actor-registry cut is still derived from `MugenSnapshot`, but `MatchWorld` now keeps a lightweight lifecycle tracker for spawned, active, and removed actor/effect ids plus per-tick lifecycle events while preserving the existing behavior checksum. `MatchWorld.getActorRegistry()` indexes player and effect actors by id, kind, owner, root, parent, lifecycle, `eventsThisTick`, bounded `recentEvents`, target-memory `targetLinks` including active `TargetBind` and owner-side `BindToTarget` bindings, and read-only `RuntimeEffectActorWorld` `effectStores`. `RuntimeTraceArtifact` frame summaries can carry `world.lifecycle`, `world.targetLinks`, and `world.effectStores` evidence, and `RuntimeTraceGate` can require specific world lifecycle events such as projectile spawn/remove by kind, owner, root, parent, layer, or id plus effect-store evidence such as owner family counts and serial progression. This gives Runtime Debug Studio and trace evidence a stable world-facing read model over the current `TargetSystem` and `EffectActorSystem` stores before helpers, projectiles, explods, targets, and combat side effects are fully migrated behind the facade.

Every `ActorSnapshot` now carries `actorKind`, `ownerId`, `rootId`, and `parentId` for players and current effect actors. `spriteOwnerId` remains separate so custom-state and `ChangeAnim2` rendering can borrow another character's AIR/SFF without losing the logical runtime owner.

The current extraction order is:

1. `StateProgramExecutor`: classify compiled CNS controllers.
2. `PauseSystem`: own current match-freeze state through `RuntimePauseWorld` and bounded paused-match ordering through `RuntimePausedMatchWorld` outside the match runtime.
3. `RuntimeAudioWorld` / `AudioEventSystem`: own player sound controller event insertion outside the match runtime; `HelperSystem` emits the same event shape for bounded helper-local sound side effects, while `MugenAudioSystem` stays the browser adapter over player and effect snapshots.
4. `RuntimeHitEffectWorld` / `HitEffectSystem`: own bounded direct `HitDef` spark telemetry outside the match runtime; `HitSparkRenderer` owns player AIR first-frame sprite lookup, the current 180-frame fallback visual projection, and spark source metadata while exact common/FightFX/render binding stays future work.
5. `EnvShakeSystem`: own camera-shake events and snapshot math outside the match runtime, while Three.js stays the renderer.
6. `RuntimeEnvColorWorld` / `EnvColorSystem`: own stage-flash event history and snapshot math outside the match runtime, while Three.js applies the bounded overlay.
7. `RuntimeSpriteEffectWorld` / `RuntimeSpriteEffectControllerWorld` / `SpriteEffectSystem`: own match-runtime `SprPriority`, `PalFX`, `RemapPal`, `Trans`, `AngleSet`/`AngleAdd`/`AngleMul`/`AngleDraw`, `AfterImage`, and `AfterImageTime` dispatch/mutation/ticking, while Three.js applies snapshot material, palette-remap, trail, opacity, rotation, and bounded render-scale changes.
8. `RuntimeActorConstraintWorld` / `ActorConstraintSystem`: own bounded actor body width, one-frame PlayerPush/PosFreeze/ScreenBound constraints, stage clamping, and player body-push separation outside the match runtime.
9. `RuntimeDirectCombatWorld` / `DirectCombatSystem`: own bounded same-tick direct `HitDef` priority win/trade mutation and direct hit/guard result mutation outside the match runtime while collision, target routing, and Common1/custom-state transitions stay explicit integration points.
10. `RuntimeHitOverrideWorld` / `HitOverrideSystem`: own bounded HitOverride slot countdown and redirect mutation outside the match runtime while state-entry validation remains an integration hook.
11. `RuntimeReversalWorld` / `ReversalSystem`: own bounded ReversalDef activation, active counter detection, and direct counter-result mutation outside the match runtime while state-entry and target-state routing remain integration hooks.
12. `ExplodSystem`: own non-colliding effect actor lifecycle and snapshots.
13. `HelperSystem`: own the current visual helper actor lifecycle, explicit owner-side removal, bounded helper-local state/action/kinematic/control/metadata/resource/variable/sound/DestroySelf micro-VM, and snapshots.
14. `ProjectileSystem`: own the current colliding projectile lifecycle, hitbox projection, bounded hit-count/cooldown state, and snapshots.
15. `RuntimeProjectileCombatWorld` / `ProjectileCombatSystem`: own the bounded projectile contact/reject/override/damage/removal loop, multi-hit cooldown, and projectile clash/cancel subset through the effect-actor world contract.
16. `RuntimeSnapshotWorld` / `RuntimeSnapshotSystem`: own bounded stage/camera, player actor, and final effect snapshot projection while compatibility sessions, target semantics, effect VM semantics, renderer parity, motif/screenpack camera logic, and full MUGEN/IKEMEN snapshot parity remain outside the cut.
17. `RuntimeEffectSpawnWorld` / `EffectSpawnSystem`: own bounded Explod/Helper/Projectile spawn resolution, Helper runtime-program/animation handoff, plus RemoveExplod/ModifyProjectile/visual-helper removal dispatch before those operations reach the effect actor world.
18. `RuntimeEffectLifecycleWorld` / `EffectLifecycleSystem`: own bounded active-effect tick, presentation tick, paused presentation tick, effect snapshot grouping, and shared get-hit cleanup orchestration over the effect actor world.
19. `RuntimeMatchInteractionWorld` / `MatchInteractionSystem`: own bounded post-fighter target/effect/combat/clamp/presentation ordering while concrete MUGEN/fighting callbacks remain supplied by `PlayableMatchRuntime`.
20. `RuntimeCompatibilityTelemetryWorld` / `RuntimeCompatibilityTelemetrySystem`: own imported controller/state/operation telemetry and `compatibilitySession` projection while concrete controller execution remains supplied by `PlayableMatchRuntime`.
21. `EffectActorSystem` / `RuntimeEffectActorWorld` / `RuntimeEffectActorAdvanceWorld`: own the mutable per-fighter effect actor stores and keep serials, bounded lists, low-level active/presentation advance ordering, explicit visual-helper removal by id/serial, removal mutation, combat handoff, reset, summaries, and snapshot handoff out of the main match loop.
22. `TargetSystem`: own target memory, target candidate filtering, target id matching, target binding, and drop/expiry helpers.
23. `CombatResolver`: own current partial contact, eligibility, override, guard, and damage-result helpers outside the match loop.
24. `RuntimeGuardWorld`: own bounded guard-hit state selection, auto guard-start eligibility, and auto guard-start mutation outside inline match/combat mutation.
25. `RuntimeRecoverySystem`: own bounded fall recovery countdown, Common1 liedown recovery, and imported ground-recovery landing hooks outside the main match loop.
26. `RuntimeGetHitStateWorld`: own bounded default stand/crouch/air get-hit state selection outside inline direct/projectile combat callbacks.
27. `RuntimeHitStateTransitionWorld`: own bounded `p1stateno` / `p2stateno` / `p2getp1state` transition routing outside inline direct-combat and ReversalDef callbacks.
28. `RuntimeStateAvailabilityWorld`: own bounded state/action availability and state-source lookup outside inline state validation.
29. `RuntimeHitEligibilityWorld`: own bounded hit-eligibility slot ticking plus per-frame `AssertSpecial` / render-opacity resets outside the main match loop.
30. `RuntimeAssertSpecialWorld`: own bounded imported pre-facing `AssertSpecial` lookup/filter/trigger/application ordering outside inline `PlayableMatchRuntime` branching.
31. `RuntimeOrientationWorld`: own bounded automatic facing and `Turn` facing flips outside inline match/controller mutation.
32. `RuntimeStunWorld`: own bounded hitstun/guardstun timer advance, hitstun presentation requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration outside inline match-loop branching.
33. `RuntimeMoveLifecycleWorld`: own bounded active-move lifecycle mutation for current move ticking, non-reversal attack lock, completed move cleanup, reversal cleanup, and idle/control restoration callbacks outside inline match-loop branching.
34. `RuntimeInputControlWorld`: own bounded local player/simple AI control intent for input blocking, state-entry precedence, crouch/jump/walk/idle, air drift, NoWalk, AI chase/cooldown, and punch/kick intent outside inline match-loop branching.
35. `RuntimeKinematicsWorld`: own bounded actor position integration, sandbox gravity, ground snap, imported hit-state ground-snap preservation, and landing idle-action callback outside inline match-loop branching.
36. `RuntimeAnimationWorld`: own bounded actor animation advancement, `loopStart` / final-frame completion, and shared animation timing helpers outside inline match-loop branching.
37. `RuntimeStateClockWorld`: own bounded `Time` / state elapsed clock advance and changed-state reset outside inline match-loop mutation.
38. `RuntimeStateMetadataWorld`: own bounded previous-state transition metadata writes for `PrevStateNo`, `PrevAnim`, `PrevStateType`, and `PrevMoveType` outside inline state-entry mutation.
39. `RuntimeStateEntryWorld`: own bounded state-entry availability, metadata/clock reset, custom-state owner assignment, StateDef metadata/control/velocity application, stale move/contact reset, and action handoff outside inline state-entry mutation.
40. `RuntimeStateEntrySetupWorld`: own imported State -1 setup-controller selection, trigger gating, setup-controller classification, and execution handoff outside inline State -1 input-routing branches.
41. `RuntimeSpriteEffectControllerWorld`: own bounded active-state sprite-effect controller dispatch, telemetry hooks, typed `sprite-effect:*` operation selection, and handoff into `RuntimeSpriteEffectWorld` outside inline match-runtime branches.
42. `RuntimeTargetControllerDispatchWorld`: own bounded active-state Target / BindToTarget controller dispatch, telemetry hooks, typed operation selection, and handoff into `RuntimeTargetWorld` outside inline match-runtime branches.
43. `RuntimeContactControllerDispatchWorld`: own bounded active-state contact-memory controller dispatch, telemetry hooks, typed `contact:*` operation selection, `HitAdd`, and `MoveHitReset` handoff into `RuntimeContactMemoryWorld` outside inline match-runtime branches.
44. `RuntimeAudioControllerDispatchWorld`: own bounded active-state audio controller dispatch, telemetry hooks, typed `audio:*` operation selection, and handoff into `RuntimeAudioWorld` outside inline match-runtime branches.
45. `RuntimeEnvColorControllerDispatchWorld`: own bounded active-state EnvColor controller dispatch, telemetry hooks, typed `envcolor` operation selection, and handoff into `RuntimeEnvColorWorld` outside inline match-runtime branches.
46. `RuntimeEnvShakeControllerDispatchWorld`: own bounded active-state EnvShake controller dispatch, telemetry hooks, typed `envshake` operation selection, and handoff into `RuntimeEnvShakeWorld` outside inline match-runtime branches.
47. `RuntimeExpressionContextWorld`: own bounded active runtime expression/trigger context creation for imported state triggers and dynamic controller-param fallback outside duplicated `PlayableMatchRuntime` callback closures.
47. `RuntimeFighterAdvanceHookSetWorld`: own bounded per-fighter advance hook-set construction outside inline `advanceFighter` hook wiring.
47. `RuntimeActiveControllerHookSetWorld`: own bounded active-controller state hook, side-effect hook, and runtime-controller hook-set construction outside the inline `runActiveStateControllers` block.
48. `RuntimeStateTransitionControllerWorld`: own bounded passive `ChangeState` / `SelfState` setup from raw controller params outside inline executor branches.
49. `RuntimeAnimationControllerWorld`: own bounded passive `ChangeAnim` / `ChangeAnim2` setup from raw controller params outside inline executor branches.
50. `RuntimeBoundsControllerWorld`: own bounded passive `PlayerPush`, `PosFreeze`, and `ScreenBound` setup from typed operations or raw controller params outside inline executor branches.
51. `RuntimeHitFallControllerWorld`: own bounded passive `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutations from typed operations or raw controller params outside inline executor branches.
52. `RuntimeStateTypeWorld`: own bounded passive `StateTypeSet` metadata setup from typed operations or raw controller params outside private executor helpers.
53. `RuntimeDamageScaleWorld`: own bounded passive `AttackMulSet` and `DefenceMulSet` multiplier setup from typed operations or raw controller params outside inline executor branches.
54. `RuntimeHitDefenseWorld`: own bounded passive `HitBy`, `NotHitBy`, and `HitOverride` slot setup/removal from typed operations or raw controller params outside private executor helpers.
55. `RuntimeHitDefControllerDispatchWorld`: own bounded active-state HitDef activation dispatch, telemetry hooks, typed `hitdef` operation selection, raw fallback attack payloads, fired-hitdef dedupe, current-frame hitbox handoff, and currentMove mutation outside inline match-runtime branches.
56. `RuntimeReversalControllerDispatchWorld`: own bounded active-state ReversalDef controller dispatch, telemetry hooks, typed `reversaldef` operation selection, raw fallback activation payload, and handoff into `RuntimeReversalWorld` outside inline match-runtime branches.
56. `RuntimeEffectSpawnControllerDispatchWorld`: own bounded active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile dispatch, telemetry hooks, typed effect operation selection, spawn/count mutation handoff, and success-gated operation telemetry outside inline match-runtime branches.
57. `RuntimeFallEnvShakeControllerDispatchWorld`: own bounded active-state FallEnvShake controller dispatch, telemetry hooks, typed `fallenvshake` operation selection, fall-shake event handoff, and consumed hit-fall metadata cleanup outside inline match-runtime branches.
58. `RuntimePauseControllerDispatchWorld`: own bounded active-state Pause/SuperPause controller dispatch, telemetry hooks, typed `pause` operation selection, apply-controller callback handoff, and operation telemetry after a real pause result outside inline match-runtime branches.
59. `RuntimeActorConstraintControllerDispatchWorld`: own bounded active-state Width controller dispatch, telemetry hooks, typed `collision:width` operation selection, dynamic raw-param resolver handoff, and body-width handoff into `RuntimeActorConstraintWorld` outside inline match-runtime branches.
60. `RuntimeResourceWorld`: own bounded resource/control/variable writes, authored resource maxima, and power-delta clamping behind a named resource boundary while legacy helper functions delegate to it.
61. `RuntimeControllerDispatchWorld`: own bounded runtime-controller execution dispatch, evaluation context handoff, optional telemetry hooks, and unsupported-controller reporting outside inline match-runtime branches.
62. `RuntimeRoundSystem`: own bounded round timer, KO/time-over finish state, winner/message projection, and reset semantics outside the main match loop.
63. `RuntimePausedMatchWorld`: own bounded regular pause mini-loop ordering for source `movetime`, paused command buffering, active/presentation effect advancement, target binding, stage clamp, frozen-actor presentation ticking, pause replacement interruption, and pause countdown ticking outside inline `PlayableMatchRuntime` branching.
64. `RuntimeHitPauseWorld`: own bounded global hitpause mini-loop ordering for command buffering, `ignorehitpause` controller dispatch, paused presentation advancement, and actor hitpause countdown outside inline `PlayableMatchRuntime` branching.
65. `RuntimeContactPresentationWorld`: own bounded direct HitDef and Projectile contact package metadata plus sound/spark telemetry emission outside inline `PlayableMatchRuntime` branching.
66. `RuntimeHelperCombatWorld`: own bounded helper-owned direct `HitDef` contact resolution, helper target-memory updates, contact presentation, and helper state sync outside inline `PlayableMatchRuntime` branching.
67. `MatchWorld`: keep app/tests pointed at the facade while moving tick order and actor registries behind it.
68. `RuntimeMoveStartWorld`: own bounded native/imported state-move startup for selected move metadata, attack-state reset, control handoff, and authored state-entry handoff outside inline match-loop branching.
69. `RuntimeMatchFighterAdvanceWorld`: own bounded active 1v1 fighter-advance orchestration for P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start outside inline match-loop branching.
70. `RuntimeMatchPauseControllerWorld`: own bounded Pause/SuperPause controller result side effects for pause-state application, SuperPause power-delta handoff, and match log emission outside inline match-loop branching.
71. `RuntimeMatchCombatBridgeWorld`: own bounded priority/direct/projectile/helper combat resolver construction outside inline match-loop branching.
72. Combat/effect actor systems: move richer target controller effects, real helper state machines, helper-owned projectile/contact presentation, and exact projectile parity behind similarly small contracts.

### Render Adapter

Three.js owns:

- Orthographic camera.
- Sprite planes.
- Stage layers.
- Collision-box planes.
- Axis/grid/debug overlays.
- Material effects for PalFX/AfterImage/invisibility/superpause darken.
- Camera offsets produced by runtime shake snapshots.

Three.js must consume snapshots and asset providers. It should not evaluate CNS, commands, or hit rules.

`EnvShakeSystem` sits on the runtime side of that boundary. It converts `EnvShake` and `FallEnvShake` into bounded runtime events, records typed `fallenvshake` evidence for compiled fall-shake controllers, and resolves the camera shake vector; Three.js only applies the snapshot values. `RuntimeEnvColorWorld` follows the same boundary for `EnvColor`: it uses `EnvColorSystem` helpers to convert static `value`/`time`/`under` params into bounded stage-flash snapshots plus typed `envcolor` evidence, resolves dynamic `value`/`time`/`under` through the active expression fallback when typed evidence is unavailable, and Three.js only renders the overlay. Exact stage layer/window/blend parity remains future work.

`RuntimeSpriteEffectWorld` / `RuntimeSpriteEffectControllerWorld` / `SpriteEffectSystem` also sit on the runtime side of that boundary. They resolve legacy visual-controller params and active-state sprite-effect controller dispatch into actor snapshot state; Three.js should render those state values without parsing CNS. Current `AngleDraw` support rotates the rendered sprite quad from bounded `renderAngle` telemetry, current `SprPriority`, `PalFX`, `RemapPal`, and `Trans alpha` can resolve bounded active dynamic params into snapshot telemetry, and current `AfterImage` support exposes bounded trail telemetry. Exact MUGEN/IKEMEN axis pivot, collision-box rotation, draw-order interaction, palette/remap interaction, trail cadence, material math, exact Trans add/sub alpha math, broad dynamic expression parity, and helper/redirect visual ownership remain future work.

`RuntimeTargetWorld` / `RuntimeTargetControllerDispatchWorld` sit on the runtime side of target-memory ownership. They resolve current bounded Target* and BindToTarget controller side effects, live target-candidate filtering, target links, target bindings, target drops, and state-entry callback handoff without making Three.js or Studio parse CNS. Exact helper/projectile target ownership, team/multi-target selection, throw binding, target lifetime, and redirect parity remain future work.

`RuntimeContactMemoryWorld` / `RuntimeContactControllerDispatchWorld` sit on the runtime side of contact-counter ownership. They resolve current bounded MoveContact/MoveHit/MoveGuarded memory, HitAdd counters, MoveHitReset, received damage/hits, projectile contact timers, and direct/projectile contact readback before snapshots or trace evidence consume them. Exact combo lifetime, helper/team contact ownership, guard-count parity, projectile multi-target counters, and full contact VM parity remain future work.

`ExplodSystem` produces effect actor snapshots from already-resolved animation, owner, typed operation, and position data, including explicit `explod` actor identity, typed `explod` operation evidence for compiled imported controllers, bounded owner-side `bindtime`, bounded `vel`/`accel` movement, bounded static render scale, bounded hit-pause advance for `ignorehitpause`, and bounded `pausemovetime`/`supermovetime` advance budgets. It does not yet implement exact binding/tick-order parity, `p2` binding, exact velocity/accel parity, exact scaling parity, exact pause layering, ownpal/remappal, remove-trigger parity, or FightFX/common animation routing.

`HelperSystem` produces effect actor snapshots from already-resolved owner/action/position data, including explicit `helper` actor identity, typed `helper` operation evidence for compiled imported controllers, bounded owner-side removal by helper id or runtime serial, and bounded `NumHelper(id)` count reads over the current owner store. When spawn data includes an owner `RuntimeProgramIr` and animation map, helpers run a bounded helper-local micro-VM before presentation advance: trigger checks over helper-local `Time`, `ctrl`, resources, metadata, and variables can run `ChangeState`, `ChangeAnim`, `DestroySelf`, helper-local kinematic controllers, `CtrlSet`, `StateTypeSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`, `VarSet`, `VarAdd`, `VarRandom`, `VarRangeSet`, and helper-local `PlaySnd` / `StopSnd` sound-event telemetry against only the helper actor. That helper expression context supports bounded parent/root/opponent reads plus caller-provided `EnemyNear(index)` / `EnemyNear(var(n))` reads and `NumEnemy` counts only when an explicit opponent-state list exists. `RuntimeHelperCombatWorld` now owns the bounded helper-owned direct `HitDef` contact path over those helper actors. Key control, broader indexed/team/helper-owned redirects, exact parent/root binding semantics, helper-owned Projectile combat/contact presentation, helper-owned Explod visual-effect namespaces, exact helper-local sound timing/channel/redirect ownership, exact helper resource semantics, helper fvar/sysvar `VarRandom`, palette ownership, exact scaling/collision parity, helper custom-state breadth, and full pause/lifecycle parity remain outside this cut.

`ProjectileSystem` produces effect actor snapshots and projectile hitbox projection from already-resolved owner/action/position data, including explicit `projectile` actor identity, typed `projectile` operation evidence for compiled imported controllers, bounded `projhits`/`projmisstime` state, bounded `accel` movement, bounded `velmul` velocity multiplier movement, bounded static `projscale` render scale, bounded owner-side `ModifyProjectile` mutation of live projectiles through typed `modifyprojectile` evidence, bounded `NumProj` / `NumProjID(id)` count reads over the current owner store, and bounded terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions. `ExplodSystem` likewise exposes bounded `NumExplod(id)` count reads over the current owner store for visual effect actors. `RuntimeProjectileCombatWorld` consumes those projected hitboxes plus defender/projectile boxes through `RuntimeEffectActorWorld` and applies the bounded contact/reject/HitOverride/hit-or-guard/removal loop, bounded single-target re-contact cooldown, bounded `ProjContact`/`ProjHit`/`ProjGuarded(projid)` owner trigger memory, plus bounded equal-priority trade and higher-priority `projpriority` cancel with winner-priority decrement through the shared partial combat resolver. These systems do not yet implement exact `ModifyProjectile` tick-order/selection parity, exact projectile priority classes, exact projectile count/lifetime parity, exact contact-trigger timing/lifetime, exact multi-target projectile behavior, exact terminal timing/rem-trigger parity, exact `velmul` tick-order parity, scaled collision parity, full guard-specific effects/timing, helper-owned projectile rules, or exact HitDef inheritance.

`TargetSystem` owns renderer-independent target bookkeeping plus the current simplified Target* controller and target-trigger application contract. It handles bounded target memory, target-candidate filtering from live target refs, target id matching, `NumTarget(id)` trigger reads, bounded `Target, ...` / static `Target(id), ...` trigger redirect reads from current two-player target memory, bindings, `TargetDrop` `excludeID`/`keepone` filtering with MUGEN's omitted-`keepone` default of `1`, partial `TargetBind` and `BindToTarget` binding, active target-binding position application, `TargetBind`-derived `hitVars.isBound` subject metadata for `GetHitVar(isbound)`, partial life/power/velocity/facing/bind/state effects, and delegates TargetState entry through `RuntimeTargetStateEntryWorld` before the match runtime performs concrete state mutation. `RuntimeTargetWorld.resolveCandidates` filters the materialized actor list through live target memory before `applyController`, `applyBindToTargetController`, `applyTargetBindings`, and `applyBindToTarget` mutate anything; this keeps stale or unrelated actors from participating once helper/projectile/team candidates are introduced. `BindToTarget` lookup, `pos/postype` parsing, `Foot`/`Mid`/`Head` size-anchor resolution, duration binding, and facing-aware position application live in `RuntimeTargetWorld.applyBindToTargetController`; target-memory advance prunes `TargetBind` binding records whose bound actor id / target id no longer survives expiry; per-frame active `TargetBind` and `BindToTarget` position mutation flows through `RuntimeTargetWorld.applyTargetBindings` / `applyBindToTarget`, refreshes bounded `isBound` metadata, and requires matching live target memory for the bound actor id and target id before moving either actor. `PlayableMatchRuntime` supplies only the current concrete opponent actor and character constants for `Mid`/`Head` anchors, and it preserves interaction ordering. Required `synthetic-imported-custom-state-gethitvar-isbound.json` checksum `d25307e9` proves a bounded direct-HitDef target-memory route where `TargetBind` marks P2 as bound before owner-local `TargetState`, letting P2 branch through `GetHitVar(isbound)` while executing P1-owned state data and return through `SelfState`. Required `synthetic-imported-target-redirect.json` checksum `89580963` proves a bounded direct-hit route where `Target(77), Life < 1000` branches P1 from state `200` to `286` with target-link evidence for P2 target id `77`. The required `synthetic-imported-bindtotarget-head` and `synthetic-imported-bindtotarget-mid` traces prove those anchor paths through world-visible offset evidence. The required `synthetic-imported-custom-state` trace proves the bounded owner-backed `HitDef p2stateno -> ChangeState -> SelfState` path by requiring P2 actor frames with `customOwnerId = p1` before the final return to control. The required `synthetic-imported-target-owned-custom-state` trace proves the complementary `HitDef p2stateno` route with `p2getp1state = 0`: P2 uses defender-owned state/action `888`, has no attacker `customOwnerId`, and returns to control through its own `SelfState`. The required `synthetic-imported-targetstate-custom` trace proves the matching target-memory-driven `TargetState -> ChangeState -> SelfState` owner route with typed `target:targetstate` operation evidence. Target memory and active bindings are exposed as `ActorSnapshot.runtime.targetRefs`/`targetBindings`, `ActorSnapshot.runtime.bindToTarget`, `MatchWorld.targetLinks`, and trace `world.targetLinks` evidence. It does not yet implement helper/projectile target redirects, dynamic target ids, mutation through redirects, multi-target teams, helper parent/root redirects, exact target persistence rules, exact bind tick order/lifetime, visual bind parity, throw parity, or complete custom-state ownership beyond those bounded two-actor routes.

`CombatResolver` owns renderer-independent combat result helpers. Bounded direct `HitDef` priority clash mutation now lives in `RuntimeDirectCombatWorld`, helper-owned direct `HitDef` contact orchestration now lives in `RuntimeHelperCombatWorld`, and owner-backed `p2stateno` route evidence still goes through runtime state ownership, but the engine does not yet implement exact MUGEN/IKEMEN priority classes, guard states, fall state routing, complete custom-state ownership, reversal parity, projectile trade/cancel parity, exact helper combat parity, team rules, or exact hit timing.

`RuntimeGuardWorld` owns the current bounded guard routing helpers: default guard-hit state selection for stand/crouch/air routes, default guard-start state selection with state `120` priority, auto guard-start eligibility from held-back input/control/pause/stun/current-move state, and the minimal start mutation that clears control and horizontal velocity. `PlayableMatchRuntime` still owns `InGuardDist` timing, frame/hurtbox lookup, state entry, and imported-source checks, while direct and projectile combat paths delegate guard-hit state selection through the same world. This is ownership cleanup, not exact proximity guard, guard-end timing, guard effects, air-guard landing, Common1 controller-loop parity, or full MUGEN/IKEMEN guard VM parity.

`RuntimeHitEligibilityWorld` owns the current bounded lifetime maintenance around hit eligibility: finite `HitBy` / `NotHitBy` slots tick down and expire there, infinite slots remain active, and per-frame `AssertSpecial` plus render-opacity reset happens before the imported pre-facing AssertSpecial pass. `StateControllerExecutor` still applies the actual `HitBy`, `NotHitBy`, and `AssertSpecial` controller writes, while `CombatResolver`, `RuntimeDirectCombatWorld`, and `RuntimeProjectileCombatWorld` consume the resulting runtime state. This is an ownership boundary for current lifetime/reset behavior, not exact slot priority, attr grammar, helper/team/global ownership, persistence layering, pause interaction, or full MUGEN/IKEMEN hit-eligibility parity.

`RuntimeAssertSpecialWorld` owns current bounded imported pre-facing `AssertSpecial` dispatch: it locates the current owner-backed state program, filters to `AssertSpecial`, respects trigger results supplied by the runtime, and applies the resulting runtime flags before `RuntimeOrientationWorld` performs automatic facing. `PlayableMatchRuntime` still owns the concrete trigger/evaluation context and pass placement, so exact persistence, global flags, helper/team ownership, pause layering, and full `AssertSpecial` VM parity remain future work.

`RuntimeOrientationWorld` owns current bounded orientation mutation: automatic facing toward the opponent respects `AssertSpecial NoAutoTurn`, and `Turn` facing flips run through `OrientationSystem` instead of inline controller-executor mutation. `PlayableMatchRuntime` still decides when the pre-facing AssertSpecial pass and auto-facing pass occur, and `StateControllerExecutor` still validates controller operation shape before delegating. This is ownership cleanup, not exact auto-facing order, target-facing/team/helper semantics, redirect ownership, or full MUGEN/IKEMEN orientation parity.

### Audio Adapter

Web Audio owns:

- Browser unlock.
- WAV decoding.
- Channel bookkeeping.
- Runtime sound event playback.

The runtime emits sound events; it does not own browser audio nodes.

`RuntimeAudioWorld` sits on the runtime side of that boundary. It uses `AudioEventSystem` helpers to convert legacy controllers, bounded dynamic numeric audio params, and bounded direct `HitDef` `hitsound`/`guardsound` refs into `RuntimeSoundEvent` snapshots and leaves decoding, channel nodes, browser unlock, and playback to `MugenAudioSystem`.

### Debug And QA Plane

The DOM app owns:

- File loading controls.
- Runtime/Inspector switching.
- State, command, animation, compatibility, and console panels.
- JSON export.
- `window.__MUGEN_WEB_SANDBOX__` QA bridge.

The QA bridge is part of the architecture because browser verification is required for frontend/rendering changes.

`RuntimeTrace` is the runtime-side evidence seam before the Studio evidence browser exists. It runs scripted input frames against a runtime instance, records compact actor/effect identity/round/compatibility summaries, captures `MatchWorld` lifecycle metadata, effect-store summaries, target links, lifecycle events, and bounded controller-event timelines when the runner exposes them, extracts new runtime log events, and produces deterministic frame/final checksums. `evaluateRuntimeTraceGate` evaluates those traces against explicit imported/runtime requirements such as actor source, routed state, executed controller, ordered controller-event sequence by controller/name/operation, active command, hit/guard event presence, match-pause snapshot presence, match-pause actor/effect advance and freeze evidence, world lifecycle event presence, effect-store ownership/count evidence, target-link ownership/binding, actor-frame/final-actor `customOwnerId`, actor-frame body-width/body-push/facing evidence, actor-frame state metadata evidence, and final actor state/control constraints. `RuntimeTraceGate.requiredControllerEventSequences` can require ordered controller, controller-name, and typed-operation evidence from imported compatibility sessions while the inspection-only controller-event timeline is excluded from behavior checksums. `RuntimeTraceArtifact` is the current export envelope for that evidence: `runtime-trace-artifact/v0` JSON with trace checksums, compact per-frame summaries, world lifecycle summaries, effect stores, target links, per-frame lifecycle events, final actor/effect summaries, events, script frames, gate requirements, gate evidence, and gate results. It is renderer-independent and now feeds a basic Studio frame scrubber; it should become the basis for KFM replay gates, controller-order regression tests, and deeper trace-diff UI.

### Creator Studio Plane

The future studio plane owns:

- Project manifests.
- Asset library views.
- Character and stage editors.
- Module-specific configuration surfaces.
- Playtest launch presets.
- Export/build actions.

This plane should call engine/project services rather than reaching directly into Three.js scene objects or raw MUGEN parser internals.

### Shared Module Contracts

`src/engine/ModuleContracts.ts` is the current shared-engine contract registry. It is intentionally renderer- and MUGEN-independent, and defines the first common contract ids for future modules:

- `input/v0`
- `asset/v0`
- `snapshot/v0`
- `render/v0`
- `audio/v0`
- `debug/v0`
- `build/v0`
- `qa/v0`

`ProjectCompiler` includes this registry in `runtime-manifest/v0` as `contracts.schemaVersion = "mugen-web-sandbox/shared-engine-contracts/v0"`. Each known module record declares the contracts it consumes/provides plus a short `claimAllowed` and `claimBlocked`, so Build/Studio can show whether a module is active, planned, or missing without implying runtime parity.

The shared core explicitly forbids fighting-compatibility concepts such as `CNS`, `CMD`, `HitDef`, `round`, `helper`, `projectile`, `explod`, `target`, `MUGEN command routing`, and `IKEMEN ZSS`. The `mugen-compat` module is the only module allowed to contain those concepts. Planned genre modules, including the first `platformer-module` contract, must consume the shared input/asset/build/QA contracts and provide snapshots/audio/debug data without importing MUGEN state-controller semantics.

Claim allowed: `runtime-manifest/v0` can now describe active/planned/missing module boundaries and shared contract ids.

Claim blocked: this is a contract and packaging boundary, not a platformer runtime, generic SDK, or proof that non-fighting modules are implemented.

## Proposed Folder Direction

Current folders can grow incrementally. Suggested future additions:

```txt
src/mugen/
  compiler/
    CommandCompiler.ts
    ExpressionCompiler.ts
    StateControllerCompiler.ts
    RuntimeIr.ts
    CompileReport.ts

  profiles/
    mugen10.ts
    mugen11.ts
    ikemenGo.ts

  runtime/
    RuntimeTrace.ts
    world/
      MatchWorld.ts
      PlayerRuntime.ts
      HelperRuntime.ts
      ProjectileRuntime.ts
      ExplodRuntime.ts
    systems/
      CombatResolver.ts
      PauseSystem.ts
      CommandSystem.ts
      StateProgramExecutor.ts
      TargetSystem.ts
      AudioEventSystem.ts
      HitEffectSystem.ts
      EnvShakeSystem.ts
      SpriteEffectSystem.ts
      EffectActorSystem.ts
      ExplodSystem.ts
      HelperSystem.ts
      ProjectileSystem.ts
      ProjectileCombatSystem.ts

src/studio/
  projects/
    ProjectManifest.ts
    ProjectStore.ts
  assets/
    AssetLibrary.ts
    AssetValidation.ts
  editors/
    CharacterStudio.ts
    StageStudio.ts
    ModuleStudio.ts
```

Do not create all of this at once. Add each folder when a real feature needs it.

## Runtime Tick Contract

The long-term tick should be deterministic:

1. Capture input.
2. Update command buffers.
3. Resolve pause/hitpause eligibility.
4. Evaluate state triggers.
5. Execute controller IR in order.
6. Resolve movement and physics.
7. Resolve combat overlaps.
8. Apply hit/guard/target side effects.
9. Advance animation frames.
10. Emit render/audio/debug snapshots.

Exact MUGEN/IKEMEN ordering will need refinement, but this contract gives each subsystem a place.

Replay trace gates should exercise this order with scripted inputs, not only screenshots. A trace should be able to explain which frame changed state, routed a command, executed a controller, connected/guarded/whiffed a hit, spawned an actor, or ended the round.

## Compatibility Report Contract

Reports should separate:

- parsed resources
- decoded assets
- recognized controllers/triggers
- compiled executable operations
- runtime-routable states
- states/controllers actually executed this session
- unsupported features with counts and locations

This split prevents inflated support claims.

## Three.js Projection Rules

The renderer uses a 2D MUGEN coordinate plane inside a Three.js orthographic scene:

- X: horizontal stage axis.
- Y: vertical screen/stage axis after projection helper conversion.
- Z: draw priority/layer ordering only.

Sprite axis, facing, scale, camera offset, collision boxes, and stage parallax should remain centralized in render projection helpers.

## Design Constraints

- `src/mugen/*` cannot import Three.js.
- Parsed data is immutable.
- Runtime instances are mutable and serializable into snapshots.
- Unsupported feature tracking is a first-class output.
- Browser-local loading is the default security boundary.
- Generated original characters and external MUGEN fixtures must stay clearly separated.
- Studio/editor data must stay separate from compact runtime data.
- Genre modules must depend on shared core contracts, not on each other's implementation details.
- Shared engine contracts cannot import or expose MUGEN/IKEMEN-only concepts; those remain inside `mugen-compat`.
- Architecture boundary tests must keep `src/engine/*` independent from MUGEN/App/Game/Three/package-loader code and keep `src/mugen/*` independent from App/Game/Three renderer code.

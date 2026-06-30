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

`CommandBuffer` now consumes the shared command-step compiler. `MugenCharacterLoader` builds one `RuntimeProgramIr` per loaded character, stores it on the character model, passes it to compatibility reporting, and imported runtime fighters carry it into `PlayableMatchRuntime`. Runtime-created test/import definitions without a cached program compile once when `FighterMatchState` is constructed, not during controller ticks. `StateControllerExecutor` now has a native `executeControllerIr` path, with the older parsed-controller function kept as a wrapper. `StateProgramExecutor` classifies each `ControllerIr` into change-state, change-anim, shared runtime-controller, side-effect, or unsupported dispatches. `PlayableMatchRuntime` uses that dispatch layer for active-state controllers, State -1 setup/routing, and trigger evaluation. Static numeric `VelSet`/`VelAdd`/`VelMul`/`PosSet`/`PosAdd`/bounded `Gravity` controllers compile into `kinematic:*` operations, static `Width` controllers compile into `collision:width` operations, static `PlayerPush` controllers compile into `collision:playerpush` operations, static `StateTypeSet` controllers compile into `metadata:statetypeset` operations, static `Turn` controllers compile into `orientation:turn` operations, static `SprPriority` controllers compile into `sprite-effect:sprpriority` operations, static `PalFX` controllers compile into `sprite-effect:palfx` operations, static `Trans` controllers compile into `sprite-effect:trans` operations, static `AngleSet`/`AngleAdd`/`AngleDraw` controllers compile into `sprite-effect:angleset` / `sprite-effect:angleadd` / `sprite-effect:angledraw` operations, static `EnvColor` controllers compile into `envcolor` operations, static `RemapPal` controllers compile into `sprite-effect:remappal` operations, static numeric `CtrlSet`/`LifeAdd`/`LifeSet`/`PowerAdd`/`PowerSet`/`VarSet`/`VarAdd`/`VarRandom`/`VarRangeSet` controllers compile into `resource:*` / `variable:*` operations, static `HitBy`/`NotHitBy`/`HitOverride` setup compiles into `eligibility:*` / `hitoverride` operations, static `ReversalDef` setup compiles into `reversaldef` operations, static direct `HitDef` `hitsound`/`guardsound` and `sparkno`/`guard.sparkno`/`sparkxy` refs compile into typed HitDef op data, and static `AttackMulSet`/`DefenceMulSet` compile into `damage-scale:*` operations, while dynamic params keep raw expression fallback. `PauseSystem` owns partial `Pause`/`SuperPause` controller semantics, consumes typed `pause:*` operations when compiled, produces freeze snapshots, handles `movetime`, `darken`, `poweradd` deltas, and ticks pause frames deterministically; `RuntimeTraceGate` can now require those `matchPause` snapshots by actor/state/darken/remaining/movetime and require actor/effect advance or freeze evidence by id/kind/owner, so typed pause operation evidence is tied to an actual match freeze and the bounded SuperPause+Projectile route proves effect actors can be checked for source-movetime advance plus later freeze. `RuntimeAudioWorld` owns partial player `PlaySnd`/`StopSnd` controller-to-event insertion and receives bounded direct HitDef `hitsound`/`guardsound` telemetry through `AudioEventSystem` parsing helpers before the Web Audio adapter consumes snapshots; `HelperSystem` emits the same bounded event shape for helper-local `PlaySnd`/`StopSnd` and helper snapshots clone those events for debug/trace/audio consumers. Exact SND playback, FightFX/common sound fallback, channel priority, helper redirect ownership, and timing/mixing parity remain future work. `RuntimeHitEffectWorld` owns bounded direct HitDef `sparkno`/`guard.sparkno` event telemetry plus optional `sparkxy` offsets; `HitSparkRenderer` consumes those snapshot events, resolves `S` refs as local player AIR actions, renders the first resolved player AIR frame as a sprite texture when possible, classifies unprefixed refs as common/default and `F` refs as FightFX, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace, and keeps bounded 180-frame fallback geometry when lookup fails. `RuntimeContactPresentationWorld` owns the current direct HitDef and Projectile contact presentation package boundary between combat and presentation: shared `contactId` / `contactTick` / `contactKind` metadata creation, attacker-side sound telemetry, attacker-side HitSpark telemetry, and hit-spark asset-frame handoff through the existing audio/effect systems. Exact intra-tick audio/spark ordering, SND playback/mixing/channel priority, helper-owned contact presentation, multi-target presentation, exact package-backed common/FightFX AIR/SFF lookup, binding, render timing, layering, scale, palette, and full spark parity remain future work. `EnvShakeSystem` owns partial `EnvShake`/`FallEnvShake` event creation and deterministic camera-shake snapshots before Three.js applies presentation; compiled `FallEnvShake` controllers now emit typed operation evidence when they consume stored fall-shake metadata. `RuntimeEnvColorWorld` owns partial `EnvColor` event history, reset, and bounded stage-flash snapshot math with `EnvColorSystem` parsing helpers before Three.js applies presentation; typed `envcolor` operation evidence is tied to stage-frame color/opacity gates. `StateControllerExecutor` consumes typed `hitfall:*`, `kinematic:*`, `collision:playerpush`, `metadata:*`, `orientation:*`, `sprite-effect:trans`, `sprite-effect:remappal`, `sprite-effect:angleset` / `sprite-effect:angleadd` / `sprite-effect:angledraw`, `resource:*`, `variable:*`, `eligibility:*`, `hitoverride`, and `damage-scale:*` data for the current partial runtime-controller families; `PlayableMatchRuntime` consumes typed `reversaldef`, `collision:width`, `sprite-effect:sprpriority`, `sprite-effect:palfx`, `sprite-effect:angleset` / `sprite-effect:angleadd` / `sprite-effect:angledraw`, and `envcolor` side-effect data and preserves raw fallback for dynamic reversal/width/sprite-effect/stage-flash params. `RuntimeReversalWorld` owns the bounded ReversalDef activation, active counter detection, and direct counter-result mutation after that side-effect dispatch; state-entry and target-state routing remain explicit hooks. `SpriteEffectSystem` owns partial `SprPriority`, `PalFX`, `Trans`, `AngleSet`/`AngleAdd`/`AngleDraw`, `AfterImage`, and `AfterImageTime` parsing/ticking before Three.js applies material ordering, tinting, opacity, sprite-quad rotation, and ghost trails. `ExplodSystem` owns the first extracted effect actor lifecycle: typed `explod` operation consumption when compiled, typed `removeexplod` operation consumption, fallback raw-param spawn/removal from already-resolved AIR actions, bounded owner-side `bindtime`, bounded `vel`/`accel` movement, bounded static scale projection, animation advance, actor identity metadata, bounded `NumExplod(id)` count reads, and renderer snapshots. `HelperSystem` owns the current partial visual Helper actor lifecycle: typed `helper` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, owner runtime-program/animation handoff, bounded helper-local `ChangeState`/`ChangeAnim`/kinematic/`DestroySelf`/`CtrlSet`/`StateTypeSet`/`LifeAdd`/`LifeSet`/`PowerAdd`/`PowerSet`/`VarSet`/`VarAdd`/`VarRandom`/`VarRangeSet` micro-VM execution, bounded helper-local `PlaySnd`/`StopSnd` telemetry, helper-local trigger branches on metadata/control/resources/variables, animation advance, bounded removal, explicit owner-side removal by helper id or runtime serial, actor identity metadata, bounded `NumHelper(id)` count reads, and renderer snapshots. `ProjectileSystem` owns the current partial Projectile actor lifecycle: typed `projectile` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, guard metadata, bounded `projhits`/`projmisstime`, bounded terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions, velocity advance, hitbox projection, bounded removal, actor identity metadata, bounded `NumProj` / `NumProjID(id)` count reads, and renderer snapshots. `RuntimeProjectileCombatWorld` owns the bounded projectile contact/reject/HitOverride/hit-or-guard/removal loop, bounded multi-hit re-contact cooldown, bounded owner contact-trigger memory for `ProjContact`/`ProjHit`/`ProjGuarded(projid)`, plus bounded `projpriority` equal-priority trade and higher-priority cancel/decrement through `RuntimeEffectActorWorld`; removal events report the selected terminal-animation metadata and actor-frame trace gates prove terminal playback where actions exist, while exact priority classes, exact contact-trigger timing/lifetime, multi-target projectile behavior, exact terminal timing, full guard effects, pause layering, and tick parity remain future work. `EffectActorSystem` now wraps those three actor families in one mutable store for serial allocation, bounded lists, count reads, advance/removal mutation, explicit visual-helper removal by id/serial, hit-removal pruning, snapshot handoff, read-only store summaries, and the projectile-combat handoff; `RuntimeEffectActorWorld` is the world-style contract for those stores, active-effect advance, presentation-effect advance, combat handoff, and reset, and `MatchWorld` creates/injects it into `PlayableMatchRuntime`. `RuntimeTraceGate` actor-frame evidence records observed min/max position, velocity, scale, body width, body-push state, sprite priority, palette/material/opacity/remap/angle telemetry, facing, and state metadata, while stage-frame evidence records camera/bounds plus `EnvColor` color/opacity telemetry, so effect-motion/scale, collision-body/push, sprite-ordering/material/opacity/rotation, palette-remap, stage-flash, orientation, and metadata gates can be checked without renderer coupling. `FighterMatchState` no longer stores the raw effect actor store. `TargetSystem` owns the current partial target-memory, target-binding lifecycle, and simplified Target* controller application contract. `CombatResolver` owns the current partial runtime combat decision helpers used by direct attacks and bounded projectile combat: facing-aware box projection, overlap tests, `HitBy`/`NotHitBy` eligibility, `HitOverride` lookup, simplified guard detection, typed attack/defense damage scaling, and hit/guard damage result math. Broader combat controllers still receive parsed controller params through `controller.source` until their typed operations are split into dedicated systems.

`VarRandom` now compiles into typed `variable:varrandom` operation evidence and runs through the same runtime-controller dispatch as `VarSet`, `VarAdd`, and `VarRangeSet`. `RuntimeRandomSystem` owns deterministic per-actor seed creation, LCG advance, controller-safe unit clamping, and fallback random-unit derivation for trace-stable controller/trigger expression evaluation. `PlayableMatchRuntime` stores the current seed on each actor and delegates advance to that system. This is not exact MUGEN random stream parity and does not solve helper/parent/root variable scopes.

`RuntimePausedMatchWorld` owns the bounded regular `Pause` / `SuperPause` mini-loop that used to live inline in `PlayableMatchRuntime`: hitpause-style command buffering during match pause, source-actor `movetime` checks, player/AI source advancement, active effect/presentation effect advancement for the moving source, target binding application, stage clamp, frozen-actor paused-presentation ticking, pause replacement interruption, and pause countdown ticking. `RuntimePauseWorld` still owns the current pause state/controller application/snapshot; `RuntimePausedMatchWorld` owns the per-tick paused-match ordering around that state. This is ownership cleanup for the current sandbox pause route, not exact super backgrounds, pause layering, helper VM pause behavior, rollback timing, or MUGEN/IKEMEN pause parity.

`RuntimeHitPauseWorld` owns the bounded global hitpause mini-loop that used to live inline in `PlayableMatchRuntime`: hitpause command buffering, `ignorehitpause` active-state controller dispatch for both actors, paused presentation advancement, and per-actor hitpause countdown. `PlayableMatchRuntime` still supplies controller execution callbacks and presentation hooks, so this is current-order ownership cleanup, not exact persistent controller execution, helper-owned hitpause, broad side-effect ordering, or MUGEN/IKEMEN hitpause tick parity.

`RuntimeMoveLifecycleWorld` owns the bounded active-move lifecycle mutation that used to live inline in `PlayableMatchRuntime`: current move tick increment, non-reversal attack `moveType` and horizontal velocity lock, completed move cleanup, reversal cleanup, and non-reversal idle/control restoration through injected callbacks. `PlayableMatchRuntime` still owns concrete state/action entry and input dispatch, so this is current-behavior ownership cleanup, not new cancel semantics, exact input timing, or MUGEN/IKEMEN active-move lifecycle parity.

`RuntimeInputControlWorld` owns the bounded local player and simple AI control intent that used to live inline in `PlayableMatchRuntime`: input blocking gates, State -1 setup/entry precedence, local punch/kick intent, crouch/jump/walk/idle mutation, airborne drift, `AssertSpecial NoWalk` suppression, simple AI chase, and AI attack cooldown. `PlayableMatchRuntime` still supplies state-entry, action-change, state-number, and move-start hooks, so this is current sandbox control ownership cleanup, not exact command timing, real MUGEN AI, AILevel, ctrl edge parity, or full MUGEN/IKEMEN input routing.

`RuntimeKinematicsWorld` owns the bounded actor position integration that used to live inline in `PlayableMatchRuntime`: horizontal/vertical position advance, current sandbox airborne gravity, ground snap, imported hit-state ground-snap preservation, and landing idle-action requests through injected callbacks. `PlayableMatchRuntime` still owns authored kinematic controller execution, Common1 recovery hooks, stage constraints, and concrete state/action entry, so this is current-behavior ownership cleanup, not exact `yaccel` constants, landing timing, air-recovery parity, helper physics ownership, or full MUGEN/IKEMEN physics parity.

`RuntimeAnimationWorld` owns the bounded actor animation advancement that used to live inline in `PlayableMatchRuntime`: `animTime`, `frameIndex`, `frameElapsed`, completion, final-frame hold, `loopStart`, and shared duration/timing helpers used by `AnimTime`, `AnimElemTime`, and the current `HitDef` active-window calculation. `PlayableMatchRuntime` still owns `ChangeAnim` / `ChangeAnim2` dispatch, state-owner action selection, concrete state/action entry, and controller ordering, so this is current-behavior ownership cleanup, not exact AIR negative-duration semantics, `elem` / `elemtime` parity, state-owner namespace parity, or full MUGEN/IKEMEN animation VM parity.

`RuntimeAssertSpecialWorld` owns the bounded pre-facing `AssertSpecial` pass that used to live inline in `PlayableMatchRuntime`: imported active-state lookup, owner-backed state lookup, `AssertSpecial` controller filtering, trigger gating, and controller application before automatic facing. `PlayableMatchRuntime` still supplies trigger evaluation, constants, random, and controller execution context, so this is current-order ownership cleanup, not exact persistence layering, global/team/helper ownership, pause interaction, or full MUGEN/IKEMEN `AssertSpecial` parity.

`RuntimeSnapshotWorld` owns the bounded stage/camera, player-actor, and final effect snapshot projection that used to live inline in `PlayableMatchRuntime`: camera center selection honors `ScreenBound` `moveCameraX = 0`, falls back to all actors when every actor disables camera following, applies stage camera offsets, carries current EnvShake camera shake plus EnvColor stage-flash data into `StageSnapshot`, projects player actor identity/source/sprite-owner metadata, clones runtime state, attaches target refs/bindings, chooses active move or AIR-frame collision boxes, applies the current fallback hurtbox, clones sound, hit-effect, and env-shake event histories, then aggregates cloned Explod/Helper/Projectile snapshots in stable owner/kind order. Compatibility sessions, full stage controller timing, motif/screenpack camera logic, target semantics, effect VM semantics, renderer parity, and full MUGEN/IKEMEN snapshot parity remain outside this cut.

`RuntimeCompatibilityTelemetryWorld` owns the imported-compatibility telemetry/session projection that used to live inline in `PlayableMatchRuntime`: imported actor detection including owner-backed imported state owners, executed-state bookkeeping, routed State -1 entries, controller counts, typed-operation count keys, bounded controller-event history, active-command projection, command-history handoff, and `compatibilitySession` snapshot construction. This is ownership cleanup for existing debug/trace/session data, not new controller semantics, exact CNS VM timing, or MUGEN/IKEMEN parity.

`RuntimeEffectSpawnWorld` now owns the bounded spawn/dispatch bridge from active CNS controllers into the effect actor world: Explod action/position/bind/default duration resolution, Helper state/action resolution including state-owner sprite/action lookup, owner runtime-program/animation handoff for the helper-local micro-VM, visual-helper removal handoff, Projectile action/offset/terminal-action resolution, RemoveExplod dispatch, and ModifyProjectile dispatch. `PlayableMatchRuntime` still records controller execution/operation evidence and owns match orchestration, so this is an ownership cleanup rather than exact effect spawn timing, full helper VM parity, parent/root redirect, or FightFX/Common animation parity.

`RuntimeEffectLifecycleWorld` now owns the bounded lifecycle orchestration that happens after those effect actors exist: active-effect ticks, presentation ticks, paused presentation ticks, effect snapshot grouping, and shared get-hit cleanup. `PlayableMatchRuntime` delegates current effect lifecycle passes and projectile get-hit cleanup to that boundary, while direct combat, HitOverride, and Reversal share the same effect get-hit cleanup helper. This is current-behavior ownership, not exact helper VM lifecycle, pause/combat ordering, advanced remove-trigger timing, parent/root/redirect parity, or full MUGEN/IKEMEN effect lifecycle parity.

`RuntimeMatchInteractionWorld` owns the bounded post-fighter interaction order after both actors have run controller logic: target-memory aging, active-effect advance, projectile clash, body separation, target bindings, direct priority/direct combat, projectile combat, stage clamp, and presentation-effect advance. `PlayableMatchRuntime` still supplies concrete fighting callbacks and MUGEN-specific data, so this is an ownership seam for ordering and testability, not a new shared-core API or a claim of exact MUGEN/IKEMEN tick-order parity.

`synthetic-imported-hitadd.json` adds the current contact-memory controller contract: static `HitAdd value` compiles into `contact:hitadd`, `PlayableMatchRuntime` applies it only to bounded current-state direct `HitCount` telemetry, and `UniqHitCount` remains target uniqueness. This keeps combo/count approximation explicit instead of folding it into hidden combat math.

`RuntimeContactMemoryWorld` now owns the bounded contact-memory data structure and mutations behind those direct/projectile trigger cuts: direct `MoveContact`/`MoveHit`/`MoveGuarded`, direct `HitCount`/`UniqHitCount`, `HitAdd`, `MoveReversed`, defender-local `ReceivedDamage`/`ReceivedHits`, and projectile contact/time markers. `PlayableMatchRuntime` injects that world into fighter state and uses it as the actor/state-number glue; `RuntimeDirectCombatWorld` and `RuntimeReversalWorld` use the same boundary for direct hit/guard, received-damage, and reversal marker mutations. This is ownership cleanup, not exact contact/combo lifetime parity. `RuntimeResourceSystem` now owns the bounded resource and variable writes used by `StateControllerExecutor`: `CtrlSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`, `VarSet`, `VarAdd`, partial `VarRandom`, and `VarRangeSet`, including sysvar assignment support for set/add. It also owns authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control-flag writes consumed by the playable match loop, direct combat, projectile combat, target controllers, and reversals. `StateControllerExecutor` still resolves params and expressions, while `RuntimeRandomSystem` owns deterministic sandbox-side random units and dynamic fallback salt for `VarRandom`, so this does not claim exact resource/variable scope, exact MUGEN random stream, helper/team/parent/root redirects, exact target/projectile resource parity, or full CNS VM parity. `TargetSystem` also owns bounded `BindToTarget` `postype` anchor resolution for `Foot` / `Mid` / `Head`, reading `size.mid.pos*` and `size.head.pos*` through an injected constant resolver so match runtime no longer carries those MUGEN anchor rules inline; the same system now prunes stale `TargetBind` binding records when target-memory expiry removes the bound target. `HitSparkAssetSystem` now owns bounded HitDef spark asset-frame resolution from `S` player AIR refs, unprefixed common refs, and `F` FightFX refs before `RuntimeHitEffectWorld` records the event; this is presentation ownership cleanup, not exact FightFX/common visual parity.

`RuntimeStunWorld` owns the bounded hitstun/guardstun update used by the playable match loop: input-lock checks, guardstun decay, guarding flag maintenance, hit/guard horizontal friction, hitstun decay, hitstun presentation-action requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration. `PlayableMatchRuntime` still supplies the concrete action-change callback and imported-state predicate, so this is a system boundary for current behavior, not exact MUGEN/IKEMEN hitpause, guard recovery, helper/custom-state stun ownership, or Common1 tick-order parity.

`RuntimeRecoverySystem` owns the bounded recovery timers and state-transition hooks that used to live inline in `PlayableMatchRuntime`: `fall.recovertime` countdown, Common1 liedown `data.liedown.time` defaulting/decrement, and imported `5201 -> 52` ground-recovery landing. `PlayableMatchRuntime` still validates and enters states through callbacks, so this is ownership cleanup for current behavior, not exact Common1 threshold/tick-order parity.

`RuntimeGetHitStateWorld` owns the bounded default get-hit state selection that used to live inline in `PlayableMatchRuntime`: stand routes prefer `5000`, crouch routes prefer `5010 -> 5000`, and air routes prefer `5020 -> 5000` when those states exist. Direct combat and projectile combat still ask `PlayableMatchRuntime` to validate and enter states, and custom `p2stateno` routing remains separate. This is ownership cleanup for current imported default get-hit behavior, not exact Common1 animation selection, helper/team/redirect ownership, projectile-specific parity, or full get-hit VM parity.

`RuntimeHitStateTransitionWorld` owns the bounded direct-hit and ReversalDef state-transition ownership that also used to live inline in `PlayableMatchRuntime`: `p2stateno` can enter an attacker-owned custom state by default, `p2getp1state = 0` clears the custom owner and enters target-owned data, and `p1stateno` routes the attacker when the requested state exists. State validation and concrete state entry still remain injected hooks, so this is ownership cleanup for current two-actor state routing, not exact throws, helper/root/parent redirects, team ownership, custom-state VM tick order, or full MUGEN/IKEMEN custom-state parity.

`RuntimeStateAvailabilityWorld` owns the bounded state/action availability lookup that used to live inline in `PlayableMatchRuntime`: compiled runtime-program states win over parsed definition states, parsed states can be entered when present, and animation-only actions remain accepted as the current fallback. This boundary is used by current get-hit, guard, custom-state, target, recovery, HitOverride, and ReversalDef routes. It is not state-entry mutation, exact redirect/helper/root/parent/team lookup parity, IKEMEN state lookup extensions, or full CNS VM state ownership.

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
  RuntimeMoveLifecycleWorld
  RuntimePausedMatchWorld
  RuntimeHitPauseWorld
  RuntimeContactPresentationWorld
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
7. `RuntimeSpriteEffectWorld` / `SpriteEffectSystem`: own match-runtime `SprPriority`, `PalFX`, `AngleSet`/`AngleAdd`/`AngleDraw`, `AfterImage`, and `AfterImageTime` mutation/ticking, while `SpriteEffectSystem` also keeps lower-level `Trans` and helper functions and Three.js applies snapshot material, trail, and rotation changes.
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
21. `EffectActorSystem` / `RuntimeEffectActorWorld`: own the mutable per-fighter effect actor stores and keep serials, bounded lists, low-level active/presentation advance mutation, explicit visual-helper removal by id/serial, removal mutation, combat handoff, reset, summaries, and snapshot handoff out of the main match loop.
22. `TargetSystem`: own target memory, target id matching, target binding, and drop/expiry helpers.
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
37. `RuntimeRoundSystem`: own bounded round timer, KO/time-over finish state, winner/message projection, and reset semantics outside the main match loop.
38. `RuntimePausedMatchWorld`: own bounded regular pause mini-loop ordering for source `movetime`, paused command buffering, active/presentation effect advancement, target binding, stage clamp, frozen-actor presentation ticking, pause replacement interruption, and pause countdown ticking outside inline `PlayableMatchRuntime` branching.
39. `RuntimeHitPauseWorld`: own bounded global hitpause mini-loop ordering for command buffering, `ignorehitpause` controller dispatch, paused presentation advancement, and actor hitpause countdown outside inline `PlayableMatchRuntime` branching.
40. `RuntimeContactPresentationWorld`: own bounded direct HitDef and Projectile contact package metadata plus sound/spark telemetry emission outside inline `PlayableMatchRuntime` branching.
41. `MatchWorld`: keep app/tests pointed at the facade while moving tick order and actor registries behind it.
42. Combat/effect actor systems: move richer target controller effects, real helper state machines, helper-owned contact presentation, and exact projectile parity behind similarly small contracts.

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

`EnvShakeSystem` sits on the runtime side of that boundary. It converts `EnvShake` and `FallEnvShake` into bounded runtime events, records typed `fallenvshake` evidence for compiled fall-shake controllers, and resolves the camera shake vector; Three.js only applies the snapshot values. `RuntimeEnvColorWorld` follows the same boundary for `EnvColor`: it uses `EnvColorSystem` helpers to convert static `value`/`time`/`under` params into bounded stage-flash snapshots plus typed `envcolor` evidence, and Three.js only renders the overlay. Exact stage layer/window/blend parity remains future work.

`RuntimeSpriteEffectWorld` / `SpriteEffectSystem` also sit on the runtime side of that boundary. They resolve legacy visual-controller params into actor snapshot state; Three.js should render those state values without parsing CNS. Current `AngleDraw` support rotates the rendered sprite quad from bounded `renderAngle` telemetry, and current `PalFX` / `AfterImage` support exposes bounded material and trail telemetry. Exact MUGEN/IKEMEN axis pivot, collision-box rotation, draw-order interaction, palette/remap interaction, trail cadence, material math, and dynamic expression parity remain future work.

`ExplodSystem` produces effect actor snapshots from already-resolved animation, owner, typed operation, and position data, including explicit `explod` actor identity, typed `explod` operation evidence for compiled imported controllers, bounded owner-side `bindtime`, bounded `vel`/`accel` movement, bounded static render scale, bounded hit-pause advance for `ignorehitpause`, and bounded `pausemovetime`/`supermovetime` advance budgets. It does not yet implement exact binding/tick-order parity, `p2` binding, exact velocity/accel parity, exact scaling parity, exact pause layering, ownpal/remappal, remove-trigger parity, or FightFX/common animation routing.

`HelperSystem` produces effect actor snapshots from already-resolved owner/action/position data, including explicit `helper` actor identity, typed `helper` operation evidence for compiled imported controllers, bounded owner-side removal by helper id or runtime serial, and bounded `NumHelper(id)` count reads over the current owner store. When spawn data includes an owner `RuntimeProgramIr` and animation map, helpers run a bounded helper-local micro-VM before presentation advance: trigger checks over helper-local `Time`, `ctrl`, resources, metadata, and variables can run `ChangeState`, `ChangeAnim`, `DestroySelf`, helper-local kinematic controllers, `CtrlSet`, `StateTypeSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`, `VarSet`, `VarAdd`, `VarRandom`, `VarRangeSet`, and helper-local `PlaySnd` / `StopSnd` sound-event telemetry against only the helper actor. It does not yet implement redirects, key control, parent/root binding, helper combat, helper-owned projectiles/HitDefs/Explods/visual effects, exact helper-local sound timing/channel/redirect ownership, exact helper resource semantics, helper fvar/sysvar `VarRandom`, palette ownership, exact scaling/collision parity, or full pause/lifecycle parity.

`ProjectileSystem` produces effect actor snapshots and projectile hitbox projection from already-resolved owner/action/position data, including explicit `projectile` actor identity, typed `projectile` operation evidence for compiled imported controllers, bounded `projhits`/`projmisstime` state, bounded `accel` movement, bounded `velmul` velocity multiplier movement, bounded static `projscale` render scale, bounded owner-side `ModifyProjectile` mutation of live projectiles through typed `modifyprojectile` evidence, bounded `NumProj` / `NumProjID(id)` count reads over the current owner store, and bounded terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions. `ExplodSystem` likewise exposes bounded `NumExplod(id)` count reads over the current owner store for visual effect actors. `RuntimeProjectileCombatWorld` consumes those projected hitboxes plus defender/projectile boxes through `RuntimeEffectActorWorld` and applies the bounded contact/reject/HitOverride/hit-or-guard/removal loop, bounded single-target re-contact cooldown, bounded `ProjContact`/`ProjHit`/`ProjGuarded(projid)` owner trigger memory, plus bounded equal-priority trade and higher-priority `projpriority` cancel with winner-priority decrement through the shared partial combat resolver. These systems do not yet implement exact `ModifyProjectile` tick-order/selection parity, exact projectile priority classes, exact projectile count/lifetime parity, exact contact-trigger timing/lifetime, exact multi-target projectile behavior, exact terminal timing/rem-trigger parity, exact `velmul` tick-order parity, scaled collision parity, full guard-specific effects/timing, helper-owned projectile rules, or exact HitDef inheritance.

`TargetSystem` owns renderer-independent target bookkeeping plus the current simplified Target* controller and target-trigger application contract. It handles bounded target memory, target id matching, `NumTarget(id)` trigger reads, bindings, `TargetDrop` `excludeID`/`keepone` filtering with MUGEN's omitted-`keepone` default of `1`, partial `TargetBind` and `BindToTarget` binding, active target-binding position application, partial life/power/velocity/facing/bind/state effects, and delegates state-entry validation back to the match runtime. `BindToTarget` lookup, `pos/postype` parsing, `Foot`/`Mid`/`Head` size-anchor resolution, duration binding, and facing-aware position application now live in `RuntimeTargetWorld.applyBindToTargetController`; target-memory advance prunes `TargetBind` binding records whose bound actor id / target id no longer survives expiry; per-frame active `TargetBind` and `BindToTarget` position mutation now flows through `RuntimeTargetWorld.applyTargetBindings` / `applyBindToTarget` and requires matching live target memory for the bound actor id and target id before moving either actor. `PlayableMatchRuntime` supplies only character constants for `Mid`/`Head` anchors and preserves interaction ordering. The required `synthetic-imported-bindtotarget-head` and `synthetic-imported-bindtotarget-mid` traces prove those anchor paths through world-visible offset evidence. The required `synthetic-imported-custom-state` trace proves the bounded owner-backed `HitDef p2stateno -> ChangeState -> SelfState` path by requiring P2 actor frames with `customOwnerId = p1` before the final return to control. The required `synthetic-imported-target-owned-custom-state` trace proves the complementary `HitDef p2stateno` route with `p2getp1state = 0`: P2 uses defender-owned state/action `888`, has no attacker `customOwnerId`, and returns to control through its own `SelfState`. The required `synthetic-imported-targetstate-custom` trace proves the matching target-memory-driven `TargetState -> ChangeState -> SelfState` owner route with typed `target:targetstate` operation evidence. Target memory and active bindings are exposed as `ActorSnapshot.runtime.targetRefs`/`targetBindings`, `ActorSnapshot.runtime.bindToTarget`, `MatchWorld.targetLinks`, and trace `world.targetLinks` evidence. It does not yet implement full redirect semantics, multi-target teams, helper parent/root redirects, exact target persistence rules, exact bind tick order, or complete custom-state ownership beyond those bounded two-actor routes.

`CombatResolver` owns renderer-independent combat result helpers. Bounded direct `HitDef` priority clash mutation now lives in `RuntimeDirectCombatWorld`, and owner-backed `p2stateno` route evidence still goes through runtime state ownership, but the engine does not yet implement exact MUGEN/IKEMEN priority classes, guard states, fall state routing, complete custom-state ownership, reversal parity, projectile trade/cancel parity, helper combat, team rules, or exact hit timing.

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

`RuntimeAudioWorld` sits on the runtime side of that boundary. It uses `AudioEventSystem` helpers to convert legacy controllers and bounded direct `HitDef` `hitsound`/`guardsound` refs into `RuntimeSoundEvent` snapshots and leaves decoding, channel nodes, browser unlock, and playback to `MugenAudioSystem`.

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

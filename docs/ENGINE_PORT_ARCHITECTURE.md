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

`CommandBuffer` now consumes the shared command-step compiler. `MugenCharacterLoader` builds one `RuntimeProgramIr` per loaded character, stores it on the character model, passes it to compatibility reporting, and imported runtime fighters carry it into `PlayableMatchRuntime`. Runtime-created test/import definitions without a cached program compile once when `FighterMatchState` is constructed, not during controller ticks. `StateControllerExecutor` now has a native `executeControllerIr` path, with the older parsed-controller function kept as a wrapper. `StateProgramExecutor` classifies each `ControllerIr` into change-state, change-anim, shared runtime-controller, side-effect, or unsupported dispatches. `PlayableMatchRuntime` uses that dispatch layer for active-state controllers, State -1 setup/routing, and trigger evaluation. Static numeric `VelSet`/`VelAdd`/`VelMul`/`PosSet`/`PosAdd`/bounded `Gravity` controllers compile into `kinematic:*` operations, static `Width` controllers compile into `collision:width` operations, static `PlayerPush` controllers compile into `collision:playerpush` operations, static `StateTypeSet` controllers compile into `metadata:statetypeset` operations, static `Turn` controllers compile into `orientation:turn` operations, static `SprPriority` controllers compile into `sprite-effect:sprpriority` operations, static `PalFX` controllers compile into `sprite-effect:palfx` operations, static `Trans` controllers compile into `sprite-effect:trans` operations, static `AngleSet`/`AngleAdd`/`AngleDraw` controllers compile into `sprite-effect:angleset` / `sprite-effect:angleadd` / `sprite-effect:angledraw` operations, static `EnvColor` controllers compile into `envcolor` operations, static `RemapPal` controllers compile into `sprite-effect:remappal` operations, static numeric `CtrlSet`/`LifeAdd`/`LifeSet`/`PowerAdd`/`PowerSet`/`VarSet`/`VarAdd`/`VarRangeSet` controllers compile into `resource:*` / `variable:*` operations, static `HitBy`/`NotHitBy`/`HitOverride` setup compiles into `eligibility:*` / `hitoverride` operations, static `ReversalDef` setup compiles into `reversaldef` operations, and static `AttackMulSet`/`DefenceMulSet` compile into `damage-scale:*` operations, while dynamic params keep raw expression fallback. `PauseSystem` owns partial `Pause`/`SuperPause` controller semantics, consumes typed `pause:*` operations when compiled, produces freeze snapshots, handles `movetime`, `darken`, `poweradd` deltas, and ticks pause frames deterministically; `RuntimeTraceGate` can now require those `matchPause` snapshots by actor/state/darken/remaining/movetime and require actor/effect advance or freeze evidence by id/kind/owner, so typed pause operation evidence is tied to an actual match freeze and the bounded SuperPause+Projectile route proves effect actors can be checked for source-movetime advance plus later freeze. `AudioEventSystem` owns partial `PlaySnd`/`StopSnd` controller-to-event translation and bounded event history before the Web Audio adapter consumes snapshots. `EnvShakeSystem` owns partial `EnvShake`/`FallEnvShake` event creation and deterministic camera-shake snapshots before Three.js applies presentation; compiled `FallEnvShake` controllers now emit typed operation evidence when they consume stored fall-shake metadata. `EnvColorSystem` owns partial `EnvColor` event creation and bounded stage-flash snapshot math before Three.js applies presentation; typed `envcolor` operation evidence is tied to stage-frame color/opacity gates. `StateControllerExecutor` consumes typed `hitfall:*`, `kinematic:*`, `collision:playerpush`, `metadata:*`, `orientation:*`, `sprite-effect:trans`, `sprite-effect:remappal`, `sprite-effect:angleset` / `sprite-effect:angleadd` / `sprite-effect:angledraw`, `resource:*`, `variable:*`, `eligibility:*`, `hitoverride`, and `damage-scale:*` data for the current partial runtime-controller families; `PlayableMatchRuntime` consumes typed `reversaldef`, `collision:width`, `sprite-effect:sprpriority`, `sprite-effect:palfx`, `sprite-effect:angleset` / `sprite-effect:angleadd` / `sprite-effect:angledraw`, and `envcolor` side-effect data and preserves raw fallback for dynamic reversal/width/sprite-effect/stage-flash params. `SpriteEffectSystem` owns partial `SprPriority`, `PalFX`, `Trans`, `AngleSet`/`AngleAdd`/`AngleDraw`, `AfterImage`, and `AfterImageTime` parsing/ticking before Three.js applies material ordering, tinting, opacity, sprite-quad rotation, and ghost trails. `ExplodSystem` owns the first extracted effect actor lifecycle: typed `explod` operation consumption when compiled, typed `removeexplod` operation consumption, fallback raw-param spawn/removal from already-resolved AIR actions, bounded owner-side `bindtime`, bounded `vel`/`accel` movement, bounded static scale projection, animation advance, actor identity metadata, bounded `NumExplod(id)` count reads, and renderer snapshots. `HelperSystem` owns the current partial visual Helper actor lifecycle: typed `helper` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, animation advance, bounded removal, actor identity metadata, bounded `NumHelper(id)` count reads, and renderer snapshots. `ProjectileSystem` owns the current partial Projectile actor lifecycle: typed `projectile` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, guard metadata, bounded `projhits`/`projmisstime`, bounded terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions, velocity advance, hitbox projection, bounded removal, actor identity metadata, bounded `NumProj` / `NumProjID(id)` count reads, and renderer snapshots. `ProjectileCombatSystem` owns the bounded projectile contact/reject/HitOverride/hit-or-guard/removal loop, bounded multi-hit re-contact cooldown, bounded owner contact-trigger memory for `ProjContact`/`ProjHit`/`ProjGuarded(projid)`, plus bounded `projpriority` equal-priority trade and higher-priority cancel/decrement through `RuntimeEffectActorWorld`; removal events report the selected terminal-animation metadata and actor-frame trace gates prove terminal playback where actions exist, while exact priority classes, exact contact-trigger timing/lifetime, multi-target projectile behavior, exact terminal timing, full guard effects, pause layering, and tick parity remain future work. `EffectActorSystem` now wraps those three actor families in one mutable store for serial allocation, bounded lists, count reads, advance/removal mutation, hit-removal pruning, snapshot handoff, read-only store summaries, and the projectile-combat handoff; `RuntimeEffectActorWorld` is the world-style contract for those stores, active-effect advance, presentation-effect advance, combat handoff, and reset, and `MatchWorld` creates/injects it into `PlayableMatchRuntime`. `RuntimeTraceGate` actor-frame evidence records observed min/max position, velocity, scale, body width, body-push state, sprite priority, palette/material/opacity/remap/angle telemetry, facing, and state metadata, while stage-frame evidence records camera/bounds plus `EnvColor` color/opacity telemetry, so effect-motion/scale, collision-body/push, sprite-ordering/material/opacity/rotation, palette-remap, stage-flash, orientation, and metadata gates can be checked without renderer coupling. `FighterMatchState` no longer stores the raw effect actor store. `TargetSystem` owns the current partial target-memory, target-binding lifecycle, and simplified Target* controller application contract. `CombatResolver` owns the current partial runtime combat decision helpers used by direct attacks and bounded projectile combat: facing-aware box projection, overlap tests, `HitBy`/`NotHitBy` eligibility, `HitOverride` lookup, simplified guard detection, typed attack/defense damage scaling, and hit/guard damage result math. Broader combat controllers still receive parsed controller params through `controller.source` until their typed operations are split into dedicated systems.

`synthetic-imported-hitadd.json` adds the current contact-memory controller contract: static `HitAdd value` compiles into `contact:hitadd`, `PlayableMatchRuntime` applies it only to bounded current-state direct `HitCount` telemetry, and `UniqHitCount` remains target uniqueness. This keeps combo/count approximation explicit instead of folding it into hidden combat math.

`ContactMemorySystem` now owns the bounded contact-memory data structure and mutations behind those direct/projectile trigger cuts: direct `MoveContact`/`MoveHit`/`MoveGuarded`, direct `HitCount`/`UniqHitCount`, `HitAdd`, `MoveReversed`, defender-local `ReceivedDamage`/`ReceivedHits`, and projectile contact/time markers. `PlayableMatchRuntime` still decides when combat events occur and passes the current state number into that system, so this is an ownership cleanup, not a claim of exact contact/combo lifetime parity. `RuntimeResourceSystem` now owns the bounded resource and variable writes used by `StateControllerExecutor`: `CtrlSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`, `VarSet`, `VarAdd`, and `VarRangeSet`, including sysvar assignment support. `StateControllerExecutor` still resolves params, expressions, and dynamic fallback, so this does not claim exact variable scope, parent/root redirects, or full CNS VM parity.

`RuntimeStunSystem` owns the bounded hitstun/guardstun timer update used by the playable match loop: input-lock checks, guardstun decay, guarding flag maintenance, hit/guard horizontal friction, and hitstun decay. `PlayableMatchRuntime` still maps those timer results to current presentation actions and imported-state preservation, so this is a system boundary for current behavior, not exact MUGEN/IKEMEN hitpause, guard recovery, or Common1 tick-order parity.

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
  EnvColorSystem
  SpriteEffectSystem
  EffectActorSystem
  ExplodSystem
  HelperSystem
  ProjectileSystem
  ProjectileCombatSystem
  TargetSystem
  CombatResolver
  PauseSystem
  CommandSystem
```

`MatchWorld` now exists as the public match boundary and delegates to `PlayableMatchRuntime` for behavior preservation. Current `PlayableMatchRuntime` is still allowed to be the integration point behind that facade, but new broad behavior should move toward typed subsystems behind `MatchWorld`.

The actor-registry cut is still derived from `MugenSnapshot`, but `MatchWorld` now keeps a lightweight lifecycle tracker for spawned, active, and removed actor/effect ids plus per-tick lifecycle events while preserving the existing behavior checksum. `MatchWorld.getActorRegistry()` indexes player and effect actors by id, kind, owner, root, parent, lifecycle, `eventsThisTick`, bounded `recentEvents`, target-memory `targetLinks` including active `TargetBind` and owner-side `BindToTarget` bindings, and read-only `RuntimeEffectActorWorld` `effectStores`. `RuntimeTraceArtifact` frame summaries can carry `world.lifecycle`, `world.targetLinks`, and `world.effectStores` evidence, and `RuntimeTraceGate` can require specific world lifecycle events such as projectile spawn/remove by kind, owner, root, parent, layer, or id plus effect-store evidence such as owner family counts and serial progression. This gives Runtime Debug Studio and trace evidence a stable world-facing read model over the current `TargetSystem` and `EffectActorSystem` stores before helpers, projectiles, explods, targets, and combat side effects are fully migrated behind the facade.

Every `ActorSnapshot` now carries `actorKind`, `ownerId`, `rootId`, and `parentId` for players and current effect actors. `spriteOwnerId` remains separate so custom-state and `ChangeAnim2` rendering can borrow another character's AIR/SFF without losing the logical runtime owner.

The current extraction order is:

1. `StateProgramExecutor`: classify compiled CNS controllers.
2. `PauseSystem`: own match-freeze semantics outside the match runtime.
3. `AudioEventSystem`: own sound controller events outside the match runtime, while `MugenAudioSystem` stays the browser adapter.
4. `EnvShakeSystem`: own camera-shake events and snapshot math outside the match runtime, while Three.js stays the renderer.
5. `EnvColorSystem`: own stage-flash events and snapshot math outside the match runtime, while Three.js applies the bounded overlay.
6. `SpriteEffectSystem`: own `SprPriority`, `PalFX`, `Trans`, `AngleSet`/`AngleAdd`/`AngleDraw`, `AfterImage`, and `AfterImageTime` parsing/ticking, while Three.js applies snapshot material and rotation changes.
6. `ExplodSystem`: own non-colliding effect actor lifecycle and snapshots.
7. `HelperSystem`: own the current visual helper actor lifecycle and snapshots.
8. `ProjectileSystem`: own the current colliding projectile lifecycle, hitbox projection, bounded hit-count/cooldown state, and snapshots.
9. `ProjectileCombatSystem`: own the bounded projectile contact/reject/override/damage/removal loop, multi-hit cooldown, and projectile clash/cancel subset through the effect-actor world contract.
10. `EffectActorSystem` / `RuntimeEffectActorWorld`: own the mutable per-fighter effect actor stores and keep serials, bounded lists, active/presentation advance passes, removal mutation, combat handoff, reset, summaries, and snapshot handoff out of the main match loop.
11. `TargetSystem`: own target memory, target id matching, target binding, and drop/expiry helpers.
12. `CombatResolver`: own current partial contact, eligibility, override, guard, and damage-result helpers outside the match loop.
13. `MatchWorld`: keep app/tests pointed at the facade while moving tick order and actor registries behind it.
14. Combat/effect actor systems: move `HitDef`, richer target controller effects, real helper state machines, and exact projectile parity behind similarly small contracts.

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

`EnvShakeSystem` sits on the runtime side of that boundary. It converts `EnvShake` and `FallEnvShake` into bounded runtime events, records typed `fallenvshake` evidence for compiled fall-shake controllers, and resolves the camera shake vector; Three.js only applies the snapshot values. `EnvColorSystem` follows the same boundary for `EnvColor`: it converts static `value`/`time`/`under` params into bounded stage-flash snapshots plus typed `envcolor` evidence, and Three.js only renders the overlay. Exact stage layer/window/blend parity remains future work.

`SpriteEffectSystem` also sits on the runtime side of that boundary. It resolves legacy visual-controller params into actor snapshot state; Three.js should render those state values without parsing CNS. Current `AngleDraw` support rotates the rendered sprite quad from bounded `renderAngle` telemetry; exact MUGEN/IKEMEN axis pivot, collision-box rotation, draw-order interaction, and dynamic expression parity remain future work.

`ExplodSystem` produces effect actor snapshots from already-resolved animation, owner, typed operation, and position data, including explicit `explod` actor identity, typed `explod` operation evidence for compiled imported controllers, bounded owner-side `bindtime`, bounded `vel`/`accel` movement, bounded static render scale, bounded hit-pause advance for `ignorehitpause`, and bounded `pausemovetime`/`supermovetime` advance budgets. It does not yet implement exact binding/tick-order parity, `p2` binding, exact velocity/accel parity, exact scaling parity, exact pause layering, ownpal/remappal, remove-trigger parity, or FightFX/common animation routing.

`HelperSystem` produces effect actor snapshots from already-resolved owner/action/position data, including explicit `helper` actor identity, typed `helper` operation evidence for compiled imported controllers, and bounded `NumHelper(id)` count reads over the current owner store. It does not yet implement helper state machines, redirects, key control, parent/root binding, helper combat, `DestroySelf`, palette ownership, scaling, or pause parity.

`ProjectileSystem` produces effect actor snapshots and projectile hitbox projection from already-resolved owner/action/position data, including explicit `projectile` actor identity, typed `projectile` operation evidence for compiled imported controllers, bounded `projhits`/`projmisstime` state, bounded `accel` movement, bounded `velmul` velocity multiplier movement, bounded static `projscale` render scale, bounded owner-side `ModifyProjectile` mutation of live projectiles through typed `modifyprojectile` evidence, bounded `NumProj` / `NumProjID(id)` count reads over the current owner store, and bounded terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions. `ExplodSystem` likewise exposes bounded `NumExplod(id)` count reads over the current owner store for visual effect actors. `ProjectileCombatSystem` consumes those projected hitboxes plus defender/projectile boxes through `RuntimeEffectActorWorld` and applies the bounded contact/reject/HitOverride/hit-or-guard/removal loop, bounded single-target re-contact cooldown, bounded `ProjContact`/`ProjHit`/`ProjGuarded(projid)` owner trigger memory, plus bounded equal-priority trade and higher-priority `projpriority` cancel with winner-priority decrement through the shared partial combat resolver. These systems do not yet implement exact `ModifyProjectile` tick-order/selection parity, exact projectile priority classes, exact projectile count/lifetime parity, exact contact-trigger timing/lifetime, exact multi-target projectile behavior, exact terminal timing/rem-trigger parity, exact `velmul` tick-order parity, scaled collision parity, full guard-specific effects/timing, helper-owned projectile rules, or exact HitDef inheritance.

`TargetSystem` owns renderer-independent target bookkeeping plus the current simplified Target* controller and target-trigger application contract. It handles bounded target memory, target id matching, `NumTarget(id)` trigger reads, bindings, `TargetDrop` `excludeID`/`keepone` filtering with MUGEN's omitted-`keepone` default of `1`, partial `TargetBind` and `BindToTarget` binding, partial life/power/velocity/facing/bind/state effects, and delegates state-entry validation back to the match runtime. `BindToTarget` supports static `Foot`, `Mid`, and `Head` postypes, with `Mid`/`Head` resolved from parsed target `[Size]` anchors when present; the required `synthetic-imported-bindtotarget-head` and `synthetic-imported-bindtotarget-mid` traces prove those anchor paths through world-visible offset evidence. The required `synthetic-imported-custom-state` trace proves the bounded owner-backed `HitDef p2stateno -> ChangeState -> SelfState` path by requiring P2 actor frames with `customOwnerId = p1` before the final return to control. The required `synthetic-imported-targetstate-custom` trace proves the matching target-memory-driven `TargetState -> ChangeState -> SelfState` owner route with typed `target:targetstate` operation evidence. Target memory and active bindings are exposed as `ActorSnapshot.runtime.targetRefs`/`targetBindings`, `ActorSnapshot.runtime.bindToTarget`, `MatchWorld.targetLinks`, and trace `world.targetLinks` evidence. It does not yet implement full redirect semantics, multi-target teams, helper parent/root redirects, exact target persistence rules, exact bind tick order, or complete custom-state ownership beyond those bounded two-actor routes.

`CombatResolver` owns renderer-independent combat result helpers. It now has a bounded direct `HitDef` priority clash path and a trace-gated owner-backed `p2stateno` route through runtime state ownership, but it does not yet implement exact MUGEN/IKEMEN priority classes, guard states, fall state routing, complete custom-state ownership, reversal parity, projectile trade/cancel parity, helper combat, team rules, or exact hit timing.

### Audio Adapter

Web Audio owns:

- Browser unlock.
- WAV decoding.
- Channel bookkeeping.
- Runtime sound event playback.

The runtime emits sound events; it does not own browser audio nodes.

`AudioEventSystem` sits on the runtime side of that boundary. It converts legacy controllers into `RuntimeSoundEvent` snapshots and leaves decoding, channel nodes, browser unlock, and playback to `MugenAudioSystem`.

### Debug And QA Plane

The DOM app owns:

- File loading controls.
- Runtime/Inspector switching.
- State, command, animation, compatibility, and console panels.
- JSON export.
- `window.__MUGEN_WEB_SANDBOX__` QA bridge.

The QA bridge is part of the architecture because browser verification is required for frontend/rendering changes.

`RuntimeTrace` is the runtime-side evidence seam before the Studio evidence browser exists. It runs scripted input frames against a runtime instance, records compact actor/effect identity/round/compatibility summaries, captures `MatchWorld` lifecycle metadata, effect-store summaries, target links, and lifecycle events when the runner exposes a registry, extracts new runtime log events, and produces deterministic frame/final checksums. `evaluateRuntimeTraceGate` evaluates those traces against explicit imported/runtime requirements such as actor source, routed state, executed controller, active command, hit/guard event presence, match-pause snapshot presence, match-pause actor/effect advance and freeze evidence, world lifecycle event presence, effect-store ownership/count evidence, target-link ownership/binding, actor-frame/final-actor `customOwnerId`, actor-frame body-width/body-push/facing evidence, actor-frame state metadata evidence, and final actor state/control constraints. `RuntimeTraceArtifact` is the current export envelope for that evidence: `runtime-trace-artifact/v0` JSON with trace checksums, compact per-frame summaries, world lifecycle summaries, effect stores, target links, per-frame lifecycle events, final actor/effect summaries, events, script frames, gate requirements, gate evidence, and gate results. It is renderer-independent and now feeds a basic Studio frame scrubber; it should become the basis for KFM replay gates, controller-order regression tests, and deeper trace-diff UI.

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

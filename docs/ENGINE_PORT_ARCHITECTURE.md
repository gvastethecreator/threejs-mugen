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

`CommandBuffer` now consumes the shared command-step compiler. `MugenCharacterLoader` builds one `RuntimeProgramIr` per loaded character, stores it on the character model, passes it to compatibility reporting, and imported runtime fighters carry it into `PlayableMatchRuntime`. Runtime-created test/import definitions without a cached program compile once when `FighterMatchState` is constructed, not during controller ticks. `StateControllerExecutor` now has a native `executeControllerIr` path, with the older parsed-controller function kept as a wrapper. `StateProgramExecutor` classifies each `ControllerIr` into change-state, change-anim, shared runtime-controller, side-effect, or unsupported dispatches. `PlayableMatchRuntime` uses that dispatch layer for active-state controllers, State -1 setup/routing, and trigger evaluation. `PauseSystem` owns partial `Pause`/`SuperPause` controller semantics, consumes typed `pause:*` operations when compiled, produces freeze snapshots, handles `movetime`, `darken`, `poweradd` deltas, and ticks pause frames deterministically; `RuntimeTraceGate` can now require those `matchPause` snapshots by actor/state/darken/remaining/movetime and require actor/effect advance or freeze evidence by id/kind/owner, so typed pause operation evidence is tied to an actual match freeze and the bounded SuperPause+Projectile route proves effect actors can be checked for source-movetime advance plus later freeze. `AudioEventSystem` owns partial `PlaySnd`/`StopSnd` controller-to-event translation and bounded event history before the Web Audio adapter consumes snapshots. `EnvShakeSystem` owns partial `EnvShake`/`FallEnvShake` event creation and deterministic camera-shake snapshots before Three.js applies presentation; compiled `FallEnvShake` controllers now emit typed operation evidence when they consume stored fall-shake metadata. `StateControllerExecutor` consumes typed `hitfall:*` data for the current partial get-hit/fall controllers. `SpriteEffectSystem` owns partial `SprPriority`, `PalFX`, `AfterImage`, and `AfterImageTime` parsing/ticking before Three.js applies material ordering, tinting, opacity, and ghost trails. `ExplodSystem` owns the first extracted effect actor lifecycle: typed `explod` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, animation advance, removal, actor identity metadata, and renderer snapshots. `HelperSystem` owns the current partial visual Helper actor lifecycle: typed `helper` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, animation advance, bounded removal, actor identity metadata, and renderer snapshots. `ProjectileSystem` owns the current partial Projectile actor lifecycle: typed `projectile` operation consumption when compiled, fallback raw-param spawn from already-resolved AIR actions, guard metadata, velocity advance, hitbox projection, bounded removal, actor identity metadata, and renderer snapshots. `ProjectileCombatSystem` owns the bounded projectile contact/reject/HitOverride/hit-or-guard/removal loop plus bounded `projpriority` projectile-vs-projectile clash through `RuntimeEffectActorWorld`, while exact priority classes, cancel/remove animations, full guard effects, pause layering, and tick parity remain future work. `EffectActorSystem` now wraps those three actor families in one mutable store for serial allocation, bounded lists, advance/removal mutation, hit-removal pruning, snapshot handoff, read-only store summaries, and the projectile-combat handoff; `RuntimeEffectActorWorld` is the world-style contract for those stores, active-effect advance, presentation-effect advance, combat handoff, and reset, and `MatchWorld` creates/injects it into `PlayableMatchRuntime`. `FighterMatchState` no longer stores the raw effect actor store. `TargetSystem` owns the current partial target-memory, target-binding lifecycle, and simplified Target* controller application contract. `CombatResolver` owns the current partial runtime combat decision helpers used by direct attacks and bounded projectile combat: facing-aware box projection, overlap tests, `HitBy`/`NotHitBy` eligibility, `HitOverride` lookup, simplified guard detection, and hit/guard damage result math. Broader combat controllers still receive parsed controller params through `controller.source` until their typed operations are split into dedicated systems.

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

The actor-registry cut is still derived from `MugenSnapshot`, but `MatchWorld` now keeps a lightweight lifecycle tracker for spawned, active, and removed actor/effect ids plus per-tick lifecycle events while preserving the existing behavior checksum. `MatchWorld.getActorRegistry()` indexes player and effect actors by id, kind, owner, root, parent, lifecycle, `eventsThisTick`, bounded `recentEvents`, target-memory `targetLinks`, and read-only `RuntimeEffectActorWorld` `effectStores`. `RuntimeTraceArtifact` frame summaries can carry `world.lifecycle`, `world.targetLinks`, and `world.effectStores` evidence, and `RuntimeTraceGate` can require specific world lifecycle events such as projectile spawn/remove by kind, owner, root, parent, layer, or id plus effect-store evidence such as owner family counts and serial progression. This gives Runtime Debug Studio and trace evidence a stable world-facing read model over the current `TargetSystem` and `EffectActorSystem` stores before helpers, projectiles, explods, targets, and combat side effects are fully migrated behind the facade.

Every `ActorSnapshot` now carries `actorKind`, `ownerId`, `rootId`, and `parentId` for players and current effect actors. `spriteOwnerId` remains separate so custom-state and `ChangeAnim2` rendering can borrow another character's AIR/SFF without losing the logical runtime owner.

The current extraction order is:

1. `StateProgramExecutor`: classify compiled CNS controllers.
2. `PauseSystem`: own match-freeze semantics outside the match runtime.
3. `AudioEventSystem`: own sound controller events outside the match runtime, while `MugenAudioSystem` stays the browser adapter.
4. `EnvShakeSystem`: own camera-shake events and snapshot math outside the match runtime, while Three.js stays the renderer.
5. `SpriteEffectSystem`: own `SprPriority`, `PalFX`, `AfterImage`, and `AfterImageTime` parsing/ticking, while Three.js applies snapshot material changes.
6. `ExplodSystem`: own non-colliding effect actor lifecycle and snapshots.
7. `HelperSystem`: own the current visual helper actor lifecycle and snapshots.
8. `ProjectileSystem`: own the current colliding projectile lifecycle, hitbox projection, and snapshots.
9. `ProjectileCombatSystem`: own the bounded projectile contact/reject/override/damage/removal loop through the effect-actor world contract.
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

`EnvShakeSystem` sits on the runtime side of that boundary. It converts `EnvShake` and `FallEnvShake` into bounded runtime events, records typed `fallenvshake` evidence for compiled fall-shake controllers, and resolves the camera shake vector; Three.js only applies the snapshot values.

`SpriteEffectSystem` also sits on the runtime side of that boundary. It resolves legacy visual-controller params into actor snapshot state; Three.js should render those state values without parsing CNS.

`ExplodSystem` produces effect actor snapshots from already-resolved animation, owner, typed operation, and position data, including explicit `explod` actor identity and typed `explod` operation evidence for compiled imported controllers. It does not yet implement binding, velocity, scaling, ownpal/remappal, remove-trigger parity, or FightFX/common animation routing.

`HelperSystem` produces effect actor snapshots from already-resolved owner/action/position data, including explicit `helper` actor identity and typed `helper` operation evidence for compiled imported controllers. It does not yet implement helper state machines, redirects, key control, parent/root binding, helper combat, `DestroySelf`, palette ownership, scaling, or pause parity.

`ProjectileSystem` produces effect actor snapshots and projectile hitbox projection from already-resolved owner/action/position data, including explicit `projectile` actor identity and typed `projectile` operation evidence for compiled imported controllers. `ProjectileCombatSystem` consumes those projected hitboxes plus defender/projectile boxes through `RuntimeEffectActorWorld` and applies the bounded contact/reject/HitOverride/hit-or-guard/removal loop plus bounded equal/greater `projpriority` projectile clash through the shared partial combat resolver. These systems do not yet implement `ModifyProjectile`, exact projectile priority classes, cancel/remove animations, acceleration, scaling, full guard-specific effects/timing, helper-owned projectile rules, or exact HitDef inheritance.

`TargetSystem` owns renderer-independent target bookkeeping plus the current simplified Target* controller application contract. It handles bounded target memory, bindings, `TargetDrop`, partial life/power/velocity/facing/bind/state effects, and delegates state-entry validation back to the match runtime. Target memory and active bindings are exposed as `ActorSnapshot.runtime.targetRefs`/`targetBindings`, `MatchWorld.targetLinks`, and trace `world.targetLinks` evidence. It does not yet implement full redirect semantics, multi-target teams, helper parent/root redirects, exact target persistence rules, or full custom-state ownership.

`CombatResolver` owns renderer-independent combat result helpers. It does not yet implement full HitDef priority, guard states, fall state routing, custom-state ownership, reversal parity, projectile trade/cancel, helper combat, team rules, or exact MUGEN/IKEMEN hit timing.

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

`RuntimeTrace` is the runtime-side evidence seam before the Studio evidence browser exists. It runs scripted input frames against a runtime instance, records compact actor/effect identity/round/compatibility summaries, captures `MatchWorld` lifecycle metadata, effect-store summaries, target links, and lifecycle events when the runner exposes a registry, extracts new runtime log events, and produces deterministic frame/final checksums. `evaluateRuntimeTraceGate` evaluates those traces against explicit imported/runtime requirements such as actor source, routed state, executed controller, active command, hit/guard event presence, match-pause snapshot presence, match-pause actor/effect advance and freeze evidence, world lifecycle event presence, effect-store ownership/count evidence, target-link ownership/binding, and final actor state/control constraints. `RuntimeTraceArtifact` is the current export envelope for that evidence: `runtime-trace-artifact/v0` JSON with trace checksums, compact per-frame summaries, world lifecycle summaries, effect stores, target links, per-frame lifecycle events, final actor/effect summaries, events, script frames, gate requirements, gate evidence, and gate results. It is renderer-independent and now feeds a basic Studio frame scrubber; it should become the basis for KFM replay gates, controller-order regression tests, and deeper trace-diff UI.

### Creator Studio Plane

The future studio plane owns:

- Project manifests.
- Asset library views.
- Character and stage editors.
- Module-specific configuration surfaces.
- Playtest launch presets.
- Export/build actions.

This plane should call engine/project services rather than reaching directly into Three.js scene objects or raw MUGEN parser internals.

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

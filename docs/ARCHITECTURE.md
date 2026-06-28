# Architecture

This file describes the current implementation boundaries. The larger port direction is documented in:

- `docs/PORTING_ROADMAP.md`
- `docs/ENGINE_PORT_ARCHITECTURE.md`
- `docs/MVP_DEFINITION.md`
- `docs/QA_AND_ACCEPTANCE_GATES.md`

`mugen/*` is renderer-independent. It owns loaders, parsers, normalized models, stage definitions, runtime snapshots, command buffering, and compatibility diagnostics. Three.js types must not appear in this layer.

`game/*` is the browser adapter. It consumes `MugenSnapshot` data and projects MUGEN 2D coordinates into a Three.js orthographic scene. Sprite textures are cached by `group,index`; collision boxes are translucent plane geometry, not WebGL line width. Audio stays in the same adapter layer: `MugenAudioSystem` observes runtime `PlaySnd`/`StopSnd` events and decodes loaded SND WAV payloads through Web Audio after browser unlock.

`app/*` is the DOM control plane. It loads local files, switches inspector tabs, dispatches runtime commands, renders debug panels, and owns the browser-local Studio project manifest flow. The Studio shell is split into URL-addressable Workbench, Assets, Inspector, Debug, Evidence, Modules, and Build surfaces. Workbench/Assets/Debug/Evidence/Modules/Build feed the Three.js adapter with the match runtime snapshot; Studio Inspector feeds it with the existing AIR inspector runtime snapshot. The UI never owns animation timing or collision rules.

`app/ProjectCompiler.ts` is the current editor-to-runtime bridge. It compiles the Studio `project.json` contract into `runtime-manifest/v0` without importing Three.js objects or mutable scene state.

## Data Flow

```txt
ZIP/folder
  -> VirtualFileSystem
  -> DEF path resolution
  -> parsers (DEF/AIR/CMD/CNS/SFF metadata)
  -> MugenCharacter + CompatibilityReport
  -> MugenRuntime snapshot
  -> ThreeMugenRenderer + DOM inspector
```

Playable runtime uses the same render snapshot shape:

```txt
DemoFighterDefinition + MugenStageDefinition
  -> MatchWorld facade
  -> PlayableMatchRuntime integration loop
  -> MugenSnapshot with P1/P2 actors, hitboxes, hurtboxes, life, power, round state, camera
  -> ThreeMugenRenderer + Runtime Debugger
```

Loaded MUGEN characters can also enter that path through a bounded adapter:

```txt
MugenCharacter AIR + decoded SFF
  -> createImportedFighterDefinition
  -> MatchWorld / PlayableMatchRuntime with CMD State -1 routing and fallback standard action mapping
  -> MugenSnapshot using real imported sprite groups
```

Imported MUGEN stages use the same stage contract:

```txt
Stage DEF
  -> MugenStageLoader + StageDefParser
  -> MugenStageDefinition
  -> MatchWorld / PlayableMatchRuntime stage bounds/camera/starts
  -> stageProjection + AxisRenderer static/tiled/action-backed BG sprite adapter plus bounded BGCtrl executor when stage SFF is decoded
  -> StageCompatibilityReport for UI/export coverage
```

## Key Boundaries

- `VirtualFileSystem` normalizes paths to POSIX-style virtual paths and resolves case-insensitively.
- Text parsers preserve raw lines and emit diagnostics instead of throwing on unsupported syntax.
- `MugenRuntime` is a deterministic inspector runtime for AIR playback.
- `MatchWorld` is the public match runtime boundary used by the app. It currently delegates to `PlayableMatchRuntime` so behavior remains stable while systems move behind the facade. It owns the first actor registry read model for players/effects, including `spawn`/`active`/`remove` lifecycle events used by Debug Studio, trace artifacts, and QA bridge diagnostics. Target refs, TargetBind bindings, and owner-side `BindToTarget` registry data are read through `RuntimeTargetWorld.snapshotRuntimeState` instead of ad hoc registry cloning.
- `PlayableMatchRuntime` is the current MUGEN-like fight loop: two actors, stage bounds, keyboard/touch input, CPU pressure, jump/crouch/walk, attacks, hit pause, partial match `Pause`/`SuperPause`, hit stun, damage, power gain, speed control, and round reset dispatch. `RuntimeRoundSystem` owns the bounded round timer, KO/time-over finish state, winner/message projection, and reset state used by snapshots; `RuntimeTraceGate.requiredRoundFrames` can now make bounded KO/time-over winner/message evidence a required trace condition, and `PlayableMatchRuntimeOptions.roundTimerFrames` gives QA short deterministic timer fixtures without changing default match length. `RuntimePauseWorld` owns the current partial match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset state used by `MugenSnapshot.matchPause`. `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic multi-actor camera-shake projection used by stage camera snapshots while actor event histories remain available to renderer/debug/trace consumers. `RuntimeAudioWorld` owns bounded `PlaySnd`/`StopSnd` event insertion, and direct `HitDef` results can now emit bounded `hitsound`/`guardsound` telemetry into the same actor sound-event history; exact SND playback, FightFX/common sound fallback, channel priority, and timing/mixing parity remain blocked. `RuntimeHitEffectWorld` owns bounded direct `HitDef` `sparkno`/`guard.sparkno`/`sparkxy` event insertion into actor hit-effect history; exact FightFX/common sprite lookup, visual binding, render timing, layering, scale, palette, and full spark parity remain blocked. `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset while stage snapshots remain renderer-independent. `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking while actor presentation telemetry remains snapshot-driven for Three.js/debug/trace consumers. `RuntimeActorConstraintWorld` owns bounded `Width`, one-frame actor constraints, stage clamping, and player body-push separation while actor body/bounds telemetry remains snapshot-driven. `RuntimeDirectCombatWorld` owns bounded same-tick direct `HitDef` priority win/trade mutation and direct hit/guard result mutation for life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup while Common1/custom-state transitions remain integrated by `PlayableMatchRuntime`. `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and direct/projectile redirect mutation while state-entry validation remains an integration hook. `RuntimeReversalWorld` owns bounded ReversalDef activation, active-counter detection, and direct counter-result mutation while state-entry and target-state routing remain integration hooks. Effect actor lists for the current partial `Explod`, `Helper`, and `Projectile` support now mutate through `EffectActorSystem` instead of three loose arrays in the match loop. `RuntimeProjectileCombatWorld` owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation and projectile clash trade/cancel/decrement mutation. `RuntimeEffectActorWorld` wraps those stores behind a world-style contract with active/presentation advance passes, projectile-combat handoff, bounded `projhits`/`projmisstime` multi-hit cooldown, bounded `projpriority` projectile-vs-projectile equal-priority trade plus higher-priority cancel with winner-priority decrement, bounded projectile terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions, state-local direct/projectile contact-trigger memory for `MoveHit`/`MoveGuarded` and `ProjHit(projid)`-style triggers, and read-only summaries that `MatchWorld` consumes as actor-registry `effectStores`.
- `createImportedFighterDefinition` maps a decoded local character into the playable loop only when AIR actions and SFF sprites are available. It attaches parsed CMD `[State -1]` entries, statedefs, commands, and HitDef-derived move data, including a narrow attr/guard-damage/guard-stun path, so the match runtime can route simple imported attacks. Partial `HitBy`/`NotHitBy`, `HitOverride`, `ReversalDef`, `AttackMulSet`/`DefenceMulSet`, `HitDef p1stateno`/`p2stateno`, and target-memory controllers affect hit eligibility, counters, damage scaling, simple state ownership, and recent target side effects. `TargetState` can route a recent target into the controller owner's known state data. `p2stateno` can enter a known attacker-owned state, keep that owner through chained `ChangeState`, clear ownership through `SelfState`, or use the target's own known state data when `p2getp1state = 0`. Runtime snapshots now expose `actorKind`, `ownerId`, `rootId`, and `parentId` for players/effects, plus separate `spriteOwnerId`/`spriteOwnerDefinitionId` for owner-backed animation rendering. `ChangeAnim2` in an owned state resolves the owner AIR action before rendering. Complex CNS/custom-state ownership remains outside the current executable subset.
- `MugenSnapshot.matchPause` exposes the `RuntimePauseWorld` snapshot for HUD/debug/Three.js rendering. `MugenSnapshot.compatibilitySession` records imported states and supported controllers that actually executed in the current Runtime Mode session. It is intentionally separate from the immutable `MugenCharacter.compatibility` report.
- `MugenStageDefinition` models native demo stages, the Training Grid fallback, and imported stage `.def` output with floor, bounds, camera, starts, simple layers, optional native image assets, embedded stage actions, layer `id` control targets, and parsed `BGCtrlDef`/`BGCtrl` groups. Imported stages preserve BG section/type, sprite/action metadata, parallax inputs, tiling inputs, and controller timing/params in the model; decoded stage SFF archives stay in `MugenStagePackage` and are registered with the Three.js render adapter so snapshots do not own canvas/texture state. `stageProjection.ts` handles the current bounded tiling, simple parallax math, and bounded BGCtrl layer resolution as pure adapter helpers.
- `StageCompatibilityReport` summarizes stage file presence, SFF decode coverage, static/animated BG sprite coverage, tiled layers, bounded BGCtrl coverage, fallback counts, warnings, and unsupported stage features. It exposes per-layer BG IR that classifies each imported BG layer as `rendered`, `animated`, `fallback`, `missing`, or `unsupported` with source section, control id, sprite/action coverage, unsupported feature notes, and fallback reason. It also exposes BGCtrl rows with bounded/unsupported type status and target layer labels, while clearly reporting that exact BGCtrl parity remains partial. It is exported alongside character compatibility without pretending stage support is part of the character report.
- `SpriteProvider` hides SFF/atlas details. `MockSpriteProvider` keeps the app playable without character art; `AtlasSpriteProvider` consumes `sprite-atlas-builder`-compatible output from `manifest.json.frame_layout`; `SffSpriteProvider` exposes decoded SFF v1/PCX and SFF v2 RAW/RLE8/RLE5/LZ5 sprites for Inspector Mode; `CompositeSpriteProvider` routes Nova Boxer, Mira Volt, Rook Apprentice, the currently loaded character SFF range, and owner-specific runtime lookups while preserving fallbacks.
- Local atlas characters also load `qa/motion-variation-report.json` in `App.ts`. That report is renderer-adjacent metadata, not runtime animation state; it drives roster/HUD `walk QA` badges and Playwright diagnostics.
- `window.__MUGEN_WEB_SANDBOX__` is a QA bridge only. It exposes the current mode, active Studio tab, render snapshot, loaded-character compatibility, resolved files, parser diagnostics, stage reports, runtime roster QA, Studio project/compiled manifests, renderer diagnostics, and audio diagnostics so Playwright can verify real browser behavior without scraping UI text.
- Atlas generation preserves a character-level reference scale before frames enter `AtlasSpriteProvider`; renderer projection should not compensate for pose-size mistakes caused by generated art or normalization.
- `projection.ts` is the single place for sprite axis/facing and collision-box coordinate conversion.

## Runtime Design Notes

The official CNS docs describe state controllers as tick-evaluated trigger/action blocks inside numbered `StateDef`s. Ikemen GO follows the same broad separation between character data and runtime instances, but compiles richer behavior before execution. This project mirrors that direction gradually:

- Keep parsed character data immutable.
- Run combat on mutable fighter instances.
- Convert CNS controllers into a small IR/list of supported operations before broad execution.
- Treat unsupported controllers and triggers as compatibility-report facts, not fatal errors.
- Keep compatibility profiles explicit as the project grows toward MUGEN 1.0, MUGEN 1.1, and selected IKEMEN-GO behavior.

## Current Milestone Scope

The app now has two modes:

- `Runtime Mode`: first-screen playable fight prototype with three active local atlas-backed demo fighters, optional loaded-character AIR/SFF route, original Rooftop Dojo stage, Training Grid fallback, stage HUD, keyboard/touch controls, collision overlays, hit pause, partial `Pause`/`SuperPause`, hit stun, damage, round timer, KO/time-over, compatibility export, and debug panels.
- `Inspector Mode`: load, parse, inspect, play AIR actions, step frames, and see collision boxes for external local MUGEN characters.

Complete SFF/CNS/ZSS/stage compatibility is intentionally layered. The first stable runtime art path is atlas PNG + `manifest.json.frame_layout`; direct SFF v1/PCX and SFF v2 RAW/RLE8/RLE5/LZ5 decoding now exist for Inspector rendering and an imported Runtime route. Imported stage `.def` parsing now feeds match setup and can render static/tiled/action-backed normal BG sprites from a decoded stage SFF; recognized BGCtrl types have a bounded renderer executor, while exact timing/parity/window/mask/trans behavior remain later layers. The current CNS bridge covers CMD `[State -1]` `ChangeState` routing plus statedef/HitDef-derived basic attacks with partial guard handling, simple `p1stateno`/`p2stateno` routing, owner-preserving `ChangeState` chains inside attacker-owned target states, target-owned `p2getp1state = 0` routing, basic `SelfState` return, and a growing tick-by-tick controller subset. The next major architecture bridge is a typed compiler/IR layer so controller support does not remain raw-string execution inside the match runtime.

## References

- Elecbyte MUGEN overview: https://www.elecbyte.com/mugendocs-11b1/mugen.html
- Elecbyte AIR format: https://www.elecbyte.com/mugendocs-11b1/air.html
- Elecbyte CNS format: https://www.elecbyte.com/mugendocs/cns.html
- Elecbyte state controllers: https://www.elecbyte.com/mugendocs/sctrls.html
- Ikemen GO: https://ikemen-engine.github.io/
- Ikemen GO repository: https://github.com/ikemen-engine/Ikemen-GO
- IKEMEN-GO reference notes: `docs/IKEMEN_GO_REFERENCE.md`
- Elecbyte Sprmake2/SFF notes: https://www.elecbyte.com/mugendocs/sprmake2.html

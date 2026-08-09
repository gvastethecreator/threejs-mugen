# Architecture

## 2026-08-08 T522-T547 and Fighter Lab addendum

Last-hit metadata remains typed and contact-owned: compiler/importer HitDef
operations carry authored `score`, `givepower`, and `p2facing`; direct and
Projectile combat materialize only the relevant contact metadata; and
`RuntimeHitVarSystem` reads it with explicit defaults. These slices do not
write score resources, mutable power, or the actor's live facing. T525
`guardCount` is a separate mutable last-hit counter owned by direct/Projectile
guard contact and reset on idle. T526 `comboHitCount` is a separate mutable
last-hit counter for bounded direct/player-owned Projectile contacts; the
`ikemen-go` profile enables it even when authored `hitCount`/`numhits` is
present, while static M.U.G.E.N traces retain that field as a fallback. T527
closes one `ikemen-go` authored-`numhits` Projectile route with two eligible
contacts and a guarded break. T528 closes separate `xveladd`/`yveladd` KO-
delta metadata for bounded direct and player-owned Projectile contacts; it
does not overwrite authored HitDef velocity or the defender's live velocity.

`App` owns the Fighter Lab Gallery, Showcase, Character Matrix, and Animation
Testbench routes (`mode=lab`,
`labView=gallery|showcase|matrix|testbench`) and derives inventory from
`getAvailableFighters()`. These views are presentation-only selectors into the
existing timeline and isolated preview runtime; they do not create a second
animation authority. The Character Matrix projects every fighter/action and
six package-health checks per fighter, while reusing the Testbench detail lens.

`RuntimeRoundPhaseWorld` remains the lifecycle authority for `RoundState`.
T536 adds the named `runtimeRoundStateFromPhase` projection at the expression
boundary: phase `1` is the control-locked Fight screen, phase `2` is the main
fight, and phases `0/3/4` retain their authored lifecycle values. The
projection is read-only and does not couple announcement choreography to
round-state evaluation. T538 adds `RuntimeFightScreenTriggerSystem`, a
read-only projection from the imported round/announcement clocks into
`IntroState`, the four `FightScreenState` booleans, and numeric
`FightScreenVar` timing/localcoord values. The runtime refreshes that context
with the same `RuntimeRoundPhaseWorld` application used by `RoundState`; it
does not create a second FightScreen clock. T539 adds the resettable
`RuntimeRoundSystem.fightTimeFramesElapsed` source clock and projects bounded
`GameVar` timing reads from the round pre/post snapshots and active pause
snapshot. `ExpressionEvaluator` only reads those typed values; it does not own
or advance either clock. T540 adds `AnimElemVar` as a read-only projection from
the actor's active imported AIR frame. `RuntimeAnimationSystem` owns the
metadata mapping; CNS, controller expressions, and Fighter Lab Testbench share
that boundary. T541 adds `AnimLength` as a separate action-total projection
using the same effective frame-duration rule; it does not advance or replace
  the live cursor. T542 adds `animationOwnerPlayerNo` outside
  `CharacterRuntimeState`. The animation world writes it from the action-owner
  actor, and shared expression contexts expose it as `AnimPlayerNo`. Redirected
  target contexts carry the owner number when the target provides it. T543 adds
  `runtimeCurrentClsnVarBoxes` as a raw current-frame collision projection.
  It composes AIR `clsn1`/`clsn2` with `OverrideClsn`, composes `size` through
  the existing size-box system, and leaves `TransformClsn` out of the read.
  `ExpressionContext` owns redirect callbacks and converts values from the
  selected actor's `localcoord` to the caller's output space. The Testbench
  uses the same coordinate selector helper. Unsupported
  alpha/angle/scale fields, raw duration semantics, Helper/Projectile/team
  ownership, rollback/netplay, and full animation parity remain outside the
  model.

  T544 adds `runtimeClsnOverlap` on the same frame-system boundary. It resolves
  a target by player ID, derives current AIR/`OverrideClsn`/size boxes, converts
  both actors into the canonical world space, and delegates intersection to the
  shared collision transform. Scale and angle apply only to non-size boxes.
  `ExpressionContext` supplies direct and redirected callbacks; it does not
  mutate combat or create a parallel collision world. Projectile overlap,
  collision-proxy breadth, rollback/netplay, and full collision parity remain
  outside this slice.

T546 keeps projectile collision reads on existing owners. `ProjectileSystem`
owns the current raw projectile AIR Clsn groups plus collision scale and angle;
draw scale remains separate. `EffectActorWorld` owns active caller-relative
selection and preserves oldest-first insertion order. Expression contexts only
resolve the projectile owner and target player, then delegate both projectile
Clsn groups to the shared transformed world-box boundary. No query path writes
combat state. Collision proxies, perspective/depth scaling, combat
arbitration, rollback/netplay, and full Projectile parity remain outside the
model.

T547 reuses that same selection owner for `ProjVar`. `EffectActorWorld`
optionally filters active projectiles by numeric ID before applying the
oldest-first index. `ProjectileSystem.runtimeProjectileVar` is the only field
projection boundary and converts coordinate-like values from projectile
`localcoord` to the original caller output space. Expression and controller
contexts only select and read. Missing projectiles and unsupported parameters
become the expression undefined value; no projectile or combat state is
mutated.

## 2026-08-02 T535 Ikemen `GetHitVar(hitflag)` addendum

Last-hit metadata now keeps the effective HitDef `hitflag` in a separate
`sourceHitFlag` field. Direct and Projectile contacts use authored values or
the official omitted `MAF` default. The expression compiler rewrites only
static equality/inequality comparisons into a typed overlap predicate, so
redirected actors retain ownership without widening `GetHitVar` into a general
string channel. Dynamic flags, reset/lifetime parity, and full combat parity
remain outside this boundary.

## 2026-08-01 T479 presentation addendum

`HitSparkAssetSystem` now preserves CommonFX/FightFX `localcoord` on resolved
AIR frames and derives the effective package scale from the authored `fx.scale`,
package width, and owning-character localcoord before `HitSparkRenderer` binds a
sprite. This is a bounded package-backed presentation seam; exact animation
timing, palette/layer/audio/cache and full FightFX parity remain outside the
contract.

## 2026-08-01 T480 depth-velocity addendum

Fall metadata remains typed from compiler/importer/projectile boundaries through
`HitFallControllerSystem`. `HitFallVel` consumes explicit Ikemen
`fall.zvelocity` as `combatDepth.velocity`, while omitted Z preserves the
current depth state. The slice deliberately does not infer full M.U.G.E.N Z or
Common1 depth/bounce behavior.

## 2026-08-01 T481 HitDef velocity-Z addendum

HitDef velocity vectors are now typed as optional three-component values at the
compiler boundary. Imported state moves and player-owned Projectiles preserve
the third component through `HitDefSystem`/`ProjectileSystem`; the shared combat
resolver selects ground, air, down, guard or airguard Z and direct/projectile
combat writes an explicit result to `combatDepth.velocity`. Omitted Z is kept
absent rather than synthesized. This is a bounded metadata/contact seam, not a
general Z integrator: ModifyHitDef mutation, Common1 acceleration/friction and
full depth physics remain separate work.

## 2026-08-01 T482 ModifyHitDef vector-Z addendum

Static `ModifyHitDef` now compiles the same five velocity-vector parameter
shapes, extracts authored Z, and mutates the active normal `DemoMove` in place.
`down.velocity` keeps its existing X/Y mutation and now also updates its Z
metadata; ground/air/guard/airguard Z fields feed the shared T481 resolver on
the next contact. Dynamic parameter evaluation and Common1 depth integration
remain separate.

## 2026-08-01 T483 HitDef acceleration metadata addendum

The compiler and imported/direct/projectile combat seams now retain static
HitDef `xaccel`, `yaccel` and `zaccel` metadata in `RuntimeGetHitVars`.
`RuntimeHitVarSystem` exposes the three keys with zero defaults for omitted
horizontal/depth values. This is deliberately a metadata boundary: no new
facing/localcoord transforms, Common1 acceleration or depth physics are
introduced here, and dynamic ModifyHitDef expressions remain separate.

## 2026-08-01 T484 ModifyHitDef acceleration mutation addendum

Static `ModifyHitDef` acceleration fields now update the active normal
`DemoMove.hitVars` in place. The existing direct/projectile handoff therefore
observes the mutation without introducing a second contact model; dynamic
expression evaluation and physics remain separate.

## 2026-08-01 T485 dynamic acceleration metadata addendum

Supported scalar expressions for HitDef and ModifyHitDef `xaccel`, `yaccel` and
`zaccel` now remain in the typed operation and are evaluated through the active
controller context. Static values keep the existing path; omitted or failed
dynamic evaluation does not overwrite an existing field. This closes only the
metadata evaluation seam; Common1 acceleration/friction, scaling and depth
physics remain separate.

## 2026-08-01 T486 Ikemen `GetHitVar(zvel)` addendum

The shared `RuntimeHitVarSystem` now exposes the optional active-hit depth
velocity as `GetHitVar(zvel)`, reading `CharacterRuntimeState.hitVelocity.z`
with a zero fallback when the selected HitDef/Projectile has no Z component.
The alias is intentionally Ikemen-only; legacy M.U.G.E.N `GetHitVar` keys,
depth integration and fall-Z semantics remain separate contracts.

## 2026-08-01 T487 Ikemen `HitVelSet z` addendum

`HitVelSet` now carries an optional static `z` flag in the typed kinematic
operation. When the flag is nonzero and active hit velocity exists,
`RuntimeKinematicControllerWorld` materializes the existing combat-depth
channel and copies `hitVelocity.z` into `combatDepth.velocity`; X/Y behavior
is unchanged and a missing hit remains a no-op. This is a controller handoff,
not a generic Z integrator or M.U.G.E.N extension.

## 2026-08-01 T488 Ikemen `GetHitVar` velocity-vector addendum

`RuntimeGetHitVars` now carries optional ground, air, down, guard and air-guard
velocity vectors. Direct HitDef and Projectile construction preserve the parsed
or effective triples, and `RuntimeHitVarSystem` resolves the dotted x/y/z keys
with zero fallback. This is readback metadata only; dynamic vectors, omitted
default adjudication and depth physics remain separate contracts.

## 2026-08-01 T489 Ikemen `GetHitVar` damage addendum

The shared hit-variable record now retains the first and second HitDef damage
components as `hitDamage` and `guardDamage`. Direct HitDef and player-owned
Projectile contact paths populate them before the existing effective `damage`
field; readback remains independent from resource/scaling and KO policy.

## 2026-08-01 T490 Ikemen `GetHitVar` animtype addendum

The shared hit-variable record now retains separate ground, air, and fall
reaction animation types. HitDef activation, imported moves, and player-owned
Projectiles feed these fields through direct combat and the Projectile combat
bridge. The expression read model exposes `ground.animtype`, `air.animtype`,
and `fall.animtype` with zero fallback while preserving existing effective
`animtype` behavior. Common1 reaction-state choreography, dynamic values, and
full upstream parity remain separate contracts.

## 2026-08-01 T491 Ikemen `GetHitVar(fall.envshake.mul)` addendum

The typed fall EnvShake metadata now optionally retains the authored multiplier
from HitDef, Projectile, or imported move data. Direct and Projectile combat
carry it into `RuntimeHitFall.envShake`; the expression read model returns the
authored value or the official default `1`. EnvShake playback and waveform
ownership remain separate contracts.

## 2026-08-01 T492 Ikemen `GetHitVar(playerno)` addendum

The shared hit-variable read model now resolves `GetHitVar(playerno)` from
the propagated `sourcePlayerNo` metadata written by direct HitDef and
player-owned Projectile contacts. The value is the source attacker's slot,
defaults to `0` when no source metadata exists, and remains separate from the
defender's own runtime identity and from string-valued GetHitVar contracts.

## 2026-08-02 T506 Ikemen `GetHitVar(playerid)` addendum

The typed hit-source boundary now carries `sourcePlayerId` beside
`sourcePlayerNo`. Roots and registered Helpers pass their numeric runtime
identity into direct HitDef and Projectile contact materialization; a Helper
therefore keeps its own ID while inheriting the root player slot. The shared
read model exposes `GetHitVar(playerid)` with a `0` fallback and never derives
numeric identity from string actor/root IDs. Unverified ownership and broader
custom-state/team semantics remain separate contracts.

## 2026-08-02 T507 Ikemen deprecated `GetHitVar(ID)` addendum

The deprecated `ID` parameter is a read alias, not a stored field. The shared
hit-variable boundary normalizes it to T506 `sourcePlayerId`, preserving the
same zero fallback and avoiding parallel identity state.

## 2026-08-02 T508 required-trace roster-binding addendum

Required identity and nonlethal HitDef presets resolve the opponent label from
`demoFighters[1]` instead of duplicating a retired character literal. Trace
semantics remain fixed while roster ownership stays with the demo manifest.

## 2026-08-02 T509 Ikemen `GetHitVar(guardko)` addendum

The shared hit-variable reader projects the existing boolean `sourceGuardKo`
field as numeric `1`/`0`. Direct, Projectile, and verified Helper source
ownership remains in `runtimeRoundHitSourceMetadata`; no parallel KO state is
introduced.

## 2026-08-02 T510 Ikemen `GetHitVar(attr)` addendum

The evaluator rewrites static `GetHitVar(attr) =/!= state, attack` comparisons
to an internal attribute predicate. That predicate reads `sourceAttr` from the
active expression actor, so root and redirected contexts use the same typed
hit metadata and MUGEN attribute matcher. No general string value enters the
numeric `GetHitVar` reader.

## 2026-07-18 T288 checkpoint

The T287 shutter edge now crosses a timer-owned reset boundary before the
active fighter pass. `PlayableMatchRuntime` resets roots in place to stage
starts/state `0` with idle/control state, clears transient state, command
history, and owner-scoped effects, then reuses the existing state-entry path.
Persistent round resources, variables, team state, and compatibility history
remain separate. Exact global asset clearing and FightScreen display ownership
remain outside this contract.

## 2026-07-18 T287 checkpoint

The bounded imported FightScreen intro-skip bridge now parses `shutter.time`
and `shutter.col`, observes a new hard-button edge from either seat, rejects
the raw `roundnotskip` guard, reduces the remaining intro to `ctrl.time + 1`,
publishes `RuntimeRoundShutter/v0`, and renders symmetric top/bottom bars. The
source-owned character reset and announcement/fight-display choreography stay
outside this contract.

## 2026-07-18 T286 checkpoint

The imported FightScreen round-start boundary now carries explicit
`start.waittime` and `ctrl.time` through the system-asset loader into a
reset-owned `RuntimeRoundIntro/v0` countdown. The existing phase world exposes
`pre-intro`, `intro`, and `fight`, while the round timer and finish decision
remain held until `fight`. The no-source route keeps the prior immediate phase
2 behavior. This is a timing/phase adapter only; announcement, shutter, skip,
character control/reset, motif, Common1/ZSS, and full parity remain separate.

## 2026-07-18 T285 checkpoint

The imported FightScreen boundary now carries `fadein.time`, `fadein.col`,
`fadein.anim`, and `fadein.snd` through system-asset loading,
`RuntimePreRound/v0`, the FightFX AIR/SFF renderer, and global audio. The
pre-round frame resets on reset and next-round handoff; unresolved actions or
sprites keep the reverse-opacity color fallback and report a diagnostic. The
`c688f04d` checkpoint passes the full suite, TypeScript 7, build, 633/633
traces, repository boundaries, CSS budget, and 64-path browser smoke with zero
console/page errors. This remains a bounded adapter: exact intro/shutter
ordering, timer/input gating, localcoord/motif transforms, dialogue/skip,
Common1/ZSS, teams/Turns, rollback/netplay, and full parity are separate.

## 2026-07-18 architecture checkpoint

Current frontier: HEAD `50801d84`, Entry 555, Wayfinder 256. Redirected
dispatch is now centralized under accepted bounded ADR 0006; negative/global
state scheduling, Common CNS/config sources, helper command buffers and SOCD
have named closeouts. The next architecture blockers are different:

- `SourceAuthorityManifest/v0` must separate normative `05b7d98` from mutable
  local cache `044da720` before new source-exact IKEMEN claims;
- modes 1/3 need persistent per-seat SOCD edge state and match-level config
  authority rather than one current-Set order and P1-first package precedence;
- state 5900 needs selected-source provenance, `RuntimeRoundPhase/v0` remains
  separate, and Turns needs one immutable plan plus all-or-nothing commit;
- three-plus projectile interaction needs one global schedule before proxies;
- `EvidenceEnvelope/v0` is a proven extraction candidate in `src/app`, while
  missing shared roots keep the current boundary check non-probative.

Detailed decisions and 30 tasks:
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 architecture checkpoint

The current runtime frontier is Entry 555 plus closed Wayfinder 209 at HEAD
`90ab79b7`. The next architecture work is not another controller count.
`RuntimeRedirectedTargetDispatchSystem` is a partial lease seam and ADR 0006
remains Proposed until it owns typed failures, actor generation/freshness,
selected/mutated IDs, and telemetry attribution. Turns continuation still
mutates before every invariant is known; the intended boundary is a pure
`RuntimeTurnsTransitionPlan/v1` followed by one validated commit. Round phase,
side counters, member history, and state-5900 source owner are independent
axes. Three.js remains a presentation adapter over renderer-independent
snapshots. Detailed decision and dependency map:
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

Current active-root interaction cut: explicit Tag post-fighter target maintenance ages each valid root store once and resolves existing exact-id bindings across the complete root roster. `RuntimeHitDefContactMemory/v0` separates immediate CNS targets from committed/pending direct-HitDef getter contacts and commits those contacts after direct combat. `RuntimeRootBodyPushWorld` owns plural X/Width separation. Active-motion roots may author direct `HitDef` and `ReversalDef` side effects. `RuntimeRootDirectHitAdmissionWorld` sorts ReversalDef getters before HitDef getters and traverses getter-first before the existing actor-generic resolver mutates admitted pairs; its separate attacker-order diagnostic remains available to priority arbitration. Pair and Tag priority consume typed `Hit | Miss | Dodge` outcomes before mutation. Equal Hit/Hit uses a frame-local exact-move graph batch; Hit/Miss skips only Miss; every other equal class pairing skips both directions for that frame without contact consumption. Unequal loser suppression remains exact to the opposing getter. Each omitted authored priority resets to `4, Hit`. `RuntimeEffectActorWorld` registers an exact store for every authoritative root. ReversalDef-versus-ReversalDef exact ordering/randomness, broad HitOverride/guard interaction, throws, projectile classes, team round, HUD, and shared resources remain separate.

Dual active ReversalDefs are projected separately in `RuntimeRootDirectHitAdmission/v1`: getter-ordered directed candidates require active moves, enemy sides, matching reversal attr, and Clsn1 contact. Explicit Tag consumes those candidates before HitDef priority through a dedicated reversal-clash primitive. The first accepted direction owns reversal state, target, hitpause, power, reciprocal HitDef contact memory, and move interruption; later stale directions fail closed. Attack depth/Z, AffectTeam, helper/projectile clashes, and broad tie/randomness parity remain absent.

This file describes the current implementation boundaries. The larger port direction is documented in:

- `docs/PORTING_ROADMAP.md`
- `docs/ENGINE_PORT_ARCHITECTURE.md`
- `docs/MVP_DEFINITION.md`
- `docs/QA_AND_ACCEPTANCE_GATES.md`

`mugen/*` is renderer-independent. It owns loaders, parsers, normalized models, stage definitions, runtime snapshots, command buffering, and compatibility diagnostics. Three.js types must not appear in this layer.

`game/*` is the browser adapter. It consumes `MugenSnapshot` data and projects MUGEN 2D coordinates into a Three.js orthographic scene. Sprite textures are cached by `group,index`; collision boxes are translucent plane geometry, not WebGL line width. Audio stays in the same adapter layer: `MugenAudioSystem` observes runtime `PlaySnd`/`StopSnd` events and decodes loaded SND WAV payloads through Web Audio after browser unlock.

`app/*` is the DOM control plane. It loads local files, switches inspector tabs, dispatches runtime commands, renders debug panels, and owns the browser-local Studio project manifest flow. The Studio shell is split into URL-addressable Workbench, Assets, Inspector, Debug, Evidence, Modules, and Build surfaces. Workbench/Assets/Debug/Evidence/Modules/Build feed the Three.js adapter with the match runtime snapshot; Studio Inspector feeds it with the existing AIR inspector runtime snapshot. `StudioSemanticDraft/v0` keeps the focused CNS/ST source editor side-effect free until parser/compiler diagnostics and source identity checks pass; live edits defer the expensive semantic preflight while Save stays disabled, and the existing explicit folder write/reimport transaction remains the mutation boundary. The UI never owns animation timing or collision rules.

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
  -> stageProjection + AxisRenderer static/tiled/action-backed BG sprite adapter with bounded layer scale and positionlink projection plus bounded BGCtrl executor when stage SFF is decoded
  -> StageCompatibilityReport for UI/export coverage
```

## Key Boundaries

- `VirtualFileSystem` normalizes paths to POSIX-style virtual paths and resolves case-insensitively.
- Text parsers preserve raw lines and emit diagnostics instead of throwing on unsupported syntax.
- `MugenRuntime` is a deterministic inspector runtime for AIR playback.
- `MatchWorld` is the public match runtime boundary used by the app. It currently delegates to `PlayableMatchRuntime` so behavior remains stable while systems move behind the facade. It owns the first actor registry read model for players/effects, including `spawn`/`active`/`remove` lifecycle events used by Debug Studio, trace artifacts, and QA bridge diagnostics. Target refs, TargetBind bindings, and owner-side `BindToTarget` registry data are read through `RuntimeTargetWorld.snapshotRuntimeState` instead of ad hoc registry cloning.
- `PlayableMatchRuntime` is the current MUGEN-like fight loop: two actors, stage bounds, keyboard/touch input, CPU pressure, jump/crouch/walk, attacks, hit pause, partial match `Pause`/`SuperPause`, hit stun, damage, power gain, speed control, and round reset dispatch. `RuntimeRoundSystem` owns the bounded round timer, KO/time-over finish state, winner/message projection, and reset state used by snapshots; `RuntimeTraceGate.requiredRoundFrames` can now make bounded KO/time-over winner/message evidence a required trace condition, and `PlayableMatchRuntimeOptions.roundTimerFrames` gives QA short deterministic timer fixtures without changing default match length. `RuntimePauseWorld` owns the current partial match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset state used by `MugenSnapshot.matchPause`. `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic multi-actor camera-shake projection used by stage camera snapshots while actor event histories remain available to renderer/debug/trace consumers. `RuntimeAudioWorld` owns bounded `PlaySnd`/`SndPan`/`StopSnd` event insertion, including static lowpriority/volumescale/freqmul/loop/pan/abspan telemetry for trace/debug/audio handoff, and direct `HitDef` results can now emit bounded `hitsound`/`guardsound` telemetry into the same actor sound-event history; exact SND playback, dynamic audio params, FightFX/common sound fallback, channel priority, and timing/mixing parity remain blocked. `RuntimeHitEffectWorld` owns bounded direct `HitDef` `sparkno`/`guard.sparkno`/`sparkxy` event insertion into actor hit-effect history; `S`-prefixed spark refs are resolved as local player AIR action ids, unprefixed refs are classified as common/default refs, and `F` refs remain FightFX-classified. `HitSparkAssetSystem` can resolve player/common/FightFX AIR asset frames before hit-effect insertion, and `RuntimeTraceGate.requiredHitEffectEvents` can now require bounded `assetSource`, action, frame, sprite group, and sprite index metadata. `HitSparkRenderer` consumes snapshot events in the Three.js adapter, resolves the first local player AIR spark frame into a sprite texture when available, preserves package/common/FightFX frames supplied by runtime events, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace, and falls back to bounded 180-frame additive geometry at facing-adjusted `sparkxy` when AIR or sprite lookup is unavailable. Exact FightFX/common lookup parity, frame animation timing, binding, layering, scale, palette, motif/screenpack ownership, and full spark parity remain blocked. `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset while stage snapshots remain renderer-independent. `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `RemapPal`, `Trans`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking including bounded one-frame `renderAngle` / `renderScale` telemetry while actor presentation telemetry remains snapshot-driven for Three.js/debug/trace consumers. `RuntimeActorConstraintWorld` owns bounded static and dynamic-fallback `Width`, one-frame actor constraints, stage clamping, and player body-push separation while actor body/bounds telemetry remains snapshot-driven. `RuntimeDirectCombatWorld` owns bounded same-tick direct `HitDef` priority win/trade mutation and direct hit/guard result mutation for life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup while Common1/custom-state transitions remain integrated by `PlayableMatchRuntime`. `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and direct/projectile redirect mutation while state-entry validation remains an integration hook. `RuntimeReversalWorld` owns bounded ReversalDef activation, active-counter detection, and direct counter-result mutation while state-entry and target-state routing remain integration hooks. Effect actor lists for the current partial `Explod`, `Helper`, and `Projectile` support now mutate through `EffectActorSystem` instead of three loose arrays in the match loop. `RuntimeProjectileCombatWorld` owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation and projectile clash trade/cancel/decrement mutation. `RuntimeEffectActorWorld` wraps those stores behind a world-style contract with active/presentation advance passes, projectile-combat handoff, bounded `projhits`/`projmisstime` multi-hit cooldown, bounded `projpriority` projectile-vs-projectile equal-priority trade plus higher-priority cancel with winner-priority decrement, bounded projectile terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions, state-local direct/projectile contact-trigger memory for `MoveHit`/`MoveGuarded` and `ProjHit(projid)`-style triggers, and read-only summaries that `MatchWorld` consumes as actor-registry `effectStores`.
- Round update: `RuntimeRoundSystem` now owns bounded post-KO cadence through `RuntimePostRound/v0`: a resolved `RuntimeRoundTiming` contract defaults to a separate 255-tick post-round clock, phase `4` opening at post-KO frame `45`, 60-tick slowdown clock, default 0.25 playback, and a 45-tick fade to normal, with bounded overrides available through `PlayableMatchRuntimeOptions.roundTiming`. Imported `fight.def` `[Round]` values can now populate that contract through `MugenSystemAssets` and imported fighter metadata when no explicit override exists. `RuntimeMatchRoundWorld` defers match stop until the post-round clock ends, advances it independently from TimerFreeze, and holds the phase-4 clock while global `RoundNotOver` is asserted. `RuntimeRoundWinPose/v0` owns the bounded phase-4 `180/170/175` state handoff for available active normal/tag actors, with readiness derived from the same resolved timing and explicit unavailable/ambiguous diagnostics. T282 adds imported `fadeout.time`/`fadeout.col`, effective terminal duration via `max(over.time, fadeout.time)`, additive `RuntimeRoundFade/v0`, and a Three.js overlay. Exact frame-start ordering, parsed release ownership, `over.hittime`/`over.forcewintime`, fight-screen fade assets, motif phase timing, Common1/ZSS winpose execution, continue flow, pause layering, teams, lifebars, and full round parity remain blocked.
- Audio update: `RuntimeAudioControllerDispatchWorld` resolves bounded active-state dynamic `PlaySnd`, `SndPan`, and `StopSnd` params into typed `audio:*` operation telemetry before handing events to `RuntimeAudioWorld`, while preserving authored dynamic sound refs in `RuntimeSoundEvent.raw`. `RuntimeMatchPauseControllerWorld` resolves bounded dynamic `SuperPause sound` refs once at pause start, emits pause-start sound telemetry through `RuntimeAudioWorld`, and records typed `audio:playsnd` telemetry for the resolved ref. `RuntimeContactPresentationWorld` now also records typed `audio:playsnd` telemetry for bounded resolved direct `HitDef hitsound` / `guardsound` contact refs while preserving contact sound-event metadata. This supersedes the older audio sentence above for active-state dynamic audio telemetry, the SuperPause sound-ref subset, and the bounded direct HitDef contact-sound subset only; exact SND playback, broad channel priority, FightFX/common sound fallback, projectile/helper contact-sound operation telemetry, super-background audio, and timing/mixing parity remain blocked.
- Compatibility note: when older roadmap text says dynamic audio params remain blocked, read that as broad/full audio parity. The current bounded claim is narrower and proven: imported active-state `PlaySnd`, `SndPan`, and `StopSnd` dynamic params can now resolve into typed trace telemetry.
- `RuntimeExpressionContextWorld` is the runtime CNS expression/trigger read-model boundary used by `PlayableMatchRuntime`: it builds the shared `ExpressionContext` for active imported state trigger evaluation and dynamic controller-param fallback. The boundary owns target redirects, contact/projectile reads, effect actor counts, command/const/state/anim/hitvar reads, `HitDefAttr`, `HitPauseTime`, `HitOver`, `HitShakeOver`, `InGuardDist`, target metadata, and current S/C/A/L size-box projection for localcoord-aware `P2BodyDist X/Y`. IKEMEN X composes active Width and Y composes active Height; both then apply OverrideClsn Size. Legacy MUGEN X excludes Width and Y retains center-axis P2Dist semantics. `RuntimeActiveExpressionContextWorld` is the active-match factory seam that supplies stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and `InGuardDist` into that read model before dynamic dispatch params or triggers are evaluated. `RuntimeDispatchEvaluationWorld` owns bounded dynamic active-controller dispatch-param fallback, `RuntimeControllerEvaluationContextWorld` owns bounded passive-controller executor context creation for active runtime-controller dispatch, `RuntimeTriggerEvaluationWorld` owns bounded normalized single-trigger expression evaluation, and `RuntimeTriggerGateWorld` owns bounded `triggerall` AND plus numbered `triggerN` OR grouping, while `PlayableMatchRuntime` still owns concrete state/controller dispatch, exact VM timing, and the concrete root/current-opponent source.
- `RuntimeStateTransitionControllerWorld` is the passive state-transition boundary used by `StateControllerExecutor`: it applies bounded `ChangeState` / `SelfState` mutations from raw controller params, resolves `value` / `stateno` expressions, writes previous-state metadata through `RuntimeStateMetadataSystem`, resets frame/time, and applies optional `ctrl`. This keeps basic executor-side transition setup behind a named testable system while active-state entry, state/action lookup, custom-state ownership, controller order, redirects, helper/team scopes, and full MUGEN/IKEMEN state-entry parity remain blocked.
- `RuntimeAnimationControllerWorld` is the passive animation-controller boundary used by `StateControllerExecutor`: it applies bounded `ChangeAnim` / `ChangeAnim2` mutations from raw controller params, resolves `value` / `anim` expressions, marks self vs state-owner animation source, resets frame/time, and can seed `elem` / `elemtime` when an AIR action resolver is available. This keeps basic executor-side animation retargeting behind a named testable system while active-state action lookup, state-owner namespace selection, controller order, redirects, and full MUGEN/IKEMEN animation-controller parity remain blocked.
- `RuntimeKinematicControllerWorld` is the passive movement/position controller boundary used by `StateControllerExecutor`: it applies bounded `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, and `Gravity` mutations from typed `kinematic:*` operations or raw controller params. This keeps controller setup behind a named testable system while leaving per-frame integration in `RuntimeKinematicsWorld` and exact physics, velocity tick order, `yaccel` constants, helper/team/redirect ownership, and full MUGEN/IKEMEN kinematic parity blocked.
- `RuntimeHitFallControllerWorld` is the passive get-hit/fall controller boundary used by `StateControllerExecutor`: it applies bounded `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutations from typed `hitfall:*` operations or raw controller params. This keeps stored fall velocity, deferred fall damage, `fall.defence_up`, and nonlethal fall damage behavior behind a named testable system while leaving controller routing, trigger order, Common1 branching, helper/team/redirect ownership, and full MUGEN/IKEMEN fall parity blocked.
- `RuntimeSpriteEffectControllerWorld` is the active-state CNS sprite-effect dispatch boundary: it records controller telemetry, extracts typed `sprite-effect:*` operations when available, records operation telemetry, resolves bounded dynamic `SprPriority` / `PalFX time/add/mul/color/invertall` / `RemapPal` / `Trans alpha` / `AfterImageTime` / `Angle value/scale` params into typed operations after expression resolution, forwards bounded dynamic `AfterImage` resolver handoffs, and hands bounded `SprPriority`, `PalFX`, `RemapPal`, `AfterImage`, `AfterImageTime`, `Trans`, and `Angle*` side effects to `RuntimeSpriteEffectWorld`. `PlayableMatchRuntime` still owns trigger filtering, ordering, hitpause selection, expression-context construction, and render projection.
- `RuntimeAfterImageSampleWorld` is the renderer-independent ghost-trail sample projection boundary: it turns the current actor runtime state plus current AIR frame into a cloned `RuntimeAfterImageSample` with self/state-owner sprite metadata before `RuntimeSpriteEffectWorld` captures it. `PlayableMatchRuntime` still owns current-frame lookup, controller order, and broader render projection.
- `RuntimeFrameWorld` is the current AIR frame and collision-box projection boundary: runtime and snapshot consumers use it for current frame lookup, active move hitboxes, frame `Clsn1`, frame `Clsn2`, cloned boxes, and the missing-frame default hurtbox. `PlayableMatchRuntime` still owns controller/combat order and exact MUGEN tick semantics.
- `RuntimeTargetControllerDispatchWorld` is the active-state CNS Target / BindToTarget dispatch boundary: it records controller telemetry, extracts typed `target:*` / `bindtotarget` operations when available, records operation telemetry, and hands bounded target side effects to `RuntimeTargetWorld` through explicit match-owned callbacks for damage scaling, TargetState entry, and target constants. `PlayableMatchRuntime` still owns trigger filtering, ordering, concrete state validation, and target candidate selection.
- `RuntimeContactControllerDispatchWorld` is the active-state CNS contact-memory dispatch boundary: it records controller telemetry, extracts typed `contact:*` operations when available, records operation telemetry, and hands bounded `HitAdd` / `MoveHitReset` side effects to `RuntimeContactMemoryWorld`. `PlayableMatchRuntime` still owns trigger filtering, ordering, and direct/projectile contact creation.
- `RuntimeHelperTelemetryWorld` is the helper-local Projectile telemetry binding boundary: it installs match actor helper callbacks, forwards only helper-local `Projectile` controller/operation events into compatibility telemetry, and prefers helper state numbers with owner-state fallback. `PlayableMatchRuntime` still owns concrete recorder wiring and broader helper/effect/combat ordering.
- `RuntimeMatchPresentationSnapshotWorld` is the current match presentation snapshot boundary: it collects camera shake, stage flash, and P1/P2 effect snapshot groups before `RuntimeSnapshotWorld.match()` assembles the renderer-independent match snapshot. It removes another presentation-data bundle from `PlayableMatchRuntime.getSnapshot()` while leaving exact renderer, motif camera, effect lifecycle, and visual parity outside the cut.
- `RuntimeActiveControllerTelemetryWorld` is the active-controller telemetry hook boundary: it builds the controller/operation recorder hooks shared by active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch before they forward into `RuntimeCompatibilityTelemetryWorld`. It removes repeated telemetry closures from `PlayableMatchRuntime` while keeping imported-only filtering and event retention inside the telemetry world.
- `RuntimeMatchCombatStateHooksWorld` is the combat/helper state-entry adapter boundary: it builds direct/projectile combat hooks that preserve state-owner availability/entry options and helper-combat hooks that keep self-owned availability checks while forwarding entry options. It removes another inline `PlayableMatchRuntime` closure bundle before the combat bridge hands hooks to direct/projectile/helper combat, without claiming broader helper/custom-state parity.
- `RuntimeMatchOpponentContextWorld` is the current 1v1 match-opponent context boundary for lifecycle bridges: it maps P1/P2 into direct opponent plus singleton lifecycle `opponents` list for active, pause, and hitpause effect lifecycle callers, and fails closed for actors outside the pair. It prepares the route that future teams/simul roster ownership must replace without scattering pair ternaries through match systems.
- `RuntimeEffectHelperContextWorld` is the helper/effect lifecycle context boundary: it validates complete owner runtime state, projects parent/root state, preserves current opponent fallback data, builds nearest-order helper `opponentRoster` entries from explicit lifecycle opponent lists, preserves explicit roster overrides, forwards target candidates, and carries helper `TargetState` / telemetry hooks into active or paused Helper advancement. `RuntimeEffectLifecycleWorld` still owns active/presentation effect lifecycle calls.
- `RuntimeMatchHelperBindingWorld` is the match-level helper callback wiring boundary: it attaches helper-owned `TargetState` owner handlers and helper-local Projectile telemetry handlers outside `PlayableMatchRuntime`, then delegates target-state entry to `RuntimeMatchHelperTargetStateWorld` and Projectile-only telemetry filtering to `RuntimeHelperTelemetryWorld`. `PlayableMatchRuntime` still supplies the concrete 1v1 roster, telemetry recorder, state availability hook, state-entry hook, and broader helper/custom-state timing.
- `RuntimeMatchHelperTargetStateWorld` is the match-level helper `TargetState` actor-resolution boundary: it resolves target actor payloads through the current match actor roster before delegating owner validation and state-entry result semantics to `RuntimeHelperTargetStateWorld`.
- `RuntimeMatchHelperProjectileTargetWorld` is the match-level helper-parented Projectile target-memory bridge: normal post-fighter combat forwards owner, defender, projectile, and `RuntimeTargetWorld` through this seam before lower helper target-memory logic runs. `PlayableMatchRuntime` still owns broader combat/effect order.
- `RuntimeMatchTickInputWorld` is the normal-match input/tick stamping boundary: it writes per-frame `compatibilityTick`, stores cloned `currentInput`, and pushes non-hitpause command-buffer samples for the normal loop. `RuntimeHitPauseWorld` and `RuntimePausedMatchWorld` still own pause/hitpause buffering paths, while `PlayableMatchRuntime` owns tick order and concrete input sources.
- `RuntimeRootAdvancePhaseWorld` snapshots every present root as `playable`, `active-motion`, or `bounded-standby` before the explicit-IKEMEN normal actor pass. `RuntimeRootMotionAdvanceWorld` owns the restricted `state clock -> motion CNS -> kinematics -> animation` sequence for already-live P3-P8 roots. The motion CNS profile has no side-effect routes, and the snapshot deliberately prevents same-pass TagIn escalation. Pause/hitpause, effects, combat, round, presentation, resources, and non-IKEMEN profiles remain outside this boundary.
- `RuntimeRootPresentationWorld` owns renderer-independent `RuntimeRootPresentation/v1`: stable per-root draw/camera/collision-debug reasons plus ordered selected ids. `PlayableMatchRuntime` resolves camera actors through this contract while retaining pair-owned EnvShake/effects, `RuntimeSnapshotWorld` clones the diagnostic, and Three.js strictly resolves character and collision consumers across pair/reserve storage. Collision ids are observability only: hit sparks, push, hit admission, targets, HUD/audio, combat, round, resources, and exact Tag choreography remain outside this boundary.
- `RuntimeRootBodyPushWorld` owns runtime-only explicit-Tag root enrollment plus current active-root Helper participant projection, unique root/Helper/combined validation, stable unordered-pair traversal, current facing-aware X/Width separation, and strict post-push stage clamp. `RuntimeMatchInteractionWorld` invokes it at the existing pre-target/pre-combat point; legacy/Single still use exact P1/P2 separation. `RuntimeRootBodyPush/v0` is diagnostic only and never drives later simulation; it retains root fields and adds optional participant/Helper ids when Helpers participate. Exact CharList run order, duplicate ordered pairs, nested/projectile Helpers, hit admission, targets, and combat remain separate.
- `RuntimeMoveStartWorld` is the state-move startup boundary: it writes the selected current move/label, resets move tick and hit/reversal state, marks attack `moveType`, and hands control mutation plus authored state entry back to match-owned hooks. `PlayableMatchRuntime` still owns concrete input routing, control mutation, state entry, and exact VM timing.
- `RuntimeMatchFighterAdvanceWorld` is the active 1v1 fighter-advance orchestration boundary: it owns current P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start ordering. `RuntimeFighterAdvanceHookSetWorld` owns the per-fighter advance hook-set construction before `RuntimeFighterAdvanceWorld` executes, while `RuntimeFighterAdvanceWorld` owns the bounded per-fighter order and `PlayableMatchRuntime` supplies concrete worlds, callbacks, pause state, and exact match-loop integration.
- `RuntimeMatchCombatBridgeWorld` is the match interaction combat bridge boundary: it creates the priority-clash, direct-combat, projectile-combat, and helper-combat resolver callbacks supplied to `RuntimeMatchInteractionWorld`. `PlayableMatchRuntime` still owns concrete world instances, state hooks, hurtbox lookup, projectile target-memory handoff, logging, and exact combat timing.
- `RuntimeMatchPauseControllerWorld` is the match pause-controller result boundary: it applies `Pause` / `SuperPause` through `RuntimePauseWorld`, routes SuperPause power deltas through an injected resource hook, and emits the existing match pause log. `PlayableMatchRuntime` still supplies concrete resource/log hooks, active controller order, paused-match progression, and exact VM timing.
- `RuntimeAudioControllerDispatchWorld` is the active-state CNS audio dispatch boundary: it records controller telemetry, extracts static or resolved dynamic typed `audio:*` operations when available, records operation telemetry, and hands bounded `PlaySnd` / `SndPan` / `StopSnd` event emission to `RuntimeAudioWorld`. `PlayableMatchRuntime` still owns trigger filtering, ordering, hit/contact timing, and actor context.
- `RuntimeEnvColorControllerDispatchWorld` is the active-state CNS EnvColor dispatch boundary: it records controller telemetry, extracts static or resolved dynamic typed `envcolor` operations, records operation telemetry, and hands bounded stage-flash event emission to `RuntimeEnvColorWorld`. `PlayableMatchRuntime` still owns trigger filtering, ordering, stage-world ownership, and pause/hitpause callback routing.
- `RuntimeEnvShakeControllerDispatchWorld` is the active-state CNS EnvShake dispatch boundary: it records controller telemetry, extracts typed `envshake` operations when available, records operation telemetry, and hands bounded camera-shake event emission to `RuntimeEnvShakeWorld`. `PlayableMatchRuntime` still owns trigger filtering, ordering, actor/world ownership, and FallEnvShake routing.
- `RuntimeStateTypeWorld` is the passive metadata setup boundary: it applies bounded `StateTypeSet` `stateType` / `moveType` / `physics` mutations from typed `metadata:statetypeset` operations, raw controller params, or the bounded active-state enum-expression fallback covered by `synthetic-imported-statetypeset-dynamic.json`. `StateControllerExecutor` still owns controller routing and broad runtime-controller execution; broad string-param parity, helper/team/redirect ownership, exact physics/tick-order interactions, and full StateTypeSet parity remain blocked.
- `RuntimeDamageScaleWorld` is the passive damage-scale setup boundary: it applies bounded `AttackMulSet` and `DefenceMulSet` multiplier mutations from typed `damage-scale:*` operations or raw controller params, while `RuntimeControllerDispatchWorld` can record resolved dynamic `AttackMulSet value` / `DefenceMulSet value` params as typed `damage-scale:*` telemetry after expression evaluation. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution; exact scaling stack/order, helper/projectile/custom-state/guard/target edge cases, redirects, rounding, and tick-order parity remain blocked.
- `RuntimeHitDefenseWorld` is the passive defensive-slot setup boundary: it applies bounded `HitBy`, `NotHitBy`, and `HitOverride` slot mutations from typed `eligibility:*` / `hitoverride` operations or raw controller params. `StateControllerExecutor` still owns controller routing, expression context creation, and broad runtime-controller execution; exact attr grammar, slot priority, helper/custom-state redirect breadth, and tick-order parity remain blocked.
- `RuntimeHitDefControllerDispatchWorld` is the active-state CNS HitDef activation dispatch boundary: it records controller telemetry, extracts typed `hitdef` operations when available, preserves raw-param fallback attack payloads, deduplicates fired HitDefs by state/line/frame, hands the current AIR frame's first `Clsn1` into `currentMove`, and records operation telemetry. `PlayableMatchRuntime` still owns trigger filtering, ordering, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, and target/reversal consequences.
- `RuntimeReversalControllerDispatchWorld` is the active-state CNS ReversalDef dispatch boundary: it records controller telemetry, extracts typed `reversaldef` operations when available, falls back to raw controller params for partial compatibility, hands bounded activation to `RuntimeReversalWorld`, and records operation telemetry. `PlayableMatchRuntime` still owns trigger filtering, ordering, current-frame hitbox lookup, and later ReversalDef counter-result state routing.
- `RuntimeEffectSpawnControllerDispatchWorld` is the active-state CNS effect-spawn dispatch boundary: it records controller telemetry, extracts typed `explod` / `removeexplod` / `modifyexplod` / `helper` / `projectile` / `modifyprojectile` operations when available, hands bounded spawn/count mutation to `RuntimeEffectSpawnWorld`, and records operation telemetry only after a successful spawn/removal/mutation. `PlayableMatchRuntime` still owns trigger filtering, ordering, actor/opponent context, effect actor world ownership, and exact spawn/combat ordering.
- `RuntimeFallEnvShakeControllerDispatchWorld` is the active-state CNS FallEnvShake dispatch boundary: it records controller telemetry, extracts typed `fallenvshake` operations when available, emits the bounded fall-shake event through `RuntimeEnvShakeWorld`, clears consumed `hitFall.envShake` metadata, and records operation telemetry only after a real event. `PlayableMatchRuntime` still owns trigger filtering, ordering, actor/world ownership, and upstream HitDef fall metadata.
- `RuntimePauseControllerDispatchWorld` is the active-state CNS Pause/SuperPause dispatch boundary: it records controller telemetry, extracts typed `pause` operations when available, hands application to the match pause handler, and records operation telemetry only after a real pause result. `RuntimeMatchPauseControllerWorld` owns the current match pause result side effects, while `PlayableMatchRuntime` still owns trigger filtering, ordering, paused-match progression, and hitpause ignored routing.
- `RuntimeActorConstraintControllerDispatchWorld` is the active-state CNS Width/Height/Depth dispatch boundary: it records controller telemetry, resolves bounded dynamic params, and hands scalar mutation with destination-localcoord scale to `RuntimeActorConstraintWorld`. Current Helper dispatch reuses that boundary for Width, Height, and IKEMEN Depth, while verified Helper RedirectID writes retain the resource lease/writeback owner. `RuntimeCollisionOverrideWorld` owns ordered one-frame `OverrideClsn` mutation and group projection over AIR Clsn1/Clsn2 or the current Width/Height size box; frame-start reset applies across normal, pause, and hitpause branches. `RuntimeBoundsControllerWorld` owns `PlayerPush`, `PosFreeze`, and `ScreenBound` setup from typed ops or raw params, including same-frame PlayerPush value/priority/AffectTeam composition. `RuntimeRootBodyPushWorld` owns bounded root and active-root Helper pair admission through team policy, state size-box X/Y plus current bounded Width/Height/OverrideClsn deltas, Clsn2 or SizePushOnly, priority/weight/pushfactor, legacy-MUGEN five-world-unit minimum width, and exact X-center tie direction, then delegates X/logical-Z projection to `RuntimeActorConstraintWorld`. `PlayableMatchRuntime` still owns trigger filtering, root RedirectID resolution with caller-to-target localcoord scaling, target-reset deferral for cross-root Width/Height/Depth writes, ordering, stage clamp, and body-push scheduling.
- `RuntimeTraceGate.requiredHitEffectEvents` also supports selected-frame and multi-frame AIR metadata requirements for hit sparks: a gate can require selected frame offset/duration, minimum asset-frame count, minimum authored total duration, and exact observed frame indices. Current common/default and FightFX required sparks use this to prove a supplied library delivers selected first-frame offset `3,-4`, first-frame duration `5`, two frames `[0, 1]`, and total duration `11` before any Three.js renderer lookup or fallback claim. `RuntimeTraceGate.requiredContactEffectPackages` is the bounded cross-event oracle for direct `HitDef` presentation packages: it requires a sound event and a hit-effect event from the same actor to share a non-empty `contactId`, `contactTick`, and `contactKind`, without claiming exact intra-tick playback/render ordering.
- `createImportedFighterDefinition` maps a decoded local character into the playable loop only when AIR actions and SFF sprites are available. It attaches parsed CMD `[State -1]` entries, statedefs, commands, and HitDef-derived move data, including a narrow attr/guard-damage/guard-stun path, so the match runtime can route simple imported attacks. Partial `HitBy`/`NotHitBy`, `HitOverride`, `ReversalDef`, `AttackMulSet`/`DefenceMulSet`, `HitDef p1stateno`/`p2stateno`, and target-memory controllers affect hit eligibility, counters, damage scaling, simple state ownership, and recent target side effects. `TargetState` can route a recent target into the controller owner's known state data. `p2stateno` can enter a known attacker-owned state, keep that owner through chained `ChangeState`, clear ownership through `SelfState`, or use the target's own known state data when `p2getp1state = 0`. Runtime snapshots now expose `actorKind`, `ownerId`, `rootId`, and `parentId` for players/effects, plus separate `spriteOwnerId`/`spriteOwnerDefinitionId` for owner-backed animation rendering. `ChangeAnim2` in an owned state resolves the owner AIR action before rendering. Complex CNS/custom-state ownership remains outside the current executable subset.
- `MugenSnapshot.matchPause` exposes the `RuntimePauseWorld` snapshot for HUD/debug/Three.js rendering. `MugenSnapshot.compatibilitySession` records imported states and supported controllers that actually executed in the current Runtime Mode session. It is intentionally separate from the immutable `MugenCharacter.compatibility` report.
- `MugenStageDefinition` models native demo stages, the Training Grid fallback, and imported stage `.def` output with floor, bounds, camera, starts, simple layers, optional native image assets, embedded stage actions, layer `id` control targets, and parsed `BGCtrlDef`/`BGCtrl` groups. Imported stages preserve BG section/type, sprite/action metadata, initial velocity, parallax inputs, tiling inputs, and composed controller timing/params in the model; decoded stage SFF archives stay in `MugenStagePackage` and are registered with the Three.js render adapter so snapshots do not own canvas/texture state. `stageProjection.ts` handles the current bounded tiling, simple parallax math, composed BGCtrl timing, stateful recognized motion, and the runtime-only Enabled animation clock as pure adapter helpers.
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

Constraint execution addendum: RuntimeActorConstraintWorld now owns one-frame
Width edge/player/value state for current roots and first-generation Helpers,
including facing-aware current X insets. RuntimeBoundsControllerWorld still
owns ScreenBound setup, while HelperSystem carries the resulting ScreenBound
and StageBound state through per-frame reset, snapshots, and verified
RedirectID writeback before the existing X/Z projection. The port does not
claim camera behavior, source scheduler order, nested Helper ownership, or
upstream parity from this boundary.

## Current Milestone Scope

The app now has two modes:

- `Runtime Mode`: first-screen playable fight prototype with three active local atlas-backed demo fighters, optional loaded-character AIR/SFF route, original Rooftop Dojo stage, Training Grid fallback, stage HUD, keyboard/touch controls, collision overlays, hit pause, partial `Pause`/`SuperPause`, hit stun, damage, round timer, KO/time-over, compatibility export, and debug panels.
- `Inspector Mode`: load, parse, inspect, play AIR actions, step frames, and see collision boxes for external local MUGEN characters.

Complete SFF/CNS/ZSS/stage compatibility is intentionally layered. The first stable runtime art path is atlas PNG + `manifest.json.frame_layout`; direct SFF v1/PCX and SFF v2 RAW/RLE8/RLE5/LZ5 decoding now exist for Inspector rendering and an imported Runtime route. Imported stage `.def` parsing now feeds match setup and can render static/tiled/action-backed normal BG sprites from a decoded stage SFF; recognized BGCtrl types have a bounded renderer executor; BG `trans`/`alpha` and rectangular `window`/`maskwindow` data now reach bounded Three.js material/geometry handoffs, while exact timing/parity/windowdelta/zoom/mask color-key behavior remain later layers. The current CNS bridge covers CMD `[State -1]` `ChangeState` routing plus statedef/HitDef-derived basic attacks with partial guard handling, simple `p1stateno`/`p2stateno` routing, owner-preserving `ChangeState` chains inside attacker-owned target states, target-owned `p2getp1state = 0` routing, basic `SelfState` return, and a growing tick-by-tick controller subset. The next major architecture bridge is a typed compiler/IR layer so controller support does not remain raw-string execution inside the match runtime.

## References

- Elecbyte MUGEN overview: https://www.elecbyte.com/mugendocs-11b1/mugen.html
- Elecbyte AIR format: https://www.elecbyte.com/mugendocs-11b1/air.html
- Elecbyte CNS format: https://www.elecbyte.com/mugendocs/cns.html
- Elecbyte state controllers: https://www.elecbyte.com/mugendocs/sctrls.html
- Ikemen GO: https://ikemen-engine.github.io/
- Ikemen GO repository: https://github.com/ikemen-engine/Ikemen-GO
- IKEMEN-GO reference notes: `docs/IKEMEN_GO_REFERENCE.md`
- Elecbyte Sprmake2/SFF notes: https://www.elecbyte.com/mugendocs/sprmake2.html

## 2026-08-02 T511 Ikemen `GetHitVar(guardflag)` addendum

Direct, root-Projectile, Helper-direct, and verified Helper-Projectile contact
paths retain the effective HitDef guard flag in last-hit metadata, using the
runtime `MA` default when omitted. Static equality and inequality filters use
a typed overlap predicate over the active expression actor, preserving
redirect ownership and Ikemen's `M = H|L` expansion. Dynamic filters,
`hitflag`, `GetHitVarSet`, and broader custom-state ownership remain outside
this boundary.

## 2026-08-02 T512 Ikemen `GetHitVar(projid)` addendum

Projectile contact resolution now copies the authored Projectile ID into
defender last-hit metadata. `GetHitVar(projid)` is numeric, returns that ID for
Projectile contacts, and returns `-1` for direct HitDef contacts or missing hit
metadata. The field follows the active expression actor and existing redirects;
Projectile lifecycle and full ownership parity remain outside this boundary.

## 2026-08-02 T513 Ikemen `GetHitVar(teamside)` addendum

Last-hit metadata now retains the effective 1-based team side from the direct
HitDef or Projectile. Explicit `teamside` values win; omitted local parameters
fall back to the attacker/root identity. `GetHitVar(teamside)` returns `-1`
without hit metadata and follows the active redirected expression actor.

## 2026-08-02 T514 Ikemen `GetHitVar(keepstate)` addendum

Direct HitDef metadata now retains the authored boolean `keepstate` flag from
imported and dynamic HitDef operations. The shared read model projects it as a
numeric `GetHitVar(keepstate)` value (`1` for true, `0` for false or missing),
while Projectile and Reversal paths intentionally retain the false fallback.

## 2026-08-02 T515 Ikemen `GetHitVar(frame)` addendum

Direct HitDef and Projectile hit/guard resolution now writes an ephemeral
same-frame marker into last-hit metadata. The frame-start boundary clears that
marker once the actor is no longer in hitpause, so controller expressions read
numeric `1` only for the local contact frame while existing hit metadata stays
available for later reads.

## 2026-08-02 T516 Ikemen `GetHitVar(priority)` addendum

Last-hit metadata now carries the normalized direct HitDef attack priority and
the Projectile HitDef default. The existing Projectile `priority` field remains
the controller's `projpriority` clash value, so the two numeric concepts do not
share storage or readback semantics.

## 2026-08-02 T517 Ikemen `GetHitVar(dizzypoints)` addendum

Last-hit metadata now carries authored direct and Projectile HitDef
`dizzypoints` in `sourceDizzyPoints`. The field is read numerically through the
shared `GetHitVar` boundary and remains separate from the defender's mutable
`dizzyPoints` resource; missing metadata reads `0`. Cumulative multi-hit reset
semantics and `GetHitVar(guardpoints)` remain outside this bounded seam.

## 2026-08-02 T518 Ikemen `GetHitVar(guardpoints)` addendum

Last-hit metadata now carries authored direct and Projectile HitDef
`guardpoints` in `sourceGuardPoints`. The field is read numerically through the
shared `GetHitVar` boundary and remains separate from the defender's mutable
`guardPoints` resource; missing metadata reads `0`. Cumulative multi-hit reset
semantics and `GetHitVar(guardpower)` remain outside this bounded seam.

## 2026-08-02 T519 Ikemen `GetHitVar(redlife)` addendum

Last-hit metadata now carries authored direct and Projectile HitDef `redlife`
in `sourceRedLife`. The field is read numerically through the shared
`GetHitVar` boundary and remains separate from the defender's mutable `redLife`
resource; missing metadata reads `0`. `guardredlife`, cumulative reset
semantics, and full parity remain outside this bounded seam.

## 2026-08-02 T520 Ikemen `GetHitVar(guardpower)` addendum

Last-hit metadata now carries the second authored `givepower` value in
`sourceGuardPower`. The field is read numerically through the shared
`GetHitVar` boundary and remains separate from the defender's mutable `power`
resource; missing metadata reads `0`. `GetHitVar(hitpower)`, current power
resource readback, and cumulative reset semantics remain outside this seam.

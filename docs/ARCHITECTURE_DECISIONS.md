# Architecture Decisions

## T529: global AssertSpecial is a live-actor MatchWorld reducer

Status: accepted, closed-bounded.

Decision: reduce global `AssertSpecial` flags from all non-destroyed IKEMEN
roots, reserves, and Helpers at the current tick. Round finish, match
snapshots, lifebar, and resource projections consume the same versioned
snapshot; no consumer derives ownership from the active P1/P2 pair. Legacy and
single-mode profiles retain their existing pair-compatible path. Pause-layer
sampling, shared-resource mutation, and full team-round parity remain separate
decisions.

Evidence: Issue 103; focused round/snapshot/runtime coverage 30/30; typecheck
pass; existing trace corpus 684/684.

Issue 104 pause boundary: `RuntimePauseGlobalAssertSpecial/v0` samples live
roots/reserves/Helpers per pause tick for diagnostics. It does not freeze the
post-KO clock or invent a pause-specific `TimerFreeze` mutation: the pinned
M.U.G.E.N/Ikemen research keeps `TimerFreeze` on the fight timer and
post-round timing independent. Pause timer/display policy remains a separate
source-backed cut.

## T522-T526: last-hit metadata stays typed and contact-owned

Status: accepted, closed-bounded.

Decision: preserve authored score, effective hit/guard `givepower`, and
`p2facing` as separate optional fields in the last-hit read model. Direct and
player-owned Projectile combat populate them at contact time; the evaluator
does not infer them from mutable score, power, or live facing. Guard contacts
only populate fields whose official contract covers guard interaction. T525
`guardcount` is a cumulative contact counter with explicit idle reset. T526
adds `comboHitCount` as a separate mutable readback for bounded direct and
player-owned Projectile contacts; the `ikemen-go` profile enables it for
authored `hitCount`/`numhits` contacts, while static M.U.G.E.N traces retain
that field as a compatibility fallback. T527 closes one required authored
multi-hit Projectile route. T528 closes Ikemen `xveladd`/`yveladd` as
separate KO-delta fields instead of deriving them from live velocity.

## T528: KO velocity-add readback stays profile-scoped

Status: accepted, closed-bounded.

Decision: retain optional `hitVelocityAdd` metadata in the last-hit model and
populate it only for lethal direct or root-owned Projectile contacts under
`ikemen-go`. The expression reader returns the two deltas and defaults to
zero elsewhere; authored HitDef velocity and live velocity remain separate.

## T505 Gallery: inventory is a view over the existing Lab authority

Status: accepted, closed-bounded.

Decision: derive Gallery cards and action indexes from `getAvailableFighters()`
and the same `fighter.animations` map used by the timeline. URL state selects a
fighter/action/frame, while the isolated preview runtime remains the only
playback authority. This permits imported roster inspection without duplicating
animation data or changing Match selection.

## T479: CommonFX coordinate scale belongs to asset resolution

Status: accepted, closed-bounded.

Decision: `HitSparkAssetSystem` owns the CommonFX/FightFX package coordinate
conversion. It carries authored `localcoord` into the runtime AIR frame and
derives `fx.scale * 320 / fx.localcoord.x * character.localcoord.x / 320`
before the renderer sees the frame. `HitSparkRenderer` remains responsible only
for sprite binding, axis/offset projection and mesh sizing. Exact timing,
palette/layer/audio/cache and custom-state transition parity remain separate.

## T480: authored fall Z belongs to fall metadata and HitFallVel

Status: accepted, closed-bounded.

Decision: preserve Ikemen `fall.zvelocity` as an optional typed component of
fall metadata across compiler, imported-fighter, projectile and `HitFallSet`
boundaries. `HitFallControllerSystem` owns the final write into
`combatDepth.velocity`; omitted Z remains no-change, matching the source
contract. Do not synthesize a broader Z physics model or Common1 bounce table
from this seam.

## T481: HitDef vector Z belongs to contact resolution

Status: accepted, closed-bounded.

Decision: preserve the optional third component of Ikemen HitDef
`ground/air/down/guard/airguard.velocity` through typed compiler, imported
state and player-owned Projectile data. Let the shared combat resolver select
the context-specific value and let direct/projectile combat write only explicit
Z into `combatDepth.velocity`; omitted Z remains absent.

Why: Ikemen documents the third vector component as contact velocity, while the
sandbox already has a single depth-velocity seam. Keeping selection in the
shared resolver avoids divergent direct/projectile semantics without inventing
Common1 physics.

Gate: focused 251/251, final 324/3317, typecheck, build, boundaries and 682/682
trace gates pass. ModifyHitDef Z mutation, Common1 Z acceleration/friction and
full depth parity remain outside this decision.

## T482: static ModifyHitDef Z is an active-move mutation

Status: accepted, closed-bounded.

Decision: let static `ModifyHitDef` retain authored third components from the
five HitDef velocity vectors and mutate the active normal `DemoMove` in place;
keep omitted Z unchanged and preserve the existing `down.velocity` X/Y path.

Why: Ikemen defines `ModifyHitDef` as an update of the currently active HitDef.
Routing its Z metadata through the existing T481 move/resolver seam keeps direct
and projectile contacts consistent without adding dynamic expression or Common1
physics claims.

Gate: focused compiler/HitDef mutation coverage passes 2 files/89 tests; final
324/3317 suite, typecheck/build/boundaries and 682/682 trace gates pass.

## T483: HitDef acceleration is authored hit metadata

Status: accepted, closed-bounded.

Decision: preserve static `xaccel`, `yaccel` and `zaccel` on typed HitDef and
Projectile metadata, copy them into defender `RuntimeGetHitVars` on direct or
projectile contact, and expose the same keys through `GetHitVar`. Omitted
horizontal/depth fields return the official zero default.

Why: Ikemen's hit resolution stores these values in get-hit variables, while
the current runtime has no matching acceleration/depth integrator. Keeping the
values as explicit metadata gives imported and player-owned projectile paths a
shared observable contract without claiming physics or dynamic mutation.

Gate: focused compiler/HitDef/direct/projectile/imported-fighter/expression
coverage passes 7 files/249 tests; typecheck and boundaries pass. Physics,
localcoord/facing scaling, dynamic expressions and score movement remain out
of scope.

## T484: static ModifyHitDef acceleration mutates active hit metadata

Status: accepted, closed-bounded.

Decision: allow static `ModifyHitDef` `xaccel`, `yaccel` and `zaccel` to update
the active normal `DemoMove.hitVars` in place, preserving the same direct and
projectile `GetHitVar` contract as T483. Omitted fields remain unchanged.

Gate: focused compiler/HitDef mutation coverage passes 2 files/89 tests;
typecheck passes. Scaling, physics, helper/team ownership and score movement
remain outside this decision.

## T485: dynamic acceleration metadata uses the active controller context

Status: accepted, closed-bounded.

Decision: retain supported scalar expressions for HitDef and ModifyHitDef
`xaccel`, `yaccel` and `zaccel`, evaluate them with the existing active
controller context, and write only finite results into typed hit metadata.
Static numbers remain the fast path; this does not add acceleration physics or
dynamic support for other ModifyHitDef fields.

## T486: expose active depth velocity as an Ikemen-only GetHitVar

Status: accepted, closed-bounded.

Decision: map `GetHitVar(zvel)` to the already materialized
`CharacterRuntimeState.hitVelocity.z`, returning zero when no optional depth
component exists. Keep the alias in the shared runtime read model without
claiming legacy M.U.G.E.N support, depth physics or fall-Z behavior.

Gate: focused compiler/HitDef coverage passes 7 files/250 tests; final
324/3321 suite, typecheck/build/boundaries, 682/682 traces and asset hygiene
pass. Scaling, physics, helper/team ownership and score movement remain out of
scope.

## T487: keep Ikemen HitVelSet Z on the existing kinematic seam

Status: accepted, closed-bounded.

Decision: preserve static `HitVelSet z` in the same typed operation as X/Y and,
when its flag is nonzero, copy the active hit's optional depth velocity into
`combatDepth.velocity`. Do not infer Z when no hit exists and do not widen this
decision into generic depth physics or legacy M.U.G.E.N behavior.

## T488: preserve HitDef velocity families in the Ikemen read model

Status: accepted, closed-bounded.

Decision: store the last direct HitDef/Projectile ground, air, down, guard and
airguard vectors as typed metadata on `RuntimeGetHitVars`; resolve each x/y/z
dotted alias through the shared `GetHitVar` path with zero fallback. Keep this
readback seam independent from dynamic vector evaluation, Z physics and string
attribute triggers.

Gate: four focused files/133 tests, final 324/3324 suite, typecheck/build/
boundaries, 682/682 traces, asset hygiene and diff hygiene pass.

## T489: retain authored HitDef damage components in GetHitVar

Status: accepted, closed-bounded.

Decision: store the first and second damage components on the shared hit-variable
record as `hitDamage` and `guardDamage`, while preserving the effective contact
`damage` value used by the existing combat path. Resolve them through
`GetHitVar(hitdamage|guarddamage)` for direct HitDef and player-owned Projectile
contacts without widening the slice into resource or scaling semantics.

Gate: three focused files/114 tests, final 324/3324 suite, typecheck/build/
boundaries, 682/682 traces, asset hygiene and diff hygiene pass.

## T490: preserve separate HitDef reaction animation types

Status: accepted, closed-bounded.

Decision: retain ground, air, and fall reaction animation types in the shared
hit-variable record. Keep `GetHitVar(animtype)` as the existing effective value,
and expose the three Ikemen dotted aliases through the same read model. Apply
the documented ground-to-air and air-to-fall defaults at materialization.

Gate: seven test files/256 tests, final 324/3327 suite, typecheck/build/
boundaries, 682/682 traces, asset hygiene and diff hygiene pass. Common1
reaction-state choreography and full parity remain blocked.

## T491: retain fall EnvShake multiplier metadata

Status: accepted, closed-bounded.

Decision: add the optional `fall.envshake.mul` value to the existing typed
fall EnvShake metadata instead of widening the renderer or camera contract.
Direct HitDef, player-owned Projectile, and imported moves preserve authored
values; the shared `GetHitVar` read model returns the official default `1` when
the field is absent.

Gate: seven test files/258 tests, final 324/3329 suite, typecheck/build/
boundaries, 682/682 traces, asset hygiene and diff hygiene pass. Exact
EnvShake playback and full parity remain blocked.

## T492: expose source `playerno` through GetHitVar

Status: accepted, closed-bounded.

Decision: reuse the existing `sourcePlayerNo` hit metadata populated by direct
HitDef and player-owned Projectile contacts. `GetHitVar(playerno)` reads that
attacker slot and defaults to `0`; it never aliases the defender's own
runtime `PlayerNo` and does not widen the slice into string attributes or
helper/team ownership.

Gate: three test files/119 tests, final 324/3330 suite, typecheck/build/
boundaries, 682/682 traces, asset hygiene and diff hygiene pass.

## T506: keep source `playerid` separate from `playerno`

Status: accepted, closed-bounded.

Decision: extend the existing typed hit-source metadata boundary with numeric
`sourcePlayerId`. Root and verified Helper direct/Projectile contacts pass the
registered runtime ID; Helpers retain their own ID while inheriting their
root's player slot. `GetHitVar(playerid)` reads only this numeric field and
defaults to `0`; string actor IDs are not parsed as identity.

Gate: five focused files/178 tests and five deterministic IKEMEN trace checks
pass. Typecheck, 356-module build, boundaries and asset hygiene pass. T508 later
restores the aggregate trace baseline; browser smoke is N/A and scores remain
unchanged.

## T507: keep deprecated `ID` as a read alias

Status: accepted, closed-bounded.

Decision: normalize case-insensitive `GetHitVar(ID)` to the existing T506
numeric source identity. Do not create `sourceId`, parse string actor IDs, or
widen the expression value model.

Gate: one focused shared-expression file / 27 tests passes. T506 propagation
remains unchanged.

## T508: bind required trace labels to roster authority

Status: accepted, closed-bounded.

Decision: derive the required identity trigger and nonlethal HitDef event label
from the active second demo fighter. Do not duplicate public-roster literals in
trace presets and do not restore retired characters to satisfy evidence.

Gate: focused 2/2 `RuntimeTraceGatePresets` tests and full `pnpm qa:trace`
682/682 pass (648 required, 34 optional). Typecheck, build, boundaries and diff
hygiene pass; browser smoke is N/A and scores remain unchanged.

## T509: expose guard KO without duplicating hit state

Status: accepted, closed-bounded.

Decision: map `GetHitVar(guardko)` directly to existing `sourceGuardKo` and
return numeric `1`/`0`. Keep contact materialization and round-win cause on the
same typed field.

Gate: three focused files / 121 tests, typecheck, 356-module build, boundaries,
and 682/682 traces pass. Browser smoke is N/A and scores remain unchanged.

## T510: keep `GetHitVar(attr)` as a typed predicate

Status: accepted, closed-bounded.

Decision: compile static Ikemen attribute filters, then compare them with the
active actor's existing `sourceAttr` through the shared hit-attribute matcher.
Do not widen the numeric `GetHitVar` API into a general string channel.

Gate: three focused files / 118 tests, typecheck, 356-module build, boundaries,
and 682/682 traces pass. Browser smoke is N/A and scores remain unchanged.

## ADR-014: Active-root constraints are actor-local

Status: accepted, initial cut implemented.

Decision: already-live explicit-Tag P3-P8 roots apply current sandbox stage-X constraints after local animation through `RuntimeRootMotionAdvanceWorld`. Constraint capability and actor-scoped schedule evidence are explicit. Do not enroll those roots in pair push, collision rendering, targets, effects, or combat implicitly.

Why: pinned IKEMEN applies actor bounds before its separate global push/hit passes. Local pair `separate` cannot represent plural team/geometry/priority semantics.

This file records the decisions that keep the project from drifting into disconnected demos. Each decision is intentionally short; implementation details belong in code and the workplan.

## ADR-001: MatchWorld Becomes The Runtime Boundary

Status: accepted, incremental.

Decision: `MatchWorld` is the public gameplay boundary for app, Studio, QA, and future modules. `PlayableMatchRuntime` may remain the internal integration runtime while systems are extracted, but new lifecycle, ownership, actor registry, and snapshot contracts should move toward `MatchWorld` or systems behind it.

Why: the project needs renderer-independent runtime truth for traces, Studio debugging, helper/projectile/explod ownership, and future modules.

Current cut: `RuntimeEffectActorWorld` is the accepted boundary for helper/projectile/explod stores. `MatchWorld` creates and injects it; `PlayableMatchRuntime` can request spawns, active-effect advances, presentation-effect advances, removals, snapshots, summaries, bounded terminal playback for resolved projectile hit/remove/cancel AIR actions, bounded owner contact-trigger memory for `ProjContact`/`ProjHit`/`ProjGuarded(projid)`, and bounded helper-local cancel-time reads for helper-parented Projectiles through that contract. `RuntimeProjectileCombatWorld` owns the bounded projectile contact/reject/override/damage/removal loop, bounded `projhits`/`projmisstime` re-contact cooldown, and bounded `projpriority` projectile-vs-projectile equal-priority trade plus higher-priority cancel/decrement resolution consumed by `RuntimeEffectActorWorld`. `RuntimeTargetWorld` is now the matching boundary for current target-memory mutation and reads: `MatchWorld` creates and injects it, while `PlayableMatchRuntime` reaches target remember, advance, snapshot, count, find, simplified Target* controller application, and target-link derivation through that contract. `MatchWorldLifecycleSystem` owns actor/effect lifecycle records and spawn/active/remove events used by `MatchWorld` and trace evidence. `ContactMemorySystem` now owns the bounded direct/projectile contact-memory mutations and reads for `MoveContact`/`MoveHit`/`MoveGuarded`, `HitCount`/`UniqHitCount`, `HitAdd`, `MoveReversed`, `ReceivedDamage`/`ReceivedHits`, projectile contact/time markers, and owner-state projectile cancel-time markers used by `ProjCancelTime(projid)`, while `PlayableMatchRuntime` remains the actor/state integration glue. `RuntimeResourceSystem` owns bounded `CtrlSet` / `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet` resource mutation, authored life/power max resolution, runtime power-delta clamping, bounded life deltas, control writes for match/direct-combat/projectile-combat/target/reversal paths, plus `VarSet` / `VarAdd` / `VarRangeSet` var/fvar/sysvar writes, while `StateControllerExecutor` remains the parameter resolution and controller dispatch layer. `RuntimeStunWorld` owns bounded hitstun/guardstun input-lock, per-frame timer/friction mutation, hitstun presentation-action requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration while `PlayableMatchRuntime` supplies concrete action/state predicates. `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic camera-shake projection while `PlayableMatchRuntime` remains the snapshot integration point. `RuntimeAudioWorld` owns bounded controller `PlaySnd`/`SndPan`/`StopSnd`, static audio metadata handoff for channel/lowpriority/volumescale/freqmul/loop/pan/abspan plus dynamic sound-value and numeric fallback event handoff for expression-backed `PlaySnd value`, channel, pan, and abspan params, and direct HitDef `hitsound`/`guardsound` event insertion while `PlayableMatchRuntime` remains the actor/snapshot integration point. `RuntimeHitEffectWorld` owns bounded direct HitDef `sparkno`/`guard.sparkno`/`sparkxy` event insertion while `PlayableMatchRuntime` remains the actor/snapshot integration point; the Three.js `HitSparkRenderer` now treats `S` refs as player AIR actions, classifies unprefixed refs as common/default and `F` refs as FightFX, resolves first-frame player AIR sprites when possible, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace, and falls back to bounded 180-frame overlay geometry with smoke diagnostics. `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset while `PlayableMatchRuntime` remains the stage snapshot integration point. `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `RemapPal`, `Trans`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking while `PlayableMatchRuntime` remains the actor/state integration point. `RuntimeActorConstraintWorld` owns bounded static and dynamic-fallback `Width`, one-frame actor constraints, stage clamp, and body-push separation; `RuntimeBoundsControllerWorld` owns static typed plus dynamic raw-expression `PlayerPush` body-push handoff while `PlayableMatchRuntime` remains the actor/state integration point. `RuntimeDirectCombatWorld` owns bounded same-tick direct `HitDef` priority win/trade mutation and direct hit/guard result mutation while `PlayableMatchRuntime` remains the collision, target, Common1, and custom-state integration point. `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and redirect mutation while `PlayableMatchRuntime` remains the state-entry validation hook. `RuntimeReversalWorld` owns bounded ReversalDef activation, active-counter detection, and direct counter-result mutation while `PlayableMatchRuntime` remains the state-entry and target-state routing hook. `FighterMatchState` no longer stores the raw effect actor store. `MatchWorld` exposes target-memory links from `RuntimeTargetWorld` snapshots for debug/trace evidence instead of rebuilding link semantics inline. This does not yet mean helper VM parity, exact projectile combat parity, exact direct-combat priority/throw/multi-hit parity, exact HitOverride slot/attr/redirect parity, exact ReversalDef priority/guard/projectile/helper/custom-state parity, exact contact-trigger timing/lifetime parity, exact projectile cancel timing/lifetime parity, exact multi-target projectile parity, exact priority/cancel/remove timing parity, exact target semantics, exact resource/variable scoping/redirect parity, exact guard/hitstun tick-order parity, exact EnvShake pause/stage/layer/waveform parity, exact audio timing/mixing/channel priority/positional parity, dynamic SuperPause sound-ref parity, exact package-backed common/FightFX spark asset lookup/binding/layering/timing/scale/palette parity, exact EnvColor blend/layer/window/pause parity, exact sprite draw-order/material/trail/palette/remap/Trans parity, exact player/edge collision/camera parity, exact effect pause/tick order, exact contact/combo lifetime parity, or full parent/root ownership parity.

Current damage-scale telemetry note: `RuntimeDamageScaleWorld` remains the bounded multiplier mutation boundary for `AttackMulSet` / `DefenceMulSet`, and `RuntimeControllerDispatchWorld` now records resolved dynamic `value` params as typed `damage-scale:*` telemetry after expression evaluation. This adds trace evidence for owner-local dynamic damage-scale params only; exact scaling stack/order, helper/projectile/custom-state/guard/target edge cases, redirects, rounding, controller-loop timing, and full damage-scaling parity remain outside the cut.

Previous sprite-effect presentation note: `RuntimeSpriteEffectWorld` includes bounded `AngleSet` / `AngleAdd` / `AngleMul` / `AngleDraw value/scale` render-angle/render-scale telemetry plus bounded dynamic `AfterImage time/length/timegap/framegap/paladd/palmul` ghost-trail telemetry through the sprite-effect boundary after expression resolution. This still does not prove exact axis pivot, collision rotation/scale, draw-order/palette interaction, exact AfterImage trail blending/cadence/palette math, or full presentation parity.

Current runtime fighter-advance hook-set cut: `RuntimeFighterAdvanceHookSetWorld` owns the bounded per-fighter advance hook-set factory used before `RuntimeFighterAdvanceWorld` executes. `RuntimeFighterAdvanceWorld` still owns order, while `PlayableMatchRuntime` still supplies concrete worlds, state/action callbacks, active-controller execution, stage bounds, and tick context. This is ownership cleanup only; exact MUGEN/IKEMEN player tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual/audio parity, and full player VM parity remain outside the cut.

Previous runtime active expression-context cut: `RuntimeActiveExpressionContextWorld` owns the bounded active-match expression-context factory used by imported state triggers and dynamic controller-param fallback. `RuntimeExpressionContextWorld` still owns the read model for target redirects, contact/projectile/effect-count reads, command/const/state/anim/hitvar reads, `HitDefAttr`, hitpause/hitover reads, and `InGuardDist`; the active factory centralizes stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and `InGuardDist` handoff before `RuntimeDispatchEvaluationWorld` and `RuntimeTriggerEvaluationWorld` evaluate expressions. This is ownership cleanup only; full expression language parity, composite `HitDefAttr` parity, helper/team redirect mutation, exact `InGuardDist` parity, deterministic MUGEN/IKEMEN RNG stream parity, and exact trigger/controller timing remain outside the cut.

Current runtime dispatch-evaluation cut: `RuntimeDispatchEvaluationWorld` owns bounded dynamic active-controller dispatch-param fallback. Compiled dispatch values win, dynamic expressions use a context factory backed by `RuntimeExpressionContextWorld`, numeric params require finite truncated results, and Boolean params use numeric truthiness. `PlayableMatchRuntime` still supplies actor/opponent/owner selection, random/time/animation callbacks, `InGuardDist`, concrete controller side effects, and VM timing. This is ownership cleanup only; full dynamic-param parity, helper/team redirect scopes, persistent-controller timing, and exact CNS controller-loop parity remain outside the cut.

Current runtime controller-evaluation-context cut: `RuntimeControllerEvaluationContextWorld` owns bounded `StateControllerExecutor` context creation for active runtime-controller dispatch. Owner const reads, actor hitpause reads, actor random callbacks, and stage-time forwarding now route through a named context factory while `PlayableMatchRuntime` still supplies actor/owner selection, deterministic random state, concrete const lookup, dispatch order, and VM timing. This is ownership cleanup only; full passive-controller parity, helper/team redirect scopes, exact random stream parity, and exact CNS controller-loop timing remain outside the cut.

Current runtime afterimage-sample cut: `RuntimeAfterImageSampleWorld` owns bounded `AfterImage` sample projection from actor runtime state plus current AIR frame. Cloned position, facing, self/state-owner sprite owner metadata, and sprite group/index/offset are now created outside `PlayableMatchRuntime` before `RuntimeSpriteEffectWorld` captures ghost-trail samples. This is ownership cleanup only; exact sampling cadence, blend/material parity, helper/team redirect presentation ownership, renderer parity, and full presentation parity remain outside the cut.

Current fighter state cut: `RuntimeFighterStateWorld` owns bounded fighter runtime-state construction for resource maxima, damage multipliers, initial action/control/resource state, command buffers, contact memory, telemetry buckets, injected world references, deterministic RNG seed, and lazy runtime-program compilation. `PlayableMatchRuntime` still supplies stage starts, actor ids, definitions, and injected match worlds. This is ownership cleanup only; exact player lifecycle parity, helper/custom-state clone breadth, team/simul roster ownership, intro/round lifecycle, and full actor registry parity remain outside the cut.

Previous match reset cut: `RuntimeMatchResetWorld` owns bounded match reset orchestration for round timer reset, pause reset, EnvColor reset, effect actor store reset, in-place P1/P2 recreation, helper TargetState handler reattachment, and reset logging. `PlayableMatchRuntime` still supplies concrete fighter construction, stage starts, injected worlds, and field assignment. This is ownership cleanup only; exact round-flow parity, continue/round intro semantics, helper/custom-state reset breadth, screenpack/lifebar reset behavior, and full match lifecycle parity remain outside the cut.

Previous helper TargetState binding cut: `RuntimeHelperTargetStateWorld` owns bounded helper TargetState handler attach/re-attach wiring for match actors. `PlayableMatchRuntime` delegates constructor/reset callback binding through the same world that already owns helper-owner validation, target lookup, unavailable-state no-op behavior, and owner-backed target state entry. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul, multi-target helper ownership, exact helper TargetState timing, and full Helper VM parity remain outside the cut.

Current match helper TargetState actor-resolution cut: `RuntimeMatchHelperTargetStateWorld` owns bounded match-roster target resolution for helper-owned `TargetState` entry outside `PlayableMatchRuntime`. It resolves target actor payloads through the supplied actor roster before delegating owner validation and no-op result semantics to `RuntimeHelperTargetStateWorld`, while the match runtime still supplies the concrete 1v1 roster, state availability, and state-entry hooks. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState timing, and full Helper VM parity remain outside the cut.

Current presentation snapshot cut: `RuntimeMatchPresentationSnapshotWorld` owns bounded match presentation snapshot input construction outside `PlayableMatchRuntime`. Camera shake, stage flash, and P1/P2 effect snapshot groups now route through one seam before `RuntimeSnapshotWorld.match()` assembles the renderer-independent match snapshot. This is ownership cleanup only; exact stage/motif camera logic, effect lifecycle semantics, renderer/audio parity, visual/debug UI parity, and full match snapshot parity remain outside the cut.

Previous active-controller telemetry cut: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`. Active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch now share one controller/operation hook set before forwarding into `RuntimeCompatibilityTelemetryWorld`. This is ownership cleanup only; exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, and full CNS VM parity remain outside the cut.

Previous combat/helper state-hook cut: `RuntimeMatchCombatStateHooksWorld` owns bounded combat state-hook adapter construction outside `PlayableMatchRuntime`. Direct/projectile combat hooks preserve state-owner availability and entry options; helper combat hooks keep self-owned availability checks while still forwarding entry options into the shared state-entry path. This is ownership cleanup only; helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, and full combat/helper VM parity remain outside the cut.

Previous match opponent context cut: `RuntimeMatchOpponentContextWorld` owns bounded current 1v1 match-opponent context construction for active/pause/hitpause lifecycle bridges outside `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`. It maps P1/P2 into direct opponent plus singleton lifecycle `opponents` list and fails closed for actors outside the current pair. This is ownership cleanup only; real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, and full match/helper VM parity remain outside the cut.

Previous helper/effect lifecycle context cut: `RuntimeEffectHelperContextWorld` owns bounded visual Helper lifecycle context construction outside `RuntimeEffectLifecycleWorld`. It validates complete owner runtime state, projects parent/root state, preserves current opponent id/state fallback, converts explicit lifecycle opponent lists into nearest-order helper `opponentRoster` entries, honors explicit roster overrides, forwards target candidates, and carries helper `TargetState` / telemetry hooks into active or paused Helper advancement. This is ownership cleanup only; real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, and full Helper VM parity remain outside the cut.

Previous match helper Projectile target-memory bridge cut: `RuntimeMatchHelperProjectileTargetWorld` owns bounded match-level forwarding for helper-parented Projectile target memory outside `PlayableMatchRuntime`. It forwards the owner, defender, projectile, and `RuntimeTargetWorld` from normal post-fighter combat into the lower helper projectile target-memory boundary, preserving fail-closed owner-projectile behavior. This is ownership cleanup only; helper-owned Projectile contact timing, exact target lifetime, helper custom-state tables, teams/simul actor registries, multi-target helper ownership, and full Helper/Projectile VM parity remain outside the cut.

Current helper telemetry ownership cut: `RuntimeHelperTelemetryWorld` owns bounded helper-local Projectile controller/op telemetry binding outside `PlayableMatchRuntime`. It installs owner callbacks, filters to `Projectile` controller/operation events, and keeps helper-state attribution with owner-state fallback. This is ownership cleanup only; exact helper Projectile tick timing, broader helper telemetry semantics, teams/simul helper ownership, visual/audio parity, and full Helper VM parity remain outside the cut.

Current match fighter-advance ownership cut: `RuntimeMatchFighterAdvanceWorld` owns bounded active 1v1 fighter-advance orchestration outside `PlayableMatchRuntime`. It routes P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start through one boundary while `RuntimeFighterAdvanceWorld` continues to own per-fighter internals. This is ownership cleanup only; exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, and full match VM parity remain outside the cut.

Previous pause-controller result ownership cut: `RuntimeMatchPauseControllerWorld` owns bounded Pause/SuperPause controller result side effects outside `PlayableMatchRuntime`. It keeps pause-state application routed through `RuntimePauseWorld`, applies SuperPause power deltas through an injected resource hook, and emits the existing match log line through one boundary. This is ownership cleanup only; exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, and full pause VM parity remain outside the cut.

Previous combat bridge ownership cut: `RuntimeMatchCombatBridgeWorld` owns bounded match interaction combat resolver construction outside `PlayableMatchRuntime`. It creates priority-clash, direct-combat, projectile-combat, and helper-combat callbacks for `RuntimeMatchInteractionWorld`, while the match runtime still supplies concrete combat worlds, state hooks, hurtbox lookup, projectile target-memory forwarding, and logging. This is ownership cleanup only; exact combat priority, helper-owned contact timing, projectile hit/cancel timing, teams/simul/multi-target breadth, visual/audio parity, and full combat VM parity remain outside the cut.

Previous move-start ownership cut: `RuntimeMoveStartWorld` owns bounded native/imported state-move startup outside `PlayableMatchRuntime`. It writes selected move metadata, resets move tick and hit/reversal state, marks attack `moveType`, and calls injected hooks for control and authored state entry. This is ownership cleanup only; exact command timing, cancel windows, combo/input priority, helper/team/redirect move startup, persistent-controller timing, visual parity, and full move VM parity remain outside the cut.

Previous match tick input ownership cut: `RuntimeMatchTickInputWorld` owns bounded normal-match input/tick stamping outside `PlayableMatchRuntime`. It writes actor `compatibilityTick`, clones `currentInput`, and pushes normal non-hitpause command-buffer samples while pause/hitpause buffering stays in the existing pause worlds. This is ownership cleanup only; exact command timing, input conflict priority, helper/team/redirect command ownership, pause/hitpause command parity, visual parity, and full input VM parity remain outside the cut.

Previous runtime frame/collision cut: `RuntimeFrameWorld` owns bounded current AIR frame lookup and collision-box projection for match runtime and snapshot consumers. Active move hitboxes, frame `Clsn1`, frame `Clsn2`, cloned boxes, and missing-frame default hurtboxes now share one boundary while `PlayableMatchRuntime` still owns controller/combat order, guard-distance policy, ReversalDef frame-Clsn1 handoff, and VM timing. This is ownership cleanup only; exact collision priority, frame timing, guard-distance thresholds, rotated/scaled box semantics, helper/team redirect collision ownership, and renderer parity remain outside the cut.

Current runtime trigger-evaluation cut: `RuntimeTriggerEvaluationWorld` owns bounded normalized `TriggerIr` expression evaluation for active/state-entry controller filtering. `RuntimeExpressionContextWorld` still owns the concrete read model, `RuntimeTriggerGateWorld` still owns grouping, and `PlayableMatchRuntime` still supplies actor/opponent/owner selection, random/time/animation callbacks, `InGuardDist`, dispatch, and VM timing. This is ownership cleanup only; full expression language parity, persistent-controller timing, helper/team trigger scopes, and exact CNS trigger tick-order parity remain outside the cut.

Current runtime trigger-gate cut: `RuntimeTriggerGateWorld` owns bounded `triggerall` AND plus numbered `triggerN` OR grouping for active/state-entry controller filtering. It now receives single-trigger pass/fail results through `RuntimeTriggerEvaluationWorld`; full expression language parity, persistent-controller timing, helper/team trigger scopes, and exact CNS trigger tick-order parity remain outside the cut.

Previous passive state-transition-controller cut: `RuntimeStateTransitionControllerWorld` owns bounded `ChangeState` / `SelfState` mutation from raw controller params. `StateControllerExecutor` now delegates value/stateno expression resolution, previous-state metadata writes, frame/time reset, optional `ctrl`, and missing-value reporting through that world while keeping controller routing and evaluation context ownership; `RuntimeStateEntryWorld` and `PlayableMatchRuntime` still own concrete active-state entry and action lookup. This is ownership cleanup only; exact ChangeState/SelfState tick order, persistent controller semantics, redirects, helper/team ownership, custom-state breadth, and full state-entry VM parity remain outside the cut.

Previous passive animation-controller cut: `RuntimeAnimationControllerWorld` owns bounded `ChangeAnim` / `ChangeAnim2` mutation from raw controller params. `StateControllerExecutor` now delegates animation retargeting, animation-source marking, frame/time reset, and bounded `elem` / `elemtime` seeding to the world while keeping controller routing and evaluation context ownership; `PlayableMatchRuntime` still owns active-state action lookup, state-owner selection, and controller tick order. This is ownership cleanup only; missing-action fallback, full active-state `elem`/`elemtime` parity, redirects/helper/team ownership, full state-owner namespace behavior, exact animation-source parity, and full animation-controller VM parity remain outside the cut.

Previous passive kinematic-controller cut: `RuntimeKinematicControllerWorld` owns bounded `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, and `Gravity` mutation from typed `kinematic:*` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing and evaluation context ownership; `RuntimeKinematicsWorld` still owns per-frame actor integration and landing behavior. This is ownership cleanup only; exact MUGEN/IKEMEN physics, velocity tick order, `yaccel` constants, helper/team/redirect ownership, and full kinematic VM parity remain outside the cut.

Previous passive hit-fall cut: `RuntimeHitFallControllerWorld` owns bounded `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutation from typed `hitfall:*` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing and evaluation context ownership. This is ownership cleanup only; exact Common1 controller-loop order, helper/team/redirect ownership, exact recovery thresholds/velocity math, and full fall/get-hit parity remain outside the cut.

Previous passive metadata cut: `RuntimeStateTypeWorld` owns bounded `StateTypeSet` `stateType` / `moveType` / `physics` setup from typed `metadata:statetypeset` operations, raw controller params, and the bounded active-state enum-expression fallback now gated by `synthetic-imported-statetypeset-dynamic.json`. `StateControllerExecutor` delegates those mutations to the world while keeping controller routing ownership. Broad string-param parity, helper/team/redirect ownership, exact physics/tick-order interactions, and full StateTypeSet parity remain outside the cut.

Previous passive damage-scale cut: `RuntimeDamageScaleWorld` owns bounded `AttackMulSet` and `DefenceMulSet` multiplier setup from typed `damage-scale:*` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing and evaluation context ownership. This is ownership cleanup only; exact scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, controller-loop timing, and full damage-scale parity remain outside the cut.

Previous passive hit-defense cut: `RuntimeHitDefenseWorld` owns bounded `HitBy`, `NotHitBy`, and `HitOverride` slot setup from typed `eligibility:*` / `hitoverride` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing and evaluation context ownership. This is ownership cleanup only; exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, controller-loop timing, and full defensive-slot parity remain outside the cut.

Previous HitDef-controller dispatch cut: `RuntimeHitDefControllerDispatchWorld` owns active-state HitDef activation dispatch from compiled CNS classification into the current attack payload: controller telemetry, typed `hitdef` operation extraction, raw fallback attack params, fired-HitDef dedupe, current-frame `Clsn1` hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry. This is ownership cleanup only; trigger filtering, active-state order, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, target/reversal consequences, exact hit window lifetime, multi-hit behavior, helper/projectile/custom-state ownership, broad attr grammar, hitpause/tick order, and exact HitDef parity remain outside the cut.

Previous ReversalDef-controller dispatch cut: `RuntimeReversalControllerDispatchWorld` owns active-state ReversalDef side-effect dispatch from compiled CNS classification into `RuntimeReversalWorld`: controller telemetry, typed `reversaldef` operation extraction, raw fallback activation payload, activation handoff, and operation telemetry. This is ownership cleanup only; trigger filtering, active-state order, current-frame hitbox lookup, ReversalDef counter-result state routing, exact priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, and exact ReversalDef parity remain outside the cut.

Current effect-spawn-controller dispatch cut: `RuntimeEffectSpawnControllerDispatchWorld` owns active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile side-effect dispatch from compiled CNS classification into `RuntimeEffectSpawnWorld`: controller telemetry, typed operation extraction, spawn/count mutation handoff, and success-gated operation telemetry. This is ownership cleanup only; trigger filtering, active-state order, actor/opponent context, effect actor world ownership, exact spawn tick order, helper-owned effect namespaces, helper-owned projectile combat/contact/target memory, and exact effect/helper/projectile parity remain outside the cut.

Current sprite-effect dispatch cut: `RuntimeSpriteEffectControllerWorld` owns active-state sprite-effect side-effect dispatch from compiled CNS classification into `RuntimeSpriteEffectWorld`: controller telemetry, typed operation extraction, operation telemetry, dynamic `SprPriority` / `PalFX time/add/mul/color/invertall` / `AfterImageTime value/time` / `RemapPal source/dest` / `Trans alpha` typed-operation resolution, dynamic `AfterImage` / `Angle value/scale` resolver handoff, and mutation handoff for `SprPriority`, `PalFX`, `RemapPal`, `AfterImage`, `AfterImageTime`, `Trans`, and `AngleSet` / `AngleAdd` / `AngleMul` / `AngleDraw`. `RuntimeAfterImageSampleWorld` now owns the actor/frame-to-sample projection used by that ghost-trail path. This is ownership cleanup plus bounded dynamic PalFX/AfterImageTime/RemapPal/Trans/SprPriority telemetry only; trigger filtering, active-state order, hitpause selection, render projection, helper/redirect ownership, and exact visual parity remain outside the cut.

Current target-controller dispatch cut: `RuntimeTargetControllerDispatchWorld` owns active-state Target / BindToTarget side-effect dispatch from compiled CNS classification into `RuntimeTargetWorld`: controller telemetry, typed operation extraction, operation telemetry, and mutation handoff with match-owned callbacks for damage scaling, TargetState entry, and target constants. This is ownership cleanup only; trigger filtering, active-state order, concrete state validation, target candidates, helper/projectile target ownership, multi-target semantics, throw binding, and exact target parity remain outside the cut.

Current contact-controller dispatch cut: `RuntimeContactControllerDispatchWorld` owns active-state contact-memory side-effect dispatch from compiled CNS classification into `RuntimeContactMemoryWorld`: controller telemetry, typed operation extraction, operation telemetry, `HitAdd` mutation, and `MoveHitReset` reset. This is ownership cleanup only; trigger filtering, active-state order, direct/projectile contact creation, exact combo lifetime, helper/projectile contact ownership, guard-count parity, and exact contact parity remain outside the cut.

Current audio-controller dispatch cut: `RuntimeAudioControllerDispatchWorld` owns active-state audio side-effect dispatch from compiled CNS classification into `RuntimeAudioWorld`: controller telemetry, static or resolved dynamic typed operation extraction for `PlaySnd`, `SndPan`, and `StopSnd`, authored raw sound-ref preservation for dynamic debug events, operation telemetry, and sound-event handoff. `RuntimeMatchPauseControllerWorld` covers bounded `SuperPause sound` refs by emitting through `RuntimeAudioWorld` when a pause starts and recording typed `audio:playsnd` telemetry for resolved dynamic pause sound refs. `RuntimeContactPresentationWorld` covers bounded resolved direct HitDef contact sound refs by recording typed `audio:playsnd` telemetry while keeping contact sound-event metadata. This is ownership cleanup plus bounded dynamic active-state audio operation telemetry, direct HitDef hitsound/guardsound typed contact telemetry, and SuperPause pause-start typed sound telemetry only; trigger filtering, active-state order, hit/contact timing, actor context, exact SND playback, channel priority, mixing, FightFX/common fallback, exact panning, projectile/helper contact-sound operation telemetry, super-background audio, and exact audio parity remain outside the cut.

Current EnvColor-controller dispatch cut: `RuntimeEnvColorControllerDispatchWorld` owns active-state EnvColor side-effect dispatch from compiled CNS classification into `RuntimeEnvColorWorld`: controller telemetry, typed operation extraction, dynamic raw-param resolver handoff, operation telemetry, and stage-flash event handoff. This is ownership cleanup only; trigger filtering, active-state order, stage-world ownership, pause/hitpause callback routing, dynamic typed-operation lowering, exact blend math, layer/window ordering, pause timing, renderer parity, and exact presentation parity remain outside the cut.

Current EnvShake-controller dispatch cut: `RuntimeEnvShakeControllerDispatchWorld` owns active-state EnvShake side-effect dispatch from compiled CNS classification into `RuntimeEnvShakeWorld`: controller telemetry, typed operation extraction, dynamic raw-param resolver handoff, operation telemetry, and camera-shake event handoff. This is ownership cleanup only; trigger filtering, active-state order, actor/world ownership, dynamic typed-operation lowering, `mul`, FallEnvShake routing, exact waveform, pause/stage/layer interaction, helper/redirect ownership, screenpack ownership, and exact presentation parity remain outside the cut.

Current FallEnvShake-controller dispatch cut: `RuntimeFallEnvShakeControllerDispatchWorld` owns active-state FallEnvShake side-effect dispatch from compiled CNS classification into `RuntimeEnvShakeWorld`: controller telemetry, typed operation extraction, fall-shake event handoff, consumed `hitFall.envShake` cleanup, and operation telemetry after a real event. This is ownership cleanup only; trigger filtering, active-state order, actor/world ownership, upstream HitDef fall metadata, exact waveform, pause/stage/layer interaction, helper/redirect ownership, and exact presentation parity remain outside the cut.

Current Pause-controller dispatch cut: `RuntimePauseControllerDispatchWorld` owns active-state Pause/SuperPause side-effect dispatch from compiled CNS classification into the match pause handler: controller telemetry, typed operation extraction, apply-controller callback handoff, and operation telemetry after a real pause result. `RuntimeMatchPauseControllerWorld` now owns the bounded result side effects after that handoff. This is ownership cleanup only; trigger filtering, active-state order, paused-match progression, hitpause ignored routing, exact pause layering, super background/sound/spark timing, helper/redirect ownership, and exact pause VM parity remain outside the cut.

Current bounds-controller cut: `RuntimeBoundsControllerWorld` owns passive `PlayerPush`, `PosFreeze`, and `ScreenBound` setup from typed `collision:playerpush` / `bounds:*` operations or raw controller params. `StateControllerExecutor` delegates these mutations while still owning controller routing, expression context creation, and broad runtime-controller execution; `RuntimeActorConstraintWorld` still owns per-frame reset/projection, stage clamp, and body-push separation. This is ownership cleanup only; exact player/edge collision, team/helper push behavior, screen-edge/camera parity, PosFreeze tick order, and exact constraint VM parity remain outside the cut.

Current actor-constraint-controller dispatch cut: `RuntimeActorConstraintControllerDispatchWorld` owns active-state Width side-effect dispatch from compiled CNS classification into `RuntimeActorConstraintWorld`: controller telemetry, typed operation extraction, operation telemetry, and body-width mutation handoff. This is ownership cleanup only; trigger filtering, active-state order, per-frame constraint reset, stage clamp, body-push ordering, exact player/edge collision, team/helper push behavior, screen-edge/camera parity, Width edge semantics, and exact constraint VM parity remain outside the cut.

Current variable/random cut: `VarRandom` is now a bounded `StateControllerExecutor` variable operation using deterministic sandbox-side actor RNG. `RuntimeRandomSystem` owns seed creation, LCG advance, controller-safe clamping, and fallback random-unit salt; `PlayableMatchRuntime` only stores the current actor seed and delegates advance. Trace evidence proves owner-local int var writes only, not exact MUGEN random stream or helper/parent/root variable scope.

Current presentation cut: `HitSparkAssetSystem` owns bounded HitDef spark asset-frame resolution from player AIR (`S`), common, and FightFX sources before the match loop emits `RuntimeHitEffectWorld` events. `RuntimeTraceGate.requiredHitEffectEvents` can require source/action/frame/sprite metadata for supplied common/default and FightFX libraries, and `RuntimeTraceGate.requiredContactEffectPackages` can require bounded sound + spark events to share direct-contact metadata. This keeps package-backed spark lookup and package correlation out of `PlayableMatchRuntime` without claiming exact lookup, layering, scale, palette, timing, or motif parity.

Current trace-gate addendum: required common/default and FightFX spark traces can also require selected-frame AIR metadata (`assetFrameOffsetX`, `assetFrameOffsetY`, `assetFrameDuration`) plus multi-frame AIR metadata (`minAssetFrameCount`, `minAssetTotalDuration`, `requiredAssetFrameIndices`) and summarize `assetFrameOffsetX`, `assetFrameOffsetY`, `assetFrameDuration`, `assetFrameCount`, `assetTotalDuration`, and `assetFrameIndices` in trace evidence. This proves bounded authored AIR frame selection and frame lists before renderer handoff; exact visual frame advance, sprite lookup, binding, layering, palette, and motif ownership remain outside the claim.

Gate: every extraction must preserve deterministic trace checksums unless the behavior change is intentional and documented.

Blocker rule: new gameplay lifecycle work should be routed through `MatchWorld` or a system behind it. Adding broad behavior directly to `PlayableMatchRuntime` is allowed only for a bounded bridge cut with a follow-up extraction note.

## ADR-002: Runtime Snapshots Are Renderer-Independent

Status: accepted.

Decision: runtime snapshots describe actors, effects, stage, audio events, debug data, and evidence without Three.js objects. Three.js, Web Audio, and DOM panels consume snapshots; they do not own gameplay state.

Why: MUGEN compatibility, trace artifacts, Studio, and future platformer modules need the same truth without a browser renderer.

Consequence: any renderer-only behavior that affects gameplay is a bug or transitional debt.

Gate: no CNS, CMD, hit rule, command buffer, controller, or combat decision can live in Three.js rendering code. Rendering may consume snapshots, debug flags, asset textures, and effect presentation data only.

## ADR-003: Controller Behavior Enters Through IR And ControllerOp

Status: accepted, partial.

Decision: new high-value CNS controller behavior should compile into typed IR and, when it mutates runtime state, emit typed operation evidence. Raw `controller.source` execution is allowed only as transitional debt.

Why: compatibility reports must distinguish parsed, recognized, compiled, routed, executed partial, executed parity, unsupported, and unknown. Controller-name counts alone are not enough.

Gate: trace gates for controller families should require `executedOperations` when a typed operation exists.

Blocker rule: every new controller family must define parsed support, compiled support, executed partial/parity support, ignored params, and unsupported params. Raw `controller.source` execution should shrink over time and remain visible as transition debt.

## ADR-004: Custom-State Ownership Is Runtime Evidence, Not A Renderer Trick

Status: accepted.

Decision: attacker-owned `p2stateno`, `p2getp1state`, owner-backed animation, target-owned state routing, chained `ChangeState`, and `SelfState` must be represented in runtime state and compatibility-session evidence.

Why: custom states are central to MUGEN throws, get-hit, fall, helpers, and many attacks. Rendering an owner sprite is not enough if the trace cannot prove who owns execution.

Gate: artifacts must identify actor id, logical source, state owner, executed states, executed controllers, and final actor constraints.

## ADR-005: SFF Pixel Data Must Separate From Browser Canvas

Status: accepted, migration pending.

Decision: the long-term model is decoded pixel/palette metadata in `src/mugen/*`, with canvas/ImageBitmap/texture materialization in browser adapters. Current `canvas` fields in `MugenSprite` and `SffParser` are transitional.

Why: parser and compatibility logic should run in tests, CLI tools, workers, and future module pipelines without `document`.

Gate: future SFF work should add renderer-independent pixel records before expanding canvas-dependent paths.

## ADR-006: Project Manifest And Runtime Manifest Stay Separate

Status: accepted.

Decision: `project.json` remains editor/source/provenance-facing. `runtime-manifest/v0` remains the smaller compiled contract the runtime can load. Export bundles include both plus evidence and reports.

Why: Studio needs rich source-package and provenance data, while the runtime needs stable, minimal, executable contracts.

Gate: Build Center must report runnable, partial, blocked, exportable, linked, and missing-source states separately.

Studio loop: authoring tools should close `save -> compile -> playtest -> evidence -> export`. Until a surface can close or explain that loop, it stays preview/diagnostic instead of claiming full editing support.

## ADR-007: Studio Has Two Public Modes

Status: accepted.

Decision: the product collapses toward two public modes: Playable Runtime and Creator Studio. Standalone Inspector remains transitional until Character/Stage Studio absorbs it with visual verification.

Why: separate Runtime, Inspector, and Studio modes compete mentally. Studio should organize project/assets/evidence/build/debug around the central playtest or preview.

Gate: every Studio badge needs linked evidence, affected asset/system, impact, and next action.

Product model: Studio screens are views into `Project -> assets/sourcePackages/modules/entry/compatibility/evidence/buildOutputs`. The preferred IA is Workbench, Assets, Evidence, and Build around the central playtest/preview, with Character Studio, Stage Studio, and Debug Studio as contextual diagnostics.

## ADR-008: Modular Engine Work Is Extracted, Not Invented Up Front

Status: accepted.

Decision: platformer, beat-em-up, arena, and custom modules are part of the horizon, but implementation waits until fighting contracts prove shared input, asset, tick, snapshot, render, audio, debug, build, and QA seams.

Why: a generic SDK built before KFM/Common1, actor ownership, and Studio evidence are stable would likely leak fighting assumptions anyway.

Gate: the first non-fighting slice must run from `runtime-manifest/v0` without importing CNS, HitDef, rounds, helpers, or MUGEN command routing into shared core.

## ADR-009: Generated Assets Are Native/Authored Evidence, Not MUGEN Compatibility

Status: accepted.

Decision: imagegen and `sprite-atlas-builder` outputs are first-class project assets with provenance and QA, but they do not count as imported MUGEN compatibility.

Why: generated fighters prove the native runtime and authoring pipeline; imported fixtures prove legacy compatibility.

Gate: bad walk/jump/crouch source motion must be regenerated as source art, not hidden by slicing/cropping.

## ADR-010: IKEMEN Starts As A Profile Scanner

Status: accepted.

Decision: IKEMEN-GO is a reference and compatibility target, but the first implementation is scanning/classification. IKEMEN-only files and features are recognized and reported before execution is attempted.

Why: ZSS/Lua/model stages and extended behavior would otherwise inflate support claims or destabilize the MUGEN path.

Gate: reports separate MUGEN 1.0, MUGEN 1.1, and IKEMEN-only recognized/unsupported features.

Blocker rule: IKEMEN execution needs code-level compatibility profiles first. Until then, IKEMEN work is scanner/reporting only, even if files can be parsed.

## ADR-011: Passive Controllers Move Behind Named Worlds

Status: accepted, incremental.

Decision: passive CNS controller mutation should leave `StateControllerExecutor` when a bounded named world can own it without changing broad tick order. `RuntimeStateTransitionControllerWorld` is the current passive example for basic `ChangeState` / `SelfState` mutation, while `RuntimeAnimationControllerWorld`, `RuntimeKinematicControllerWorld`, `RuntimeBoundsControllerWorld`, `RuntimeHitFallControllerWorld`, `RuntimeStateTypeWorld`, `RuntimeDamageScaleWorld`, and `RuntimeHitDefenseWorld` cover earlier passive setup families. Runtime expression/trigger read context should likewise leave `PlayableMatchRuntime` when one bounded world can own the current callback model; `RuntimeExpressionContextWorld` owns imported-state trigger reads and read-model creation, `RuntimeDispatchEvaluationWorld` owns dynamic dispatch-param fallback evaluation, `RuntimeControllerEvaluationContextWorld` owns passive-controller executor context creation for active runtime-controller dispatch, `RuntimeTriggerEvaluationWorld` owns single-trigger evaluation, and `RuntimeTriggerGateWorld` owns grouped trigger pass/fail order.

Why: the port needs smaller testable ownership seams before chasing full CNS VM parity.

Gate: each extraction must preserve current trace behavior or document intentional checksum drift, add focused system coverage, and state blocked parity claims.

## ADR-012: Root Phase Promotion Uses Immutable Capability Snapshots

Status: accepted, incremental.

Decision: explicit IKEMEN root execution selects `playable`, `active-motion`, or `bounded-standby` once before the normal actor pass. A controller may mutate live standby state, but it cannot widen its own remaining phase capabilities until the next normal tick. `active-motion` has a dedicated side-effect-free CNS profile and a dedicated controller-before-kinematics-before-animation executor.

Why: reusing full fighter advance would silently grant sprite effects, hit/contact/recovery, constraints, and pair-owned gameplay. Recomputing participation mid-pass would let TagIn alter its own remaining privileges and make actor order part of the security boundary.

Gate: every widened phase needs a versioned public capability, focused success/failure/reset/freeze tests, one required trace when behavior changes, stable historical gates, and an explicit browser requirement when presentation changes. Direct input/AI, effects, combat, round, presentation, and resources remain independent promotions.

## ADR-013: Root Presentation Uses Runtime-owned Consumer Projections

Status: accepted, implemented diagnostic collision cut.

Decision: multi-root draw and camera selection must be published by a renderer-independent runtime contract with separate ordered ids. `MugenSnapshot.actors` remains the stable playable/HUD/audio/collision pair; reserves remain separately addressable. Three.js resolves selected draw ids across those stores but cannot infer compatibility policy. Draw, shadow, camera, collision debug, hit sparks, effects, HUD, audio, combat, round, and resources remain separate consumers.

Why: appending a live P3-P8 root to `actors` would silently widen several pair-owned systems, while filtering only inside Three.js would hide compatibility policy from traces and Studio diagnostics. Pinned IKEMEN also treats standby, invisible, shadow, and camera as distinct axes.

Gate: the first implementation requires a versioned diagnostic, stable pair regression tests, required trace linkage, desktop/mobile screenshots, canvas-pixel and renderer-id checks, reset/stale-mesh proof, and explicit temporary-debt language for the immediate standby draw proxy. Exact outgoing/incoming overlap remains blocked until Tag ZSS choreography executes.

Implementation: `RuntimeRootPresentation/v1` owns independent draw/camera/collision-debug policy. Three.js strictly resolves selected draw and collision roots across pair/reserve storage; collision ids feed diagnostics only and cannot grant push or hit admission. Required checksum `97255586`, 543/543 traces, and desktop/mobile `[p1,p2] -> [p3,p2] -> [p1,p2]` proof close this gate without widening pair-owned gameplay consumers.

## T511: keep `GetHitVar(guardflag)` as a typed overlap predicate

Decision: retain the effective authored/defaulted guard flag at contact and
rewrite only static `=` / `!=` comparisons. Match flag masks by overlap,
including `M = H|L`, against the active expression actor.

Why: this mirrors current Ikemen compiler/bytecode behavior without widening
the numeric GetHitVar path into a general string channel.

Gate: direct, Projectile, Helper, redirected, missing-metadata, compiler, and
runtime-context coverage must pass. `hitflag` stays separate while the nightly
wiki and current `develop` compiler source disagree.

## T535: keep `GetHitVar(hitflag)` as a typed overlap predicate

Status: accepted, closed-bounded.

Decision: retain the effective direct/Projectile HitDef `hitflag` in
`sourceHitFlag`, default omitted values to `MAF`, and rewrite only static
`=`/`!=` comparisons. Reuse the normalized H/L/A/F/D/+/- mask matcher with
`M` expansion, while keeping the numeric `GetHitVar` path unchanged.

Evidence: issue 109; focused compiler/context/CNS/direct/projectile coverage
passes 5 files / 238 tests; existing trace corpus remains `686/686`.

Gate ceiling: dynamic flag expressions, reset/lifetime parity, RedirectID
ownership, rollback/netplay, and full M.U.G.E.N/IKEMEN parity remain separate.

## T512: keep `GetHitVar(projid)` as numeric last-hit metadata

Decision: copy the authored Projectile ID into defender hit metadata during
Projectile contact and expose it through the existing numeric GetHitVar path.
Direct HitDef and missing metadata return `-1`.

Why: current Ikemen bytecode reads a dedicated integer and uses the negative
sentinel to distinguish non-Projectile hits; no string channel or predicate
rewrite is needed.

Gate: compiler, RuntimeHitVar, direct, Projectile, Helper-source, and context
tests plus trace/build/type/boundary evidence.

## T513: keep `GetHitVar(teamside)` as numeric last-hit metadata

Decision: retain the effective 1-based source team side during direct and
Projectile contact. Prefer explicit HitDef/Projectile data and derive omitted
local values from the attacker/root identity; return `-1` without metadata.

Why: current Ikemen stores the internal team side with each GetHitVar record
and returns it plus one from bytecode. A typed numeric field preserves that
contract without mixing team topology into expression parsing.

## T514: keep `GetHitVar(keepstate)` as numeric direct-HitDef metadata

Decision: retain authored HitDef `keepstate` on imported and dynamic direct
HitDef metadata and project it as numeric `1`/`0` at the expression boundary.
Projectile and Reversal paths keep the false fallback until their authored
contracts are verified.

Why: current Ikemen copies `hd.KeepState` into the last-hit record and the
bytecode exposes the boolean directly. A typed optional field preserves the
contract without widening Projectile/Reversal semantics.

## T515: keep `GetHitVar(frame)` as an ephemeral contact marker

Decision: store a typed `frame` bit with direct HitDef and Projectile hit/guard
metadata, expose it numerically, preserve it while hitpause is active, and
clear it at the next non-paused frame-start boundary. ReversalDef and
HitOverride-only redirects remain outside this cut.

Why: current Ikemen sets `ghv.frame` when the defender is hit and clears it in
the non-paused action finish path. A transient bit avoids corrupting persistent
last-hit metadata while matching the existing local frame-start seam.

## T516: keep `GetHitVar(priority)` separate from Projectile clash priority

Decision: store a typed normalized last-HitDef priority in hit metadata. Direct
contacts use the authored/default HitDef priority; Projectile contacts use the
HitDef default while the existing Projectile `priority` field remains
`projpriority` for projectile clashes.

Why: current Ikemen copies `hd.priority` into `ghv.priority`, while Projectile
`priority` is a separate lifecycle/clash field. Keeping the values distinct
prevents a superficially similar local field from producing the wrong trigger
readback.

## T517: keep `GetHitVar(dizzypoints)` separate from the dizzy resource

Decision: store authored direct/Projectile HitDef dizzypoints in a typed
last-hit metadata field and expose it numerically, returning `0` when absent.
Do not read the defender's current `dizzyPoints` pool from this trigger.

Why: current Ikemen maps the trigger to `ghv.dizzypoints` while the character
hit path applies the same HitDef value to dizzy damage. A dedicated metadata
field preserves the authored readback without conflating it with mutable
resource state or claiming cumulative reset parity.

## T519: keep `GetHitVar(redlife)` separate from the red-life resource

Decision: store authored direct/Projectile HitDef redlife in a typed last-hit
metadata field and expose it numerically, returning `0` when absent. Do not
read the defender's current `redLife` pool from this trigger.

Why: current Ikemen maps the trigger to `ghv.redlife` while the character hit
path applies red-life damage to a mutable resource. A dedicated metadata field
preserves authored readback without conflating it with resource state or
claiming `guardredlife` and cumulative reset parity.

## T520: keep `GetHitVar(guardpower)` separate from the power resource

Decision: store the second authored `givepower` value in a typed last-hit
metadata field and expose it numerically, returning `0` when absent. Do not
read the defender's current `power` pool from this trigger.

Why: current Ikemen maps the trigger to `ghv.guardpower` while the character
hit path applies power changes through a mutable resource. A dedicated field
preserves the authored readback without conflating it with resource state or
claiming `hitpower` and cumulative reset parity.

## T518: keep `GetHitVar(guardpoints)` separate from the guard resource

Decision: store authored direct/Projectile HitDef guardpoints in a typed
last-hit metadata field and expose it numerically, returning `0` when absent.
Do not read the defender's current `guardPoints` pool from this trigger.

Why: current Ikemen maps the trigger to `ghv.guardpoints` while the character
hit path applies the same HitDef value to guard-point damage. A dedicated
metadata field preserves authored readback without conflating it with mutable
resource state or claiming cumulative reset parity.

# Architecture Decisions

This file records the decisions that keep the project from drifting into disconnected demos. Each decision is intentionally short; implementation details belong in code and the workplan.

## ADR-001: MatchWorld Becomes The Runtime Boundary

Status: accepted, incremental.

Decision: `MatchWorld` is the public gameplay boundary for app, Studio, QA, and future modules. `PlayableMatchRuntime` may remain the internal integration runtime while systems are extracted, but new lifecycle, ownership, actor registry, and snapshot contracts should move toward `MatchWorld` or systems behind it.

Why: the project needs renderer-independent runtime truth for traces, Studio debugging, helper/projectile/explod ownership, and future modules.

Current cut: `RuntimeEffectActorWorld` is the accepted boundary for helper/projectile/explod stores. `MatchWorld` creates and injects it; `PlayableMatchRuntime` can request spawns, active-effect advances, presentation-effect advances, removals, snapshots, summaries, bounded terminal playback for resolved projectile hit/remove/cancel AIR actions, bounded owner contact-trigger memory for `ProjContact`/`ProjHit`/`ProjGuarded(projid)`, and bounded helper-local cancel-time reads for helper-parented Projectiles through that contract. `RuntimeProjectileCombatWorld` owns the bounded projectile contact/reject/override/damage/removal loop, bounded `projhits`/`projmisstime` re-contact cooldown, and bounded `projpriority` projectile-vs-projectile equal-priority trade plus higher-priority cancel/decrement resolution consumed by `RuntimeEffectActorWorld`. `RuntimeTargetWorld` is now the matching boundary for current target-memory mutation and reads: `MatchWorld` creates and injects it, while `PlayableMatchRuntime` reaches target remember, advance, snapshot, count, find, simplified Target* controller application, and target-link derivation through that contract. `MatchWorldLifecycleSystem` owns actor/effect lifecycle records and spawn/active/remove events used by `MatchWorld` and trace evidence. `ContactMemorySystem` now owns the bounded direct/projectile contact-memory mutations and reads for `MoveContact`/`MoveHit`/`MoveGuarded`, `HitCount`/`UniqHitCount`, `HitAdd`, `MoveReversed`, `ReceivedDamage`/`ReceivedHits`, projectile contact/time markers, and owner-state projectile cancel-time markers used by `ProjCancelTime(projid)`, while `PlayableMatchRuntime` remains the actor/state integration glue. `RuntimeResourceSystem` owns bounded `CtrlSet` / `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet` resource mutation, authored life/power max resolution, runtime power-delta clamping, bounded life deltas, control writes for match/direct-combat/projectile-combat/target/reversal paths, plus `VarSet` / `VarAdd` / `VarRangeSet` var/fvar/sysvar writes, while `StateControllerExecutor` remains the parameter resolution and controller dispatch layer. `RuntimeStunWorld` owns bounded hitstun/guardstun input-lock, per-frame timer/friction mutation, hitstun presentation-action requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration while `PlayableMatchRuntime` supplies concrete action/state predicates. `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic camera-shake projection while `PlayableMatchRuntime` remains the snapshot integration point. `RuntimeAudioWorld` owns bounded controller `PlaySnd`/`SndPan`/`StopSnd`, static audio metadata handoff for channel/lowpriority/volumescale/freqmul/loop/pan/abspan, and direct HitDef `hitsound`/`guardsound` event insertion while `PlayableMatchRuntime` remains the actor/snapshot integration point. `RuntimeHitEffectWorld` owns bounded direct HitDef `sparkno`/`guard.sparkno`/`sparkxy` event insertion while `PlayableMatchRuntime` remains the actor/snapshot integration point; the Three.js `HitSparkRenderer` now treats `S` refs as player AIR actions, classifies unprefixed refs as common/default and `F` refs as FightFX, resolves first-frame player AIR sprites when possible, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace, and falls back to bounded 180-frame overlay geometry with smoke diagnostics. `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset while `PlayableMatchRuntime` remains the stage snapshot integration point. `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking while `PlayableMatchRuntime` remains the actor/state integration point. `RuntimeActorConstraintWorld` owns bounded `Width`, one-frame actor constraints, stage clamp, and body-push separation while `PlayableMatchRuntime` remains the actor/state integration point. `RuntimeDirectCombatWorld` owns bounded same-tick direct `HitDef` priority win/trade mutation and direct hit/guard result mutation while `PlayableMatchRuntime` remains the collision, target, Common1, and custom-state integration point. `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and redirect mutation while `PlayableMatchRuntime` remains the state-entry validation hook. `RuntimeReversalWorld` owns bounded ReversalDef activation, active-counter detection, and direct counter-result mutation while `PlayableMatchRuntime` remains the state-entry and target-state routing hook. `FighterMatchState` no longer stores the raw effect actor store. `MatchWorld` exposes target-memory links from `RuntimeTargetWorld` snapshots for debug/trace evidence instead of rebuilding link semantics inline. This does not yet mean helper VM parity, exact projectile combat parity, exact direct-combat priority/throw/multi-hit parity, exact HitOverride slot/attr/redirect parity, exact ReversalDef priority/guard/projectile/helper/custom-state parity, exact contact-trigger timing/lifetime parity, exact projectile cancel timing/lifetime parity, exact multi-target projectile parity, exact priority/cancel/remove timing parity, exact target semantics, exact resource/variable scoping/redirect parity, exact guard/hitstun tick-order parity, exact EnvShake pause/stage/layer/waveform parity, exact audio timing/mixing/channel priority/positional parity, exact package-backed common/FightFX spark asset lookup/binding/layering/timing/scale/palette parity, exact EnvColor blend/layer/window/pause parity, exact sprite draw-order/material/trail/palette parity, exact player/edge collision/camera parity, exact effect pause/tick order, exact contact/combo lifetime parity, or full parent/root ownership parity.

Current runtime expression-context cut: `RuntimeExpressionContextWorld` owns the bounded active runtime `ExpressionContext` used by imported state triggers and dynamic controller-param fallback. `PlayableMatchRuntime` now delegates target redirects, contact/projectile/effect-count reads, command/const/state/anim/hitvar reads, `HitDefAttr`, hitpause/hitover reads, and `InGuardDist` wiring through that world while keeping next-random ownership, animation timing callbacks, concrete controller dispatch, and VM timing. This is ownership cleanup only; full expression language parity, composite `HitDefAttr` parity, helper/team redirect mutation, and exact MUGEN/IKEMEN trigger timing remain outside the cut.

Current runtime dispatch-evaluation cut: `RuntimeDispatchEvaluationWorld` owns bounded dynamic active-controller dispatch-param fallback. Compiled dispatch values win, dynamic expressions use a context factory backed by `RuntimeExpressionContextWorld`, numeric params require finite truncated results, and Boolean params use numeric truthiness. `PlayableMatchRuntime` still supplies actor/opponent/owner selection, random/time/animation callbacks, `InGuardDist`, concrete controller side effects, and VM timing. This is ownership cleanup only; full dynamic-param parity, helper/team redirect scopes, persistent-controller timing, and exact CNS controller-loop parity remain outside the cut.

Current runtime controller-evaluation-context cut: `RuntimeControllerEvaluationContextWorld` owns bounded `StateControllerExecutor` context creation for active runtime-controller dispatch. Owner const reads, actor hitpause reads, actor random callbacks, and stage-time forwarding now route through a named context factory while `PlayableMatchRuntime` still supplies actor/owner selection, deterministic random state, concrete const lookup, dispatch order, and VM timing. This is ownership cleanup only; full passive-controller parity, helper/team redirect scopes, exact random stream parity, and exact CNS controller-loop timing remain outside the cut.

Current runtime afterimage-sample cut: `RuntimeAfterImageSampleWorld` owns bounded `AfterImage` sample projection from actor runtime state plus current AIR frame. Cloned position, facing, self/state-owner sprite owner metadata, and sprite group/index/offset are now created outside `PlayableMatchRuntime` before `RuntimeSpriteEffectWorld` captures ghost-trail samples. This is ownership cleanup only; exact sampling cadence, blend/material parity, helper/team redirect presentation ownership, renderer parity, and full presentation parity remain outside the cut.

Current fighter state cut: `RuntimeFighterStateWorld` owns bounded fighter runtime-state construction for resource maxima, damage multipliers, initial action/control/resource state, command buffers, contact memory, telemetry buckets, injected world references, deterministic RNG seed, and lazy runtime-program compilation. `PlayableMatchRuntime` still supplies stage starts, actor ids, definitions, and injected match worlds. This is ownership cleanup only; exact player lifecycle parity, helper/custom-state clone breadth, team/simul roster ownership, intro/round lifecycle, and full actor registry parity remain outside the cut.

Previous match reset cut: `RuntimeMatchResetWorld` owns bounded match reset orchestration for round timer reset, pause reset, EnvColor reset, effect actor store reset, in-place P1/P2 recreation, helper TargetState handler reattachment, and reset logging. `PlayableMatchRuntime` still supplies concrete fighter construction, stage starts, injected worlds, and field assignment. This is ownership cleanup only; exact round-flow parity, continue/round intro semantics, helper/custom-state reset breadth, screenpack/lifebar reset behavior, and full match lifecycle parity remain outside the cut.

Previous helper TargetState binding cut: `RuntimeHelperTargetStateWorld` owns bounded helper TargetState handler attach/re-attach wiring for match actors. `PlayableMatchRuntime` delegates constructor/reset callback binding through the same world that already owns helper-owner validation, target lookup, unavailable-state no-op behavior, and owner-backed target state entry. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul, multi-target helper ownership, exact helper TargetState timing, and full Helper VM parity remain outside the cut.

Current match helper TargetState actor-resolution cut: `RuntimeMatchHelperTargetStateWorld` owns bounded match-roster target resolution for helper-owned `TargetState` entry outside `PlayableMatchRuntime`. It resolves target actor payloads through the supplied actor roster before delegating owner validation and no-op result semantics to `RuntimeHelperTargetStateWorld`, while the match runtime still supplies the concrete 1v1 roster, state availability, and state-entry hooks. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState timing, and full Helper VM parity remain outside the cut.

Current active-controller telemetry cut: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`. Active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch now share one controller/operation hook set before forwarding into `RuntimeCompatibilityTelemetryWorld`. This is ownership cleanup only; exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, and full CNS VM parity remain outside the cut.

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

Previous passive metadata cut: `RuntimeStateTypeWorld` owns bounded `StateTypeSet` `stateType` / `moveType` / `physics` setup from typed `metadata:statetypeset` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing ownership. This is ownership cleanup only; dynamic metadata expressions, helper/team/redirect ownership, exact physics/tick-order interactions, and full StateTypeSet parity remain outside the cut.

Previous passive damage-scale cut: `RuntimeDamageScaleWorld` owns bounded `AttackMulSet` and `DefenceMulSet` multiplier setup from typed `damage-scale:*` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing and evaluation context ownership. This is ownership cleanup only; exact scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, controller-loop timing, and full damage-scale parity remain outside the cut.

Previous passive hit-defense cut: `RuntimeHitDefenseWorld` owns bounded `HitBy`, `NotHitBy`, and `HitOverride` slot setup from typed `eligibility:*` / `hitoverride` operations or raw controller params. `StateControllerExecutor` now delegates those mutations to the world while keeping controller routing and evaluation context ownership. This is ownership cleanup only; exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, controller-loop timing, and full defensive-slot parity remain outside the cut.

Previous HitDef-controller dispatch cut: `RuntimeHitDefControllerDispatchWorld` owns active-state HitDef activation dispatch from compiled CNS classification into the current attack payload: controller telemetry, typed `hitdef` operation extraction, raw fallback attack params, fired-HitDef dedupe, current-frame `Clsn1` hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry. This is ownership cleanup only; trigger filtering, active-state order, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, target/reversal consequences, exact hit window lifetime, multi-hit behavior, helper/projectile/custom-state ownership, broad attr grammar, hitpause/tick order, and exact HitDef parity remain outside the cut.

Previous ReversalDef-controller dispatch cut: `RuntimeReversalControllerDispatchWorld` owns active-state ReversalDef side-effect dispatch from compiled CNS classification into `RuntimeReversalWorld`: controller telemetry, typed `reversaldef` operation extraction, raw fallback activation payload, activation handoff, and operation telemetry. This is ownership cleanup only; trigger filtering, active-state order, current-frame hitbox lookup, ReversalDef counter-result state routing, exact priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, and exact ReversalDef parity remain outside the cut.

Current effect-spawn-controller dispatch cut: `RuntimeEffectSpawnControllerDispatchWorld` owns active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile side-effect dispatch from compiled CNS classification into `RuntimeEffectSpawnWorld`: controller telemetry, typed operation extraction, spawn/count mutation handoff, and success-gated operation telemetry. This is ownership cleanup only; trigger filtering, active-state order, actor/opponent context, effect actor world ownership, exact spawn tick order, helper-owned effect namespaces, helper-owned projectile combat/contact/target memory, and exact effect/helper/projectile parity remain outside the cut.

Current sprite-effect dispatch cut: `RuntimeSpriteEffectControllerWorld` owns active-state sprite-effect side-effect dispatch from compiled CNS classification into `RuntimeSpriteEffectWorld`: controller telemetry, typed operation extraction, operation telemetry, and mutation handoff for `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `AngleSet` / `AngleAdd` / `AngleDraw`. `RuntimeAfterImageSampleWorld` now owns the actor/frame-to-sample projection used by that ghost-trail path. This is ownership cleanup only; trigger filtering, active-state order, hitpause selection, render projection, helper/redirect ownership, and exact visual parity remain outside the cut.

Current target-controller dispatch cut: `RuntimeTargetControllerDispatchWorld` owns active-state Target / BindToTarget side-effect dispatch from compiled CNS classification into `RuntimeTargetWorld`: controller telemetry, typed operation extraction, operation telemetry, and mutation handoff with match-owned callbacks for damage scaling, TargetState entry, and target constants. This is ownership cleanup only; trigger filtering, active-state order, concrete state validation, target candidates, helper/projectile target ownership, multi-target semantics, throw binding, and exact target parity remain outside the cut.

Current contact-controller dispatch cut: `RuntimeContactControllerDispatchWorld` owns active-state contact-memory side-effect dispatch from compiled CNS classification into `RuntimeContactMemoryWorld`: controller telemetry, typed operation extraction, operation telemetry, `HitAdd` mutation, and `MoveHitReset` reset. This is ownership cleanup only; trigger filtering, active-state order, direct/projectile contact creation, exact combo lifetime, helper/projectile contact ownership, guard-count parity, and exact contact parity remain outside the cut.

Current audio-controller dispatch cut: `RuntimeAudioControllerDispatchWorld` owns active-state audio side-effect dispatch from compiled CNS classification into `RuntimeAudioWorld`: controller telemetry, typed operation extraction, operation telemetry, and `PlaySnd` / `StopSnd` event handoff. This is ownership cleanup only; trigger filtering, active-state order, hit/contact timing, actor context, exact SND playback, channel priority, mixing, FightFX/common fallback, and exact audio parity remain outside the cut.

Current EnvColor-controller dispatch cut: `RuntimeEnvColorControllerDispatchWorld` owns active-state EnvColor side-effect dispatch from compiled CNS classification into `RuntimeEnvColorWorld`: controller telemetry, typed operation extraction, operation telemetry, and stage-flash event handoff. This is ownership cleanup only; trigger filtering, active-state order, stage-world ownership, pause/hitpause callback routing, exact blend math, layer/window ordering, pause timing, renderer parity, and exact presentation parity remain outside the cut.

Current EnvShake-controller dispatch cut: `RuntimeEnvShakeControllerDispatchWorld` owns active-state EnvShake side-effect dispatch from compiled CNS classification into `RuntimeEnvShakeWorld`: controller telemetry, typed operation extraction, operation telemetry, and camera-shake event handoff. This is ownership cleanup only; trigger filtering, active-state order, actor/world ownership, FallEnvShake routing, exact waveform, pause/stage/layer interaction, helper/redirect ownership, and exact presentation parity remain outside the cut.

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

# Architecture Decisions

This file records the decisions that keep the project from drifting into disconnected demos. Each decision is intentionally short; implementation details belong in code and the workplan.

## ADR-001: MatchWorld Becomes The Runtime Boundary

Status: accepted, incremental.

Decision: `MatchWorld` is the public gameplay boundary for app, Studio, QA, and future modules. `PlayableMatchRuntime` may remain the internal integration runtime while systems are extracted, but new lifecycle, ownership, actor registry, and snapshot contracts should move toward `MatchWorld` or systems behind it.

Why: the project needs renderer-independent runtime truth for traces, Studio debugging, helper/projectile/explod ownership, and future modules.

Current cut: `RuntimeEffectActorWorld` is the accepted boundary for helper/projectile/explod stores. `MatchWorld` creates and injects it; `PlayableMatchRuntime` can request spawns, active-effect advances, presentation-effect advances, removals, snapshots, summaries, the bounded projectile contact/reject/override/damage/removal loop, bounded `projhits`/`projmisstime` re-contact cooldown, bounded `projpriority` projectile-vs-projectile equal-priority trade plus higher-priority cancel/decrement resolution, bounded terminal playback for resolved projectile hit/remove/cancel AIR actions, and bounded owner contact-trigger memory for `ProjContact`/`ProjHit`/`ProjGuarded(projid)` through that contract. `RuntimeTargetWorld` is now the matching boundary for current target-memory mutation and reads: `MatchWorld` creates and injects it, while `PlayableMatchRuntime` reaches target remember, advance, snapshot, count, find, simplified Target* controller application, and target-link derivation through that contract. `MatchWorldLifecycleSystem` owns actor/effect lifecycle records and spawn/active/remove events used by `MatchWorld` and trace evidence. `ContactMemorySystem` now owns the bounded direct/projectile contact-memory mutations and reads for `MoveContact`/`MoveHit`/`MoveGuarded`, `HitCount`/`UniqHitCount`, `HitAdd`, `MoveReversed`, `ReceivedDamage`/`ReceivedHits`, and projectile contact/time markers, while `PlayableMatchRuntime` remains the actor/state integration glue. `RuntimeResourceSystem` owns bounded `CtrlSet` / `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet` resource mutation plus `VarSet` / `VarAdd` / `VarRangeSet` var/fvar/sysvar writes, while `StateControllerExecutor` remains the parameter resolution and controller dispatch layer. `RuntimeStunSystem` owns bounded hitstun/guardstun input-lock and per-frame timer/friction mutation, while `PlayableMatchRuntime` still chooses animation/state presentation. `FighterMatchState` no longer stores the raw effect actor store. `MatchWorld` exposes target-memory links from `RuntimeTargetWorld` snapshots for debug/trace evidence instead of rebuilding link semantics inline. This does not yet mean helper VM parity, exact projectile combat parity, exact contact-trigger timing/lifetime parity, exact multi-target projectile parity, exact priority/cancel/remove timing parity, exact target semantics, exact variable scoping/redirect parity, exact guard/hitstun tick-order parity, exact effect pause/tick order, exact contact/combo lifetime parity, or full parent/root ownership parity.

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

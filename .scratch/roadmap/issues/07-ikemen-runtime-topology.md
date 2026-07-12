# 07 - IKEMEN Bounded Runtime Topology

Status: in-progress
Labels: runtime-trace, boundary, ready-for-agent
Lane: I2 bounded runtime
Compatibility profile: explicit `ikemen-go`
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## 2026-07-12 Constraint/collision frontier

Wayfinder 100 resolves actor-local stage-X clamp as next promotion. Wayfinder 101 adds explicit constraint capability and post-motion actor-scoped scheduling for already-live Tag roots. Global plural push, diagnostic collision, hit admission, targets, effects, and combat remain separate blocked owners; no score movement.

## Objective

Advance the source-pinned IKEMEN runtime from inert P3-P8 ownership to an explicit, plural, deterministic team topology without widening every gameplay consumer at once.

Each cut must expose one versioned contract, name the consumers that changed, preserve the current MUGEN/unknown paths, and close with evidence plus an exact allowed/blocked claim. Structural ownership, observability, activation, CNS scheduling, input, effects, combat, round flow, presentation, lifebars, and resources are separate claims.

The immediate sequence is:

Current checkpoint override (entries `349-405` supersede the original immediate sequence below): root participation, plural activation, root selection, standby CNS scheduling, bounded Tag parameters/order/identity/RedirectID, complete root-to-Helper aggregate execution, Helper-originated self Tag plus required trace, same-side command routing, precomputed normal-tick `active-motion`, and renderer-independent body/shadow/camera presentation are closed. `RuntimeRootPhaseCapabilities/v1` now publishes presentation for selected live P3-P8 roots while stable P1/P2 snapshot/HUD/gameplay ownership remains unchanged. Wayfinder 100 next maps stage constraints, push, collision, and combat admission. P3-P8 direct native input/AI, Pause/hitpause motion, stage clamp/push, collision/combat, root-keyed effects, round, lifebars, resources, Helper-originated redirect/aggregate Tag, ZSS/Lua, rollback, netplay, and full IKEMEN parity remain blocked.

0. `046p`: publish root-participation diagnostics and close broader lifecycle/reset identity evidence over the proven P3-P8/cap/start base, with all executable consumers still P1/P2.
1. `046a`: plural `activeRootIdsBySide` projection plus atomic standby transition, with no scheduler change.
2. `046b`: identity / `Partner` / `Enemy` / P2 selection matrix over the plural roster.
3. `046c`: standby roots enter the explicit-profile CNS schedule and bounded `TagIn` / `TagOut` transitions become visible in the same tick.
4. Later isolated cuts: input, effects, combat, round, presentation, then resources.

## I2 Runtime Boundary Versus I1 Scanner

I1 and I2 are independent lanes. Evidence must never move between them implicitly.

| Concern | I1 scanner - issue 04 | I2 bounded runtime - this issue |
| --- | --- | --- |
| Input | Package text, paths, source signals, unsupported syntax. | Explicit `ikemen-go` match state and executable runtime contracts. |
| Output | Recognized / unsupported / unknown findings. | Versioned snapshots, typed operations, deterministic scheduling, behavior traces. |
| Required proof | Focused scanner/report tests. | Focused runtime tests, stable normal gates, `pnpm qa:trace`; visual smoke only for visible consumers. |
| Claim ceiling | A feature can be detected and reported. | Only the exact source-pinned behavior exercised by the gate. |
| Never implied | Runtime execution. | ZSS/Lua/config/screenpack coverage, rollback, netplay, or broad IKEMEN parity. |

`TagIn` and `TagOut` being recognized by `IkemenFeatureScanner` is I1 evidence only. Compiling and executing a bounded subset belongs here and requires a new I2 runtime gate.

## Closed Baseline - Declared, Not Re-run In This Planning Cut

This issue is a planning artifact. It does not re-run or independently validate the historical gates below. The numbers are declarations from numbered entries `334` through `348` in `docs/BUILD_EXECUTION_BACKLOG.md` and their linked checkpoint reports.

| Entries | Closed contract declared by the ledger | Remaining boundary after that group |
| --- | --- | --- |
| `334-338` | Prepared same-tick root symmetry, explicit-profile root/helper RunOrder, `RunFirst` / `RunLast`, `RunOrder`, and appended-helper actor-list execution. | No teams/simul/tag root participation. |
| `339-343` | Separate Pause/SuperPause arbitration, actor-local movement, deferred activation, helper pause ownership, and opposing-team defense fallback. | No plural opposing-root breadth or team gameplay. |
| `344` | Complete-character team topology with interleaved root-side identity and helper `rootId` inheritance. | No active/standby selection or multi-root consumers. |
| `345` | Separate EnemyNear-root and P2-player-type eligibility plus `RuntimeTeamRoster/v0`. | No live multi-root runtime participation or selection parity. |
| `346` | Stable unique-id public multi-root registry snapshot. | Scheduler-facing roster remains the current pair. |
| `347` | Live `disabled` / `standby` / `overKo` / `playerType` snapshot projection. | No tag/turns transitions or Helper `type = player` compile. |
| `348` | Explicit-profile inert P3-P8 construction, reset, reserve snapshots, registry, lifecycle, and topology. | Reserves remain outside active actors and every playable/presentation consumer. |

The latest aggregate declared by entries `343-348` is `538/538` trace artifacts (`507` required, `31` optional). This document adds no trace, does not refresh that aggregate, and must not raise an IKEMEN score.

The separately queued root-participation read model is a prerequisite, not part of the `334-348` closed baseline. `046a` may consume it only after broader lifecycle/reset identity evidence and the versioned participation schema have a real closeout over the proven P1-P8/cap/start base. If that gate is absent, stale, or only present as uncommitted prose, close it before activation.

## Source-Backed Invariants

The following are verified facts at the pinned revision, not claims about current browser behavior:

1. Root player numbers are interleaved by side and the engine supports up to four roots per side. Inactive roots can initialize with `SCF_standby`: [limits](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L29-L31), [interleaved root assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2031-L2043), [standby initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3565-L3573).
2. `Partner` resolves same-side roots independently from P2 selection. `Enemy` enumerates eligible opposing roots, while P2 uses a nearest opposing player-type list and excludes standby / over-KO candidates: [Partner, Enemy, P2, and base eligibility](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4968-L5109), [EnemyNear and P2 candidate construction/order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13962-L14057).
3. Identity comparisons follow the resolved character, while `P2Name` and the later P-name slots use P2/Partner selection rather than a generic team leader: [name/author and P2-P8 identity routing](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2705-L2741).
4. `CharList.action` prepares the complete run list and then executes it sequentially. `actionPrepare` and `actionRun` return early for `disabled`, but do not return early for `standby`: [character action preparation/execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11808), [run-order and complete action loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175).
5. `TagIn` and `TagOut` mutate standby state during controller execution and can also change state, control, member order, partner state/control, and leader selection: [TagIn and TagOut bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5397).
6. Team leader, member order, and resource ownership are represented by different policies. Tag order can mutate `memberNo` and `teamLeader`, while shared power resolves through `powerOwner`; life/power sharing is configured independently: [power owner](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5396-L5410), [member order and tag leader](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6090-L6246), [team power/life policy](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3935-L3999).
7. Presentation iterates member slots and has leader-specific layout policy; it is not a consequence of the active-root pointer alone: [lifebar/member presentation loops](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L5591-L5715).

Critical rule: `standby` does **not** mean "CNS frozen" in pinned IKEMEN. It is an eligibility/participation flag used by multiple consumers, while the character remains in the actor list and can execute CNS. The browser port therefore needs per-consumer participation, not one global `active` boolean.

## Required Architecture Decisions

### Keep five axes distinct

| Axis | Stable or mutable | Required meaning | Must not be inferred from |
| --- | --- | --- | --- |
| Actor/root identity | Stable for object lifetime | Runtime id, root id, definition identity, side slot. | Active position, leader, member order, resource bank. |
| Team member order | Mutable | `memberNo`-like ordinal used by Partner/tag/presentation policy. | Player id or array index alone. |
| Team leader | Mutable explicit role | Per-side root selected as leader. | First active root or member zero without policy. |
| Active roots | Mutable plural set | `activeRootIdsBySide`, ordered deterministically and filtered for the consumer. | One `p1`/`p2` pointer or leader id. |
| Resource owner | Policy-selected | Per-root or shared bank owner for life/power/variables as supported. | Leader, active root, or first side slot implicitly. |

Changing one axis must not silently rewrite the others. A tag transition may request several changes, but the transaction must name each change and publish one coherent post-transition snapshot.

### Prefer versioned projections over widening the pair tuple

- Keep the legacy scheduler-facing pair stable until the cut that explicitly widens scheduling.
- Add a versioned activation/participation projection rather than silently changing `RuntimeTeamRoster/v0` meaning.
- Use JSON-safe, plural `activeRootIdsBySide` arrays in stable root/member order. Never introduce a single `activeRootIdBySide` compatibility shortcut.
- Preserve complete registry membership even when a root becomes standby, disabled, over-KO, inactive for combat, or invisible.

### Make standby changes atomic

- Validate every target id, root role, side, profile, and duplicate before mutation.
- Apply the entire same-side/multi-side standby batch or none of it.
- Invalidate/rebuild active-root, Enemy/P2, and participation projections once after the batch.
- Reset to the match's authored initial topology, not to whichever roots were active at the last snapshot.
- Do not let the transaction itself imply scheduler, input, effects, combat, round, presentation, or resource participation.

Rejected alternatives:

- One active root per side: rejects Simul before it starts and conflates Tag with the general topology.
- Replacing `[p1,p2]` everywhere in `046a`: makes it impossible to prove activation independently from gameplay consumers.
- Treating `standby` as frozen or absent: contradicts the pinned action loop and prevents source-shaped same-tick Tag behavior.
- Reusing leader/member/resource owner as active identity: creates incorrect redirect, lifebar, and sharing behavior after reorder/tag transitions.
- One universal `isActive`: hides the fact that CNS, input, collision, camera, combat, round, and resources use different participation rules.

## Ordered Execution Plan

### 046p - Inert-Root Evidence And Participation Read Model

Dependencies:

- Entry 348 implementation and its P3-P8 cap/start/reset/snapshot-isolation tests.

Scope and acceptance:

- Preserve the proven P3-P8 six-reserve cap, overflow policy, and odd/even side-local starts; directly cover registry/lifecycle records, object identity through reset, and cleanup of stale optional fighter state.
- Add negative assertions that schedule, input, compatibility execution, effects, combat, round, camera, renderer, lifebar, and effect stores still consume P1/P2 only.
- Publish a JSON-safe `RuntimeRootParticipation/v0`-style diagnostic that distinguishes owned, disabled, standby, structurally active, scheduled, input-owned, combat-owned, round-owned, presented, and effect-store-owned roots.
- Keep storage and behavior unchanged: no standby mutation, no movement between `reserveActors` and `actors`, no new executable consumer.

Evidence:

- Focused runtime/reset/snapshot/registry/lifecycle tests plus stable `pnpm qa:trace`.
- No visual smoke while reserves remain intentionally invisible; add smoke only if a Studio/Debug detail route changes.

Claim allowed: complete bounded evidence and observability for inert additional-root ownership and current consumer isolation.

Claim blocked: activation, TagIn/TagOut, identity/redirect breadth, standby CNS scheduling, input/effects/combat/round/presentation/lifebar/resources, score movement, or full IKEMEN parity.

Risks: silent overflow truncation, stale optional fields after `Object.assign` reset, duplicate side mapping, registry counts being misread as active players, and accidental UI/renderer consumption.

### 046a - Plural Active-Root Projection And Standby Batch, No Scheduler

Dependencies:

- Entries `344-348` remain the closed topology/state/registry/inert-root baseline.
- The versioned root-participation prerequisite has closed with P1-P8, cap, reset, lifecycle, and negative-consumer evidence.
- The explicit `ikemen-go` profile remains the only opt-in path.

Scope:

- Add a versioned activation read model with `activeRootIdsBySide`; preserve `RuntimeTeamRoster/v0` compatibility or version it deliberately.
- Compute active roots from complete root identity plus live `disabled`/`standby` state, without promoting Helpers into root arrays.
- Add one all-or-nothing standby transition batch. The first fixture swaps side-1 `p1 -> p3` while side 2 remains `p2`; a second fixture proves two active roots on one side remain representable.
- Publish pre/post transition and rejection diagnostics through snapshots / `MatchWorld`.
- Keep playable actors, prepared schedule, input, effects, combat, round, presentation, camera, lifebar, and resource mutation on the existing pair.

Probable systems:

- `RuntimeTeamTopologySystem.ts`
- `RuntimeMatchActorRosterSystem.ts`
- `RuntimeSnapshotSystem.ts`
- `RuntimeMatchResetSystem.ts`
- `MatchWorld.ts`
- `PlayableMatchRuntime.ts` only as integration glue; do not widen its gameplay consumers in this cut.

Acceptance:

- Initial explicit 2v2 projection is side 1 `[p1]`, side 2 `[p2]`; reserves stay in the complete registry.
- One validated batch yields side 1 `[p3]`, side 2 `[p2]`, with `p1.standby = true` and `p3.standby = false` in the same snapshot.
- A plural fixture yields two ordered active ids on one side without data loss or single-root coercion.
- Unknown id, Helper id, cross-side replacement, duplicate id, and invalid profile reject without partial mutation.
- Reset restores authored initial standby/active state and preserves the established object-identity contract.
- Pair schedule/behavior fingerprints and the declared required trace set remain unchanged.

Required evidence:

- Focused topology/activation/snapshot/reset/MatchWorld tests.
- A serialized versioned projection fixture including accepted and rejected transactions.
- Normal typecheck/build/boundary gates and `pnpm qa:trace`; no visual smoke because no visible consumer changes.
- Explicit checksum comparison for representative existing 1v1 IKEMEN and MUGEN traces.

Claim allowed after closeout:

> Explicit IKEMEN matches expose a deterministic plural active-root read model and can apply one validated atomic standby-state batch without changing playable scheduling or gameplay consumers.

Claim blocked:

> Tag gameplay, `TagIn`/`TagOut` execution, Partner/Enemy/P2 parity, standby CNS scheduling, multi-root input/effects/combat/round/presentation/lifebars/resources, Simul/Turns semantics, rollback/netplay, or full IKEMEN parity.

Primary risks:

- Mutating live flags before all validation completes.
- Silently changing `RuntimeTeamRoster/v0` consumers.
- Treating the projection as one root per side.
- Letting snapshot activation accidentally widen renderer or scheduler inputs.

### 046b - Identity / Partner / Enemy / P2 Matrix

Dependency: `046a` closed; no scheduler widening yet.

The resolver matrix must be explicit:

| Read | Candidate domain | Standby/disabled/KO policy | Ordering/identity rule |
| --- | --- | --- | --- |
| Current identity (`Name`, `P1Name`, `AuthorName`, root metadata) | The resolved actor/root itself. | Identity remains readable even when that root is not active; participation is separate. | Stable actor/root identity; never substitute leader or resource owner. |
| `Partner(n)` | Same-side roots excluding current root. | Pinned root-slot selection is not the P2 active filter; keep standby addressability explicit and test it. | Deterministic member/root-slot order, with invalid indexes failing closed. |
| `Enemy(n)` | Opposing roots that pass base enemy eligibility. | Exclude disabled, neutral/same-side, and standby candidates; do not apply P2's over-KO/player-type rule blindly. | Stable root enumeration, not nearest-distance P2 order. |
| P2 / `P2Name` / P-even identity | Opposing player-type candidates. | Exclude disabled, neutral/same-side, standby, and over-KO; Helper player-type participation remains blocked until its compile/runtime gate exists. | Nearest ordering with deterministic tie behavior; exact Z/cache/behind penalty must remain separately claimed. |

Scope:

- Introduce one resolver/read-model boundary consuming complete registry, live team state, `activeRootIdsBySide`, member order, and actor identity.
- Route current identity, Partner, Enemy, P2, and name/author reads through the appropriate row instead of a generic `opponent` pointer.
- Prove the matrix from both sides before and after a `p1 -> p3` activation batch.
- Keep redirect mutation, scheduler participation, input, effects, combat, and presentation out of this cut.

Probable systems:

- `RuntimeTeamTopologySystem.ts`
- `RuntimeOpponentSelectionSystem.ts`
- `RuntimeExpressionContextSystem.ts`
- `ExpressionEvaluator.ts`
- `RuntimeMatchActorRosterSystem.ts`
- Focused expression/topology/MatchWorld tests and a synthetic imported matrix trace.

Acceptance:

- Unique names/authors on P1-P4 prove every matrix cell resolves the intended identity before and after activation.
- A standby partner remains selectable through the bounded Partner row while being absent from Enemy/P2 active candidates.
- `Enemy(n)` remains root-only and deterministic; P2 can use the bounded player-type/nearest policy without being aliased to Enemy.
- Missing, negative, duplicate, disabled, standby, neutral, and over-KO cases fail or filter according to their row, with diagnostic reason.
- Identity never changes merely because leader, member order, active set, or resource owner changes.
- Existing one-opponent identity and EnemyNear checksums remain stable.

Required evidence:

- Table-driven focused tests that mirror every row and state filter.
- One required synthetic imported trace with distinct P1-P4 identity metadata and exact selected ids/names before/after the activation batch.
- `pnpm qa:trace`, normal gates, and no smoke because selection is not yet visible.

Claim allowed after closeout:

> Explicit IKEMEN multi-root registries resolve bounded current identity, Partner, Enemy, and P2 reads through separate source-backed candidate policies.

Claim blocked:

> Redirected controller mutation, exact P2 cache refresh/Z/behind-distance parity, Helper `type = player`, standby-root CNS execution, Tag controllers, multi-root gameplay consumers, or full redirect parity.

Primary risks:

- Reusing P2 candidates for `Enemy` or Partner.
- Replacing actor identity with team leader identity.
- Cache invalidation lag after a standby batch.
- Accidentally claiming helper-player selection before Helper player-type execution exists.

### 046c - Standby Roots In CNS Schedule And Same-Tick TagIn/TagOut

Dependencies: `046a` and `046b` closed; Tag controllers have a pinned compiler/runtime contract; unsupported parameters remain reportable.

Scope:

- Widen only the explicit-profile prepared actor schedule so owned roots, including standby roots, have deterministic CNS turns. Disabled roots may remain listed diagnostically but must skip action as the pinned source does.
- Keep a per-phase participation mask: CNS scheduling is enabled here; direct player input, effect stores, combat/collision, round decisions, renderer/camera, lifebars, and shared resources remain blocked.
- Compile and execute a bounded named subset of `TagIn` / `TagOut`. At minimum, self/partner standby transitions plus the state/control fields needed by the oracle must be explicit; every omitted upstream parameter stays unsupported rather than silently defaulted.
- Build the frame's prepared root order once. A transition changes live standby/identity projections immediately but does not retroactively rebuild the current frame's order or execute an actor twice.
- Publish ordered `MatchTickSchedule` and transition telemetry with before/after active-root ids.

Required same-tick oracles:

1. An active root runs before its standby partner, issues bounded `TagIn`, and the already-prepared incoming root later executes its selected CNS state in the same tick.
2. If the incoming root's prepared slot already ran, later `TagIn` updates state for the next opportunity and never runs it a second time that tick.
3. Bounded `TagOut` changes standby state during the controller pass without dropping or duplicating later scheduled actors.
4. A Tag controller that changes self plus partner applies its standby batch atomically and exposes one coherent post-controller projection.
5. The current P1/P2 1v1 schedule and non-IKEMEN profiles retain their established order/checksums.

Probable systems:

- `RuntimeActorRunOrderSystem.ts`
- `RuntimeMatchActorAdvanceSystem.ts`
- `RuntimeMatchTickBranchSystem.ts`
- controller compiler/typed-op dispatch for `TagIn` / `TagOut`
- `RuntimeTeamTopologySystem.ts`
- `RuntimeTrace` schedule/operation evidence
- focused scheduler/controller/runtime tests.

Acceptance:

- Standby is not implemented as frozen CNS or absence from the actor list.
- Exact actor order, state number, control, standby transition, active ids, and no-double-run invariant are trace-visible.
- Unsupported Tag parameters fail/report explicitly.
- Standby-local attempts to enter still-blocked consumers are rejected or quarantined with evidence; they cannot leak into pair effect stores, combat, round, presentation, or shared resources.
- Exceptions cannot leave a half-applied standby batch or stale schedule diagnostic.

Required evidence:

- Focused compiler, controller-dispatch, scheduler, snapshot/reset, and exception-path tests.
- At least two required traces covering TagIn-before-slot and TagIn-after-slot ordering; include bounded TagOut in one trace or a third required artifact.
- Existing root/helper RunOrder and Pause/SuperPause required traces remain stable.
- Normal gates and `pnpm qa:trace`; no visual smoke until presentation changes.

Claim allowed after closeout:

> Explicit IKEMEN standby roots remain in the deterministic CNS actor schedule, and the gated TagIn/TagOut subset has source-shaped same-tick visibility without duplicate execution.

Claim blocked:

> Full TagIn/TagOut parameter parity, direct standby input, effect ownership, collision/combat, round handoff, camera/render/lifebar, resource sharing, exact rollback timing, Simul/Turns gameplay, or full IKEMEN actor-loop parity.

Primary risks:

- Filtering standby at schedule construction and thereby contradicting the source.
- Rebuilding the list mid-frame and double-running an incoming root.
- Allowing all existing side effects merely because CNS now runs.
- Letting Tag transition telemetry and live snapshots observe different transaction boundaries.

### 046d - Input Ownership And Command Participation

Dependency: `046c` closed.

Scope and acceptance:

- Add an explicit command-source and direct-input policy per root; do not derive either from leader, member order, active index, or resource owner.
- Name Tag and Simul policies separately. Pinned Human Tag intentionally fans one physical side stream into every same-side root command list. Prove each independent root buffer updates once, no cross-side stream aliases, and no standby root receives direct gameplay control merely because its command buffer is maintained.
- Gate same-tick versus next-tick input handoff around TagIn with an official-source note before implementation.
- Preserve AI/controller identity and command buffer reset across activation and match reset.
- Require focused input/command/scheduler tests plus one ordered input-handoff trace. No effects/combat claim.

Claim allowed: only the gated root/input-seat handoff policy.

Claim blocked: multi-root effects, combat, round, presentation, resources, broad AI parity, rollback input, or netplay.

Risks: duplicate command consumption, stale held input crossing roots, conflating input owner with active root, and changing legacy P1/P2 command timing.

### 046e - Root-Keyed Effect Stores And Lifecycles

Dependency: `046d` closed.

Scope and acceptance:

- Replace hard-coded P1/P2 effect-store addressing with root-id keyed ownership while preserving actor id, `rootId`, parent id, serial uniqueness, and creation order.
- Prove P3-owned Helper/Projectile/Explod lifecycle/reset/snapshot isolation without enabling their combat or rendering automatically.
- Define what happens to existing effects when their root enters standby; do not infer remove, pause, hide, or transfer without a pinned rule.
- Require focused store/lifecycle/target-memory tests, one required ownership trace, stable pair traces, and no visual smoke.

Claim allowed: bounded multi-root effect storage and lifecycle ownership.

Claim blocked: effect combat, exact standby effect ticking, visible multi-root effects, helper-player semantics, shared namespaces, or full Helper/Projectile/Explod parity.

Risks: P1/P3 store aliasing, serial collisions, target links pointing at the wrong root, and reset leaks.

### 046f - Multi-Root Combat And Collision Candidates

Dependency: `046e` closed.

Scope and acceptance:

- Build deterministic attacker/defender candidate sets from per-consumer participation, side, player type, standby/disabled state, and explicit `affectteam` policy.
- Prove a controlled plural-active fixture (`p1+p3` versus `p2+p4`) without changing same-side actors through the default opposing-team route.
- Preserve direct/helper/projectile priority, target memory, hitpause, guard, and custom-state ownership deterministically when more than one candidate exists.
- Require table-driven candidate tests and required traces for one accepted multi-root contact, one rejected standby contact, one same-side rejection, and one deterministic simultaneous/tie order.

Claim allowed: only the exercised multi-root contact/candidate subset.

Claim blocked: broad Simul balance, throws, complete multi-target arbitration, friendly-fire parity, Tag round behavior, rollback, or full IKEMEN combat.

Risks: order-dependent checksums, double contact, cross-root target ownership, team-wide pause/hitpause drift, and accidental friendly fire.

### 046g - Team Round And KO Ownership

Dependency: `046f` closed.

Scope and acceptance:

- Separate actor KO/over-KO from side defeat and round winner. Encode Single/Simul/Tag/Turns loss policy explicitly rather than counting the first root.
- Prove one member KO does not end the round when the configured policy has a valid continuation, and prove the opposite policy with a separate oracle.
- Define active replacement eligibility and round-transition transaction independently from input/render/resource consumers.
- Preserve current 1v1 KO/time-over checksums and `NoKOSnd` behavior.
- Require focused round/team-state tests and required ordered KO/handoff traces.

Claim allowed: the exact gated team defeat/replacement policy.

Claim blocked: full motif/continue/victory flow, broad Tag/Turns rules, lifebar parity, shared life, rollback, or full IKEMEN round flow.

Risks: ending a round on member KO, confusing `overKo` with team defeat, racing Tag activation with round state, and changing current KO audio timing.

### 046h - Presentation, Camera, Lifebar, And Visual QA

Dependency: `046g` closed.

Scope and acceptance:

- Drive actor draw/camera/shadow/collision-debug participation from explicit presentation policy, not registry membership or CNS scheduling.
- Show active plural roots and hide/exclude standby roots according to pinned rules while preserving inspectable registry diagnostics.
- Add member/leader-aware lifebar slots without equating leader, active root, and resource owner.
- Prove desktop and mobile framing, stable render order, no offscreen/overflow regressions, and a visible Tag swap with screenshots plus browser diagnostics.
- Require focused presentation tests, `pnpm qa:smoke`, visual inspection, and required runtime traces linking the same actor ids to the screenshots.

Claim allowed: the exact visible multi-root/tag presentation and camera/lifebar subset exercised.

Claim blocked: screenpack parity, all lifebar layouts, model/video stages, exact IKEMEN draw order, shared-resource semantics, or full visual parity.

Risks: camera expansion from hidden reserves, leader-slot flicker, duplicate shadows/sparks, z-order regressions, and HUD values sourced from the wrong owner.

### 046i - Explicit Resource Banks And Sharing

Dependency: `046h` closed; round and presentation contracts can consume a resource owner without defining it implicitly.

Scope and acceptance:

- Introduce explicit per-root or per-side resource-bank identity and `resourceOwnerId` resolution. Do not use leader or first active root as an undocumented shortcut.
- Gate PowerShare and LifeShare independently and keep variable/sysvar/helper ownership separate until sourced.
- Prove a Tag swap does not transfer, duplicate, or reset a bank accidentally; shared power mutates one side bank, while non-shared power remains root-local.
- Prove round reset, snapshots, traces, lifebar reads, Pause/SuperPause power use, and target damage all agree on the same owner.
- Require focused resource/round/helper/pause tests, required shared/non-shared traces, and visual smoke if HUD values change.

Claim allowed: the exact gated resource-bank and sharing policies.

Claim blocked: every IKEMEN config option, red-life/guard/stun sharing, variable-map sharing, broad helper/redirect ownership, persistence across modes, rollback, or full IKEMEN resources.

Risks: leader/resource-owner conflation, duplicated side banks, disagreement between runtime and HUD, reset corruption, and silent MUGEN-profile behavior changes.

## Cross-Cut Evidence Contract

Every implementation cut under this issue must record:

- Exact upstream revision and line links used.
- Explicit compatibility profile and unchanged profiles.
- Inputs, outputs, versioned schema, and exact consumers changed.
- Focused tests for success, rejection, reset, and exception/atomicity paths.
- Required trace only when behavior changes; stable legacy checksums/fingerprints where behavior must not change.
- `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm qa:trace`, `pnpm check:boundaries`, and `git diff --check` according to the operational checklist.
- `pnpm qa:smoke`, screenshots, and visual inspection only when camera/renderer/HUD/lifebar/Studio surfaces change.
- Claim allowed / claim blocked language in the affected compatibility/support/workplan/backlog docs.
- No score movement from read models, registry plumbing, docs, or tests alone.
- Only local synthetic/native fixtures; no commercial or third-party character assets.

## Global Risks And Open Questions

1. Standby CNS participation can leak into blocked effects/resources unless the runtime has an explicit per-phase capability/participation mask.
2. The minimal `TagIn` / `TagOut` parameter subset for `046c` must be chosen and named. Unsupported upstream parameters must stay visible in reports.
3. P2 can include player-type Helpers upstream, but Helper `type = player` compile/runtime behavior is not in the closed baseline. Keep those candidates blocked until a dedicated gate.
4. Exact P2 cache invalidation, X/Z distance, behind-facing penalty, ties, and refresh timing need their own oracle; do not bury them inside the identity matrix.
5. Disabled roots appear in the complete actor list but skip action. Decide whether schedule diagnostics record them as skipped or omit them without changing actual behavior.
6. Tag same-tick behavior depends on prepared order. Reordering mid-frame, replaying an incoming root, or making the transition next-tick-only would each be a different semantic claim.
7. Team leader and member order can change independently; confirm which bounded Tag parameters enter `046c` versus a later follow-up.
8. Shared power/life policy depends on game configuration that the browser may not load yet. Use explicit fixture options and block config-file parity.
9. Snapshot/schema evolution must remain backward-compatible or deliberately versioned; fingerprints must not hide state that drives a later consumer.
10. Multi-root combat, round, and presentation can change deterministic order and existing 1v1 checksums. Each consumer needs a narrow regression oracle before widening the next.

## Overall Claim Ceiling

Allowed now, from the latest checkpoint override:

> The explicit IKEMEN profile has bounded source-backed root/helper scheduling, complete team topology and selection diagnostics, bounded root-to-Helper Tag aggregate execution, Helper-originated self Tag standby, required Helper-owned Tag evidence, independent same-side Tag command routing, immutable normal-tick active-root motion/animation, and runtime-owned body/shadow/camera selection while pair gameplay/HUD consumers remain P1/P2-owned.

The next accepted decision boundary is narrower than full gameplay: Wayfinder 100 must source-map stage clamp, body push, diagnostic collision, outgoing attack, incoming hurt, and combat mutation as independent consumers before selecting one executable cut. Effects, round, HUD/audio, and resources stay independent.

Wayfinder 099 is now resolved. `RuntimeRootPresentation/v0` publishes separate draw/camera ids and stable per-root reasons; required checksum `97255586` plus desktop/mobile handoff/reset evidence proves P3/P2 character presentation while P1/P2 actors, HUD, hit sparks, collision debug, effects, combat, round, audio, and resources remain stable. Immediate standby-based outgoing-root hiding remains temporary debt until Tag ZSS entering/leaving/waiting states execute.

Blocked now:

> Helper-originated redirect/aggregate Tag axes, active-root direct native input/AI, remaining fighter phases, stage clamp/push/collision/combat, root-key effects, round/lifebars/resources, exact Tag presentation choreography, complete Simul/Tag/Turns gameplay, ZSS/Lua/config/screenpack execution, rollback, netplay, or full IKEMEN parity.

This issue closes only when each claimed cut has its own evidence. Completing `046a` does not close `046b`, completing `046c` does not imply team gameplay, and no I2 runtime gate closes an I1 scanner task.

# ADR 0006: Runtime redirected-target dispatch lease

Status: Accepted (bounded RedirectID routes)

Date: 2026-07-15

Last reviewed: 2026-07-16 at HEAD `be951e9a`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related research:
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md

Current audit:
docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md

## Context

The current runtime has bounded RedirectID support across:

- root active CNS;
- root imported State -1 setup;
- helper caller to root destination;
- helper caller to helper destination;
- Target mutation, binding, TargetState, and auxiliary-resource subsets.

The behavior is spread across PlayableMatchRuntime, HelperSystem, target
systems, helper target-state systems, wrapper conversion, and telemetry.
Candidate selection and controller routing are repeated between root active and
State -1 paths. Helper routing has a separate resolver and commits the
destination plus every candidate wrapper after execution. Telemetry converts a
helper destination to its root, losing exact destination identity.

Helper-destination TargetState was deliberately blocked during the lease
migration because the runtime had not yet represented the redirected helper's
state-program ownership safely. ADR 0007 now defines and gates that bounded
ownership slice without widening this ADR's generic lease contract.

The latest bounded report frontier is 633/633 traces. This proves the named
routes, not that the current architecture is safe to extend mechanically.

## Implementation checkpoint - accepted at bounded scope

The repository now contains `RuntimeRedirectedTargetDispatchSystem`, and the
covered root/helper leases resolve destination identity, target-store
projection, candidates, state owner, status, and bounded freshness. This is a
bounded implementation of Alternative B for the named RedirectID routes.
Wayfinders 210-229 close other runtime/product lanes and do not widen this
decision. `TargetSystem` already returns exact selected and mutated identities,
and the lease now makes that result the sole bounded commit boundary.

The bounded implementation now provides the contract required by this ADR:

- `resolveResult()` returns typed invalid, missing, stale, and unsupported
  outcomes;
- destination revision/generation and reference identity reject stale reuse;
- operation class plus candidate, selected, mutated, and writeback ids are
  explicit;
- caller, destination, state-owner, route, revision, and telemetry identity
  remain in the trace;
- one lease execution owner revalidates around the commit callback and helper
  writeback is limited to the mutation set;
- duplicate helper writeback loops and adapter-owned observation construction
  are guarded against deletion by `check:redirect-boundary`.

Status is **Accepted** for the bounded routes named in this ADR. This decision
does not move a compatibility score by refactor alone.

## Forces

- RedirectID resolves a live actor identity, not merely a root fighter.
- The redirected actor owns the target store queried by Target controllers.
- Target ID and index filtering select zero, one, or several targets.
- Different operations mutate different actors.
- TargetState additionally transfers state-program ownership.
- Active CNS, State -1, and helper execution must preserve their phase order.
- Trace evidence must retain caller, destination, state owner, selected
  targets, mutated actors, and invalid-route diagnostics.
- Future rollback/netplay needs deterministic mutation boundaries, but this ADR
  must not require a full immutable runtime rewrite.

## Design alternatives

### Alternative A: shared callback bundle

Extract destination resolution and candidate selection into functions supplied
to existing dispatchers.

Advantages:

- smallest patch;
- low migration risk;
- easy to characterize.

Disadvantages:

- shallow Interface;
- writeback, state owner, and telemetry remain distributed;
- root/helper phase variants can drift again;
- low Leverage for rollback or new controller families.

### Alternative B: redirected-target dispatch lease

A deep Module resolves a request into a short-lived lease:

1. resolve validates caller, phase, RedirectID, destination, and actor revision;
2. the lease owns target-store projection, state-program owner, target
   selection, and telemetry attribution;
3. execute returns an operation-specific mutation set and events;
4. commit revalidates the lease and writes only actors in that mutation set.

Root and helper execution become Adapters over the same Interface.

Advantages:

- high Depth behind a small Interface;
- strong Locality for identity, ownership, writeback, and telemetry;
- high Leverage across active CNS, State -1, helpers, Target, and binding
  families;
- supports incremental migration;
- prepares deterministic rollback without requiring it now.

Disadvantages:

- medium migration cost;
- requires characterization of current behavior first;
- lease revision/freshness rules add a new failure mode that needs tests.

### Alternative C: immutable command to patch/event transaction

Every controller creates an immutable command. A dispatcher returns a complete
patch/event list that a transaction owner applies atomically.

Advantages:

- strongest determinism and rollback story;
- excellent replay and traceability;
- no hidden direct mutation.

Disadvantages:

- largest migration;
- broad test surface;
- risks mixing controller compatibility work with a runtime-wide state model
  rewrite.

## Proposed decision

Adopt Alternative B after characterization. Preserve Alternative C as a later
evolution for rollback/netplay and use its transaction principles immediately
for Turns continuation.

The candidate Module name is RuntimeRedirectedTargetDispatch. The exact name is
less important than the ownership boundary.

The Interface must keep these concepts together:

- caller identity and execution phase;
- RedirectID destination identity;
- destination actor revision/liveness;
- destination target store;
- target ID/index selection;
- state-program owner where applicable;
- operation-specific mutation set;
- telemetry attribution;
- fail-closed diagnostic.

The Interface must not own:

- parsing or lowering controller parameters;
- concrete Target controller semantics already owned by target/resource
  systems;
- round/team policy;
- general actor scheduling;
- full rollback/netplay.

## Mutation-set rules

The dispatch result must identify concrete actor IDs whose authoritative state
changed. It must not default to all wrapper candidates.

Expected operation classes:

- TargetLife/Power/Vel/Facing/resource: selected target actors.
- TargetBind: destination target-store/binding state and affected targets.
- BindToTarget: redirected destination actor plus any target binding state the
  implementation actually changes.
- TargetDrop: destination target store and affected binding records.
- TargetState: selected target actors plus explicit state-program ownership.

The final mapping must be established by characterization tests rather than
assumption.

## Helper-destination TargetState

The specific ownership decision is recorded in
[`docs/adr/0007-helper-targetstate-redirect-ownership.md`](0007-helper-targetstate-redirect-ownership.md).
It is a bounded extension of this lease, not a generic authorization for
helper-owned state programs. The accepted route uses the destination helper's
target memory, the destination helper's root fighter as state-program owner,
and selected root fighters only. Helper-selected targets remain fail-closed.

## Migration order

1. Characterize root active, root State -1, helper-to-root, and
   helper-to-helper routes without changing behavior.
2. Add lease resolution and explicit selected actor IDs.
3. Add operation-specific mutation sets and telemetry identities.
4. Migrate root active CNS.
5. Migrate root State -1.
6. Migrate helper-to-root.
7. Migrate helper-to-helper.
8. Resolve helper-destination TargetState ownership through ADR 0007 and its
   bounded trace gate.

Each step must preserve existing required trace semantics or document an
intentional, source-backed checksum change. No step moves a score by refactor
alone.

## Decision evidence

- `f2e9521f`, `5088f6b8`, and `e894c10e` characterize the four routes and their
  candidate, mutation, writeback, and telemetry identities.
- `7a5d0075` adds the typed result, generation freshness, unsupported failure,
  and operation classification.
- `61987675` makes the lease the revalidating commit owner and limits helper
  writeback to `mutatedActorIds`.
- `5750eb0a` centralizes observation construction and adds the deletion guard.
- The focused runtime/helper/lease/telemetry checkpoint passes `287/287` tests;
  TypeScript 7, production build, repository boundaries, and
  `check:redirect-boundary` pass.
- The unselected helper candidate remains byte-identical and is absent from the
  commit callback.
- ADR 0007 accepts the helper-destination TargetState ownership boundary in
  `fd1b6133`; its focused checkpoint passes `926/926` tests, TypeScript 7,
  production build, repository boundaries, and `check:redirect-boundary`.
- ADR 0008 accepts the bounded helper State -1 `keyctrl` route in `be951e9a`;
  its grouped focal checkpoint passes `404/404` tests, TypeScript 7,
  production build, repository boundaries, and `check:redirect-boundary`.

## Acceptance

- One Interface owns destination resolution, candidate projection,
  state-program ownership, mutation scope, and telemetry attribution.
- Root and helper paths are distinct Adapters over it.
- Invalid, stale, removed, or unsupported destinations fail closed.
- An unselected helper candidate remains byte-identical after dispatch.
- Trace evidence retains original caller and exact destination identities.
- Existing root active, root State -1, helper-to-root, and helper-to-helper
  route gates remain green.
- Helper-destination TargetState is accepted only within ADR 0007's bounded
  root-target route; helper-target entry and broader parity remain blocked.
- Boundary and deletion tests explain why this Module must remain.

## Consequences

Positive:

- The runtime gains a real Seam for an already repeated and growing policy.
- Future Target families can reuse one ownership contract.
- Hidden wrapper writeback and telemetry collapse become testable.
- The design supports later immutable patches without forcing that rewrite.

Negative:

- The initial migration adds types and characterization work without new
  compatibility credit.
- A stale lease can reject work that previously executed; this needs explicit
  diagnostics.
- TargetState remains a separately audited high-risk path with a narrow
  helper-destination ownership contract.

## Claim boundary

Allowed after acceptance:

- Redirected target dispatch ownership is centralized and existing bounded
  routes preserve evidence.

Blocked:

- broader controller support;
- root-to-helper support unless separately gated;
- helper-target TargetState entry and broader helper custom-state semantics;
- recursive RedirectID;
- exact multi-target ordering beyond explicit evidence;
- rollback/netplay;
- complete MUGEN or IKEMEN parity.

## Deletion test

If this Module were deleted, actor identity resolution, target-store selection,
state owner, mutation writeback, and telemetry would have to be redistributed
across PlayableMatchRuntime, HelperSystem, and state-program dispatch. That
cross-module policy spread is the reason this is a justified deep Module rather
than a convenience wrapper.

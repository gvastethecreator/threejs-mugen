# ADR 0007: Helper-destination TargetState ownership

Status: Accepted (bounded root-target route)

Date: 2026-07-16

Last reviewed: 2026-07-16 at HEAD `be951e9a`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related decision: [`docs/adr/0006-runtime-redirected-target-dispatch.md`](0006-runtime-redirected-target-dispatch.md)

Research: [`docs/research/2026-07-16-helper-targetstate-redirect-ownership.md`](../research/2026-07-16-helper-targetstate-redirect-ownership.md)

Closeout: [`docs/reports/2026-07-16-helper-targetstate-redirect-closeout.md`](../reports/2026-07-16-helper-targetstate-redirect-closeout.md)

## Context

The bounded RedirectID lease already resolves a helper caller to a live root or
helper destination and projects that destination's target memory. Before this
decision, helper-destination `TargetState` remained fail-closed because target
memory ownership and state-program ownership were different questions.

IKEMEN-GO's current `targetState` path derives the state-owner player from the
executing state block, while `stateOwner()` returns the root character. The
local runtime already has a root-owned custom-state entry world, but it does
not have a helper-owned state clock, animation owner, or helper wrapper commit
contract for selected helper targets.

## Decision

Accept one bounded helper-destination route:

1. `RedirectID` resolves a live destination helper.
2. `TargetState` reads the destination helper's own target memory.
3. The destination helper's root fighter is the state-program owner.
4. Only selected live root fighters may enter the state.
5. State availability is preflighted for every selected target before the
   controller operation or entry callback runs.
6. The existing root-owned state-entry path owns custom-state clock,
   animation, `SelfState`, and return behavior.
7. A selected helper target, missing root owner, unavailable state, stale
   destination, invalid PlayerID, or missing target fails closed with no state
   entry and no mutation set.
8. Telemetry retains the helper destination identity and records the destination
   root as `stateOwnerId` for this controller family.

This decision does not make helper actors state-program owners. It also does
not change target selection, target ID matching, or helper target-memory
semantics outside this route.

## Alternatives rejected

### Keep all helper-destination TargetState blocked

This would preserve safety but leave a source-backed root-owned route
unimplemented even though the existing state-entry world can represent it.

### Use the destination helper as state-program owner

Rejected because the runtime has no bounded helper custom-state table, state
clock, animation ownership, or wrapper commit semantics to support it.

### Allow helper-selected targets

Rejected because helper target entry would fabricate state ownership and timing
semantics that are not represented by the current runtime.

## Consequences

Positive:

- helper-to-helper `TargetState` now has an explicit source-backed ownership
  seam;
- selected root targets use the existing root-owned custom-state path;
- invalid and unsupported selections remain observable and fail closed;
- the target dispatcher preflight prevents partial multi-target state entry.

Negative:

- helper-selected targets remain unsupported;
- broader helper negative-state/global-state semantics, recursive RedirectID,
  projectile/team ownership, and exact multi-target ordering remain outside the
  claim;
- this does not move a broad MUGEN/IKEMEN parity score.

## Evidence

- Implementation: `fd1b6133`.
- Synthetic gate: `synthetic-imported-helper-target-state-helper-redirect-golden`.
- Focused checkpoint: `926/926` tests passed across TargetSystem,
  RuntimeMatchHelperTargetStateSystem, RuntimeTraceGatePresets, HelperSystem,
  PlayableMatchRuntime, and RuntimeRedirectedTargetDispatchSystem.
- `pnpm build` passed, including TypeScript 7 typecheck and Vite production
  build.
- `pnpm check:boundaries` and `pnpm check:redirect-boundary` passed.
- A selected helper target is covered by a TargetSystem fail-closed test and
  produces no entry callback or mutation ids.

## Claim boundary

Allowed:

- bounded `ikemen-go` helper-to-helper `TargetState` redirect to a selected
  root fighter using destination-helper target memory and destination-root
  state ownership;
- fail-closed invalid, stale, unavailable, and helper-selected cases;
- trace evidence for destination, root owner, selected target, and custom-state
  return.

Blocked:

- helper-owned state programs or helper-selected target entry;
- broader helper negative-state/global-state and Common1/helper lookup
  expansion;
- recursive redirects, projectile/team ownership, exact multi-target order,
  rollback/netplay, and full MUGEN/IKEMEN parity.

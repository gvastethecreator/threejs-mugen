# Redirect lease migration closeout

Date: 2026-07-16
Wayfinder ticket: 239 / T12
Implementation commits: `61987675`, `5750eb0a`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| Revalidating lease commit owner | passed | `execute()` checks freshness after operation preparation and around commit |
| Root active and State -1 migration | passed | Existing route traces remain green through the shared lease owner |
| Helper-to-root and helper-to-helper migration | passed | Helper target/bind routes use the shared owner and exact mutation ids |
| Mutation scope | passed | `commitActor` receives `mutatedActorIds`, not all candidates |
| Unselected helper identity | passed | Focused test proves no commit callback and byte-identical helper state |
| Observation construction | passed | Root/helper adapters use the lease-owned builder |
| Boundary/deletion guard | passed | `pnpm run check:redirect-boundary` |
| Existing architecture boundaries | passed | `pnpm run check:boundaries` |
| Focused runtime tests | passed | 4 files, `287/287` tests |
| TypeScript 7 | passed | `pnpm run typecheck` |
| Production build | passed | `pnpm run build`; existing large-chunk advisory remains |
| ADR 0006 status | pending | Formal state-owner decision is intentionally not changed here |

## Implementation

`RuntimeRedirectedTargetDispatchWorld.execute()` is the shared revalidating
commit boundary. Helper target/bind dispatches prepare the target selection,
then the owner commits only actor ids present in `mutatedActorIds`. The old
candidate-wide helper loops are gone. Root and helper adapters build trace facts
through `createRuntimeRedirectedTargetDispatchObservation()`; the telemetry
world remains the single identity/retention owner.

## Architectural audit

The new `scripts/check_redirected_target_dispatch_boundary.cjs` guard checks
that the lease owns resolution/execution and observation construction, that
helper writeback has one implementation, that broad wrapper loops are absent,
and that adapters use the shared builder. This is a deletion guard, not a claim
that all runtime state is immutable or transactional.

## Claim ceiling

This closes the bounded T12 implementation slice. It does not accept ADR 0006,
prove registry-owned state-program lookup, typed execute-time mutation patches,
rollback/netplay, recursive redirects, external engine parity, or full
MUGEN/IKEMEN parity. Helper-destination TargetState remains fail-closed.

## Next

Resolve the ADR 0006 state-owner decision gate. If accepted, keep the deletion
guard as a regression gate; if amended, record the narrower ownership contract
before extending RedirectID to new controller families.

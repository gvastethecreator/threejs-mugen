# Redirect lease v1.1

Date: 2026-07-16
Type: task
Status: resolved
Blocked by: T10

Implementation commit: `7a5d0075`

## Question

Can the RedirectID lease expose a typed resolution result, revalidate an actor
generation, classify the operation, and fail closed for stale or unsupported
destinations while preserving the four characterized routes?

## Answer

Yes, at the bounded v1.1 contract. `resolveResult()` now returns a discriminated
`resolved` or `rejected` result. Rejections carry a typed code, phase, caller,
PlayerID, optional destination/revision, and reason. A destination generation
token is checked at resolve time and again by `lease.isFresh()`. Target dispatch
selections expose an operation class, and the real root/helper adapters consume
the typed result. The legacy `resolve()` method remains as a lease-only adapter
for existing callers.

## Contract

- Failure codes: `invalid-player-id`, `missing-destination`,
  `stale-destination`, and `unsupported-destination`.
- Freshness: destination reference, liveness, and optional current-generation
  callback must all remain valid while the lease is open.
- Operation classes: `target-resource`, `target-motion`, `target-binding`,
  `target-state`, `bind-to-target`, and bounded `target-controller` fallback.
- Attribution: existing route/caller/destination/state-owner fields remain
  intact; selected, mutated, candidate, and writeback projections survive.
- Unsupported helper-destination `TargetState` now reaches the typed rejection
  path and remains fail-closed.

## Boundaries

This cut does not migrate duplicate writeback into one commit owner, add a typed
execute mutation union, introduce rollback, authorize helper-destination
TargetState, or accept ADR 0006. Those remain later migration and decision
work.

## Evidence target

- Resolution tests must cover successful typed results, invalid/missing/stale/
  unsupported failures, same-object generation drift, and legacy adapter
  compatibility.
- Four route tests must preserve their T10 trace identities and operation class.
- TypeScript 7 and production build must pass.

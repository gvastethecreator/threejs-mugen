# Redirect lease migration and ADR decision gate

Date: 2026-07-16
Type: task
Status: implementation-complete / ADR decision pending
Blocked by: T11

Implementation commits: `61987675`, `5750eb0a`

## Question

Can the four bounded RedirectID adapters share a revalidating commit owner,
write only the characterized mutation set, and remove adapter-owned writeback
and observation construction before accepting ADR 0006?

## Answer

The implementation slice is ready for the ADR decision gate. The lease
`execute()` method now revalidates after operation preparation and before and
after its commit callback. Helper target/bind routes use the exact
`mutatedActorIds` set, so unselected candidates are not committed. Resource
redirects keep their existing empty candidate projection. Observation shape
construction is owned by the lease module; telemetry identity and retention
remain owned by the telemetry world.

## Delivered

- Root active, root State -1, helper-to-root, and helper-to-helper target routes
  execute through the same lease commit boundary.
- Duplicate helper `commitActor` loops are deleted; one helper commit function
  maps only authorized mutation ids to wrappers.
- Root/helper observation object construction is deleted from adapters and
  replaced by `createRuntimeRedirectedTargetDispatchObservation()`.
- `check:redirect-boundary` guards the ownership/deletion invariant.
- An unselected helper candidate is asserted byte-identical and absent from
  the commit callback.

## Decision gate

ADR 0006 remains `Proposed` in the existing ADR file. This report proves the
bounded migration and all route evidence, but does not silently change the
formal architecture status owned by that document. The remaining decision is
whether the adapter-supplied state-owner token is sufficient for acceptance or
requires a registry-owned state-program ownership contract.

## Evidence target

- Focused runtime/helper/lease/telemetry run.
- TypeScript 7, production build, repository boundaries, and redirect deletion
  guard.
- Route and unselected-byte-identity traces.

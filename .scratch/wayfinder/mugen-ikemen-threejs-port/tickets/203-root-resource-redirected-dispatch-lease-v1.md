# Implement Root Resource Redirected Dispatch Lease/v1

Type: task
Status: resolved
Blocked by: None

## Question

Can root active CNS and State -1 resource `RedirectID` controllers reuse the
same short-lived lease as target dispatch without changing resource operation
evaluation, caller-owned values, telemetry, or profile gating?

## Scope

Migrate the already characterized root resource family through the shared
redirected-dispatch lease: `CtrlSet`, `LifeAdd`, `LifeSet`, `PowerAdd`,
`PowerSet`, `GuardPointsAdd/Set`, `DizzyPointsAdd/Set`, and `RedLifeAdd/Set`.
The lease carries root caller identity, RedirectID expression/value, exact
destination, destination target-store adapter, state-owner metadata, and a
freshness check. `RuntimeControllerDispatchWorld` remains the concrete
resource executor.

Cover active CNS and State -1 setup paths. Keep non-resource redirectable
controllers on their current adapters when they do not use the lease.

Do not widen helper resource semantics, projectile/team ownership,
TargetScoreAdd, recursive redirects, asynchronous rollback/netplay, or full
parity in this ticket.

## Evidence required

- lease unit coverage proves root resource phase metadata and empty candidate
  projection;
- active and State -1 root resource RedirectID route tests remain green,
  including invalid fail-closed behavior and caller control/resource values;
- TypeScript 7 check and focused runtime batch pass;
- closeout report records no score movement and the remaining migration
  boundary.

## Research basis

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
- ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`
- Existing resource characterization tickets 179 and 180 in this map.

## Exit

Root resource redirects resolve and execute through one synchronous lease in
both phases, with resource operation evaluation still owned by the caller
context and stale/invalid destinations unable to mutate a runtime actor.

## Resolution

Implemented root resource lease dispatch for active CNS and State -1 setup.
The existing root lease handler now accepts the characterized resource
controller family and resource routes use an empty candidate projection,
because resources mutate one resolved destination rather than select from
target memory. Dynamic resource operation resolution remains inside the
synchronous lease operation; the concrete executor remains
`RuntimeControllerDispatchWorld`.

The existing non-resource root redirect adapters remain unchanged, and
invalid RedirectID behavior remains fail-closed.

## Evidence

- Existing active and State -1 resource RedirectID routes remain green,
  including `CtrlSet`, invalid resource destinations, and caller-local
  resources.
- Added valid integration coverage for active `LifeAdd` and State -1
  `PowerSet` destination mutation through the lease.
- Focused batch: `8/8` selected lease/resource route tests passed.
- TypeScript 7 check: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace remain deferred to the
  next multi-slice checkpoint.

## Claim boundary

Allowed: characterized root active CNS and State -1 resource RedirectID
controllers share the synchronous destination identity/freshness/store lease
while preserving caller-owned dynamic values, resource mutation, telemetry,
and profile gating.

Still open: helper resource RedirectID, projectile/team ownership, recursive
redirects, exact multi-target ordering, `TargetScoreAdd`, persistence,
rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Commits

- `a321baf9 docs(wayfinder): select root resource lease`
- `20842502 feat(runtime): lease root resource redirects`

## Next frontier

Characterize helper-local resource RedirectID or projectile/team ownership as
the next independent actor-family boundary; do not combine it with recursive
dispatch or persistence.

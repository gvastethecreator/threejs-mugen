# Implement Root Resource Redirected Dispatch Lease/v1

Type: task
Status: open
Blocked by: 202

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

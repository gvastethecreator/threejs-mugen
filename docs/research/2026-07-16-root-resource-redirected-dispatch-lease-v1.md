# Root Resource Redirected Dispatch Lease/v1 Research Note

Date: 2026-07-16
Wayfinder ticket: 203
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Primary sources

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
  defines the optional `RedirectID` destination expression used by the
  resource controller family.
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
  anchors legacy resource-controller execution that remains the semantic
  baseline for the port.

## Repository evidence

- Root resource RedirectID behavior is already characterized for active CNS
  and State -1 setup, including basic and auxiliary resources and `CtrlSet`.
- `resolveRedirectedResourceController` evaluates dynamic operation values
  against the caller runtime/context before `RuntimeControllerDispatchWorld`
  mutates the destination actor.
- The current root path resolves destinations through the older direct helper,
  while root target and helper target routes already use the lease adapter.

## Decision

Reuse the root active and root State -1 lease phases for resource controllers;
the phase describes schedule ownership, while the concrete resource type stays
in the controller operation. Resource dispatch has no target selection, so the
lease candidate projection is intentionally empty. The lease still owns the
destination identity, target-store adapter, state owner, and freshness gate.

Keep operation resolution inside the synchronous lease operation. This leaves
caller-owned expression/value semantics unchanged and prevents a stale lease
from recording telemetry or mutating the destination.

## Acceptance boundary

Allowed: characterized root active and State -1 resource RedirectID routes
share lease identity/freshness without changing resource semantics.

Blocked: helper resources, projectile/team ownership, recursive redirects,
TargetScoreAdd, persistence, rollback/netplay, presentation, and full parity.

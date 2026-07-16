# Helper Resource Redirected Dispatch Lease/v1 Research Note

Date: 2026-07-16
Wayfinder ticket: 204
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Primary sources

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
  documents resource controller `RedirectID` as a destination expression in
  the extended controller surface.
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
  anchors the local resource-controller baseline that the helper runtime must
  preserve.

## Repository evidence

- `runRuntimeHelperStateControllers` already dispatches helper resource
  controllers through `RuntimeControllerDispatchWorld` with helper-owned
  expression context.
- `RuntimeHelperTargetRedirect` and the shared lease already model exact root
  and helper actor identity, target stores, wrapper commits, and liveness.
- Character identity registration exposes live root and helper PlayerID
  destinations; helper state-entry/global-state scheduling is not present in
  this path.

## Decision

Use the existing `helper` lease phase for helper resource redirects. Resolve
the RedirectID expression in the helper caller context, select a live root or
helper actor, pass an empty candidate projection, and execute the existing
controller dispatcher synchronously. For helper destinations, synchronize the
mutated actor wrapper inside the lease callback; for roots, the root object is
already the runtime owner.

The non-redirected helper path remains local and the current controller
profile gate remains explicit IKEMEN-only at the PlayableMatchRuntime
resolver.

## Acceptance boundary

Allowed: helper CNS resource RedirectID to live root/helper destinations,
including invalid fail-closed and local no-redirect paths.

Blocked: helper State -1/global-state, helper custom-state TargetState,
projectile/team ownership, recursive redirects, TargetScoreAdd, persistence,
rollback/netplay, presentation, and full parity.

# Helper Redirected Target Dispatch Lease/v1 Research Note

Date: 2026-07-16
Wayfinder ticket: 202
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Primary sources

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
  documents `RedirectID` as an optional destination expression for the
  controller families being ported.
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
  anchors the legacy `Target*`, `BindToTarget`, and state-controller behavior
  that remains the semantic baseline.

## Repository evidence

- `RuntimeHelperTargetRedirect` already separates destination actor, candidate
  projection, and helper-wrapper commit callbacks.
- `RuntimeTargetControllerDispatchWorld` already owns concrete target
  selection and mutation projections.
- Existing helper integration traces prove both helper-to-root and
  helper-to-helper routes; helper destination `TargetState` is deliberately
  fail-closed.
- Root lease/v1 (Wayfinder 201) provides the identity/freshness contract to
  reuse without adding asynchronous or rollback behavior.

## Decision

Use the same short-lived synchronous lease for helper routes. The helper
resolver evaluates the RedirectID expression and identifies the live
destination, while the lease owns exact identity, target store, state-owner
metadata, and candidate projection. The helper dispatcher remains the
operation executor. Helper wrapper synchronization occurs inside the lease
operation after dispatch returns, so stale or aborted leases cannot write
back a destination wrapper.

The existing helper destination `TargetState` rejection remains in place;
this slice does not invent custom-state ownership for helper destinations.

## Acceptance boundary

Allowed: helper-to-root and helper-to-helper `Target*`/`BindToTarget` lease
resolution with unchanged telemetry and runtime snapshots.

Blocked: helper destination `TargetState`, resource controllers,
projectile/team ownership, recursive redirects, exact multi-target ordering,
rollback/netplay, presentation, score, and full MUGEN/IKEMEN parity.

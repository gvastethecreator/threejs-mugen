# Root Redirected Target Dispatch Lease/v1 Research Note

Date: 2026-07-16
Wayfinder ticket: 201
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Primary sources

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
  defines `RedirectID` as an optional controller destination expression for
  the relevant target/resource controller families.
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
  anchors the legacy `Target*`, `BindToTarget`, and state-controller behavior
  that the runtime must preserve while adding the IKEMEN route.
- Current repository characterization:
  `docs/reports/2026-07-16-redirected-target-characterization-closeout.md`
  proves the four caller/destination identities and operation-specific
  mutation projections without yet centralizing resolution.

## Decision

The first lease migration is root-only and target-family-only. It covers the
active CNS and State -1 setup adapters because they already share the same
`RuntimeTargetControllerDispatchWorld` semantic executor and differ only in
phase ownership. A lease is intentionally synchronous: it checks the live
destination and exact actor reference immediately before execution, then
closes after the dispatcher returns. This supplies the ADR's initial
freshness/liveness boundary without introducing rollback or a new patch model.

The lease does not parse controller parameters, evaluate RedirectID
expressions, implement target semantics, or own scheduling. Those remain in
the existing adapters and target systems until later migration tickets.

## Acceptance boundary

Allowed: root active and root State -1 target/binding dispatches reuse a
common identity/freshness/candidate/store lease while preserving existing
runtime snapshots, telemetry, and checksums.

Blocked: helper routes, resource controllers, projectiles/teams, helper
destination `TargetState`, recursive redirects, exact multi-target ordering,
rollback/netplay, presentation, score, and full MUGEN/IKEMEN parity.

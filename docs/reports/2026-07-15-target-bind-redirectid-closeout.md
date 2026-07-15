# TargetBind RedirectID closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `ba5b588b`.

## Delivered behavior

Active CNS and imported State -1 `TargetBind` controllers now accept the
explicit `ikemen-go` `RedirectID` route. A live root PlayerID destination
owns the binding in its target memory while the caller-owned target ID,
offset, logical-Z component, and duration remain authored by the source
controller. Omitted RedirectID remains local. Invalid, negative, unavailable,
disabled, destroyed, malformed, and legacy routes fail closed before
mutation.

## Evidence

- Required active artifact: `synthetic-imported-target-bind-redirect`, checksum
  `c1c229b6`.
- Required State -1 artifact:
  `synthetic-imported-target-bind-state-entry-redirect`, checksum `08782996`.
- Full trace QA: `pnpm qa:trace` passed 621/621 artifacts.
- Required/optional split: 587 required, 34 optional, 0 skipped.
- Affected runtime suites: 887/887 tests passed with the deliberate
  15-second timeout for the unchanged slow team handoff case.
- TypeScript 7 check: `pnpm typecheck` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed.

The paired traces and focal runtime tests prove reciprocal target links,
destination-owned binding memory, target-ID filtering, offset and duration
preservation, State -1 routing, typed telemetry, and invalid RedirectID
handling. No score, browser, helper/projectile/team, exact multi-target,
persistence, rollback/netplay, presentation, or full-parity claim is made.

## Audit

The closeout covered compiler lowering, active dispatch, State -1 setup
classification, root PlayerID resolution, TargetSystem binding state,
logical-Z propagation, binding lifetime, telemetry, required trace
registration, and fail-closed behavior. The test assertions capture the
first routed snapshot so the authored four-tick binding is checked before its
normal lifecycle expires.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines optional PlayerID redirection and the processing-order caveat.
- [Elecbyte TargetBind documentation](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines target binding relative to the player axis and the optional time,
  ID, and position parameters.

## Next boundary

TargetState remains a separate ownership boundary because it transfers a
remembered target into custom state execution. Helpers, projectiles, teams,
cross-localcoord scaling, exact multi-target ordering, persistence,
rollback/netplay, presentation, score, and full MUGEN/IKEMEN parity remain
open.

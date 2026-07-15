# Ticket 183: TargetPowerAdd state-entry RedirectID

Status: resolved

## Objective

Extend the bounded IKEMEN root TargetPowerAdd RedirectID route into imported
State -1 setup without claiming generic Target* or full target parity.

## Decision

In the `ikemen-go` profile, an imported root State -1 TargetPowerAdd may
redirect to a live root PlayerID destination. The destination's remembered
target world receives the authored power mutation. The caller owns the value
and RedirectID expression context. Missing RedirectID stays local; invalid,
unavailable, disabled, destroyed, negative, empty, malformed, and legacy
routes fail closed.

## Evidence

- Runtime commit: `84af42f0`.
- Affected runtime suites: 3 files / 814 tests passed.
- TypeScript 7, trace syntax, and `git diff --check`: passed.
- Full trace QA: 611/611, with 577 required, 34 optional, and 0 skipped.
- Required gate: `synthetic-imported-target-power-state-entry-redirect`.
- Required checksum: `e531fcdc`.

## Boundaries

Active-state TargetPowerAdd is covered by Entry 549. Helpers, projectiles,
neutral identity, team/simul target aggregation, other Target* controllers,
persistent-controller timing, rollback/netplay, presentation, score movement,
and full MUGEN/IKEMEN parity remain open. No score movement is recorded.

## Next

Select one independent Target* family boundary and repeat the source,
implementation, imported trace, QA, audit, and commit loop.

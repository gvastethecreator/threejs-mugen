# Ticket 182: TargetPowerAdd RedirectID

Status: resolved

## Objective

Implement a bounded IKEMEN root TargetPowerAdd RedirectID route without
confusing PlayerID identity with PlayerNo or claiming general target parity.

## Decision

Active CNS controllers in the ikemen-go profile may redirect TargetPowerAdd
to a live root PlayerID destination. The destination's remembered target
world receives the authored power mutation. Controller amount and RedirectID
expressions remain caller-owned. Missing RedirectID is local; invalid,
unavailable, disabled, destroyed, negative, empty, malformed, and legacy
routes fail closed.

## Evidence

- Runtime commit: a854bc56.
- Focal coverage: 3 files / 855 tests.
- TypeScript 7, trace syntax, and git diff --check: passed.
- Full trace QA: 610/610, with 576 required, 34 optional, and 0 skipped.
- Required gate: synthetic-imported-target-power-redirect.
- Required checksum: bf1cb5ce.

## Boundaries

State-entry setup, helpers, projectiles, neutral identity, team/simul target
aggregation, persistent-controller timing, rollback/netplay, presentation,
and full MUGEN/IKEMEN parity remain open. No score movement is recorded.

## Next

Select the next independent target-memory family boundary and repeat the
source, implementation, imported trace, QA, audit, and commit loop.

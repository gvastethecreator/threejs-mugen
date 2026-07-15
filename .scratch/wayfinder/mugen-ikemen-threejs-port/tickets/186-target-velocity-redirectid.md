# Implement TargetVelAdd/TargetVelSet RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can the root-only IKEMEN RedirectID route cover the target velocity pair while
preserving x-direction ownership and State -1 scheduling boundaries?

## Answer

Implement the bounded `ikemen-go` route for `TargetVelAdd` and `TargetVelSet`
across active CNS and imported State -1 setup. Redirected execution uses the
live root PlayerID destination's remembered target; the caller retains authored
x/y/ID context. Missing redirects remain local, and invalid or unavailable
destinations fail closed. The trace must prove reciprocal target links,
distinct caller/destination target memory, typed controller/operation telemetry,
and destination-owned `TargetVelSet` direction behavior.

Official basis and implementation risks are recorded in
`docs/research/2026-07-15-target-velocity-redirectid-selection.md`.

## Evidence

- Runtime commit: `477078e7`.
- Required active artifact/checksum:
  `synthetic-imported-target-velocity-redirect` / `4f62267d`.
- Required State -1 artifact/checksum:
  `synthetic-imported-target-velocity-state-entry-redirect` / `dedf1499`.
- Verification: 5 affected files / 893 tests, TypeScript 7, trace syntax,
  `git diff --check`, and `pnpm qa:trace` 615/615 (581 required, 34
  optional, 0 skipped).

## Boundary

TargetFacing, TargetBind, TargetState, helper/projectile/team ownership,
exact multi-target ordering, persistence, rollback/netplay, presentation,
score, and full parity remain future work.

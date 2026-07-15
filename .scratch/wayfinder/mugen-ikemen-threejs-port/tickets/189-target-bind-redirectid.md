# Implement TargetBind RedirectID

Type: task
Status: implemented and batched-QA verified
Blocked by: None

## Question

Can root-only IKEMEN RedirectID route active CNS and imported State -1
`TargetBind` through a live PlayerID destination while preserving caller-owned
target ID, offset, logical Z, and duration values?

## Answer

Research selects this as the next bounded Target* implementation. Official
basis and boundary are recorded in
`docs/research/2026-07-15-target-bind-redirectid-selection.md`.

Implementation: `ba5b588b` routes compiled active CNS and imported State -1
`TargetBind` controllers through the live root PlayerID RedirectID path. The
destination owns target binding memory while the caller retains target ID,
offset, logical-Z, and duration values. Invalid RedirectID expressions fail
closed before mutation.

Evidence: paired required traces pass with checksums `c1c229b6` and
`08782996`; the affected runtime suites pass 887/887, the full trace matrix
passes 621/621, and TypeScript 7 passes.

## Boundary

Live root fighters, `ikemen-go`, active CNS, and State -1 setup only. Helpers,
projectiles, teams, target-state transfer, cross-localcoord scaling, exact
multi-target order, pause-order parity, persistence, rollback/netplay,
presentation, score, and full parity remain blocked.

Next: source-backed selection of TargetState as the next custom-state
ownership boundary.

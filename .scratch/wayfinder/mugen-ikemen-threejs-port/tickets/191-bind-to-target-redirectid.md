# Implement BindToTarget RedirectID

Type: task
Status: implemented and batched-QA verified
Blocked by: None

## Question

Can root-only IKEMEN RedirectID route active CNS and imported State -1
`BindToTarget` through a live PlayerID destination while preserving
caller-authored target ID, offset, logical Z, position anchor, and duration?

## Answer

Research selected this as the next bounded Target* implementation. Official
basis and the boundary are recorded in
`docs/research/2026-07-15-bind-to-target-redirectid-selection.md`.

Implementation commit `95279aff` routes compiled active CNS and imported
State -1 `BindToTarget` controllers through the live root PlayerID RedirectID
path. The destination owns target binding memory while the source preserves
the authored binding payload. Invalid RedirectID expressions fail closed
before mutation.

Evidence: paired required traces pass with checksums `5c0adf83` and
`e2ce5ab3`; the affected runtime suites pass `897/897`, the full trace matrix
passes `625/625`, and TypeScript 7, build, boundary, syntax, and diff checks
pass.

## Boundary

Live root fighters, `ikemen-go`, active CNS, and State -1 setup only. Helpers,
projectiles, teams, target custom-state transfer, cross-localcoord scaling,
exact multi-target order, pause-order parity, persistence, rollback/netplay,
presentation, score, and full parity remain blocked.

Next: source-backed selection of the next independent Target* ownership
boundary.

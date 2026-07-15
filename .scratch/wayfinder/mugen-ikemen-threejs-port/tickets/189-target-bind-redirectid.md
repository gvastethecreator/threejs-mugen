# Implement TargetBind RedirectID

Type: task
Status: claimed
Blocked by: None

## Question

Can root-only IKEMEN RedirectID route active CNS and imported State -1
`TargetBind` through a live PlayerID destination while preserving caller-owned
target ID, offset, logical Z, and duration values?

## Answer

Research selects this as the next bounded Target* implementation. Official
basis and boundary are recorded in
`docs/research/2026-07-15-target-bind-redirectid-selection.md`.

## Boundary

Live root fighters, `ikemen-go`, active CNS, and State -1 setup only. Helpers,
projectiles, teams, target-state transfer, cross-localcoord scaling, exact
multi-target order, pause-order parity, persistence, rollback/netplay,
presentation, score, and full parity remain blocked.

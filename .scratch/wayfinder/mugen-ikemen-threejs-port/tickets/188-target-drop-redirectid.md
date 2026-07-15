# Implement TargetDrop RedirectID

Type: task
Status: claimed
Blocked by: None

## Question

Can the root-only IKEMEN RedirectID route cover TargetDrop in active CNS and
imported State -1 setup while preserving caller-owned excludeID/keepone values
and destination-owned target-memory pruning?

## Answer

Research selects this as the next bounded Target* implementation. Official
basis and boundary are recorded in
`docs/research/2026-07-15-target-drop-redirectid-selection.md`.

## Boundary

Live root fighters, `ikemen-go`, active CNS, and State -1 setup only. Helpers,
projectiles, teams, custom states, target-actor mutation, exact multi-target
random selection, persistence, rollback/netplay, presentation, score, and full
parity remain blocked.

# Implement TargetDrop RedirectID

Type: task
Status: implemented (focal verified; batched QA pending)
Blocked by: None

## Question

Can the root-only IKEMEN RedirectID route cover TargetDrop in active CNS and
imported State -1 setup while preserving caller-owned excludeID/keepone values
and destination-owned target-memory pruning?

## Answer

Research selects this as the next bounded Target* implementation. Official
basis and boundary are recorded in
`docs/research/2026-07-15-target-drop-redirectid-selection.md`.

Implementation: `090a1477` routes compiled active CNS and imported State -1
`TargetDrop` controllers through the live root PlayerID RedirectID path. The
destination owns target-memory and binding pruning; the caller retains the
typed `excludeID` and `keepone` values. Invalid RedirectID expressions fail
closed before mutation.

Evidence: the TargetDrop focal slice passed 6/6 tests, including compiler
lowering, State -1 classification, active/state-entry runtime routing, two
required trace presets, and invalid RedirectID handling. The required trace
runner registration and syntax check pass. Full trace/typecheck closeout is
deferred to the next batched QA checkpoint.

## Boundary

Live root fighters, `ikemen-go`, active CNS, and State -1 setup only. Helpers,
projectiles, teams, custom states, target-actor mutation, exact multi-target
random selection, persistence, rollback/netplay, presentation, score, and full
parity remain blocked.

Next: select one independent Target* family after the batched QA checkpoint;
TargetBind and TargetState remain separate ownership boundaries.

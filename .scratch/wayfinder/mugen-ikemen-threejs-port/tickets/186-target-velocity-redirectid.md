# Implement TargetVelAdd/TargetVelSet RedirectID

Type: task
Status: claimed
Blocked by: None

## Question

Can the root-only IKEMEN RedirectID route cover the target velocity pair while
preserving target-facing x semantics and State -1 scheduling boundaries?

## Answer

Implement the bounded `ikemen-go` route for `TargetVelAdd` and `TargetVelSet`
across active CNS and imported State -1 setup. Redirected execution uses the
live root PlayerID destination's remembered target; the caller retains authored
x/y/ID context. Missing redirects remain local, and invalid or unavailable
destinations fail closed. The trace must prove reciprocal target links,
distinct caller/destination target memory, typed controller/operation telemetry,
and target-facing `TargetVelSet` behavior.

Official basis and implementation risks are recorded in
`docs/research/2026-07-15-target-velocity-redirectid-selection.md`.

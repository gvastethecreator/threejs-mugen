# Implement helper Target* RedirectID

Type: task
Status: implemented and batched-QA verified
Blocked by: None

## Question

Can an IKEMEN helper route its Target* controllers through a live root
`PlayerID` destination while preserving authored target IDs, payloads, and
helper-local target memory?

## Answer

Yes, inside a bounded `ikemen-go` helper state route. Runtime commit
`bc2ecbe1` propagates a RedirectID resolver through active, post-fighter, and
hit-pause helper advancement. Test/trace commit `c845b903` covers
`TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`,
`TargetFacing`, `TargetBind`, and `TargetDrop`.

Evidence: required artifact checksum `5ad31141`; full trace matrix `626/626`
with `592` required, `34` optional, and `0` skipped; affected runtime tests
`868/868`; TypeScript 7, build, boundaries, syntax, and diff checks pass.

## Boundary

Live helpers, root PlayerID destinations, `ikemen-go`, and existing helper
target dispatch only. Helper-to-helper destinations, helper State -1/global
state, helper `BindToTarget`, TargetState/custom-state transfer, projectiles,
teams, recursive redirects, exact multi-target order, persistence,
rollback/netplay, presentation, score, and full parity remain open.

Next: source-backed selection of helper `BindToTarget` RedirectID.

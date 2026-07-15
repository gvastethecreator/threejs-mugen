# Implement helper BindToTarget RedirectID

Type: task
Status: implemented and batched-QA verified
Blocked by: None

## Question

Can a helper route `BindToTarget` through a live root PlayerID destination
while preserving target ID, anchor payload, logical Z, duration, and helper
local state separation?

## Answer

Yes, within a bounded `ikemen-go` helper state route. The existing generic
helper target dispatcher already supported `bindtotarget`; `a13746bb` adds the
dedicated runtime unit, playable runtime scenario, imported trace gate, and
QA registration. `3e14d378` adds invalid PlayerID fail-closed coverage.

Evidence: required trace checksum `f4c7b7f4` / final `07898058`; full trace
`627/627` with `593` required, `34` optional, `0` skipped; affected suite
`871/871`; TypeScript 7, build, boundaries, syntax, and diff checks pass.

## Boundary

Live helpers, root PlayerID destinations, `ikemen-go`, and existing
`BindToTarget` dispatch only. Helper TargetState/custom-state, helper State -1,
helper/projectile/team ownership, recursive redirects, exact multi-target
order, persistence, rollback/netplay, presentation, score, and full parity
remain open.

Next: source-backed helper TargetState/custom-state ownership selection.

# Implement helper-to-helper Target RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can a live helper route the bounded `Target*` mutation family through a
`RedirectID` that identifies another live helper while preserving destination
target-memory ownership?

## Answer

Yes, within the bounded `ikemen-go` route delivered by `3b586805` and
`5a4aa3fc`. The resolver now includes active helper identities, dispatch uses
the destination helper's target memory, and the runtime commits helper wrapper
state and target memory after execution. Invalid and unsupported helper
destinations fail closed.

Evidence: required trace checksum `caf7af02`; full trace `629/629` with `595`
required, `34` optional, and `0` skipped; affected suite `639/639`; TypeScript
7, build, boundaries, syntax, and diff checks pass.

## Boundary

The caller helper resolves `RedirectID = 59` to the live destination helper
`p2-helper-0`. Its target-memory `TargetLifeAdd`, `TargetPowerAdd`,
`TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, and `TargetDrop`
operations act on the destination helper's target `77` and commit to the live
target actors. Normal helper target routes and root destinations remain
unchanged.

Helper `TargetState`, helper `BindToTarget`, State -1/global-state ownership,
projectiles, teams, recursive redirects, exact multi-target order, persistence,
rollback/netplay, presentation, and full parity remain open.

## Sources

- [Elecbyte helper/player IDs and PlayerIDExist](https://www.elecbyte.com/mugendocs/trigger.html)
- [Elecbyte target controllers](https://www.elecbyte.com/mugendocs/sctrls.html)
- [IKEMEN RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
- [Elecbyte special-state scheduling](https://elecbyte.com/mugendocs/cns.html)

## Next

Map one separate helper ownership boundary: auxiliary target resources or
helper-destination `BindToTarget`.

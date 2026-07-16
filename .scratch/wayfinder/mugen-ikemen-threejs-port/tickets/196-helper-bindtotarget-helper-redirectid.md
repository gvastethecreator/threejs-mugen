# Implement helper-to-helper BindToTarget RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can a live helper route `BindToTarget` through a `RedirectID` that identifies
another live helper while preserving destination target-memory ownership and
binding payload?

## Answer

Yes, within the bounded `ikemen-go` route delivered by `f252a01c` and
`f242c84a`. The resolver now accepts live helper destinations for
`BindToTarget`, dispatch uses the destination helper's target memory, and
writeback persists the destination helper binding. Invalid and unsupported
custom-state helper destinations remain fail closed.

Evidence: required trace checksum `6132bd42`; full trace `630/630` with `596`
required, `34` optional, and `0` skipped; affected suite `641/641`; TypeScript
7, build, boundaries, syntax, and diff checks pass.

## Boundary

The caller helper resolves `RedirectID = 59` to `p2-helper-0`. Its target
memory selects `p1` target `77`, then stores `BindToTarget` with `20,-8,Mid`,
logical `Z = 6`, and time `4` on the destination helper. The caller helper's
binding remains independent. Target memory is observed during the live binding
window, not required to survive its normal expiry.

Helper `TargetState`, custom-state ownership, State -1/global-state execution,
projectiles, teams, recursive redirects, exact multi-target order, persistence,
rollback/netplay, presentation, and full parity remain open.

## Sources

- [Elecbyte helper/player IDs](https://www.elecbyte.com/mugendocs/trigger.html)
- [Elecbyte BindToTarget](https://www.elecbyte.com/mugendocs/sctrls.html)
- [IKEMEN RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)

## Next

Map one separate helper ownership boundary: custom-state destination entry or
auxiliary target resources.

# Implement helper-to-helper auxiliary Target resource RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can a live helper route `TargetRedLifeAdd`, `TargetGuardPointsAdd`, and
`TargetDizzyPointsAdd` through a `RedirectID` that identifies another live
helper while preserving destination target-memory ownership and resource
mutation semantics?

## Answer

Yes, within the bounded `ikemen-go` route delivered by `f48093b6` and
`70823693`. The resolver accepts live helper destinations for the three target
resource controllers, dispatch uses the destination helper's target memory,
and helper wrapper writeback preserves the destination ownership boundary.
Invalid and unsupported custom-state helper destinations remain fail closed.

Evidence: required trace checksum `d56173b3`; full trace `631/631` with `597`
required, `34` optional, and `0` skipped; affected suite `716/716`; TypeScript
7, build, boundaries, syntax, and diff checks pass.

## Boundary

The caller helper resolves `RedirectID = 59` to `p2-helper-0`. Its target
memory selects p1 target `77` and the caller-authored target ID `8893` selects
p2. The destination helper executes the typed red-life, guard-point, and
dizzy-point additions against the selected target actor. Red life remains
bounded by current life, while guard and dizzy points remain bounded by their
existing resource maxima.

Helper `TargetState`, helper custom-state ownership, State -1/global-state
execution, `TargetScoreAdd`, target Set variants, projectiles, teams,
recursive redirects, exact multi-target order, persistence, rollback/netplay,
presentation, and full parity remain open.

## Sources

- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)

## Next

Map one separate helper ownership boundary: custom-state destination entry or
another source-backed target-controller family.

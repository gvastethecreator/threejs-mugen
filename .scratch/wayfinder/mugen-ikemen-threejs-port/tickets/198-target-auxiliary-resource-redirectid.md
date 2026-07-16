# Implement root Target auxiliary resource RedirectID

Type: task
Status: claimed
Blocked by: None

## Question

Can imported root active CNS and State -1 controllers route
`TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd` through
`RedirectID` while preserving destination target-memory ownership and target
actor resource mutation?

## Answer

Pending implementation and paired trace verification.

## Boundary

Root caller and root destination only, `ikemen-go` profile. Active CNS and
State -1 setup are separate required routes. Target `ID`, `value`, and
`TargetRedLifeAdd absolute` remain caller-authored payload. Helpers,
projectiles, teams, neutral actors, custom-state transfer, target Set/Score
variants, recursive redirects, and full parity remain out of scope.

## Sources

- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
- [Elecbyte target state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
- [Selection note](../../../../docs/research/2026-07-15-target-auxiliary-resource-redirectid-selection.md)

## Acceptance

- Active required trace proves all three controllers, destination target links,
  and target resource values.
- State -1 required trace proves the same contract during setup.
- Affected tests, TypeScript 7, build, boundaries, syntax, diff, and full
  trace batch pass.

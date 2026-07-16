# Implement root Target auxiliary resource RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can imported root active CNS and State -1 controllers route
`TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd` through
`RedirectID` while preserving destination target-memory ownership and target
actor resource mutation?

## Answer

Yes for the bounded `ikemen-go` root boundary. The runtime already had typed
target-resource operations and root `RedirectID` resolution; the paired
required traces now prove active CNS and State -1 setup ownership separately.

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

## Evidence

- Active artifact: `synthetic-imported-target-auxiliary-redirect`, checksum
  `e93109dc`.
- State -1 artifact:
  `synthetic-imported-target-auxiliary-state-entry-redirect`, checksum
  `0d2fba4f`.
- Both artifacts prove the destination root supplies target memory, preserve
  caller-authored `ID` and values, and commit red-life, guard-point, and
  dizzy-point mutations to the selected target actor.
- `dizzypoints = 0` is explicit in the damage-bearing fixture so the evidence
  isolates `TargetDizzyPointsAdd` from the separate omitted-HitDef default.
- Affected suite: `718/718`.
- `pnpm run qa:trace`: `633/633`, `599` required, `34` optional, `0` skipped.
- `pnpm run typecheck`, `pnpm run build`, `pnpm run check:boundaries`, both
  syntax checks, and `git diff --check`: passed. Build retains the known
  large-chunk warning.

## Commits

- `f48093b6 feat(runtime): route helper target auxiliary resources` - typed
  controller/runtime seam used by the root and helper routes.
- `282cfb11 test(runtime): cover root target auxiliary RedirectID` - paired
  active and State -1 required artifacts, tests, and QA registration.

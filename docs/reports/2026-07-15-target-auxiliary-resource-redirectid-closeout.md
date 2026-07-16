# Root Target auxiliary resource RedirectID closeout

Date: 2026-07-15

## Task state

Completed for the bounded root active-CNS and State -1 setup boundary.

## Artifact verdict

Pass. Imported root controllers can resolve `RedirectID` to the destination
root, select that destination's remembered target, and commit
`TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd` to the
selected target actor.

## Delivered

- Registered paired required traces for active CNS and State -1 setup.
- Added controller and operation telemetry requirements for all three target
  auxiliary-resource controllers.
- Added target-link, actor-frame, and final-resource assertions for both
  phases.
- Kept `TargetRedLifeAdd absolute = 1` in the fixture to isolate ownership
  from defense scaling.
- Kept `dizzypoints = 0` on the damage-bearing HitDef so the target-resource
  evidence does not mix with the separate omitted-HitDef default route.

## Verification state

- Focused artifact tests: `2/2`.
- Affected runtime/compiler suite: `718/718`.
- `pnpm run qa:trace`: `633/633`, `599` required, `34` optional, `0` skipped.
- New required checksums: `e93109dc` and `0d2fba4f`.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing large-chunk warning remains.
- Boundary check and syntax checks: passed.
- `git diff --check`: passed; CRLF normalization warnings are non-functional.

## Official basis

- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  defines `RedirectID`, target-ID filtering, and the three target resource
  controllers, including `TargetRedLifeAdd absolute` behavior.
- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  supplies the MUGEN target-controller baseline.

## Scope ceiling

This does not claim helper/projectile/team/neutral ownership, helper custom
state destinations, State -1 helper routing, target Set/Score variants,
recursive redirects, exact multi-target ordering, persistence, rollback/
netplay, presentation parity, or complete MUGEN/IKEMEN parity.

## Commits

- `f48093b6 feat(runtime): route helper target auxiliary resources`
- `282cfb11 test(runtime): cover root target auxiliary RedirectID`

## Next move

Select the next source-backed ownership boundary before changing the helper
custom-state contract.

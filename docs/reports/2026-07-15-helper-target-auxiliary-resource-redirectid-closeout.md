# Helper-to-helper auxiliary Target resource RedirectID closeout

Date: 2026-07-15

## Task state

Completed for the bounded helper destination auxiliary-resource slice.

## Artifact verdict

Win against the accepted target: a live helper can redirect
`TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd` to
another live helper `PlayerID`, select that helper's remembered target, and
commit the resource mutations to the selected target actor.

## Delivered

- Added typed compiler operations for the three target resource controllers,
  including `ID`, `value`, and `absolute` where applicable.
- Routed the controllers through the existing target/resource worlds.
- Added helper destination resolution and wrapper writeback for redirected
  target-resource execution.
- Preserved root destination routing and invalid redirect fail-closed paths.
- Kept helper `TargetState` custom-state ownership separate and blocked.
- Added direct compiler/runtime coverage and a required imported trace with
  helper lifecycle, target links, auxiliary resource observations, stores, and
  payload evidence.

## Verification state

Verified for the declared boundary.

Evidence:

- `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/TargetSystem.test.ts src/tests/StateProgramExecutor.test.ts src/tests/HelperSystem.test.ts src/tests/RuntimeTraceGatePresets.test.ts --testTimeout=10000`: `716/716`.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed; Vite reports the existing large-chunk warning.
- `pnpm run check:boundaries`: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `node --check scripts/check_boundaries.cjs`: passed.
- `pnpm run qa:trace`: `631/631`, `597` required, `34` optional, `0`
  skipped.
- Required artifact checksum: `d56173b3`.
- `git diff --check`: passed; existing CRLF normalization warnings remain
  outside runtime behavior.

## Audit

The required trace proves `p1-helper-0` resolves `RedirectID = 59` to
`p2-helper-0`, whose target memory contains `p1` target `77`. The redirected
controllers select target ID `8893` on `p2` and mutate p1's red life, guard
points, and dizzy points. The trace observes p1 red life at least `963`, guard
points at most `980`, and dizzy points at most `970`; both root actors finish
at life `963`.

`TargetRedLifeAdd` follows the existing resource-world clamp, so the observed
red life cannot exceed the target's current-life ceiling. The direct unit
coverage also proves controller values are taken from typed operations and
resource state is mutated on the selected target actor.

## Commits

- `f48093b6 feat(runtime): route helper target auxiliary resources`
- `70823693 test(runtime): cover helper target auxiliary resource RedirectID`

## Official basis

- [IKEMEN RedirectID and target resource controllers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)

## Scope ceiling

No claim is made for helper custom-state destinations, helper State -1,
`TargetScoreAdd`, target Set variants, projectile/team/neutral ownership,
recursive redirects, exact multi-target ordering, persistence, rollback/netplay,
presentation score, or full MUGEN/IKEMEN parity.

## Next frontier

Choose one independent source-backed ownership boundary, keeping helper
custom-state entry separate from target-resource mutation.

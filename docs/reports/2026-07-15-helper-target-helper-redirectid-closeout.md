# Helper-to-helper Target RedirectID closeout

Date: 2026-07-15

## Task state

Completed for the bounded helper-to-helper target-memory ownership slice.

## Artifact verdict

Win against the accepted target: a live helper can redirect the bounded
`Target*` mutation family to another live helper `PlayerID`, use the
destination helper's remembered targets, and commit helper-owned state and
target memory back to live actors.

## Delivered

- Added live helper identity resolution to helper `RedirectID` dispatch.
- Added writeback for destination helper runtime values, targets, and bindings.
- Preserved root destination behavior and root ownership telemetry.
- Kept helper `TargetState` and `BindToTarget` redirects fail closed.
- Added a direct unit test for helper destination state commit.
- Added a required imported helper-to-helper trace covering target links,
  target mutations, lifecycle, stores, payloads, and final resources.

## Verification state

Verified for the declared boundary.

Evidence:

- `pnpm exec vitest run src/tests/HelperSystem.test.ts src/tests/RuntimeTraceGatePresets.test.ts --testTimeout=10000`: `639/639`.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed; Vite reports the existing large-chunk warning.
- `pnpm run check:boundaries`: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `node --check scripts/check_boundaries.cjs`: passed.
- `pnpm run qa:trace`: `629/629`, `595` required, `34` optional, `0` skipped.
- Required artifact checksum: `caf7af02`.
- `git diff --check`: passed before the feature commits; existing CRLF
  normalization warnings remain outside runtime behavior.

## Audit

The required trace proves `p1-helper-0` resolves `RedirectID = 59` to
`p2-helper-0`, then applies the destination helper's target-memory operations
to target `77` owned by `p1`. It also proves the separate helper target link
`p1-helper-0 -> p2` with target `8891`, helper lifecycle/store/payload evidence,
root-attributed telemetry, and final `p1`/`p2` resource values.

The direct unit test proves a redirected helper destination can mutate a helper
target and persist the target power change after the temporary actor wrapper is
discarded. The implementation explicitly rejects helper destinations for
`TargetState` and `BindToTarget` until their ownership contracts are modeled.

## Commits

- `3b586805 feat(runtime): route helper targets through helper RedirectID owners`
- `5a4aa3fc test(runtime): cover helper-to-helper RedirectID ownership`

## Official basis

- [Elecbyte helper/player IDs and PlayerIDExist](https://www.elecbyte.com/mugendocs/trigger.html)
- [Elecbyte target controllers](https://www.elecbyte.com/mugendocs/sctrls.html)
- [IKEMEN RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)

## Scope ceiling

No claim is made for helper `State -1`, helper custom-state destinations,
helper `BindToTarget` destinations, projectile/team/neutral ownership,
recursive redirects, exact multi-target ordering, persistence, rollback/netplay,
presentation score, or full MUGEN/IKEMEN parity.

## Next frontier

Source-backed selection of one independent helper ownership boundary, with
auxiliary target resources and helper destination binding kept as separate
tickets.

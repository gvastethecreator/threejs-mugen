# Helper TargetState RedirectID closeout

Date: 2026-07-15

## Task state

Completed for the bounded helper `TargetState` ownership slice.

## Artifact verdict

Win against the accepted target: a helper can redirect `TargetState` to a live
root `PlayerID`, use that root's target memory, enter the selected actor under
the destination custom-state owner, and return through `SelfState`.

## Delivered

- Added explicit `enterRedirected` ownership path for helper target-state
  entry.
- Propagated redirected state entry through active helper, post-fighter,
  interaction, and hit-pause lifecycle routes.
- Preserved normal helper owner validation and fail-closed invalid redirects.
- Added an imported synthetic trace with separate helper-local and destination
  root target links.
- Added direct redirected-entry and invalid-redirect unit coverage.

## Verification state

Verified for the declared boundary.

Evidence:

- `pnpm exec vitest run src/tests/RuntimeHelperTargetStateSystem.test.ts src/tests/RuntimeMatchHelperTargetStateSystem.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTraceGatePresets.test.ts`: `882/882`.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed; Vite reports the existing large-chunk warning.
- `pnpm run check:boundaries`: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `pnpm run qa:trace`: `628/628`, `594` required, `34` optional, `0` skipped.
- Required artifact checksum: `d995fa81`.
- `git diff --check`: passed; existing CRLF normalization warnings remain
  outside runtime behavior.

## Audit

The trace proves `p1-helper-0 -> p2` target `8883` and redirected root
`p2 -> p1` target `77` remain distinct. It also proves `p1` executes custom
states `888` and `889` with `customOwnerId = p2`, then returns to its own
neutral state. The direct test proves a helper whose owner is `p1` can enter
through destination owner `p2`; the invalid test proves `RedirectID = 999`
does not enter state or mutate target data.

## Commits

- `fd7336f7 feat(runtime): route helper TargetState through RedirectID owners`
- `121c0fee test(runtime): cover helper TargetState RedirectID ownership`

## Official basis

- [Elecbyte TargetState and SelfState reference](https://www.elecbyte.com/mugendocs/sctrls.html)
- [IKEMEN RedirectID reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)

## Scope ceiling

No claim is made for helper State -1/global-state controllers, helper or
projectile destinations, team/neutral ownership, recursive redirects, exact
multi-target ordering, persistence, rollback/netplay, presentation score, or
full MUGEN/IKEMEN parity.

## Next frontier

Source-backed selection of the next independent helper RedirectID ownership
boundary.

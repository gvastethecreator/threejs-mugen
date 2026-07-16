# Helper Redirected Target Dispatch Lease/v1 Closeout

Date: 2026-07-16
Wayfinder ticket: 202
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md` (still Proposed;
incremental migration only)

## Task state

Completed for existing helper-to-root and helper-to-helper `Target*`/
`BindToTarget` RedirectID dispatch paths.

## Delivered

- Reused `RuntimeRedirectedTargetDispatchWorld` for helper phase leases.
- Preserved helper caller identity, RedirectID expression/value, exact
  destination, state-owner metadata, target store, and frozen candidate
  projection in the lease.
- Revalidated the live destination immediately before synchronous dispatch.
- Moved helper wrapper commit callbacks inside successful lease execution, so
  stale or aborted leases cannot write back helper state.
- Preserved existing operation semantics, telemetry, snapshots, and the
  helper-destination `TargetState` fail-closed rule.

## Verification

- Focused batch:
  `pnpm exec vitest run src/tests/RuntimeRedirectedTargetDispatchSystem.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeCompatibilityTelemetrySystem.test.ts --testTimeout=30000`
  -> `4` files, `274/274` tests passed.
- TypeScript 7: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace: deferred to a later
  multi-slice checkpoint, per the current batch strategy.

## Claim boundary

Allowed: helper-to-root and helper-to-helper RedirectID target/binding
dispatches use one identity/freshness/store lease without changing concrete
target semantics.

Still open: helper resources, projectile/team destinations, recursive
redirects, exact multi-target ordering, `TargetScoreAdd`, persistence,
rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Quality audit

The source/diff audit found one important safety property: helper actors are
snapshot wrappers, so freshness returns the original wrapper only while the
same live helper instance remains registered. A helper replacement with the
same serial ID cannot reuse the lease. The focused integration routes prove
that valid helper wrapper commits still happen; the generic stale lease gate
proves the dispatcher is skipped after identity changes.

No score movement. No browser gate was required for this runtime-only slice.

## Commits

- `23ce9c34 docs(wayfinder): select helper redirected dispatch lease`
- `3093ed8f docs(wayfinder): update helper lease map`
- `cf3546f4 feat(runtime): lease helper redirected dispatch`

## Next frontier

Characterize and select the next independent resource or actor-family
RedirectID boundary before widening the lease migration further.

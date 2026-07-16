# Root Redirected Target Dispatch Lease/v1 Closeout

Date: 2026-07-16
Wayfinder ticket: 201
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md` (still Proposed;
this is the first incremental adapter)

## Task state

Completed for root active CNS and root State -1 target/binding dispatch.

## Delivered

- Added `RuntimeRedirectedTargetDispatchWorld` with a short-lived lease for
  destination identity, RedirectID expression/value, state owner, target
  store, destination revision label, and frozen deduplicated candidates.
- Added exact object-identity/liveness revalidation immediately before the
  synchronous dispatcher executes.
- Added explicit committed/aborted lease status and fail-closed stale/invalid
  behavior without introducing async or rollback semantics.
- Migrated root active CNS and root State -1 `Target*`/`BindToTarget` adapters.
- Kept concrete target semantics and ticket 200 selection/mutation telemetry
  in their existing owners.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRedirectedTargetDispatchSystem.test.ts src/tests/TargetSystem.test.ts src/tests/RuntimeCompatibilityTelemetrySystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  -> `4` files, `268/268` tests passed.
- `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace: deferred to a later
  multi-slice checkpoint, consistent with the current batch strategy.

## Claim boundary

Allowed: root active and root State -1 redirected target/binding dispatches
share one identity/freshness/candidate/store lease while preserving existing
runtime behavior and telemetry.

Still open: helper-to-root and helper-to-helper lease migration, resource
controllers, projectile/team destinations, helper destination `TargetState`,
recursive redirects, exact multi-target ordering, `TargetScoreAdd`,
persistence, rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Quality audit

The lease tests prove that a stale destination and an explicitly aborted lease
do not execute the target dispatcher. Candidate projection removes the
destination actor and deduplicates actor identity before execution. Existing
root active and State -1 route gates remain green. Independent review was not
run; source/diff audit plus focused failure-path tests are recorded.

## Commits

- `f0ac78cc docs(wayfinder): select root redirected dispatch lease`
- `d4afe782 feat(runtime): add root redirected target leases`

## Next frontier

Migrate helper-to-root and helper-to-helper RedirectID through this lease,
preserving helper destination identity and the existing fail-closed
helper-destination `TargetState` rule.

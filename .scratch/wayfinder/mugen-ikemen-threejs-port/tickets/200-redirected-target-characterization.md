# Characterize Redirected Target Dispatch

Type: task
Status: resolved
Blocked by: None

## Question

What must be recorded before accepting ADR 0006's redirected-target dispatch
lease or widening `TargetScoreAdd`?

## Scope

Instrument the existing target dispatcher and compatibility telemetry for four
successful routes:

- root active CNS -> root destination;
- root State -1 setup -> root destination;
- helper caller -> root destination;
- helper caller -> helper destination.

Record caller, destination, state owner, requested target id, selected targets,
operation class, and concrete mutation actor ids. Keep helper-destination
`TargetState` fail-closed.

## Evidence required

- dispatcher selection/mutation projection tests;
- compatibility session identity tests for the four routes;
- existing target/helper focused suites;
- TypeScript 7 and later batch QA;
- closeout report with explicit claim boundary.

## Resolution

The characterization boundary is implemented before the proposed
`RuntimeRedirectedTargetDispatch` lease. The dispatcher now projects the
destination identity, operation class, requested target id, selected target
ids, matched count, execution result, and concrete mutation actor ids from
the pre-dispatch target memory and post-dispatch state. Compatibility
telemetry carries the observation on the imported caller root.

The four successful routes are covered:

- root active CNS -> root destination;
- root State -1 setup -> root destination;
- helper caller -> root destination;
- helper caller -> helper destination.

Helper-destination `TargetState` remains fail-closed. `TargetScoreAdd` was not
widened.

## Evidence

- `src/tests/TargetSystem.test.ts`: dispatch selection/mutation projection
  rejects unselected candidates.
- `src/tests/PlayableMatchRuntime.test.ts`: all four route identities and the
  helper-to-helper mutation boundary are asserted against live runtime
  snapshots.
- Focused batch: `265/265` tests passed across TargetSystem,
  RuntimeCompatibilityTelemetrySystem, and PlayableMatchRuntime.
- TypeScript 7 check: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.

## Commits

- `58ec4370 feat(runtime): characterize redirected target dispatch`
- `d32c9720 test(runtime): prove redirected target dispatch routes`

## Next

Review `docs/adr/0006-runtime-redirected-target-dispatch.md` and select the
first lease migration adapter. Keep operation-specific mutation sets,
recursive redirects, exact multi-target ordering, projectiles/teams,
persistence, rollback/netplay, presentation, and full parity outside this
characterization claim until separately evidenced.

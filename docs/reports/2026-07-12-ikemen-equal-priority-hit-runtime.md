# IKEMEN Equal-priority Hit Runtime

Date: 2026-07-12
Wayfinder: 117
Verdict: implemented and verified

## Delivered

- Correct default equal-priority Hit/Hit frame-local graph transaction.
- Exact move identity and unconditional batch clearing prevent stale reuse.
- Every valid pair direction is prepared before mutation, including A/B/C graphs.
- Reciprocal damage, targets, contact memory, presentation, logs, and get-hit transitions.
- Every original move interrupted after all prepared contacts.
- Trade telemetry emitted only after bilateral preflight succeeds.
- Required active-root P3/P4 trace registered.

## Focused Evidence

- Direct and combat-resolution priority suite: 18 tests passed.
- Combined priority/trace selection: 21 tests passed.
- TypeScript 7 typecheck passed.
- P3/P4 trace: admission both ways; life 971/959; targets 118/119; two hit reasons.
- Full suite: 179 files / 1826 tests passed.
- Trace gate: 546/546 artifacts passed (515 required, 31 optional).
- Production build: 261 modules; JS 1,622.24 kB, gzip 407.39 kB.
- Architecture boundaries and `git diff --check` passed.

## Review Repair

Independent runtime review found stale pair state and first-pair-wins behavior for three actors. Both were repaired with exact-move candidates, frame-local draining, global graph preparation, and focused stale/A-B-C tests. It also found sequential secondary mutation inside the batch; that remains explicitly bounded below.

## Blocked

Miss/Dodge parsing and matrix, equal guard/HitOverride/ReversalDef interaction, immutable batching of secondary state/sprite-priority mutation, throws/projectiles/helpers, team KO/resources, rollback, and full parity.

## Next

Wayfinder 118: typed priority classes and complete equal-priority matrix.

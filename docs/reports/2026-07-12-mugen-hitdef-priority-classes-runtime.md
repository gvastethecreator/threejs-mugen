# MUGEN HitDef Priority Classes Runtime

Date: 2026-07-12
Wayfinder: 118
Verdict: implemented and verified

## Delivered

- Typed `Hit | Miss | Dodge` from CNS compile through runtime move authoring.
- Omitted priority resets per HitDef to `4, Hit`.
- All nine directional equal-priority combinations covered.
- Hit/Hit bilateral graph batching retained.
- Hit/Miss unilateral frame result.
- Dodge and non-Hit no-contact ties leave HitDefs enabled.
- Priority telemetry classified as runtime evidence.
- Required Hit/Miss and Hit/Dodge Tag traces registered.
- Required reverse Miss/Hit and Hit/Dodge Pair traces registered.

## Focused Evidence

- Typecheck passed.
- Parser, dispatch, direct matrix, batch/stale, bridge, and representative trace tests passed.
- Hit/Miss trace: P3 1000, P4 959, one P3->P4 target.
- Hit/Dodge trace: two frames admitted both ways, zero hit reasons, zero P3/P4 targets, both life 1000.
- Pair Miss/Hit: later P2 wins despite P1-first legacy order; Pair Hit/Dodge remains no-contact for two frames.
- Full suite: 179 files / 1841 tests passed.
- Trace gate: 550/550 artifacts passed (519 required, 31 optional).
- TypeScript 7 typecheck passed.
- Production build: 261 modules; JS 1,624.21 kB, gzip 407.97 kB.
- Architecture boundaries and `git diff --check` passed.

## Blocked

Exact ReversalDef/HitOverride/guard interaction, throw randomization/unhittabletime, projectile priority classes, fully immutable secondary batch mutation, team KO/resources, rollback, and full parity.

## Next

Wayfinder 119: ReversalDef-first ordering against typed HitDef classes.

## Review Repair

Independent review found Pair skipped the outcome batch, omitted priorities inherited prior values, and Hit/Miss victory telemetry preceded contact validation. All three were repaired and covered by Pair reverse/no-hit traces, omitted-priority unit proof, and rejected-winner telemetry proof.

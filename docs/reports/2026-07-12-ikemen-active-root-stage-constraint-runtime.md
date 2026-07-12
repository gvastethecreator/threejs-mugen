# IKEMEN Active-root Stage Constraint Runtime Report

Date: 2026-07-12
Wayfinder: 101

## Outcome

- `RuntimeRootMotionAdvanceWorld` now finishes already-live explicit-Tag active-root motion with actor-local constraints after animation.
- `RuntimeActorConstraintWorld.clampToStage` applies existing sandbox stage-X semantics. One-frame `ScreenBound bound = 0` remains the explicit opt-out.
- `RuntimeRootPhaseCapabilities/v2` adds `constraints`; playable and active-motion roots publish true, bounded standby/unavailable roots false.
- Tick diagnostics add actor-scoped `fighter:constraints`. Architecture comparison proves animation-before-constraints per root and rejects disjoint-root masking.
- P1/P2 post-fighter ownership, plural push, collision rendering, effects, targets, guard distance, combat, round, HUD/audio, and resources remain unchanged.

## Required Trace

`synthetic-imported-ikemen-active-root-constraint`:

- checksum `870f8871`;
- frame checksums `37e1175b`, `63a42885`, `842716e7`;
- P3 transitions from standby through TagIn, runs two motion ticks at velocity `4`, and finishes exactly at stage boundary `x = -154`;
- activation frame has no P3 constraint phase; next active frame records exactly P3;
- P3 final target count is zero, both effect stores have `maxTotal: 0`, and hit/guard combat reasons are forbidden.

## Verification

- Focused TDD: root motion, phase capabilities, tick schedule, MatchWorld, PlayableMatchRuntime, and trace preset pass.
- Full suite: 176 files / 1797 tests.
- TypeScript 7 typecheck: passed.
- Production build: passed; known large-chunk warning remains at 1,608.23 kB main JS / 404.07 kB gzip.
- Trace aggregate: 543/543 artifacts, 512 required and 31 optional.
- Boundaries and diff checks: passed.
- Browser smoke: N/A. This slice changes deterministic off-edge motion constraints, not the existing bounded QA presentation scenario or UI.

## Quality Audit

The first aggregate trace exposed a QA catalog defect: dynamic architecture results were compared as static definitions. `qa_traces.cjs` now catalogs only architecture check identity and expected order, while per-artifact status retains actual order/match results. This prevents valid phase-specific variation from becoming a false catalog conflict.

Strongest remaining objection: collision debug and body push still omit P3-P8, so a presented clamped root is not yet geometrically inspectable or interactive. This is intentional. Diagnostic collision, push, and combat require separate ownership contracts; widening any of them implicitly would invalidate the isolation proof.

Independent review was omitted because the available reviewer had already exhausted its quota during the preceding 099 audit. Internal adversarial review covered schema drift, cross-root schedule masking, vacuous in-range traces, ScreenBound opt-out, and hidden effect/target/combat widening.

## Global Status

Wayfinder 101 closes one real I2 runtime gap without score movement. Next: Wayfinder 102 maps a diagnostic-only active-root collision projection that cannot grant push or hit admission.

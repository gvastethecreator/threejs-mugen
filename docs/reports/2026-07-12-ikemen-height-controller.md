# IKEMEN Height controller implementation report

Date: 2026-07-12
Roadmap entry: 453

## Delivered

- Typed static `collision:height` compilation with omitted-bottom defaulting and dynamic expression fallback.
- Root `RedirectID` target resolution with caller-local expression ownership and caller-to-target localcoord scaling.
- One-frame top/bottom height state owned by `RuntimeActorConstraintWorld`.
- Current S/C/A/L size-box Y composition in root PlayerPush admission.
- Active-motion Tag root dispatch for bounded `Width` and `Height` geometry controllers.
- Focused compiler, constraint, dispatch, active-motion, match-runtime, and PlayerPush tests.

## Global port status

- Runtime compatibility: advanced by one bounded IKEMEN controller and one collision-geometry consumer.
- Studio/editor: unchanged in this feature.
- Three.js renderer/presentation: unchanged; no browser gate is required because snapshot and visual surfaces did not change.
- QA and documentation: source note, support registry, architecture ownership, roadmap ledger, focused tests, full gates, and adversarial review are required before commit.

## Remaining debt

Exact hitpause lifetime, helpers and broad redirects, `OverrideClsn` group 3, `P2BodyDist Y`, non-PlayerPush Height consumers, persistent-controller behavior, renderer/debug visualization, score movement, and full MUGEN/IKEMEN parity remain open.

## Verification

- Focused: 7 files / 300 tests.
- Full suite: 180 files / 1900 tests.
- TypeScript 7 typecheck, production build, architecture boundaries, and `git diff --check`: passed. Build retains the pre-existing large-chunk advisory.
- Trace gate: 563/563 artifacts, 532 required and 31 optional, with no drift.
- Independent review found and closed an isolated `Height` hook-result defect and corrected source-checkout wording. Its hitpause reset concern was rejected after scheduler inspection: normal/reset advancement does not execute on the hitpause branch, while ignored controllers run without clearing the stored delta.
- Browser smoke: not applicable; no frontend, renderer, Studio, sprite, CSS, snapshot, or presentation surface changed.

# MUGEN-lite Guarded Contact Report

Date: 2026-07-12
Roadmap entry: 466

## Delivered

- Exact Match-select route: imported MUGEN-lite P1 versus demo Nova Boxer AI P2.
- Native AI state `200` attack window followed by physical held-back ArrowLeft input.
- Atomic imported guard-hit capture at state/action `150/150` with `guarding=true`.
- Exact zero-chip life `1000`, decoded `32x64` frame `150,0`, action-palette crop evidence, and idle return.
- Independent desktop and mobile runs.

## Evidence

- `pnpm qa:smoke`: passed in Playwright/SwiftShader.
- Full regression: `183` test files / `1935` tests, TypeScript 7 typecheck/build, boundaries, diff hygiene, and `565/565` trace artifacts (`534` required) passed.
- Independent adversarial re-review: no remaining P1/P2 findings.
- Guarded contact requires imported P1, demo P2, matching manifest ids, state/action `150/150`, `guarding=true`, life `1000`, and at least 50 action-palette pixels.
- Screenshots/canvases: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-guarded[-canvas].png`.
- Latest numeric evidence: `.scratch/qa/qa-smoke/diagnostics.json`.

## Claim Boundary

Proven: this native-AI/imported-fixture matchup routes held-back P1 through a visible zero-damage guard contact and back to idle.

Blocked: nonzero chip formulas, exact guard timing/slide, crouch/air guard, body-push, multi-hit, touch input, production art, and visual parity.

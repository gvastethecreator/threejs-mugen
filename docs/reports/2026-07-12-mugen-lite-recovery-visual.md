# MUGEN-lite Recovery Visual Report

Date: 2026-07-12
Roadmap entry: 465

## Delivered

- Exact Match-select route: imported MUGEN-lite P1 versus demo Nova Boxer AI P2.
- Native AI hit and imported fall progression through `5000 -> 5050 -> 5100`.
- Two real UI one-frame steps without input, then physical `a+s` held before one real UI frame.
- Fresh `x+y` command sample reaches the fixture CNS recovery controller and captures imported `5200`.
- Exact life `1000 -> 945`, action-palette crop evidence, distinct masks, and final idle return on desktop and mobile.

## Evidence

- `pnpm qa:smoke`: passed in Playwright/SwiftShader.
- Every recovery-route state exposes exact state/action, frame index `0`, decoded `32x64` geometry, exact 945 post-hit life, and at least 50 action-palette pixels.
- Four masks for get-hit, fall-motion, fallen, and recovery are mutually distinct per viewport.
- Screenshots/canvases: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-recovery-{get-hit,fall-motion,fallen,recovery}[-canvas].png`.
- Latest numeric evidence: `.scratch/qa/qa-smoke/diagnostics.json`.
- Independent review: no P1/P2.
- Full regression: 183 files / 1935 tests passed.
- TypeScript 7 typecheck/build, architecture boundaries, 565/565 traces (534 required), and diff hygiene passed.

## Claim Boundary

Proven: AI-originated native hit -> imported fall -> real browser keyboard command -> current fixture CNS `5200` recovery -> idle return.

Blocked: Common1 recovery tables/thresholds, body-push, guard, multi-hit, touch input, production art, and visual parity.

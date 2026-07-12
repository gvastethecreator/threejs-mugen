# MUGEN-lite Movement Pose Report

Date: 2026-07-12
Roadmap entry: 463

## Delivered

- ArrowRight -> imported walk state/action `20/20`.
- ArrowDown -> imported crouch state/action `10/10`.
- ArrowUp -> imported jump state/action `40/40`.
- Atomic state capture, action-specific palette crop, distinct spatial mask, and idle return for every route.
- Independent desktop and mobile runs.

## Evidence

- `pnpm qa:smoke`: passed in Playwright/SwiftShader.
- Every pose exposes frame index `0`, decoded `32x64` sprite geometry, and more than ten action-palette pixels; idle, walk, crouch, and jump masks are mutually distinct.
- Every route resumes and returns to state/action `0/0` before the next input.
- Screenshots/canvases: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-{walk,crouch,jump}[-canvas].png`.
- Latest numeric evidence: `.scratch/qa/qa-smoke/diagnostics.json`.
- Independent review found missing cross-pose mask uniqueness. Exact four-mask cardinality fixed the P2; re-review found no remaining P1/P2.
- Full regression: 183 files / 1935 tests passed.
- TypeScript 7 typecheck/build, architecture boundaries, 565/565 traces (534 required), and diff hygiene passed.

## Claim Boundary

Proven: browser keyboard -> movement input -> imported runtime state/action -> distinct Three.js pose -> idle return.

Blocked: backward/diagonal movement, guard/get-hit/fall/recovery visual routes, touch input, multi-frame animation, production art, and visual parity.

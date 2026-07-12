# MUGEN-lite Attack Transition Report

Date: 2026-07-12
Roadmap entry: 462

## Delivered

- Physical keyboard `a` hold through the production input adapter, producing MUGEN command `x`.
- Atomic browser pause when imported P1 reaches state/action `200`, avoiding short-state capture races.
- Action-specific fixture-palette crop masks and spatial checksums for idle and attack.
- Resume plus required return to imported state/action `0`.
- Independent desktop and mobile transition runs.

## Evidence

- `pnpm qa:smoke`: passed in Playwright/SwiftShader.
- Desktop/mobile gates require attack frame `200,0`, at least ten action-palette pixels, and a spatial mask checksum different from idle. Numeric samples vary with camera/tick placement; the latest diagnostics are authoritative.
- Attack screenshots: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-attack.png`.
- Attack canvases: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-attack-canvas.png`.
- Diagnostics: `.scratch/qa/qa-smoke/diagnostics.json`.
- Independent review: no P1/P2.
- Full regression: 183 files / 1935 tests passed.
- TypeScript 7 typecheck/build, architecture boundaries, 565/565 traces (534 required), and diff hygiene passed.

## Claim Boundary

Proven: browser keyboard -> input adapter -> CMD command -> CNS state -> AIR/SFF frame -> distinct Three.js sprite -> idle return.

Blocked: full pose journey, multi-frame animation, attack contact in this visual gate, touch input, production art, and visual parity.

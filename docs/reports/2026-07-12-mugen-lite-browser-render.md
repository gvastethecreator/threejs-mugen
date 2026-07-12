# MUGEN-lite Browser Render Report

Date: 2026-07-12
Roadmap entry: 461

## Delivered

- Browser-side generation of the deterministic legal fixture ZIP from the served TypeScript module.
- Independent desktop/mobile `#zip-input` uploads, production character loading, imported P1 roster selection, and Match transitions.
- Required Three.js P1 presentation for frame `0,0` with decoded sprite `32x64@16,62`.
- Desktop and mobile full-page/canvas screenshots plus persisted ZIP and JSON diagnostics.

## Evidence

- `pnpm qa:smoke`: passed in Playwright/SwiftShader against a Vite server.
- Fixture ZIP: 3,208 bytes at `.scratch/qa/qa-smoke/mugen-lite-journey.zip`.
- Desktop/mobile gates require frame `0,0`, active renderer calls, a colorful nonblank canvas, and at least ten fixture-palette pixels in the camera-projected P1 crop. Numeric samples vary with camera/tick placement; the latest diagnostics are authoritative.
- Screenshots: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}.png`.
- Canvas captures: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-canvas.png`.
- Diagnostics: `.scratch/qa/qa-smoke/diagnostics.json`.
- Independent review found global-canvas false-positive risk and desktop-session reuse. Camera-aware P1 crop assertions plus independent viewport reload/upload fixed both P2 findings.
- Re-review found no remaining P1/P2.
- Full regression: 183 files / 1935 tests passed.
- TypeScript 7 typecheck/build, architecture boundaries, 565/565 traces (534 required), and diff hygiene passed.

## Claim Boundary

Proven: generated legal ZIP -> browser file input -> bounded ZIP ingestion -> production loader -> imported roster -> Three.js idle sprite, desktop and mobile.

Blocked: every pose transition, input-driven animation screenshots, production-host smoke, production art, public/commercial character compatibility, and visual parity.

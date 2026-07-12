# MUGEN-lite Get-hit and Fall Report

Date: 2026-07-12
Roadmap entry: 464

## Delivered

- Real Match-select swap to demo Nova Boxer P1 and imported MUGEN-lite P2, with exact manifest id and actor identity checks.
- Bounded center-distance approach plus keyboard `a` attack.
- Atomic captures for imported get-hit `5000`, airborne fall `5050`, and grounded fall `5100`.
- Required damage from 1000 to 945 life, action-palette crop evidence, unique combat masks, and natural idle return.
- Independent desktop and mobile runs.

## Evidence

- `pnpm qa:smoke`: passed in Playwright/SwiftShader.
- Every combat state exposes matching state/action, frame index `0`, decoded `32x64` geometry, and at least 50 action-palette pixels.
- Get-hit life is 945; all three combat masks are present and mutually distinct; P2 returns naturally to `0/0`.
- Screenshots/canvases: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-{get-hit,fall-motion,fallen}[-canvas].png`.
- Latest numeric evidence: `.scratch/qa/qa-smoke/diagnostics.json`.
- Independent review found weak roster identity, unsupported body-push wording, and non-exact damage evidence. Exact manifest/actor identity, scoped claims, and `1000 -> 945` life assertions closed all P2 findings; re-review found no remaining P1/P2.
- Full regression: 183 files / 1935 tests passed.
- TypeScript 7 typecheck/build, architecture boundaries, 565/565 traces (534 required), and diff hygiene passed.

## Claim Boundary

Proven: roster UI -> native attack -> imported damage/get-hit -> airborne fall -> grounded fall -> natural idle return.

Blocked: body-push semantics, visual recovery `5200` because browser keyboard input routes P1 rather than imported P2, guard visuals, repeated hits, production art, and visual parity.

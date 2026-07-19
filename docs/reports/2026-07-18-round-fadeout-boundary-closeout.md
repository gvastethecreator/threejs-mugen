# Round Fade-out Boundary Closeout

Date: 2026-07-18
Ticket: Wayfinder 282
Implementation commit: `55e4eeca`
QA/Workbench follow-up: `bf49f178`

## Result

Imported fight-screen timing now carries `fadeout.time` and `fadeout.col`.
Source-derived post-round duration honors `max(over.time, fadeout.time)` and
publishes `RuntimeRoundFade/v0` from the existing round snapshot. The Three.js
renderer presents active fade frames as a viewport overlay above the existing
pause/environment layers. Explicit normalized `postKoFrames` and source-less
demo timing remain stable.

## Evidence

- Focused runtime/loader/renderer tests: 4 files, 290 passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- Grouped regression: `pnpm test` passed 233 files / 2472 tests.
- `pnpm build`: passed with Vite 8.0.16 / 315 modules; existing large-chunk advisory remains.
- `pnpm qa:trace`: passed 633/633 artifacts (599 required / 34 optional / 0 failed).
- Repository boundaries, redirect boundary, and CSS budget passed
  (`324085/536051` bytes, `1519/2364` rules, `80/119` repeated groups).
- Browser smoke passed from the real Vite server: 64 capture paths, 0 console
  issues, 0 page errors. Diagnostics: `.scratch/qa/qa-smoke-t282g/diagnostics.json`.
- Visual audit passed for Workbench, local-project conflict, and Debug
  surfaces at desktop/mobile capture points.
- `git diff --check` passed for implementation, docs, and the follow-up.

The follow-up exposed `Recent Projects` and `Runtime Debug` in the desktop
Workbench and made smoke navigation select visible routes only. It does not
change runtime compatibility claims or move the score.

## Claim ceiling

Allowed: bounded imported fade timing/color, terminal extension, snapshot
evidence, and renderer overlay.

Blocked: exact fight-screen animation/sound assets, motif/dialogue/skip
ownership, exact frame-start order, Common1/ZSS release, team/Turns lifecycle,
rollback/netplay, score movement, and full parity.

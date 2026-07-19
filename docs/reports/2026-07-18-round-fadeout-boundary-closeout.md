# Round Fade-out Boundary Closeout

Date: 2026-07-18
Ticket: Wayfinder 282
Implementation commit: `55e4eeca`

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
- `git diff --check`: passed before the implementation commit.

Full suite, production build, full trace, boundary checks, and browser smoke
are intentionally the next grouped checkpoint because this slice changes a
visible renderer path.

## Claim ceiling

Allowed: bounded imported fade timing/color, terminal extension, snapshot
evidence, and renderer overlay.

Blocked: exact fight-screen animation/sound assets, motif/dialogue/skip
ownership, exact frame-start order, Common1/ZSS release, team/Turns lifecycle,
rollback/netplay, score movement, and full parity.

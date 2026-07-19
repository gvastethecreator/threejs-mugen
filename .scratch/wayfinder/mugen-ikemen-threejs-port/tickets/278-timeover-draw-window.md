# Ticket 278: Time-over draw window

- Status: resolved bounded
- Date: 2026-07-18
- Scope: keep a time-over round in the shared post-round timeline so phase 4
  and the reserved draw state `175` can be reached before terminal closure
- Depends on: [T277](277-imported-fight-screen-timing.md)
- Research: [`docs/research/2026-07-18-timeover-draw-window.md`](../../../../docs/research/2026-07-18-timeover-draw-window.md)

## Contract

1. A time-over finish initializes the resolved post-round timing instead of
   setting `RuntimeRoundSystem.isOver` immediately.
2. Time-over advances through the same bounded phase-3/phase-4 clock used by
   KO, while its playback rate remains normal and KO slowdown remains absent.
3. `RoundNotOver` can hold the phase-4 time-over clock, and the existing
   `RuntimeRoundWinPose/v0` draw branch can enter state `175` when both active
   roots expose that state.
4. `MatchWorld`, stage journeys, and next-round tests wait for terminal
   `postRound.remaining = 0`; explicit timing overrides and Turns exclusion
   remain unchanged.

## Evidence

- Implementation commit: `a2ce3298`.
- Focused runtime/world/journey proof: `928/928` assertions passed across
  `7` test files.
- TypeScript 7 `pnpm typecheck` passed.
- `git diff --check` passed before commit.
- Wide checkpoint: `233` test files / `2462` tests, TypeScript 7 build,
  boundaries, redirect boundary, and `633/633` trace artifacts passed.
- Trace coverage remained `599` required plus `34` optional; default goldens
  stayed stable, including `mugen-lite-journey-nokoslow = 3013c0b8`.

## Claim ceiling

Allowed: bounded local time-over phase progression, RoundNotOver hold,
optional draw state `175` entry, terminal stop ownership, and caller migration
to the terminal boundary.

Blocked: exact `over.hittime` damage cutoff, `over.forcewintime`, skip-input
rules, fade/motif/dialogue release choreography, Common1/ZSS ownership,
full Turns/team continuation parity, rollback/netplay, and full
MUGEN/IKEMEN parity.

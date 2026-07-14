# Wayfinder Ticket 155: Exact Red-life Round Reset

## Status

Completed as Entry 516 on 2026-07-14.

## Decision

Add an explicit post-round transition that follows the official resource
boundary: restore life, carry bounded power/guard/dizzy values, clear red-life,
preserve match tick and variables, and expose the next numbered round only
after the post-KO window is complete.

## Implementation

- Added `RuntimeRoundResourceResetSystem/v0` with Single/Tag/Turns policy,
  bounded maxima, diagnostics, and KO-winner minimum life.
- Added `RuntimeRoundSystem.startNextRound()` plus `roundNo` and
  `roundsExisted` snapshot fields for rounds after the initial one.
- Added `PlayableMatchRuntime.startNextRound()`, `MatchWorld.nextRound()`,
  toolbar/command-palette controls, and round-number presentation.
- Added required artifact
  `synthetic-imported-red-life-round-reset` with post-KO, round-2,
  zero-red-life, event, and schedule gates.

## Evidence

- Resource/reset and round/trace focal suites: 592/592.
- Playable runtime and trace preset focal suites: 778/778.
- TypeScript 7, build, 598/598 trace artifacts, boundaries, CSS budget, and
  desktop/mobile/Studio Playwright smoke: green.

## Claim Ceiling

Match-over scoring, winpose/intro/state-5900 sequencing, exact `copyVar`
map/remap/dialogue persistence, rollback/netplay, and full compatibility remain
separate tickets.

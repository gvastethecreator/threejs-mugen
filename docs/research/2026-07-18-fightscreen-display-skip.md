# Research: FightScreen display-skip flags

Date: 2026-07-18
Question: What is the smallest source-backed display-skip boundary that can
be implemented after the announcement phase clock?

## Source decision

The pinned Ikemen-GO `FightScreenRound.handleRoundIntro` path consumes
`SkipRoundDisplay` before the Round phase is complete and only permits
`SkipFightDisplay` after that Round phase. The intro-skip path explicitly keeps
both flags when it clears global effects. The local pinned checkout and the
official source at commit `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` agree on
that ownership boundary.

## Implementation boundary

- Compiler and state execution classify both names as global AssertSpecial
  flags.
- `RuntimeGlobalAssertSpecialWorld` aggregates deterministic actor sources.
- `RuntimeMatchRoundWorld` forwards the aggregate to
  `RuntimeRoundAnnouncementWorld`.
- The announcement snapshot records skipped tracks and suppresses their sound
  edges; the timer remains independent.
- The existing HUD renders no fallback text for skipped display states.

## Claim ceiling

The slice is presentation-clock evidence, not asset or audio parity. Exact
screenpack `AnimTextSnd` selection, animation completion, dialogue precedence,
Common1/ZSS, motif/localcoord, teams/Turns, rollback/netplay, and full parity
remain open.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

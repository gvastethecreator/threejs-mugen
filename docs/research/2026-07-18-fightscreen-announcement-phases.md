# Research: FightScreen announcement phase ownership

Date: 2026-07-18
Question: What bounded runtime state can represent FightScreen Round/Fight
announcements before AIR/FNT asset completion is available?

## Decision

Use a reset-owned phase-clock world behind `RuntimeRoundSystem`:

- intro or shutter active -> announcement visibility hidden and clocks paused;
- gate open -> Round track starts and waits for `round.time` before active;
- Round active -> `callfight.time` counts toward Fight activation;
- Fight active -> `fight.time`/`fight.sndtime` remain available as source timing;
- completion -> stays `asset-owned` until the imported animation end condition is
  implemented.

The world must reset on `reset`, `restartCurrentRound`, and `startNextRound`.
Sound edges are emitted as snapshot candidates only; no audio side effect is
claimed here.

## Source evidence

- `.scratch/external/Ikemen-GO/src/fightscreen.go:3434-3467`: shutter timer
  signals intro skip and returns before announcement handling while active.
- `.scratch/external/Ikemen-GO/src/fightscreen.go:3490-3527`: Round timer and
  `round.sndtime`/`round.time` ownership.
- `.scratch/external/Ikemen-GO/src/fightscreen.go:3591-3632`: Fight delay,
  `fight.sndtime`, `fight.time`, and animation-end completion.
- Official pinned source:
  [Ikemen-GO `fightscreen.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go).

## Claim ceiling

This proves only local phase-clock ownership, reset, shutter/intro gating, and
timing-edge publication. It does not prove exact AIR/FNT animation completion,
display skip flags, audio playback, motif/localcoord transforms, dialogue,
Common1/ZSS, teams/Turns, rollback/netplay, or full MUGEN/IKEMEN parity.

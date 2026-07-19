# Research: FightScreen announcement timing

Date: 2026-07-18
Question: What `[Round]` data must be imported before implementing FightScreen
announcement/display phases in the Three.js runtime?

## Bottom line

The first safe slice is timing transport only. Ikemen-GO's `FightScreenRound`
reads `round.time`, defaults `round.sndtime` to the same value, reads
`fight.time`, defaults `fight.sndtime` to that value, and keeps
`callfight.time` at a hardcoded default of 60 frames. These values belong to
the FightScreen announcement owner, not to the shutter or the round timer.

The runtime should therefore import the five values into a normalized
`RuntimeRoundAnnouncementTiming/v0` contract. It must not claim phase execution,
display suppression, audio, or asset parity until a later consumer proves those
behaviors.

## Evidence

- `.scratch/external/Ikemen-GO/src/fightscreen.go:3084-3108` declares
  `round_time`, `round_sndtime`, `fight_time`, `fight_sndtime`, and
  `callfight_time`.
- `.scratch/external/Ikemen-GO/src/fightscreen.go:3170-3174` sets defaults:
  `round_time=0`, `fight_time=0`, `callfight_time=60`.
- `.scratch/external/Ikemen-GO/src/fightscreen.go:3213-3238` reads the five
  `[Round]` fields and defaults each `*.sndtime` from its corresponding time.
- `.scratch/external/Ikemen-GO/src/fightscreen.go:3434-3467` signals intro skip
  at the shutter edge and returns before announcement handling while shutter is
  active.
- `.scratch/external/Ikemen-GO/src/fightscreen.go:3490-3632` owns round/fight
  phase progression, announcement sounds, and `skiprounddisplay` /
  `skipfightdisplay` handling.
- Official pinned source:
  [Ikemen-GO `fightscreen.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go).
- Official pinned system state:
  [Ikemen-GO `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go).

## Local gap

`MugenFightScreenTiming` currently transports round intro, shutter, fade, and
post-round timing, but has no announcement timing fields. `RoundSnapshot` has
no source-shaped announcement contract; its `message` is a coarse HUD string.
The existing runtime therefore cannot honestly claim imported round/fight
display ownership.

## Decision

T289 adds only typed source transport. T290 owns reset/phase state; T291 owns
visible display/audio consumers. Unsupported assets, exact animation end
conditions, dialogue, motif/localcoord, global flags, teams/Turns,
rollback/netplay, and full MUGEN/IKEMEN parity remain open.

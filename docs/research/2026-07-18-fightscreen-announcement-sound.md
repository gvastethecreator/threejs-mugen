# Research: FightScreen announcement sound routing

Date: 2026-07-18
Question: What source-backed audio boundary follows the announcement phase and
display-skip slices?

## Source decision

The pinned Ikemen-GO FightScreen loader reads the screen package `[Files] snd`
separately from `fightfx.snd`. `FightScreenRound.handleRoundIntro` plays the
Round call sound at `round.sndtime` and the Fight call sound at
`fight.sndtime`. The local pinned checkout and the official source at commit
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` establish this separate ownership.

## Implementation boundary

- `fight.def` `[Files] snd` is loaded as `fightScreenAssets.soundArchive`.
- `round.default.snd` and `fight.snd` are parsed as bounded source references.
- Runtime announcement snapshots expose a sound only on the due frame.
- `MugenAudioSystem` routes those events through the dedicated `fs` prefix and
  deduplicates a repeated snapshot.
- Inline `fight.def` action sections are indexed with the screen asset bundle,
  but rendering stays open for a later slice.

## Claim ceiling

The route does not select `round1`/single/final variants, execute exact source
animation completion, draw screenpack assets, or claim dialogue, motif,
localcoord, pause, teams/Turns, rollback/netplay, or full parity.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

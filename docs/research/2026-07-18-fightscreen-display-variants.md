# Research: FightScreen display variant indexing

Date: 2026-07-18
Question: What source-backed display definitions and sound precedence should
be transported before implementing the Three.js announcement renderer?

## Source decision

The pinned IKEMEN-GO implementation reads `round1.` through `round9.`,
`round.default.`, `round.single.`, `round.final.`, and `fight.` through
`ReadAnimTextSnd`. During the round intro it chooses the single-round sound,
final-round sound, numbered-round sound, or default sound in that order. The
selection depends on the match round mode and is separate from the display
animation's completion.

## Implementation boundary

- Loader indexes bounded animation/sound/text/layout fields into
  `MugenFightScreenAssets.display`.
- Imported fighter definitions retain the bundle alongside timing and decoded
  screen assets.
- Runtime carries per-number, single, and final sound references and receives a
  bounded announcement mode from match score state.
- The default normal mode remains compatible when no display variant exists.

## Open renderer work

The next slice must resolve the selected AIR action against the screen SFF,
project `AnimLayout` offsets/scales/facing into the camera's fight-screen
coordinate space, and model `AnimTextSnd` completion/display-time semantics.
FNT text, palette effects, top/background layers, motif/localcoord, dialogue,
pause persistence, teams/Turns, rollback/netplay, and full parity remain open.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

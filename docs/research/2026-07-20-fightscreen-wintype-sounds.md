# FightScreen winType sounds

Date: 2026-07-20
Ticket: T320
Status: implemented at bounded sound-edge scope

## Official source findings

Ikemen-GO models winner records as `FSBgTextSnd`. Its `step` method checks
`timer == sndtime` and plays the sound on that exact tick. The same update
loop steps win-type records before the main winner display phase opens, so a
sound may be due while the main winner display is still pending. `perfect`
and `clutch` also step beside the base `normal` record.

The local source cache is pinned to
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

`RuntimeRoundSystem` resolves the selected win type against the winning side,
converts its relative `sndtime` to the post-KO clock, and publishes a
one-shot edge in `RuntimeRoundWinnerDisplay/v0`. `MugenAudioSystem` consumes
that edge even during the pending winner phase and can process it beside the
main winner or outcome edge from the same snapshot. Imported FightScreen
definitions now feed p1/p2 sound maps, including `sndtime` with the source
time fallback.

## Evidence

- `RuntimeRoundSystem.test.ts` proves the edge timing and pending phase.
- `MugenAudioSystem.test.ts` proves playback and duplicate suppression.
- `MugenSystemAssetsLoader.test.ts` remains in the focused imported-asset
  gate used with this slice.
- Focused result: 3 files / 44 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

The slice covers one selected win-type sound record. It does not yet compose
the source's special-plus-`normal` records for `perfect` or `clutch`, derive
win types from live combat, or establish direct imported screenpack audio and
device-mix parity. The full port objective and compatibility scores remain
unchanged.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`

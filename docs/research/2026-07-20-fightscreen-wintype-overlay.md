# FightScreen winType overlay

Date: 2026-07-20
Ticket: T319
Status: implemented at bounded overlay scope

## Official source findings

Ikemen-GO stores win-type presentation in `FSBgTextSnd`. Its `step` method
advances the timer and its draw methods use the window
`timer > time && timer <= time + displaytime`. Background and text draw after
the main result path, with the record position added to the fight-screen
offset. The selected record uses the winning team side.

The local source cache is pinned to
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

The renderer now keeps win-type background and FNT text in separate groups.
It resolves the record from `RuntimeRoundWinnerDisplaySelection/v0`, applies
the source timing edges, and exposes diagnostics for active and resolved
content. AI result families keep their result side and winning side as
separate fields, so a p2 perfect overlay can accompany a p1-oriented AI result.

The main winner completion path waits for an open win-type window, which lets a
delayed overlay render after a short main result asset ends.

## Evidence

- `FightScreenAnnouncementRenderer.font.test.ts`: timing edges, p1/p2 asset
  resolution, AI result side versus winning-side overlay, background mesh, and
  bitmap text visibility.
- `RuntimeRoundSystem.test.ts`: explicit winning-side metadata survives the
  runtime winner selection.
- Focused result: 2 files / 33 tests passed.
- TypeScript 7 typecheck passed.

## Claim ceiling

The slice does not play `winType.snd`, derive the win type from live combat,
or claim direct imported screenpack parity. The full port objective and
compatibility score remain unchanged.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`

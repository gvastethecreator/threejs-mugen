# FightScreen result runtime context

Date: 2026-07-20
Ticket: T316
Status: implemented at bounded runtime-selection scope

## Official source findings

Ikemen-GO stores the winner result in four simulation slots and checks the
player-controlled state of both teams before choosing `ai.win`, `ai.lose`, or
the default `win` family. When the result is an AI result, the active display
side moves to the human team. The `win.sndtime` clock remains the result sound
boundary. `winType` selection runs as a separate presentation family after the
result announcement choice.

The local source cache is pinned to
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

`RuntimeRoundSystem` now publishes an optional
`RuntimeRoundWinnerDisplaySelection/v0` with family, side, and variant. The
runtime accepts optional participant metadata and chooses `aiWin` or `aiLose`
only when both sides carry explicit player-controlled values. Result sounds
flow through a parallel timing matrix and are resolved before the existing
one-shot audio edge is emitted.

The renderer consumes that selection to choose the typed asset family. The
Playable runtime sets p1/p2 side order through the match-round boundary; its
current local match still lacks an AI-level source contract, so it keeps the
default winner family unless a caller supplies the context.

## Evidence

- `RuntimeRoundSystem.test.ts`: default, draw, AI win, AI lose, side, variant,
  and selected sound behavior.
- `FightScreenAnnouncementRenderer.font.test.ts`: snapshot selection reaches
  the selected result asset.
- `MugenAudioSystem.test.ts`: winner sound edge remains one-shot.
- `PlayableMatchRuntime.test.ts`: imported timing path remains green.
- Focused result: 5 files / 322 tests passed.
- TypeScript 7 typecheck passed.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

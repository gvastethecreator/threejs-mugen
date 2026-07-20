# FightScreen result variant assets

Date: 2026-07-20
Ticket: T315
Status: implemented at bounded asset-contract scope

## Official source findings

The pinned Ikemen-GO source defines `ResultAnnouncement` with two side slots
for `text`, `top`, and `bg`. `FightScreenRound` stores four slots for each of
`win`, `aiLose`, and `aiWin`. `readFightScreenRound` reads common prefixes plus
`p1.` and `p2.` prefixes and tracks explicit AI slots. The update branch later
chooses a winner slot from `numSimul`, swaps to the loser side for a player
loss against AI, and presents `drawgame` for the draw routes.

The local cache is pinned to `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

The system asset model now exposes `result.win`, `result.aiWin`, and
`result.aiLose`. Each family has four variants with a two-side asset tuple.
The loader reads common and side-prefixed entries. The renderer resolver takes
an explicit family, side, and variant and applies the source-shaped `win3` or
`win4` fallback to the second variant when the requested slot has no asset.

The existing flat `display.win` remains available to keep the T314 path stable.
Runtime result context is still absent, so the current renderer call path keeps
its default winner asset until a later snapshot contract carries the selected
family and side.

## Evidence

- `MugenSystemAssetsLoader.test.ts`: common, side, and AI-family parsing.
- `FightScreenAnnouncementRenderer.font.test.ts`: p1/p2, AI, and variant
  selection.
- Focused result: 2 files / 13 tests passed.
- TypeScript 7 typecheck passed.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`

# FightScreen winType selection

Date: 2026-07-20
Ticket: T318
Status: implemented at bounded selection-contract scope

## Official source findings

The source keeps the result announcement (`win`, `ai.win`, `ai.lose`) apart
from `winType`. The winner team selects p1 or p2 win-type data, and perfect or
clutch state maps to separate source prefixes. AI result text can target the
human side, so one side field cannot serve both decisions.

The local source cache is pinned to
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

Runtime winner selections now accept an optional source win type. The renderer
can resolve that type against the p1 or p2 typed map. The main winner asset
route remains unchanged, which preserves result text and its timing while the
overlay contract is still absent.

## Evidence

- `RuntimeRoundSystem.test.ts`: perfect metadata survives the round finish.
- `FightScreenAnnouncementRenderer.font.test.ts`: p1 perfect and p2 clutch
  assets resolve from the typed map.
- Focused result: 3 files / 35 tests passed.
- TypeScript 7 typecheck passed.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`

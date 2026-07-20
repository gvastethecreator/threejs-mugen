# FightScreen winType assets

Date: 2026-07-20
Ticket: T317
Status: implemented at bounded asset-contract scope

## Official source findings

The source declares ten base `WinType` values and derives perfect and clutch
variants from the base result. `readFSBgTextSnd` reads each p1/p2 entry as a
single background plus FSText and timing record. The winner update then steps
the selected side entry after the main result announcement.

The local source cache is pinned to
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

`MugenFightScreenDisplayDefinitions.winType` now carries partial p1 and p2
maps keyed by the ten source names. The loader reads `p1.n.`, `p1.s.`,
`p1.h.`, `p1.c.`, `p1.t.`, `p1.throw.`, `p1.suicide.`, `p1.teammate.`,
`p1.perfect.`, and `p1.clutch.` plus the p2 counterparts. Each asset keeps
the nested text layout and the source timing and sound fields.

No runtime or renderer selection is claimed in this slice. That boundary will
carry the type only after a result snapshot provides explicit source metadata.

## Evidence

- `MugenSystemAssetsLoader.test.ts`: normal, perfect, clutch, p1/p2,
  background, timing, and sound parsing.
- Focused result: 1 file / 3 tests passed.
- TypeScript 7 typecheck passed.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`

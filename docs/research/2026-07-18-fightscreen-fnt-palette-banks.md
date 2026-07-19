# Research: FightScreen FNT palette banks

Date: 2026-07-18
Question: Which palette-bank rules must the Three.js bitmap-font path preserve
before it can render a non-zero `font` bank honestly?

## Answer

Treat FNT palette banks as logical slots, not as glyph SFF sprite groups.
IKEMEN's `LoadFntSff` reads the SFF palette table through `[group=0,index=i]`
for each font bank, uses a fallback palette when that key is absent, and
`DrawText` clamps an out-of-range palette bank to zero. `BankType = sprite`
changes the lookup: the authored bank selects the glyph SFF group and palette
bank remains zero.

## Findings

- The pinned `font.go` source stores FNT palette banks separately from glyph
  images and applies them only to indexed glyph sprites.
- The pinned `image.go` source represents SFF v2 palette records by group,
  index, color count, link, data offset, and data length; linked records must
  resolve before use.
- The existing browser parser decoded palette bytes for sprite rendering but
  discarded the logical bank mapping. That made non-zero FNT banks unsafe to
  present as exact output.

## Port decision

- Add `SffArchive.paletteBanks` with stable logical `slot` values and raw
  indexed palette bytes.
- Preserve v1's single decoded default palette as slot zero.
- For v2, select group-zero records by logical slot, resolve links, and use the
  first decoded palette as a bounded fallback for missing slots.
- Clone indexed font glyphs with the resolved palette; keep sprite-bank lookup
  and non-indexed glyphs unchanged.
- Report requested and resolved bank in FightScreen diagnostics.

## Uncertainty and next boundary

The browser port still lacks palette-effect composition, truecolor/TrueType
and binary FNT support, text windows, and top/background `AnimLayout` layers.
The full source palette remap lifecycle is not claimed. The next high-value
FightScreen boundary is top/background layout only after the MUGEN-lite browser
fixture grows a direct FNT palette-bank route. Current `pnpm qa:smoke` passes
the supported runtime and Studio journeys, but does not prove that specific
FightScreen FNT asset path.

## Browser evidence

- `pnpm qa:smoke`: `status=passed`, Vite server started, Playwright runtime
  desktop/mobile and Studio screenshots written under `.scratch/qa/qa-smoke/`.
- Visual inspection covered `runtime-desktop.png`, `runtime-mobile.png`, and
  `studio-workbench.png`; captures were nonblank and structurally coherent.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/font.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/image.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/font.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- `.scratch/external/Ikemen-GO/src/image.go`, same pinned revision.

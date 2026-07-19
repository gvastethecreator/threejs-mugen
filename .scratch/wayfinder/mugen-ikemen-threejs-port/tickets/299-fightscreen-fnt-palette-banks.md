# T299: Resolve FightScreen FNT palette banks

- Type: task
- Status: resolved at bounded indexed-palette scope
- Date: 2026-07-18
- Depends on: T297, T298

## Question

How should a bitmap FightScreen font honor its authored bank without silently
rendering every bank with the glyph SFF default palette?

## Answer

Expose ordered logical `paletteBanks` on `SffArchive`. SFF v1 contributes one
default bank from the first decoded PCX palette. SFF v2 resolves each logical
font slot through the source `[group=0,index=slot]` palette mapping, follows
linked records, and falls back to the first decoded palette when a group-zero
slot is absent. `BankType = sprite` keeps selecting SFF groups and does not
apply palette remapping.

`FightScreenFontRenderer` clones indexed glyph records with the selected bank
palette, preserving pixels and source sprites. Unknown palette slots follow
the source fallback contract; diagnostics expose requested/resolved bank and
source (`sff`, `sprite`, or `missing`). TrueType, truecolor glyphs, palette
effects, and binary FNT remain outside this slice.

## Evidence

- `pnpm exec vitest run src/tests/SffParser.test.ts src/tests/FightScreenFontRenderer.test.ts src/tests/FightScreenAnnouncementRenderer.font.test.ts src/tests/MugenSystemAssetsLoader.test.ts`: 4 files / 16 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `git diff --check`: passed; only pre-existing roadmap CRLF warnings remain.
- Parser fixture proves a mixed palette table resolves group-zero slots `0` and
  `1` independently and keeps a deterministic fallback for slot `2`.
- Pure renderer fixture proves bank `1` changes the indexed palette key while
  bank `9` falls back to bank `0`.
- `pnpm qa:smoke`: passed with `status=passed`, started Vite, Playwright
  captures for runtime desktop/mobile and Studio journeys. The smoke fixture
  does not exercise a FightScreen FNT palette-bank asset directly.

## Claim ceiling

Allowed: bounded indexed SFF palette-bank transport and FightScreen glyph
presentation for the current bitmap-font path.

Blocked: palette FX/remap composition, truecolor/TrueType/binary FNT, text
windows and advanced transforms, top/background `AnimLayout`, FNT-specific
browser asset coverage, exact browser visual parity, and full MUGEN/IKEMEN
parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/font.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/image.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

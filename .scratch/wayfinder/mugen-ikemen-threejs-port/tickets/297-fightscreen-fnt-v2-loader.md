# T297: Load FightScreen FNT v2 bitmap fonts

- Type: task
- Status: resolved at asset-contract scope
- Date: 2026-07-18
- Depends on: T296

## Question

Which FightScreen font information must cross the loader boundary before text
can be rendered faithfully from a MUGEN or IKEMEN package?

## Answer

Read numeric `[Files] fontN` and optional `fontN.height` entries from the
resolved `fight.def`. For each font definition, preserve the source path,
format, bank type, size, spacing, offset, height override, underlying glyph
file, decoded SFF archive, and diagnostics in a typed
`MugenFightScreenFont` map. Resolve a font's `File` relative to the font
definition first and retain root/data/font search fallbacks used by IKEMEN.

Bitmap SFF glyph sources are decoded immediately. TrueType and other binary or
unsupported sources remain explicitly indexed with diagnostics so callers can
show a partial compatibility state instead of silently substituting a browser
font.

The FightScreen display parser also accepts the documented optional color
arguments after the three-element font tuple. The tuple remains the source
font/bank/alignment contract; color is retained separately for the renderer.

## Evidence

- `pnpm exec vitest run src/tests/MugenSystemAssetsLoader.test.ts`: 3 tests
  passed.
- `pnpm typecheck`: passed.
- `git diff --check`: passed; existing dirty roadmap files report only their
  CRLF normalization warnings.
- Fixture coverage loads `font1`, `font1.height`, a FNT v2 bitmap definition,
  a relative SFF glyph file, ASCII glyph records, and six-value font color
  metadata.

## Claim ceiling

This closes loading and provenance for the bounded FNT v2 bitmap contract. It
does not claim glyph rendering, palette-bank remapping, TrueType rendering,
binary FNT v1 decoding, text wrapping, top/background layers, or full
FightScreen visual parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/font.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

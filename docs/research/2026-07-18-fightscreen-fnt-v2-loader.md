# Research: FightScreen FNT v2 loader boundary

Date: 2026-07-18
Question: What font data does IKEMEN-GO load from `fight.def`, and which part
can be carried into the Three.js asset contract without overstating parity?

## Source findings

IKEMEN reads `fontN` entries from the FightScreen `[Files]` section and accepts
an optional `fontN.height` override. The FNT v2 definition stores `Type`,
`BankType`, `Size`, `Spacing`, `Offset`, and `File` under `[Def]`. Bitmap fonts
load an SFF glyph archive; glyphs are keyed by SFF group/number, with group 0
used for palette-bank fonts and the selected bank used as the sprite group for
`BankType = sprite`. TrueType fonts follow a separate native font path.

The FightScreen text tuple is `font = fontno, fontbank, alignment` followed by
optional color channels. Alignment `1`, `0`, and `-1` means left, center, and
right respectively.

## Port decision

- Preserve font metadata and source provenance in `MugenFightScreenAssets`.
- Decode referenced SFF glyph archives through the existing `SffParser`.
- Keep unresolved, TrueType, binary FNT, and non-SFF sources observable through
  loader diagnostics.
- Accept the optional color suffix without changing the existing three-value
  font selection tuple.
- Defer palette-bank remapping and glyph mesh construction to a separate
  renderer slice.

## Remaining boundary

The loader does not yet render bitmap glyphs, apply bank-specific palettes,
load TrueType bytes into browser `FontFace`, decode binary FNT v1, or import
FightScreen top/background `AnimLayout` layers.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/font.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

# Research: FightScreen bitmap text presentation

Date: 2026-07-18
Question: Which source layout rules are needed to present FNT bitmap glyphs in
the current Three.js overlay without claiming full font parity?

## Source findings

IKEMEN's bitmap font path resolves a character to a glyph image, uses the
font's `Size[0]` for spaces, applies per-font horizontal spacing, and aligns
the whole string before drawing. `Offset` and the glyph sprite offset are
applied at draw time. `FSText` stores the font number, bank, alignment, and
optional RGBA color values. `AnimTextSnd.Draw` splits text on `\\n`; when an
animation is present it takes precedence over text.

## Port decision

- Keep AIR animation precedence when a valid FightScreen action is available.
- Render bitmap glyphs as pooled transparent planes using existing
  `TextureStore` and `projectFightScreenSprite` coordinate projection.
- Format only the bounded round placeholders `%i` and `%d` at this stage.
- Treat absent glyphs as source-like spaces while exposing their characters in
  renderer diagnostics.
- Reject non-zero palette banks until SFF palette-bank remapping is available.

## Remaining boundary

Palette remapping, TrueType/browser `FontFace`, binary FNT v1, text windows and
advanced layout transforms, palette effects, top/background `AnimLayout`, and
full FightScreen visual parity remain open.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/font.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

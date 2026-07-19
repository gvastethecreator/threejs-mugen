# T298: Render FightScreen FNT bitmap text

- Type: task
- Status: resolved at bounded glyph-presentation scope
- Date: 2026-07-18
- Depends on: T297

## Question

How should a loaded bitmap FNT definition reach the Three.js FightScreen
overlay while preserving the source font tuple and avoiding a silent browser
text substitution?

## Answer

Use the FNT tuple as `font number`, `bank`, and `alignment`. For bitmap fonts,
resolve each text codepoint against SFF group/number records. Palette-bank
fonts use group zero, while `BankType = sprite` selects the bank as the SFF
group. Layout preserves font size for spaces and missing glyphs, authored
spacing, optional `fontN.height`, font offset, escaped/newline line breaks,
left/center/right alignment, and localcoord/scale/facing projection. Round
`%i` and `%d` placeholders are formatted before layout.

The renderer owns a reusable glyph mesh pool and emits diagnostics for the
resolved text, font tuple, line count, width, glyph count, and missing
characters. Non-zero palette banks fail closed until the existing SFF palette
contract can carry font-bank remaps; this avoids presenting the default palette
as exact source output.

## Evidence

- Focused gate: `pnpm exec vitest run src/tests/FightScreenFontRenderer.test.ts src/tests/ThreeMugenRenderer.test.ts src/tests/MugenSystemAssetsLoader.test.ts` passed 3 files / 19 tests.
- `pnpm typecheck`: passed.
- `git diff --check`: passed; only pre-existing dirty roadmap CRLF warnings remain.
- Pure layout coverage verifies placeholder formatting, group-zero palette
  lookup, sprite-bank lookup, missing glyphs, line height, spacing, and center
  alignment.

## Claim ceiling

This proves the bounded bitmap glyph path and its layout contract. It does not
claim palette-bank remapping, TrueType or binary FNT rendering, full text
window clipping, palette effects, top/background layers, or full MUGEN/IKEMEN
FightScreen visual parity. Browser smoke still needs to close before this
visual slice is released as fully verified.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/font.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

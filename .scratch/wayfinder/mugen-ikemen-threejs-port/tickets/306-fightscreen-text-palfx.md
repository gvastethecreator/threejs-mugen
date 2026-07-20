# T306: Carry FightScreen FSText PalFX

- Type: task
- Status: resolved at bounded bitmap-text scope
- Date: 2026-07-20
- Depends on: T305

## Question

How should `FSText.palfx` reach bitmap FightScreen glyphs while preserving the
font color authored by the screen definition?

## Answer

The display asset now carries `textPaletteFx`, loaded from the source
`text.palfx` prefix. The bitmap glyph path resolves it against the
announcement frame tick, applies the shared material adapter, then keeps the
authored RGB font color as the base tint. It reports
`textPaletteFxApplied` or `textPaletteFxExpired` through the existing
announcement diagnostics.

This slice covers bitmap FNT glyph meshes only. TrueType and binary FNT remain
outside the renderer contract, and the source palette shader remains broader
than the local material approximation.

## Evidence

- Focused loader and FightScreen bitmap-text tests cover active and expired
  text effects.
- Grouped closeout: 237 files / 2518 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm qa:trace`: 633/633 artifacts passed, with 599 required and 34
  optional.
- Boundary, redirect boundary, CSS budget, and asset hygiene checks passed.
- `pnpm build`: passed with 323 transformed modules. The known large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with the Runtime and Studio desktop/mobile matrix;
  the captures were reviewed for canvas visibility and layout stability.
- Scoped `git diff --check`: passed.

## Claim ceiling

Allowed: `text.palfx.time`, `add`, `mul`, `color`, and `invertall` on bitmap
FightScreen glyph materials, with authored font RGB preserved and bounded
duration diagnostics.

Blocked: TrueType/binary FNT rendering, exact indexed-palette/shader math,
negative color arithmetic, `sinadd`, `sinmul`, `sincolor`, `sinhue`, `hue`,
`invertblend`, interpolation, effect composition, KO/winner families, direct
imported FightScreen browser asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/image.go

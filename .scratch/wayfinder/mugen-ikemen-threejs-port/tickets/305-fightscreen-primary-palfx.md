# T305: Carry primary AnimTextSnd PalFX

- Type: task
- Status: resolved at bounded primary-AIR scope
- Date: 2026-07-20
- Depends on: T304

## Question

How should the display-level `AnimTextSnd.palfx` reach the primary FightScreen
AIR material while text effects remain a separate contract?

## Answer

The display asset now carries the source `palfx` fields already supported by
the shared material adapter: `time`, `add`, `mul`, `color`, and `invertall`.
The loader reads them from the display prefix. The primary AIR path resolves
the effect against the announcement frame tick, applies it to the primary
mesh, and reports `primaryPaletteFxApplied` or `primaryPaletteFxExpired`.

The layout and primary paths share the same material helper, so the bounded
adaptation stays consistent across the visible FightScreen sprites. Text
PalFX remains in T306 because upstream stores it on `FSText` under a different
prefix and it needs to preserve authored font color.

## Evidence

- Focused loader and FightScreen renderer tests cover the primary effect.
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

Allowed: display-level `palfx.time`, `add`, `mul`, `color`, and `invertall` on
the primary FightScreen AIR material, with bounded duration diagnostics.

Blocked: exact source palette math, negative color arithmetic, text PalFX,
`sinadd`, `sinmul`, `sincolor`, `sinhue`, `hue`, `invertblend`, interpolation,
effect composition, KO/winner families, direct imported FightScreen browser
asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/image.go

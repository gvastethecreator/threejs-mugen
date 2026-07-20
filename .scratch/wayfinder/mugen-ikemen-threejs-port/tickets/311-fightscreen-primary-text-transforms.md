# T311: Share FightScreen transforms with primary AIR and FSText

- Type: task
- Status: resolved at shared transform and clipping scope
- Date: 2026-07-20
- Depends on: T310

## Question

How should the renderer preserve the source `AnimTextSnd` ownership where the
primary AIR and fallback FSText both read the same `Layout`?

## Answer

The asset contract now exposes one typed `MugenFightScreenLayoutTransform` for
the display-level layout. The loader reads the primary prefix fields and keeps
an optional nested `textLayout` extension for definitions that author a
separate text prefix. The renderer uses the primary layout for FSText when the
extension is absent, matching the pinned IKEMEN `AnimTextSnd.Read` and
`AnimTextSnd.Draw` flow.

Primary AIR and bitmap glyph meshes now share the existing transformed-quad,
window clipping, UV interpolation, perspective, shear, and presentation-order
path. Each path reports its own transform diagnostics. `perspective2` remains
an explicit cull.

## Evidence

- Focused loader and FightScreen renderer tests: 2 files / 11 tests passed.
- Full suite: 237 files / 2521 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains; the main JavaScript bundle is about 2.05 MB before gzip.
- `pnpm qa:smoke`: passed for the Runtime and Studio desktop/mobile matrix.
- Reviewed new Runtime desktop/mobile and Studio authoring/debug captures.
  Main canvases stayed visible without critical overlap. Runtime and Studio
  authoring reported zero browser errors and warnings. Studio debug keeps one
  pre-existing missing stage sound warning.
- `git diff --check`: passed for the feature changes.

## Claim ceiling

Allowed: imported display-level `Layout` transforms reach primary AIR and
bitmap FSText, including rectangular and transformed-window clipping, finite
perspective, source-signed xangle/xshear, layer ordering, and applied/culled
diagnostics.

Blocked: exact source frustum and scissor raster behavior, `perspective2`,
source aspect and anchor correction, tile/parallax, palette math parity,
TrueType/binary FNT, KO/winner families, direct imported screenpack browser
proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go` and
  `.scratch/external/Ikemen-GO/src/fightscreen.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

# T310: Clip transformed FightScreen layout windows

- Type: task
- Status: resolved at bounded convex-polygon scope
- Date: 2026-07-20
- Depends on: T309

## Question

How can top/background `window` entries keep their authored angle, shear, and
bounded perspective while preserving the source rectangular clip boundary?

## Answer

The renderer now builds a transformed four-corner quad in screen space,
clips it against the normalized FightScreen window with Sutherland-Hodgman
edge clipping, interpolates UV coordinates at each intersection, and writes a
triangle-fan `BufferGeometry` into the pooled layer mesh. The pool restores a
plain plane when a later frame no longer needs polygon geometry.

Axis-aligned entries keep the existing rectangle plus UV-remap path. Layouts
with `perspective2` remain culled before clipping because that projection is
still unsupported.

## Evidence

- Focused loader and FightScreen renderer tests: 2 files / 10 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with the Runtime/Studio desktop and mobile matrix.
- Reviewed Runtime desktop/mobile plus Studio authoring/debug captures. Main
  canvases stayed visible; Runtime and Studio authoring reported zero browser
  errors and warnings. Studio debug retained one pre-existing missing stage
  sound warning.
- Scoped `git diff --check`: passed for the feature changes.

## Claim ceiling

Allowed: finite convex top/background quads with authored angle, xangle,
yangle, source-signed xshear, or bounded perspective clipped by a rectangular
window with interpolated UVs and applied/culled diagnostics.

Blocked: exact source scissor raster behavior, `perspective2`, tile/parallax,
source aspect and anchor correction, primary/text windows, KO/winner families,
direct imported FightScreen browser asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/render.go

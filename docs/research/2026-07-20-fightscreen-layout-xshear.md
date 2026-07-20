# Research: FightScreen layout xshear

Date: 2026-07-20
Question: Which part of `AnimLayout.xshear` can the current top/background
renderer carry with a clear boundary?

## Findings

- Pinned `common.go` reads `xshear` as part of `Layout` and sends
  `-l.xshear` to the animation draw path.
- The source also applies an x-offset correction based on the sprite's source
  Y offset, layout scale, and the signed shear value.
- The local renderer presents a projected sprite as a pooled Three.js plane.
  Its window path clips an axis-aligned rectangle and remaps UVs before the
  mesh is drawn.

## Port decision

- Add `xShear?: number` to `MugenFightScreenLayoutAsset` and parse source
  `xshear` for `top` and `bgN` entries.
- Apply the negative source value as centered horizontal shear to the plane's
  local vertices, then recompute the geometry bounds.
- Reset all four plane vertices on every render, including the no-shear path.
- Cull and count any layout with shear or angle plus `window` until the clip
  path can handle a transformed polygon.

## Uncertainty and next boundary

This slice leaves the source x-offset correction approximate and does not add
`xangle`, `yangle`, projection, focal length, tile, or transform ownership for
primary AIR or FSText. A later transform slice can extend the model after
polygon clipping and source coordinate correction have an owner.

## Evidence

- Focused loader and FightScreen renderer tests pass: 2 files / 8 tests.
- TypeScript 7 typecheck and production build pass; the build reports the
  known large-chunk warning.
- `pnpm qa:smoke` passes with `status: passed` and the Runtime/Studio matrix.
- Reviewed captures:
  `.scratch/qa/qa-smoke/runtime-desktop.png`,
  `.scratch/qa/qa-smoke/runtime-mobile.png`,
  `.scratch/qa/qa-smoke/studio-project-authoring.png`, and
  `.scratch/qa/qa-smoke/studio-debug.png`.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go` and
  `.scratch/external/Ikemen-GO/src/fightscreen.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

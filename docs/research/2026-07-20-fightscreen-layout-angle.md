# Research: FightScreen layout angle

Date: 2026-07-20
Question: Which part of Ikemen-GO `AnimLayout.angle` can the current
Three.js FightScreen path carry with a clear claim boundary?

## Findings

- Pinned `common.go` reads `angle` as part of `Layout` and passes layout
  rotation into the animation draw path.
- Pinned `fightscreen.go` loads FightScreen round/fight layout entries through
  the shared `AnimLayout` path, so the field applies to top/background entries
  as well as other layout families.
- The local renderer uses projected, axis-aligned mesh placement and already
  supports rectangular window clipping through UV remapping.

## Port decision

- Add optional `angle?: number` to `MugenFightScreenLayoutAsset`.
- Parse the finite authored value from `top` and `bgN` sections.
- Apply degrees as centered `rotation.z` on the projected mesh.
- Cull and count entries that combine angle with window until the renderer
  has a rotated polygon clip path.
- Reset the mesh rotation for entries without angle to avoid stale pooled
  state.

## Uncertainty and next boundary

This slice does not cover `xangle`, `yangle`, shear, projection, focal length,
tile, or PalFX. It also does not move primary `AnimTextSnd`, KO/winner families,
or motif composition into the layout contract. The next source-backed visual
boundary can address PalFX or another single transform while keeping these
items separate.

## Evidence

- Focused loader, renderer, and projection tests pass: 3 files / 21 tests.
- TypeScript 7 typecheck and production build pass; the build reports the
  known large-chunk warning.
- `pnpm qa:smoke` passes with `status: passed`. Its fixture covers live runtime
  and Studio paths but does not contain a direct FightScreen angle/window
  screenpack asset.
- Reviewed captures:
  `.scratch/qa/qa-smoke/runtime-desktop.png`,
  `.scratch/qa/qa-smoke/runtime-mobile.png`,
  `.scratch/qa/qa-smoke/studio-project-authoring.png`, and
  `.scratch/qa/qa-smoke/studio-debug.png`.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go`,
  `.scratch/external/Ikemen-GO/src/fightscreen.go`, and
  `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

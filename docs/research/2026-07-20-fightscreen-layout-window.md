# Research: FightScreen layout window

Date: 2026-07-20
Question: What source-backed `AnimLayout.window` behavior can the current
Three.js FightScreen top/background path implement with direct evidence?

## Findings

- Pinned Ikemen-GO `common.go` stores `Layout.window` as four values. Its
  reader orders the endpoints, converts them to an origin plus width and
  height, and uses the screen rectangle when the field is absent.
- Pinned `common.go` `AnimLayout.Read` carries the window with sprite and
  animation metadata. `fightscreen.go` uses that layout while drawing the
  round and fight screen layers.
- The current browser renderer already owns local-coordinate projection,
  AIR frame timing, SFF texture lookup, mesh reuse, and overlay order. A
  rectangle clip with UV remapping fits that boundary without adding a second
  sprite path.

## Port decision

- Add `window?: [number, number, number, number]` to the FightScreen layout
  asset model.
- Normalize authored endpoints in the loader to
  `[x, y, width, height]`.
- Apply the window only to the current `top` and `bgN` layout collections.
  Convert local coordinates to the projected viewport, intersect the sprite
  bounds, and update UVs for the retained source rectangle.
- Count an overlapping window as applied and a non-overlapping window as
  culled. Keep unresolved sprite or AIR references fail-closed.
- Preserve the existing full-quad path when no window is authored.

## Uncertainty and next boundary

This slice does not prove primary `AnimTextSnd` clipping or the full source
layout transform set. Tile, angle, x/y shear, projection, focal length,
layer-specific PalFX, exact action reset rules, and all KO/winner display
families remain separate work. The next renderer boundary should add one
source-shaped transform or effect at a time and pair it with an asset-backed
FightScreen browser fixture.

## Evidence

- Focused loader, renderer, and projection tests pass: 3 files / 21 tests.
- TypeScript 7 typecheck and production build pass; build reports the known
  large-chunk warning.
- `pnpm qa:smoke` passes with `status: passed`. Its fixture covers the live
  runtime and Studio paths but does not contain a direct FightScreen window
  screenpack asset.
- Reviewed captures:
  `.scratch/qa/qa-smoke/runtime-desktop.png`,
  `.scratch/qa/qa-smoke/runtime-mobile.png`,
  `.scratch/qa/qa-smoke/studio-project-authoring.png`, and
  `.scratch/qa/qa-smoke/studio-debug.png`.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- `.scratch/external/Ikemen-GO/src/fightscreen.go`, same pinned revision.

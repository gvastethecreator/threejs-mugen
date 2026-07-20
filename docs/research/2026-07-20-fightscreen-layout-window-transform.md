# Research: transformed FightScreen layout windows

Date: 2026-07-20

## Question

Which local clipping path can carry a source `window` after layout
transforms?

## Findings

- Ikemen passes a rectangular draw window to the sprite renderer after it
  resolves the layout and its transforms.
- The local path previously clipped an axis-aligned rectangle and remapped
  four UVs. That path could not preserve a rotated, sheared, or perspective
  quad.
- A transformed quad remains convex. Sutherland-Hodgman clipping against the
  four window edges yields a convex polygon with source UVs that can be
  triangulated as a fan.

## Port decision

- Compute transformed vertices in viewport world coordinates.
- Clip against the same normalized window rectangle used by the existing
  axis-aligned path.
- Interpolate `u` and `v` at every edge intersection.
- Replace the pooled layer geometry only for the polygon path and restore a
  standard plane when the entry returns to the axis-aligned path.
- Count a window as applied when the polygon has at least three vertices, and
  count it as culled when the intersection is empty.
- Keep `perspective2` outside this path until its projection branch has an
  owner.

## Uncertainty and next boundary

The clipping shape is source-coordinate compatible at the rectangular-bound
level. Exact raster scissor edge rules, source aspect normalization, anchor
correction, `perspective2`, tile/parallax, and primary/text window ownership
remain open.

## Evidence

- Focused loader and FightScreen renderer tests pass: 2 files / 10 tests.
- TypeScript 7 typecheck passes.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with the Runtime/Studio desktop and mobile matrix.
- Reviewed `.scratch/qa/qa-smoke/runtime-desktop.png`,
  `runtime-mobile.png`, `studio-project-authoring.png`, and `studio-debug.png`.
  Main canvases stayed visible; Studio debug retains one pre-existing missing
  stage sound warning.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/render.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go` and
  `.scratch/external/Ikemen-GO/src/render.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

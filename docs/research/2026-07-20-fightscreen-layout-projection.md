# Research: FightScreen layout projection

Date: 2026-07-20

## Question

Which projection behavior can the current pooled Three.js plane carry with
clear evidence and a bounded claim?

## Findings

- Pinned Ikemen `common.go` sets layout projection to orthographic by default,
  reads `projection` as `orthographic`, `perspective`, or `perspective2`, and
  defaults `focallength` to `2048`.
- Pinned `render.go` sends perspective layouts through a frustum matrix and
  uses a separate branch for `perspective2`.
- The local FightScreen path uses one orthographic camera for the scene and
  pooled `PlaneGeometry` meshes. A local per-vertex transform can show a
  bounded perspective quad without changing stage and actor camera ownership.
- The local window path clips an axis-aligned rectangle and remaps UVs. A
  perspective quad needs polygon clipping, so the transformed window route
  stays closed.

## Port decision

- Add typed projection and focal-length fields to each top/background layout.
- Preserve the current mesh rotation path for undefined and explicit
  orthographic projection.
- For `perspective`, bake the four projected vertices with source X/Y/Z order,
  source-signed shear, facing signs, and `focal / (focal - z)` depth scale.
- Use the source default focal length `2048` when the authored value is absent
  or non-positive.
- Load `perspective2`, count it as culled, and keep it out of the orthographic
  fallback until its source branch has a matching owner.

## Uncertainty and next boundary

This slice proves a finite local perspective deformation, not a pixel-identical
source frustum. Exact screen aspect normalization, source anchor and rotation
center correction, `perspective2`, clipping, tile/parallax, and transform
ownership for primary AIR and FSText remain open.

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

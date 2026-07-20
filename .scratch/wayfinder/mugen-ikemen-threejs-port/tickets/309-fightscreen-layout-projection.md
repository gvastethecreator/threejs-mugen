# T309: Carry FightScreen layout projection

- Type: task
- Status: resolved at bounded perspective scope
- Date: 2026-07-20
- Depends on: T308

## Question

How should `AnimLayout.projection` and `focallength` reach the current
top/background renderer without hiding unsupported `perspective2` behavior?

## Answer

The system-asset model and loader now carry `orthographic`, `perspective`,
and `perspective2` values plus the authored focal length. The renderer keeps
the existing mesh rotation path for orthographic layouts and uses a bounded
per-vertex perspective transform for `perspective`: it applies source X/Y/Z
rotation order, source-signed shear, and a finite focal divisor to the pooled
quad. The default focal length is `2048`, matching the source layout default.

`perspective2` entries are loaded and counted as culled. They do not enter the
orthographic fallback. Any perspective layout with a rectangular `window` is
also culled because the current clip path cannot clip the transformed polygon.

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

Allowed: finite top/background `perspective` quads with source-signed
rotation/shear, positive authored or default focal length, and explicit
applied/culled diagnostics.

Blocked: exact source frustum matrices, `perspective2`, source aspect and
anchor correction, transformed-polygon window clipping, tile/parallax
projection, primary/text transform ownership, KO/winner families, direct
imported FightScreen browser asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/render.go

# Research: FightScreen primary and text transforms

Date: 2026-07-20

## Question

Which layout owns transforms when a FightScreen `AnimTextSnd` falls back from
AIR to FSText?

## Findings

- The pinned IKEMEN `AnimTextSnd.Read` calls `readFSText(pre, ...)` and then
  reads `ats.animLayout` with the same `pre`.
- `readFSText` calls `ReadLayout(pre, ...)`, so FSText and primary AIR share
  `offset`, facing, scale, layer, rotation, projection, focal length, shear,
  and window fields.
- `AnimTextSnd.Draw` chooses AIR when it has drawable frames and returns early;
  FSText draws only when AIR is unavailable.
- The port keeps the shared display `layout` as the default for both paths and
  accepts an explicit nested `textLayout` for authored extensions without
  changing the source-derived fallback.

## Port decision

- Store advanced display transforms in the shared
  `MugenFightScreenLayoutTransform` type.
- Reuse one mesh transform application for primary AIR and every bitmap glyph.
- Apply transformed-window clipping with interpolated UVs and restore pooled
  plane geometry when a later frame returns to the untransformed path.
- Keep primary and text transform diagnostics separate so a clipped or
  unsupported path does not look like a resolved sprite.
- Keep `perspective2` explicitly culled until its source projection branch has
  a Three.js owner.

## Uncertainty and next boundary

The shared ownership is source-backed, while exact render parity remains open:
IKEMEN's frustum math, source aspect and anchor corrections, raster scissor
rules, palette effects, tile/parallax, TrueType/binary FNT, and other
FightScreen families still need separate evidence. Browser smoke uses the
existing synthetic runtime/Studio routes; a direct imported screenpack corpus
is still required for an asset-level claim.

## Evidence

- Focused loader and FightScreen renderer tests pass: 2 files / 11 tests.
- Full suite passes: 237 files / 2521 tests.
- TypeScript 7 typecheck passes.
- `pnpm build` passes with 323 transformed modules; the existing large-chunk
  warning remains.
- `pnpm qa:smoke` passes for Runtime and Studio desktop/mobile routes.
- Capture review passes for Runtime desktop/mobile and Studio authoring/debug;
  Studio debug retains one pre-existing missing stage sound warning.
- `git diff --check` passes for the feature changes.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go` and
  `.scratch/external/Ikemen-GO/src/fightscreen.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

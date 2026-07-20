# Research: FightScreen layout layerno

Date: 2026-07-20
Question: Which source layer values can the existing FightScreen renderer
carry with a clear Three.js order policy?

## Findings

- Pinned `common.go` creates `Layout` with the caller-provided layer number,
  reads an authored `layerno`, and limits values above `2` before drawing.
- Pinned `fightscreen.go` loads round/fight layouts with source defaults and
  passes a requested layer to the FightScreen draw method.
- Pinned `system.go` calls the FightScreen draw path for layers `-1`, `0`,
  `1`, and `2` at distinct points in the frame composition.
- The current browser renderer has explicit presentation phases and stable
  render orders, but its FightScreen renderer is one scene group. A bounded
  phase mapping preserves the intent without claiming exact source draw-call
  interleaving.

## Port decision

- Add `layerNo?: -1 | 0 | 1 | 2` to `MugenFightScreenLayoutAsset`.
- Parse and retain valid authored values for `top` and `bgN` layouts.
- Map `-1` to `stage-background`, `0` to `actor-underlay`, `1` to
  `stage-foreground`, and `2` to `overlay` through the existing presentation
  order adapter.
- Keep omitted values on the existing overlay path, since FightScreen round
  layouts currently default to the top source layer in the imported route.
- Report valid layer applications and malformed direct model values that the
  renderer culls.

## Uncertainty and next boundary

The mapping does not reproduce every upstream draw point. It does not move
primary `AnimTextSnd` content, motif layers, character text, stage elements,
or other FightScreen families into the new contract. The next boundary can
add one transform or effect, with `palfx`, tile, and primary composition kept
as separate work.

## Evidence

- Focused loader, renderer, and projection tests pass: 3 files / 21 tests.
- TypeScript 7 typecheck and production build pass; build reports the known
  large-chunk warning.
- `pnpm qa:smoke` passes with `status: passed`. Its fixture covers live
  runtime and Studio paths but does not contain a direct FightScreen layerno
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

- `.scratch/external/Ikemen-GO/src/common.go`, `.scratch/external/Ikemen-GO/src/fightscreen.go`, and `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

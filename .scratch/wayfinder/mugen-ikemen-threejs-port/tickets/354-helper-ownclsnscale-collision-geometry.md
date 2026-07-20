# T354 Helper ownclsnscale collision geometry

Status: resolved at bounded proxy collision-geometry scope

Feature commit: `891d55f5`

## Source evidence

The pinned local Ikemen-GO source selects the collision scale in
`Char.updateClsnScale`:

- `ownclsnscale` selects the Helper's own `size.xscale` and `size.yscale`.
- Otherwise the Helper inherits the animation owner's scale.
- The resulting scale is later passed into `clsnCheckSingle` with the current
  collision boxes.

Official source: [Ikemen-GO `src/char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7692-L7713)
and [the collision check](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10236-L10285)

## Delivered

- Added typed collision-scale options to the Helper proxy resolver.
- Applied the Helper's parsed `scale` when `ownClsnScale` is active.
- Applied the root definition `size.xscale` and `size.yscale` when the flag
  is inactive, with finite `1` fallbacks.
- Applied scale to current proxy `clsn1` and `clsn2` rectangles before the
  existing position, facing, and root-local transform.
- Added focused unit coverage for own-scale and inherited-scale selection plus
  a live imported IKEMEN runtime assertion.

## Verification

- Focused Vitest: `5` files, `350/350` tests passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports no failures and no skipped fixtures.
- `git diff --check` passed for the feature write-set.
- Full Vitest remains deferred in this slice. The latest full baseline from
  T351 is `239/239` files and `2601/2601` tests.
- Browser smoke remains deferred because the change stays inside runtime
  collision resolution and has no new browser-facing surface.

## Claim ceiling

This ticket proves bounded `ownclsnscale` selection for current-frame active
proxy boxes in the explicit IKEMEN runtime path. It does not prove global
`clsnScaleMul`, `animlocalscl`, localcoord, angle or rotation semantics, root
attack-box extension, size/push-box scaling, renderer overlays, projectile
differential parity, external-engine differential parity, compatibility-score
movement, or complete MUGEN/IKEMEN collision parity.

# T363 Helper OverrideClsn group-3 P2BodyDist

Type: task

Status: resolved in `fd9c7969`

Blocked by: None

## Question

Can current Helper `P2BodyDist` use its own and the opponent's group-3
`OverrideClsn` size box with the existing local-coordinate policy, without
claiming Helper `PlayerPush` or size-proxy behavior?

## Source evidence

Ikemen-GO represents a Helper as `Char`. `Char.getAnySizeBox()` reads
`getClsn(3)`, which starts from `sizeToBox()` and applies `clsnOverrides`.
Both `bodyDistX` and `bodyDistY` read that current size box for the caller and
opponent.

- [Ikemen-GO size-box and override selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10030-L10134)
- [Ikemen-GO P2BodyDist size-box use](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8904-L8949)

## Delivered boundary

- `RuntimeSizeBoxSystem` composes current Width/Height deltas and group-3
  overrides once for root and Helper size-box consumers.
- Helper expression contexts now retain caller and opponent local-coordinate
  data, current size boxes, and the existing root Y-size policy for
  `P2BodyDist`.
- Local and verified `RedirectID` group-3 writes reach the primary opponent
  query through existing current override state.
- Helper `PlayerPush`, helper-wide push scheduling, size-proxy geometry,
  renderer behavior, and exact upstream differentials remain outside this
  boundary.

## Verification

- Focused runtime coverage passes `6/6` files and `376/376` tests, including
  local Helper, RedirectID destination, typed effect-context, root expression,
  root push, and imported runtime paths with literal distance values.
- TypeScript `7.0.2`, `pnpm qa:trace` `636/636`, production build with `329`
  modules, both boundary checks, and diff hygiene pass.
- The trace corpus has no dedicated P2BodyDist size artifact, so the claim
  rests on focused runtime coverage rather than a new trace fixture.

## Claim ceiling

This resolves current group-3 Helper size input for `P2BodyDist` only. It does
not establish Helper PlayerPush participation, full size-proxy semantics,
exact actor ordering, renderer output, upstream differentials, or complete
MUGEN/IKEMEN parity.

# T354 research report: Helper ownclsnscale collision geometry

Date: 2026-07-20

## Question

Which scale should the bounded `clsnproxy` collision path use when an IKEMEN
Helper exposes `ownclsnscale`?

## Primary source

The pinned local checkout and the official revision of
[`src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7692-L7713)
show that `updateClsnScale` chooses the Helper's own `size` scale when
`ownclsnscale` is active. Otherwise it uses the animation owner's scale, then
the collision check consumes that result with the current boxes. The related
[`clsnCheckSingle` path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10236-L10285)
passes the scale into overlap testing.

## Implementation

`RuntimeHelperCollisionSystem` now resolves a scale for each active proxy. The
Helper's parsed `scale` wins when `ownClsnScale === true`; otherwise the
runtime passes the root definition's finite `size.xscale` and `size.yscale`.
The selected scale applies to each current-frame `clsn1` or `clsn2` rectangle
before the existing world-to-root transform. Rectangle ordering is normalized
after scaling so negative authored values remain stable in the local contract.

`PlayableMatchRuntime` supplies the inherited animation-owner scale only for
the existing IKEMEN proxy collision bridge. Legacy and unknown profiles keep
the prior path.

## Evidence

- `RuntimeHelperCollisionSystem.test.ts` covers both scale branches and keeps
  the proxy traversal guards in the focused suite.
- `PlayableMatchRuntime.test.ts` verifies a live imported proxy with an own
  scale contributes the scaled box to root hurt-box queries.
- Focused Vitest: `350/350` across `5` files.
- TypeScript 7 typecheck, production build (`327` modules), boundary check,
  and `634/634` trace artifacts passed.
- `diagnostics.json` reports `600` required and `34` optional artifacts,
  `634` passed, `0` failed, and `0` skipped fixtures.
- The latest full baseline remains T351's `239/239` files and `2601/2601`
  tests; the full suite and browser smoke are deferred for this runtime-only
  block.

## Limits and next work

The implementation does not yet model Ikemen's complete `clsnScaleMul`,
`animlocalscl`, localcoord, angle, or renderer paths. Root normal attack-box
extension, projectile differential behavior, upstream/local paired traces, and
full MUGEN/IKEMEN parity remain open.

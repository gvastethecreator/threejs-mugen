# Helper group-3 `OverrideClsn` and `P2BodyDist`

Date: 2026-07-21

## Question

Should the port expose current Helper group-3 collision overrides to
`P2BodyDist` before adding Helper `PlayerPush`?

## Answer

Yes, as a bounded expression-context cut. The pinned Ikemen-GO source treats a
Helper as a `Char`; its `P2BodyDist` methods use `getAnySizeBox()` for both
characters. That accessor reads `getClsn(3)`, whose default is the character
size box and whose output includes current `clsnOverrides`. The current port
already implements the same group-3 rule for root expression contexts and body
push, but Helper expression contexts provide neither size boxes nor opponent
local-coordinate data.

## Primary sources

- [Ikemen-GO `getAnySizeBox` and `getClsn`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10030-L10134)
- [Ikemen-GO `bodyDistX` and `bodyDistY`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8904-L8949)
- [Ikemen-GO push loop uses the same current size box](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13651-L13680)

The source pin is `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`. The local
normative Git object was inspected with `git show`; the local cache remains
separately marked dirty by the source-authority manifest.

## Local finding

`RuntimeExpressionContextSystem` already projects root group-3 size boxes.
`HelperSystem` stores current overrides and resets them each frame, but its
expression context omits the size-box and local-coordinate inputs used by
`ExpressionEvaluator.p2BodyDist`.

## Delivered decision

T363 adds Helper-local and primary-opponent group-3 size-box inputs to the
existing expression evaluator. `RuntimeSizeBoxSystem` now owns the shared
Width/Height and group-3 composition used by root push, root expressions, and
Helper expressions. Generic Helper controller dispatch preserves the typed
size-box, coordinate, and Y-policy fields, so a `VarSet` controller can read
the same context as trigger evaluation.

`PlayableMatchRuntime` supplies the primary opponent constants and
local-coordinate system on normal and paused Helper routes. Local Helper
overrides and verified `RedirectID` writes both feed the current query state.
The existing root policy remains intact: legacy MUGEN player-push policy keeps
Size geometry out of Y queries, while the explicit Ikemen path uses it.

## Verification

- Focused runtime coverage passes `6/6` files and `376/376` tests. It covers
  local Helper group-3 overrides, verified RedirectID writes, root and Helper
  size composition, typed effect-context propagation, and imported runtime
  local-coordinate distances.
- `pnpm typecheck` passes with TypeScript `7.0.2`.
- `pnpm qa:trace` passes `636/636` artifacts (`602` required, `34` optional).
- `pnpm build` passes with `329` transformed modules and `2,096.73 kB`
  pre-gzip JavaScript output. Both boundary guards and `git diff --check` pass.

## Retained limits

The result does not add Helper `PlayerPush`, helper-wide push scheduling,
size-proxy geometry, rendering behavior, exact actor-order lifetimes, or
upstream/local differential evidence. It does not move compatibility scores or
support a complete-port claim.

# Helper PlayerPush participation research

Date: 2026-07-21

## Question

What must change before a current Helper can participate in PlayerPush without
misstating full IKEMEN character scheduling?

## Primary source result

At pin `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, Ikemen-GO models Helpers
as `Char` values. The `Helper` controller accepts `helpertype = normal` or
`player`; the latter produces type `2`. `Char.isPlayerType()` includes roots
and type-2 Helpers, which makes active player-type Helpers receive the default
per-frame `CSF_playerpush` flag. The `PlayerPush` controller can then enable
or disable any valid redirected character and write its priority and
team-affect values.

`CharList.collisionDetection()` runs `pushDetection()` over its current run
order before hit detection. That loop includes enabled, non-standby,
non-disabled Helpers. It uses current group-3 size boxes, Y overlap, collision
or `SizePushOnly`, weight/factor/priority, and repeated ordered pairs.

## Local gap

The port exposes normal HelperType `1` only. It does not parse player type,
does not retain PlayerPush state through Helper controller dispatch, and sends
only roots to the body-push world. Therefore a Helper cannot become a current
body-push participant, even though the surrounding actor run-order path is
available.

## Bounded decision

T364 may close current explicit-Ikemen player-type Helper construction,
per-frame PlayerPush state, and a participant projection that uses the
existing root body-push geometry and stage-clamp rules. It needs explicit
Helper identifiers in diagnostics so root-only records do not silently claim
the broader actor set.

The port must retain a limited claim. It will not reproduce the source's
ordered duplicated pair passes, Helper-created actor trees, projectile Helper
types, depth and corner details, Helper Width/Height, size proxies, visual
proof, or upstream differential evidence in this cut.

## Profile boundary

The local MUGEN 1.1 Helper controller reference marks `helpertype` as
deprecated and says player-type Helpers are unsupported. The MUGEN profile
therefore strips `helpertype = player` to the normal Helper path. This keeps
the player-type behavior explicit to `ikemen-go` instead of treating it as a
shared MUGEN default.

## Implementation

Commit `22071b7b` adds typed static normal/player Helper compilation,
fail-closed unsupported Helper spawning, PlayerPush state on Helper runtime
records, player-type defaults before State -4, and current normal-Helper
PlayerPush opt-in. `PlayableMatchRuntime` now projects only active root-owned
Helpers into the explicit Tag body-push route. `RuntimeRootBodyPush/v0` keeps
its root-facing fields and exposes participant, Helper, and moved-Helper ids
when Helpers participate.

## Verification

- Focused compiler, Helper lifecycle, body-push, match runtime, and spawn
  coverage passed: `5/5` files / `425/425` tests.
- TypeScript `7.0.2`, traces `636/636` (`602` required, `34` optional),
  production build with `329` modules, boundaries, redirect boundaries, and
  diff hygiene passed.
- The build retains the existing large JavaScript chunk advisory. Full Vitest
  and browser smoke remain deferred for the current runtime batch.

## Claim ceiling

The result proves a bounded current Helper PlayerPush projection. It does not
prove exact Ikemen-GO CharList scheduling, duplicate ordered-pair behavior,
nested/projectile Helper participation, Helper Width/Height or size proxies,
depth/corner behavior, renderer output, upstream/local differentials, score
movement, or full parity.

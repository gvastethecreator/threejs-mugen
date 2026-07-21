# T364 Helper PlayerPush participation

Type: task

Status: resolved in `22071b7b`

Blocked by: None

## Question

Can the current explicit Ikemen Helper path support `helpertype = player` and
current `PlayerPush` state through a bounded body-push participant list without
claiming full CharList scheduling parity?

## Source evidence

The pinned Ikemen-GO source assigns Helper type `1` for normal and `2` for
player Helpers. A player-type Helper qualifies for the same per-frame default
`CSF_playerpush` setup as a root. `PlayerPush` itself writes the redirected
character's enabled flag, priority, and team-affect policy. `CharList`
iterates its run order through `pushDetection`, which accepts Helpers when
their current player-push flag is enabled and excludes standby/disabled
characters.

- [Ikemen-GO Helper type compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L635-L654)
- [Ikemen-GO PlayerPush controller](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L10548-L10576)
- [Ikemen-GO player-push reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11607-L11625)
- [Ikemen-GO CharList push detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13928)

## Local finding

The compiler ignores `helpertype`; `RuntimeHelper` hardcodes normal type `1`.
Helper runtime-controller support excludes `PlayerPush`, and the Helper state
adapter does not retain push flag, priority, or team-affect values. The current
`RuntimeRootBodyPushWorld` runs only roots and records root-oriented
diagnostics, while IKEMEN actor run order already stamps live root and Helper
actors.

## Planned boundary

- Support static normal/player Helper type parsing and current Helper
  `PlayerPush` state on the explicit Ikemen path.
- Feed eligible active-root Helpers into a clearly named bounded participant
  list after actor advancement and before direct combat.
- Preserve the existing root body-push behavior and diagnostics while adding
  explicit Helper participant evidence.
- Leave Helper-created Helpers, projectile-type Helpers, MUGEN behavior,
  exact duplicate CharList pair order, depth/corner interpolation, Helper
  Width/Height, size proxies, renderer proof, and full parity separate.

## Delivered boundary

- Static `helpertype = normal|player` now compiles on the explicit
  `ikemen-go` path. Empty, dynamic, and projectile type values fail closed at
  spawn rather than falling through as normal Helpers.
- Player-type Helpers receive their PlayerPush defaults before State -4.
  Normal Helpers remain opt-in through current-frame `PlayerPush`.
- Active, non-standby, non-disabled root-owned Helpers with current
  PlayerPush state now join the existing Tag body-push participant projection.
  The diagnostic keeps legacy root fields and adds participant/Helper ids only
  when a Helper participates.
- The MUGEN 1.1 profile strips `helpertype = player` to a normal Helper. The
  local MUGEN 1.1 Helper controller reference marks `helpertype` deprecated
  and does not support player-type Helpers.

## Verification

- Focused compiler, Helper lifecycle, body-push, match runtime, and spawn
  tests passed: `5/5` files / `425/425` tests.
- `pnpm typecheck`, `pnpm qa:trace` (`636/636` artifacts), `pnpm build`
  (`329` modules), `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.
- The current full-suite baseline remains T356: `240/240` files / `2612/2612`
  tests. Browser smoke remains deferred because this cut has no visible path.

## Claim ceiling

This task confirms a bounded current Helper participation path through the
existing body-push geometry and clamp rules. It does not confirm source
CharList run order, duplicate ordered pairs, nested or projectile Helper
participants, Helper Width/Height or size-proxy behavior, depth/corner math,
renderer output, upstream differentials, score movement, or full
MUGEN/IKEMEN parity.

## Evidence target

- Compiler, Helper lifecycle, body-push, and imported runtime tests with
  literal positions and policy checks.
- One required trace only when it can show the new path without masking the
  existing root player-push corpus.
- Batch focused tests, TypeScript, traces, build, boundary guards, and diff
  hygiene after the implementation round.

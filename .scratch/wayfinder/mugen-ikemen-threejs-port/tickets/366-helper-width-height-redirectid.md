# T366 Helper Width/Height RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can current root and Helper `Width`/`Height` controllers send their existing
player-size deltas to a verified `RedirectID` destination with source-context
values and destination-localcoord scaling?

## Source evidence

The pinned Ikemen-GO compiler accepts `redirectid` for both controllers. At
runtime it resolves the destination first, calculates
`destination.localcoord / caller.localcoord`, then applies Width player values
or Height values after that scale. MUGEN documents `Width` as a temporary
one-tick push-width controller and says `value` also controls edge width.

- [MUGEN 1.1 Width reference](https://www.elecbyte.com/mugendocs/sctrls.html#width)
- [Ikemen-GO Width compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L2575-L2611)
- [Ikemen-GO Width runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9484-L9528)
- [Ikemen-GO Height compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6296-L6311)
- [Ikemen-GO Height runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14439-L14467)

## Local finding

T365 carries local Helper one-frame Width/Height state, while existing root
Height and Helper OverrideClsn redirects already prove the destination and
scale boundaries. Root Width has no typed RedirectID field or redirect route;
Helper Width/Height reject all redirects before the existing resource-lease
writeback path.

## Quality contract

Artifact and user outcome: current typed constraint routes mutate only the
verified redirected destination at the same local-coordinate scale as source.

Mission mode: change.

In scope: root and current first-generation Helper `Width player|value` and
`Height value` RedirectID, static/dynamic value resolution, redirected
telemetry, destination writeback, and fail-closed resolution.

Out of scope: `Width edge`, `Width value` edge behavior, Helper depth, nested
Helper trees, size proxies, source run ordering, browser output, upstream
differentials, score movement, and full parity.

Proof: focused compiler, constraint, Helper, and imported runtime tests; batch
typecheck, traces, build, boundaries, and diff hygiene after this round.

## Planned boundary

- Preserve Width `redirectPlayerIdExpression` in the typed collision op.
- Scale Width and Height values once at the destination constraint boundary.
- Reuse root redirect lookup for root Width.
- Reuse Helper resource redirect leases and writeback for Helper Width/Height.
- Keep missing, malformed, negative, unavailable, disabled, and legacy
  RedirectID targets fail-closed before mutation.

## Result

`52e2cfa8` preserves Width `redirectid` in the typed collision operation
and routes root/current-Helper Width and Height writes through the existing
verified destination boundaries. Dynamic values evaluate in the caller, the
destination receives caller-to-target local-coordinate scale, and Helper writes
use the resource lease plus destination writeback. Root cross-root Width and
Height redirects defer until the target frame reset has run, so reset ordering
cannot erase a redirected one-frame delta.

Width edge and the edge component of source Width `value` remain blocked.

## Verification

The T365-T367 batch passes focused `6/6` files / `448/448` tests,
TypeScript 7 typecheck, `qa:trace` `636/636` artifacts (`602` required,
`34` optional), build with `329` modules, both boundary guards, and diff
hygiene. Full Vitest and browser smoke remain deferred for this runtime-only
batch.

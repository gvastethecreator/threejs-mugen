# T365 Helper Width/Height constraints

Type: task

Status: resolved

Blocked by: None

## Question

Can a current Helper execute local `Width` and `Height` controllers as
one-frame constraints before the T364 body-push participant projection, while
keeping source scheduling and redirect behavior outside this cut?

## Source evidence

MUGEN 1.1 documents `Width` as a one-tick player-width change for push
behavior. Its `player` parameters control player contact width, while `value`
also controls edge width. The pinned Ikemen-GO compiler accepts width
`edge`, `player`, and `value`, and the runtime routes player/value to
`setWidth`; `value` also sets edge width. Its `Height` controller accepts a
value pair and routes it to `setHeight`. Both upstream controller types have
RedirectID handling and local-coordinate scaling.

- [MUGEN 1.1 Width reference](https://www.elecbyte.com/mugendocs/sctrls.html#width)
- [Ikemen-GO Width compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L2575-L2611)
- [Ikemen-GO Width runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9484-L9528)
- [Ikemen-GO Height compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6296-L6311)
- [Ikemen-GO Height runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14439-L14467)

## Local finding

The compiler and root actor constraint world already support typed/static and
dynamic local `Width`/`Height` values. Helper controller dispatch rejects both
types, Helper runtime state does not retain the one-frame deltas, and the T364
participant projection therefore always sees the base size box.

## Planned boundary

- Support local current-Helper `Width player|value` and `Height value` through
  the existing actor-constraint world, with static and dynamic parameters.
- Reset Helper size deltas at the same frame boundary as Helper collision
  transform and override state, before State -4 and current state controllers.
- Carry those deltas through Helper runtime state, snapshots, expressions, and
  the existing body-push participant projection.
- Fail closed for Helper `Width edge`, `Width/Height RedirectID`, malformed
  pairs, nested Helper ownership, depth, size proxies, exact source run order,
  visual proof, and full parity.

## Evidence target

- Focused Helper lifecycle and dynamic-parameter tests.
- Body-push unit coverage with Helper participants and an imported match route
  proving current Width/Height changes pair admission or separation.
- Batch focused tests, TypeScript, traces, build, boundary guards, and diff
  hygiene after the implementation round.

## Result

`5351a0ac` gives current Helpers a base body width plus one-frame Width and
Height deltas. Helper frame advance resets those deltas before State -4 and
current-state controllers. Local static and dynamic `Width player|value` and
`Height value` route through the existing actor-constraint world, persist
through Helper runtime state and snapshots, and reach the current size/body-push
projection.

The current Width `value` route changes player size only. Source edge-width
behavior remains blocked.

## Verification

The T365-T367 batch passes focused `6/6` files / `448/448` tests,
TypeScript 7 typecheck, `qa:trace` `636/636` artifacts (`602` required,
`34` optional), build with `329` modules, both boundary guards, and diff
hygiene. Full Vitest and browser smoke remain deferred for this runtime-only
batch.

# T377 Root HitBy/NotHitBy RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root redirect the current legacy `HitBy` or `NotHitBy`
`value`/`value2` slots to a verified root while preserving caller evaluation of
a dynamic duration?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L112-L129)
  reads `redirectid` before the shared HitBy/NotHitBy parameters.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4929-L5007)
  resolves the destination before `runSub`, evaluates values with the caller,
  and writes the destination hit-eligibility slots.

## Local finding

Root runtime-controller dispatch did not classify HitBy or NotHitBy as
RedirectID-capable. A dynamic duration would therefore have remained local.
Deferring raw controller evaluation would also risk reading caller variables
after a later root changed them.

## Quality contract

A verified imported root can redirect the existing two-slot legacy
`value`/`value2` HitBy or NotHitBy subset to one live root under explicit
`ikemen-go`. Dynamic durations materialize in caller context before target
dispatch. Invalid or unavailable destinations fail closed through the current
root resolver, and destination telemetry records the controller and typed
eligibility operation.

## In scope

- Root-to-root active-controller HitBy and NotHitBy RedirectID.
- Caller-side typed materialization for dynamic `time`.
- Existing legacy two-slot `value` / `value2` behavior and required reject
  trace proof.

## Out of scope

IKEMEN new `attr`/`slot`/`playerno`/`playerid`/`stack` syntax, exact slot decay
and source scheduler order, Helpers, custom states, teams, attr grammar,
hitpause, rollback, and full MUGEN/IKEMEN parity.

## Result

Root runtime dispatch now recognizes both controller types. Static operations
retain compiled RedirectID expressions; dynamic operations resolve into typed
slots in the caller before dispatch. The receiver uses the same existing
HitDefense boundary as a local controller.

## Verification

- Runtime feature commit: `37ab9baf`.
- Focused compiler, hit-defense, imported-match, and trace batch: `4/4` files
  and `994/994` tests pass.
- `git diff --check` passed before the feature commit.
- TypeScript, full Vitest, trace aggregate, build, and boundary guards remain
  intentionally deferred to the next grouped runtime checkpoint.

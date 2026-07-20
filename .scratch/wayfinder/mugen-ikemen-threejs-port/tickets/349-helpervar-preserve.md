# T349 - HelperVar preserve

Status: resolved at bounded Helper flag scope
Date: 2026-07-20
Feature commit: `4d2cb9c9`

## Question

Can the source-backed `preserve` Helper flag reach the typed runtime and
`HelperVar(preserve)` while keeping round-reset persistence outside this
slice?

## Source evidence

The pinned Ikemen-GO `Char` model initializes a new Helper with `preserve =
false`. The Helper controller compiler accepts `preserve` as a boolean, and
the bytecode evaluator reads the active Helper flag for
`HelperVar(preserve)`. Ikemen also uses the flag during round-start backup
and destruction, which is a separate lifecycle contract.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added typed static and scalar-expression metadata for Helper `preserve`.
- Resolved static and dynamic values at Helper dispatch only under
  `ikemen-go`; unresolved dynamic values fail closed.
- Passed the value into `RuntimeHelper` and the Helper expression context.
- Added the raw executable `HelperVar(preserve)` key with a false result
  outside an active Ikemen Helper context.
- Stripped the field from legacy and unknown-profile Helper operations.
- Extended the required imported HelperVar trace to require
  `HelperVar(preserve) = 1`.

## Verification

- Focused compiler/runtime/trace tests: `746/746` passed.
- Full Vitest: `239/239` files and `2598/2598` tests passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Browser smoke is deferred because this slice changes runtime state and
  expression traces only.

## Claim ceiling

This closes the typed `HelperVar(preserve)` read for the current normal
imported Helper path under `ikemen-go`, including static and resolved scalar
controller values. It does not claim helper retention across round-start
backup, F4/reload, round reset, destruction policy, nested Helpers,
redirected contexts, other HelperVar fields, compatibility-score movement, or
complete MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
- `.scratch/external/Ikemen-GO/src/char.go` (`preserve` initialization)
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`HelperVar(preserve)` and Helper boolean parsing)
- `.scratch/external/Ikemen-GO/src/system.go` (round-start Helper preservation)

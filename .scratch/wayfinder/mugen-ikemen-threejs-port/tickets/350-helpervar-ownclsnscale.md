# T350 - HelperVar ownclsnscale

Status: resolved at bounded Helper flag scope
Date: 2026-07-20
Feature commit: `9f0ecd65`

## Question

Can the port carry the source-backed `ownclsnscale` Helper flag into the
typed runtime and expose `HelperVar(ownclsnscale)` without claiming the
collision geometry that consumes it?

## Source evidence

The pinned Ikemen-GO `Char` model stores `ownclsnscale` as a boolean. The
Helper controller compiler accepts the boolean parameter, and the bytecode
evaluator reads it for `HelperVar(ownclsnscale)`. Ikemen's collision-scale
update uses the flag to select the Helper's own scale when the animation owner
is the Helper, which remains a separate geometry contract.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added typed static and scalar-expression metadata for Helper
  `ownclsnscale`.
- Resolved static and dynamic values at Helper dispatch only under
  `ikemen-go`; unresolved dynamic values fail closed.
- Passed the value into `RuntimeHelper` and the Helper expression context.
- Added the raw executable `HelperVar(ownclsnscale)` key with a false result
  outside an active Ikemen Helper context.
- Stripped the field from legacy and unknown-profile Helper operations.
- Extended the required imported HelperVar trace to require
  `HelperVar(ownclsnscale) = 1`.

## Verification

- Focused compiler/runtime/trace tests: `747/747` passed.
- Full Vitest: `239/239` files and `2599/2599` tests passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Browser smoke is deferred because this slice changes runtime state and
  expression traces only.

## Claim ceiling

This closes the typed `HelperVar(ownclsnscale)` read for the current normal
imported Helper path under `ikemen-go`, including static and resolved scalar
controller values. It does not claim collision-box scale selection, hit/push
geometry parity, renderer scale, nested Helpers, redirected contexts,
`clsnproxy`, unsupported fields, compatibility-score movement, or complete
MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go` (`ownclsnscale` field and `updateClsnScale`)
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`HelperVar(ownclsnscale)` and Helper boolean parsing)

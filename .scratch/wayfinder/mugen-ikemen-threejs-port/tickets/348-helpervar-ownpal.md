# T348 - HelperVar ownpal

Status: resolved at bounded Ikemen Helper scope
Date: 2026-07-20
Feature commit: `c8488e69`

## Question

Can the port carry the source-backed `ownpal` Helper flag through Helper
creation and expose it to `HelperVar(ownpal)` without claiming palette
rendering parity?

## Source evidence

The pinned Ikemen-GO `Char` model stores `ownpal` on each character and
initializes a normal Helper with the flag set to false. The bytecode path
reads the current Helper flag for `HelperVar(ownpal)`, and the Helper
controller compiler accepts `ownpal` as a boolean parameter.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added typed static and scalar-expression metadata for Helper `ownpal`.
- Resolved static and dynamic `ownpal` values at Helper dispatch only under
  `ikemen-go`; unresolved dynamic values fail closed.
- Passed the value into `RuntimeHelper` and the Helper expression context.
- Added the raw executable `HelperVar(ownpal)` key with a false result outside
  an active Ikemen Helper context.
- Stripped the field from legacy and unknown-profile Helper operations.
- Extended the required imported HelperVar trace to require `ownpal = 1` and
  keep the Helper controller declaration explicit.

## Verification

- Focused compiler/runtime/trace tests: `745/745` passed.
- Full Vitest: `239/239` files and `2597/2597` tests passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Browser smoke is deferred because this slice changes runtime state and
  expression traces only.

## Claim ceiling

This closes `HelperVar(ownpal)` for the current normal imported Helper path
under `ikemen-go`, including static and resolved scalar controller values. It
does not claim palette remapping, PalFX behavior, renderer output, Explod or
Projectile `ownpal`, `preserve`, `ownclsnscale`, nested Helpers, differential
engine parity, compatibility-score movement, or complete MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go` (`ownpal` field and Helper initialization)
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`HelperVar(ownpal)` and Helper boolean parsing)

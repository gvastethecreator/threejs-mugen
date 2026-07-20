# T347 - HelperVar helpertype

Status: resolved at bounded normal-Helper scope
Date: 2026-07-20
Feature commit: `7700e618`

## Question

Which next `HelperVar` field has a stable value in the current runtime model
and can be closed without inventing a controller or palette contract?

## Source evidence

The pinned Ikemen-GO `Char` model defines `helperType` as `0` for a root,
`1` for a normal Helper, `2` for a player, and `3` for a projectile. Its
normal Helper initialization sets the value to `1`. The current port creates
this slice only for the `Helper` controller path, so the typed runtime stores
the source-backed normal-Helper value.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added `RuntimeHelper.helperType` with the normal-Helper value `1` at
  construction.
- Exposed the field through the profile-gated `HelperVar` evaluator.
- Added `HelperVar(helpertype)` to the executable raw-argument support set.
- Extended the required imported HelperVar trace to require
  `HelperVar(helpertype) = 1` alongside the existing three fields.

## Verification

- Focused runtime/compiler/helper trace tests: `731/731` passed.
- Full Vitest: `239/239` files and `2596/2596` tests passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Browser smoke is deferred because this slice changes runtime expression
  data and trace fixtures only.

## Claim ceiling

This closes `HelperVar(helpertype) = 1` for the current normal imported
Helper path under `ikemen-go`. Player and projectile HelperType variants,
`clsnproxy`, `ownclsnscale`, `ownpal`, `preserve`, nested Helpers, and full
MUGEN/IKEMEN parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go` (`helperType` initialization)
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`OC_ex3_helpervar_helpertype`)


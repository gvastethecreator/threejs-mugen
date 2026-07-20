# T351 - HelperVar clsnproxy

Status: resolved at bounded Helper flag and direct-combat admission scope
Date: 2026-07-20
Feature commit: `813bf6d6`

## Question

Can the port carry Ikemen-GO's `clsnproxy` Helper flag into the typed runtime,
expose `HelperVar(clsnproxy)`, and enforce the first safe combat consequence
without claiming the collision-box extension that proxies require?

## Source evidence

The pinned Ikemen-GO compiler recognizes `HelperVar(clsnproxy)`. Its bytecode
reader returns the Helper `isclsnproxy` flag, and the Helper controller parses
`clsnproxy` as a boolean. The Char runtime marks proxy Helpers as unable to
hit or be hit directly; the same source describes them as extensions of the
parent collision boxes. The parent-box projection remains a separate contract.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added typed static and scalar-expression metadata for Helper `clsnproxy`.
- Resolved static and dynamic values at Helper dispatch only under
  `ikemen-go`; unresolved dynamic values fail closed.
- Passed the value into `RuntimeHelper` and the Helper expression context.
- Added executable `HelperVar(clsnproxy)` with zero outside an active
  Ikemen Helper context or when the flag is false.
- Stripped the field from legacy and unknown-profile Helper operations.
- Excluded proxy Helpers from the existing direct Helper HitDef admission gate.
- Extended the required imported HelperVar trace to require
  `HelperVar(clsnproxy) = 1`.

## Verification

- Focused compiler/runtime/spawn/combat/trace tests: `6` files, `759/759`
  passed.
- Full Vitest: `239/239` files and `2601/2601` tests passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional; T351 HelperVar checksum `cf9710ef`.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Browser smoke is deferred because this slice changes runtime state,
  expression evaluation, and trace fixtures only.

## Claim ceiling

This closes the typed `HelperVar(clsnproxy)` read and direct-helper combat
admission skip for the current normal imported Helper path under `ikemen-go`,
including static and resolved scalar controller values. It does not claim
parent collision-box extension, root-to-Helper defender breadth, exact proxy
box flattening, nested or redirected Helpers, renderer behavior, or complete
MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/compiler.go` (`HelperVar(clsnproxy)`)
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`OC_ex3_helpervar_clsnproxy`,
  `isclsnproxy` reads, and Helper boolean parsing)
- `.scratch/external/Ikemen-GO/src/char.go` (`isclsnproxy` combat exclusion and
  parent collision-box extension notes)
